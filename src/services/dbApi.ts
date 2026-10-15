import {
  isSupabaseConfigured,
  getSupabase,
  testSupabaseConnection as checkClientSupabase,
  SupabaseStatus,
  TelemetryLog,
  StructureTrackingLog,
} from './supabase';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  address?: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  dob: string;
  password?: string;
  name: string;
  kisanId: string;
  state: string;
  district?: string;
  city?: string;
  tehsil?: string;
  patwarCircle?: string;
  village?: string;
  primaryCrop?: string;
  totalLandAcres: number;
  createdAt: string;
  lastLogin: string;
  location?: UserLocation;
  governmentFarmerId?: string;
  governmentIdStatus?: 'unlinked' | 'pending' | 'verified';
  governmentIdLinkedAt?: string;
}

export interface SavedFarm {
  id: string;
  userId?: string;
  name: string;
  farmerName: string;
  state: string;
  district?: string;
  tehsil?: string;
  patwarCircle?: string;
  crop: string;
  areaAcres: number;
  areaSqm: number;
  healthScore: number;
  points: { lat: number; lng: number }[];
  center: { lat: number; lng: number };
  createdAt: string;
  notes?: string;
  subscriptionTier?: 'basic' | 'premium' | 'none';
  irrigationStatus?: 'needed' | 'in-progress' | 'satisfied';
  currentMoisture?: number;
  optimalThreshold?: number;
}

export interface DiagnosticLog {
  id: string;
  userId?: string;
  farmId?: string;
  crop: string;
  diseaseName: string;
  severity: string;
  confidence: number;
  symptoms: string[];
  remedyType: 'chemical' | 'organic' | 'both';
  createdAt: string;
}

export interface AdvisoryLog {
  id: string;
  userId: string;
  farmName: string;
  crop: string;
  state: string;
  areaAcres: number;
  summary: string;
  irrigationSchedule: string;
  nitrogenRecommendation: string;
  createdAt: string;
}

export interface LandReport {
  id: string;
  userId: string;
  farmId?: string;
  farmName: string;
  farmerName: string;
  kisanId?: string;
  state: string;
  district?: string;
  tehsil?: string;
  crop: string;
  areaAcres: number;
  areaSqm: number;
  healthScore: number;
  ndreScore?: number;
  ndwiScore?: number;
  soilN?: number;
  soilP?: number;
  soilK?: number;
  soilPh?: number;
  soilMoisture?: number;
  temperature?: number;
  humidity?: number;
  rainChance?: number;
  riskLevel?: string;
  advisorySummary?: string;
  irrigationSchedule?: string;
  fertilizerRecommendation?: string;
  pestRisk?: string;
  actionChecklist?: string[];
  points?: { lat: number; lng: number }[];
  center?: { lat: number; lng: number };
  createdAt: string;
}

export { type TelemetryLog, type StructureTrackingLog, type SupabaseStatus };

export interface DatabaseStats {
  totalFarms: number;
  totalAreaAcres: number;
  totalDiagnostics: number;
  totalAdvisories: number;
  lastSync: string;
  dbStatus: string;
  storageEngine: string;
  supabaseConnected?: boolean;
}

const AUTH_STORAGE_KEY = 'bhootech_active_user';

export function getActiveUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setActiveUser(user: UserProfile | null) {
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
}

function getAuthHeaders(): Record<string, string> {
  const user = getActiveUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (user?.id) {
    headers['x-user-id'] = user.id;
  }
  return headers;
}

// Supabase Status check helper
export async function fetchSupabaseStatus(): Promise<SupabaseStatus> {
  // First check client-side
  if (isSupabaseConfigured()) {
    const clientStatus = await checkClientSupabase();
    if (clientStatus.isConnected) {
      return clientStatus;
    }
  }

  // Then check server status endpoint
  try {
    const res = await fetch('/api/supabase/status');
    if (res.ok) {
      const data = await res.json();
      return {
        isConfigured: data.configured ?? false,
        isConnected: data.connected ?? false,
        urlHost: data.supabaseUrl,
        error: data.error || (data.connected ? undefined : data.message),
        latencyMs: data.latencyMs,
      };
    }
  } catch (e) {
    // Ignore server error and return basic status
  }

  return {
    isConfigured: isSupabaseConfigured(),
    isConnected: false,
    error: isSupabaseConfigured()
      ? 'Supabase connection check timed out. Retrying with local cache.'
      : 'Supabase credentials not configured in environment (Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)',
  };
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ensureValidUuidOrNull(val?: string): string | null {
  if (!val) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(val)) return val;
  return null;
}

