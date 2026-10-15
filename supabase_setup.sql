-- ==============================================================================
-- BHOOTECH / KRISHI MITRA — SUPABASE UNIFIED DATABASE SETUP & MIGRATION
-- ==============================================================================
-- This script sets up all required tables, columns, indexes, and Row-Level Security (RLS)
-- policies to enable data persistence for:
--   1. public.users (Farmer Profiles)
--   2. public.user_lands (Farms / Land Parcels)
--   3. public.field_reports (Crop & Soil Telemetry)
--   4. public.structure_tracking_logs (Satellite Structure Change Monitoring)
--   5. public.land_reports (Detailed Agronomic & Land Health Reports)
--   6. public.advisories (Farmer Actionable Advisories)
--   7. public.diagnostic_logs (AI Crop Disease Diagnostic Logs)
--   8. public.devices (IoT Soil-Sensor Stations & Hardware Stations)
--   9. public.sensor_readings (Multi-depth Soil Moisture & Temperature Readings)
--  10. public.commands (Irrigation Solenoid Valve Control Commands)
--  11. public.irrigation_logs (Irrigation Execution Logs & Litres Tracking)
--  12. public.alerts (Moisture & Frost Alerts)
--
-- INSTRUCTIONS FOR USER:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/qsazwzznyngpiunbbbfr
-- 2. Click "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste this entire script, and click "RUN".
-- 4. Once executed, Row Level Security will permit both your web app (anon/publishable key)
--    and server-side operations to seamlessly read and write data.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABLE: public.users (Farmer Profiles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL DEFAULT 'Farmer',
    mobile_number TEXT UNIQUE,
    dob TEXT,
    password TEXT,
    kisan_id TEXT UNIQUE,
    state TEXT DEFAULT 'Punjab',
    district TEXT,
    city TEXT,
    tehsil TEXT,
    patwar_circle TEXT,
    village TEXT,
    primary_crop TEXT DEFAULT 'Wheat',
    total_land_acres NUMERIC DEFAULT 2.5,
    location JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure missing columns are added if the table already existed
DO $$
BEGIN
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT 'Farmer';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mobile_number TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kisan_id TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Punjab';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS district TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tehsil TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS patwar_circle TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS village TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS primary_crop TEXT DEFAULT 'Wheat';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_land_acres NUMERIC DEFAULT 2.5;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location JSONB;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_mobile ON public.users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_kisan_id ON public.users(kisan_id);

-- ------------------------------------------------------------------------------
-- 2. TABLE: public.user_lands (Farm / Land Information)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_lands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL DEFAULT 'Farm Plot',
    farmer_name TEXT DEFAULT 'Farmer',
    state TEXT DEFAULT 'Punjab',
    district TEXT,
    tehsil TEXT,
    patwar_circle TEXT,
    crop TEXT DEFAULT 'Wheat',
    area_acres NUMERIC DEFAULT 2.5,
    area_sqm NUMERIC DEFAULT 10117,
    health_score NUMERIC DEFAULT 85,
    points JSONB DEFAULT '[]'::jsonb,
    center JSONB DEFAULT '{"lat": 31.634, "lng": 74.8723}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Farm Plot';
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS farmer_name TEXT DEFAULT 'Farmer';
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Punjab';
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS district TEXT;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS tehsil TEXT;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS patwar_circle TEXT;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS crop TEXT DEFAULT 'Wheat';
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS area_acres NUMERIC DEFAULT 2.5;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS area_sqm NUMERIC DEFAULT 10117;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS health_score NUMERIC DEFAULT 85;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS points JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS center JSONB DEFAULT '{"lat": 31.634, "lng": 74.8723}'::jsonb;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.user_lands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_lands_user_id ON public.user_lands(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lands_created_at ON public.user_lands(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. TABLE: public.field_reports (Crop & Soil Telemetry)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.field_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    farm_id UUID REFERENCES public.user_lands(id) ON DELETE SET NULL,
    crop TEXT DEFAULT 'Wheat',
    state TEXT,
    district TEXT,
    temperature NUMERIC,
    humidity NUMERIC,
    rain_chance NUMERIC,
    precipitation NUMERIC,
    soil_n NUMERIC,
    soil_p NUMERIC,
    soil_k NUMERIC,
    soil_ph NUMERIC,
    soil_moisture NUMERIC,
    ndre_score NUMERIC,
    ndwi_score NUMERIC,
    health_pct NUMERIC,
    stress_pct NUMERIC,
    coordinates JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES public.user_lands(id) ON DELETE SET NULL;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS crop TEXT;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS district TEXT;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS temperature NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS humidity NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS rain_chance NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS precipitation NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS soil_n NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS soil_p NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS soil_k NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS soil_ph NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS soil_moisture NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS ndre_score NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS ndwi_score NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS health_pct NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS stress_pct NUMERIC;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS coordinates JSONB;
    ALTER TABLE public.field_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_field_reports_user ON public.field_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_field_reports_created ON public.field_reports(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. TABLE: public.structure_tracking_logs (Satellite Structure Change Monitoring)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.structure_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    farm_id UUID REFERENCES public.user_lands(id) ON DELETE SET NULL,
    farm_name TEXT NOT NULL,
    satellite_source TEXT DEFAULT 'Sentinel-2 BOA Level-2A',
    baseline_date TEXT,
    target_date TEXT,
    detected_changes_pct NUMERIC DEFAULT 0,
    change_type TEXT DEFAULT 'Vegetation Transition',
    risk_level TEXT DEFAULT 'Low',
    bounding_box JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES public.user_lands(id) ON DELETE SET NULL;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS farm_name TEXT;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS satellite_source TEXT DEFAULT 'Sentinel-2 BOA Level-2A';
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS baseline_date TEXT;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS target_date TEXT;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS detected_changes_pct NUMERIC DEFAULT 0;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS change_type TEXT;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS risk_level TEXT;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS bounding_box JSONB;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE public.structure_tracking_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_structure_logs_user ON public.structure_tracking_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_structure_logs_created ON public.structure_tracking_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. TABLE: public.land_reports (Detailed Land & Agronomic Reports)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.land_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    land_id UUID REFERENCES public.user_lands(id) ON DELETE SET NULL,
    farm_name TEXT NOT NULL DEFAULT 'Agricultural Land Parcel',
    farmer_name TEXT DEFAULT 'Farmer',
    crop TEXT DEFAULT 'Wheat',
    state TEXT DEFAULT 'Punjab',
    district TEXT,
    area_acres NUMERIC DEFAULT 2.5,
    health_score NUMERIC DEFAULT 85,
    soil_n NUMERIC,
    soil_p NUMERIC,
    soil_k NUMERIC,
    soil_ph NUMERIC,
    soil_moisture NUMERIC,
    advisory_summary TEXT,
    irrigation_schedule TEXT,
    fertilizer_recommendation TEXT,
    pest_risk TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS land_id UUID REFERENCES public.user_lands(id) ON DELETE SET NULL;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS farm_name TEXT;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS farmer_name TEXT;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS crop TEXT;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS district TEXT;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS area_acres NUMERIC;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS health_score NUMERIC;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS soil_n NUMERIC;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS soil_p NUMERIC;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS soil_k NUMERIC;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS soil_ph NUMERIC;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS soil_moisture NUMERIC;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS advisory_summary TEXT;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS irrigation_schedule TEXT;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS fertilizer_recommendation TEXT;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS pest_risk TEXT;
    ALTER TABLE public.land_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_land_reports_user ON public.land_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_land_reports_created ON public.land_reports(created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. TABLE: public.advisories (Farmer Advisories)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    farm_name TEXT DEFAULT 'Field Parcel',
    crop TEXT DEFAULT 'Wheat',
    state TEXT DEFAULT 'Punjab',
    area_acres NUMERIC DEFAULT 2.5,
    summary TEXT NOT NULL,
    irrigation_schedule TEXT,
    nitrogen_recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.advisories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
    ALTER TABLE public.advisories ADD COLUMN IF NOT EXISTS farm_name TEXT;
    ALTER TABLE public.advisories ADD COLUMN IF NOT EXISTS crop TEXT;
    ALTER TABLE public.advisories ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE public.advisories ADD COLUMN IF NOT EXISTS area_acres NUMERIC;
    ALTER TABLE public.advisories ADD COLUMN IF NOT EXISTS summary TEXT;
    ALTER TABLE public.advisories ADD COLUMN IF NOT EXISTS irrigation_schedule TEXT;
    ALTER TABLE public.advisories ADD COLUMN IF NOT EXISTS nitrogen_recommendation TEXT;
    ALTER TABLE public.advisories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_advisories_user ON public.advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_advisories_created ON public.advisories(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. TABLE: public.diagnostic_logs (AI Crop / Disease Diagnostics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnostic_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    farm_id UUID REFERENCES public.user_lands(id) ON DELETE SET NULL,
    crop TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Moderate',
    confidence NUMERIC DEFAULT 85,
    symptoms JSONB DEFAULT '[]'::jsonb,
    remedy_type TEXT DEFAULT 'both',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.diagnostic_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
    ALTER TABLE public.diagnostic_logs ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES public.user_lands(id) ON DELETE SET NULL;
    ALTER TABLE public.diagnostic_logs ADD COLUMN IF NOT EXISTS crop TEXT;
    ALTER TABLE public.diagnostic_logs ADD COLUMN IF NOT EXISTS disease_name TEXT;
    ALTER TABLE public.diagnostic_logs ADD COLUMN IF NOT EXISTS severity TEXT;
    ALTER TABLE public.diagnostic_logs ADD COLUMN IF NOT EXISTS confidence NUMERIC;
    ALTER TABLE public.diagnostic_logs ADD COLUMN IF NOT EXISTS symptoms JSONB;
    ALTER TABLE public.diagnostic_logs ADD COLUMN IF NOT EXISTS remedy_type TEXT;
    ALTER TABLE public.diagnostic_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_diagnostic_logs_user ON public.diagnostic_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_logs_created ON public.diagnostic_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 8. TABLE: public.devices (IoT Soil Stations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT UNIQUE NOT NULL,
    pairing_code_hash TEXT,
    secret_token_hash TEXT,
    status TEXT NOT NULL DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'claimed')),
    owner_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    field_id UUID REFERENCES public.user_lands(id) ON DELETE SET NULL,
    name TEXT NOT NULL DEFAULT 'Soil Probe Station',
    crop TEXT DEFAULT 'Wheat',
    wake_interval_minutes INTEGER DEFAULT 60,
    moisture_threshold NUMERIC DEFAULT 25.0,
    auto_irrigation_enabled BOOLEAN DEFAULT false,
    sensor_depths JSONB DEFAULT '[15, 30]'::jsonb,
    calibration JSONB DEFAULT '{"15": {"dry_raw": 3200, "wet_raw": 1400}, "30": {"dry_raw": 3100, "wet_raw": 1350}}'::jsonb,
    battery_percent NUMERIC DEFAULT 100,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_owner ON public.devices(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON public.devices(device_id);

-- ------------------------------------------------------------------------------
-- 9. TABLE: public.sensor_readings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
    depth_cm INTEGER NOT NULL DEFAULT 15,
    raw_value NUMERIC,
    moisture_percent NUMERIC NOT NULL,
    soil_temp_c NUMERIC,
    battery_percent NUMERIC,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time ON public.sensor_readings(device_id, recorded_at DESC);

-- ------------------------------------------------------------------------------
-- 10. TABLE: public.commands
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('start_irrigation', 'stop_irrigation')),
    duration_minutes INTEGER DEFAULT 20,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'running', 'done', 'failed', 'expired')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_commands_device ON public.commands(device_id, status);

-- ------------------------------------------------------------------------------
-- 11. TABLE: public.irrigation_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
    command_id UUID REFERENCES public.commands(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    litres NUMERIC,
    outcome TEXT DEFAULT 'completed'
);

CREATE INDEX IF NOT EXISTS idx_irrigation_logs_device ON public.irrigation_logs(device_id, started_at DESC);

-- ------------------------------------------------------------------------------
-- 12. TABLE: public.alerts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT REFERENCES public.devices(device_id) ON DELETE SET NULL,
    owner_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'moisture_critical',
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_owner ON public.alerts(owner_user_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Supabase enforces RLS by default. To allow the web application and anon/service
-- clients to read and write without encountering Error 42501 (RLS violation),
-- we define explicit permissive policies on all tables.
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structure_tracking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting old policies if present
DO $$
BEGIN
    DROP POLICY IF EXISTS "allow_anon_all_users" ON public.users;
    DROP POLICY IF EXISTS "allow_anon_all_user_lands" ON public.user_lands;
    DROP POLICY IF EXISTS "allow_anon_all_field_reports" ON public.field_reports;
    DROP POLICY IF EXISTS "allow_anon_all_structure_tracking_logs" ON public.structure_tracking_logs;
    DROP POLICY IF EXISTS "allow_anon_all_land_reports" ON public.land_reports;
    DROP POLICY IF EXISTS "allow_anon_all_advisories" ON public.advisories;
    DROP POLICY IF EXISTS "allow_anon_all_diagnostic_logs" ON public.diagnostic_logs;
    DROP POLICY IF EXISTS "allow_anon_all_devices" ON public.devices;
    DROP POLICY IF EXISTS "allow_anon_all_sensor_readings" ON public.sensor_readings;
    DROP POLICY IF EXISTS "allow_anon_all_commands" ON public.commands;
    DROP POLICY IF EXISTS "allow_anon_all_irrigation_logs" ON public.irrigation_logs;
    DROP POLICY IF EXISTS "allow_anon_all_alerts" ON public.alerts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Create full access policies for anon & authenticated roles
CREATE POLICY "allow_anon_all_users" ON public.users
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_user_lands" ON public.user_lands
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_field_reports" ON public.field_reports
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_structure_tracking_logs" ON public.structure_tracking_logs
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_land_reports" ON public.land_reports
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_advisories" ON public.advisories
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_diagnostic_logs" ON public.diagnostic_logs
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_devices" ON public.devices
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_sensor_readings" ON public.sensor_readings
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_commands" ON public.commands
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_irrigation_logs" ON public.irrigation_logs
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_anon_all_alerts" ON public.alerts
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Enable Supabase Realtime for live IoT telemetry updates
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_lands;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
