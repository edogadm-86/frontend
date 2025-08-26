import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Shield, Calendar, User } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';

interface VaccinationManagementProps {
  dogId: string;
  dogName: string;
}

interface Vaccination {
  id: string;
  vaccine_name: string;
  vaccine_type: string;
  date_given: string;
  next_due_date?: string;
  veterinarian: string;
  batch_number?: string;
  notes?: string;
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
  const [formData, setFormData] = useState({
    vaccine_name: '',
    vaccine_type: '',
    date_given: '',
    next_due_date: '',
    veterinarian: '',
    batch_number: '',
    notes: '',
  });

  useEffect(() => {
    loadVaccinations();
  }, [dogId]);

  const loadVaccinations = async () => {
    try {
      const response = await apiClient.getVaccinations(dogId);
      setVaccinations(response.vaccinations);
    } catch (error) {
      console.error('Error loading vaccinations:', error);
    }
  };

  const handleCreate = () => {
    setEditingVaccination(null);
    setFormData({
      vaccine_name: '',
      vaccine_type: '',
      date_given: '',
      next_due_date: '',
      veterinarian: '',
      batch_number: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (vaccination: Vaccination) => {
    setEditingVaccination(vaccination);
    setFormData({
      vaccine_name: vaccination.vaccine_name,
      vaccine_type: vaccination.vaccine_type,
      date_given: vaccination.date_given,
      next_due_date: vaccination.next_due_date || '',
      veterinarian: vaccination.veterinarian,
      batch_number: vaccination.batch_number || '',
      notes: vaccination.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingVaccination) {
        await apiClient.updateVaccination(dogId, editingVaccination.id, formData);
      } else {
        await apiClient.createVaccination(dogId, formData);
      }
      await loadVaccinations();
      setIsModalOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('vaccinations')} - {dogName}
          </h3>
          <p className="text-gray-600">Track vaccination records and due dates</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
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
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {vaccination.vaccine_name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {vaccination.vaccine_type}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        Given: {formatDate(vaccination.date_given)}
                      </div>
                      {vaccination.next_due_date && (
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          Due: {formatDate(vaccination.next_due_date)}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <User size={16} className="mr-2" />
                        {vaccination.veterinarian}
                      </div>
                      {vaccination.batch_number && (
                        <div className="text-gray-600">
                          Batch: {vaccination.batch_number}
                        </div>
                      )}
                    </div>
                    {vaccination.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        {vaccination.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(vaccination)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(vaccination.id)}
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
        title={editingVaccination ? 'Edit Vaccination' : 'Add Vaccination'}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Vaccine Name"
            value={formData.vaccine_name}
            onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
            required
          />
          <Input
            label="Vaccine Type"
            value={formData.vaccine_type}
            onChange={(e) => setFormData({ ...formData, vaccine_type: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date Given"
              type="date"
              value={formData.date_given}
              onChange={(e) => setFormData({ ...formData, date_given: e.target.value })}
              required
            />
            <Input
              label="Next Due Date (optional)"
              type="date"
              value={formData.next_due_date}
              onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
            />
          </div>
          <Input
            label="Veterinarian"
            value={formData.veterinarian}
            onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
            required
          />
          <Input
            label="Batch Number (optional)"
            value={formData.batch_number}
            onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>
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