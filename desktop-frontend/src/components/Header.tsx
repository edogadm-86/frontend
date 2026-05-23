import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, LogOut, Globe, Settings, Moon, Sun, HelpCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { HelpSupportPage } from './HelpSupportPage';
import { apiClient } from '../lib/api';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  currentView: string;
}

type NotificationType = 'warning' | 'success' | 'info' | 'health' | 'appointment' | 'training' | 'general';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type?: NotificationType;
  route?: string;
  read?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, currentView }) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpPage, setShowHelpPage] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setShowUserMenu(false);
      if (langMenuRef.current && !langMenuRef.current.contains(target)) setShowLanguageMenu(false);
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) setShowNotifications(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await apiClient.getNotifications();
      setNotifications(response.notifications as NotificationItem[]);
    } catch {
      // silently ignore
    } finally {
      setLoadingNotifications(false);
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return t('dashboard');
      case 'health': return t('health');
      case 'calendar': return t('calendar1');
      case 'training': return t('training');
      case 'community': return t('community');
      case 'shop': return t('shopServices');
      case 'settings': return t('settings');
      case 'passport': return t('petPassport');
      case 'expenses': return t('expenses');
      case 'admin': return 'Admin Panel';
      default: return t('dashboard');
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLanguageMenu(false);
  };

  const markReadOptimistic = (id: string) =>
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  const revertReadOptimistic = (id: string) =>
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: false } : n)));

  const markNotificationAsRead = async (id: string) => {
    markReadOptimistic(id);
    try {
      await apiClient.markNotificationRead(id);
    } catch {
      revertReadOptimistic(id);
    }
  };

  const routeFromType: Record<NotificationType, string> = {
    health: 'health',
    appointment: 'calendar',
    training: 'training',
    warning: 'dashboard',
    success: 'dashboard',
    info: 'dashboard',
    general: 'dashboard',
  };

  const navigateTo = (route: string) => {
    window.location.hash = `#${route}`;
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: route }));
    }, 0);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const iconBtn =
    'p-2 rounded-lg text-gray-500 dark:text-[#8b919d] hover:text-gray-800 dark:hover:text-[#e2e2e6] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all duration-150';

  const dropdownBase =
    'absolute right-0 mt-2 bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl shadow-xl z-[60] overflow-hidden';

  return (
    <>
      <header className="font-jakarta bg-[#fbf9f8] dark:bg-[#111316] border-b border-gray-200/60 dark:border-white/5 px-4 lg:px-6 py-3 flex-shrink-0 z-50">
        <div className="flex items-center gap-3 lg:gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-[#005da7] to-[#0090e7] rounded-xl flex items-center justify-center shadow-sm">
              <img src="/logo-header.png" alt="eDog" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-lg font-bold text-[#005da7] dark:text-[#a4c9ff] hidden md:block">eDog</span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-gray-200 dark:bg-white/10 flex-shrink-0" />

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base lg:text-lg font-bold text-gray-900 dark:text-[#e2e2e6] truncate leading-tight">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-gray-400 dark:text-[#8b919d] hidden sm:block leading-tight">
              {t('welcome')},{' '}
              <span className="font-medium text-[#005da7] dark:text-[#a4c9ff]">{user?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">

            {/* Language */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={e => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); setShowUserMenu(false); }}
                className={`${iconBtn} flex items-center gap-1.5 px-2.5`}
              >
                <Globe size={16} />
                <span className="text-sm font-medium hidden lg:inline">
                  {i18n.language === 'bg' ? 'БГ' : 'EN'}
                </span>
              </button>

              {showLanguageMenu && (
                <div className={`${dropdownBase} w-36`} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => { e.stopPropagation(); changeLanguage('en'); }}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 text-gray-700 dark:text-[#e2e2e6] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
                  >
                    <span>🇺🇸</span><span>{t('english')}</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); changeLanguage('bg'); }}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 text-gray-700 dark:text-[#e2e2e6] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
                  >
                    <span>🇧🇬</span><span>Български</span>
                  </button>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              className={`${iconBtn} hidden lg:flex`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="relative hidden lg:block" ref={notifMenuRef}>
              <button
                onClick={e => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowUserMenu(false); setShowLanguageMenu(false); }}
                className={`${iconBtn} relative`}
                title={t('notifications')}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className={`${dropdownBase} w-80 max-h-96 overflow-y-auto`} onClick={e => e.stopPropagation()}>
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-[#e2e2e6]">{t('notifications')}</h3>
                    {loadingNotifications && (
                      <div className="w-3.5 h-3.5 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {loadingNotifications ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-7 h-7 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-[#8b919d]">{t('loadingNotifications')}</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell size={28} className="mx-auto mb-2 text-gray-300 dark:text-[#414751]" />
                      <p className="text-xs text-gray-500 dark:text-[#8b919d]">{t('noNotifications')}</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={async e => {
                          e.stopPropagation();
                          await markNotificationAsRead(n.id);
                          const route = n.route || (n.type ? routeFromType[n.type] : 'dashboard');
                          setShowNotifications(false);
                          navigateTo(route);
                        }}
                        className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282a2d] border-b border-gray-50 dark:border-white/5 last:border-0 transition-colors ${n.read ? 'opacity-60' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          n.type === 'warning' ? 'bg-orange-500' :
                          n.type === 'success' ? 'bg-green-500' : 'bg-[#005da7] dark:bg-[#a4c9ff]'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-[#e2e2e6]">{n.title}</p>
                          <p className="text-xs text-gray-500 dark:text-[#8b919d] mt-0.5">{n.message}</p>
                          <p className="text-xs text-gray-400 dark:text-[#414751] mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/5 flex gap-4">
                    <button
                      onClick={e => { e.stopPropagation(); loadNotifications(); }}
                      className="text-xs text-[#005da7] dark:text-[#a4c9ff] hover:opacity-80 font-medium"
                    >
                      {t('refreshNotifications')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={e => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowLanguageMenu(false); }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#005da7] to-[#0090e7] rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-400 dark:text-[#8b919d] leading-tight">{user?.email}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className={`${dropdownBase} w-48`} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => { e.stopPropagation(); setShowHelpPage(true); setShowUserMenu(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 text-gray-700 dark:text-[#e2e2e6] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
                  >
                    <HelpCircle size={15} /><span>{t('helpSupport')}</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setShowUserMenu(false); navigateTo('settings'); }}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 text-gray-700 dark:text-[#e2e2e6] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
                  >
                    <Settings size={15} /><span>{t('settings')}</span>
                  </button>
                  <div className="border-t border-gray-100 dark:border-white/5 my-1" />
                  <button
                    onClick={e => { e.stopPropagation(); setShowUserMenu(false); onLogout(); }}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} /><span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {showHelpPage && <HelpSupportPage onClose={() => setShowHelpPage(false)} />}
    </>
  );
};
