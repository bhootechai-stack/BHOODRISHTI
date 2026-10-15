import { createClient, SupabaseClient } from '@supabase/supabase-js';

function cleanUrl(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/\s+/g, '').replace('supabas e.co', 'supabase.co').trim();
}

function cleanKey(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/\s+/g, '').trim();
}

// Environment variables extraction for Vite client runtime
export const SUPABASE_URL = cleanUrl(
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || ''
);

export const SUPABASE_ANON_KEY = cleanKey(
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || ''
);

let hasLoggedSupabaseWarning = false;

/**
 * Checks if client-side Supabase credentials are valid (non-empty, non-placeholder URL).
 */
export function isSupabaseConfigured(): boolean {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return false;
  }
  if (
    SUPABASE_URL.includes('[YOUR_SUPABASE_URL]') ||
    SUPABASE_URL.includes('your-project') ||
    SUPABASE_URL.includes('[I WILL ADD') ||
    SUPABASE_ANON_KEY.includes('[YOUR_SUPABASE') ||
    SUPABASE_ANON_KEY.includes('[I WILL ADD')
  ) {
    return false;
  }
  try {
    const url = new URL(SUPABASE_URL);
    return (url.protocol === 'https:' || url.protocol === 'http:') && SUPABASE_ANON_KEY.length >= 10;
  } catch {
    return false;
  }
}

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lazy Supabase client getter with error handling.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize client Supabase instance:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export interface SupabaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  isWritable?: boolean;
  rlsBlocked?: boolean;
  urlHost?: string;
  error?: string;
  latencyMs?: number;
  tablesVerified?: string[];
  message?: string;
}

/**
 * Performs a health check to Supabase, checking server-side credentials and tables.
 */
export async function testSupabaseConnection(): Promise<SupabaseStatus> {
  // First, check server status endpoint which uses server-side SUPABASE_URL and SUPABASE_KEY
  try {
    const res = await fetch('/api/supabase/status');
    if (res.ok) {
      const data = await res.json();
      return {
        isConfigured: data.configured ?? false,
        isConnected: data.connected ?? false,
        isWritable: data.isWritable,
        rlsBlocked: data.rlsBlocked,
        urlHost: data.supabaseUrl || data.host,
        error: data.connected ? undefined : (data.error || data.message),
        latencyMs: data.latencyMs,
        tablesVerified: data.tablesVerified,
        message: data.message,
      };
    }
  } catch (e) {
    // Non-blocking fallback
  }

  // Client-side fallback if client keys are explicitly provided
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      const startTime = Date.now();
      try {
        const { error } = await client.from('user_lands').select('id').limit(1);
        const latency = Date.now() - startTime;
        let urlHost = '';
        try {
          urlHost = new URL(SUPABASE_URL).hostname;
        } catch {}

        if (!error) {
          return { isConfigured: true, isConnected: true, urlHost, latencyMs: latency };
        }
        return { isConfigured: true, isConnected: false, urlHost, error: error.message, latencyMs: latency };
      } catch (err: any) {
        return { isConfigured: true, isConnected: false, error: err?.message };
      }
    }
  }

  return {
    isConfigured: false,
    isConnected: false,
    error: 'Supabase credentials not configured in environment.',
  };
}

export interface TelemetryLog {
  id?: string;
  userId?: string;
  farmId?: string;
  crop?: string;
  state?: string;
  district?: string;
  temperature: number;
  humidity: number;
  rainChance: number;
  precipitation?: number;
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
  createdAt?: string;
}

export interface StructureTrackingLog {
  id?: string;
  userId?: string;
  farmId?: string;
  farmName: string;
  satelliteSource: string;
  baselineDate: string;
  targetDate: string;
  detectedChangesPct: number;
  changeType: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  boundingBox?: { north: number; south: number; east: number; west: number };
  notes?: string;
  createdAt?: string;
}
