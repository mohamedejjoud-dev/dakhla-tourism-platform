// src/components/planner/ItineraryBudgetTracker.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { BudgetBreakdown } from '@/types/tripPlanner';

interface Props {
  budget: BudgetBreakdown;
}

export const ItineraryBudgetTracker: React.FC<Props> = ({ budget }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-3xl border border-[#E8E5DE] p-5 sm:p-6 space-y-5 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8E5DE]">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1F2933]">
            {t('planner.budgetSummaryTitle', 'Budget Tracker & Cost Breakdown')}
          </h3>
          <p className="text-xs text-[#667580]">
            {t('planner.costsSubjectToConfirmation', 'Prices marked with an asterisk (*) are estimated.')}
          </p>
        </div>
        <div className="text-start sm:text-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#667580] block">
            {t('planner.budgetTotalAllocated', 'Total Estimated Budget')}
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#176B87]">
            ~{budget.totalEstimated.toLocaleString()} {budget.currency}
          </span>
        </div>
      </div>

      {/* Over Budget Notice if applicable */}
      {budget.isOverBudget && budget.budgetAlertMessage && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t('planner.budgetAlertTitle', 'Budget Notice')}</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed ps-6">
            {budget.budgetAlertMessage}
          </p>
        </div>
      )}

      {/* Allocation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Accommodation */}
        <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE]">
          <span className="text-[10px] font-bold text-[#667580] uppercase tracking-wider block mb-1">
            {t('planner.budgetAccomShare', 'Accommodation')}
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1F2933]">
            {budget.accommodationEstimated > 0
              ? `${budget.accommodationEstimated.toLocaleString()} ${budget.currency}`
              : 'Paid separately'}
          </p>
        </div>

        {/* Activities */}
        <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE]">
          <span className="text-[10px] font-bold text-[#667580] uppercase tracking-wider block mb-1">
            {t('planner.budgetActivitiesShare', 'Activities')}
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1F2933]">
            {budget.activitiesEstimated.toLocaleString()} {budget.currency}
          </p>
        </div>

        {/* Food */}
        <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE]">
          <span className="text-[10px] font-bold text-[#667580] uppercase tracking-wider block mb-1">
            {t('planner.budgetFoodShare', 'Food & Dining')}
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1F2933]">
            {budget.foodEstimated.toLocaleString()} {budget.currency}
          </p>
        </div>

        {/* Local Transport */}
        <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE]">
          <span className="text-[10px] font-bold text-[#667580] uppercase tracking-wider block mb-1">
            {t('planner.budgetTransportShare', 'Local Transport')}
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1F2933]">
            {budget.transportEstimated.toLocaleString()} {budget.currency}
          </p>
        </div>

      </div>

      <div className="p-3 rounded-xl bg-[#FCFBF8] border border-[#E8E5DE] flex items-center justify-between text-xs text-[#667580]">
        <span>{t('planner.budgetBufferShare', 'Emergency Buffer (15% reserved)')}:</span>
        <span className="font-bold text-[#1F2933]">
          +{budget.bufferEstimated.toLocaleString()} {budget.currency}
        </span>
      </div>

    </div>
  );
};
