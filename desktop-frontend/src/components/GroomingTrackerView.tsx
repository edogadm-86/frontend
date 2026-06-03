import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, Plus, Edit2, Trash2, Calendar, DollarSign, Star, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { apiClient } from '../lib/api';
import { Dog, GroomingSession, GroomingService } from '../types';
import { cn } from '../lib/utils';

interface Props {
  currentDog: Dog | null;
  onNavigate?: (view: string) => void;
}

const SERVICE_IDS: GroomingService[] = ['bath', 'haircut', 'nail_trim', 'ear_cleaning', 'teeth_brushing', 'deshedding', 'other'];
const SERVICE_ICONS: Record<GroomingService, string> = {
  bath: 'water_drop', haircut: 'content_cut', nail_trim: 'colorize',
  ear_cleaning: 'hearing', teeth_brushing: 'dentistry', deshedding: 'air', other: 'more_horiz',
};

const COAT_CONDITION_COLORS: Record<number, string> = {
  1: 'text-red-500', 2: 'text-orange-500', 3: 'text-yellow-500', 4: 'text-blue-500', 5: 'text-green-500',
};

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  groomer_name: '',
  groomer_contact: '',
  services: [] as GroomingService[],
  cost: '',
  coat_condition: 0,
  notes: '',
  next_grooming_date: '',
};
type FormState = typeof EMPTY_FORM;

function ServiceChip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        selected
          ? 'bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] border-[#005da7] dark:border-[#a4c9ff]'
          : 'bg-white dark:bg-[#1e2023] text-gray-600 dark:text-[#c1c7d3] border-gray-200 dark:border-white/10 hover:border-[#005da7] dark:hover:border-[#a4c9ff]'
      )}
    >
      {label}
    </button>
  );
}

function CoatStars({ value, onChange, labels }: { value: number; onChange: (v: number) => void; labels: Record<number, string> }) {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n === value ? 0 : n)} className="p-0.5 transition-transform hover:scale-110">
          <Star size={20} className={n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
        </button>
      ))}
      {value > 0 && (
        <span className={cn('text-sm font-medium ml-1', COAT_CONDITION_COLORS[value])}>
          {labels[value]}
        </span>
      )}
    </div>
  );
}

