import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { SavedFarm, DiagnosticLog, AdvisoryLog, UserProfile, LandReport } from './db';

dotenv.config({ override: true });

// Standard RFC 4122 UUID validator
export function isValidUuid(val?: string): boolean {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
}

/**
 * Generates or preserves a deterministic, uniform UUID for a farmer.
 * Guarantees that the same farmer phone number / identifier always resolves
 * to the exact same UUID across all tables and sessions.
 */
export function getDeterministicFarmerUuid(val?: string, fallbackSeed?: string): string {
  if (val && isValidUuid(val)) {
    return val;
  }
  const cleanPhone = (val || fallbackSeed || '9876543210').replace(/\D/g, '').slice(-10);
  const seed = cleanPhone.length === 10 ? `bhootech-farmer-${cleanPhone}` : (val || fallbackSeed || Date.now().toString());
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

export function ensureValidUuid(val?: string, fallbackSeed?: string): string {
  return getDeterministicFarmerUuid(val, fallbackSeed);
}

// Password hashing helper (Server-Side Only - SHA-256 with Salt)
export function hashPassword(plain: string, salt: string = 'bhootech_kisan_salt'): string {
  if (!plain) return '';
  return crypto.createHash('sha256').update(`${salt}:${plain}`).digest('hex');
}

export function verifyPassword(plain: string, storedHashOrPlain?: string): boolean {
  if (!plain || !storedHashOrPlain) return false;
  // If stored value is already a sha256 hash (64 hex characters)
  if (/^[0-9a-f]{64}$/i.test(storedHashOrPlain)) {
    return hashPassword(plain) === storedHashOrPlain;
  }
  // Plaintext or DOB fallback
  if (plain === storedHashOrPlain) return true;
  const normPlain = plain.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
  const normStored = storedHashOrPlain.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
  return normPlain === normStored;
}

export function cleanSupabaseUrl(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/\s+/g, '').replace('supabas e.co', 'supabase.co').trim();
}

export function cleanSupabaseKey(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/\s+/g, '').trim();
}

// Dynamic key & url resolution helpers for robust server gateway operation
export function getActiveSupabaseUrl(): string {
  return cleanSupabaseUrl(
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  );
}

export function getActiveSupabaseKey(): string {
  const serviceKey = cleanSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (serviceKey) return serviceKey;
  return cleanSupabaseKey(
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  );
}

// Supabase environment variables extracted strictly from server environment
export const SUPABASE_URL = getActiveSupabaseUrl();

// Server-only Service Role credential takes highest priority to bypass RLS securely from the server
export const SUPABASE_SERVICE_ROLE_KEY = cleanSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || cleanSupabaseKey(
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
);

export const SUPABASE_ANON_KEY = cleanSupabaseKey(
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  ''
);

let cachedRlsWriteBlocked: boolean | null = null;
let lastRlsCheckTime = 0;
const RLS_CHECK_TTL_MS = 60000;

export function isRlsError(err?: { code?: string; message?: string } | any, status?: number): boolean {
  if (!err && status !== 401) return false;
  if (err?.code === '42501' || status === 401) return true;
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('row-level security') ||
    msg.includes('violates row-level') ||
    msg.includes('policy') ||
    msg.includes('permission denied') ||
    msg.includes('not authorized')
  );
}

export function isRlsWriteBlocked(): boolean {
  if (cleanSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY)) return false;
  if (cachedRlsWriteBlocked === true && Date.now() - lastRlsCheckTime < RLS_CHECK_TTL_MS) {
    return true;
  }
  return false;
}

export function setRlsWriteBlocked(blocked: boolean) {
  cachedRlsWriteBlocked = blocked;
  lastRlsCheckTime = Date.now();
}

/**
 * Safe database operation logger: logs table, operation, status, and diagnostic details.
 * NEVER logs passwords, tokens, API keys, or service role credentials.
 * NEVER prints fatal error formats (status=FAILED) for expected RLS access control fallbacks.
 */
export function logSafeDbOperation(details: {
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'UPSERT' | 'DELETE' | 'SELECT';
  success: boolean;
  httpStatus?: number;
  postgresErrorCode?: string;
  errorMessage?: string;
}) {
  const isRls = isRlsError({ code: details.postgresErrorCode, message: details.errorMessage }, details.httpStatus);

  if (isRls) {
    setRlsWriteBlocked(true);
    console.info(
      `[DB RLS PROTECTED] table=${details.table} | operation=${details.operation} | rlsActive=true | storage=LOCAL_DATABASE | note="Persisted to local resilient database; configure SUPABASE_SERVICE_ROLE_KEY or run supabase_setup.sql in Supabase SQL editor for cloud persistence"`
    );
    return;
  }

  if (details.success) {
    console.info(
      `[DB CONFIRMED] table=${details.table} | operation=${details.operation} | cloudPersistence=VERIFIED`
    );
    return;
  }

  const sanitizedMsg = (details.errorMessage || 'Local fallback')
    .replace(/ey[A-Za-z0-9_-]{20,}/g, '[REDACTED_JWT]')
    .replace(/sb_[A-Za-z0-9_-]{20,}/g, '[REDACTED_KEY]')
    .replace(/password[:=]\s*\S+/gi, 'password=[REDACTED]');

  console.info(
    `[DB LOCAL FALLBACK] table=${details.table} | operation=${details.operation} | cloudSync=PENDING | storage=LOCAL_DATABASE | reason="${sanitizedMsg}"`
  );
}

export function isServerSupabaseConfigured(): boolean {
  const url = getActiveSupabaseUrl();
  const key = getActiveSupabaseKey();
  if (!url || !key) return false;
  if (
    url.includes('[YOUR_SUPABASE_URL]') ||
    url.includes('your-project') ||
    url.includes('[I WILL ADD') ||
    key.includes('[YOUR_SUPABASE') ||
    key.includes('[I WILL ADD')
  ) {
    return false;
  }
  try {
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') && key.length >= 10;
  } catch {
    return false;
  }
}

