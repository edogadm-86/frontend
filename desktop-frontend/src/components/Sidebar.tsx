import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Heart, 
  Calendar, 
  Award, 
  Users, 
  Settings,
  PlusCircle,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  dogs: any[];
  currentDog: any;
  onDogSelect: (dog: any) => void;
  onAddDog: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  dogs,
  currentDog,
  onDogSelect,
  onAddDog,
}) => {
  const { t } = useTranslation();

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard') },
    { id: 'health', icon: Heart, label: t('health') },
    { id: 'calendar', icon: Calendar, label: t('calendar') },
    { id: 'training', icon: Award, label: t('training') },
    { id: 'community', icon: Users, label: t('community') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10  flex items-center justify-center">
                <img
            src="/logo.png"
            alt="eDog Logo"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">eDog</h1>
            <p className="text-sm text-gray-500">Desktop</p>
          </div>
        </div>
      </div>

      {/* Dogs Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            {t('myDogs')}
          </h2>
          <button
            onClick={onAddDog}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <PlusCircle size={16} />
          </button>
        </div>
        
        {dogs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-2">{t('noData')}</p>
            <button
              onClick={onAddDog}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('addDog')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                onClick={() => onDogSelect(dog)}
                className={cn(
                  'flex items-center p-3 rounded-lg cursor-pointer transition-colors',
                  currentDog?.id === dog.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  {dog.profile_picture ? (
                    <img
                      src={dog.profile_picture}
                      alt={dog.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-600">
                      {dog.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {dog.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {dog.breed}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'sidebar-item w-full',
                currentView === item.id && 'active'
              )}
            >
              <item.icon size={20} className="mr-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};