// src/utils/healthI18n.ts

// Status map (all lowercase keys)
const STATUS_MAP: Record<string, string> = {
  'excellent': 'excellent',
  'good': 'good',
  'fair': 'fair',
  'needs attention': 'needsAttention',
  'poor': 'poor',
};

// Action map (all lowercase keys)
const ACTION_MAP: Record<string, string> = {
  'keep up the great care routine!': 'keepRoutine',
  'consider scheduling a routine checkup': 'scheduleCheckup',
  'update vaccinations and schedule vet visit': 'updateVaccinations',
  'schedule vet visit and update records': 'scheduleVetVisit',
  'immediate vet attention recommended': 'immediateVet',
};

// Factor map (all lowercase keys)
const FACTOR_MAP: Record<string, string> = {
  'keep up regular checkups': 'keepRegularCheckups',
  'maintain vaccination schedule': 'maintainVaccinationSchedule',
  'track weight changes': 'trackWeightChanges',
  'improve daily activity': 'improveDailyActivity',
  'some vaccinations due': 'someVaccinationsDue',
  'regular health monitoring': 'regularHealthMonitoring',
  'schedule regular checkups': 'scheduleRegularCheckups',
};

// Normalizer
const norm = (s?: string) => (s || '').toLowerCase().trim();

export const statusKeyFromBackend = (raw?: string) =>
  STATUS_MAP[norm(raw)] ?? 'unknown';

export const actionKeyFromBackend = (raw?: string) =>
  ACTION_MAP[norm(raw)] ?? '';

export const factorKeyFromBackend = (raw?: string) =>
  FACTOR_MAP[norm(raw)] ?? '';

// Score-based fallback (mirrors backend thresholds)
export const statusKeyFromScore = (score?: number | null) => {
  if (typeof score !== 'number') return '';
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  if (score >= 40) return 'needsAttention';
  return 'poor';
};
