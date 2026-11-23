// src/services/adminService.ts
// Privileged administrative operations for Place CMS, Category CMS, and Review Moderation
// Enforces database RLS policies (public.is_admin() required)

import { supabase } from '@/lib/supabase';
import { 
  Place, 
  PlaceStatus, 
  ProjectStatus, 
  SupportedLanguage 
} from '@/types/database';

export interface AdminPlaceTranslationInput {
  language_code: SupportedLanguage;
  title: string;
  short_description: string;
  full_description: string;
  address_display?: string;
  practical_tips?: string;
}

export interface AdminPlaceImageInput {
  id?: string;
  storage_path: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface AdminPlaceInput {
  category_id: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  phone?: string | null;
  whatsapp?: string | null;
  website_url?: string | null;
  instagram_handle?: string | null;
  price_level?: number | null;
  status: PlaceStatus;
  is_featured: boolean;
  project_status: ProjectStatus;
  project_completion_date?: string | null;
  tags?: string[];
}

export interface AdminPlaceDetail extends Place {
  category?: {
    id: string;
    slug: string;
    name?: string;
  };
  translations: Record<SupportedLanguage, AdminPlaceTranslationInput>;
  images: AdminPlaceImageInput[];
}

export interface AdminStats {
  totalPlaces: number;
  publishedPlaces: number;
  draftPlaces: number;
  archivedPlaces: number;
  totalCategories: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  totalReviews: number;
}

export interface AdminReviewItem {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  language_code: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  place?: {
    id: string;
    slug: string;
    title?: string;
  };
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email?: string | null;
  };
}

export interface AdminCategoryItem {
  id: string;
  slug: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  translations: Record<SupportedLanguage, { name: string; description: string | null }>;
  placesCount?: number;
}

