import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { geocodeCity, fetchOsmPlaces, googleMapsUrl, type OsmPlace, type GeoLocation } from '../lib/osmService';
import { LayoutList, Map } from 'lucide-react';

const ServicesMap = lazy(() =>
  import('./ServicesMap').then(m => ({ default: m.ServicesMap }))
);

interface PartnerCategory {
  id: string;
  slug: string;
  name_en: string;
  name_bg: string;
  icon: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_text: string | null;
  valid_until: string | null;
}

interface Partner {
  id: string;
  category_id: string;
  category_slug: string;
  category_name_en: string;
  category_name_bg: string;
  category_icon: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  working_hours: Record<string, string>;
  social_links: Record<string, string>;
  photos: string[];
  logo_url: string | null;
  is_featured: boolean;
  promotions: Promotion[];
}

const CATEGORY_COLORS: Record<string, string> = {
  veterinary: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  grooming: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  pet_shop: 'bg-green-500/10 text-green-600 dark:text-green-400',
  hotel: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  trainer: 'bg-red-500/10 text-red-600 dark:text-red-400',
  walker: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  photographer: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  transport: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  veterinary: 'bg-blue-500/10',
  grooming: 'bg-purple-500/10',
  pet_shop: 'bg-green-500/10',
  hotel: 'bg-orange-500/10',
  trainer: 'bg-red-500/10',
  walker: 'bg-teal-500/10',
  photographer: 'bg-pink-500/10',
  transport: 'bg-yellow-500/10',
  other: 'bg-gray-500/10',
};

const OSM_CATEGORY_LABEL: Record<string, string> = {
  veterinary: 'Veterinary',
  pet_shop: 'Pet Shop',
  grooming: 'Grooming',
  dog_park: 'Dog Park',
  other: 'Other',
};

