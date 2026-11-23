import React from 'react';
import { useTranslation } from 'react-i18next';
import { Waves, Wind, Shield, Compass, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lagoon-50 text-lagoon-700 text-xs font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>{t('nav.about')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ocean-900 tracking-tight">
          Dakhla — La Perle du Sahara Marocain
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Une péninsule d'exception s'étendant sur 40 kilomètres entre l'Océan Atlantique et une lagune turquoise classée d'importance internationale.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-sand-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-lagoon-50 text-lagoon-600 flex items-center justify-center font-bold">
            <Wind className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-ocean-900">Les Alizés Constants</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Grâce aux alizés constants soufflant plus de 300 jours par an, Dakhla s'est imposée comme la capitale mondiale incontestée du kitesurf et du wingfoil.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-sand-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sand-100 text-sand-700 flex items-center justify-center font-bold">
            <Waves className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-ocean-900">La Lagune Préservée</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Site Ramsar international abritant une faune marine rare : dauphins à bosse de l'Atlantique, flamants roses, et herbiers marins protégés.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-sand-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-ocean-50 text-ocean-700 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-ocean-900">Le Port Dakhla Atlantique</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Mégaprojet stratégique renforçant la façade atlantique du Royaume du Maroc et son ouverture maritime vers l'Afrique subsaharienne et l'international.
          </p>
        </div>
      </div>

      {/* Cultural & Authentic Note */}
      <div className="p-8 bg-sand-100/60 rounded-2xl border border-sand-200/80 space-y-4 text-center">
        <h2 className="text-xl font-bold text-ocean-900">
          Hospitalité Saharienne & Authenticité
        </h2>
        <p className="text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
          À Dakhla, la tradition séculaire du thé saharien, la générosité des habitants et le respect des équilibres naturels s'allient pour offrir aux visiteurs une expérience de voyage inoubliable.
        </p>
        <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-sand-700 font-bold">
          <span>Région de Dakhla-Oued Ed-Dahab • Royaume du Maroc</span>
          <Heart className="w-3.5 h-3.5 text-sand-600 fill-sand-600" />
        </div>
      </div>

    </div>
  );
};
