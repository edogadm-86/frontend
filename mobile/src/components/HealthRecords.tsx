import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { FileUpload } from './ui/FileUpload';
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
  Edit2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { API_BASE_URL } from '../config';

// ---------- Helpers ----------
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
  setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
};

const saveAndShareNative = async (blob: Blob, filename: string) => {
  const base64 = await blobToBase64(blob);
  const path = `${Date.now()}-${filename || 'document'}`;
  await Filesystem.writeFile({
    data: base64,
    path,
    directory: Directory.Cache,
  });
  const fileUri = (await Filesystem.getUri({ path, directory: Directory.Cache })).uri;
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

// ---------- Normalizer ----------
function normalizeHealthRecord(r: any): HealthRecord {
  return {
    id: r.id,
    dogId: r.dogId ?? r.dog_id,
    type: r.type,
    title: r.title,
    description: r.description,
    date: typeof r.date === 'string' ? new Date(r.date) : new Date(r.date),
    veterinarian: r.veterinarian ?? '',
    medication: r.medication ?? '',
    dosage: r.dosage ?? '',
    documents: r.documents ?? [],   // ✅ fix
  };
}


// ---------- Component ----------
type Attachment = { url: string; name: string; id?: string; mimeType?: string };


export const HealthRecords: React.FC = () => {
  const { currentDog } = useApp();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [formData, setFormData] = useState({
    type: 'vet-visit' as HealthRecord['type'],
    title: '',
    description: '',
    date: '',
    veterinarian: '',
    medication: '',
    dosage: '',
  });

  const [localRecords, setLocalRecords] = useState<HealthRecord[]>([]);
  const [docsByRecord, setDocsByRecord] = useState<Record<string, any[]>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Refresh records + attachments
  const refreshAll = async () => {
    if (!currentDog) return;
    try {
      const { healthRecords } = await apiClient.getHealthRecords(currentDog.id);
      setLocalRecords(healthRecords.map(normalizeHealthRecord));
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
      console.error('Failed to refresh data:', err);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [currentDog?.id]);

  const dogHealthRecords = useMemo(
    () =>
      (currentDog
        ? localRecords
            .filter((r) => r.dogId === currentDog.id && !deletedIds.has(r.id))
            .sort((a, b) => b.date.getTime() - a.date.getTime())
        : []),
    [localRecords, currentDog, deletedIds]
  );

   const handleDeleteDoc = async (docId: string) => {
  if (!window.confirm(t('Delete this attachment?'))) return;
  try {
    await apiClient.deleteDocument(docId);
    await refreshAll(); // reload docs
  } catch (err: any) {
    if (String(err?.message || '').includes('Document not found')) {
      console.warn('Attachment already deleted, ignoring.');
    } else {
      console.error('Error deleting document:', err);
    }
  }
};

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

  const isImage = (mime?: string, url?: string) =>
    mime ? mime.startsWith('image/') : /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url || '');

  const isPdf = (mime?: string, url?: string) =>
    mime ? mime === 'application/pdf' : /\.pdf$/i.test(url || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDog) return;
    setLoading(true);
    try {
      let recordId: string;
      if (editingRecord) {
        await apiClient.updateHealthRecord(currentDog.id, editingRecord.id, {
          date: formData.date,
          type: formData.type,
          title: formData.title,
          description: formData.description,
          veterinarian: formData.veterinarian || null,
          medication: formData.medication || null,
          dosage: formData.dosage || null,
        });
        recordId = editingRecord.id;
      } else {
        const { healthRecord } = await apiClient.createHealthRecord(currentDog.id, {
          dogId: currentDog.id, // ✅ required by type
          date: new Date(formData.date),
          type: formData.type,
          title: formData.title,
          description: formData.description,
          veterinarian: formData.veterinarian || undefined,
          medication: formData.medication || undefined,
          dosage: formData.dosage || undefined,
        });

        recordId = healthRecord.id;
      }
      if (files.length) {
        await Promise.all(
          files.map((f) =>
            apiClient.uploadFile(f, {
              dogId: currentDog.id,
              healthRecordId: recordId,
              documentType: 'health_document',
            })
          )
        );
      }
      setIsModalOpen(false);
      setEditingRecord(null);
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
      await refreshAll();
    } catch (error) {
      console.error('Error saving health record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttachment = async (docId: string) => {
    if (!window.confirm(t('Delete this attachment?'))) return;
    try {
      await apiClient.deleteDocument(docId);
      await refreshAll();
    } catch (err: any) {
      if (String(err?.message || '').includes('Document not found')) {
        console.warn('Attachment already deleted, ignoring.');
      } else {
        console.error('Error deleting document:', err);
      }
    }
  };

  const handleOpen = async (att: Attachment) => {
    try {
      const blob = await fetchBlobWithAuth(att.url);
      if (isPdf(att.mimeType, att.url)) {
        const blobUrl = URL.createObjectURL(blob);
        setViewer({ url: blobUrl, name: att.name, mime: 'application/pdf' });
        return;
      }
      if (Capacitor.isNativePlatform()) {
        await saveAndShareNative(blob, att.name);
      } else {
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
        await saveAndShareNative(blob, att.name);
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
      setDeletedIds((prev) => new Set(prev).add(record.id));
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {t('Health Records')} • {currentDog.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <PlusCircle size={16} className="mr-1" />
          {t('Add Record')}
        </Button>
      </div>

      {/* Records list */}
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
                      {format(record.date, 'MMM dd, yyyy')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Paperclip size={12} className="text-gray-400" />
                      {filesForRecord.length > 0 && (
                        <div className="mt-3 border-t pt-2">
                          <p className="text-sm font-medium flex items-center">
                            <Paperclip size={14} className="mr-1" />
                            {t('Attachments')}
                          </p>
                          <ul className="space-y-1 mt-1">
                            {filesForRecord.map((doc) => (
                              <li key={doc.id} className="flex items-center justify-between text-sm">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpen({
                                      url:
                                        doc.file_url ||
                                        doc.url ||
                                        (doc.file_path
                                          ? `${API_BASE_URL}/uploads/file/${doc.file_path.split('/').pop()}`
                                          : ''),
                                      name: doc.original_name || doc.name,
                                      mimeType: doc.mime_type || doc.mimeType,
                                    })
                                  }
                                  className="text-blue-600 hover:underline inline-flex items-center"
                                >
                                  <FileText size={14} className="mr-2" />
                                  {doc.original_name || doc.name || t('Document')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  {t('Delete')}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  </div>
                  <div className="pt-1 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      title={t('Edit')}
                      onClick={() => {
                        setEditingRecord(record);
                        setFormData({
                          type: record.type,
                          title: record.title,
                          description: record.description || '',
                          date: record.date.toISOString().split('T')[0],
                          veterinarian: record.veterinarian || '',
                          medication: record.medication || '',
                          dosage: record.dosage || '',
                        });
                        setFiles([]);
                        setIsModalOpen(true);
                      }}
                    >
                    <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? t('editHealthRecord') : t('addHealthRecord')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Record Type')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Description')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            label={t('Attach Documents')}
            files={files}
            onFilesChange={setFiles}
            accept="image/*,.pdf,.doc,.docx"
            maxFiles={5}
          />
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingRecord(null);
              }}
            >
              {t('Cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading
                ? editingRecord
                  ? t('Saving...')
                  : t('Adding...')
                : editingRecord
                ? t('Save Changes')
                : t('Add Record')}
            </Button>
          </div>
        </form>
      </Modal>


    </div>
  );
};
