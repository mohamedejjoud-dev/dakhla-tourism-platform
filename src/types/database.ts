export type SupportedLanguage = 'ar' | 'fr' | 'en';

export interface Category {
  id: string;
  slug: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CategoryTranslation {
  id: string;
  category_id: string;
  language_code: SupportedLanguage;
  name: string;
  description: string | null;
}

export interface CategoryWithTranslation extends Category {
  name: string;
  description: string | null;
  language_code: SupportedLanguage;
}

export type PlaceStatus = 'draft' | 'published' | 'archived';
export type ProjectStatus = 'operational' | 'under_construction' | 'planned';

export interface Place {
  id: string;
  category_id: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  website_url: string | null;
  instagram_handle: string | null;
  price_level: number; // 1 to 4
  status: PlaceStatus;
  is_featured: boolean;
  project_status: ProjectStatus;
  project_completion_date: string | null;
  avg_rating: number;
  review_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PlaceTranslation {
  id: string;
  place_id: string;
  language_code: SupportedLanguage;
  title: string;
  description: string;
  tips: string | null;
  address_text: string | null;
  practical_info: Record<string, unknown> | null;
}

export interface PlaceImage {
  id: string;
  place_id: string;
  storage_path: string;
  caption: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ResolvedTranslation {
  title: string;
  description: string;
  tips: string | null;
  address_text: string | null;
  practical_info: Record<string, unknown> | null;
  language_code: SupportedLanguage;
  isFallback: boolean;
  fallbackLang?: SupportedLanguage;
}

export interface PlaceWithDetails extends Place {
  category?: CategoryWithTranslation;
  translation: ResolvedTranslation;
  allTranslations: PlaceTranslation[];
  images: PlaceImage[];
  primaryImageUrl: string | null;
}
