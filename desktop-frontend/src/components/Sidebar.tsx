import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Heart, 
  Calendar, 
  Award, 
  Users, 
  Settings,
  PlusCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  dogs: any[];
  currentDog: any;
  onDogSelect: (dog: any) => void;
  onAddDog: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  dogs,
  currentDog,
  onDogSelect,
  onAddDog,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard'), gradient: 'from-blue-500 to-cyan-500' },
    { id: 'health', icon: Heart, label: t('health'), gradient: 'from-red-500 to-pink-500' },
    { id: 'calendar', icon: Calendar, label: t('calendar1'), gradient: 'from-green-500 to-emerald-500' },
    { id: 'training', icon: Award, label: t('training'), gradient: 'from-purple-500 to-violet-500' },
    { id: 'settings', icon: Settings, label: t('settings'), gradient: 'from-gray-500 to-slate-500' },
    { 
    id: 'apk', 
    icon: ShoppingBag, 
    label: t('downloadApp'), 
    gradient: 'from-orange-500 to-yellow-500', 
    href: '/apk/edog-1.0.0.apk' // 👈 where your APK is served from backend
  },
  ];

  const shouldShowExpanded = isExpanded || isHovered;

  return (
    <div 
      className={cn(
        "bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-r border-white/20 dark:border-gray-700/20 flex flex-col h-full shadow-2xl transition-all duration-300 relative z-40",
        shouldShowExpanded ? "w-80" : "w-20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={cn("border-b border-white/20 dark:border-gray-700/20 transition-all duration-300", shouldShowExpanded ? "p-6" : "p-4")}>
        <div className="flex items-center space-x-3 group">
          <div className={cn(
            "bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110",
            shouldShowExpanded ? "w-12 h-12" : "w-10 h-10"
          )}>
            <img
              src="/logo.png"
              alt="eDog Logo"
              className={shouldShowExpanded ? "w-8 h-8" : "w-6 h-6"}
            />
          </div>
          {shouldShowExpanded && (
            <div className="overflow-hidden">
              <h1 className="text-2xl font-bold gradient-text">eDog</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Sparkles size={12} className="mr-1" />
                Desktop
              </p>
            </div>
          )}
        </div>
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute right-3 top-6 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 
                    rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isExpanded ? (
            <ChevronLeft size={18} className="text-primary-500" />
          ) : (
            <ChevronRight size={18} className="text-primary-500" />
          )}
        </button>
      </div>

      {/* Dogs Section */}
      <div className={cn("border-b border-white/20 dark:border-gray-700/20 transition-all duration-300", shouldShowExpanded ? "p-6" : "p-4")}>
        {shouldShowExpanded ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center">
                <Heart size={14} className="mr-2 text-primary-500" />
                {t('myDogs')}
              </h2>
              <button
                onClick={onAddDog}
                className="p-2 text-primary-500 hover:text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 hover:scale-110"
              >
                <PlusCircle size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex justify-center mb-4">
            <button
              onClick={onAddDog}
              className="p-2 text-primary-500 hover:text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 hover:scale-110"
              title={t('addDog')}
            >
              <PlusCircle size={16} />
            </button>
          </div>
        )}
        
        {dogs.length === 0 ? (
          <div className={cn("text-center", shouldShowExpanded ? "py-6" : "py-2")}>
            <div className={cn(
              "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center",
              shouldShowExpanded ? "w-16 h-16" : "w-8 h-8"
            )}>
              <Heart size={shouldShowExpanded ? 24 : 16} className="text-gray-400 dark:text-gray-500" />
            </div>
            {shouldShowExpanded && (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('noData')}</p>
                <button
                  onClick={onAddDog}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-200"
                >
                  {t('addDog')}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={cn("space-y-3", !shouldShowExpanded && "space-y-2")}>
            {dogs.map((dog) => (
              <div
                key={dog.id}
                onClick={() => onDogSelect(dog)}
                className={cn(
                  'flex items-center rounded-2xl cursor-pointer transition-all duration-300 group',
                  shouldShowExpanded ? 'p-4' : 'p-2 justify-center',
                  currentDog?.id === dog.id
                    ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'hover:bg-white/80 hover:shadow-lg hover:transform hover:scale-105'
                )}
                title={!shouldShowExpanded ? dog.name : undefined}
              >
                <div className={cn(
                  'rounded-2xl flex items-center justify-center shadow-md transition-all duration-300',
                  shouldShowExpanded ? 'w-12 h-12 mr-4' : 'w-8 h-8',
                  currentDog?.id === dog.id
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-primary-100 group-hover:to-blue-100'
                )}>
                  {dog.profilePicture ? (
                    <img
                      src={dog.profilePicture}
                      alt={dog.name}
                      className={cn("rounded-2xl object-cover", shouldShowExpanded ? "w-12 h-12" : "w-8 h-8")}
                    />
                  ) : (
                    <span className={cn(
                      'font-bold',
                      shouldShowExpanded ? 'text-lg' : 'text-sm',
                      currentDog?.id === dog.id ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'
                    )}>
                      {dog.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {shouldShowExpanded && (
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-semibold truncate transition-colors',
                      currentDog?.id === dog.id ? 'text-white' : 'text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300'
                    )}>
                      {dog.name}
                    </p>
                    <p className={cn(
                      'text-sm truncate transition-colors',
                      currentDog?.id === dog.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400'
                    )}>
                      {dog.breed}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={cn("flex-1 transition-all duration-300", shouldShowExpanded ? "p-6" : "p-4")}>
        <nav className="space-y-2">
          {navigationItems.map((item) => 
          item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-full group flex items-center rounded-xl transition-all duration-200 cursor-pointer',
                    shouldShowExpanded ? 'px-4 py-3' : 'px-2 py-3 justify-center',
                    'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 ' +
                    'dark:hover:from-primary-900/30 dark:hover:to-blue-900/30 hover:text-primary-700 dark:hover:text-primary-300 ' +
                    'hover:shadow-md hover:transform hover:translate-x-1'
                  )}
                  title={!shouldShowExpanded ? item.label : undefined}
                >
                  <div className={cn(
                    'rounded-xl flex items-center justify-center transition-all duration-300',
                    shouldShowExpanded ? 'w-10 h-10 mr-3' : 'w-8 h-8',
                    `bg-gradient-to-r ${item.gradient} opacity-80 group-hover:opacity-100`
                  )}>
                    <item.icon size={shouldShowExpanded ? 20 : 16} className="text-white group-hover:scale-110" />
                  </div>
                  {shouldShowExpanded && (
                    <span className="font-medium overflow-hidden">{item.label}</span>
                  )}
                </a>
              ) : (


            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full group flex items-center rounded-xl transition-all duration-200 cursor-pointer',
                shouldShowExpanded ? 'px-4 py-3' : 'px-2 py-3 justify-center',
                currentView === item.id 
                  ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 dark:hover:from-primary-900/30 dark:hover:to-blue-900/30 hover:text-primary-700 dark:hover:text-primary-300 hover:shadow-md hover:transform hover:translate-x-1',
                currentView === item.id && 'active'
              )}
              title={!shouldShowExpanded ? item.label : undefined}
            >
              <div className={cn(
                'rounded-xl flex items-center justify-center transition-all duration-300',
                shouldShowExpanded ? 'w-10 h-10 mr-3' : 'w-8 h-8',
                currentView === item.id 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : `bg-gradient-to-r ${item.gradient} opacity-80 group-hover:opacity-100`
              )}>
                <item.icon size={shouldShowExpanded ? 20 : 16} className={cn(
                  'transition-all duration-300',
                  currentView === item.id ? 'text-white' : 'text-white group-hover:scale-110'
                )} />
              </div>
              {shouldShowExpanded && (
                <span className="font-medium overflow-hidden">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className={cn("border-t border-white/20 dark:border-gray-700/20 transition-all duration-300", shouldShowExpanded ? "p-6" : "p-4")}>
        <div className="text-center">
          {shouldShowExpanded ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('madeWithLove')}<Heart size={12} className="inline text-red-500" /> {t('forDogs')}
            </p>
          ) : (
            <Heart size={16} className="text-red-500 mx-auto" />
          )}
        </div>
      </div>
    </div>
  );
};