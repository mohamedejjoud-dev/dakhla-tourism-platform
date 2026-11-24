// src/components/planner/StepFoodPreferences.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { TripPlannerInput } from '@/types/tripPlanner';

interface Props {
  data: TripPlannerInput;
  onChange: (updates: Partial<TripPlannerInput>) => void;
  onNext: () => void;
}

export const StepFoodPreferences: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation();

  const foodTypes = [
    { id: 'moroccan', label: t('planner.foodMoroccan', 'Moroccan specialties') },
    { id: 'seafood', label: t('planner.foodSeafood', 'Fresh oysters & seafood') },
    { id: 'grilled_fish', label: t('planner.foodGrilledFish', 'Daily grilled catch') },
    { id: 'street_food', label: t('planner.foodStreetFood', 'Authentic street food & local bites (e.g. Mama Saida)') },
    { id: 'breakfast', label: t('planner.foodBreakfast', 'Beldi breakfast (msemen, amlou, honey)') },
    { id: 'international', label: t('planner.foodInternational', 'International cuisine') },
  ];

  const dietaryOptions = [
    { id: 'none', label: t('planner.dietNone', 'No specific requirements') },
    { id: 'vegetarian', label: t('planner.dietVegetarian', 'Vegetarian') },
    { id: 'vegan', label: t('planner.dietVegan', 'Vegan') },
    { id: 'halal', label: t('planner.dietHalal', 'Halal') },
    { id: 'seafood_allergy', label: t('planner.dietSeafoodAllergy', 'Seafood allergy (Strict avoid)') },
    { id: 'gluten', label: t('planner.dietGluten', 'Gluten-sensitive') },
    { id: 'other', label: t('planner.dietOtherAllergy', 'Other food allergy') },
  ];

  const toggleFood = (id: string) => {
    const set = new Set(data.foodPreferences || []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange({ foodPreferences: Array.from(set) });
  };

  const toggleDietary = (id: string) => {
    if (id === 'none') {
      onChange({ dietaryRequirements: ['none'] });
      return;
    }
    const current = (data.dietaryRequirements || []).filter(d => d !== 'none');
    const set = new Set(current);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange({ dietaryRequirements: Array.from(set) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.step5Title', 'What would you like to eat or try?')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.step5Desc', "Discover Dakhla's renowned fresh oysters, Atlantic seafood, and heartwarming Saharan tagines.")}
        </p>
      </div>

      {/* Food Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {foodTypes.map((item) => {
          const isSelected = data.foodPreferences?.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleFood(item.id)}
              className={`p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                isSelected
                  ? 'border-[#176B87] bg-[#F3E8D2]/30 shadow-xs'
                  : 'border-[#E8E5DE] bg-white hover:border-[#176B87]/50 hover:bg-[#FCFBF8]'
              }`}
            >
              <span className="font-semibold text-xs sm:text-sm text-[#1F2933]">{item.label}</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ms-2 ${
                isSelected ? 'border-[#176B87] bg-[#176B87]' : 'border-[#E8E5DE]'
              }`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dietary & Allergies Section */}
      <div className="bg-[#FCFBF8] p-4 rounded-2xl border border-[#E8E5DE] space-y-3">
        <h3 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider">
          {t('planner.dietaryTitle', 'Dietary preferences & allergies')}
        </h3>

        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((diet) => {
            const isSelected = data.dietaryRequirements?.includes(diet.id);
            return (
              <button
                key={diet.id}
                type="button"
                onClick={() => toggleDietary(diet.id)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-[#176B87] bg-[#176B87] text-white shadow-2xs'
                    : 'border-[#E8E5DE] bg-white text-[#1F2933] hover:border-[#176B87]/50'
                }`}
              >
                {diet.label}
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <label className="text-xs font-medium text-[#1F2933] block mb-1">
            {t('planner.specialDietaryNotes', 'Any specific food allergy or dietary notes?')}:
          </label>
          <input
            type="text"
            value={data.specialDietaryNotes || ''}
            onChange={(e) => onChange({ specialDietaryNotes: e.target.value })}
            placeholder="e.g. Strict peanut allergy, lactose intolerance..."
            className="w-full px-3 py-1.5 rounded-xl border border-[#E8E5DE] bg-white text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
          />
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-[#667580] pt-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{t('planner.allergyNotice', 'Always notify the restaurant staff directly regarding severe allergies.')}</span>
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
