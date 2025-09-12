import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { FileUpload } from './ui/FileUpload';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { HealthRecord } from '../types';
import {
  PlusCircle,
  Heart,
  Stethoscope,
  Pill,
  AlertTriangle,
  Paperclip,
  FileText,
  ExternalLink,
  Download,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';

// ---------- Helpers (auth fetch + cross-platform open/download) ----------
const getAuthToken = () => localStorage.getItem('authToken');

const fetchBlobWithAuth = async (url: string) => {
  const token = getAuthToken();
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  return await res.blob();
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const openBlobWeb = (blob: Blob) => {
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank', 'noopener,noreferrer');
  // revoke later to allow load
  setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
};

const saveAndShareNative = async (blob: Blob, filename: string) => {
  const base64 = await blobToBase64(blob);
  // write to temp dir
  const path = `${Date.now()}-${filename || 'document'}`;
  await Filesystem.writeFile({
    data: base64,
    path,
    directory: Directory.Cache,
  });
  const fileUri = (await Filesystem.getUri({ path, directory: Directory.Cache })).uri;
  // Share sheet (lets user preview/open in another app or save)
  await Share.share({
    title: filename || 'document',
    url: fileUri,
  });
};

const triggerDownloadWeb = (blob: Blob, filename: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
};

type Attachment = {
  url: string;
  name: string;
  mimeType?: string;
};

export const HealthRecords: React.FC = () => {
  const { currentDog, healthRecords } = useApp();
  const { t } = useTranslation();

  // create form / modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    type: 'vet-visit' as HealthRecord['type'],
    title: '',
    description: '',
    date: '',
    veterinarian: '',
    medication: '',
    dosage: '',
  });

  // attachments preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState<Attachment[]>([]);

  // inline document viewer (PDF etc.) inside modal
  const [viewer, setViewer] = useState<{ url: string; name: string; mime?: string } | null>(null);

  // documents grouped by healthRecordId
  const [docsByRecord, setDocsByRecord] = useState<Record<string, any[]>>({});

  // optimistic deletions
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Load documents for current dog and group by health_record_id
  useEffect(() => {
    const loadDocs = async () => {
      if (!currentDog) {
        setDocsByRecord({});
        return;
      }
      try {
        const { documents } = await apiClient.getDocuments(currentDog.id);
        const grouped: Record<string, any[]> = {};
        for (const d of documents) {
          const key = d.health_record_id || d.healthRecordId;
          if (!key) continue;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(d);
        }
        setDocsByRecord(grouped);
      } catch (err) {
        console.error('Failed to load documents:', err);
      }
    };
    loadDocs();
  }, [currentDog?.id]);

  const dogHealthRecords = useMemo(
    () =>
      (currentDog
        ? healthRecords
            .filter((r) => r.dogId === currentDog.id && !deletedIds.has(r.id))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : []) as HealthRecord[],
    [currentDog, healthRecords, deletedIds]
  );

  const getTypeIcon = (type: HealthRecord['type']) => {
    switch (type) {
      case 'vet-visit':
        return <Stethoscope size={20} className="text-blue-500" />;
      case 'medication':
        return <Pill size={20} className="text-green-500" />;
      case 'illness':
        return <AlertTriangle size={20} className="text-red-500" />;
      case 'injury':
        return <AlertTriangle size={20} className="text-orange-500" />;
      default:
        return <Heart size={20} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: HealthRecord['type']) => {
    switch (type) {
      case 'vet-visit':
        return t('Vet Visit');
      case 'medication':
        return t('Medication');
      case 'illness':
        return t('Illness');
      case 'injury':
        return t('Injury');
      default:
        return t('Other');
    }
  };

  const isImage = (mime?: string, url?: string) => {
    if (mime) return mime.startsWith('image/');
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url || '');
  };

  const isPdf = (mime?: string, url?: string) => {
    if (mime) return mime === 'application/pdf';
    return /\.pdf$/i.test(url || '');
  };

  const openPreview = (items?: Attachment[]) => {
    if (!items || !items.length) return;
    setPreviewItems(items);
    setPreviewOpen(true);
    setViewer(null);
  };

  const refreshDocs = async () => {
    if (!currentDog) return;
    try {
      const { documents } = await apiClient.getDocuments(currentDog.id);
      const grouped: Record<string, any[]> = {};
      for (const d of documents) {
        const key = d.health_record_id || d.healthRecordId;
        if (!key) continue;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(d);
      }
      setDocsByRecord(grouped);
    } catch (err) {
      console.error('Failed to refresh documents:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDog) return;

    setLoading(true);
    try {
      // 1) Create the record and obtain its ID
      const { healthRecord } = await apiClient.createHealthRecord(currentDog.id, {
        date: new Date(formData.date),
        type: formData.type,
        title: formData.title,
        description: formData.description,
        veterinarian: formData.veterinarian || undefined,
        medication: formData.medication || undefined,
        dosage: formData.dosage || undefined,
      });

      // 2) Upload files tied to the new healthRecordId
      if (files.length) {
        await Promise.all(
          files.map((f) =>
            apiClient.uploadFile(f, {
              dogId: currentDog.id,
              healthRecordId: healthRecord.id,
              documentType: 'health',
            })
          )
        );
      }

      // 3) Reset form and refresh documents for counts/preview
      setIsModalOpen(false);
      setFormData({
        type: 'vet-visit',
        title: '',
        description: '',
        date: '',
        veterinarian: '',
        medication: '',
        dosage: '',
      });
      setFiles([]);
      await refreshDocs();
    } catch (error) {
      console.error('Error creating health record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (att: Attachment) => {
    try {
      const blob = await fetchBlobWithAuth(att.url);

      // If it's a PDF, prefer inline viewer in the modal (works on web & native)
      if (isPdf(att.mimeType, att.url)) {
        const blobUrl = URL.createObjectURL(blob);
        setViewer({ url: blobUrl, name: att.name, mime: 'application/pdf' });
        return;
      }

      if (Capacitor.isNativePlatform()) {
        // Save and open/share via system
        await saveAndShareNative(blob, att.name);
      } else {
        // Web
        openBlobWeb(blob);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async (att: Attachment) => {
    try {
      const blob = await fetchBlobWithAuth(att.url);
      if (Capacitor.isNativePlatform()) {
        await saveAndShareNative(blob, att.name); // share sheet doubles as "download"
      } else {
        triggerDownloadWeb(blob, att.name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRecord = async (record: HealthRecord) => {
    if (!currentDog) return;
    const ok = window.confirm(t('Are you sure you want to delete this health record?'));
    if (!ok) return;
    try {
      await apiClient.deleteHealthRecord(currentDog.id, record.id);
      // optimistic UI:
      setDeletedIds((prev) => new Set(prev).add(record.id));
      // also drop its docs
      setDocsByRecord((prev) => {
        const copy = { ...prev };
        delete copy[record.id];
        return copy;
      });
    } catch (e) {
      console.error('Failed to delete health record:', e);
      alert(t('Failed to delete the record.'));
    }
  };

  if (!currentDog) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <p className="text-gray-500">{t('Please select a dog to view health records')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {t('Health Records')} • {currentDog.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <PlusCircle size={16} className="mr-1" />
          {t('Add Record')}
        </Button>
      </div>

      {dogHealthRecords.length === 0 ? (
        <Card className="text-center py-8">
          <Heart size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500 mb-4">{t('No health records yet')}</p>
          <Button onClick={() => setIsModalOpen(true)}>{t('Add First Record')}</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {dogHealthRecords.map((record) => {
            const filesForRecord = docsByRecord[record.id] || [];
            const count = filesForRecord.length;

            return (
              <Card key={record.id}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getTypeIcon(record.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{record.title}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {getTypeLabel(record.type)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <Paperclip size={12} className="text-gray-400" />
                      {count > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            openPreview(
                              filesForRecord.map((d) => ({
                                url: d.file_url || d.url,
                                name: d.original_name || d.name,
                                mimeType: d.mime_type || d.mimeType,
                              }))
                            )
                          }
                          className="text-xs text-blue-600 hover:underline"
                          title={t('View attachments')}
                        >
                          {count} {count === 1 ? t('attachment') : t('attachments')}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">{t('No attachments')}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="icon"
                      title={t('Delete')}
                      onClick={() => handleDeleteRecord(record)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create record modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('Add Health Record')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Record Type')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as HealthRecord['type'] })
              }
              required
            >
              <option value="vet-visit">{t('Vet Visit')}</option>
              <option value="medication">{t('Medication')}</option>
              <option value="illness">{t('Illness')}</option>
              <option value="injury">{t('Injury')}</option>
              <option value="other">{t('Other')}</option>
            </select>
          </div>

          <Input
            label={t('Title')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t('e.g., Annual checkup, Ear infection')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Description')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('Describe the health record...')}
              required
            />
          </div>

          <Input
            label={t('Date')}
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label={t('Veterinarian')}
            value={formData.veterinarian}
            onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
          />

          {(formData.type === 'medication' || formData.type === 'illness') && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('Medication')}
                value={formData.medication}
                onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
              />
              <Input
                label={t('Dosage')}
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              />
            </div>
          )}

          <FileUpload
            label={t('Attach Documents (optional)')}
            files={files}
            onFilesChange={setFiles}
            accept="image/*,.pdf,.doc,.docx"
            maxFiles={5}
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('Adding...') : t('Add Record')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Attachments preview modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          // cleanup any inline viewer blob URL
          if (viewer?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(viewer.url);
          }
          setViewer(null);
        }}
        title={t('Attachments')}
        className="max-w-3xl"
      >
        <div className="space-y-4">
          {/* Inline viewer for PDFs */}
          {viewer && (
            <div className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
                <div className="text-sm font-medium truncate">{viewer.name}</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (viewer.url.startsWith('blob:')) URL.revokeObjectURL(viewer.url);
                    setViewer(null);
                  }}
                >
                  {t('Close preview')}
                </Button>
              </div>
              <iframe
                title={viewer.name}
                src={viewer.url}
                className="w-full h-[70vh]"
              />
            </div>
          )}

          {/* Images grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previewItems
              .filter((a) => isImage(a.mimeType, a.url))
              .map((a, idx) => (
                <div key={`img-${idx}`} className="border rounded-lg p-2">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img src={a.url} className="w-full h-40 object-cover rounded" />
                  <div className="mt-2 text-xs text-gray-700 truncate">{a.name}</div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpen(a)}
                      className="inline-flex items-center"
                    >
                      <ExternalLink size={14} className="mr-1" /> {t('Open')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(a)}
                      className="inline-flex items-center"
                    >
                      <Download size={14} className="mr-1" /> {t('Download')}
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {/* Non-images list */}
          <div className="space-y-2">
            {previewItems
              .filter((a) => !isImage(a.mimeType, a.url))
              .map((a, idx) => (
                <div
                  key={`file-${idx}`}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={18} className="text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-800 truncate">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpen(a)}
                      className="inline-flex items-center"
                    >
                      <ExternalLink size={14} className="mr-1" /> {t('Open')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(a)}
                      className="inline-flex items-center"
                    >
                      <Download size={14} className="mr-1" /> {t('Download')}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
