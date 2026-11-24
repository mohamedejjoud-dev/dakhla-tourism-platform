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
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-sand-100 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-ocean-950">{t('favorites.title')}</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-light">{t('auth.loginRequired')}</p>
        </div>
        <button
          onClick={openAuthModal}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ocean-950 hover:bg-ocean-900 text-sand-100 font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
        >
          <LogIn className="w-4 h-4 text-lagoon-400" />
          <span>{t('auth.signIn')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-10">
      
      {/* Editorial Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sand-100 text-rose-700 text-xs font-mono font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-rose-600" />
          <span>Carnet de Voyage Privé</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ocean-950 tracking-tight leading-tight">
          {t('favorites.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
          {t('favorites.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-lagoon-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">{t('common.loading')}</p>
        </div>
      ) : places.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="py-20 px-8 text-center bg-white rounded-3xl border border-sand-200/90 shadow-editorial max-w-lg mx-auto space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-sand-100 text-sand-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-sand-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-ocean-950">{t('favorites.empty')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              {t('favorites.emptyDescription')}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ocean-950 hover:bg-ocean-900 text-sand-100 font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <Compass className="w-4 h-4 text-lagoon-400" />
              <span>{t('favorites.exploreButton')}</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};
