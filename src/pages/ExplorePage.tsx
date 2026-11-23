import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  MapPin, 
  Sparkles, 
  X,
  Compass
} from 'lucide-react';
import { PlaceCard } from '@/components/places/PlaceCard';
import { fetchCategories, fetchPublishedPlaces } from '@/services/tourismService';
import { CategoryWithTranslation, PlaceWithDetails, SupportedLanguage } from '@/types/database';
import { SeoMeta } from '@/components/seo/SeoMeta';

export const ExplorePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const [categories, setCategories] = useState<CategoryWithTranslation[]>([]);
  const [places, setPlaces] = useState<PlaceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters from URL query params
  const activeCategory = searchParams.get('cat') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const priceFilter = searchParams.get('price') ? Number(searchParams.get('price')) : undefined;
  const projectStatusFilter = searchParams.get('status') || 'all';

  // Load categories
  useEffect(() => {
    let isMounted = true;
    fetchCategories(currentLang).then((data) => {
      if (isMounted) setCategories(data);
    });
    return () => {
      isMounted = false;
    };
  }, [currentLang]);

  // Load published places with filters
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublishedPlaces({
      categorySlug: activeCategory,
      searchQuery,
      priceLevel: priceFilter,
      projectStatus: projectStatusFilter,
      lang: currentLang,
    }).then((data) => {
      if (isMounted) {
        setPlaces(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, searchQuery, priceFilter, projectStatusFilter, currentLang]);

  const updateParam = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SeoMeta
        title={t('discovery.title', 'Explore Dakhla — Places, Hotels & Experiences')}
        description={t('discovery.subtitle')}
        canonicalPath="/explore"
      />
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lagoon-50 text-lagoon-700 text-xs font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>{t('nav.explore')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ocean-900 tracking-tight">
          {t('discovery.title')}
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          {t('discovery.subtitle')}
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-sand-200/90 shadow-sm space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder={t('discovery.search')}
            className="w-full ps-11 pe-10 py-3 rounded-xl border border-sand-200 bg-sand-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lagoon-500/20 focus:border-lagoon-500 transition-colors text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => updateParam('q', null)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroll / Wrap */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => updateParam('cat', 'all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-ocean-900 text-white shadow-sm'
                : 'bg-sand-100/70 text-slate-700 hover:bg-sand-200/80'
            }`}
          >
            {t('discovery.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('cat', cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-lagoon-600 text-white shadow-sm'
                  : 'bg-sand-100/70 text-slate-700 hover:bg-sand-200/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters (Price Level & Project Status) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-sand-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>{t('discovery.filterByPrice')}:</span>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((p) => (
              <button
                key={p}
                onClick={() => updateParam('price', priceFilter === p ? null : String(p))}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                  priceFilter === p
                    ? 'bg-sand-600 text-white border-sand-600'
                    : 'bg-white border-sand-200 text-slate-600 hover:bg-sand-50'
                }`}
              >
                {'€'.repeat(p)}
              </button>
            ))}
          </div>

          {/* Project Status Filter */}
          <select
            value={projectStatusFilter}
            onChange={(e) => updateParam('status', e.target.value)}
            className="ms-auto px-3 py-1.5 rounded-lg border border-sand-200 bg-white text-slate-700 font-medium focus:outline-none text-xs"
          >
            <option value="all">{t('discovery.allProjects')}</option>
            <option value="operational">{t('status.operational')}</option>
            <option value="under_construction">{t('status.underConstruction')}</option>
          </select>
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span className="font-semibold text-ocean-900">
          {t('discovery.placesCount', { count: places.length })}
        </span>

        {(activeCategory !== 'all' || searchQuery || priceFilter || projectStatusFilter !== 'all') && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-lagoon-600 hover:text-lagoon-700 font-bold underline"
          >
            {t('discovery.resetFilters')}
          </button>
        )}
      </div>

      {/* Places Grid or Empty State */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-lagoon-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 font-medium">{t('common.loading')}</p>
        </div>
      ) : places.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="py-16 px-6 text-center bg-white rounded-2xl border border-sand-200/90 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sand-100 text-sand-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 text-sand-500" />
          </div>
          <h3 className="text-lg font-bold text-ocean-900">
            {t('discovery.noPlacesFound')}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('discovery.noPlacesDescription')}
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lagoon-600 hover:bg-lagoon-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>{t('discovery.resetFilters')}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
