import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Users, MessageCircle, Calendar, MapPin, Heart, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import type { Post, Comment, CommunityEvent } from '../types';

const POST_TYPES = ['story', 'question', 'tip', 'photo'] as const;
const EVENT_TYPES = ['meetup', 'training', 'competition', 'adoption', 'fundraiser', 'other'] as const;

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString();
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const loadComments = async () => {
    if (comments.length > 0) { setShowComments(true); return; }
    setLoadingComments(true);
    try {
      const data = await apiClient.getPostComments(post.id);
      setComments(data.comments);
      setShowComments(true);
    } catch {
      // silently ignore
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (showComments) { setShowComments(false); return; }
    loadComments();
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const data = await apiClient.addPostComment(post.id, newComment.trim());
      setComments(prev => [...prev, data.comment]);
      setNewComment('');
    } catch {
      // silently ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600">
              {post.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author_name}</p>
            <p className="text-xs text-gray-500">
              {post.dog_name ? `with ${post.dog_name} • ` : ''}{timeAgo(post.created_at)}
              {' · '}
              <span className="capitalize">{post.post_type}</span>
            </p>
          </div>
        </div>

        <p className="font-medium text-gray-900">{post.title}</p>
        <p className="text-gray-700 text-sm">{post.content}</p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-1 transition-colors ${post.liked_by_user ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Heart size={16} fill={post.liked_by_user ? 'currentColor' : 'none'} />
              <span className="text-sm">{post.likes_count}</span>
            </button>
            <button
              onClick={toggleComments}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={16} />
              <span className="text-sm">{post.comments_count}</span>
              {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {showComments && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            {loadingComments && <p className="text-xs text-gray-400">{t('Loading...')}</p>}
            {comments.map(c => (
              <div key={c.id} className="flex space-x-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-500">{c.author_name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-gray-700">{c.author_name}</p>
                  <p className="text-xs text-gray-600">{c.content}</p>
                </div>
              </div>
            ))}
            <div className="flex space-x-2 mt-2">
              <input
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={t('Add a comment...')}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim() || submitting}>
                {t('Send')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');
  const { t } = useTranslation();

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Events state
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [joiningEvent, setJoiningEvent] = useState<string | null>(null);

  // Create post modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<typeof POST_TYPES[number]>('story');
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Create event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState<typeof EVENT_TYPES[number]>('meetup');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventSubmitting, setEventSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      const data = await apiClient.getPosts({ limit: 20 });
      setPosts(data.posts);
    } catch (e: any) {
      setPostsError(e.message || 'Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const data = await apiClient.getEvents({ limit: 20 });
      setEvents(data.events);
    } catch (e: any) {
      setEventsError(e.message || 'Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { if (activeTab === 'events') fetchEvents(); }, [activeTab, fetchEvents]);

  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked_by_user: !p.liked_by_user, likes_count: p.likes_count + (p.liked_by_user ? -1 : 1) }
        : p
    ));
    try {
      await apiClient.likePost(postId);
    } catch {
      // Revert on failure
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, liked_by_user: !p.liked_by_user, likes_count: p.likes_count + (p.liked_by_user ? -1 : 1) }
          : p
      ));
    }
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim() || postSubmitting) return;
    setPostSubmitting(true);
    try {
      await apiClient.createPost({ title: postTitle.trim(), content: postContent.trim(), post_type: postType });
      setPostTitle('');
      setPostContent('');
      setPostType('story');
      setIsPostModalOpen(false);
      fetchPosts();
    } catch {
      // silently ignore
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    setJoiningEvent(eventId);
    try {
      await apiClient.joinEvent(eventId);
      setEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, participants_count: e.participants_count + 1 } : e
      ));
    } catch {
      // silently ignore
    } finally {
      setJoiningEvent(null);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDesc.trim() || !eventDate || eventSubmitting) return;
    setEventSubmitting(true);
    try {
      await apiClient.createEvent({
        title: eventTitle.trim(),
        description: eventDesc.trim(),
        event_type: eventType,
        start_date: new Date(eventDate).toISOString(),
        location: eventLocation.trim() || undefined,
      });
      setEventTitle('');
      setEventDesc('');
      setEventType('meetup');
      setEventLocation('');
      setEventDate('');
      setIsEventModalOpen(false);
      fetchEvents();
    } catch {
      // silently ignore
    } finally {
      setEventSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{t('Community')}</h2>
        <Button
          onClick={() => activeTab === 'posts' ? setIsPostModalOpen(true) : setIsEventModalOpen(true)}
          size="sm"
        >
          <Plus size={16} className="mr-1" />
          {activeTab === 'posts' ? t('New Post') : t('New Event')}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'posts' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageCircle size={16} className="inline mr-1" />
          {t('Posts')}
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'events' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar size={16} className="inline mr-1" />
          {t('Events')}
        </button>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {postsLoading && (
            <div className="text-center py-8 text-gray-400">{t('Loading...')}</div>
          )}
          {postsError && (
            <div className="text-center py-4 text-red-500 text-sm">
              {postsError}
              <button onClick={fetchPosts} className="ml-2 underline">{t('Retry')}</button>
            </div>
          )}
          {!postsLoading && !postsError && posts.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">{t('No posts yet. Be the first to share!')}</p>
            </div>
          )}
          {posts.map(post => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {eventsLoading && (
            <div className="text-center py-8 text-gray-400">{t('Loading...')}</div>
          )}
          {eventsError && (
            <div className="text-center py-4 text-red-500 text-sm">
              {eventsError}
              <button onClick={fetchEvents} className="ml-2 underline">{t('Retry')}</button>
            </div>
          )}
          {!eventsLoading && !eventsError && events.length === 0 && (
            <div className="text-center py-8">
              <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">{t('No upcoming events. Create one!')}</p>
            </div>
          )}
          {events.map(event => (
            <Card key={event.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 capitalize">
                        {event.event_type}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatEventDate(event.start_date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 flex-shrink-0">
                    <Users size={14} />
                    <span>{event.participants_count ?? event.current_participants ?? 0}</span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{event.description}</p>
                <p className="text-xs text-gray-400">{t('Organized by')} {event.organizer_name}</p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleJoinEvent(event.id)}
                    disabled={joiningEvent === event.id}
                  >
                    {joiningEvent === event.id ? t('Joining...') : t('Join Event')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} title={t('Create New Post')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Title')}</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
              placeholder={t('Give your post a title...')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Type')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={postType}
              onChange={e => setPostType(e.target.value as typeof POST_TYPES[number])}
            >
              {POST_TYPES.map(pt => (
                <option key={pt} value={pt}>{t(pt.charAt(0).toUpperCase() + pt.slice(1))}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("What's on your mind?")}</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={4}
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder={t("Share your thoughts, ask questions, or tell us about your dog's adventures...")}
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>{t('Cancel')}</Button>
            <Button
              onClick={handleCreatePost}
              className="flex-1"
              disabled={!postTitle.trim() || !postContent.trim() || postSubmitting}
            >
              {postSubmitting ? t('Posting...') : t('Post')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Event Modal */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title={t('Create Event')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Title')}</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={eventTitle}
              onChange={e => setEventTitle(e.target.value)}
              placeholder={t('Event name...')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Type')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={eventType}
              onChange={e => setEventType(e.target.value as typeof EVENT_TYPES[number])}
            >
              {EVENT_TYPES.map(et => (
                <option key={et} value={et}>{t(et.charAt(0).toUpperCase() + et.slice(1))}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Date')}</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Location')} ({t('optional')})</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={eventLocation}
              onChange={e => setEventLocation(e.target.value)}
              placeholder={t('Where is it happening?')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Description')}</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
              value={eventDesc}
              onChange={e => setEventDesc(e.target.value)}
              placeholder={t('Tell people what this event is about...')}
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>{t('Cancel')}</Button>
            <Button
              onClick={handleCreateEvent}
              className="flex-1"
              disabled={!eventTitle.trim() || !eventDesc.trim() || !eventDate || eventSubmitting}
            >
              {eventSubmitting ? t('Creating...') : t('Create Event')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
