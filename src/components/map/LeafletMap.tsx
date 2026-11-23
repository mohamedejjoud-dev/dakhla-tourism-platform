import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { PlaceWithDetails } from '@/types/database';

// Fix default Leaflet marker icon paths for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom category SVG pin maker
function createCategoryPin(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        border: 2px solid white;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: 800;
          font-size: 13px;
          line-height: 1;
        ">${label}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

const PIN_COLORS: Record<string, { color: string; symbol: string }> = {
  hotels: { color: '#D4A373', symbol: 'H' },
  restaurants: { color: '#0F4C81', symbol: 'R' },
  cafes: { color: '#B58455', symbol: 'C' },
  activities: { color: '#008080', symbol: 'K' },
  artisans: { color: '#8C6239', symbol: 'A' },
  projects: { color: '#003B5C', symbol: 'P' },
  attractions: { color: '#02C39A', symbol: '★' },
};

function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface LeafletMapProps {
  places: PlaceWithDetails[];
  selectedPlace?: PlaceWithDetails | null;
  className?: string;
  zoom?: number;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  places,
  selectedPlace,
  className = 'h-[600px] w-full rounded-2xl overflow-hidden shadow-lg border border-sand-200',
  zoom = 11,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // Default center: Dakhla Peninsula Center (Lagoon & City)
  const defaultCenter: [number, number] = [23.713, -15.935];

  const mapCenter: [number, number] =
    selectedPlace && selectedPlace.latitude !== null && selectedPlace.longitude !== null
      ? [Number(selectedPlace.latitude), Number(selectedPlace.longitude)]
      : defaultCenter;

  const validPlaces = places.filter(
    (p) => p.latitude !== null && p.longitude !== null
  );

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <ChangeMapView center={mapCenter} zoom={zoom} />
        
        {/* OpenStreetMap Tile Layer (100% Free & Open Source) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Place Markers */}
        {validPlaces.map((place) => {
          const catSlug = place.category?.slug || 'attractions';
          const pinCfg = PIN_COLORS[catSlug] || { color: '#008080', symbol: '•' };
          const icon = createCategoryPin(pinCfg.color, pinCfg.symbol);

          return (
            <Marker
              key={place.id}
              position={[Number(place.latitude), Number(place.longitude)]}
              icon={icon}
            >
              <Popup className="dakhla-map-popup">
                <div className="w-56 p-1 space-y-2">
                  {place.primaryImageUrl && (
                    <img
                      src={place.primaryImageUrl}
                      alt={place.translation.title}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-lagoon-700">
                      {place.category?.name}
                    </span>
                    <h4 className="font-bold text-sm text-ocean-900 leading-tight">
                      {place.translation.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{place.avg_rating > 0 ? place.avg_rating.toFixed(1) : '—'}</span>
                      <span className="text-slate-400 font-normal">
                        ({place.review_count})
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/places/${place.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-lagoon-600 hover:text-lagoon-700 pt-1"
                  >
                    <span>{t('map.viewPlace')}</span>
                    <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
