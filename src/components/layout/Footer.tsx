import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DakhlinLogo } from '@/components/common/DakhlinLogo';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FCFBF8] text-[#1F2933] border-t border-[#E8E5DE] transition-colors mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand + Short Description */}
          <div className="col-span-2 md:col-span-4 space-y-3">
            <Link to="/" className="inline-flex items-center group">
              <DakhlinLogo className="group-hover:opacity-90 transition-opacity" />
            </Link>
            
            <p className="text-xs text-[#667580] leading-relaxed max-w-sm">
              {t('footer.tagline', 'Portail de découverte touristique de la région Dakhla-Oued Ed-Dahab.')}
            </p>
          </div>

          {/* Explore */}
          <div className="col-span-1 md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F2933]">
              {t('footer.categories', 'Explore')}
            </h4>
            <ul className="space-y-1.5 text-xs text-[#667580]">
              <li>
                <Link to="/explore?cat=hotels" className="hover:text-[#176B87] transition-colors">
                  {t('categories.hotels', 'Hotels')}
                </Link>
              </li>
              <li>
                <Link to="/explore?cat=restaurants" className="hover:text-[#176B87] transition-colors">
                  {t('categories.restaurants', 'Restaurants')}
                </Link>
              </li>
              <li>
                <Link to="/explore?cat=activities" className="hover:text-[#176B87] transition-colors">
                  {t('categories.activities', 'Experiences')}
                </Link>
              </li>
              <li>
                <Link to="/explore?cat=attractions" className="hover:text-[#176B87] transition-colors">
                  {t('categories.attractions', 'Attractions')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful */}
          <div className="col-span-1 md:col-span-2 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F2933]">
              Utile
            </h4>
            <ul className="space-y-1.5 text-xs text-[#667580]">
              <li>
                <Link to="/map" className="hover:text-[#176B87] transition-colors">
                  {t('nav.map', 'Map')}
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-[#176B87] transition-colors">
                  {t('assistant.name', 'El Haj')} (IA)
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-[#176B87] transition-colors">
                  {t('favorites.title', 'Favorites')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F2933]">
              {t('footer.legal', 'Legal')}
            </h4>
            <ul className="space-y-1.5 text-xs text-[#667580]">
              <li>
                <Link to="/about#privacy" className="hover:text-[#176B87] transition-colors">
                  {t('footer.privacy', 'Protection des Données (CNDP)')}
                </Link>
              </li>
              <li>
                <Link to="/about#privacy" className="hover:text-[#176B87] transition-colors">
                  {t('footer.terms', 'Conditions Générales')}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[#E8E5DE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667580]">
          <p>{t('footer.copyright', { year: currentYear })}</p>
          <p className="text-[11px] text-[#667580]">
            Dakhla, Sahara Marocain
          </p>
        </div>
      </div>
    </footer>
  );
};
