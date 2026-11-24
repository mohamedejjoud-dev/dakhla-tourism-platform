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

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const [livePlaces, setLivePlaces] = useState<PlaceWithDetails[]>([]);

  useEffect(() => {
    fetchPublishedPlaces({ lang: currentLang }).then((data) => {
      setLivePlaces(data);
    });
  }, [currentLang]);

  // Curated showcase places (matching TripAdvisor Dakhla screenshot)
  const hotelPlaces: PlaceWithDetails[] = [
    {
      id: 'h-1',
      category_id: '11111111-0001-0000-0000-000000000001',
      slug: 'palais-rhoul-dakhla',
      latitude: 23.715,
      longitude: -15.932,
      price_level: 4,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['luxury', 'lagoon-view', 'spa'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.8,
      review_count: 456,
      primaryImageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      category: { id: 'c-1', slug: 'hotels', name: t('categories.hotels') },
      translation: {
        title: 'Palais Rhoul Dakhla',
        description: 'Villas de charme et suites avec vue panoramique imprenable sur les eaux calmes de la lagune de Dakhla.',
        isFallback: false,
      },
      images: [
        { id: 'img-1', place_id: 'h-1', storage_path: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
        { id: 'img-2', place_id: 'h-1', storage_path: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', display_order: 2, is_primary: false },
      ],
    },
    {
      id: 'h-2',
      category_id: '11111111-0001-0000-0000-000000000001',
      slug: 'la-tour-deole',
      latitude: 23.68,
      longitude: -15.91,
      price_level: 4,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['ecolodge', 'dunes', 'lagoon'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.9,
      review_count: 327,
      primaryImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      category: { id: 'c-1', slug: 'hotels', name: t('categories.hotels') },
      translation: {
        title: 'La Tour D\'eole',
        description: 'Écolodge de grand luxe niché à flanc de colline désertique surplombant la lagune et le spot de vent.',
        isFallback: false,
      },
      images: [
        { id: 'img-3', place_id: 'h-2', storage_path: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
        { id: 'img-4', place_id: 'h-2', storage_path: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80', display_order: 2, is_primary: false },
      ],
    },
    {
      id: 'h-3',
      category_id: '11111111-0001-0000-0000-000000000001',
      slug: 'dakhla-attitude',
      latitude: 23.9,
      longitude: -15.78,
      price_level: 3,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['kitesurf', 'camp', 'white-dune'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 5.0,
      review_count: 131,
      primaryImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      category: { id: 'c-1', slug: 'hotels', name: t('categories.hotels') },
      translation: {
        title: 'White Dune Canyon & Attitude',
        description: 'Bungalows d\'exception face à la Dune Blanche, camp légendaire des riders internationaux et passionnés de vent.',
        isFallback: false,
      },
      images: [
        { id: 'img-5', place_id: 'h-3', storage_path: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
        { id: 'img-6', place_id: 'h-3', storage_path: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80', display_order: 2, is_primary: false },
      ],
    },
  ] as unknown as PlaceWithDetails[];

  const activityPlaces: PlaceWithDetails[] = [
    {
      id: 'a-1',
      category_id: '11111111-0004-0000-0000-000000000004',
      slug: 'pk25-dakhla',
      latitude: 23.85,
      longitude: -15.82,
      price_level: 3,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['kitesurf', 'wingfoil', 'spot'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.9,
      review_count: 520,
      primaryImageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
      category: { id: 'c-4', slug: 'activities', name: t('categories.activities') },
      translation: {
        title: 'Kitesurf & Wingfoil au Spot PK25',
        description: 'Plan d\'eau plat ultra-sécurisé, vent constant de 20 nœuds et écoles certifiées IKO au cœur de la lagune.',
        isFallback: false,
      },
      images: [
        { id: 'img-a1', place_id: 'a-1', storage_path: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
      ],
    },
    {
      id: 'a-2',
      category_id: '11111111-0005-0000-0000-000000000005',
      slug: 'la-dune-blanche-safari',
      latitude: 23.95,
      longitude: -15.75,
      price_level: 2,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['4x4', 'dune-blanche', 'safari'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 5.0,
      review_count: 389,
      primaryImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      category: { id: 'c-5', slug: 'attractions', name: t('categories.attractions') },
      translation: {
        title: 'Safari 4x4 & Coucher de Soleil à la Dune Blanche',
        description: 'Excursion inoubliable à travers les pistes du désert saharien jusqu\'à la majestueuse dune blanche.',
        isFallback: false,
      },
      images: [
        { id: 'img-a2', place_id: 'a-2', storage_path: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
      ],
    },
    {
      id: 'a-3',
      category_id: '11111111-0004-0000-0000-000000000004',
      slug: 'ocean-vagabond-lassarga',
      latitude: 23.62,
      longitude: -15.98,
      price_level: 3,
      status: 'published',
      is_featured: true,
      project_status: 'not_applicable',
      tags: ['surf', 'point-break', 'waves'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.8,
      review_count: 210,
      primaryImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      category: { id: 'c-4', slug: 'activities', name: t('categories.activities') },
      translation: {
        title: 'Point Break & Surf à Lassarga',
        description: 'Vague droite parfaite s\'étendant sur des centaines de mètres sur la pointe sud face au grand large atlantique.',
        isFallback: false,
      },
      images: [
        { id: 'img-a3', place_id: 'a-3', storage_path: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
      ],
    },
  ] as unknown as PlaceWithDetails[];

  const diningPlaces: PlaceWithDetails[] = [
    {
      id: '22222222-0002-0000-0000-000000000099',
      category_id: '11111111-0002-0000-0000-000000000002',
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
      tags: ['homemade', 'fait-maison', 'tagine', 'traditional', 'budget', 'poulet'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avg_rating: 4.9,
      review_count: 142,
      primaryImageUrl: '/images/places/mama-saida/mama-saida-1.jpg',
      category: { id: 'c-2', slug: 'restaurants', name: t('categories.restaurants') },
      translation: {
        title: 'Chhiwat Mama Saida — Cuisine Familiale',
        description: 'Tajines traditionnels fumants aux légumes frais, poulet rôti aux frites & olives, et saveurs familiales à prix doux.',
        isFallback: false,
      },
      images: [
        { id: 'img-ms-1', place_id: 'ms-1', storage_path: '/images/places/mama-saida/mama-saida-1.jpg', display_order: 1, is_primary: true },
        { id: 'img-ms-4', place_id: 'ms-1', storage_path: '/images/places/mama-saida/mama-saida-4.jpg', display_order: 2, is_primary: false },
        { id: 'img-ms-2', place_id: 'ms-1', storage_path: '/images/places/mama-saida/mama-saida-2.jpg', display_order: 3, is_primary: false },
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
      primaryImageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
      category: { id: 'c-2', slug: 'restaurants', name: t('categories.restaurants') },
      translation: {
        title: 'Talhamar — Parcs Ostréicoles de Dakhla',
        description: 'Dégustation d\'huîtres fraîches sorties de l\'eau, couteaux et poissons grillés face à la lagune turquoise.',
        isFallback: false,
      },
      images: [
        { id: 'img-r1', place_id: 'r-1', storage_path: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
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
      primaryImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      category: { id: 'c-2', slug: 'restaurants', name: t('categories.restaurants') },
      translation: {
        title: 'Casa Pedro & Poissons du Port',
        description: 'Table historique réputée pour ses fritures de poissons royaux, calamars dorés et langoustes fraîches.',
        isFallback: false,
      },
      images: [
        { id: 'img-r2', place_id: 'r-2', storage_path: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
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
      primaryImageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
      category: { id: 'c-2', slug: 'restaurants', name: t('categories.restaurants') },
      translation: {
        title: 'Villa Dakhla Lagoon Dining',
        description: 'Cuisine raffinée marocaine et méditerranéenne servie en terrasse panoramique au coucher du soleil.',
        isFallback: false,
      },
      images: [
        { id: 'img-r3', place_id: 'r-3', storage_path: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true },
      ],
    },
  ] as unknown as PlaceWithDetails[];

  // Also merge with any live places from Supabase
  const displayedHotels = livePlaces.filter(p => p.category?.slug === 'hotels').length > 0
    ? livePlaces.filter(p => p.category?.slug === 'hotels').slice(0, 3)
    : hotelPlaces;

  const displayedActivities = livePlaces.filter(p => p.category?.slug === 'activities').length > 0
    ? livePlaces.filter(p => p.category?.slug === 'activities').slice(0, 3)
    : activityPlaces;

  const displayedDining = livePlaces.filter(p => p.category?.slug === 'restaurants').length > 0
    ? livePlaces.filter(p => p.category?.slug === 'restaurants').slice(0, 3)
    : diningPlaces;

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
    <div className="space-y-12 sm:space-y-16 pb-20 bg-white">
      <SeoMeta
        title={t('hero.title', 'Dakhlin — Discover Dakhla, Moroccan Sahara')}
        description={t('hero.subtitle')}
        canonicalPath="/"
        structuredData={websiteSchema}
      />

      {/* -------------------------------------------------------------
          TripAdvisor Style Destination Banner (Dakhla Overview)
      ------------------------------------------------------------- */}
      <section className="bg-sand-50/70 border-b border-sand-200/70 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#004F32]" />
                <span>Sahara Marocain • Région Dakhla-Oued Ed-Dahab</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight">
                Visiter Dakhla
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Découvrez les meilleurs hôtels, camps de kitesurf, restaurants de fruits de mer et trésors naturels de la péninsule de Dakhla.
              </p>
            </div>

            {/* Quick Trip Planning Pills */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to="/explore?cat=hotels"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-sand-300 text-xs font-bold text-slate-800 hover:border-slate-950 shadow-2xs transition-colors"
              >
                <Hotel className="w-4 h-4 text-[#004F32]" />
                <span>{t('categories.hotels')}</span>
              </Link>
              <Link
                to="/explore?cat=activities"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-sand-300 text-xs font-bold text-slate-800 hover:border-slate-950 shadow-2xs transition-colors"
              >
                <Waves className="w-4 h-4 text-[#004F32]" />
                <span>{t('categories.activities')}</span>
              </Link>
              <Link
                to="/explore?cat=restaurants"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-sand-300 text-xs font-bold text-slate-800 hover:border-slate-950 shadow-2xs transition-colors"
              >
                <Utensils className="w-4 h-4 text-[#004F32]" />
                <span>{t('categories.restaurants')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          TripAdvisor Section 1: Hébergements (Hotels & Camps)
      ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
              Hébergements
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Les camps de kitesurf et éco-resorts les plus appréciés des voyageurs à Dakhla
            </p>
          </div>
          <Link
            to="/explore?cat=hotels"
            className="text-xs sm:text-sm font-bold text-slate-950 hover:text-[#004F32] underline underline-offset-4 shrink-0"
          >
            Tout afficher
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedHotels.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------
          TripAdvisor Section 2: Activités & Kitesurf
      ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
              Activités & Kitesurf à Dakhla
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Glisse sur la lagune turquoise, downwinders et safaris 4x4 dans les dunes du Sahara
            </p>
          </div>
          <Link
            to="/explore?cat=activities"
            className="text-xs sm:text-sm font-bold text-slate-950 hover:text-[#004F32] underline underline-offset-4 shrink-0"
          >
            Tout afficher
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedActivities.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------
          TripAdvisor Section 3: Restaurants & Gastronomie
      ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
              Restaurants & Gastronomie
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Huîtres fraîches élevées dans la lagune, poissons sauvages du port et thé sahraoui
            </p>
          </div>
          <Link
            to="/explore?cat=restaurants"
            className="text-xs sm:text-sm font-bold text-slate-950 hover:text-[#004F32] underline underline-offset-4 shrink-0"
          >
            Tout afficher
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedDining.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------
          TripAdvisor Feature Banner: L7aj Concierge IA
      ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#004F32] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-5 sm:gap-6 z-10">
            <img 
              src="/images/elhaj-avatar.jpg" 
              alt="L7aj IA" 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white/30 shadow-xl shrink-0" 
            />
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-300">
                Concierge Régional Intelligent
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Besoin de conseils personnalisés sur Dakhla ?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-normal">
                Demandez à L7aj les prévisions de vent pour le kitesurf, les horaires des marées à la Dune Blanche ou les meilleures tables d'huîtres.
              </p>
            </div>
          </div>
          <Link
            to="/assistant"
            className="px-6 py-3 rounded-full bg-white hover:bg-sand-50 text-[#004F32] font-bold text-xs uppercase tracking-wider shrink-0 transition-colors shadow-sm z-10"
          >
            Discuter avec L7aj IA
          </Link>
        </div>
      </section>

    </div>
  );
};
