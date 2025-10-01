import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { Vaccination } from '../types';
import { PlusCircle, Shield, AlertCircle, Trash2, Paperclip, FileText, Edit2,  } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { FileUpload } from './ui/FileUpload';
import { openDocument } from '../lib/fileUtils';
import { API_BASE_URL } from '../config';

// Normalize records from either camelCase (mobile) or snake_case (backend/desktop)
function normalizeVaccination(v: any): {
  id: string;
  dogId: string;
  vaccineName: string;
  vaccineType: string;
  dateGiven: Date;
  nextDueDate?: Date;
  veterinarian: string;
  notes?: string;
  // keep raw for other fields if needed
} {
  const id = v.id;
  const dogId = v.dogId ?? v.dog_id;
  const vaccineName = v.vaccineName ?? v.vaccine_name ?? '';
  const vaccineType = v.vaccineType ?? v.vaccine_type ?? '';
  const dateGivenRaw = v.dateGiven ?? v.date_given;
  const nextDueRaw = v.nextDueDate ?? v.next_due_date;
  const veterinarian = v.veterinarian ?? '';
  const notes = v.notes ?? undefined;

  const dateGiven = typeof dateGivenRaw === 'string' ? new Date(dateGivenRaw) : new Date(dateGivenRaw);
  const nextDueDate = nextDueRaw ? (typeof nextDueRaw === 'string' ? new Date(nextDueRaw) : new Date(nextDueRaw)) : undefined;

  return { id, dogId, vaccineName, vaccineType, dateGiven, nextDueDate, veterinarian, notes };
}

