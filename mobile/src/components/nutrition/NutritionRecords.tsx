import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from './../ui/Button';
import { Input } from './../ui/Input';
import { Card } from './../ui/Card';
import { Modal } from './../ui/Modal';
import { PlusCircle, Utensils, Trash2, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';
import { format } from 'date-fns';

type Nutrition = {
  id: string;
  dogId: string;
  foodName: string;
  brand: string;
  type: string;
  quantity: string;
  frequency: string;
  notes?: string;
  createdAt: Date;
};

export const NutritionRecords: React.FC = () => {
  const { currentDog } = useApp();
  const { t } = useTranslation();

  const [localRecords, setLocalRecords] = useState<Nutrition[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Nutrition | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    foodName: '',
    brand: '',
    type: '',
    quantity: '',
    frequency: '',
    notes: '',
  });

  const refreshRecords = async () => {
    if (!currentDog) return;
    try {
      const { nutritionRecords } = await apiClient.getNutritionRecords(currentDog.id);
      setLocalRecords(
        nutritionRecords.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt ?? n.created_at),
        }))
      );
    } catch (err) {
      console.error('Failed to load nutrition records:', err);
    }
  };

  useEffect(() => {
    refreshRecords();
  }, [currentDog?.id]);

  const dogNutritionRecords = useMemo(
    () => (currentDog ? localRecords.filter((r) => r.dogId === currentDog.id) : []),
    [localRecords, currentDog]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDog) return;
    setLoading(true);
    try {
      if (editingRecord) {
        await apiClient.updateNutritionRecord(currentDog.id, editingRecord.id, formData);
      } else {
        await apiClient.createNutritionRecord(currentDog.id, formData);
      }
      setIsModalOpen(false);
      setEditingRecord(null);
      setFormData({ foodName: '', brand: '', type: '', quantity: '', frequency: '', notes: '' });
      await refreshRecords();
    } catch (err) {
      console.error('Error saving nutrition record:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record: Nutrition) => {
    if (!currentDog) return;
    const ok = window.confirm(t('Are you sure you want to delete this nutrition record?'));
    if (!ok) return;
    try {
      await apiClient.deleteNutritionRecord(currentDog.id, record.id);
      await refreshRecords();
    } catch (err) {
      console.error('Error deleting nutrition record:', err);
    }
  };

  if (!currentDog) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <p className="text-gray-500">{t('Please select a dog to view nutrition records')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {t('Nutrition')} • {currentDog.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <PlusCircle size={16} className="mr-1" />
          {t('Add Record')}
        </Button>
      </div>

      {/* Records list */}
      {dogNutritionRecords.length === 0 ? (
        <Card className="text-center py-8">
          <Utensils size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500 mb-4">{t('No nutrition records yet')}</p>
          <Button onClick={() => setIsModalOpen(true)}>{t('Add First Record')}</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {dogNutritionRecords.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{record.foodName}</h3>
                  <p className="text-sm text-gray-600">{record.brand} • {record.type}</p>
                  <p className="text-xs text-gray-500">
                    {t('Quantity')}: {record.quantity}, {t('Frequency')}: {record.frequency}
                  </p>
                  {record.notes && (
                    <p className="text-xs text-gray-500 mt-1">{t('Notes')}: {record.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {t('Added')}: {format(record.createdAt, 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRecord(record);
                      setFormData({
                        foodName: record.foodName,
                        brand: record.brand,
                        type: record.type,
                        quantity: record.quantity,
                        frequency: record.frequency,
                        notes: record.notes || '',
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(record)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? t('Edit Nutrition Record') : t('Add Nutrition Record')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('Food Name')} value={formData.foodName} onChange={(e) => setFormData({ ...formData, foodName: e.target.value })} required />
          <Input label={t('Brand')} value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
          <Input label={t('Type')} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
          <Input label={t('Quantity')} value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
          <Input label={t('Frequency')} value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Notes')}</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('Saving...') : t('Save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
