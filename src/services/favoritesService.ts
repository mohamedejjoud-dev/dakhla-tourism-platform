import { supabase } from '@/lib/supabase';
import { PlaceWithDetails, SupportedLanguage } from '@/types/database';
import { fetchPublishedPlaces } from '@/services/tourismService';

export async function fetchUserFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('place_id')
    .eq('user_id', userId);

  if (error || !data) {
    console.error('Error fetching favorite IDs:', error);
    return [];
  }

  return data.map((row) => row.place_id);
}

export async function addFavorite(userId: string, placeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      place_id: placeId,
    });

  if (error) {
    // Unique violation uq_user_place_favorite is not a real failure (already favorited)
    if (error.code === '23505') return true;
    console.error('Error adding favorite:', error);
    return false;
  }
  return true;
}

export async function removeFavorite(userId: string, placeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
  return true;
}

export async function fetchUserFavoritePlaces(
  userId: string,
  lang: SupportedLanguage
): Promise<PlaceWithDetails[]> {
  const favoriteIds = await fetchUserFavoriteIds(userId);
  if (favoriteIds.length === 0) return [];

  const allPlaces = await fetchPublishedPlaces({ lang });
  return allPlaces.filter((p) => favoriteIds.includes(p.id));
}
