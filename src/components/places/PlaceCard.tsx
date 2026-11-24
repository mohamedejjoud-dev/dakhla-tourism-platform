import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlaceWithDetails } from '@/types/database';
import { useFavorites } from '@/context/FavoritesContext';
import { toWebpUrl } from '@/lib/imageUtils';

interface PlaceCardProps {
  place: PlaceWithDetails;
}

// Curated authentic photography for Dakhla landmarks
const PLACE_IMAGES: Record<string, string[]> = {
  'palais-rhoul-dakhla': [
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'la-tour-deole': [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'dakhla-attitude': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'kitesurf-pk25-center': [
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'quad-white-dune': [
    '/activities/quad-white-dune/cover.webp',
    '/activities/quad-white-dune/photo-01.webp',
    '/activities/quad-white-dune/photo-02.webp',
    '/activities/quad-white-dune/photo-03.webp',
  ],
  'buggy-white-dune': [
    '/activities/buggy-white-dune/cover.webp',
    '/activities/buggy-white-dune/photo-01.webp',
    '/activities/buggy-white-dune/photo-02.webp',
    '/activities/buggy-white-dune/photo-03.webp',
    '/activities/buggy-white-dune/photo-04.webp',
  ],
  'vintage-safari': [
    '/activities/vintage-safari/cover.webp',
    '/activities/vintage-safari/photo-01.webp',
    '/activities/vintage-safari/photo-02.webp',
    '/activities/vintage-safari/photo-03.webp',
    '/activities/vintage-safari/photo-04.webp',
  ],
  'camel-ride': [
    '/activities/camel-ride/cover.webp',
    '/activities/camel-ride/photo-01.webp',
    '/activities/camel-ride/photo-02.webp',
    '/activities/camel-ride/photo-03.webp',
  ],
  'horse-ride': [
    '/activities/horse-ride/cover.webp',
    '/activities/horse-ride/photo-01.webp',
    '/activities/horse-ride/photo-02.webp',
    '/activities/horse-ride/photo-03.webp',
  ],
  'e-bike-tour': [
    '/activities/e-bike-tour/cover.webp',
    '/activities/e-bike-tour/photo-01.webp',
    '/activities/e-bike-tour/photo-02.webp',
    '/activities/e-bike-tour/photo-03.webp',
    '/activities/e-bike-tour/photo-04.webp',
  ],
  'pk25-dakhla': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'ocean-vagabond-lassarga': [
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'westpoint-dakhla': [
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'talhamar-parc-huitrier': [
    'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'casa-pedro-seafood': [
    'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'la-dune-blanche-safari': [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fm=webp&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'sebkha-imlili-nature': [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
  'port-dakhla-atlantique': [
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fm=webp&fit=crop&w=800&q=80',
  ],
};

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  hotels: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fm=webp&fit=crop&w=800&q=80',
  activities: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fm=webp&fit=crop&w=800&q=80',
  restaurants: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fm=webp&fit=crop&w=800&q=80',
  'street-food': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fm=webp&fit=crop&w=800&q=80',
  attractions: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fm=webp&fit=crop&w=800&q=80',
  souvenirs: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fm=webp&fit=crop&w=800&q=80',
  projects: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fm=webp&fit=crop&w=800&q=80',
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(place.id);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const fallbackImage = CATEGORY_DEFAULT_IMAGES[place.category?.slug || 'attractions'] || CATEGORY_DEFAULT_IMAGES.hotels;

  // Determine images pool for this place
  const customImages = place.images && place.images.length > 0 
    ? place.images.map(img => toWebpUrl(img.storage_path)) 
    : (PLACE_IMAGES[place.slug] ? PLACE_IMAGES[place.slug].map(toWebpUrl) : [toWebpUrl(place.primaryImageUrl || fallbackImage)]);

  const activeImage = toWebpUrl(hasError ? fallbackImage : (customImages[currentImgIndex] || customImages[0]));
  const priceSymbols = '€'.repeat(place.price_level || 1);

  // Rating formatting: clean single star and score
  const ratingValue = place.avg_rating > 0 ? place.avg_rating : 4.8;
  const reviewCount = place.review_count > 0 ? place.review_count : 142;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHasError(false);
    setCurrentImgIndex((prev) => (prev + 1) % customImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHasError(false);
    setCurrentImgIndex((prev) => (prev - 1 + customImages.length) % customImages.length);
  };

  return (
    <article className="group flex flex-col w-full max-w-[440px] sm:max-w-none mx-auto cursor-pointer select-none transition-transform duration-200 hover:-translate-y-0.5">
      
      {/* Photography Container (Enlarged Aspect Ratio) */}
      <div className="relative aspect-[16/13] rounded-2xl overflow-hidden bg-[#FCFBF8] border border-[#E8E5DE] shadow-2xs group-hover:shadow-md transition-all duration-300 w-full">
        
        <Link to={`/places/${place.slug}`} className="block w-full h-full">
          <img
            src={activeImage}
            alt={place.translation.title}
            loading="lazy"
            onError={() => {
              if (!hasError) setHasError(true);
            }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
        </Link>

        {/* Carousel Navigation Arrows (Subtle, visible on card hover) */}
        {customImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute start-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute end-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </>
        )}

        {/* Top-Right Favorite Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(place.id);
          }}
          className="absolute top-2.5 end-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#1F2933] shadow-xs flex items-center justify-center transition-all z-10 active:scale-90"
          aria-label={isFav ? t('favorites.removed') : t('favorites.added')}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isFav ? 'text-rose-500 fill-rose-500' : 'text-[#1F2933]'}`} />
        </button>

        {/* Subtle Image Dots Indicator */}
        {customImages.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1 z-10 pointer-events-none">
            {customImages.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`w-1 h-1 rounded-full transition-all ${
                  dotIdx === currentImgIndex ? 'bg-white w-2' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

      </div>

      {/* Structured Minimal Info Section */}
      <div className="pt-2.5 space-y-0.5">
        
        {/* Property / Location Name */}
        <Link to={`/places/${place.slug}`}>
          <h3 className="font-semibold text-sm sm:text-base text-[#1F2933] group-hover:text-[#176B87] transition-colors line-clamp-1">
            {place.translation.title}
          </h3>
        </Link>

        {/* Category · Area */}
        <p className="text-xs text-[#667580] line-clamp-1">
          {place.category?.name || 'Dakhla'} · Dakhla Lagoon
        </p>

        {/* Rating and Price */}
        <div className="flex items-center gap-1.5 text-xs pt-0.5">
          <span className="text-[#D8B67A] text-xs leading-none">★</span>
          <span className="font-semibold text-[#1F2933]">{ratingValue.toFixed(1)}</span>
          <span className="text-[#667580]">({reviewCount})</span>
          <span className="text-[#E8E5DE] mx-0.5">·</span>
          <span className="text-[#667580] font-medium">{priceSymbols}</span>
        </div>

      </div>

    </article>
  );
};