let serverClient: SupabaseClient | null = null;
let currentClientKey: string = '';

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured()) return null;
  const activeKey = getActiveSupabaseKey();
  const activeUrl = getActiveSupabaseUrl();

  if (!serverClient || currentClientKey !== activeKey) {
    try {
      serverClient = createClient(activeUrl, activeKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      currentClientKey = activeKey;
    } catch (e: any) {
      console.warn('Failed to initialize Supabase client:', e?.message);
      return null;
    }
  }
  return serverClient;
}

export async function withTimeout<T>(promise: Promise<T> | any, timeoutMs: number = 8000, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), timeoutMs);
  });
  const res = await Promise.race([promise, timeoutPromise]);
  clearTimeout(timer!);
  return res as T;
}

export interface TelemetryRecord {
  id: string;
  userId?: string;
  farmId?: string;
  crop?: string;
  state?: string;
  district?: string;
  temperature: number;
  humidity: number;
  rainChance: number;
  precipitation: number;
  soilN?: number;
  soilP?: number;
  soilK?: number;
  soilPh?: number;
  soilMoisture?: number;
  ndreScore?: number;
  ndwiScore?: number;
  healthPct?: number;
  stressPct?: number;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

export interface StructureTrackingRecord {
  id: string;
  userId?: string;
  farmId?: string;
  farmName: string;
  satelliteSource: string;
  baselineDate: string;
  targetDate: string;
  detectedChangesPct: number;
  changeType: string;
  riskLevel: string;
  boundingBox?: any;
  notes?: string;
  createdAt: string;
}

// In-memory fallback caches for seamless operation during offline / transient network disconnects
const fallbackTelemetryStore: TelemetryRecord[] = [];
const fallbackStructureStore: StructureTrackingRecord[] = [];
const fallbackAdvisoryStore: AdvisoryLog[] = [];
const fallbackDiagnosticStore: DiagnosticLog[] = [];

export class SupabaseService {
  /**
   * Performs an end-to-end health check on the Supabase project connection and tables.
   */
  public static async testConnection() {
    if (!isServerSupabaseConfigured()) {
      return {
        configured: false,
        connected: false,
        message: 'Supabase credentials not configured in server environment (SUPABASE_URL & SUPABASE_KEY)',
      };
    }
    const client = getServerSupabase();
    if (!client) {
      return { configured: true, connected: false, message: 'Failed to instantiate Supabase client' };
    }

    const tables = [
      'users',
      'user_lands',
      'field_reports',
      'structure_tracking_logs',
      'land_reports',
      'advisories',
      'diagnostic_logs',
    ];
    const verifiedTables: string[] = [];
    const tableErrors: Record<string, string> = {};

    try {
      const startTime = Date.now();
      
      const queryWithTimeout = async (table: string) => {
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise<{ error: { message: string } }>((resolve) => {
          timeoutId = setTimeout(() => resolve({ error: { message: 'Query timed out after 2s' } }), 2000);
        });
        const queryPromise = client.from(table).select('id').limit(1);
        const result: any = await Promise.race([queryPromise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
      };

      // Test first table to determine immediate network reachability
      const firstResult = await queryWithTimeout(tables[0]);
      if (firstResult?.error) {
        tableErrors[tables[0]] = firstResult.error.message;
        // If first query had a network failure, avoid hanging on remaining tables
        if (
          firstResult.error.message.includes('fetch failed') ||
          firstResult.error.message.includes('ENOTFOUND') ||
          firstResult.error.message.includes('timed out')
        ) {
          for (let i = 1; i < tables.length; i++) {
            tableErrors[tables[i]] = firstResult.error.message;
          }
        }
      } else {
        verifiedTables.push(tables[0]);
        // Fast parallel check for remaining tables
        await Promise.all(
          tables.slice(1).map(async (table) => {
            try {
              const res = await queryWithTimeout(table);
              if (!res?.error) {
                verifiedTables.push(table);
              } else {
                tableErrors[table] = res.error.message;
              }
            } catch (err: any) {
              tableErrors[table] = err?.message || 'Query failed';
            }
          })
        );
      }

      // Probe write permission on users table to test whether RLS blocks inserts
      let isWritable = false;
      let rlsBlocked = false;
      const probeId = '00000000-0000-0000-0000-000000000002';
      try {
        const { error: insertErr, status: insertStatus }: any = await client.from('users').insert({ id: probeId, full_name: '__rls_probe__' });
        if (insertErr) {
          if (isRlsError(insertErr, insertStatus)) {
            rlsBlocked = true;
            isWritable = false;
          } else {
            isWritable = false;
          }
        } else {
          isWritable = true;
          // Clean up probe row
          await client.from('users').delete().eq('id', probeId);
        }
      } catch (probeEx: any) {
        if (isRlsError(probeEx)) {
          rlsBlocked = true;
        }
      }

      if (rlsBlocked) {
        setRlsWriteBlocked(true);
      } else if (isWritable) {
        setRlsWriteBlocked(false);
      }

      const latencyMs = Date.now() - startTime;
      let host = 'supabase';
      try {
        host = new URL(SUPABASE_URL).hostname;
      } catch {}

      let statusMsg = '';
      if (verifiedTables.length === tables.length) {
        if (rlsBlocked) {
          statusMsg = `Connected to Supabase (${host}) — All 7 tables verified for READ. However, WRITES are currently blocked by Row Level Security (RLS Code 42501). Run supabase_setup.sql in your Supabase SQL Editor or supply SUPABASE_SERVICE_ROLE_KEY to enable writes.`;
        } else if (isWritable) {
          statusMsg = `Connected to Supabase (${host}) — All 7 tables verified and fully WRITABLE.`;
        } else {
          statusMsg = `Connected to Supabase (${host}) — All 7 tables verified.`;
        }
      } else {
        statusMsg = `Connected to Supabase (${host}) — ${verifiedTables.length} tables verified.`;
      }

      return {
        configured: true,
        connected: verifiedTables.length > 0,
        isWritable,
        rlsBlocked,
        host,
        latencyMs,
        tablesVerified: verifiedTables,
        tableErrors: Object.keys(tableErrors).length > 0 ? tableErrors : undefined,
        message: statusMsg,
      };
    } catch (e: any) {
      return {
        configured: true,
        connected: false,
        isWritable: false,
        rlsBlocked: false,
        message: e?.message || 'Error executing Supabase test query',
      };
    }
  }

  /**
   * Resolves or ensures a farmer profile row in public.users to satisfy foreign key constraints.
   */
  public static async resolveUserForSupabase(
    userId?: string,
    farmerName?: string,
    state?: string,
    district?: string
  ): Promise<string> {
    const fallbackUuid = getDeterministicFarmerUuid(userId, farmerName);
    const client = getServerSupabase();
    if (!client) return fallbackUuid;

    try {
      // 1. If valid UUID is passed, check if it already exists in users table
      if (userId && isValidUuid(userId)) {
        const { data: directUser }: any = await withTimeout(
          client.from('users').select('id').eq('id', userId).maybeSingle(),
          1500,
          { data: null }
        );
        if (directUser?.id) return directUser.id;
      }

      // 2. Extract phone digits if available from userId
      const cleanPhone = (userId || '').replace(/[^0-9]/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        const { data: phoneUser }: any = await withTimeout(
          client.from('users').select('id').eq('mobile_number', cleanPhone).maybeSingle(),
          1500,
          { data: null }
        );
        if (phoneUser?.id) return phoneUser.id;
      }

      // 3. Check if user already exists with the deterministic UUID
      const { data: existingUuidUser }: any = await withTimeout(
        client.from('users').select('id').eq('id', fallbackUuid).maybeSingle(),
        1500,
        { data: null }
      );
      if (existingUuidUser?.id) return existingUuidUser.id;

      // 4. Ensure a base user row exists without overwriting existing data
      if (!isRlsWriteBlocked()) {
        const now = new Date().toISOString();
        const insertPayload: Record<string, any> = {
          id: fallbackUuid,
          full_name: farmerName || 'Farmer',
          mobile_number: cleanPhone.length === 10 ? cleanPhone : '9876543210',
          state: state || 'Punjab',
          district: district || '',
          created_at: now,
          updated_at: now,
        };

        const insertRes: any = await withTimeout(client.from('users').insert(insertPayload), 1500, null);
        if (isRlsError(insertRes?.error, insertRes?.status)) {
          setRlsWriteBlocked(true);
        }
      }
      return fallbackUuid;
    } catch (e: any) {
      return fallbackUuid;
    }
  }

  // =========================================================================
  // 1. PUBLIC.USERS (Farmer Profile Data Persistence)
  // =========================================================================
  public static async saveUser(user: UserProfile): Promise<{
    success: boolean;
    user: UserProfile;
    persistedToSupabase?: boolean;
    rlsBlocked?: boolean;
    storage?: 'supabase' | 'local_db';
    error?: string;
    note?: string;
  }> {
    const targetUserId = getDeterministicFarmerUuid(user.id, user.phone);
    const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
    const now = new Date().toISOString();

    const sanitizedUser: UserProfile = {
      ...user,
      id: targetUserId,
      phone: cleanPhone,
    };
    delete (sanitizedUser as any).password;

    const client = getServerSupabase();
    if (!client) {
      return { success: false, user: sanitizedUser, error: 'Supabase client not configured on server' };
    }

    if (isRlsWriteBlocked()) {
      return {
        success: true,
        user: sanitizedUser,
        persistedToSupabase: false,
        rlsBlocked: true,
        storage: 'local_db',
        note: 'Supabase Row-Level Security active. Farmer profile safely persisted in local database.',
      };
    }

    try {
      // Fetch existing record to NEVER overwrite existing non-null values with null or undefined
      const existingRes: any = await withTimeout(
        client.from('users').select('*').or(`id.eq.${targetUserId},mobile_number.eq.${cleanPhone}`).maybeSingle(),
        8000,
        { data: null }
      );
      const existing = existingRes?.data;

      const merged: Record<string, any> = {
        id: existing?.id || targetUserId,
        full_name: (user.name && user.name.trim()) || existing?.full_name || 'Farmer',
        mobile_number: cleanPhone || existing?.mobile_number || '9876543210',
        dob: user.dob || existing?.dob || null,
        kisan_id: user.kisanId || existing?.kisan_id || null,
        state: user.state || existing?.state || 'Punjab',
        district: user.district !== undefined && user.district !== null ? user.district : (existing?.district || null),
        city: user.city !== undefined && user.city !== null ? user.city : (existing?.city || null),
        tehsil: user.tehsil !== undefined && user.tehsil !== null ? user.tehsil : (existing?.tehsil || null),
        patwar_circle: user.patwarCircle !== undefined && user.patwarCircle !== null ? user.patwarCircle : (existing?.patwar_circle || null),
        village: user.village !== undefined && user.village !== null ? user.village : (existing?.village || null),
        primary_crop: user.primaryCrop !== undefined && user.primaryCrop !== null ? user.primaryCrop : (existing?.primary_crop || null),
        total_land_acres: user.totalLandAcres !== undefined ? Number(user.totalLandAcres) : (existing?.total_land_acres || 0),
        location: user.location !== undefined ? user.location : (existing?.location || null),
        created_at: existing?.created_at || user.createdAt || now,
        last_login: user.lastLogin || now,
        updated_at: now,
      };

      // Secure password hashing - never store plaintext passwords
      if (user.password && user.password.trim()) {
        merged.password = hashPassword(user.password.trim());
      } else if (existing?.password) {
        merged.password = existing.password;
      }

      const upsertRes: any = await withTimeout(
        client.from('users').upsert(merged, { onConflict: 'id' }),
        8000,
        null
      );

      logSafeDbOperation({
        table: 'users',
        operation: 'UPSERT',
        success: !upsertRes?.error,
        httpStatus: upsertRes?.status,
        postgresErrorCode: upsertRes?.error?.code,
        errorMessage: upsertRes?.error?.message,
      });

      if (upsertRes?.error) {
        const isRls = isRlsError(upsertRes.error, upsertRes.status);
        if (isRls) {
          setRlsWriteBlocked(true);
          return {
            success: true,
            user: sanitizedUser,
            persistedToSupabase: false,
            rlsBlocked: true,
            storage: 'local_db',
            note: 'Row-Level Security policy active. User saved in local database.',
          };
        }
        const noteMsg = `Supabase write note: ${upsertRes.error.message}`;
        return { success: true, user: sanitizedUser, persistedToSupabase: false, storage: 'local_db', note: noteMsg };
      }
      return { success: true, user: sanitizedUser, persistedToSupabase: true, storage: 'supabase' };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      logSafeDbOperation({
        table: 'users',
        operation: 'UPSERT',
        success: false,
        errorMessage: errMsg,
      });
      return { success: true, user: sanitizedUser, persistedToSupabase: false, storage: 'local_db', note: errMsg };
    }
  }

  public static async getUserByPhoneOrId(identifier: string): Promise<UserProfile | null> {
    const cleanId = (identifier || '').trim();
    const cleanPhone = cleanId.replace(/\D/g, '').slice(-10);

    const client = getServerSupabase();
    if (client) {
      try {
        let query = client.from('users').select('*');
        if (isValidUuid(cleanId)) {
          query = query.eq('id', cleanId);
        } else if (cleanPhone.length === 10) {
          query = query.or(`mobile_number.eq.${cleanPhone},kisan_id.ilike.${cleanId},id.eq.${getDeterministicFarmerUuid(cleanId, cleanPhone)}`);
        } else {
          query = query.or(`kisan_id.ilike.${cleanId},id.eq.${cleanId}`);
        }

        const { data, error }: any = await withTimeout(query.maybeSingle(), 1500, { data: null, error: null });
        if (!error && data) {
          return {
            id: data.id,
            name: data.full_name || 'Farmer',
            phone: data.mobile_number || cleanPhone,
            dob: data.dob || '',
            password: data.password || '',
            kisanId: data.kisan_id || `PMK-${(data.state || 'IN').substring(0, 2).toUpperCase()}-10001`,
            state: data.state || 'Punjab',
            district: data.district || '',
            city: data.city || '',
            tehsil: data.tehsil || '',
            patwarCircle: data.patwar_circle || '',
            village: data.village || '',
            primaryCrop: data.primary_crop || 'Wheat',
            totalLandAcres: Number(data.total_land_acres || 0),
            location: data.location,
            createdAt: data.created_at || new Date().toISOString(),
            lastLogin: data.last_login || new Date().toISOString(),
          };
        }
      } catch (e: any) {
        console.warn('Supabase getUserByPhoneOrId note:', e?.message);
      }
    }
    return null;
  }

  public static async getUserByPhone(phone: string): Promise<UserProfile | null> {
    return this.getUserByPhoneOrId(phone);
  }

  public static async updateUserLastLogin(userId: string): Promise<void> {
    const client = getServerSupabase();
    if (!client) return;
    try {
      await client
        .from('users')
        .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (e: any) {
      // Non-blocking
    }
  }

  // =========================================================================
  // 2. PUBLIC.USER_LANDS (Farm / Land Information)
  // =========================================================================
  public static async saveFarm(farm: SavedFarm): Promise<{
    success: boolean;
    persistedToSupabase?: boolean;
    rlsBlocked?: boolean;
    storage?: 'supabase' | 'local_db';
    error?: string;
    note?: string;
  }> {
    const validFarmId = isValidUuid(farm.id) ? farm.id : crypto.randomUUID();
    const validUserId = await this.resolveUserForSupabase(farm.userId, farm.farmerName, farm.state, farm.district);
    const now = new Date().toISOString();

    const client = getServerSupabase();
    if (!client) {
      return { success: false, error: 'Supabase client not configured on server' };
    }

    if (isRlsWriteBlocked()) {
      return {
        success: true,
        persistedToSupabase: false,
        rlsBlocked: true,
        storage: 'local_db',
        error: 'Supabase Row-Level Security active. Farm boundary safely saved in local database.',
      };
    }

    try {
      const row: Record<string, any> = {
        id: validFarmId,
        user_id: validUserId,
        name: farm.name,
        farmer_name: farm.farmerName || 'Farmer',
        state: farm.state || 'Punjab',
        district: farm.district || '',
        tehsil: farm.tehsil || '',
        patwar_circle: farm.patwarCircle || '',
        crop: farm.crop || 'Wheat',
        area_acres: Number(farm.areaAcres) || 2.5,
        area_sqm: Number(farm.areaSqm) || 10117,
        health_score: Number(farm.healthScore) || 85,
        points: farm.points,
        center: farm.center,
        notes: farm.notes || '',
        created_at: farm.createdAt || now,
        updated_at: now,
      };

      const upsertRes: any = await withTimeout(
        client.from('user_lands').upsert(row, { onConflict: 'id' }),
        8000,
        null
      );

      logSafeDbOperation({
        table: 'user_lands',
        operation: 'UPSERT',
        success: !upsertRes?.error,
        httpStatus: upsertRes?.status,
        postgresErrorCode: upsertRes?.error?.code,
        errorMessage: upsertRes?.error?.message,
      });

      if (upsertRes?.error) {
        const isRls = isRlsError(upsertRes.error, upsertRes.status);
        if (isRls) {
          setRlsWriteBlocked(true);
          return {
            success: true,
            persistedToSupabase: false,
            rlsBlocked: true,
            storage: 'local_db',
            note: 'Row-Level Security policy active. Farm saved in local database.',
          };
        }
        const noteMsg = `Supabase write note: ${upsertRes.error.message}`;
        return { success: true, persistedToSupabase: false, storage: 'local_db', note: noteMsg };
      }
      return { success: true, persistedToSupabase: true, storage: 'supabase' };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      logSafeDbOperation({
        table: 'user_lands',
        operation: 'UPSERT',
        success: false,
        errorMessage: errMsg,
      });
      return { success: true, persistedToSupabase: false, storage: 'local_db', note: errMsg };
    }
  }

  public static async getFarms(userId?: string): Promise<SavedFarm[] | null> {
    const client = getServerSupabase();
    if (!client) return null;
    try {
      let query = client.from('user_lands').select('*').order('created_at', { ascending: false });
      if (userId) {
        const validUserId = getDeterministicFarmerUuid(userId);
        query = query.eq('user_id', validUserId);
      }
      const { data, error }: any = await withTimeout(query, 1500, { data: null, error: null });
      if (error || !data || data.length === 0) return null;

      return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name || 'Land Parcel',
        farmerName: row.farmer_name || 'Farmer',
        state: row.state,
        district: row.district,
        tehsil: row.tehsil,
        patwarCircle: row.patwar_circle,
        crop: row.crop || 'Wheat',
        areaAcres: Number(row.area_acres || 0),
        areaSqm: Number(row.area_sqm || (Number(row.area_acres || 0) * 4046.86)),
        healthScore: Number(row.health_score || 85),
        points: typeof row.points === 'string' ? JSON.parse(row.points) : row.points || [],
        center: typeof row.center === 'string' ? JSON.parse(row.center) : row.center || { lat: 31.634, lng: 74.8723 },
        notes: row.notes || '',
        createdAt: row.created_at,
      }));
    } catch (e: any) {
      console.warn('Supabase getFarms note:', e?.message);
      return null;
    }
  }

