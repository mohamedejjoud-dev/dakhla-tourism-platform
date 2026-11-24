// src/components/planner/ModificationPanel.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onModify: (type: string, customText?: string) => void;
  loading?: boolean;
}

export const ModificationPanel: React.FC<Props> = ({ onModify, loading }) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');

  const quickChips = [
    { type: 'make_cheaper', label: t('planner.chipMakeCheaper', 'Make cheaper') },
    { type: 'more_relaxing', label: t('planner.chipMoreRelaxing', 'More relaxing') },
    { type: 'family_friendly', label: t('planner.chipFamilyFriendly', 'Family-friendly') },
    { type: 'more_food', label: t('planner.chipMoreFood', 'More local food') },
    { type: 'reduce_travel', label: t('planner.chipReduceTravel', 'Reduce travel time') },
    { type: 'add_free_time', label: t('planner.chipAddFreeTime', 'Add free time') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onModify('custom', inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E5DE] p-5 sm:p-6 space-y-4 shadow-xs">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#1F2933]">
          {t('planner.modifyTitle', 'Ask El Haj to Modify Your Itinerary')}
        </h3>
        <p className="text-xs text-[#667580]">
          {t('planner.modifySubtitle', 'Fine-tune any day or adjust preferences in real-time.')}
        </p>
      </div>

      {/* Quick Modification Chips */}
      <div className="flex flex-wrap gap-2">
        {quickChips.map((chip) => (
          <button
            key={chip.type}
            type="button"
            onClick={() => onModify(chip.type)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full border border-[#E8E5DE] bg-[#FCFBF8] hover:border-[#176B87] hover:bg-white text-xs font-semibold text-[#1F2933] transition-all active:scale-95 disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Free-form modification prompt */}
      <form onSubmit={handleSubmit} className="relative pt-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('planner.modifyPlaceholder', "Tell El Haj what you'd like to adjust...")}
          disabled={loading}
          className="w-full ps-4 pe-24 py-2.5 rounded-full border border-[#E8E5DE] bg-[#FCFBF8] text-xs text-[#1F2933] placeholder:text-[#667580] focus:outline-none focus:ring-1 focus:ring-[#176B87] focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="absolute end-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-[#176B87] hover:bg-[#13586F] text-white text-xs font-bold transition-all disabled:opacity-40"
        >
          {t('assistant.send', 'Send')}
        </button>
      </form>
    </div>
  );
};
