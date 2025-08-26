import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Bell } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';

interface AppointmentManagementProps {
  dogId: string;
  dogName: string;
}

interface Appointment {
  id: string;
  title: string;
  type: 'vet' | 'grooming' | 'training' | 'walk' | 'feeding' | 'other';
  date: string;
  time: string;
  location?: string;
  notes?: string;
  reminder: boolean;
  reminder_time: number;
}

export const AppointmentManagement: React.FC<AppointmentManagementProps> = ({
  dogId,
  dogName,
}) => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'vet' as Appointment['type'],
    date: '',
    time: '',
    location: '',
    notes: '',
    reminder: true,
    reminder_time: 60,
  });

  useEffect(() => {
    loadAppointments();
  }, [dogId]);

  const loadAppointments = async () => {
    try {
      const response = await apiClient.getAppointments(dogId);
      setAppointments(response.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const handleCreate = () => {
    setEditingAppointment(null);
    setFormData({
      title: '',
      type: 'vet',
      date: '',
      time: '',
      location: '',
      notes: '',
      reminder: true,
      reminder_time: 60,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
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
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAppointment) {
        await apiClient.updateAppointment(dogId, editingAppointment.id, formData);
      } else {
        await apiClient.createAppointment(dogId, formData);
      }
      await loadAppointments();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await apiClient.deleteAppointment(dogId, appointmentId);
        await loadAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vet': return 'bg-blue-100 text-blue-800';
      case 'grooming': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'walk': return 'bg-orange-100 text-orange-800';
      case 'feeding': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments
    .filter(a => new Date(a.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('appointments')} - {dogName}
          </h3>
          <p className="text-gray-600">Schedule and manage appointments</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          {t('scheduleAppointment')}
        </Button>
      </div>

      {appointments.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No appointments scheduled</p>
          <Button onClick={handleCreate}>
            {t('scheduleAppointment')}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Upcoming Appointments</h4>
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(appointment.type)}`}>
                              {appointment.type}
                            </span>
                            {appointment.reminder && (
                              <Bell size={16} className="text-gray-400" />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar size={16} className="mr-2" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock size={16} className="mr-2" />
                              {appointment.time}
                            </div>
                            {appointment.location && (
                              <div className="flex items-center text-gray-600 col-span-2">
                                <MapPin size={16} className="mr-2" />
                                {appointment.location}
                              </div>
                            )}
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Past Appointments</h4>
              <div className="grid gap-4">
                {pastAppointments.slice(0, 5).map((appointment) => (
                  <Card key={appointment.id} className="opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar size={24} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-700">{appointment.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(appointment.type)}`}>
                              {appointment.type}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-gray-500">
                              <Calendar size={16} className="mr-2" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center text-gray-500">
                              <Clock size={16} className="mr-2" />
                              {appointment.time}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Appointment['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              Enable reminder
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
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('loading') : t('save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};