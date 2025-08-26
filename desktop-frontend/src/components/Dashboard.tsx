import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  Calendar, 
  Shield, 
  Award, 
  Plus,
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate } from '../lib/utils';

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

  if (!currentDog) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('welcome')} to eDog Desktop
          </h2>
          <p className="text-gray-500 mb-6">
            Select a dog from the sidebar or add your first dog to get started
          </p>
          <Button onClick={() => onNavigate('settings')}>
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
      color: 'text-blue-600 bg-blue-50',
      onClick: () => onNavigate('health'),
    },
    {
      icon: Heart,
      label: t('healthRecords'),
      value: dogHealthRecords.length,
      color: 'text-red-600 bg-red-50',
      onClick: () => onNavigate('health'),
    },
    {
      icon: Calendar,
      label: t('appointments'),
      value: upcomingAppointments.length,
      color: 'text-green-600 bg-green-50',
      onClick: () => onNavigate('calendar'),
    },
    {
      icon: Award,
      label: t('trainingSessions'),
      value: dogTrainingSessions.length,
      color: 'text-purple-600 bg-purple-50',
      onClick: () => onNavigate('training'),
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Dog Profile Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              {currentDog.profile_picture ? (
                <img
                  src={currentDog.profile_picture}
                  alt={currentDog.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-gray-600">
                  {currentDog.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{currentDog.name}</h2>
              <p className="text-lg text-gray-600">{currentDog.breed}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{currentDog.age} years old</span>
                <span>•</span>
                <span>{currentDog.weight} kg</span>
                {currentDog.microchip_id && (
                  <>
                    <span>•</span>
                    <span>Microchip: {currentDog.microchip_id}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button onClick={() => onNavigate('settings')}>
            {t('edit')} {t('profile')}
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} onClick={stat.onClick} className="cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('upcomingAppointments')}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('calendar')}>
              {t('viewAll')}
            </Button>
          </div>
          
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">{t('noData')}</p>
              <Button size="sm" onClick={() => onNavigate('calendar')}>
                {t('scheduleAppointment')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(appointment.date)} at {appointment.time}
                    </p>
                    {appointment.location && (
                      <p className="text-xs text-gray-500">{appointment.location}</p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {appointment.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {t('quickActions')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('health')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">{t('addVaccination')}</p>
              <p className="text-sm text-gray-500">Track vaccination records</p>
            </button>
            
            <button
              onClick={() => onNavigate('health')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-8 h-8 text-red-600 mb-2" />
              <p className="font-medium text-gray-900">{t('addHealthRecord')}</p>
              <p className="text-sm text-gray-500">Log health information</p>
            </button>
            
            <button
              onClick={() => onNavigate('calendar')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">{t('scheduleAppointment')}</p>
              <p className="text-sm text-gray-500">Book vet visits</p>
            </button>
            
            <button
              onClick={() => onNavigate('training')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Award className="w-8 h-8 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">{t('addTrainingSession')}</p>
              <p className="text-sm text-gray-500">Track progress</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {t('recentActivity')}
        </h3>
        <div className="space-y-4">
          {dogHealthRecords
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((record) => (
              <div key={record.id} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart size={16} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{record.title}</p>
                  <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {record.type}
                </span>
              </div>
            ))}
          
          {dogHealthRecords.length === 0 && (
            <div className="text-center py-8">
              <Clock size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">{t('noData')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};