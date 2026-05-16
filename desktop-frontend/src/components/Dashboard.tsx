import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Calendar,
  Shield,
  Award,
  Plus,
  Clock,
  Sparkles,
  Activity,
  Download,
  QrCode
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal } from './ui/Modal';
import {
  statusKeyFromBackend,
  statusKeyFromScore,
} from '../utils/healthI18n';
import { usePwaInstall } from '../hooks/usePwaInstall';

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
  const [showQR, setShowQR] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const { canPromptInstall, showInstallPrompt, isIOS, isStandalone } = usePwaInstall();
  const publicUrl = `/public/dog/${currentDog?.id}`;

  const rawStatus = healthStatus?.status;
  let statusKey = statusKeyFromBackend(rawStatus);
  if (statusKey === 'unknown') {
    const fromScore = statusKeyFromScore(healthStatus?.score);
    if (fromScore) statusKey = fromScore;
  }

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
      <div className="font-jakarta p-4 lg:p-8 min-h-screen bg-[#fbf9f8] dark:bg-[#111316] flex items-center justify-center">
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-[#005da7] to-[#0090e7] rounded-full mx-auto flex items-center justify-center shadow-2xl">
              <Heart size={48} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#005da7] dark:text-[#a4c9ff] mb-4">
            {t('welcome')} to eDog
          </h2>
          <p className="text-xl text-gray-600 dark:text-[#8b919d] mb-8 max-w-md mx-auto">
            {t('addFirstDog')}
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
      onClick: () => onNavigate('health'),
    },
    {
      icon: Heart,
      label: t('healthRecords'),
      value: dogHealthRecords.length,
      color: 'from-red-500 to-pink-500',
      onClick: () => onNavigate('health'),
    },
    {
      icon: Calendar,
      label: t('appointments'),
      value: upcomingAppointments.length,
      color: 'from-green-500 to-emerald-500',
      onClick: () => onNavigate('calendar'),
    },
    {
      icon: Award,
      label: t('trainingSessions'),
      value: dogTrainingSessions.length,
      color: 'from-purple-500 to-violet-500',
      onClick: () => onNavigate('training'),
    },
  ];

  const lastVetVisit = dogHealthRecords
    .filter(record => record.type === 'vet-visit')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const daysSinceLastVet = lastVetVisit
    ? Math.floor((new Date().getTime() - new Date(lastVetVisit.date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleInstall = () => {
    if (canPromptInstall) showInstallPrompt();
    else if (isIOS) setShowIosHelp(true);
    else alert('To install: use your browser menu → Add to Home screen / Install app.');
  };

  const cardClass = 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 shadow-sm rounded-xl';

  return (
    <div className="font-jakarta bg-[#fbf9f8] dark:bg-[#111316] min-h-full p-4 sm:p-6 lg:p-8">
      {/* Modals */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title={t('qrCode')}>
        <div className="flex flex-col items-center gap-2 p-2">
          <h2 className="text-lg font-bold">{currentDog.name}</h2>
          <QRCodeCanvas value={window.location.origin + publicUrl} size={250} />
          <br />
          <p className="text-m text-gray-500 text-center">
            {t('scanCodeToView')} {currentDog.name}.
          </p>
          <Button onClick={() => window.open(publicUrl, '_blank')}>
            {t('previewPublicProfile')}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showIosHelp} onClose={() => setShowIosHelp(false)} title={t('downloadApp')}>
        <div className="space-y-3 text-sm">
          <p>
            On iPhone/iPad: open this site in <b>Safari</b>, tap <b>Share</b>, then choose{' '}
            <b>Add to Home Screen</b>.
          </p>
          <p className="text-gray-500">
            (iOS doesn't allow an automatic install popup like Android.)
          </p>
        </div>
      </Modal>


      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6 max-w-[1400px] mx-auto">

        {/* Pet Hero */}
        <section className="col-span-12 lg:col-span-8 relative rounded-xl overflow-hidden h-[400px] shadow-sm bg-[#1a1c1f]">
          {currentDog.profilePicture ? (
            <img
              src={currentDog.profilePicture}
              alt={currentDog.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#005da7] via-[#004f91] to-[#003870]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111316] via-[#111316]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 lg:p-8 z-10 w-full flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-[#a4c9ff] text-[#00315d] rounded-full text-xs font-semibold">
                  {t('active')}
                </span>
                {currentDog.age && (
                  <span className="px-2 py-1 bg-white/10 text-white rounded text-xs font-medium backdrop-blur-md border border-white/10">
                    {currentDog.age} {t('yearsOld')}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1">
                {currentDog.name}
              </h1>
              <p className="text-[#a4c9ff] text-base lg:text-lg">{currentDog.breed}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate('passport')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium border border-white/10"
              >
                <span className="material-symbols-outlined text-base leading-none">badge</span>{t('petPassport')}
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium border border-white/10"
              >
                <span className="material-symbols-outlined text-base leading-none">edit</span>
                {t('edit')}
              </button>
              <button
                onClick={() => setShowQR(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium border border-white/10"
              >
                <QrCode size={15} />{t('qrCode')}
              </button>
            </div>
          </div>
        </section>

        {/* Health Summary */}
        <section className="col-span-12 lg:col-span-4">
          <div className={`${cardClass} p-6 h-full flex flex-col`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#005da7] dark:text-[#a4c9ff]">
                {t('healthSummary')}
              </h2>
              <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff]">analytics</span>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff]">weight</span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-[#8b919d] text-xs">{t('weight')}</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-[#e2e2e6]">
                    {currentDog.weight} <span className="text-sm font-normal">{t('kg')}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">event</span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-[#8b919d] text-xs">{t('sinceLastVetVisit')}</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-[#e2e2e6]">
                    {daysSinceLastVet !== null
                      ? t('daysSinceLastVet_plural', { count: daysSinceLastVet })
                      : t('noData')}
                  </p>
                </div>
              </div>
            </div>

            {healthStatus?.hasEnoughData && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-[#8b919d]">{t('weeklyVitalScore')}</span>
                  <span className="text-sm text-[#005da7] dark:text-[#a4c9ff] font-bold">
                    {healthStatus.score}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-[#333538] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#005da7] dark:bg-[#a4c9ff] rounded-full transition-all duration-500"
                    style={{ width: `${healthStatus.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-[#8b919d] mt-2">
                  {t('healthStatus')}:{' '}
                  <span className="text-[#005da7] dark:text-[#a4c9ff] font-medium">{t(statusKey)}</span>
                </p>
              </div>
            )}

            {!isStandalone && (
              <button
                onClick={handleInstall}
                className="w-full mt-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-500 dark:text-[#8b919d] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} />{t('downloadApp')}
              </button>
            )}
          </div>
        </section>

        {/* Stats row */}
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={stat.onClick}
            className={`col-span-6 lg:col-span-3 ${cardClass} p-4 lg:p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-[#e2e2e6]">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-[#8b919d]">{stat.label}</div>
          </div>
        ))}

        {/* Upcoming Appointments + ChatBot */}
        <section className={`col-span-12 md:col-span-6 lg:col-span-5 ${cardClass} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-amber-600 dark:text-[#ffd798]">
              {t('upcomingAppointments')}
            </h2>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-sm text-[#005da7] dark:text-[#a4c9ff] font-medium hover:opacity-80"
            >
              {t('viewAll')}
            </button>
          </div>
          <MiniCalendar appointments={dogAppointments} onNavigate={onNavigate} />
        </section>

        {/* Recent Activity + Quick Actions */}
        <section className={`col-span-12 md:col-span-6 lg:col-span-7 ${cardClass} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#e2e2e6]">
              {t('recentActivity')}
            </h2>
            <button
              onClick={() => onNavigate('health')}
              className="text-sm text-[#005da7] dark:text-[#a4c9ff] font-bold hover:opacity-80"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Activity items */}
            <div className="flex-1 space-y-3">
              {dogHealthRecords
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 4)
                .map(record => (
                  <div
                    key={record.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-[#1a1c1f] border border-gray-100 dark:border-white/5 flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 flex items-center justify-center flex-shrink-0">
                      <Heart size={15} className="text-[#005da7] dark:text-[#a4c9ff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-[#e2e2e6] text-sm truncate">
                        {record.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#8b919d]">{formatDate(record.date)}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-[#333538] text-gray-500 dark:text-[#c1c7d3] rounded-full flex-shrink-0">
                      {record.type}
                    </span>
                  </div>
                ))}
              {dogHealthRecords.length === 0 && (
                <div className="text-center py-8">
                  <Clock size={32} className="mx-auto mb-2 text-gray-300 dark:text-[#414751]" />
                  <p className="text-gray-500 dark:text-[#8b919d] text-sm">{t('noData')}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="lg:w-5/12 grid grid-cols-2 gap-2 content-start">
              <button
                onClick={() => onNavigate('health')}
                className="p-3 text-left border border-gray-200 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Shield className="text-white" size={16} />
                </div>
                <p className="font-medium text-gray-900 dark:text-[#e2e2e6] text-xs leading-tight">
                  {t('addVaccination')}
                </p>
              </button>
              <button
                onClick={() => onNavigate('health')}
                className="p-3 text-left border border-gray-200 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Heart className="text-white" size={16} />
                </div>
                <p className="font-medium text-gray-900 dark:text-[#e2e2e6] text-xs leading-tight">
                  {t('addHealthRecord')}
                </p>
              </button>
              <button
                onClick={() => onNavigate('calendar')}
                className="p-3 text-left border border-gray-200 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Calendar className="text-white" size={16} />
                </div>
                <p className="font-medium text-gray-900 dark:text-[#e2e2e6] text-xs leading-tight">
                  {t('scheduleAppointment')}
                </p>
              </button>
              <button
                onClick={() => onNavigate('training')}
                className="p-3 text-left border border-gray-200 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Award className="text-white" size={16} />
                </div>
                <p className="font-medium text-gray-900 dark:text-[#e2e2e6] text-xs leading-tight">
                  {t('addTrainingSession')}
                </p>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

// Mini Calendar Component for Dashboard
const MiniCalendar: React.FC<{ appointments: any[]; onNavigate: (view: string) => void }> = ({
  appointments,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const today = new Date();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const getAppointmentsForDate = (date: Date) =>
    appointments.filter(apt => new Date(apt.date).toDateString() === date.toDateString());

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4 mt-4">
      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => {
          const date = weekDates[index];
          const dayAppointments = getAppointmentsForDate(date);
          const isToday = date.toDateString() === today.toDateString();

          return (
            <div key={index} className="text-center">
              <div className="text-xs font-medium text-gray-400 dark:text-[#8b919d] mb-1">{day}</div>
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-1
                  ${isToday
                    ? 'bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                    : 'text-gray-700 dark:text-[#c1c7d3] hover:bg-gray-100 dark:hover:bg-[#282a2d]'}
                  ${dayAppointments.length > 0 && !isToday ? 'ring-2 ring-[#005da7]/40 dark:ring-[#a4c9ff]/40' : ''}
                `}
              >
                {date.getDate()}
              </div>
              {dayAppointments.length > 0 && (
                <div className="w-1.5 h-1.5 bg-[#005da7] dark:bg-[#a4c9ff] rounded-full mx-auto" />
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming list */}
      <div className="space-y-2">
        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map(appointment => (
            <div
              key={appointment.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1a1c1f] rounded-xl border border-gray-100 dark:border-white/5"
            >
              <div className="w-8 h-8 bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar size={14} className="text-[#005da7] dark:text-[#a4c9ff]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-[#e2e2e6] text-sm truncate">
                  {appointment.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-[#8b919d]">
                  {formatDate(appointment.date)} at {appointment.time}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <Calendar size={24} className="mx-auto mb-2 text-gray-300 dark:text-[#414751]" />
            <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('noUpcomingAppointments')}</p>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-sm text-[#005da7] dark:text-[#a4c9ff] hover:opacity-80 font-medium mt-1"
            >
              {t('scheduleOneNow')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
