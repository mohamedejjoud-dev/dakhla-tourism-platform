// src/components/planner/StepReview.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Coins, Compass, Car, Edit3 } from 'lucide-react';
import { TripPlannerInput } from '@/types/tripPlanner';

interface Props {
  data: TripPlannerInput;
  onEditStep: (stepNumber: number) => void;
  onGenerate: () => void;
  loading: boolean;
}

export const StepReview: React.FC<Props> = ({ data, onEditStep, onGenerate, loading }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.reviewTitle', 'Your Dakhla Trip Summary')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.reviewSubtitle', 'Review your choices before El Haj generates your personalized itinerary.')}
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Duration */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE] flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#667580] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#176B87]" />
              <span>{t('planner.reviewDuration', 'Trip Duration')}</span>
            </span>
            <p className="font-bold text-sm text-[#1F2933]">
              {data.durationDays} {t('planner.glanceDays', 'days')}
              {data.arrivalDate && ` (${data.arrivalDate}${data.departureDate ? ` → ${data.departureDate}` : ''})`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="p-1 text-[#176B87] hover:bg-white rounded-lg transition-colors"
            title={t('planner.btnEditAnswers', 'Edit')}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Travelers */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE] flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#667580] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#176B87]" />
              <span>{t('planner.reviewTravelers', 'Travelers')}</span>
            </span>
            <p className="font-bold text-sm text-[#1F2933] capitalize">
              {data.travelerType} ({data.adultsCount} adults{data.childrenCount > 0 ? `, ${data.childrenCount} children` : ''})
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="p-1 text-[#176B87] hover:bg-white rounded-lg transition-colors"
            title={t('planner.btnEditAnswers', 'Edit')}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Budget */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE] flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#667580] uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#176B87]" />
              <span>{t('planner.reviewBudget', 'Budget Comfort')}</span>
            </span>
            <p className="font-bold text-sm text-[#1F2933] capitalize">
              {data.budgetAmount ? `${data.budgetAmount.toLocaleString()} ${data.budgetCurrency}` : data.budgetStyle}
              <span className="text-xs font-normal text-[#667580] ms-1">
                ({data.includesAccommodation === 'yes' ? 'incl. stay' : 'excl. stay'})
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="p-1 text-[#176B87] hover:bg-white rounded-lg transition-colors"
            title={t('planner.btnEditAnswers', 'Edit')}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pace */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE] flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#667580] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#176B87]" />
              <span>{t('planner.reviewPace', 'Travel Pace')}</span>
            </span>
            <p className="font-bold text-sm text-[#1F2933] capitalize">
              {data.pace}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(7)}
            className="p-1 text-[#176B87] hover:bg-white rounded-lg transition-colors"
            title={t('planner.btnEditAnswers', 'Edit')}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Transport & Accommodation */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE] flex justify-between items-start sm:col-span-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#667580] uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-[#176B87]" />
              <span>{t('planner.reviewTransport', 'Transport & Stay')}</span>
            </span>
            <p className="font-semibold text-xs text-[#1F2933]">
              Transport: <span className="font-normal text-[#667580]">{data.transportMode}</span> • 
              Hébergement: <span className="font-normal text-[#667580]">
                {data.selectedHotelName || data.accommodationStatus}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(8)}
            className="p-1 text-[#176B87] hover:bg-white rounded-lg transition-colors"
            title={t('planner.btnEditAnswers', 'Edit')}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8E5DE]">
        <button
          type="button"
          onClick={() => onEditStep(1)}
          className="text-xs font-semibold text-[#667580] hover:text-[#1F2933] py-2 px-4 rounded-full border border-[#E8E5DE] hover:bg-white transition-colors"
        >
          {t('planner.btnEditAnswers', 'Edit Answers')}
        </button>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#176B87] hover:bg-[#13586F] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span>{t('planner.btnConfirmGenerate', 'Generate My Trip')}</span>
        </button>
      </div>
    </div>
  );
};
