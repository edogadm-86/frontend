import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, User, Phone, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { DogManagement } from './DogManagement';
import { EmergencyContactManagement } from './EmergencyContactManagement';
import { Dog } from '../types';

interface SettingsViewProps {
  currentDog: Dog | null;
  dogs: Dog[];
  onCreateDog: (dogData: Omit<Dog, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => Promise<Dog>;
  onUpdateDog: (dogId: string, dogData: Partial<Dog>) => Promise<Dog>;
  onSelectDog: (dog: Dog) => void;
  onNavigate: (view: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentDog,
  dogs,
  onCreateDog,
  onUpdateDog,
  onSelectDog,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dogs' | 'emergency'>('dogs');

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
            <h2 className="text-2xl font-bold text-gray-900">{t('settings')}</h2>
            <p className="text-gray-600">Manage your dogs and emergency contacts</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dogs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dogs'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <User size={16} />
              <span>{t('myDogs')}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'emergency'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Phone size={16} />
              <span>{t('emergencyContacts')}</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dogs' && (
          <DogManagement
            dogs={dogs}
            onCreateDog={onCreateDog}
            onUpdateDog={onUpdateDog}
            onSelectDog={onSelectDog}
            currentDog={currentDog}
          />
        )}
        {activeTab === 'emergency' && (
          <EmergencyContactManagement />
        )}
      </div>
    </div>
  );
};