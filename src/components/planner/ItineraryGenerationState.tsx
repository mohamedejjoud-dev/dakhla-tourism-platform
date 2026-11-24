// src/components/planner/ItineraryGenerationState.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';

export const ItineraryGenerationState: React.FC = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    t('planner.generatingStep1', 'Selecting authentic Dakhla places that match your interests...'),
    t('planner.generatingStep2', 'Balancing activities with your allocated budget...'),
    t('planner.generatingStep3', 'Grouping nearby places to optimize travel time...'),
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="py-16 px-4 max-w-md mx-auto text-center space-y-6 animate-in fade-in duration-300">
      
      {/* El Haj Avatar & Pulse Ring */}
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-full ring-4 ring-[#176B87]/20 p-1 bg-white shadow-md mx-auto relative z-10 animate-pulse">
          <img
            src="/images/elhaj-avatar.webp"
            alt="El Haj"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span className="absolute bottom-1 end-1 w-4 h-4 rounded-full bg-[#35A7A0] ring-2 ring-white z-20" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#1F2933]">
          {t('planner.generating', 'El Haj is crafting your personalized Dakhla experience...')}
        </h3>
        <p className="text-xs text-[#667580]">
          {t('planner.subtitle', 'Let El Haj build your perfect Dakhla experience.')}
        </p>
      </div>

      {/* Sequential status items */}
      <div className="bg-[#FCFBF8] p-4 rounded-2xl border border-[#E8E5DE] space-y-2.5 text-start">
        {steps.map((st, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                idx > activeStep ? 'opacity-30' : 'opacity-100'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#35A7A0] shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#176B87] border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[#E8E5DE] shrink-0" />
              )}
              <span className={`font-medium ${isCurrent ? 'text-[#176B87] font-semibold' : 'text-[#667580]'}`}>
                {st}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
