import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NutritionRecords } from './nutrition/NutritionRecords';
import { MealPlan } from './nutrition/MealPlan';
import { LayoutList, Beef } from "lucide-react";

export const NutritionTracker: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'records' | 'mealplan'>('records');

  return (
    <div className="p-4">
      {/* Simple tab buttons */}
     <div className="border-b mb-4 flex space-x-6">
            <button
              className={`flex items-center gap-2 pb-2 ${
                tab === 'records'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setTab('records')}
            >
              <LayoutList size={16} />
              {t('Records')}
            </button>

            <button
              className={`flex items-center gap-2 pb-2 ${
                tab === 'mealplan'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setTab('mealplan')}
            >
              <Beef size={16} />
              {t('Meal Plan')}
            </button>
          </div>


      {/* Tab contents */}
      {tab === 'records' && <NutritionRecords />}
      {tab === 'mealplan' && <MealPlan />}
    </div>
  );
};
