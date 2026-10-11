import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { AppProvider, useApp } from './context/AppContext';
import { WalkProvider } from './context/WalkContext';
import { WalkActiveBanner } from './components/WalkActiveBanner';
import { Auth } from './components/Auth';
import { Landing } from './components/Landing';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
// import { DogManagement } from './components/DogManagement';
import { MobileBottomNav } from './components/MobileBottomNav';
import { WalkCompetitionOptIn } from './components/WalkCompetitionOptIn';
import { useIsCoarsePointer, useIsTouchDevice, useMediaQuery } from './hooks/useIsTouchDevice';
import { apiClient } from './lib/api';
import i18n from './lib/i18n';

// Views are code-split so the landing page and login don't download the whole app.
const lazyNamed = <K extends string>(load: () => Promise<Record<K, React.ComponentType<any>>>, name: K) =>
  lazy(() => load().then(m => ({ default: m[name] })));

const Dashboard = lazyNamed(() => import('./components/Dashboard'), 'Dashboard');
const HealthManagement = lazyNamed(() => import('./components/HealthManagement'), 'HealthManagement');
const CalendarManagement = lazyNamed(() => import('./components/CalendarManagement'), 'CalendarManagement');
const TrainingView = lazyNamed(() => import('./components/TrainingView'), 'TrainingView');
const SettingsView = lazyNamed(() => import('./components/SettingsView'), 'SettingsView');
const CommunityView = lazyNamed(() => import('./components/CommunityView'), 'CommunityView');
const PublicDogProfile = lazyNamed(() => import('./components/PublicDogProfile'), 'PublicDogProfile');
const PetPassport = lazyNamed(() => import('./components/PetPassport'), 'PetPassport');
const AdminApp = lazyNamed(() => import('./components/AdminApp'), 'AdminApp');
const ExpensesView = lazyNamed(() => import('./components/ExpensesView'), 'ExpensesView');
const ServicesView = lazyNamed(() => import('./components/ServicesView'), 'ServicesView');
const GroomingTrackerView = lazyNamed(() => import('./components/GroomingTrackerView'), 'GroomingTrackerView');
const PhotoAlbumView = lazyNamed(() => import('./components/PhotoAlbumView'), 'PhotoAlbumView');
const ActivityAnalyticsView = lazyNamed(() => import('./components/ActivityAnalyticsView'), 'ActivityAnalyticsView');
const BreedIntelligenceView = lazyNamed(() => import('./components/BreedIntelligenceView'), 'BreedIntelligenceView');

const ViewFallback = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-8 h-8 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin" />
  </div>
);

