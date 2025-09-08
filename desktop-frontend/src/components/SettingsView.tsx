import React, { useState, useEffect  } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { apiClient } from '../lib/api';
import { 
  Settings, 
  User, 
  Phone, 
  ArrowLeft, 
  Shield, 
  Bell, 
  Palette, 
  Download,
  Upload,
  Trash2,
  Key,
  Globe,
  Database,
  HelpCircle,
  Mail,
  Smartphone,
  Clock
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { DogManagement } from './DogManagement';
import { EmergencyContactManagement } from './EmergencyContactManagement';
import { Dog } from '../types';
import { useApp } from '../context/AppContext';

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');
interface SettingsViewProps {
  currentDog: Dog | null;
  dogs: Dog[];
  onCreateDog: (dogData: Omit<Dog, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => Promise<Dog>;
  onUpdateDog: (dogId: string, dogData: Partial<Dog>) => Promise<Dog>;
  onDeleteDog: (dogId: string) => Promise<void>;
  onSelectDog: (dog: Dog) => void;
  onNavigate: (view: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentDog,
  dogs,
  onCreateDog,
  onUpdateDog,
  onDeleteDog,
  onSelectDog,
  onNavigate,
}) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'dogs' | 'emergency' | 'profile' | 'preferences' | 'support'>('dogs');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [healthRecordsCount, setHealthRecordsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [notifications, setNotifications] = useState({
    appointments: true,
    vaccinations: true,
    health: true,
    training: false,
    email: true,
    push: true,
  });
  const [preferences, setPreferences] = useState({
    language: i18n.language,
    theme: theme,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    timezone: 'Europe/Sofia',
    autoBackup: true,
    dataSharing: false,
    marketingEmails: false,
  });

  const tabs = [
    { id: 'dogs', icon: User, label: t('myDogs'), color: 'from-blue-500 to-cyan-500' },
    { id: 'emergency', icon: Phone, label: t('emergencyContacts'), color: 'from-red-500 to-pink-500' },
    { id: 'profile', icon: User, label: t('profile'), color: 'from-green-500 to-emerald-500' },
    { id: 'preferences', icon: Palette, label: 'Preferences', color: 'from-purple-500 to-violet-500' },
    { id: 'support', icon: HelpCircle, label: t('helpSupport'), color: 'from-gray-500 to-slate-500' },
  ];



  const handleSavePreferences = async () => {
    try {
      // Save language
      if (preferences.language !== i18n.language) {
        i18n.changeLanguage(preferences.language);
      }
      
      // Save theme
      if (preferences.theme !== theme) {
        setTheme(preferences.theme as any);
      }
      
      // Save other preferences to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      localStorage.setItem('userNotifications', JSON.stringify(notifications));
      
      // Update profile if needed
      if (profileData.name !== user?.name || profileData.email !== user?.email || profileData.phone !== user?.phone) {
        await apiClient.updateProfile(profileData);
      }
      
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would call your API to update profile
      await apiClient.updateProfile(profileData);
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  // Load preferences on mount
  useEffect(() => {
    loadStatistics();
    
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences({ ...preferences, ...parsed });
    }
    
    const savedNotifications = localStorage.getItem('userNotifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications({ ...notifications, ...parsed });
    }
    
    // Load user data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, []);

  const loadStatistics = async () => {
    try {
      let totalHealthRecords = 0;
      let totalAppointments = 0;
      
      for (const dog of dogs) {
        const [healthRes, appointmentsRes] = await Promise.all([
          apiClient.getHealthRecords(dog.id),
          apiClient.getAppointments(dog.id),
        ]);
        totalHealthRecords += healthRes.healthRecords.length;
        totalAppointments += appointmentsRes.appointments.length;
      }
      
      setHealthRecordsCount(totalHealthRecords);
      setAppointmentsCount(totalAppointments);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <Card variant="gradient">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</h3>
            <p className="text-gray-600 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Member since January 2024</p>
          </div>
          <div className="ml-auto">
            <Button onClick={() => setShowProfileModal(true)} variant="outline">
              Edit Profile
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{dogs.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('dogsRegistered')}</div>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{healthRecordsCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('healthRecords')}</div>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{appointmentsCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('appointments')}</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Globe className="mr-2" />
          {t('languageRegion')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{t('language')}</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="input-field"
            >
              <option value="en">🇺🇸 English</option>
              <option value="bg">🇧🇬 Български</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{t('dateFormat')}</label>
            <select className="input-field"
              value={preferences.dateFormat}
              onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
              >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{t('timeFormat')}</label>
            <select className="input-field"
              value={preferences.timeFormat}
              onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
              >
               <option value="12">12 Hour (AM/PM)</option>
               <option value="24">24 Hour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{t('timezone')}</label>
            <select className="input-field"
              value={preferences.timezone}
              onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
              >
              <option value="Europe/Sofia">Europe/Sofia (GMT+2)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleSavePreferences} className="w-full">
            {t('saveLanguageRegionSettings')}
          </Button>
        </div>
      </Card>

      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="mr-2" />
          {t('notifications')}
        </h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900 dark:text-white capitalize">{t(`${key}Notifications`)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('receiveNotificationsAbout')} {t(key.toLowerCase())}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button onClick={handleSavePreferences} className="w-full">
            {t('saveNotificationPreferences')}
          </Button>
        </div>
      </Card>

      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Palette className="mr-2" />
          {t('appearance')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{t('theme')}</label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                className={`p-3 border-2 rounded-xl bg-white text-center transition-all ${
                  preferences.theme === 'light' ? 'border-primary-500 shadow-lg' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-2"></div>
                <div className="text-xs font-medium text-gray-900">{t('light')}</div>
              </button>
              <button 
                onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                className={`p-3 border-2 rounded-xl bg-gray-800 text-white text-center transition-all ${
                  preferences.theme === 'dark' ? 'border-primary-500 shadow-lg' : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="w-full h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded mb-2"></div>
                <div className="text-xs font-medium">{t('dark')}</div>
              </button>
              <button 
                onClick={() => setPreferences({ ...preferences, theme: 'system' })}
                className={`p-3 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 text-center transition-all ${
                  preferences.theme === 'system' ? 'border-primary-500 shadow-lg' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="w-full h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded mb-2"></div>
                <div className="text-xs font-medium text-gray-900">{t('auto')}</div>
              </button>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={handleSavePreferences} className="w-full">
              {t('applyThemeChanges')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Key className="mr-2" />
          Password & Authentication
        </h3>
        <div className="space-y-4">
          <Button onClick={() => setShowPasswordModal(true)} variant="outline" className="w-full">
            Change Password
          </Button>
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center">
              <Shield className="text-green-600 mr-2" size={20} />
              <div>
                <div className="font-medium text-green-800">Two-Factor Authentication</div>
                <div className="text-sm text-green-600">Enabled via SMS</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          {[
            { key: 'profile_public', label: 'Public Profile', description: 'Allow others to see your profile' },
            { key: 'activity_tracking', label: 'Activity Tracking', description: 'Track app usage for improvements' },
            { key: 'data_sharing', label: 'Data Sharing', description: 'Share anonymized data for research' },
            { key: 'marketing_emails', label: 'Marketing Emails', description: 'Receive promotional emails' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900">{setting.label}</div>
                <div className="text-sm text-gray-500">{setting.description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Activity</h3>
        <div className="space-y-3">
          {[
            { device: 'Desktop - Chrome', location: 'Sofia, Bulgaria', time: '2 hours ago', current: true },
            { device: 'Mobile - Safari', location: 'Sofia, Bulgaria', time: '1 day ago', current: false },
            { device: 'Desktop - Firefox', location: 'Plovdiv, Bulgaria', time: '3 days ago', current: false },
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Smartphone size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{session.device}</div>
                  <div className="text-sm text-gray-500">{session.location} • {session.time}</div>
                </div>
              </div>
              {session.current ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Current</span>
              ) : (
                <Button variant="ghost" size="sm">Revoke</Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="mr-2" />
          Data Export & Import
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-800">Export Your Data</div>
                <div className="text-sm text-blue-600">Download all your dog data in JSON format</div>
              </div>
              <Button variant="outline" icon={<Download size={16} />}>
                Export
              </Button>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-green-800">Import Data</div>
                <div className="text-sm text-green-600">Import data from another eDog account</div>
              </div>
              <Button variant="outline" icon={<Upload size={16} />}>
                Import
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Photos & Documents</span>
            <span className="font-medium">2.4 GB / 5 GB</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: '48%' }}></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-900">1.2 GB</div>
              <div className="text-gray-500">Photos</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">0.8 GB</div>
              <div className="text-gray-500">Documents</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">0.4 GB</div>
              <div className="text-gray-500">Other</div>
            </div>
          </div>
        </div>
      </Card>
      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Trash2 className="mr-2 text-red-500" />
          Danger Zone
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-800">Delete Account</div>
                <div className="text-sm text-red-600">Permanently delete your account and all data</div>
              </div>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <HelpCircle className="mr-2" />
          Help & Support
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">📚 User Guide</div>
            <div className="text-sm text-gray-500">Learn how to use eDog effectively</div>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">❓ FAQ</div>
            <div className="text-sm text-gray-500">Find answers to common questions</div>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">💬 Contact Support</div>
            <div className="text-sm text-gray-500">Get help from our support team</div>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">🐛 Report Bug</div>
            <div className="text-sm text-gray-500">Report issues or bugs</div>
          </button>
        </div>
      </Card>

      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail size={20} className="text-primary-500" />
            <div>
              <div className="font-medium text-gray-900">Email Support</div>
              <div className="text-sm text-gray-600">support@edog.app</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone size={20} className="text-primary-500" />
            <div>
              <div className="font-medium text-gray-900">Phone Support</div>
              <div className="text-sm text-gray-600">+359 2 123 4567</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock size={20} className="text-primary-500" />
            <div>
              <div className="font-medium text-gray-900">Support Hours</div>
              <div className="text-sm text-gray-600">Mon-Fri: 9AM-6PM (GMT+2)</div>
            </div>
          </div>
        </div>
      </Card>
      <Card variant="gradient">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">App Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium">January 15, 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform</span>
            <span className="font-medium">Desktop</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Build</span>
            <span className="font-medium">#1234</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dogs':
        return (
          <DogManagement
            dogs={dogs}
            onCreateDog={onCreateDog}
            onUpdateDog={onUpdateDog}
            onSelectDog={onSelectDog}
            currentDog={currentDog}
          />
        );
      case 'emergency':
        return <EmergencyContactManagement />;
      case 'profile':
        return renderProfileSettings();
      case 'preferences':
        return renderPreferences();
      case 'security':
        return renderSecurity();
      case 'data':
        return renderDataManagement();
      case 'support':
        return renderSupport();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/50 transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-bold gradient-text">{t('settings')}</h2>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'tab-button flex items-center space-x-2 whitespace-nowrap',
              activeTab === tab.id && 'active'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
              activeTab === tab.id 
                ? 'bg-white/20 backdrop-blur-sm' 
                : `bg-gradient-to-r ${tab.color} opacity-80`
            )}>
              <tab.icon size={16} className="text-white" />
            </div>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {renderTabContent()}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Edit Profile"
        size="md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input 
            label="Full Name" 
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            required
          />
          <Input 
            label="Email" 
            type="email" 
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            required
          />
          <Input 
            label="Phone" 
            type="tel" 
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
          />
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowProfileModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};