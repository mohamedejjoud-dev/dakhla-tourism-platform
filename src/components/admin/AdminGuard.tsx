// src/components/admin/AdminGuard.tsx
// Route protection strictly enforcing RBAC (is_admin() / profile.role === 'admin')
// Governed strictly by AGENTS.md (Rule 12: Security & RBAC)

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

export const AdminGuard: React.FC = () => {
  const { user, profile, loading, isAdmin, openAuthModal } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-stone-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sand-600 dark:text-sand-400 font-medium">
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  // Case 1: Unauthenticated visitor
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-sand-200 dark:border-stone-700 p-8 text-center">
          <div className="w-16 h-16 bg-ocean-50 dark:bg-ocean-950/40 text-ocean-600 dark:text-ocean-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-sand-900 dark:text-sand-100 mb-2">
            {t('admin.auth_required_title', 'Admin Authentication Required')}
          </h2>
          <p className="text-sand-600 dark:text-sand-300 text-sm mb-6 leading-relaxed">
            {t(
              'admin.auth_required_desc',
              'You must be signed in with an authorized administrator account to access the Dakhlin Management Portal.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={openAuthModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl font-medium transition shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              {t('auth.sign_in', 'Sign In')}
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sand-100 dark:bg-stone-700 hover:bg-sand-200 dark:hover:bg-stone-600 text-sand-800 dark:text-sand-200 rounded-xl font-medium transition"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t('admin.back_to_site', 'Return to Public Site')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Authenticated user but NOT an administrator (RBAC 403 Forbidden)
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-900/50 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-sand-900 dark:text-sand-100 mb-2">
            {t('admin.access_denied_title', 'Access Denied (403)')}
          </h2>
          <p className="text-sand-600 dark:text-sand-300 text-sm mb-6 leading-relaxed">
            {t(
              'admin.access_denied_desc',
              'Your account role (tourist) does not possess administrator privileges for this platform. This incident is logged.'
            )}
          </p>
          <div className="p-3 bg-sand-50 dark:bg-stone-900 rounded-xl text-xs text-sand-500 font-mono mb-6">
            User ID: {user.id.substring(0, 8)}... | Role: {profile?.role || 'tourist'}
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sand-900 hover:bg-sand-800 text-white rounded-xl font-medium transition shadow-sm w-full"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t('admin.back_to_site', 'Return to Public Site')}
          </Link>
        </div>
      </div>
    );
  }

  // Case 3: Fully authorized administrator
  return <Outlet />;
};
