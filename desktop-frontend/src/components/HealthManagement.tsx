import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Heart, Apple, Activity, TrendingUp, Award } from 'lucide-react';
import { VaccinationManagement } from './VaccinationManagement';
import { HealthRecordManagement } from './HealthRecordManagement';
import { NutritionManagement } from './NutritionManagement';
import { WeightHistory } from './WeightHistory';
import { MedicationReminders } from './MedicationReminders';
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

const cardClass = 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5 sm:p-6';

export const HealthManagement: React.FC<HealthManagementProps> = ({
  currentDog,
  dogs,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const { vaccinations, healthRecords, nutritionRecords } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'vaccinations' | 'health-records' | 'nutrition'>('overview');
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [nutritionStats, setNutritionStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const rawStatus = healthStatus?.status;
  let statusKey = statusKeyFromBackend(rawStatus);
  const nextActionKey = actionKeyFromBackend(healthStatus?.nextAction);
  if (statusKey === 'unknown') {
    const fromScore = statusKeyFromScore(healthStatus?.score);
    if (fromScore) statusKey = fromScore;
  }
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
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading health stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!currentDog) {
    return (
      <div className="font-jakarta min-h-screen bg-[#fbf9f8] dark:bg-[#111316] p-8 flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="mx-auto mb-4 text-gray-300 dark:text-[#414751]" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-[#e2e2e6] mb-2">{t('noDogsFound')}</h2>
          <p className="text-gray-500 dark:text-[#8b919d] mb-6">{t('addFirstDog')}</p>
          <button
            onClick={() => onNavigate('settings')}
            className="px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('addDog')}
          </button>
        </div>
      </div>
    );
  }

  const dogVaccinations = vaccinations.filter(v => v.dog_id === currentDog.id);
  const dogHealthRecords = healthRecords.filter(r => r.dog_id === currentDog.id);
  const dogNutritionRecords = nutritionRecords.filter(r => r.dog_id === currentDog.id);

  const currentDate = new Date();
  const upToDateVaccinations = dogVaccinations.filter(v => {
    if (!v.next_due_date) return true;
    return new Date(v.next_due_date) > currentDate;
  });
  const vaccinationStatus = dogVaccinations.length > 0
    ? `${upToDateVaccinations.length}/${dogVaccinations.length}`
    : '0/0';

  const nutritionScore = nutritionStats?.hasData
    ? (dogNutritionRecords.length > 0 ? '85%' : 'No data')
    : 'No data';

  const healthStats = [
    {
      icon: Shield,
      label: t('vaccinations'),
      value: vaccinationStatus,
      status: upToDateVaccinations.length === dogVaccinations.length && dogVaccinations.length > 0 ? t('upToDate') : t('needsAttention'),
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Heart,
      label: t('healthScore'),
      value: healthStatus?.score ? `${healthStatus.score}%` : 'No data',
      status: t(statusKey),
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: Apple,
      label: t('nutrition'),
      value: nutritionScore,
      status: nutritionStats?.hasData ? t('tracked') : t('notTracked'),
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: Activity,
      label: t('records'),
      value: dogHealthRecords.length.toString(),
      status: t('totalEntries'),
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const tabs = [
    { id: 'overview', icon: 'monitoring', label: t('overview') },
    { id: 'vaccinations', icon: 'vaccines', label: t('vaccinations') },
    { id: 'health-records', icon: 'medical_information', label: t('healthRecords') },
    { id: 'nutrition', icon: 'nutrition', label: t('nutrition') },
    { id: 'weight', icon: 'monitor_weight', label: t('weightHistory') },
    { id: 'reminders', icon: 'medication', label: t('medicationReminders') },
  ];

  return (
    <div className="font-jakarta bg-[#fbf9f8] dark:bg-[#111316] min-h-full p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[#e2e2e6]">{t('health')}</h1>
          <p className="text-sm text-gray-500 dark:text-[#8b919d]">{currentDog.name} · {currentDog.breed}</p>
        </div>
        <button
          onClick={() => onNavigate('passport')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto justify-center sm:justify-start"
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          {t('viewPetPassport')}
        </button>
      </div> */}

      {/* Stats cards */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loadingStats
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={cardClass}>
                  <div className="w-10 h-10 bg-gray-200 dark:bg-[#282a2d] rounded-xl mb-3 animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-[#282a2d] rounded-lg mb-2 animate-pulse" />
                  <div className="h-3 w-20 bg-gray-100 dark:bg-[#1e2023] rounded animate-pulse" />
                  <div className="h-3 w-14 bg-gray-100 dark:bg-[#1e2023] rounded animate-pulse mt-2" />
                </div>
              ))
            : healthStats.map((stat, index) => (
                <div key={index} className={cardClass}>
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon size={20} className={stat.iconColor} />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#e2e2e6]">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-[#8b919d] mt-0.5">{stat.status}</div>
                  <div className="text-xs font-medium text-gray-600 dark:text-[#c1c7d3] mt-2">{stat.label}</div>
                </div>
              ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-1.5">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={[
                  'shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                    : 'text-gray-600 dark:text-[#c1c7d3] hover:bg-gray-100 dark:hover:bg-[#282a2d]',
                ].join(' ')}
              >
                <span className="material-symbols-outlined text-[18px] leading-none">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Health Timeline */}
            <div className={`${cardClass} lg:col-span-8`}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6] mb-5 flex items-center gap-2">
                <Activity size={20} className="text-[#005da7] dark:text-[#a4c9ff]" />
                {t('healthTimeline')}
              </h3>
              {(() => {
                const allEvents = [
                  ...dogVaccinations.map(v => ({
                    date: v.date_given,
                    type: 'vaccination' as const,
                    title: v.vaccine_name,
                    isUpcoming: false,
                  })),
                  ...dogHealthRecords.map(r => ({
                    date: r.date,
                    type: 'checkup' as const,
                    title: r.title,
                    isUpcoming: false,
                  })),
                  ...dogNutritionRecords.map(r => ({
                    date: r.date,
                    type: 'nutrition' as const,
                    title: `Diet: ${r.food_brand}`,
                    isUpcoming: false,
                  })),
                  ...dogVaccinations
                    .filter(v => v.next_due_date && new Date(v.next_due_date) > currentDate)
                    .map(v => ({
                      date: v.next_due_date,
                      type: 'vaccination' as const,
                      title: `${v.vaccine_name} (${t('upcoming')})`,
                      isUpcoming: true,
                    })),
                ].sort((a, b) => {
                  if (a.isUpcoming && !b.isUpcoming) return -1;
                  if (!a.isUpcoming && b.isUpcoming) return 1;
                  return new Date(b.date).getTime() - new Date(a.date).getTime();
                });

                const visibleEvents = showAllTimeline ? allEvents.slice(0, 10) : allEvents.slice(0, 6);

                return (
                  <div className="space-y-3">
                    {visibleEvents.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#282a2d] rounded-xl">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          !item.isUpcoming ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                        }`}>
                          {item.type === 'vaccination' && <Shield size={15} className={!item.isUpcoming ? 'text-green-600' : 'text-amber-600'} />}
                          {item.type === 'checkup' && <Heart size={15} className={!item.isUpcoming ? 'text-green-600' : 'text-amber-600'} />}
                          {item.type === 'nutrition' && <Apple size={15} className={!item.isUpcoming ? 'text-green-600' : 'text-amber-600'} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-[#e2e2e6] truncate text-sm">{item.title}</div>
                          <div className="text-xs text-gray-500 dark:text-[#8b919d]">{formatDate(item.date)}</div>
                        </div>
                        <span className={`whitespace-nowrap px-2 py-0.5 text-xs rounded-full font-medium ${
                          !item.isUpcoming
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {item.isUpcoming ? t('upcoming') : t('completed')}
                        </span>
                      </div>
                    ))}

                    {allEvents.length === 0 && (
                      <div className="text-center py-10">
                        <Activity size={32} className="mx-auto mb-2 text-gray-300 dark:text-[#414751]" />
                        <p className="text-gray-500 dark:text-[#8b919d] text-sm">{t('noHealthData', 'No health timeline data available')}</p>
                      </div>
                    )}

                    {allEvents.length > 6 && (
                      <button
                        onClick={() => setShowAllTimeline(v => !v)}
                        className="w-full mt-1 py-2 text-xs font-semibold text-[#005da7] dark:text-[#a4c9ff] hover:underline"
                      >
                        {showAllTimeline ? t('showLessTimeline') : t('showMoreTimeline')}
                        {!showAllTimeline && ` (${allEvents.length - 6} more)`}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Health Insights */}
            <div className={`${cardClass} lg:col-span-4`}>
              <div className="flex items-start justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6] flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#005da7] dark:text-[#a4c9ff]" />
                  {t('healthInsights')}
                </h3>
                {lastUpdated && (
                  <span className="text-[10px] text-gray-400 dark:text-[#8b919d] whitespace-nowrap">
                    {t('healthDataUpdated', { time: lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}
                  </span>
                )}
              </div>
              <div className="space-y-5">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/40">
                  <div className="flex items-start gap-2 mb-2">
                    <Award size={18} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-green-800 dark:text-green-300 text-sm">{progressText}</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {nextActionKey ? t(nextActionKey) : t('maintainingGoodHealth', { dogName: currentDog.name })}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-[#e2e2e6] text-sm">{t('recommendations')}</h4>
                  <div className="space-y-2">
                    {(healthStatus?.factors?.length ? healthStatus.factors : ['Keep up regular checkups'])
                      .map((factor: string, index: number) => {
                        const key = factorKeyFromBackend(factor);
                        const text = key ? t(key) : factor;
                        return (
                          <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="w-1.5 h-1.5 bg-[#005da7] dark:bg-[#a4c9ff] rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-[#c1c7d3]">{text}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vaccinations' && (
          <VaccinationManagement dogId={currentDog.id} dogName={currentDog.name} />
        )}
        {activeTab === 'health-records' && (
          <HealthRecordManagement dogId={currentDog.id} dogName={currentDog.name} />
        )}
        {activeTab === 'nutrition' && (
          <NutritionManagement dogId={currentDog.id} dogName={currentDog.name} />
        )}
        {activeTab === 'weight' && (
          <WeightHistory currentDog={currentDog} />
        )}
        {activeTab === 'reminders' && (
          <MedicationReminders currentDog={currentDog} />
        )}
      </div>
    </div>
  );
};
