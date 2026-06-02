import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { MapPin, Search, X } from 'lucide-react';
import { toStablePlacePhotoUrl } from '../lib/uploadUrl';

const LIBRARIES: ('places')[] = ['places'];

export interface PickedLocation {
  name: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
  google_place_id: string;
  photos: string[];
  logo_url: string;
}

interface PartnerLocationPickerProps {
  /** Current lat/lng to show on map (may be pre-filled from existing partner) */
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  onPick: (location: PickedLocation) => void;
  /** Called when admin drags the marker to fine-tune coords */
  onCoordsChange: (lat: number, lng: number) => void;
}

const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
];

function extractCity(components: google.maps.GeocoderAddressComponent[]): string {
  const cityTypes = ['locality', 'administrative_area_level_2', 'administrative_area_level_1'];
  for (const type of cityTypes) {
    const comp = components.find(c => c.types.includes(type));
    if (comp) return comp.long_name;
  }
  return '';
}

function extractPhone(place: google.maps.places.PlaceResult): string {
  return place.international_phone_number || place.formatted_phone_number || '';
}

export const PartnerLocationPicker: React.FC<PartnerLocationPickerProps> = ({
  latitude,
  longitude,
  googlePlaceId,
  onPick,
  onCoordsChange,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: apiKey, libraries: LIBRARIES });

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const toNum = (v: number | string | null | undefined) => v != null ? parseFloat(String(v)) : null;
  const initLat = toNum(latitude);
  const initLng = toNum(longitude);

  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    initLat != null && initLng != null ? { lat: initLat, lng: initLng } : null
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    initLat != null && initLng != null ? { lat: initLat, lng: initLng } : { lat: 42.698, lng: 23.322 }
  );
  const [searchValue, setSearchValue] = useState('');

  // Sync if parent updates coords (e.g. editing existing partner)
  useEffect(() => {
    const lat = toNum(latitude);
    const lng = toNum(longitude);
    if (lat != null && lng != null) {
      const pos = { lat, lng };
      setMarkerPos(pos);
      setMapCenter(pos);
    }
  }, [latitude, longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const onPlaceChanged = useCallback(() => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const pos = { lat, lng };

    setMarkerPos(pos);
    setMapCenter(pos);
    mapRef.current?.panTo(pos);
    mapRef.current?.setZoom(16);

    const city = extractCity(place.address_components || []);
    const phone = extractPhone(place);

    const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
    const photoUrls = (place.photos || [])
      .slice(0, 6)
      .map(p => toStablePlacePhotoUrl(p.getUrl({ maxWidth: 1200, maxHeight: 900 }), mapsApiKey));

    onPick({
      name: place.name || '',
      address: place.formatted_address || '',
      city,
      phone,
      website: place.website || '',
      latitude: lat,
      longitude: lng,
      google_place_id: place.place_id || '',
      photos: photoUrls,
      logo_url: photoUrls[0] || '',
    });

    setSearchValue('');
  }, [onPick]);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    onCoordsChange(lat, lng);
  }, [onCoordsChange]);

  const clearMarker = useCallback(() => {
    setMarkerPos(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-64 rounded-xl bg-gray-100 dark:bg-[#282a2d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#005da7]" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Autocomplete search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
          fields={['place_id', 'name', 'formatted_address', 'address_components', 'geometry', 'website', 'international_phone_number', 'formatted_phone_number', 'photos']}
        >
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Search for a business on Google Maps…"
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e2023] text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30"
          />
        </Autocomplete>
        {searchValue && (
          <button
            type="button"
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-[#8b919d] flex items-center gap-1.5">
        <MapPin size={12} />
        Search auto-fills all fields. Drag the marker to fine-tune the location.
      </p>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10" style={{ height: 280 }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapCenter}
          zoom={markerPos ? 16 : 12}
          options={{
            styles: MAP_STYLES,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={onMapLoad}
          onClick={(e) => {
            if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPos({ lat, lng });
            onCoordsChange(lat, lng);
          }}
        >
          {markerPos && (
            <MarkerF
              position={markerPos}
              draggable
              onDragEnd={onMarkerDragEnd}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#005da7',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
                scale: 11,
              }}
            />
          )}
        </GoogleMap>
      </div>

      {markerPos && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8b919d]">
          <span>
            📍 {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
          </span>
          <button
            type="button"
            onClick={clearMarker}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            Clear pin
          </button>
        </div>
      )}
    </div>
  );
};