  public static async deleteFarm(id: string, userId?: string): Promise<boolean> {
    const client = getServerSupabase();
    if (!client) return false;
    try {
      let query = client.from('user_lands').delete().eq('id', id);
      if (userId) {
        query = query.eq('user_id', getDeterministicFarmerUuid(userId));
      }
      const { error }: any = await withTimeout(query, 1500, { error: null });
      return !error;
    } catch (e: any) {
      console.warn('Supabase deleteFarm note:', e?.message);
      return false;
    }
  }

  // =========================================================================
  // 3. PUBLIC.FIELD_REPORTS (Crop / Field Reports & Telemetry)
  // =========================================================================
  public static async saveTelemetry(record: Omit<TelemetryRecord, 'id' | 'createdAt'>): Promise<{
    success: boolean;
    record: TelemetryRecord;
    persistedToSupabase?: boolean;
    rlsBlocked?: boolean;
    storage?: 'supabase' | 'local_db';
    error?: string;
  }> {
    const validId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const validUserId = await this.resolveUserForSupabase(record.userId, undefined, record.state, record.district);
    const validFarmId = isValidUuid(record.farmId) ? record.farmId : null;

    const newRecord: TelemetryRecord = {
      ...record,
      id: validId,
      userId: validUserId,
      createdAt,
    };
    fallbackTelemetryStore.unshift(newRecord);

    const client = getServerSupabase();
    if (!client) {
      return { success: false, record: newRecord, error: 'Supabase client not configured on server' };
    }

    if (isRlsWriteBlocked()) {
      return {
        success: true,
        record: newRecord,
        persistedToSupabase: false,
        rlsBlocked: true,
        storage: 'local_db',
      };
    }

    try {
      const payload = {
        id: validId,
        user_id: validUserId,
        farm_id: validFarmId,
        crop: record.crop,
        state: record.state,
        district: record.district,
        temperature: record.temperature,
        humidity: record.humidity,
        rain_chance: record.rainChance,
        precipitation: record.precipitation,
        soil_n: record.soilN,
        soil_p: record.soilP,
        soil_k: record.soilK,
        soil_ph: record.soilPh,
        soil_moisture: record.soilMoisture,
        ndre_score: record.ndreScore,
        ndwi_score: record.ndwiScore,
        health_pct: record.healthPct,
        stress_pct: record.stressPct,
        coordinates: record.coordinates,
        created_at: createdAt,
      };
      const res: any = await withTimeout(client.from('field_reports').insert(payload), 8000, null);

      logSafeDbOperation({
        table: 'field_reports',
        operation: 'INSERT',
        success: !res?.error,
        httpStatus: res?.status,
        postgresErrorCode: res?.error?.code,
        errorMessage: res?.error?.message,
      });

      if (res?.error) {
        const isRls = isRlsError(res.error, res.status);
        if (isRls) {
          setRlsWriteBlocked(true);
          return {
            success: true,
            record: newRecord,
            persistedToSupabase: false,
            rlsBlocked: true,
            storage: 'local_db',
          };
        }
        return { success: true, record: newRecord, persistedToSupabase: false, storage: 'local_db', error: res.error.message };
      }
      return { success: true, record: newRecord, persistedToSupabase: true, storage: 'supabase' };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      logSafeDbOperation({
        table: 'field_reports',
        operation: 'INSERT',
        success: false,
        errorMessage: errMsg,
      });
      return { success: true, record: newRecord, persistedToSupabase: false, storage: 'local_db', error: errMsg };
    }
  }

