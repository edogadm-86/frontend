import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Auth } from './components/Auth';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { DogProfile } from './components/DogProfile';
import { Calendar } from './components/Calendar';
import { TrainingTracker } from './components/TrainingTracker';
import { Settings } from './components/Settings';
import { SplashScreen } from './screens/SplashScreen';
import { Button } from './components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useNotifications } from './hooks/useNotifications';
import { Health } from './components/Health';
import { ServicesView } from './components/ServicesView';
import { LocalNotifications } from "@capacitor/local-notifications";

const NOTIF_PERM_ASKED_KEY = 'notif_permission_asked';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useApp();
  const [currentView, setCurrentView] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const { t } = useTranslation();
  const { requestPermission } = useNotifications();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user && !showSplash) {
      setShowAuth(true);
    } else if (user) {
      setShowAuth(false);
    }
  }, [user, loading, showSplash]);

  // Ask for notification permission once per install, after the user is logged in
  useEffect(() => {
    if (!user || showSplash) return;

    const alreadyAsked = localStorage.getItem(NOTIF_PERM_ASKED_KEY);
    if (alreadyAsked) return;

    const askPermission = async () => {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        // Show our friendly prompt first, then the OS dialog
        setShowNotifPrompt(true);
      } else {
        localStorage.setItem(NOTIF_PERM_ASKED_KEY, '1');
      }
    };

    // Small delay so the main UI is visible before the prompt appears
    const timer = setTimeout(askPermission, 1500);
    return () => clearTimeout(timer);
  }, [user, showSplash]);

  const handleAllowNotifications = async () => {
    setShowNotifPrompt(false);
    localStorage.setItem(NOTIF_PERM_ASKED_KEY, '1');
    await LocalNotifications.requestPermissions();
    requestPermission(); // also request web Notification API permission
  };

  const handleDenyNotifications = () => {
    setShowNotifPrompt(false);
    localStorage.setItem(NOTIF_PERM_ASKED_KEY, '1');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'profile':
        return <DogProfile />;
      case 'calendar':
        return <Calendar />;
      case 'health':
      /*  return (
          <div className="space-y-4">
            <VaccinationTracker />
            <HealthRecords />
          </div>
        );*/
        return <Health />;
      case 'training':
        return <TrainingTracker />;
      case 'services':
        return <ServicesView />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blueblue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <Auth onAuthSuccess={() => setShowAuth(false)} />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex flex-col">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-16 w-24 h-24 bg-gradient-to-br from-indigo-200/20 to-pink-200/20 rounded-full blur-xl animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-br from-pink-200/20 to-indigo-200/20 rounded-full blur-xl animate-bounce delay-1000"></div>
      </div>
      
      {/* Fixed width container for consistent layout */}
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm h-full relative shadow-xl flex flex-col w-full">
        {/* Enhanced Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-4 py-3 z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="/logo-1.png"
                alt="eDog Logo"
                className="w-8 h-14"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blueblue-600 to-light-bluelight-blue-600 bg-clip-text text-transparent">
                eDog
              </h1>
            </div>
            {currentView !== 'home' && currentView !== 'settings' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('home')}
                className="text-blueblue-500"
              >
                {t('Home')}
              </Button>
            )}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600"
              >
               {t('Logout')}
              </Button>
            )}
          </div>
        </header>

        {/* Main Content - Scrollable with fixed height */}
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="min-h-full">
            {renderCurrentView()}
          </div>
        </main>

        {/* Fixed Navigation - Always Visible */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
        </div>
      </div>

      {/* Notification permission prompt overlay */}
      {showNotifPrompt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-8">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔔</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">Stay on top of your dog's health</p>
                <p className="text-xs text-gray-500">eDog notifications</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Allow notifications to receive timely reminders for:
            </p>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-center gap-2"><span>💉</span> Upcoming vaccinations</li>
              <li className="flex items-center gap-2"><span>📅</span> Scheduled appointments</li>
              <li className="flex items-center gap-2"><span>💊</span> Medication reminders</li>
              <li className="flex items-center gap-2"><span>🔍</span> Lost dog alerts in your area</li>
            </ul>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDenyNotifications}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleAllowNotifications}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all"
              >
                Allow notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;