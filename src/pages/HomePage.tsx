import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Waves, 
  Utensils, 
  Hotel 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeoMeta } from '@/components/seo/SeoMeta';
import { PlaceCard } from '@/components/places/PlaceCard';
import { fetchPublishedPlaces } from '@/services/tourismService';
import { PlaceWithDetails, SupportedLanguage } from '@/types/database';
import { getCuratedPlaces } from '@/services/curatedPlaces';
import { WindTideBar } from '@/components/common/WindTideBar';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const [livePlaces, setLivePlaces] = useState<PlaceWithDetails[]>([]);
  const [foodBranch, setFoodBranch] = useState<'all' | 'street-food' | 'restaurants'>('all');

  useEffect(() => {
    fetchPublishedPlaces({ lang: currentLang }).then((data) => {
      setLivePlaces(data);
    });
  }, [currentLang]);

  // Curated showcase places with verified authentic photography and GPS
  const hotelPlaces: PlaceWithDetails[] = [
    {
      id: 'h-04',
      category_id: '11111111-0001-0000-0000-000000000001',
      slug: 'palais-rhoul',
      latitude: 23.694,
      longitude: -15.9334,
      price_level: 4,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['luxury', 'palace', 'oceanfront', 'spa'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.8,
      review_count: 456,
      primaryImageUrl: '/hotels/palais-rhoul/cover.webp',
      category: { id: 'c-1', slug: 'hotels', name: t('categories.hotels') },
      translation: {
        title: 'Palais Rhoul Dakhla — Palace & Spa',
        description: 'Hôtel de prestige en front de mer avec architecture saharienne raffinée, piscine panoramique et suites luxueuses.',
        isFallback: false,
      },
      images: [
        { id: 'img-pr-1', place_id: 'h-04', storage_path: '/hotels/palais-rhoul/cover.webp', display_order: 1, is_primary: true },
        { id: 'img-pr-2', place_id: 'h-04', storage_path: '/hotels/palais-rhoul/pool.webp', display_order: 2, is_primary: false },
        { id: 'img-pr-3', place_id: 'h-04', storage_path: '/hotels/palais-rhoul/room-01.webp', display_order: 3, is_primary: false },
      ],
    },
    {
      id: 'h-02',
      category_id: '11111111-0001-0000-0000-000000000001',
      slug: 'la-tour-deole',
      latitude: 23.7374,
      longitude: -15.7836,
      price_level: 4,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['ecolodge', 'dunes', 'lagoon', 'pool'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.9,
      review_count: 327,
      primaryImageUrl: '/hotels/la-tour-deole/cover.webp',
      category: { id: 'c-1', slug: 'hotels', name: t('categories.hotels') },
      translation: {
        title: "La Tour d'Éole Ecolodge & Spa",
        description: 'Écolodge de grand luxe niché entre désert et lagune avec villas en bois, piscine privée et restaurant bistronomique.',
        isFallback: false,
      },
      images: [
        { id: 'img-te-1', place_id: 'h-02', storage_path: '/hotels/la-tour-deole/cover.webp', display_order: 1, is_primary: true },
        { id: 'img-te-2', place_id: 'h-02', storage_path: '/hotels/la-tour-deole/pool.webp', display_order: 2, is_primary: false },
        { id: 'img-te-3', place_id: 'h-02', storage_path: '/hotels/la-tour-deole/room-01.webp', display_order: 3, is_primary: false },
      ],
    },
    {
      id: 'h-09',
      category_id: '11111111-0001-0000-0000-000000000001',
      slug: 'tulum-beach',
      latitude: 23.7713,
      longitude: -15.9237,
      price_level: 4,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['resort', 'luxury', 'beachfront', 'pool', 'spa'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.9,
      review_count: 390,
      primaryImageUrl: '/hotels/tulum-beach/cover.webp',
      category: { id: 'c-1', slug: 'hotels', name: t('categories.hotels') },
      translation: {
        title: 'Tulum Beach Resort & Spa',
        description: "Resort 5 étoiles bohème chic en bord de plage à Oum Lambouir avec pavillons d'exception et piscines lagon.",
        isFallback: false,
      },
      images: [
        { id: 'img-tb-1', place_id: 'h-09', storage_path: '/hotels/tulum-beach/cover.webp', display_order: 1, is_primary: true },
        { id: 'img-tb-2', place_id: 'h-09', storage_path: '/hotels/tulum-beach/pool.webp', display_order: 2, is_primary: false },
        { id: 'img-tb-3', place_id: 'h-09', storage_path: '/hotels/tulum-beach/room-01.webp', display_order: 3, is_primary: false },
      ],
    },
  ] as unknown as PlaceWithDetails[];

  const activityPlaces: PlaceWithDetails[] = React.useMemo(() => {
    const acts = getCuratedPlaces(currentLang, 'activities');
    return acts.length > 0 ? acts.slice(0, 6) : [];
  }, [currentLang]);

  const diningPlaces: PlaceWithDetails[] = [
    {
      id: '22222222-0003-0000-0000-000000000099',
      category_id: '11111111-0003-0000-0000-000000000003',
      slug: 'mama-saida',
      latitude: 23.70236,
      longitude: -15.95039,
      phone: '+212658514404',
      whatsapp: '+212658514404',
      website_url: null,
      instagram_handle: null,
      price_level: 1,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['street-food', 'homemade', 'fait-maison', 'tagine', 'traditional', 'budget', 'poulet'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.9,
      review_count: 142,
      primaryImageUrl: '/images/places/mama-saida/mama-saida-1.webp',
      category: { id: 'c-3', slug: 'street-food', name: t('categories.streetFood') },
      translation: {
        title: 'Chhiwat Mama Saida — Cuisine Familiale & Street Food',
        description: 'Tajines traditionnels fumants aux légumes frais, poulet rôti aux frites & olives, et saveurs familiales à prix doux.',
        isFallback: false,
      },
      images: [
        { id: 'img-ms-1', place_id: 'ms-1', storage_path: '/images/places/mama-saida/mama-saida-1.webp', display_order: 1, is_primary: true },
        { id: 'img-ms-4', place_id: 'ms-1', storage_path: '/images/places/mama-saida/mama-saida-4.webp', display_order: 2, is_primary: false },
        { id: 'img-ms-2', place_id: 'ms-1', storage_path: '/images/places/mama-saida/mama-saida-2.webp', display_order: 3, is_primary: false },
      ],
    },
    {
      id: 'r-1',
      category_id: '11111111-0002-0000-0000-000000000002',
      slug: 'talhamar-parc-huitrier',
      latitude: 23.76,
      longitude: -15.88,
      price_level: 2,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['oysters', 'seafood', 'fresh'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.9,
      review_count: 412,
      primaryImageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fm=webp&fit=crop&w=800&q=80',
      category: { id: 'c-2', slug: 'restaurants', name: t('categories.restaurants') },
      translation: {
        title: 'Talhamar — Parcs Ostréicoles de Dakhla',
        description: 'Dégustation d\'huîtres fraîches sorties de l\'eau, couteaux et poissons grillés face à la lagune turquoise.',
        isFallback: false,
      },
      images: [
        { id: 'img-r1', place_id: 'r-1', storage_path: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fm=webp&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
      ],
    },
    {
      id: 'r-2',
      category_id: '11111111-0002-0000-0000-000000000002',
      slug: 'casa-pedro-seafood',
      latitude: 23.71,
      longitude: -15.93,
      price_level: 2,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['fish', 'traditional', 'port'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.7,
      review_count: 288,
      primaryImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fm=webp&fit=crop&w=800&q=80',
      category: { id: 'c-2', slug: 'restaurants', name: t('categories.restaurants') },
      translation: {
        title: 'Casa Pedro & Poissons du Port',
        description: 'Table historique réputée pour ses fritures de poissons royaux, calamars dorés et langoustes fraîches.',
        isFallback: false,
      },
      images: [
        { id: 'img-r2', place_id: 'r-2', storage_path: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fm=webp&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
      ],
    },
    {
      id: 'r-3',
      category_id: '11111111-0002-0000-0000-000000000002',
      slug: 'villa-dakhla-dining',
      latitude: 23.73,
      longitude: -15.92,
      price_level: 3,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['lagoon-view', 'gastronomy', 'tajine'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.8,
      review_count: 195,
      primaryImageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fm=webp&fit=crop&w=800&q=80',
      category: { id: 'c-2', slug: 'restaurants', name: t('categories.restaurants') },
      translation: {
        title: 'Villa Dakhla Lagoon Dining',
        description: 'Cuisine raffinée marocaine et méditerranéenne servie en terrasse panoramique au coucher du soleil.',
        isFallback: false,
      },
      images: [
        { id: 'img-r3', place_id: 'r-3', storage_path: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fm=webp&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
      ],
    },
  ] as unknown as PlaceWithDetails[];

  // Also merge with any live places from Supabase
  const displayedHotels = livePlaces.filter(p => p.category?.slug === 'hotels').length > 0
    ? livePlaces.filter(p => p.category?.slug === 'hotels').slice(0, 3)
    : hotelPlaces;

  const displayedActivities = livePlaces.filter(p => p.category?.slug === 'activities').length > 0
    ? livePlaces.filter(p => p.category?.slug === 'activities').slice(0, 6)
    : activityPlaces;

  const allDiningPlaces = livePlaces.filter(p => p.category?.slug === 'restaurants' || p.category?.slug === 'street-food').length > 0
    ? livePlaces.filter(p => p.category?.slug === 'restaurants' || p.category?.slug === 'street-food')
    : diningPlaces;

  const displayedDining = allDiningPlaces.filter((p) => {
    if (foodBranch === 'all') return true;
    return p.category?.slug === foodBranch;
  });

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dakhlin — Dakhla Tourism Platform',
    url: 'https://dakhlin.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://dakhlin.com/explore?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-12 bg-[#FCFBF8]">
      <SeoMeta
        title={t('hero.title', 'Dakhlin — Discover Dakhla, Moroccan Sahara')}
        description={t('hero.subtitle')}
        canonicalPath="/"
        structuredData={websiteSchema}
      />

      {/* Destination Intro Banner */}
      <section className="bg-[#FCFBF8] border-b border-[#E8E5DE] py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#176B87] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Sahara Marocain • Dakhla Peninsula</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F2933] tracking-tight">
                {t('hero.title', 'Dakhlin — Discover Dakhla')}
              </h1>
              <p className="text-xs sm:text-sm text-[#667580] leading-relaxed">
                {t('hero.subtitle', 'Your authentic guide to exceptional kitesurfing, Saharan eco-lodges, fresh oysters, and regional wonders.')}
              </p>
            </div>

            {/* Quick Discover Category Links */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                to="/explore?cat=hotels"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E5DE] hover:border-[#176B87] text-xs font-medium text-[#1F2933] transition-colors"
              >
                <Hotel className="w-3.5 h-3.5 text-[#176B87]" />
                <span>{t('categories.hotels')}</span>
              </Link>
              <Link
                to="/explore?cat=activities"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E5DE] hover:border-[#176B87] text-xs font-medium text-[#1F2933] transition-colors"
              >
                <Waves className="w-3.5 h-3.5 text-[#176B87]" />
                <span>{t('categories.activities')}</span>
              </Link>
              <Link
                to="/explore?cat=restaurants"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E5DE] hover:border-[#176B87] text-xs font-medium text-[#1F2933] transition-colors"
              >
                <Utensils className="w-3.5 h-3.5 text-[#176B87]" />
                <span>{t('categories.restaurants')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Maritime & Tide Intelligence Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 -mt-4 sm:-mt-6 relative z-10">
        <WindTideBar />
      </div>

      {/* Section 1: Hébergements (Hotels & Camps) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1F2933] tracking-tight">
              {t('categories.hotels')}
            </h2>
            <p className="text-xs text-[#667580] mt-0.5">
              Eco-resorts et camps d'exception au bord de la lagune
            </p>
          </div>
          <Link
            to="/explore?cat=hotels"
            className="text-xs font-medium text-[#176B87] hover:underline transition-colors"
          >
            Tout afficher →
          </Link>
        </div>

        {displayedHotels.length === 1 ? (
          <div className="max-w-[360px] sm:max-w-[400px]">
            <PlaceCard place={displayedHotels[0]} />
          </div>
        ) : displayedHotels.length === 2 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-5 sm:gap-6">
            {displayedHotels.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedHotels.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Activités & Kitesurf */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1F2933] tracking-tight">
              {t('categories.activities')}
            </h2>
            <p className="text-xs text-[#667580] mt-0.5">
              Glisse sur la lagune turquoise et safaris dans les dunes
            </p>
          </div>
          <Link
            to="/explore?cat=activities"
            className="text-xs font-medium text-[#176B87] hover:underline transition-colors"
          >
            Tout afficher →
          </Link>
        </div>

        {displayedActivities.length === 1 ? (
          <div className="max-w-[360px] sm:max-w-[400px]">
            <PlaceCard place={displayedActivities[0]} />
          </div>
        ) : displayedActivities.length === 2 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-5 sm:gap-6">
            {displayedActivities.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedActivities.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Saveurs & Gastronomie */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1F2933] tracking-tight">
              Gastronomie & Street Food
            </h2>
            <p className="text-xs text-[#667580] mt-0.5">
              Saveurs locales, street food chez l'habitant et tables panoramiques
            </p>
          </div>

          {/* Interactive Branch Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#FCFBF8] rounded-full border border-[#E8E5DE] self-start sm:self-auto shrink-0">
            <button
              onClick={() => setFoodBranch('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                foodBranch === 'all'
                  ? 'bg-[#176B87] text-white shadow-2xs font-semibold'
                  : 'text-[#667580] hover:text-[#1F2933]'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFoodBranch('street-food')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                foodBranch === 'street-food'
                  ? 'bg-[#176B87] text-white shadow-2xs font-semibold'
                  : 'text-[#667580] hover:text-[#1F2933]'
              }`}
            >
              Street Food
            </button>
            <button
              onClick={() => setFoodBranch('restaurants')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                foodBranch === 'restaurants'
                  ? 'bg-[#176B87] text-white shadow-2xs font-semibold'
                  : 'text-[#667580] hover:text-[#1F2933]'
              }`}
            >
              Restaurants
            </button>
          </div>
        </div>

        {displayedDining.length === 1 ? (
          <div className="max-w-[360px] sm:max-w-[400px]">
            <PlaceCard place={displayedDining[0]} />
          </div>
        ) : displayedDining.length === 2 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-5 sm:gap-6">
            {displayedDining.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedDining.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>

      {/* Plan My Trip Feature Section (Clean, Premium, Spacious) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="rounded-3xl bg-white border border-[#E8E5DE] p-8 sm:p-10 md:p-12 text-center max-w-3xl mx-auto shadow-xs space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3E8D2]/50 text-[#176B87] text-[11px] font-bold uppercase tracking-wider">
            <span>{t('planner.title', 'Plan My Trip')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2933] tracking-tight">
            {t('planner.homeSectionTitle', 'Plan your Dakhla trip')}
          </h2>

          <p className="text-xs sm:text-sm text-[#667580] max-w-xl mx-auto leading-relaxed">
            {t('planner.homeSectionDesc', 'Tell El Haj what you enjoy, how long you are staying and your budget. El Haj will create a personalized day-by-day experience for you.')}
          </p>

          <div className="pt-2">
            <Link
              to="/plan"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#176B87] hover:bg-[#13586F] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-98 transition-all"
            >
              {t('planner.cta', 'Start planning my trip')}
            </Link>
          </div>

          <p className="text-[11px] font-medium text-[#667580] tracking-wide pt-2">
            {t('planner.homeBadges', 'Budget • Food • Activities • Places • Stays')}
          </p>
        </div>
      </section>

      {/* Feature Concierge Card: AI Companion (Light, Coastal) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="rounded-2xl bg-[#F3E8D2]/40 border border-[#E8E5DE] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <img 
              src="/images/elhaj-avatar.webp" 
              alt="El Haj" 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-xs shrink-0" 
            />
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#176B87]">
                Concierge de voyage
              </span>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1F2933]">
                Besoin de conseils personnalisés à Dakhla ?
              </h3>
              <p className="text-xs text-[#667580] max-w-xl font-normal leading-relaxed">
                Spots de kitesurf, marées à la Dune Blanche ou adresses d'huîtres : demandez conseil à El Haj.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-dakhlin-ai'))}
            className="px-4 py-2 rounded-full bg-[#176B87] hover:bg-[#13586F] text-white font-medium text-xs shrink-0 transition-colors shadow-2xs"
          >
            {t('nav.askAi', 'Ask El Haj')}
          </button>
        </div>
      </section>

    </div>
  );
};
