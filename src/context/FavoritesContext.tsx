import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { 
  fetchUserFavoriteIds, 
  addFavorite as apiAddFavorite, 
  removeFavorite as apiRemoveFavorite 
} from '@/services/favoritesService';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  isFavorite: (placeId: string) => boolean;
  toggleFavorite: (placeId: string) => Promise<boolean>;
  loading: boolean;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      setLoading(true);
      fetchUserFavoriteIds(user.id).then((ids) => {
        if (isMounted) {
          setFavoriteIds(new Set(ids));
          setLoading(false);
        }
      });
    } else {
      setFavoriteIds(new Set());
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isFavorite = (placeId: string) => favoriteIds.has(placeId);

  const toggleFavorite = async (placeId: string): Promise<boolean> => {
    if (!user) {
      openAuthModal();
      return false;
    }

    const currentlyFavorite = isFavorite(placeId);
    if (currentlyFavorite) {
      const ok = await apiRemoveFavorite(user.id, placeId);
      if (ok) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(placeId);
          return next;
        });
      }
      return !ok;
    } else {
      const ok = await apiAddFavorite(user.id, placeId);
      if (ok) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.add(placeId);
          return next;
        });
      }
      return ok;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite,
        toggleFavorite,
        loading,
        favoritesCount: favoriteIds.size,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
