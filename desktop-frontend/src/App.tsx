import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DogManagement } from './components/DogManagement';

const AppContent: React.FC = () => {
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
    currentDog,
    setCurrentDog
  } = useApp();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddDogModal, setShowAddDogModal] = useState(false);

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
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Management</h2>
            <p className="text-gray-600">Health management features coming soon...</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Calendar</h2>
            <p className="text-gray-600">Calendar features coming soon...</p>
          </div>
        );
      case 'training':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Training</h2>
            <p className="text-gray-600">Training features coming soon...</p>
          </div>
        );
      case 'community':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community</h2>
            <p className="text-gray-600">Community features coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <DogManagement
            dogs={dogs}
            onCreateDog={createDog}
            onUpdateDog={updateDog}
            onSelectDog={setCurrentDog}
            currentDog={currentDog}
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        dogs={dogs}
        currentDog={currentDog}
        onDogSelect={setCurrentDog}
        onAddDog={handleAddDog}
      />
      <div className="flex-1 flex flex-col">
        <Header
          user={user}
          onLogout={logout}
          currentView={currentView}
        />
        <main className="flex-1 overflow-auto">
          {renderCurrentView()}
        </main>
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