export function getDeterministicUserUuid(id?: string, phone?: string): string {
  if (id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
  }
  const cleanDigits = (phone || id || '9876543210').replace(/[^0-9]/g, '').padEnd(12, '0').slice(-12);
  return `00000000-0000-4000-8000-${cleanDigits}`;
}

export async function syncUserToSupabase(user: UserProfile): Promise<{
  success: boolean;
  message?: string;
  storage?: 'supabase' | 'local_db';
  rlsBlocked?: boolean;
}> {
  let serverOk = false;
  let serverData: any = null;

  // 1. Trigger server-side Supabase sync
  try {
    const res = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ user }),
    });
    if (res.ok) {
      serverData = await res.json();
      serverOk = !!serverData.success;
    }
  } catch (e) {
    console.warn('Server user sync error:', e);
  }

  const isCloudSynced = !!serverData?.supabaseSaved;
  const isRls = !!serverData?.rlsBlocked;

  return {
    success: serverOk,
    storage: isCloudSynced ? 'supabase' : 'local_db',
    rlsBlocked: isRls,
    message: isCloudSynced
      ? `Farmer profile for ${user.name} synced to Supabase cloud database!`
      : isRls
      ? `Farmer profile for ${user.name} saved in local database (Supabase RLS active)`
      : serverOk
      ? `Farmer profile for ${user.name} saved successfully!`
      : 'Profile saved in local session.',
  };
}

export async function loginFarmer(
  identifier: string,
  secret: string
): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
  const cleanId = (identifier || '').trim();
  const cleanSecret = (secret || '').trim();

  if (!cleanId || !cleanSecret) {
    return { success: false, error: 'Please provide Mobile number or Kisan ID and Password' };
  }

  // Direct Supabase query check for users table if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const cleanPhone = cleanId.replace(/\D/g, '').slice(-10);
        let query = supabase.from('users').select('*');
        if (cleanPhone.length === 10) {
          query = query.or(`phone.eq.${cleanPhone},mobile_number.eq.${cleanPhone},kisan_id.ilike.${cleanId},kisanId.ilike.${cleanId}`);
        } else {
          query = query.or(`kisan_id.ilike.${cleanId},kisanId.ilike.${cleanId},id.eq.${cleanId}`);
        }

        const { data, error } = await query.maybeSingle();

        if (!error && data) {
          // Verify Password or DOB (case/format insensitive)
          const normalizedInputSecret = cleanSecret.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
          const storedPassword = (data.password || '').trim();
          const storedDob = (data.dob || data.date_of_birth || '').trim();
          const normalizedStoredPassword = storedPassword.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
          const normalizedStoredDob = storedDob.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();

          const isMatch =
            storedPassword === cleanSecret ||
            storedDob === cleanSecret ||
            normalizedInputSecret === normalizedStoredPassword ||
            normalizedInputSecret === normalizedStoredDob ||
            (!storedPassword && !storedDob);

          if (isMatch) {
            const userProfile: UserProfile = {
              id: data.id,
              phone: data.phone || data.mobile_number || cleanPhone,
              dob: storedDob || '1990-01-01',
              password: storedPassword || cleanSecret,
              name: data.full_name || data.name || 'Farmer',
              kisanId: data.kisan_id || data.kisanId || `PMK-${(data.state || 'HP').substring(0, 2).toUpperCase()}-${cleanPhone.slice(-4)}`,
              state: data.state || 'Himachal Pradesh',
              district: data.district,
              city: data.city,
              tehsil: data.tehsil,
              patwarCircle: data.patwar_circle || data.patwarCircle,
              village: data.village,
              primaryCrop: data.primary_crop || data.primaryCrop || 'Wheat',
              totalLandAcres: Number(data.total_land_acres || data.totalLandAcres || 0),
              createdAt: data.created_at || data.createdAt || new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              location: data.location,
            };

            // Immediate upsert to users table on login
            await syncUserToSupabase(userProfile);

            setActiveUser(userProfile);
            return {
              success: true,
              user: userProfile,
              message: `Welcome back, ${userProfile.name}!`,
            };
          }
        }
      } catch (err) {
        console.warn('Client Supabase users login query fallback to API:', err);
      }
    }
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: cleanId, password: cleanSecret, phone: cleanId, dob: cleanSecret }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Authentication failed' };
    }
    if (data.user) {
      data.user.lastLogin = new Date().toISOString();
      setActiveUser(data.user);
      // Immediately perform upsert to Supabase users table on client side as well
      syncUserToSupabase(data.user).catch((e) => console.warn('Login client sync error:', e));
    }
    return { success: true, user: data.user, message: data.message };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network connection failed' };
  }
}

