// src/components/planner/PlannerProgressBar.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onExit: () => void;
  canPrev: boolean;
}

export const PlannerProgressBar: React.FC<Props> = ({
  currentStep,
  totalSteps,
  onPrev,
  onExit,
  canPrev,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="w-full bg-white border-b border-[#E8E5DE] sticky top-16 z-30 shadow-2xs">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Back Button */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors ${
            canPrev 
              ? 'text-[#176B87] hover:bg-[#F3E8D2]/40 active:scale-95' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          aria-label={t('planner.prev', 'Back')}
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('planner.prev', 'Back')}</span>
        </button>

        {/* Step Indicator & Progress */}
        <div className="flex-1 max-w-xs flex flex-col items-center">
          <span className="text-[11px] font-bold text-[#1F2933] uppercase tracking-wider mb-1">
            {t('planner.stepIndicator', { current: currentStep, total: totalSteps })}
          </span>
          <div className="w-full h-1.5 bg-[#E8E5DE] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#176B87] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Exit Button */}
        <button
          type="button"
          onClick={onExit}
          className="p-1.5 rounded-full text-[#667580] hover:text-[#1F2933] hover:bg-[#FCFBF8] transition-colors"
          title={t('planner.exit', 'Exit')}
          aria-label={t('planner.exit', 'Exit')}
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
