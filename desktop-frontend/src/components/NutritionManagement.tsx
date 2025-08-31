import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Apple, Utensils, TrendingUp, Target, Award, Calendar, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { formatDate } from '../lib/utils';

interface NutritionManagementProps {
  dogId: string;
  dogName: string;
}

interface NutritionRecord {
  id: string;
  date: string;
  food_brand: string;
  food_type: string;
  daily_amount: number;
  calories_per_day: number;
  protein_percentage: number;
  fat_percentage: number;
  carb_percentage: number;
  supplements: string[];
  notes: string;
  weight_at_time: number;
}

interface MealPlan {
  id: string;
  meal_time: string;
  food_type: string;
  amount: number;
  calories: number;
}

export const NutritionManagement: React.FC<NutritionManagementProps> = ({
  dogId,
  dogName,
}) => {
  const { t } = useTranslation();
  const [nutritionRecords, setNutritionRecords] = useState<NutritionRecord[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMealPlanModalOpen, setIsMealPlanModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NutritionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'records' | 'meal-plan'>('overview');
  const [formData, setFormData] = useState({
    date: '',
    food_brand: '',
    food_type: '',
    daily_amount: '',
    calories_per_day: '',
    protein_percentage: '',
    fat_percentage: '',
    carb_percentage: '',
    supplements: '',
    notes: '',
    weight_at_time: '',
  });

  // Mock data for demonstration
  useEffect(() => {
    // In real app, this would load from API
    setNutritionRecords([
      {
        id: '1',
        date: '2024-01-15',
        food_brand: 'Royal Canin',
        food_type: 'Adult Large Breed',
        daily_amount: 300,
        calories_per_day: 1200,
        protein_percentage: 26,
        fat_percentage: 12,
        carb_percentage: 45,
        supplements: ['Omega-3', 'Glucosamine'],
        notes: 'Switched to large breed formula',
        weight_at_time: 28.5,
      },
      {
        id: '2',
        date: '2024-01-01',
        food_brand: 'Hill\'s Science Diet',
        food_type: 'Adult Chicken & Rice',
        daily_amount: 280,
        calories_per_day: 1150,
        protein_percentage: 24,
        fat_percentage: 14,
        carb_percentage: 42,
        supplements: ['Multivitamin'],
        notes: 'Good digestion, maintaining weight',
        weight_at_time: 28.2,
      },
    ]);

    setMealPlan([
      { id: '1', meal_time: '07:00', food_type: 'Dry Food', amount: 150, calories: 600 },
      { id: '2', meal_time: '12:00', food_type: 'Wet Food', amount: 100, calories: 300 },
      { id: '3', meal_time: '18:00', food_type: 'Dry Food', amount: 150, calories: 600 },
    ]);
  }, [dogId]);

  const handleCreate = () => {
    setEditingRecord(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      food_brand: '',
      food_type: '',
      daily_amount: '',
      calories_per_day: '',
      protein_percentage: '',
      fat_percentage: '',
      carb_percentage: '',
      supplements: '',
      notes: '',
      weight_at_time: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: NutritionRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      food_brand: record.food_brand,
      food_type: record.food_type,
      daily_amount: record.daily_amount.toString(),
      calories_per_day: record.calories_per_day.toString(),
      protein_percentage: record.protein_percentage.toString(),
      fat_percentage: record.fat_percentage.toString(),
      carb_percentage: record.carb_percentage.toString(),
      supplements: record.supplements.join(', '),
      notes: record.notes,
      weight_at_time: record.weight_at_time.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In real app, this would call API
      console.log('Saving nutrition record:', formData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving nutrition record:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentRecord = nutritionRecords[0]; // Latest record
  const totalCalories = mealPlan.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-2 p-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30">
        {[
          { id: 'overview', icon: Target, label: 'Overview' },
          { id: 'records', icon: FileText, label: 'Nutrition Records' },
          { id: 'meal-plan', icon: Utensils, label: 'Meal Plan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`tab-button flex items-center space-x-2 ${activeView === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Nutrition Stats */}
          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Apple className="mr-2 text-orange-500" />
              Current Nutrition Profile
            </h3>
            {currentRecord ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentRecord.daily_amount}g</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Daily Amount</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentRecord.calories_per_day}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Calories/Day</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Protein</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{currentRecord.protein_percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${currentRecord.protein_percentage}%` }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fat</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{currentRecord.fat_percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${currentRecord.fat_percentage}%` }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Carbohydrates</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{currentRecord.carb_percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${currentRecord.carb_percentage}%` }}></div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Food</div>
                  <div className="text-gray-900 dark:text-white font-semibold">{currentRecord.food_brand}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{currentRecord.food_type}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Apple size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 dark:text-gray-400">No nutrition data available</p>
              </div>
            )}
          </Card>

          {/* Daily Meal Plan */}
          <Card variant="gradient">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Utensils className="mr-2 text-green-500" />
                Today's Meal Plan
              </h3>
              <Button size="sm" variant="outline" onClick={() => setIsMealPlanModalOpen(true)}>
                Edit Plan
              </Button>
            </div>
            <div className="space-y-3">
              {mealPlan.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Utensils size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{meal.food_type}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{meal.meal_time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">{meal.amount}g</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{meal.calories} cal</div>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Daily Calories</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{totalCalories}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeView === 'records' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nutrition Records - {dogName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Track diet changes and nutrition history</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus size={20} className="mr-2" />
              Add Nutrition Record
            </Button>
          </div>

          {nutritionRecords.length === 0 ? (
            <Card className="text-center py-16">
              <Apple size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No nutrition records found</p>
              <Button onClick={handleCreate}>
                Add First Record
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {nutritionRecords.map((record) => (
                <Card key={record.id} variant="gradient">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Apple size={24} className="text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{record.food_brand}</h4>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            {record.food_type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Calendar size={16} className="mr-2" />
                            {formatDate(record.date)}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            Amount: {record.daily_amount}g/day
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            Calories: {record.calories_per_day}/day
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            Weight: {record.weight_at_time}kg
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm font-bold text-blue-600">{record.protein_percentage}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm font-bold text-green-600">{record.fat_percentage}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Fat</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-sm font-bold text-orange-600">{record.carb_percentage}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
                          </div>
                        </div>
                        
                        {record.supplements.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplements: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {record.supplements.map((supplement, index) => (
                                <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                  {supplement}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {record.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{record.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {/* handleDelete(record.id) */}}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'meal-plan' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Meal Plan - {dogName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Manage daily feeding schedule</p>
            </div>
            <Button onClick={() => setIsMealPlanModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Add Meal
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card variant="gradient">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Schedule</h4>
                <div className="space-y-3">
                  {mealPlan.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Utensils size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{meal.food_type}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{meal.meal_time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">{meal.amount}g</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{meal.calories} cal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <Card variant="gradient">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Summary</h4>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{totalCalories}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Calories</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{mealPlan.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Meals per Day</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">Optimal</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Feeding Schedule</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Add Nutrition Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Edit Nutrition Record' : 'Add Nutrition Record'}
        size="lg"
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
            <Input
              label="Weight at Time (kg)"
              type="number"
              step="0.1"
              value={formData.weight_at_time}
              onChange={(e) => setFormData({ ...formData, weight_at_time: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Food Brand"
              value={formData.food_brand}
              onChange={(e) => setFormData({ ...formData, food_brand: e.target.value })}
              required
            />
            <Input
              label="Food Type"
              value={formData.food_type}
              onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Daily Amount (g)"
              type="number"
              value={formData.daily_amount}
              onChange={(e) => setFormData({ ...formData, daily_amount: e.target.value })}
              required
            />
            <Input
              label="Calories per Day"
              type="number"
              value={formData.calories_per_day}
              onChange={(e) => setFormData({ ...formData, calories_per_day: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Protein %"
              type="number"
              step="0.1"
              value={formData.protein_percentage}
              onChange={(e) => setFormData({ ...formData, protein_percentage: e.target.value })}
              required
            />
            <Input
              label="Fat %"
              type="number"
              step="0.1"
              value={formData.fat_percentage}
              onChange={(e) => setFormData({ ...formData, fat_percentage: e.target.value })}
              required
            />
            <Input
              label="Carbs %"
              type="number"
              step="0.1"
              value={formData.carb_percentage}
              onChange={(e) => setFormData({ ...formData, carb_percentage: e.target.value })}
              required
            />
          </div>
          <Input
            label="Supplements (comma separated)"
            value={formData.supplements}
            onChange={(e) => setFormData({ ...formData, supplements: e.target.value })}
            placeholder="Omega-3, Glucosamine, Multivitamin"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Any observations about diet changes, preferences, etc."
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};