// ----------------------------------------------------------------------------
// 1. STATS OVERVIEW
// ----------------------------------------------------------------------------
export async function getAdminStats(): Promise<AdminStats> {
  const [
    { count: totalPlaces },
    { count: publishedPlaces },
    { count: draftPlaces },
    { count: archivedPlaces },
    { count: totalCategories },
    { count: pendingReviews },
    { count: approvedReviews },
    { count: rejectedReviews },
    { count: totalReviews },
  ] = await Promise.all([
    supabase.from('places').select('*', { count: 'exact', head: true }),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalPlaces: totalPlaces || 0,
    publishedPlaces: publishedPlaces || 0,
    draftPlaces: draftPlaces || 0,
    archivedPlaces: archivedPlaces || 0,
    totalCategories: totalCategories || 0,
    pendingReviews: pendingReviews || 0,
    approvedReviews: approvedReviews || 0,
    rejectedReviews: rejectedReviews || 0,
    totalReviews: totalReviews || 0,
  };
}

// ----------------------------------------------------------------------------
// 2. PLACES CMS
// ----------------------------------------------------------------------------
export async function listAdminPlaces(params?: {
  search?: string;
  status?: PlaceStatus | 'all';
  categoryId?: string;
}): Promise<AdminPlaceDetail[]> {
  let query = supabase
    .from('places')
    .select(`
      *,
      category:categories(id, slug),
      translations:place_translations(language_code, title, short_description, full_description, address_display, practical_tips),
      images:place_images(id, storage_path, alt_text, is_primary, display_order)
    `)
    .order('created_at', { ascending: false });

  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params?.categoryId && params.categoryId !== 'all') {
    query = query.eq('category_id', params.categoryId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to list admin places: ${error.message}`);
  }

  let places = (data || []).map((row: any) => {
    const translationsMap: Record<SupportedLanguage, AdminPlaceTranslationInput> = {
      ar: { language_code: 'ar', title: '', short_description: '', full_description: '' },
      fr: { language_code: 'fr', title: '', short_description: '', full_description: '' },
      en: { language_code: 'en', title: '', short_description: '', full_description: '' },
    };

    if (Array.isArray(row.translations)) {
      row.translations.forEach((t: AdminPlaceTranslationInput) => {
        if (t.language_code in translationsMap) {
          translationsMap[t.language_code] = t;
        }
      });
    }

    return {
      ...row,
      translations: translationsMap,
      images: row.images || [],
    } as AdminPlaceDetail;
  });

  if (params?.search && params.search.trim()) {
    const s = params.search.toLowerCase();
    places = places.filter((p) => {
      const slugMatch = p.slug.toLowerCase().includes(s);
      const titleMatch =
        p.translations.en?.title?.toLowerCase().includes(s) ||
        p.translations.fr?.title?.toLowerCase().includes(s) ||
        p.translations.ar?.title?.includes(s);
      return slugMatch || titleMatch;
    });
  }

  return places;
}

export async function getAdminPlaceById(id: string): Promise<AdminPlaceDetail | null> {
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(id, slug),
      translations:place_translations(language_code, title, short_description, full_description, address_display, practical_tips),
      images:place_images(id, storage_path, alt_text, is_primary, display_order)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  const translationsMap: Record<SupportedLanguage, AdminPlaceTranslationInput> = {
    ar: { language_code: 'ar', title: '', short_description: '', full_description: '' },
    fr: { language_code: 'fr', title: '', short_description: '', full_description: '' },
    en: { language_code: 'en', title: '', short_description: '', full_description: '' },
  };

  if (Array.isArray(data.translations)) {
    data.translations.forEach((t: AdminPlaceTranslationInput) => {
      if (t.language_code in translationsMap) {
        translationsMap[t.language_code] = t;
      }
    });
  }

  return {
    ...data,
    translations: translationsMap,
    images: data.images || [],
  } as AdminPlaceDetail;
}

export async function createAdminPlace(
  place: AdminPlaceInput,
  translations: AdminPlaceTranslationInput[],
  images: AdminPlaceImageInput[]
): Promise<string> {
  // Validate coordinates rule: published place MUST have verified coordinates
  if (place.status === 'published' && (place.latitude === null || place.longitude === null)) {
    throw new Error('Published places must possess valid GPS coordinates (chk_places_published_coords constraint).');
  }

  // 1. Insert place
  const { data: createdPlace, error: placeError } = await supabase
    .from('places')
    .insert({
      category_id: place.category_id,
      slug: place.slug,
      latitude: place.latitude,
      longitude: place.longitude,
      phone: place.phone || null,
      whatsapp: place.whatsapp || null,
      website_url: place.website_url || null,
      instagram_handle: place.instagram_handle || null,
      price_level: place.price_level || 2,
      status: place.status,
      is_featured: place.is_featured,
      project_status: place.project_status || 'not_applicable',
      project_completion_date: place.project_completion_date || null,
      tags: place.tags || [],
    })
    .select('id')
    .single();

  if (placeError || !createdPlace) {
    throw new Error(`Failed to create place: ${placeError?.message}`);
  }

  const placeId = createdPlace.id;

  // 2. Insert translations
  const validTranslations = translations
    .filter((t) => t.title && t.title.trim())
    .map((t) => ({
      place_id: placeId,
      language_code: t.language_code,
      title: t.title.trim(),
      short_description: t.short_description || null,
      full_description: t.full_description || null,
      address_display: t.address_display || null,
      practical_tips: t.practical_tips || null,
    }));

  if (validTranslations.length > 0) {
    const { error: trError } = await supabase
      .from('place_translations')
      .insert(validTranslations);

    if (trError) {
      throw new Error(`Failed to insert translations: ${trError.message}`);
    }
  }

  // 3. Insert images
  if (images.length > 0) {
    const imagesToInsert = images.map((img, idx) => ({
      place_id: placeId,
      storage_path: img.storage_path,
      alt_text: img.alt_text || null,
      is_primary: img.is_primary || idx === 0,
      display_order: img.display_order ?? idx,
    }));

    const { error: imgError } = await supabase
      .from('place_images')
      .insert(imagesToInsert);

    if (imgError) {
      console.warn('Failed to insert images:', imgError.message);
    }
  }

  return placeId;
}

export async function updateAdminPlace(
  id: string,
  place: AdminPlaceInput,
  translations: AdminPlaceTranslationInput[],
  images: AdminPlaceImageInput[]
): Promise<void> {
  // Validate coordinates rule
  if (place.status === 'published' && (place.latitude === null || place.longitude === null)) {
    throw new Error('Published places must possess valid GPS coordinates (chk_places_published_coords constraint).');
  }

  // 1. Update place core row
  const { error: placeError } = await supabase
    .from('places')
    .update({
      category_id: place.category_id,
      slug: place.slug,
      latitude: place.latitude,
      longitude: place.longitude,
      phone: place.phone || null,
      whatsapp: place.whatsapp || null,
      website_url: place.website_url || null,
      instagram_handle: place.instagram_handle || null,
      price_level: place.price_level || 2,
      status: place.status,
      is_featured: place.is_featured,
      project_status: place.project_status || 'not_applicable',
      project_completion_date: place.project_completion_date || null,
      tags: place.tags || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (placeError) {
    throw new Error(`Failed to update place: ${placeError.message}`);
  }

  // 2. Upsert translations
  for (const t of translations) {
    if (t.title && t.title.trim()) {
      const { error: trError } = await supabase
        .from('place_translations')
        .upsert(
          {
            place_id: id,
            language_code: t.language_code,
            title: t.title.trim(),
            short_description: t.short_description || null,
            full_description: t.full_description || null,
            address_display: t.address_display || null,
            practical_tips: t.practical_tips || null,
          },
          { onConflict: 'place_id,language_code' }
        );

      if (trError) {
        throw new Error(`Failed to upsert translation for ${t.language_code}: ${trError.message}`);
      }
    }
  }

  // 3. Update images
  // Delete existing images not in new list
  const existingImageIds = images.filter((img) => img.id).map((img) => img.id as string);
  
  if (existingImageIds.length > 0) {
    await supabase
      .from('place_images')
      .delete()
      .eq('place_id', id)
      .not('id', 'in', `(${existingImageIds.join(',')})`);
  } else {
    await supabase.from('place_images').delete().eq('place_id', id);
  }

  // Insert or update new images
  for (let idx = 0; idx < images.length; idx++) {
    const img = images[idx];
    if (img.id) {
      await supabase
        .from('place_images')
        .update({
          alt_text: img.alt_text || null,
          is_primary: img.is_primary,
          display_order: idx,
        })
        .eq('id', img.id);
    } else {
      await supabase.from('place_images').insert({
        place_id: id,
        storage_path: img.storage_path,
        alt_text: img.alt_text || null,
        is_primary: img.is_primary,
        display_order: idx,
      });
    }
  }
}

export async function deleteAdminPlace(id: string): Promise<void> {
  const { error } = await supabase.from('places').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete place: ${error.message}`);
  }
}

