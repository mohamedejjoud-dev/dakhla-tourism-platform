// src/components/planner/StepTransportAccom.tsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Hotel } from 'lucide-react';
import { AccommodationStatus, TransportMode, TripPlannerInput } from '@/types/tripPlanner';
import { getCuratedPlaces } from '@/services/curatedPlaces';
import { SupportedLanguage, PlaceWithDetails } from '@/types/database';

function getHotelTitle(p?: PlaceWithDetails): string {
  if (!p) return '';
  return (p as any).translation?.title || p.slug;
}

interface Props {
  data: TripPlannerInput;
  onChange: (updates: Partial<TripPlannerInput>) => void;
  onNext: () => void;
}

export const StepTransportAccom: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.slice(0, 2) || 'en') as SupportedLanguage;

  const verifiedHotels = useMemo(() => {
    const places = getCuratedPlaces(lang);
    return places.filter(p => p.category?.slug === 'hotels' || p.tags?.includes('hotel') || p.tags?.includes('camp'));
  }, [lang]);

  const transportOptions: Array<{ mode: TransportMode; label: string }> = [
    { mode: 'have_car', label: t('planner.transHaveCar', 'Personal vehicle') },
    { mode: 'rental_car', label: t('planner.transRentalCar', 'Rental car') },
    { mode: 'taxi', label: t('planner.transTaxi', 'Grand taxis & city taxis') },
    { mode: 'hotel_transfer', label: t('planner.transHotelTransfer', 'Hotel shuttles & camp transfers') },
    { mode: 'excursions', label: t('planner.transExcursions', 'Organized excursion guides') },
    { mode: 'walking', label: t('planner.transWalking', 'Walking where possible') },
    { mode: 'unsure', label: t('planner.transUnsure', 'I am not sure (El Haj will advise)') },
  ];

  const accomOptions: Array<{ status: AccommodationStatus; label: string }> = [
    { status: 'booked', label: t('planner.accomBooked', 'Yes, already booked') },
    { status: 'need_recommendation', label: t('planner.accomNeedRec', "No, recommend options from Dakhlin's verified stays") },
    { status: 'none', label: t('planner.accomNone', 'Not needed / Camping') },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {t('planner.step8Title', 'Transport & Accommodation in Dakhla')}
        </h2>
        <p className="text-xs sm:text-sm text-[#667580]">
          {t('planner.step8Desc', 'Distances between Dakhla city and the lagoon spots (PK25–PK28) are roughly 25–30 km.')}
        </p>
      </div>

      {/* Transport Selection */}
      <div className="bg-[#FCFBF8] p-4 rounded-2xl border border-[#E8E5DE] space-y-3">
        <h3 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-[#176B87]" />
          <span>{t('planner.transportTitle', 'How will you get around Dakhla?')}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {transportOptions.map((opt) => {
            const isSelected = data.transportMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => onChange({ transportMode: opt.mode })}
                className={`p-3 rounded-xl border text-start flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#176B87] bg-white text-[#176B87] shadow-2xs font-semibold'
                    : 'border-[#E8E5DE] bg-white text-[#1F2933] hover:border-[#176B87]/50'
                }`}
              >
                <span className="text-xs">{opt.label}</span>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ms-2 ${
                  isSelected ? 'border-[#176B87] bg-[#176B87]' : 'border-[#E8E5DE]'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accommodation Selection */}
      <div className="bg-[#FCFBF8] p-4 rounded-2xl border border-[#E8E5DE] space-y-4">
        <h3 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider flex items-center gap-1.5">
          <Hotel className="w-3.5 h-3.5 text-[#176B87]" />
          <span>{t('planner.accomTitle', 'Have you already booked your accommodation?')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {accomOptions.map((opt) => {
            const isSelected = data.accommodationStatus === opt.status;
            return (
              <button
                key={opt.status}
                type="button"
                onClick={() => onChange({ accommodationStatus: opt.status })}
                className={`p-3 rounded-xl border text-start flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#176B87] bg-white text-[#176B87] shadow-2xs font-semibold ring-1 ring-[#176B87]'
                    : 'border-[#E8E5DE] bg-white text-[#1F2933] hover:border-[#176B87]/50'
                }`}
              >
                <span className="text-xs leading-relaxed">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* If already booked: Select from catalog or type custom */}
        {data.accommodationStatus === 'booked' && (
          <div className="space-y-3 pt-2 border-t border-[#E8E5DE] animate-in fade-in duration-150">
            <div>
              <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                {t('planner.hotelSelectPlaceholder', 'Select from Dakhlin verified stays')}:
              </label>
              <select
                value={data.selectedHotelId || ''}
                onChange={(e) => {
                  const place = verifiedHotels.find(h => h.id === e.target.value);
                  onChange({
                    selectedHotelId: e.target.value,
                    selectedHotelName: getHotelTitle(place),
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E5DE] bg-white text-xs font-medium text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
              >
                <option value="">-- {t('planner.hotelSelectPlaceholder', 'Select hotel')} --</option>
                {verifiedHotels.map(h => (
                  <option key={h.id} value={h.id}>
                    {getHotelTitle(h)} ({h.price_level === 3 ? '★★★' : h.price_level === 4 ? '★★★★' : '★★'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                {t('planner.customHotelPlaceholder', 'Or type your hotel name if outside the catalog')}:
              </label>
              <input
                type="text"
                value={data.selectedHotelName || ''}
                onChange={(e) => onChange({ selectedHotelName: e.target.value, selectedHotelId: undefined })}
                placeholder="e.g. Dakhla Camp, Riad..."
                className="w-full px-3 py-1.5 rounded-xl border border-[#E8E5DE] bg-white text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87]"
              />
            </div>
          </div>
        )}
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