export const VaccinationTracker: React.FC = () => {
  const { currentDog, vaccinations, createVaccination, deleteVaccination } = useApp();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vaccinationToDelete, setVaccinationToDelete] = useState<Vaccination | any | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [localVaccinations, setLocalVaccinations] = useState<Vaccination[]>([]);
  const [editingVaccination, setEditingVaccination] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    vaccineName: '',
    vaccineType: '',
    dateGiven: '',
    nextDueDate: '',
    veterinarian: '',
    batchNumber: '',
    notes: '',
  });

  // documents grouped by vaccination_id
  const [docsByVacc, setDocsByVacc] = useState<Record<string, any[]>>({});
  // Load vaccinations for current dog
  useEffect(() => {
  const loadVaccinations = async () => {
    if (!currentDog) {
      setLocalVaccinations([]);
      return;
    }
    try {
      const { vaccinations } = await apiClient.getVaccinations(currentDog.id);
      setLocalVaccinations(vaccinations);
    } catch (err) {
      console.error('Failed to load vaccinations:', err);
    }
  };
  loadVaccinations();
}, [currentDog?.id]);

  // Load documents for current dog and group by vaccination
  useEffect(() => {
    const loadDocs = async () => {
      if (!currentDog) {
        setDocsByVacc({});
        return;
      }
      try {
        const { documents } = await apiClient.getDocuments(currentDog.id);
        const grouped: Record<string, any[]> = {};
        for (const d of documents) {
          const key = d.vaccination_id || d.vaccinationId;
          if (!key) continue;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(d);
        }
        setDocsByVacc(grouped);
      } catch (err) {
        console.error('Failed to load vaccination documents:', err);
      }
    };
    loadDocs();
  }, [currentDog?.id]);

  const dogVaccinations = useMemo(() => {
      if (!currentDog) return [];
      return (localVaccinations || [])
        .filter((v: any) => (v.dogId ?? v.dog_id) === currentDog.id)
        .map(normalizeVaccination)
        .sort((a, b) => b.dateGiven.getTime() - a.dateGiven.getTime());
    }, [localVaccinations, currentDog?.id]);

  const getVaccinationStatus = (v: ReturnType<typeof normalizeVaccination>) => {
    if (!v.nextDueDate) return 'complete';
    const today = new Date();
    const warn = new Date(v.nextDueDate);
    warn.setDate(warn.getDate() - 30);
    if (today < warn) return 'current';
    if (today < v.nextDueDate) return 'due-soon';
    return 'overdue';
  };
  const getStatusColor = (s: string) =>
    s === 'current' ? 'text-green-600 bg-green-50'
    : s === 'due-soon' ? 'text-yellow-600 bg-yellow-50'
    : s === 'overdue' ? 'text-red-600 bg-red-50'
    : 'text-gray-600 bg-gray-50';
  const getStatusText = (s: string) =>
    s === 'current' ? t('Current') : s === 'due-soon' ? t('Due Soon') : s === 'overdue' ? t('Overdue') : t('Complete');

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentDog) return;
      setLoading(true);
      try {
        let vaccinationId: string;

        if (editingVaccination) {
          // update
          await apiClient.updateVaccination(currentDog.id, editingVaccination.id, {
            vaccine_name: formData.vaccineName,
            vaccine_type: formData.vaccineType,
            date_given: formData.dateGiven,
            next_due_date: formData.nextDueDate || null,
            veterinarian: formData.veterinarian,
            batch_number: formData.batchNumber || null,
            notes: formData.notes || null,
          });
          vaccinationId = editingVaccination.id;
        } else {
          // create
          const res = await apiClient.createVaccination(currentDog.id, {
            dogId: currentDog.id,
            vaccineName: formData.vaccineName,
            vaccineType: formData.vaccineType,
            dateGiven: formData.dateGiven,
            nextDueDate: formData.nextDueDate || undefined,
            veterinarian: formData.veterinarian,
            batchNumber: formData.batchNumber || undefined,
            notes: formData.notes || undefined,
          } as any);
          vaccinationId = res.vaccination.id;
        }

        // upload any chosen files
        if (files.length) {
          await Promise.all(
            files.map((f) =>
              apiClient.uploadFile(f, {
                dogId: currentDog.id,
                vaccinationId,
                documentType: 'vaccination_document',
              })
            )
          );
        }
        
        // reset modal state
        setIsModalOpen(false);
        setEditingVaccination(null);
        setFormData({
          vaccineName: '',
          vaccineType: '',
          dateGiven: '',
          nextDueDate: '',
          veterinarian: '',
          batchNumber: '',
          notes: '',
        });
        setFiles([]);
        await apiClient.getVaccinations(currentDog.id).then(res => setLocalVaccinations(res.vaccinations));

        // refresh documents
        const { documents } = await apiClient.getDocuments(currentDog.id);
        const grouped: Record<string, any[]> = {};
        for (const d of documents) {
          const key = d.vaccination_id || d.vaccinationId;
          if (!key) continue;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(d);
        }
        setDocsByVacc(grouped);
      } catch (error) {
        console.error('Error saving vaccination:', error);
      } finally {
        setLoading(false);
      }
    };


  const openDeleteModal = (v: any) => {
    setVaccinationToDelete(v);
    setDeleteModalOpen(true);
  };

  const handleDeleteVaccination = async () => {
    if (!currentDog || !vaccinationToDelete) return;
    setLoading(true);
    try {
      // Optimistic: drop attachments for this vaccination to avoid stale deletes
      setDocsByVacc((prev) => {
        const copy = { ...prev };
        delete copy[vaccinationToDelete.id];
        return copy;
      });

      await deleteVaccination(currentDog.id, vaccinationToDelete.id);
      setDeleteModalOpen(false);
      setVaccinationToDelete(null);
      await apiClient.getVaccinations(currentDog.id).then(res => setLocalVaccinations(res.vaccinations));

    } catch (error) {
      console.error('Error deleting vaccination:', error);
    } finally {
      setLoading(false);
    }
  };

   const handleOpenDoc = async (doc: any) => {
      try {
        // doc.file_path looks like "/uploads/<filename>"
        // but backend expects "/uploads/file/<filename>"
        let url: string | null = null;

        if (doc.file_url) {
          url = doc.file_url;
        } else if (doc.url) {
          url = doc.url;
        } else if (doc.file_path) {
          // normalize path
          const fileName = doc.file_path.split('/').pop();
          url = `${API_BASE_URL}/uploads/file/${fileName}`;
        }

        if (!url) {
          console.warn('No URL for document', doc);
          return;
        }

        await openDocument(url, doc.original_name || doc.name || 'document');
      } catch (err) {
        console.error('Error opening document:', err);
      }
    };


  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm(t('Delete this attachment?'))) return;
    try {
      await apiClient.deleteDocument(docId);
      // refresh grouping
      if (currentDog?.id) {
        const { documents } = await apiClient.getDocuments(currentDog.id);
        const grouped: Record<string, any[]> = {};
        for (const d of documents) {
          const key = d.vaccination_id || d.vaccinationId;
          if (!key) continue;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(d);
        }
        setDocsByVacc(grouped);
      }
    } catch (err: any) {
      // tolerate "Document not found" so UI doesn't get stuck
      if (String(err?.message || '').includes('Document not found')) {
        console.warn('Attachment already deleted, ignoring.');
      } else {
        console.error('Error deleting document:', err);
      }
    }
  };

  if (!currentDog) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <p className="text-gray-500">{t('Please select a dog to view vaccination records')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {t('Vaccinations')} • {currentDog.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <PlusCircle size={16} className="mr-1" />
          {t('Add Record')}
        </Button>
      </div>

      {/* Empty state */}
      {dogVaccinations.length === 0 ? (
        <Card className="text-center py-8">
          <Shield size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500 mb-4">{t('No vaccination records yet')}</p>
          <Button onClick={() => setIsModalOpen(true)}>{t('Add First Vaccination')}</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {dogVaccinations.map((v) => {
            const status = getVaccinationStatus(v);
            const docs = docsByVacc[v.id] || [];
            return (
              <Card key={v.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{v.vaccineName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{v.vaccineType}</p>
                    <p className="text-xs text-gray-500">
                      {t('Given')}: {format(v.dateGiven, 'MMM dd, yyyy')}
                    </p>
                    {v.nextDueDate && (
                      <p className="text-xs text-gray-500">
                        {t('Next due')}: {format(v.nextDueDate, 'MMM dd, yyyy')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {t('Vet')}: {v.veterinarian}
                    </p>

                    {/* Attachments */}
                    {docs.length > 0 && (
                      <div className="mt-3 border-t pt-2">
                        <p className="text-sm font-medium flex items-center">
                          <Paperclip size={14} className="mr-1" />
                          {t('Attachments')}
                        </p>
                        <ul className="space-y-1 mt-1">
                          {docs.map((doc) => (
                            <li key={doc.id} className="flex items-center justify-between text-sm">
                              <button
                                type="button"
                                onClick={() => handleOpenDoc(doc)}
                                className="text-blue-600 hover:underline inline-flex items-center"
                              >
                                <FileText size={14} className="mr-2" />
                                {doc.name || doc.originalName || t('Document')}
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
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        vaccineName: v.vaccineName,
                        vaccineType: v.vaccineType,
                        dateGiven: v.dateGiven.toISOString().split('T')[0],
                        nextDueDate: v.nextDueDate ? v.nextDueDate.toISOString().split('T')[0] : '',
                        veterinarian: v.veterinarian,
                        batchNumber: v.batchNumber || '',
                        notes: v.notes || '',
                        
                      });
                      setVaccinationToDelete(null);
                      setEditingVaccination(v); // 👈 new state
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1"
                  >
                                        <Edit2 size={16} />

                  </Button>

                  <div className="flex flex-col items-end gap-2">
                    {status === 'overdue' && <AlertCircle size={20} className="text-red-500" />}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteModal(v)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
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

      {/* Add modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('Add Vaccination Record')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('Vaccine Name')} value={formData.vaccineName}
            onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })} required />
          <Input label={t('Vaccine Type')} value={formData.vaccineType}
            onChange={(e) => setFormData({ ...formData, vaccineType: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('Date Given')} type="date" value={formData.dateGiven}
              onChange={(e) => setFormData({ ...formData, dateGiven: e.target.value })} required />
            <Input label={t('Next Due Date')} type="date" value={formData.nextDueDate}
              onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })} />
          </div>
          <Input label={t('Veterinarian')} value={formData.veterinarian}
            onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })} required />
          <Input label={t('Batch Number (optional)')} value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Notes (optional)')}</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          {editingVaccination && (
              <FileUpload
                label={t('Attach Documents (optional)')}
                files={files}
                onFilesChange={setFiles}
                accept="image/*,.pdf,.doc,.docx"
                maxFiles={5}
              />
            )}

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('Adding...') : t('Add Vaccination')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('Delete Vaccination Record')}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <AlertCircle size={20} className="text-red-500" />
            <div>
              <p className="font-medium text-red-900">{t('Are you sure?')}</p>
              <p className="text-sm text-red-700">
                {t('This will permanently delete the vaccination record for')} "{vaccinationToDelete?.vaccineName || ''}".
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)} className="flex-1">
              {t('Cancel')}
            </Button>
            <Button onClick={handleDeleteVaccination} className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={loading}>
              {loading ? t('Deleting...') : t('Delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
