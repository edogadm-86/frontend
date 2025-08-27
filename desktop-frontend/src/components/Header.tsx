import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, User, LogOut, Globe, Settings, Moon, Sun } from 'lucide-react';
import { Button } from './ui/Button';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, currentView }) => {
  const { t, i18n } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
      setShowLanguageMenu(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLanguageMenu(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-8 py-4 shadow-lg relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <h1 className="text-3xl font-bold gradient-text">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('welcome')}, <span className="font-medium text-primary-600">{user?.name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder={t('searchDogs')}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48 lg:w-64 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:w-56 lg:focus:w-72 focus:shadow-lg"
            />
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLanguageMenu(!showLanguageMenu);
                setShowUserMenu(false);
              }}
              className="language-selector flex items-center space-x-2 hover:shadow-xl transition-all duration-200"
            >
              <Globe size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {i18n.language === 'bg' ? 'БГ' : 'EN'}
              </span>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 py-2 z-[60]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLanguage('en');
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 transition-colors flex items-center space-x-2"
                >
                  <span>🇺🇸</span>
                  <span>English</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLanguage('bg');
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 transition-colors flex items-center space-x-2"
                >
                  <span>🇧🇬</span>
                  <span>Български</span>
                </button>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/50 transition-all duration-200"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button className="p-2.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/50 transition-all duration-200 relative">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
                setShowLanguageMenu(false);
              }}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 py-2 z-[60]">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 transition-colors flex items-center space-x-2">
                  <User size={16} />
                  <span>{t('profile')}</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 transition-colors flex items-center space-x-2">
                  <Settings size={16} />
                  <span>{t('settings')}</span>
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>{t('logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};