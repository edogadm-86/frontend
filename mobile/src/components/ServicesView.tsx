import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';

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
  veterinary: 'bg-blue-100 text-blue-700',
  grooming: 'bg-purple-100 text-purple-700',
  pet_shop: 'bg-green-100 text-green-700',
  hotel: 'bg-orange-100 text-orange-700',
  trainer: 'bg-red-100 text-red-700',
  walker: 'bg-teal-100 text-teal-700',
  photographer: 'bg-pink-100 text-pink-700',
  transport: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-600',
};

function DetailSheet({ partner, onClose, lang }: { partner: Partner; onClose: () => void; lang: string }) {
  const { t } = useTranslation();
  const categoryName = lang === 'bg' ? partner.category_name_bg : partner.category_name_en;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
    thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-t-3xl overflow-y-auto max-h-[90vh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Hero */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden">
          {partner.photos && partner.photos.length > 0 ? (
            <img src={partner.photos[0]} alt={partner.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white/30 text-[80px]">{partner.category_icon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-white text-[18px]">close</span>
          </button>
          <div className="absolute bottom-0 left-0 p-4">
            {partner.is_featured && (
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-yellow-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-wider">Featured</span>
              </div>
            )}
            <h2 className="text-xl font-bold text-white">{partner.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">{categoryName}</span>
              {partner.city && (
                <span className="text-xs text-white/80 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  {partner.city}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* CTA buttons */}
          <div className="flex gap-3">
            {partner.phone && (
              <a href={`tel:${partner.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm">
                <span className="material-symbols-outlined text-[18px]">call</span>
                {t('callNow')}
              </a>
            )}
            {partner.website && (
              <a href={partner.website} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-blue-600 text-blue-600 font-semibold text-sm">
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                {t('visitWebsite')}
              </a>
            )}
          </div>

          {/* Description */}
          {partner.description && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{partner.description}</p>
            </div>
          )}

          {/* Promotions */}
          {partner.promotions && partner.promotions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('promotions')}</h3>
              <div className="space-y-2">
                {partner.promotions.map(promo => (
                  <div key={promo.id} className="flex gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-[16px]">percent</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-700">{promo.title}</p>
                      {promo.discount_text && <p className="text-xs font-bold text-orange-500">{promo.discount_text}</p>}
                      {promo.description && <p className="text-xs text-gray-500 mt-0.5">{promo.description}</p>}
                      {promo.valid_until && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t('validUntil')} {new Date(promo.valid_until).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact</h3>
            <div className="space-y-2">
              {partner.address && (
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">location_on</span>
                  <p className="text-sm text-gray-600">{partner.address}{partner.city ? `, ${partner.city}` : ''}</p>
                </div>
              )}
              {partner.phone && (
                <a href={`tel:${partner.phone}`} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">call</span>
                  <p className="text-sm text-gray-600">{partner.phone}</p>
                </a>
              )}
              {partner.email && (
                <a href={`mailto:${partner.email}`} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">mail</span>
                  <p className="text-sm text-gray-600 truncate">{partner.email}</p>
                </a>
              )}
              {partner.latitude && partner.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${partner.latitude},${partner.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">directions</span>
                  <p className="text-sm text-blue-600 font-medium">Get Directions</p>
                </a>
              )}
            </div>
          </div>

          {/* Working hours */}
          {partner.working_hours && Object.keys(partner.working_hours).length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('openingHours')}</h3>
              <div className="space-y-1">
                {days.map(day => {
                  const hours = partner.working_hours[day];
                  if (!hours) return null;
                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">{dayLabels[day]}</span>
                      <span className={hours.toLowerCase() === 'closed' ? 'text-red-500 font-medium' : 'text-gray-700 font-medium'}>
                        {hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* eDog badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
            <span className="material-symbols-outlined text-yellow-500 text-[28px]">shield_spark</span>
            <div>
              <p className="text-xs font-bold text-gray-800">eDog Partner</p>
              <p className="text-xs text-gray-500">Trusted & verified by eDog</p>
            </div>
          </div>

          {/* Bottom safe area padding */}
          <div className="h-6" />
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

  const getCategoryName = (cat: PartnerCategory) => lang === 'bg' ? cat.name_bg : cat.name_en;
  const getPartnerCategoryName = (p: Partner) => lang === 'bg' ? p.category_name_bg : p.category_name_en;

  const featured = partners.filter(p => p.is_featured);
  const rest = partners.filter(p => !p.is_featured);

  return (
    <div className="min-h-full bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-4 pb-3 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900 mb-2">{t('servicesNearYou')}</h1>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input
            type="text"
            value={citySearch}
            onChange={e => setCitySearch(e.target.value)}
            placeholder={t('searchByCity')}
            className="w-full bg-gray-100 rounded-full py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 border-none"
          />
        </div>
      </div>

      {/* Category scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            selectedCategory === ''
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">apps</span>
          {t('allCategories')}
        </button>
        {categories.map(cat => {
          const active = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(active ? '' : cat.slug)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
              {getCategoryName(cat)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-gray-300 text-[40px]">store</span>
          </div>
          <p className="text-gray-500 font-medium">{t('noServicesFound')}</p>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {/* Featured */}
          {featured.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-700 mb-3">Featured Partners</h2>
              <div className="space-y-3">
                {featured.map(partner => (
                  <FeaturedCard
                    key={partner.id}
                    partner={partner}
                    categoryName={getPartnerCategoryName(partner)}
                    onTap={() => setSelectedPartner(partner)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All services */}
          {rest.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-700 mb-3">
                {featured.length > 0 ? 'All Services' : t('servicesNearYou')}
              </h2>
              <div className="space-y-2">
                {rest.map(partner => (
                  <ServiceRow
                    key={partner.id}
                    partner={partner}
                    categoryName={getPartnerCategoryName(partner)}
                    onTap={() => setSelectedPartner(partner)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Partner CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5">
            <h3 className="text-base font-bold text-white">Are you a dog business?</h3>
            <p className="text-blue-100 text-xs mt-0.5 mb-3">Join eDog and reach thousands of dog owners</p>
            <a
              href="mailto:partners@edog.dogpass.net"
              className="inline-block px-4 py-2 rounded-xl bg-white text-blue-700 font-semibold text-xs"
            >
              {t('partnerWith')}
            </a>
          </div>
        </div>
      )}

      {selectedPartner && (
        <DetailSheet partner={selectedPartner} onClose={() => setSelectedPartner(null)} lang={lang} />
      )}
    </div>
  );
};

function FeaturedCard({ partner, categoryName, onTap }: { partner: Partner; categoryName: string; onTap: () => void }) {
  const colorClass = CATEGORY_COLORS[partner.category_slug] || CATEGORY_COLORS.other;
  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"
    >
      <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {partner.photos && partner.photos.length > 0 ? (
          <img src={partner.photos[0]} alt={partner.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-300 text-[60px]">{partner.category_icon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {partner.is_featured && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-bold">
            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            Featured
          </div>
        )}
      </div>
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{partner.name}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${colorClass}`}>{categoryName}</span>
          {partner.city && (
            <p className="flex items-center gap-0.5 text-xs text-gray-400 mt-1">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {partner.city}
            </p>
          )}
        </div>
        {partner.promotions && partner.promotions.length > 0 && (
          <div className="flex items-center gap-0.5 text-xs text-blue-600 font-medium flex-shrink-0">
            <span className="material-symbols-outlined text-[14px]">local_offer</span>
            {partner.promotions.length}
          </div>
        )}
      </div>
    </button>
  );
}

function ServiceRow({ partner, categoryName, onTap }: { partner: Partner; categoryName: string; onTap: () => void }) {
  const colorClass = CATEGORY_COLORS[partner.category_slug] || CATEGORY_COLORS.other;
  return (
    <button
      onClick={onTap}
      className="w-full text-left flex gap-3 p-3 bg-white rounded-2xl border border-gray-100 active:scale-[0.99] transition-transform shadow-sm"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
        {partner.photos && partner.photos.length > 0 ? (
          <img src={partner.photos[0]} alt={partner.name} className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-gray-300 text-[28px]">{partner.category_icon}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{partner.name}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${colorClass}`}>{categoryName}</span>
        {partner.city && (
          <p className="flex items-center gap-0.5 text-xs text-gray-400 mt-0.5">
            <span className="material-symbols-outlined text-[11px]">location_on</span>
            {partner.city}
          </p>
        )}
        {partner.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{partner.description}</p>
        )}
      </div>
      <div className="flex items-center">
        <span className="material-symbols-outlined text-gray-300 text-[20px]">chevron_right</span>
      </div>
    </button>
  );
}
