import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import i18next from 'i18next';
import { apiClient } from '../lib/api';

export interface WalkPoint { lat: number; lng: number; }
export type WalkPhase = 'idle' | 'walking' | 'paused' | 'done';

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface WalkContextType {
  phase: WalkPhase;
  elapsed: number;
  distanceM: number;
  caloriesBurned: number;
  maxSpeedKmh: number;
  pathPoints: WalkPoint[];
  gpsStatus: 'waiting' | 'ok' | 'error';
  gpsError: string | null;
  saving: boolean;
  saved: boolean;
  handleStart: () => void;
  handlePause: () => void;
  handleResume: () => void;
  handleStop: () => void;
  handleReset: () => void;
  handleSave: (dogId: string, dogWeightKg: number, onSaved?: () => void) => Promise<void>;
}

const WalkContext = createContext<WalkContextType | undefined>(undefined);

export const useWalk = () => {
  const ctx = useContext(WalkContext);
  if (!ctx) throw new Error('useWalk must be used within WalkProvider');
  return ctx;
};

export const WalkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [phase, setPhase] = useState<WalkPhase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [distanceM, setDistanceM] = useState(0);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'waiting' | 'ok' | 'error'>('waiting');
  const [pathPoints, setPathPoints] = useState<WalkPoint[]>([]);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = useRef<GeolocationCoordinates | null>(null);
  const pathRef = useRef<WalkPoint[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);
  // Mirror refs so stable callbacks can read latest values without stale closures
  const elapsedRef = useRef<number>(0);
  const distanceMRef = useRef<number>(0);
  const maxSpeedRef = useRef<number>(0);

  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => { stopGps(); stopTimer(); }, [stopGps, stopTimer]);

  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError(i18next.t('gpsNotSupported'));
      setGpsStatus('error');
      return;
    }
    setGpsStatus('waiting');
    setGpsError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        setGpsStatus('ok');
        const coords = pos.coords;
        const point: WalkPoint = { lat: coords.latitude, lng: coords.longitude };
        pathRef.current.push(point);
        setPathPoints([...pathRef.current]);
        if (lastPositionRef.current) {
          const d = haversineMeters(
            lastPositionRef.current.latitude, lastPositionRef.current.longitude,
            coords.latitude, coords.longitude,
          );
          if (d > 2 && d < 500) {
            setDistanceM(prev => {
              const next = prev + d;
              distanceMRef.current = next;
              return next;
            });
          }
          if (coords.speed !== null && coords.speed > 0) {
            setMaxSpeedKmh(prev => {
              const next = Math.max(prev, coords.speed! * 3.6);
              maxSpeedRef.current = next;
              return next;
            });
          }
        }
        lastPositionRef.current = coords;
      },
      err => { setGpsStatus('error'); setGpsError(err.message); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      const next = pausedElapsedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
      elapsedRef.current = next;
      setElapsed(next);
    }, 1000);
  }, []);

  const handleStart = useCallback(() => {
    setDistanceM(0); setElapsed(0); setMaxSpeedKmh(0); setSaved(false); setCaloriesBurned(0);
    setPathPoints([]); pathRef.current = [];
    lastPositionRef.current = null;
    pausedElapsedRef.current = 0; elapsedRef.current = 0; distanceMRef.current = 0; maxSpeedRef.current = 0;
    startTimeRef.current = Date.now();
    setPhase('walking');
    startGps();
    startTimer();
  }, [startGps, startTimer]);

  const handlePause = useCallback(() => {
    stopGps(); stopTimer();
    pausedElapsedRef.current = elapsedRef.current;
    setPhase('paused');
  }, [stopGps, stopTimer]);

  const handleResume = useCallback(() => {
    startTimeRef.current = Date.now();
    setPhase('walking');
    startGps();
    startTimer();
  }, [startGps, startTimer]);

  const handleStop = useCallback(() => {
    stopGps(); stopTimer();
    setPhase('done');
  }, [stopGps, stopTimer]);

  const handleReset = useCallback(() => {
    stopGps(); stopTimer();
    setDistanceM(0); setElapsed(0); setMaxSpeedKmh(0); setSaved(false); setCaloriesBurned(0);
    setGpsError(null); setGpsStatus('waiting');
    setPathPoints([]); pathRef.current = [];
    lastPositionRef.current = null;
    pausedElapsedRef.current = 0; elapsedRef.current = 0; distanceMRef.current = 0; maxSpeedRef.current = 0;
    setPhase('idle');
  }, [stopGps, stopTimer]);

  const handleSave = useCallback(async (dogId: string, dogWeightKg: number, onSaved?: () => void) => {
    if (saving) return;
    setSaving(true);
    const e = elapsedRef.current;
    const d = distanceMRef.current;
    const maxSpd = maxSpeedRef.current;
    const durationMin = Math.max(1, Math.round(e / 60));
    const distKm = (d / 1000).toFixed(2);
    const avgKmh = e > 0 ? ((d / 1000) / (e / 3600)).toFixed(1) : '0.0';
    // 0.8 kcal per kg per km walked (standard dog walking estimate)
    const cal = dogWeightKg > 0 ? Math.round(dogWeightKg * (d / 1000) * 0.8) : 0;
    setCaloriesBurned(cal);
    const notes = `${i18next.t('walkSummary')}: ${distKm} km ${i18next.t('in')} ${i18next.t('minute', { count: durationMin })}, ${i18next.t('avgSpeed')}: ${avgKmh} km/h${cal > 0 ? `, ~${cal} kcal` : ''}`;
    try {
      await apiClient.createTrainingSession(dogId, {
        date: new Date().toISOString().split('T')[0],
        duration: durationMin,
        commands: [i18next.t('walkCommand')],
        progress: 'good',
        notes,
        walk_path: pathRef.current.length > 1 ? pathRef.current : undefined,
        distance_meters: d > 0 ? d : undefined,
        calories_burned: cal > 0 ? cal : undefined,
        max_speed_kmh: maxSpd > 0 ? parseFloat(maxSpd.toFixed(1)) : undefined,
      });
      setSaved(true);
      onSaved?.();
    } catch { /* silent */ }
    finally { setSaving(false); }
  }, [saving]);

  return (
    <WalkContext.Provider value={{
      phase, elapsed, distanceM, caloriesBurned, maxSpeedKmh, pathPoints,
      gpsStatus, gpsError, saving, saved,
      handleStart, handlePause, handleResume, handleStop, handleReset, handleSave,
    }}>
      {children}
    </WalkContext.Provider>
  );
};
