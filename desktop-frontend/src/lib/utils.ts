import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import i18n from "./i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isBg = () => (i18n.resolvedLanguage || i18n.language || 'bg').startsWith('bg');

/** Locale tag matching the current UI language. */
export const uiLocale = () => (isBg() ? 'bg-BG' : 'en-US');

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString(uiLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString(uiLocale(), {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !isBg()
  });
}
export const toYMD = (v: any) =>
  !v ? new Date().toISOString().slice(0,10)
  : typeof v === 'string' ? v.slice(0,10)
  : v instanceof Date ? v.toISOString().slice(0,10)
  : String(v).slice(0,10);