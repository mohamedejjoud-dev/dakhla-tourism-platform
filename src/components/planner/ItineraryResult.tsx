// src/components/planner/ItineraryResult.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Map as MapIcon, 
  Coins, 
  CheckSquare, 
  Share2, 
  Edit3, 
  RotateCcw
} from 'lucide-react';
import { GeneratedItinerary } from '@/types/tripPlanner';
import { ItineraryDayCard } from './ItineraryDayCard';
import { ItineraryBudgetTracker } from './ItineraryBudgetTracker';
import { ItineraryMap } from './ItineraryMap';
import { ModificationPanel } from './ModificationPanel';
import { PreparationChecklist } from './PreparationChecklist';
import { SaveShareDialog } from './SaveShareDialog';

interface Props {
  itinerary: GeneratedItinerary;
  onEditAnswers: () => void;
  onModify: (type: string, customText?: string) => void;
  onReset: () => void;
  modifying?: boolean;
}

export const ItineraryResult: React.FC<Props> = ({
  itinerary,
  onEditAnswers,
  onModify,
  onReset,
  modifying,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'budget' | 'checklist'>('itinerary');
  const [focusedMapDay, setFocusedMapDay] = useState<number | undefined>(undefined);
  const [shareOpen, setShareOpen] = useState(false);

  const handleDaySelectOnMap = (dayNumber: number) => {
    setFocusedMapDay(dayNumber);
    setActiveTab('map');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Result Hero Header */}
      <div className="bg-white rounded-3xl border border-[#E8E5DE] p-6 sm:p-8 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#35A7A0]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B87]">
                {t('planner.personalizedBy', 'Personalized by El Haj')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2933]">
              {itinerary.title}
            </h1>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E8E5DE] hover:border-[#176B87] bg-white text-xs font-semibold text-[#1F2933] transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-[#176B87]" />
              <span>{t('planner.shareTrip', 'Share')}</span>
            </button>

            <button
              type="button"
              onClick={onEditAnswers}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E8E5DE] hover:border-[#176B87] bg-white text-xs font-semibold text-[#1F2933] transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#176B87]" />
              <span>{t('planner.edit', 'Edit Answers')}</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-full border border-[#E8E5DE] hover:border-rose-400 text-[#667580] hover:text-rose-600 transition-colors"
              title={t('planner.reset', 'Start Over')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#667580] max-w-3xl leading-relaxed">
          {itinerary.intro}
        </p>

        {/* Summary at a glance strip */}
        <div className="pt-3 border-t border-[#E8E5DE] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#667580] block">
              {t('planner.glanceDays', 'Total Days')}
            </span>
            <span className="font-bold text-[#1F2933]">
              {itinerary.summaryAtAGlance.totalDays} Days
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#667580] block">
              {t('planner.glancePace', 'Pace')}
            </span>
            <span className="font-bold text-[#1F2933] capitalize">
              {itinerary.summaryAtAGlance.pace}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#667580] block">
              {t('planner.glanceActivities', 'Activities')}
            </span>
            <span className="font-bold text-[#1F2933]">
              {itinerary.summaryAtAGlance.activitiesCount} planned
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#667580] block">
              {t('planner.glanceDining', 'Dining')}
            </span>
            <span className="font-bold text-[#1F2933]">
              {itinerary.summaryAtAGlance.foodCount} experiences
            </span>
          </div>
        </div>

      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E5DE] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('itinerary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'itinerary'
              ? 'bg-[#176B87] text-white shadow-2xs'
              : 'bg-white text-[#667580] hover:text-[#1F2933] border border-[#E8E5DE]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t('planner.tabItinerary', 'Day-by-Day')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'map'
              ? 'bg-[#176B87] text-white shadow-2xs'
              : 'bg-white text-[#667580] hover:text-[#1F2933] border border-[#E8E5DE]'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>{t('planner.tabMap', 'Route Map')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'budget'
              ? 'bg-[#176B87] text-white shadow-2xs'
              : 'bg-white text-[#667580] hover:text-[#1F2933] border border-[#E8E5DE]'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>{t('planner.tabBudget', 'Budget & Costs')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'checklist'
              ? 'bg-[#176B87] text-white shadow-2xs'
              : 'bg-white text-[#667580] hover:text-[#1F2933] border border-[#E8E5DE]'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>{t('planner.tabChecklist', 'Checklist')}</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          {itinerary.days.map((day) => (
            <ItineraryDayCard
              key={day.dayNumber}
              day={day}
              onSelectOnMap={handleDaySelectOnMap}
            />
          ))}
        </div>
      )}

      {activeTab === 'map' && (
        <div>
          <ItineraryMap days={itinerary.days} selectedDay={focusedMapDay} />
        </div>
      )}

      {activeTab === 'budget' && (
        <div>
          <ItineraryBudgetTracker budget={itinerary.budgetBreakdown} />
        </div>
      )}

      {activeTab === 'checklist' && (
        <div>
          <PreparationChecklist checklist={itinerary.preparationChecklist} />
        </div>
      )}

      {/* Live Conversational & Quick Modification Panel */}
      <ModificationPanel onModify={onModify} loading={modifying} />

      {/* Save & Share Dialog */}
      <SaveShareDialog
        itinerary={itinerary}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

    </div>
  );
};
