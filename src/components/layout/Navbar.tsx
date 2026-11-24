import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Menu, 
  X, 
  Heart, 
  User as UserIcon, 
  LogOut, 
  Search, 
  ShieldCheck
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, SupportedLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { DakhlinLogo } from '@/components/common/DakhlinLogo';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, openAuthModal, signOut } = useAuth();
  const { favoritesCount } = useFavorites();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const handleLanguageChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleOpenAi = () => {
    window.dispatchEvent(new CustomEvent('open-dakhlin-ai'));
  };

  // Primary Navigation Items
  const navItems = [
    { to: '/explore', label: t('nav.discover', 'Discover'), exact: true },
    { to: '/explore?cat=hotels', label: t('nav.stays', 'Stays') },
    { to: '/explore?cat=restaurants', label: t('nav.food', 'Restaurants') },
    { to: '/explore?cat=activities', label: t('nav.experiences', 'Experiences') },
    { to: '/plan', label: t('nav.planTrip', 'Plan My Trip'), isFeatured: true },
  ];

  const isNavActive = (itemTo: string) => {
    if (itemTo === '/explore') {
      return location.pathname === '/explore' && !location.search;
    }
    if (itemTo === '/plan') {
      return location.pathname === '/plan';
    }
    const [path, query] = itemTo.split('?');
    return location.pathname === path && location.search.includes(query);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E8E5DE] transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4 lg:gap-6">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center shrink-0 group focus:outline-none">
            <DakhlinLogo className="group-hover:opacity-90 transition-opacity" />
          </Link>

          {/* Desktop/Tablet Primary Nav Links (Hidden on small mobile) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
            {navItems.map((item) => {
              const active = isNavActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-colors ${
                    active
                      ? 'text-[#176B87] bg-[#F3E8D2]/40 font-semibold'
                      : item.isFeatured
                      ? 'text-[#176B87] border border-[#35A7A0]/40 hover:bg-[#F3E8D2]/30 font-semibold'
                      : 'text-[#667580] hover:text-[#1F2933] hover:bg-[#FCFBF8]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Input (Desktop & Tablet) */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex-1 max-w-[180px] md:max-w-[220px] lg:max-w-xs xl:max-w-sm hidden sm:block"
          >
            <div className="relative flex items-center">
              <Search className="absolute start-3 w-3.5 h-3.5 text-[#667580] pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder={t('nav.searchPlaceholder', 'Search Dakhla...')}
                className="w-full ps-8 pe-3.5 py-1.5 sm:py-2 rounded-full border border-[#E8E5DE] bg-[#FCFBF8] hover:bg-white focus:bg-white text-xs text-[#1F2933] placeholder:text-[#667580] focus:outline-none focus:ring-1 focus:ring-[#176B87] focus:border-[#176B87] transition-all"
              />
            </div>
          </form>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
            
            {/* Wishlist Heart */}
            <Link
              to="/favorites"
              className="relative p-2 rounded-full text-[#667580] hover:text-[#176B87] hover:bg-[#FCFBF8] transition-colors"
              title={t('favorites.title', 'Favorites')}
              aria-label={t('favorites.title', 'Favorites')}
            >
              <Heart className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 end-1 w-3.5 h-3.5 rounded-full bg-[#35A7A0] text-white text-[9px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-[#FCFBF8] text-xs font-medium text-[#667580] hover:text-[#1F2933] transition-colors"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase text-[11px] font-semibold">{currentLang}</span>
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute end-0 mt-2 w-36 bg-white rounded-2xl shadow-lg border border-[#E8E5DE] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full text-start px-3.5 py-1.5 text-xs font-medium flex items-center justify-between transition-colors ${
                        currentLang === lang
                          ? 'bg-[#F3E8D2]/40 text-[#176B87] font-semibold'
                          : 'text-[#667580] hover:bg-[#FCFBF8]'
                      }`}
                      role="menuitem"
                    >
                      <span>{LANGUAGE_NAMES[lang].native}</span>
                      <span className="text-[10px] text-[#667580] uppercase font-mono">{lang}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ask El Haj AI Button */}
            <button
              type="button"
              onClick={handleOpenAi}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-[#176B87] hover:bg-[#13586F] text-white font-medium text-xs shadow-2xs hover:shadow-xs transition-all"
              aria-label={t('nav.askAi', 'Ask El Haj')}
            >
              <span>{t('nav.askAi', 'Ask El Haj')}</span>
            </button>

            {/* User Account / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 p-1 rounded-full hover:bg-[#FCFBF8] text-[#1F2933] text-xs font-medium transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#176B87] text-white flex items-center justify-center text-xs font-semibold">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute end-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E8E5DE] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-1.5 border-b border-[#E8E5DE]">
                      <p className="text-xs font-semibold text-[#1F2933] truncate">{profile?.full_name || 'Voyageur'}</p>
                      <p className="text-[10px] text-[#667580] truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-start px-3.5 py-1.5 text-xs font-medium text-[#1F2933] hover:bg-[#FCFBF8] flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#35A7A0]" />
                        <span>{t('nav.admin', 'Admin')}</span>
                      </Link>
                    )}

                    <Link
                      to="/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-start px-3.5 py-1.5 text-xs font-medium text-[#1F2933] hover:bg-[#FCFBF8] flex items-center gap-2"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#D8B67A]" />
                      <span>{t('favorites.title', 'Favorites')}</span>
                    </Link>

                    <button
                      onClick={() => { setUserDropdownOpen(false); signOut(); }}
                      className="w-full text-start px-3.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-[#E8E5DE] mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.signOut', 'Sign Out')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-full border border-[#E8E5DE] hover:border-[#176B87] text-[#1F2933] font-medium text-xs transition-colors"
              >
                {t('nav.signIn', 'Sign In')}
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#1F2933] hover:bg-[#FCFBF8] transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Search Row (Always accessible on screens < 640px) */}
        <div className="sm:hidden pb-3 pt-0.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#667580]" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder={t('nav.searchPlaceholder', 'Search Dakhla...')}
              className="w-full ps-8 pe-3 py-1.5 rounded-full border border-[#E8E5DE] bg-[#FCFBF8] text-xs text-[#1F2933] placeholder:text-[#667580] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
            />
          </form>
        </div>

      </div>

      {/* Mobile Slide-down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E5DE] bg-white px-5 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-md">
          
          {/* Navigation Links */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isNavActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                    active ? 'bg-[#F3E8D2]/40 text-[#176B87] font-semibold' : 'text-[#667580] hover:bg-[#FCFBF8]'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#667580] hover:bg-[#FCFBF8]"
            >
              <span>{t('nav.map', 'Map')}</span>
            </Link>

            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); handleOpenAi(); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#176B87] hover:bg-[#F3E8D2]/30"
            >
              <span>{t('nav.askAi', 'Ask El Haj')}</span>
            </button>
          </div>

          {/* Auth Button */}
          <div className="pt-2 border-t border-[#E8E5DE]">
            {user ? (
              <button
                onClick={() => { setMobileMenuOpen(false); signOut(); }}
                className="w-full py-2 rounded-full border border-[#E8E5DE] text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                {t('nav.signOut', 'Sign Out')}
              </button>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                className="w-full py-2 rounded-full bg-[#176B87] text-white text-xs font-medium hover:bg-[#13586F]"
              >
                {t('nav.signIn', 'Sign In')}
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
