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
  Calendar,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { fetchPlaceBySlug } from '@/services/tourismService';
import { fetchPlaceReviews, ReviewWithAuthor } from '@/services/reviewsService';
import { PlaceWithDetails, SupportedLanguage } from '@/types/database';
import { LeafletMap } from '@/components/map/LeafletMap';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
          setSelectedImage(data?.primaryImageUrl || null);
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-lagoon-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-ocean-900">{t('common.noResults')}</h2>
        <p className="text-slate-600">{t('discovery.noPlacesDescription')}</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lagoon-600 text-white font-bold text-sm"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SeoMeta
        title={place.translation.title}
        description={place.translation.description?.substring(0, 160)}
        ogImage={place.primaryImageUrl || undefined}
        canonicalPath={`/places/${place.slug}`}
        ogType="place"
        structuredData={placeSchema}
      />
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ocean-900 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t('details.backToPlaces')}</span>
        </Link>

        {/* Right Header Actions: Fallback Badge & Favorite Button */}
        <div className="flex items-center gap-2">
          {place.translation.isFallback && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('discovery.fallbackBadge', { lang: place.translation.fallbackLang?.toUpperCase() })}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => toggleFavorite(place.id)}
            className={`p-2.5 rounded-full border transition-transform hover:scale-110 shadow-sm ${
              isFavorite(place.id) ? 'bg-rose-500 text-white border-rose-500' : 'bg-white border-sand-200 text-slate-700 hover:text-rose-500'
            }`}
            aria-label={isFavorite(place.id) ? t('favorites.removed') : t('favorites.added')}
          >
            <Heart className={`w-5 h-5 ${isFavorite(place.id) ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Place Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {place.category && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lagoon-50 text-lagoon-700">
              {place.category.name}
            </span>
          )}

          {isUnderConstruction && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
              <Clock className="w-3 h-3" />
              <span>{t('status.underConstruction')}</span>
            </span>
          )}

          <span className="font-extrabold text-sand-700 text-sm tracking-wider">
            {priceSymbols}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-ocean-900 tracking-tight">
          {place.translation.title}
        </h1>

        {/* Rating & Address Summary */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-ocean-900">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{place.avg_rating > 0 ? place.avg_rating.toFixed(1) : '—'}</span>
            <span className="text-slate-400 font-normal">
              ({place.review_count} {t('common.reviews')})
            </span>
          </div>

          {place.translation.address_text && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-lagoon-600" />
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

      {/* Photo Gallery & Showcase */}
      <div className="space-y-4">
        <div className="relative aspect-[16/9] md:aspect-[21/9] bg-ocean-900 rounded-2xl overflow-hidden shadow-lg border border-sand-200">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={place.translation.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-ocean-900 to-lagoon-900 text-white">
              <Compass className="w-16 h-16 text-lagoon-400 mb-2 opacity-80" />
              <span className="text-sm font-semibold tracking-wider uppercase text-sand-300">
                {place.translation.title}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails row */}
        {place.images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {place.images.map((img) => {
              const url = img.storage_path;
              return (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(url)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                    selectedImage === url ? 'border-lagoon-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={img.caption || ''} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Layout Split: Content & Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Cols: Description, Tips & Map */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Description Section */}
          <section className="space-y-4 bg-white p-8 rounded-2xl border border-sand-200/90 shadow-sm">
            <h2 className="text-xl font-bold text-ocean-900">
              {t('details.aboutPlace')}
            </h2>
            <div className="prose max-w-none text-slate-700 leading-relaxed space-y-4 text-base">
              {place.translation.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {/* Visitor Tips Section */}
          {place.translation.tips && (
            <section className="bg-sand-50/80 border border-sand-200 p-8 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-sand-800 font-bold text-base">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h3>{t('details.tips')}</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {place.translation.tips}
              </p>
            </section>
          )}

          {/* Mega Project Details Card */}
          {place.project_status !== 'operational' && (
            <section className="bg-ocean-50/60 border border-ocean-200/80 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-ocean-900 font-bold text-base">
                <Calendar className="w-5 h-5 text-ocean-700" />
                <h3>{t('details.projectInfo')}</h3>
              </div>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong className="text-ocean-900">{t('details.completionDate')}: </strong>
                  {place.project_completion_date || t('status.underConstruction')}
                </p>
              </div>
            </section>
          )}

          {/* Embedded Leaflet Map */}
          {hasCoordinates && (
            <section className="space-y-4 bg-white p-6 rounded-2xl border border-sand-200/90 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-ocean-900 text-lg">
                  <MapPin className="w-5 h-5 text-lagoon-600" />
                  <h2>{t('details.location')}</h2>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=14/${place.latitude}/${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-lagoon-600 hover:text-lagoon-700"
                >
                  <span>{t('map.openInOsm')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <LeafletMap
                places={[place]}
                selectedPlace={place}
                zoom={14}
                className="h-[350px] w-full rounded-xl overflow-hidden border border-sand-200"
              />
            </section>
          )}

          {/* Reviews & Visitor Feedback Section */}
          <section className="space-y-6 pt-6 border-t border-sand-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-ocean-900 tracking-tight">
                  {t('reviews.title')}
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1 font-bold text-amber-600">
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

        {/* Right Col: Contact & Action Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-sand-200/90 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-bold text-lg text-ocean-900 pb-2 border-b border-sand-100">
              {t('common.contact')}
            </h3>

            {/* Action Buttons */}
            <div className="space-y-3">
              
              {/* WhatsApp */}
              {place.whatsapp && (
                <a
                  href={`https://wa.me/${place.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('details.whatsappChat')}</span>
                </a>
              )}

              {/* Phone */}
              {place.phone && (
                <a
                  href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-lagoon-600 hover:bg-lagoon-500 text-white font-bold text-sm shadow-md transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('details.callPhone')}</span>
                </a>
              )}

              {/* Website */}
              {place.website_url && (
                <a
                  href={place.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-sand-200 bg-sand-50 hover:bg-sand-100 text-ocean-900 font-semibold text-sm transition-colors"
                >
                  <Globe className="w-4 h-4 text-ocean-700" />
                  <span>{t('details.visitWebsite')}</span>
                </a>
              )}

              {/* Instagram */}
              {place.instagram_handle && (
                <a
                  href={`https://instagram.com/${place.instagram_handle.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-sand-200 bg-sand-50 hover:bg-sand-100 text-pink-700 font-semibold text-sm transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{place.instagram_handle}</span>
                </a>
              )}

              {/* Directions */}
              {hasCoordinates && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-ocean-800 bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-sm shadow-md transition-colors"
                >
                  <Compass className="w-4 h-4 text-sand-300" />
                  <span>{t('details.getDirections')}</span>
                </a>
              )}
            </div>

            {/* Trust and Safety Badge */}
            <div className="pt-4 border-t border-sand-100 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-lagoon-600 shrink-0" />
              <span>{t('details.verifiedAuditBadge')}</span>
            </div>

          </div>
        </aside>

      </div>

    </div>
  );
};
