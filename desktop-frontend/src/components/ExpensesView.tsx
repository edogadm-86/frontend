import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { Expense, ExpenseCategory, ExpenseStats } from '../types';
import { cn } from '../lib/utils';

interface ExpensesViewProps {
  currentDog: any;
}

const fmt = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── SVG Bar Chart ──────────────────────────────────────────────────────────
const WeeklyBarChart: React.FC<{ weeklyData: { dow: number; total: number }[] }> = ({
  weeklyData,
}) => {
  const today = new Date().getDay();
  const bars = Array.from({ length: 7 }, (_, i) => {
    const entry = weeklyData.find(d => d.dow === i);
    return { dow: i, total: entry?.total ?? 0 };
  });
  const max = Math.max(...bars.map(b => b.total), 1);
  const H = 80;
  const barW = 22;
  const gap = 12;
  const totalW = 7 * (barW + gap) - gap;

  return (
    <svg viewBox={`0 0 ${totalW} ${H + 24}`} className="w-full" style={{ maxHeight: 120 }}>
      {bars.map((b, i) => {
        const x = i * (barW + gap);
        const barH = Math.max((b.total / max) * H, b.total > 0 ? 4 : 2);
        const isToday = b.dow === today;
        return (
          <g key={i}>
            <rect
              x={x}
              y={H - barH}
              width={barW}
              height={barH}
              rx={5}
              className={
                isToday
                  ? 'fill-[#005da7] dark:fill-[#a4c9ff]'
                  : 'fill-[#005da7]/20 dark:fill-[#a4c9ff]/20'
              }
            />
            <text
              x={x + barW / 2}
              y={H + 16}
              textAnchor="middle"
              fontSize={9}
              className={`fill-gray-400 dark:fill-[#8b919d] font-medium ${isToday ? 'font-bold fill-[#005da7] dark:fill-[#a4c9ff]' : ''}`}
            >
              {DOW_LABELS[b.dow]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Yearly Bar Chart ──────────────────────────────────────────────────────
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const YearlyBarChart: React.FC<{
  monthlyData: { month: number; total: number }[];
  yearTotal: number;
  selectedMonth: number;
  todayMonth: number;
  onMonthClick: (month: number) => void;
}> = ({ monthlyData, selectedMonth, todayMonth, onMonthClick }) => {
  const bars = Array.from({ length: 12 }, (_, i) => {
    const entry = monthlyData.find(d => d.month === i + 1);
    return { month: i + 1, total: entry?.total ?? 0 };
  });
  const max = Math.max(...bars.map(b => b.total), 1);
  const H = 90;
  const barW = 18;
  const gap = 8;
  const totalW = 12 * (barW + gap) - gap;

  return (
    <svg viewBox={`0 0 ${totalW} ${H + 30}`} className="w-full" style={{ maxHeight: 150 }}>
      {bars.map((b, i) => {
        const x = i * (barW + gap);
        const barH = Math.max((b.total / max) * H, b.total > 0 ? 4 : 2);
        const isSelected = b.month === selectedMonth;
        const isToday = b.month === todayMonth;
        return (
          <g key={i} style={{ cursor: 'pointer' }} onClick={() => onMonthClick(b.month)}>
            {/* transparent hit area */}
            <rect x={x} y={0} width={barW} height={H + 20} fill="transparent" />
            <rect
              x={x} y={H - barH} width={barW} height={barH} rx={4}
              className={isSelected ? 'fill-[#005da7] dark:fill-[#a4c9ff]' : 'fill-[#005da7]/20 dark:fill-[#a4c9ff]/20'}
            />
            {b.total > 0 && (
              <text
                x={x + barW / 2} y={H - barH - 4}
                textAnchor="middle" fontSize={7}
                className={isSelected ? 'fill-[#005da7] dark:fill-[#a4c9ff]' : 'fill-gray-400 dark:fill-[#8b919d]'}
              >
                {b.total >= 1000 ? `€${(b.total / 1000).toFixed(1)}k` : `€${b.total.toFixed(0)}`}
              </text>
            )}
            <text
              x={x + barW / 2} y={H + 16}
              textAnchor="middle" fontSize={8}
              className={
                isSelected
                  ? 'fill-[#005da7] dark:fill-[#a4c9ff]'
                  : isToday
                  ? 'fill-gray-600 dark:fill-gray-300'
                  : 'fill-gray-400 dark:fill-[#8b919d]'
              }
              fontWeight={isSelected || isToday ? 'bold' : 'normal'}
            >
              {MONTH_SHORT[i]}
            </text>
            {isSelected && (
              <circle cx={x + barW / 2} cy={H + 26} r={2.5} className="fill-[#005da7] dark:fill-[#a4c9ff]" />
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ── CSV Export ─────────────────────────────────────────────────────────────
const exportCSV = (rows: Expense[], dogName: string, label: string) => {
  const header = ['Date', 'Category', 'Description', 'Vendor', 'Amount (EUR)', 'Notes'];
  const body = rows.map(e => [
    e.date,
    e.category,
    e.description,
    e.vendor ?? '',
    parseFloat(String(e.amount)).toFixed(2).replace('.', ','),
    e.notes ?? '',
  ]);
  const csv = [header, ...body]
    .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses_${dogName}_${label}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Image compression ──────────────────────────────────────────────────────
const compressImage = (file: File, maxPx = 1200, quality = 0.75): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });

// ── Add / Edit Modal ───────────────────────────────────────────────────────
interface ExpenseFormData {
  date: string;
  category: ExpenseCategory;
  description: string;
  vendor: string;
  amount: string;
  notes: string;
  recur_monthly: boolean;
  receipt_photo: string;
}

const EMPTY_FORM: ExpenseFormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  category: 'food',
  description: '',
  vendor: '',
  amount: '',
  notes: '',
  recur_monthly: false,
  receipt_photo: '',
};

const ExpenseModal: React.FC<{
  expense: Expense | null;
  onClose: () => void;
  onSave: (data: ExpenseFormData) => Promise<void>;
  categories: { id: ExpenseCategory; label: string; icon: string }[];
}> = ({ expense, onClose, onSave, categories }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<ExpenseFormData>(
    expense
      ? {
          // Slice to YYYY-MM-DD — pg may return full ISO timestamp
          date: String(expense.date).slice(0, 10),
          category: expense.category,
          description: expense.description,
          vendor: expense.vendor ?? '',
          amount: String(expense.amount),
          notes: expense.notes ?? '',
          recur_monthly: expense.recur_monthly ?? false,
          receipt_photo: expense.receipt_photo || '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const compressed = await compressImage(file);
      setForm(f => ({ ...f, receipt_photo: compressed }));
    } catch {
      // silently ignore compression errors
    } finally {
      setPhotoLoading(false);
    }
  };

  const set =
    (field: keyof ExpenseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) {
      setError(t('error'));
      return;
    }
    if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      setError(t('error'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message ?? t('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg bg-white dark:bg-[#1e2023] rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">
            {expense ? t('editExpense') : t('addExpense')}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#282a2d]">
            <X size={18} className="text-gray-500 dark:text-[#8b919d]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* Category picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-[#8b919d] mb-2 uppercase tracking-wide">
              {t('type')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all',
                    form.category === cat.id
                      ? 'border-[#005da7] dark:border-[#a4c9ff] bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 text-[#005da7] dark:text-[#a4c9ff]'
                      : 'border-gray-200 dark:border-white/5 text-gray-500 dark:text-[#8b919d] hover:border-gray-300 dark:hover:border-white/10'
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                  <span className="text-center leading-tight">{cat.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide">
                {t('description')} *
              </label>
              <input
                type="text"
                value={form.description}
                onChange={set('description')}
                placeholder={t('expenseDescPlaceholder')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] text-sm focus:outline-none focus:border-[#005da7] dark:focus:border-[#a4c9ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide">
                {t('amount')} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b919d] text-sm font-semibold">
                  €
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={set('amount')}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm focus:outline-none focus:border-[#005da7] dark:focus:border-[#a4c9ff]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide">
                {t('date')}
              </label>
              <input
                type="date"
                value={form.date}
                onChange={set('date')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] text-sm focus:outline-none focus:border-[#005da7] dark:focus:border-[#a4c9ff]"
              />
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide">
              {t('vendorStore')}
            </label>
            <input
              type="text"
              value={form.vendor}
              onChange={set('vendor')}
              placeholder={t('vendorPlaceholder')}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] text-sm focus:outline-none focus:border-[#005da7] dark:focus:border-[#a4c9ff]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide">
              {t('notes')}
            </label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={2}
              placeholder={t('notesPlaceholder')}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#282a2d] text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] text-sm resize-none focus:outline-none focus:border-[#005da7] dark:focus:border-[#a4c9ff]"
            />
          </div>

          {/* Receipt photo */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide">
              {t('receiptPhoto')}
            </label>
            {form.receipt_photo ? (
              <div className="relative">
                <img
                  src={form.receipt_photo}
                  alt="receipt"
                  className="w-full max-h-40 object-contain rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#282a2d]"
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, receipt_photo: '' }))}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-black/40 hover:bg-black/60 text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className={cn(
                'flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                'border-gray-200 dark:border-white/10 text-gray-400 dark:text-[#8b919d]',
                'hover:border-[#005da7] dark:hover:border-[#a4c9ff] hover:text-[#005da7] dark:hover:text-[#a4c9ff]',
                photoLoading && 'opacity-50 pointer-events-none'
              )}>
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span className="text-sm font-medium">
                  {photoLoading ? '…' : t('addReceipt')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>

          {/* Repeat monthly — only for original expenses, not auto-created copies */}
          {!expense?.recur_source_id && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.recur_monthly}
                  onChange={e => setForm(f => ({ ...f, recur_monthly: e.target.checked }))}
                />
                <div className="w-10 h-5 rounded-full bg-gray-200 dark:bg-[#333538] peer-checked:bg-[#005da7] dark:peer-checked:bg-[#a4c9ff] transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-[#c1c7d3]">{t('repeatMonthly')}</p>
                <p className="text-xs text-gray-400 dark:text-[#8b919d]">{t('recurringExpense')}</p>
              </div>
            </label>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {saving ? t('saving') : expense ? t('saveChanges') : t('addExpense')}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main View ──────────────────────────────────────────────────────────────
export const ExpensesView: React.FC<ExpensesViewProps> = ({ currentDog }) => {
  const { t } = useTranslation();

  // Build category list using translations
  const CATEGORIES: { id: ExpenseCategory; label: string; icon: string; color: string; bg: string; darkBg: string }[] = [
    { id: 'food',     label: t('categoryFood'),     icon: 'restaurant',      color: 'text-[#005da7] dark:text-[#a4c9ff]', bg: 'bg-[#005da7]/10', darkBg: 'dark:bg-[#a4c9ff]/10' },
    { id: 'medical',  label: t('categoryMedical'),  icon: 'medical_services', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10',  darkBg: 'dark:bg-amber-400/10' },
    { id: 'gear',     label: t('categoryGear'),     icon: 'shopping_bag',    color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-500/10',  darkBg: 'dark:bg-slate-400/10' },
    { id: 'training', label: t('categoryTraining'), icon: 'fitness_center',  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', darkBg: 'dark:bg-emerald-400/10' },
    { id: 'other',    label: t('other'),            icon: 'receipt_long',    color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', darkBg: 'dark:bg-purple-400/10' },
  ];

  const getCat = (id: ExpenseCategory) => CATEGORIES.find(c => c.id === id) ?? CATEGORIES[4];

  const currentYear = new Date().getFullYear();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [yearlyStats, setYearlyStats] = useState<{ monthlyData: { month: number; total: number }[]; yearTotal: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportingYear, setExportingYear] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const monthKey = format(currentMonth, 'yyyy-MM');

  const load = useCallback(async () => {
    if (!currentDog) return;
    setLoading(true);
    try {
      const [expRes, statsRes, yearRes] = await Promise.all([
        apiClient.getExpenses(currentDog.id, { month: monthKey }),
        apiClient.getExpenseStats(currentDog.id, monthKey),
        apiClient.getYearlyExpenseStats(currentDog.id, currentYear),
      ]);
      setExpenses(expRes.expenses);
      setStats(statsRes);
      setYearlyStats(yearRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentDog, monthKey, currentYear]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form: ExpenseFormData) => {
    const payload = {
      date: form.date,
      category: form.category,
      description: form.description.trim(),
      vendor: form.vendor.trim() || undefined,
      amount: parseFloat(form.amount),
      notes: form.notes.trim() || undefined,
      recur_monthly: form.recur_monthly,
      receipt_photo: form.receipt_photo || undefined,
    };
    if (editing) {
      await apiClient.updateExpense(currentDog.id, editing.id, payload);
    } else {
      await apiClient.createExpense(currentDog.id, payload);
    }
    setEditing(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    await apiClient.deleteExpense(currentDog.id, id);
    setDeleteConfirm(null);
    await load();
  };

  const prevMonth = () => { setCurrentMonth(m => subMonths(m, 1)); setShowAll(false); };
  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (next <= startOfMonth(new Date())) { setCurrentMonth(next); setShowAll(false); }
  };
  const isCurrentMonth = format(currentMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  const handleExportMonth = () => {
    exportCSV(expenses, currentDog.name, monthKey);
    setExportOpen(false);
  };

  const handleExportYear = async () => {
    setExportingYear(true);
    setExportOpen(false);
    try {
      const res = await apiClient.getExpenses(currentDog.id, { year: currentYear });
      exportCSV(res.expenses, currentDog.name, String(currentYear));
    } catch (e) {
      console.error(e);
    } finally {
      setExportingYear(false);
    }
  };

  const visibleExpenses = showAll ? expenses : expenses.slice(0, 8);

  if (!currentDog) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center px-4">
        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-[#414751] mb-4">receipt_long</span>
        <p className="text-gray-500 dark:text-[#8b919d] font-medium">{t('selectDogExpenses')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#fbf9f8] dark:bg-[#111316] px-4 md:px-8 py-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
         <div className="flex items-center gap-3 px-4 py-2.5 ">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors">
          <ChevronLeft size={18} className="text-gray-500 dark:text-[#8b919d]" />
        </button>
        <span className="text-sm font-semibold text-gray-700 dark:text-[#c1c7d3] min-w-[120px] text-center">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors disabled:opacity-30"
        >
          <ChevronRight size={18} className="text-gray-500 dark:text-[#8b919d]" />
        </button>
        </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(o => !o)}
              disabled={exportingYear}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#c1c7d3] text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all disabled:opacity-50"
            >
              <Download size={15} />
              <span className="hidden sm:inline">{exportingYear ? '…' : t('exportExpenses')}</span>
            </button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 mt-1.5 z-20 w-52 bg-white dark:bg-[#1e2023] rounded-xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                  <button
                    onClick={handleExportMonth}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-[#c1c7d3] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
                  >
                    {t('exportCurrentMonth')}
                  </button>
                  <button
                    onClick={handleExportYear}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-[#c1c7d3] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors border-t border-gray-50 dark:border-white/5"
                  >
                    {t('exportFullYear')}
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] font-semibold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">{t('addExpense')}</span>
          </button>
        </div>
      </div>

      {/* Month Selector */}
      

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005da7] dark:border-[#a4c9ff]" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary + Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Card */}
            <div className="bg-white dark:bg-[#1e2023] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider mb-1">
                {t('thisMonthTotal')}
              </p>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-[#e2e2e6]">
                  {fmt(stats?.currentTotal ?? 0)}
                </span>
                {stats?.percentChange !== null && stats?.percentChange !== undefined && (
                  <span
                    className={cn(
                      'text-sm font-semibold mb-1',
                      stats.percentChange >= 0
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-emerald-500 dark:text-emerald-400'
                    )}
                  >
                    {stats.percentChange >= 0 ? '+' : ''}{stats.percentChange.toFixed(0)}%
                  </span>
                )}
              </div>
              {isCurrentMonth && stats && <WeeklyBarChart weeklyData={stats.weeklyData} />}
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-[#1e2023] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider mb-4">
                {t('byCategory')}
              </p>
              {!stats || stats.categoryBreakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-300 dark:text-[#414751]">
                  <span className="material-symbols-outlined text-3xl mb-2">pie_chart</span>
                  <p className="text-sm text-gray-400 dark:text-[#8b919d]">{t('noData')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.categoryBreakdown.map(({ category, total }) => {
                    const cat = getCat(category);
                    const pct = stats.currentTotal > 0 ? (total / stats.currentTotal) * 100 : 0;
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', cat.bg, cat.darkBg)}>
                              <span className={cn('material-symbols-outlined text-[14px]', cat.color)}>{cat.icon}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-[#c1c7d3]">{cat.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6]">{fmt(total)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-[#282a2d] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#005da7] dark:bg-[#a4c9ff] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Category Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.filter(c => c.id !== 'other').map(cat => {
              const catTotal = stats?.categoryBreakdown.find(b => b.category === cat.id)?.total ?? 0;
              return (
                <div key={cat.id} className="bg-white dark:bg-[#1e2023] rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', cat.bg, cat.darkBg)}>
                    <span className={cn('material-symbols-outlined text-[20px]', cat.color)}>{cat.icon}</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-[#8b919d] font-medium mb-1 truncate">{cat.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">{fmt(catTotal)}</p>
                </div>
              );
            })}
          </div>

          {/* Yearly Chart */}
          {yearlyStats && (
            <div className="bg-white dark:bg-[#1e2023] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider">
                  {t('yearOverview')}
                </p>
                <span className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">
                  {t('yearTotal', { year: currentYear })}:&nbsp;{fmt(yearlyStats.yearTotal)}
                </span>
              </div>
              <YearlyBarChart
                monthlyData={yearlyStats.monthlyData}
                yearTotal={yearlyStats.yearTotal}
                selectedMonth={currentMonth.getMonth() + 1}
                todayMonth={new Date().getMonth() + 1}
                onMonthClick={(month) => {
                  setCurrentMonth(startOfMonth(new Date(currentYear, month - 1, 1)));
                  setShowAll(false);
                }}
              />
            </div>
          )}

          {/* Transaction List */}
          <div className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="font-bold text-gray-900 dark:text-[#e2e2e6]">{t('transactions')}</h2>
              <span className="text-xs text-gray-400 dark:text-[#8b919d]">{expenses.length} total</span>
            </div>

            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-gray-300 dark:text-[#414751]">
                <span className="material-symbols-outlined text-4xl mb-3">receipt_long</span>
                <p className="text-sm font-medium text-gray-400 dark:text-[#8b919d]">
                  {t('noExpensesMonth', { month: format(currentMonth, 'MMMM yyyy') })}
                </p>
                <button
                  onClick={() => { setEditing(null); setModalOpen(true); }}
                  className="mt-4 text-sm text-[#005da7] dark:text-[#a4c9ff] font-semibold hover:underline"
                >
                  {t('addFirstExpense')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {visibleExpenses.map(exp => {
                  const cat = getCat(exp.category);
                  const isRecurring = exp.recur_monthly || !!exp.recur_source_id;
                  return (
                    <div
                      key={exp.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#282a2d]/50 group transition-colors"
                    >
                      <div className={cn('w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center', cat.bg, cat.darkBg)}>
                        <span className={cn('material-symbols-outlined text-[18px]', cat.color)}>{cat.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] truncate">{exp.description}</p>
                          {isRecurring && (
                            <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 text-[10px] font-semibold text-[#005da7] dark:text-[#a4c9ff]">
                              <span className="material-symbols-outlined text-[10px]">autorenew</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-[#8b919d]">
                          {format(new Date(exp.date), 'MMM d')}
                          {exp.vendor && ` · ${exp.vendor}`}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6] flex-shrink-0">
                        -{fmt(exp.amount)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {exp.receipt_photo && (
                          <button
                            onClick={() => setViewingReceipt(exp.receipt_photo!)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333538]"
                            title={t('viewReceipt')}
                          >
                            <span className="material-symbols-outlined text-[13px] text-gray-400 dark:text-[#8b919d]">receipt</span>
                          </button>
                        )}
                        <button
                          onClick={() => { setEditing(exp); setModalOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333538]"
                        >
                          <Pencil size={13} className="text-gray-400 dark:text-[#8b919d]" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(exp.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {expenses.length > 8 && (
                  <button
                    onClick={() => setShowAll(s => !s)}
                    className="w-full py-3 text-sm font-semibold text-[#005da7] dark:text-[#a4c9ff] hover:bg-gray-50 dark:hover:bg-[#282a2d]/50 transition-colors"
                  >
                    {showAll
                      ? t('showLess')
                      : t('viewAllTransactions', { count: expenses.length })}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB — mobile */}
      <button
        onClick={() => { setEditing(null); setModalOpen(true); }}
        className="md:hidden fixed bottom-20 right-5 w-14 h-14 rounded-full bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] shadow-xl flex items-center justify-center z-30 hover:opacity-90 active:scale-95 transition-all"
      >
        <Plus size={24} />
      </button>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <ExpenseModal
          expense={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
          categories={CATEGORIES}
        />
      )}

      {/* Receipt Lightbox */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewingReceipt(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
            <img
              src={viewingReceipt}
              alt="receipt"
              className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-[#1e2023] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6] mb-2">{t('deleteExpenseTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-6">{t('deleteExpenseBody')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] font-semibold text-sm hover:bg-gray-50 dark:hover:bg-[#282a2d]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 active:scale-95 transition-all"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