// ----------------------------------------------------------------------------
// 3. CATEGORIES CMS
// ----------------------------------------------------------------------------
export async function listAdminCategories(): Promise<AdminCategoryItem[]> {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      translations:category_translations(language_code, name, description)
    `)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to list admin categories: ${error.message}`);
  }

  return (data || []).map((row: any) => {
    const translationsMap: Record<SupportedLanguage, { name: string; description: string | null }> = {
      ar: { name: '', description: null },
      fr: { name: '', description: null },
      en: { name: '', description: null },
    };

    if (Array.isArray(row.translations)) {
      row.translations.forEach((t: any) => {
        if (t.language_code in translationsMap) {
          translationsMap[t.language_code as SupportedLanguage] = {
            name: t.name,
            description: t.description,
          };
        }
      });
    }

    return {
      ...row,
      translations: translationsMap,
    };
  });
}

export async function saveAdminCategory(category: {
  id?: string;
  slug: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  translations: Record<SupportedLanguage, { name: string; description?: string | null }>;
}): Promise<string> {
  let categoryId: string = category.id || '';

  if (categoryId) {
    // Update
    const { error } = await supabase
      .from('categories')
      .update({
        slug: category.slug,
        icon: category.icon,
        display_order: category.display_order,
        is_active: category.is_active,
      })
      .eq('id', categoryId);

    if (error) throw new Error(`Failed to update category: ${error.message}`);
  } else {
    // Insert
    const { data, error } = await supabase
      .from('categories')
      .insert({
        slug: category.slug,
        icon: category.icon,
        display_order: category.display_order,
        is_active: category.is_active,
      })
      .select('id')
      .single();

    if (error || !data) throw new Error(`Failed to insert category: ${error?.message}`);
    categoryId = data.id;
  }

  // Upsert translations
  for (const lang of ['ar', 'fr', 'en'] as SupportedLanguage[]) {
    const tr = category.translations[lang];
    if (tr && tr.name && tr.name.trim()) {
      await supabase.from('category_translations').upsert(
        {
          category_id: categoryId,
          language_code: lang,
          name: tr.name.trim(),
          description: tr.description || null,
        },
        { onConflict: 'category_id,language_code' }
      );
    }
  }

  return categoryId;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  // Ensure no places are attached before deleting (schema has ON DELETE RESTRICT)
  const { count } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  if (count && count > 0) {
    throw new Error(`Cannot delete category: ${count} place(s) are attached to this category.`);
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}

// ----------------------------------------------------------------------------
// 4. REVIEW MODERATION
// ----------------------------------------------------------------------------
export async function listAdminReviews(
  statusFilter: 'pending' | 'approved' | 'rejected' | 'all' = 'all'
): Promise<AdminReviewItem[]> {
  let query = supabase
    .from('reviews')
    .select(`
      id,
      place_id,
      user_id,
      rating,
      comment,
      language_code,
      status,
      created_at,
      updated_at,
      place:places(id, slug, translations:place_translations(language_code, title)),
      author:profiles!reviews_user_id_fkey(id, full_name, avatar_url, email)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to list reviews: ${error.message}`);
  }

  return (data || []).map((row: any) => {
    let placeTitle = row.place?.slug;
    if (row.place?.translations && Array.isArray(row.place.translations)) {
      const en = row.place.translations.find((t: any) => t.language_code === 'en');
      const fr = row.place.translations.find((t: any) => t.language_code === 'fr');
      const ar = row.place.translations.find((t: any) => t.language_code === 'ar');
      placeTitle = en?.title || fr?.title || ar?.title || row.place?.slug;
    }

    return {
      id: row.id,
      place_id: row.place_id,
      user_id: row.user_id,
      rating: row.rating,
      comment: row.comment,
      language_code: row.language_code,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      place: {
        id: row.place?.id,
        slug: row.place?.slug,
        title: placeTitle,
      },
      author: row.author ? {
        id: row.author.id,
        full_name: row.author.full_name,
        avatar_url: row.author.avatar_url,
        email: row.author.email,
      } : undefined,
    };
  });
}

export async function updateReviewStatus(
  reviewId: string,
  newStatus: 'approved' | 'rejected'
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId);

  if (error) {
    throw new Error(`Failed to update review status: ${error.message}`);
  }
}

export async function deleteAdminReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}
