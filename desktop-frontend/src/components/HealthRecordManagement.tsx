import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Heart, Calendar, User, Pill, Paperclip } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { FileUpload } from './ui/FileUpload';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';
import { API_BASE_URL } from '../config';
import { HealthRecord } from '../types';


interface HealthRecordManagementProps {
  dogId: string;
  dogName: string;
}



export const HealthRecordManagement: React.FC<HealthRecordManagementProps> = ({
  dogId,
  dogName,
}) => {
  const { t } = useTranslation();
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    type: 'vet-visit' as HealthRecord['type'],
    title: '',
    description: '',
    veterinarian: '',
    medication: '',
    dosage: '',
  });

  useEffect(() => {
    loadHealthRecords();
  }, [dogId]);

  const loadHealthRecords = async () => {
  try {
    const [recordsRes, documentsRes] = await Promise.all([
      apiClient.getHealthRecords(dogId),
      apiClient.getDocuments(dogId),
    ]);

    const documentsByRecord: Record<string, any[]> = {};
    documentsRes.documents.forEach((doc: any) => {
      if (doc.health_record_id) {
        if (!documentsByRecord[doc.health_record_id]) {
          documentsByRecord[doc.health_record_id] = [];
        }
        documentsByRecord[doc.health_record_id].push({
          id: doc.id,
          url: `${API_BASE_URL}/uploads/file/${doc.filename}`,
          name: doc.name || doc.originalName || "Attachment",
        });
      }
    });

    const normalized = recordsRes.healthRecords.map((r: any) => ({
      id: r.id,
      dogId: r.dog_id,
      date: r.date,
      type: r.type,
      title: r.title,
      description: r.description,
      veterinarian: r.veterinarian,
      medication: r.medication,
      dosage: r.dosage,
      documents: documentsByRecord[r.id] || [],
    }));

    setHealthRecords(normalized);
  } catch (error) {
    console.error("Error loading health records:", error);
  }
};
  const handleCreate = () => {
    setEditingRecord(null);
    setUploadedFiles([]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'vet-visit',
      title: '',
      description: '',
      veterinarian: '',
      medication: '',
      dosage: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record);
    setUploadedFiles([]);
    setFormData({
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      type: record.type,
      title: record.title,
      description: record.description,
      veterinarian: record.veterinarian || '',
      medication: record.medication || '',
      dosage: record.dosage || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRecord) {
        await apiClient.updateHealthRecord(dogId, editingRecord.id, formData);
      } else {
        await apiClient.createHealthRecord(dogId, formData);
      }
      await loadHealthRecords();
      setIsModalOpen(false);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error saving health record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (window.confirm(t('areSureDeleteRecord'))) {
      try {
        await apiClient.deleteHealthRecord(dogId, recordId);
        await loadHealthRecords();
      } catch (error) {
        console.error('Error deleting health record:', error);
      }
    }
  };

  const handleFileUploaded = (fileUrl: string, fileName: string) => {
    setUploadedFiles(prev => [...prev, fileUrl]);
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vet-visit': return <User size={24} className="text-blue-600" />;
      case 'medication': return <Pill size={24} className="text-green-600" />;
      case 'illness': return <Heart size={24} className="text-red-600" />;
      case 'injury': return <Heart size={24} className="text-orange-600" />;
      default: return <Heart size={24} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vet-visit': return 'bg-blue-100';
      case 'medication': return 'bg-green-100';
      case 'illness': return 'bg-red-100';
      case 'injury': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('healthRecords')} - {dogName}
          </h3>
          <p className="text-gray-600">{t('trackMedicalHistoryAndHealthInformation')}</p>
        </div>
        <Button onClick={handleCreate}  className="w-full sm:w-auto"
                              icon={<Plus size={20} />}>
          {t('addHealthRecord')}
        </Button>
      </div>

      {healthRecords.length === 0 ? (
        <Card className="text-center py-16">
          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No health records found</p>
          <Button onClick={handleCreate}>
            {t('addHealthRecord')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {healthRecords.map((record) => (
            <Card key={record.id}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 ${getTypeColor(record.type)} rounded-lg flex items-center justify-center`}>
                    {getTypeIcon(record.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate max-w-full">
                        {record.title}
                      </h4>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full whitespace-nowrap">
                        {record.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3 sm:line-clamp-none">
                      {record.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {formatDate(record.date)}
                      </div>
                      {record.veterinarian && (
                        <div className="flex items-center text-gray-600">
                          <User size={16} className="mr-2" />
                          {record.veterinarian}
                        </div>
                      )}
                      {record.medication && (
                        <div className="flex items-center text-gray-600">
                          <Pill size={16} className="mr-2" />
                          {record.medication}
                          {record.dosage && ` - ${record.dosage}`}
                        </div>
                      )}
                     {record.documents && record.documents.length > 0 && (
                      <div> 
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <Paperclip size={14} className="mr-1" />
                          {t('attachedDocuments')}
                        </p>
                        <ul className="mt-2 space-y-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                          {record.documents.map((doc, i) => (
                            <li key={doc.id || i} className="flex items-center justify-between">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                {doc.name || `Document ${i + 1}`}
                              </a>
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (window.confirm('Delete this attachment?')) {
                                    try {
                                      await apiClient.deleteDocument(doc.id);
                                      await loadHealthRecords();
                                    } catch (err) {
                                      console.error('Error deleting document:', err);
                                    }
                                  }
                                }}
                                className="ml-2 text-red-600 hover:text-red-800 text-sm"
                              >
                                {t('delete')} {t('attachedDocuments')}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    </div>
                     
                  </div>
                </div>
                <div className="flex gap-2 sm:justify-end">
                  <button
                    onClick={() => handleEdit(record)}
                    className="flex-1 sm:flex-none  p-2 text-gray-400 hover:text-blue-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="flex-1 sm:flex-none  p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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
        title={editingRecord ? t('editHealthRecord') : t('addHealthRecord')}
        className="w-[95vw] sm:w-auto sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('date')}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('type')}
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as HealthRecord['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="vet-visit">{t('vetVisit')}</option>
                <option value="medication">{t('medication')}</option>
                <option value="illness">{t('ilness')}</option>
                <option value="injury">{t('injury')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>
          </div>
          <Input
            label={t('title')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
          <Input
            label={t('veterinarian')}
            value={formData.veterinarian}
            onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('medication')}
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
            />
            <Input
              label={t('dosage')}
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            />
          </div>
          
          {/* File Upload */}
         {editingRecord && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
               {t('attachedDocuments')}
              </label>
              <FileUpload
                acceptedTypes="image/*,.pdf,.doc,.docx"
                maxSize={10}
                dogId={dogId}
                healthRecordId={editingRecord.id}
                documentType="health_document"
                onFileUploaded={handleFileUploaded}
                multiple={true}
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  {uploadedFiles.length} {t('filesUploaded')}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsModalOpen(false)}>
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