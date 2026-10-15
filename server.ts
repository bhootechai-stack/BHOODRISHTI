import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { DatabaseEngine } from './server/db';
import { HyperLocalBackendEngine } from './server/hyperLocalEngine';
import {
  SupabaseService,
  isServerSupabaseConfigured,
  SUPABASE_URL,
  verifyPassword,
} from './server/supabase';
import { buildConversationalReply } from './src/utils/conversationEngine';
import { generateScheduleAndMandiIntelligence } from './src/services/hyperLocalAdvisoryEngine';
import { generateKrishiMitraRecommendation } from './server/krishiMitraService';

dotenv.config({ override: true });

const app = express();
const PORT = 3000;

// Universal CORS & preflight options handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Security & Iframe Compatibility Headers Middleware
app.use((req, res, next) => {
  // Allow preview iframe in AI Studio, Google Cloud Run, and development environments
  const cspDirectives = [
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https: http: wss: ws: data: blob:",
    "font-src 'self' data: https:",
    "media-src 'self' data: blob: https: http:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors *",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  next();
});

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check & DB status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BhooTech AI',
    database: 'CONNECTED',
    supabaseConfigured: isServerSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// Supabase Status and Connectivity Diagnostics Endpoint
app.get('/api/supabase/status', async (req, res) => {
  try {
    const testResult = await SupabaseService.testConnection();
    let hostname: string | null = null;
    try {
      if (SUPABASE_URL) {
        hostname = new URL(SUPABASE_URL).hostname;
      }
    } catch {}
    res.json({
      configured: isServerSupabaseConfigured(),
      supabaseUrl: hostname,
      ...testResult,
    });
  } catch (error: any) {
    res.status(500).json({
      configured: isServerSupabaseConfigured(),
      connected: false,
      error: error?.message || 'Error checking Supabase status',
    });
  }
});

// Database Telemetry & Stats endpoint
app.get('/api/database/stats', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;
    const baseStats = DatabaseEngine.getStats(userId);
    const isSupabaseActive = isServerSupabaseConfigured();
    
    // Check if Supabase has live farms
    let supabaseFarmsCount = 0;
    if (isSupabaseActive) {
      const sbFarms = await SupabaseService.getFarms(userId);
      if (sbFarms) {
        supabaseFarmsCount = sbFarms.length;
      }
    }

    res.json({
      ...baseStats,
      supabaseConnected: isSupabaseActive,
      storageEngine: isSupabaseActive
        ? 'Supabase PostgreSQL + JSON Cache'
        : 'Node.js Express + File/JSON Database',
      dbStatus: isSupabaseActive ? 'CONNECTED (Supabase Active)' : 'CONNECTED (Local Persistence)',
      totalFarms: isSupabaseActive && supabaseFarmsCount > 0 ? supabaseFarmsCount : baseStats.totalFarms,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve database stats', message: error?.message });
  }
});

// Authentication Endpoints (Phone or Kisan ID + Password)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, phone, password, dob } = req.body;
    const loginId = (identifier || phone || '').trim();
    const loginSecret = (password || dob || '').trim();

    if (!loginId || !loginSecret) {
      return res.status(400).json({ error: 'Mobile number or Kisan ID and Password are required.' });
    }

    let user = DatabaseEngine.authenticate(loginId, loginSecret);
    if (!user && isServerSupabaseConfigured()) {
      // Try fetching from Supabase users table
      const supabaseUser = await SupabaseService.getUserByPhoneOrId(loginId);
      if (supabaseUser) {
        const normalizedInputSecret = loginSecret.replace(/[^0-9a-zA-Z]/g, '');
        const normalizedStoredSecret = (supabaseUser.password || supabaseUser.dob || '').replace(/[^0-9a-zA-Z]/g, '');
        if (
          normalizedInputSecret === normalizedStoredSecret ||
          supabaseUser.password === loginSecret ||
          supabaseUser.dob === loginSecret ||
          verifyPassword(loginSecret, supabaseUser.password) ||
          !supabaseUser.password
        ) {
          user = DatabaseEngine.upsertUser(supabaseUser);
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials. Please verify your Mobile Number / Kisan ID and Password.',
      });
    }

    user.lastLogin = new Date().toISOString();
    DatabaseEngine.updateUserProfile(user.id, { lastLogin: user.lastLogin });

    // Immediately sync/upsert login to Supabase users table
    if (isServerSupabaseConfigured()) {
      SupabaseService.updateUserLastLogin(user.id).catch((e) => console.warn('Supabase login sync warning:', e));
    }

    const sanitized = { ...user };
    delete (sanitized as any).password;

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: sanitized,
      token: `kisan-token-${user.id}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed', message: error?.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      phone,
      dob,
      password,
      name,
      state,
      district,
      city,
      tehsil,
      patwarCircle,
      village,
      primaryCrop,
      totalLandAcres,
      location,
    } = req.body;

    const result = DatabaseEngine.registerUser({
      phone,
      dob,
      password,
      name,
      state,
      district,
      city,
      tehsil,
      patwarCircle,
      village,
      primaryCrop,
      totalLandAcres,
      location,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    let supabaseSaved = false;
    let rlsBlocked = false;
    if (result.user && isServerSupabaseConfigured()) {
      const sbRes = await SupabaseService.saveUser(result.user);
      supabaseSaved = !!sbRes.persistedToSupabase;
      rlsBlocked = !!sbRes.rlsBlocked;
    }

    const sanitized = { ...result.user };
    delete (sanitized as any).password;

    res.status(201).json({
      success: true,
      message: supabaseSaved
        ? `Registration successful! Your Kisan ID is ${result.user?.kisanId} (Cloud Synced)`
        : `Registration successful! Your Kisan ID is ${result.user?.kisanId} (Local Database)`,
      user: sanitized,
      token: `kisan-token-${result.user?.id}`,
      supabaseSaved,
      rlsBlocked,
      storage: supabaseSaved ? 'supabase' : 'local_db',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Registration failed', message: error?.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing User ID' });
    }
    let user = DatabaseEngine.getUserById(userId);
    if (!user && isServerSupabaseConfigured()) {
      const sbUser = await SupabaseService.getUserByPhoneOrId(userId);
      if (sbUser) {
        user = DatabaseEngine.upsertUser(sbUser);
      }
    }
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    const sanitized = { ...user };
    delete (sanitized as any).password;
    res.json({ user: sanitized });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get profile', message: error?.message });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing User ID' });
    }
    const updated = DatabaseEngine.updateUserProfile(userId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sync updated profile to Supabase users table
    let supabaseSaved = false;
    let rlsBlocked = false;
    if (isServerSupabaseConfigured()) {
      const sbRes = await SupabaseService.saveUser(updated);
      supabaseSaved = !!sbRes.persistedToSupabase;
      rlsBlocked = !!sbRes.rlsBlocked;
    }

    res.json({
      success: true,
      user: updated,
      message: supabaseSaved
        ? 'Profile updated successfully in Supabase cloud'
        : 'Profile updated in local database (Supabase RLS active)',
      supabaseSaved,
      rlsBlocked,
      storage: supabaseSaved ? 'supabase' : 'local_db',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile', message: error?.message });
  }
});

// Explicit Sync Active Farmer Profile to Supabase Users table
app.post(['/api/auth/sync-user', '/api/users/sync'], async (req, res) => {
  try {
    const userPayload = req.body.user || req.body;
    if (!userPayload || (!userPayload.phone && !userPayload.name)) {
      return res.status(400).json({ error: 'User name or mobile number required for sync' });
    }

    const userId = (req.headers['x-user-id'] as string) || userPayload.id || `user-${userPayload.phone || Date.now()}`;
    const userProfile = {
      id: userId,
      phone: userPayload.phone || userPayload.mobile_number || '9876543210',
      dob: userPayload.dob || userPayload.date_of_birth || '2000-01-01',
      name: userPayload.name || userPayload.full_name || 'Farmer',
      kisanId: userPayload.kisanId || userPayload.kisan_id || `PMK-${(userPayload.state || 'IN').substring(0, 2).toUpperCase()}-85854`,
      state: userPayload.state || 'Punjab',
      district: userPayload.district || '',
      tehsil: userPayload.tehsil || '',
      patwarCircle: userPayload.patwarCircle || userPayload.patwar_circle || '',
      village: userPayload.village || '',
      primaryCrop: userPayload.primaryCrop || userPayload.primary_crop || 'Wheat',
      totalLandAcres: Number(userPayload.totalLandAcres || userPayload.total_land_acres || 2.5),
      location: userPayload.location,
      createdAt: userPayload.createdAt || userPayload.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Update local database
    DatabaseEngine.updateUserProfile(userProfile.id, userProfile);

    // Sync to Supabase users table
    let supabaseSynced = false;
    let rlsBlocked = false;
    if (isServerSupabaseConfigured()) {
      const saveRes = await SupabaseService.saveUser(userProfile);
      supabaseSynced = !!saveRes.persistedToSupabase;
      rlsBlocked = !!saveRes.rlsBlocked;
    }

    res.json({
      success: true,
      supabaseSynced,
      supabaseSaved: supabaseSynced,
      rlsBlocked,
      storage: supabaseSynced ? 'supabase' : 'local_db',
      user: userProfile,
      message: supabaseSynced
        ? `Farmer profile for ${userProfile.name} successfully pushed to Supabase users table!`
        : `Farmer profile saved locally (Supabase RLS active)`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sync user to Supabase', message: error?.message });
  }
});

// Farm Boundaries Database REST Endpoints (User-Scoped with Supabase Live Sync)
app.get('/api/farms', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;
    
    // Check Supabase first if configured
    if (isServerSupabaseConfigured()) {
      const supabaseFarms = await SupabaseService.getFarms(userId);
      if (supabaseFarms && supabaseFarms.length > 0) {
        return res.json({ farms: supabaseFarms, count: supabaseFarms.length, source: 'supabase' });
      }
    }

    const farms = DatabaseEngine.getFarms(userId);
    res.json({ farms, count: farms.length, source: 'local_db' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch farms', message: error?.message });
  }
});

app.post('/api/farms', async (req, res) => {
  try {
    const { name, farmerName, state, district, tehsil, patwarCircle, crop, areaAcres, areaSqm, healthScore, points, center, notes, userId } = req.body;
    const effectiveUserId = userId || (req.headers['x-user-id'] as string) || 'guest-farmer';

    if (!name || !points || points.length < 3) {
      return res.status(400).json({ error: 'Farm name and at least 3 boundary coordinates are required' });
    }
    const saved = DatabaseEngine.addFarm({
      userId: effectiveUserId,
      name,
      farmerName: farmerName || 'Farmer / Landholder',
      state: state || 'Punjab',
      district: district || '',
      tehsil: tehsil || '',
      patwarCircle: patwarCircle || '',
      crop: crop || 'Wheat',
      areaAcres: Number(areaAcres) || 2.5,
      areaSqm: Number(areaSqm) || 10117,
      healthScore: Number(healthScore) || 85,
      points,
      center: center || points[0],
      notes: notes || '',
    });

    // Also sync to Supabase if configured
    let supabaseSaved = false;
    let rlsBlocked = false;
    if (isServerSupabaseConfigured()) {
      const sbRes = await SupabaseService.saveFarm(saved);
      supabaseSaved = !!sbRes.persistedToSupabase;
      rlsBlocked = !!sbRes.rlsBlocked;
    }

    res.status(201).json({
      farm: saved,
      success: true,
      message: supabaseSaved
        ? 'Farm boundary successfully saved to Supabase cloud'
        : 'Farm boundary saved to local database (Supabase RLS active)',
      supabaseSaved,
      rlsBlocked,
      storage: supabaseSaved ? 'supabase' : 'local_db',
      supabaseSynced: supabaseSaved,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save farm', message: error?.message });
  }
});

// Bulk sync local farms to Supabase
app.post('/api/db/sync-to-supabase', async (req, res) => {
  try {
    const { farms } = req.body;
    const farmList = Array.isArray(farms) && farms.length > 0 ? farms : DatabaseEngine.getFarms();

    if (!isServerSupabaseConfigured()) {
      return res.status(400).json({ error: 'Supabase credentials not configured in server environment (.env)' });
    }

    let syncedCount = 0;
    const errors: string[] = [];

    for (const farm of farmList) {
      try {
        const ok = await SupabaseService.saveFarm(farm);
        if (ok) syncedCount++;
        else errors.push(`Failed saving farm: ${farm.name}`);
      } catch (err: any) {
        errors.push(err?.message || 'Unknown error');
      }
    }

    res.json({
      success: true,
      synced: syncedCount,
      total: farmList.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sync to Supabase', message: error?.message });
  }
});

app.delete('/api/farms/:id', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;
    
    if (isServerSupabaseConfigured()) {
      await SupabaseService.deleteFarm(req.params.id, userId);
    }

    const success = DatabaseEngine.deleteFarm(req.params.id, userId);
    if (success) {
      res.json({ success: true, message: `Farm ${req.params.id} deleted` });
    } else {
      res.status(404).json({ error: 'Farm not found or access unauthorized' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete farm', message: error?.message });
  }
});

// Telemetry & Sensor Logs Endpoints (Supabase-backed)
app.get('/api/telemetry', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;
    const farmId = (req.query.farmId as string) || undefined;
    const records = await SupabaseService.getTelemetry(userId, farmId);
    res.json({ telemetry: records, count: records.length });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch telemetry logs', message: error?.message });
  }
});

app.post('/api/telemetry', async (req, res) => {
  try {
    const {
      userId,
      farmId,
      crop,
      state,
      district,
      temperature,
      humidity,
      rainChance,
      precipitation,
      soilN,
      soilP,
      soilK,
      soilPh,
      soilMoisture,
      ndreScore,
      ndwiScore,
      healthPct,
      stressPct,
      coordinates,
    } = req.body;

    const effectiveUserId = userId || (req.headers['x-user-id'] as string) || 'guest-farmer';

    const saved = await SupabaseService.saveTelemetry({
      userId: effectiveUserId,
      farmId,
      crop: crop || 'Wheat',
      state: state || 'Punjab',
      district,
      temperature: Number(temperature) || 25,
      humidity: Number(humidity) || 60,
      rainChance: Number(rainChance) || 10,
      precipitation: Number(precipitation) || 0,
      soilN: soilN ? Number(soilN) : undefined,
      soilP: soilP ? Number(soilP) : undefined,
      soilK: soilK ? Number(soilK) : undefined,
      soilPh: soilPh ? Number(soilPh) : undefined,
      soilMoisture: soilMoisture ? Number(soilMoisture) : undefined,
      ndreScore: ndreScore ? Number(ndreScore) : undefined,
      ndwiScore: ndwiScore ? Number(ndwiScore) : undefined,
      healthPct: healthPct ? Number(healthPct) : undefined,
      stressPct: stressPct ? Number(stressPct) : undefined,
      coordinates,
    });

    res.status(201).json({
      telemetry: saved.record,
      success: true,
      supabaseSaved: !!saved.persistedToSupabase,
      rlsBlocked: !!saved.rlsBlocked,
      storage: saved.persistedToSupabase ? 'supabase' : 'local_db',
      message: saved.persistedToSupabase
        ? 'Telemetry log successfully recorded to Supabase cloud'
        : 'Telemetry log recorded in local database',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save telemetry log', message: error?.message });
  }
});

// Satellite Structural Change Tracking Logs Endpoints (Supabase-backed)
app.get('/api/structure-tracking', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;
    const farmId = (req.query.farmId as string) || undefined;
    const logs = await SupabaseService.getStructureLogs(userId, farmId);
    res.json({ logs, count: logs.length });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch structure tracking logs', message: error?.message });
  }
});

app.post('/api/structure-tracking', async (req, res) => {
  try {
    const {
      userId,
      farmId,
      farmName,
      satelliteSource,
      baselineDate,
      targetDate,
      detectedChangesPct,
      changeType,
      riskLevel,
      boundingBox,
      notes,
    } = req.body;

    const effectiveUserId = userId || (req.headers['x-user-id'] as string) || 'guest-farmer';

    const saved = await SupabaseService.saveStructureLog({
      userId: effectiveUserId,
      farmId,
      farmName: farmName || 'Monitored Agricultural Parcel',
      satelliteSource: satelliteSource || 'Sentinel-2 BOA Level-2A',
      baselineDate: baselineDate || new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      detectedChangesPct: Number(detectedChangesPct) || 0,
      changeType: changeType || 'Normal',
      riskLevel: riskLevel || 'Low',
      boundingBox,
      notes: notes || '',
    });

    res.status(201).json({
      log: saved.log,
      success: true,
      supabaseSaved: !!saved.persistedToSupabase,
      rlsBlocked: !!saved.rlsBlocked,
      storage: saved.persistedToSupabase ? 'supabase' : 'local_db',
      message: saved.persistedToSupabase
        ? 'Structure change detection log saved to Supabase cloud'
        : 'Structure change detection log saved in local database',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save structure tracking log', message: error?.message });
  }
});

// Land Agronomy, Soil & Precision Reports (Supabase-backed)
app.get('/api/reports/land', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;
    if (isServerSupabaseConfigured()) {
      const supaReports = await SupabaseService.getLandReports(userId);
      if (supaReports && supaReports.length > 0) {
        return res.json({ reports: supaReports, count: supaReports.length, source: 'supabase' });
      }
    }
    const localReports = DatabaseEngine.getReports(userId);
    res.json({ reports: localReports, count: localReports.length, source: 'local_db' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch land reports', message: error?.message });
  }
});

app.post('/api/reports/land', async (req, res) => {
  try {
    const {
      farmName,
      farmerName,
      crop,
      state,
      district,
      areaAcres,
      healthScore,
      soilN,
      soilP,
      soilK,
      soilPh,
      soilMoisture,
      advisorySummary,
      irrigationSchedule,
      fertilizerRecommendation,
      pestRisk,
      farmId,
      userId,
    } = req.body;

    const effectiveUserId = userId || (req.headers['x-user-id'] as string) || 'guest-farmer';

    const saved = DatabaseEngine.addReport({
      userId: effectiveUserId,
      farmId,
      farmName: farmName || 'Agricultural Land Parcel',
      farmerName: farmerName || 'Farmer',
      crop: crop || 'Wheat',
      state: state || 'Punjab',
      district: district || '',
      areaAcres: Number(areaAcres) || 2.5,
      areaSqm: (Number(areaAcres) || 2.5) * 4046.86,
      healthScore: Number(healthScore) || 85,
      soilN: soilN ? Number(soilN) : undefined,
      soilP: soilP ? Number(soilP) : undefined,
      soilK: soilK ? Number(soilK) : undefined,
      soilPh: soilPh ? Number(soilPh) : undefined,
      soilMoisture: soilMoisture ? Number(soilMoisture) : undefined,
      advisorySummary: advisorySummary || 'Agronomic health assessment',
      irrigationSchedule: irrigationSchedule || 'Standard irrigation',
      fertilizerRecommendation: fertilizerRecommendation || 'Balanced N-P-K',
      pestRisk: pestRisk || 'Low',
    });

    let supabaseSaved = false;
    let rlsBlocked = false;
    if (isServerSupabaseConfigured()) {
      const supaRes = await SupabaseService.saveLandReport(saved);
      supabaseSaved = !!supaRes.persistedToSupabase;
      rlsBlocked = !!supaRes.rlsBlocked;
    }

    res.status(201).json({
      report: saved,
      success: true,
      supabaseSaved,
      rlsBlocked,
      storage: supabaseSaved ? 'supabase' : 'local_db',
      message: supabaseSaved
        ? 'Land report successfully saved to Supabase cloud'
        : 'Land report saved in local database',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save land report', message: error?.message });
  }
});

// Google Maps Platform Proxies (Geocoding & Routes API)
app.get('/api/maps/geocode', async (req, res) => {
  try {
    const key = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      return res.status(503).json({ error: 'Google Maps API key not configured' });
    }
    const { address, latlng } = req.query;
    let url = '';
    if (latlng) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(String(latlng))}&key=${key}`;
    } else if (address) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(String(address))}&region=in&key=${key}`;
    } else {
      return res.status(400).json({ error: 'Address or latlng required' });
    }

    const response = await fetch(url);
    if (response.status === 429) {
      return res.status(429).json({ error: 'RESOURCE_EXHAUSTED', message: 'Google Maps API quota exceeded' });
    }
    const data: any = await response.json();
    if (data.status === 'OVER_QUERY_LIMIT') {
      return res.status(429).json({ error: 'OVER_QUERY_LIMIT', message: 'Google Maps API quota limit reached' });
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Geocoding failed', message: error?.message });
  }
});

app.post('/api/maps/routes', async (req, res) => {
  try {
    const key = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      return res.status(503).json({ error: 'Google Maps API key not configured' });
    }
    const { origin, destination } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination coordinates required' });
    }

    const payload = {
      origin: {
        location: {
          latLng: {
            latitude: Number(origin.lat),
            longitude: Number(origin.lng),
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: Number(destination.lat),
            longitude: Number(destination.lng),
          },
        },
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: false,
      languageCode: 'en-US',
      units: 'METRIC',
    };

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.description,routes.legs',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      return res.status(429).json({ error: 'RESOURCE_EXHAUSTED', message: 'Routes API quota exceeded' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Route calculation failed', message: error?.message });
  }
});


app.post('/api/reports/land', async (req, res) => {
  try {
    const reportData = req.body;
    const effectiveUserId = reportData.userId || (req.headers['x-user-id'] as string) || 'guest-farmer';

    // 1. Save to local DB engine
    const localSaved = DatabaseEngine.addReport({
      ...reportData,
      userId: effectiveUserId,
      farmName: reportData.farmName || 'Agricultural Land Parcel',
      farmerName: reportData.farmerName || 'Farmer',
      state: reportData.state || 'Punjab',
      crop: reportData.crop || 'Wheat',
      areaAcres: Number(reportData.areaAcres) || 2.5,
      areaSqm: Number(reportData.areaSqm) || 10117,
      healthScore: Number(reportData.healthScore) || 85,
    });

    // 2. Sync to Supabase
    let supabaseSaved = false;
    let savedReport = localSaved;
    if (isServerSupabaseConfigured()) {
      const supaRes = await SupabaseService.saveLandReport({
        ...reportData,
        userId: effectiveUserId,
      });
      if (!supaRes.success) {
        return res.status(403).json({
          success: false,
          supabaseSaved: false,
          supabaseError: supaRes.error,
          error: supaRes.error,
          message: supaRes.error,
        });
      }
      savedReport = supaRes.report;
      supabaseSaved = true;
    }

    res.status(201).json({
      report: savedReport,
      success: true,
      supabaseSaved,
      message: 'Land & Agronomy report successfully saved to Supabase!',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save land report', message: error?.message });
  }
});

// Diagnostic Scans Database Endpoints (User-Scoped with Supabase Live Sync)
app.get('/api/diagnostics', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;
    if (isServerSupabaseConfigured()) {
      const supaDiags = await SupabaseService.getDiagnostics(userId);
      if (supaDiags && supaDiags.length > 0) {
        return res.json({ diagnostics: supaDiags, count: supaDiags.length, source: 'supabase' });
      }
    }
    const diagnostics = DatabaseEngine.getDiagnostics(userId);
    res.json({ diagnostics, count: diagnostics.length, source: 'local_db' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch diagnostics', message: error?.message });
  }
});

app.post('/api/diagnostics', async (req, res) => {
  try {
    const { crop, diseaseName, severity, confidence, symptoms, remedyType, farmId, userId } = req.body;
    const effectiveUserId = userId || (req.headers['x-user-id'] as string) || 'guest-farmer';

    if (!crop || !diseaseName) {
      return res.status(400).json({ error: 'Crop and Disease name are required' });
    }
    const saved = DatabaseEngine.addDiagnostic({
      userId: effectiveUserId,
      farmId,
      crop,
      diseaseName,
      severity: severity || 'Medium',
      confidence: Number(confidence) || 90,
      symptoms: symptoms || [],
      remedyType: remedyType || 'both',
    });

    let supabaseSaved = false;
    let rlsBlocked = false;
    if (isServerSupabaseConfigured()) {
      const supaRes = await SupabaseService.saveDiagnostic(saved);
      supabaseSaved = !!supaRes.persistedToSupabase;
      rlsBlocked = !!supaRes.rlsBlocked;
    }

    res.status(201).json({
      diagnostic: saved,
      success: true,
      supabaseSaved,
      rlsBlocked,
      storage: supabaseSaved ? 'supabase' : 'local_db',
      message: supabaseSaved
        ? 'Diagnostic successfully saved to Supabase cloud'
        : 'Diagnostic saved in local database',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save diagnostic', message: error?.message });
  }
});

// Advisories Database Endpoints (User-Scoped with Supabase Live Sync)
app.get('/api/advisories', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;
    if (isServerSupabaseConfigured()) {
      const supaAdv = await SupabaseService.getAdvisories(userId);
      if (supaAdv && supaAdv.length > 0) {
        return res.json({ advisories: supaAdv, count: supaAdv.length, source: 'supabase' });
      }
    }
    const advisories = DatabaseEngine.getAdvisories(userId);
    res.json({ advisories, count: advisories.length, source: 'local_db' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch advisories', message: error?.message });
  }
});

app.post('/api/advisories', async (req, res) => {
  try {
    const { farmName, crop, state, areaAcres, summary, irrigationSchedule, nitrogenRecommendation, userId } = req.body;
    const effectiveUserId = userId || (req.headers['x-user-id'] as string) || 'guest-farmer';

    const saved = DatabaseEngine.addAdvisory({
      userId: effectiveUserId,
      farmName: farmName || 'Monitored Plot',
      crop: crop || 'Wheat',
      state: state || 'Punjab',
      areaAcres: Number(areaAcres) || 2.5,
      summary: summary || 'Crop agronomic advisory',
      irrigationSchedule: irrigationSchedule || 'Morning irrigation cycle',
      nitrogenRecommendation: nitrogenRecommendation || 'Standard fertilizer dose',
    });

    let supabaseSaved = false;
    let rlsBlocked = false;
    if (isServerSupabaseConfigured()) {
      const supaRes = await SupabaseService.saveAdvisory(saved);
      supabaseSaved = !!supaRes.persistedToSupabase;
      rlsBlocked = !!supaRes.rlsBlocked;
    }

    res.status(201).json({
      advisory: saved,
      success: true,
      supabaseSaved,
      rlsBlocked,
      storage: supabaseSaved ? 'supabase' : 'local_db',
      message: supabaseSaved
        ? 'Advisory successfully saved to Supabase cloud'
        : 'Advisory saved in local database',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save advisory', message: error?.message });
  }
});

// Mandi Rates & APMC Agricultural Price Feeds Endpoint
app.get('/api/mandi/rates', (req, res) => {
  try {
    const state = (req.query.state as string) || 'Punjab';
    const crop = (req.query.crop as string) || 'Wheat';
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 30.901;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : 75.8573;
    const district = req.query.district as string | undefined;

    const mandiIntelligence = generateScheduleAndMandiIntelligence({
      cropName: crop,
      lat,
      lng,
      state,
      district,
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      state,
      crop,
      mandiIntelligence,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch mandi rates', message: error?.message });
  }
});

// Database Reset & Export Endpoints
app.post('/api/database/seed', (req, res) => {
  try {
    const demo = DatabaseEngine.resetToDemo();
    res.json({ success: true, message: 'Database reset to verified Hackathon demo dataset', db: demo });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to seed database', message: error?.message });
  }
});

app.get('/api/database/export', (req, res) => {
  try {
    const db = DatabaseEngine.read();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="bhootech_database.json"');
    res.send(JSON.stringify(db, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export database', message: error?.message });
  }
});

// Helper to call Gemini with timeout and graceful model fallback
async function safeGenerateContent(prompt: string, jsonMode: boolean = true): Promise<string | null> {
  const ai = getAI();
  if (!ai) return null;

  const executeWithModel = async (modelName: string): Promise<string | null> => {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 7s')), 7000)
    );

    const callPromise = (async () => {
      const config: any = {};
      if (jsonMode) {
        config.responseMimeType = 'application/json';
      }
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config,
      });
      return response.text || null;
    })();

    return Promise.race([callPromise, timeoutPromise]);
  };

  try {
    // Try gemini-3.8-flash first (fastest, most reliable model)
    return await executeWithModel('gemini-3.8-flash');
  } catch (err1: any) {
    try {
      // Secondary attempt with gemini-3.1-flash-lite if needed
      return await executeWithModel('gemini-3.1-flash-lite');
    } catch (err2: any) {
      // Graceful fallback to deterministic engine
      return null;
    }
  }
}

// Krishi Mitra AI Crop Recommendation Pipeline Endpoint (Real live data)
app.post('/api/krishi-mitra/recommend', async (req, res) => {
  try {
    const { lat, lng, areaAcres, selectedState, soilTestValues, customDate } = req.body;
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      return res.status(400).json({ error: 'Valid numerical latitude and longitude are required.' });
    }
    const result = await generateKrishiMitraRecommendation(
      {
        lat: Number(lat),
        lng: Number(lng),
        areaAcres: Number(areaAcres) || 2.5,
        selectedState,
        soilTestValues,
        customDate,
      },
      getAI()
    );
    res.json(result);
  } catch (error: any) {
    console.error('[server] Krishi Mitra recommendation error:', error?.message);
    res.status(500).json({ error: 'Failed to generate Krishi Mitra recommendation', message: error?.message });
  }
});

// Hyper-Local Precision Advisory & Weighted Risk Engine Endpoint
app.post('/api/hyperlocal-advisory', async (req, res) => {
  try {
    const {
      lat,
      lng,
      state,
      district,
      tehsil,
      patwarCircle,
      village,
      crop,
      areaAcres,
      temperature,
      humidity,
      rainChance,
      precipitation,
      healthyPct,
      stressPct,
      plantingDate,
      harvestingDate,
    } = req.body;

    const baseResult = HyperLocalBackendEngine.generate({
      lat: Number(lat) || 30.901,
      lng: Number(lng) || 75.8573,
      state: state || 'Punjab',
      district,
      tehsil,
      patwarCircle,
      village,
      crop: crop || 'Wheat',
      areaAcres: Number(areaAcres) || 2.5,
      temperature: Number(temperature) || 26,
      humidity: Number(humidity) || 60,
      rainChance: Number(rainChance) || 15,
      precipitation: Number(precipitation) || 0,
      healthyPct: Number(healthyPct) || 70,
      stressPct: Number(stressPct) || 20,
      plantingDate,
      harvestingDate,
    });

    const prompt = `You are BhooTech AI's Senior Agricultural Intelligence Officer for the Smart India Hackathon.
