import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { FileUpload } from './ui/FileUpload';
import { Vaccination } from '../types';
import { PlusCircle, Shield, AlertCircle, Trash2, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';


export const VaccinationTracker: React.FC = () => {
  const { currentDog, vaccinations, createVaccination, deleteVaccination } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vaccinationToDelete, setVaccinationToDelete] = useState<Vaccination | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    vaccineName: '',
    vaccineType: '',
    dateGiven: '',
    nextDueDate: '',
    veterinarian: '',
    batchNumber: '',
    notes: '',
  });

  const dogVaccinations = vaccinations.filter(v => v.dogId === currentDog?.id);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!currentDog) return;

    const vaccinationData = {
      dogId: currentDog.id,
      vaccineName: formData.vaccineName,
      vaccineType: formData.vaccineType,
      dateGiven: new Date(formData.dateGiven),
      nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate) : undefined,
      veterinarian: formData.veterinarian,
      batchNumber: formData.batchNumber || undefined,
      notes: formData.notes || undefined,
    };

    try {
      await createVaccination(vaccinationData);
      setIsModalOpen(false);
      setFormData({
        vaccineName: '',
        vaccineType: '',
        dateGiven: '',
        nextDueDate: '',
        veterinarian: '',
        batchNumber: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating vaccination:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVaccination = async () => {
    if (!vaccinationToDelete) return;
    
    setLoading(true);
    try {
      await deleteVaccination(vaccinationToDelete.dogId, vaccinationToDelete.id);
      setDeleteModalOpen(false);
      setVaccinationToDelete(null);
    } catch (error) {
      console.error('Error deleting vaccination:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (vaccination: Vaccination) => {
    setVaccinationToDelete(vaccination);
    setDeleteModalOpen(true);
  };

  const getVaccinationStatus = (vaccination: Vaccination) => {
    if (!vaccination.nextDueDate) return 'complete';
    
    const today = new Date();
    const dueDate = vaccination.nextDueDate;
    const warningDate = addDays(dueDate, -30);

    if (isBefore(today, warningDate)) return 'current';
    if (isBefore(today, dueDate)) return 'due-soon';
    return 'overdue';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'text-green-600 bg-green-50';
      case 'due-soon': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'current': return 'Current';
      case 'due-soon': return 'Due Soon';
      case 'overdue': return 'Overdue';
      default: return 'Complete';
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {t('Vaccinations')} - {currentDog.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <PlusCircle size={16} className="mr-1" />
          {t('Add Record')}
        </Button>
      </div>

      {dogVaccinations.length === 0 ? (
        <Card className="text-center py-8">
          <Shield size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500 mb-4">No vaccination records yet</p>
          <Button onClick={() => setIsModalOpen(true)}>{t('Add First Vaccination')}</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {dogVaccinations
            .sort((a, b) => new Date(b.dateGiven).getTime() - new Date(a.dateGiven).getTime())
            .map((vaccination) => {
              const status = getVaccinationStatus(vaccination);
              return (
                <Card key={vaccination.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {vaccination.vaccineName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{vaccination.vaccineType}</p>
                      <p className="text-xs text-gray-500">
                        {t('Given')}: {format(vaccination.dateGiven, 'MMM dd, yyyy')}
                      </p>
                      {vaccination.nextDueDate && (
                        <p className="text-xs text-gray-500">
                          {t('Next due')}: {format(vaccination.nextDueDate, 'MMM dd, yyyy')}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {t('Vet')}: {vaccination.veterinarian}
                      </p>
                      {vaccination.notes && (
                        <p className="text-xs text-gray-600 mt-1">{vaccination.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {status === 'overdue' && (
                        <AlertCircle size={20} className="text-red-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(vaccination);
                        }}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('Add Vaccination Record')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('Vaccine Name')}
            value={formData.vaccineName}
            onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
            placeholder={t('e.g., Rabies, DHPP')}
            required
          />
          <Input
            label={t('Vaccine Type')}
            value={formData.vaccineType}
            onChange={(e) => setFormData({ ...formData, vaccineType: e.target.value })}
            placeholder={t('e.g., Core, Non-core')}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Date Given')}
              type="date"
              value={formData.dateGiven}
              onChange={(e) => setFormData({ ...formData, dateGiven: e.target.value })}
              required
            />
            <Input
              label={t('Next Due Date')}
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
            />
          </div>
          <Input
            label={t('Veterinarian')}
            value={formData.veterinarian}
            onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
            required
          />
          <Input
            label={t('Batch Number (optional)')}
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Notes (optional)')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueblue-500 focus:border-transparent"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('Any additional notes...')}
            />
          </div>
          <FileUpload
            label={t('Attach Documents (optional)')}
            files={files}
            onFilesChange={setFiles}
            accept="image/*,.pdf,.doc,.docx"
            maxFiles={3}
          />
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

      {/* Delete Confirmation Modal */}
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
                {t('This will permanently delete the vaccination record for')} "{vaccinationToDelete?.vaccineName}".
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1"
            >
              {t('Cancel')}
            </Button>
            <Button
              onClick={handleDeleteVaccination}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={loading}
            >
              {loading ? t('Deleting...') : t('Delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};