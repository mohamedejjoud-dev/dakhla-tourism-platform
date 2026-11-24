// src/components/planner/ItineraryMap.tsx
import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { DailyItinerary, StructuredItineraryItem } from '@/types/tripPlanner';
import { ExternalLink } from 'lucide-react';

interface Props {
  days: DailyItinerary[];
  selectedDay?: number;
}

function createPlannerPin(dayNumber: number, type: string): L.DivIcon {
  const color = type === 'restaurant' ? '#176B87' : type === 'hotel' ? '#D8B67A' : '#35A7A0';
  return L.divIcon({
    className: 'planner-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.25);
        border: 2px solid white;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: 800;
          font-size: 11px;
          line-height: 1;
        ">J${dayNumber}</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

export const ItineraryMap: React.FC<Props> = ({ days, selectedDay }) => {
  const [activeDayFilter, setActiveDayFilter] = useState<number | 'all'>(selectedDay || 'all');

  const mapItems = useMemo(() => {
    const list: Array<{ item: StructuredItineraryItem; dayNumber: number }> = [];
    days.forEach(day => {
      if (activeDayFilter === 'all' || activeDayFilter === day.dayNumber) {
        day.items.forEach(it => {
          if (it.latitude && it.longitude) {
            list.push({ item: it, dayNumber: day.dayNumber });
          }
        });
      }
    });
    return list;
  }, [days, activeDayFilter]);

  const center: [number, number] = [23.75, -15.85];

  return (
    <div className="bg-white rounded-3xl border border-[#E8E5DE] p-4 sm:p-5 space-y-4 shadow-xs">
      
      {/* Day Filters */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#E8E5DE]">
        <button
          type="button"
          onClick={() => setActiveDayFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            activeDayFilter === 'all'
              ? 'bg-[#176B87] text-white shadow-2xs'
              : 'bg-[#FCFBF8] text-[#667580] hover:bg-white border border-[#E8E5DE]'
          }`}
        >
          All Days ({days.length})
        </button>
        {days.map(d => (
          <button
            key={d.dayNumber}
            type="button"
            onClick={() => setActiveDayFilter(d.dayNumber)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeDayFilter === d.dayNumber
                ? 'bg-[#176B87] text-white shadow-2xs'
                : 'bg-[#FCFBF8] text-[#667580] hover:bg-white border border-[#E8E5DE]'
            }`}
          >
            Day {d.dayNumber}
          </button>
        ))}
      </div>

      {/* Map Viewport */}
      <div className="w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-[#E8E5DE] relative z-0">
        <MapContainer
          center={center}
          zoom={10}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapItems.map(({ item, dayNumber }, idx) => (
            <Marker
              key={`${item.id}-${idx}`}
              position={[item.latitude!, item.longitude!]}
              icon={createPlannerPin(dayNumber, item.type)}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#176B87] block">
                    Day {dayNumber} • {item.timeOfDay}
                  </span>
                  <p className="font-bold text-xs text-[#1F2933]">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#667580]">
                    {item.reason}
                  </p>
                  {item.placeSlug && (
                    <Link
                      to={`/places/${item.placeSlug}`}
                      target="_blank"
                      className="text-[#176B87] text-[11px] font-bold hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-[#667580] px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#35A7A0]" />
          <span>Activities & Attractions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#176B87]" />
          <span>Restaurants & Local Food</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D8B67A]" />
          <span>Stays & Accommodations</span>
        </div>
      </div>

    </div>
  );
};