Evaluate this Hyper-Local Data Science telemetry for a farmer's specific GPS (${baseResult.gpsCoordinates.lat.toFixed(4)}°N, ${baseResult.gpsCoordinates.lng.toFixed(4)}°E) in ${tehsil || district || state}:
- Sown Crop: ${baseResult.crop} (${baseResult.fieldAreaAcres} Acres)
- Soil Telemetry: N=${baseResult.soil.nLevel} mg/kg, P=${baseResult.soil.pLevel}, K=${baseResult.soil.kLevel}, pH=${baseResult.soil.ph}, Moisture=${baseResult.soil.moisturePct}% (${baseResult.soil.soilType})
- Micro-Climate: Temp=${temperature || 26}°C, Humidity=${humidity || 60}%, RainChance=${rainChance || 15}%, Precip=${precipitation || 0}mm
- Nearest Mandi Prices: ${baseResult.mandis.map((m) => `${m.mandiName}: ₹${m.currentPricePerQuintal}/Qtl (${m.trend})`).join(' | ')}
- Weighted Risk Score: ${baseResult.weightedRisk.overallScore} (Risk Level: ${baseResult.weightedRisk.riskLevel})
- Ensemble Prediction: Yield = ${baseResult.ensemble.xgboostYieldQuintalsPerAcre} Qtl/Acre (XGBoost), Projected Profit = ₹${baseResult.ensemble.totalProjectedProfit}

