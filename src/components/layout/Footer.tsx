import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ocean-950 text-sand-100 border-t border-ocean-900 transition-colors selection:bg-lagoon-600 selection:text-white">
      {/* Decorative subtle top horizon line */}
      <div className="h-1 bg-gradient-to-r from-ocean-900 via-lagoon-600 to-sand-500 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-14">
          
          {/* Brand & Regional Editorial Description */}
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <img 
                src="/images/elhaj-avatar.jpg" 
                alt="Dakhlin — El Haj" 
                className="w-11 h-11 rounded-full object-cover border-2 border-lagoon-500 shadow-xs" 
              />
              <div className="flex flex-col">
                <span className="font-bold text-2xl tracking-wide text-sand-50 leading-none">
                  DAKHLIN<span className="text-lagoon-400">.</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-sand-400 tracking-widest mt-1">Guide Officiel</span>
              </div>
            </div>
            
            <p className="text-sm text-sand-200/80 leading-relaxed font-light max-w-sm">
              {t('footer.tagline')}
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-sand-300/80 font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-lagoon-400 shrink-0" />
                <span>23°43′N 15°56′W • Péninsule de Dakhla</span>
              </div>
              <div className="text-[11px] text-sand-400/90 ps-6">
                Région Dakhla-Oued Ed-Dahab • Royaume du Maroc
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest-editorial text-lagoon-400">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm text-sand-200/75">
              <li>
                <Link to="/" className="hover:text-sand-50 transition-colors flex items-center gap-1.5 group">
                  <span>{t('nav.home')}</span>
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-sand-50 transition-colors flex items-center gap-1.5 group">
                  <span>{t('nav.explore')}</span>
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-sand-50 transition-colors flex items-center gap-1.5 group">
                  <span>{t('nav.map')}</span>
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-sand-50 transition-colors flex items-center gap-1.5 group">
                  <span>L7aj Concierge AI</span>
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-sand-50 transition-colors flex items-center gap-1.5 group">
                  <span>{t('nav.projects')}</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-sand-50 transition-colors flex items-center gap-1.5 group">
                  <span>{t('nav.about')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Curated Categories */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest-editorial text-lagoon-400">
              {t('footer.categories')}
            </h4>
            <ul className="space-y-2.5 text-sm text-sand-200/75">
              <li>
                <Link to="/explore?cat=hotels" className="hover:text-sand-50 transition-colors">
                  {t('categories.hotels')}
                </Link>
              </li>
              <li>
                <Link to="/explore?cat=activities" className="hover:text-sand-50 transition-colors">
                  {t('categories.activities')}
                </Link>
              </li>
              <li>
                <Link to="/explore?cat=restaurants" className="hover:text-sand-50 transition-colors">
                  {t('categories.restaurants')}
                </Link>
              </li>
              <li>
                <Link to="/explore?cat=attractions" className="hover:text-sand-50 transition-colors">
                  {t('categories.attractions')}
                </Link>
              </li>
              <li>
                <Link to="/explore?cat=projects" className="hover:text-sand-50 transition-colors">
                  {t('categories.projects')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal, CNDP Law 09-08 & Integrity */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest-editorial text-lagoon-400">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2.5 text-sm text-sand-200/75">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sand-400 shrink-0" />
                <Link to="/about#privacy" className="hover:text-sand-50 transition-colors font-medium">
                  {t('footer.privacy')} (Loi 09-08)
                </Link>
              </li>
              <li>
                <Link to="/about#privacy" className="hover:text-sand-50 transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li className="pt-2 text-xs text-sand-400/80 leading-relaxed">
                Conforme aux directives CNDP et à la loi marocaine 09-08 sur la protection des données personnelles des visiteurs et résidents.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-ocean-900/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-400/90">
          <p>{t('footer.copyright', { year: currentYear })}</p>
          <p className="flex items-center gap-1.5 text-sand-400">
            <span>Fait avec passion pour le Sahara Marocain</span>
            <Heart className="w-3.5 h-3.5 text-sand-500 fill-sand-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
