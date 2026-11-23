import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Compass, 
  MapPin, 
  ShieldCheck, 
  Globe2, 
  Waves, 
  SunMedium, 
  Building2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const categoryCards = [
    { key: 'hotels', icon: SunMedium, color: 'from-sand-500 to-sand-600' },
    { key: 'activities', icon: Waves, color: 'from-lagoon-500 to-lagoon-700' },
    { key: 'restaurants', icon: Compass, color: 'from-ocean-500 to-ocean-700' },
    { key: 'projects', icon: Building2, color: 'from-slate-700 to-ocean-900' },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: t('features.verifiedTitle'),
      desc: t('features.verifiedDesc'),
    },
    {
      icon: Globe2,
      title: t('features.trilingualTitle'),
      desc: t('features.trilingualDesc'),
    },
    {
      icon: Sparkles,
      title: t('features.ecoTitle'),
      desc: t('features.ecoDesc'),
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ocean-900 via-ocean-800 to-ocean-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-lagoon-500 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-sand-500 blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-sand-200">
            <span className="w-2 h-2 rounded-full bg-lagoon-400 animate-pulse"></span>
            <span>{t('hero.badge')}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-sand-100/90 leading-relaxed font-normal">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-lagoon-600 hover:bg-lagoon-500 text-white font-bold text-base shadow-lg shadow-lagoon-600/30 transition-all duration-150 hover:-translate-y-0.5"
            >
              <Compass className="w-5 h-5" />
              <span>{t('hero.exploreButton')}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>

            <Link
              to="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 backdrop-blur-sm transition-all duration-150"
            >
              <MapPin className="w-5 h-5 text-lagoon-300" />
              <span>{t('hero.mapButton')}</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ocean-900 tracking-tight">
            {t('nav.categories')}
          </h2>
          <div className="w-16 h-1 bg-lagoon-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                to={`/explore?cat=${cat.key}`}
                className="group relative p-6 rounded-2xl bg-white border border-sand-200/80 shadow-soft-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ocean-900 text-lg group-hover:text-lagoon-700 transition-colors">
                      {t(`categories.${cat.key}`)}
                    </h3>
                    <span className="text-xs text-sand-600 font-medium flex items-center gap-1 mt-1">
                      <span>{t('common.viewDetails')}</span>
                      <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Platform Pillars / Trust Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-sand-200/90 shadow-sm space-y-4 hover:border-lagoon-400 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-lagoon-50 text-lagoon-700 flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-ocean-900">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
