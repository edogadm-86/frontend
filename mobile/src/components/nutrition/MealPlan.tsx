import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { PlusCircle, Calendar, Trash2, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';

type Meal = {
  id: string;
  dogId: string;
  time: string; // "08:00"
  food: string;
  quantity: string;
  notes?: string;
};

export const MealPlan: React.FC = () => {
  const { currentDog } = useApp();
  const { t } = useTranslation();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState({ time: '', food: '', quantity: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const refreshMeals = async () => {
    if (!currentDog) return;
    try {
      const { mealPlan } = await apiClient.getMealPlan(currentDog.id);
      setMeals(mealPlan);
    } catch (err) {
      console.error('Failed to load meal plan:', err);
    }
  };

  useEffect(() => {
    refreshMeals();
  }, [currentDog?.id]);

  const dogMeals = useMemo(
    () => (currentDog ? meals.filter((m) => m.dogId === currentDog.id) : []),
    [meals, currentDog]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDog) return;
    setLoading(true);
    try {
      if (editingMeal) {
        await apiClient.updateMeal(currentDog.id, editingMeal.id, formData);
      } else {
        await apiClient.createMeal(currentDog.id, formData);
      }
      setIsModalOpen(false);
      setEditingMeal(null);
      setFormData({ time: '', food: '', quantity: '', notes: '' });
      await refreshMeals();
    } catch (err) {
      console.error('Error saving meal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meal: Meal) => {
    if (!currentDog) return;
    const ok = window.confirm(t('Are you sure you want to delete this meal?'));
    if (!ok) return;
    try {
      await apiClient.deleteMeal(currentDog.id, meal.id);
      await refreshMeals();
    } catch (err) {
      console.error('Error deleting meal:', err);
    }
  };

  if (!currentDog) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <p className="text-gray-500">{t('Please select a dog to view meal plan')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {t('Meal Plan')} • {currentDog.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <PlusCircle size={16} className="mr-1" />
          {t('Add Meal')}
        </Button>
      </div>

      {dogMeals.length === 0 ? (
        <Card className="text-center py-8">
          <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500 mb-4">{t('No meals scheduled yet')}</p>
          <Button onClick={() => setIsModalOpen(true)}>{t('Add First Meal')}</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {dogMeals.map((meal) => (
            <Card key={meal.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{meal.food}</h3>
                  <p className="text-sm text-gray-600">
                    {t('Quantity')}: {meal.quantity}
                  </p>
                  <p className="text-xs text-gray-500">{t('Time')}: {meal.time}</p>
                  {meal.notes && <p className="text-xs text-gray-500 mt-1">{t('Notes')}: {meal.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingMeal(meal);
                      setFormData({ time: meal.time, food: meal.food, quantity: meal.quantity, notes: meal.notes || '' });
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(meal)}>
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
          setEditingMeal(null);
        }}
        title={editingMeal ? t('Edit Meal') : t('Add Meal')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('Time')} type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
          <Input label={t('Food')} value={formData.food} onChange={(e) => setFormData({ ...formData, food: e.target.value })} required />
          <Input label={t('Quantity')} value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
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
