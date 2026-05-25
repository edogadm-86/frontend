import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, LogOut, Globe, Settings, Moon, Sun, HelpCircle, MessageSquarePlus, X, Check } from 'lucide-react';
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

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [feedbackFile, setFeedbackFile] = useState<File | null>(null);
  const [feedbackPreview, setFeedbackPreview] = useState<string | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const feedbackFileRef = useRef<HTMLInputElement>(null);

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
      case 'admin': return t('adminPanel');
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

  const openFeedback = () => {
    setFeedbackType('general');
    setFeedbackTitle('');
    setFeedbackDesc('');
    setFeedbackFile(null);
    setFeedbackPreview(null);
    setFeedbackDone(false);
    setShowFeedback(true);
  };

  const handleFeedbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedbackFile(file);
    setFeedbackPreview(URL.createObjectURL(file));
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackDesc.trim() || feedbackSubmitting) return;
    setFeedbackSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (feedbackFile) {
        try {
          const up = await apiClient.uploadImage(feedbackFile);
          imageUrl = up.fileUrl;
        } catch { /* image upload optional */ }
      }
      await apiClient.submitFeedback({ type: feedbackType, title: feedbackTitle.trim(), description: feedbackDesc.trim(), imageUrl });
    } catch { /* show success regardless */ }
    finally { setFeedbackSubmitting(false); }
    setFeedbackDone(true);
  };

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

            {/* Feedback button */}
            <button
              className={iconBtn}
              onClick={openFeedback}
              title={t('sendFeedback')}
            >
              <MessageSquarePlus size={18} />
            </button>

            {/* Theme toggle */}
            <button
              className={iconBtn}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifMenuRef}>
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

      {/* Feedback modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowFeedback(false)}>
          <div
            className="bg-white dark:bg-[#1e2023] rounded-2xl shadow-2xl w-full max-w-md font-jakarta"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <MessageSquarePlus size={18} className="text-[#005da7] dark:text-[#a4c9ff]" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">{t('sendFeedback')}</h2>
              </div>
              <button onClick={() => setShowFeedback(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors">
                <X size={16} />
              </button>
            </div>

            {feedbackDone ? (
              <div className="flex flex-col items-center py-10 gap-3 px-5">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center">
                  <Check size={28} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-[#e2e2e6]">{t('feedbackThankYou')}</p>
                <p className="text-sm text-gray-500 dark:text-[#8b919d] text-center">{t('feedbackReceived')}</p>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="mt-2 px-6 py-2 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                >
                  {t('close')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="p-5 space-y-4">
                {/* Type pills */}
                <div className="flex gap-2">
                  {(['bug', 'feature', 'general'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackType(type)}
                      className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        feedbackType === type
                          ? type === 'bug'
                            ? 'bg-red-500 text-white'
                            : type === 'feature'
                            ? 'bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                            : 'bg-gray-700 dark:bg-[#414751] text-white'
                          : 'bg-gray-100 dark:bg-[#282a2d] text-gray-500 dark:text-[#8b919d] hover:bg-gray-200 dark:hover:bg-[#333740]'
                      }`}
                    >
                      {type === 'bug' ? `🐛 ${t('feedbackBug')}` : type === 'feature' ? `✨ ${t('feedbackFeature')}` : `💬 ${t('feedbackGeneral')}`}
                    </button>
                  ))}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide">{t('feedbackTitle')}</label>
                  <input
                    required
                    value={feedbackTitle}
                    onChange={e => setFeedbackTitle(e.target.value)}
                    placeholder={t('feedbackTitlePlaceholder')}
                    className="w-full text-sm bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-[#414751]/40 rounded-xl px-3 py-2.5 text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#a4c9ff]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide">{t('feedbackDescription')}</label>
                  <textarea
                    required
                    rows={4}
                    value={feedbackDesc}
                    onChange={e => setFeedbackDesc(e.target.value)}
                    placeholder={t('feedbackDescPlaceholder')}
                    className="w-full text-sm bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-[#414751]/40 rounded-xl px-3 py-2.5 text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#a4c9ff] resize-none"
                  />
                </div>

                {/* Screenshot */}
                <div>
                  <input ref={feedbackFileRef} type="file" accept="image/*" className="hidden" onChange={handleFeedbackFile} />
                  {feedbackPreview ? (
                    <div className="relative">
                      <img src={feedbackPreview} alt="screenshot" className="w-full max-h-40 object-cover rounded-xl border border-gray-200 dark:border-[#414751]/40" />
                      <button
                        type="button"
                        onClick={() => { setFeedbackFile(null); setFeedbackPreview(null); if (feedbackFileRef.current) feedbackFileRef.current.value = ''; }}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => feedbackFileRef.current?.click()}
                      className="w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-[#414751]/40 rounded-xl text-xs text-gray-400 dark:text-[#8b919d] hover:border-blue-400 dark:hover:border-[#a4c9ff]/50 hover:text-blue-500 dark:hover:text-[#a4c9ff] transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquarePlus size={14} />
                      {t('attachScreenshot')}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowFeedback(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all">
                    {t('cancel')}
                  </button>
                  <button type="submit" disabled={feedbackSubmitting} className="flex-1 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all">
                    {feedbackSubmitting ? t('sending') : t('sendFeedback')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