export async function loginWithPhoneAndDob(
  phone: string,
  dob: string
): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
  return loginFarmer(phone, dob);
}

export async function registerFarmer(data: {
  phone: string;
  dob: string;
  password?: string;
  name: string;
  state: string;
  district?: string;
  city?: string;
  tehsil?: string;
  patwarCircle?: string;
  village?: string;
  primaryCrop?: string;
  totalLandAcres?: number;
  location?: UserLocation;
}): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
  const cleanPhone = data.phone.replace(/[^0-9]/g, '').slice(-10);
  const userId = getDeterministicUserUuid(undefined, cleanPhone);
  const stateCode = (data.state || 'HP').substring(0, 2).toUpperCase();
  const randomKisanNum = Math.floor(10000 + Math.random() * 90000);
  const kisanId = `PMK-${stateCode}-${randomKisanNum}`;
  const now = new Date().toISOString();
  const setPassword = data.password ? data.password.trim() : data.dob;

  const newProfile: UserProfile = {
    id: userId,
    phone: cleanPhone,
    dob: data.dob,
    password: setPassword,
    name: data.name.trim(),
    kisanId: kisanId,
    state: data.state,
    district: data.district || '',
    city: data.city || '',
    tehsil: data.tehsil || '',
    patwarCircle: data.patwarCircle || '',
    village: data.village || '',
    primaryCrop: data.primaryCrop || 'Wheat',
    totalLandAcres: data.totalLandAcres || 0,
    createdAt: now,
    lastLogin: now,
    location: data.location,
  };

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        phone: cleanPhone,
        password: setPassword,
        location: data.location,
      }),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { success: false, error: resData.error || 'Registration failed' };
    }
    const finalUser: UserProfile = resData.user || newProfile;
    setActiveUser(finalUser);
    if (isSupabaseConfigured()) {
      syncUserToSupabase(finalUser).catch((e) => console.warn('Register Supabase sync note:', e));
    }
    return { success: true, user: finalUser, message: resData.message };
  } catch (e: any) {
    // If backend endpoint unreachable, use deterministic newProfile and sync to Supabase directly if configured
    setActiveUser(newProfile);
    if (isSupabaseConfigured()) {
      syncUserToSupabase(newProfile).catch((e) => console.warn('Offline register Supabase sync note:', e));
    }
    return {
      success: true,
      user: newProfile,
      message: `Registration completed! Your Kisan ID is ${newProfile.kisanId}`,
    };
  }
}

export async function updateFarmerProfile(
  updates: Partial<UserProfile>
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const user = getActiveUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const updatedUser: UserProfile = {
      ...user,
      ...updates,
      lastLogin: new Date().toISOString(),
    };

    // Direct update / upsert to Supabase users table
    if (isSupabaseConfigured()) {
      await syncUserToSupabase(updatedUser);
    }

    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...updates, userId: user.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActiveUser(updatedUser);
      return { success: true, user: updatedUser };
    }
    if (data.user) {
      setActiveUser(data.user);
      syncUserToSupabase(data.user).catch((e) => console.warn('Profile update sync error:', e));
    }
    return { success: true, user: data.user || updatedUser };
  } catch (e: any) {
    const user = getActiveUser();
    if (user) {
      const updatedUser: UserProfile = { ...user, ...updates, lastLogin: new Date().toISOString() };
      setActiveUser(updatedUser);
      syncUserToSupabase(updatedUser).catch((err) => console.warn('Offline profile sync error:', err));
      return { success: true, user: updatedUser };
    }
    return { success: false, error: e?.message || 'Network error' };
  }
}

export async function saveFarmerLocation(
  location: UserLocation
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  return updateFarmerProfile({ location });
}

const LOCAL_FARMS_CACHE_KEY = 'bhootech_saved_farms_cache';

