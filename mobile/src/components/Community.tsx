import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Users, MessageCircle, Calendar, MapPin, Heart, Share } from 'lucide-react';
import { useTranslation } from 'react-i18next';


interface Post {
  id: string;
  author: string;
  dogName: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: Date;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  description: string;
  attendees: number;
}

export const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const { t } = useTranslation();

  // Mock data - in a real app, this would come from a backend
  const mockPosts: Post[] = [
    {
      id: '1',
      author: 'Sarah M.',
      dogName: 'Max',
      content: 'Max finally learned to sit and stay! So proud of my little guy. Any tips for teaching "come" command?',
      likes: 12,
      comments: 5,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: '2',
      author: 'John D.',
      dogName: 'Luna',
      content: 'Beautiful day at the dog park! Luna made so many new friends. She\'s getting much better with socialization.',
      likes: 8,
      comments: 3,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: '3',
      author: 'Emily R.',
      dogName: 'Charlie',
      content: 'Question for other Golden Retriever owners: How often do you brush your dog? Charlie seems to shed so much!',
      likes: 15,
      comments: 8,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Weekend Dog Park Meetup',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      location: 'Central Park Dog Run',
      description: 'Join us for a fun weekend meetup! Great for socialization and making new friends.',
      attendees: 15,
    },
    {
      id: '2',
      title: 'Basic Obedience Training Workshop',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      location: 'Community Center',
      description: 'Professional trainer will teach basic commands. Perfect for new dog owners!',
      attendees: 8,
    },
    {
      id: '3',
      title: 'Dog Adoption Fair',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      location: 'City Animal Shelter',
      description: 'Help local dogs find their forever homes. Volunteers needed!',
      attendees: 25,
    },
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatEventDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString();
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) return;
    
    // In a real app, this would send to backend
    console.log('Creating post:', postContent);
    setPostContent('');
    setIsPostModalOpen(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{t('Community')}</h2>
        <Button onClick={() => setIsPostModalOpen(true)} size="sm">
          <MessageCircle size={16} className="mr-1" />
          {t('New Post')}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'posts'
              ? 'bg-white text-blueblue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageCircle size={16} className="inline mr-1" />
          {t('Posts')}
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-white text-blueblue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar size={16} className="inline mr-1" />
          {t('Events')}
        </button>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {mockPosts.map((post) => (
            <Card key={post.id}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blueblue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blueblue-600">
                      {post.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{post.author}</p>
                    <p className="text-xs text-gray-500">
                      with {post.dogName} • {formatTimeAgo(post.timestamp)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">{post.content}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart size={16} />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blueblue-500 transition-colors">
                      <MessageCircle size={16} />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors">
                    <Share size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {mockEvents.map((event) => (
            <Card key={event.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users size={14} />
                    <span>{event.attendees}</span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{event.description}</p>
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1">
                   {t('Join Event')}
                  </Button>
                  <Button variant="outline" size="sm">
                    {t('Share')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title={t('Create New Post')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
             {t('Whats on your mind?')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueblue-500 focus:border-transparent"
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={t('Share your thoughts, ask questions, or tell us about your dogs adventures...')}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPostModalOpen(false)}
            >
              {t('Cancel')}
            </Button>
            <Button onClick={handleCreatePost} className="flex-1">
             {t('Post')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};