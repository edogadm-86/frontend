import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { Appointment } from '../types';
import { PageContainer } from "./ui/PageContainer";

import { PlusCircle, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format, isToday, isTomorrow, isThisWeek, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

export const Calendar: React.FC = () => {
  const { currentDog, appointments, createAppointment } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const dogAppointments = appointments.filter(a => a.dogId === currentDog?.id);
  const { t } = useTranslation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!currentDog) return;

    const appointmentData = {
      dogId: currentDog.id,
      title: formData.title,
      type: formData.type,
      date: new Date(formData.date),
      time: formData.time,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
      reminder: formData.reminder,
      reminderTime: formData.reminderTime,
    };

    try {
      await createAppointment(appointmentData);
      setIsModalOpen(false);
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
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

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
      case 'vet': return 'Vet';
      case 'grooming': return 'Grooming';
      case 'training': return 'Training';
      case 'walk': return 'Walk';
      case 'feeding': return 'Feeding';
      default: return 'Other';
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM dd, yyyy');
  };

  const groupedAppointments = dogAppointments
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((groups, appointment) => {
      const dateKey = format(appointment.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
      return groups;
    }, {} as Record<string, Appointment[]>);

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
    <PageContainer>
     <div className="p-4 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full min-w-full">
    <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {t('Calendar')} - {currentDog.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <PlusCircle size={16} className="mr-1" />
          {t('Add Event')}
        </Button>
      </div>

      {dogAppointments.length === 0 ? (
        <Card className="text-center py-8">
          <CalendarIcon size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500 mb-4">{t('No appointments scheduled')}</p>
          <Button onClick={() => setIsModalOpen(true)}>{t('Schedule First Appointment')}</Button>
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
                  <Card key={appointment.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                            {getTypeLabel(appointment.type)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{appointment.time}</span>
                          </div>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Appointment"
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('Title')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t('e.g., Vet checkup, Grooming')}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Type')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueblue-500 focus:border-transparent"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Appointment['type'] })}
              required
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
            <Input
              label={t('Date')}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label={t('Time')}
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <Input
            label={t('Location (optional)')}
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder={t('e.g., City Vet Clinic')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Notes (optional)')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueblue-500 focus:border-transparent"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('Any additional notes...')}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reminder"
              checked={formData.reminder}
              onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
              className="rounded border-gray-300 text-blueblue-500 focus:ring-blueblue-500"
            />
            <label htmlFor="reminder" className="text-sm text-gray-700">
              {t('Set reminder')}
            </label>
          </div>
          {formData.reminder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Remind me (minutes before)')}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueblue-500 focus:border-transparent"
                value={formData.reminderTime}
                onChange={(e) => setFormData({ ...formData, reminderTime: parseInt(e.target.value) })}
              >
                <option value={15}>15 {t('minutes')}</option>
                <option value={30}>30 {t('minutes')}</option>
                <option value={60}>1 {t('hour')}</option>
                <option value={120}>2 {t('hour')}</option>
                <option value={1440}>1 {t('day')}</option>
              </select>
            </div>
          )}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('Adding...') : t('Add Appointment')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
</PageContainer>
  );
};