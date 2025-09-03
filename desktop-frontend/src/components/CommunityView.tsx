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
  ArrowLeft,
  Send,
  UserPlus,
  MoreHorizontal,
  Bookmark,
  Flag,
  ThumbsUp,
  Smile,
  Gift,
  Zap
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { FileUpload } from './ui/FileUpload';
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

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'groups'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
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
    if (activeTab === 'feed') {
      loadPosts();
    } else if (activeTab === 'events') {
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

  const loadComments = async (postId: string) => {
    try {
      const response = await apiClient.getPostComments(postId);
      setComments(prev => ({ ...prev, [postId]: response.comments }));
    } catch (error) {
      console.error('Error loading comments:', error);
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
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
      await loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      await apiClient.addPostComment(postId, content);
      await loadComments(postId);
      await loadPosts(); // Refresh to update comment count
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await apiClient.joinEvent(eventId);
      await loadEvents();
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const toggleComments = async (postId: string) => {
    const isShowing = showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: !isShowing }));
    
    if (!isShowing && !comments[postId]) {
      await loadComments(postId);
    }
  };

  const handlePostFileUploaded = (fileUrl: string) => {
    setPostFormData({ ...postFormData, image_url: fileUrl });
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
      case 'meetup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'training': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'competition': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'adoption': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'fundraiser': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-3xl font-bold gradient-text">{t('community')}</h2>
              <p className="text-gray-600 dark:text-gray-300">Connect with fellow dog lovers</p>
            </div>
          </div>
        </div>

        {/* Social Media Style Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <Card variant="gradient" className="sticky top-6">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'feed' 
                      ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Users size={20} />
                  <span className="font-medium">News Feed</span>
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'events' 
                      ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Calendar size={20} />
                  <span className="font-medium">Events</span>
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'groups' 
                      ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Users size={20} />
                  <span className="font-medium">Groups</span>
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    onClick={() => setShowPostModal(true)} 
                    className="w-full justify-start" 
                    variant="outline"
                    icon={<Plus size={16} />}
                  >
                    Create Post
                  </Button>
                  <Button 
                    onClick={() => setShowEventModal(true)} 
                    className="w-full justify-start" 
                    variant="outline"
                    icon={<Calendar size={16} />}
                  >
                    Create Event
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Create Post Card */}
                <Card variant="gradient" className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <User size={20} className="text-white" />
                    </div>
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="flex-1 text-left p-4 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-gray-500 dark:text-gray-400">What's on your mind about your dog?</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => setShowPostModal(true)}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Camera size={20} />
                      <span>Photo</span>
                    </button>
                    <button 
                      onClick={() => setShowPostModal(true)}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      <HelpCircle size={20} />
                      <span>Question</span>
                    </button>
                    <button 
                      onClick={() => setShowEventModal(true)}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <Calendar size={20} />
                      <span>Event</span>
                    </button>
                  </div>
                </Card>

                {/* Posts Feed */}
                {posts.length === 0 ? (
                  <Card className="text-center py-16">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No posts yet</p>
                    <Button onClick={() => setShowPostModal(true)}>
                      Create First Post
                    </Button>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} variant="gradient" className="overflow-hidden">
                      {/* Post Header */}
                      <div className="flex items-center justify-between p-6 pb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <User size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{post.author_name}</h4>
                              {post.dog_name && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                                    with {post.dog_name}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{formatDate(post.created_at)}</span>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                {getPostTypeIcon(post.post_type)}
                                <span className="capitalize">{post.post_type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="px-6 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
                        
                        {post.image_url && (
                          <div className="mt-4 rounded-xl overflow-hidden">
                            <img
                              src={post.image_url}
                              alt="Post image"
                              className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors cursor-pointer">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <button
                              onClick={() => handleLikePost(post.id)}
                              className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                                likedPosts.has(post.id) 
                                  ? 'text-red-500' 
                                  : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                              }`}
                            >
                              <Heart size={20} className={likedPosts.has(post.id) ? 'fill-current' : ''} />
                              <span className="font-medium">{post.likes_count}</span>
                            </button>
                            <button 
                              onClick={() => toggleComments(post.id)}
                              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105"
                            >
                              <MessageCircle size={20} />
                              <span className="font-medium">{post.comments_count}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-all duration-200 hover:scale-105">
                              <Share2 size={20} />
                              <span className="font-medium">Share</span>
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
                              <Bookmark size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Flag size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Comments Section */}
                        {showComments[post.id] && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {/* Add Comment */}
                            <div className="flex space-x-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                <User size={12} className="text-white" />
                              </div>
                              <div className="flex-1 flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={newComment[post.id] || ''}
                                  onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={!newComment[post.id]?.trim()}
                                  icon={<Send size={14} />}
                                  className="rounded-full"
                                >
                                  Post
                                </Button>
                              </div>
                            </div>

                            {/* Comments List */}
                            {comments[post.id] && comments[post.id].length > 0 && (
                              <div className="space-y-3">
                                {comments[post.id].map((comment) => (
                                  <div key={comment.id} className="flex space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                      <User size={12} className="text-white" />
                                    </div>
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl p-3">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-sm text-gray-900 dark:text-white">{comment.author_name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
                                      </div>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                      <div className="flex items-center space-x-4 mt-2">
                                        <button className="text-xs text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 font-medium">
                                          Like
                                        </button>
                                        <button className="text-xs text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 font-medium">
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                {events.length === 0 ? (
                  <Card className="text-center py-16">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No events yet</p>
                    <Button onClick={() => setShowEventModal(true)}>
                      Create First Event
                    </Button>
                  </Card>
                ) : (
                  events.map((event) => (
                    <Card key={event.id} variant="gradient" className="overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Calendar size={24} className="text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">by {event.organizer_name}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-sm rounded-full ${getEventTypeColor(event.event_type)}`}>
                            {event.event_type}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{event.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock size={16} className="mr-2" />
                            {formatDate(event.start_date)}
                          </div>
                          {event.location && (
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <MapPin size={16} className="mr-2" />
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Users size={16} className="mr-2" />
                            {event.participants_count}
                            {event.max_participants && ` / ${event.max_participants}`} going
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                              <ThumbsUp size={16} />
                              <span>Interested</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors">
                              <Share2 size={16} />
                              <span>Share</span>
                            </button>
                          </div>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleJoinEvent(event.id)}
                            icon={<UserPlus size={16} />}
                          >
                            Join Event
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="space-y-6">
                <Card className="text-center py-16">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Dog Groups</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Join groups based on your interests</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {[
                      { name: 'Golden Retriever Lovers', members: '2.3k', color: 'from-yellow-500 to-orange-500' },
                      { name: 'Puppy Training Tips', members: '1.8k', color: 'from-green-500 to-emerald-500' },
                      { name: 'Dog Photography', members: '956', color: 'from-purple-500 to-pink-500' },
                      { name: 'Senior Dog Care', members: '743', color: 'from-blue-500 to-cyan-500' },
                    ].map((group, index) => (
                      <Card key={index} className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
                        <div className={`w-12 h-12 bg-gradient-to-r ${group.color} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                          <Users size={20} className="text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-center">{group.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{group.members} members</p>
                        <Button size="sm" className="w-full mt-3">Join Group</Button>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Right Sidebar - Trending & Suggestions */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              
    {/* Facebook Community Card */}
    <Card variant="gradient" className="p-4 text-center">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
        Join us on Facebook
      </h4>
      <img
        src="https://scontent.fsof4-1.fna.fbcdn.net/v/t39.30808-6/543053661_122101854086998923_5807597672063898062_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=104&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=1BTIvCNK0UwQ7kNvwEVRIKA&_nc_oc=AdkOALbpOj7tPhzPWtv9dEejnx-oNlL248PHGBGVB1mXyrA0g2KkJvaZsSV3suXft1Y&_nc_zt=23&_nc_ht=scontent.fsof4-1.fna&_nc_gid=NiWDFerxxgjufh58nR85Hw&oh=00_AfZXGkAF4-2vCCPbIKz51g2aOx6ANSQwZ92fy5TwTjjffg&oe=68BE48D3"
        alt="Facebook Page Cover"
        className="w-full h-32 object-cover rounded-xl mb-3"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Be part of our growing eDog community on Facebook!
      </p>
      <a
        href="https://www.facebook.com/profile.php?id=61579967714491"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full"
      >
        <Button variant="primary" className="w-full">
          Visit Page
        </Button>
      </a>
    </Card>
              {/* Trending Topics */}
              <Card variant="gradient">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Zap size={16} className="mr-2 text-yellow-500" />
                  Trending Topics
                </h4>
                <div className="space-y-3">
                  {[
                    { tag: 'puppytraining', posts: '234 posts' },
                    { tag: 'doghealth', posts: '189 posts' },
                    { tag: 'goldenretriever', posts: '156 posts' },
                    { tag: 'dogphotography', posts: '98 posts' },
                    { tag: 'rescuedog', posts: '87 posts' },
                  ].map((topic, index) => (
                    <button key={index} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                      <div className="font-medium text-gray-900 dark:text-white">#{topic.tag}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{topic.posts}</div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Suggested Friends */}
              <Card variant="gradient">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserPlus size={16} className="mr-2 text-blue-500" />
                  Suggested Connections
                </h4>
                <div className="space-y-3">
                  {[
                    { name: 'Maria Petrova', dogs: 'Golden Retriever', mutual: '3 mutual friends' },
                    { name: 'Ivan Georgiev', dogs: 'German Shepherd', mutual: '2 mutual friends' },
                    { name: 'Elena Dimitrova', dogs: 'Labrador Mix', mutual: '1 mutual friend' },
                  ].map((user, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.dogs}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{user.mutual}</div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Events */}
              <Card variant="gradient">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar size={16} className="mr-2 text-green-500" />
                  Upcoming Events
                </h4>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{event.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(event.start_date)}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{event.participants_count} going</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        <Modal
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
          title="Create New Post"
          size="lg"
        >
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Input
              label="What's happening with your dog?"
              value={postFormData.title}
              onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Post Type</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: 'story', icon: FileText, label: 'Story', color: 'blue' },
                  { value: 'question', icon: HelpCircle, label: 'Question', color: 'purple' },
                  { value: 'tip', icon: Lightbulb, label: 'Tip', color: 'yellow' },
                  { value: 'photo', icon: Camera, label: 'Photo', color: 'green' },
                  { value: 'video', icon: Video, label: 'Video', color: 'red' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setPostFormData({ ...postFormData, post_type: type.value as Post['post_type'] })}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      postFormData.post_type === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <type.icon size={20} className={`mx-auto mb-1 ${
                      postFormData.post_type === type.value ? `text-${type.color}-600` : 'text-gray-400'
                    }`} />
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <textarea
                value={postFormData.content}
                onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Share your story, ask a question, or give advice..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Image (optional)</label>
              <FileUpload
                acceptedTypes="image/*"
                maxSize={5}
                documentType="post_image"
                onFileUploaded={handlePostFileUploaded}
              />
              {postFormData.image_url && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">✓ Image uploaded successfully</div>
              )}
            </div>
            <Input
              label="Tags (comma separated)"
              value={postFormData.tags}
              onChange={(e) => setPostFormData({ ...postFormData, tags: e.target.value })}
              placeholder="training, puppy, tips, health"
            />
            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowPostModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Post'}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
              <select
                value={eventFormData.event_type}
                onChange={(e) => setEventFormData({ ...eventFormData, event_type: e.target.value as Event['event_type'] })}
                className="input-field"
                required
              >
                <option value="meetup">🐕 Dog Meetup</option>
                <option value="training">🎓 Training Session</option>
                <option value="competition">🏆 Competition</option>
                <option value="adoption">❤️ Adoption Event</option>
                <option value="fundraiser">💰 Fundraiser</option>
                <option value="other">📅 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Describe your event..."
                required
              />
            </div>
            <Input
              label="Location"
              value={eventFormData.location}
              onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
              placeholder="Sofia, Bulgaria"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={eventFormData.start_date}
                onChange={(e) => setEventFormData({ ...eventFormData, start_date: e.target.value })}
                required
              />
              <Input
                label="End Date & Time (optional)"
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
              placeholder="Leave empty for unlimited"
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
    </div>
  );
};