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
import { LocalNotifications } from "@capacitor/local-notifications";


const AppContent: React.FC = () => {
  const { user, loading, logout } = useApp();
  const [currentView, setCurrentView] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const { t } = useTranslation();
  const { requestPermission } = useNotifications();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user && !showSplash) {
      setShowAuth(true);
    } else if (user) {
      setShowAuth(false);
      // Request notification permission when user logs in
      requestPermission();
    }
  }, [user, loading, showSplash, requestPermission]);
    useEffect(() => {
      const initNotifications = async () => {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      };
      initNotifications();
    }, []);

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