import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Heart, Compass, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserFavoritePlaces } from '@/services/favoritesService';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceWithDetails, SupportedLanguage } from '@/types/database';

export const FavoritesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, openAuthModal } = useAuth();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const [places, setPlaces] = useState<PlaceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      setLoading(true);
      fetchUserFavoritePlaces(user.id, currentLang).then((data) => {
        if (isMounted) {
          setPlaces(data);
          setLoading(false);
        }
      });
    } else {
      setPlaces([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, currentLang]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 fill-rose-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-ocean-900">{t('favorites.title')}</h2>
        <p className="text-sm text-slate-600">{t('auth.loginRequired')}</p>
        <button
          onClick={openAuthModal}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-lagoon-600 text-white font-bold text-sm shadow-md"
        >
          <LogIn className="w-4 h-4" />
          <span>{t('auth.signIn')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold">
          <Heart className="w-3.5 h-3.5 fill-rose-600" />
          <span>{t('favorites.title')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ocean-900 tracking-tight">
          {t('favorites.title')}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          {t('favorites.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-lagoon-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : places.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="py-16 px-6 text-center bg-white rounded-2xl border border-sand-200/90 shadow-sm max-w-md mx-auto space-y-4">
          <Heart className="w-12 h-12 text-sand-300 mx-auto" />
          <h3 className="text-lg font-bold text-ocean-900">{t('favorites.empty')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('favorites.emptyDescription')}
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lagoon-600 text-white font-bold text-xs shadow-md"
            >
              <Compass className="w-4 h-4" />
              <span>{t('favorites.exploreButton')}</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};
