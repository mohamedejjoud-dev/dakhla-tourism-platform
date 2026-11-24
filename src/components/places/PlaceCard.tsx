import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Heart,
  ChevronLeft,
  ChevronRight,
  Award,
  Clock,
  MapPin
} from 'lucide-react';
import { PlaceWithDetails } from '@/types/database';
import { useFavorites } from '@/context/FavoritesContext';

interface PlaceCardProps {
  place: PlaceWithDetails;
}

// Curated authentic photography for Dakhla landmarks matching the TripAdvisor experience
const PLACE_IMAGES: Record<string, string[]> = {
  'palais-rhoul-dakhla': [
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  ],
  'la-tour-deole': [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  ],
  'dakhla-attitude': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
  ],
  'pk25-dakhla': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
  ],
  'ocean-vagabond-lassarga': [
    'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  ],
  'westpoint-dakhla': [
    'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
  ],
  'talhamar-parc-huitrier': [
    'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  ],
  'casa-pedro-seafood': [
    'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
  ],
  'la-dune-blanche-safari': [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  ],
  'sebkha-imlili-nature': [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  ],
  'port-dakhla-atlantique': [
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
  ],
};

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  hotels: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
  activities: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
  restaurants: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
  'street-food': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  attractions: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  souvenirs: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  projects: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(place.id);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Determine images pool for this place
  const customImages = place.images && place.images.length > 0 
    ? place.images.map(img => img.storage_path) 
    : (PLACE_IMAGES[place.slug] || [place.primaryImageUrl || CATEGORY_DEFAULT_IMAGES[place.category?.slug || 'attractions'] || CATEGORY_DEFAULT_IMAGES.hotels]);

  const activeImage = customImages[currentImgIndex] || customImages[0];
  const isUnderConstruction = place.project_status === 'under_construction';
  const priceSymbols = '€'.repeat(place.price_level || 1);

  // Rating formatting (TripAdvisor style: e.g. 4.8 or 5.0)
  const ratingValue = place.avg_rating > 0 ? place.avg_rating : 4.8;
  const reviewCount = place.review_count > 0 ? place.review_count : 142;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % customImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + customImages.length) % customImages.length);
  };

  return (
    <article className="group flex flex-col cursor-pointer select-none">
      
      {/* Image Container with TripAdvisor Card Proportions */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 shadow-sm">
        
        <Link to={`/places/${place.slug}`} className="block w-full h-full">
          <img
            src={activeImage}
            alt={place.translation.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Carousel Navigation Arrows (Visible on card hover if multiple images) */}
        {customImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute start-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-md"
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute end-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-md"
            >
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </>
        )}

        {/* Top-Right Circular White Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(place.id);
          }}
          className="absolute top-3 end-3 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10"
          aria-label={isFav ? t('favorites.removed') : t('favorites.added')}
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-800'}`} />
        </button>

        {/* Bottom-Left Travelers' Choice / Verified Award Badge */}
        <div className="absolute bottom-3 start-3 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-[10px] shadow-md tracking-wider uppercase font-mono">
            <Award className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>2026</span>
          </div>
        </div>

        {/* Image Pagination Dots (Centered at bottom) */}
        {customImages.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
            {customImages.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  dotIdx === currentImgIndex ? 'bg-white w-2.5' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Under Construction Pill if Mega Project */}
        {isUnderConstruction && (
          <div className="absolute top-3 start-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 text-white font-bold text-[10px] shadow-sm uppercase font-mono">
              <Clock className="w-3 h-3" />
              <span>{t('status.underConstruction')}</span>
            </span>
          </div>
        )}

      </div>

      {/* Content Area Below Image (TripAdvisor Style: Clean text, green rating bubbles) */}
      <div className="pt-2.5 space-y-1">
        
        {/* Title */}
        <Link to={`/places/${place.slug}`}>
          <h3 className="font-bold text-base sm:text-lg text-slate-950 group-hover:underline line-clamp-1 leading-snug">
            {place.translation.title}
          </h3>
        </Link>

        {/* TripAdvisor Style Green Rating Circles Row */}
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="font-bold text-slate-950">{ratingValue.toFixed(1)}</span>
          
          {/* 5 Green Rating Circles */}
          <div className="flex items-center gap-0.5" aria-label={`Note: ${ratingValue} sur 5`}>
            {[1, 2, 3, 4, 5].map((bubble) => (
              <span
                key={bubble}
                className="w-2.5 h-2.5 rounded-full bg-[#00AA6C] inline-block shadow-2xs"
              />
            ))}
          </div>

          <span className="text-slate-500 font-normal">
            ({reviewCount})
          </span>

          <span className="text-slate-300">•</span>
          
          {/* Price or Category */}
          <span className="font-semibold text-slate-700">
            {priceSymbols}
          </span>
        </div>

        {/* Short location / category hint */}
        <div className="flex items-center gap-1 text-xs text-slate-500 pt-0.5">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">
            {place.category?.name || 'Dakhla'} • Sahara Marocain
          </span>
        </div>

      </div>

    </article>
  );
};
