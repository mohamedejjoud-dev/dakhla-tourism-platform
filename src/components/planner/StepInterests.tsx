// src/components/planner/StepInterests.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TripPlannerInput } from '@/types/tripPlanner';

interface Props {
  data: TripPlannerInput;
  onChange: (updates: Partial<TripPlannerInput>) => void;
  onNext: () => void;
}

export const StepInterests: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation();

  const interestList = [
    { id: 'lagoon', label: t('planner.interestLagoon', 'Beaches & Turquoise Lagoon') },
    { id: 'kitesurf', label: t('planner.interestKitesurf', 'Kitesurfing & Wingfoil') },
    { id: 'surfing', label: t('planner.interestSurfing', 'Ocean Surfing & Waves') },
    { id: 'watersports', label: t('planner.interestWatersports', 'Water Sports & Boat Trips') },
    { id: 'desert', label: t('planner.interestDesert', 'Desert & 4x4 Adventures') },
    { id: 'white_dune', label: t('planner.interestWhiteDune', 'White Dune (Dune Blanche)') },
    { id: 'dragon_island', label: t('planner.interestDragonIsland', 'Dragon Island Excursion') },
    { id: 'moroccan_food', label: t('planner.interestMoroccanFood', 'Authentic Moroccan Cuisine') },
    { id: 'seafood', label: t('planner.interestSeafood', 'Fresh Seafood & Oysters') },
    { id: 'nature', label: t('planner.interestNature', 'Nature & Flamingos') },
    { id: 'relaxation', label: t('planner.interestRelaxation', 'Relaxation, Hammam & Spa') },
    { id: 'buggy', label: t('planner.interestBuggy', '4x4 & Buggy Desert Trails') },
    { id: 'fishing', label: t('planner.interestFishing', 'Surf Casting & Sea Fishing') },
    { id: 'photography', label: t('planner.interestPhotography', 'Scenic Photography & Panoramas') },
    { id: 'culture', label: t('planner.interestCulture', 'Saharan Culture & Heritage') },
    { id: 'romantic', label: t('planner.interestRomantic', 'Romantic Sunset Moments') },
    { id: 'family', label: t('planner.interestFamily', 'Family-Friendly Fun') },
    { id: 'luxury', label: t('planner.interestLuxury', 'Luxury & Eco-Lodge Escapes') },
    { id: 'affordable', label: t('planner.interestAffordable', 'Budget & Backpacking Gems') },
    { id: 'hidden', label: t('planner.interestHidden', 'Off-the-Beaten-Path Secrets') },
    { id: 'sunset', label: t('planner.interestSunset', 'Golden Hour Ocean Sunsets') },
    { id: 'shopping', label: t('planner.interestShopping', 'Artisans & Local Crafts') },
  ];

  const toggleInterest = (id: string) => {
    const set = new Set(data.interests || []);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    onChange({ interests: Array.from(set) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.step4Title', 'What experiences are you looking for?')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.step4Desc', "Select your main interests to prioritize recommendations. You don't have to choose everything.")}
        </p>
      </div>

      {/* Selectable Chips Grid */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {interestList.map((item) => {
          const isSelected = data.interests?.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleInterest(item.id)}
              className={`px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                isSelected
                  ? 'border-[#176B87] bg-[#176B87] text-white shadow-2xs scale-102'
                  : 'border-[#E8E5DE] bg-white text-[#1F2933] hover:border-[#176B87]/50 hover:bg-[#FCFBF8]'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-[#667580]">
          {data.interests?.length || 0} {t('planner.interestLagoon', 'selected')}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-full bg-[#176B87] hover:bg-[#13586F] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
        >
          {t('planner.next', 'Continue')}
        </button>
      </div>
    </div>
  );
};
