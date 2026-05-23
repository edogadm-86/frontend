import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { fetchNearbyPlaces, googleMapsUrl, type OsmPlace } from '../lib/osmService';
import { ExternalLink, Phone, Globe, Star } from 'lucide-react';

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
  onResult?: (places: OsmPlace[]) => void;
  onPartnerClick?: (partner: Partner) => void;
}

const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const OSM_CATEGORY_EMOJI: Record<string, string> = {
  veterinary: '🏥',
  pet_shop: '🛒',
  grooming: '✂️',
  dog_park: '🌿',
  other: '📍',
};

export const ServicesMap: React.FC<ServicesMapProps> = ({
  center,
  partners,
  osmPlaces,
  onResult,
  onPartnerClick,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [activePlace, setActivePlace] = useState<OsmPlace | null>(null);
  const [placesLoaded, setPlacesLoaded] = useState(false);

  const runNearbySearch = useCallback((map: google.maps.Map, lat: number, lon: number) => {
    setPlacesLoaded(false);
    fetchNearbyPlaces(map, lat, lon, (places) => {
      setPlacesLoaded(true);
      onResult?.(places);
    });
  }, [onResult]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    runNearbySearch(map, center[0], center[1]);
  }, [center, runNearbySearch]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo({ lat: center[0], lng: center[1] });
    runNearbySearch(mapRef.current, center[0], center[1]);
  }, [center, runNearbySearch]);

  const toNum = (v: any) => v != null ? parseFloat(String(v)) : null;
  const locatedPartners = partners
    .map(p => ({ ...p, latitude: toNum(p.latitude), longitude: toNum(p.longitude) }))
    .filter(p => p.latitude != null && !isNaN(p.latitude!) && p.longitude != null && !isNaN(p.longitude!));

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10 relative">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: center[0], lng: center[1] }}
        zoom={13}
        options={{
          styles: MAP_STYLES,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
        onLoad={onMapLoad}
        onClick={() => { setActivePartner(null); setActivePlace(null); }}
      >
        {/* eDog partner markers — blue, always on top */}
        {locatedPartners.map(p => (
          <MarkerF
            key={p.id}
            position={{ lat: p.latitude!, lng: p.longitude! }}
            zIndex={100}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#005da7',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
              scale: 10,
            }}
            onClick={() => { setActivePlace(null); setActivePartner(p); }}
          />
        ))}

        {/* Google Places markers — amber, always below eDog partners */}
        {osmPlaces.map(place => (
          <MarkerF
            key={place.id}
            position={{ lat: place.lat, lng: place.lon }}
            zIndex={1}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#f59e0b',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8,
            }}
            onClick={() => { setActivePartner(null); setActivePlace(place); }}
          />
        ))}

        {/* eDog partner info window */}
        {activePartner && activePartner.latitude && activePartner.longitude && (
          <InfoWindowF
            position={{ lat: activePartner.latitude, lng: activePartner.longitude }}
            onCloseClick={() => setActivePartner(null)}
          >
            <div className="min-w-[180px] max-w-[240px] font-sans">
              <span className="text-xs font-bold text-white bg-[#005da7] px-2 py-0.5 rounded-full">eDog Partner</span>
              <p className="font-bold text-gray-900 text-sm leading-tight mt-1.5">{activePartner.name}</p>
              {activePartner.category_name && (
                <p className="text-xs text-[#005da7] mt-0.5">{activePartner.category_name}</p>
              )}
              {activePartner.address && (
                <p className="text-xs text-gray-500 mt-1">{activePartner.address}</p>
              )}
              <div className="flex flex-col gap-1 mt-2">
                {activePartner.phone && (
                  <a href={`tel:${activePartner.phone}`}
                    className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                    <Phone size={10} /> {activePartner.phone}
                  </a>
                )}
                {activePartner.website && (
                  <a href={activePartner.website} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                    <Globe size={10} /> Website
                  </a>
                )}
                <button
                  onClick={() => onPartnerClick?.(activePartner)}
                  className="mt-1 text-xs font-semibold text-white bg-[#005da7] rounded-lg px-3 py-1.5 hover:bg-[#004d8f] transition-colors text-center"
                >
                  View Profile
                </button>
              </div>
            </div>
          </InfoWindowF>
        )}

        {/* Google Place info window */}
        {activePlace && (
          <InfoWindowF
            position={{ lat: activePlace.lat, lng: activePlace.lon }}
            onCloseClick={() => setActivePlace(null)}
          >
            <div className="min-w-[180px] max-w-[240px] font-sans">
              <p className="text-2xl leading-none mb-1">{OSM_CATEGORY_EMOJI[activePlace.category] || '📍'}</p>
              <p className="font-bold text-gray-900 text-sm leading-tight">{activePlace.name}</p>
              <p className="text-xs text-amber-600 mt-0.5 capitalize">{activePlace.category.replace('_', ' ')}</p>
              {activePlace.rating && (
                <p className="text-xs text-gray-600 flex items-center gap-0.5 mt-0.5">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  {activePlace.rating.toFixed(1)}
                </p>
              )}
              {activePlace.address && (
                <p className="text-xs text-gray-500 mt-1">{activePlace.address}</p>
              )}
              <a
                href={googleMapsUrl(activePlace.lat, activePlace.lon, activePlace.name)}
                target="_blank" rel="noopener noreferrer"
                className="mt-2 text-xs text-indigo-600 flex items-center gap-1 hover:underline"
              >
                <ExternalLink size={10} /> Open in Google Maps
              </a>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {!placesLoaded && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1e2023] shadow-lg rounded-full px-4 py-2 text-xs text-gray-500 dark:text-[#8b919d] flex items-center gap-2 border border-gray-100 dark:border-white/10 pointer-events-none">
          <div className="w-3 h-3 border border-gray-300 border-t-[#005da7] rounded-full animate-spin" />
          Loading nearby places…
        </div>
      )}
    </div>
  );
};
