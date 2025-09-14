import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Apple, Utensils, TrendingUp, Target, Award, Calendar, Clock, FileText } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
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

  // NEW STATE for templates modal
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const normalizedTime = mealFormData.meal_time.slice(0,5); // "10:00:00" -> "10:00"

  // Nutrition templates
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
      { meal_time: "18:30", food_type: t('streemedVeggiesDryFood') , amount: 175, calories: 350 },
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

  // NEW applyTemplate function
  const applyTemplate = async (template: any) => {
  try {
    setLoading(true);
    const recordRes = await apiClient.createNutritionRecord(dogId, template.nutrition);
    const recordId = recordRes.nutritionRecord.id;

    // Use updateEntireMealPlan so it clears old and sets new
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
      is_active:'true',
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
      console.log("Desktop update payload:", nutritionData);

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
        nutrition_record_id: mealFormData.nutrition_record_id, // ✅ add this
        is_active: 'true',

      };
      console.log("Desktop update payload for meal:", mealData);

    if (mealModalContext === 'wizard') {
      // add to custom wizard meals only
       setCustomMeals((prev) => [
        ...prev,
        { ...mealData, id: Date.now().toString() } as MealPlan,
      ]);
    } else {
      if (editingMeal) {
        await apiClient.updateMealPlan(dogId, editingMeal.id, {
          ...mealData,
          nutrition_record_id: editingMeal.nutrition_record_id,
          is_active: true,   // ✅ force include          
        });
              console.log("Desktop update payload for meal:", mealData);

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
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await apiClient.deleteMealPlan(dogId, mealId);
        await loadNutritionData();
      } catch (error) {
        console.error('Error deleting meal:', error);
      }
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this nutrition record?')) {
      try {
        await apiClient.deleteNutritionRecord(dogId, recordId);
        await loadNutritionData();
      } catch (error) {
        console.error('Error deleting nutrition record:', error);
      }
    }
  };

  const currentRecord = nutritionRecords[0];
  const totalCalories = nutritionStats?.dailyTotals?.calories || mealPlan.reduce((sum, meal) => sum + meal.calories, 0);
  const totalAmount = nutritionStats?.dailyTotals?.amount || mealPlan.reduce((sum, meal) => sum + meal.amount, 0);

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-2 p-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30">
        {[
          { id: 'overview', icon: Target, label: t('overview') },
          { id: 'records', icon: FileText, label: t('nutritionRecords') },
          { id: 'meal-plan', icon: Utensils, label: t('mealPlan') },
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
              {t('currentNutritionProfile')}
            </h3>
              <Button size="sm" variant="outline" onClick={() => setShowTemplatesModal(true)}>
               {t('chooseTemplate')}
              </Button>&nbsp;&nbsp;&nbsp;&nbsp;
      

            {currentRecord || nutritionStats?.hasData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentRecord?.daily_amount || Math.round(totalAmount)}g
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('dailyAmount')}</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentRecord?.calories_per_day || totalCalories}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('caloriesDay')}</div>
                  </div>
                </div>
                
                {currentRecord && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('protein')}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{currentRecord.protein_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${currentRecord.protein_percentage}%` }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('fat')}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{currentRecord.fat_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${currentRecord.fat_percentage}%` }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('carbohydrates')}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{currentRecord.carb_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${currentRecord.carb_percentage}%` }}></div>
                    </div>
                  </div>
                )}
                
                {currentRecord && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('currentFood')}</div>
                    <div className="text-gray-900 dark:text-white font-semibold">{currentRecord.food_brand}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{currentRecord.food_type}</div>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="text-center py-8">
                <Apple size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 dark:text-gray-400">{t('noNutritionData')}</p>
              </div>
            )}
          </Card>

          {/* Daily Meal Plan */}
          <Card variant="gradient">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Utensils className="mr-2 text-green-500" />
                {t('todaysMealPlan')}
              </h3>
              <Button size="sm" variant="outline" onClick={() => setActiveView('meal-plan')}>
                {t('editPlan')}
              </Button>
            </div>
            <div className="space-y-3">
              {mealPlan.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl group">
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
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditMeal(meal)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {mealPlan.length === 0 && (
                <div className="text-center py-8">
                  <Utensils size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{t('noMealPlan')}</p>
                  <Button size="sm" onClick={handleCreateMeal}>
                    Add First Meal
                  </Button>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('totalDailyCalories')}</span>
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
                {t('nutritionRecords')} - {dogName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{t('trackNutritionHistory')}</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus size={20} className="mr-2" />
              {t('addNutritionRecord')}
            </Button>
          </div>

          {nutritionRecords.length === 0 ? (
            <Card className="text-center py-16">
              <Apple size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('noRecordsFound')}</p>
              <Button onClick={handleCreate}>
                {t('addFirstRecord')}
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
                            {t('amountGrams')}: {record.daily_amount} {t('gram')}/{t('day')}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {t('calories')}: {record.calories_per_day}/{t('day')}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {t('weight')}: {record.weight_at_time}{t('kg')}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm font-bold text-blue-600">{record.protein_percentage}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{t('protein')}</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm font-bold text-green-600">{record.fat_percentage}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{t('fat')}</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-sm font-bold text-orange-600">{record.carb_percentage}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{t('carbs')}</div>
                          </div>
                        </div>
                        
                        {record.supplements.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('supplements')}: </span>
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
                        {record.meals && record.meals.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('meals')}:
                          </h5>
                          <ul className="space-y-1">
                            {record.meals.map((meal: any) => (
                              <li key={meal.id} className="text-sm text-gray-600 dark:text-gray-400">
                                🍽 {meal.meal_time} — {meal.food_type} ({meal.amount}{t('gram')}, {meal.calories} {t('cal')})
                              </li>
                            ))}
                          </ul>
                        </div>
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
                        onClick={() => handleDeleteRecord(record.id)}
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
                {t('mealPlan')} - {dogName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{t('manageDailyFeedingSchedule')}</p>
            </div>
            <Button onClick={() => setIsMealPlanModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              {t('addMeal')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card variant="gradient">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dailySchedule')}</h4>
                <div className="space-y-3">
                  {mealPlan.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl group">
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
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditMeal(meal)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {mealPlan.length === 0 && (
                    <div className="text-center py-8">
                      <Utensils size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">{t('noMealsScheduled')}</p>
                      <Button onClick={handleCreateMeal}>
                        {t('addFirstMeal')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div>
              <Card variant="gradient">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dailySummary')}</h4>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{totalCalories}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('totalCalories')}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{mealPlan.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('mealsPerDay')}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{t('optimal')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('feedingSchedule')}</div>
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
        title={editingRecord ? t('editNutritionRecord') : t('addNutritionRecordModal')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-3 gap-4">
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
          <Input
            label={t('supplementsPlaceholder')}
            value={formData.supplements}
            onChange={(e) => setFormData({ ...formData, supplements: e.target.value })}
            placeholder="Omega-3, Glucosamine, Multivitamin"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder={t('notesPlaceholder')}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('saving') : t('saveRecord')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Meal Plan Modal */}
      <Modal
        isOpen={isMealPlanModalOpen}
        onClose={() => {
          setIsMealPlanModalOpen(false);
          if (mealModalContext  === 'wizard') {
            // reopen wizard if we came from custom plan
            setShowCustomPlanModal(true);
          }
        }}
        title={editingMeal ? t('editMeal') :t('addMealModal')}
        size="md"
      >
        <form onSubmit={(e) => handleMealSubmit(e, !showCustomPlanModal)} className="space-y-4">          <Input
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
            placeholder="Dry Food, Wet Food, Treats, etc."
            required
          />
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline"onClick={() => {
            setIsMealPlanModalOpen(false);
            if (mealModalContext === 'wizard') {
              setShowCustomPlanModal(true);
            }
            }}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('saving') : t('saveMeal')}
            </Button>
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
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('choosePreDesignedPlan')}
          </p>
          <div className="grid gap-4">
            {nutritionTemplates.map((template, index) => (
              <Card key={index} variant="gradient" className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('dailyCalories')}</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{template.nutrition.calories_per_day}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('meals')}:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{template.meals.length}/{t('day')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('protein')}:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{template.nutrition.protein_percentage}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('fat')}:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{template.nutrition.fat_percentage}%</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => applyTemplate(template)}
                    disabled={loading}
                  >
                    {loading ? t('applying'): t('apply')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Card
            variant="gradient"
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
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
          >
            <div className="flex items-center justify-center h-32 text-center">
              <Plus size={20} className="mr-2" />
              <span>{t('createCustomPlan')}</span>
            </div>
          </Card>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setShowTemplatesModal(false)}>
              {t('close')}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
  isOpen={showCustomPlanModal}
  onClose={() => setShowCustomPlanModal(false)}
  title={t('createCustomNutritionPlan')}
  size="lg"
>
  <form
    onSubmit={async (e) => {
      e.preventDefault();
        //Validate required fields
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
        // Save the nutrition record
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
        console.log("Submitting nutritionData:", nutritionData);

        const createdRecord = await apiClient.createNutritionRecord(dogId, nutritionData);
        const recordId = createdRecord.nutritionRecord.id;

        // Save all custom meals
       for (const meal of customMeals) {
          await apiClient.createMealPlan(dogId, {
            ...meal,
            nutrition_record_id: recordId,   // ✅ ensure meals point to this record
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
    {/* Reuse the same nutrition record fields */}
    <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
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

    <div className="grid grid-cols-2 gap-4">
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

    <div className="grid grid-cols-3 gap-4">
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

    <Input   
      label={t('supplementsPlaceholder')}
      value={formData.supplements}
      onChange={(e) => setFormData({ ...formData, supplements: e.target.value })}
      placeholder="Omega-3, Glucosamine, Multivitamin"
    />

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('notes')}
      </label>
      <textarea
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="input-field"
        rows={3}
        placeholder={t('notesPlaceholder')}
      />
    </div>

    {/* Custom Meals section */}
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Meals</h4>
      {customMeals.map((meal, i) => (
        <Card key={i} className="flex justify-between items-center p-3">
          <div>
            <div className="font-medium">{meal.food_type}</div>
            <div className="text-sm text-gray-500">{meal.meal_time}</div>
          </div>
          <div>{meal.amount}g • {meal.calories} cal</div>
          <button
            type="button"
            onClick={() => setCustomMeals(customMeals.filter((_, idx) => idx !== i))}
            className="text-red-500"
          >
            {t('remove')}
          </button>
        </Card>
        ))}


      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={() => {
          setShowCustomPlanModal(false);   // close custom plan modal
          setEditingMeal(null);
          setMealModalContext('wizard');          //  mark as wizard mode
          setMealFormData({ meal_time: '', food_type: '', amount: '', calories: '', nutrition_record_id: '', is_active: '' });
          setIsMealPlanModalOpen(true);    // open meal modal
        }}
      >
        <Plus size={16} className="mr-1" /> {t('addMeal')}
      </Button>
    </div>

    <div className="flex space-x-3 pt-4">
      <Button type="button" variant="outline" onClick={() => setShowCustomPlanModal(false)}>
        {t('cancel')}
      </Button>
      <Button type="submit" className="flex-1" disabled={loading}>
        {loading ? t('saving') : t('saveCustomPlan')}
      </Button>
    </div>
  </form>
</Modal>

    </div>
  );
};