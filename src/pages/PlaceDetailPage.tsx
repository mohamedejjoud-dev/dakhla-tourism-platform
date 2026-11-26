import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Star,
  Clock,
  Compass,
  MessageSquare,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Navigation
} from 'lucide-react';
import { fetchPlaceBySlug } from '@/services/tourismService';
import { fetchPlaceReviews, ReviewWithAuthor } from '@/services/reviewsService';
import { PlaceWithDetails, SupportedLanguage } from '@/types/database';
import { LeafletMap } from '@/components/map/LeafletMap';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { PlaceImageGallery } from '@/components/places/PlaceImageGallery';
import { useFavorites } from '@/context/FavoritesContext';
import { SeoMeta } from '@/components/seo/SeoMeta';

export const PlaceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isRtl = i18n.dir() === 'rtl';

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const [place, setPlace] = useState<PlaceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const loadReviews = (placeId: string) => {
    setLoadingReviews(true);
    fetchPlaceReviews(placeId).then((data) => {
      setReviews(data);
      setLoadingReviews(false);
    });
  };

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      setLoading(true);
      fetchPlaceBySlug(slug, currentLang).then((data) => {
        if (isMounted) {
          setPlace(data);
          setLoading(false);
          if (data) {
            loadReviews(data.id);
          }
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [slug, currentLang]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-lagoon-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-sand-100 text-sand-700 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 text-sand-600" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-ocean-950">{t('common.noResults')}</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">{t('discovery.noPlacesDescription')}</p>
        </div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ocean-950 hover:bg-ocean-900 text-sand-100 font-semibold text-xs tracking-wider uppercase shadow-xs transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t('details.backToPlaces')}</span>
        </Link>
      </div>
    );
  }

  const priceSymbols = '€'.repeat(place.price_level || 1);
  const isUnderConstruction = place.project_status === 'under_construction';
  const hasCoordinates = place.latitude !== null && place.longitude !== null;

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: place.translation.title,
    description: place.translation.description,
    image: place.primaryImageUrl || 'https://dakhlin.com/og-default-dakhla.webp',
    url: `https://dakhlin.com/places/${place.slug}`,
    ...(hasCoordinates ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: place.latitude,
        longitude: place.longitude,
      },
    } : {}),
    ...(place.avg_rating > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: place.avg_rating,
        reviewCount: place.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 space-y-8">
      <SeoMeta
        title={place.translation.title}
        description={place.translation.description?.substring(0, 160)}
        ogImage={place.primaryImageUrl || undefined}
        canonicalPath={`/places/${place.slug}`}
        ogType="place"
        structuredData={placeSchema}
      />

      {/* Top Header / Breadcrumb & Action Row */}
      <div className="flex items-center justify-between border-b border-sand-200/80 pb-4">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-600 hover:text-ocean-950 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t('details.backToPlaces')}</span>
        </Link>

        {/* Right Header Badges & Favorite */}
        <div className="flex items-center gap-3">
          {place.translation.isFallback && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('discovery.fallbackBadge', { lang: place.translation.fallbackLang?.toUpperCase() })}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => toggleFavorite(place.id)}
            className={`p-2.5 rounded-2xl border transition-all duration-200 hover:scale-105 shadow-xs ${isFavorite(place.id)
                ? 'bg-rose-500 text-white border-rose-500 shadow-rose-500/25'
                : 'bg-white border-sand-200 text-slate-700 hover:text-rose-500'
              }`}
            aria-label={isFavorite(place.id) ? t('favorites.removed') : t('favorites.added')}
          >
            <Heart className={`w-5 h-5 ${isFavorite(place.id) ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Place Header */}
      <div className="space-y-4 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2.5">
          {place.category && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-ocean-950 text-sand-100 font-mono">
              {place.category.name}
            </span>
          )}

          {isUnderConstruction && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('status.underConstruction')}</span>
            </span>
          )}

          <span className="font-mono font-bold text-sand-700 text-xs tracking-widest px-2.5 py-1 rounded-full bg-sand-100">
            {priceSymbols}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-ocean-950 tracking-tight leading-tight">
          {place.translation.title}
        </h1>

        {/* Rating & Address Bar */}
        <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-600 pt-1">
          <div className="flex items-center gap-1.5 font-bold text-ocean-950 font-mono">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{place.avg_rating > 0 ? place.avg_rating.toFixed(1) : '—'}</span>
            <span className="text-slate-400 font-normal">
              ({place.review_count} {t('common.reviews')})
            </span>
          </div>

          {place.translation.address_text && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-lagoon-600 shrink-0" />
              <span>{place.translation.address_text}</span>
            </div>
          )}

          {hasCoordinates && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>GPS: {Number(place.latitude).toFixed(4)}, {Number(place.longitude).toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Photo Showcase Gallery (Non-cropping, responsive, with navigation arrows & swipe) */}
      <PlaceImageGallery
        images={place.images}
        title={place.translation.title}
        categoryName={place.category?.name}
      />

      {/* Layout Split: Editorial Content & Sticky Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

        {/* Left 8 Cols: Narrative, Tips, Map & Reviews */}
        <div className="lg:col-span-8 space-y-10">

          {/* About This Destination */}
          <section className="bg-white p-8 sm:p-10 rounded-3xl border border-sand-200/90 shadow-editorial space-y-5">
            <h2 className="font-serif text-2xl font-bold text-ocean-950">
              {t('details.aboutPlace')}
            </h2>
            <div className="prose max-w-none text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base font-light">
              {place.translation.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Tags / Amenities Chips */}
            {place.tags && place.tags.length > 0 && (
              <div className="pt-4 border-t border-sand-100 flex flex-wrap gap-2">
                {place.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 rounded-xl bg-sand-50 border border-sand-200/80 text-xs font-mono text-sand-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Visitor Practical Tips */}
          {place.translation.tips && (
            <section className="bg-sand-50/90 border border-sand-200/90 p-8 sm:p-9 rounded-3xl shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-ocean-950 font-bold text-base">
                <Lightbulb className="w-5 h-5 text-sand-600 shrink-0" />
                <h3 className="font-serif text-lg">{t('details.tips')}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light">
                {place.translation.tips}
              </p>
            </section>
          )}

          {/* Embedded Leaflet Map with Coordinates */}
          {hasCoordinates && (
            <section className="bg-white p-7 sm:p-8 rounded-3xl border border-sand-200/90 shadow-editorial space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-serif font-bold text-ocean-950 text-xl">
                  <MapPin className="w-5 h-5 text-lagoon-600" />
                  <h2>{t('details.location')}</h2>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=14/${place.latitude}/${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-lagoon-700 hover:text-lagoon-800"
                >
                  <span>{t('map.openInOsm')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <LeafletMap
                places={[place]}
                selectedPlace={place}
                zoom={14}
                className="h-[360px] w-full rounded-2xl overflow-hidden border border-sand-200"
              />
            </section>
          )}

          {/* Reviews & Community Feedback Section */}
          <section className="space-y-6 pt-4 border-t border-sand-200/80">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ocean-950 tracking-tight">
                  {t('reviews.title')}
                </h2>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-mono">
                  <div className="flex items-center gap-1 font-bold text-ocean-950">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{place.avg_rating > 0 ? place.avg_rating.toFixed(1) : '—'}</span>
                  </div>
                  <span>•</span>
                  <span>{reviews.length} {t('common.reviews')}</span>
                </div>
              </div>
            </div>

            <ReviewForm placeId={place.id} onReviewSubmitted={() => loadReviews(place.id)} />
            <ReviewList reviews={reviews} loading={loadingReviews} />
          </section>

        </div>

        {/* Right 4 Cols: Sticky Action & Contact Panel */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-sand-200/90 shadow-editorial space-y-6 sticky top-28">
            <h3 className="font-serif font-bold text-xl text-ocean-950 pb-3 border-b border-sand-100">
              {t('common.contact')} & Accès
            </h3>

            {/* Direct Action Buttons */}
            <div className="space-y-3">

              {/* WhatsApp Action */}
              {place.whatsapp && (
                <a
                  href={`https://wa.me/${place.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('details.whatsappChat')}</span>
                </a>
              )}

              {/* Direct Phone Call */}
              {place.phone && (
                <a
                  href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-lagoon-600 hover:bg-lagoon-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('details.callPhone')}</span>
                </a>
              )}

              {/* Official Website */}
              {place.website_url && (
                <a
                  href={place.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50/70 hover:bg-sand-100 text-ocean-950 font-semibold text-xs tracking-wide transition-colors"
                >
                  <Globe className="w-4 h-4 text-ocean-700" />
                  <span>{t('details.visitWebsite')}</span>
                </a>
              )}

              {/* Instagram Profile */}
              {place.instagram_handle && (
                <a
                  href={`https://instagram.com/${place.instagram_handle.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50/70 hover:bg-sand-100 text-pink-700 font-semibold text-xs tracking-wide transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{place.instagram_handle}</span>
                </a>
              )}

              {/* Directions Navigation */}
              {hasCoordinates && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-ocean-950 hover:bg-ocean-900 text-sand-100 font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                >
                  <Navigation className="w-4 h-4 text-lagoon-400" />
                  <span>{t('details.getDirections')}</span>
                </a>
              )}
            </div>

            {/* Field Audit Trust Seal */}
            <div className="pt-5 border-t border-sand-100 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-lagoon-600 shrink-0" />
              <span>{t('details.verifiedAuditBadge')}</span>
            </div>

          </div>
        </aside>

      </div>

    </div>
  );
};