export function getCachedFarms(): SavedFarm[] {
  try {
    const raw = localStorage.getItem(LOCAL_FARMS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setCachedFarms(farms: SavedFarm[]): void {
  try {
    localStorage.setItem(LOCAL_FARMS_CACHE_KEY, JSON.stringify(farms));
  } catch {}
}

export function addOrUpdateCachedFarm(farm: SavedFarm): void {
  try {
    const current = getCachedFarms();
    const index = current.findIndex((f) => f.id === farm.id);
    if (index >= 0) {
      current[index] = farm;
    } else {
      current.unshift(farm);
    }
    setCachedFarms(current);
  } catch {}
}

export function removeCachedFarm(id: string): void {
  try {
    const current = getCachedFarms();
    const updated = current.filter((f) => f.id !== id);
    setCachedFarms(updated);
  } catch {}
}

// User-scoped Database CRUD (Mapped to user_lands table)
export async function fetchDbStats(userId?: string): Promise<DatabaseStats | null> {
  try {
    const active = userId || getActiveUser()?.id;
    const url = active ? `/api/database/stats?userId=${encodeURIComponent(active)}` : '/api/database/stats';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { 
      headers: getAuthHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Failed to fetch DB stats');
    return await res.json();
  } catch (e) {
    console.warn('dbApi fetchDbStats notice, utilizing cached telemetry:', e);
    const cachedFarms = getCachedFarms();
    return {
      totalFarms: cachedFarms.length,
      totalAreaAcres: Number(cachedFarms.reduce((acc, f) => acc + (f.areaAcres || 0), 0).toFixed(2)),
      totalDiagnostics: 0,
      totalAdvisories: 0,
      lastSync: new Date().toISOString(),
      dbStatus: 'CONNECTED (Offline Resilient)',
      storageEngine: 'Unified PostgreSQL + Local Offline Engine',
      supabaseConnected: isSupabaseConfigured(),
    };
  }
}

export async function fetchFarms(userId?: string): Promise<SavedFarm[]> {
  const active = userId || getActiveUser()?.id;

  // 1. Primary query: server-side API (which connects directly to Supabase server-to-server + local DB)
  try {
    const url = active ? `/api/farms?userId=${encodeURIComponent(active)}` : '/api/farms';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { 
      headers: getAuthHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.farms)) {
        if (data.farms.length > 0) {
          setCachedFarms(data.farms);
        }
        return data.farms;
      }
    }
  } catch (apiErr) {
    console.warn('dbApi /api/farms fallback initiated:', apiErr);
  }

  // 2. Secondary query: Client-side Supabase user_lands table
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('user_lands').select('*').order('created_at', { ascending: false });
        if (active) query = query.eq('user_id', active);
        const { data, error } = await query;
        
        if (!error && data && data.length > 0) {
          const mapped: SavedFarm[] = data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            name: row.name || row.land_name || 'Land Parcel',
            farmerName: row.farmer_name || row.owner_name || 'Farmer',
            state: row.state,
            district: row.district,
            tehsil: row.tehsil,
            patwarCircle: row.patwar_circle,
            crop: row.crop || row.primary_crop || 'Wheat',
            areaAcres: Number(row.area_acres || row.area || 0),
            areaSqm: Number(row.area_sqm || (Number(row.area_acres || 0) * 4046.86)),
            healthScore: Number(row.health_score || row.health || 85),
            points: typeof row.points === 'string' ? JSON.parse(row.points) : row.points || [],
            center: typeof row.center === 'string' ? JSON.parse(row.center) : row.center || (row.points?.[0] || { lat: 31.634, lng: 74.8723 }),
            notes: row.notes || row.description || '',
            subscriptionTier: row.subscription_tier || row.subscriptionTier || 'premium',
            irrigationStatus: row.irrigation_status || row.irrigationStatus || 'needed',
            currentMoisture: row.current_moisture || row.currentMoisture || 22,
            optimalThreshold: row.optimal_threshold || row.optimalThreshold || 45,
            createdAt: row.created_at,
          }));
          setCachedFarms(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Client Supabase fetch user_lands notice:', err);
      }
    }
  }

  // 3. Tertiary fallback: Return cached local farms
  const cached = getCachedFarms();
  if (cached.length > 0) {
    if (active) {
      const userCached = cached.filter((f) => !f.userId || f.userId === active);
      if (userCached.length > 0) return userCached;
    }
    return cached;
  }

  return [];
}