function PartnerDetailModal({ partner, onClose, lang }: { partner: Partner; onClose: () => void; lang: string }) {
  const { t } = useTranslation();
  const categoryName = lang === 'bg' ? partner.category_name_bg : partner.category_name_en;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
    thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
  };

  const hasHours = partner.working_hours && Object.keys(partner.working_hours).length > 0;
  const hasSocial = partner.social_links && Object.keys(partner.social_links).length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4 pt-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl bg-[#fbf9f8] dark:bg-[#111316] rounded-2xl shadow-2xl border border-gray-200/60 dark:border-white/5 overflow-hidden mb-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Hero */}
        <div className="relative h-56 sm:h-72 bg-gradient-to-br from-[#005da7] to-[#0090e7] flex items-center justify-center overflow-hidden">
          {partner.photos && partner.photos.length > 0 ? (
            <img src={partner.photos[0]} alt={partner.name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-white/30 text-[120px]">{partner.category_icon}</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 p-6 z-10">
            {partner.is_featured && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[#ffd798] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="text-[#ffd798] text-xs font-bold tracking-wider uppercase">{t('featured')}</span>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{partner.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-white/80 text-sm">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">{categoryName}</span>
              {partner.city && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {partner.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Photo strip */}
        {partner.photos && partner.photos.length > 1 && (
          <div className="flex gap-2 p-4 bg-white dark:bg-[#1e2023] border-b border-gray-100 dark:border-white/5 overflow-x-auto">
            {partner.photos.slice(1).map((photo, i) => (
              <img key={i} src={photo} alt={`${partner.name} ${i + 2}`}
                className="h-16 w-24 object-cover rounded-lg flex-shrink-0 border border-gray-200 dark:border-white/5" />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="md:col-span-2 p-6 space-y-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5">
            {partner.description && (
              <section>
                <h3 className="text-sm font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider mb-3">About</h3>
                <p className="text-gray-700 dark:text-[#c1c7d3] leading-relaxed">{partner.description}</p>
              </section>
            )}

            {partner.promotions && partner.promotions.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider mb-3">
                  {t('promotions')}
                </h3>
                <div className="space-y-3">
                  {partner.promotions.map(promo => (
                    <div key={promo.id}
                      className="flex gap-4 p-4 rounded-xl bg-[#005da7]/5 dark:bg-[#a4c9ff]/5 border border-[#005da7]/10 dark:border-[#a4c9ff]/10">
                      <div className="w-10 h-10 rounded-full bg-[#005da7] dark:bg-[#a4c9ff] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white dark:text-[#00315d] text-[18px]">percent</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#005da7] dark:text-[#a4c9ff]">{promo.title}</p>
                        {promo.discount_text && (
                          <p className="text-xs font-bold text-orange-500 mb-0.5">{promo.discount_text}</p>
                        )}
                        {promo.description && (
                          <p className="text-sm text-gray-500 dark:text-[#8b919d]">{promo.description}</p>
                        )}
                        {promo.valid_until && (
                          <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-1">
                            {t('validUntil')} {new Date(promo.valid_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {hasHours && (
              <section>
                <h3 className="text-sm font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider mb-3">
                  {t('openingHours')}
                </h3>
                <div className="space-y-2">
                  {days.map(day => {
                    const hours = partner.working_hours[day];
                    if (!hours) return null;
                    return (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-[#8b919d] capitalize">{dayLabels[day]}</span>
                        <span className={hours.toLowerCase() === 'closed'
                          ? 'text-red-500 font-medium'
                          : 'text-gray-800 dark:text-[#e2e2e6] font-medium'}>
                          {hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider">Contact</h3>

            {partner.address && (
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[20px] flex-shrink-0 mt-0.5">location_on</span>
                <p className="text-sm text-gray-600 dark:text-[#c1c7d3]">{partner.address}{partner.city ? `, ${partner.city}` : ''}</p>
              </div>
            )}

            {partner.phone && (
              <a href={`tel:${partner.phone}`} className="flex items-center gap-3 group">
                <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[20px] flex-shrink-0">call</span>
                <p className="text-sm text-gray-600 dark:text-[#c1c7d3] group-hover:text-[#005da7] dark:group-hover:text-[#a4c9ff] transition-colors">{partner.phone}</p>
              </a>
            )}

            {partner.email && (
              <a href={`mailto:${partner.email}`} className="flex items-center gap-3 group">
                <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[20px] flex-shrink-0">mail</span>
                <p className="text-sm text-gray-600 dark:text-[#c1c7d3] group-hover:text-[#005da7] dark:group-hover:text-[#a4c9ff] transition-colors truncate">{partner.email}</p>
              </a>
            )}

            {partner.website && (
              <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[20px] flex-shrink-0">language</span>
                <p className="text-sm text-gray-600 dark:text-[#c1c7d3] group-hover:text-[#005da7] dark:group-hover:text-[#a4c9ff] transition-colors truncate">{t('visitWebsite')}</p>
              </a>
            )}

            {hasSocial && (
              <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                <p className="text-xs text-gray-400 dark:text-[#8b919d] mb-2">Social</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(partner.social_links).map(([platform, url]) => url && (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#c1c7d3] hover:bg-[#005da7]/10 dark:hover:bg-[#a4c9ff]/10 hover:text-[#005da7] dark:hover:text-[#a4c9ff] capitalize transition-all">
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 space-y-2">
              {partner.phone && (
                <a href={`tel:${partner.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] font-semibold text-sm hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  {t('callNow')}
                </a>
              )}
              {partner.website && (
                <a href={partner.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-[#005da7] dark:border-[#a4c9ff] text-[#005da7] dark:text-[#a4c9ff] font-semibold text-sm hover:bg-[#005da7]/5 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  {t('visitWebsite')}
                </a>
              )}
              {partner.latitude && partner.longitude && (
                <a
                  href={googleMapsUrl(partner.latitude, partner.longitude, partner.name)}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#c1c7d3] font-semibold text-sm hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">directions</span>
                  Get Directions
                </a>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ffd798]/10 border border-[#ffd798]/20">
              <span className="material-symbols-outlined text-[#ffd798] text-[28px]">shield_spark</span>
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-[#e2e2e6]">eDog Partner</p>
                <p className="text-xs text-gray-500 dark:text-[#8b919d]">Trusted & verified by eDog</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const OSM_PLACE_EMOJI: Record<string, string> = {
  veterinary: '🏥',
  pet_shop: '🛒',
  grooming: '✂️',
  dog_park: '🌿',
  other: '📍',
};

function OsmPlaceCard({ place }: { place: OsmPlace }) {
  const emoji = OSM_PLACE_EMOJI[place.category] || '📍';
  const label = OSM_CATEGORY_LABEL[place.category] || place.category;

  return (
    <div className="flex gap-3 p-4 bg-white dark:bg-[#1e2023] rounded-xl border border-gray-200/60 dark:border-white/5">
      <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-2xl border border-amber-100 dark:border-amber-500/20">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-[#e2e2e6] text-sm truncate">{place.name}</h4>
            <span className="inline-block text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">{label}</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-[#8b919d] flex-shrink-0">via OSM</span>
        </div>
        {place.address && (
          <p className="text-xs text-gray-500 dark:text-[#8b919d] mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">location_on</span>
            {place.address}
          </p>
        )}
        {place.openingHours && (
          <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">⏰ {place.openingHours}</p>
        )}
        <div className="flex gap-2 mt-2 flex-wrap">
          {place.phone && (
            <a href={`tel:${place.phone}`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">call</span> Call
            </a>
          )}
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">language</span> Website
            </a>
          )}
          <a
            href={googleMapsUrl(place.lat, place.lon, place.name)}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">map</span> Maps
          </a>
        </div>
      </div>
    </div>
  );
}

export const ServicesView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [categories, setCategories] = useState<PartnerCategory[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Map / OSM state
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [mapCenter, setMapCenter] = useState<[number, number]>([42.698, 23.322]); // Sofia default
  const [osmPlaces, setOsmPlaces] = useState<OsmPlace[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params: { category?: string; city?: string } = {};
      if (selectedCategory) params.category = selectedCategory;
      if (citySearch.trim()) params.city = citySearch.trim();
      const data = await apiClient.getPartners(params);
      setPartners(data.partners || []);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, citySearch]);

  const fetchOsm = useCallback(async (lat: number, lon: number) => {
    setOsmLoading(true);
    try {
      const places = await fetchOsmPlaces(lat, lon, 5000);
      setOsmPlaces(places);
    } catch {
      setOsmPlaces([]);
    } finally {
      setOsmLoading(false);
    }
  }, []);

  useEffect(() => {
    apiClient.getPartnerCategories().then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchPartners, 300);
    return () => clearTimeout(timer);
  }, [fetchPartners]);

  // Geocode city and fetch OSM when city changes
  useEffect(() => {
    if (!citySearch.trim()) return;
    const timer = setTimeout(async () => {
      const geo = await geocodeCity(citySearch.trim());
      if (geo) {
        setGeoLocation(geo);
        setMapCenter([geo.lat, geo.lon]);
        fetchOsm(geo.lat, geo.lon);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [citySearch, fetchOsm]);

  // Try browser geolocation on first load (no city typed)
  useEffect(() => {
    if (citySearch.trim()) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setMapCenter([lat, lon]);
        fetchOsm(lat, lon);
      },
      () => {} // user denied — use default Sofia coords, no OSM fetch
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const featured = partners.filter(p => p.is_featured);
  const all = partners.filter(p => !p.is_featured);

  const getCategoryName = (cat: PartnerCategory) =>
    lang === 'bg' ? cat.name_bg : cat.name_en;

  const getPartnerCategoryName = (p: Partner) =>
    lang === 'bg' ? p.category_name_bg : p.category_name_en;

  // Adapter: Partner → shape expected by ServicesMap
  const mapPartners = partners.map(p => ({
    id: p.id,
    name: p.name,
    city: p.city ?? undefined,
    address: p.address ?? undefined,
    phone: p.phone ?? undefined,
    website: p.website ?? undefined,
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
    category_slug: p.category_slug,
    category_name: getPartnerCategoryName(p),
  }));

  return (
    <div className="min-h-full bg-[#fbf9f8] dark:bg-[#111316]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#fbf9f8]/90 dark:bg-[#111316]/90 backdrop-blur-md border-b border-gray-200/60 dark:border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">{t('servicesNearYou')}</h1>
            <p className="text-sm text-gray-500 dark:text-[#8b919d]">Discover trusted dog services in your area</p>
          </div>

          <div className="flex items-center gap-2">
            {/* City search */}
            <div className="relative sm:w-56">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b919d] text-[18px]">search</span>
              <input
                type="text"
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                placeholder={t('searchByCity')}
                className="w-full bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/5 rounded-full py-2 pl-9 pr-4 text-sm text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30 dark:focus:ring-[#a4c9ff]/30"
              />
            </div>

            {/* Map / List toggle */}
            <div className="flex items-center bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/5 rounded-full p-0.5 gap-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#005da7] text-white shadow-sm'
                    : 'text-gray-500 dark:text-[#8b919d] hover:text-gray-700 dark:hover:text-[#c1c7d3]'
                }`}
              >
                <LayoutList size={14} />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-[#005da7] text-white shadow-sm'
                    : 'text-gray-500 dark:text-[#8b919d] hover:text-gray-700 dark:hover:text-[#c1c7d3]'
                }`}
              >
                <Map size={14} />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map view */}
      {viewMode === 'map' && (
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div style={{ height: '520px' }}>
            <Suspense fallback={
              <div className="w-full h-full rounded-2xl bg-gray-100 dark:bg-[#1e2023] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005da7]" />
              </div>
            }>
              <ServicesMap
                center={mapCenter}
                partners={mapPartners}
                osmPlaces={osmPlaces}
                onPartnerClick={(p) => {
                  const full = partners.find(x => x.id === p.id);
                  if (full) setSelectedPartner(full);
                }}
              />
            </Suspense>
          </div>

          {/* Map legend */}
          <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-[#8b919d]">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 border border-white shadow-sm" />
              <span>eDog Partners</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-red-400 border border-white shadow-sm" />
              <span>Nearby places (OpenStreetMap)</span>
            </div>
          </div>

          {!citySearch.trim() && osmPlaces.length === 0 && !osmLoading && (
            <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-2">
              Search by city or allow location access to see nearby places on the map.
            </p>
          )}
          {osmLoading && (
            <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-2 flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              Loading nearby places from OpenStreetMap…
            </p>
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-8">
          {/* Category chips */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wider mb-4">Explore by Category</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 w-28 rounded-2xl border transition-all duration-200 ${
                  selectedCategory === ''
                    ? 'bg-[#005da7] dark:bg-[#a4c9ff]/15 border-[#005da7] dark:border-[#a4c9ff]/40 text-white dark:text-[#a4c9ff]'
                    : 'bg-white dark:bg-[#1e2023] border-gray-200 dark:border-white/5 text-gray-600 dark:text-[#c1c7d3] hover:border-[#005da7]/40 dark:hover:border-[#a4c9ff]/40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCategory === '' ? 'bg-white/20' : 'bg-gray-100 dark:bg-[#282a2d]'}`}>
                  <span className="material-symbols-outlined text-[22px]">apps</span>
                </div>
                <span className="text-xs font-semibold text-center">{t('allCategories')}</span>
              </button>

              {categories.map(cat => {
                const active = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(active ? '' : cat.slug)}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 w-28 rounded-2xl border transition-all duration-200 ${
                      active
                        ? 'bg-[#005da7] dark:bg-[#a4c9ff]/15 border-[#005da7] dark:border-[#a4c9ff]/40 text-white dark:text-[#a4c9ff]'
                        : 'bg-white dark:bg-[#1e2023] border-gray-200 dark:border-white/5 text-gray-600 dark:text-[#c1c7d3] hover:border-[#005da7]/40 dark:hover:border-[#a4c9ff]/40 hover:scale-105'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : CATEGORY_ICON_COLORS[cat.slug] || 'bg-gray-100 dark:bg-[#282a2d]'}`}>
                      <span className="material-symbols-outlined text-[22px]">{cat.icon}</span>
                    </div>
                    <span className="text-xs font-semibold text-center leading-tight">{getCategoryName(cat)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005da7] dark:border-[#a4c9ff]" />
            </div>
          ) : partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1e2023] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-gray-300 dark:text-[#414751] text-[48px]">store</span>
              </div>
              <p className="text-gray-500 dark:text-[#8b919d] font-medium">{t('noServicesFound')}</p>
              <p className="text-sm text-gray-400 dark:text-[#414751] mt-1">{t('partnerWith')}</p>
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">Featured Partners</h2>
                      <p className="text-sm text-gray-500 dark:text-[#8b919d]">Top-rated services trusted by our community</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.map(partner => (
                      <PartnerCard key={partner.id} partner={partner} lang={lang} getPartnerCategoryName={getPartnerCategoryName} onClick={() => setSelectedPartner(partner)} />
                    ))}
                  </div>
                </section>
              )}

              {all.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">
                    {featured.length > 0 ? 'All Services' : 'Services Near You'}
                  </h2>
                  <div className="space-y-3">
                    {all.map(partner => (
                      <PartnerListItem key={partner.id} partner={partner} lang={lang} getPartnerCategoryName={getPartnerCategoryName} onClick={() => setSelectedPartner(partner)} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* OSM "More in Your Area" section */}
          {osmPlaces.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">More in Your Area</h2>
                <span className="text-xs text-gray-400 dark:text-[#8b919d] px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10">via OpenStreetMap</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#8b919d] -mt-2">
                Nearby dog-related places discovered from open map data
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {osmPlaces.slice(0, 12).map(place => (
                  <OsmPlaceCard key={place.id} place={place} />
                ))}
              </div>
              {osmPlaces.length > 12 && (
                <p className="text-xs text-center text-gray-400 dark:text-[#8b919d]">
                  +{osmPlaces.length - 12} more — switch to Map view to see all
                </p>
              )}
            </section>
          )}

          {osmLoading && (
            <div className="flex items-center gap-2 py-4 text-sm text-gray-400 dark:text-[#8b919d]">
              <div className="w-4 h-4 border border-gray-300 border-t-transparent rounded-full animate-spin" />
              Loading nearby places…
            </div>
          )}

          {/* Partner CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-[#005da7] to-[#0090e7] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Are you a dog service business?</h3>
              <p className="text-blue-100 text-sm mt-0.5">Join eDog and connect with thousands of dog owners in your area</p>
            </div>
            <a
              href="mailto:partners@edog.dogpass.net"
              className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-white text-[#005da7] font-semibold text-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              {t('partnerWith')}
            </a>
          </div>
        </div>
      )}

      {selectedPartner && (
        <PartnerDetailModal
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
          lang={lang}
        />
      )}
    </div>
  );
};

function PartnerCard({ partner, lang, getPartnerCategoryName, onClick }: {
  partner: Partner;
  lang: string;
  getPartnerCategoryName: (p: Partner) => string;
  onClick: () => void;
}) {
  const colorClass = CATEGORY_COLORS[partner.category_slug] || CATEGORY_COLORS.other;
  const iconBg = CATEGORY_ICON_COLORS[partner.category_slug] || CATEGORY_ICON_COLORS.other;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-200/60 dark:border-white/5 overflow-hidden hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-[#005da7]/20 dark:hover:border-[#a4c9ff]/20 transition-all duration-200 group"
    >
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1e2023] dark:to-[#282a2d] overflow-hidden">
        {partner.photos && partner.photos.length > 0 ? (
          <img src={partner.photos[0]} alt={partner.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${iconBg}`}>
            <span className="material-symbols-outlined text-[64px] opacity-30">{partner.category_icon}</span>
          </div>
        )}
        {partner.is_featured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffd798] text-[#422c00] text-xs font-bold">
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            Featured
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-[#e2e2e6] truncate">{partner.name}</h3>
            <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
              {getPartnerCategoryName(partner)}
            </span>
          </div>
          {partner.logo_url && (
            <img src={partner.logo_url} alt="logo" className="w-8 h-8 rounded-lg object-contain flex-shrink-0 border border-gray-100 dark:border-white/5" />
          )}
        </div>

        {partner.description && (
          <p className="text-xs text-gray-500 dark:text-[#8b919d] line-clamp-2">{partner.description}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          {partner.city ? (
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#8b919d]">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {partner.city}
            </div>
          ) : <div />}
          {partner.promotions && partner.promotions.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#005da7] dark:text-[#a4c9ff] font-medium">
              <span className="material-symbols-outlined text-[14px]">local_offer</span>
              {partner.promotions.length} deal{partner.promotions.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function PartnerListItem({ partner, lang, getPartnerCategoryName, onClick }: {
  partner: Partner;
  lang: string;
  getPartnerCategoryName: (p: Partner) => string;
  onClick: () => void;
}) {
  const colorClass = CATEGORY_COLORS[partner.category_slug] || CATEGORY_COLORS.other;
  const iconBg = CATEGORY_ICON_COLORS[partner.category_slug] || CATEGORY_ICON_COLORS.other;

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-4 p-4 bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-200/60 dark:border-white/5 hover:shadow-md hover:border-[#005da7]/20 dark:hover:border-[#a4c9ff]/20 transition-all duration-200 group"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-[#282a2d]">
        {partner.photos && partner.photos.length > 0 ? (
          <img src={partner.photos[0]} alt={partner.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${iconBg}`}>
            <span className="material-symbols-outlined opacity-40 text-[32px]">{partner.category_icon}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-[#e2e2e6]">{partner.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
              {getPartnerCategoryName(partner)}
            </span>
          </div>
          {partner.description && (
            <p className="text-sm text-gray-500 dark:text-[#8b919d] mt-0.5 line-clamp-2">{partner.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2">
          {partner.city && (
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#8b919d]">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {partner.city}
            </div>
          )}
          {partner.phone && (
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#8b919d]">
              <span className="material-symbols-outlined text-[14px]">call</span>
              {partner.phone}
            </div>
          )}
          {partner.promotions && partner.promotions.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#005da7] dark:text-[#a4c9ff] font-medium ml-auto">
              <span className="material-symbols-outlined text-[14px]">local_offer</span>
              {partner.promotions.length} deal{partner.promotions.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center flex-shrink-0">
        <span className="material-symbols-outlined text-gray-300 dark:text-[#414751] group-hover:text-[#005da7] dark:group-hover:text-[#a4c9ff] transition-colors">chevron_right</span>
      </div>
    </button>
  );
}
