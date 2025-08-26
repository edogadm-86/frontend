import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { Button } from './ui/Button';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, currentView }) => {
  const { t } = useTranslation();

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return t('dashboard');
      case 'health': return t('health');
      case 'calendar': return t('calendar');
      case 'training': return t('training');
      case 'community': return t('community');
      case 'settings': return t('settings');
      default: return t('dashboard');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500">
            {t('welcome')}, {user?.name}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('searchDogs')}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Bell size={20} />
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="ml-2"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};