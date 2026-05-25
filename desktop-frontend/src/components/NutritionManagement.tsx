import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Apple, Utensils, TrendingUp, Target, Award, Calendar, Clock, FileText } from 'lucide-react';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';
import { useApp } from '../context/AppContext';

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
  meals?: MealPlan[];
}

interface MealPlan {
  id: string;
  meal_time: string;
  food_type: string;
  amount: number;
  calories: number;
  nutrition_record_id: string;
  is_active: string;
}

const cardClass = 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5 sm:p-6';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-[#c1c7d3] mb-1';
const inputSelectClass = 'w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c1f] text-gray-900 dark:text-[#e2e2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] focus:border-transparent text-sm';

export const NutritionManagement: React.FC<NutritionManagementProps> = ({
  dogId,
  dogName,
}) => {
  const { t } = useTranslation();
  const { nutritionRecords: allNutritionRecords, mealPlans: allMealPlans } = useApp();
  const [nutritionRecords, setNutritionRecords] = useState<NutritionRecord[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [nutritionStats, setNutritionStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMealPlanModalOpen, setIsMealPlanModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NutritionRecord | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomPlanModal, setShowCustomPlanModal] = useState(false);
  const [customMeals, setCustomMeals] = useState<MealPlan[]>([]);
  const [mealModalContext, setMealModalContext] = useState<'wizard' | 'normal'>('normal');
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
  const [mealFormData, setMealFormData] = useState({
    meal_time: '',
    food_type: '',
    amount: '',
    calories: '',
    nutrition_record_id: '',
    is_active: 'true',
  });

  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const normalizedTime = mealFormData.meal_time.slice(0, 5);

  const nutritionTemplates = [
    {
      name: t('puppyGrowthPlan'),
      description: t('highProteinDietGrowingPuppies'),
      nutrition: {
        calories_per_day: 1200,
        protein_percentage: 28,
        fat_percentage: 16,
        carb_percentage: 56,
        daily_amount: 500,
        food_brand: "Puppy Choice",
        food_type: t('puppyKibble'),
        date: new Date().toISOString().split("T")[0],
        supplements: [t('supplementOmega3')],
        notes: t('puppyNotes'),
        weight_at_time: 5,
      },
      meals: [
        { meal_time: "08:00", food_type: t('puppyKibble'), amount: 150, calories: 400 },
        { meal_time: "13:00", food_type: t('wetFood'), amount: 200, calories: 400 },
        { meal_time: "19:00", food_type: t('kibbleTreats'), amount: 150, calories: 400 },
      ],
    },
    {
      name: t('adultMaintenancePlan'),
      description: t('balancedNutritionHealthyAdults'),
      nutrition: {
        calories_per_day: 900,
        protein_percentage: 24,
        fat_percentage: 14,
        carb_percentage: 62,
        daily_amount: 400,
        food_brand: "DoggoLife",
        food_type: "Adult Dry Food",
        date: new Date().toISOString().split("T")[0],
        supplements: [],
        notes: t('adultNotes'),
        weight_at_time: 20,
      },
      meals: [
        { meal_time: "09:00", food_type: t('dryFood'), amount: 200, calories: 450 },
        { meal_time: "18:00", food_type: t('wetFood'), amount: 200, calories: 450 },
      ],
    },
    {
      name: t('seniorPlanName'),
      description: t('seniorPlanDesc'),
      nutrition: {
        calories_per_day: 700,
        protein_percentage: 22,
        fat_percentage: 12,
        carb_percentage: 66,
        daily_amount: 350,
        food_brand: "Golden Years",
        food_type: "Senior Formula",
        date: new Date().toISOString().split("T")[0],
        supplements: ["Glucosamine", "Omega-3"],
        notes: t('seniorNotes'),
        weight_at_time: 18,
      },
      meals: [
        { meal_time: "08:30", food_type: t('dryFood'), amount: 175, calories: 350 },
        { meal_time: "18:30", food_type: t('streemedVeggiesDryFood'), amount: 175, calories: 350 },
      ],
    },
    {
      name: t('activePlanName'),
      description: t('activePlanDesc'),
      nutrition: {
        calories_per_day: 1500,
        protein_percentage: 30,
        fat_percentage: 18,
        carb_percentage: 52,
        daily_amount: 600,
        food_brand: "ProActive",
        food_type: "Performance Formula",
        date: new Date().toISOString().split("T")[0],
        supplements: ["Electrolytes"],
        notes: t('activeNotes'),
        weight_at_time: 25,
      },
      meals: [
        { meal_time: "07:00", food_type: t('dryFood'), amount: 200, calories: 500 },
        { meal_time: "12:00", food_type: t('proteinMix'), amount: 200, calories: 500 },
        { meal_time: "19:00", food_type: t('dryFoodWetMix'), amount: 200, calories: 500 },
      ],
    },
    {
      name: t('weightPlanName'),
      description: t('weightPlanDesc'),
      nutrition: {
        calories_per_day: 600,
        protein_percentage: 26,
        fat_percentage: 10,
        carb_percentage: 64,
        daily_amount: 300,
        food_brand: "SlimPaws",
        food_type: "Light Formula",
        date: new Date().toISOString().split("T")[0],
        supplements: ["L-Carnitine"],
        notes: t('weightNotes'),
        weight_at_time: 30,
      },
      meals: [
        { meal_time: "09:00", food_type: t('lightKibble'), amount: 150, calories: 300 },
        { meal_time: "18:00", food_type: t('lightWetFood'), amount: 150, calories: 300 },
      ],
    },
  ];

  useEffect(() => {
    loadNutritionData();
  }, [dogId]);

  const loadNutritionData = async () => {
    try {
      const [recordsRes, statsRes] = await Promise.all([
        apiClient.getNutritionRecords(dogId),
        apiClient.getNutritionStats(dogId),
      ]);
      setNutritionRecords(recordsRes.nutritionRecords);
      setNutritionStats(statsRes);
      setMealPlan(statsRes.mealPlan || []);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    }
  };

  const applyTemplate = async (template: any) => {
    try {
      setLoading(true);
      const recordRes = await apiClient.createNutritionRecord(dogId, template.nutrition);
      const recordId = recordRes.nutritionRecord.id;
      await apiClient.updateEntireMealPlan(dogId, {
        mealPlan: template.meals,
        nutrition_record_id: recordId,
      });
      await loadNutritionData();
      setShowTemplatesModal(false);
    } catch (error) {
      console.error("Error applying template:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateMeal = () => {
    setEditingMeal(null);
    setMealFormData({
      meal_time: '',
      food_type: '',
      amount: '',
      calories: '',
      nutrition_record_id: '',
      is_active: 'true',
    });
    setMealModalContext('normal');
    setIsMealPlanModalOpen(true);
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

  const handleEditMeal = (meal: MealPlan) => {
    setEditingMeal(meal);
    setMealFormData({
      meal_time: meal.meal_time,
      food_type: meal.food_type,
      amount: meal.amount.toString(),
      calories: meal.calories.toString(),
      nutrition_record_id: meal.nutrition_record_id,
      is_active: 'true',
    });
    setMealModalContext('normal');
    setIsMealPlanModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const nutritionData = {
        ...formData,
        daily_amount: parseFloat(formData.daily_amount),
        calories_per_day: parseInt(formData.calories_per_day),
        protein_percentage: parseFloat(formData.protein_percentage),
        fat_percentage: parseFloat(formData.fat_percentage),
        carb_percentage: parseFloat(formData.carb_percentage),
        supplements: formData.supplements.split(',').map(s => s.trim()).filter(s => s),
        weight_at_time: parseFloat(formData.weight_at_time),
      };
      if (editingRecord) {
        await apiClient.updateNutritionRecord(dogId, editingRecord.id, nutritionData);
      } else {
        await apiClient.createNutritionRecord(dogId, nutritionData);
      }
      await loadNutritionData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving nutrition record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealSubmit = async (e: React.FormEvent, isCustom?: boolean) => {
    e.preventDefault();
    setLoading(true);
    try {
      const mealData = {
        meal_time: normalizedTime,
        food_type: mealFormData.food_type,
        amount: parseFloat(mealFormData.amount),
        calories: parseInt(mealFormData.calories),
        nutrition_record_id: mealFormData.nutrition_record_id,
        is_active: 'true',
      };
      if (mealModalContext === 'wizard') {
        setCustomMeals((prev) => [
          ...prev,
          { ...mealData, id: Date.now().toString() } as MealPlan,
        ]);
      } else {
        if (editingMeal) {
          await apiClient.updateMealPlan(dogId, editingMeal.id, {
            ...mealData,
            nutrition_record_id: editingMeal.nutrition_record_id,
            is_active: true,
          });
        } else {
          await apiClient.createMealPlan(dogId, {
            ...mealData,
            nutrition_record_id: editingRecord?.id,
          });
        }
        await loadNutritionData();
      }
      setIsMealPlanModalOpen(false);
      if (mealModalContext === 'wizard') {
        setShowCustomPlanModal(true);
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (window.confirm(t('deleteMealConfirm'))) {
      try {
        await apiClient.deleteMealPlan(dogId, mealId);
        await loadNutritionData();
      } catch (error) {
        console.error('Error deleting meal:', error);
      }
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm(t('deleteRecordConfirm'))) {
      try {
        await apiClient.deleteNutritionRecord(dogId, recordId);
        await loadNutritionData();
      } catch (error) {
        console.error('Error deleting nutrition record:', error);
      }
    }
  };

  const currentRecord = nutritionRecords.length > 0
    ? [...nutritionRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : undefined;
  const totalCalories = nutritionStats?.dailyTotals?.calories || mealPlan.reduce((sum, meal) => sum + meal.calories, 0);
  const totalAmount = nutritionStats?.dailyTotals?.amount || mealPlan.reduce((sum, meal) => sum + meal.amount, 0);

  const tabs = [
    { id: 'overview', icon: Target, label: t('overview') },
    { id: 'records', icon: FileText, label: t('nutritionRecords') },
    { id: 'meal-plan', icon: Utensils, label: t('mealPlan') },
  ];

  return (
    <div className="space-y-5">
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-1.5">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const active = activeView === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={[
                  'shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                    : 'text-gray-600 dark:text-[#c1c7d3] hover:bg-gray-100 dark:hover:bg-[#282a2d]',
                ].join(' ')}
              >
                <Icon size={16} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Current Nutrition Stats */}
          <div className={cardClass}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e2e2e6] flex items-center gap-2">
                <Apple size={20} className="text-orange-500" />
                {t('currentNutritionProfile')}
              </h3>
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all"
              >
                {t('chooseTemplate')}
              </button>
            </div>

            {currentRecord || mealPlan.length > 0 || nutritionStats?.hasData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-[#282a2d] rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-[#e2e2e6]">
                      {currentRecord?.daily_amount || Math.round(totalAmount)}g
                    </div>
                    <div className="text-sm text-gray-500 dark:text-[#8b919d]">{t('dailyAmount')}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-[#282a2d] rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-[#e2e2e6]">
                      {currentRecord?.calories_per_day || totalCalories}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-[#8b919d]">{t('caloriesDay')}</div>
                  </div>
                </div>

                {currentRecord && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-[#c1c7d3]">{t('protein')}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">{currentRecord.protein_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${currentRecord.protein_percentage}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-[#c1c7d3]">{t('fat')}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">{currentRecord.fat_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${currentRecord.fat_percentage}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-[#c1c7d3]">{t('carbohydrates')}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">{currentRecord.carb_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${currentRecord.carb_percentage}%` }}></div>
                    </div>
                  </div>
                )}

                {currentRecord && (
                  <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="text-sm font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('currentFood')}</div>
                    <div className="text-gray-900 dark:text-[#e2e2e6] font-semibold">{currentRecord.food_brand}</div>
                    <div className="text-sm text-gray-500 dark:text-[#8b919d]">{currentRecord.food_type}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Apple size={32} className="mx-auto mb-2 text-gray-300 dark:text-[#414751]" />
                <p className="text-gray-500 dark:text-[#8b919d]">{t('noNutritionData')}</p>
              </div>
            )}
          </div>

          {/* Daily Meal Plan */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e2e2e6] flex items-center gap-2">
                <Utensils size={20} className="text-green-500" />
                {t('todaysMealPlan')}
              </h3>
              <button
                onClick={() => setActiveView('meal-plan')}
                className="px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all"
              >
                {t('editPlan')}
              </button>
            </div>
            <div className="space-y-3">
              {mealPlan.map((meal) => (
                <div key={meal.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#282a2d] rounded-xl group">
                  <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Utensils size={15} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-[#e2e2e6] truncate text-sm">{meal.food_type}</div>
                    <div className="text-xs text-gray-500 dark:text-[#8b919d]">{meal.meal_time}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-gray-900 dark:text-[#e2e2e6] text-sm">{meal.amount}g</div>
                    <div className="text-xs text-gray-500 dark:text-[#8b919d]">{meal.calories} cal</div>
                  </div>
                  <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditMeal(meal)}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] hover:bg-gray-100 dark:hover:bg-[#1e2023] transition-all"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {mealPlan.length === 0 && (
                <div className="text-center py-8">
                  <Utensils size={32} className="mx-auto mb-2 text-gray-300 dark:text-[#414751]" />
                  <p className="text-gray-500 dark:text-[#8b919d] mb-4 text-sm">{t('noMealPlan')}</p>
                  <button
                    onClick={handleCreateMeal}
                    className="px-3 py-1.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    {t('addFirstMeal')}
                  </button>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-[#c1c7d3] text-sm">{t('totalDailyCalories')}</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">{totalCalories}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'records' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e2e2e6]">
                {t('nutritionRecords')} — {dogName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('trackNutritionHistory')}</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              {t('addNutritionRecord')}
            </button>
          </div>

          {nutritionRecords.length === 0 ? (
            <div className={`${cardClass} text-center py-16`}>
              <Apple size={48} className="mx-auto mb-4 text-gray-300 dark:text-[#414751]" />
              <p className="text-gray-500 dark:text-[#8b919d] mb-4">{t('noRecordsFound')}</p>
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t('addFirstRecord')}
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {nutritionRecords.map((record) => (
                <div key={record.id} className={cardClass}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Apple size={20} className="text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-[#e2e2e6] truncate max-w-full">{record.food_brand}</h4>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#c1c7d3] text-xs rounded-full">
                            {record.food_type}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-3">
                          <div className="flex items-center text-gray-500 dark:text-[#8b919d] gap-1.5">
                            <Calendar size={13} />
                            {formatDate(record.date)}
                          </div>
                          <div className="text-gray-500 dark:text-[#8b919d]">
                            {t('amountGrams')}: {record.daily_amount} {t('gram')}/{t('day')}
                          </div>
                          <div className="text-gray-500 dark:text-[#8b919d]">
                            {t('calories')}: {record.calories_per_day}/{t('day')}
                          </div>
                          <div className="text-gray-500 dark:text-[#8b919d]">
                            {t('weight')}: {record.weight_at_time}{t('kg')}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{record.protein_percentage}%</div>
                            <div className="text-xs text-gray-500 dark:text-[#8b919d]">{t('protein')}</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">{record.fat_percentage}%</div>
                            <div className="text-xs text-gray-500 dark:text-[#8b919d]">{t('fat')}</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-sm font-bold text-orange-600 dark:text-orange-400">{record.carb_percentage}%</div>
                            <div className="text-xs text-gray-500 dark:text-[#8b919d]">{t('carbs')}</div>
                          </div>
                        </div>

                        {record.supplements.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-[#c1c7d3]">{t('supplements')}: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {record.supplements.map((supplement, index) => (
                                <span key={index} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                  {supplement}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.notes && (
                          <p className="text-sm text-gray-500 dark:text-[#8b919d] line-clamp-3 sm:line-clamp-none">
                            {record.notes}
                          </p>
                        )}
                        {record.meals && record.meals.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-gray-700 dark:text-[#c1c7d3] mb-2">
                              {t('meals')}:
                            </h5>
                            <ul className="space-y-1">
                              {record.meals.map((meal: any) => (
                                <li key={meal.id} className="text-sm text-gray-500 dark:text-[#8b919d]">
                                  🍽 {meal.meal_time} — {meal.food_type} ({meal.amount}{t('gram')}, {meal.calories} {t('cal')})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 sm:items-start">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'meal-plan' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e2e2e6]">
                {t('mealPlan')} — {dogName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('manageDailyFeedingSchedule')}</p>
            </div>
            <button
              onClick={() => setIsMealPlanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              {t('addMeal')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <div className={cardClass}>
                <h4 className="font-semibold text-gray-900 dark:text-[#e2e2e6] mb-4">{t('dailySchedule')}</h4>
                <div className="space-y-3">
                  {mealPlan.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282a2d] rounded-xl group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Utensils size={18} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-[#e2e2e6] text-sm">{meal.food_type}</div>
                          <div className="text-xs text-gray-500 dark:text-[#8b919d]">{meal.meal_time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-[#e2e2e6] text-sm">{meal.amount}g</div>
                        <div className="text-xs text-gray-500 dark:text-[#8b919d]">{meal.calories} cal</div>
                      </div>
                      <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditMeal(meal)}
                          className="p-2 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] hover:bg-gray-100 dark:hover:bg-[#1e2023] transition-all"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="p-2 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {mealPlan.length === 0 && (
                    <div className="text-center py-8">
                      <Utensils size={32} className="mx-auto mb-2 text-gray-300 dark:text-[#414751]" />
                      <p className="text-gray-500 dark:text-[#8b919d] mb-4 text-sm">{t('noMealsScheduled')}</p>
                      <button
                        onClick={handleCreateMeal}
                        className="px-4 py-2 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        {t('addFirstMeal')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className={cardClass}>
                <h4 className="font-semibold text-gray-900 dark:text-[#e2e2e6] mb-4">{t('dailySummary')}</h4>
                <div className="space-y-3">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-[#005da7] dark:text-[#a4c9ff]">{totalCalories}</div>
                    <div className="text-sm text-gray-500 dark:text-[#8b919d]">{t('totalCalories')}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{mealPlan.length}</div>
                    <div className="text-sm text-gray-500 dark:text-[#8b919d]">{t('mealsPerDay')}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{t('optimal')}</div>
                    <div className="text-sm text-gray-500 dark:text-[#8b919d]">{t('feedingSchedule')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Nutrition Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? t('editNutritionRecord') : t('addNutritionRecordModal')}
        size="lg"
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
            <Input
              label={t('weightAtTime')}
              type="number"
              step="0.1"
              value={formData.weight_at_time}
              onChange={(e) => setFormData({ ...formData, weight_at_time: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('foodBrand')}
              value={formData.food_brand}
              onChange={(e) => setFormData({ ...formData, food_brand: e.target.value })}
              required
            />
            <Input
              label={t('foodType')}
              value={formData.food_type}
              onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('dailyAmountGrams')}
              type="number"
              value={formData.daily_amount}
              onChange={(e) => setFormData({ ...formData, daily_amount: e.target.value })}
              required
            />
            <Input
              label={t('caloriesPerDay')}
              type="number"
              value={formData.calories_per_day}
              onChange={(e) => setFormData({ ...formData, calories_per_day: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={t('proteinPercent')}
              type="number"
              step="0.1"
              value={formData.protein_percentage}
              onChange={(e) => setFormData({ ...formData, protein_percentage: e.target.value })}
              required
            />
            <Input
              label={t('fatPercent')}
              type="number"
              step="0.1"
              value={formData.fat_percentage}
              onChange={(e) => setFormData({ ...formData, fat_percentage: e.target.value })}
              required
            />
            <Input
              label={t('carbsPercent')}
              type="number"
              step="0.1"
              value={formData.carb_percentage}
              onChange={(e) => setFormData({ ...formData, carb_percentage: e.target.value })}
              required
            />
          </div>
          {(() => {
            const total = Math.round(
              (parseFloat(formData.protein_percentage) || 0) +
              (parseFloat(formData.fat_percentage) || 0) +
              (parseFloat(formData.carb_percentage) || 0)
            );
            if (total === 0) return null;
            const ok = total === 100;
            return (
              <p className={`text-xs font-medium px-3 py-2 rounded-lg ${ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
                {ok ? '✓ 100%' : t('macroTotalWarning', { total })}
              </p>
            );
          })()}
          <Input
            label={t('supplementsPlaceholder')}
            value={formData.supplements}
            onChange={(e) => setFormData({ ...formData, supplements: e.target.value })}
            placeholder={t('supplementsExPlaceholder')}
          />
          <div>
            <label className={labelClass}>{t('notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputSelectClass}
              rows={3}
              placeholder={t('notesPlaceholder')}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t('saving') : t('saveRecord')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Meal Plan Modal */}
      <Modal
        isOpen={isMealPlanModalOpen}
        onClose={() => {
          setIsMealPlanModalOpen(false);
          if (mealModalContext === 'wizard') {
            setShowCustomPlanModal(true);
          }
        }}
        title={editingMeal ? t('editMeal') : t('addMealModal')}
        size="md"
      >
        <form onSubmit={(e) => handleMealSubmit(e, !showCustomPlanModal)} className="space-y-4">
          <Input
            label={t('mealTime')}
            type="time"
            value={mealFormData.meal_time}
            onChange={(e) => setMealFormData({ ...mealFormData, meal_time: e.target.value })}
            required
          />
          <Input
            label={t('foodType')}
            value={mealFormData.food_type}
            onChange={(e) => setMealFormData({ ...mealFormData, food_type: e.target.value })}
            placeholder={t('foodTypePlaceholder')}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('amountGrams')}
              type="number"
              step="0.1"
              value={mealFormData.amount}
              onChange={(e) => setMealFormData({ ...mealFormData, amount: e.target.value })}
              required
            />
            <Input
              label={t('calories')}
              type="number"
              value={mealFormData.calories}
              onChange={(e) => setMealFormData({ ...mealFormData, calories: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsMealPlanModalOpen(false);
                if (mealModalContext === 'wizard') {
                  setShowCustomPlanModal(true);
                }
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t('saving') : t('saveMeal')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Nutrition Templates Modal */}
      <Modal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        title={t('nutritionPlanTemplates')}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-500 dark:text-[#8b919d] mb-4 text-sm">
            {t('choosePreDesignedPlan')}
          </p>
          <div className="grid gap-3">
            {nutritionTemplates.map((template, index) => (
              <div key={index} className="bg-gray-50 dark:bg-[#282a2d] border border-gray-100 dark:border-white/5 rounded-xl p-4 hover:border-[#005da7] dark:hover:border-[#a4c9ff] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-[#e2e2e6] mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-3">{template.description}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-[#c1c7d3]">{t('dailyCalories')}: </span>
                        <span className="text-gray-900 dark:text-[#e2e2e6]">{template.nutrition.calories_per_day}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-[#c1c7d3]">{t('meals')}: </span>
                        <span className="text-gray-900 dark:text-[#e2e2e6]">{template.meals.length}/{t('day')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-[#c1c7d3]">{t('protein')}: </span>
                        <span className="text-gray-900 dark:text-[#e2e2e6]">{template.nutrition.protein_percentage}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-[#c1c7d3]">{t('fat')}: </span>
                        <span className="text-gray-900 dark:text-[#e2e2e6]">{template.nutrition.fat_percentage}%</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => applyTemplate(template)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
                  >
                    {loading ? t('applying') : t('apply')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setShowTemplatesModal(false);
              setShowCustomPlanModal(true);
              setCustomMeals([]);
              setFormData({
                date: new Date().toISOString().split("T")[0],
                food_brand: "",
                food_type: "",
                daily_amount: "",
                calories_per_day: "",
                protein_percentage: "",
                fat_percentage: "",
                carb_percentage: "",
                supplements: "",
                notes: "",
                weight_at_time: "",
              });
            }}
            className="w-full border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-6 text-center text-gray-500 dark:text-[#8b919d] hover:border-[#005da7] dark:hover:border-[#a4c9ff] hover:text-[#005da7] dark:hover:text-[#a4c9ff] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span className="font-medium">{t('createCustomPlan')}</span>
          </button>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowTemplatesModal(false)}
              className="px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Custom Plan Modal */}
      <Modal
        isOpen={showCustomPlanModal}
        onClose={() => setShowCustomPlanModal(false)}
        title={t('createCustomNutritionPlan')}
        size="lg"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!formData.food_brand.trim() || !formData.food_type.trim()) {
              alert("Please fill in Food Brand and Food Type");
              return;
            }
            if (!formData.calories_per_day || parseInt(formData.calories_per_day) <= 0) {
              alert("Calories per Day must be greater than 0");
              return;
            }
            if (!formData.daily_amount || parseFloat(formData.daily_amount) <= 0) {
              alert("Daily Amount must be greater than 0");
              return;
            }
            setLoading(true);
            try {
              const nutritionData = {
                date: formData.date || new Date().toISOString().split("T")[0],
                food_brand: formData.food_brand.trim(),
                food_type: formData.food_type.trim(),
                daily_amount: parseFloat(formData.daily_amount) || 0,
                calories_per_day: parseInt(formData.calories_per_day) || 0,
                protein_percentage: parseFloat(formData.protein_percentage) || 0,
                fat_percentage: parseFloat(formData.fat_percentage) || 0,
                carb_percentage: parseFloat(formData.carb_percentage) || 0,
                supplements: formData.supplements
                  ? formData.supplements.split(",").map(s => s.trim()).filter(Boolean)
                  : [],
                notes: formData.notes || "",
                weight_at_time: parseFloat(formData.weight_at_time) || 0,
              };
              const createdRecord = await apiClient.createNutritionRecord(dogId, nutritionData);
              const recordId = createdRecord.nutritionRecord.id;

              for (const meal of customMeals) {
                await apiClient.createMealPlan(dogId, {
                  ...meal,
                  nutrition_record_id: recordId,
                });
              }

              await loadNutritionData();
              setShowCustomPlanModal(false);
            } catch (err) {
              console.error("Error creating custom plan:", err);
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('date')}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label={t('weightAtTime')}
              type="number"
              value={formData.weight_at_time}
              onChange={(e) => setFormData({ ...formData, weight_at_time: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('foodBrand')}
              value={formData.food_brand}
              onChange={(e) => setFormData({ ...formData, food_brand: e.target.value })}
              required
            />
            <Input
              label={t('foodType')}
              value={formData.food_type}
              onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('dailyAmountGrams')}
              type="number"
              value={formData.daily_amount}
              onChange={(e) => setFormData({ ...formData, daily_amount: e.target.value })}
              required
            />
            <Input
              label={t('caloriesPerDay')}
              type="number"
              value={formData.calories_per_day}
              onChange={(e) => setFormData({ ...formData, calories_per_day: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={t('proteinPercent')}
              type="number"
              step="0.1"
              value={formData.protein_percentage}
              onChange={(e) => setFormData({ ...formData, protein_percentage: e.target.value })}
            />
            <Input
              label={t('fatPercent')}
              type="number"
              step="0.1"
              value={formData.fat_percentage}
              onChange={(e) => setFormData({ ...formData, fat_percentage: e.target.value })}
            />
            <Input
              label={t('carbsPercent')}
              type="number"
              step="0.1"
              value={formData.carb_percentage}
              onChange={(e) => setFormData({ ...formData, carb_percentage: e.target.value })}
            />
          </div>
          {(() => {
            const total = Math.round(
              (parseFloat(formData.protein_percentage) || 0) +
              (parseFloat(formData.fat_percentage) || 0) +
              (parseFloat(formData.carb_percentage) || 0)
            );
            if (total === 0) return null;
            const ok = total === 100;
            return (
              <p className={`text-xs font-medium px-3 py-2 rounded-lg ${ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
                {ok ? '✓ 100%' : t('macroTotalWarning', { total })}
              </p>
            );
          })()}
          <Input
            label={t('supplementsPlaceholder')}
            value={formData.supplements}
            onChange={(e) => setFormData({ ...formData, supplements: e.target.value })}
            placeholder={t('supplementsExPlaceholder')}
          />
          <div>
            <label className={labelClass}>{t('notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputSelectClass}
              rows={3}
              placeholder={t('notesPlaceholder')}
            />
          </div>

          {/* Custom Meals section */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/5">
            <h4 className="font-semibold text-gray-900 dark:text-[#e2e2e6] mb-3">Meals</h4>
            <div className="space-y-2">
              {customMeals.map((meal, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#282a2d] rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-[#e2e2e6] text-sm">{meal.food_type}</div>
                    <div className="text-xs text-gray-500 dark:text-[#8b919d]">{meal.meal_time}</div>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-[#c1c7d3]">{meal.amount}g · {meal.calories} cal</div>
                  <button
                    type="button"
                    onClick={() => setCustomMeals(customMeals.filter((_, idx) => idx !== i))}
                    className="text-red-500 hover:text-red-700 text-sm ml-2"
                  >
                    {t('remove')}
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowCustomPlanModal(false);
                setEditingMeal(null);
                setMealModalContext('wizard');
                setMealFormData({ meal_time: '', food_type: '', amount: '', calories: '', nutrition_record_id: '', is_active: '' });
                setIsMealPlanModalOpen(true);
              }}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all"
            >
              <Plus size={15} /> {t('addMeal')}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCustomPlanModal(false)}
              className="px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t('saving') : t('saveCustomPlan')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
