import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { ChatBot } from './ChatBot';
import { TrainingSession } from '../types';
import { PlusCircle, Award, BookOpen, TrendingUp, Bot, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { PageContainer } from './ui/PageContainer';

export const TrainingTracker: React.FC = () => {
  const { currentDog, trainingSessions, createTrainingSession } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    duration: '',
    commands: '',
    progress: 'good' as TrainingSession['progress'],
    notes: '',
    behaviorNotes: '',
  });

  const { t } = useTranslation();
  const dogTrainingSessions = trainingSessions.filter(s => s.dogId === currentDog?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!currentDog) return;

    const sessionData = {
      dogId: currentDog.id,
      date: new Date(formData.date),
      duration: parseInt(formData.duration),
      commands: formData.commands.split(',').map(cmd => cmd.trim()).filter(cmd => cmd),
      progress: formData.progress,
      notes: formData.notes,
      behaviorNotes: formData.behaviorNotes || undefined,
    };

    try {
      await createTrainingSession(sessionData);
      setIsModalOpen(false);
      setFormData({
        date: '',
        duration: '',
        commands: '',
        progress: 'good',
        notes: '',
        behaviorNotes: '',
      });
    } catch (error) {
      console.error('Error creating training session:', error);
    } finally {
      setLoading(false);
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
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'needs-work': return 'Needs Work';
      default: return 'Unknown';
    }
  };

  const getAllCommands = () => {
    const allCommands = dogTrainingSessions.flatMap(session => session.commands);
    return [...new Set(allCommands)].sort();
  };

  const getTotalTrainingTime = () => {
    return dogTrainingSessions.reduce((total, session) => total + session.duration, 0);
  };

  if (!currentDog) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <p className="text-gray-500">Please select a dog to view training records</p>
        </Card>
      </div>
    );
  }

  const allCommands = getAllCommands();
  const totalTime = getTotalTrainingTime();

  return (
       <PageContainer>
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Training - {currentDog.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500">
          <PlusCircle size={16} className="mr-1" />
          Add Session
        </Button>
      </div>
       <ChatBot dogName={currentDog.name} />
      {/* Training Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp size={18} className="text-blueblue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-lg font-semibold">{dogTrainingSessions.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg">
          <div className="flex items-center space-x-2">
            <Award size={18} className="text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Training Time</p>
              <p className="text-lg font-semibold">{totalTime} min</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Commands Learned */}
      {allCommands.length > 0 && (
        <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <BookOpen size={16} className="mr-1" />
            Commands Learned ({allCommands.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {allCommands.map((command) => (
              <span
                key={command}
                className="px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-sm rounded-full"
              >
                {command}
              </span>
            ))}
          </div>
         
        </Card>
      )}

     
        
    

      {/* Training Sessions */}
      {dogTrainingSessions.length === 0 ? (
        <Card className="text-center py-8 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg">
          <Award size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500 mb-4">No training sessions yet</p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500">
            Start First Session
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Recent Sessions</h3>
          {dogTrainingSessions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((session) => (
              <Card key={session.id} className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 shadow-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {format(session.date, 'MMM dd, yyyy')}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(session.progress)}`}>
                        {getProgressLabel(session.progress)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {session.duration} min
                      </div>
                      <div className="flex items-center">
                        <BookOpen size={12} className="mr-1" />
                        {session.commands.length} commands
                      </div>
                    </div>
                    {session.commands.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {session.commands.slice(0, 3).map((command, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {command}
                            </span>
                          ))}
                          {session.commands.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{session.commands.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {session.notes && (
                      <p className="text-sm text-gray-600">
                        <strong>Notes:</strong> {session.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Training Session"
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
          </div>
          <Input
            label="Commands Practiced"
            value={formData.commands}
            onChange={(e) => setFormData({ ...formData, commands: e.target.value })}
            placeholder="sit, stay, come (separate with commas)"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueblue-500 focus:border-transparent"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: e.target.value as TrainingSession['progress'] })}
              required
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs-work">Needs Work</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueblue-500 focus:border-transparent"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What did you work on? How did it go?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Behavior Notes (optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueblue-500 focus:border-transparent"
              rows={2}
              value={formData.behaviorNotes}
              onChange={(e) => setFormData({ ...formData, behaviorNotes: e.target.value })}
              placeholder="Any behavioral observations..."
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500" disabled={loading}>
              {loading ? 'Adding...' : 'Add Session'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </PageContainer>
  );
};