import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, MapPin, Star } from 'lucide-react';
import { LeafletMap } from '@/components/map/LeafletMap';
import { fetchCategories, fetchPublishedPlaces } from '@/services/tourismService';
import { CategoryWithTranslation, PlaceWithDetails, SupportedLanguage } from '@/types/database';
import { SeoMeta } from '@/components/seo/SeoMeta';
import { Link } from 'react-router-dom';

export const MapPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const [categories, setCategories] = useState<CategoryWithTranslation[]>([]);
  const [places, setPlaces] = useState<PlaceWithDetails[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithDetails | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories(currentLang).then((data) => setCategories(data));
  }, [currentLang]);

  useEffect(() => {
    setLoading(true);
    fetchPublishedPlaces({
      categorySlug: activeCategory,
      lang: currentLang,
    }).then((data) => {
      setPlaces(data);
      setLoading(false);
    });
  }, [activeCategory, currentLang]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <SeoMeta
        title={t('map.title', 'Interactive Map of Dakhla')}
        description={t('map.subtitle')}
        canonicalPath="/map"
      />
      
      {/* Editorial Page Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sand-100 text-sand-800 text-xs font-mono font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-sand-600" />
          <span>{t('nav.map')} • Relevé Géographique</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ocean-950 tracking-tight leading-tight">
          {t('map.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
          {t('map.subtitle')}
        </p>
      </div>

      {/* Category Filter Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-ocean-950 text-sand-100 shadow-xs'
              : 'bg-white border border-sand-200/90 text-slate-700 hover:bg-sand-50'
          }`}
        >
          {t('discovery.allCategories')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.slug
                ? 'bg-lagoon-600 text-white shadow-xs'
                : 'bg-white border border-sand-200/90 text-slate-700 hover:bg-sand-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Map Layout: Left Explorer Panel + Right Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Side: Places List Sidebar (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-sand-200/90 shadow-editorial p-4 sm:p-5 flex flex-col h-[650px]">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold px-2 pb-3 border-b border-sand-100">
            <span>{t('discovery.placesCount', { count: places.length })}</span>
            <span className="text-[10px] text-lagoon-700 font-semibold uppercase tracking-wider">
              {places.filter(p => p.latitude !== null).length} avec GPS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pt-3 pe-1">
            {loading ? (
              <div className="py-20 text-center space-y-2">
                <div className="w-8 h-8 border-3 border-lagoon-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">{t('common.loading')}</p>
              </div>
            ) : places.length > 0 ? (
              places.map((p) => {
                const isSelected = selectedPlace?.id === p.id;
                const hasCoords = p.latitude !== null && p.longitude !== null;
                return (
                  <div
                    key={p.id}
                    onClick={() => hasCoords && setSelectedPlace(p)}
                    className={`p-3.5 rounded-2xl border text-start cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-lagoon-600 bg-sand-50/90 shadow-sm ring-1 ring-lagoon-600'
                        : 'border-sand-200/80 bg-white hover:bg-sand-50/60'
                    } ${!hasCoords ? 'opacity-65 cursor-default' : ''}`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-lagoon-700">
                      <span>{p.category?.name}</span>
                      <span className="text-sand-700">{'€'.repeat(p.price_level || 1)}</span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-ocean-950 mt-1 line-clamp-1">
                      {p.translation.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-sand-100/70">
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-lagoon-600 shrink-0" />
                        <span>{hasCoords ? t('discovery.verifiedCoords') : t('status.draftAudit')}</span>
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {p.avg_rating > 0 && (
                          <span className="flex items-center gap-0.5 font-bold text-ocean-950 font-mono">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {p.avg_rating.toFixed(1)}
                          </span>
                        )}
                        <Link
                          to={`/places/${p.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] uppercase font-bold text-lagoon-700 hover:underline"
                        >
                          Fiche →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-slate-500">{t('discovery.noPlacesDescription')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Leaflet Interactive Map (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="relative rounded-3xl overflow-hidden shadow-editorial border border-sand-200/90 bg-ocean-950">
            <LeafletMap
              places={places}
              selectedPlace={selectedPlace}
              className="h-[650px] w-full"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
