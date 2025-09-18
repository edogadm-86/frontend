import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { ChatBot } from './ChatBot';
import { TrainingSession } from '../types';
import { PlusCircle, Award, BookOpen, TrendingUp, Clock, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { PageContainer } from './ui/PageContainer';
import { apiClient } from '../lib/api';

export const TrainingTracker: React.FC = () => {
  const { currentDog, trainingSessions, createTrainingSession } = useApp(); // ✅ keep the original signature
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [localSessions, setLocalSessions] = useState(trainingSessions);
  React.useEffect(() => {
  setLocalSessions(trainingSessions);
}, [trainingSessions]);

  const [formData, setFormData] = useState({
    date: '',
    duration: '',
    commands: '',
    progress: 'good' as TrainingSession['progress'],
    notes: '',
    behaviorNotes: '',
  });

  const { t } = useTranslation();
  const dogTrainingSessions = localSessions.filter(s => s.dogId === currentDog?.id);  
  const resetForm = () => {
    setFormData({
      date: '',
      duration: '',
      commands: '',
      progress: 'good',
      notes: '',
      behaviorNotes: '',
    });
    setEditingSession(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDog) return;
    setLoading(true);

    const payload = {
      dogId: currentDog.id,
      date: new Date(formData.date), // JSON.stringify will ISO this
      duration: parseInt(formData.duration, 10),
      commands: formData.commands.split(',').map(c => c.trim()).filter(Boolean),
      progress: formData.progress,
      notes: formData.notes,
      behavior_notes: formData.behaviorNotes || undefined,
    };

    try {
      if (editingSession) {
        // ✅ call API client directly for update
        const updated = await apiClient.updateTrainingSession(currentDog.id, editingSession.id, payload);

        // Replace session locally
        setLocalSessions(prev =>
          prev.map(s => s.id === editingSession.id ? { ...s, ...updated.trainingSession } : s)
        );    
        } else {
        // ✅ use your working context method (no dogId param)
        await createTrainingSession(payload);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving training session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (session: TrainingSession) => {
    setEditingSession(session);
    setFormData({
      date: format(new Date(session.date), 'yyyy-MM-dd'),
      duration: String(session.duration),
      commands: session.commands.join(', '),
      progress: session.progress,
      notes: session.notes || '',
      behaviorNotes: session.behaviorNotes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (session: TrainingSession) => {
    if (!currentDog) return;
    if (window.confirm(t('confirmDeleteTrainingSession'))) {
      try {
        await apiClient.deleteTrainingSession(currentDog.id, session.id);
        setLocalSessions(prev => prev.filter(s => s.id !== session.id));

      } catch (error) {
        console.error('Error deleting training session:', error);
      }
    }
  };

  const getProgressColor = (progress: TrainingSession['progress']) => {
    switch (progress) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'needs-work': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressLabel = (progress: TrainingSession['progress']) => {
    switch (progress) {
      case 'excellent': return t('excellent');
      case 'good': return t('good');
      case 'fair': return t('fair');
      case 'needs-work': return t('needsWork');
      default: return t('unknown');
    }
  };

  const totalSessions = dogTrainingSessions.length;
  const totalTime = dogTrainingSessions.reduce((sum, s) => sum + s.duration, 0);
  const successRate = totalSessions > 0
    ? Math.round(
        (dogTrainingSessions.filter(s => s.progress === 'excellent' || s.progress === 'good').length / totalSessions) * 100
      )
    : 0;

  if (!currentDog) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <p className="text-gray-500">{t('pleaseSelectDog')}</p>
        </Card>
      </div>
    );
  }

  return (
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t('Training')} – {currentDog.name}
          </h2>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} size="sm">
            <PlusCircle size={16} className="mr-1" />
            {t('addTrainingSession')}
          </Button>
        </div>

        <ChatBot dogName={currentDog.name} />

        {/* Stats */}
        {dogTrainingSessions.length > 0 && (
          <div className="grid grid-cols-3 gap-3 w-full">
            <Card className="w-full h-full flex flex-col items-center p-4 text-center">
              <Award size={28} className="text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">{t('totalSessions')}</p>
              <p className="text-xl font-bold">{totalSessions}</p>
            </Card>

           <Card className="w-full h-full flex flex-col items-center p-4 text-center">
              <Clock size={28} className="text-green-600 mb-2" />
              <p className="text-sm text-gray-600">{t('totalTime')}</p>
              <p className="text-xl font-bold">{Math.round(totalTime / 60)}h</p>
            </Card>

            <Card className="w-full h-full flex flex-col items-center p-4 text-center">
              <TrendingUp size={28} className="text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">{t('successRate')}</p>
              <p className="text-xl font-bold">{successRate}%</p>
            </Card>
          </div>
        )}

        {/* Sessions */}
        {dogTrainingSessions.length === 0 ? (
          <Card className="w-full">
            <Award size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 mb-4">{t('noTrainingSessionsRecorded')}</p>
            <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
              {t('startFirstSession')}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">{t('recentSessions')}</h3>
            {dogTrainingSessions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(session => (
                <Card key={session.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {format(new Date(session.date), 'MMM dd, yyyy')}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(session.progress)}`}
                        >
                          {getProgressLabel(session.progress)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {session.duration} {t('minutes')}
                        </div>
                        <div className="flex items-center">
                          <BookOpen size={12} className="mr-1" />
                          {session.commands.length} {t('commands')}
                        </div>
                      </div>
                      {session.commands.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {session.commands.map((cmd, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {cmd}
                            </span>
                          ))}
                        </div>
                      )}
                      {session.notes && (
                        <p className="text-sm text-gray-600">{session.notes}</p>
                      )}
                      {session.behaviorNotes && (
                        <p className="text-sm text-gray-500 italic">
                          {t('behaviorNotes')}: {session.behaviorNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(session)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(session)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSession ? t('editTrainingSession') : t('addTrainingSession')}
          className="max-w-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('date')}
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <Input
                label={t('duration')}
                type="number"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
            <Input
              label={t('commandsPracticed')}
              value={formData.commands}
              onChange={e => setFormData({ ...formData, commands: e.target.value })}
              placeholder={t('commandsPlaceholder')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('progress')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={formData.progress}
                onChange={e => setFormData({ ...formData, progress: e.target.value as TrainingSession['progress'] })}
                required
              >
                <option value="excellent">{t('excellent')}</option>
                <option value="good">{t('good')}</option>
                <option value="fair">{t('fair')}</option>
                <option value="needs-work">{t('needsWork')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('sessionNotes')}</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('behaviorNotes')}</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
                value={formData.behaviorNotes}
                onChange={e => setFormData({ ...formData, behaviorNotes: e.target.value })}
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? t('loading') : t('Save')}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
};
