import { createClient } from '@supabase/supabase-js';

// Safe environment variable resolution supporting browser (import.meta.env) and Node test runners (process.env)
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return '';
};

const rawUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('TEST_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('TEST_SUPABASE_ANON_KEY') || 'placeholder-anon-key';

if (rawUrl === 'https://placeholder.supabase.co') {
  console.warn(
    'Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not defined. Ensure .env.local is configured.'
  );
}

// Clean trailing slashes and PostgREST endpoint suffixes
const cleanUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const supabase = createClient(cleanUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
