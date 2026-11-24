import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Sparkles,
  X,
  Compass,
  RotateCcw,
  ChevronDown
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

  const hasActiveFilters = Boolean(
    activeCategory !== 'all' ||
    searchQuery ||
    priceFilter !== undefined ||
    projectStatusFilter !== 'all'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-10">
      <SeoMeta
        title={t('discovery.title', 'Explore Dakhla — Places, Hotels & Experiences')}
        description={t('discovery.subtitle')}
        canonicalPath="/explore"
      />

      {/* Editorial Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sand-100 text-sand-800 text-xs font-mono font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-sand-600" />
          <span>{t('nav.explore')} • Catalogue Officiel</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ocean-950 tracking-tight leading-tight">
          {t('discovery.title')}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
          {t('discovery.subtitle')}
        </p>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sand-200/90 shadow-editorial space-y-5">

        {/* Top Search Input */}
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder={t('discovery.search')}
            className="w-full ps-12 pe-11 py-3.5 rounded-2xl border border-sand-200/90 bg-sand-50/40 text-ocean-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lagoon-500/20 focus:border-lagoon-500 transition-colors text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => updateParam('q', null)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-sand-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroll Strip */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              onClick={() => updateParam('cat', 'all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-all duration-150 ${activeCategory === 'all'
                  ? 'bg-ocean-950 text-sand-100 shadow-xs'
                  : 'bg-sand-50 border border-sand-200/80 text-slate-700 hover:bg-sand-100 hover:text-ocean-950'
                }`}
            >
              {t('discovery.allCategories')}
            </button>

            {categories.map((cat) => {
              const isSelected = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateParam('cat', cat.slug)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-150 ${isSelected
                      ? 'bg-lagoon-600 text-white shadow-xs'
                      : 'bg-sand-50 border border-sand-200/80 text-slate-700 hover:bg-sand-100 hover:text-ocean-950'
                    }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Line (Price Level & Project Status) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-sand-100 text-xs">

          {/* Price Selector */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500 uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('discovery.filterByPrice')}:</span>
            </span>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((p) => {
                const isSelected = priceFilter === p;
                return (
                  <button
                    key={p}
                    onClick={() => updateParam('price', priceFilter === p ? null : String(p))}
                    className={`px-3 py-1.5 rounded-lg font-mono font-bold border transition-colors ${isSelected
                        ? 'bg-sand-600 text-white border-sand-600 shadow-xs'
                        : 'bg-white border-sand-200/80 text-slate-600 hover:bg-sand-50'
                      }`}
                  >
                    {'€'.repeat(p)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Status Dropdown & Reset */}
          <div className="flex items-center gap-3 ms-auto">
            <div className="relative">
              <select
                value={projectStatusFilter}
                onChange={(e) => updateParam('status', e.target.value)}
                className="appearance-none ps-3 pe-8 py-2 rounded-xl border border-sand-200/90 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-lagoon-500/20 text-xs"
              >
                <option value="all">{t('discovery.allProjects')}</option>
                <option value="operational">{t('status.operational')}</option>
                <option value="under_construction">{t('status.underConstruction')}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                title={t('discovery.resetFilters')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('discovery.resetFilters')}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 px-1">
        <span className="font-mono font-bold text-ocean-950 uppercase tracking-wider">
          {t('discovery.placesCount', { count: places.length })}
        </span>
      </div>

      {/* Places Grid or Rich Empty State */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-lagoon-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-slate-500 font-mono uppercase tracking-widest">{t('common.loading')}</p>
        </div>
      ) : places.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="py-20 px-8 text-center bg-white rounded-3xl border border-sand-200/90 shadow-editorial max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-sand-100 text-sand-700 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 text-sand-600" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-ocean-950">
              {t('discovery.noPlacesFound')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              {t('discovery.noPlacesDescription')}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ocean-950 hover:bg-ocean-900 text-sand-100 font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sand-300" />
              <span>{t('discovery.resetFilters')}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
