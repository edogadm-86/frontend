import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pause, Play } from 'lucide-react';
import { useWalk } from '../context/WalkContext';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

interface WalkActiveBannerProps {
  onNavigateToTraining: () => void;
}

export const WalkActiveBanner: React.FC<WalkActiveBannerProps> = ({ onNavigateToTraining }) => {
  const { t } = useTranslation();
  const { phase, elapsed, distanceM, handlePause, handleResume } = useWalk();

  if (phase !== 'walking' && phase !== 'paused') return null;

  return (
    <div
      onClick={onNavigateToTraining}
      className="fixed bottom-[88px] md:bottom-6 left-1/2 -translate-x-1/2 z-50 cursor-pointer
                 flex items-center gap-3 px-4 py-3 rounded-2xl
                 bg-[#005da7] dark:bg-[#003a6e] text-white
                 shadow-2xl border border-white/20
                 hover:bg-[#0068bf] dark:hover:bg-[#004a8a] transition-colors
                 select-none"
    >
      {/* Animated paw */}
      <span
        className={`text-xl leading-none ${phase === 'walking' ? 'animate-bounce' : 'opacity-50'}`}
      >
        🐾
      </span>

      {/* Stats */}
      <div>
        <p className="text-[10px] font-semibold opacity-70 leading-none mb-0.5 uppercase tracking-wide">
          {phase === 'walking' ? t('walkInProgress') : t('walkPaused')}
        </p>
        <p className="text-sm font-bold leading-none tabular-nums">
          {formatDuration(elapsed)}&nbsp;·&nbsp;{formatDistance(distanceM)}
        </p>
      </div>

      {/* Quick pause/resume — stop propagation so it doesn't also navigate */}
      <button
        onClick={e => {
          e.stopPropagation();
          phase === 'walking' ? handlePause() : handleResume();
        }}
        className="ml-1 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
        aria-label={phase === 'walking' ? t('pause') : t('resume')}
      >
        {phase === 'walking'
          ? <Pause size={13} fill="currentColor" />
          : <Play size={13} fill="currentColor" />
        }
      </button>

      <span className="text-[10px] opacity-50 flex-shrink-0 hidden sm:block">{t('tapToOpen')}</span>
    </div>
  );
};
