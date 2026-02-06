import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { AppProvider, useApp } from './context/AppContext';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
// import { DogManagement } from './components/DogManagement';
import { HealthManagement } from './components/HealthManagement';
import { CalendarManagement } from './components/CalendarManagement';
import { TrainingView } from './components/TrainingView';
import { SettingsView } from './components/SettingsView';
import { CommunityView } from './components/CommunityView';
import { ShopView } from './components/ShopView';
import { PublicDogProfile } from './components/PublicDogProfile';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ChatBot } from './components/ChatBot';
import { useIsTouchDevice, useMediaQuery } from './hooks/useIsTouchDevice';

const AppContent: React.FC = () => {
  useTheme(); // Initialize theme
  const { 
    user, 
    dogs, 
    vaccinations, 
    healthRecords, 
    appointments, 
    trainingSessions,
    loading, 
    register, 
    login, 
    logout,
    createDog,
    updateDog,
    deleteDog,
    currentDog,
    setCurrentDog
  } = useApp();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddDogModal, setShowAddDogModal] = useState(false);
  const isTouch = useIsTouchDevice();
  const isMdUp = useMediaQuery("(min-width: 768px)");

  const showSidebar = !isTouch && isMdUp;
  const showBottomNav = isTouch || !isMdUp;
  // Listen for navigation events from header
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setCurrentView(event.detail);
    };
    
    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

  const handleAddDog = () => {
    setCurrentView('settings');
    setShowAddDogModal(true);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            currentDog={currentDog}
            dogs={dogs}
            vaccinations={vaccinations}
            healthRecords={healthRecords}
            appointments={appointments}
            trainingSessions={trainingSessions}
            onNavigate={setCurrentView}
          />
        );
      case 'health':
        return (
          <HealthManagement
            currentDog={currentDog}
            dogs={dogs}
            onNavigate={setCurrentView}
          />
        );
      case 'calendar':
        return (
          <CalendarManagement
            currentDog={currentDog}
            dogs={dogs}
            onNavigate={setCurrentView}
          />
        );
      case 'training':
        return (
          <TrainingView
            currentDog={currentDog}
            dogs={dogs}
            onNavigate={setCurrentView}
          />
        );
      case 'community':
        return (
          <CommunityView onNavigate={setCurrentView} />
        );
      case 'shop':
        return (
          <ShopView onNavigate={setCurrentView} />
        );
      case 'settings':
        return (
          <SettingsView
            currentDog={currentDog}
            dogs={dogs}
            onCreateDog={createDog}
            onUpdateDog={updateDog}
            onDeleteDog={deleteDog}
            onSelectDog={setCurrentDog}
            onNavigate={setCurrentView}
          />
        );
      default:
        return (
          <Dashboard
            currentDog={currentDog}
            dogs={dogs}
            vaccinations={vaccinations}
            healthRecords={healthRecords}
            appointments={appointments}
            trainingSessions={trainingSessions}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={login} onRegister={register} />;
  }

 return (
  <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900 flex">
    {/* Sidebar only for non-touch AND md+ */}
    <div className={`${isTouch ? "hidden" : "hidden md:block"}`}>
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        dogs={dogs}
        currentDog={currentDog}
        onDogSelect={setCurrentDog}
        onAddDog={handleAddDog}
      />
    </div>

    <div className="flex-1 min-w-0 flex flex-col">
      <Header user={user} onLogout={logout} currentView={currentView} />
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
        {renderCurrentView()}
      </main>
    </div>

    {/* Bottom nav for touch devices OR small screens */}
    {(isTouch || !window.matchMedia("(min-width: 768px)").matches) && (
      <div className="md:hidden">
        <MobileBottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    )}
  </div>
);

};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public route for QR scan */}
          <Route path="/public/dog/:id" element={<PublicDogProfile />} />

          {/* Default app (protected area) */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;