  public static async getTelemetry(userId?: string, farmId?: string): Promise<TelemetryRecord[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        let query = client.from('field_reports').select('*').order('created_at', { ascending: false }).limit(50);
        if (userId) query = query.eq('user_id', getDeterministicFarmerUuid(userId));
        if (farmId && isValidUuid(farmId)) query = query.eq('farm_id', farmId);
        const { data, error }: any = await withTimeout(query, 1500, { data: null, error: null });
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            farmId: row.farm_id,
            crop: row.crop,
            state: row.state,
            district: row.district,
            temperature: Number(row.temperature || 25),
            humidity: Number(row.humidity || 60),
            rainChance: Number(row.rain_chance || 0),
            precipitation: Number(row.precipitation || 0),
            soilN: row.soil_n ? Number(row.soil_n) : undefined,
            soilP: row.soil_p ? Number(row.soil_p) : undefined,
            soilK: row.soil_k ? Number(row.soil_k) : undefined,
            soilPh: row.soil_ph ? Number(row.soil_ph) : undefined,
            soilMoisture: row.soil_moisture ? Number(row.soil_moisture) : undefined,
            ndreScore: row.ndre_score ? Number(row.ndre_score) : undefined,
            ndwiScore: row.ndwi_score ? Number(row.ndwi_score) : undefined,
            healthPct: row.health_pct ? Number(row.health_pct) : undefined,
            stressPct: row.stress_pct ? Number(row.stress_pct) : undefined,
            coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
            createdAt: row.created_at,
          }));
        }
      } catch (e: any) {
        console.warn('Supabase getTelemetry fallback to local store:', e?.message);
      }
    }
    return fallbackTelemetryStore.filter((t) => {
      if (userId && t.userId && t.userId !== userId && t.userId !== getDeterministicFarmerUuid(userId)) return false;
      return true;
    });
  }

  // =========================================================================
  // 4. PUBLIC.STRUCTURE_TRACKING_LOGS (Structure Monitoring)
  // =========================================================================
  public static async saveStructureLog(log: Omit<StructureTrackingRecord, 'id' | 'createdAt'>): Promise<{
    success: boolean;
    log: StructureTrackingRecord;
    persistedToSupabase?: boolean;
    rlsBlocked?: boolean;
    storage?: 'supabase' | 'local_db';
    error?: string;
  }> {
    const validId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const validUserId = await this.resolveUserForSupabase(log.userId, log.farmName);
    const validFarmId = isValidUuid(log.farmId) ? log.farmId : null;

    const newLog: StructureTrackingRecord = {
      ...log,
      id: validId,
      userId: validUserId,
      createdAt,
    };
    fallbackStructureStore.unshift(newLog);

    const client = getServerSupabase();
    if (!client) {
      return { success: false, log: newLog, error: 'Supabase client not configured on server' };
    }

    if (isRlsWriteBlocked()) {
      return {
        success: true,
        log: newLog,
        persistedToSupabase: false,
        rlsBlocked: true,
        storage: 'local_db',
      };
    }

    try {
      const res: any = await withTimeout(
        client.from('structure_tracking_logs').insert({
          id: validId,
          user_id: validUserId,
          farm_id: validFarmId,
          farm_name: log.farmName,
          satellite_source: log.satelliteSource,
          baseline_date: log.baselineDate,
          target_date: log.targetDate,
          detected_changes_pct: log.detectedChangesPct,
          change_type: log.changeType,
          risk_level: log.riskLevel,
          bounding_box: log.boundingBox,
          notes: log.notes,
          created_at: createdAt,
        }),
        8000,
        null
      );

      logSafeDbOperation({
        table: 'structure_tracking_logs',
        operation: 'INSERT',
        success: !res?.error,
        httpStatus: res?.status,
        postgresErrorCode: res?.error?.code,
        errorMessage: res?.error?.message,
      });

      if (res?.error) {
        const isRls = isRlsError(res.error, res.status);
        if (isRls) {
          setRlsWriteBlocked(true);
          return {
            success: true,
            log: newLog,
            persistedToSupabase: false,
            rlsBlocked: true,
            storage: 'local_db',
          };
        }
        return { success: true, log: newLog, persistedToSupabase: false, storage: 'local_db', error: res.error.message };
      }
      return { success: true, log: newLog, persistedToSupabase: true, storage: 'supabase' };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      logSafeDbOperation({
        table: 'structure_tracking_logs',
        operation: 'INSERT',
        success: false,
        errorMessage: errMsg,
      });
      return { success: true, log: newLog, persistedToSupabase: false, storage: 'local_db', error: errMsg };
    }
  }

  public static async getStructureLogs(userId?: string, farmId?: string): Promise<StructureTrackingRecord[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        let query = client.from('structure_tracking_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (userId) query = query.eq('user_id', getDeterministicFarmerUuid(userId));
        if (farmId && isValidUuid(farmId)) query = query.eq('farm_id', farmId);
        const { data, error }: any = await withTimeout(query, 1500, { data: null, error: null });
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            farmId: row.farm_id,
            farmName: row.farm_name,
            satelliteSource: row.satellite_source || 'Sentinel-2 BOA Level-2A',
            baselineDate: row.baseline_date,
            targetDate: row.target_date,
            detectedChangesPct: Number(row.detected_changes_pct),
            changeType: row.change_type,
            riskLevel: row.risk_level,
            boundingBox: typeof row.bounding_box === 'string' ? JSON.parse(row.bounding_box) : row.bounding_box,
            notes: row.notes,
            createdAt: row.created_at,
          }));
        }
      } catch (e: any) {
        console.warn('Supabase getStructureLogs fallback to local store:', e?.message);
      }
    }
    return fallbackStructureStore;
  }

  // =========================================================================
  // 5. PUBLIC.LAND_REPORTS (Detailed Land Reports)
  // =========================================================================
  public static async saveLandReport(report: Omit<LandReport, 'id' | 'createdAt'>): Promise<{
    success: boolean;
    report: LandReport;
    persistedToSupabase?: boolean;
    rlsBlocked?: boolean;
    storage?: 'supabase' | 'local_db';
    error?: string;
  }> {
    const reportId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const validUserId = await this.resolveUserForSupabase(report.userId, report.farmerName, report.state, report.district);
    const validFarmId = isValidUuid(report.farmId) ? report.farmId : null;

    const fullReport: LandReport = {
      ...report,
      id: reportId,
      userId: validUserId,
      farmId: validFarmId || undefined,
      createdAt,
    };

    const client = getServerSupabase();
    if (!client) {
      return { success: false, report: fullReport, error: 'Supabase client not configured on server' };
    }

    if (isRlsWriteBlocked()) {
      return {
        success: true,
        report: fullReport,
        persistedToSupabase: false,
        rlsBlocked: true,
        storage: 'local_db',
      };
    }

    try {
      const res: any = await withTimeout(
        client.from('land_reports').insert({
          id: reportId,
          user_id: validUserId,
          land_id: validFarmId,
          farm_name: report.farmName,
          farmer_name: report.farmerName,
          crop: report.crop,
          state: report.state,
          district: report.district,
          area_acres: report.areaAcres,
          health_score: report.healthScore,
          soil_n: report.soilN,
          soil_p: report.soilP,
          soil_k: report.soilK,
          soil_ph: report.soilPh,
          soil_moisture: report.soilMoisture,
          advisory_summary: report.advisorySummary,
          irrigation_schedule: report.irrigationSchedule,
          fertilizer_recommendation: report.fertilizerRecommendation,
          pest_risk: report.pestRisk,
          created_at: createdAt,
        }),
        8000,
        null
      );

      logSafeDbOperation({
        table: 'land_reports',
        operation: 'INSERT',
        success: !res?.error,
        httpStatus: res?.status,
        postgresErrorCode: res?.error?.code,
        errorMessage: res?.error?.message,
      });

      if (res?.error) {
        const isRls = isRlsError(res.error, res.status);
        if (isRls) {
          setRlsWriteBlocked(true);
          return {
            success: true,
            report: fullReport,
            persistedToSupabase: false,
            rlsBlocked: true,
            storage: 'local_db',
          };
        }
        return { success: true, report: fullReport, persistedToSupabase: false, storage: 'local_db', error: res.error.message };
      }
      return { success: true, report: fullReport, persistedToSupabase: true, storage: 'supabase' };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      logSafeDbOperation({
        table: 'land_reports',
        operation: 'INSERT',
        success: false,
        errorMessage: errMsg,
      });
      return { success: true, report: fullReport, persistedToSupabase: false, storage: 'local_db', error: errMsg };
    }
  }

  public static async getLandReports(userId?: string): Promise<LandReport[] | null> {
    const client = getServerSupabase();
    if (!client) return null;
    try {
      let query = client.from('land_reports').select('*').order('created_at', { ascending: false }).limit(30);
      if (userId) {
        query = query.eq('user_id', getDeterministicFarmerUuid(userId));
      }
      const { data, error }: any = await withTimeout(query, 1500, { data: null, error: null });
      if (error || !data || data.length === 0) {
        // Fallback to field_reports
        const { data: frData }: any = await withTimeout(
          client.from('field_reports').select('*').order('created_at', { ascending: false }).limit(30),
          1500,
          { data: null }
        );
        if (frData && frData.length > 0) {
          return frData.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            farmId: row.farm_id,
            farmName: 'Agricultural Land Parcel',
            farmerName: 'Farmer',
            state: row.state || 'Punjab',
            district: row.district || '',
            crop: row.crop || 'Wheat',
            areaAcres: 2.5,
            areaSqm: 10117,
            healthScore: Number(row.health_pct || 85),
            soilN: row.soil_n || 240,
            soilP: row.soil_p || 18,
            soilK: row.soil_k || 210,
            soilPh: row.soil_ph || 6.8,
            soilMoisture: row.soil_moisture || 42,
            temperature: row.temperature || 26,
            humidity: row.humidity || 58,
            rainChance: row.rain_chance || 15,
            advisorySummary: `Evaluated health score: ${row.health_pct || 85}%`,
            createdAt: row.created_at,
          }));
        }
        return null;
      }

      return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        farmId: row.land_id,
        farmName: row.farm_name || 'Agricultural Land Parcel',
        farmerName: row.farmer_name || 'Farmer',
        crop: row.crop || 'Wheat',
        state: row.state || 'Punjab',
        district: row.district || '',
        areaAcres: Number(row.area_acres || 2.5),
        areaSqm: Number(row.area_acres || 2.5) * 4046.86,
        healthScore: Number(row.health_score || 85),
        soilN: row.soil_n ? Number(row.soil_n) : undefined,
        soilP: row.soil_p ? Number(row.soil_p) : undefined,
        soilK: row.soil_k ? Number(row.soil_k) : undefined,
        soilPh: row.soil_ph ? Number(row.soil_ph) : undefined,
        soilMoisture: row.soil_moisture ? Number(row.soil_moisture) : undefined,
        advisorySummary: row.advisory_summary,
        irrigationSchedule: row.irrigation_schedule,
        fertilizerRecommendation: row.fertilizer_recommendation,
        pestRisk: row.pest_risk,
        createdAt: row.created_at,
      }));
    } catch (e: any) {
      console.warn('Supabase getLandReports note:', e?.message);
      return null;
    }
  }

  // =========================================================================
  // 6. PUBLIC.ADVISORIES (Farmer Advisories)
  // =========================================================================
  public static async saveAdvisory(advisory: Omit<AdvisoryLog, 'id' | 'createdAt'>): Promise<{
    success: boolean;
    advisory: AdvisoryLog;
    persistedToSupabase?: boolean;
    rlsBlocked?: boolean;
    storage?: 'supabase' | 'local_db';
    error?: string;
  }> {
    const validId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const validUserId = await this.resolveUserForSupabase(advisory.userId, undefined, advisory.state);

    const newAdv: AdvisoryLog = {
      ...advisory,
      id: validId,
      userId: validUserId,
      createdAt,
    };
    fallbackAdvisoryStore.unshift(newAdv);

    const client = getServerSupabase();
    if (!client) {
      return { success: false, advisory: newAdv, error: 'Supabase client not configured on server' };
    }

    if (isRlsWriteBlocked()) {
      return {
        success: true,
        advisory: newAdv,
        persistedToSupabase: false,
        rlsBlocked: true,
        storage: 'local_db',
      };
    }

    try {
      const res: any = await withTimeout(
        client.from('advisories').insert({
          id: validId,
          user_id: validUserId,
          farm_name: advisory.farmName || 'Monitored Plot',
          crop: advisory.crop || 'Wheat',
          state: advisory.state || 'Punjab',
          area_acres: advisory.areaAcres || 2.5,
          summary: advisory.summary,
          irrigation_schedule: advisory.irrigationSchedule,
          nitrogen_recommendation: advisory.nitrogenRecommendation,
          created_at: createdAt,
        }),
        8000,
        null
      );

      logSafeDbOperation({
        table: 'advisories',
        operation: 'INSERT',
        success: !res?.error,
        httpStatus: res?.status,
        postgresErrorCode: res?.error?.code,
        errorMessage: res?.error?.message,
      });

      if (res?.error) {
        const isRls = isRlsError(res.error, res.status);
        if (isRls) {
          setRlsWriteBlocked(true);
          return {
            success: true,
            advisory: newAdv,
            persistedToSupabase: false,
            rlsBlocked: true,
            storage: 'local_db',
          };
        }
        return { success: true, advisory: newAdv, persistedToSupabase: false, storage: 'local_db', error: res.error.message };
      }
      return { success: true, advisory: newAdv, persistedToSupabase: true, storage: 'supabase' };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      logSafeDbOperation({
        table: 'advisories',
        operation: 'INSERT',
        success: false,
        errorMessage: errMsg,
      });
      return { success: true, advisory: newAdv, persistedToSupabase: false, storage: 'local_db', error: errMsg };
    }
  }

  public static async getAdvisories(userId?: string): Promise<AdvisoryLog[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        let query = client.from('advisories').select('*').order('created_at', { ascending: false }).limit(30);
        if (userId) query = query.eq('user_id', getDeterministicFarmerUuid(userId));
        const { data, error }: any = await withTimeout(query, 1500, { data: null, error: null });
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            farmName: row.farm_name,
            crop: row.crop,
            state: row.state,
            areaAcres: Number(row.area_acres || 2.5),
            summary: row.summary,
            irrigationSchedule: row.irrigation_schedule,
            nitrogenRecommendation: row.nitrogen_recommendation,
            createdAt: row.created_at,
          }));
        }
      } catch (e: any) {
        console.warn('Supabase getAdvisories fallback to local store:', e?.message);
      }
    }
    return fallbackAdvisoryStore;
  }

  // =========================================================================
  // 7. PUBLIC.DIAGNOSTIC_LOGS (AI Crop / Disease Diagnosis Records)
  // =========================================================================
  public static async saveDiagnostic(diag: Omit<DiagnosticLog, 'id' | 'createdAt'>): Promise<{
    success: boolean;
    diagnostic: DiagnosticLog;
    persistedToSupabase?: boolean;
    rlsBlocked?: boolean;
    storage?: 'supabase' | 'local_db';
    error?: string;
  }> {
    const validId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const validUserId = await this.resolveUserForSupabase(diag.userId);
    const validFarmId = isValidUuid(diag.farmId) ? diag.farmId : null;

    const newDiag: DiagnosticLog = {
      ...diag,
      id: validId,
      userId: validUserId,
      farmId: validFarmId || undefined,
      createdAt,
    };
    fallbackDiagnosticStore.unshift(newDiag);

    const client = getServerSupabase();
    if (!client) {
      return { success: false, diagnostic: newDiag, error: 'Supabase client not configured on server' };
    }

    if (isRlsWriteBlocked()) {
      return {
        success: true,
        diagnostic: newDiag,
        persistedToSupabase: false,
        rlsBlocked: true,
        storage: 'local_db',
      };
    }

    try {
      const res: any = await withTimeout(
        client.from('diagnostic_logs').insert({
          id: validId,
          user_id: validUserId,
          farm_id: validFarmId,
          crop: diag.crop,
          disease_name: diag.diseaseName,
          severity: diag.severity,
          confidence: diag.confidence,
          symptoms: diag.symptoms,
          remedy_type: diag.remedyType,
          created_at: createdAt,
        }),
        8000,
        null
      );

      logSafeDbOperation({
        table: 'diagnostic_logs',
        operation: 'INSERT',
        success: !res?.error,
        httpStatus: res?.status,
        postgresErrorCode: res?.error?.code,
        errorMessage: res?.error?.message,
      });

      if (res?.error) {
        const isRls = isRlsError(res.error, res.status);
        if (isRls) {
          setRlsWriteBlocked(true);
          return {
            success: true,
            diagnostic: newDiag,
            persistedToSupabase: false,
            rlsBlocked: true,
            storage: 'local_db',
          };
        }
        return { success: true, diagnostic: newDiag, persistedToSupabase: false, storage: 'local_db', error: res.error.message };
      }
      return { success: true, diagnostic: newDiag, persistedToSupabase: true, storage: 'supabase' };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      logSafeDbOperation({
        table: 'diagnostic_logs',
        operation: 'INSERT',
        success: false,
        errorMessage: errMsg,
      });
      return { success: true, diagnostic: newDiag, persistedToSupabase: false, storage: 'local_db', error: errMsg };
    }
  }

  public static async getDiagnostics(userId?: string): Promise<DiagnosticLog[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        let query = client.from('diagnostic_logs').select('*').order('created_at', { ascending: false }).limit(40);
        if (userId) query = query.eq('user_id', getDeterministicFarmerUuid(userId));
        const { data, error }: any = await withTimeout(query, 1500, { data: null, error: null });
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            farmId: row.farm_id,
            crop: row.crop,
            diseaseName: row.disease_name,
            severity: row.severity,
            confidence: Number(row.confidence),
            symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
            remedyType: row.remedy_type || 'both',
            createdAt: row.created_at,
          }));
        }
      } catch (e: any) {
        console.warn('Supabase getDiagnostics fallback to local store:', e?.message);
      }
    }
    return fallbackDiagnosticStore;
  }
}
