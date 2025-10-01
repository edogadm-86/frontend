import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  User,
  Heart,
  FileText,
  X,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '../lib/api';

interface PetPassportProps {
  dog: any;
  onClose: () => void;
}

export const PetPassport: React.FC<PetPassportProps> = ({ dog, onClose }) => {
  const { t } = useTranslation();
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPassportData();
  }, [dog.id]);

  

  const loadPassportData = async () => {
    try {
      const [vaccinationsRes, healthRes] = await Promise.all([
        (apiClient as any).getVaccinations?.(dog.id),
        (apiClient as any).getHealthRecords?.(dog.id),
      ]);

      setVaccinations(vaccinationsRes?.vaccinations ?? []);
      setHealthRecords(healthRes?.healthRecords ?? []);
    } catch (error) {
      console.error(t('Error loading passport data:'), error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blueblue-500 mx-auto mb-4" />
          <p>{t('Loading passport data...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-md w-full h-[85vh] overflow-y-auto rounded-2xl shadow-2xl relative z-[10000]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <img src="/logo-1.png" alt="EU Logo" className="w-8 h-12" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{t('EUROPEAN UNION')}</h1>
                <p className="text-blue-100 text-sm">{t('Pet Passport')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* I. Details of the pet */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <FileText className="mr-2" size={18} />
              {t('I. Details of the pet')}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white border-4 border-white rounded-lg shadow-lg overflow-hidden">
                  {dog?.profilePicture ? (
                    <img
                      src={dog.profilePicture}
                      alt={dog.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Heart size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="bg-white/50 border border-gray-200 rounded-lg p-2 mb-2">
                    <label className="block text-xs font-semibold text-gray-700">{t('name')}</label>
                    <p className="text-sm font-bold text-gray-900">{dog.name}</p>
                  </div>
                  <div className="bg-white/50 border border-gray-200 rounded-lg p-2">
                    <label className="block text-xs font-semibold text-gray-700">{t('Species')}</label>
                    <p className="text-sm text-gray-900">{t('Dog')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/50 border border-gray-200 rounded-lg p-2">
                  <label className="block text-xs font-semibold text-gray-700">{t('Breed')}</label>
                  <p className="text-sm text-gray-900">{dog.breed}</p>
                </div>
                <div className="bg-white/50 border border-gray-200 rounded-lg p-2">
                  <label className="block text-xs font-semibold text-gray-700">{t('sex')}</label>
                  <p className="text-sm text-gray-900">{dog.sex}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/50 border border-gray-200 rounded-lg p-2">
                  <label className="block text-xs font-semibold text-gray-700">{t('dateOfBirth')}</label>
                  <p className="text-sm text-gray-900">
                     {dog.dateOfBirth
                                            ? typeof dog.dateOfBirth === 'string'
                                              ? dog.dateOfBirth
                                              : format(dog.dateOfBirth, 'yyyy-MM-dd')
                                            : ''}
                                          {' '}
                  </p>
                </div>
                <div className="bg-white/50 border border-gray-200 rounded-lg p-2">
                  <label className="block text-xs font-semibold text-gray-700">{t('weight')}</label>
                  <p className="text-sm text-gray-900">{dog.weight} kg</p>
                </div>
              </div>
            </div>
          </div>

          {/* II. Marking of the pet */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <Shield className="mr-2" size={18} />
              {t('II. Marking of the pet')}
            </h2>

            <div className="space-y-3">
              <div className="bg-white/50 border border-gray-200 rounded-lg p-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('microchipId')}
                </label>
                <p className="text-lg font-mono font-bold text-gray-900">
                  {dog.microchipId || 'Not registered'}
                </p>
              </div>

              <div className="bg-white/50 border border-gray-200 rounded-lg p-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('Date of application')}
                </label>
                <p className="text-sm text-gray-900">{format(dog.createdAt, 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>

          {/* III. Rabies vaccination */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <Shield className="mr-2" size={18} />
              {t('III. Rabies vaccinations')}
            </h2>

            {vaccinations.filter((v) => v.vaccine_name?.toLowerCase?.().includes('rabies')).length >
            0 ? (
              <div className="space-y-3">
                {vaccinations
                  .filter((v) => v.vaccine_name?.toLowerCase?.().includes('rabies'))
                  .map((vaccination) => (
                    <div
                      key={vaccination.id}
                      className="bg-white/50 border border-gray-200 rounded-lg p-3"
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block font-semibold text-gray-700">{t('Vaccine')}</label>
                          <p className="text-gray-900">{vaccination.vaccine_name}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">{t('Date')}</label>
                          <p className="text-gray-900">
                            {format(new Date(vaccination.date_given), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">{t('Valid until')}</label>
                          <p className="text-gray-900">
                            {vaccination.next_due_date
                              ? format(new Date(vaccination.next_due_date), 'MMM dd, yyyy')
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">{t('Veterinarian')}</label>
                          <p className="text-gray-900">{vaccination.veterinarian}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white/50 border border-gray-200 rounded-lg p-6 text-center">
                <Shield size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">{t('No rabies vaccination recorded')}</p>
              </div>
            )}
          </div>

          {/* IV. Other vaccinations */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <Heart className="mr-2" size={18} />
              {t('IV. Other vaccinations')}
            </h2>

            {vaccinations.filter((v) => !v.vaccine_name?.toLowerCase?.().includes('rabies')).length >
            0 ? (
              <div className="space-y-2">
                {vaccinations
                  .filter((v) => !v.vaccine_name?.toLowerCase?.().includes('rabies'))
                  .map((vaccination: any) => (
                    <div
                      key={vaccination.id}
                      className="bg-white/50 border border-gray-200 rounded-lg p-3"
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block font-semibold text-gray-700">{t('Vaccine')}</label>
                          <p className="text-gray-900">{vaccination.vaccine_name}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">{t('Date')}</label>
                          <p className="text-gray-900">
                            {format(new Date(vaccination.date_given), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white/50 border border-gray-200 rounded-lg p-6 text-center">
                <Heart size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">No other vaccinations recorded</p>
              </div>
            )}
          </div>

          {/* V. Health information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <User className="mr-2" size={18} />
              {t('V. Health information')}
            </h2>

            {healthRecords.length > 0 ? (
              <div className="space-y-2">
                {healthRecords.slice(0, 3).map((record: any) => (
                  <div
                    key={record.id}
                    className="bg-white/50 border border-gray-200 rounded-lg p-3"
                  >
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block font-semibold text-gray-700">{t('Date')}</label>
                        <p className="text-gray-900">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700">{t('Type')}</label>
                        <p className="text-gray-900 capitalize">
                          {record.type?.replace?.('-', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-gray-700">{t('Details')}</label>
                      <p className="text-xs text-gray-900">{record.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/50 border border-gray-200 rounded-lg p-6 text-center">
                <User size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">{t('No health records available')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">{t('Issued by:')} Edog</p>
                <p className="text-xs opacity-75">
                  {t('Date of issue:')} {format(dog.createdAt, 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-300" size={12} />
                <span className="text-xs">{t('Valid for EU travel')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
