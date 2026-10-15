import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

function maskSecret(val?: string): string {
  if (!val) return 'Not configured (empty)';
  if (val.length <= 8) return '********';
  return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
}

async function runVerification() {
  console.log('='.repeat(65));
  console.log('  BhooTech — Supabase Server Authentication & RLS Verification');
  console.log('='.repeat(65));

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  console.log(`Endpoint URL:     ${url || 'NOT SET'}`);
  console.log(`Anon Key:         ${maskSecret(anonKey)}`);
  console.log(`Service Role Key: ${maskSecret(serviceRoleKey)}`);

  if (!url) {
    console.error('\n[ERROR] SUPABASE_URL is missing. Please configure it in your server .env file.');
    process.exit(1);
  }

  const activeKey = serviceRoleKey || anonKey;
  if (!activeKey) {
    console.error('\n[ERROR] Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_KEY is configured.');
    process.exit(1);
  }

  const isUsingServiceRole = Boolean(serviceRoleKey);
  if (!isUsingServiceRole) {
    console.warn('\n[WARNING] Server is running with anon key. PostgreSQL Row Level Security (RLS Code 42501)');
    console.warn('          will prevent server-side writes unless SUPABASE_SERVICE_ROLE_KEY is provided.');
  } else {
    console.log('\n[INFO] Authenticating using SUPABASE_SERVICE_ROLE_KEY (Bypasses RLS safely on backend).');
  }

  const client = createClient(url, activeKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const tables = [
    'users',
    'user_lands',
    'field_reports',
    'structure_tracking_logs',
    'land_reports',
    'advisories',
    'diagnostic_logs',
  ];

  console.log('\n1. Checking Table Read Accessibility:');
  console.log('-'.repeat(65));
  for (const table of tables) {
    try {
      const { data, error, status } = await client.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`  - ${table.padEnd(25)}: [FAILED] HTTP ${status} — ${error.message} (Code: ${error.code || 'N/A'})`);
      } else {
        console.log(`  - ${table.padEnd(25)}: [OK] Table reachable`);
      }
    } catch (err: any) {
      console.log(`  - ${table.padEnd(25)}: [EXCEPTION] ${err?.message || 'Network error'}`);
    }
  }

  console.log('\n2. Testing Write, Read & Cleanup (users table):');
  console.log('-'.repeat(65));
  const testUserId = '00000000-0000-4000-a000-000000009999';
  const testUserPayload = {
    id: testUserId,
    full_name: 'BhooTech Diagnostic Probe',
    mobile_number: '9999900000',
    primary_crop: 'Paddy',
    state: 'Karnataka',
    district: 'Mandya',
    village: 'Chinnakurali',
    total_land_acres: 2.5,
  };

  try {
    const { error: insertErr, status: insertStatus } = await client.from('users').upsert(testUserPayload);
    if (insertErr) {
      console.log(`  - Write Operation:   [FAILED] HTTP ${insertStatus} (Code: ${insertErr.code || 'N/A'})`);
      console.log(`    Message: ${insertErr.message}`);
      if (insertErr.code === '42501' || insertErr.message?.includes('row-level security')) {
        console.log('    >> CAUSE: PostgreSQL Row Level Security (RLS) is blocking the write.');
        console.log('    >> FIX:   Provide SUPABASE_SERVICE_ROLE_KEY in your server .env file.');
      }
    } else {
      console.log('  - Write Operation:   [SUCCESS] Row upserted to cloud Supabase.');

      const { data: readData, error: readErr } = await client
        .from('users')
        .select('id, full_name, mobile_number')
        .eq('id', testUserId)
        .single();

      if (readErr) {
        console.log(`  - Read Verification: [FAILED] ${readErr.message}`);
      } else {
        console.log(`  - Read Verification: [CONFIRMED] Found test user: "${readData.full_name}" (ID: ${readData.id})`);
      }

      const { error: deleteErr } = await client.from('users').delete().eq('id', testUserId);
      if (deleteErr) {
        console.log(`  - Test Cleanup:      [WARNING] Could not delete test row: ${deleteErr.message}`);
      } else {
        console.log('  - Test Cleanup:      [CONFIRMED] Disposable test record cleaned up.');
      }
    }
  } catch (err: any) {
    console.error('  - Write Exception:  ', err?.message || err);
  }

  console.log('\n='.repeat(65));
  console.log('Verification completed.');
  console.log('='.repeat(65));
}

runVerification();
