import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Heart, ArrowLeft, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { VaccinationManagement } from './VaccinationManagement';
import { HealthRecordManagement } from './HealthRecordManagement';
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
  const [activeTab, setActiveTab] = useState<'vaccinations' | 'health-records'>('vaccinations');
  const [showPassport, setShowPassport] = useState(false);

  if (!currentDog) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Dog Selected
          </h2>
          <p className="text-gray-500 mb-6">
            Please select a dog from the sidebar to manage health records
          </p>
          <Button onClick={() => onNavigate('settings')}>
            {t('addDog')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('health')} Management</h2>
            <p className="text-gray-600">Manage health records for {currentDog.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('vaccinations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vaccinations'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Shield size={16} />
              <span>{t('vaccinations')}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('health-records')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'health-records'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Heart size={16} />
              <span>{t('healthRecords')}</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
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
      </div>
    </div>
  );
};