import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Bell, BellOff, Check, AlertTriangle } from 'lucide-react';
import { apiClient } from '../lib/api';
import { Modal } from './ui/Modal';
import type { MedicationReminder, Dog } from '../types';

interface MedicationRemindersProps {
  currentDog: Dog;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

function urgencyClass(days: number): string {
  if (days < 0) return 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30';
  if (days <= 1) return 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30';
  return 'bg-white border-gray-100 dark:bg-[#1e2023] dark:border-white/5';
}

function badgeClass(days: number): string {
  if (days < 0) return 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400';
  if (days <= 1) return 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400';
  if (days <= 7) return 'bg-blue-100 text-blue-600 dark:bg-[#a4c9ff]/15 dark:text-[#a4c9ff]';
  return 'bg-gray-100 text-gray-500 dark:bg-[#282a2d] dark:text-[#8b919d]';
}

const FREQ_OPTIONS = [7, 14, 30, 90, 180, 365];

export const MedicationReminders: React.FC<MedicationRemindersProps> = ({ currentDog }) => {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [freqDays, setFreqDays] = useState(30);
  const [nextDue, setNextDue] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getMedicationReminders(currentDog.id);
      setReminders(data.reminders);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [currentDog.id]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!name.trim() || !nextDue || submitting) return;
    setSubmitting(true);
    try {
      const data = await apiClient.createMedicationReminder(currentDog.id, {
        name: name.trim(), frequency_days: freqDays, next_due_date: nextDue,
        notes: notes.trim() || undefined,
      });
      setReminders(prev => [...prev, data.reminder].sort((a, b) => a.next_due_date.localeCompare(b.next_due_date)));
      setName(''); setFreqDays(30); setNextDue(new Date().toISOString().slice(0, 10)); setNotes('');
      setIsModalOpen(false);
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleMarkGiven = async (reminder: MedicationReminder) => {
    setMarkingId(reminder.id);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + reminder.frequency_days);
      const next = nextDate.toISOString().slice(0, 10);
      const data = await apiClient.updateMedicationReminder(currentDog.id, reminder.id, {
        last_given_date: today, next_due_date: next,
      });
      setReminders(prev => prev.map(r => r.id === reminder.id ? data.reminder : r)
        .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date)));
    } catch { /* silent */ }
    finally { setMarkingId(null); }
  };

  const handleToggleActive = async (reminder: MedicationReminder) => {
    try {
      const data = await apiClient.updateMedicationReminder(currentDog.id, reminder.id, {
        is_active: !reminder.is_active,
      });
      setReminders(prev => prev.map(r => r.id === reminder.id ? data.reminder : r));
    } catch { /* silent */ }
  };

  const handleDelete = async (reminderId: string) => {
    try {
      await apiClient.deleteMedicationReminder(currentDog.id, reminderId);
      setReminders(prev => prev.filter(r => r.id !== reminderId));
    } catch { /* silent */ }
  };

  const inputCls = 'w-full text-sm bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-[#414751]/40 rounded-xl px-3 py-2.5 text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#a4c9ff]';
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide';

  const active = reminders.filter(r => r.is_active);
  const inactive = reminders.filter(r => !r.is_active);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-[#8b919d]">
          {active.length > 0
            ? t('activeRemindersCount', { count: active.length })
            : t('noActiveReminders')}
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-xs font-bold hover:bg-blue-600 dark:hover:bg-[#d4e3ff] transition-colors"
        >
          <Plus size={14} /> {t('addReminder')}
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      )}

      {!loading && reminders.length === 0 && (
        <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-10 text-center">
          <Bell size={32} className="mx-auto mb-3 text-gray-300 dark:text-[#414751]" />
          <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-4">{t('noRemindersYet')}</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-bold hover:bg-blue-600 dark:hover:bg-[#d4e3ff] transition-colors"
          >
            {t('addFirstReminder')}
          </button>
        </div>
      )}

      {/* Active reminders */}
      {active.length > 0 && (
        <div className="space-y-3">
          {active.map(reminder => {
            const days = daysUntil(reminder.next_due_date);
            const isMarking = markingId === reminder.id;
            return (
              <div key={reminder.id} className={`rounded-xl border p-4 ${urgencyClass(days)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6]">{reminder.name}</span>
                      {days < 0 && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass(days)}`}>
                        {days < 0
                          ? t('overdueByDays', { days: Math.abs(days) })
                          : days === 0 ? t('dueToday')
                          : days === 1 ? t('dueTomorrow')
                          : t('dueInDays', { days })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#8b919d]">
                      {t('everyNDays', { days: reminder.frequency_days })}
                      {reminder.last_given_date && (
                        <> · {t('lastGiven')}: {new Date(reminder.last_given_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</>
                      )}
                    </p>
                    {reminder.notes && (
                      <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5 italic">{reminder.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleMarkGiven(reminder)}
                      disabled={isMarking}
                      title={t('markAsGiven')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                    >
                      <Check size={12} />
                      {isMarking ? '…' : t('given')}
                    </button>
                    <button
                      onClick={() => handleToggleActive(reminder)}
                      title={t('pauseReminder')}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                    >
                      <BellOff size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      title={t('deleteReminder')}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paused reminders */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wide mb-2">{t('pausedReminders')}</p>
          <div className="space-y-2">
            {inactive.map(reminder => (
              <div key={reminder.id} className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-3 flex items-center justify-between opacity-60">
                <div>
                  <span className="text-sm text-gray-600 dark:text-[#8b919d]">{reminder.name}</span>
                  <p className="text-xs text-gray-400">{t('everyNDays', { days: reminder.frequency_days })}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleToggleActive(reminder)} title={t('resumeReminder')}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                    <Bell size={14} />
                  </button>
                  <button onClick={() => handleDelete(reminder.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add reminder modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addReminder')}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>{t('medicationName')}</label>
            <input
              className={inputCls}
              placeholder={t('medicationNamePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t('frequency')}</label>
            <div className="flex flex-wrap gap-2">
              {FREQ_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setFreqDays(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    freqDays === d
                      ? 'bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                      : 'bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#8b919d] hover:bg-gray-200 dark:hover:bg-[#333]'
                  }`}
                >
                  {d === 7 ? t('weekly') : d === 14 ? t('biweekly') : d === 30 ? t('monthly') : d === 90 ? t('quarterly') : d === 180 ? t('every6months') : t('yearly')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('nextDueDate')}</label>
            <input type="date" className={inputCls} value={nextDue} onChange={e => setNextDue(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t('notes')} <span className="normal-case font-normal text-gray-400">({t('optional')})</span></label>
            <input className={inputCls} placeholder={t('reminderNotesPlaceholder')} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-[#8b919d] border border-gray-200 dark:border-[#414751]/40 rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors">
              {t('cancel')}
            </button>
            <button
              onClick={handleAdd}
              disabled={!name.trim() || !nextDue || submitting}
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
