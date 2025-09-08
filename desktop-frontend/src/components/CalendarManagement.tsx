import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, ArrowLeft, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { Calendar } from './ui/Calendar';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Dog } from '../types';
import { apiClient } from '../lib/api';
import { formatTime } from '../lib/utils';

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

export const CalendarManagement: React.FC<CalendarManagementProps> = ({
  currentDog,
  dogs,
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
    type: 'vet' as any,
    date: '',
    time: '',
    location: '',
    notes: '',
    reminder: true,
    reminder_time: 60,
  });

  useEffect(() => {
    if (currentDog?.id) {
      loadAppointments();
    }
  }, [currentDog?.id]);

  const loadAppointments = async () => {
    if (!currentDog?.id) return;
    
    try {
      const response = await apiClient.getAppointments(currentDog.id);
      setAppointments(response.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'vet': return 'bg-blue-500';
      case 'grooming': return 'bg-purple-500';
      case 'training': return 'bg-green-500';
      case 'walk': return 'bg-orange-500';
      case 'feeding': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const calendarEvents: CalendarEvent[] = appointments.map(appointment => ({
    id: appointment.id,
    title: appointment.title,
    date: new Date(appointment.date),
    time: appointment.time,
    type: appointment.type,
    color: getEventColor(appointment.type),
    location: appointment.location,
    notes: appointment.notes,
  }));

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    const appointment = appointments.find(a => a.id === event.id);
    if (appointment) {
      setFormData({
        title: appointment.title,
        type: appointment.type,
        date: appointment.date,
        time: appointment.time,
        location: appointment.location || '',
        notes: appointment.notes || '',
        reminder: appointment.reminder,
        reminder_time: appointment.reminder_time,
      });
      setShowEventModal(true);
    }
  };

  const handleAddEvent = (date: Date) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      type: 'vet',
      date: date.toISOString().split('T')[0],
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
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !currentDog?.id) return;
    
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await apiClient.deleteAppointment(currentDog.id, selectedEvent.id);
        await loadAppointments();
        setShowEventModal(false);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  if (!currentDog) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <CalendarIcon size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
            No Dog Selected
          </h2>
          <p className="text-gray-500 mb-6 dark:text-gray-400">
            Please select a dog from the sidebar to view appointments
          </p>
          <Button onClick={() => onNavigate('settings')}>
            {t('addDog')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        
        <Button onClick={() => handleAddEvent(new Date())} icon={<Plus size={16} />}>
          Add Appointment
        </Button>
      </div>

      {/* Calendar Component */}
      <Calendar
        events={calendarEvents}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
      />

      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={selectedEvent ? 'Edit Appointment' : 'Add Appointment'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field"
              required
            >
              <option value="vet">Vet Visit</option>
              <option value="grooming">Grooming</option>
              <option value="training">Training</option>
              <option value="walk">Walk</option>
              <option value="feeding">Feeding</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <Input
            label="Location (optional)"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable reminder</span>
            </label>
            {formData.reminder && (
              <Input
                label="Minutes before"
                type="number"
                value={formData.reminder_time.toString()}
                onChange={(e) => setFormData({ ...formData, reminder_time: parseInt(e.target.value) })}
                min="1"
                className="w-32"
              />
            )}
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEventModal(false)}>
              {t('cancel')}
            </Button>
            {selectedEvent && (
              <Button type="button" variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('loading') : t('save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};