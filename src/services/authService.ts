import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'tourist' | 'admin';
  created_at: string;
  updated_at: string;
}

export async function getCurrentProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }
  return data as UserProfile;
}

export async function signInWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error: error ? new Error(error.message) : null,
  };
}

export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error: error ? new Error(error.message) : null,
  };
}

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });

  return { error: error ? new Error(error.message) : null };
}

export async function signOut(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? new Error(error.message) : null };
}
