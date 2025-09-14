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
  dog_id: string;
  meal_time: string;
  food_type: string;
  amount: number;
  calories: number;
  notes?: string;
  nutrition_record_id: string;
};

export const MealPlan: React.FC = () => {
  const { currentDog } = useApp();
  const { t } = useTranslation();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState({ meal_time: '', food_type: '', amount: '', calories: '' });
  const [loading, setLoading] = useState(false);

  const refreshMeals = async () => {
    if (!currentDog) return;
    try {
      const { mealPlan } = await apiClient.getMealPlan(currentDog.id);
      const { nutritionRecords } = await apiClient.getNutritionRecords(currentDog.id);
      setMeals(mealPlan);
      setRecords(nutritionRecords);
    } catch (err) {
      console.error('Failed to load meal plan:', err);
    }
  };

  useEffect(() => {
    refreshMeals();
  }, [currentDog?.id]);

  const dogMeals = useMemo(
    () => (currentDog ? meals.filter((m) => m.dog_id === currentDog.id) : []),
    [meals, currentDog]
  );


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentDog) return;
  setLoading(true);

  try {
    // grab the latest nutrition record
    const { nutritionRecords } = await apiClient.getNutritionRecords(currentDog.id);
    const latestRecord = nutritionRecords[0];
    if (!latestRecord) {
      alert("Please create a nutrition record first.");
      return;
    }

    const payload = {
      mealPlan: {
        meal_time: formData.meal_time,
        food_type: formData.food_type,
        amount: Number(formData.amount) || 0,
        calories: Number(formData.calories) || 0,
        nutrition_record_id: editingMeal?.nutrition_record_id || latestRecord.id,
      }
    };

    if (editingMeal) {
      await apiClient.updateMealPlan(currentDog.id, editingMeal.id, payload);
    } else {
      await apiClient.createMealPlan(currentDog.id, payload);
    }

    setIsModalOpen(false);
    setEditingMeal(null);
    setFormData({ meal_time: '', food_type: '', amount: '', calories: '' });
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
      await apiClient.deleteMealPlan(currentDog.id, meal.id);
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
                  <h3 className="font-semibold text-gray-900">{meal.food_type}</h3>
                  <p className="text-sm text-gray-600">
                    {t('Amount')}: {meal.amount}g, {t('Calories')}: {meal.calories}
                  </p>
                  <p className="text-xs text-gray-500">{t('Time')}: {meal.meal_time}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingMeal(meal);
                      setFormData({
                        meal_time: meal.meal_time,
                        food_type: meal.food_type,
                        amount: meal.amount.toString(),
                        calories: meal.calories.toString(),
                      });
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
          <Input label={t('Time')} type="time" value={formData.meal_time} onChange={(e) => setFormData({ ...formData, meal_time: e.target.value })} required />
          <Input label={t('Food')} value={formData.food_type} onChange={(e) => setFormData({ ...formData, food_type: e.target.value })} required />
          <Input label={t('Amount (g)')} value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
          <Input label={t('Calories')} value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: e.target.value })} />
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
