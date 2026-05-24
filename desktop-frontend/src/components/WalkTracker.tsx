import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Square, Pause, RotateCcw, MapPin, Clock, Zap, Save, Navigation, Trophy } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Dog } from '../types';
import { useWalk } from '../context/WalkContext';
import { useApp } from '../context/AppContext';
import { apiClient } from '../lib/api';

interface WalkTrackerProps {
  currentDog: Dog | null;
  onSaved?: () => void;
}

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

// Inner component so it can call useMap (must be inside MapContainer)
function LiveMapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export const WalkTracker: React.FC<WalkTrackerProps> = ({ currentDog, onSaved }) => {
  const { t } = useTranslation();
  const {
    phase, elapsed, distanceM, caloriesBurned, maxSpeedKmh, pathPoints,
    gpsStatus, gpsError, saving, saved,
    handleStart, handlePause, handleResume, handleStop, handleReset, handleSave,
  } = useWalk();
  const { user, setUserOptIn } = useApp();
  const [optInSaving, setOptInSaving] = useState(false);
  // Track whether a walk has ever started in this session so MapContainer
  // stays permanently mounted (never remounts between walks — prevents
  // Leaflet losing state and showing straight lines on 2nd+ walks).
  const [mapEverShown, setMapEverShown] = useState(false);

  const dogWeightKg = currentDog ? parseFloat(String(currentDog.weight)) || 0 : 0;

  const handleToggleCompetition = async () => {
    if (optInSaving || user?.walk_competition_opted_in === undefined) return;
    const next = !user.walk_competition_opted_in;
    setOptInSaving(true);
    try {
      await apiClient.updateWalkCompetitionOptIn(next);
      setUserOptIn(next);
    } catch { /* silent */ }
    finally { setOptInSaving(false); }
  };

  const avgSpeedKmh = elapsed > 0 ? (distanceM / 1000) / (elapsed / 3600) : 0;

  // Once phase leaves idle, permanently show the map so MapContainer never unmounts
  useEffect(() => {
    if (phase !== 'idle') setMapEverShown(true);
  }, [phase]);

  const cardCls = 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl';
  const statVal = 'text-2xl font-extrabold text-gray-900 dark:text-[#e2e2e6] leading-tight';
  const statLbl = 'text-[10px] font-bold text-gray-400 dark:text-[#8b919d] uppercase tracking-widest mt-0.5';

  const lastPoint = pathPoints.length > 0 ? pathPoints[pathPoints.length - 1] : null;
  const mapCenter: [number, number] = lastPoint
    ? [lastPoint.lat, lastPoint.lng]
    : [51.505, -0.09]; // default (London) — never visible unless GPS fires

  const leafletPath: [number, number][] = pathPoints.map(p => [p.lat, p.lng]);

  return (
    <div className={`${cardCls} overflow-hidden`}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-[#005da7] dark:text-[#a4c9ff] uppercase tracking-widest mb-0.5">{t('walkTracker')}</p>
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">
            {currentDog ? `${currentDog.name} — ${t('trackWalk')}` : t('trackWalk')}
          </h3>
        </div>
        {phase === 'walking' && (
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${gpsStatus === 'ok' ? 'bg-green-500 animate-pulse' : gpsStatus === 'waiting' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-semibold text-gray-500 dark:text-[#8b919d]">GPS</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 dark:bg-[#111316] rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={13} className="text-[#005da7] dark:text-[#a4c9ff]" />
            </div>
            <p className={statVal}>{formatDuration(elapsed)}</p>
            <p className={statLbl}>{t('duration')}</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#111316] rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin size={13} className="text-emerald-500" />
            </div>
            <p className={statVal}>{formatDistance(distanceM)}</p>
            <p className={statLbl}>{t('distance')}</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#111316] rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={13} className="text-amber-500" />
            </div>
            <p className={statVal}>{avgSpeedKmh.toFixed(1)}</p>
            <p className={statLbl}>{t('kmh')}</p>
          </div>
        </div>

        {/* Map — permanently mounted after first walk so Leaflet never remounts */}
        {mapEverShown && (
          <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 relative" style={{ height: 200 }}>
            <MapContainer
              center={mapCenter}
              zoom={17}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {pathPoints.length > 0 && (
                <>
                  {/* Auto-pan to latest position */}
                  <LiveMapController center={mapCenter} />
                  {/* Walk path */}
                  {leafletPath.length > 1 && (
                    <Polyline
                      positions={leafletPath}
                      pathOptions={{ color: '#005da7', weight: 4, opacity: 0.85 }}
                    />
                  )}
                  {/* Start marker */}
                  <CircleMarker
                    center={leafletPath[0]}
                    radius={8}
                    pathOptions={{ color: '#fff', fillColor: '#005da7', fillOpacity: 1, weight: 2 }}
                  />
                  {/* Current position marker */}
                  {leafletPath.length > 1 && (
                    <CircleMarker
                      center={leafletPath[leafletPath.length - 1]}
                      radius={6}
                      pathOptions={{ color: '#fff', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
                    />
                  )}
                </>
              )}
            </MapContainer>
            {pathPoints.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-[#1e2023]/70 z-[1000]">
                <p className="text-xs font-semibold text-gray-400 dark:text-[#8b919d]">Waiting for GPS…</p>
              </div>
            )}
          </div>
        )}

        {/* GPS error */}
        {gpsError && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">
            <Navigation size={13} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{gpsError}</p>
          </div>
        )}

        {/* Controls */}
        {phase === 'idle' && (
          <div className="space-y-2">
            <button
              onClick={handleStart}
              disabled={!currentDog}
              className="w-full py-3 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Play size={16} fill="currentColor" />
              {t('startWalk')}
            </button>
            {/* Competition toggle — only shown when user has already been asked */}
            {user && user.walk_competition_opted_in !== null && (
              <button
                onClick={handleToggleCompetition}
                disabled={optInSaving}
                className={`w-full py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all border ${
                  user.walk_competition_opted_in
                    ? 'border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                    : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#8b919d] hover:bg-gray-50 dark:hover:bg-[#282a2d]'
                }`}
              >
                <Trophy size={13} className={user.walk_competition_opted_in ? 'text-amber-500' : ''} />
                {user.walk_competition_opted_in ? t('competitionOn') : t('competitionOff')}
              </button>
            )}
          </div>
        )}

        {phase === 'walking' && (
          <div className="flex gap-2">
            <button onClick={handlePause} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
              <Pause size={16} fill="currentColor" />{t('pause')}
            </button>
            <button onClick={handleStop} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              <Square size={16} fill="currentColor" />{t('endWalk')}
            </button>
          </div>
        )}

        {phase === 'paused' && (
          <div className="flex gap-2">
            <button onClick={handleResume} className="flex-1 py-3 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <Play size={16} fill="currentColor" />{t('resume')}
            </button>
            <button onClick={handleStop} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              <Square size={16} fill="currentColor" />{t('endWalk')}
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-3 text-center space-y-1">
              <p className="text-sm font-bold text-green-700 dark:text-green-400">{t('walkComplete')}</p>
              <p className="text-xs text-gray-600 dark:text-[#8b919d]">
                {formatDistance(distanceM)} · {formatDuration(elapsed)} · {t('max')} {maxSpeedKmh.toFixed(1)} km/h
              </p>
              {caloriesBurned > 0 && (
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  ~{caloriesBurned} kcal {t('burned')}
                </p>
              )}
            </div>
            {saved ? (
              <div className="py-2 text-center text-sm font-semibold text-green-600 dark:text-green-400">{t('walkSaved')}</div>
            ) : (
              <button
                onClick={() => currentDog && handleSave(currentDog.id, dogWeightKg, onSaved)}
                disabled={saving || !currentDog}
                className="w-full py-3 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Save size={15} />
                {saving ? t('saving') : t('saveToTraining')}
              </button>
            )}
            <button onClick={handleReset} className="w-full py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#8b919d] rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all flex items-center justify-center gap-2">
              <RotateCcw size={14} />{t('newWalk')}
            </button>
          </div>
        )}

        {!currentDog && phase === 'idle' && (
          <p className="text-xs text-center text-gray-400 dark:text-[#8b919d]">{t('selectDogToTrack')}</p>
        )}
      </div>
    </div>
  );
};
