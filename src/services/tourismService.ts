import { supabase, isSupabaseConfigured, withTimeout } from '@/lib/supabase';
import {
  Category,
  CategoryTranslation,
  CategoryWithTranslation,
  PlaceImage,
  PlaceTranslation,
  PlaceWithDetails,
  ResolvedTranslation,
  SupportedLanguage,
} from '@/types/database';
import { getCuratedPlaces, getCuratedPlaceBySlug } from './curatedPlaces';

function parseCategory(rawCat: any, lang: SupportedLanguage): CategoryWithTranslation | undefined {
  if (!rawCat) return undefined;
  const c = Array.isArray(rawCat) ? rawCat[0] : rawCat;
  if (!c) return undefined;
  return {
    id: c.id,
    slug: c.slug,
    icon: c.icon,
    display_order: c.display_order,
    is_active: c.is_active,
    created_at: c.created_at,
    name: c.slug,
    description: null,
    language_code: lang,
  };
}

/**
 * Resolves localized translation according to strict fallback hierarchy:
 * 1. Target requested language.
 * 2. French ('fr') fallback (primary administrative and tourism language of Morocco).
 * 3. English ('en') fallback.
 * 4. Arabic ('ar') fallback.
 */
export function resolveTranslation(
  translations: PlaceTranslation[],
  targetLang: SupportedLanguage
): ResolvedTranslation {
  if (!translations || translations.length === 0) {
    return {
      title: 'Untranslated Place',
      description: '',
      tips: null,
      address_text: null,
      practical_info: null,
      language_code: targetLang,
      isFallback: true,
    };
  }

  // Exact match
  const exact = translations.find((t) => t.language_code === targetLang);
  if (exact) {
    return {
      title: exact.title,
      description: exact.description,
      tips: exact.tips,
      address_text: exact.address_text,
      practical_info: exact.practical_info,
      language_code: exact.language_code,
      isFallback: false,
    };
  }

  // Fallback preference hierarchy
  const fallbackOrder: SupportedLanguage[] = ['fr', 'en', 'ar'];
  for (const fbLang of fallbackOrder) {
    const candidate = translations.find((t) => t.language_code === fbLang);
    if (candidate) {
      return {
        title: candidate.title,
        description: candidate.description,
        tips: candidate.tips,
        address_text: candidate.address_text,
        practical_info: candidate.practical_info,
        language_code: candidate.language_code,
        isFallback: true,
        fallbackLang: candidate.language_code,
      };
    }
  }

  const first = translations[0];
  return {
    title: first.title,
    description: first.description,
    tips: first.tips,
    address_text: first.address_text,
    practical_info: first.practical_info,
    language_code: first.language_code,
    isFallback: true,
    fallbackLang: first.language_code,
  };
}

export function getPublicStorageUrl(storagePath: string | null): string | null {
  if (!storagePath) return null;
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  const { data } = supabase.storage.from('places-media').getPublicUrl(storagePath);
  return data?.publicUrl || null;
}

/**
 * Fetches all active categories with localized names and descriptions.
 */
