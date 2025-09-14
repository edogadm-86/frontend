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

type NutritionRecord = {
  id: string;
  dog_id: string;
  date: string;
  food_brand: string;
  food_type: string;
  daily_amount: number;
  calories_per_day: number;
  protein_percentage: number;
  fat_percentage: number;
  carb_percentage: number;
  supplements: string[];
  notes?: string;
  weight_at_time: number;
  created_at: string;
};

export const NutritionRecords: React.FC = () => {
  const { currentDog } = useApp();
  const { t } = useTranslation();

  const [localRecords, setLocalRecords] = useState<NutritionRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NutritionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
  food_brand: '',
  food_type: '',
  daily_amount: '',
  calories_per_day: '',
  protein_percentage: '',
  fat_percentage: '',
  carb_percentage: '',
  supplements:  '',
  weight_at_time: '',
  notes: '',
});



  const refreshRecords = async () => {
    if (!currentDog) return;
    try {
      const { nutritionRecords } = await apiClient.getNutritionRecords(currentDog.id);
      setLocalRecords(nutritionRecords);
    } catch (err) {
      console.error('Failed to load nutrition records:', err);
    }
  };

  useEffect(() => {
    refreshRecords();
  }, [currentDog?.id]);

  const dogNutritionRecords = useMemo(
    () => (currentDog ? localRecords.filter((r) => r.dog_id === currentDog.id) : []),
    [localRecords, currentDog]
  );

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentDog) return;
  setLoading(true);

    const payload = {
    date: new Date().toISOString().split('T')[0],
    food_brand: formData.food_brand,
    food_type: formData.food_type,
    daily_amount: Number(formData.daily_amount) || 0,
    calories_per_day: Number(formData.calories_per_day) || 0,
    protein_percentage: Number(formData.protein_percentage) || 0,
    fat_percentage: Number(formData.fat_percentage) || 0,
    carb_percentage: Number(formData.carb_percentage) || 0,
    weight_at_time: Number(formData.weight_at_time) || 0,
    supplements: formData.supplements ? formData.supplements.split(',').map(s => s.trim()): [],
    notes: formData.notes,
  };


  try {
    if (editingRecord) {
      await apiClient.updateNutritionRecord(currentDog.id, editingRecord.id, payload);
    } else {
      await apiClient.createNutritionRecord(currentDog.id, payload);
    }
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormData({ food_brand: '', food_type: '', daily_amount: '', calories_per_day: '', protein_percentage: '',  fat_percentage: '',  carb_percentage: '', supplements: '', weight_at_time: '',notes: '' });
    await refreshRecords();
  } catch (err) {
    console.error('Error saving nutrition record:', err);
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (record: NutritionRecord) => {
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
                  <h3 className="font-semibold text-gray-900">{record.food_brand}</h3>
                  <p className="text-sm text-gray-600">{record.food_type}</p>
                  <p className="text-xs text-gray-500">
                    {t('Amount')}: {record.daily_amount}g, {t('Calories')}: {record.calories_per_day}
                  </p>
                  {record.notes && (
                    <p className="text-xs text-gray-500 mt-1">{t('Notes')}: {record.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {t('Added')}: {format(new Date(record.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRecord(record);
                      setFormData({
                      food_brand: record.food_brand,
                      food_type: record.food_type,
                      daily_amount: record.daily_amount.toString(),
                      calories_per_day: record.calories_per_day.toString(),
                      protein_percentage: record.protein_percentage.toString(),
                      fat_percentage: record.fat_percentage.toString(),
                      carb_percentage: record.carb_percentage.toString(),
                      weight_at_time: record.weight_at_time.toString(),
                      supplements: record.supplements?.join(', ') || '',   // 👈 force string
                      notes: record.notes || '',
                    });

                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(record)}>
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
          <Input label={t('Food Brand')} value={formData.food_brand} onChange={(e) => setFormData({ ...formData, food_brand: e.target.value })} required />
          <Input label={t('Food Type')} value={formData.food_type} onChange={(e) => setFormData({ ...formData, food_type: e.target.value })} />
          <Input label={t('Daily Amount (g)')} value={formData.daily_amount} onChange={(e) => setFormData({ ...formData, daily_amount: e.target.value })} />
          <Input label={t('Calories per Day')} value={formData.calories_per_day} onChange={(e) => setFormData({ ...formData, calories_per_day: e.target.value })} />
          <Input label={t('Protein %')} value={formData.protein_percentage} onChange={(e) => setFormData({ ...formData, protein_percentage: e.target.value })} />
          <Input label={t('Fat %')} value={formData.fat_percentage} onChange={(e) => setFormData({ ...formData, fat_percentage: e.target.value })} />
          <Input label={t('Carbs %')} value={formData.carb_percentage} onChange={(e) => setFormData({ ...formData, carb_percentage: e.target.value })} />
          <Input label={t('Weight at Time (kg)')} value={formData.weight_at_time} onChange={(e) => setFormData({ ...formData, weight_at_time: e.target.value })} />
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
