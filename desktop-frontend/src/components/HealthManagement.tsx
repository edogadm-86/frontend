import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Heart, ArrowLeft, FileText, Apple, Utensils, Activity, TrendingUp, Target, Award } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { VaccinationManagement } from './VaccinationManagement';
import { HealthRecordManagement } from './HealthRecordManagement';
import { NutritionManagement } from './NutritionManagement';
import { PetPassport } from './PetPassport';
import { Dog } from '../types';

interface HealthManagementProps {
  currentDog: Dog | null;
  dogs: Dog[];
  onNavigate: (view: string) => void;
}

export const HealthManagement: React.FC<HealthManagementProps> = ({
  currentDog,
  dogs,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'vaccinations' | 'health-records' | 'nutrition'>('overview');
  const [showPassport, setShowPassport] = useState(false);

  if (!currentDog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Dog Selected
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Please select a dog from the sidebar to manage health records
          </p>
          <Button onClick={() => onNavigate('settings')}>
            {t('addDog')}
          </Button>
        </div>
      </div>
    );
  }

  const healthStats = [
    { 
      icon: Shield, 
      label: 'Vaccinations', 
      value: '8/10', 
      status: 'Up to date',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    { 
      icon: Heart, 
      label: 'Health Score', 
      value: '92%', 
      status: 'Excellent',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    { 
      icon: Apple, 
      label: 'Nutrition', 
      value: '85%', 
      status: 'Good',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
    },
    { 
      icon: Activity, 
      label: 'Activity', 
      value: '2.5h', 
      status: 'Daily avg',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-3xl font-bold gradient-text">{t('health')} Management</h2>
              <p className="text-gray-600 dark:text-gray-300">Complete health overview for {currentDog.name}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowPassport(true)}
            variant="gradient"
            icon={<FileText size={16} />}
          >
            View Pet Passport
          </Button>
        </div>

        {/* Health Overview Cards */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {healthStats.map((stat, index) => (
              <Card key={index} variant="gradient" className={`bg-gradient-to-br ${stat.bgColor} border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <stat.icon size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.status}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</div>
                <div className="progress-bar mt-2">
                  <div className={`progress-fill bg-gradient-to-r ${stat.color}`} style={{ width: '85%' }}></div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="flex space-x-2 p-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30">
          {[
            { id: 'overview', icon: Target, label: 'Overview' },
            { id: 'vaccinations', icon: Shield, label: t('vaccinations') },
            { id: 'health-records', icon: Heart, label: t('healthRecords') },
            { id: 'nutrition', icon: Apple, label: 'Nutrition' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab-button flex items-center space-x-2 ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Health Timeline */}
              <Card variant="gradient" className="h-fit">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Activity className="mr-2 text-primary-500" />
                  Health Timeline
                </h3>
                <div className="space-y-4">
                  {[
                    { date: '2024-01-15', type: 'vaccination', title: 'Annual Vaccination', status: 'completed' },
                    { date: '2024-01-10', type: 'checkup', title: 'Routine Checkup', status: 'completed' },
                    { date: '2024-01-05', type: 'nutrition', title: 'Diet Plan Updated', status: 'completed' },
                    { date: '2024-02-15', type: 'vaccination', title: 'Rabies Booster', status: 'upcoming' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        {item.type === 'vaccination' && <Shield size={16} className={item.status === 'completed' ? 'text-green-600' : 'text-orange-600'} />}
                        {item.type === 'checkup' && <Heart size={16} className={item.status === 'completed' ? 'text-green-600' : 'text-orange-600'} />}
                        {item.type === 'nutrition' && <Apple size={16} className={item.status === 'completed' ? 'text-green-600' : 'text-orange-600'} />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.date)}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Health Insights */}
              <Card variant="gradient" className="h-fit">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <TrendingUp className="mr-2 text-primary-500" />
                  Health Insights
                </h3>
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3 mb-2">
                      <Award size={20} className="text-green-600" />
                      <span className="font-semibold text-green-800 dark:text-green-300">Excellent Progress!</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {currentDog.name} is maintaining excellent health with regular checkups and up-to-date vaccinations.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Recommendations</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Schedule dental cleaning</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Consider joint supplements</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Maintain current diet plan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {activeTab === 'vaccinations' && (
            <VaccinationManagement
              dogId={currentDog.id}
              dogName={currentDog.name}
            />
          )}
          
          {activeTab === 'health-records' && (
            <HealthRecordManagement
              dogId={currentDog.id}
              dogName={currentDog.name}
            />
          )}
          
          {activeTab === 'nutrition' && (
            <NutritionManagement
              dogId={currentDog.id}
              dogName={currentDog.name}
            />
          )}
        </div>

        {/* Pet Passport Modal */}
        {showPassport && (
          <PetPassport dog={currentDog} onClose={() => setShowPassport(false)} />
        )}
      </div>
    </div>
  );
};