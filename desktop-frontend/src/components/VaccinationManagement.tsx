import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Shield, Calendar, User, Paperclip } from 'lucide-react';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { FileUpload } from './ui/FileUpload';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';
import { API_BASE_URL } from '../config';

interface VaccinationManagementProps {
  dogId: string;
  dogName: string;
}

interface Vaccination {
  id: string;
  dogId: string;
  vaccineName: string;
  vaccineType: string;
  dateGiven: string;
  nextDueDate?: string;
  veterinarian: string;
  batchNumber?: string;
  notes?: string;
  documents?: { url: string; name: string }[];
}

const cardClass = 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-[#c1c7d3] mb-1';
const inputSelectClass = 'w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c1f] text-gray-900 dark:text-[#e2e2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] focus:border-transparent text-sm';

const getVaccinationStatus = (nextDueDate?: string) => {
  if (!nextDueDate) return { label: 'Valid', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
  const due = new Date(nextDueDate);
  const now = new Date();
  const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Expired', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
  if (diffDays <= 30) return { label: 'Due Soon', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' };
  return { label: 'Valid', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
};

export const VaccinationManagement: React.FC<VaccinationManagementProps> = ({
  dogId,
  dogName,
}) => {
  const { t } = useTranslation();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    vaccineName: '',
    vaccineType: '',
    dateGiven: '',
    nextDueDate: '',
    veterinarian: '',
    batchNumber: '',
    notes: '',
  });

  useEffect(() => {
    loadVaccinations();
  }, [dogId]);

  const loadVaccinations = async () => {
    try {
      const [vaccinationsRes, documentsRes] = await Promise.all([
        apiClient.getVaccinations(dogId),
        apiClient.getDocuments(dogId),
      ]);

      const documentsByVaccination: Record<string, any[]> = {};
      documentsRes.documents.forEach((doc: any) => {
        if (doc.vaccination_id) {
          if (!documentsByVaccination[doc.vaccination_id]) {
            documentsByVaccination[doc.vaccination_id] = [];
          }
          documentsByVaccination[doc.vaccination_id].push({
            id: doc.id,
            url: `${API_BASE_URL}/uploads/file/${doc.filename}`,
            name: doc.name || doc.originalName || "Attachment",
          });
        }
      });

      const normalized = vaccinationsRes.vaccinations.map((v: any) => ({
        id: v.id,
        dogId: v.dog_id,
        vaccineName: v.vaccine_name,
        vaccineType: v.vaccine_type,
        dateGiven: v.date_given,
        nextDueDate: v.next_due_date,
        veterinarian: v.veterinarian,
        batchNumber: v.batch_number,
        notes: v.notes,
        documents: documentsByVaccination[v.id] || [],
      }));

      setVaccinations(normalized);
    } catch (error) {
      console.error('Error loading vaccinations:', error);
    }
  };

  const handleCreate = () => {
    setEditingVaccination(null);
    setUploadedFiles([]);
    setFormData({
      vaccineName: '',
      vaccineType: '',
      dateGiven: '',
      nextDueDate: '',
      veterinarian: '',
      batchNumber: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (vaccination: Vaccination) => {
    setEditingVaccination(vaccination);
    setUploadedFiles([]);
    setFormData({
      vaccineName: vaccination.vaccineName,
      vaccineType: vaccination.vaccineType,
      dateGiven: vaccination.dateGiven ? vaccination.dateGiven.split('T')[0] : '',
      nextDueDate: vaccination.nextDueDate ? vaccination.nextDueDate.split('T')[0] : '',
      veterinarian: vaccination.veterinarian,
      batchNumber: vaccination.batchNumber || '',
      notes: vaccination.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      vaccine_name: formData.vaccineName,
      vaccine_type: formData.vaccineType,
      date_given: formData.dateGiven,
      next_due_date: formData.nextDueDate || null,
      veterinarian: formData.veterinarian,
      batch_number: formData.batchNumber || null,
      notes: formData.notes || null,
    };
    try {
      if (editingVaccination) {
        await apiClient.updateVaccination(dogId, editingVaccination.id, payload);
      } else {
        await apiClient.createVaccination(dogId, payload);
      }
      await loadVaccinations();
      setIsModalOpen(false);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error saving vaccination:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vaccinationId: string) => {
    if (window.confirm('Are you sure you want to delete this vaccination record?')) {
      try {
        await apiClient.deleteVaccination(dogId, vaccinationId);
        await loadVaccinations();
      } catch (error) {
        console.error('Error deleting vaccination:', error);
      }
    }
  };

  const handleFileUploaded = async (fileUrl: string, fileName: string) => {
    setUploadedFiles(prev => [...prev, fileUrl]);
    try {
      await loadVaccinations();
    } catch (err) {
      console.error('Error refreshing vaccinations after file upload:', err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e2e2e6]">
            {t('vaccinations')} — {dogName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('trackVaccinations')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          {t('addVaccination')}
        </button>
      </div>

      {vaccinations.length === 0 ? (
        <div className={`${cardClass} text-center py-16`}>
          <Shield size={48} className="mx-auto mb-4 text-gray-300 dark:text-[#414751]" />
          <p className="text-gray-500 dark:text-[#8b919d] mb-4">No vaccination records found</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('addVaccination')}
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {vaccinations.map((vaccination) => {
            const status = getVaccinationStatus(vaccination.nextDueDate);
            return (
              <div key={vaccination.id} className={cardClass}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-[#e2e2e6]">
                          {vaccination.vaccineName}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-3">
                        {vaccination.vaccineType}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-gray-500 dark:text-[#8b919d] gap-1.5">
                          <Calendar size={14} />
                          {t('dateGiven')}: {formatDate(vaccination.dateGiven)}
                        </div>
                        {vaccination.nextDueDate && (
                          <div className="flex items-center text-gray-500 dark:text-[#8b919d] gap-1.5">
                            <Calendar size={14} />
                            {t('nextDueDate')}: {formatDate(vaccination.nextDueDate)}
                          </div>
                        )}
                        <div className="flex items-center text-gray-500 dark:text-[#8b919d] gap-1.5">
                          <User size={14} />
                          {vaccination.veterinarian}
                        </div>
                        {vaccination.batchNumber && (
                          <div className="text-gray-500 dark:text-[#8b919d]">
                            {t('batchNumber')}: {vaccination.batchNumber}
                          </div>
                        )}
                      </div>
                      {vaccination.notes && (
                        <p className="text-sm text-gray-500 dark:text-[#8b919d] mt-2 line-clamp-3 sm:line-clamp-none">
                          {vaccination.notes}
                        </p>
                      )}
                      {vaccination.documents && vaccination.documents.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-[#c1c7d3] flex items-center gap-1.5 mb-1">
                            <Paperclip size={13} />
                            {t('attachedDocuments')}
                          </p>
                          <ul className="space-y-1">
                            {vaccination.documents.map((doc: any, i) => (
                              <li key={doc.id || i} className="flex items-center justify-between">
                                <a
                                  href={doc.url || doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#005da7] dark:text-[#a4c9ff] hover:underline text-sm"
                                >
                                  {`Document ${i + 1}`}
                                </a>
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Delete this attachment?')) {
                                      try {
                                        await apiClient.deleteDocument(doc.id);
                                        await loadVaccinations();
                                      } catch (err) {
                                        console.error('Error deleting document:', err);
                                      }
                                    }
                                  }}
                                  className="ml-2 text-red-500 hover:text-red-700 text-xs"
                                >
                                  {t('delete')}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 sm:justify-end sm:items-start">
                    <button
                      onClick={() => handleEdit(vaccination)}
                      className="p-2 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(vaccination.id)}
                      className="p-2 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVaccination ? t('editVaccination') : t('addVaccination')}
        className="w-[95vw] sm:w-auto sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('vaccineName')}
            value={formData.vaccineName}
            onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
            required
          />
          <div>
            <label className={labelClass}>{t('vaccineType')}</label>
            <select
              className={inputSelectClass}
              value={formData.vaccineType}
              onChange={(e) => setFormData({ ...formData, vaccineType: e.target.value })}
              required
            >
              <option value="">{t('selectOption')}</option>
              <option value="mandatory">{t('mandatory')}</option>
              <option value="optional">{t('additional')}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('dateGiven')}
              type="date"
              value={formData.dateGiven}
              onChange={(e) => setFormData({ ...formData, dateGiven: e.target.value })}
              required
            />
            <Input
              label={t('nextDueDate')}
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
            />
          </div>
          <Input
            label={t('veterinarian')}
            value={formData.veterinarian}
            onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
            required
          />
          <Input
            label={t('batchNumber')}
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
          />
          <div>
            <label className={labelClass}>{t('notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputSelectClass}
              rows={3}
            />
          </div>

          {editingVaccination && (
            <div>
              <label className={labelClass}>Attach Documents (optional)</label>
              <FileUpload
                acceptedTypes="image/*,.pdf,.doc,.docx"
                maxSize={10}
                dogId={dogId}
                vaccinationId={editingVaccination?.id}
                documentType="vaccination_document"
                onFileUploaded={handleFileUploaded}
                multiple={true}
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  {uploadedFiles.length} file(s) uploaded successfully
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all w-full sm:w-auto"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
