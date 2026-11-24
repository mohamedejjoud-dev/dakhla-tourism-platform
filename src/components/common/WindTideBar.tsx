// src/components/common/WindTideBar.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wind, 
  Waves, 
  Thermometer, 
  Navigation, 
  ChevronRight, 
  X, 
  Info,
  Clock,
  Compass
} from 'lucide-react';
import { fetchLiveDakhlaMarine, getBaselineConditions, MarineConditions } from '@/services/weatherService';

interface Props {
  className?: string;
}

export const WindTideBar: React.FC<Props> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [conditions, setConditions] = useState<MarineConditions>(() => getBaselineConditions());
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchLiveDakhlaMarine().then(setConditions);
  }, []);

  const getKiteLabel = () => {
    switch (conditions.kiteSuitability) {
      case 'optimal': return t('marine.kiteOptimal');
      case 'moderate': return t('marine.kiteModerate');
      case 'light': return t('marine.kiteLight');
      case 'strong': return t('marine.kiteStrong');
    }
  };

  const getKiteBg = () => {
    switch (conditions.kiteSuitability) {
      case 'optimal': return 'bg-[#35A7A0]/15 text-[#176B87] border-[#35A7A0]/30';
      case 'strong': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-[#667580] border-slate-200';
    }
  };

  return (
    <>
      <div 
        className={`w-full bg-[#FCFBF8] border-y sm:border sm:rounded-2xl border-[#E8E5DE] transition-all shadow-2xs ${className}`}
        role="region"
        aria-label={t('marine.title')}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-none">
          
          {/* Section 1: Live Wind & Kitesurf Condition */}
          <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
            
            {/* Live Indicator Chip */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-[#E8E5DE] text-[10px] font-semibold text-[#176B87] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35A7A0] animate-pulse shrink-0" />
              <span className="uppercase tracking-wider">{t('marine.dakhlaLagoon')}</span>
            </div>

            {/* Wind Speed & Direction */}
            <div className="inline-flex items-center gap-1.5 font-bold text-[#1F2933] shrink-0">
              <Wind className="w-3.5 h-3.5 text-[#176B87] shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold">{conditions.windSpeedKts} {t('marine.knots')}</span>
              <span className="text-[11px] font-medium text-[#667580] inline-flex items-center gap-0.5">
                <Navigation 
                  className="w-2.5 h-2.5 text-[#35A7A0] inline-block transition-transform shrink-0" 
                  style={{ transform: `rotate(${conditions.windDirectionDeg}deg)` }} 
                />
                <span>{conditions.windDirectionCompass}</span>
              </span>
            </div>

            {/* Kitesurf Status Pill */}
            <div className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 whitespace-nowrap ${getKiteBg()}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#35A7A0] shrink-0" />
              <span>{getKiteLabel()}</span>
            </div>
          </div>

          {/* Section 2: Clean Tides (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 text-[#667580] shrink-0 whitespace-nowrap border-x border-[#E8E5DE] px-4">
            <div className="inline-flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-[#176B87] shrink-0" />
              <span className="text-[#1F2933] font-semibold">{t('marine.highTide')}:</span>
              <span className="font-mono text-xs font-bold text-[#176B87]">{conditions.nextHighTideTime}</span>
            </div>

            <span className="text-[#E8E5DE]">•</span>

            <div className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D8B67A] shrink-0" />
              <span className="text-[#1F2933] font-semibold">{t('marine.lowTide')}:</span>
              <span className="font-mono text-xs font-bold text-[#975A16]">{conditions.nextLowTideTime}</span>
            </div>
          </div>

          {/* Section 3: Temperatures & Detailed Modal Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 whitespace-nowrap ms-auto">
            
            {/* Air Temp */}
            <div className="inline-flex items-center gap-1 text-[#1F2933] font-semibold text-xs shrink-0">
              <Thermometer className="w-3.5 h-3.5 text-[#176B87] shrink-0" />
              <span>{conditions.temperatureC}°C</span>
              <span className="text-[10px] text-[#667580] font-normal hidden xl:inline">
                ({t('marine.waterTemp')}: {conditions.waterTempC}°C)
              </span>
            </div>

            {/* Detail Button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#F3E8D2]/40 text-[#176B87] font-semibold text-[11px] border border-[#E8E5DE] transition-all hover:border-[#35A7A0]/40 shadow-2xs shrink-0 whitespace-nowrap"
            >
              <span>{t('marine.viewDetails')}</span>
              <ChevronRight className="w-3 h-3 rtl:rotate-180 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Marine & Tide Telemetry Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#E8E5DE] p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DE]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#176B87]/10 text-[#176B87] flex items-center justify-center">
                  <Waves className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1F2933]">
                    {t('marine.title')}
                  </h3>
                  <p className="text-[11px] text-[#667580]">
                    Dakhla Lagoon • 23°43′N 15°56′W
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#667580] transition-colors"
                aria-label={t('marine.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              
              {/* Wind Speed */}
              <div className="p-3 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#667580] block">Vent</span>
                <span className="text-lg font-black text-[#176B87] block">{conditions.windSpeedKts} {t('marine.knots')}</span>
                <span className="text-[10px] text-[#667580] block">{t('marine.gusts')}: {conditions.windGustsKts} kts</span>
              </div>

              {/* Direction */}
              <div className="p-3 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#667580] block">Direction</span>
                <span className="text-lg font-black text-[#1F2933] flex items-center justify-center gap-1">
                  <Navigation 
                    className="w-3.5 h-3.5 text-[#35A7A0]" 
                    style={{ transform: `rotate(${conditions.windDirectionDeg}deg)` }} 
                  />
                  <span>{conditions.windDirectionCompass}</span>
                </span>
                <span className="text-[10px] text-[#35A7A0] font-medium block">Alizés constants</span>
              </div>

              {/* Next High Tide */}
              <div className="p-3 rounded-2xl bg-[#35A7A0]/10 border border-[#35A7A0]/20 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#176B87] block">{t('marine.highTide')}</span>
                <span className="text-lg font-mono font-black text-[#176B87] block">{conditions.nextHighTideTime}</span>
                <span className="text-[10px] text-[#176B87] block font-medium">Plein lagon</span>
              </div>

              {/* Next Low Tide */}
              <div className="p-3 rounded-2xl bg-[#F3E8D2]/50 border border-[#D8B67A]/30 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#1F2933] block">{t('marine.lowTide')}</span>
                <span className="text-lg font-mono font-black text-[#1F2933] block">{conditions.nextLowTideTime}</span>
                <span className="text-[10px] text-[#667580] block font-medium">Parcs ouverts</span>
              </div>
            </div>

            {/* Local Dakhla Nautical Tips & Rules */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#176B87]" />
                <span>Conseils Maritimes pour vos Sorties</span>
              </h4>

              {/* Dune Blanche Advice */}
              <div className="p-3 rounded-2xl bg-white border border-[#E8E5DE] flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-[#176B87]/10 text-[#176B87] flex items-center justify-center shrink-0 mt-0.5">
                  <Waves className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-[#1F2933] block">La Dune Blanche (Spectacle de Marée)</span>
                  <p className="text-[11px] text-[#667580] leading-relaxed">
                    {conditions.duneBlancheTip === 'ideal' 
                      ? t('marine.duneIdeal') 
                      : t('marine.duneWalkable')}
                  </p>
                </div>
              </div>

              {/* Oyster Farm Advice */}
              <div className="p-3 rounded-2xl bg-white border border-[#E8E5DE] flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-[#D8B67A]/20 text-[#176B87] flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-[#1F2933] block">Parcs Ostréicoles de Talhamar</span>
                  <p className="text-[11px] text-[#667580] leading-relaxed">
                    {conditions.oysterFarmTip === 'ideal' 
                      ? t('marine.oysterIdeal') 
                      : t('marine.oysterSubmerged')}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#176B87] hover:bg-[#13586F] text-white text-xs font-bold transition-all shadow-xs"
              >
                {t('marine.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