function GroomingModal({ session, onSave, onClose, serviceLabels, coatLabels }: {
  session: GroomingSession | null;
  onSave: (form: FormState) => Promise<void>;
  onClose: () => void;
  serviceLabels: Record<GroomingService, string>;
  coatLabels: Record<number, string>;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(
    session ? {
      date: session.date?.slice(0, 10) ?? '',
      groomer_name: session.groomer_name ?? '',
      groomer_contact: session.groomer_contact ?? '',
      services: session.services ?? [],
      cost: session.cost != null ? String(session.cost) : '',
      coat_condition: session.coat_condition ?? 0,
      notes: session.notes ?? '',
      next_grooming_date: session.next_grooming_date?.slice(0, 10) ?? '',
    } : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const toggleService = (svc: GroomingService) =>
    setForm(f => ({ ...f, services: f.services.includes(svc) ? f.services.filter(s => s !== svc) : [...f.services, svc] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) { setError(t('error')); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err: any) { setError(err.message ?? t('error')); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1e2023] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold text-gray-900 dark:text-[#e2e2e6]">
            {session ? t('editGroomingSession') : t('addGroomingSession')}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#282a2d] text-gray-400">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('date')} *</label>
              <input type="date" value={form.date} onChange={set('date')} required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#005da7]/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('nextGroomingDate')}</label>
              <input type="date" value={form.next_grooming_date} onChange={set('next_grooming_date')}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#005da7]/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('groomerName')}</label>
              <input type="text" value={form.groomer_name} onChange={set('groomer_name')} placeholder="e.g. Maria"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#005da7]/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('groomerContact')}</label>
              <input type="text" value={form.groomer_contact} onChange={set('groomer_contact')} placeholder={t('groomerContactPlaceholder')}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#005da7]/30" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-2">{t('groomingServices')}</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_IDS.map(id => (
                <ServiceChip key={id} label={serviceLabels[id]}
                  selected={form.services.includes(id)} onToggle={() => toggleService(id)} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('groomingCostBGN')}</label>
              <input type="number" min="0" step="0.01" value={form.cost} onChange={set('cost')} placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#005da7]/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('coatCondition')}</label>
              <CoatStars value={form.coat_condition} onChange={v => setForm(f => ({ ...f, coat_condition: v }))} labels={coatLabels} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">{t('groomingNotes')}</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder={t('groomingNotesPlaceholder')}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#005da7]/30" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#c1c7d3] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#282a2d] transition">
              {t('cancel')}
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition">
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const GroomingTrackerView: React.FC<Props> = ({ currentDog, onNavigate }) => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<GroomingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GroomingSession | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const serviceLabels: Record<GroomingService, string> = {
    bath: t('groomingService_bath'),
    haircut: t('groomingService_haircut'),
    nail_trim: t('groomingService_nail_trim'),
    ear_cleaning: t('groomingService_ear_cleaning'),
    teeth_brushing: t('groomingService_teeth_brushing'),
    deshedding: t('groomingService_deshedding'),
    other: t('other'),
  };

  const coatLabels: Record<number, string> = {
    1: t('coat_poor'),
    2: t('coat_fair'),
    3: t('coat_good'),
    4: t('coat_veryGood'),
    5: t('coat_excellent'),
  };

  const load = useCallback(async () => {
    if (!currentDog) return;
    setLoading(true);
    try {
      const res = await apiClient.getGroomingSessions(currentDog.id);
      setSessions(res.groomingSessions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentDog]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form: FormState) => {
    const payload = {
      date: form.date,
      groomer_name: form.groomer_name || undefined,
      groomer_contact: form.groomer_contact || undefined,
      services: form.services,
      cost: form.cost ? parseFloat(form.cost) : undefined,
      coat_condition: form.coat_condition > 0 ? form.coat_condition : undefined,
      notes: form.notes || undefined,
      next_grooming_date: form.next_grooming_date || undefined,
    };
    if (editing) {
      await apiClient.updateGroomingSession(currentDog!.id, editing.id, payload);
    } else {
      await apiClient.createGroomingSession(currentDog!.id, payload);
    }
    await load();
  };

  const handleDelete = async (session: GroomingSession) => {
    if (!window.confirm(t('deleteGroomingConfirm'))) return;
    await apiClient.deleteGroomingSession(currentDog!.id, session.id);
    await load();
  };

  if (!currentDog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-400 dark:text-[#8b919d]">
        <span className="material-symbols-outlined text-[56px]">content_cut</span>
        <p className="text-sm">{t('noDogs')} <button onClick={() => onNavigate?.('settings')} className="text-[#005da7] dark:text-[#a4c9ff] underline">{t('addDog')}</button></p>
      </div>
    );
  }

  const lastSession = sessions[0];
  const totalCost = sessions.reduce((s, g) => s + (g.cost ? Number(g.cost) : 0), 0);
  const nextDue = sessions.find(s => s.next_grooming_date)?.next_grooming_date;
  const daysUntilNext = nextDue ? Math.ceil((new Date(nextDue).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">{t('grooming')}</h1>
          <p className="text-sm text-gray-400 dark:text-[#8b919d]">{currentDog.name} — {t('groomingHistory')}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-semibold hover:opacity-90 transition active:scale-95"
        >
          <Plus size={16} />
          {t('logGroomingSession')}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 p-3 text-center">
          <p className="text-2xl font-bold text-[#005da7] dark:text-[#a4c9ff]">{sessions.length}</p>
          <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">{t('totalSessions')}</p>
        </div>
        <div className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 p-3 text-center">
          <p className="text-2xl font-bold text-[#005da7] dark:text-[#a4c9ff]">
            {lastSession ? new Date(lastSession.date).toLocaleDateString('bg-BG', { day: '2-digit', month: 'short' }) : '—'}
          </p>
          <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">{t('lastVisit')}</p>
        </div>
        <div className={cn(
          'bg-white dark:bg-[#1e2023] rounded-xl border p-3 text-center',
          daysUntilNext !== null && daysUntilNext <= 7 ? 'border-orange-300 dark:border-orange-500/30' : 'border-gray-100 dark:border-white/5'
        )}>
          <p className={cn('text-2xl font-bold', daysUntilNext !== null && daysUntilNext <= 7 ? 'text-orange-500' : 'text-[#005da7] dark:text-[#a4c9ff]')}>
            {daysUntilNext !== null ? (daysUntilNext <= 0 ? t('today') : `${daysUntilNext}д`) : '—'}
          </p>
          <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">{t('nextDue')}</p>
        </div>
      </div>

      {totalCost > 0 && (
        <div className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
          <DollarSign size={16} className="text-[#005da7] dark:text-[#a4c9ff]" />
          <span className="text-sm text-gray-600 dark:text-[#c1c7d3]">{t('totalGroomingSpend')}:</span>
          <span className="ml-auto font-semibold text-gray-900 dark:text-[#e2e2e6]">{totalCost.toFixed(2)} лв.</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005da7]" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 dark:text-[#8b919d]">
          <Scissors size={40} className="opacity-40" />
          <p className="text-sm">{t('noGroomingSessions')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const isExpanded = expandedId === session.id;
            return (
              <div key={session.id} className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282a2d] transition"
                  onClick={() => setExpandedId(isExpanded ? null : session.id)}
                >
                  <div className="w-9 h-9 rounded-full bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 flex items-center justify-center flex-shrink-0">
                    <Scissors size={16} className="text-[#005da7] dark:text-[#a4c9ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-[#e2e2e6]">
                        {new Date(session.date).toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      {session.coat_condition && session.coat_condition > 0 && (
                        <span className={cn('text-xs font-medium', COAT_CONDITION_COLORS[session.coat_condition])}>
                          {'★'.repeat(session.coat_condition)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {session.groomer_name && <span className="text-xs text-gray-400 dark:text-[#8b919d]">{session.groomer_name}</span>}
                      {session.services?.slice(0, 3).map(svc => (
                        <span key={svc} className="text-xs bg-gray-100 dark:bg-[#282a2d] text-gray-500 dark:text-[#8b919d] px-2 py-0.5 rounded-full">
                          {serviceLabels[svc] ?? svc}
                        </span>
                      ))}
                      {session.services?.length > 3 && (
                        <span className="text-xs text-gray-400 dark:text-[#8b919d]">+{session.services.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {session.cost != null && (
                      <span className="text-sm font-semibold text-gray-700 dark:text-[#c1c7d3]">{Number(session.cost).toFixed(2)} лв.</span>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-white/5 px-4 py-3 space-y-2 bg-gray-50 dark:bg-[#282a2d]/50">
                    {session.groomer_contact && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#c1c7d3]">
                        <Phone size={13} className="text-gray-400 flex-shrink-0" />
                        {session.groomer_contact}
                      </div>
                    )}
                    {session.next_grooming_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#c1c7d3]">
                        <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                        {t('nextDue')}: {new Date(session.next_grooming_date).toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                    {session.notes && <p className="text-sm text-gray-600 dark:text-[#c1c7d3] leading-relaxed">{session.notes}</p>}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { setEditing(session); setModalOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#005da7] dark:text-[#a4c9ff] hover:bg-[#005da7]/10 dark:hover:bg-[#a4c9ff]/10 transition">
                        <Edit2 size={13} /> {t('edit')}
                      </button>
                      <button onClick={() => handleDelete(session)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        <Trash2 size={13} /> {t('delete')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <GroomingModal
          session={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          serviceLabels={serviceLabels}
          coatLabels={coatLabels}
        />
      )}
    </div>
  );
};
