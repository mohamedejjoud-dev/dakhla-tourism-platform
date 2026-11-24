// src/components/planner/StepDuration.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Info } from 'lucide-react';
import { TripDurationOption, TripPlannerInput } from '@/types/tripPlanner';

interface Props {
  data: TripPlannerInput;
  onChange: (updates: Partial<TripPlannerInput>) => void;
  onNext: () => void;
}

export const StepDuration: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation();

  const durationCards: Array<{ option: TripDurationOption; days: number; label: string }> = [
    { option: '2', days: 2, label: t('planner.dur2Days', '2 days (Weekend escape)') },
    { option: '3', days: 3, label: t('planner.dur3Days', '3 days (Essential Dakhla)') },
    { option: '4-5', days: 4, label: t('planner.dur45Days', '4–5 days (Full lagoon & desert adventure)') },
    { option: '6+', days: 6, label: t('planner.dur6PlusDays', '6+ days (Immersive explorer)') },
  ];

  const handleSelectOption = (opt: TripDurationOption, defaultDays: number) => {
    onChange({ durationOption: opt, durationDays: defaultDays });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.step1Title', 'How long will you be in Dakhla?')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.step1Desc', 'Choose a duration or specify exact arrival and departure times for personalized day balancing.')}
        </p>
      </div>

      {/* Quick Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {durationCards.map((card) => {
          const isSelected = data.durationOption === card.option;
          return (
            <button
              key={card.option}
              type="button"
              onClick={() => handleSelectOption(card.option, card.days)}
              className={`p-4 rounded-2xl border text-start transition-all ${
                isSelected
                  ? 'border-[#176B87] bg-[#F3E8D2]/30 shadow-xs ring-1 ring-[#176B87]'
                  : 'border-[#E8E5DE] bg-white hover:border-[#176B87]/50 hover:bg-[#FCFBF8]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#1F2933]">{card.label}</span>
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

      {/* Custom Days Input if needed */}
      <div className="bg-[#FCFBF8] p-4 rounded-2xl border border-[#E8E5DE] space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#1F2933] shrink-0">
            {t('planner.glanceDays', 'Total Days')}:
          </label>
          <input
            type="number"
            min={1}
            max={14}
            value={data.durationDays || 3}
            onChange={(e) => onChange({ durationDays: Math.max(1, Math.min(14, parseInt(e.target.value) || 3)) })}
            className="w-20 px-3 py-1.5 rounded-xl border border-[#E8E5DE] bg-white text-sm font-bold text-[#1F2933] text-center focus:outline-none focus:ring-1 focus:ring-[#176B87]"
          />
        </div>

        {/* Arrival & Departure Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E8E5DE]">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2933]">
              <Calendar className="w-3.5 h-3.5 text-[#176B87]" />
              <span>{t('planner.arrivalDate', 'Arrival date')} ({t('planner.optional', 'Optional')})</span>
            </label>
            <input
              type="date"
              value={data.arrivalDate || ''}
              onChange={(e) => onChange({ arrivalDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E5DE] bg-white text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
            />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#667580]" />
              <input
                type="time"
                value={data.arrivalTime || ''}
                onChange={(e) => onChange({ arrivalTime: e.target.value })}
                placeholder={t('planner.arrivalTime', 'Arrival time')}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E8E5DE] bg-white text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2933]">
              <Calendar className="w-3.5 h-3.5 text-[#176B87]" />
              <span>{t('planner.departureDate', 'Departure date')} ({t('planner.optional', 'Optional')})</span>
            </label>
            <input
              type="date"
              value={data.departureDate || ''}
              onChange={(e) => onChange({ departureDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E5DE] bg-white text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
            />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#667580]" />
              <input
                type="time"
                value={data.departureTime || ''}
                onChange={(e) => onChange({ departureTime: e.target.value })}
                placeholder={t('planner.departureTime', 'Departure time')}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E8E5DE] bg-white text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
              />
            </div>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-[#667580]">
          <Info className="w-3.5 h-3.5 shrink-0 text-[#35A7A0]" />
          <span>{t('planner.partialDayNotice', 'Arrival and departure times help avoid scheduling full excursions on partial days.')}</span>
        </p>
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
