import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Menu, 
  X, 
  MapPin, 
  Compass, 
  Building2, 
  ShieldCheck,
  Heart,
  User as UserIcon,
  LogOut,
  Bot,
  Search,
  Waves,
  Utensils,
  Hotel
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, SupportedLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

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

  // TripAdvisor-style horizontal category sub-bar
  const categoryNavItems = [
    { to: '/', label: 'Dakhla', icon: MapPin },
    { to: '/explore?cat=activities', label: t('categories.activities'), icon: Waves },
    { to: '/explore?cat=hotels', label: t('categories.hotels'), icon: Hotel },
    { to: '/explore?cat=restaurants', label: t('categories.restaurants'), icon: Utensils },
    { to: '/explore?cat=attractions', label: t('categories.attractions'), icon: Compass },
    { to: '/assistant', label: 'L7aj Concierge IA', icon: Bot },
    { to: '/projects', label: t('nav.projects'), icon: Building2 },
  ];

  const isCurrentActive = (itemTo: string) => {
    if (itemTo === '/') {
      return location.pathname === '/' && !location.search;
    }
    const [path, query] = itemTo.split('?');
    if (query) {
      return location.pathname === path && location.search.includes(query);
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-sand-200/90 shadow-2xs">
      
      {/* -------------------------------------------------------------
          Top Main Bar: Brand, Search Bar, and User Actions
      ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 sm:gap-8">
          
          {/* Brand Logo with El Haj Insignia */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group focus:outline-none">
            <div className="relative">
              <img 
                src="/images/elhaj-avatar.jpg" 
                alt="Dakhlin — El Haj" 
                className="w-10 h-10 rounded-full object-cover border-2 border-[#004F32] shadow-xs group-hover:scale-105 transition-transform" 
              />
              <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-[#00AA6C] border-2 border-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 leading-none">
                Dakhlin<span className="text-[#00AA6C]">.</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sahara Marocain</span>
            </div>
          </Link>

          {/* Center Search Bar (TripAdvisor Style: Pill shape, e.g. "Q dakhla |") */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex-1 max-w-lg hidden md:block"
          >
            <div className="relative flex items-center">
              <Search className="absolute start-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Rechercher à Dakhla (hôtels, kitesurf, huîtres...)"
                className="w-full ps-10 pe-4 py-2.5 rounded-full border border-sand-300 bg-sand-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#004F32]/20 focus:border-[#004F32] shadow-2xs transition-all"
              />
            </div>
          </form>

          {/* Right Top Actions */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-850">
            <Link
              to="/explore"
              className="hover:text-[#004F32] transition-colors"
            >
              {t('nav.explore')}
            </Link>

            <Link
              to="/map"
              className="hover:text-[#004F32] transition-colors"
            >
              {t('nav.map')}
            </Link>

            {/* Wishlist Trips Heart */}
            <Link
              to="/favorites"
              className="relative p-2 rounded-full hover:bg-sand-100 text-slate-700 hover:text-rose-600 transition-colors"
              title={t('favorites.title')}
              aria-label={t('favorites.title')}
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-0 end-0 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Currency / Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-sand-100 text-xs font-semibold text-slate-700 transition-colors"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-4 h-4 text-slate-600" />
                <span className="uppercase">{currentLang} • MAD</span>
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute end-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-sand-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full text-start px-4 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                        currentLang === lang
                          ? 'bg-sand-50 text-slate-950 font-bold'
                          : 'text-slate-600 hover:bg-sand-50/60'
                      }`}
                      role="menuitem"
                    >
                      <span>{LANGUAGE_NAMES[lang].native}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{lang}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TripAdvisor Style Dark Pill "Se connecter" Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-sand-100 hover:bg-sand-200/80 text-slate-900 text-xs font-bold transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#004F32] text-white flex items-center justify-center text-xs">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="max-w-[100px] truncate">{profile?.full_name || 'Voyageur'}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute end-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sand-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-sand-100">
                      <p className="text-xs font-bold text-slate-950 truncate">{profile?.full_name || 'Voyageur'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-start px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-sand-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{t('nav.admin')}</span>
                      </Link>
                    )}

                    <Link
                      to="/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-start px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-sand-50 flex items-center gap-2"
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
                className="px-5 py-2.5 rounded-full bg-[#004F32] hover:bg-[#003824] text-white font-bold text-xs shadow-xs transition-colors"
              >
                {t('nav.signIn')}
              </button>
            )}

          </div>

          {/* Mobile Right Icons */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/favorites"
              className="relative p-2 rounded-lg text-slate-700"
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
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-900 hover:bg-sand-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* -------------------------------------------------------------
          TripAdvisor Style Category Sub-Navigation Bar
      ------------------------------------------------------------- */}
      <div className="border-t border-sand-200/70 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none py-1">
            {categoryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentActive(item.to);
              const isAssistant = item.to === '/assistant';
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 py-3 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap font-bold transition-colors border-b-2 ${
                    active
                      ? 'text-slate-950 border-slate-950'
                      : 'text-slate-600 border-transparent hover:text-slate-950'
                  }`}
                >
                  {isAssistant ? (
                    <img 
                      src="/images/elhaj-avatar.jpg" 
                      alt="L7aj" 
                      className="w-4 h-4 rounded-full object-cover ring-1 ring-[#00AA6C]" 
                    />
                  ) : (
                    <Icon className={`w-4 h-4 ${active ? 'text-[#004F32]' : 'text-slate-500'}`} />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sand-200 bg-white px-5 py-5 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Rechercher à Dakhla..."
              className="w-full ps-10 pe-4 py-2.5 rounded-full border border-sand-300 text-xs text-slate-900 focus:outline-none"
            />
          </form>

          <div className="space-y-1 pt-2">
            {categoryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                    active ? 'bg-sand-100 text-slate-950' : 'text-slate-700 hover:bg-sand-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#004F32]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-sand-200 flex items-center justify-between">
            {user ? (
              <button
                onClick={() => { setMobileMenuOpen(false); signOut(); }}
                className="text-xs font-bold text-rose-600"
              >
                {t('nav.signOut')}
              </button>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                className="w-full py-2.5 rounded-full bg-[#004F32] text-white font-bold text-xs"
              >
                {t('nav.signIn')}
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
