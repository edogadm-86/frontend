// Google Places / Maps utilities

export interface OsmPlace {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  rating?: number;
  placeId?: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
  displayName: string;
}

const geocodeCache = new Map<string, GeoLocation | null>();

export async function geocodeCity(city: string): Promise<GeoLocation | null> {
  const key = city.toLowerCase().trim();
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  return new Promise((resolve) => {
    if (typeof google === 'undefined' || !google.maps?.Geocoder) {
      geocodeCache.set(key, null);
      resolve(null);
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: city }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const loc = results[0].geometry.location;
        const result: GeoLocation = {
          lat: loc.lat(),
          lon: loc.lng(),
          displayName: results[0].formatted_address,
        };
        geocodeCache.set(key, result);
        resolve(result);
      } else {
        geocodeCache.set(key, null);
        resolve(null);
      }
    });
  });
}

// Searches nearby dog-related places via Google Places API
// Returns up to 20 results per type (60 total max)
const PLACE_TYPES: Array<{ type: string; category: string }> = [
  { type: 'veterinary_care', category: 'veterinary' },
  { type: 'pet_store', category: 'pet_shop' },
];

const placesCache = new Map<string, OsmPlace[]>();

export function fetchNearbyPlaces(
  map: google.maps.Map,
  lat: number,
  lon: number,
  onResult: (places: OsmPlace[]) => void
): void {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (placesCache.has(cacheKey)) {
    onResult(placesCache.get(cacheKey)!);
    return;
  }

  const service = new google.maps.places.PlacesService(map);
  const center = new google.maps.LatLng(lat, lon);
  const collected: OsmPlace[] = [];
  let pending = PLACE_TYPES.length;

  PLACE_TYPES.forEach(({ type, category }) => {
    service.nearbySearch(
      { location: center, radius: 5000, type },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach(place => {
            if (!place.geometry?.location || !place.name) return;
            collected.push({
              id: `gp-${place.place_id}`,
              name: place.name,
              category,
              lat: place.geometry.location.lat(),
              lon: place.geometry.location.lng(),
              address: place.vicinity ?? undefined,
              rating: place.rating ?? undefined,
              placeId: place.place_id,
            });
          });
        }
        pending--;
        if (pending === 0) {
          // dedupe by place_id
          const seen = new Set<string>();
          const unique = collected.filter(p => {
            if (seen.has(p.placeId!)) return false;
            seen.add(p.placeId!);
            return true;
          });
          placesCache.set(cacheKey, unique);
          onResult(unique);
        }
      }
    );
  });
}

export function googleMapsUrl(lat: number, lon: number, name?: string): string {
  const q = name ? `${name}+${lat},${lon}` : `${lat},${lon}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
