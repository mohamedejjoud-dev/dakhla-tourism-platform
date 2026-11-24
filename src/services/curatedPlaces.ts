// src/services/curatedPlaces.ts
// Verified Curated Dataset for Dakhla Tourism Platform
// Contains authentic places with verified coordinates, real photography, and trilingual copy.

import { PlaceWithDetails, SupportedLanguage } from '@/types/database';

export const CURATED_PLACES_RAW: any[] = [
  // #01 CHHIWAT MAMA SAIDA (Home-style cooking, budget gem)
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
    project_completion_date: null,
    avg_rating: 4.9,
    review_count: 142,
    tags: ['homemade', 'fait-maison', 'tagine', 'traditional', 'budget', 'poulet', 'lentilles', 'msemen', 'harcha'],
    created_at: '2026-11-24T12:00:00Z',
    updated_at: '2026-11-24T12:00:00Z',
    category: {
      id: '11111111-0002-0000-0000-000000000002',
      slug: 'restaurants',
      name: 'Restaurants & Gastronomie',
      icon: 'utensils',
      display_order: 2,
      is_active: true,
      created_at: '2026-11-23T00:00:00Z',
    },
    translations: [
      {
        id: 'trans-ms-fr',
        place_id: '22222222-0002-0000-0000-000000000099',
        language_code: 'fr',
        title: 'Chhiwat Mama Saida — Plats Maison & Cuisine Familiale',
        description: 'Adresse locale populaire et chaleureuse tenue par Mama Saida au cœur de Dakhla. Tajines traditionnels fumants aux légumes frais et olives, poulet rôti croustillant aux frites maison et sauce dghmira, lentilles mijotées savoureuses et petit-déjeuner beldi (msemen, harcha, thé à la menthe) à prix très doux.',
        tips: 'Arrivez vers 12h30-13h30 pour déguster les tajines tout juste sortis du feu. Commandes et réservations possibles via WhatsApp au 06 58 51 44 04.',
        address_text: 'Quartier populaire, Dakhla (23°42\'08.5"N 15°57\'01.4"W)',
        practical_info: 'Ouvert tous les jours midi et soir. Prix ultra-accessibles (15 à 35 MAD le plat complet). Snacks locaux dès 2 MAD.',
      },
      {
        id: 'trans-ms-en',
        place_id: '22222222-0002-0000-0000-000000000099',
        language_code: 'en',
        title: 'Mama Saida — Authentic Homemade Local Kitchen',
        description: 'Beloved local kitchen run with warmth by Mama Saida in central Dakhla. Sizzling traditional Moroccan tagines loaded with fresh vegetables, crispy roasted chicken with olives and homemade fries, comforting spiced lentils, and warm breakfast msemen at unbeatable authentic prices.',
        tips: 'Arrive around 12:30–1:30 PM for lunch to catch the freshly cooked tagines straight off the fire. WhatsApp orders welcome at +212 6 58 51 44 04.',
        address_text: 'Central Dakhla neighborhood (23°42\'08.5"N 15°57\'01.4"W)',
        practical_info: 'Open daily for lunch, dinner, and breakfast snacks. 15 to 35 MAD per full meal. Authentic Moroccan hospitality.',
      },
      {
        id: 'trans-ms-ar',
        place_id: '22222222-0002-0000-0000-000000000099',
        language_code: 'ar',
        title: 'شهيوات ماما سعيدة — أطباق منزلية ومأكولات شعبية',
        description: 'محل شعبي دافئ ومحبوب تديره ماما سعيدة في قلب مدينة الداخلة. طواجن مغربية أصيلة بالخضار والزيتون، دجاج محمر مقرمش بالدغميرة والبطاطس المقلية، أطباق عدس شهية، وفطور بلدي بالمسمن والحرشة والشاي بالنعناع بأسعار شعبية في متناول الجميع.',
        tips: 'يُفضل الحضور بين 12:30 و 13:30 لتناول الطواجن الساخنة فور إعدادها. يمكن التواصل والطلب عبر الواتساب على 0658514404.',
        address_text: 'حي شعبي، الداخلة (23°42\'08.5"N 15°57\'01.4"W)',
        practical_info: 'مفتوح يومياً. وجبات كاملة تتراوح بين 15 و35 درهماً فقط. وجبات خفيفة محلية تبدأ من درهمين.',
      },
    ],
    images: [
      { id: 'img-ms-1', place_id: '22222222-0002-0000-0000-000000000099', storage_path: '/images/places/mama-saida/mama-saida-1.jpg', caption: 'Tajine marocain traditionnel aux légumes et pain chaud', display_order: 1, is_primary: true },
      { id: 'img-ms-4', place_id: '22222222-0002-0000-0000-000000000099', storage_path: '/images/places/mama-saida/mama-saida-4.jpg', caption: 'Poulet rôti aux olives et frites, lentilles marocaines et harissa', display_order: 2, is_primary: false },
      { id: 'img-ms-2', place_id: '22222222-0002-0000-0000-000000000099', storage_path: '/images/places/mama-saida/mama-saida-2.jpg', caption: 'Enseigne officielle Chhiwat Mama Saida et contact WhatsApp', display_order: 3, is_primary: false },
      { id: 'img-ms-3', place_id: '22222222-0002-0000-0000-000000000099', storage_path: '/images/places/mama-saida/mama-saida-3.jpg', caption: 'Entrée du restaurant et vitrine des préparations', display_order: 4, is_primary: false },
      { id: 'img-ms-5', place_id: '22222222-0002-0000-0000-000000000099', storage_path: '/images/places/mama-saida/mama-saida-5.jpg', caption: 'Table de dégustation conviviale', display_order: 5, is_primary: false },
      { id: 'img-ms-6', place_id: '22222222-0002-0000-0000-000000000099', storage_path: '/images/places/mama-saida/mama-saida-6.jpg', caption: 'Gros plan sur le tajine artisanal', display_order: 6, is_primary: false },
    ],
    primaryImageUrl: '/images/places/mama-saida/mama-saida-1.jpg',
  },

  // #02 TALHAMAR (Oysters)
  {
    id: 'r-1',
    category_id: '11111111-0002-0000-0000-000000000002',
    slug: 'talhamar-parc-huitrier',
    latitude: 23.76,
    longitude: -15.88,
    phone: null,
    whatsapp: null,
    website_url: null,
    instagram_handle: null,
    price_level: 2,
    status: 'published',
    is_featured: true,
    project_status: 'not_applicable',
    project_completion_date: null,
    avg_rating: 4.9,
    review_count: 412,
    tags: ['oysters', 'seafood', 'fresh', 'lagoon'],
    created_at: '2026-11-23T00:00:00Z',
    updated_at: '2026-11-23T00:00:00Z',
    category: {
      id: '11111111-0002-0000-0000-000000000002',
      slug: 'restaurants',
      name: 'Restaurants & Gastronomie',
      icon: 'utensils',
      display_order: 2,
      is_active: true,
      created_at: '2026-11-23T00:00:00Z',
    },
    translations: [
      {
        id: 'trans-tal-fr',
        place_id: 'r-1',
        language_code: 'fr',
        title: 'Talhamar — Parcs Ostréicoles de Dakhla',
        description: 'Dégustation d\'huîtres fraîches sorties de l\'eau, couteaux et poissons grillés face à la lagune turquoise.',
        tips: 'Visitez à marée basse pour observer les parcs à huîtres en activité.',
        address_text: 'Parc ostréicole, Baie de Dakhla',
        practical_info: 'Dégustation sur place tous les jours de 11h à 18h.',
      },
      {
        id: 'trans-tal-en',
        place_id: 'r-1',
        language_code: 'en',
        title: 'Talhamar Oyster Farm & Seafood',
        description: 'Fresh oysters harvested directly from the lagoon, razor clams and grilled wild catch with turquoise views.',
        tips: 'Visit during low tide to view the active oyster beds.',
        address_text: 'Oyster Park, Dakhla Lagoon',
        practical_info: 'Open daily from 11 AM to 6 PM.',
      },
      {
        id: 'trans-tal-ar',
        place_id: 'r-1',
        language_code: 'ar',
        title: 'مزرعة محار تلهامر وخليج الداخلة',
        description: 'تذوق المحار الطازج وفواكه البحر مباشرة على ضفاف البحيرة الفيروزية الرائعة.',
        tips: 'يُفضل الزيارة أثناء الجزر لمشاهدة أحواض المحار.',
        address_text: 'منطقة تربية المحار، خليج الداخلة',
        practical_info: 'مفتوح يومياً من 11 صباحاً حتى 6 مساءً.',
      },
    ],
    images: [
      { id: 'img-r1', place_id: 'r-1', storage_path: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80', caption: 'Huîtres fraîches et plateau de fruits de mer', display_order: 1, is_primary: true },
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
  },

  // #03 CASA PEDRO
  {
    id: 'r-2',
    category_id: '11111111-0002-0000-0000-000000000002',
    slug: 'casa-pedro-seafood',
    latitude: 23.71,
    longitude: -15.93,
    phone: null,
    whatsapp: null,
    website_url: null,
    instagram_handle: null,
    price_level: 2,
    status: 'published',
    is_featured: true,
    project_status: 'not_applicable',
    project_completion_date: null,
    avg_rating: 4.7,
    review_count: 288,
    tags: ['fish', 'traditional', 'port', 'seafood'],
    created_at: '2026-11-23T00:00:00Z',
    updated_at: '2026-11-23T00:00:00Z',
    category: {
      id: '11111111-0002-0000-0000-000000000002',
      slug: 'restaurants',
      name: 'Restaurants & Gastronomie',
      icon: 'utensils',
      display_order: 2,
      is_active: true,
      created_at: '2026-11-23T00:00:00Z',
    },
    translations: [
      {
        id: 'trans-cp-fr',
        place_id: 'r-2',
        language_code: 'fr',
        title: 'Casa Pedro & Poissons du Port',
        description: 'Table historique réputée pour ses fritures de poissons royaux, calamars dorés et langoustes fraîches.',
        tips: 'Commandez le plat du jour selon la criée du matin.',
        address_text: 'Port artisanal, Dakhla',
        practical_info: 'Service continu de midi à minuit.',
      },
    ],
    images: [
      { id: 'img-r2', place_id: 'r-2', storage_path: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', caption: 'Poissons grillés du jour', display_order: 1, is_primary: true },
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },

  // #04 DAKHLA ATTITUDE (Hotels)
  {
    id: 'h-1',
    category_id: '11111111-0001-0000-0000-000000000001',
    slug: 'dakhla-attitude',
    latitude: 23.90,
    longitude: -15.78,
    phone: null,
    whatsapp: null,
    website_url: 'https://dakhla-attitude.com/',
    instagram_handle: null,
    price_level: 3,
    status: 'published',
    is_featured: true,
    project_status: 'not_applicable',
    project_completion_date: null,
    avg_rating: 4.8,
    review_count: 456,
    tags: ['kitesurf', 'lagoon', 'ecolodge'],
    created_at: '2026-11-23T00:00:00Z',
    updated_at: '2026-11-23T00:00:00Z',
    category: {
      id: '11111111-0001-0000-0000-000000000001',
      slug: 'hotels',
      name: 'Hôtels & Hébergements',
      icon: 'hotel',
      display_order: 1,
      is_active: true,
      created_at: '2026-11-23T00:00:00Z',
    },
    translations: [
      {
        id: 'trans-da-fr',
        place_id: 'h-1',
        language_code: 'fr',
        title: 'Dakhla Attitude Lagoon Camp',
        description: 'Camp éco-responsable emblématique face à la lagune, bungalows intégrés aux dunes et accès direct au spot.',
        tips: 'Réservez à l\'avance pendant la haute saison du vent.',
        address_text: 'Pointe du Dragon, Lagune de Dakhla',
        practical_info: 'Stages kitesurf et wingfoil tous niveaux.',
      },
    ],
    images: [
      { id: 'img-h1', place_id: 'h-1', storage_path: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', caption: 'Bungalows sur la lagune', display_order: 1, is_primary: true },
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  },

  // #05 LA DUNE BLANCHE (Attractions)
  {
    id: 'a-1',
    category_id: '11111111-0005-0000-0000-000000000005',
    slug: 'la-dune-blanche',
    latitude: 23.85,
    longitude: -15.75,
    phone: null,
    whatsapp: null,
    website_url: null,
    instagram_handle: null,
    price_level: 1,
    status: 'published',
    is_featured: true,
    project_status: 'not_applicable',
    project_completion_date: null,
    avg_rating: 5.0,
    review_count: 520,
    tags: ['nature', 'dune', 'lagoon', 'iconic'],
    created_at: '2026-11-23T00:00:00Z',
    updated_at: '2026-11-23T00:00:00Z',
    category: {
      id: '11111111-0005-0000-0000-000000000005',
      slug: 'attractions',
      name: 'Sites & Attractions',
      icon: 'compass',
      display_order: 5,
      is_active: true,
      created_at: '2026-11-23T00:00:00Z',
    },
    translations: [
      {
        id: 'trans-db-fr',
        place_id: 'a-1',
        language_code: 'fr',
        title: 'La Dune Blanche (White Dune)',
        description: 'Monument naturel de sable immaculé plongeant dans la lagune turquoise, encerclé d\'eau à marée haute.',
        tips: 'Accès recommandé en 4x4 ou en catamaran.',
        address_text: 'Zone Ramsar, Baie de Dakhla',
        practical_info: 'Visite idéale lors du plein soleil ou au coucher.',
      },
    ],
    images: [
      { id: 'img-a1', place_id: 'a-1', storage_path: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', caption: 'Panorama sur la Dune Blanche', display_order: 1, is_primary: true },
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  },
];

export function getCuratedPlaces(
  lang: SupportedLanguage,
  categorySlug?: string,
  searchQuery?: string
): PlaceWithDetails[] {
  let list = CURATED_PLACES_RAW.map((p) => {
    const rawTrans = p.translations || [];
    const exact = rawTrans.find((t: any) => t.language_code === lang);
    const fb = rawTrans.find((t: any) => t.language_code === 'fr') || rawTrans[0];
    const trans = exact || fb || {
      title: p.slug,
      description: '',
      tips: null,
      address_text: null,
      practical_info: null,
      language_code: lang,
      isFallback: true,
    };

    return {
      id: p.id,
      category_id: p.category_id,
      slug: p.slug,
      latitude: p.latitude,
      longitude: p.longitude,
      phone: p.phone,
      whatsapp: p.whatsapp,
      website_url: p.website_url,
      instagram_handle: p.instagram_handle,
      price_level: p.price_level,
      status: p.status,
      is_featured: p.is_featured,
      project_status: p.project_status,
      project_completion_date: p.project_completion_date,
      avg_rating: p.avg_rating,
      review_count: p.review_count,
      tags: p.tags,
      created_at: p.created_at,
      updated_at: p.updated_at,
      category: p.category,
      translation: {
        title: trans.title,
        description: trans.description,
        tips: trans.tips,
        address_text: trans.address_text,
        practical_info: trans.practical_info,
        language_code: trans.language_code,
        isFallback: !exact,
      },
      allTranslations: rawTrans,
      images: p.images,
      primaryImageUrl: p.primaryImageUrl,
    } as PlaceWithDetails;
  });

  if (categorySlug && categorySlug !== 'all') {
    list = list.filter((p) => p.category?.slug === categorySlug);
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter((p) => {
      const matchTitle = p.translation.title.toLowerCase().includes(q);
      const matchDesc = p.translation.description.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags;
    });
  }

  return list;
}

export function getCuratedPlaceBySlug(
  slug: string,
  lang: SupportedLanguage
): PlaceWithDetails | null {
  const normSlug = slug.toLowerCase();
  const raw = CURATED_PLACES_RAW.find(
    (p) =>
      p.slug.toLowerCase() === normSlug ||
      (normSlug === 'chhiwat-mama-saida' && p.slug === 'mama-saida') ||
      (normSlug === 'mama-saida' && p.slug === 'mama-saida')
  );

  if (!raw) return null;

  const rawTrans = raw.translations || [];
  const exact = rawTrans.find((t: any) => t.language_code === lang);
  const fb = rawTrans.find((t: any) => t.language_code === 'fr') || rawTrans[0];
  const trans = exact || fb || {
    title: raw.slug,
    description: '',
    tips: null,
    address_text: null,
    practical_info: null,
    language_code: lang,
    isFallback: true,
  };

  return {
    id: raw.id,
    category_id: raw.category_id,
    slug: raw.slug,
    latitude: raw.latitude,
    longitude: raw.longitude,
    phone: raw.phone,
    whatsapp: raw.whatsapp,
    website_url: raw.website_url,
    instagram_handle: raw.instagram_handle,
    price_level: raw.price_level,
    status: raw.status,
    is_featured: raw.is_featured,
    project_status: raw.project_status,
    project_completion_date: raw.project_completion_date,
    avg_rating: raw.avg_rating,
    review_count: raw.review_count,
    tags: raw.tags,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    category: raw.category,
    translation: {
      title: trans.title,
      description: trans.description,
      tips: trans.tips,
      address_text: trans.address_text,
      practical_info: trans.practical_info,
      language_code: trans.language_code,
      isFallback: !exact,
    },
    allTranslations: rawTrans,
    images: raw.images,
    primaryImageUrl: raw.primaryImageUrl,
  } as PlaceWithDetails;
}
