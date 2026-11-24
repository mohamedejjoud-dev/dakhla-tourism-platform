// src/components/planner/StepPace.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Coffee, Compass, Zap } from 'lucide-react';
import { TravelPace, TripPlannerInput } from '@/types/tripPlanner';

interface Props {
  data: TripPlannerInput;
  onChange: (updates: Partial<TripPlannerInput>) => void;
  onNext: () => void;
}

export const StepPace: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation();

  const paceOptions: Array<{ pace: TravelPace; title: string; desc: string; icon: React.FC<any> }> = [
    {
      pace: 'relaxed',
      title: t('planner.paceRelaxed', 'Relaxed'),
      desc: t('planner.paceRelaxedDesc', 'A few curated highlights with plenty of downtime by the water.'),
      icon: Coffee,
    },
    {
      pace: 'balanced',
      title: t('planner.paceBalanced', 'Balanced'),
      desc: t('planner.paceBalancedDesc', 'A smooth blend of morning sights, delicious food, and relaxed afternoons.'),
      icon: Compass,
    },
    {
      pace: 'full',
      title: t('planner.paceFull', 'Full experience'),
      desc: t('planner.paceFullDesc', 'An active itinerary for travelers who want to see and explore as much as possible.'),
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.step7Title', 'What travel pace do you prefer?')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.step7Desc', 'How full would you like your days to feel?')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paceOptions.map((opt) => {
          const isSelected = data.pace === opt.pace;
          const Icon = opt.icon;
          return (
            <button
              key={opt.pace}
              type="button"
              onClick={() => onChange({ pace: opt.pace })}
              className={`p-4 rounded-2xl border text-start flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-[#176B87] bg-[#F3E8D2]/30 shadow-xs ring-1 ring-[#176B87]'
                  : 'border-[#E8E5DE] bg-white hover:border-[#176B87]/50 hover:bg-[#FCFBF8]'
              }`}
            >
              <div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-[#176B87] text-white' : 'bg-[#FCFBF8] text-[#176B87]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-[#1F2933] mb-1">
                  {opt.title}
                </h3>
                <p className="text-[11px] text-[#667580] leading-relaxed">
                  {opt.desc}
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-[#176B87] bg-[#176B87]' : 'border-[#E8E5DE]'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          );
        })}
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
