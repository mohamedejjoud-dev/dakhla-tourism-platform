import { supabase } from '@/lib/supabase';
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
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug, icon, display_order, is_active, created_at')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (catError) {
    console.error('Error fetching categories:', catError);
    return [];
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

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }

  if (!data) return [];

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
  const { data, error } = await supabase
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
    .single();

  if (error || !data) {
    console.error('Error fetching place by slug:', error);
    return null;
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