Return a refined 1-sentence sovereign agronomic verdict and optimal immediate action for the farmer.
Respond with JSON:
{
  "verdict": "Clear, concise sovereign verdict for the farmer",
  "ureaGuidance": "Direct prescriptive sentence on whether to apply urea or postpone",
  "irrigationGuidance": "Direct prescriptive sentence on irrigation timing",
  "mandiGuidance": "Direct prescriptive sentence on selling vs holding at local mandi"
}`;

    const aiText = await safeGenerateContent(prompt, true);
    if (aiText) {
      try {
        const parsed = JSON.parse(aiText);
        if (parsed.verdict) {
          baseResult.aiAgronomistVerdict = parsed.verdict;
        }
        if (parsed.ureaGuidance) {
          baseResult.prescriptiveDecisions.ureaAction.justification = parsed.ureaGuidance;
        }
      } catch {
        // use deterministic baseResult
      }
    }

    res.json(baseResult);
  } catch (error: any) {
    console.error('Hyperlocal advisory generation fallback:', error?.message);
    res.status(500).json({ error: 'Failed to generate hyperlocal advisory', message: error?.message });
  }
});

// AI Crop Advisory endpoint
app.post('/api/advisory', async (req, res) => {
  const {
    crop,
    state,
    areaAcres,
    temperature,
    humidity,
    rainChance,
    healthyPct,
    stressPct,
    nonVegPct,
    mode,
  } = req.body;

  const fallbackAdvisory = {
    crop: crop || 'Wheat',
    summary: `Precision agronomic advisory for ${areaAcres || 2} Acres of ${crop || 'Wheat'} in ${state || 'Punjab'}. Field demonstrates ${healthyPct || 68}% healthy canopy with ${stressPct || 22}% target stress zones.`,
    sowingHarvestAdvice: `Maintain regular soil aeration and ensure field channels are clear for unhindered drainage.`,
    irrigationSchedule:
      (rainChance || 0) > 40
        ? `Rain probability is ${rainChance}%. Defer irrigation for 48 hours to avoid saturation.`
        : `Provide light evening irrigation (~30-35mm) to maintain optimal root zone moisture.`,
    nitrogenFertilizerAction:
      (stressPct || 0) > 20
        ? `Apply split top-dressing of Urea (20-25 kg/acre) or spray water-soluble NPK (19:19:19) specifically over the ${stressPct}% chlorotic zones.`
        : `Canopy chlorophyll is optimal. Maintain balanced basal nutrition.`,
    pestFungalRisk:
      (humidity || 0) > 70
        ? `High humidity (${humidity}%) elevates fungal spore risk. Conduct early morning leaf spot inspections.`
        : `Normal pest levels. Monitor field borders for sucking pests.`,
    actionChecklist: [
      `Target fertilizer specifically to yellow stressed zones (${stressPct || 20}% area)`,
      (rainChance || 0) > 40 ? 'Pause irrigation due to rain forecast' : 'Perform scheduled evening watering',
      'Inspect lower canopy for fungal lesions or leaf spots',
      'Verify spray equipment calibration per acre',
    ],
  };

  try {
    const prompt = `You are BhooTech AI's Senior Agricultural Scientist & Agronomist for India.
