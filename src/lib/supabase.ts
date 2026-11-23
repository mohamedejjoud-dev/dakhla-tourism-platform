import { createClient } from '@supabase/supabase-js';

// Support both browser (Vite import.meta.env) and Node.js test environment (process.env)
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (process.env as unknown as Record<string, string>);
const supabaseUrl = env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.TEST_SUPABASE_URL || '';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.TEST_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not defined. Ensure .env.local is configured.'
  );
}

// Clean trailing slashes and PostgREST endpoint suffixes
const cleanUrl = supabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const supabase = createClient(cleanUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
