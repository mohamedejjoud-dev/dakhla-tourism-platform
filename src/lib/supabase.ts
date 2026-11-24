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

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawUrl !== 'https://placeholder.supabase.co' &&
  !rawUrl.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.info(
    '[Dakhlin] Running in high-performance local mode with curated authentic Dakhla dataset. Zero network delay.'
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

/**
 * Executes a thenable/promise with an automatic timeout guard so remote network stalls never block the UI.
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs = 2000,
  fallback: any = { data: null, error: new Error('Timeout') }
): Promise<T> {
  if (!isSupabaseConfigured) return fallback as T;
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback as T), timeoutMs)),
  ]);
}
