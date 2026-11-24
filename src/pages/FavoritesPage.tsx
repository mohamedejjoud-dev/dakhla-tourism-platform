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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Editorial Header */}
      <div className="space-y-1.5 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3E8D2]/50 text-rose-700 text-xs font-semibold tracking-wider uppercase">
          <Heart className="w-3.5 h-3.5 fill-rose-600" />
          <span>Carnet de Voyage Privé</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F2933] tracking-tight">
          {t('favorites.title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#667580] leading-relaxed">
          {t('favorites.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#176B87] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#667580]">{t('common.loading')}</p>
        </div>
      ) : places.length > 0 ? (
        places.length === 1 ? (
          <div className="max-w-[360px] sm:max-w-[400px]">
            <PlaceCard place={places[0]} />
          </div>
        ) : places.length === 2 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-5 sm:gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )
      ) : (
        <div className="py-14 px-6 text-center bg-white rounded-2xl border border-[#E8E5DE] max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F3E8D2]/40 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1F2933]">{t('favorites.empty')}</h3>
            <p className="text-xs text-[#667580] leading-relaxed">
              {t('favorites.emptyDescription')}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#176B87] hover:bg-[#13586F] text-white font-medium text-xs transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t('favorites.exploreButton')}</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};
