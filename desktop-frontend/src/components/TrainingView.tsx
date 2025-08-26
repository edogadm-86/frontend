import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { TrainingManagement } from './TrainingManagement';
import { Dog } from '../types';

interface TrainingViewProps {
  currentDog: Dog | null;
  dogs: Dog[];
  onNavigate: (view: string) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  currentDog,
  dogs,
  onNavigate,
}) => {
  const { t } = useTranslation();

  if (!currentDog) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Award size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Dog Selected
          </h2>
          <p className="text-gray-500 mb-6">
            Please select a dog from the sidebar to manage training sessions
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
            <h2 className="text-2xl font-bold text-gray-900">{t('training')}</h2>
            <p className="text-gray-600">Track training progress for {currentDog.name}</p>
          </div>
        </div>
      </div>

      {/* Training Management */}
      <TrainingManagement
        dogId={currentDog.id}
        dogName={currentDog.name}
      />
    </div>
  );
};