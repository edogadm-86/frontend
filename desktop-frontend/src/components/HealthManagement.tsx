import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Heart, ArrowLeft, FileText, Apple, Utensils, Activity, TrendingUp, Target, Award } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { VaccinationManagement } from './VaccinationManagement';
import { HealthRecordManagement } from './HealthRecordManagement';
import { NutritionManagement } from './NutritionManagement';
import { PetPassport } from './PetPassport';
import { Dog } from '../types';
import { formatDate } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { apiClient } from '../lib/api';
import { statusKeyFromBackend, statusKeyFromScore, actionKeyFromBackend, factorKeyFromBackend } from '../utils/healthI18n';

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
  const { vaccinations, healthRecords, nutritionRecords } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'vaccinations' | 'health-records' | 'nutrition'>('overview');
  const [showPassport, setShowPassport] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [nutritionStats, setNutritionStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);


  const rawStatus = healthStatus?.status;
  let statusKey = statusKeyFromBackend(rawStatus);
  const nextActionKey = actionKeyFromBackend(healthStatus?.nextAction);
  // If the text didn't map, derive from score
  if (statusKey === 'unknown') {
    const fromScore = statusKeyFromScore(healthStatus?.score);
    if (fromScore) statusKey = fromScore;
  }
  // progressText stays the same as before, now using the resilient statusKey
  const progressText =
    statusKey === 'excellent'
      ? t('excellentProgress')
      : statusKey === 'good'
        ? t('goodProgress')
        : rawStatus
          ? t('statusGeneric', { status: t(statusKey) })
          : t('healthStatus');
        
  useEffect(() => {
    if (currentDog?.id) {
      loadHealthStats();
    }
  }, [currentDog?.id]);

  const loadHealthStats = async () => {
    if (!currentDog?.id) return;
    
    setLoadingStats(true);
    try {
      const [healthStatusRes, nutritionStatsRes] = await Promise.all([
        apiClient.getDogHealthStatus(currentDog.id),
        apiClient.getNutritionStats(currentDog.id),
      ]);
      setHealthStatus(healthStatusRes);
      setNutritionStats(nutritionStatsRes);
    } catch (error) {
      console.error('Error loading health stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!currentDog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('noDogsFound')}
          </h2>
          <p className="text-gray-500 mb-6">
           {t('addFirstDog')} 
          </p>
          <Button onClick={() => onNavigate('settings')}>
            {t('addDog')}
          </Button>
        </div>
      </div>
    );
  }

  // Filter data for current dog
  const dogVaccinations = vaccinations.filter(v => v.dog_id === currentDog.id);
  const dogHealthRecords = healthRecords.filter(r => r.dog_id === currentDog.id);
  const dogNutritionRecords = nutritionRecords.filter(r => r.dog_id === currentDog.id);

  // Calculate vaccination status
  const currentDate = new Date();
  const upToDateVaccinations = dogVaccinations.filter(v => {
    if (!v.next_due_date) return true;
    return new Date(v.next_due_date) > currentDate;
  });
  const vaccinationStatus = dogVaccinations.length > 0 
    ? `${upToDateVaccinations.length}/${dogVaccinations.length}` 
    : '0/0';

  // Calculate nutrition score
  const nutritionScore = nutritionStats?.hasData 
    ? (dogNutritionRecords.length > 0 ? '85%' : 'No data')
    : 'No data';

  const healthStats = [
    { 
      icon: Shield, 
      label: t('vaccinations'), 
      value: vaccinationStatus, 
      status: upToDateVaccinations.length === dogVaccinations.length && dogVaccinations.length > 0 ? t('upToDate') : t('needsAttention'),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    { 
      icon: Heart, 
      label: t('healthScore'), 
      value: healthStatus?.score ? `${healthStatus.score}%` : 'No data', 
      status: t(statusKey),
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    { 
      icon: Apple, 
      label:  t('nutrition'), 
      value: nutritionScore, 
      status: nutritionStats?.hasData ? t('tracked') : t('notTracked'),
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
    },
    { 
      icon: Activity, 
      label:  t('records'), 
      value: dogHealthRecords.length.toString(), 
      status: t('totalEntries'),
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t('health')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {currentDog.name} • {currentDog.breed}
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setShowPassport(true)}
                variant="gradient"
                icon={<FileText size={16} />}
                className="w-full sm:w-auto"
              >
                {t('viewPetPassport')}
              </Button>
            </div>
          </div>


        {/* Health Overview Cards */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {healthStats.map((stat, index) => (
              <Card key={index} variant="gradient" className={`bg-gradient-to-br ${stat.bgColor} border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <stat.icon size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.status}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</div>
                <div className="progress-bar mt-2 hidden sm:block">
                  <div className={`progress-fill bg-gradient-to-r ${stat.color}`} style={{ width: '85%' }}></div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="mt-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 p-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', icon: Target, label: t('overview') },
              { id: 'vaccinations', icon: Shield, label: t('vaccinations') },
              { id: 'health-records', icon: Heart, label: t('healthRecords') },
              { id: 'nutrition', icon: Apple, label: t('nutrition') },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={[
                    "shrink-0",
                    "flex items-center gap-2 px-3 py-2 rounded-xl",
                    "text-sm font-medium transition",
                    active
                      ? "bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow"
                      : "text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/40",
                  ].join(" ")}
                >
                  <Icon size={16} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>


        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Health Timeline */}
              <Card
                variant="gradient"
  className="lg:col-span-8 xl:col-span-7 border-0 !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-sm md:hover:shadow-xl transition"


              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Activity className="mr-2 text-primary-500" />
                  {t('healthTimeline')}
                </h3>
                <div className="space-y-4">
                  {(() => {
                    // Combine all health-related events
                    const allEvents = [
                      ...dogVaccinations.map(v => ({
                        date: v.date_given,
                        type: 'vaccination',
                        title: v.vaccine_name,
                        status: 'completed'
                      })),
                      ...dogHealthRecords.map(r => ({
                        date: r.date,
                        type: 'checkup',
                        title: r.title,
                        status: 'completed'
                      })),
                      ...dogNutritionRecords.map(r => ({
                        date: r.date,
                        type: 'nutrition',
                        title: `Diet: ${r.food_brand}`,
                        status: 'completed'
                      })),
                      // Add upcoming vaccinations
                      ...dogVaccinations
                        .filter(v => v.next_due_date && new Date(v.next_due_date) > currentDate)
                        .map(v => ({
                          date: v.next_due_date,
                          type: 'vaccination',
                          title: `${v.vaccine_name} (Due)`,
                          status: t('upcoming')
                        }))
                    ];

                    // Sort by date (most recent first, but upcoming at top)
                    return allEvents
                      .sort((a, b) => {
                        if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
                        if (b.status === 'upcoming' && a.status !== 'upcoming') return 1;
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                      })
                      .slice(0, 6);
                  })().map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 sm:p-4 !bg-white/50 dark:!bg-gray-900/40 rounded-xl">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        {item.type === 'vaccination' && <Shield size={16} className={item.status === 'completed' ? 'text-green-600' : 'text-orange-600'} />}
                        {item.type === 'checkup' && <Heart size={16} className={item.status === 'completed' ? 'text-green-600' : 'text-orange-600'} />}
                        {item.type === 'nutrition' && <Apple size={16} className={item.status === 'completed' ? 'text-green-600' : 'text-orange-600'} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{item.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.date)}</div>
                      </div>
                      <span className={`whitespace-nowrap px-2 py-1 text-xs rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                  {dogVaccinations.length === 0 && dogHealthRecords.length === 0 && dogNutritionRecords.length === 0 && (
                    <div className="text-center py-8">
                      <Activity size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500 dark:text-gray-400">No health timeline data available</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Health Insights */}
                <Card variant="gradient"  
                  className="lg:col-span-4 xl:col-span-5 border-0 !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-sm md:hover:shadow-xl transition"
>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <TrendingUp className="mr-2 text-primary-500" />
                    {t('healthInsights')}
                  </h3>

                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-3 mb-2">
                        <Award size={20} className="text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-300">
                          {progressText}
                        </span>
                      </div>

                      <p className="text-sm text-green-700 dark:text-green-400">
                        {nextActionKey
                          ? t(nextActionKey)
                          : t('maintainingGoodHealth', { dogName: currentDog.name })}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('recommendations')}</h4>
                      <div className="space-y-2">
                        {(healthStatus?.factors?.length ? healthStatus.factors : ['Keep up regular checkups'])
                          .map((factor: string, index: number) => {
                            const key = factorKeyFromBackend(factor);
                            const text = key ? t(key) : factor; // fallback to raw if unmapped
                            return (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {text}
                                </span>
                              </div>
                            );
                          })}
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