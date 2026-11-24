import React from 'react';
import { useTranslation } from 'react-i18next';
import { Waves, Wind, Shield, Compass, Heart, Anchor, Sun, CheckCircle2 } from 'lucide-react';
import { SeoMeta } from '@/components/seo/SeoMeta';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  const pillars = [
    {
      icon: Wind,
      title: 'Les Alizés Constants du Nord',
      sub: 'Capitale Mondiale du Kitesurf',
      desc: 'Bénéficiant d’alizés réguliers soufflant plus de 300 jours par an à une force idéale de 15 à 25 nœuds, la baie abritée de Dakhla constitue la destination n°1 au monde pour le kitesurf, le wingfoil et le surf.',
    },
    {
      icon: Waves,
      title: 'La Lagune Préservée & Site Ramsar',
      sub: 'Sanctuaire Écologique International',
      desc: 'S’étendant sur 40 kilomètres, la lagune de Dakhla abrite une biodiversité marine d’une richesse inestimable : dauphins à bosse de l’Atlantique, colonies de flamants roses migrateurs, herbiers marins et tortues marines.',
    },
    {
      icon: Anchor,
      title: 'Le Port Dakhla Atlantique',
      sub: 'Mégaprojet Structurant du Royaume',
      desc: 'Inscrit dans la vision royale pour la façade atlantique, ce complexe portuaire en eau profonde de classe mondiale renforce l’ouverture maritime du Maroc et de l’Afrique subsaharienne sur les routes maritimes internationales.',
    },
    {
      icon: Sun,
      title: 'Hospitalité & Culture Sahraouie',
      sub: 'Générosité & Authenticité Millénaire',
      desc: 'L’accueil chaleureux des habitants, la poésie hassanie, l’artisanat d’argent et de cuir, et le cérémonial des trois verres de thé partagés au coucher du soleil font de chaque séjour une expérience humaine inoubliable.',
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 space-y-8">
      <SeoMeta
        title="About Dakhla — La Perle du Sahara Marocain"
        description="Une péninsule d'exception s'étendant sur 40 kilomètres entre l'Océan Atlantique et une lagune turquoise classée d'importance internationale."
        canonicalPath="/about"
      />
      
      {/* Editorial Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sand-100 text-sand-800 text-xs font-mono font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-sand-600" />
          <span>{t('nav.about')} • 23°43′N 15°56′W</span>
        </div>
        
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-ocean-950 tracking-tight leading-tight">
          Dakhla — La Perle du Sahara Marocain
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
          Une péninsule d'exception s'étendant sur 40 kilomètres entre l'Océan Atlantique et une lagune turquoise classée d'importance internationale.
        </p>
      </div>

      {/* Atmospheric Photographic Banner */}
      <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-editorial bg-ocean-950">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fm=webp&fit=crop&w=1600&q=80"
          alt="Vue aérienne de la péninsule de Dakhla"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/80 via-transparent to-transparent flex items-end p-6 sm:p-8">
          <p className="font-serif italic text-sand-100 text-lg sm:text-xl max-w-xl">
            « Là où la chaleur dorée du désert rencontre la fraîcheur vivifiante de l'Océan. »
          </p>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {pillars.map((pil, idx) => {
          const Icon = pil.icon;
          return (
            <div
              key={idx}
              className="p-8 bg-white rounded-3xl border border-sand-200/90 shadow-editorial space-y-4 hover:shadow-editorial-hover transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-sand-100 text-ocean-950 flex items-center justify-center font-bold">
                <Icon className="w-6 h-6 text-lagoon-600" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lagoon-700 block">
                  {pil.sub}
                </span>
                <h3 className="font-serif text-xl font-bold text-ocean-950">
                  {pil.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                {pil.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Cultural & Authentic Hospitality Section */}
      <div className="p-8 sm:p-10 bg-sand-100/70 rounded-3xl border border-sand-200/90 shadow-xs space-y-4 text-center max-w-3xl mx-auto">
        <span className="text-[11px] font-mono font-bold text-sand-700 uppercase tracking-widest">
          Patrimoine Immatériel
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ocean-950">
          Hospitalité Saharienne & Authenticité
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed font-light">
          À Dakhla, la tradition séculaire du thé saharien, la générosité des habitants et le respect des équilibres naturels s'allient pour offrir aux visiteurs une expérience de voyage inoubliable, entre aventures sportives et contemplation désertique.
        </p>
        <div className="pt-3 flex items-center justify-center gap-2 text-xs text-sand-700 font-mono font-bold">
          <span>Région de Dakhla-Oued Ed-Dahab • Royaume du Maroc</span>
          <Heart className="w-3.5 h-3.5 text-sand-600 fill-sand-600 inline" />
        </div>
      </div>

      {/* CNDP & Moroccan Law 09-08 Privacy Section (Required: id="privacy") */}
      <div id="privacy" className="p-8 sm:p-10 bg-white rounded-3xl border border-sand-200/90 shadow-editorial space-y-5">
        <div className="flex items-center gap-3 text-ocean-950">
          <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-lagoon-600 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">
              Protection des Données Personnelles (Loi 09-08 / CNDP)
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
          Conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, la plateforme touristique Dakhlin garantit la stricte confidentialité et la sécurité des données des visiteurs et touristes.
        </p>

        <ul className="text-xs text-slate-600 space-y-2.5 list-none">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-lagoon-600 shrink-0 mt-0.5" />
            <span>Seules les données strictement nécessaires au fonctionnement de la session utilisateur et des favoris sont traitées.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-lagoon-600 shrink-0 mt-0.5" />
            <span>Les identités des auteurs d'avis sont isolées via la vue sécurisée <code>public_review_authors</code> sans exposition de courriel.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-lagoon-600 shrink-0 mt-0.5" />
            <span>Chaque utilisateur dispose d'un droit permanent d'accès, de rectification et d'opposition conformément aux dispositions de la CNDP.</span>
          </li>
        </ul>
      </div>

    </div>
  );
};
