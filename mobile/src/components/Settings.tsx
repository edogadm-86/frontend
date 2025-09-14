import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { LanguageSelector } from './LanguageSelector';
import { User, Bell, HelpCircle, Star, LogOut, ChevronRight, Palette, Heart, Sparkles, Moon, Sun, Monitor, Mail, Phone, MessageCircle, Globe, Shield, Lock } from 'lucide-react';

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useApp();
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    appointments: true,
    vaccinations: true,
    healthReminders: true,
    trainingReminders: false,
    communityUpdates: false,
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const userData = {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone || undefined,
    };

    try {
      await updateUser(userData);
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const sendNotificationTest = () => {
    // Test notification
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('eDog Test Notification', {
          body: 'Notifications are working correctly!',
          icon: '/logo-1.png'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('eDog Test Notification', {
              body: 'Notifications are now enabled!',
              icon: '/logo-1.png'
            });
          }
        });
      }
    }
  };

  const settingsOptions = [
    {
      icon: User, 
      title: t('profile'),
      description: t('Manage your personal information'),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      action: () => setIsProfileModalOpen(true),
    },
    /*{
      icon: Bell,
      title: t('notifications'),
      description: t('Control when and how you receive alerts'),
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      action: () => setIsNotificationModalOpen(true),
    },
    {
      icon: Shield,
      title: t('privacy&security'),
      description: t('Manage your privacy and security preferences'),
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50',
      action: () => setIsPrivacyModalOpen(true),
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize theme and language',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      action: () => setIsAppearanceModalOpen(true),
    },*/
    {
      icon: HelpCircle,
      title: t('help&support'),
      description: t('FAQs, tutorials, and contact information'),
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-50 to-cyan-50',
      action: () => setIsHelpModalOpen(true),
    },
    /*{
      icon: Star,
      title: t('rateedog'),
      description: t('Help us improve by rating the app'),
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50',
      action: () => window.open('https://play.google.com/store', '_blank'),
    },*/
  ];

  return (
    <div className="p-4 space-y-4 min-h-full">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl animate-pulse delay-700"></div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blueblue-600 to-light-bluelight-blue-600 bg-clip-text text-transparent">
            {t('settings')}
          </h2>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      {/* User Profile Card */}
      {user && (
        <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blueblue-200/20 to-light-bluelight-blue-200/20 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-lg font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-gray-600">{user.phone}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl"
            >
              {t('edit')}
            </Button>
            <ChevronRight size={16} className="text-blueblue-400" />
          </div>
        </Card>
      )}

      {/* Settings Options */}
      <div className="space-y-4">
        {settingsOptions.map((option, index) => (
          <Card key={index} onClick={option.action} className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <option.icon size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blueblue-600 transition-colors">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-blueblue-500 transition-colors" />
            </div>
          </Card>
        ))}
      </div>

      {/* App Info */}
      <Card className="text-center bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blueblue-500/5 to-light-bluelight-blue-500/5"></div>
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Heart size={24} className="text-white" />
          </div>
        <div className="space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blueblue-600 to-light-bluelight-blue-600 bg-clip-text text-transparent">eDog</h3>
          <p className="text-sm text-gray-600">{t('ddp')}</p>
          <p className="text-xs text-gray-500">Version 1.0.0</p>
          <p className="text-xs text-gray-500">
            {t('madewithlove')}
          </p>
        </div>
        </div>
      </Card>

      {/* Logout Button */}
      <Card onClick={handleLogout} className="border-red-200 hover:bg-red-50 bg-gradient-to-br from-red-50/90 to-pink-50/70 backdrop-blur-sm border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <LogOut size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 group-hover:text-red-700 transition-colors">{t('Logout')}</h3>
            <p className="text-sm text-red-600">{t('Sign out of your account')}</p>
          </div>
          <ChevronRight size={16} className="text-red-400 group-hover:text-red-600 transition-colors" />
        </div>
      </Card>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={t('edit') + ' ' + t('profile')}
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label={t('name')}
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            required
          />
          <Input
            label={t('email')}
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            required
          />
          <Input
            label={t('Phone (optional)')}
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
          />
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProfileModalOpen(false)}
            >
              {t('Cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('Saving...') : t('Save Settings')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        title={t('Notification Settings')}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
           {t('Choose which notifications you would like to receive')}
          </p>
          
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">
                  {key === 'appointments' && t('Get reminded about upcoming appointments')}
                  {key === 'vaccinations' && t('Alerts for vaccination due dates')}
                  {key === 'healthReminders' && t('General health and wellness tips')}
                  {key === 'trainingReminders' && t('Training session reminders')}
                  {key === 'communityUpdates' && t('Updates from the community')}
                </p>
                <p className="text-sm text-gray-600">
                  {key === 'appointments' && 'Appointment reminders'}
                  {key === 'vaccinations' && 'Vaccination due dates'}
                  {key === 'healthReminders' && 'Health tips and reminders'}
                  {key === 'trainingReminders' && 'Training session alerts'}
                  {key === 'communityUpdates' && 'Community posts and events'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    [key]: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blueblue-500"></div>
              </label>
            </div>
          ))}
          
          <div className="pt-4 space-y-3">
            <Button
              onClick={() => setIsNotificationModalOpen(false)}
              className="w-full"
            >
              {t('Save Settings')}
            </Button>
            <Button
              onClick={sendNotificationTest}
              variant="outline"
              className="w-full"
            >
              Test Notifications
            </Button>
          </div>
        </div>
      </Modal>

      {/* Privacy & Security Modal */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title={t('Privacy & Security')}
        className="max-w-lg"
      >
        <div className="space-y-6">
          {/* Data Protection */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Shield size={20} className="text-green-600" />
              <h4 className="font-semibold text-green-800">{t('Data Protection')}</h4>
            </div>
            <p className="text-sm text-green-700">
              {t('Your data is encrypted and stored securely. We never share your personal information with third parties.')}
            </p>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Lock className="mr-2 text-purple-500" />
              Privacy Settings
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Profile Visibility</div>
                  <div className="text-sm text-gray-600">Control who can see your profile</div>
                </div>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>Private</option>
                  <option>Friends Only</option>
                  <option>Public</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Data Analytics</div>
                  <div className="text-sm text-gray-600">Help improve the app with usage data</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blueblue-500"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              onClick={() => setIsPrivacyModalOpen(false)}
              className="w-full"
            >
              {t('Save Settings')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Appearance Settings Modal */}
      <Modal
        isOpen={isAppearanceModalOpen}
        onClose={() => setIsAppearanceModalOpen(false)}
        title="Appearance"
        className="max-w-lg"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Palette className="mr-2 text-pink-500" />
              Theme
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'light' 
                    ? 'border-blueblue-500 bg-blueblue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Sun size={24} className={`mx-auto mb-2 ${theme === 'light' ? 'text-blueblue-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-gray-900">Light</div>
              </button>
              
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'border-blueblue-500 bg-blueblue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Moon size={24} className={`mx-auto mb-2 ${theme === 'dark' ? 'text-blueblue-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-gray-900">Dark</div>
              </button>
              
              <button
                onClick={() => handleThemeChange('system')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'system' 
                    ? 'border-blueblue-500 bg-blueblue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Monitor size={24} className={`mx-auto mb-2 ${theme === 'system' ? 'text-blueblue-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-gray-900">Auto</div>
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Globe className="mr-2 text-blue-500" />
              {t('language')}
            </h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <LanguageSelector />
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              onClick={() => setIsAppearanceModalOpen(false)}
              className="w-full"
            >
              {t('Save Settings')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Help & Support Modal */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title={t('help&support')}
        className="max-w-lg"
      >
        <div className="space-y-6">
          {/* About eDog */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Heart size={20} className="text-blue-600" />
              <h4 className="font-semibold text-blue-800">About eDog</h4>
            </div>
            <p className="text-sm text-blue-700">
              eDog is your comprehensive digital dog passport and health management app. Track vaccinations, health records, appointments, and more.
            </p>
          </div>

          {/* Contact Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Contact Support</h4>
            
            <button 
              onClick={() => window.open('mailto:edog.adm@gmail.com', '_blank')}
              className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mail size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">Email Support</h4>
                <p className="text-sm text-gray-600">edog.adm@gmail.com</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button 
              onClick={() => window.open('tel:+359888123456', '_blank')}
              className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Phone size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">Phone Support</h4>
                <p className="text-sm text-gray-600">+359 888 123 456</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          
          {/* FAQ Section */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Frequently Asked Questions</h4>
            <div className="space-y-2">
              <details className="group">
                <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">How do I add my first dog?</span>
                  <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-3 text-sm text-gray-600">
                  Go to Settings → Profile, then tap "Add Dog" to create your first dog profile with basic information like name, breed, age, and weight.
                </div>
              </details>
              
              <details className="group">
                <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">How do I track vaccinations?</span>
                  <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-3 text-sm text-gray-600">
                  Navigate to Health → Vaccinations and tap "Add Vaccination" to record vaccine details, dates, and set reminders for future doses.
                </div>
              </details>
              
              <details className="group">
                <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">Can I export my dog's data?</span>
                  <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-3 text-sm text-gray-600">
                  Yes! All your dog's health records, vaccinations, and appointments can be exported as a digital pet passport for vet visits or travel.
                </div>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">How do I generate a pet passport?</span>
                  <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-3 text-sm text-gray-600">
                  Go to your dog's profile and tap the passport icon, or navigate to Health section and look for the "Pet Passport" button.
                </div>
              </details>
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              onClick={() => setIsHelpModalOpen(false)}
              className="w-full"
            >
              {t('Close')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};