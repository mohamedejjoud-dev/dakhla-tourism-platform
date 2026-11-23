import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Star, 
  Clock, 
  Globe, 
  ArrowRight, 
  Waves,
  AlertCircle,
  Heart
} from 'lucide-react';
import { PlaceWithDetails } from '@/types/database';
import { useFavorites } from '@/context/FavoritesContext';

interface PlaceCardProps {
  place: PlaceWithDetails;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const { t, i18n } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isRtl = i18n.dir() === 'rtl';

  const isFav = isFavorite(place.id);
  const priceSymbols = '€'.repeat(place.price_level || 1);
  const isUnderConstruction = place.project_status === 'under_construction';
  const hasCoordinates = place.latitude !== null && place.longitude !== null;

  return (
    <article className="group bg-white rounded-2xl border border-sand-200/90 shadow-soft-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col overflow-hidden">
      
      {/* Thumbnail Image Container */}
      <div className="relative aspect-[16/10] bg-ocean-900 overflow-hidden">
        {place.primaryImageUrl ? (
          <img
            src={place.primaryImageUrl}
            alt={place.translation.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-ocean-900 to-lagoon-900 text-sand-200 p-4 text-center">
            <Waves className="w-10 h-10 text-lagoon-400 mb-2 opacity-80" />
            <span className="text-xs font-semibold tracking-wider uppercase text-sand-300">
              {place.category?.name || 'Dakhla'}
            </span>
          </div>
        )}

        {/* Floating Badges & Favorite Button */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Category Badge */}
            {place.category && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-ocean-900 shadow-sm">
                {place.category.name}
              </span>
            )}

            {/* Under Construction Badge for Mega Projects */}
            {isUnderConstruction && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                <Clock className="w-3 h-3" />
                <span>{t('status.underConstruction')}</span>
              </span>
            )}
          </div>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(place.id);
            }}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md shadow-sm transition-transform hover:scale-110 ${
              isFav ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700 hover:text-rose-500'
            }`}
            aria-label={isFav ? t('favorites.removed') : t('favorites.added')}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Fallback Language Badge */}
        {place.translation.isFallback && (
          <div className="absolute bottom-2 start-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sand-900/80 backdrop-blur-sm text-sand-100">
              <Globe className="w-3 h-3 text-sand-300" />
              <span>{t('discovery.fallbackBadge', { lang: place.translation.fallbackLang?.toUpperCase() })}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          
          {/* Rating & Price Header */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-ocean-900">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{place.avg_rating > 0 ? place.avg_rating.toFixed(1) : '—'}</span>
              <span className="text-slate-400 font-normal">
                ({place.review_count} {t('common.reviews')})
              </span>
            </div>

            <span className="font-extrabold text-sand-700 tracking-wider">
              {priceSymbols}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-ocean-900 group-hover:text-lagoon-700 transition-colors line-clamp-1">
            {place.translation.title}
          </h3>

          {/* Description Excerpt */}
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {place.translation.description}
          </p>
        </div>

        {/* Footer Info & Action Link */}
        <div className="pt-3 border-t border-sand-100 flex items-center justify-between gap-2 text-xs">
          {hasCoordinates ? (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-lagoon-600 shrink-0" />
              <span>{t('discovery.verifiedCoords')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{t('status.draftAudit')}</span>
            </span>
          )}

          <Link
            to={`/places/${place.slug}`}
            className="inline-flex items-center gap-1 font-bold text-lagoon-600 group-hover:text-lagoon-700 transition-colors"
          >
            <span>{t('common.viewDetails')}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>

      </div>
    </article>
  );
};