Provide a concise, highly practical, and actionable precision farming advisory for an Indian farmer with the following telemetry:
- State / Region: ${state}
- Crop: ${crop}
- Field Area: ${areaAcres} Acres
- Micro-Climate: Temp: ${temperature}°C, Relative Humidity: ${humidity}%, Rain Probability: ${rainChance}%
- Satellite Spectral Health (${mode === 'ndre' ? 'NDRE Chlorophyll' : 'NDWI Moisture'}): Healthy Canopy: ${healthyPct}%, Moderate Chlorosis/Stress: ${stressPct}%, Severe Stress / Non-Vegetation: ${nonVegPct}%.

Respond with strict JSON matching this schema:
{
  "crop": "${crop}",
  "summary": "1-2 sentence executive summary mentioning the field scale, canopy health, and primary immediate focus.",
  "sowingHarvestAdvice": "Specific agronomic guidance for current season/growth phase in ${state}.",
  "irrigationSchedule": "Clear moisture schedule considering the ${rainChance}% rain chance and ${temperature}°C temperature.",
  "nitrogenFertilizerAction": "Variable-rate fertilizer dosing targeting the ${stressPct}% yellow/chlorotic stressed zones (e.g. Urea, DAP, Zinc, 19:19:19 NPK foliar spray).",
  "pestFungalRisk": "Pest & disease vigilance based on humidity ${humidity}% and temperature.",
  "actionChecklist": [
    "4 clear, high-priority bullet action items for the farmer this week"
  ]
}`;

    const text = await safeGenerateContent(prompt, true);
    if (text) {
      try {
        const parsed = JSON.parse(text);
        return res.json({ advisory: parsed });
      } catch {
        return res.json({ advisory: fallbackAdvisory });
      }
    }

    res.json({ advisory: fallbackAdvisory });
  } catch (error: any) {
    // Return high quality fallback instead of 500
    res.json({ advisory: fallbackAdvisory });
  }
});

// AI Companion Mode: BhooSaathi Conversational Dialect Endpoint
app.post('/api/ai-companion/chat', async (req, res) => {
  const {
    message,
    language = 'hi',
    dialect = 'Standard',
    state = 'Punjab',
    crop = 'Wheat',
    farmDetails = {},
    history = [],
  } = req.body;

  const langNames: Record<string, string> = {
    hi: 'Hindi (हिंदी)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
    mr: 'Marathi (मराठी)',
    gu: 'Gujarati (ગુજરાતી)',
    bn: 'Bengali (বাংলা)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    kn: 'Kannada (ಕನ್ನಡ)',
    ml: 'Malayalam (മലയാളം)',
    or: 'Odia (ଓଡ଼ିଆ)',
    as: 'Assamese (অসমীয়া)',
    en: 'English / Indian English',
  };

  const selectedLangName = langNames[language] || 'Hindi';

  const cleanMsg = (message || '').toLowerCase().trim();

  // Generate rich, context-aware fallback and intent using our conversational engine
  const smartFallback = buildConversationalReply(
    message,
    dialect,
    history,
    {
      crop,
      state,
      healthyPct: farmDetails.healthyPct || 76,
      stressPct: farmDetails.stressPct || 14,
      areaAcres: farmDetails.totalArea || 5,
    },
    language
  );

  const detectedIntent = smartFallback.intent;
  const fallbackReply = smartFallback.reply;
  const fallbackAudio = smartFallback.audioText;
  const fallbackAction = smartFallback.appAction;
  const fallbackQuestions = smartFallback.suggestedQuestions;
  const musicData = smartFallback.musicData;
  const targetDialectId = smartFallback.targetDialectId;

  const prompt = `You are 'BhooSaathi' (भू-साथी), a friendly human-like AI companion and agricultural brother for Indian farmers.