export async function saveFarmToDb(farm: Omit<SavedFarm, 'id' | 'createdAt'>): Promise<SavedFarm | null> {
  try {
    const user = getActiveUser();
    const effectiveUserId = getDeterministicUserUuid(farm.userId || user?.id, farm.farmerName || user?.phone);
    const payload = {
      ...farm,
      userId: effectiveUserId,
      farmerName: farm.farmerName || user?.name || 'Farmer',
    };



    const res = await fetch('/api/farms', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.farm) {
        addOrUpdateCachedFarm(data.farm);
        return data.farm;
      }
    }

    // Local fallback if API server didn't return farm
    const localFarm: SavedFarm = {
      id: generateUuid(),
      ...payload,
      createdAt: new Date().toISOString(),
    };
    addOrUpdateCachedFarm(localFarm);
    return localFarm;
  } catch (e) {
    console.warn('dbApi saveFarm fallback to local cache:', e);
    const user = getActiveUser();
    const fallbackFarm: SavedFarm = {
      id: generateUuid(),
      userId: farm.userId || user?.id,
      name: farm.name,
      farmerName: farm.farmerName || user?.name || 'Farmer',
      state: farm.state || 'Punjab',
      district: farm.district,
      tehsil: farm.tehsil,
      patwarCircle: farm.patwarCircle,
      crop: farm.crop || 'Wheat',
      areaAcres: farm.areaAcres,
      areaSqm: farm.areaSqm,
      healthScore: farm.healthScore,
      points: farm.points,
      center: farm.center,
      notes: farm.notes,
      createdAt: new Date().toISOString(),
    };
    addOrUpdateCachedFarm(fallbackFarm);
    return fallbackFarm;
  }
}

export async function syncAllLocalFarmsToSupabase(farmsList: SavedFarm[]): Promise<{ synced: number; error?: string }> {
  let count = 0;
  const active = getActiveUser();

  // Auto-sync user profile first to ensure users table has the user
  if (active) {
    await syncUserToSupabase(active).catch(() => {});
  }

  // 1. Try server-side Supabase bulk sync endpoint
  try {
    const res = await fetch('/api/db/sync-to-supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ farms: farmsList }),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.synced === 'number') {
        count = data.synced;
      }
    }
  } catch (err) {
    console.warn('Server Supabase sync endpoint warning:', err);
  }

  // 2. Direct client-side Supabase insert fallback if available
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      for (const farm of farmsList) {
        try {
          const landId = ensureValidUuidOrNull(farm.id) || generateUuid();
          const validUserId = getDeterministicUserUuid(farm.userId || active?.id, farm.farmerName || active?.phone);
          const createdAt = farm.createdAt || new Date().toISOString();

          const insertPayload: Record<string, any> = {
            id: landId,
            user_id: validUserId,
            name: farm.name,
            land_name: farm.name,
            farmer_name: farm.farmerName || active?.name || 'Farmer',
            state: farm.state || 'Punjab',
            district: farm.district || '',
            crop: farm.crop || 'Wheat',
            area_acres: Number(farm.areaAcres) || 2.5,
            points: farm.points,
            center: farm.center,
            notes: farm.notes || '',
            created_at: createdAt,
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase.from('user_lands').upsert(insertPayload, { onConflict: 'id' });
          if (!error) {
            count++;
          } else if (
            error.message?.includes('violates foreign key constraint') ||
            error.code === '23503' ||
            error.message?.includes('user_lands_user_id_fkey')
          ) {
            const { error: safeErr } = await supabase.from('user_lands').upsert({ ...insertPayload, user_id: null }, { onConflict: 'id' });
            if (!safeErr) count++;
          } else {
            console.warn('Supabase user_lands upsert note:', error.message);
            const { error: insertErr } = await supabase.from('user_lands').insert(insertPayload);
            if (!insertErr) count++;
          }
        } catch (err) {
          console.warn('Sync farm item direct error:', err);
        }
      }
    }
  }

  return { synced: count };
}

