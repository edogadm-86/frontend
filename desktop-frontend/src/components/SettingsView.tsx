import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { apiClient } from '../lib/api';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { DogManagement } from './DogManagement';
import { EmergencyContactManagement } from './EmergencyContactManagement';
import { Dog } from '../types';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

interface SettingsViewProps {
  currentDog: Dog | null;
  dogs: Dog[];
  onCreateDog: (dogData: Partial<Dog>) => Promise<Dog>;
  onUpdateDog: (dogId: string, dogData: Partial<Dog>) => Promise<Dog>;
  onDeleteDog: (dogId: string) => Promise<void>;
  onSelectDog: (dog: Dog | null) => void;
  onNavigate: (view: string) => void;
}

type Tab = 'dogs' | 'emergency' | 'profile' | 'preferences' | 'security';

const card = 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5';
const inputCls = 'w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1c1f] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30 dark:focus:ring-[#a4c9ff]/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1.5';
const sectionTitle = 'text-sm font-bold text-gray-900 dark:text-[#e2e2e6] mb-4 flex items-center gap-2';

const navItems: { id: Tab; icon: string; label: string }[] = [
  { id: 'dogs', icon: 'pets', label: 'myDogs' },
  { id: 'emergency', icon: 'emergency', label: 'emergencyContacts' },
  { id: 'profile', icon: 'person', label: 'profile' },
  { id: 'preferences', icon: 'tune', label: 'Preferences' },
  { id: 'security', icon: 'lock', label: 'security' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentDog,
  dogs,
  onCreateDog,
  onUpdateDog,
  onDeleteDog,
  onSelectDog,
}) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useApp();
  const push = usePushNotifications();
  const [activeTab, setActiveTab] = useState<Tab>('dogs');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [healthRecordsCount, setHealthRecordsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [preferences, setPreferences] = useState({ language: i18n.language, theme, dateFormat: 'MM/DD/YYYY', timeFormat: '12', timezone: 'Europe/Sofia' });

  useEffect(() => {
    loadStatistics();
    const saved = localStorage.getItem('userPreferences');
    if (saved) setPreferences((p) => ({ ...p, ...JSON.parse(saved) }));
    if (user) setProfileData({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  }, []);

  const loadStatistics = async () => {
    try {
      let totalHealth = 0, totalAppts = 0;
      for (const dog of dogs) {
        const [h, a] = await Promise.all([apiClient.getHealthRecords(dog.id), apiClient.getAppointments(dog.id)]);
        totalHealth += h.healthRecords.length;
        totalAppts += a.appointments.length;
      }
      setHealthRecordsCount(totalHealth);
      setAppointmentsCount(totalAppts);
    } catch {}
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      if (preferences.language !== i18n.language) i18n.changeLanguage(preferences.language);
      if (preferences.theme !== theme) setTheme(preferences.theme as any);
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      if (profileData.name !== user?.name || profileData.email !== user?.email || profileData.phone !== user?.phone) {
        await apiClient.updateProfile(profileData);
      }
      alert(t('preferencesSavedSuc'));
    } catch {
      alert(t('failedToSavePref'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateProfile(profileData);
      setShowProfileModal(false);
      alert(t('profileUpdatedSuc'));
    } catch {
      alert(t('failedUpdateProfile'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) { alert(t('passwordsDoNotMatch')); return; }
    try {
      await apiClient.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      alert(t('passwordUpdatedSuccess'));
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch {
      alert(t('failedToUpdatePassword'));
    }
  };

  // ── Tab content renderers ──────────────────────────────────────────────────

  const renderProfile = () => (
    <div className="space-y-4">
      {/* Profile hero */}
      <div className={card}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#005da7] to-[#0090e7] flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 dark:text-[#e2e2e6] truncate">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-400 dark:text-[#8b919d] truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
          >
            {t('editProfile')}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('dogsRegistered'), value: dogs.length, icon: 'pets' },
            { label: t('healthRecords'), value: healthRecordsCount, icon: 'monitor_heart' },
            { label: t('appointments'), value: appointmentsCount, icon: 'calendar_month' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-gray-50 dark:bg-[#282a2d] rounded-xl p-3 text-center">
              <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[20px] mb-1 block">{icon}</span>
              <p className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">{value}</p>
              <p className="text-[11px] text-gray-400 dark:text-[#8b919d]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-4">
      {/* Language & Region */}
      <div className={card}>
        <h3 className={sectionTitle}>
          <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[18px]">language</span>
          {t('languageRegion')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t('language')}</label>
            <select className={inputCls} value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}>
              <option value="en">🇺🇸 English</option>
              <option value="bg">🇧🇬 Български</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('dateFormat')}</label>
            <select className={inputCls} value={preferences.dateFormat} onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('timeFormat')}</label>
            <select className={inputCls} value={preferences.timeFormat} onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}>
              <option value="12">12 Hour (AM/PM)</option>
              <option value="24">24 Hour</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('timezone')}</label>
            <select className={inputCls} value={preferences.timezone} onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}>
              <option value="Europe/Sofia">Europe/Sofia (GMT+2)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className={card}>
        <h3 className={sectionTitle}>
          <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[18px]">palette</span>
          {t('appearance')}
        </h3>
        <label className={labelCls}>{t('theme')}</label>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((th) => (
            <button
              key={th}
              onClick={() => setPreferences({ ...preferences, theme: th })}
              className={cn(
                'p-3 rounded-xl border-2 text-center transition-all',
                preferences.theme === th
                  ? 'border-[#005da7] dark:border-[#a4c9ff]'
                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
              )}
            >
              <div className={cn('w-full h-7 rounded-lg mb-2', th === 'light' ? 'bg-gradient-to-r from-blue-400 to-sky-300' : th === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-900' : 'bg-gradient-to-r from-blue-400 to-gray-800')} />
              <span className="text-xs font-medium text-gray-700 dark:text-[#c1c7d3]">{t(th)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className={card}>
        <h3 className={sectionTitle}>
          <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[18px]">notifications_active</span>
          {t('pushNotificationsTitle')}
        </h3>

        {!push.isSupported ? (
          <p className="text-sm text-gray-400 dark:text-[#8b919d]">{t('pushNotificationsNotSupported')}</p>
        ) : push.permission === 'denied' ? (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-300">
            {t('pushNotificationsBlocked')}
          </div>
        ) : (
          <>
            {/* Error banner */}
            {push.error && (
              <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl text-sm text-amber-700 dark:text-amber-300">
                {t(`pushError${push.error.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}
              </div>
            )}

            {/* Master enable / subscribe toggle */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/5">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e2e2e6]">{t('pushEnableLabel')}</p>
                <p className="text-xs text-gray-400 dark:text-[#8b919d]">
                  {push.isSubscribed ? t('pushSubscribedStatus') : t('pushNotSubscribedStatus')}
                </p>
              </div>
              <label className={cn('relative inline-flex items-center flex-shrink-0 ml-4', push.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}>
                <input
                  type="checkbox"
                  checked={push.isSubscribed}
                  disabled={push.loading}
                  onChange={async (e) => {
                    if (e.target.checked) {
                      await push.subscribe();
                    } else {
                      await push.unsubscribe();
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 dark:bg-[#282a2d] rounded-full peer peer-checked:bg-[#005da7] dark:peer-checked:bg-[#a4c9ff] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4 transition-colors" />
              </label>
            </div>

            {/* Per-category toggles — always visible, disabled when not subscribed */}
            <div className={cn('mt-3 space-y-1', !push.isSubscribed && 'opacity-40 pointer-events-none')}>
              <p className="text-xs font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wide mb-2">
                {t('pushNotifyAbout')}
              </p>

              {(
                [
                  { key: 'vaccinations' as const,    icon: 'vaccines',       labelKey: 'pushCategoryVaccinations', descKey: 'pushCategoryVaccinationsDesc' },
                  { key: 'appointments' as const,    icon: 'calendar_month', labelKey: 'pushCategoryAppointments', descKey: 'pushCategoryAppointmentsDesc' },
                  { key: 'medications' as const,     icon: 'medication',     labelKey: 'pushCategoryMedications',  descKey: 'pushCategoryMedicationsDesc' },
                  { key: 'lost_dog_alerts' as const, icon: 'search',         labelKey: 'pushCategoryLostDog',      descKey: 'pushCategoryLostDogDesc' },
                ]
              ).map(({ key, icon, labelKey, descKey }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[16px]">{icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-[#e2e2e6]">{t(labelKey)}</p>
                      <p className="text-xs text-gray-400 dark:text-[#8b919d]">{t(descKey)}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={push.prefs[key]}
                      onChange={(e) => push.savePrefs({ ...push.prefs, [key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-200 dark:bg-[#282a2d] rounded-full peer peer-checked:bg-[#005da7] dark:peer-checked:bg-[#a4c9ff] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4 transition-colors" />
                  </label>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleSavePreferences}
        disabled={saving}
        className="w-full py-3 text-sm font-semibold rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all"
      >
        {saving ? t('loading') : t('saveLanguageRegionSettings')}
      </button>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-4">
      <div className={card}>
        <h3 className={sectionTitle}>
          <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[18px]">lock</span>
          {t('passwordAuthentication')}
        </h3>
        <p className="text-sm text-gray-400 dark:text-[#8b919d] mb-4">
          {t('lastUpdated', 'Keep your account secure with a strong password.')}
        </p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">key</span>
          {t('changePassword')}
        </button>
      </div>

      <div className={card}>
        <h3 className={cn(sectionTitle, 'text-red-600 dark:text-red-400')}>
          <span className="material-symbols-outlined text-[18px]">warning</span>
          {t('dangerZone', 'Danger Zone')}
        </h3>
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
          <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">{t('deleteAccount', 'Delete Account')}</p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-3">{t('deleteAccountWarning', 'Permanently delete your account and all associated data. This cannot be undone.')}</p>
          <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">
            {t('deleteAccount', 'Delete Account')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dogs':
        return (
          <DogManagement
            dogs={dogs}
            onCreateDog={onCreateDog}
            onUpdateDog={onUpdateDog}
            onDeleteDog={onDeleteDog}
            onSelectDog={onSelectDog}
            currentDog={currentDog}
          />
        );
      case 'emergency':
        return <EmergencyContactManagement />;
      case 'profile':
        return renderProfile();
      case 'preferences':
        return renderPreferences();
      case 'security':
        return renderSecurity();
    }
  };

  return (
    <div className="font-jakarta bg-[#fbf9f8] dark:bg-[#111316] min-h-full p-4 sm:p-6 lg:p-8">
      <div className=" mx-auto">
        {/* Page header
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">{t('settings')}</h1>
          <p className="text-sm text-gray-400 dark:text-[#8b919d] mt-0.5">{t('manageYourAccount', 'Manage your account and preferences')}</p>
        </div> */}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar nav (desktop) / horizontal pills (mobile) ─────────── */}
          <aside className="lg:w-52 flex-shrink-0">
            {/* Mobile: horizontal scroll */}
            <div className="flex lg:hidden gap-2 overflow-x-auto no-scrollbar pb-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                        : 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 text-gray-600 dark:text-[#c1c7d3] hover:bg-gray-50 dark:hover:bg-[#282a2d]'
                    )}
                  >
                    <span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>
                    <span className="whitespace-nowrap">{t(item.label)}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop: vertical list */}
            <nav className="hidden lg:flex flex-col gap-1 bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                      isActive
                        ? 'bg-[#005da7] dark:bg-[#a4c9ff]/15 text-white dark:text-[#a4c9ff]'
                        : 'text-gray-600 dark:text-[#c1c7d3] hover:bg-gray-100 dark:hover:bg-[#282a2d] hover:text-gray-900 dark:hover:text-[#e2e2e6]'
                    )}
                  >
                    <span className={cn('material-symbols-outlined text-[18px] leading-none flex-shrink-0', isActive ? 'text-white dark:text-[#a4c9ff]' : 'text-gray-400 dark:text-[#8b919d]')}>
                      {item.icon}
                    </span>
                    {t(item.label)}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Content area ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title={t('editProfile')} size="md">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input label={t('name')} value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} required />
          <Input label={t('email')} type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} required />
          <Input label={t('phone')} type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors">
              {t('cancel')}
            </button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] hover:opacity-90 active:scale-95 transition-all">
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title={t('changePassword')} size="md">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label={t('currentPassword')} type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
          <Input label={t('newPassword')} type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
          <Input label={t('confirmNewPassword')} type="password" value={passwordForm.confirmNewPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })} required />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors">
              {t('cancel')}
            </button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] hover:opacity-90 active:scale-95 transition-all">
              {t('updatePassword')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
