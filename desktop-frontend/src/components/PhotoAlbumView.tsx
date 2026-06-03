import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Plus, Trash2, X, ChevronLeft, ChevronRight, Upload, Share2 } from 'lucide-react';
import { apiClient } from '../lib/api';
import { API_BASE_URL } from '../config';
import { Dog, DogPhoto, PhotoMilestone } from '../types';
import { cn } from '../lib/utils';

interface Props {
  currentDog: Dog | null;
  onNavigate?: (view: string) => void;
}

const MILESTONE_IDS: PhotoMilestone[] = [
  'first_day', 'birthday', 'first_walk', 'first_bath',
  'first_vet', 'first_training', 'holiday', 'achievement', 'other',
];

const MILESTONE_COLORS: Record<PhotoMilestone, string> = {
  first_day:      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  birthday:       'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  first_walk:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  first_bath:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  first_vet:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  first_training: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  holiday:        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  achievement:    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  other:          'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300',
};

// Resolve a photo URL against the backend origin so it works even when
// the frontend dev server (e.g. :5173) is on a different port than the
// backend (:3001). Absolute URLs are returned unchanged.
function resolvePhotoUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  try {
    const backendOrigin = new URL(API_BASE_URL).origin;
    return `${backendOrigin}${url}`;
  } catch {
    return url;
  }
}

function groupByMonth(photos: DogPhoto[], locale: string): { label: string; photos: DogPhoto[] }[] {
  const groups: Record<string, DogPhoto[]> = {};
  for (const p of photos) {
    const d = new Date(p.taken_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, photos]) => {
      const [year, month] = key.split('-');
      const label = new Date(Number(year), Number(month) - 1, 1)
        .toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      return { label, photos };
    });
}

