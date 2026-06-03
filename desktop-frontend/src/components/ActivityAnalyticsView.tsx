import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Flame, MapPin, Zap, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../lib/api';
import { Dog } from '../types';
import { cn } from '../lib/utils';

interface Props {
  currentDog: Dog | null;
  onNavigate?: (view: string) => void;
}

interface Session {
  id: string;
  date: string;
  duration: number;
  distance_meters?: number;
  calories_burned?: number;
  progress?: string;
  commands?: string[];
}

function isWalk(s: Session) { return (parseFloat(s.distance_meters as any) || 0) > 0; }

function getMonday(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function buildWeeklyData(sessions: Session[]) {
  const weeks: { label: string; distance: number; count: number; start: Date }[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const monday = getMonday(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    const label = `${monday.getDate()}/${monday.getMonth() + 1}`;
    const weekSessions = sessions.filter(s => { const d = new Date(s.date); return d >= monday && d <= sunday && isWalk(s); });
    weeks.push({ label, distance: weekSessions.reduce((a, s) => a + (parseFloat(s.distance_meters as any) || 0), 0) / 1000, count: weekSessions.length, start: monday });
  }
  return weeks;
}

function calcStreak(sessions: Session[]): number {
  const walkDates = new Set(sessions.filter(isWalk).map(s => s.date.slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    if (walkDates.has(d.toISOString().slice(0, 10))) streak++;
    else break;
  }
  return streak;
}

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={cn('bg-white dark:bg-[#1e2023] rounded-xl border p-4', accent ? 'border-[#005da7]/30 dark:border-[#a4c9ff]/20' : 'border-gray-100 dark:border-white/5')}>
      <div className="flex items-start gap-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', accent ? 'bg-[#005da7]/10 dark:bg-[#a4c9ff]/10' : 'bg-gray-100 dark:bg-[#282a2d]')}>
          <Icon size={17} className={accent ? 'text-[#005da7] dark:text-[#a4c9ff]' : 'text-gray-500 dark:text-[#8b919d]'} />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">{value}</p>
          <p className="text-xs text-gray-500 dark:text-[#8b919d] mt-0.5">{label}</p>
          {sub && <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 dark:text-[#e2e2e6] mb-1">{label}</p>
      <p className="text-[#005da7] dark:text-[#a4c9ff]">{payload[0]?.value?.toFixed(2)} km</p>
    </div>
  );
};

const PROGRESS_COLORS: Record<string, string> = {
  excellent: 'bg-green-500', good: 'bg-blue-500', fair: 'bg-yellow-500', 'needs-work': 'bg-red-400',
};

export const ActivityAnalyticsView: React.FC<Props> = ({ currentDog, onNavigate }) => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'month' | 'all'>('month');

  const load = useCallback(async () => {
    if (!currentDog) return;
    setLoading(true);
    try {
      const res = await apiClient.getTrainingSessions(currentDog.id);
      setSessions(res.trainingSessions);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [currentDog]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (period === 'all') return sessions;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    return sessions.filter(s => new Date(s.date) >= cutoff);
  }, [sessions, period]);

  const walks = filtered.filter(isWalk);
  const trainings = filtered.filter(s => !isWalk(s));
  // DB returns DECIMAL/INTEGER columns as strings — parse before arithmetic
  const totalDistKm = walks.reduce((a, s) => a + (parseFloat(s.distance_meters) || 0), 0) / 1000;
  const totalCal = walks.reduce((a, s) => a + (parseFloat(s.calories_burned) || 0), 0);
  const totalDuration = filtered.reduce((a, s) => a + (parseInt(s.duration) || 0), 0);
  const streak = calcStreak(sessions);
  const weeklyData = buildWeeklyData(sessions);
  const bestWeek = [...weeklyData].sort((a, b) => b.distance - a.distance)[0];
  const progressCounts = trainings.reduce<Record<string, number>>((acc, s) => {
    if (s.progress) acc[s.progress] = (acc[s.progress] ?? 0) + 1;
    return acc;
  }, {});

  const PROGRESS_LABELS: Record<string, string> = {
    excellent:    t('excellent'),
    good:         t('good'),
    fair:         t('fair'),
    'needs-work': t('needsWork'),
  };

  if (!currentDog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-400 dark:text-[#8b919d]">
        <Activity size={48} className="opacity-40" />
        <p className="text-sm">{t('noDogs')} <button onClick={() => onNavigate?.('settings')} className="text-[#005da7] dark:text-[#a4c9ff] underline">{t('addDog')}</button></p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">{t('activityAnalytics')}</h1>
          <p className="text-sm text-gray-400 dark:text-[#8b919d]">{currentDog.name} — {t('activitySubtitle')}</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-[#282a2d] rounded-xl p-1">
          {(['month', 'all'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition',
                period === p ? 'bg-white dark:bg-[#1e2023] text-gray-900 dark:text-[#e2e2e6] shadow-sm' : 'text-gray-500 dark:text-[#8b919d]')}>
              {p === 'month' ? t('thirtyDays') : t('allTime')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005da7]" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 dark:text-[#8b919d]">
          <Activity size={48} className="opacity-40" />
          <p className="text-sm">{t('noActivityYet')}</p>
          <button onClick={() => onNavigate?.('training')} className="text-[#005da7] dark:text-[#a4c9ff] text-sm underline">
            {t('goToTraining')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={MapPin} label={t('distanceWalked')} value={`${totalDistKm.toFixed(1)} km`}
              sub={`${walks.length} ${t('walksLabel').toLowerCase()}`} accent />
            <StatCard icon={Flame} label={t('caloriesBurned')} value={totalCal > 0 ? `${Math.round(totalCal)} kcal` : '—'}
              sub={t('fromWalks')} />
            <StatCard icon={Activity} label={t('activeTime')}
              value={`${Math.floor(totalDuration / 60)}ч ${totalDuration % 60}мин`}
              sub={`${filtered.length} сесии`} />
            <StatCard icon={Zap} label={t('currentStreak')}
              value={streak > 0 ? `${streak} дни` : '—'}
              sub={t('consecutiveWalkDays')} accent={streak >= 3} />
          </div>

          {bestWeek && bestWeek.distance > 0 && (
            <div className="bg-[#005da7]/5 dark:bg-[#a4c9ff]/5 border border-[#005da7]/20 dark:border-[#a4c9ff]/15 rounded-xl px-4 py-3 flex items-center gap-3">
              <Award size={18} className="text-[#005da7] dark:text-[#a4c9ff] flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-[#c1c7d3]">
                {t('bestWeek')}: <span className="font-semibold text-[#005da7] dark:text-[#a4c9ff]">{bestWeek.distance.toFixed(1)} km</span>
                {' '}{t('walksLabel').toLowerCase()} {bestWeek.count} ({bestWeek.label})
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#005da7] dark:text-[#a4c9ff]" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6]">{t('weeklyWalkDistance')}</h2>
              <span className="text-xs text-gray-400 dark:text-[#8b919d] ml-auto">{t('last8Weeks')}</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8b919d' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8b919d' }} axisLine={false} tickLine={false} unit=" km" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,93,167,0.06)' }} />
                <Bar dataKey="distance" fill="#005da7" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {trainings.length > 0 && (
            <div className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] mb-3">{t('trainingProgressLabel')}</h2>
              <div className="space-y-2">
                {Object.entries(progressCounts).map(([prog, count]) => {
                  const total = trainings.length;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={prog} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-[#8b919d] w-24">{PROGRESS_LABELS[prog] ?? prog}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-[#282a2d] rounded-full h-2 overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', PROGRESS_COLORS[prog] ?? 'bg-gray-400')} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 dark:text-[#8b919d] w-10 text-right">{count}×</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 p-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] mb-3">{t('activitySplit')}</h2>
            <div className="flex gap-4">
              {[
                { label: t('walksLabel'), count: walks.length, color: 'bg-[#005da7]' },
                { label: t('trainingLabel'), count: trainings.length, color: 'bg-orange-400' },
              ].map(item => {
                const total = filtered.length;
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.label} className="flex-1">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-[#e2e2e6]">{item.count}</span>
                      <span className="text-xs text-gray-400 dark:text-[#8b919d]">{item.label}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-[#282a2d] rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', item.color)} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-1">{pct}{t('ofSessions')}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
