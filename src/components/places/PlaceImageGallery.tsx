// src/components/places/PlaceImageGallery.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { PlaceImage } from '@/types/database';
import { toWebpUrl } from '@/lib/imageUtils';

interface Props {
  images?: PlaceImage[] | string[];
  title: string;
  categoryName?: string;
}

export const PlaceImageGallery: React.FC<Props> = ({ images = [], title, categoryName }) => {
  // Normalize images array to string URLs with WebP format enforcement
  const imageUrls: string[] = React.useMemo(() => {
    if (!images || images.length === 0) return [];
    return images.map((img) => toWebpUrl(typeof img === 'string' ? img : img.storage_path));
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fallback photography
  const FALLBACK_HERO = 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fm=webp&fit=crop&w=1200&q=80';

  // Sync index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [imageUrls.length]);

  const total = imageUrls.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation support (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45; // px threshold

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next image
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev image
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // 0 images fallback
  if (total === 0) {
    return (
      <div className="w-full h-[280px] sm:h-[380px] md:h-[480px] rounded-3xl bg-[#121E24] border border-[#E8E5DE] flex flex-col items-center justify-center text-white p-6 text-center shadow-xs">
        <Compass className="w-14 h-14 text-[#D8B67A] mb-3 opacity-60" />
        <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#F3E8D2]">
          {title}
        </span>
        <span className="text-xs text-[#D8B67A]/80 font-mono mt-1">
          {categoryName || 'Dakhla'}
        </span>
      </div>
    );
  }

  const rawUrl = imageUrls[currentIndex];
  const currentUrl = failedUrls[rawUrl] ? FALLBACK_HERO : rawUrl;

  return (
    <div className="space-y-3.5 select-none" role="region" aria-label={`Photo gallery for ${title}`}>
      
      {/* Main Image Framing Container */}
      <div 
        className="relative w-full h-[280px] sm:h-[400px] md:h-[480px] lg:h-[520px] rounded-3xl bg-[#121E24] border border-[#E8E5DE] overflow-hidden flex items-center justify-center shadow-xs"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Soft Background Blur for Ultrawide Framing */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xl scale-110 pointer-events-none transition-all duration-500"
          style={{ backgroundImage: `url(${currentUrl})` }}
          aria-hidden="true"
        />

        {/* Main Photograph: Strictly object-contain, never over-cropped or distorted */}
        <img
          key={currentUrl}
          src={currentUrl}
          alt={`${title} - Photo ${currentIndex + 1} of ${total}`}
          onError={() => {
            if (rawUrl && !failedUrls[rawUrl]) {
              setFailedUrls((prev) => ({ ...prev, [rawUrl]: true }));
            }
          }}
          className="relative z-10 max-h-full max-w-full object-contain mx-auto animate-in fade-in duration-200"
          loading="eager"
        />

        {/* Navigation Arrows (Only shown when total > 1) */}
        {total > 1 && (
          <>
            {/* Left Button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute start-3 sm:start-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#1F2933] shadow-md hover:shadow-lg border border-white/60 flex items-center justify-center transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#176B87]"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Right Button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute end-3 sm:end-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#1F2933] shadow-md hover:shadow-lg border border-white/60 flex items-center justify-center transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#176B87]"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Image Counter Badge (1 / N) */}
        {total > 1 && (
          <div className="absolute bottom-3 end-3 sm:bottom-4 sm:end-4 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-white text-[11px] font-mono tracking-wider">
            {currentIndex + 1} / {total}
          </div>
        )}

      </div>

      {/* Synchronized Thumbnails Row */}
      {total > 1 && (
        <div 
          className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none pt-0.5"
          role="tablist"
          aria-label="Thumbnail previews"
        >
          {imageUrls.map((url, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-150 ${
                  isSelected
                    ? 'border-[#176B87] scale-102 shadow-xs ring-1 ring-[#176B87] opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#E8E5DE]'
                }`}
                role="tab"
                aria-selected={isSelected}
                aria-label={`Show photo ${idx + 1}`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};
