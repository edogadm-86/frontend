import React from 'react';
import { Home, Calendar, Heart, Award, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: t('Home'), 
      gradient: 'from-blue-500 to-cyan-500',
      activeColor: 'text-blue-600',
      inactiveColor: 'text-gray-400'
    },
    { 
      id: 'calendar', 
      icon: Calendar, 
      label: t('Calendar1'), 
      gradient: 'from-green-500 to-emerald-500',
      activeColor: 'text-green-600',
      inactiveColor: 'text-gray-400'
    },
    { 
      id: 'health', 
      icon: Heart, 
      label: t('Health'), 
      gradient: 'from-red-500 to-pink-500',
      activeColor: 'text-red-600',
      inactiveColor: 'text-gray-400'
    },
    { 
      id: 'training', 
      icon: Award, 
      label: t('Training'), 
      gradient: 'from-purple-500 to-violet-500',
      activeColor: 'text-purple-600',
      inactiveColor: 'text-gray-400'
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: t('Settings'), 
      gradient: 'from-gray-500 to-slate-500',
      activeColor: 'text-gray-600',
      inactiveColor: 'text-gray-400'
    },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-t border-white/30 px-2 py-2 shadow-2xl safe-area-bottom">
      <div className="flex justify-around items-center">
        {navItems.map(({ id, icon: Icon, label, gradient, activeColor, inactiveColor }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={cn(
              'flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 group min-w-0 relative',
              currentView === id
                ? 'transform scale-110'
                : 'hover:scale-105'
            )}
          >
            {/* Active background glow */}
            {currentView === id && (
              <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl opacity-20 blur-sm`}></div>
            )}
            
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center mb-1 transition-all duration-300 relative z-10',
              currentView === id 
                ? `bg-gradient-to-r ${gradient} shadow-lg` 
                : 'group-hover:scale-110'
            )}>
              <Icon size={18} className={cn(
                'transition-all duration-300',
                currentView === id ? 'text-white' : inactiveColor
              )} />
            </div>
            <span className={cn(
              'text-xs font-medium transition-all duration-300 truncate relative z-10',
              currentView === id ? activeColor : 'text-gray-500'
            )}>{label}</span>
            
            {/* Active indicator dot */}
            {currentView === id && (
              <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r ${gradient} rounded-full shadow-lg`}></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};