import { supabase } from '@/lib/supabase';
import { SupportedLanguage } from '@/types/database';

export interface ReviewWithAuthor {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  language_code: SupportedLanguage;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Fetches approved reviews for a place, joining author details securely via public_review_authors view.
 * Zero email exposure.
 */
export async function fetchPlaceReviews(placeId: string): Promise<ReviewWithAuthor[]> {
  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('id, place_id, user_id, rating, comment, language_code, status, created_at')
    .eq('place_id', placeId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (reviewError || !reviews || reviews.length === 0) {
    return [];
  }

  // Fetch author details through security barrier view
  const userIds = Array.from(new Set(reviews.map((r) => r.user_id)));
  const { data: authors, error: authorError } = await supabase
    .from('public_review_authors')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  if (authorError) {
    console.warn('Could not load review authors from view:', authorError);
  }

  const authorsMap = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>();
  if (authors) {
    for (const a of authors) {
      authorsMap.set(a.id, a);
    }
  }

  return reviews.map((r) => ({
    ...r,
    rating: Number(r.rating),
    language_code: r.language_code as SupportedLanguage,
    author: authorsMap.get(r.user_id) || null,
  }));
}

export async function getUserReviewForPlace(
  userId: string,
  placeId: string
): Promise<ReviewWithAuthor | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, place_id, user_id, rating, comment, language_code, status, created_at')
    .eq('place_id', placeId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    rating: Number(data.rating),
    language_code: data.language_code as SupportedLanguage,
    author: null,
  };
}

export interface SubmitReviewParams {
  placeId: string;
  userId: string;
  rating: number;
  comment: string;
  languageCode: SupportedLanguage;
}

export async function submitPlaceReview(
  params: SubmitReviewParams
): Promise<{ success: boolean; error: string | null; duplicate?: boolean }> {
  if (params.rating < 1 || params.rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5' };
  }
  if (!params.comment || params.comment.trim().length < 5) {
    return { success: false, error: 'Comment must be at least 5 characters' };
  }

  const { error } = await supabase
    .from('reviews')
    .insert({
      place_id: params.placeId,
      user_id: params.userId,
      rating: params.rating,
      comment: params.comment.trim(),
      language_code: params.languageCode,
      status: 'approved',
    });

  if (error) {
    if (error.code === '23505' || error.message.includes('uq_place_user_review')) {
      return { success: false, error: 'You have already reviewed this place', duplicate: true };
    }
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
