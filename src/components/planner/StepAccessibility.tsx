// src/components/planner/StepAccessibility.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { TripPlannerInput } from '@/types/tripPlanner';

interface Props {
  data: TripPlannerInput;
  onChange: (updates: Partial<TripPlannerInput>) => void;
  onNext: () => void;
}

export const StepAccessibility: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation();

  const accessOptions = [
    { id: 'reduced_mobility', label: t('planner.accessReducedMobility', 'Reduced mobility / Limited walking') },
    { id: 'wheelchair', label: t('planner.accessWheelchair', 'Wheelchair accessible paths preferred') },
    { id: 'stroller', label: t('planner.accessStroller', 'Stroller-friendly for toddlers') },
    { id: 'frequent_rest', label: t('planner.accessFrequentRest', 'Frequent shaded rest breaks needed') },
    { id: 'no_stairs', label: t('planner.accessNoStairs', 'Avoid steep stairs or sand dunes climbing') },
    { id: 'quiet', label: t('planner.accessQuiet', 'Quiet, peaceful low-noise environments') },
  ];

  const toggleOption = (id: string) => {
    const set = new Set(data.accessibilityNeeds || []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange({ accessibilityNeeds: Array.from(set) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.stepAccessTitle', 'Accessibility & Comfort Considerations (Optional)')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.stepAccessDesc', 'Help El Haj tailor places with suitable terrain, step-free access, and rest stops.')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {accessOptions.map((opt) => {
          const isSelected = data.accessibilityNeeds?.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleOption(opt.id)}
              className={`p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                isSelected
                  ? 'border-[#176B87] bg-[#F3E8D2]/30 shadow-xs'
                  : 'border-[#E8E5DE] bg-white hover:border-[#176B87]/50 hover:bg-[#FCFBF8]'
              }`}
            >
              <span className="text-xs sm:text-sm font-semibold text-[#1F2933]">{opt.label}</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ms-2 ${
                isSelected ? 'border-[#176B87] bg-[#176B87]' : 'border-[#E8E5DE]'
              }`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-[#FCFBF8] rounded-xl border border-[#E8E5DE] flex items-center gap-2 text-[11px] text-[#667580]">
        <AlertCircle className="w-3.5 h-3.5 text-[#35A7A0] shrink-0" />
        <span>{t('planner.accessDisclaimer', 'Accessibility infrastructure in desert terrain varies. Contacting venues in advance is recommended.')}</span>
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
