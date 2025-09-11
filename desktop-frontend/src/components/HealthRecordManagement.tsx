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
    if (window.confirm('Are you sure you want to delete this health record?')) {
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('healthRecords')} - {dogName}
          </h3>
          <p className="text-gray-600">Track medical history and health information</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
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
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${getTypeColor(record.type)} rounded-lg flex items-center justify-center`}>
                    {getTypeIcon(record.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{record.title}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {record.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <Paperclip size={14} className="mr-1" />
                          {t('attachedDocuments')}
                        </p>
                        <ul className="mt-1 space-y-1">
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
                                {t('delete')}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
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
        title={editingRecord ? 'Edit Health Record' : 'Add Health Record'}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as HealthRecord['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="vet-visit">Vet Visit</option>
                <option value="medication">Medication</option>
                <option value="illness">Illness</option>
                <option value="injury">Injury</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
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
            label="Veterinarian (optional)"
            value={formData.veterinarian}
            onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Medication (optional)"
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
            />
            <Input
              label="Dosage (optional)"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            />
          </div>
          
          {/* File Upload */}
         {editingRecord && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Documents (optional)
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
                  {uploadedFiles.length} file(s) uploaded successfully
                </div>
              )}
            </div>
          )}

          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('loading') : t('save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};