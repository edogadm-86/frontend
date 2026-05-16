import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, MapPin, Clock } from 'lucide-react';
import { Calendar } from './ui/Calendar';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Dog } from '../types';
import { apiClient } from '../lib/api';

interface CalendarManagementProps {
  currentDog: Dog | null;
  dogs: Dog[];
  onNavigate: (view: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: string;
  color: string;
  location?: string;
  notes?: string;
}

const getEventColor = (type: string) => {
  switch (type) {
    case 'vet':      return 'bg-[#005da7]';
    case 'grooming': return 'bg-purple-500';
    case 'training': return 'bg-emerald-500';
    case 'walk':     return 'bg-orange-500';
    case 'feeding':  return 'bg-amber-500';
    default:         return 'bg-gray-400';
  }
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'vet':      return { icon: 'stethoscope',      bg: 'bg-[#005da7]/10 dark:bg-[#a4c9ff]/10', text: 'text-[#005da7] dark:text-[#a4c9ff]' };
    case 'grooming': return { icon: 'content_cut',      bg: 'bg-purple-100 dark:bg-purple-900/20',  text: 'text-purple-600 dark:text-purple-400' };
    case 'training': return { icon: 'fitness_center',   bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' };
    case 'walk':     return { icon: 'directions_walk',  bg: 'bg-orange-100 dark:bg-orange-900/20',   text: 'text-orange-600 dark:text-orange-400' };
    case 'feeding':  return { icon: 'restaurant',       bg: 'bg-amber-100 dark:bg-amber-900/20',     text: 'text-amber-600 dark:text-amber-400' };
    default:         return { icon: 'event_note',        bg: 'bg-gray-100 dark:bg-[#282a2d]',         text: 'text-gray-600 dark:text-[#8b919d]' };
  }
};

export const CalendarManagement: React.FC<CalendarManagementProps> = ({
  currentDog,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'vet' as string,
    date: '',
    time: '',
    location: '',
    notes: '',
    reminder: true,
    reminder_time: 60,
  });

  useEffect(() => {
    if (currentDog?.id) loadAppointments();
  }, [currentDog?.id]);

  const loadAppointments = async () => {
    if (!currentDog?.id) return;
    try {
      const response = await apiClient.getAppointments(currentDog.id);
      setAppointments(response.appointments);
    } catch {
      // silently ignore
    }
  };

  const calendarEvents: CalendarEvent[] = appointments.map(a => ({
    id: a.id,
    title: a.title,
    date: new Date(a.date),
    time: a.time,
    type: a.type,
    color: getEventColor(a.type),
    location: a.location,
    notes: a.notes,
  }));

  const selectedDateEvents = calendarEvents.filter(
    e => e.date.toDateString() === selectedDate.toDateString()
  );

  const handleDateSelect = (date: Date) => setSelectedDate(date);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    const appt = appointments.find(a => a.id === event.id);
    if (appt) {
      setFormData({
        title: appt.title,
        type: appt.type,
        date: appt.date,
        time: appt.time,
        location: appt.location || '',
        notes: appt.notes || '',
        reminder: appt.reminder,
        reminder_time: appt.reminder_time,
      });
      setShowEventModal(true);
    }
  };

  const handleAddEvent = (date: Date) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      type: 'vet',
      date: date.toLocaleDateString('en-CA'),
      time: '09:00',
      location: '',
      notes: '',
      reminder: true,
      reminder_time: 60,
    });
    setShowEventModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDog?.id) return;
    setLoading(true);
    try {
      if (selectedEvent) {
        await apiClient.updateAppointment(currentDog.id, selectedEvent.id, formData);
      } else {
        await apiClient.createAppointment(currentDog.id, formData);
      }
      await loadAppointments();
      setShowEventModal(false);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !currentDog?.id) return;
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await apiClient.deleteAppointment(currentDog.id, selectedEvent.id);
      await loadAppointments();
      setShowEventModal(false);
    } catch {
      // silently ignore
    }
  };

  const fieldCls = 'w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c1f] text-gray-900 dark:text-[#e2e2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] focus:border-transparent text-sm placeholder-gray-400 dark:placeholder-[#414751]';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-[#c1c7d3] mb-1';

  if (!currentDog) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-[#282a2d] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-gray-400 dark:text-[#414751] text-[32px]">calendar_month</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6] mb-2">{t('noDogsFound')}</h2>
          <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-6">{t('addFirstDog')}</p>
          <button
            onClick={() => onNavigate('settings')}
            className="px-5 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
          >
            {t('addDog')}
          </button>
        </div>
      </div>
    );
  }

  const selectedDateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8 space-y-4">

      {/* Top bar */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => handleAddEvent(selectedDate)}
          className="flex items-center gap-2 px-4 py-2 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
        >
          <Plus size={16} />
          {t('addAppointment')}
        </button>
      </div>

      {/* Calendar grid */}
      <Calendar
        events={calendarEvents}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
      />

      {/* Selected date events panel */}
      {selectedDateEvents.length > 0 && (
        <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] mb-3">
            {selectedDateLabel}
          </h3>
          <div className="space-y-2">
            {selectedDateEvents.map(event => {
              const cfg = getTypeConfig(event.type);
              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#282a2d]/50 hover:bg-gray-100 dark:hover:bg-[#282a2d] cursor-pointer transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <span className={`material-symbols-outlined text-[18px] ${cfg.text}`}>{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] truncate">{event.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#8b919d]">
                        <Clock size={11} />{event.time}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#8b919d] truncate">
                          <MapPin size={11} />{event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    {t(event.type === 'vet' ? 'vetVisit' : event.type)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={selectedEvent ? t('editAppointment') : t('addAppointment')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('title')}
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className={labelCls}>{t('type')}</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className={fieldCls}
              required
            >
              <option value="vet">{t('vetVisit')}</option>
              <option value="grooming">{t('grooming')}</option>
              <option value="training">{t('training')}</option>
              <option value="walk">{t('walk')}</option>
              <option value="feeding">{t('feeding')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('date')}
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label={t('time')}
              type="time"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <Input
            label={t('location')}
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
          />

          <div>
            <label className={labelCls}>{t('notes')}</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className={fieldCls}
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Reminder */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reminder}
                onChange={e => setFormData({ ...formData, reminder: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-[#005da7] focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] accent-[#005da7]"
              />
              <span className="text-sm text-gray-700 dark:text-[#c1c7d3]">{t('enableReminder')}</span>
            </label>
            {formData.reminder && (
              <div className="flex items-center gap-2">
                <Input
                  label={t('minutesBefore')}
                  type="number"
                  value={formData.reminder_time.toString()}
                  onChange={e => setFormData({ ...formData, reminder_time: parseInt(e.target.value) })}
                  min="1"
                  className="w-28"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEventModal(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all"
            >
              {t('cancel')}
            </button>
            {selectedEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all"
              >
                {t('delete')}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
