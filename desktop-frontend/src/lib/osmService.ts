const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'eDogApp/1.0 (contact@edog.app)';

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
}

export interface GeoLocation {
  lat: number;
  lon: number;
  displayName: string;
}

const geocodeCache = new Map<string, GeoLocation | null>();
const overpassCache = new Map<string, OsmPlace[]>();

export async function geocodeCity(city: string): Promise<GeoLocation | null> {
  const key = city.toLowerCase().trim();
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  try {
    const params = new URLSearchParams({ q: city, format: 'json', limit: '1' });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
    });
    const data = await res.json();
    if (!data?.length) {
      geocodeCache.set(key, null);
      return null;
    }
    const result: GeoLocation = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
    geocodeCache.set(key, result);
    return result;
  } catch {
    geocodeCache.set(key, null);
    return null;
  }
}

const OSM_AMENITY_TO_CATEGORY: Record<string, string> = {
  veterinary: 'veterinary',
  animal_shelter: 'veterinary',
  pet_grooming: 'grooming',
  pet_shop: 'pet_shop',
};

const OSM_SHOP_TO_CATEGORY: Record<string, string> = {
  pet: 'pet_shop',
  pet_grooming: 'grooming',
  grooming: 'grooming',
};

function buildOverpassQuery(lat: number, lon: number, radiusM = 5000): string {
  return `
[out:json][timeout:20];
(
  node["amenity"="veterinary"](around:${radiusM},${lat},${lon});
  node["amenity"="animal_shelter"](around:${radiusM},${lat},${lon});
  node["shop"="pet"](around:${radiusM},${lat},${lon});
  node["shop"="grooming"](around:${radiusM},${lat},${lon});
  node["shop"="pet_grooming"](around:${radiusM},${lat},${lon});
  node["leisure"="dog_park"](around:${radiusM},${lat},${lon});
);
out body;`;
}

function parseTags(tags: Record<string, string>, nodeId: number): OsmPlace {
  const amenity = tags['amenity'] || '';
  const shop = tags['shop'] || '';

  let category =
    OSM_AMENITY_TO_CATEGORY[amenity] ||
    OSM_SHOP_TO_CATEGORY[shop] ||
    (tags['leisure'] === 'dog_park' ? 'dog_park' : 'other');

  const housenumber = tags['addr:housenumber'] || '';
  const street = tags['addr:street'] || '';
  const city = tags['addr:city'] || '';
  const addressParts = [street, housenumber, city].filter(Boolean);

  return {
    id: `osm-${nodeId}`,
    name: tags['name'] || tags['brand'] || 'Unnamed',
    category,
    lat: 0,
    lon: 0,
    address: addressParts.length ? addressParts.join(' ') : undefined,
    phone: tags['phone'] || tags['contact:phone'] || undefined,
    website: tags['website'] || tags['contact:website'] || undefined,
    openingHours: tags['opening_hours'] || undefined,
  };
}

export async function fetchOsmPlaces(lat: number, lon: number, radiusM = 5000): Promise<OsmPlace[]> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)},${radiusM}`;
  if (overpassCache.has(cacheKey)) return overpassCache.get(cacheKey)!;

  try {
    const query = buildOverpassQuery(lat, lon, radiusM);
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    const data = await res.json();

    const places: OsmPlace[] = (data.elements || [])
      .filter((el: any) => el.tags?.name || el.tags?.brand)
      .map((el: any) => {
        const place = parseTags(el.tags || {}, el.id);
        place.lat = el.lat;
        place.lon = el.lon;
        return place;
      });

    overpassCache.set(cacheKey, places);
    return places;
  } catch {
    overpassCache.set(cacheKey, []);
    return [];
  }
}

export function googleMapsUrl(lat: number, lon: number, name?: string): string {
  const q = name ? `${name}+${lat},${lon}` : `${lat},${lon}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
