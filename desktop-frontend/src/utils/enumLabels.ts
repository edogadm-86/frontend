// Translates enum-like values stored in the DB (record types, vaccine types, breed levels)
// into UI labels. Unknown values fall back to the raw value so nothing disappears.
type T = (key: string, opts?: Record<string, unknown>) => string;

const RECORD_TYPE_KEYS: Record<string, string> = {
  'vet-visit': 'vetVisit',
  vet_visit: 'vetVisit',
  checkup: 'checkup',
  vaccination: 'vaccination',
  medication: 'medication',
  illness: 'ilness',
  injury: 'injury',
  other: 'other',
};

const VACCINE_TYPE_KEYS: Record<string, string> = {
  mandatory: 'mandatory',
  optional: 'additional',
  core: 'vaccineCore',
};

const LEVEL_KEYS: Record<string, string> = {
  low: 'levelLow',
  moderate: 'levelModerate',
  high: 'levelHigh',
  'very-high': 'levelVeryHigh',
};

const TRAINABILITY_KEYS: Record<string, string> = {
  easy: 'trainabilityEasy',
  moderate: 'trainabilityModerate',
  challenging: 'trainabilityChallenging',
};

const label = (map: Record<string, string>) => (t: T, raw?: string | null) => {
  if (!raw) return '';
  const key = map[raw.toLowerCase().trim()];
  return key ? t(key) : raw.replace(/[-_]/g, ' ');
};

export const recordTypeLabel = label(RECORD_TYPE_KEYS);
export const vaccineTypeLabel = label(VACCINE_TYPE_KEYS);
export const exerciseLevelLabel = label(LEVEL_KEYS);
export const trainabilityLabel = label(TRAINABILITY_KEYS);
