import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Heart, Calendar, User, Pill, Paperclip } from 'lucide-react';
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

const cardClass = 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-[#c1c7d3] mb-1';
const inputSelectClass = 'w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c1f] text-gray-900 dark:text-[#e2e2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] focus:border-transparent text-sm';

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

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'vet-visit': return { icon: <User size={20} className="text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-100 dark:bg-blue-900/30', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
      case 'medication': return { icon: <Pill size={20} className="text-green-600 dark:text-green-400" />, bg: 'bg-green-100 dark:bg-green-900/30', badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' };
      case 'illness': return { icon: <Heart size={20} className="text-red-600 dark:text-red-400" />, bg: 'bg-red-100 dark:bg-red-900/30', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
      case 'injury': return { icon: <Heart size={20} className="text-orange-600 dark:text-orange-400" />, bg: 'bg-orange-100 dark:bg-orange-900/30', badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' };
      default: return { icon: <Heart size={20} className="text-gray-500 dark:text-[#8b919d]" />, bg: 'bg-gray-100 dark:bg-[#282a2d]', badge: 'bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#c1c7d3]' };
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e2e2e6]">
            {t('healthRecords')} — {dogName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('trackMedicalHistoryAndHealthInformation')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          {t('addHealthRecord')}
        </button>
      </div>

      {healthRecords.length === 0 ? (
        <div className={`${cardClass} text-center py-16`}>
          <Heart size={48} className="mx-auto mb-4 text-gray-300 dark:text-[#414751]" />
          <p className="text-gray-500 dark:text-[#8b919d] mb-4">No health records found</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('addHealthRecord')}
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {healthRecords.map((record) => {
            const typeConfig = getTypeConfig(record.type);
            return (
              <div key={record.id} className={cardClass}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-11 h-11 ${typeConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {typeConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-[#e2e2e6] truncate max-w-full">
                          {record.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${typeConfig.badge}`}>
                          {record.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-[#8b919d] mb-3 line-clamp-3 sm:line-clamp-none">
                        {record.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-gray-500 dark:text-[#8b919d] gap-1.5">
                          <Calendar size={14} />
                          {formatDate(record.date)}
                        </div>
                        {record.veterinarian && (
                          <div className="flex items-center text-gray-500 dark:text-[#8b919d] gap-1.5">
                            <User size={14} />
                            {record.veterinarian}
                          </div>
                        )}
                        {record.medication && (
                          <div className="flex items-center text-gray-500 dark:text-[#8b919d] gap-1.5">
                            <Pill size={14} />
                            {record.medication}
                            {record.dosage && ` — ${record.dosage}`}
                          </div>
                        )}
                        {record.documents && record.documents.length > 0 && (
                          <div className="sm:col-span-2 mt-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-[#c1c7d3] flex items-center gap-1.5 mb-1">
                              <Paperclip size={13} />
                              {t('attachedDocuments')}
                            </p>
                            <ul className="space-y-1">
                              {record.documents.map((doc, i) => (
                                <li key={doc.id || i} className="flex items-center justify-between">
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#005da7] dark:text-[#a4c9ff] hover:underline text-sm"
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
                  </div>
                  <div className="flex gap-1 sm:justify-end sm:items-start">
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-2 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
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
              <label className={labelClass}>{t('type')}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as HealthRecord['type'] })}
                className={inputSelectClass}
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
            <label className={labelClass}>{t('description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputSelectClass}
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

          {editingRecord && (
            <div>
              <label className={labelClass}>{t('attachedDocuments')}</label>
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
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  {uploadedFiles.length} {t('filesUploaded')}
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
