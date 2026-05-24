import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useJsApiLoader } from '@react-google-maps/api';
import { apiClient } from '../lib/api';
import { geocodeCity, googleMapsUrl, type OsmPlace } from '../lib/osmService';
import { LayoutList, Map, Star, ShieldCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ServicesMap } from './ServicesMap';

const GOOGLE_LIBRARIES: ('places')[] = ['places'];

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
  google_place_id: string | null;
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

const PLACE_CATEGORY_LABEL: Record<string, string> = {
  veterinary: 'Veterinary',
  pet_shop: 'Pet Shop',
  grooming: 'Grooming',
  dog_park: 'Dog Park',
  other: 'Other',
};

const PLACE_CATEGORY_EMOJI: Record<string, string> = {
  veterinary: '🏥',
  pet_shop: '🛒',
  grooming: '✂️',
  dog_park: '🌿',
  other: '📍',
};

// ─── Partner detail modal ──────────────────────────────────────────────────

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
  const photos = partner.photos || [];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [placeRating, setPlaceRating] = useState<{ rating: number; count: number } | null>(null);

  // Fetch Google rating when place_id is available
  useEffect(() => {
    if (!partner.google_place_id || !window.google?.maps?.places) return;
    const div = document.createElement('div');
    const service = new google.maps.places.PlacesService(div);
    service.getDetails(
      { placeId: partner.google_place_id, fields: ['rating', 'user_ratings_total'] },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result?.rating) {
          setPlaceRating({ rating: result.rating, count: result.user_ratings_total || 0 });
        }
      }
    );
  }, [partner.google_place_id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i != null && i > 0 ? i - 1 : i));
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i != null && i < photos.length - 1 ? i + 1 : i));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, photos.length]);

  const lightbox = lightboxIndex !== null ? createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
      onClick={() => setLightboxIndex(null)}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
        onClick={() => setLightboxIndex(null)}
      >
        <X size={22} />
      </button>

      {/* Counter */}
      <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm select-none">
        {lightboxIndex + 1} / {photos.length}
      </span>

      {/* Prev */}
      {lightboxIndex > 0 && (
        <button
          className="absolute left-3 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Image */}
      <img
        src={photos[lightboxIndex]}
        alt=""
        className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl select-none"
        onClick={e => e.stopPropagation()}
        draggable={false}
      />

      {/* Next */}
      {lightboxIndex < photos.length - 1 && (
        <button
          className="absolute right-3 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto px-2">
          {photos.map((ph, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
              className={`flex-shrink-0 w-12 h-9 rounded-md overflow-hidden border-2 transition-all ${
                i === lightboxIndex ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={ph} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <>
      {lightbox}
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
          <div
            className={`relative h-56 sm:h-72 bg-gradient-to-br from-[#005da7] to-[#0090e7] flex items-center justify-center overflow-hidden ${photos.length > 0 ? 'cursor-zoom-in' : ''}`}
            onClick={() => photos.length > 0 && setLightboxIndex(0)}
          >
            {photos.length > 0 ? (
              <img src={photos[0]} alt={partner.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white/30 text-[120px]">{partner.category_icon}</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            {photos.length > 0 && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/80 text-xs">
                <span className="material-symbols-outlined text-[14px]">photo_library</span>
                {photos.length}
              </div>
            )}
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
                {placeRating && (
                  <span className="flex items-center gap-1.5">
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={11} className={s <= Math.round(placeRating.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'} />
                      ))}
                    </span>
                    <span className="font-semibold text-white text-xs">{placeRating.rating.toFixed(1)}</span>
                    <span className="text-white/60 text-xs">({placeRating.count.toLocaleString()})</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Photo strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 p-4 bg-white dark:bg-[#1e2023] border-b border-gray-100 dark:border-white/5 overflow-x-auto">
              {photos.slice(1).map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i + 1)}
                  className="flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-white/5 hover:border-[#005da7]/50 transition-colors cursor-zoom-in"
                >
                  <img src={photo} alt={`${partner.name} ${i + 2}`} className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="md:col-span-2 p-6 space-y-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5">
              {partner.description && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider mb-3">{t('aboutSection')}</h3>
                  <p className="text-gray-700 dark:text-[#c1c7d3] leading-relaxed">{partner.description}</p>
                </section>
              )}

              {partner.promotions && partner.promotions.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider mb-3">{t('promotions')}</h3>
                  <div className="space-y-3">
                    {partner.promotions.map(promo => (
                      <div key={promo.id}
                        className="flex gap-4 p-4 rounded-xl bg-[#005da7]/5 dark:bg-[#a4c9ff]/5 border border-[#005da7]/10 dark:border-[#a4c9ff]/10">
                        <div className="w-10 h-10 rounded-full bg-[#005da7] dark:bg-[#a4c9ff] flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-white dark:text-[#00315d] text-[18px]">percent</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#005da7] dark:text-[#a4c9ff]">{promo.title}</p>
                          {promo.discount_text && <p className="text-xs font-bold text-orange-500 mb-0.5">{promo.discount_text}</p>}
                          {promo.description && <p className="text-sm text-gray-500 dark:text-[#8b919d]">{promo.description}</p>}
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
                  <h3 className="text-sm font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider mb-3">{t('openingHours')}</h3>
                  <div className="space-y-2">
                    {days.map(day => {
                      const hours = partner.working_hours[day];
                      if (!hours) return null;
                      return (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-[#8b919d] capitalize">{dayLabels[day]}</span>
                          <span className={hours.toLowerCase() === 'closed' ? 'text-red-500 font-medium' : 'text-gray-800 dark:text-[#e2e2e6] font-medium'}>
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
              <h3 className="text-sm font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider">{t('contactSection')}</h3>
              {partner.address && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[20px] flex-shrink-0 mt-0.5">location_on</span>
                  <p className="text-sm text-gray-600 dark:text-[#c1c7d3]">{partner.address}{partner.city ? `, ${partner.city}` : ''}</p>
                </div>
              )}
              {partner.phone && (
                <a href={`tel:${partner.phone}`} className="flex items-center gap-3 group">
                  <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[20px] flex-shrink-0">call</span>
                  <p className="text-sm text-gray-600 dark:text-[#c1c7d3] group-hover:text-[#005da7] transition-colors">{partner.phone}</p>
                </a>
              )}
              {partner.email && (
                <a href={`mailto:${partner.email}`} className="flex items-center gap-3 group">
                  <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[20px] flex-shrink-0">mail</span>
                  <p className="text-sm text-gray-600 dark:text-[#c1c7d3] group-hover:text-[#005da7] transition-colors truncate">{partner.email}</p>
                </a>
              )}
              {partner.website && (
                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                  <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[20px] flex-shrink-0">language</span>
                  <p className="text-sm text-gray-600 dark:text-[#c1c7d3] group-hover:text-[#005da7] transition-colors truncate">{t('visitWebsite')}</p>
                </a>
              )}
              {hasSocial && (
                <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                  <p className="text-xs text-gray-400 dark:text-[#8b919d] mb-2">{t('socialSection')}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(partner.social_links).map(([platform, url]) => url && (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#c1c7d3] hover:bg-[#005da7]/10 hover:text-[#005da7] capitalize transition-all">
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
                  <a href={googleMapsUrl(partner.latitude, partner.longitude, partner.name)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#c1c7d3] font-semibold text-sm hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">directions</span>
                    {t('getDirections')}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#005da7]/5 dark:bg-[#a4c9ff]/5 border border-[#005da7]/15 dark:border-[#a4c9ff]/15">
                <div className="w-9 h-9 rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={18} className="text-white dark:text-[#00315d]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#005da7] dark:text-[#a4c9ff]">{t('edogPartnerBadge')}</p>
                  <p className="text-xs text-gray-500 dark:text-[#8b919d]">{t('edogPartnerVerified')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Google Places result card ─────────────────────────────────────────────

function PlaceCard({ place }: { place: OsmPlace }) {
  const { t } = useTranslation();
  const emoji = PLACE_CATEGORY_EMOJI[place.category] || '📍';
  const label = PLACE_CATEGORY_LABEL[place.category] || place.category;

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
          {place.rating && (
            <span className="text-xs text-gray-500 flex items-center gap-0.5 flex-shrink-0">
              <Star size={11} className="text-yellow-500 fill-yellow-500" />
              {place.rating.toFixed(1)}
            </span>
          )}
        </div>
        {place.address && (
          <p className="text-xs text-gray-500 dark:text-[#8b919d] mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">location_on</span>
            {place.address}
          </p>
        )}
        <div className="flex gap-3 mt-2 flex-wrap">
          <a href={googleMapsUrl(place.lat, place.lon, place.name)}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">map</span> {t('openInMaps')}
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main view ─────────────────────────────────────────────────────────────

export const ServicesView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_LIBRARIES,
  });

  const [categories, setCategories] = useState<PartnerCategory[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [mapCenter, setMapCenter] = useState<[number, number]>([42.698, 23.322]);
  const [nearbyPlaces, setNearbyPlaces] = useState<OsmPlace[]>([]);
  const [showPartners, setShowPartners] = useState(true);
  const [showNearby, setShowNearby] = useState(true);
  const [nameSearch, setNameSearch] = useState('');

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

  useEffect(() => {
    apiClient.getPartnerCategories().then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchPartners, 300);
    return () => clearTimeout(timer);
  }, [fetchPartners]);

  // Geocode city and update map center when Maps API is ready
  useEffect(() => {
    if (!mapsLoaded || !citySearch.trim()) return;
    const timer = setTimeout(async () => {
      const geo = await geocodeCity(citySearch.trim());
      if (geo) setMapCenter([geo.lat, geo.lon]);
    }, 600);
    return () => clearTimeout(timer);
  }, [citySearch, mapsLoaded]);

  // Browser geolocation on first load
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nameLower = nameSearch.toLowerCase();
  const visiblePartners = nameLower
    ? partners.filter(p => p.name.toLowerCase().includes(nameLower))
    : partners;
  const featured = visiblePartners.filter(p => p.is_featured);
  const all = visiblePartners.filter(p => !p.is_featured);

  const getCategoryName = (cat: PartnerCategory) => lang === 'bg' ? cat.name_bg : cat.name_en;
  const getPartnerCategoryName = (p: Partner) => lang === 'bg' ? p.category_name_bg : p.category_name_en;

  const toNum = (v: any) => v != null ? parseFloat(String(v)) : undefined;
  const mapPartners = partners.map(p => ({
    id: p.id, name: p.name,
    city: p.city ?? undefined, address: p.address ?? undefined,
    phone: p.phone ?? undefined, website: p.website ?? undefined,
    latitude: toNum(p.latitude), longitude: toNum(p.longitude),
    category_slug: p.category_slug, category_name: getPartnerCategoryName(p),
  }));

  return (
    <div className="min-h-full bg-[#fbf9f8] dark:bg-[#111316] animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#fbf9f8]/90 dark:bg-[#111316]/90 backdrop-blur-md border-b border-gray-200/60 dark:border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">{t('servicesNearYou')}</h1>
            <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('servicesSubtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative sm:w-56">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b919d] text-[18px]">search</span>
              <input
                type="text"
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                placeholder={t('searchByCity')}
                className="w-full bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/5 rounded-full py-2 pl-9 pr-4 text-sm text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30"
              />
            </div>

            {/* Map / List toggle */}
            <div className="flex items-center bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/5 rounded-full p-0.5 gap-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'list' ? 'bg-[#005da7] text-white shadow-sm' : 'text-gray-500 dark:text-[#8b919d] hover:text-gray-700 dark:hover:text-[#c1c7d3]'
                }`}
              >
                <LayoutList size={14} />
                <span className="hidden sm:inline">{t('listView')}</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'map' ? 'bg-[#005da7] text-white shadow-sm' : 'text-gray-500 dark:text-[#8b919d] hover:text-gray-700 dark:hover:text-[#c1c7d3]'
                }`}
              >
                <Map size={14} />
                <span className="hidden sm:inline">{t('mapView')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map view */}
      {viewMode === 'map' && (
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Layer filter toggles */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowPartners(v => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                showPartners
                  ? 'bg-[#005da7] border-[#005da7] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1e2023] border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#8b919d]'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-current opacity-80" />
              {t('edogPartnersLayer')}
            </button>
            <button
              onClick={() => setShowNearby(v => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                showNearby
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : 'bg-white dark:bg-[#1e2023] border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#8b919d]'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-current opacity-80" />
              {t('nearbyLayer')}
            </button>
          </div>

          <div style={{ height: '520px' }}>
            {mapsLoaded ? (
              <ServicesMap
                center={mapCenter}
                partners={showPartners ? mapPartners : []}
                osmPlaces={showNearby ? nearbyPlaces : []}
                onResult={setNearbyPlaces}
                onPartnerClick={(p) => {
                  const full = partners.find(x => x.id === p.id);
                  if (full) setSelectedPartner(full);
                }}
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gray-100 dark:bg-[#1e2023] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005da7]" />
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-400 dark:text-[#8b919d]">{t('mapLayerHint')}</p>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-8">
          {/* Name search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b919d] text-[18px]">search</span>
            <input
              type="text"
              value={nameSearch}
              onChange={e => setNameSearch(e.target.value)}
              placeholder={t('searchByServiceName')}
              className="w-full bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/5 rounded-xl py-2.5 pl-9 pr-10 text-sm text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30"
            />
            {nameSearch && (
              <button
                onClick={() => setNameSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-[#c1c7d3]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Category chips */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wider mb-3">{t('exploreByCategory')}</h2>
            {/* Mobile: horizontal scroll | md+: wrapping grid */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar md:flex-wrap md:overflow-visible">
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 w-[4.5rem] sm:w-24 md:w-28 md:p-4 rounded-2xl border transition-all duration-200 ${
                  selectedCategory === ''
                    ? 'bg-[#005da7] dark:bg-[#a4c9ff]/15 border-[#005da7] dark:border-[#a4c9ff]/40 text-white dark:text-[#a4c9ff]'
                    : 'bg-white dark:bg-[#1e2023] border-gray-200 dark:border-white/5 text-gray-600 dark:text-[#c1c7d3] hover:border-[#005da7]/40 dark:hover:border-[#a4c9ff]/40'
                }`}
              >
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${selectedCategory === '' ? 'bg-white/20' : 'bg-gray-100 dark:bg-[#282a2d]'}`}>
                  <span className="material-symbols-outlined text-[18px] md:text-[22px]">apps</span>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight">{t('allCategories')}</span>
              </button>

              {categories.map(cat => {
                const active = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(active ? '' : cat.slug)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 w-[4.5rem] sm:w-24 md:w-28 md:p-4 rounded-2xl border transition-all duration-200 ${
                      active
                        ? 'bg-[#005da7] dark:bg-[#a4c9ff]/15 border-[#005da7] dark:border-[#a4c9ff]/40 text-white dark:text-[#a4c9ff]'
                        : 'bg-white dark:bg-[#1e2023] border-gray-200 dark:border-white/5 text-gray-600 dark:text-[#c1c7d3] hover:border-[#005da7]/40 dark:hover:border-[#a4c9ff]/40 hover:scale-105'
                    }`}
                  >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : CATEGORY_ICON_COLORS[cat.slug] || 'bg-gray-100 dark:bg-[#282a2d]'}`}>
                      <span className="material-symbols-outlined text-[18px] md:text-[22px]">{cat.icon}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight">{getCategoryName(cat)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005da7] dark:border-[#a4c9ff]" />
            </div>
          ) : visiblePartners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1e2023] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-gray-300 dark:text-[#414751] text-[48px]">
                  {nameSearch ? 'search_off' : 'store'}
                </span>
              </div>
              <p className="text-gray-500 dark:text-[#8b919d] font-medium">
                {nameSearch ? `${t('noResultsFor')} "${nameSearch}"` : t('noServicesFound')}
              </p>
              {!nameSearch && (
                <p className="text-sm text-gray-400 dark:text-[#414751] mt-1">{t('partnerWith')}</p>
              )}
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">{t('featuredPartners')}</h2>
                    <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('featuredPartnersSubtitle')}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.map((partner, idx) => (
                      <div key={partner.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
                        <PartnerCard partner={partner} lang={lang} getPartnerCategoryName={getPartnerCategoryName} onClick={() => setSelectedPartner(partner)} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {all.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">
                    {featured.length > 0 ? t('allServices') : t('servicesNearYou')}
                  </h2>
                  <div className="space-y-3">
                    {all.map((partner, idx) => (
                      <div key={partner.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
                        <PartnerListItem partner={partner} lang={lang} getPartnerCategoryName={getPartnerCategoryName} onClick={() => setSelectedPartner(partner)} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Google Places "More in Your Area" */}
          {nearbyPlaces.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">{t('moreInYourArea')}</h2>
                <span className="text-xs text-gray-400 dark:text-[#8b919d] px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10 flex items-center gap-1">
                  {t('viaGoogleMaps')}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#8b919d] -mt-2">
                {t('moreInYourAreaSubtitle')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nearbyPlaces.slice(0, 12).map(place => <PlaceCard key={place.id} place={place} />)}
              </div>
              {nearbyPlaces.length > 12 && (
                <p className="text-xs text-center text-gray-400 dark:text-[#8b919d]">
                  +{nearbyPlaces.length - 12} {t('switchToMapForMore')}
                </p>
              )}
            </section>
          )}

          {/* Partner CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-[#005da7] to-[#0090e7] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{t('partnerCTA')}</h3>
              <p className="text-blue-100 text-sm mt-0.5">{t('partnerCTASubtitle')}</p>
            </div>
            <a href="mailto:partners@edog.dogpass.net"
              className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-white text-[#005da7] font-semibold text-sm hover:bg-blue-50 transition-colors whitespace-nowrap">
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

// ─── Partner cards ─────────────────────────────────────────────────────────

function PartnerCard({ partner, lang, getPartnerCategoryName, onClick }: {
  partner: Partner; lang: string;
  getPartnerCategoryName: (p: Partner) => string; onClick: () => void;
}) {
  const { t } = useTranslation();
  const colorClass = CATEGORY_COLORS[partner.category_slug] || CATEGORY_COLORS.other;
  const iconBg = CATEGORY_ICON_COLORS[partner.category_slug] || CATEGORY_ICON_COLORS.other;

  return (
    <button onClick={onClick}
      className="w-full text-left bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-200/60 dark:border-white/5 overflow-hidden hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-[#005da7]/20 dark:hover:border-[#a4c9ff]/20 transition-all duration-200 group">
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
            {t('featured')}
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
              {t('deal', { count: partner.promotions.length })}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function PartnerListItem({ partner, lang, getPartnerCategoryName, onClick }: {
  partner: Partner; lang: string;
  getPartnerCategoryName: (p: Partner) => string; onClick: () => void;
}) {
  const { t } = useTranslation();
  const colorClass = CATEGORY_COLORS[partner.category_slug] || CATEGORY_COLORS.other;
  const iconBg = CATEGORY_ICON_COLORS[partner.category_slug] || CATEGORY_ICON_COLORS.other;

  return (
    <button onClick={onClick}
      className="w-full text-left flex gap-4 p-4 bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-200/60 dark:border-white/5 hover:shadow-md hover:border-[#005da7]/20 dark:hover:border-[#a4c9ff]/20 transition-all duration-200 group">
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
              {t('deal', { count: partner.promotions.length })}
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
