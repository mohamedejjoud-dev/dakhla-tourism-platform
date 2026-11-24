import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  UserProfile, 
  getCurrentProfile, 
  signInWithEmail as apiSignInWithEmail, 
  signUpWithEmail as apiSignUpWithEmail, 
  signInWithGoogle as apiSignInWithGoogle, 
  signOut as apiSignOut 
} from '@/services/authService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const loadProfile = async (userId: string) => {
    try {
      const prof = await getCurrentProfile(userId);
      setProfile(prof);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      setUser(initSession?.user || null);
      if (initSession?.user) {
        loadProfile(initSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Auth state subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        if (newSession?.user) {
          await loadProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  const signInWithEmail = async (email: string, password: string) => {
    const res = await apiSignInWithEmail(email, password);
    if (!res.error && res.user) {
      await loadProfile(res.user.id);
      closeAuthModal();
    }
    return { error: res.error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const res = await apiSignUpWithEmail(email, password, fullName);
    if (!res.error && res.user) {
      await loadProfile(res.user.id);
      closeAuthModal();
    }
    return { error: res.error };
  };

  const signInWithGoogle = async () => {
    return await apiSignInWithGoogle();
  };

  const signOut = async () => {
    await apiSignOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
