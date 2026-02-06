import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Shield, Calendar, User, Paperclip } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
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
  dateGiven: string;        // string because it comes from API, but ISO date
  nextDueDate?: string;
  veterinarian: string;
  batchNumber?: string;
  notes?: string;
  documents?: { url: string; name: string }[];
}


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
            id: doc.id,  // 👈 keep the document id for delete
            url: `${API_BASE_URL}/uploads/file/${doc.filename}`, // 👈 direct download URL
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
      dateGiven: vaccination.dateGiven ? vaccination.dateGiven.split('T')[0] : '', // 👈 ensures date input sees YYYY-MM-DD
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
     // Convert camelCase formData → snake_case for backend
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
    // reload vaccinations so new file shows up
    await loadVaccinations();
  } catch (err) {
    console.error('Error refreshing vaccinations after file upload:', err);
  }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('vaccinations')} - {dogName}
          </h3>
          <p className="text-gray-600">{t('trackVaccinations')}</p>
        </div>
        <Button
          onClick={handleCreate}
          className="w-full sm:w-auto"
          icon={<Plus size={20} />}
        >
          {t('addVaccination')}
        </Button>
      </div>

      {vaccinations.length === 0 ? (
        <Card className="text-center py-16">
          <Shield size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No vaccination records found</p>
          <Button onClick={handleCreate}>
            {t('addVaccination')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {vaccinations.map((vaccination) => (
            <Card key={vaccination.id}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {vaccination.vaccineName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {vaccination.vaccineType}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {t('dateGiven')}: {formatDate(vaccination.dateGiven)}
                      </div>
                      {vaccination.nextDueDate && (
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          {t('nextDueDate')}: {vaccination.nextDueDate && formatDate(vaccination.nextDueDate)}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <User size={16} className="mr-2" />
                        {vaccination.veterinarian}
                      </div>
                      {vaccination.batchNumber && (
                        <div className="text-gray-600">
                          {t('batchNumber')}: {vaccination.batchNumber}
                        </div>
                      )}
                    </div>
                    {vaccination.notes && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3 sm:line-clamp-none">
                        {vaccination.notes}
                      </p>
                    )}
                    {vaccination.documents && vaccination.documents.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <Paperclip size={14} className="mr-1" />
                          {t('attachedDocuments')}
                        </p>
                        <ul className="mt-1 space-y-1">
                        {vaccination.documents.map((doc: any, i) => (
                          <li key={doc.id || i} className="flex items-center justify-between">
                            <a
                              href={doc.url || doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {`Document ${i + 1}`}
                            </a>
                            <button
                              onClick={async () => {
                                if (window.confirm('Delete this attachment?')) {
                                  try {
                                    await apiClient.deleteDocument(doc.id);
                                    await loadVaccinations(); // refresh
                                  } catch (err) {
                                    console.error('Error deleting document:', err);
                                  }
                                }
                              }}
                              className="ml-2 text-red-600 hover:text-red-800 text-sm"
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
                <div className="flex gap-2 sm:justify-end sm:items-start">
                  <button
                    onClick={() => handleEdit(vaccination)}
                    className="flex-1 sm:flex-none rounded-lg p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(vaccination.id)}
                    className=" flex-1 sm:flex-none rounded-lg p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('vaccineType')}
          </label>
           <select
            className="input-field"
            value={formData.vaccineType}
            onChange={(e) => setFormData({ ...formData, vaccineType: e.target.value })}
            required
            >
            <option value="">{t('selectOption')}</option>
             <option value="mandatory">{t('mandatory')}</option>
             <option value="optional">{t('additional')}</option>
           </select>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          {/* File Upload */}
          {editingVaccination && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Documents (optional)
            </label>
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
              <div className="mt-2 text-sm text-green-600">
                {uploadedFiles.length} file(s) uploaded successfully
              </div>
            )}
          </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="w-full sm:flex-1" disabled={loading}>
              {loading ? t('loading') : t('save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};