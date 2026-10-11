// Common dog vaccines in Bulgaria and their usual revaccination interval.
// Used to pre-fill "next due date" so reminders work without the owner knowing the schedule.
export interface VaccineSchedule {
  id: string;
  labelKey: string;    // i18n key for the quick-pick chip
  name: string;        // value written into the vaccine name field
  months: number;
  type?: 'mandatory' | 'optional';
  match: RegExp;
}

export const COMMON_VACCINES: VaccineSchedule[] = [
  { id: 'rabies', labelKey: 'vaccineRabies', name: 'Rabies (Бяс)', months: 12, type: 'mandatory', match: /rabi|бяс|бесн/i },
  { id: 'dhppi', labelKey: 'vaccineDhppi', name: 'DHPPi', months: 12, type: 'mandatory', match: /dhpp|dapp|distemper|parvo|чума|парво/i },
  { id: 'lepto', labelKey: 'vaccineLepto', name: 'Leptospirosis (Лептоспироза)', months: 12, type: 'optional', match: /lepto|лепто|\bl4\b/i },
  { id: 'kc', labelKey: 'vaccineKennelCough', name: 'Kennel cough (Кучешка кашлица)', months: 12, type: 'optional', match: /kennel|bordetella|кашлица|pneumodog|\bkc\b/i },
];

export const findVaccineSchedule = (name?: string) =>
  name ? COMMON_VACCINES.find(v => v.match.test(name)) : undefined;

/** 'YYYY-MM-DD' + n months → 'YYYY-MM-DD' (clamped to month end, e.g. Jan 31 → Feb 28). */
export const addMonthsYMD = (ymd: string, months: number) => {
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return '';
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
};

/** Suggested next due date for a vaccine name + date given, or '' if unknown. */
export const suggestedNextDue = (name?: string, dateGiven?: string) => {
  const s = findVaccineSchedule(name);
  return s && dateGiven ? addMonthsYMD(dateGiven, s.months) : '';
};