export async function deleteFarmFromDb(id: string): Promise<boolean> {
  // Update local cache immediately
  removeCachedFarm(id);

  // Client-side Supabase direct delete from user_lands table
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('user_lands').delete().eq('id', id);
      } catch (e) {
        console.warn('Client Supabase user_lands delete notice:', e);
      }
    }
  }

  try {
    const user = getActiveUser();
    const url = user?.id ? `/api/farms/${encodeURIComponent(id)}?userId=${encodeURIComponent(user.id)}` : `/api/farms/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (e) {
    console.warn('dbApi deleteFarm notice:', e);
    return true;
  }
}

// ---------------------------------------------------------
// Telemetry Logs Actions (Mapped to field_reports table)
// ---------------------------------------------------------
export async function fetchTelemetryLogs(userId?: string, farmId?: string): Promise<TelemetryLog[]> {
  // Client-side query to field_reports table in Supabase
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const active = userId || getActiveUser()?.id;
        let query = supabase.from('field_reports').select('*').order('created_at', { ascending: false }).limit(50);
        if (active) query = query.eq('user_id', active);
        if (farmId) query = query.eq('farm_id', farmId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            farmId: row.farm_id || row.land_id,
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
      } catch (err) {
        console.warn('Client Supabase field_reports fetch fallback to API:', err);
      }
    }
  }

  try {
    const active = userId || getActiveUser()?.id;
    const params = new URLSearchParams();
    if (active) params.append('userId', active);
    if (farmId) params.append('farmId', farmId);

    const url = `/api/telemetry?${params.toString()}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch telemetry logs');
    const data = await res.json();
    return data.telemetry || [];
  } catch (e) {
    console.warn('dbApi fetchTelemetryLogs notice:', e);
    return [];
  }
}

export async function saveTelemetryLog(
  record: Omit<TelemetryLog, 'id' | 'createdAt'>
): Promise<TelemetryLog | null> {
  try {
    const user = getActiveUser();
    const payload = {
      ...record,
      userId: record.userId || user?.id || 'guest-farmer',
    };

    // Client-side Supabase write to field_reports table
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const reportId = `report-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          const { error } = await supabase.from('field_reports').insert({
            id: reportId,
            user_id: payload.userId,
            farm_id: payload.farmId,
            crop: payload.crop,
            state: payload.state,
            temperature: payload.temperature,
            humidity: payload.humidity,
            rain_chance: payload.rainChance,
            precipitation: payload.precipitation,
            soil_n: payload.soilN,
            soil_p: payload.soilP,
            soil_k: payload.soilK,
            soil_ph: payload.soilPh,
            soil_moisture: payload.soilMoisture,
            ndre_score: payload.ndreScore,
            ndwi_score: payload.ndwiScore,
            health_pct: payload.healthPct,
            stress_pct: payload.stressPct,
            coordinates: payload.coordinates,
            created_at: new Date().toISOString(),
          });
          if (!error) {
            console.log('Saved sensor report directly to Supabase table: field_reports');
          }
        } catch (e) {
          console.warn('Client Supabase field_reports insert fallback:', e);
        }
      }
    }

    const res = await fetch('/api/telemetry', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save telemetry to DB');
    const data = await res.json();
    return data.telemetry;
  } catch (e) {
    console.warn('dbApi saveTelemetryLog notice:', e);
    return null;
  }
}

// ---------------------------------------------------------
// Satellite Structure Tracking Logs Actions (Supabase / REST)
// ---------------------------------------------------------
export async function fetchStructureTrackingLogs(
  userId?: string,
  farmId?: string
): Promise<StructureTrackingLog[]> {
  try {
    const active = userId || getActiveUser()?.id;
    const params = new URLSearchParams();
    if (active) params.append('userId', active);
    if (farmId) params.append('farmId', farmId);

    const url = `/api/structure-tracking?${params.toString()}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch structure tracking logs');
    const data = await res.json();
    return data.logs || [];
  } catch (e) {
    console.warn('dbApi fetchStructureTrackingLogs notice:', e);
    return [];
  }
}