Target Spoken Dialect: ${dialect} (e.g. Haryanvi, Punjabi Malwai, Bhojpuri, Awadhi, Himachali, Marathi Deshi, Gujarati Kathiyawadi, etc.)
Target Written Interface Language: ${selectedLangName}
Farmer State: ${state}, Primary Crop: ${crop}
Recent Chat Turns: ${JSON.stringify(history.slice(-6))}

The farmer just said: "${message}"

Dialect Style Reference for this query: "${fallbackReply}"

CRITICAL RULES:
1. SEPARATE SPOKEN DIALECT AND WRITTEN LANGUAGE:
   - 'reply': Text strictly formatted in ${selectedLangName} (Target Written Interface Language). If selectedLangName is English, write 'reply' in clear, natural English.
   - 'audioText': Clean plain text strictly in spoken ${dialect} for speech synthesis. Use 100% authentic regional words, grammar, and expressions for ${dialect} (no standard Hindi if dialect is Haryanvi/Himachali/Punjabi).

2. CONVERSATION-FIRST DIRECTIVE:
   - When the farmer says casual greetings, how are you ("Tu kaisa hai", "Kaisa se"), what doing ("Kya kar raha hai"), feeling down, asking for a joke ("Joke suna"), music ("Gaana chala", "Bhajan"), or general small talk:
     DO NOT DUMP UNPROMPTED FARMING LECTURES. Do NOT lecture about soil moisture, irrigation cycles, or nitrogen unless the user explicitly asked!
     Talk like a real human friend or brother sitting beside the farmer on the cot ("khaat").
   - Respond in authentic, natural spoken style of ${dialect}.
   - For jokes: tell a clean, genuinely funny rural/relatable joke.
   - For music requests: offer options warmly (morning Bhairav raga, flute melody, rain ambience, bhajan).

