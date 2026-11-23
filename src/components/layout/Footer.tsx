import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ocean-900 text-sand-100 border-t border-ocean-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand & Regional Description */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-lagoon-500 flex items-center justify-center text-white font-black text-lg">
                D
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                DAKHLIN<span className="text-lagoon-400">.</span>
              </span>
            </div>
            <p className="text-sm text-sand-200/90 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-2 text-xs text-sand-300 font-medium pt-2">
              <MapPin className="w-4 h-4 text-lagoon-400 shrink-0" />
              <span>Dakhla, Oued Ed-Dahab, Maroc</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-lagoon-300">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-sm text-sand-200/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">{t('nav.explore')}</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition-colors">{t('nav.map')}</Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition-colors">{t('nav.projects')}</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">{t('nav.about')}</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-lagoon-300">
              {t('footer.categories')}
            </h4>
            <ul className="space-y-2 text-sm text-sand-200/80">
              <li>
                <Link to="/explore?cat=hotels" className="hover:text-white transition-colors">{t('categories.hotels')}</Link>
              </li>
              <li>
                <Link to="/explore?cat=activities" className="hover:text-white transition-colors">{t('categories.activities')}</Link>
              </li>
              <li>
                <Link to="/explore?cat=restaurants" className="hover:text-white transition-colors">{t('categories.restaurants')}</Link>
              </li>
              <li>
                <Link to="/explore?cat=projects" className="hover:text-white transition-colors">{t('categories.projects')}</Link>
              </li>
            </ul>
          </div>

          {/* Legal, CNDP & Integrity */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-lagoon-300">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2 text-sm text-sand-200/80">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sand-400 shrink-0" />
                <Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
              </li>
              <li className="pt-2 text-xs text-sand-400 leading-normal">
                Conforme à la loi marocaine 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-ocean-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-300">
          <p>{t('footer.copyright', { year: currentYear })}</p>
          <p className="flex items-center gap-1 text-sand-400">
            <span>Fait avec passion pour le Sahara Marocain</span>
            <Heart className="w-3.5 h-3.5 text-sand-500 fill-sand-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
