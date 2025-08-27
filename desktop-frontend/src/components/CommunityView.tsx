import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar,
  MapPin,
  Clock,
  User,
  Image,
  Video,
  FileText,
  HelpCircle,
  Lightbulb,
  Camera,
  ArrowLeft
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';

interface CommunityViewProps {
  onNavigate: (view: string) => void;
}

interface Post {
  id: string;
  title: string;
  content: string;
  post_type: 'story' | 'question' | 'tip' | 'event' | 'photo' | 'video';
  author_name: string;
  dog_name?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  image_url?: string;
  video_url?: string;
  tags?: string[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'meetup' | 'training' | 'competition' | 'adoption' | 'fundraiser' | 'other';
  location?: string;
  start_date: string;
  end_date?: string;
  organizer_name: string;
  participants_count: number;
  max_participants?: number;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    post_type: 'story' as Post['post_type'],
    image_url: '',
    video_url: '',
    tags: '',
  });
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    event_type: 'meetup' as Event['event_type'],
    location: '',
    start_date: '',
    end_date: '',
    max_participants: '',
  });

  useEffect(() => {
    if (activeTab === 'posts') {
      loadPosts();
    } else {
      loadEvents();
    }
  }, [activeTab]);

  const loadPosts = async () => {
    try {
      const response = await apiClient.getPosts();
      setPosts(response.posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await apiClient.getEvents();
      setEvents(response.events);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.createPost({
        ...postFormData,
        tags: postFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      });
      await loadPosts();
      setShowPostModal(false);
      setPostFormData({
        title: '',
        content: '',
        post_type: 'story',
        image_url: '',
        video_url: '',
        tags: '',
      });
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.createEvent({
        ...eventFormData,
        max_participants: eventFormData.max_participants ? parseInt(eventFormData.max_participants) : null,
      });
      await loadEvents();
      setShowEventModal(false);
      setEventFormData({
        title: '',
        description: '',
        event_type: 'meetup',
        location: '',
        start_date: '',
        end_date: '',
        max_participants: '',
      });
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await apiClient.likePost(postId);
      await loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return <FileText size={16} className="text-blue-600" />;
      case 'question': return <HelpCircle size={16} className="text-purple-600" />;
      case 'tip': return <Lightbulb size={16} className="text-yellow-600" />;
      case 'photo': return <Camera size={16} className="text-green-600" />;
      case 'video': return <Video size={16} className="text-red-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meetup': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'competition': return 'bg-purple-100 text-purple-800';
      case 'adoption': return 'bg-pink-100 text-pink-800';
      case 'fundraiser': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/50 transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-bold gradient-text">{t('community')}</h2>
            <p className="text-gray-600">Connect with other dog owners</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowPostModal(true)} icon={<Plus size={16} />}>
            Create Post
          </Button>
          <Button onClick={() => setShowEventModal(true)} variant="outline" icon={<Calendar size={16} />}>
            Create Event
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
        <button
          onClick={() => setActiveTab('posts')}
          className={`tab-button flex items-center space-x-2 ${activeTab === 'posts' ? 'active' : ''}`}
        >
          <Users size={16} />
          <span>Posts</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`tab-button flex items-center space-x-2 ${activeTab === 'events' ? 'active' : ''}`}
        >
          <Calendar size={16} />
          <span>Events</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'posts' ? (
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="text-center py-16">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No posts yet</p>
              <Button onClick={() => setShowPostModal(true)}>
                Create First Post
              </Button>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} variant="gradient">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{post.author_name}</h4>
                      {post.dog_name && (
                        <span className="text-sm text-gray-500">with {post.dog_name}</span>
                      )}
                      <span className="px-2 py-1 bg-white/50 rounded-full text-xs flex items-center space-x-1">
                        {getPostTypeIcon(post.post_type)}
                        <span>{post.post_type}</span>
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                    
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post image"
                        className="w-full max-w-md h-48 object-cover rounded-xl mb-4"
                      />
                    )}
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Heart size={16} />
                        <span>{post.likes_count}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle size={16} />
                        <span>{post.comments_count}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 size={16} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {events.length === 0 ? (
            <Card className="text-center py-16">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No events yet</p>
              <Button onClick={() => setShowEventModal(true)}>
                Create First Event
              </Button>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} variant="gradient">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Calendar size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-2" />
                          {formatDate(event.start_date)}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin size={16} className="mr-2" />
                            {event.location}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <User size={16} className="mr-2" />
                          {event.organizer_name}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users size={16} className="mr-2" />
                          {event.participants_count}
                          {event.max_participants && ` / ${event.max_participants}`} participants
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Join Event
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title="Create New Post"
        size="lg"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <Input
            label="Title"
            value={postFormData.title}
            onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={postFormData.post_type}
              onChange={(e) => setPostFormData({ ...postFormData, post_type: e.target.value as Post['post_type'] })}
              className="input-field"
              required
            >
              <option value="story">Story</option>
              <option value="question">Question</option>
              <option value="tip">Tip</option>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={postFormData.content}
              onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
              className="input-field"
              rows={4}
              required
            />
          </div>
          <Input
            label="Image URL (optional)"
            value={postFormData.image_url}
            onChange={(e) => setPostFormData({ ...postFormData, image_url: e.target.value })}
          />
          <Input
            label="Tags (comma separated)"
            value={postFormData.tags}
            onChange={(e) => setPostFormData({ ...postFormData, tags: e.target.value })}
            placeholder="training, puppy, tips"
          />
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowPostModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="Create New Event"
        size="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Event Title"
            value={eventFormData.title}
            onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              value={eventFormData.event_type}
              onChange={(e) => setEventFormData({ ...eventFormData, event_type: e.target.value as Event['event_type'] })}
              className="input-field"
              required
            >
              <option value="meetup">Meetup</option>
              <option value="training">Training</option>
              <option value="competition">Competition</option>
              <option value="adoption">Adoption</option>
              <option value="fundraiser">Fundraiser</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={eventFormData.description}
              onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
              className="input-field"
              rows={3}
              required
            />
          </div>
          <Input
            label="Location"
            value={eventFormData.location}
            onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="datetime-local"
              value={eventFormData.start_date}
              onChange={(e) => setEventFormData({ ...eventFormData, start_date: e.target.value })}
              required
            />
            <Input
              label="End Date (optional)"
              type="datetime-local"
              value={eventFormData.end_date}
              onChange={(e) => setEventFormData({ ...eventFormData, end_date: e.target.value })}
            />
          </div>
          <Input
            label="Max Participants (optional)"
            type="number"
            value={eventFormData.max_participants}
            onChange={(e) => setEventFormData({ ...eventFormData, max_participants: e.target.value })}
            min="1"
          />
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEventModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};