import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, User, LogOut, Globe, Settings, Moon, Sun, MessageSquare, HelpCircle, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, currentView }) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([
    { id: 1, title: 'Vaccination due for Max', message: 'Rabies vaccination due in 3 days', time: '2 hours ago', type: 'warning' },
    { id: 2, title: 'Appointment reminder', message: 'Vet appointment tomorrow at 2 PM', time: '1 day ago', type: 'info' },
    { id: 3, title: 'Training milestone', message: 'Bella completed basic commands!', time: '2 days ago', type: 'success' },
  ]);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
      setShowLanguageMenu(false);
      setShowNotifications(false);
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
      case 'shop': return 'Shop & Services';
      case 'settings': return t('settings');
      default: return t('dashboard');
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLanguageMenu(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
      alert(`Search functionality for "${searchQuery}" would be implemented here`);
    }
  };

  const handleExportData = () => {
    // Implement data export
    alert('Data export functionality would be implemented here');
  };

  const handleHelp = () => {
    // Open help documentation
    window.open('https://docs.edog.app', '_blank');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-4 lg:px-8 py-4 shadow-lg relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-4 max-w-xs lg:max-w-none">
          <h1 className="text-xl lg:text-3xl font-bold gradient-text truncate">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('welcome')}, <span className="font-medium text-primary-600">{user?.name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative group hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder={t('searchDogs')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48 lg:w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-200 focus:w-56 lg:focus:w-72 focus:shadow-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </form>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLanguageMenu(!showLanguageMenu);
                setShowUserMenu(false);
              }}
              className="language-selector flex items-center space-x-1 lg:space-x-2 hover:shadow-xl transition-all duration-200 px-2 lg:px-3 py-2"
            >
              <Globe size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                {i18n.language === 'bg' ? 'БГ' : 'EN'}
              </span>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/30 py-2 z-[60]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLanguage('en');
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center space-x-2 text-gray-900 dark:text-white"
                >
                  <span>🇺🇸</span>
                  <span>{t('english')}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLanguage('bg');
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center space-x-2 text-gray-900 dark:text-white"
                >
                  <span>🇧🇬</span>
                  <span>Български</span>
                </button>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button 
            className="hidden lg:block p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200"
            onClick={toggleTheme}
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative hidden lg:block">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
                setShowLanguageMenu(false);
              }}
              className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200 relative"
              title={t('notifications')}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/30 py-2 z-[60] max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications')}</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('noNotifications')}</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'warning' ? 'bg-orange-500' :
                            notification.type === 'success' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                    {t('viewAllNotifications')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
                setShowLanguageMenu(false);
              }}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-xl hover:bg-white/50 transition-all duration-200 group"
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
              <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/30 py-2 z-[70]">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                    // Navigate to profile section in settings
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center space-x-2 text-gray-900 dark:text-white"
                >
                  <User size={16} />
                  <span>{t('profile')}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                    // Navigate to settings
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center space-x-2 text-gray-900 dark:text-white"
                >
                  <Settings size={16} />
                  <span>{t('settings')}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                    handleExportData();
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center space-x-2 text-gray-900 dark:text-white"
                >
                  <Download size={16} />
                  <span>{t('exportData')}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                    handleHelp();
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center space-x-2 text-gray-900 dark:text-white"
                >
                  <HelpCircle size={16} />
                  <span>{t('helpSupport')}</span>
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex items-center space-x-2"
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