const RETURNING_KEY = 'edog_returning_user';

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
    setCurrentDog,
    awaitingVerification,
    pendingVerificationEmail,
    completeEmailVerification,
    cancelVerification,
  } = useApp();

  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddDogModal, setShowAddDogModal] = useState(false);
  const [showOptInModal, setShowOptInModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Once someone has signed in on this device, skip the landing page next time.
  // After login, leave /login or /register so the URL matches the app.
  useEffect(() => {
    if (!user) return;
    try { localStorage.setItem(RETURNING_KEY, '1'); } catch { /* storage unavailable */ }
    if (location.pathname === '/login' || location.pathname === '/register') {
      navigate('/', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // Keep the account language in sync with the UI so reminder emails arrive in it.
  // Older accounts were all saved as 'en' because registration never sent a language.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    const sync = (lng?: string) => { apiClient.updateLanguage((lng || 'bg').slice(0, 2)).catch(() => {}); };
    sync(i18n.resolvedLanguage);
    i18n.on('languageChanged', sync);
    return () => { i18n.off('languageChanged', sync); };
  }, [userId]);

  // Show opt-in modal once when user is logged in and hasn't been asked yet
  useEffect(() => {
    if (user && user.walk_competition_opted_in === null) {
      const timer = setTimeout(() => setShowOptInModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);
  const isCoarse = useIsCoarsePointer();
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const showSidebar = isMdUp && !isCoarse;      // desktop only
  const showBottomNav = !isMdUp || isCoarse
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
      case 'passport':
        return (
          <PetPassport
            dog={currentDog}
            onNavigate={setCurrentView}
          />
        );
      case 'community':
        return (
          <CommunityView onNavigate={setCurrentView} />
        );
      case 'expenses':
        return (
          <ExpensesView currentDog={currentDog} />
        );
      case 'services':
        return <ServicesView />;
      case 'grooming':
        return <GroomingTrackerView currentDog={currentDog} onNavigate={setCurrentView} />;
      case 'photos':
        return <PhotoAlbumView currentDog={currentDog} onNavigate={setCurrentView} />;
      case 'activity':
        return <ActivityAnalyticsView currentDog={currentDog} onNavigate={setCurrentView} />;
      case 'breed':
        return <BreedIntelligenceView currentDog={currentDog} onNavigate={setCurrentView} />;
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
    const path = location.pathname;
    let returning = false;
    try { returning = localStorage.getItem(RETURNING_KEY) === '1'; } catch { /* storage unavailable */ }

    if (!awaitingVerification && path !== '/login' && path !== '/register' && !returning) {
      const go = (to: string) => { navigate(to); window.scrollTo(0, 0); };
      return <Landing onLogin={() => go('/login')} onRegister={() => go('/register')} />;
    }

    return (
      <Auth
        key={path}
        initialMode={path === '/register' ? 'register' : 'login'}
        onLogin={login}
        onRegister={register}
        awaitingVerification={awaitingVerification}
        pendingVerificationEmail={pendingVerificationEmail}
        onResendVerification={(email) => apiClient.resendVerification(email, i18n.resolvedLanguage)}
        onCancelVerification={cancelVerification}
      />
    );
  }

 return (
  <div className="h-screen w-full overflow-hidden bg-[#fbf9f8] dark:bg-[#111316] flex flex-col">
    <Header user={user} onLogout={logout} currentView={currentView} />

    <div className="flex flex-1 min-h-0 overflow-hidden">
      {showSidebar && (
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          dogs={dogs}
          currentDog={currentDog}
          onDogSelect={setCurrentDog}
          onAddDog={handleAddDog}
          user={user}
        />
      )}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
        <Suspense fallback={<ViewFallback />}>{renderCurrentView()}</Suspense>
      </main>
    </div>

    {showBottomNav && (
      <div className="md:hidden">
        <MobileBottomNav currentView={currentView} onViewChange={setCurrentView} user={user} />
      </div>
    )}

    <WalkActiveBanner onNavigateToTraining={() => setCurrentView('training')} />
    {showOptInModal && <WalkCompetitionOptIn onDismiss={() => setShowOptInModal(false)} />}
  </div>
);

};

const VerifyEmailPage: React.FC = () => {
  const { completeEmailVerification } = useApp();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); return; }
    completeEmailVerification(token)
      .then(() => {
        setStatus('success');
        navigate('/', { replace: true });
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-[#fbf9f8] dark:bg-[#111316] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005da7] mx-auto mb-4" />
          <p className="text-[#414751] dark:text-[#c1c7d3]">Verifying your email…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#fbf9f8] dark:bg-[#111316] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <span className="material-symbols-outlined text-[56px] text-red-500 mb-4 block">error</span>
          <h2 className="text-2xl font-bold text-[#1b1c1b] dark:text-[#e2e2e6] mb-2">Verification failed</h2>
          <p className="text-[#414751] dark:text-[#c1c7d3] mb-6">The link is invalid or has expired. Please request a new verification email.</p>
          <a href="/" className="inline-block px-6 py-3 bg-[#005da7] text-white rounded-xl font-semibold hover:brightness-110 transition">Back to login</a>
        </div>
      </div>
    );
  }

  return null; // success → AppContent takes over once user is set
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <WalkProvider>
      <Router>
        <Routes>
          {/* Email verification deep-link */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Public route for QR scan */}
          <Route path="/public/dog/:id" element={<Suspense fallback={<ViewFallback />}><PublicDogProfile /></Suspense>} />

          {/* Admin panel — standalone, self-authenticated */}
          <Route path="/adminpanel" element={<Suspense fallback={<ViewFallback />}><AdminApp /></Suspense>} />

          {/* Default app (protected area) */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
      </WalkProvider>
    </AppProvider>
  );
};

export default App;