// ─── Add Photo Modal ──────────────────────────────────────────────────────────
function AddPhotoModal({ dogId, onAdded, onClose }: {
  dogId: string;
  onAdded: (photo: DogPhoto) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [milestone, setMilestone] = useState<PhotoMilestone | ''>('');
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 10));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const milestoneLabels: Record<PhotoMilestone, string> = Object.fromEntries(
    MILESTONE_IDS.map(id => [id, t(`milestone_${id}`)])
  ) as Record<PhotoMilestone, string>;

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError(t('error')); return; }
    setUploading(true);
    setError('');
    try {
      const { fileUrl } = await apiClient.uploadImage(file);
      const res = await apiClient.createDogPhoto(dogId, {
        photo_url: fileUrl,
        caption: caption || undefined,
        milestone_tag: milestone || undefined,
        taken_at: takenAt,
      });
      onAdded(res.photo);
      onClose();
    } catch (err: any) {
      setError(err.message ?? t('error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1e2023] rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold text-gray-900 dark:text-[#e2e2e6]">{t('addPhoto')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#282a2d] text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

          <div
            onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'relative rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden',
              preview ? 'border-transparent' : 'border-gray-200 dark:border-white/10 hover:border-[#005da7] dark:hover:border-[#a4c9ff]'
            )}
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 dark:text-[#8b919d]">
                <Upload size={28} />
                <p className="text-sm">{t('uploadPhotoHint')}</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('photoDate')}</label>
            <input type="date" value={takenAt} onChange={e => setTakenAt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#005da7]/30" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('photoCaption')}</label>
            <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#005da7]/30" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-2">{t('milestoneTagLabel')}</label>
            <div className="flex flex-wrap gap-1.5">
              {MILESTONE_IDS.map(id => (
                <button key={id} type="button"
                  onClick={() => setMilestone(prev => prev === id ? '' : id)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition',
                    milestone === id ? MILESTONE_COLORS[id] : 'bg-gray-100 dark:bg-[#282a2d] text-gray-500 dark:text-[#8b919d] hover:bg-gray-200 dark:hover:bg-[#333]'
                  )}
                >
                  {milestoneLabels[id]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#c1c7d3] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition">
              {t('cancel')}
            </button>
            <button type="submit" disabled={uploading || !file}
              className="flex-1 py-2.5 rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition">
              {uploading ? t('uploadingDots') : t('addPhoto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ photos, startIndex, onClose, onDelete, onShare, milestoneLabels }: {
  photos: DogPhoto[];
  startIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onShare: (photo: DogPhoto) => void;
  milestoneLabels: Record<PhotoMilestone, string>;
}) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(startIndex);
  const photo = photos[idx];

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(photos.length - 1, i + 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!photo) return null;

  const milestoneColor = photo.milestone_tag ? MILESTONE_COLORS[photo.milestone_tag] : null;
  const milestoneLabel = photo.milestone_tag ? milestoneLabels[photo.milestone_tag] : null;
  const imgSrc = resolvePhotoUrl(photo.photo_url);

  return (
    // The entire screen is the backdrop — clicking anywhere not intercepted below closes it
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Toolbar — NO wrapper stopPropagation; each button handles its own */}
      <div className="flex items-center justify-between px-3 py-3 flex-shrink-0 gap-2">
        <span className="text-white/60 text-sm flex-shrink-0">{idx + 1} / {photos.length}</span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onShare(photo); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#005da7]/80 hover:bg-[#005da7] text-white transition"
          >
            <Share2 size={14} className="flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">{t('shareToCommmunity')}</span>
          </button>

          <button
            onClick={e => { e.stopPropagation(); if (window.confirm(t('deletePhotoConfirm'))) { onDelete(photo.id); onClose(); } }}
            className="p-2 rounded-xl hover:bg-white/10 text-red-400 transition"
          >
            <Trash2 size={18} />
          </button>

          {/* Explicit close button — always works */}
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Image area — NO wrapper stopPropagation so clicking black space closes;
          stopPropagation only on the img and nav buttons themselves */}
      <div className="flex-1 flex items-center justify-center relative px-10 min-h-0">
        {idx > 0 && (
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-1 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <img
          src={imgSrc}
          alt={photo.caption ?? ''}
          className="max-h-full max-w-full object-contain rounded-xl"
          onClick={e => e.stopPropagation()}
          onError={e => {
            const el = e.currentTarget;
            if (!el.dataset.fallback) {
              el.dataset.fallback = '1';
              const filename = imgSrc.split('/').pop() ?? '';
              const backendOrigin = new URL(API_BASE_URL).origin;
              el.src = `${backendOrigin}/uploads/${filename}`;
            }
          }}
        />
        {idx < photos.length - 1 && (
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-1 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Caption — clicking here also closes (part of the backdrop experience) */}
      <div className="flex-shrink-0 px-4 py-4 text-center space-y-1 pointer-events-none">
        {milestoneLabel && milestoneColor && (
          <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-medium', milestoneColor)}>
            {milestoneLabel}
          </span>
        )}
        {photo.caption && <p className="text-white/80 text-sm">{photo.caption}</p>}
        <p className="text-white/40 text-xs">
          {new Date(photo.taken_at).toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        <p className="text-white/30 text-xs mt-1">{t('tapOutsideToClose')}</p>
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export const PhotoAlbumView: React.FC<Props> = ({ currentDog, onNavigate }) => {
  const { t, i18n } = useTranslation();
  const [photos, setPhotos] = useState<DogPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [filterMilestone, setFilterMilestone] = useState<PhotoMilestone | ''>('');
  const [sharingId, setSharingId] = useState<string | null>(null);

  const milestoneLabels: Record<PhotoMilestone, string> = Object.fromEntries(
    MILESTONE_IDS.map(id => [id, t(`milestone_${id}`)])
  ) as Record<PhotoMilestone, string>;

  const locale = i18n.language === 'bg' ? 'bg-BG' : 'en-GB';

  const load = useCallback(async () => {
    if (!currentDog) return;
    setLoading(true);
    try {
      const res = await apiClient.getDogPhotos(currentDog.id);
      setPhotos(res.photos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentDog]);

  useEffect(() => { load(); }, [load]);

  const handlePhotoAdded = (photo: DogPhoto) => {
    setPhotos(prev => [photo, ...prev]);
  };

  const handleDelete = async (photoId: string) => {
    try {
      await apiClient.deleteDogPhoto(currentDog!.id, photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async (photo: DogPhoto) => {
    setSharingId(photo.id);
    try {
      await apiClient.createPost({
        post_type: 'photo',
        title: photo.caption || currentDog?.name || '',
        content: photo.caption || '',
        // Resolve to absolute URL so the community post can display the image
        // regardless of whether frontend and backend are on the same origin.
        image_url: resolvePhotoUrl(photo.photo_url),
        dog_id: currentDog?.id,
        is_public: true,
      });
      setLightboxIdx(null);
      onNavigate?.('community');
    } catch (e) {
      console.error(e);
    } finally {
      setSharingId(null);
    }
  };

  if (!currentDog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-400 dark:text-[#8b919d]">
        <Camera size={48} className="opacity-40" />
        <p className="text-sm">{t('noDogs')} <button onClick={() => onNavigate?.('settings')} className="text-[#005da7] dark:text-[#a4c9ff] underline">{t('addDog')}</button></p>
      </div>
    );
  }

  const filteredPhotos = filterMilestone ? photos.filter(p => p.milestone_tag === filterMilestone) : photos;
  const groups = groupByMonth(filteredPhotos, locale);
  const photoFlatIndex: Record<string, number> = {};
  filteredPhotos.forEach((p, i) => { photoFlatIndex[p.id] = i; });

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">{t('photoAlbum')}</h1>
          <p className="text-sm text-gray-400 dark:text-[#8b919d]">
            {currentDog.name} — {photos.length} {i18n.language === 'bg' ? 'снимки' : 'photos'}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-semibold hover:opacity-90 transition active:scale-95"
        >
          <Plus size={16} />
          {t('addPhoto')}
        </button>
      </div>

      {/* Milestone filter */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterMilestone('')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition',
              filterMilestone === '' ? 'bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d]' : 'bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#c1c7d3] hover:bg-gray-200 dark:hover:bg-[#333]'
            )}
          >
            {t('allPhotosFilter')}
          </button>
          {MILESTONE_IDS.filter(id => photos.some(p => p.milestone_tag === id)).map(id => (
            <button key={id}
              onClick={() => setFilterMilestone(prev => prev === id ? '' : id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition',
                filterMilestone === id ? MILESTONE_COLORS[id] : 'bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#c1c7d3] hover:bg-gray-200 dark:hover:bg-[#333]'
              )}
            >
              {milestoneLabels[id]}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005da7]" />
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400 dark:text-[#8b919d]">
          <Camera size={48} className="opacity-40" />
          <p className="text-sm">{photos.length === 0 ? t('noPhotosYet') : t('noPhotosMatchFilter')}</p>
          {photos.length === 0 && (
            <button onClick={() => setAddOpen(true)} className="text-[#005da7] dark:text-[#a4c9ff] text-sm font-medium underline">
              {t('addYourFirstPhoto')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(group => (
            <div key={group.label}>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wider mb-3">{group.label}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {group.photos.map(photo => {
                  const milestoneColor = photo.milestone_tag ? MILESTONE_COLORS[photo.milestone_tag] : null;
                  const milestoneLabel = photo.milestone_tag ? milestoneLabels[photo.milestone_tag] : null;
                  const isSharing = sharingId === photo.id;
                  const imgSrc = resolvePhotoUrl(photo.photo_url);

                  return (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-gray-100 dark:bg-[#282a2d]"
                      onClick={() => setLightboxIdx(photoFlatIndex[photo.id])}
                    >
                      {/* Thumbnail */}
                      <img
                        src={imgSrc}
                        alt={photo.caption ?? ''}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={e => {
                          const el = e.currentTarget;
                          if (!el.dataset.fallback) {
                            el.dataset.fallback = '1';
                            const filename = imgSrc.split('/').pop() ?? '';
                            const backendOrigin = new URL(API_BASE_URL).origin;
                            el.src = `${backendOrigin}/uploads/${filename}`;
                          }
                        }}
                      />

                      {/* Action overlay:
                          - Mobile: always slightly visible so buttons are always accessible
                          - Desktop: only on hover */}
                      <div className={cn(
                        'absolute inset-0 flex flex-col justify-between p-1.5 transition-all duration-200',
                        // Mobile: always show a faint overlay + buttons
                        'bg-black/20 sm:bg-black/0 sm:group-hover:bg-black/40',
                      )}>
                        {/* Action buttons */}
                        <div className={cn(
                          'flex justify-end gap-1 transition-opacity',
                          // Mobile: always visible; desktop: hover-only
                          'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
                        )}>
                          <button
                            onClick={e => { e.stopPropagation(); handleShare(photo); }}
                            disabled={isSharing}
                            title={t('shareToCommmunity')}
                            className="p-1.5 rounded-lg bg-[#005da7]/90 hover:bg-[#005da7] text-white transition disabled:opacity-50"
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); if (window.confirm(t('deletePhotoConfirm'))) handleDelete(photo.id); }}
                            title={t('delete')}
                            className="p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Milestone tag at bottom */}
                        {milestoneLabel && milestoneColor && (
                          <div className={cn('self-start px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none', milestoneColor)}>
                            {milestoneLabel}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <AddPhotoModal dogId={currentDog.id} onAdded={handlePhotoAdded} onClose={() => setAddOpen(false)} />
      )}

      {lightboxIdx !== null && (
        <Lightbox
          photos={filteredPhotos}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onDelete={handleDelete}
          onShare={handleShare}
          milestoneLabels={milestoneLabels}
        />
      )}
    </div>
  );
};
