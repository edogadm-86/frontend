import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { Appointment } from '../types';
import { PlusCircle, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { LocalNotifications } from "@capacitor/local-notifications";



export const Calendar: React.FC = () => {
  const { currentDog, appointments, createAppointment, updateAppointment, deleteAppointment } = useApp();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'vet' as Appointment['type'],
    date: '',
    time: '',
    location: '',
    notes: '',
    reminder: true,
    reminderTime: 60,
  });
  const scheduleReminder = async (appointment: {
  title: string;
  date: string;
  time: string;
  reminderTime: number;
}) => {
  try {
    const [hours, minutes] = appointment.time.split(":").map(Number);
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Subtract reminder minutes
    const reminderAt = new Date(
      appointmentDate.getTime() - appointment.reminderTime * 60000
    );

    if (reminderAt > new Date()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: "eDog Appointment Reminder",
            body: `${appointment.title} at ${appointment.time}`,
            schedule: { at: reminderAt },
            sound: undefined,
            smallIcon: "ic_stat_icon", // optional, Android only
          },
        ],
      });
      console.log("Reminder scheduled:", reminderAt);
    }
  } catch (err) {
    console.error("Failed to schedule reminder:", err);
  }
};

  const dogAppointments = appointments.filter(a => a.dogId === currentDog?.id);

  // Helpers
  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'vet': return 'bg-red-100 text-red-800';
      case 'grooming': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'walk': return 'bg-green-100 text-green-800';
      case 'feeding': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Appointment['type']) => {
    switch (type) {
      case 'vet': return t('Vet');
      case 'grooming': return t('Grooming');
      case 'training': return t('Training');
      case 'walk': return t('Walk');
      case 'feeding': return t('Feeding');
      default: return t('Other');
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return t('Today');
    if (isTomorrow(date)) return t('Tomorrow');
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM dd, yyyy');
  };

  const groupedAppointments = dogAppointments
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((groups, appointment) => {
      const dateKey = format(appointment.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(appointment);
      return groups;
    }, {} as Record<string, Appointment[]>);

  // Handlers
  const openAddModal = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      type: 'vet',
      date: '',
      time: '',
      location: '',
      notes: '',
      reminder: true,
      reminderTime: 60,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setSelectedEvent(appointment);
    setFormData({
      title: appointment.title,
      type: appointment.type,
      date: format(new Date(appointment.date), 'yyyy-MM-dd'),
      time: appointment.time?.slice(0,5),
      location: appointment.location || '',
      notes: appointment.notes || '',
      reminder: appointment.reminder|| true,
      reminderTime: appointment.reminderTime||60,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDog) return;
    setLoading(true);

    try {
        const appointmentData = {
      ...formData,
      dogId: currentDog.id,
      date: new Date(formData.date),
    };
      if (selectedEvent) {
      //console.log("Update payload:", appointmentData);

      await updateAppointment(currentDog.id, selectedEvent.id, appointmentData);
      } else {
      await createAppointment(appointmentData);
         // Schedule local reminder if enabled
        if (formData.reminder) {
          await scheduleReminder({
            title: formData.title,
            date: formData.date,
            time: formData.time,
            reminderTime: formData.reminderTime,
          });
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentDog || !selectedEvent) return;
    try {
      await deleteAppointment(currentDog.id, selectedEvent.id);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  };

  if (!currentDog) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <p className="text-gray-500">{t('Please select a dog to view calendar')}</p>
        </Card>
      </div>
    );
  }

  return (
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t('Calendar')} - {currentDog.name}
          </h2>
          <Button onClick={openAddModal} size="sm">
            <PlusCircle size={16} className="mr-1" />
            {t('Add Event')}
          </Button>
        </div>

        {/* Appointment List */}
        {dogAppointments.length === 0 ? (
          <Card className="text-center py-8">
            <CalendarIcon size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 mb-4">{t('No appointments scheduled')}</p>
            <Button onClick={openAddModal}>{t('Schedule First Appointment')}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedAppointments).map(([dateKey, dayAppointments]) => (
              <div key={dateKey}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {getDateLabel(new Date(dateKey))}
                </h3>
                <div className="space-y-2">
                  {dayAppointments.map((appointment) => (
                    <Card key={appointment.id} onClick={() => openEditModal(appointment)} className="cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                              {getTypeLabel(appointment.type)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>{appointment.time}</span>
                            {appointment.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin size={14} />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedEvent ? t('Edit Appointment') : t('Add Appointment')}
          className="max-w-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t('Title')} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Type')}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Appointment['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="vet">{t('Vet')}</option>
                <option value="grooming">{t('Grooming')}</option>
                <option value="training">{t('Training')}</option>
                <option value="walk">{t('Walk')}</option>
                <option value="feeding">{t('Feeding')}</option>
                <option value="other">{t('Other')}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" label={t('Date')} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              <Input type="time" label={t('Time')} value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
            </div>
            <Input label={t('Location')} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Notes')}</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{t('Cancel')}</Button>
              {selectedEvent && (
                <Button type="button" variant="danger" onClick={handleDelete}>{t('Delete')}</Button>
              )}
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? t('Saving...') : t('Save')}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
};
