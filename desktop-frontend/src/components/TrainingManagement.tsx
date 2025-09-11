import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Award, Calendar, Clock, TrendingUp } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';

interface TrainingManagementProps {
  dogId: string;
  dogName: string;
}

interface TrainingSession {
  id: string;
  date: string;
  duration: number;
  commands: string[];
  progress: 'excellent' | 'good' | 'fair' | 'needs-work';
  notes: string;
  behavior_notes?: string;
}

export const TrainingManagement: React.FC<TrainingManagementProps> = ({
  dogId,
  dogName,
}) => {
  const { t } = useTranslation();
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    duration: 30,
    commands: '',
    progress: 'good' as TrainingSession['progress'],
    notes: '',
    behavior_notes: '',
  });

  useEffect(() => {
    loadTrainingSessions();
  }, [dogId]);

  const loadTrainingSessions = async () => {
    try {
      const response = await apiClient.getTrainingSessions(dogId);
      setTrainingSessions(response.trainingSessions);
    } catch (error) {
      console.error('Error loading training sessions:', error);
    }
  };

  const handleCreate = () => {
    setEditingSession(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      duration: 30,
      commands: '',
      progress: 'good',
      notes: '',
      behavior_notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (session: TrainingSession) => {
    setEditingSession(session);
    setFormData({
      date: new Date(session.date).toISOString().split('T')[0], // <-- FIX
      duration: session.duration,
      commands: session.commands.join(', '),
      progress: session.progress,
      notes: session.notes,
      behavior_notes: session.behavior_notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const sessionData = {
      ...formData,
      commands: formData.commands.split(',').map(cmd => cmd.trim()).filter(cmd => cmd),
    };

    try {
      if (editingSession) {
        await apiClient.updateTrainingSession(dogId, editingSession.id, sessionData);
      } else {
        await apiClient.createTrainingSession(dogId, sessionData);
      }
      await loadTrainingSessions();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving training session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (window.confirm(t('areSureDeleteRecord'))) {
      try {
        await apiClient.deleteTrainingSession(dogId, sessionId);
        await loadTrainingSessions();
      } catch (error) {
        console.error('Error deleting training session:', error);
      }
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'needs-work': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case 'excellent': return <TrendingUp size={16} className="text-green-600" />;
      case 'good': return <TrendingUp size={16} className="text-blue-600" />;
      case 'fair': return <TrendingUp size={16} className="text-yellow-600" />;
      case 'needs-work': return <TrendingUp size={16} className="text-red-600" />;
      default: return <TrendingUp size={16} className="text-gray-600" />;
    }
  };

  const totalSessions = trainingSessions.length;
  const totalDuration = trainingSessions.reduce((sum, session) => sum + session.duration, 0);
  const averageProgress = trainingSessions.length > 0 
    ? trainingSessions.filter(s => s.progress === 'excellent' || s.progress === 'good').length / trainingSessions.length * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          {t('addTrainingSession')}
        </Button>
      </div>

      {/* Training Stats */}
      {trainingSessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
                <p className="text-sm text-gray-600">{t('totalSessions')}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round(totalDuration / 60)}h</p>
                <p className="text-sm text-gray-600">{t('totalTime')}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averageProgress)}%</p>
                <p className="text-sm text-gray-600">{t('successRate')}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {trainingSessions.length === 0 ? (
        <Card className="text-center py-16">
          <Award size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">{t('noTrainingSessionsRecorded')}</p>
          <Button onClick={handleCreate}>
            {t('addTrainingSession')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {trainingSessions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((session) => (
              <Card key={session.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award size={24} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{t('trainingSession')}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getProgressColor(session.progress)}`}>
                          {session.progress}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          {formatDate(session.date)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-2" />
                          {session.duration} {t('minutes')}
                        </div>
                      </div>
                      {session.commands.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">{t('commandsPracticed')}</p>
                          <div className="flex flex-wrap gap-1">
                            {session.commands.map((command, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {command}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-2">{session.notes}</p>
                      {session.behavior_notes && (
                        <p className="text-sm text-gray-500 italic">
                          {t('behaviorNotes')}: {session.behavior_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(session)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSession ? t('editTrainingSession') : t('addTrainingSession')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('date')}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label={t('duration')}
              type="number"
              value={formData.duration.toString()}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              min="1"
              required
            />
          </div>
          <Input
            label={t('commandsPracticed')}
            value={formData.commands}
            onChange={(e) => setFormData({ ...formData, commands: e.target.value })}
            placeholder={t('commands')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('progress')}
            </label>
            <select
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: e.target.value as TrainingSession['progress'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="excellent">{t('excellent')}</option>
              <option value="good">{t('good')}</option>
              <option value="fair">{t('fair')}</option>
              <option value="needs-work">{t('needsWork')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('behaviorNotes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('behaviorNotesDesc')}
            </label>
            <textarea
              value={formData.behavior_notes}
              onChange={(e) => setFormData({ ...formData, behavior_notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
            />
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