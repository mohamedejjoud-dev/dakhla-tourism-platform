// src/components/planner/StepAvoidance.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { TripPlannerInput } from '@/types/tripPlanner';

interface Props {
  data: TripPlannerInput;
  onChange: (updates: Partial<TripPlannerInput>) => void;
  onNext: () => void;
}

export const StepAvoidance: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation();

  const avoidanceItems = [
    { id: 'extreme_sports', label: t('planner.avoidExtremeSports', 'Extreme or physically demanding sports') },
    { id: 'long_drives', label: t('planner.avoidLongDrives', 'Long drives or bumpy 4x4 rides') },
    { id: 'long_walks', label: t('planner.avoidLongWalks', 'Strenuous walking in loose sand') },
    { id: 'early_mornings', label: t('planner.avoidEarlyMornings', 'Early morning starts before 9:00 AM') },
    { id: 'expensive_dining', label: t('planner.avoidExpensiveDining', 'Expensive high-end restaurants') },
    { id: 'seafood', label: t('planner.avoidSeafood', 'Seafood or fish dishes') },
    { id: 'crowds', label: t('planner.avoidCrowds', 'Crowded or tourist-heavy locations') },
    { id: 'late_nights', label: t('planner.avoidLateNights', 'Late night outings') },
    { id: 'heights', label: t('planner.avoidHeights', 'Heights or steep climbing') },
  ];

  const toggleAvoid = (id: string) => {
    const set = new Set(data.avoidances || []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange({ avoidances: Array.from(set) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.step6Title', 'Is there anything you would rather avoid?')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.step6Desc', 'Negative preferences strictly filter your itinerary. El Haj will respect what you want to skip.')}
        </p>
      </div>

      {/* Avoidance Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {avoidanceItems.map((item) => {
          const isSelected = data.avoidances?.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleAvoid(item.id)}
              className={`p-3 rounded-2xl border text-start flex items-center justify-between transition-all ${
                isSelected
                  ? 'border-rose-400 bg-rose-50/50 shadow-xs ring-1 ring-rose-400'
                  : 'border-[#E8E5DE] bg-white hover:border-[#176B87]/50 hover:bg-[#FCFBF8]'
              }`}
            >
              <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-rose-800' : 'text-[#1F2933]'}`}>
                {item.label}
              </span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ms-2 ${
                isSelected ? 'border-rose-500 bg-rose-500' : 'border-[#E8E5DE]'
              }`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Free-text field */}
      <div className="bg-[#FCFBF8] p-4 rounded-2xl border border-[#E8E5DE] space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2933]">
          <MessageSquare className="w-3.5 h-3.5 text-[#176B87]" />
          <span>{t('planner.additionalNotes', 'Anything else El Haj should take into account?')}</span>
        </label>
        <textarea
          rows={3}
          value={data.additionalNotes || ''}
          onChange={(e) => onChange({ additionalNotes: e.target.value })}
          placeholder={t('planner.additionalNotesPlaceholder', 'E.g., anniversary celebration, quiet sunset preference, slow morning coffee...')}
          className="w-full p-3 rounded-xl border border-[#E8E5DE] bg-white text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87] resize-none"
        />
      </div>

      <div className="flex justify-end pt-2">
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
