import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { 
  Globe, 
  Menu, 
  X, 
  MapPin, 
  Compass, 
  Building2, 
  Info, 
  ShieldCheck,
  Heart,
  User as UserIcon,
  LogOut,
  LogIn,
  Bot
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, SupportedLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, profile, isAdmin, openAuthModal, signOut } = useAuth();
  const { favoritesCount } = useFavorites();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const handleLanguageChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: Compass },
    { to: '/explore', label: t('nav.explore'), icon: MapPin },
    { to: '/map', label: t('nav.map'), icon: Globe },
    { to: '/assistant', label: 'L7aj AI', icon: Bot },
    { to: '/projects', label: t('nav.projects'), icon: Building2 },
    { to: '/about', label: t('nav.about'), icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sand-200/80 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-lagoon-600 to-ocean-800 flex items-center justify-center text-white shadow-md shadow-lagoon-600/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-extrabold text-xl tracking-wider">D</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-ocean-900 leading-none">
                DAKHLIN<span className="text-lagoon-600">.</span>
              </span>
              <span className="text-[11px] font-medium text-sand-600 tracking-widest uppercase mt-0.5">
                Dakhla • Sahara Marocain
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-lagoon-50 text-lagoon-700 font-semibold shadow-sm'
                      : 'text-slate-700 hover:text-ocean-900 hover:bg-sand-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-lagoon-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Favorites Icon Button */}
            <Link
              to="/favorites"
              className="relative p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-sand-100/60 transition-colors"
              title={t('favorites.title')}
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-sand-200 bg-white hover:bg-sand-50 text-slate-700 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-lagoon-500/20"
                aria-expanded={langDropdownOpen}
                aria-haspopup="true"
              >
                <Globe className="w-4 h-4 text-lagoon-600" />
                <span className="font-semibold">{LANGUAGE_NAMES[currentLang]?.native || 'FR'}</span>
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute end-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-sand-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full text-start px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                        currentLang === lang
                          ? 'bg-lagoon-50 text-lagoon-700 font-semibold'
                          : 'text-slate-700 hover:bg-sand-50'
                      }`}
                      role="menuitem"
                    >
                      <span>{LANGUAGE_NAMES[lang].native}</span>
                      <span className="text-xs text-slate-400 uppercase">{lang}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account / Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pe-3 rounded-full border border-sand-200 hover:bg-sand-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-lagoon-600 text-white flex items-center justify-center font-bold">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="max-w-[100px] truncate">{profile?.full_name || user.email?.split('@')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute end-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-sand-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-sand-100">
                      <p className="text-xs font-bold text-ocean-900 truncate">{profile?.full_name || 'Tourist'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-sand-100 text-sand-800 uppercase">
                        {profile?.role || 'tourist'}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-start px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-sand-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-lagoon-600" />
                        <span>{t('nav.admin')}</span>
                      </Link>
                    )}

                    <Link
                      to="/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-start px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-sand-50 flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>{t('favorites.title')}</span>
                    </Link>

                    <button
                      onClick={() => { setUserDropdownOpen(false); signOut(); }}
                      className="w-full text-start px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-sand-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-sand-300" />
                <span>{t('nav.signIn')}</span>
              </button>
            )}

          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/favorites"
              className="relative p-2 rounded-lg text-slate-700 hover:text-rose-600"
              aria-label={t('favorites.title')}
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 end-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => {
                const nextLangIndex = (SUPPORTED_LANGUAGES.indexOf(currentLang) + 1) % SUPPORTED_LANGUAGES.length;
                handleLanguageChange(SUPPORTED_LANGUAGES[nextLangIndex]);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-sand-200 text-xs font-bold text-ocean-900 bg-sand-50"
              aria-label="Toggle language"
            >
              {LANGUAGE_NAMES[currentLang]?.native}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-sand-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-ocean-900" /> : <Menu className="w-6 h-6 text-ocean-900" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
          
          {/* User Status / Login */}
          <div className="pb-3 border-b border-sand-200/80">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-lagoon-600 text-white flex items-center justify-center font-bold text-xs">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ocean-900">{profile?.full_name || 'Tourist'}</p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); signOut(); }}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                  title={t('nav.signOut')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                className="w-full py-2.5 rounded-xl bg-ocean-900 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-sand-300" />
                <span>{t('nav.signIn')}</span>
              </button>
            )}
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  active
                    ? 'bg-lagoon-50 text-lagoon-700 font-semibold'
                    : 'text-slate-700 hover:bg-sand-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-lagoon-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <Link
            to="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-sand-50"
          >
            <Heart className="w-5 h-5 text-rose-500" />
            <span>{t('favorites.title')} ({favoritesCount})</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-sand-50"
            >
              <ShieldCheck className="w-5 h-5 text-lagoon-600" />
              <span>{t('nav.admin')}</span>
            </Link>
          )}

          <div className="pt-4 border-t border-sand-200/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
              {t('lang.selectLanguage')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-colors ${
                    currentLang === lang
                      ? 'bg-lagoon-600 text-white border-lagoon-600 shadow-sm'
                      : 'bg-white border-sand-200 text-slate-700 hover:bg-sand-50'
                  }`}
                >
                  {LANGUAGE_NAMES[lang].native}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
