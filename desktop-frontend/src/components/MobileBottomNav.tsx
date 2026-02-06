import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Heart, Calendar, Award, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileBottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

/**
 * Mobile-first bottom navigation for the main sections.
 * - Visible only on small screens (<md).
 * - Uses the same view IDs as Sidebar/AppContent.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
}) => {
  const { t } = useTranslation();

  const items = [
    { id: 'dashboard', icon: Home, label: t('dashboard') },
    { id: 'health', icon: Heart, label: t('health') },
    { id: 'calendar', icon: Calendar, label: t('calendar1') },
    { id: 'training', icon: Award, label: t('training') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-50',
        'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md',
        'border-t border-white/20 dark:border-gray-700/30',
        'pb-[env(safe-area-inset-bottom)]'
      )}
    >
      <nav className="px-2 py-2">
        <ul className="grid grid-cols-5 gap-1">
          {items.map((item) => {
            const active = currentView === item.id;
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full h-14",                 // fixed button height
                    "rounded-2xl px-1",            // remove py-2 (height is fixed)
                    "flex flex-col items-center justify-center",
                    "transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800/50"
                  )}

                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    size={20}
                    className={cn('mb-1', active ? 'text-white' : 'text-primary-500')}
                  />
                   <span
                      className={cn(
                        "text-[11px] leading-none font-medium",
                        "whitespace-nowrap overflow-hidden text-ellipsis",  //  prevents wrapping
                        "max-w-[64px]"                                      //  consistent label width
                      )}
                    >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
