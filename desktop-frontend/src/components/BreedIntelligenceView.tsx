import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Heart, Activity, Scissors, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Dog } from '../types';
import { findBreed, getWeightStatus, EXERCISE_LEVEL_COLORS, GROOMING_LEVEL_LABELS, BreedInfo } from '../data/breedData';
import { apiClient } from '../lib/api';
import { cn } from '../lib/utils';

interface Props {
  currentDog: Dog | null;
  onNavigate?: (view: string) => void;
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-[#005da7] dark:text-[#a4c9ff]" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Tag({ label, variant = 'default' }: { label: string; variant?: 'default' | 'warning' | 'success' }) {
  return (
    <span className={cn(
      'inline-block px-2.5 py-1 rounded-full text-xs font-medium',
      variant === 'warning' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      variant === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      variant === 'default' && 'bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#c1c7d3]',
    )}>
      {label}
    </span>
  );
}

function WeightGauge({ currentKg, minKg, maxKg, status, statusLabel }: {
  currentKg: number; minKg: number; maxKg: number; status: string; statusLabel: string;
}) {
  const rangeWidth = maxKg - minKg;
  const extMin = minKg - rangeWidth * 0.3;
  const extMax = maxKg + rangeWidth * 0.3;
  const totalRange = extMax - extMin;
  const minPct = ((minKg - extMin) / totalRange) * 100;
  const maxPct = ((maxKg - extMin) / totalRange) * 100;
  const currentPct = Math.min(100, Math.max(0, ((currentKg - extMin) / totalRange) * 100));
  const barColor = status === 'ideal' ? 'bg-green-500' : status === 'underweight' ? 'bg-blue-500' : 'bg-orange-500';
  const textColor = status === 'ideal' ? 'text-green-600 dark:text-green-400' : status === 'underweight' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400';

  return (
    <div className="space-y-1.5">
      <div className="relative h-3 bg-gray-100 dark:bg-[#282a2d] rounded-full overflow-hidden">
        <div className="absolute h-full bg-green-200 dark:bg-green-800/50 rounded-full" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
        <div className={cn('absolute w-3 h-3 rounded-full -translate-x-1/2 ring-2 ring-white dark:ring-[#1e2023]', barColor)} style={{ left: `${currentPct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 dark:text-[#8b919d]">
        <span>{minKg} kg</span>
        <span className={cn('font-medium', textColor)}>{currentKg} kg ({statusLabel})</span>
        <span>{maxKg} kg</span>
      </div>
    </div>
  );
}

function ExerciseComparison({ recommended, actualMinPerDay, t }: {
  recommended: number; actualMinPerDay: number; t: (k: string, opts?: any) => string;
}) {
  const pct = Math.min(100, Math.round((actualMinPerDay / recommended) * 100));
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500 dark:text-[#8b919d]">
        <span>{t('recommendedExercise', { min: recommended })}</span>
        <span>{t('exerciseGoalPct', { pct })}</span>
      </div>
      <div className="h-2.5 bg-gray-100 dark:bg-[#282a2d] rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 dark:text-[#8b919d]">{t('recentAvgExercise', { val: actualMinPerDay })}</p>
    </div>
  );
}

export const BreedIntelligenceView: React.FC<Props> = ({ currentDog, onNavigate }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'bg' ? 'bg' : 'en';
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  const loadSessions = useCallback(async () => {
    if (!currentDog) return;
    try {
      const res = await apiClient.getTrainingSessions(currentDog.id);
      setRecentSessions(res.trainingSessions ?? []);
    } catch { /* analytics optional */ }
  }, [currentDog]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const breedInfo: BreedInfo | null = useMemo(
    () => (currentDog?.breed ? findBreed(currentDog.breed) : null),
    [currentDog?.breed]
  );

  const currentWeightKg = useMemo(() => {
    const w = typeof currentDog?.weight === 'string' ? parseFloat(currentDog.weight) : (currentDog?.weight ?? 0);
    return isNaN(w) ? 0 : w;
  }, [currentDog?.weight]);

  const weightStatus = useMemo(() => {
    if (!breedInfo || currentWeightKg <= 0) return null;
    return getWeightStatus(currentWeightKg, breedInfo, currentDog?.sex);
  }, [breedInfo, currentWeightKg, currentDog?.sex]);

  const avgDailyExerciseMin = useMemo(() => {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = recentSessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
    const totalMin = recent.reduce((a, s) => a + (s.duration ?? 0), 0);
    return recent.length > 0 ? Math.round(totalMin / 30) : 0;
  }, [recentSessions]);

  const dogAge = useMemo(() => {
    if (!currentDog?.dateOfBirth) return null;
    const dob = new Date(currentDog.dateOfBirth);
    const now = new Date();
    const totalMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (totalMonths < 12) return `${totalMonths} мес.`;
    return `${Math.floor(totalMonths / 12)} г.`;
  }, [currentDog?.dateOfBirth]);

  const weightStatusLabel = weightStatus
    ? t(`weight${weightStatus.status.charAt(0).toUpperCase()}${weightStatus.status.slice(1)}`)
    : '';

  if (!currentDog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-400 dark:text-[#8b919d]">
        <Info size={48} className="opacity-40" />
        <p className="text-sm">{t('noDogs')} <button onClick={() => onNavigate?.('settings')} className="text-[#005da7] dark:text-[#a4c9ff] underline">{t('addDog')}</button></p>
      </div>
    );
  }

  const weightRange = breedInfo
    ? (currentDog.sex?.toLowerCase() === 'female' ? breedInfo.weightKg.female : breedInfo.weightKg.male)
    : null;

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">{t('breedIntelligenceTitle')}</h1>
        <p className="text-sm text-gray-400 dark:text-[#8b919d]">{t('breedInsightsSubtitle', { name: currentDog.name })}</p>
      </div>

      {/* Dog card */}
      <div className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#005da7]/20">
          {currentDog.profilePicture ? (
            <img src={currentDog.profilePicture} alt={currentDog.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#005da7] to-[#0090e7] flex items-center justify-center text-white text-xl font-bold">
              {currentDog.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-[#e2e2e6]">{currentDog.name}</p>
          <p className="text-sm text-gray-500 dark:text-[#8b919d]">{currentDog.breed}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {dogAge && <span className="text-xs text-gray-400 dark:text-[#8b919d]">{dogAge}</span>}
            {currentWeightKg > 0 && <span className="text-xs text-gray-400 dark:text-[#8b919d]">{currentWeightKg} kg</span>}
            {currentDog.sex && <span className="text-xs text-gray-400 dark:text-[#8b919d] capitalize">{currentDog.sex}</span>}
          </div>
        </div>
        {breedInfo && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400 dark:text-[#8b919d]">{t('lifespanLabel')}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6]">{breedInfo.lifespanYears[0]}–{breedInfo.lifespanYears[1]} г.</p>
            <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-1">{breedInfo.origin[lang]}</p>
          </div>
        )}
      </div>

      {!breedInfo && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('breedNotRecognized')}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{t('breedNotRecognizedDesc', { breed: currentDog.breed })}</p>
          </div>
        </div>
      )}

      {breedInfo && (
        <>
          {currentWeightKg > 0 && weightStatus && weightRange && (
            <SectionCard title={t('weightAssessment')} icon={Activity}>
              <div className="flex items-center gap-2 mb-2">
                {weightStatus.status === 'ideal'
                  ? <CheckCircle size={14} className="text-green-500" />
                  : <AlertTriangle size={14} className="text-orange-500" />}
                <span className="text-sm text-gray-600 dark:text-[#c1c7d3]">
                  {weightStatus.status === 'underweight'
                    ? `${t('weightUnderweightTip').split('.')[0]}`
                    : weightStatus.status === 'overweight'
                      ? `${t('weightOverweightTip').split('.')[0]}`
                      : `${t('weightIdeal')} — ${weightRange[0]}–${weightRange[1]} kg`}
                </span>
              </div>
              <WeightGauge currentKg={currentWeightKg} minKg={weightRange[0]} maxKg={weightRange[1]} status={weightStatus.status} statusLabel={weightStatusLabel} />
              {weightStatus.status !== 'ideal' && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {weightStatus.status === 'overweight' ? t('weightOverweightTip') : t('weightUnderweightTip')}
                </p>
              )}
            </SectionCard>
          )}

          <SectionCard title={t('exerciseNeeds')} icon={Activity}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', EXERCISE_LEVEL_COLORS[breedInfo.exerciseLevel])}>
                {breedInfo.exerciseLevel.replace('-', ' ')}
              </span>
            </div>
            {recentSessions.length > 0 && (
              <ExerciseComparison recommended={breedInfo.exerciseMinPerDay} actualMinPerDay={avgDailyExerciseMin} t={t} />
            )}
            {recentSessions.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('recommendedExercise', { min: breedInfo.exerciseMinPerDay })}</p>
            )}
            {avgDailyExerciseMin < breedInfo.exerciseMinPerDay * 0.5 && recentSessions.length > 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {currentDog.name} {t('noActivityYet').toLowerCase()}
              </p>
            )}
          </SectionCard>

          <SectionCard title={t('healthWatchList')} icon={Heart}>
            <p className="text-xs text-gray-500 dark:text-[#8b919d] mb-2">{t('conditionsCommonIn', { breed: breedInfo.names[0] })}</p>
            <div className="space-y-1.5">
              {breedInfo.commonConditions[lang].map(condition => (
                <div key={condition} className="flex items-start gap-2">
                  <AlertTriangle size={12} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-[#c1c7d3]">{condition}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t('groomingRequirements')} icon={Scissors}>
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-[#c1c7d3] font-medium">
                {GROOMING_LEVEL_LABELS[breedInfo.groomingFrequency][lang]}
              </p>
              <p className="text-sm text-gray-500 dark:text-[#8b919d]">{breedInfo.coatDescription[lang]}</p>
              {breedInfo.hypoallergenic && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle size={12} />
                  {t('hypoallergenicNote')}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title={t('temperament')} icon={Info}>
            <div className="flex flex-wrap gap-1.5">
              {breedInfo.temperament[lang].map(trait => <Tag key={trait} label={trait} />)}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
              <div className="flex flex-col items-center gap-1 text-center">
                {breedInfo.goodWithKids ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-orange-400" />}
                <span className="text-xs text-gray-400 dark:text-[#8b919d]">
                  {breedInfo.goodWithKids ? t('goodWith', { type: t('kids') ?? 'Kids' }) : t('cautionWith', { type: t('kids') ?? 'Kids' })}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                {breedInfo.goodWithDogs ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-orange-400" />}
                <span className="text-xs text-gray-400 dark:text-[#8b919d]">
                  {breedInfo.goodWithDogs ? t('goodWith', { type: t('dogs') ?? 'Dogs' }) : t('cautionWith', { type: t('dogs') ?? 'Dogs' })}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className={cn('text-xs font-medium capitalize',
                  breedInfo.trainability === 'easy' ? 'text-green-600 dark:text-green-400' :
                  breedInfo.trainability === 'moderate' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500')}>
                  {breedInfo.trainability}
                </span>
                <span className="text-xs text-gray-400 dark:text-[#8b919d]">{t('trainabilityLabel')}</span>
              </div>
            </div>
          </SectionCard>

          <div className="bg-[#005da7]/5 dark:bg-[#a4c9ff]/5 border border-[#005da7]/15 dark:border-[#a4c9ff]/15 rounded-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#005da7] dark:text-[#a4c9ff] flex-shrink-0">lightbulb</span>
            <p className="text-sm text-gray-700 dark:text-[#c1c7d3] leading-relaxed">{breedInfo.funFact[lang]}</p>
          </div>
        </>
      )}

      {!breedInfo && (
        <div className="space-y-3">
          {[
            { icon: Heart,    title: t('healthWatchList'),    tip: 'All dogs benefit from annual checkups, vaccinations, and parasite prevention.' },
            { icon: Activity, title: t('exerciseNeeds'),       tip: 'Most dogs need 30–90 minutes of exercise per day depending on age and energy level.' },
            { icon: Scissors, title: t('groomingRequirements'), tip: 'Brush regularly to reduce shedding and check skin, coat, ears, and nails.' },
            { icon: Clock,    title: 'Dental Care',            tip: 'Dental disease affects 80% of dogs by age 3. Brush teeth or use dental chews regularly.' },
          ].map(item => (
            <div key={item.title} className="bg-white dark:bg-[#1e2023] rounded-xl border border-gray-100 dark:border-white/5 p-4 flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 flex items-center justify-center flex-shrink-0">
                <item.icon size={15} className="text-[#005da7] dark:text-[#a4c9ff]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e2e2e6]">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-[#8b919d] mt-0.5">{item.tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
