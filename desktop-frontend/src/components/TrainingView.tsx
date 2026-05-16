import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Clock, Calendar } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Dog } from '../types';
import { apiClient } from '../lib/api';
import { formatDate } from '../lib/utils';

interface TrainingSession {
  id: string;
  date: string;
  duration: number;
  commands: string[];
  progress: 'excellent' | 'good' | 'fair' | 'needs-work';
  notes: string;
  behavior_notes?: string;
}

interface TrainingViewProps {
  currentDog: Dog | null;
  dogs: Dog[];
  onNavigate: (view: string) => void;
}

const VIDEOS = [
  { title: 'Loose Leash Walking', description: 'learnFundamentals', videoId: 'jFMA5ggFsXU', duration: '5:56', level: 'beginner' },
  { title: 'House Training Puppy', description: 'completeGuideToHouseTraining', videoId: 'Pptoq7avEKM', duration: '4:50', level: 'beginner' },
  { title: 'Advanced Tricks', description: 'teachAmazingTricks', videoId: 'K1co_bZfs6w', duration: '8:36', level: 'advanced' },
  { title: 'Leash Training', description: 'stopPullingWalkNicely', videoId: 'tSvfVs4LKyg', duration: '9:14', level: 'intermediate' },
  { title: 'Socialization', description: 'helpDogInteractWithOthers', videoId: 'ysxjfhmj4c0', duration: '6:18', level: 'beginner' },
  { title: 'Agility Basics', description: 'introductionToDogAgility', videoId: 'vkxggodZzqc', duration: '4:04', level: 'advanced' },
];

const levelStyle: Record<string, string> = {
  beginner:     'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  intermediate: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  advanced:     'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
};

const progressCfg: Record<string, { bg: string; text: string; label: string }> = {
  'excellent':  { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'excellent' },
  'good':       { bg: 'bg-[#005da7]/10 dark:bg-[#a4c9ff]/10',  text: 'text-[#005da7] dark:text-[#a4c9ff]',   label: 'good' },
  'fair':       { bg: 'bg-amber-100 dark:bg-amber-900/20',      text: 'text-amber-700 dark:text-amber-400',   label: 'fair' },
  'needs-work': { bg: 'bg-red-100 dark:bg-red-900/20',          text: 'text-red-600 dark:text-red-400',       label: 'needsWork' },
};

function calculateStreak(sessions: TrainingSession[]) {
  const uniqueDates = [...new Set(sessions.map(s => new Date(s.date).toDateString()))];
  uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) return 0;

  let streak = 0;
  let check = new Date(uniqueDates.includes(today) ? today : yesterday);
  for (let i = 0; i < 365; i++) {
    if (uniqueDates.includes(check.toDateString())) {
      streak++;
      check = new Date(check.getTime() - 86400000);
    } else break;
  }
  return streak;
}

function getWeeklyBars(sessions: TrainingSession[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const daySessions = sessions.filter(
      s => new Date(s.date).toDateString() === d.toDateString()
    );
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      duration: daySessions.reduce((sum, s) => sum + s.duration, 0),
      isToday: i === 6,
    };
  });
}

function getTopCommands(sessions: TrainingSession[]) {
  const counts: Record<string, number> = {};
  sessions.forEach(s => s.commands.forEach(c => { counts[c] = (counts[c] || 0) + 1; }));
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
}

