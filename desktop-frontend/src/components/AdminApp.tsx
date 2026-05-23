import React, { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { apiClient } from '../lib/api';
import { AdminPanel } from './AdminPanel';
import { Sun, Moon, LogOut, ShieldOff } from 'lucide-react';

type AuthState = 'loading' | 'unauthorized' | 'forbidden' | 'ok';

export const AdminApp: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setAuthState('unauthorized');
      return;
    }

    apiClient.getProfile()
      .then(res => {
        if (res.user.is_admin) {
          setAdminName(res.user.name);
          setAuthState('ok');
        } else {
          setAuthState('forbidden');
        }
      })
      .catch(() => {
        setAuthState('unauthorized');
      });
  }, []);

  const handleLogout = () => {
    apiClient.clearToken();
    window.location.href = '/';
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#fbf9f8] dark:bg-[#111316] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-[#8b919d]">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen bg-[#fbf9f8] dark:bg-[#111316] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShieldOff size={48} className="mx-auto mb-4 text-gray-300 dark:text-[#414751]" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6] mb-2">Not signed in</h2>
          <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-6">
            You need to be logged in to access the admin panel.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#005da7] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Go to App
          </a>
        </div>
      </div>
    );
  }

  if (authState === 'forbidden') {
    return (
      <div className="min-h-screen bg-[#fbf9f8] dark:bg-[#111316] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShieldOff size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6] mb-2">Access denied</h2>
          <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-6">
            You don't have admin privileges to access this page.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#005da7] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Back to App
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f8] dark:bg-[#111316] flex flex-col font-jakarta">
      {/* Admin header */}
      <header className="bg-[#fbf9f8] dark:bg-[#111316] border-b border-gray-200/60 dark:border-white/5 px-4 lg:px-6 py-3 flex-shrink-0 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          {/* Brand */}
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-[#005da7] to-[#0090e7] rounded-xl flex items-center justify-center shadow-sm">
              <img src="/logo-header.png" alt="eDog" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-lg font-bold text-[#005da7] dark:text-[#a4c9ff] hidden md:block">eDog</span>
          </a>

          <div className="hidden md:block w-px h-5 bg-gray-200 dark:bg-white/10 flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <h1 className="text-base lg:text-lg font-bold text-gray-900 dark:text-[#e2e2e6] leading-tight">
              Admin Panel
            </h1>
            <p className="text-xs text-gray-400 dark:text-[#8b919d] hidden sm:block leading-tight">
              Signed in as <span className="font-medium text-[#005da7] dark:text-[#a4c9ff]">{adminName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/"
              className="text-xs text-gray-500 dark:text-[#8b919d] hover:text-gray-800 dark:hover:text-[#e2e2e6] px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all font-medium hidden sm:block"
            >
              ← Back to App
            </a>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-500 dark:text-[#8b919d] hover:text-gray-800 dark:hover:text-[#e2e2e6] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <AdminPanel />
      </main>
    </div>
  );
};
