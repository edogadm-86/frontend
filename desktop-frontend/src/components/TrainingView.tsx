import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { TrainingManagement } from './TrainingManagement';
import { Dog } from '../types';

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

      {/* YouTube Training Resources */}
      <Card variant="gradient" className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Award className="mr-2 text-primary-500" />
          Training Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Basic Obedience Training",
              description: "Learn the fundamentals of dog training",
              videoId: "4dbzPoB7AKE",
              duration: "15:30",
              level: "Beginner"
            },
            {
              title: "House Training Your Puppy",
              description: "Complete guide to potty training",
              videoId: "NKIlzy7YQJ8",
              duration: "12:45",
              level: "Beginner"
            },
            {
              title: "Advanced Tricks Training",
              description: "Teach your dog amazing tricks",
              videoId: "Gs0g2lK1kRI",
              duration: "18:20",
              level: "Advanced"
            },
            {
              title: "Leash Training Techniques",
              description: "Stop pulling and walk nicely",
              videoId: "sFgtqgiAKoQ",
              duration: "10:15",
              level: "Intermediate"
            },
            {
              title: "Socialization Training",
              description: "Help your dog interact with others",
              videoId: "3dWw9GLcOeA",
              duration: "14:30",
              level: "Beginner"
            },
            {
              title: "Agility Training Basics",
              description: "Introduction to dog agility",
              videoId: "Gs0g2lK1kRI",
              duration: "20:45",
              level: "Advanced"
            }
          ].map((video, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    video.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    video.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {video.level}
                  </span>
                </div>
                <button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </button>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {video.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                  className="w-full"
                >
                  Watch on YouTube
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};