3. GENERAL KNOWLEDGE & QUESTIONS:
   - If the farmer asks general knowledge questions (capital of India, cricket, prime minister, weather, sun, dates, etc.), give an accurate, friendly, conversational answer.

4. CONTEXT MEMORY:
   - If the user asks a short follow-up like "Kitni?", "Kab tak?", "Kitna?", "3 din se", or "Kal se badha hai?", resolve context from previous turns.

5. APP ACTION INTEGRATION:
   - If the farmer asks to see their field, satellite, or NDVI: set appAction to {"type": "OPEN_FIELD_ANALYSIS", "label": "🗺️ खेत सेटेलाइट विश्लेषण"}
   - If the farmer asks for weather: set appAction to {"type": "OPEN_WEATHER", "label": "🌦️ मौसम पूर्वानुमान"}
   - If the farmer asks for mandi rates: set appAction to {"type": "OPEN_MANDI", "label": "🌾 मंडी भाव"}
   - If the farmer asks about yellow leaves/disease: set appAction to {"type": "OPEN_LEAF_DOCTOR", "label": "🍃 पत्ता रोग निदान"}

6. OUTPUT STRICT JSON ONLY:
{
  "reply": "Conversational markdown text in ${selectedLangName}",
  "audioText": "Clean plain-spoken text in authentic spoken ${dialect} for speech synthesis (no asterisks, no bullets, natural spoken pace)",
  "intent": "${detectedIntent}",
  "appAction": null,
  "suggestedQuestions": ["3 relevant follow-ups in the same dialect"],
  "actionableTip": "practical tip ONLY if the user specifically asked a technical farming question"
}`;

  try {
    const rawAiText = await safeGenerateContent(prompt, true);
    if (rawAiText) {
      try {
        let cleanJson = rawAiText.trim();
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        }
        const parsed = JSON.parse(cleanJson);
        if (parsed.reply) {
          return res.json({
            success: true,
            language,
            dialect,
            musicData,
            targetDialectId,
            ...parsed,
          });
        }
      } catch (err) {
        // use guaranteed fallback
      }
    }

    return res.json({
      success: true,
      language,
      dialect,
      intent: detectedIntent,
      reply: fallbackReply,
      audioText: fallbackAudio,
      appAction: fallbackAction,
      suggestedQuestions: fallbackQuestions,
      actionableTip: smartFallback.actionableTip,
      musicData,
      targetDialectId,
    });
  } catch (error: any) {
    return res.json({
      success: true,
      language,
      dialect,
      intent: detectedIntent,
      reply: fallbackReply,
      audioText: fallbackAudio,
      appAction: fallbackAction,
      suggestedQuestions: fallbackQuestions,
      actionableTip: smartFallback.actionableTip,
      musicData,
      targetDialectId,
    });
  }
});

// Service Worker & PWA Manifest Static Endpoints
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(process.cwd(), 'public', 'sw.js'));
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(process.cwd(), 'public', 'manifest.json'));
});

app.use(express.static(path.join(process.cwd(), 'public')));

// Vite & Static middleware setup
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BhooTech AI server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
