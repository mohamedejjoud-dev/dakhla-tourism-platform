import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  SlidersHorizontal,
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 space-y-6 sm:space-y-8">
      <SeoMeta
        title={t('discovery.title', 'Explore Dakhla — Places, Hotels & Experiences')}
        description={t('discovery.subtitle')}
        canonicalPath="/explore"
      />

      {/* Header */}
      <div className="space-y-1.5 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B87] uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Dakhlin Guide</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F2933] tracking-tight">
          {t('discovery.title')}
        </h1>

        <p className="text-xs sm:text-sm text-[#667580] leading-relaxed">
          {t('discovery.subtitle')}
        </p>
      </div>

      {/* Compact Filters & Search Bar */}
      <div className="space-y-3">
        
        {/* Search Input Row */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667580]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder={t('discovery.search')}
              className="w-full ps-10 pe-9 py-2 rounded-full border border-[#E8E5DE] bg-white text-[#1F2933] placeholder:text-[#667580] focus:outline-none focus:ring-1 focus:ring-[#176B87] focus:border-[#176B87] transition-all text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => updateParam('q', null)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#667580] hover:text-[#1F2933] p-1 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-medium transition-colors shrink-0 ${
              showAdvancedFilters || priceFilter !== undefined || projectStatusFilter !== 'all'
                ? 'bg-[#176B87] text-white border-[#176B87]'
                : 'bg-white border-[#E8E5DE] text-[#1F2933] hover:bg-[#FCFBF8]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtres</span>
            {(priceFilter !== undefined || projectStatusFilter !== 'all') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8B67A]" />
            )}
          </button>
        </div>

        {/* Compact Horizontal Category Filter Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => updateParam('cat', 'all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-[#176B87] text-white'
                : 'bg-white border border-[#E8E5DE] text-[#667580] hover:text-[#1F2933] hover:bg-[#FCFBF8]'
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#176B87] text-white'
                    : 'bg-white border border-[#E8E5DE] text-[#667580] hover:text-[#1F2933] hover:bg-[#FCFBF8]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="p-3.5 rounded-2xl bg-white border border-[#E8E5DE] flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
            
            {/* Price Level */}
            <div className="flex items-center gap-2">
              <span className="text-[#667580] font-medium">Prix:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((p) => {
                  const isSelected = priceFilter === p;
                  return (
                    <button
                      key={p}
                      onClick={() => updateParam('price', priceFilter === p ? null : String(p))}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#176B87] text-white border-[#176B87]'
                          : 'bg-white border-[#E8E5DE] text-[#1F2933] hover:bg-[#FCFBF8]'
                      }`}
                    >
                      {'€'.repeat(p)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status & Reset */}
            <div className="flex items-center gap-2.5 ms-auto">
              <div className="relative">
                <select
                  value={projectStatusFilter}
                  onChange={(e) => updateParam('status', e.target.value)}
                  className="appearance-none ps-3 pe-7 py-1.5 rounded-xl border border-[#E8E5DE] bg-white text-[#1F2933] font-medium focus:outline-none focus:ring-1 focus:ring-[#176B87] text-xs"
                >
                  <option value="all">{t('discovery.allProjects')}</option>
                  <option value="operational">{t('status.operational')}</option>
                  <option value="under_construction">{t('status.underConstruction')}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#667580] absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                  title={t('discovery.resetFilters')}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Results Count Line */}
      <div className="text-xs text-[#667580] font-medium">
        {t('discovery.placesCount', { count: places.length })}
      </div>

      {/* Responsive Place Cards Grid (Auto-balances 1, 2, or 3+ cards without awkward gaps) */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-7 h-7 border-2 border-[#176B87] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#667580]">{t('common.loading')}</p>
        </div>
      ) : places.length > 0 ? (
        places.length === 1 ? (
          <div className="max-w-[360px] sm:max-w-[400px]">
            <PlaceCard place={places[0]} />
          </div>
        ) : places.length === 2 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-5 sm:gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )
      ) : (
        <div className="py-14 px-6 text-center bg-white rounded-2xl border border-[#E8E5DE] max-w-md mx-auto space-y-3">
          <h3 className="text-base font-bold text-[#1F2933]">
            {t('discovery.noPlacesFound')}
          </h3>
          <p className="text-xs text-[#667580] leading-relaxed">
            {t('discovery.noPlacesDescription')}
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#176B87] text-white font-medium text-xs transition-colors hover:bg-[#13586F]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('discovery.resetFilters')}</span>
          </button>
        </div>
      )}

    </div>
  );
};
