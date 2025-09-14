// src/utils/healthI18n.ts
const STATUS_MAP: Record<string, string> = {
  'Excellent': 'excellent',
  'Good': 'good',
  'Fair': 'fair',
  'Needs Attention': 'needsAttention',
  'Poor': 'poor'
};

// Build a lowercased lookup so we match 'fair', ' FAIR ', etc.
const LOWER_STATUS_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [k.toLowerCase(), v])
);

const ACTION_MAP: Record<string, string> = {
  'Keep up the great care routine!': 'keepRoutine',
  'Consider scheduling a routine checkup': 'scheduleCheckup',
  'Update vaccinations and schedule vet visit': 'updateVaccinations',
  'Schedule vet visit and update records': 'scheduleVetVisit',
  'Immediate vet attention recommended': 'immediateVet'
};

// (Optional) if backend sends factor strings in English:
const FACTOR_MAP: Record<string, string> = {
  'Keep up regular checkups': 'keepRegularCheckups',
  'Maintain vaccination schedule': 'maintainVaccinationSchedule',
  'Track weight changes': 'trackWeightChanges',
  'Improve daily activity': 'improveDailyActivity',
  'Some vaccinations due': 'someVaccinationsDue',
  'Regular health monitoring': 'regularHealthMonitoring',
  'Schedule regular checkups': 'scheduleRegularCheckups'
};

const LOWER_FACTOR_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(FACTOR_MAP).map(([k, v]) => [k.toLowerCase().trim(), v])
);

const norm = (s?: string) => (s || '').toLowerCase().trim();

export const factorKeyFromBackend = (raw?: string) =>
  LOWER_FACTOR_MAP[norm(raw)] ?? '';

export const statusKeyFromBackend = (raw?: string) =>
  LOWER_STATUS_MAP[norm(raw)] ?? 'unknown';

// ③ Score-based fallback (mirrors backend thresholds)
export const statusKeyFromScore = (score?: number | null) => {
  if (typeof score !== 'number') return '';
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  if (score >= 40) return 'needsAttention';
  return 'poor';
};


export const actionKeyFromBackend = (raw?: string) =>
  ACTION_MAP[norm(raw)] ?? '';


