// src/components/planner/StepTravelers.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Users, Heart, Home, Plus, Minus } from 'lucide-react';
import { TravelerType, TripPlannerInput } from '@/types/tripPlanner';

interface Props {
  data: TripPlannerInput;
  onChange: (updates: Partial<TripPlannerInput>) => void;
  onNext: () => void;
}

export const StepTravelers: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation();

  const travelerOptions: Array<{ type: TravelerType; label: string; icon: React.FC<any> }> = [
    { type: 'solo', label: t('planner.travelerSolo', 'Solo traveler'), icon: User },
    { type: 'couple', label: t('planner.travelerCouple', 'Couple'), icon: Heart },
    { type: 'friends', label: t('planner.travelerFriends', 'Friends'), icon: Users },
    { type: 'family', label: t('planner.travelerFamily', 'Family'), icon: Home },
    { type: 'group', label: t('planner.travelerGroup', 'Group'), icon: Users },
  ];

  const handleSelectType = (type: TravelerType) => {
    let adults = data.adultsCount;
    if (type === 'solo') adults = 1;
    else if (type === 'couple') adults = 2;
    else if (adults < 2) adults = 2;
    onChange({ travelerType: type, adultsCount: adults });
  };

  const updateAdults = (delta: number) => {
    const next = Math.max(1, Math.min(20, (data.adultsCount || 1) + delta));
    onChange({ adultsCount: next });
  };

  const updateChildren = (delta: number) => {
    const next = Math.max(0, Math.min(10, (data.childrenCount || 0) + delta));
    onChange({ childrenCount: next });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.step2Title', 'Who are you traveling with?')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.step2Desc', 'El Haj will tailor activity suitability, pace, and dining for your party.')}
        </p>
      </div>

      {/* Traveler Type Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {travelerOptions.map((opt) => {
          const isSelected = data.travelerType === opt.type;
          const Icon = opt.icon;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => handleSelectType(opt.type)}
              className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                isSelected
                  ? 'border-[#176B87] bg-[#F3E8D2]/30 shadow-xs ring-1 ring-[#176B87]'
                  : 'border-[#E8E5DE] bg-white hover:border-[#176B87]/50 hover:bg-[#FCFBF8]'
              }`}
            >
              <div className={`p-2 rounded-full ${isSelected ? 'bg-[#176B87] text-white' : 'bg-[#FCFBF8] text-[#176B87]'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-[#1F2933]">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Headcount Adjusters */}
      <div className="bg-[#FCFBF8] p-4 rounded-2xl border border-[#E8E5DE] space-y-4">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-xs font-bold text-[#1F2933]">{t('planner.adultsCount', 'Adults')}</p>
            <p className="text-[11px] text-[#667580]">18+ {t('planner.glanceDays', 'years')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateAdults(-1)}
              disabled={data.adultsCount <= 1}
              className="w-8 h-8 rounded-full border border-[#E8E5DE] bg-white text-[#1F2933] flex items-center justify-center disabled:opacity-40 hover:bg-[#FCFBF8]"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-[#1F2933]">{data.adultsCount || 1}</span>
            <button
              type="button"
              onClick={() => updateAdults(1)}
              className="w-8 h-8 rounded-full border border-[#E8E5DE] bg-white text-[#1F2933] flex items-center justify-center hover:bg-[#FCFBF8]"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-[#E8E5DE]">
          <div>
            <p className="text-xs font-bold text-[#1F2933]">{t('planner.childrenCount', 'Children')}</p>
            <p className="text-[11px] text-[#667580]">0–17 {t('planner.glanceDays', 'years')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateChildren(-1)}
              disabled={(data.childrenCount || 0) <= 0}
              className="w-8 h-8 rounded-full border border-[#E8E5DE] bg-white text-[#1F2933] flex items-center justify-center disabled:opacity-40 hover:bg-[#FCFBF8]"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-[#1F2933]">{data.childrenCount || 0}</span>
            <button
              type="button"
              onClick={() => updateChildren(1)}
              className="w-8 h-8 rounded-full border border-[#E8E5DE] bg-white text-[#1F2933] flex items-center justify-center hover:bg-[#FCFBF8]"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {data.childrenCount > 0 && (
          <div className="pt-2 border-t border-[#E8E5DE]">
            <label className="text-xs font-semibold text-[#1F2933] block mb-1">
              {t('planner.childrenAges', "Children's ages (optional)")}:
            </label>
            <input
              type="text"
              value={data.childrenAges || ''}
              onChange={(e) => onChange({ childrenAges: e.target.value })}
              placeholder="e.g. 5, 8 years old"
              className="w-full px-3 py-1.5 rounded-xl border border-[#E8E5DE] bg-white text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
            />
          </div>
        )}

        <div className="pt-2 border-t border-[#E8E5DE] flex items-center gap-2">
          <input
            type="checkbox"
            id="elderlyCheckbox"
            checked={!!data.hasElderly}
            onChange={(e) => onChange({ hasElderly: e.target.checked })}
            className="w-4 h-4 rounded text-[#176B87] focus:ring-[#176B87] border-[#E8E5DE]"
          />
          <label htmlFor="elderlyCheckbox" className="text-xs font-medium text-[#1F2933] cursor-pointer">
            {t('planner.hasElderly', 'Traveling with elderly seniors (El Haj will prioritize accessible paths and shaded rest)')}
          </label>
        </div>
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
