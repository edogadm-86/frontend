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
  Sparkles,
  ShoppingBag
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
    { id: 'dashboard', icon: Home, label: t('dashboard'), gradient: 'from-blue-500 to-cyan-500' },
    { id: 'health', icon: Heart, label: t('health'), gradient: 'from-red-500 to-pink-500' },
    { id: 'calendar', icon: Calendar, label: t('calendar'), gradient: 'from-green-500 to-emerald-500' },
    { id: 'training', icon: Award, label: t('training'), gradient: 'from-purple-500 to-violet-500' },
    { id: 'community', icon: Users, label: t('community'), gradient: 'from-orange-500 to-amber-500' },
    { id: 'shop', icon: ShoppingBag, label: t('Shop & Services'), gradient: 'from-pink-500 to-rose-500' },
    { id: 'settings', icon: Settings, label: t('settings'), gradient: 'from-gray-500 to-slate-500' },
  ];

  return (
    <div className="w-80 bg-white/60 backdrop-blur-md border-r border-white/20 flex flex-col h-full shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <img
              src="/logo.png"
              alt="eDog Logo"
              className="w-8 h-8"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">eDog</h1>
            <p className="text-sm text-gray-500 flex items-center">
              <Sparkles size={12} className="mr-1" />
              Desktop
            </p>
          </div>
        </div>
      </div>

      {/* Dogs Section */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center">
            <Heart size={14} className="mr-2 text-primary-500" />
            {t('myDogs')}
          </h2>
          <button
            onClick={onAddDog}
            className="p-2 text-primary-500 hover:text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-200 hover:scale-110"
          >
            <PlusCircle size={16} />
          </button>
        </div>
        
        {dogs.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Heart size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-3">{t('noData')}</p>
            <button
              onClick={onAddDog}
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-all duration-200"
            >
              {t('addDog')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                onClick={() => onDogSelect(dog)}
                className={cn(
                  'flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 group',
                  currentDog?.id === dog.id
                    ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'hover:bg-white/80 hover:shadow-lg hover:transform hover:scale-105'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-md transition-all duration-300',
                  currentDog?.id === dog.id
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-primary-100 group-hover:to-blue-100'
                )}>
                  {dog.profile_picture ? (
                    <img
                      src={dog.profile_picture}
                      alt={dog.name}
                      className="w-12 h-12 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className={cn(
                      'text-lg font-bold',
                      currentDog?.id === dog.id ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'
                    )}>
                      {dog.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-semibold truncate transition-colors',
                    currentDog?.id === dog.id ? 'text-white' : 'text-gray-900 group-hover:text-primary-700'
                  )}>
                    {dog.name}
                  </p>
                  <p className={cn(
                    'text-sm truncate transition-colors',
                    currentDog?.id === dog.id ? 'text-white/80' : 'text-gray-500 group-hover:text-primary-500'
                  )}>
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
                'sidebar-item w-full group',
                currentView === item.id && 'active'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all duration-300',
                currentView === item.id 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : `bg-gradient-to-r ${item.gradient} opacity-80 group-hover:opacity-100`
              )}>
                <item.icon size={20} className={cn(
                  'transition-all duration-300',
                  currentView === item.id ? 'text-white' : 'text-white group-hover:scale-110'
                )} />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/20">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Made with <Heart size={12} className="inline text-red-500" /> for dog lovers
          </p>
        </div>
      </div>
    </div>
  );
};