export const TrainingView: React.FC<TrainingViewProps> = ({ currentDog, onNavigate }) => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '', duration: 30, commands: '',
    progress: 'good' as TrainingSession['progress'],
    notes: '', behavior_notes: '',
  });

  useEffect(() => {
    if (currentDog?.id) load();
  }, [currentDog?.id]);

  const load = async () => {
    if (!currentDog?.id) return;
    try {
      const res = await apiClient.getTrainingSessions(currentDog.id);
      setSessions(res.trainingSessions);
    } catch { /* silent */ }
  };

  const openAdd = () => {
    setEditingSession(null);
    setFormData({ date: new Date().toISOString().split('T')[0], duration: 30, commands: '', progress: 'good', notes: '', behavior_notes: '' });
    setIsModalOpen(true);
  };

  const openEdit = (s: TrainingSession) => {
    setEditingSession(s);
    setFormData({ date: new Date(s.date).toISOString().split('T')[0], duration: s.duration, commands: s.commands.join(', '), progress: s.progress, notes: s.notes, behavior_notes: s.behavior_notes || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDog?.id) return;
    setLoading(true);
    const data = { ...formData, commands: formData.commands.split(',').map(c => c.trim()).filter(Boolean) };
    try {
      if (editingSession) await apiClient.updateTrainingSession(currentDog.id, editingSession.id, data);
      else await apiClient.createTrainingSession(currentDog.id, data);
      await load();
      setIsModalOpen(false);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!currentDog?.id || !window.confirm(t('areSureDeleteRecord'))) return;
    try { await apiClient.deleteTrainingSession(currentDog.id, id); await load(); } catch { /* silent */ }
  };

  if (!currentDog) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-[#282a2d] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-gray-400 dark:text-[#414751] text-[32px]">fitness_center</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6] mb-2">{t('noDogsFound')}</h2>
          <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-6">{t('addFirstDog')}</p>
          <button onClick={() => onNavigate('settings')} className="px-5 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
            {t('addDog')}
          </button>
        </div>
      </div>
    );
  }

  // Derived data
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((s, x) => s + x.duration, 0);
  const successRate = totalSessions > 0
    ? Math.round(sessions.filter(s => s.progress === 'excellent' || s.progress === 'good').length / totalSessions * 100)
    : 0;
  const streak = calculateStreak(sessions);
  const weekBars = getWeeklyBars(sessions);
  const maxBarDuration = Math.max(...weekBars.map(b => b.duration), 1);
  const topCommands = getTopCommands(sessions);
  const maxCmdCount = topCommands.length > 0 ? topCommands[0][1] : 1;

  const cardCls = 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl';
  const fieldCls = 'w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c1f] text-gray-900 dark:text-[#e2e2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] focus:border-transparent text-sm placeholder-gray-400 dark:placeholder-[#414751]';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-[#c1c7d3] mb-1';

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8 space-y-5 font-jakarta">

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: 'fitness_center', value: totalSessions, label: t('totalSessions'), color: 'text-[#005da7] dark:text-[#a4c9ff]', bg: 'bg-[#005da7]/10 dark:bg-[#a4c9ff]/10' },
          { icon: 'timer',          value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, label: t('totalTime'), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/20' },
          { icon: 'trending_up',    value: `${successRate}%`, label: t('successRate'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
        ].map(stat => (
          <div key={stat.label} className={`${cardCls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
              <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6] leading-tight">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-[#8b919d] truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Left column */}
        <div className="xl:col-span-7 space-y-5">

          {/* Weekly activity chart */}
          <div className={`${cardCls} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-[#005da7] dark:text-[#a4c9ff] uppercase tracking-widest mb-0.5">{t('weeklyActivity', 'Weekly Activity')}</p>
                <h3 className="text-base font-bold text-gray-900 dark:text-[#e2e2e6]">
                  {totalMinutes > 0 ? `${totalMinutes} ${t('minutes')}` : t('noTrainingSessionsRecorded')}
                </h3>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 text-orange-500">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <span className="text-sm font-bold">{streak}d</span>
                </div>
              )}
            </div>
            <div className="flex items-end gap-2 h-24">
              {weekBars.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end" style={{ height: '72px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        bar.isToday
                          ? 'bg-[#005da7] dark:bg-[#a4c9ff]'
                          : bar.duration > 0
                          ? 'bg-[#005da7]/40 dark:bg-[#a4c9ff]/30'
                          : 'bg-gray-100 dark:bg-[#282a2d]'
                      }`}
                      style={{ height: `${bar.duration > 0 ? Math.max((bar.duration / maxBarDuration) * 100, 8) : 6}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-[#8b919d] uppercase">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sessions list */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">{t('trainingSessions')}</h3>
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-lg font-semibold text-xs hover:opacity-90 transition-all"
              >
                <Plus size={13} />
                {t('addTrainingSession')}
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-gray-300 dark:text-[#414751] text-[40px] block mb-2">fitness_center</span>
                <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('noTrainingSessionsRecorded')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {[...sessions]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(session => {
                    const cfg = progressCfg[session.progress] || progressCfg.good;
                    return (
                      <div key={session.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#282a2d]/40 transition-colors">
                        <div className="w-10 h-10 bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-[#005da7] dark:text-[#a4c9ff]">fitness_center</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6]">{t('trainingSession')}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                              {t(cfg.label)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-[#8b919d] mb-2">
                            <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(session.date)}</span>
                            <span className="flex items-center gap-1"><Clock size={11} />{session.duration} {t('minutes')}</span>
                          </div>
                          {session.commands.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1.5">
                              {session.commands.map((cmd, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#c1c7d3] text-[10px] font-semibold rounded-md">
                                  {cmd}
                                </span>
                              ))}
                            </div>
                          )}
                          {session.notes && (
                            <p className="text-xs text-gray-500 dark:text-[#8b919d] line-clamp-2">{session.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEdit(session)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#005da7] dark:hover:text-[#a4c9ff] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(session.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="xl:col-span-5 space-y-5">

          {/* Streak card */}
          <div className="bg-[#005da7] dark:bg-[#a4c9ff]/15 dark:border dark:border-[#a4c9ff]/20 rounded-xl p-5 text-white dark:text-[#a4c9ff]">
            <div className="flex items-center justify-between mb-3">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="text-4xl font-extrabold">{streak}</span>
            </div>
            <h3 className="text-base font-bold leading-tight">{t('trainingStreak', 'Training Streak')}</h3>
            <p className="text-sm opacity-75 mt-1">
              {streak > 0
                ? t('keepItUp', "Keep it up! Don't break the chain.")
                : t('startYourStreak', 'Log a session today to start your streak!')}
            </p>
          </div>

          {/* Top commands */}
          {topCommands.length > 0 && (
            <div className={`${cardCls} p-5`}>
              <p className="text-[10px] font-bold text-gray-400 dark:text-[#8b919d] uppercase tracking-widest mb-4">{t('topSkills', 'Top Commands')}</p>
              <div className="space-y-3">
                {topCommands.map(([cmd, count]) => (
                  <div key={cmd}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-800 dark:text-[#e2e2e6] capitalize">{cmd}</span>
                      <span className="text-[#005da7] dark:text-[#a4c9ff] font-bold">
                        {Math.round((count / maxCmdCount) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-[#282a2d] rounded-full">
                      <div
                        className="h-full bg-[#005da7] dark:bg-[#a4c9ff] rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxCmdCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video tutorials */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">{t('trainingResources')}</h3>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {VIDEOS.slice(0, 4).map((video, i) => (
                <div
                  key={i}
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-[#282a2d]/40 cursor-pointer transition-colors group"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-20 h-14 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-2xl drop-shadow" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded leading-tight">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] truncate group-hover:text-[#005da7] dark:group-hover:text-[#a4c9ff] transition-colors">
                      {video.title}
                    </p>
                    <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${levelStyle[video.level]}`}>
                      {t(video.level)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit session modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSession ? t('editTrainingSession') : t('addTrainingSession')}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('date')} type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
            <Input label={`${t('duration')} (${t('minutes')})`} type="number" value={formData.duration.toString()} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })} min="1" required />
          </div>
          <Input label={t('commandsPracticed')} value={formData.commands} onChange={e => setFormData({ ...formData, commands: e.target.value })} placeholder={t('commands')} />
          <div>
            <label className={labelCls}>{t('progress')}</label>
            <select value={formData.progress} onChange={e => setFormData({ ...formData, progress: e.target.value as TrainingSession['progress'] })} className={fieldCls} required>
              <option value="excellent">{t('excellent')}</option>
              <option value="good">{t('good')}</option>
              <option value="fair">{t('fair')}</option>
              <option value="needs-work">{t('needsWork')}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('sessionNotes')}</label>
            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className={fieldCls} rows={3} style={{ resize: 'none' }} required />
          </div>
          <div>
            <label className={labelCls}>{t('behaviorNotes')}</label>
            <textarea value={formData.behavior_notes} onChange={e => setFormData({ ...formData, behavior_notes: e.target.value })} className={fieldCls} rows={2} style={{ resize: 'none' }} />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all">
              {t('cancel')}
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
