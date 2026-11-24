// src/components/admin/AdminLayout.tsx
// Dedicated Admin CMS Shell with sidebar navigation, header, language selector, and quick stats

import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  MapPin, 
  Tags, 
  MessageSquare, 
  ArrowLeft, 
  LogOut, 
  ExternalLink,
  Globe
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const navItems = [
    {
      to: '/admin',
      end: true,
      label: t('admin.nav_dashboard', 'Dashboard'),
      icon: LayoutDashboard,
    },
    {
      to: '/admin/places',
      end: false,
      label: t('admin.nav_places', 'Places & Content'),
      icon: MapPin,
    },
    {
      to: '/admin/categories',
      end: false,
      label: t('admin.nav_categories', 'Categories'),
      icon: Tags,
    },
    {
      to: '/admin/reviews',
      end: false,
      label: t('admin.nav_reviews', 'Review Moderation'),
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen bg-sand-100/60 dark:bg-stone-900 flex flex-col md:flex-row text-sand-900 dark:text-sand-100">
      {/* Sidebar (Desktop) / Topbar (Mobile) */}
      <aside className="w-full md:w-64 bg-white dark:bg-stone-800 border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l border-sand-200 dark:border-stone-700 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header / Logo */}
          <div className="p-5 border-b border-sand-200 dark:border-stone-700 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <img 
                src="/images/elhaj-avatar.jpg" 
                alt="Dakhlin Admin" 
                className="w-9 h-9 rounded-full object-cover border border-[#004F32] shadow-xs" 
              />
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-sand-100">
                  Dakhlin<span className="text-[#00AA6C]">.</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-[#004F32] dark:text-ocean-400">
                  {t('admin.cms_badge', 'Admin CMS')}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-ocean-50 dark:bg-ocean-950/40 text-ocean-700 dark:text-ocean-400 font-semibold'
                        : 'text-sand-600 dark:text-sand-400 hover:bg-sand-50 dark:hover:bg-stone-700 hover:text-sand-900 dark:hover:text-sand-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer actions: Return to public site, Language, and Logout */}
        <div className="p-4 border-t border-sand-200 dark:border-stone-700 space-y-3">
          {/* Language switcher */}
          <div className="flex items-center justify-between px-2 text-xs text-sand-500 dark:text-sand-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5" />
              {t('common.language', 'Language')}
            </span>
            <div className="flex items-center gap-1">
              {(['ar', 'fr', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-1.5 py-0.5 rounded text-xs font-semibold uppercase ${
                    i18n.language === lang
                      ? 'bg-ocean-600 text-white'
                      : 'hover:bg-sand-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-sand-700 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-stone-700 rounded-lg transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              {t('admin.view_public_site', 'View Public Portal')}
            </span>
            <ArrowLeft className="w-3 h-3 rtl:rotate-180" />
          </Link>

          <div className="pt-2 border-t border-sand-200/60 dark:border-stone-700/60 flex items-center justify-between">
            <div className="truncate text-xs">
              <p className="font-semibold text-sand-800 dark:text-sand-200 truncate">
                {profile?.full_name || 'Administrator'}
              </p>
              <p className="text-[10px] text-ocean-600 dark:text-ocean-400 font-mono uppercase">
                {profile?.role || 'admin'}
              </p>
            </div>
            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              title={t('auth.sign_out', 'Sign Out')}
              className="p-1.5 text-sand-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
