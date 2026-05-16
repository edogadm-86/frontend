import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: string;
  color: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: (date: Date) => void;
  selectedDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  onDateSelect,
  onEventClick,
  onAddEvent,
  selectedDate = new Date(),
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const { t } = useTranslation();

  const monthNames: string[] = t('calendar.months', { returnObjects: true });
  const weekDays: string[] = t('calendar.weekdays', { returnObjects: true });

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = firstDayWeekday - 1; i >= 0; i--)
    calendarDays.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    calendarDays.push({ date: new Date(year, month, d), isCurrentMonth: true });
  for (let d = 1; d <= 42 - calendarDays.length; d++)
    calendarDays.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });

  const navigateMonth = (dir: 'prev' | 'next') =>
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
      return d;
    });

  const getEventsForDate = (date: Date) =>
    events.filter(e => e.date.toDateString() === date.toDateString());

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) =>
    !!selectedDate && date.toDateString() === selectedDate.toDateString();

  const iconBtn =
    'w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-[#8b919d] hover:text-gray-800 dark:hover:text-[#e2e2e6] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-all';

  const maxVisible = view === 'week' ? 4 : 2;

  return (
    <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-4 sm:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">
            {monthNames[month]} {year}
          </h2>
          <div className="flex bg-gray-100 dark:bg-[#282a2d] rounded-lg p-0.5">
            {(['month', 'week'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-semibold transition-all',
                  view === v
                    ? 'bg-white dark:bg-[#1e2023] text-gray-900 dark:text-[#e2e2e6] shadow-sm'
                    : 'text-gray-500 dark:text-[#8b919d] hover:text-gray-700 dark:hover:text-[#c1c7d3]'
                )}
              >
                {v === 'month' ? t('calendar.month') : t('calendar.week')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigateMonth('prev')} className={iconBtn}>
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-[#c1c7d3] hover:text-gray-900 dark:hover:text-[#e2e2e6] hover:bg-gray-100 dark:hover:bg-[#282a2d] rounded-lg transition-all"
          >
            {t('calendar.today')}
          </button>
          <button onClick={() => navigateMonth('next')} className={iconBtn}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((day, i) => (
          <div key={i} className="py-2 text-center">
            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 dark:text-[#8b919d] uppercase tracking-wider">
              <span className="sm:hidden">{day.slice(0, 2)}</span>
              <span className="hidden sm:inline">{day.slice(0, 3)}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((day, i) => {
          const dayEvents = getEventsForDate(day.date);
          const todayCell = isToday(day.date);
          const selectedCell = isSelected(day.date);

          return (
            <div
              key={i}
              onClick={() => {
                onDateSelect(day.date);
                if (dayEvents.length === 0) onAddEvent(day.date);
              }}
              className={cn(
                'group relative rounded-lg cursor-pointer transition-all duration-150 p-1.5',
                view === 'week' ? 'min-h-[110px] sm:min-h-[140px]' : 'min-h-[68px] sm:min-h-[88px]',
                !day.isCurrentMonth && 'opacity-25',
                todayCell && 'bg-[#005da7]/[0.07] dark:bg-[#a4c9ff]/[0.07]',
                !todayCell && !selectedCell && 'hover:bg-gray-50 dark:hover:bg-[#282a2d]/70',
                selectedCell && !todayCell && 'ring-2 ring-inset ring-[#005da7] dark:ring-[#a4c9ff]'
              )}
            >
              {/* Day number */}
              <div className={cn(
                'inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full mb-1',
                todayCell
                  ? 'bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                  : day.isCurrentMonth
                  ? 'text-gray-800 dark:text-[#c1c7d3]'
                  : 'text-gray-400 dark:text-[#414751]'
              )}>
                {day.date.getDate()}
              </div>

              {/* Event pills */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, maxVisible).map(event => (
                  <div
                    key={event.id}
                    onClick={e => { e.stopPropagation(); onEventClick(event); }}
                    className={`text-[9px] sm:text-[10px] px-1.5 py-px rounded text-white font-semibold truncate cursor-pointer hover:opacity-80 transition-opacity ${event.color}`}
                    title={`${event.title} – ${event.time}`}
                  >
                    <span className="sm:hidden">{event.title}</span>
                    <span className="hidden sm:inline">{event.time} {event.title}</span>
                  </div>
                ))}
                {dayEvents.length > maxVisible && (
                  <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-[#8b919d] font-medium pl-1">
                    +{dayEvents.length - maxVisible}
                  </p>
                )}
              </div>

              {/* Hover add hint on empty days */}
              {dayEvents.length === 0 && day.isCurrentMonth && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Plus size={14} className="text-gray-300 dark:text-[#414751]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
        {[
          { cls: 'bg-[#005da7]', label: t('calendar.legend.vet') },
          { cls: 'bg-purple-500', label: t('calendar.legend.grooming') },
          { cls: 'bg-emerald-500', label: t('calendar.legend.training') },
          { cls: 'bg-orange-500', label: t('calendar.legend.other') },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${cls}`} />
            <span className="text-xs text-gray-500 dark:text-[#8b919d]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
