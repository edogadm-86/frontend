import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from './ui/Card';
import {
  statusKeyFromBackend,
  statusKeyFromScore,
  actionKeyFromBackend,
} from '../lib/healthI18n';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import {
  Calendar,
  Heart,
  Shield,
  Award,
  AlertCircle,
  Plus,
  TrendingUp,
  Activity,
  Target,
  Clock,
  Sparkles,
  FileText,
  Edit2,
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { PetPassport } from './PetPassport';
import { cacheImageToDevice } from '../lib/imageCache';
import { Dog } from '../types';
import { Input } from './ui/Input';
import { FileUpload } from './ui/FileUpload';
import { useApi } from '../hooks/useApi';
import { normalizeUploadUrl } from '../lib/urlHelpers';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentDog, vaccinations, healthRecords, appointments, trainingSessions } = useApp();
  const { t } = useTranslation();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const [formData, setFormData] = useState<{
    name?: string;
    breed?: string;
    dateOfBirth?: string; // always a string
    weight?: string | number;
    profilePicture?: string;
    microchipId?: string;
    passportNumber?: string;
    sex?: string;
    colour?: string;
    features?: string;
  }>({});
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [isDogModalOpen, setIsDogModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const { createDog, updateDog } = useApi();

  // files state for FileUpload
  const [files, setFiles] = useState<File[]>([]);

  const [dismissedAlerts, setDismissedAlerts] = useState<{ overdue: boolean; dueSoon: boolean }>({
    overdue: false,
    dueSoon: false,
  });

  const blobRef = useRef<string | null>(null);
  const [showPassport, setShowPassport] = useState(false);

  const handleCreateDog = () => {
    setEditingDog(null);
    setFormData({
      name: '',
      breed: '',
      dateOfBirth: '',
      weight: '',
      profilePicture: '',
      microchipId: '',
      passportNumber: '',
      sex: '',
      colour: '',
      features: '',
    });
    setFiles([]);
    setIsDogModalOpen(true);
  };

  const handleEditDog = () => {
    if (!currentDog) return;
    setEditingDog(currentDog);
    setFormData({
      name: currentDog.name || '',
      breed: currentDog.breed || '',
      dateOfBirth: currentDog.dateOfBirth
        ? typeof currentDog.dateOfBirth === 'string'
          ? currentDog.dateOfBirth
          : new Date(currentDog.dateOfBirth).toISOString().split('T')[0]
        : '',
      weight: currentDog.weight?.toString() || '',
      profilePicture: currentDog.profilePicture || '',
      microchipId: currentDog.microchipId || '',
      passportNumber: currentDog.passportNumber || '',
      sex: currentDog.sex || '',
      colour: currentDog.colour || '',
      features: currentDog.features || '',
    });
    setFiles([]);
    setIsDogModalOpen(true);
  };

  const handleSubmitDog = async (e: React.FormEvent) => {
    e.preventDefault();
    const dogData: Partial<Dog> = {
      name: formData.name,
      breed: formData.breed,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      weight: parseFloat(formData.weight as string),
      profilePicture: formData.profilePicture || undefined,
      microchipId: formData.microchipId || undefined,
      passportNumber: formData.passportNumber || undefined,
      sex: formData.sex || undefined,
      colour: formData.colour || undefined,
      features: formData.features || undefined,
    };
    try {
      if (editingDog) {
        await updateDog(editingDog.id, dogData);
      } else {
        await createDog(dogData as any);
      }
      setIsDogModalOpen(false);
    } catch (err) {
      console.error('Error saving dog:', err);
    }
  };
    // Debug effect
  useEffect(() => {
   
    if (currentDog?.id) {
      loadHealthStatus();
    } else {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDog?.id]);

  const loadHealthStatus = async () => {
    if (!currentDog?.id) {
      return;
    }


    if (typeof (apiClient as any).getDogHealthStatus !== 'function') {
      setHealthStatus(null);
      return;
    }

    setLoadingHealth(true);
    try {
      const response = await (apiClient as any).getDogHealthStatus(currentDog.id);

      const normalized = response?.data ?? response;

      setHealthStatus(normalized);
    } catch (error) {
    } finally {
      setLoadingHealth(false);
    }
  };
  useEffect(() => {
  if (currentDog && isDogModalOpen) {
    setFormData({
      name: currentDog.name || '',
      breed: currentDog.breed || '',
      dateOfBirth: currentDog.dateOfBirth
        ? typeof currentDog.dateOfBirth === 'string'
          ? currentDog.dateOfBirth
          : new Date(currentDog.dateOfBirth).toISOString().split('T')[0]
        : '',
      weight: currentDog.weight?.toString() || '',
      profilePicture: currentDog.profilePicture || '',
      microchipId: currentDog.microchipId || '',
      passportNumber: currentDog.passportNumber || '',
      sex: currentDog.sex || '',
      colour: currentDog.colour || '',
      features: currentDog.features || '',
    });
  }
}, [currentDog, isDogModalOpen]);

  // Cache avatar locally whenever the profile picture URL changes
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLocalAvatar(null);
      if (!currentDog?.profilePicture) return;

      try {
        const localUrl = await cacheImageToDevice(currentDog.profilePicture);
        if (cancelled) return;

        const prevBlob = blobRef.current;
        setLocalAvatar(localUrl);

        if (localUrl.startsWith('blob:')) {
          blobRef.current = localUrl;
        } else {
          blobRef.current = null;
        }

        if (prevBlob) {
          setTimeout(() => {
            try {
              URL.revokeObjectURL(prevBlob);
            } catch {}
          }, 0);
        }
      } catch (e) {
        console.warn('Avatar cache failed:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentDog?.profilePicture]);

  useEffect(() => {
    if (healthStatus) {
     
    }
  }, [healthStatus]);

  useEffect(() => {
    return () => {
      if (blobRef.current) {
        try {
          URL.revokeObjectURL(blobRef.current);
        } catch {}
        blobRef.current = null;
      }
    };
  }, []);

  if (!currentDog) {
    return (
      <div className="p-4 space-y-4">
        <Card className="text-center py-8">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-pulse">
              <Heart size={32} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            {t('welcome')} to eDog!
          </p>
          <p className="text-sm text-gray-600 mb-4">{t('createdog')}</p>
          <Button
            onClick={handleCreateDog}
            className="bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500"
          >
            <Plus size={16} className="mr-1" />
            {t('Add Dog')}
          </Button>
        </Card>
      </div>
    );
  }
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const dogVaccinations = vaccinations.filter((v) => v.dogId === currentDog.id);
  const dogHealthRecords = healthRecords.filter((r) => r.dogId === currentDog.id);
  const dogAppointments = appointments.filter((a) => a.dogId === currentDog.id);
  const dogTrainingSessions = trainingSessions.filter((s) => s.dogId === currentDog.id);

  const upcomingAppointments = dogAppointments
    .filter((a) => isAfter(a.date, new Date()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const overdueVaccinations = dogVaccinations.filter((v) => {
    if (!v.nextDueDate) return false;
    return isBefore(v.nextDueDate, new Date());
  });

  const vaccinationsDueSoon = dogVaccinations.filter((v) => {
    if (!v.nextDueDate) return false;
    const today = new Date();
    const warningDate = addDays(v.nextDueDate, -30);
    return isAfter(today, warningDate) && isBefore(today, v.nextDueDate);
  });

  let statusKey = statusKeyFromBackend(healthStatus?.status);
  if (statusKey === 'unknown') {
    const fromScore = statusKeyFromScore(healthStatus?.score);
    if (fromScore) statusKey = fromScore;
    else if (healthStatus?.status) statusKey = healthStatus.status;
  }

  useEffect(() => {
  if (healthStatus) {
  
  }
}, [healthStatus]);
useEffect(() => {
  return () => {
    if (blobRef.current) {
      try { URL.revokeObjectURL(blobRef.current); } catch {}
      blobRef.current = null;
    }
  };
}, []);
  const stats = [
    {
      icon: Shield,
      label: t('Vaccinations'),
      value: dogVaccinations.length,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      onClick: () => onNavigate('health'),
    },
    {
      icon: Heart,
      label: t('Health Records'),
      value: dogHealthRecords.length,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50',
      onClick: () => onNavigate('health'),
    },
    {
      icon: Calendar,
      label: t('Appointments'),
      value: upcomingAppointments.length,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      onClick: () => onNavigate('calendar'),
    },
    {
      icon: Award,
      label: t('Training Sessions'),
      value: dogTrainingSessions.length,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50',
      onClick: () => onNavigate('training'),
    },
  ];

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'from-green-500 to-emerald-500';
      case 'Good':
        return 'from-blue-500 to-cyan-500';
      case 'Fair':
        return 'from-yellow-500 to-orange-500';
      case 'Needs Attention':
        return 'from-orange-500 to-red-500';
      case 'Poor':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  // Calculate days since last vet visit
  const lastVetVisit = dogHealthRecords
    .filter((record) => record.type === 'vet-visit')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const daysSinceLastVet = lastVetVisit
    ? Math.floor(
        (new Date().getTime() - new Date(lastVetVisit.date).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

if (statusKey === 'unknown') {
  const fromScore = statusKeyFromScore(healthStatus?.score);
  if (fromScore) statusKey = fromScore;
  else if (healthStatus?.status) statusKey = healthStatus.status; // fallback to raw
}
  return (
    <div className="p-4 space-y-4">
      {/* Dog Profile Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blueblue-200/30 to-light-bluelight-blue-200/30 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                 {localAvatar ? (
                  <img
                    src={localAvatar}
                    alt={currentDog.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                    onError={(e) => {
                      // hide broken image; initials below will show on next render
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      setLocalAvatar(null);
                    }}
                  />
                ) : (
                  // No image until the blob/local file URL is ready — avoids the blocked remote request
                  <span className="text-2xl font-bold text-white">
                    {currentDog.name.charAt(0).toUpperCase()}
                  </span>
                )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center border-2 border-white">
                  <Activity size={10} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blueblue-600 to-light-bluelight-blue-600 bg-clip-text text-transparent">
                  {currentDog.name}
                </h2>
                <p className="text-gray-600">{currentDog.breed}</p>
                <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    <span>
                      {currentDog.dateOfBirth
                        ? typeof currentDog.dateOfBirth === 'string'
                          ? currentDog.dateOfBirth
                          : format(currentDog.dateOfBirth, 'yyyy-MM-dd')
                        : ''}
                      {' '}
                      {t('years old')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span>{currentDog.weight} kg</span>
                  </div>
                </div>
              </div>
            </div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
            <Button
                onClick={handleEditDog}
                variant="ghost"
                size="sm"
                className="text-blueblue-500"
              >
                <Edit2 size={16} />
              </Button>
            <Button
              onClick={() => setShowPassport(true)}
              variant="ghost"
              size="sm"
              className="text-blueblue-500"
            >
              <FileText size={16} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Health Status Banner */}
      {healthStatus?.hasEnoughData && (
        <Card
          className={`bg-gradient-to-r ${
            healthStatus.statusColor === 'green'
              ? 'from-green-50 to-emerald-50 border-green-200'
              : healthStatus.statusColor === 'blue'
              ? 'from-blue-50 to-cyan-50 border-blue-200'
              : healthStatus.statusColor === 'yellow'
              ? 'from-yellow-50 to-orange-50 border-yellow-200'
              : healthStatus.statusColor === 'orange'
              ? 'from-orange-50 to-red-50 border-orange-200'
              : healthStatus.statusColor === 'red'
              ? 'from-red-50 to-pink-50 border-red-200'
              : 'from-gray-50 to-slate-50 border-gray-200'
          } border shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${getHealthStatusColor(
                  healthStatus.status,
                )} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Target size={20} className="text-white" />
              </div>
              <div>
                <h3
                  className={`font-bold ${
                    healthStatus.statusColor === 'green'
                      ? 'text-green-800'
                      : healthStatus.statusColor === 'blue'
                      ? 'text-blue-800'
                      : healthStatus.statusColor === 'yellow'
                      ? 'text-yellow-800'
                      : healthStatus.statusColor === 'orange'
                      ? 'text-orange-800'
                      : healthStatus.statusColor === 'red'
                      ? 'text-red-800'
                      : 'text-gray-800'
                  }`}
                >
                  {t(statusKey)}
                </h3>
                <p
                  className={`text-sm ${
                    healthStatus.statusColor === 'green'
                      ? 'text-green-600'
                      : healthStatus.statusColor === 'blue'
                      ? 'text-blue-600'
                      : healthStatus.statusColor === 'yellow'
                      ? 'text-yellow-600'
                      : healthStatus.statusColor === 'orange'
                      ? 'text-orange-600'
                      : healthStatus.statusColor === 'red'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                {t(actionKeyFromBackend(healthStatus?.nextAction))}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${
                  healthStatus.statusColor === 'green'
                    ? 'text-green-600'
                    : healthStatus.statusColor === 'blue'
                    ? 'text-blue-600'
                    : healthStatus.statusColor === 'yellow'
                    ? 'text-yellow-600'
                    : healthStatus.statusColor === 'orange'
                    ? 'text-orange-600'
                    : healthStatus.statusColor === 'red'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {healthStatus.score}%
              </div>
              <div className="text-xs text-gray-500">{t('healthScore')}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Alerts */}
      {overdueVaccinations.length > 0 && !dismissedAlerts.overdue && (
  <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-lg relative">
    <button
      onClick={() => setDismissedAlerts(prev => ({ ...prev, overdue: true }))}
      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
    >
      ✕
    </button>
    <div className="flex items-center space-x-2">
      <AlertCircle size={20} className="text-red-500" />
      <div>
        <p className="font-medium text-red-900">
          {overdueVaccinations.length} {t('vaccination')}
          {overdueVaccinations.length > 1 ? 's' : ''} {t('overdue')}
        </p>
        <p className="text-sm text-red-700">
          {t('Please schedule an appointment with your vet')}
        </p>
      </div>
    </div>
  </Card>
)}

{vaccinationsDueSoon.length > 0 && !dismissedAlerts.dueSoon && (
  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg relative">
    <button
      onClick={() => setDismissedAlerts(prev => ({ ...prev, dueSoon: true }))}
      className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800"
    >
      ✕
    </button>
    <div className="flex items-center space-x-2">
      <AlertCircle size={20} className="text-yellow-600" />
      <div>
        <p className="font-medium text-yellow-900">
          {vaccinationsDueSoon.length} {t('vaccination')}
          {vaccinationsDueSoon.length > 1 ? 's' : ''} {t('due soon')}
        </p>
        <p className="text-sm text-yellow-700">
          {t('Consider scheduling an appointment')}
        </p>
      </div>
    </div>
  </Card>
)}


      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <Card
            key={index}
            onClick={stat.onClick}
            className="cursor-pointer bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <stat.icon size={18} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(stat.value * 10, 100)}%` }}
              ></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={14} className="text-white" />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {daysSinceLastVet !== null ? `${daysSinceLastVet}` : 'N/A'}
          </div>
          <div className="text-xs text-gray-600">{t('daysSinceLastVet')}</div>
        </Card>

        <Card className="text-center bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Activity size={14} className="text-white" />
          </div>
          <div className="text-lg font-bold text-gray-900">{dogVaccinations.length}</div>
          <div className="text-xs text-gray-600">{t('Vaccinations')}</div>
        </Card>

        <Card className="text-center bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Heart size={14} className="text-white" />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {t(statusKey)}
          </div>
          <div className="text-xs text-gray-600">{t('healthStatus')}</div>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="mr-2 text-blueblue-500" size={18} />
              {t('Upcoming Appointments')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('calendar')}
              className="text-blueblue-500"
            >
              {t('View All')}
            </Button>
          </div>
          <div className="space-y-2">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div>
                  <p className="font-medium text-gray-900">{appointment.title}</p>
                  <p className="text-sm text-gray-600">
                    {format(appointment.date, 'MMM dd')} at {appointment.time}
                  </p>
                  {appointment.location && (
                    <p className="text-xs text-gray-500">{appointment.location}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-xs rounded-full font-medium">
                    {appointment.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Health Records */}
      {dogHealthRecords.length > 0 && (
        <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2 text-blueblue-500" size={18} />
              {t('Recent Health Records')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('health')}
              className="text-blueblue-500"
            >
              {t('View All')}
            </Button>
          </div>
          <div className="space-y-2">
            {dogHealthRecords
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map((record) => (
                <div
                  key={record.id}
                  className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Heart size={12} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{record.title}</p>
                    <p className="text-sm text-gray-600">
                      {format(record.date, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs rounded-full font-medium">
                    {record.type}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Sparkles className="mr-2 text-blueblue-500" size={18} />
          {t('quickActions')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('health')}
            className="group p-4 text-left border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Shield className="text-white" size={14} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{t('addVaccination')}</p>
            <p className="text-xs text-gray-500">{t('trackVaccination')}</p>
          </button>

          <button
            onClick={() => onNavigate('health')}
            className="group p-4 text-left border-2 border-red-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Heart className="text-white" size={14} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{t('addHealthRecord')}</p>
            <p className="text-xs text-gray-500">{t('logHealthInformation')}</p>
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className="group p-4 text-left border-2 border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="text-white" size={14} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{t('scheduleAppointment')}</p>
            <p className="text-xs text-gray-500">{t('bookVisit')}</p>
          </button>

          <button
            onClick={() => onNavigate('training')}
            className="group p-4 text-left border-2 border-purple-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Award className="text-white" size={14} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{t('addTrainingSession')}</p>
            <p className="text-xs text-gray-500">{t('trackProgress')}</p>
          </button>
        </div>
      </Card>
        {isDogModalOpen && (
        <Modal
          isOpen={isDogModalOpen}
          onClose={() => setIsDogModalOpen(false)}
          title={editingDog ? t('Edit Dog') : t('Add Dog')}
          className="max-w-lg"
        >
          <form onSubmit={handleSubmitDog} className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="text-center">
              <label className="block text-sm font-medium mb-2">
                {t('profilePicture')}
              </label>
              <FileUpload
                accept="image/*"
                maxFiles={1}
                files={files}
                onFilesChange={setFiles}
                className="mx-auto"
              />
            </div>

            <Input label={t('name')} value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label={t('breed')} value={formData.breed || ''} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} required />
            <Input type="date" label={t('dateOfBirth')} value={formData.dateOfBirth || ''} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
            <Input type="number" label={`${t('weight')} (kg)`} value={formData.weight?.toString() || ''} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} required />
            <Input label={t('microchipId')} value={formData.microchipId || ''} onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })} />
            <Input label={t('passportNumber')} value={formData.passportNumber || ''} onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })} />
            <Input label={t('colour')} value={formData.colour || ''} onChange={(e) => setFormData({ ...formData, colour: e.target.value })} />
            <Input label={t('features')} value={formData.features || ''} onChange={(e) => setFormData({ ...formData, features: e.target.value })} />

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDogModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="flex-1">
                {t('save')}
              </Button>
            </div>
          </form>
        </Modal>
      )}



      {/* Pet Passport Modal */}
      {showPassport && <PetPassport dog={currentDog} onClose={() => setShowPassport(false)} />}
    </div>
  );
};
