import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { apiClient } from '../lib/api';
import { Modal } from './ui/Modal';
import type { WeightEntry, Dog } from '../types';

interface WeightHistoryProps {
  currentDog: Dog;
}

// ── SVG sparkline ─────────────────────────────────────────────────────────────

const WeightChart: React.FC<{ entries: WeightEntry[] }> = ({ entries }) => {
  if (entries.length < 2) return null;

  const W = 600;
  const H = 160;
  const PAD = { top: 16, right: 20, bottom: 32, left: 44 };

  const weights = entries.map(e => Number(e.weight));
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const xStep = (W - PAD.left - PAD.right) / (entries.length - 1);
  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (w: number) => PAD.top + (1 - (w - minW) / range) * (H - PAD.top - PAD.bottom);

  const points = entries.map((e, i) => `${toX(i)},${toY(Number(e.weight))}`).join(' ');
  const areaPoints = `${toX(0)},${H - PAD.bottom} ${points} ${toX(entries.length - 1)},${H - PAD.bottom}`;

  // Y-axis labels
  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minW + (range * i) / yTicks;
    const y = toY(val);
    return { val: val.toFixed(1), y };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" aria-hidden>
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yLabels.map(({ y }, i) => (
        <line key={i} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
          stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
      ))}
      {/* Y-axis labels */}
      {yLabels.map(({ val, y }, i) => (
        <text key={i} x={PAD.left - 6} y={y} textAnchor="end" dominantBaseline="middle"
          className="fill-gray-400 dark:fill-[#8b919d]" fontSize="10">{val}</text>
      ))}
      {/* X-axis date labels (first, middle, last) */}
      {[0, Math.floor((entries.length - 1) / 2), entries.length - 1].filter((v, i, a) => a.indexOf(v) === i).map(i => (
        <text key={i} x={toX(i)} y={H - PAD.bottom + 14} textAnchor="middle"
          className="fill-gray-400 dark:fill-[#8b919d]" fontSize="10">
          {new Date(entries[i].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </text>
      ))}
      {/* Area fill */}
      <polygon points={areaPoints} fill="url(#wgrad)" />
      {/* Line */}
      <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {entries.map((e, i) => (
        <circle key={e.id} cx={toX(i)} cy={toY(Number(e.weight))} r="3.5"
          fill="#3b82f6" stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const WeightHistory: React.FC<WeightHistoryProps> = ({ currentDog }) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getWeightHistory(currentDog.id);
      setEntries(data.entries);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [currentDog.id]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    const w = parseFloat(newWeight);
    if (!w || w <= 0 || !newDate || submitting) return;
    setSubmitting(true);
    try {
      const data = await apiClient.addWeightEntry(currentDog.id, {
        weight: w, date: newDate, notes: newNotes.trim() || undefined,
      });
      setEntries(prev => [...prev, data.entry].sort((a, b) => a.date.localeCompare(b.date)));
      setNewWeight(''); setNewDate(new Date().toISOString().slice(0, 10)); setNewNotes('');
      setIsModalOpen(false);
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await apiClient.deleteWeightEntry(currentDog.id, entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch { /* silent */ }
  };

  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];
  const diff = latest && prev ? Number(latest.weight) - Number(prev.weight) : null;

  const inputCls = 'w-full text-sm bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-[#414751]/40 rounded-xl px-3 py-2.5 text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#a4c9ff]';
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide';

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          {latest && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-[#e2e2e6]">
                {Number(latest.weight).toFixed(1)} kg
              </span>
              {diff !== null && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  diff > 0 ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400'
                  : diff < 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'text-gray-500 bg-gray-100 dark:bg-[#282a2d] dark:text-[#8b919d]'
                }`}>
                  {diff > 0 ? <TrendingUp size={11} /> : diff < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                </span>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">
            {entries.length > 0
              ? t('weightEntryCount', { count: entries.length })
              : t('noWeightEntries')}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-xs font-bold hover:bg-blue-600 dark:hover:bg-[#d4e3ff] transition-colors"
        >
          <Plus size={14} /> {t('addWeight')}
        </button>
      </div>

      {/* Chart */}
      {entries.length >= 2 && (
        <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-4">
          <WeightChart entries={entries} />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-4 animate-pulse h-24" />
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-10 text-center">
          <TrendingUp size={32} className="mx-auto mb-3 text-gray-300 dark:text-[#414751]" />
          <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-4">{t('noWeightEntries')}</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-bold hover:bg-blue-600 dark:hover:bg-[#d4e3ff] transition-colors"
          >
            {t('addFirstWeight')}
          </button>
        </div>
      )}

      {/* Entry list */}
      {entries.length > 0 && (
        <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl divide-y divide-gray-100 dark:divide-white/5">
          {[...entries].reverse().map((entry, idx) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${idx === 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-[#414751]'}`} />
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6]">
                    {Number(entry.weight).toFixed(1)} kg
                  </span>
                  {entry.notes && (
                    <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">{entry.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 dark:text-[#8b919d]">
                  {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-1.5 rounded-lg text-gray-300 dark:text-[#414751] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add weight modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addWeight')}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>{t('weight')} (kg)</label>
            <input
              type="number" step="0.1" min="0.1"
              className={inputCls}
              placeholder={t('weightExPlaceholder')}
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t('date')}</label>
            <input type="date" className={inputCls} value={newDate} onChange={e => setNewDate(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t('notes')} <span className="normal-case font-normal text-gray-400">({t('optional')})</span></label>
            <input className={inputCls} placeholder={t('weightNotesPlaceholder')} value={newNotes} onChange={e => setNewNotes(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-[#8b919d] border border-gray-200 dark:border-[#414751]/40 rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors">
              {t('cancel')}
            </button>
            <button
              onClick={handleAdd}
              disabled={!newWeight || parseFloat(newWeight) <= 0 || !newDate || submitting}
              className="flex-1 py-2 text-sm font-bold bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl hover:bg-blue-600 dark:hover:bg-[#d4e3ff] disabled:opacity-40 transition-colors"
            >
              {submitting ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
