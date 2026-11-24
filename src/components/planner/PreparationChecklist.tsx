// src/components/planner/PreparationChecklist.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  checklist: Array<{
    category: string;
    item: string;
    importance: 'essential' | 'recommended' | 'optional';
  }>;
}

export const PreparationChecklist: React.FC<Props> = ({ checklist }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-3xl border border-[#E8E5DE] p-5 sm:p-6 space-y-4 shadow-xs">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#1F2933]">
          {t('planner.checklistTitle', 'Things You May Want to Prepare')}
        </h3>
        <p className="text-xs text-[#667580]">
          {t('planner.checklistSubtitle', 'Essential local advice for your Dakhla journey.')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {checklist.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#176B87] uppercase tracking-wider">
                {item.category}
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                item.importance === 'essential' 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : 'bg-[#F3E8D2]/50 text-[#176B87] border border-[#E8E5DE]'
              }`}>
                {item.importance}
              </span>
            </div>
            <p className="text-xs text-[#1F2933] font-medium leading-relaxed">
              {item.item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
