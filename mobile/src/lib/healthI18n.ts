// src/utils/healthI18n.ts

// Status map
const STATUS_MAP: Record<string, string> = {
  'Excellent': 'excellent',
  'Good': 'good',
  'Fair': 'fair',
  'Needs Attention': 'needsAttention',
  'Poor': 'poor',
};

// Action map (keep exact case as backend sends)
const ACTION_MAP: Record<string, string> = {
  'Keep up the great care routine!': 'keepRoutine',
  'Consider scheduling a routine checkup': 'scheduleCheckup',
  'Update vaccinations and schedule vet visit': 'updateVaccinations',
  'Schedule vet visit and update records': 'scheduleVetVisit',
  'Immediate vet attention recommended': 'immediateVet',
};

// Factor map (keep exact case as backend sends)
const FACTOR_MAP: Record<string, string> = {
  'Keep up regular checkups': 'keepRegularCheckups',
  'Maintain vaccination schedule': 'maintainVaccinationSchedule',
  'Track weight changes': 'trackWeightChanges',
  'Improve daily activity': 'improveDailyActivity',
  'Some vaccinations due': 'someVaccinationsDue',
  'Regular health monitoring': 'regularHealthMonitoring',
  'Schedule regular checkups': 'scheduleRegularCheckups',
};

// --- Mapping functions (NO normalization now) ---
export const statusKeyFromBackend = (raw?: string) =>
  STATUS_MAP[raw || ''] ?? 'unknown';

export const actionKeyFromBackend = (raw?: string) =>
  ACTION_MAP[raw || ''] ?? '';

export const factorKeyFromBackend = (raw?: string) =>
  FACTOR_MAP[raw || ''] ?? '';

// Score-based fallback
export const statusKeyFromScore = (score?: number | null) => {
  if (typeof score !== 'number') return '';
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  if (score >= 40) return 'needsAttention';
  return 'poor';
};
