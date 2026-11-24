// src/components/planner/ItineraryDayCard.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { DailyItinerary } from '@/types/tripPlanner';

interface Props {
  day: DailyItinerary;
  onSelectOnMap?: (dayNumber: number) => void;
}

export const ItineraryDayCard: React.FC<Props> = ({ day, onSelectOnMap }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-3xl border border-[#E8E5DE] shadow-xs overflow-hidden">
      
      {/* Day Header Banner */}
      <div className="p-4 sm:p-5 bg-[#FCFBF8] border-b border-[#E8E5DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#176B87] text-white text-[10px] font-bold uppercase tracking-wider">
              {t('planner.dayBadge', { day: day.dayNumber })}
            </span>
            <span className="text-xs font-semibold text-[#667580]">
              ~{day.estimatedDailyCost.min} – {day.estimatedDailyCost.max} {day.estimatedDailyCost.currency}
            </span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-[#1F2933]">
            {day.title}
          </h3>
          <p className="text-xs text-[#667580] mt-0.5">
            {day.theme}
          </p>
        </div>

        {onSelectOnMap && (
          <button
            type="button"
            onClick={() => onSelectOnMap(day.dayNumber)}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E5DE] bg-white hover:border-[#176B87] text-[#176B87] text-xs font-medium transition-colors shrink-0"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t('planner.viewOnMap', { day: day.dayNumber })}</span>
          </button>
        )}
      </div>

      {/* Itinerary Schedule Items */}
      <div className="p-4 sm:p-6 space-y-5">
        {day.items.map((item, idx) => (
          <div key={item.id || idx} className="relative ps-6 border-s-2 border-[#176B87]/20 pb-1 last:pb-0">
            {/* Timeline node */}
            <div className="absolute -start-[7px] top-1 w-3 h-3 rounded-full bg-[#176B87] border-2 border-white shadow-2xs" />

            <div className="space-y-1.5">
              
              {/* Timing & Time of day */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#35A7A0]">
                  {item.timeOfDay}
                </span>
                {item.suggestedTime && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#667580]">
                    <Clock className="w-3 h-3" />
                    <span>{item.suggestedTime}</span>
                  </span>
                )}
                {item.estimatedCost && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FCFBF8] border border-[#E8E5DE] text-[#1F2933]">
                    {item.estimatedCost.value !== null && item.estimatedCost.value > 0
                      ? `${item.estimatedCost.value} ${item.estimatedCost.currency}`
                      : 'Free / Included'}
                    {item.estimatedCost.status === 'estimated' && ' *'}
                  </span>
                )}
                {item.bookingRequired && (
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {t('planner.bookingRequired', 'Booking required')}
                  </span>
                )}
              </div>

              {/* Title & Place link */}
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#1F2933]">
                  {item.title}
                </h4>
                {item.placeSlug && (
                  <Link
                    to={`/places/${item.placeSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#176B87] hover:underline flex items-center text-[10px] font-semibold"
                    title="View place on Dakhlin"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Why El Haj chose it */}
              <p className="text-xs text-[#667580] leading-relaxed">
                <span className="font-semibold text-[#176B87]">{t('planner.whyElHajChoseThis', 'Why El Haj chose it')}: </span>
                {item.reason}
              </p>

              {item.notes && (
                <p className="text-[11px] text-[#667580] italic">
                  💡 {item.notes}
                </p>
              )}

            </div>
          </div>
        ))}

        {/* Backup Weather Option */}
        {day.backupOption && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#E8E5DE] space-y-1">
            <h5 className="font-bold text-xs text-[#1F2933] flex items-center gap-1.5">
              <span>🌦️</span>
              <span>{day.backupOption.title}</span>
            </h5>
            <p className="text-xs text-[#667580]">
              {day.backupOption.description}
            </p>
          </div>
        )}

        {/* Transport & Notes */}
        {day.transportNotes && (
          <div className="pt-2 border-t border-[#E8E5DE] flex items-center gap-2 text-xs text-[#667580]">
            <MapPin className="w-3.5 h-3.5 text-[#35A7A0] shrink-0" />
            <span>{day.transportNotes}</span>
          </div>
        )}

      </div>
    </div>
  );
};
