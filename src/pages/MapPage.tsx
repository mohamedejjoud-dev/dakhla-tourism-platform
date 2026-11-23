import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, MapPin } from 'lucide-react';
import { LeafletMap } from '@/components/map/LeafletMap';
import { fetchCategories, fetchPublishedPlaces } from '@/services/tourismService';
import { CategoryWithTranslation, PlaceWithDetails, SupportedLanguage } from '@/types/database';
import { SeoMeta } from '@/components/seo/SeoMeta';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SeoMeta
        title={t('map.title', 'Interactive Map of Dakhla')}
        description={t('map.subtitle')}
        canonicalPath="/map"
      />
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lagoon-50 text-lagoon-700 text-xs font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>{t('nav.map')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ocean-900 tracking-tight">
          {t('map.title')}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          {t('map.subtitle')}
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-ocean-900 text-white shadow-sm'
              : 'bg-white border border-sand-200 text-slate-700 hover:bg-sand-50'
          }`}
        >
          {t('discovery.allCategories')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat.slug
                ? 'bg-lagoon-600 text-white shadow-sm'
                : 'bg-white border border-sand-200 text-slate-700 hover:bg-sand-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Places List */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pe-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
            <span>{t('discovery.placesCount', { count: places.length })}</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {t('common.loading')}
            </div>
          ) : places.length > 0 ? (
            places.map((p) => {
              const isSelected = selectedPlace?.id === p.id;
              const hasCoords = p.latitude !== null && p.longitude !== null;
              return (
                <div
                  key={p.id}
                  onClick={() => hasCoords && setSelectedPlace(p)}
                  className={`p-3 rounded-xl border text-start cursor-pointer transition-all ${
                    isSelected
                      ? 'border-lagoon-600 bg-lagoon-50/50 shadow-sm'
                      : 'border-sand-200 bg-white hover:bg-sand-50'
                  } ${!hasCoords ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-lagoon-700">
                    <span>{p.category?.name}</span>
                    <span className="text-sand-700">{'€'.repeat(p.price_level || 1)}</span>
                  </div>
                  <h4 className="font-bold text-sm text-ocean-900 mt-1 line-clamp-1">
                    {p.translation.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-lagoon-600" />
                      {hasCoords ? t('discovery.verifiedCoords') : t('status.draftAudit')}
                    </span>
                    <span>★ {p.avg_rating > 0 ? p.avg_rating.toFixed(1) : '—'}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 bg-white rounded-xl border border-sand-200 text-center space-y-2">
              <p className="text-xs text-slate-500">{t('discovery.noPlacesDescription')}</p>
            </div>
          )}
        </div>

        {/* Right Side: Leaflet Interactive Map */}
        <div className="lg:col-span-3">
          <LeafletMap
            places={places}
            selectedPlace={selectedPlace}
            className="h-[600px] w-full rounded-2xl overflow-hidden shadow-lg border border-sand-200"
          />
        </div>

      </div>

    </div>
  );
};
