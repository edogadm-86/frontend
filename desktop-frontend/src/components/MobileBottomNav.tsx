import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Heart, Wallet, Users, MoreHorizontal, Award, Calendar, Settings, X, ShieldCheck, Store } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileBottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user?: { is_admin?: boolean } | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  user,
}) => {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);

  // Primary tabs — always visible
  const primary = [
    { id: 'dashboard', icon: Home,    label: t('dashboard') },
    { id: 'health',    icon: Heart,   label: t('health') },
    { id: 'expenses',  icon: Wallet,  label: t('expenses') },
    { id: 'community', icon: Users,   label: t('community') },
  ];

  // Secondary items — shown in the "More" drawer
  const secondary = [
    { id: 'services',  icon: Store,    label: t('services') },
    { id: 'training',  icon: Award,    label: t('training') },
    { id: 'calendar',  icon: Calendar, label: t('calendar1') },
    { id: 'settings',  icon: Settings, label: t('settings') },
  ];

  const secondaryActive = secondary.some(s => s.id === currentView);

  const handlePrimary = (id: string) => {
    onViewChange(id);
    setMoreOpen(false);
  };

  const handleSecondary = (id: string) => {
    onViewChange(id);
    setMoreOpen(false);
  };

  return (
    <>
      {/* More drawer backdrop */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div className="md:hidden fixed bottom-[72px] left-3 right-3 z-50 bg-white dark:bg-[#1e2023] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
            <span className="text-xs font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider">
              {t('more')}
            </span>
            <button onClick={() => setMoreOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#282a2d]">
              <X size={15} className="text-gray-400 dark:text-[#8b919d]" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-0 p-2">
            {secondary.map(item => {
              const active = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSecondary(item.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all',
                    active
                      ? 'bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 text-[#005da7] dark:text-[#a4c9ff]'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#282a2d]'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={20} className={active ? 'text-[#005da7] dark:text-[#a4c9ff]' : 'text-gray-500 dark:text-gray-400'} />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </button>
              );
            })}
            {user?.is_admin && (
              <a
                href="/adminpanel"
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-[#005da7] dark:text-[#a4c9ff] hover:bg-[#005da7]/10 dark:hover:bg-[#a4c9ff]/10 transition-all"
              >
                <ShieldCheck size={20} />
                <span className="text-[10px] font-medium leading-none">Admin</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-50',
          'bg-white/90 dark:bg-[#111316]/90 backdrop-blur-md',
          'border-t border-gray-200/60 dark:border-white/5',
          'pb-[env(safe-area-inset-bottom)]'
        )}
      >
        <nav className="px-2 py-2">
          <ul className="grid grid-cols-5 gap-0.5">
            {primary.map(item => {
              const active = currentView === item.id;
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handlePrimary(item.id)}
                    className={cn(
                      'w-full h-14 rounded-2xl px-1',
                      'flex flex-col items-center justify-center',
                      'transition-all duration-200',
                      active
                        ? 'bg-[#005da7] dark:bg-[#a4c9ff]/15 text-white dark:text-[#a4c9ff]'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2d]'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      size={20}
                      className={cn('mb-1', active ? 'text-white dark:text-[#a4c9ff]' : 'text-gray-500 dark:text-gray-400')}
                    />
                    <span className="text-[10px] leading-none font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[52px]">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}

            {/* More button */}
            <li>
              <button
                type="button"
                onClick={() => setMoreOpen(o => !o)}
                className={cn(
                  'w-full h-14 rounded-2xl px-1',
                  'flex flex-col items-center justify-center',
                  'transition-all duration-200',
                  (moreOpen || secondaryActive)
                    ? 'bg-[#005da7] dark:bg-[#a4c9ff]/15 text-white dark:text-[#a4c9ff]'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2d]'
                )}
              >
                <MoreHorizontal
                  size={20}
                  className={cn('mb-1', (moreOpen || secondaryActive) ? 'text-white dark:text-[#a4c9ff]' : 'text-gray-500 dark:text-gray-400')}
                />
                <span className="text-[10px] leading-none font-medium">
                  {t('more')}
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};
