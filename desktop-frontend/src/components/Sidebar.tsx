import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  dogs: any[];
  currentDog: any;
  onDogSelect: (dog: any) => void;
  onAddDog: () => void;
  user?: { is_admin?: boolean } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  dogs,
  currentDog,
  onDogSelect,
  onAddDog,
  user,
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = React.useState(false);

  const mainNavItems = [
    { id: 'dashboard', icon: 'dashboard', label: t('dashboard') },
    { id: 'health', icon: 'monitor_heart', label: t('health') },
    { id: 'passport', icon: 'badge', label: t('petPassport') },
    { id: 'calendar', icon: 'calendar_month', label: t('calendar1') },
    { id: 'training', icon: 'fitness_center', label: t('training') },
    { id: 'community', icon: 'groups', label: t('community') },
    { id: 'expenses', icon: 'receipt_long', label: t('expenses') },
  ];

  const bottomNavItems = [
    { id: 'settings', icon: 'settings', label: t('settings') },
  ];

  const expanded = true;

  return (
    <div
      className={cn(
        'font-jakarta bg-[#fbf9f8] dark:bg-[#111316] border-r border-gray-200/60 dark:border-white/5 flex flex-col flex-shrink-0 transition-all duration-300 relative z-40',
        expanded ? 'w-64' : 'w-[72px]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dog card */}
      <div className={cn('flex-shrink-0 transition-all duration-300', expanded ? 'p-3' : 'p-2')}>
        <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl">
          {currentDog ? (
            <div className={cn('transition-all duration-300', expanded ? 'p-3' : 'p-2')}>
              {dogs.length > 1 && expanded && (
                <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
                  {dogs.map(dog => (
                    <button
                      key={dog.id}
                      onClick={() => onDogSelect(dog)}
                      className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-full overflow-hidden border-2 transition-all',
                        currentDog.id === dog.id
                          ? 'border-[#005da7] dark:border-[#a4c9ff]'
                          : 'border-transparent opacity-50 hover:opacity-100'
                      )}
                    >
                      {dog.profilePicture ? (
                        <img src={dog.profilePicture} alt={dog.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#005da7] dark:bg-[#a4c9ff] flex items-center justify-center text-white dark:text-[#00315d] text-[9px] font-bold">
                          {dog.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className={cn('flex items-center', expanded ? 'gap-3' : 'justify-center')}>
                <div className={cn(
                  'rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#005da7]/20 dark:ring-[#a4c9ff]/20',
                  expanded ? 'w-11 h-11' : 'w-9 h-9'
                )}>
                  {currentDog.profilePicture ? (
                    <img src={currentDog.profilePicture} alt={currentDog.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#005da7] to-[#0090e7] flex items-center justify-center text-white font-bold text-sm">
                      {currentDog.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {expanded && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] truncate">{currentDog.name}</p>
                    <p className="text-xs text-gray-400 dark:text-[#8b919d] truncate">{currentDog.breed || '—'}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={cn(
              'flex items-center justify-center text-gray-300 dark:text-[#414751]',
              expanded ? 'p-4 gap-2' : 'p-3'
            )}>
              <span className="material-symbols-outlined text-[20px]">pets</span>
              {expanded && <span className="text-xs text-gray-400 dark:text-[#8b919d]">{t('addDog')}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Main navigation */}
      <nav className={cn(
        'flex-1 py-1 space-y-0.5 min-h-0 overflow-y-auto transition-all duration-300',
        expanded ? 'px-3' : 'px-2'
      )}>
        {mainNavItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={!expanded ? item.label : undefined}
              className={cn(
                'w-full flex items-center rounded-xl transition-all duration-150',
                expanded ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5',
                isActive
                  ? 'bg-[#005da7] dark:bg-[#a4c9ff]/15 text-white dark:text-[#a4c9ff]'
                  : 'text-gray-600 dark:text-[#c1c7d3] hover:bg-gray-100 dark:hover:bg-[#282a2d] hover:text-gray-900 dark:hover:text-[#e2e2e6]'
              )}
            >
              <span className={cn(
                'material-symbols-outlined text-[20px] leading-none flex-shrink-0',
                isActive ? 'text-white dark:text-[#a4c9ff]' : 'text-gray-500 dark:text-[#8b919d]'
              )}>
                {item.icon}
              </span>
              {expanded && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Add New Pet */}
      <div className={cn('flex-shrink-0 transition-all duration-300', expanded ? 'px-3 py-3' : 'px-2 py-2')}>
        <button
          onClick={onAddDog}
          title={!expanded ? t('addDog') : undefined}
          className={cn(
            'w-full flex items-center justify-center gap-2 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95',
            expanded ? 'py-2.5' : 'py-2'
          )}
        >
          <PlusCircle size={16} className="flex-shrink-0" />
          {expanded && <span>{t('addDog')}</span>}
        </button>
      </div>

      {/* Bottom: Settings + Download */}
      <div className={cn(
        'flex-shrink-0 border-t border-gray-100 dark:border-white/5 py-2 space-y-0.5 transition-all duration-300',
        expanded ? 'px-3' : 'px-2'
      )}>
        {bottomNavItems.map(item => {
          const isActive = currentView === item.id;
          const cls = cn(
            'w-full flex items-center rounded-xl transition-all duration-150',
            expanded ? 'gap-3 px-3 py-2' : 'justify-center py-2',
            isActive
              ? 'bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 text-[#005da7] dark:text-[#a4c9ff]'
              : 'text-gray-500 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] hover:text-gray-700 dark:hover:text-[#c1c7d3]'
          );

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={!expanded ? item.label : undefined}
              className={cls}
            >
              <span className="material-symbols-outlined text-[18px] leading-none flex-shrink-0">{item.icon}</span>
              {expanded && <span className="text-xs font-medium truncate">{item.label}</span>}
            </button>
          );
        })}

        {user?.is_admin && (
          <a
            href="/adminpanel"
            title={!expanded ? 'Admin Panel' : undefined}
            className={cn(
              'w-full flex items-center rounded-xl transition-all duration-150 text-[#005da7] dark:text-[#a4c9ff] hover:bg-[#005da7]/10 dark:hover:bg-[#a4c9ff]/10',
              expanded ? 'gap-3 px-3 py-2' : 'justify-center py-2'
            )}
          >
            <span className="material-symbols-outlined text-[18px] leading-none flex-shrink-0">admin_panel_settings</span>
            {expanded && <span className="text-xs font-semibold truncate">Admin Panel</span>}
          </a>
        )}
      </div>
    </div>
  );
};
