import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OsmPlace, googleMapsUrl } from '../lib/osmService';
import { ExternalLink, MapPin, Phone, Globe } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  category_slug?: string;
  category_name?: string;
}

interface ServicesMapProps {
  center: [number, number];
  partners: Partner[];
  osmPlaces: OsmPlace[];
  onPartnerClick?: (partner: Partner) => void;
}

function makePartnerIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:linear-gradient(135deg,#3b82f6,#6366f1);
      border:3px solid white;
      box-shadow:0 2px 8px rgba(59,130,246,0.5);
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
    ">🐾</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

const OSM_CATEGORY_EMOJI: Record<string, string> = {
  veterinary: '🏥',
  pet_shop: '🛒',
  grooming: '✂️',
  dog_park: '🌿',
  other: '📍',
};

function makeOsmIcon(category: string) {
  const emoji = OSM_CATEGORY_EMOJI[category] || '📍';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:linear-gradient(135deg,#f59e0b,#ef4444);
      border:3px solid white;
      box-shadow:0 2px 8px rgba(245,158,11,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export const ServicesMap: React.FC<ServicesMapProps> = ({
  center,
  partners,
  osmPlaces,
  onPartnerClick,
}) => {
  const partnerIcon = makePartnerIcon();

  const locatedPartners = partners.filter(
    (p) => p.latitude != null && p.longitude != null
  );

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />

        {/* eDog partner markers */}
        {locatedPartners.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude!, p.longitude!]}
            icon={partnerIcon}
            eventHandlers={{ click: () => onPartnerClick?.(p) }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                {p.category_name && (
                  <p className="text-xs text-blue-600 mt-0.5">{p.category_name}</p>
                )}
                {p.address && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin size={10} /> {p.address}
                  </p>
                )}
                {p.phone && (
                  <a
                    href={`tel:${p.phone}`}
                    className="text-xs text-blue-500 mt-1 flex items-center gap-1 hover:underline"
                  >
                    <Phone size={10} /> {p.phone}
                  </a>
                )}
                <a
                  href={googleMapsUrl(p.latitude!, p.longitude!, p.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 mt-1.5 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink size={10} /> Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* OSM place markers */}
        {osmPlaces.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lon]}
            icon={makeOsmIcon(place.category)}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-bold text-gray-900 text-sm">{place.name}</p>
                <p className="text-xs text-orange-500 mt-0.5 capitalize">
                  {OSM_CATEGORY_EMOJI[place.category]} {place.category.replace('_', ' ')}
                </p>
                {place.address && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin size={10} /> {place.address}
                  </p>
                )}
                {place.phone && (
                  <a
                    href={`tel:${place.phone}`}
                    className="text-xs text-blue-500 mt-1 flex items-center gap-1 hover:underline"
                  >
                    <Phone size={10} /> {place.phone}
                  </a>
                )}
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 mt-1 flex items-center gap-1 hover:underline"
                  >
                    <Globe size={10} /> Website
                  </a>
                )}
                {place.openingHours && (
                  <p className="text-xs text-gray-400 mt-1">⏰ {place.openingHours}</p>
                )}
                <a
                  href={googleMapsUrl(place.lat, place.lon, place.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 mt-1.5 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink size={10} /> Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
