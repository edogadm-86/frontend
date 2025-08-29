import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  Calendar, 
  Shield, 
  Award, 
  Plus,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  Activity,
  Target
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';

interface DashboardProps {
  currentDog: any;
  dogs: any[];
  vaccinations: any[];
  healthRecords: any[];
  appointments: any[];
  trainingSessions: any[];
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentDog,
  dogs,
  vaccinations,
  healthRecords,
  appointments,
  trainingSessions,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    if (currentDog?.id) {
      loadHealthStatus();
    }
  }, [currentDog?.id]);

  const loadHealthStatus = async () => {
    if (!currentDog?.id) return;
    
    setLoadingHealth(true);
    try {
      const response = await apiClient.getDogHealthStatus(currentDog.id);
      setHealthStatus(response);
    } catch (error) {
      console.error('Error loading health status:', error);
    } finally {
      setLoadingHealth(false);
    }
  };

  if (!currentDog) {
    return (
      <div className="p-4 lg:p-8 min-h-screen">
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full mx-auto flex items-center justify-center shadow-2xl float-animation">
              <Heart size={48} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-4">
            {t('welcome')} to eDog Desktop
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Select a dog from the sidebar or add your first dog to get started
          </p>
          <Button onClick={() => onNavigate('settings')} size="lg" icon={<Plus size={20} />}>
            {t('addDog')}
          </Button>
        </div>
      </div>
    );
  }

  const dogVaccinations = vaccinations.filter(v => v.dog_id === currentDog.id);
  const dogHealthRecords = healthRecords.filter(r => r.dog_id === currentDog.id);
  const dogAppointments = appointments.filter(a => a.dog_id === currentDog.id);
  const dogTrainingSessions = trainingSessions.filter(s => s.dog_id === currentDog.id);

  const upcomingAppointments = dogAppointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const stats = [
    {
      icon: Shield,
      label: t('vaccinations'),
      value: dogVaccinations.length,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      onClick: () => onNavigate('health'),
    },
    {
      icon: Heart,
      label: t('healthRecords'),
      value: dogHealthRecords.length,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50',
      onClick: () => onNavigate('health'),
    },
    {
      icon: Calendar,
      label: t('appointments'),
      value: upcomingAppointments.length,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      onClick: () => onNavigate('calendar'),
    },
    {
      icon: Award,
      label: t('trainingSessions'),
      value: dogTrainingSessions.length,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50',
      onClick: () => onNavigate('training'),
    },
  ];

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'from-green-500 to-emerald-500';
      case 'Good': return 'from-blue-500 to-cyan-500';
      case 'Fair': return 'from-yellow-500 to-orange-500';
      case 'Needs Attention': return 'from-orange-500 to-red-500';
      case 'Poor': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };
  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      {/* Dog Profile Header */}
      <Card variant="gradient" className="relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                {currentDog.profile_picture ? (
                  <img
                    src={currentDog.profile_picture}
                    alt={currentDog.name}
                    className="w-24 h-24 rounded-3xl object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {currentDog.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center border-4 border-white">
                <Activity size={12} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold gradient-text">{currentDog.name}</h2>
              <p className="text-xl text-gray-600 mb-2">{currentDog.breed}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>{currentDog.age} years old</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>{currentDog.weight} kg</span>
                </div>
                {currentDog.microchip_id && (
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Microchip: {currentDog.microchip_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button onClick={() => onNavigate('settings')} variant="glass" icon={<Plus size={16} />}>
              {t('edit')} {t('profile')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Health Status Banner */}
      {healthStatus?.hasEnoughData && (
        <Card variant="gradient" className={`bg-gradient-to-r ${
          healthStatus.statusColor === 'green' ? 'from-green-50 to-emerald-50 border-green-200' :
          healthStatus.statusColor === 'blue' ? 'from-blue-50 to-cyan-50 border-blue-200' :
          healthStatus.statusColor === 'yellow' ? 'from-yellow-50 to-orange-50 border-yellow-200' :
          healthStatus.statusColor === 'orange' ? 'from-orange-50 to-red-50 border-orange-200' :
          healthStatus.statusColor === 'red' ? 'from-red-50 to-pink-50 border-red-200' :
          'from-gray-50 to-slate-50 border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${getHealthStatusColor(healthStatus.status)} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Target size={24} className="text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${
                  healthStatus.statusColor === 'green' ? 'text-green-800' :
                  healthStatus.statusColor === 'blue' ? 'text-blue-800' :
                  healthStatus.statusColor === 'yellow' ? 'text-yellow-800' :
                  healthStatus.statusColor === 'orange' ? 'text-orange-800' :
                  healthStatus.statusColor === 'red' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  Health Status: {healthStatus.status}
                </h3>
                <p className={`${
                  healthStatus.statusColor === 'green' ? 'text-green-600' :
                  healthStatus.statusColor === 'blue' ? 'text-blue-600' :
                  healthStatus.statusColor === 'yellow' ? 'text-yellow-600' :
                  healthStatus.statusColor === 'orange' ? 'text-orange-600' :
                  healthStatus.statusColor === 'red' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {healthStatus.nextAction}
                </p>
                {healthStatus.factors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {healthStatus.factors.slice(0, 3).map((factor: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-white/50 text-xs rounded-full">
                        {factor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                healthStatus.statusColor === 'green' ? 'text-green-600' :
                healthStatus.statusColor === 'blue' ? 'text-blue-600' :
                healthStatus.statusColor === 'yellow' ? 'text-yellow-600' :
                healthStatus.statusColor === 'orange' ? 'text-orange-600' :
                healthStatus.statusColor === 'red' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {healthStatus.score}%
              </div>
              <div className={`text-sm ${
                healthStatus.statusColor === 'green' ? 'text-green-500' :
                healthStatus.statusColor === 'blue' ? 'text-blue-500' :
                healthStatus.statusColor === 'yellow' ? 'text-yellow-500' :
                healthStatus.statusColor === 'orange' ? 'text-orange-500' :
                healthStatus.statusColor === 'red' ? 'text-red-500' :
                'text-gray-500'
              }`}>
                Health Score
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} onClick={stat.onClick} variant="stat" className="cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill bg-gradient-to-r ${stat.color}`}
                style={{ width: `${Math.min(stat.value * 10, 100)}%` }}
              ></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900">7 days</div>
          <div className="text-sm text-gray-600">Since last vet visit</div>
        </Card>
        
        <Card variant="glass" className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Activity size={20} className="text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900">2.5 hrs</div>
          <div className="text-sm text-gray-600">Daily activity average</div>
        </Card>
        
        <Card variant="glass" className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Heart size={20} className="text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900">Excellent</div>
          <div className="text-sm text-gray-600">Overall health</div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-200/20 to-blue-200/20 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center dark:text-white">
              <Calendar className="mr-2 text-primary-500" />
              {t('upcomingAppointments')}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('calendar')}>
              {t('viewAll')}
            </Button>
          </div>
          
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-4 dark:from-gray-600 dark:to-gray-700">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4 dark:text-gray-400">{t('noData')}</p>
              <Button size="sm" onClick={() => onNavigate('calendar')} variant="outline">
                {t('scheduleAppointment')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {(() => {
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                
                return Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(startOfWeek);
                  date.setDate(startOfWeek.getDate() + i);
                  
                  const dayAppointments = upcomingAppointments.filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate.toDateString() === date.toDateString();
                  });
                  
                  const isToday = date.toDateString() === today.toDateString();
                  
                  return (
                    <div
                      key={i}
                      className={`min-h-[80px] p-2 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                        isToday 
                          ? 'bg-gradient-to-br from-primary-100 to-blue-100 border-primary-300 dark:from-primary-900/30 dark:to-blue-900/30' 
                          : 'bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 dark:bg-gray-800/60 dark:border-gray-600/30'
                      }`}
                      onClick={() => onNavigate('calendar')}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map(apt => (
                          <div key={apt.id} className="text-xs bg-primary-500 text-white px-1 py-0.5 rounded truncate">
                            {apt.time.slice(0, 5)}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">+{dayAppointments.length - 2}</div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="mt-4 space-y-2">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/80 transition-all duration-200 dark:bg-gray-800/60 dark:border-gray-600/30">
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{appointment.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(appointment.date)} at {appointment.time}
                    </p>
                    {appointment.location && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{appointment.location}</p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-xs rounded-full font-medium dark:from-blue-900/50 dark:to-cyan-900/50 dark:text-blue-300">
                    {appointment.type}
                  </span>
                </div>
              ))}
              {upcomingAppointments.length > 3 && (
                <button 
                  onClick={() => onNavigate('calendar')}
                  className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400"
                >
                  View {upcomingAppointments.length - 3} more appointments →
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card variant="gradient">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Sparkles className="mr-2 text-primary-500" />
            {t('quickActions')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('health')}
              className="group p-6 text-left border-2 border-blue-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Shield className="text-white" size={20} />
              </div>
              <p className="font-semibold text-gray-900">{t('addVaccination')}</p>
              <p className="text-sm text-gray-500">Track vaccination records</p>
            </button>
            
            <button
              onClick={() => onNavigate('health')}
              className="group p-6 text-left border-2 border-red-200 rounded-2xl hover:border-red-300 hover:bg-red-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Heart className="text-white" size={20} />
              </div>
              <p className="font-semibold text-gray-900">{t('addHealthRecord')}</p>
              <p className="text-sm text-gray-500">Log health information</p>
            </button>
            
            <button
              onClick={() => onNavigate('calendar')}
              className="group p-6 text-left border-2 border-green-200 rounded-2xl hover:border-green-300 hover:bg-green-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="text-white" size={20} />
              </div>
              <p className="font-semibold text-gray-900">{t('scheduleAppointment')}</p>
              <p className="text-sm text-gray-500">Book vet visits</p>
            </button>
            
            <button
              onClick={() => onNavigate('training')}
              className="group p-6 text-left border-2 border-purple-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Award className="text-white" size={20} />
              </div>
              <p className="font-semibold text-gray-900">{t('addTrainingSession')}</p>
              <p className="text-sm text-gray-500">Track progress</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="gradient">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Clock className="mr-2 text-primary-500" />
          {t('recentActivity')}
        </h3>
        <div className="space-y-4">
          {dogHealthRecords
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((record) => (
              <div key={record.id} className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{record.title}</p>
                  <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                </div>
                <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs rounded-full font-medium">
                  {record.type}
                </span>
              </div>
            ))}
          
          {dogHealthRecords.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500">{t('noData')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};