export async function fetchCategories(
  lang: SupportedLanguage
): Promise<CategoryWithTranslation[]> {
  const fallbackCategories: CategoryWithTranslation[] = [
    { id: '11111111-0001-0000-0000-000000000001', slug: 'hotels', icon: 'hotel', display_order: 1, is_active: true, created_at: '2026-11-23T00:00:00Z', name: lang === 'ar' ? 'فنادق ومنتجعات' : lang === 'en' ? 'Hotels & Resorts' : 'Hôtels & Hébergements', description: null, language_code: lang },
    { id: '11111111-0002-0000-0000-000000000002', slug: 'restaurants', icon: 'utensils', display_order: 2, is_active: true, created_at: '2026-11-23T00:00:00Z', name: lang === 'ar' ? 'مطاعم ومأكولات' : lang === 'en' ? 'Restaurants & Dining' : 'Restaurants & Gastronomie', description: null, language_code: lang },
    { id: '11111111-0003-0000-0000-000000000003', slug: 'street-food', icon: 'sandwich', display_order: 3, is_active: true, created_at: '2026-11-23T00:00:00Z', name: lang === 'ar' ? 'أكلات شعبية' : lang === 'en' ? 'Street Food' : 'Street Food & Snacks', description: null, language_code: lang },
    { id: '11111111-0004-0000-0000-000000000004', slug: 'activities', icon: 'waves', display_order: 4, is_active: true, created_at: '2026-11-23T00:00:00Z', name: lang === 'ar' ? 'أنشطة ورياضات' : lang === 'en' ? 'Activities & Watersports' : 'Activités & Kitesurf', description: null, language_code: lang },
    { id: '11111111-0005-0000-0000-000000000005', slug: 'attractions', icon: 'compass', display_order: 5, is_active: true, created_at: '2026-11-23T00:00:00Z', name: lang === 'ar' ? 'معالم سياحية' : lang === 'en' ? 'Attractions & Nature' : 'Sites & Attractions', description: null, language_code: lang },
    { id: '11111111-0006-0000-0000-000000000006', slug: 'souvenirs', icon: 'shopping-bag', display_order: 6, is_active: true, created_at: '2026-11-23T00:00:00Z', name: lang === 'ar' ? 'صناعة تقليدية' : lang === 'en' ? 'Handicrafts & Souvenirs' : 'Artisanat & Souvenirs', description: null, language_code: lang },
    { id: '11111111-0007-0000-0000-000000000007', slug: 'projects', icon: 'hard-hat', display_order: 7, is_active: true, created_at: '2026-11-23T00:00:00Z', name: lang === 'ar' ? 'مشاريع كبرى' : lang === 'en' ? 'Major Projects' : 'Grands Projets', description: null, language_code: lang },
  ];

  if (!isSupabaseConfigured) {
    return fallbackCategories;
  }

  const { data: categories, error: catError } = (await withTimeout(
    supabase
      .from('categories')
      .select('id, slug, icon, display_order, is_active, created_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    2000,
    { data: null, error: new Error('Timeout') }
  )) as any;

  if (catError || !categories || categories.length === 0) {
    return fallbackCategories;
  }

  const { data: translations, error: transError } = await supabase
    .from('category_translations')
    .select('id, category_id, language_code, name, description');

  if (transError) {
    console.error('Error fetching category translations:', transError);
  }

  const transList = (translations as CategoryTranslation[]) || [];

  return (categories as Category[]).map((cat) => {
    // Attempt exact match, then 'fr', then 'en', then first available
    let matchedTrans = transList.find(
      (t) => t.category_id === cat.id && t.language_code === lang
    );
    if (!matchedTrans) {
      matchedTrans = transList.find(
        (t) => t.category_id === cat.id && t.language_code === 'fr'
      );
    }
    if (!matchedTrans) {
      matchedTrans = transList.find((t) => t.category_id === cat.id);
    }

    return {
      ...cat,
      name: matchedTrans?.name || cat.slug,
      description: matchedTrans?.description || null,
      language_code: (matchedTrans?.language_code || lang) as SupportedLanguage,
    };
  });
}

export interface PlaceFilterOptions {
  categorySlug?: string;
  searchQuery?: string;
  priceLevel?: number;
  projectStatus?: string;
  isFeatured?: boolean;
  lang: SupportedLanguage;
}

/**
 * Fetches published places with filtering, search, and translation resolution.
 */
export async function fetchPublishedPlaces(
  options: PlaceFilterOptions
): Promise<PlaceWithDetails[]> {
  if (!isSupabaseConfigured) {
    return getCuratedPlaces(options.lang, options.categorySlug, options.searchQuery);
  }

  let query = supabase
    .from('places')
    .select(`
      id,
      category_id,
      slug,
      latitude,
      longitude,
      phone,
      whatsapp,
      website_url,
      instagram_handle,
      price_level,
      status,
      is_featured,
      project_status,
      project_completion_date,
      avg_rating,
      review_count,
      tags,
      created_at,
      updated_at,
      category:categories(id, slug, icon, display_order, is_active, created_at),
      translations:place_translations(id, place_id, language_code, title, description, tips, address_text, practical_info),
      images:place_images(id, place_id, storage_path, caption, display_order, is_primary, created_at)
    `)
    .eq('status', 'published');

  if (options.priceLevel) {
    query = query.eq('price_level', options.priceLevel);
  }

  if (options.projectStatus && options.projectStatus !== 'all') {
    query = query.eq('project_status', options.projectStatus);
  }

  if (options.isFeatured) {
    query = query.eq('is_featured', true);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = (await withTimeout(
    query,
    2000,
    { data: null, error: new Error('Timeout') }
  )) as any;

  if (error || !data || data.length === 0) {
    return getCuratedPlaces(options.lang, options.categorySlug, options.searchQuery);
  }

  // Transform and resolve translations
  let results: PlaceWithDetails[] = data.map((item: any) => {
    const rawTranslations = (item.translations || []) as PlaceTranslation[];
    const resolvedTrans = resolveTranslation(rawTranslations, options.lang);
    const images = ((item.images || []) as PlaceImage[]).sort(
      (a, b) => a.display_order - b.display_order
    );
    const primaryImg = images.find((img) => img.is_primary) || images[0] || null;

    return {
      id: item.id,
      category_id: item.category_id,
      slug: item.slug,
      latitude: item.latitude,
      longitude: item.longitude,
      phone: item.phone,
      whatsapp: item.whatsapp,
      website_url: item.website_url,
      instagram_handle: item.instagram_handle,
      price_level: item.price_level,
      status: item.status,
      is_featured: item.is_featured,
      project_status: item.project_status,
      project_completion_date: item.project_completion_date,
      avg_rating: Number(item.avg_rating) || 0,
      review_count: item.review_count || 0,
      tags: item.tags || [],
      created_at: item.created_at,
      updated_at: item.updated_at,
      category: parseCategory(item.category, options.lang),
      translation: resolvedTrans,
      allTranslations: rawTranslations,
      images,
      primaryImageUrl: getPublicStorageUrl(primaryImg?.storage_path || null),
    };
  });

  // Category filter
  if (options.categorySlug && options.categorySlug !== 'all') {
    results = results.filter((p) => p.category?.slug === options.categorySlug);
  }

  // Client-side search across title, description, and tags
  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const q = options.searchQuery.toLowerCase().trim();
    results = results.filter((p) => {
      const matchTitle = p.translation.title.toLowerCase().includes(q);
      const matchDesc = p.translation.description.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags;
    });
  }

  return results;
}

/**
 * Fetches a single place by its unique slug.
 */
export async function fetchPlaceBySlug(
  slug: string,
  lang: SupportedLanguage
): Promise<PlaceWithDetails | null> {
  if (!isSupabaseConfigured) {
    return getCuratedPlaceBySlug(slug, lang);
  }

  const { data, error } = (await withTimeout(
    supabase
      .from('places')
      .select(`
        id,
        category_id,
        slug,
        latitude,
        longitude,
        phone,
        whatsapp,
        website_url,
        instagram_handle,
        price_level,
        status,
        is_featured,
        project_status,
        project_completion_date,
        avg_rating,
        review_count,
        tags,
        created_at,
        updated_at,
        category:categories(id, slug, icon, display_order, is_active, created_at),
        translations:place_translations(id, place_id, language_code, title, description, tips, address_text, practical_info),
        images:place_images(id, place_id, storage_path, caption, display_order, is_primary, created_at)
      `)
      .eq('slug', slug)
      .single(),
    2000,
    { data: null, error: new Error('Timeout') }
  )) as any;

  if (error || !data) {
    return getCuratedPlaceBySlug(slug, lang);
  }

  const rawTranslations = (data.translations || []) as PlaceTranslation[];
  const resolvedTrans = resolveTranslation(rawTranslations, lang);
  const images = ((data.images || []) as PlaceImage[]).sort(
    (a, b) => a.display_order - b.display_order
  );
  const primaryImg = images.find((img) => img.is_primary) || images[0] || null;

  return {
    id: data.id,
    category_id: data.category_id,
    slug: data.slug,
    latitude: data.latitude,
    longitude: data.longitude,
    phone: data.phone,
    whatsapp: data.whatsapp,
    website_url: data.website_url,
    instagram_handle: data.instagram_handle,
    price_level: data.price_level,
    status: data.status,
    is_featured: data.is_featured,
    project_status: data.project_status,
    project_completion_date: data.project_completion_date,
    avg_rating: Number(data.avg_rating) || 0,
    review_count: data.review_count || 0,
    tags: data.tags || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
    category: parseCategory(data.category, lang),
    translation: resolvedTrans,
    allTranslations: rawTranslations,
    images,
    primaryImageUrl: getPublicStorageUrl(primaryImg?.storage_path || null),
  };
}
