// src/components/planner/StepBudget.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BudgetStyle, TripPlannerInput } from '@/types/tripPlanner';

interface Props {
  data: TripPlannerInput;
  onChange: (updates: Partial<TripPlannerInput>) => void;
  onNext: () => void;
}

export const StepBudget: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation();

  const styles: Array<{ style: BudgetStyle; title: string; desc: string }> = [
    {
      style: 'budget',
      title: t('planner.budgetStyleBudget', 'Budget-friendly'),
      desc: 'Local dining, authentic street food like Mama Saida, shared taxis & free public beaches.',
    },
    {
      style: 'comfortable',
      title: t('planner.budgetStyleComfort', 'Comfortable'),
      desc: 'Quality stays, guided 4x4 excursions to Dune Blanche, fresh oyster tastings & balanced dining.',
    },
    {
      style: 'premium',
      title: t('planner.budgetStylePremium', 'Premium'),
      desc: 'Eco-lodges on the lagoon, private boat tours, watersports courses & fine seafood dining.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.step3Title', 'What is your budget for your time in Dakhla?')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.step3Desc', 'Set your financial comfort zone. El Haj never invents prices and clearly indicates estimated costs.')}
        </p>
      </div>

      {/* Comfort Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {styles.map((item) => {
          const isSelected = data.budgetStyle === item.style;
          return (
            <button
              key={item.style}
              type="button"
              onClick={() => onChange({ budgetStyle: item.style })}
              className={`p-4 rounded-2xl border text-start flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-[#176B87] bg-[#F3E8D2]/30 shadow-xs ring-1 ring-[#176B87]'
                  : 'border-[#E8E5DE] bg-white hover:border-[#176B87]/50 hover:bg-[#FCFBF8]'
              }`}
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1F2933] block mb-1">
                  {item.title}
                </span>
                <p className="text-[11px] text-[#667580] leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
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

      {/* Target Amount & Scope */}
      <div className="bg-[#FCFBF8] p-4 rounded-2xl border border-[#E8E5DE] space-y-4">
        
        {/* Scope (Total vs Per Person) */}
        <div>
          <label className="text-xs font-semibold text-[#1F2933] block mb-2">
            Budget Calculation Scope:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange({ budgetType: 'total' })}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                data.budgetType === 'total'
                  ? 'border-[#176B87] bg-white text-[#176B87] shadow-2xs'
                  : 'border-[#E8E5DE] bg-white text-[#667580]'
              }`}
            >
              {t('planner.budgetTotal', 'Total for the group')}
            </button>
            <button
              type="button"
              onClick={() => onChange({ budgetType: 'per_person' })}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                data.budgetType === 'per_person'
                  ? 'border-[#176B87] bg-white text-[#176B87] shadow-2xs'
                  : 'border-[#E8E5DE] bg-white text-[#667580]'
              }`}
            >
              {t('planner.budgetPerPerson', 'Per traveler')}
            </button>
          </div>
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8E5DE]">
          <div>
            <label className="text-xs font-semibold text-[#1F2933] block mb-1">
              {t('planner.budgetAmountLabel', 'Target budget amount')} ({t('planner.optional', 'Optional')}):
            </label>
            <div className="relative">
              <input
                type="number"
                min={500}
                step={100}
                value={data.budgetAmount || ''}
                onChange={(e) => onChange({ budgetAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g. 6000"
                className="w-full ps-3 pe-16 py-2 rounded-xl border border-[#E8E5DE] bg-white text-xs font-bold text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#667580]">
                {data.budgetCurrency}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1F2933] block mb-1">
              {t('planner.budgetCurrencyLabel', 'Currency')}:
            </label>
            <select
              value={data.budgetCurrency}
              onChange={(e) => onChange({ budgetCurrency: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E5DE] bg-white text-xs font-semibold text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
            >
              <option value="MAD">MAD (Moroccan Dirham)</option>
              <option value="EUR">EUR (€ Euro)</option>
              <option value="USD">USD ($ US Dollar)</option>
            </select>
          </div>
        </div>

        {/* Includes Accommodation */}
        <div className="pt-2 border-t border-[#E8E5DE]">
          <label className="text-xs font-semibold text-[#1F2933] block mb-2">
            {t('planner.includesAccommodation', 'Does this budget include accommodation?')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 'yes', label: t('planner.includeAccomYes', 'Yes') },
              { val: 'no', label: t('planner.includeAccomNo', 'No') },
              { val: 'unsure', label: t('planner.includeAccomUnsure', "I'm not sure") },
            ].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => onChange({ includesAccommodation: opt.val as any })}
                className={`py-1.5 px-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all ${
                  data.includesAccommodation === opt.val
                    ? 'border-[#176B87] bg-white text-[#176B87] shadow-2xs'
                    : 'border-[#E8E5DE] bg-white text-[#667580]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
