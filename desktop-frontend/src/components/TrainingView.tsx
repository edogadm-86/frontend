import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { TrainingManagement } from './TrainingManagement';
import { Dog } from '../types';
import { Card } from './ui/Card';


interface TrainingViewProps {
  currentDog: Dog | null;
  dogs: Dog[];
  onNavigate: (view: string) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  currentDog,
  dogs,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [openVideoId, setOpenVideoId] = React.useState<string | null>(null);

  if (!currentDog) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Award size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Dog Selected
          </h2>
          <p className="text-gray-500 mb-6">
            Please select a dog from the sidebar to manage training sessions
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('training')}</h2>
            <p className="text-gray-600">Track training progress for {currentDog.name}</p>
          </div>
        </div>
      </div>

      {/* Training Management */}
      <TrainingManagement
        dogId={currentDog.id}
        dogName={currentDog.name}
      />

      {/* Training Assistant and Resources Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* AI Training Assistant */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Bot className="mr-2 text-purple-500" />
            AI Training Assistant
          </h3>
          <ChatBot dogName={currentDog.name} />
        </div>

        {/* Training Resources */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="mr-2 text-primary-500" />
            Training Resources
          </h3>
          <Card variant="gradient" className="h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {[
                {
                  title: "Basic Obedience Training",
                  description: "Learn the fundamentals of dog training",
                  videoId: "jFMA5ggFsXU",
                  duration: "5:56",
                  level: "Beginner"
                },
                {
                  title: "House Training Your Puppy",
                  description: "Complete guide to potty training",
                  videoId: "Pptoq7avEKM",
                  duration: "4:50",
                  level: "Beginner"
                },
                {
                  title: "Advanced Tricks Training",
                  description: "Teach your dog amazing tricks",
                  videoId: "K1co_bZfs6w",
                  duration: "8:36",
                  level: "Advanced"
                },
                {
                  title: "Leash Training Techniques",
                  description: "Stop pulling and walk nicely",
                  videoId: "tSvfVs4LKyg",
                  duration: "9:14",
                  level: "Intermediate"
                },
                {
                  title: "Socialization Training",
                  description: "Help your dog interact with others",
                  videoId: "ysxjfhmj4c0",
                  duration: "6:18",
                  level: "Beginner"
                },
                {
                  title: "Agility Training Basics",
                  description: "Introduction to dog agility",
                  videoId: "vkxggodZzqc",
                  duration: "4:04",
                  level: "Advanced"
                }
              ].map((video, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex space-x-4 p-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white px-1 py-0.5 rounded text-xs">
                        {video.duration}
                      </div>
                      <div className="absolute top-1 left-1">
                        <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                          video.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                          video.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {video.level}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors truncate">
                        {video.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                      >
                        Watch
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};