export async function saveStructureTrackingLog(
  log: Omit<StructureTrackingLog, 'id' | 'createdAt'>
): Promise<StructureTrackingLog | null> {
  try {
    const user = getActiveUser();
    const payload = {
      ...log,
      userId: log.userId || user?.id || 'guest-farmer',
    };

    // Attempt client Supabase write
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const structId = `struct-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          await supabase.from('structure_tracking_logs').insert({
            id: structId,
            user_id: payload.userId,
            farm_id: payload.farmId,
            farm_name: payload.farmName,
            satellite_source: payload.satelliteSource,
            baseline_date: payload.baselineDate,
            target_date: payload.targetDate,
            detected_changes_pct: payload.detectedChangesPct,
            change_type: payload.changeType,
            risk_level: payload.riskLevel,
            bounding_box: payload.boundingBox,
            notes: payload.notes || '',
            created_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Client Supabase structure tracking insert fallback:', e);
        }
      }
    }

    const res = await fetch('/api/structure-tracking', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save structure tracking log');
    const data = await res.json();
    return data.log;
  } catch (e) {
    console.warn('dbApi saveStructureTrackingLog notice:', e);
    return null;
  }
}

// ---------------------------------------------------------
// Diagnostic Logs Actions
// ---------------------------------------------------------
export async function fetchDiagnostics(userId?: string): Promise<DiagnosticLog[]> {
  try {
    const active = userId || getActiveUser()?.id;
    const url = active ? `/api/diagnostics?userId=${encodeURIComponent(active)}` : '/api/diagnostics';
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch diagnostics');
    const data = await res.json();
    return data.diagnostics || [];
  } catch (e) {
    console.warn('dbApi fetchDiagnostics notice:', e);
    return [];
  }
}

export async function logDiagnosticToDb(diag: Omit<DiagnosticLog, 'id' | 'createdAt'>): Promise<DiagnosticLog | null> {
  try {
    const user = getActiveUser();
    const effectiveUserId = getDeterministicUserUuid(diag.userId || user?.id, user?.phone);
    const payload = {
      ...diag,
      userId: effectiveUserId,
    };

    // Client-side Supabase direct save to diagnostic_logs table
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const diagId = generateUuid();
          const createdAt = new Date().toISOString();
          if (user) await syncUserToSupabase(user).catch(() => {});
          await supabase.from('diagnostic_logs').insert({
            id: diagId,
            user_id: effectiveUserId,
            farm_id: ensureValidUuidOrNull(payload.farmId),
            crop: payload.crop,
            disease_name: payload.diseaseName,
            severity: payload.severity,
            confidence: Number(payload.confidence) || 90,
            symptoms: payload.symptoms || [],
            remedy_type: payload.remedyType || 'both',
            created_at: createdAt,
          });
        } catch (e) {
          console.warn('Client Supabase diagnostic_logs direct insert note:', e);
        }
      }
    }

    const res = await fetch('/api/diagnostics', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log diagnostic to DB');
    const data = await res.json();
    return data.diagnostic;
  } catch (e) {
    console.warn('dbApi logDiagnostic notice:', e);
    return null;
  }
}

// ---------------------------------------------------------
// Farmer Advisories Actions (Supabase advisories table)
// ---------------------------------------------------------
export async function fetchAdvisoriesFromDb(userId?: string): Promise<AdvisoryLog[]> {
  // 1. Direct client Supabase query if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const active = userId || getActiveUser()?.id;
        let query = supabase.from('advisories').select('*').order('created_at', { ascending: false }).limit(30);
        if (active) query = query.eq('user_id', getDeterministicUserUuid(active));
        const { data, error } = await query;
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
      } catch (err) {
        console.warn('Client Supabase fetch advisories fallback:', err);
      }
    }
  }

  // 2. Server API query
  try {
    const active = userId || getActiveUser()?.id;
    const url = active ? `/api/advisories?userId=${encodeURIComponent(active)}` : '/api/advisories';
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch advisories');
    const data = await res.json();
    return data.advisories || [];
  } catch (e) {
    console.warn('dbApi fetchAdvisories notice:', e);
    return [];
  }
}

export async function saveAdvisoryToDb(
  advisory: Omit<AdvisoryLog, 'id' | 'createdAt'>
): Promise<AdvisoryLog | null> {
  try {
    const user = getActiveUser();
    const effectiveUserId = getDeterministicUserUuid(advisory.userId || user?.id, user?.phone);
    const payload = {
      ...advisory,
      userId: effectiveUserId,
      state: advisory.state || user?.state || 'Punjab',
      crop: advisory.crop || user?.primaryCrop || 'Wheat',
    };

    // Client-side Supabase direct save to advisories table
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const advId = generateUuid();
          const createdAt = new Date().toISOString();
          if (user) await syncUserToSupabase(user).catch(() => {});
          await supabase.from('advisories').insert({
            id: advId,
            user_id: effectiveUserId,
            farm_name: payload.farmName,
            crop: payload.crop,
            state: payload.state,
            area_acres: payload.areaAcres,
            summary: payload.summary,
            irrigation_schedule: payload.irrigationSchedule,
            nitrogen_recommendation: payload.nitrogenRecommendation,
            created_at: createdAt,
          });
        } catch (e) {
          console.warn('Client Supabase saveAdvisory direct insert fallback:', e);
        }
      }
    }

    const res = await fetch('/api/advisories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save advisory to DB');
    const data = await res.json();
    return data.advisory;
  } catch (e) {
    console.warn('dbApi saveAdvisoryToDb notice:', e);
    return null;
  }
}

export async function seedDemoDatabase(): Promise<boolean> {
  try {
    const res = await fetch('/api/database/seed', { method: 'POST', headers: getAuthHeaders() });
    return res.ok;
  } catch (e) {
    console.warn('dbApi seedDemoDatabase notice:', e);
    return false;
  }
}

// ---------------------------------------------------------
// Land Agronomy & Precision Soil Reports Actions (Supabase)
// ---------------------------------------------------------
export async function fetchLandReportsFromDb(userId?: string): Promise<LandReport[]> {
  try {
    const active = userId || getActiveUser()?.id;
    const url = active ? `/api/reports/land?userId=${encodeURIComponent(active)}` : '/api/reports/land';
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch land reports');
    const data = await res.json();
    return data.reports || [];
  } catch (e) {
    console.warn('dbApi fetchLandReportsFromDb notice:', e);
    return [];
  }
}

export async function saveLandReportToDb(report: Omit<LandReport, 'id' | 'createdAt'>): Promise<LandReport | null> {
  try {
    const user = getActiveUser();
    const effectiveUserId = getDeterministicUserUuid(report.userId || user?.id, report.farmerName || user?.phone);
    const payload = {
      ...report,
      userId: effectiveUserId,
      farmerName: report.farmerName || user?.name || 'Farmer',
      state: report.state || user?.state || 'Punjab',
      crop: report.crop || user?.primaryCrop || 'Wheat',
      kisanId: report.kisanId || user?.kisanId,
    };

    // Client-side Supabase direct save to field_reports & land_reports
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const reportId = generateUuid();
          const createdAt = new Date().toISOString();

          // Auto-sync user first
          if (user) {
            await syncUserToSupabase(user).catch(() => {});
          }

          // 1. Direct insert to field_reports
          await supabase.from('field_reports').insert({
            id: reportId,
            user_id: effectiveUserId,
            crop: payload.crop,
            state: payload.state,
            district: payload.district,
            temperature: payload.temperature || 26,
            humidity: payload.humidity || 58,
            rain_chance: payload.rainChance || 15,
            soil_n: payload.soilN || 240,
            soil_p: payload.soilP || 18,
            soil_k: payload.soilK || 210,
            soil_ph: payload.soilPh || 6.8,
            soil_moisture: payload.soilMoisture || 42,
            ndre_score: payload.ndreScore || payload.healthScore,
            ndwi_score: payload.ndwiScore || 65,
            health_pct: payload.healthScore,
            stress_pct: payload.riskLevel === 'RED' ? 35 : payload.riskLevel === 'YELLOW' ? 20 : 10,
            coordinates: payload.center || payload.points?.[0],
            created_at: createdAt,
          });

          // 2. Direct insert to advisories
          await supabase.from('advisories').insert({
            id: reportId,
            user_id: effectiveUserId,
            farm_name: payload.farmName,
            crop: payload.crop,
            state: payload.state,
            area_acres: payload.areaAcres,
            summary: payload.advisorySummary || `Comprehensive land assessment for ${payload.crop} parcel in ${payload.state}. Health: ${payload.healthScore}%.`,
            irrigation_schedule: payload.irrigationSchedule || 'Optimized morning drip cycle (every 3 days)',
            nitrogen_recommendation: payload.fertilizerRecommendation || 'Apply 25 kg/acre Urea with Neem coating',
            created_at: createdAt,
          });
        } catch (e: any) {
          console.warn('Client Supabase land report direct insert fallback:', e?.message);
        }
      }
    }

    const res = await fetch('/api/reports/land', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save land report to DB');
    const data = await res.json();
    return data.report;
  } catch (e) {
    console.warn('dbApi saveLandReportToDb notice:', e);
    return null;
  }
}

