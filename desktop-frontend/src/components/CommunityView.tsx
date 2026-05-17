import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart, MessageCircle, Share2, Calendar, MapPin, Users,
  ChevronUp, ChevronDown, Image, Activity, Plus, Send,
  TrendingUp, Zap, Check, Trash2, Flag, AlertTriangle, Hash,
  UserCircle2, X,
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { apiClient } from '../lib/api';
import { useApp } from '../context/AppContext';
import type { Post, Comment, CommunityEvent } from '../types';

// ── constants ─────────────────────────────────────────────────────────────────

const POST_TYPES = ['story', 'question', 'tip', 'photo', 'lost_dog'] as const;
const EVENT_TYPES = ['meetup', 'training', 'competition', 'adoption', 'fundraiser', 'other'] as const;
const FILTER_TYPES = ['all', 'story', 'question', 'tip', 'photo', 'lost_dog'] as const;

type PostType = typeof POST_TYPES[number];
type EventType = typeof EVENT_TYPES[number];
type FilterType = typeof FILTER_TYPES[number];

const POST_TYPE_COLORS: Record<PostType, string> = {
  story:    'bg-blue-500/10 text-blue-500 dark:bg-[#a4c9ff]/10 dark:text-[#a4c9ff]',
  question: 'bg-amber-500/10 text-amber-600 dark:bg-[#ffd798]/10 dark:text-[#ffd798]',
  tip:      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  photo:    'bg-purple-500/10 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  lost_dog: 'bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  meetup:      'bg-blue-500/10 text-blue-500 dark:bg-[#a4c9ff]/10 dark:text-[#a4c9ff]',
  training:    'bg-amber-500/10 text-amber-600 dark:bg-[#ffd798]/10 dark:text-[#ffd798]',
  competition: 'bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  adoption:    'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  fundraiser:  'bg-purple-500/10 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  other:       'bg-gray-500/10 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400',
};

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string, lang = 'en') {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffS = Math.floor(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (diffS < 60) return rtf.format(-diffS, 'second');
  const diffM = Math.floor(diffS / 60);
  if (diffM < 60) return rtf.format(-diffM, 'minute');
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return rtf.format(-diffH, 'hour');
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return rtf.format(-diffD, 'day');
  return new Date(dateStr).toLocaleDateString(lang, { month: 'short', day: 'numeric' });
}

function formatEventDate(dateStr: string, lang = 'en') {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (date.toDateString() === today.toDateString()) return rtf.format(0, 'day');
  if (date.toDateString() === tomorrow.toDateString()) return rtf.format(1, 'day');
  return date.toLocaleDateString(lang, { month: 'short', day: 'numeric' });
}

const initials = (name?: string) => (name ?? '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

// ── PostCard ──────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onDelete?: (postId: string) => void;
  showOwnerActions?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onLike, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { t, i18n } = useTranslation();

  const isOwner = currentUserId && post.user_id === currentUserId;
  const lang = i18n.language;
  const typeKey = (post.post_type ?? 'story') as PostType;
  const typeColor = POST_TYPE_COLORS[typeKey] ?? POST_TYPE_COLORS.story;
  const isLostDog = post.post_type === 'lost_dog';

  const loadComments = async () => {
    if (comments.length > 0) { setShowComments(s => !s); return; }
    if (showComments) { setShowComments(false); return; }
    setLoadingComments(true);
    try {
      const data = await apiClient.getPostComments(post.id);
      setComments(data.comments);
      setShowComments(true);
    } catch { /* silent */ }
    finally { setLoadingComments(false); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const data = await apiClient.addPostComment(post.id, newComment.trim());
      setComments(prev => [...prev, data.comment]);
      setNewComment('');
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleShare = async () => {
    const text = `${post.title}\n${post.content}`;
    if (navigator.share) {
      try { await navigator.share({ title: post.title, text, url: window.location.href }); }
      catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* silent */ }
    }
  };

  const handleReport = async () => {
    try {
      await apiClient.reportPost(post.id, reportReason);
      setReportSubmitted(true);
      setTimeout(() => { setShowReportModal(false); setReportSubmitted(false); }, 1500);
    } catch { /* silent */ }
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete?.(post.id);
  };

  return (
    <>
      <article className={`bg-white dark:bg-[#1e2023] rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
        isLostDog
          ? 'border-red-200 dark:border-red-500/30'
          : 'border-gray-100 dark:border-[#414751]/20'
      }`}>
        {/* Lost dog alert banner */}
        {isLostDog && (
          <div className="bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 px-5 py-2.5 flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">{t('lostDogAlert')}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-5 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#a4c9ff]/15 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-[#a4c9ff] font-semibold text-sm font-jakarta">
              {initials(post.author_name)}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-[#e2e2e6] font-jakarta leading-tight">{post.author_name}</p>
              <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">
                {post.dog_name ? `${t('with')} ${post.dog_name} · ` : ''}{timeAgo(post.created_at, lang)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor}`}>
              {t(typeKey)}
            </span>
            {/* Owner actions */}
            {isOwner && (
              <button
                onClick={handleDelete}
                className={`p-1.5 rounded-lg transition-colors ${
                  confirmDelete
                    ? 'bg-red-100 dark:bg-red-500/20 text-red-500'
                    : 'text-gray-400 dark:text-[#8b919d] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                }`}
                title={confirmDelete ? t('confirmDeletePost') : t('deletePost')}
                onBlur={() => setTimeout(() => setConfirmDelete(false), 200)}
              >
                <Trash2 size={14} />
              </button>
            )}
            {/* Report button for other users' posts */}
            {!isOwner && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                title={t('reportPost')}
              >
                <Flag size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-4 space-y-1">
          <h3 className="font-semibold text-gray-900 dark:text-[#e2e2e6] font-jakarta text-sm leading-snug">{post.title}</h3>
          <p className="text-sm text-gray-600 dark:text-[#8b919d] leading-relaxed">{post.content}</p>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-0.5 text-xs text-blue-500 dark:text-[#a4c9ff] bg-blue-50 dark:bg-[#a4c9ff]/10 px-2 py-0.5 rounded-full">
                  <Hash size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Photo */}
        {post.image_url && (
          <div className="px-5 pb-4">
            <img src={post.image_url} alt="" className="w-full rounded-xl object-cover max-h-72" />
          </div>
        )}

        {/* Action bar */}
        <div className="border-t border-gray-100 dark:border-[#414751]/20 flex">
          <button
            onClick={() => onLike(post.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors
              ${post.liked_by_user
                ? 'text-red-500 bg-red-50 dark:bg-red-500/5'
                : 'text-gray-500 dark:text-[#8b919d] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5'
              }`}
          >
            <Heart size={15} fill={post.liked_by_user ? 'currentColor' : 'none'} />
            <span>{post.likes_count}</span>
          </button>
          <button
            onClick={loadComments}
            disabled={loadingComments}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors border-x border-gray-100 dark:border-[#414751]/20
              ${showComments
                ? 'text-blue-500 dark:text-[#a4c9ff] bg-blue-50 dark:bg-[#a4c9ff]/5'
                : 'text-gray-500 dark:text-[#8b919d] hover:text-blue-500 dark:hover:text-[#a4c9ff] hover:bg-blue-50 dark:hover:bg-[#a4c9ff]/5'
              }`}
          >
            <MessageCircle size={15} />
            <span>{post.comments_count}</span>
            {showComments ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            onClick={handleShare}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors
              ${copied
                ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5'
                : 'text-gray-500 dark:text-[#8b919d] hover:text-blue-500 dark:hover:text-[#a4c9ff] hover:bg-blue-50 dark:hover:bg-[#a4c9ff]/5'
              }`}
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            <span>{copied ? t('copied') : t('share')}</span>
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="border-t border-gray-100 dark:border-[#414751]/20 bg-gray-50/50 dark:bg-[#111316]/40 px-5 py-4 space-y-3">
            {comments.length === 0 && !loadingComments && (
              <p className="text-xs text-gray-400 dark:text-[#8b919d] text-center py-1">{t('noCommentsYet')}</p>
            )}
            {comments.map(c => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-[#282a2d] flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500 dark:text-[#8b919d]">
                  {initials(c.author_name)}
                </div>
                <div className="flex-1 bg-white dark:bg-[#1e2023] rounded-xl px-3 py-2 border border-gray-100 dark:border-[#414751]/20">
                  <p className="text-xs font-semibold text-gray-700 dark:text-[#c1c7d3]">{c.author_name}</p>
                  <p className="text-xs text-gray-600 dark:text-[#8b919d] mt-0.5 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2.5 pt-1">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-[#a4c9ff]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-blue-600 dark:text-[#a4c9ff]">Me</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  className="flex-1 text-xs bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-[#414751]/40 rounded-xl px-3 py-2 text-gray-700 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#a4c9ff]"
                  placeholder={t('addCommentPlaceholder')}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  className="p-2 rounded-xl bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] disabled:opacity-40 hover:bg-blue-600 dark:hover:bg-[#d4e3ff] transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Report modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title={t('reportPost')}>
        {reportSubmitted ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <Check size={32} className="text-emerald-500" />
            <p className="text-sm font-semibold text-gray-700 dark:text-[#e2e2e6]">{t('reportSubmitted')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-[#8b919d]">{t('reportReasonLabel')}</p>
            {(['inappropriate', 'spam', 'misinformation', 'harassment'] as const).map(r => (
              <label key={r} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="report_reason"
                  value={r}
                  checked={reportReason === r}
                  onChange={() => setReportReason(r)}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-[#c1c7d3] group-hover:text-blue-500 dark:group-hover:text-[#a4c9ff] transition-colors">
                  {t(`report_${r}`)}
                </span>
              </label>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-2 text-sm text-gray-600 dark:text-[#8b919d] border border-gray-200 dark:border-[#414751]/40 rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors">
                {t('cancel')}
              </button>
              <button onClick={handleReport} className="flex-1 py-2 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                {t('submitReport')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

// ── ComposeCard ───────────────────────────────────────────────────────────────

interface ComposeCardProps {
  onPost: (title: string, content: string, type: PostType, imageUrl?: string, tags?: string[]) => Promise<void>;
}

const ComposeCard: React.FC<ComposeCardProps> = ({ onPost }) => {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('story');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPostType('photo');
    setExpanded(true);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (photoFile) {
        setUploadingPhoto(true);
        try {
          const uploaded = await apiClient.uploadImage(photoFile);
          imageUrl = uploaded.fileUrl;
        } finally {
          setUploadingPhoto(false);
        }
      }
      const tags = tagsInput.split(/[\s,]+/).map(t => t.replace(/^#/, '').trim()).filter(Boolean);
      await onPost(title.trim(), content.trim(), postType, imageUrl, tags.length ? tags : undefined);
      setTitle(''); setContent(''); setPostType('story'); setTagsInput('');
      setExpanded(false);
      clearPhoto();
    } finally {
      setSubmitting(false);
    }
  };

  const isLostDog = postType === 'lost_dog';

  return (
    <div className={`bg-white dark:bg-[#1e2023] rounded-2xl border shadow-sm p-4 transition-colors ${
      isLostDog ? 'border-red-200 dark:border-red-500/30' : 'border-gray-100 dark:border-[#414751]/20'
    }`}>
      {isLostDog && (
        <div className="flex items-center gap-2 mb-3 px-1 py-2 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
          <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{t('lostDogAlertHint')}</p>
        </div>
      )}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#a4c9ff]/15 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-[#a4c9ff] font-semibold text-sm font-jakarta">
          Me
        </div>
        <div className="flex-1 min-w-0">
          {expanded && (
            <input
              className="w-full text-sm font-semibold bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-[#414751]/40 rounded-xl px-3 py-2 mb-2 text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#a4c9ff]"
              placeholder={t('postTitlePlaceholder')}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          )}
          <textarea
            className="w-full text-sm bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-[#414751]/40 rounded-xl px-3 py-2.5 text-gray-700 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#a4c9ff] transition-all"
            style={{ minHeight: expanded ? 100 : 44 }}
            placeholder={isLostDog ? t('lostDogContentPlaceholder') : t('postContentPlaceholder')}
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
          />
          {expanded && (
            <input
              className="w-full mt-2 text-xs bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-[#414751]/40 rounded-xl px-3 py-2 text-gray-700 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#a4c9ff]"
              placeholder={t('tagsPlaceholder')}
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />
          )}
          {photoPreview && (
            <div className="relative mt-2">
              <img src={photoPreview} alt="preview" className="w-full max-h-64 rounded-xl object-cover border border-gray-200 dark:border-[#414751]/40" />
              <button
                onClick={clearPhoto}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors text-base leading-none"
                aria-label="Remove photo"
              >×</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-[#414751]/20 gap-2">
        <div className="flex gap-1 flex-wrap">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {expanded ? (
            <>
              {POST_TYPES.map(pt => (
                <button
                  key={pt}
                  onClick={() => setPostType(pt)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    postType === pt
                      ? pt === 'lost_dog'
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                      : 'text-gray-500 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d]'
                  }`}
                >
                  {pt === 'lost_dog' ? `🚨 ${t('lost_dog')}` : t(pt)}
                </button>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
              >
                <Image size={13} />{t('photo')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-500 dark:text-[#a4c9ff] hover:bg-blue-50 dark:hover:bg-[#a4c9ff]/10 transition-colors"
              >
                <Image size={14} />{t('photo')}
              </button>
              <button
                onClick={() => { setExpanded(true); setPostType('tip'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-500 dark:text-[#ffd798] hover:bg-amber-50 dark:hover:bg-[#ffd798]/10 transition-colors"
              >
                <Activity size={14} />{t('tip')}
              </button>
              <button
                onClick={() => { setExpanded(true); setPostType('lost_dog'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <AlertTriangle size={14} />{t('lostDogShort')}
              </button>
            </>
          )}
        </div>
        {expanded && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => { setExpanded(false); setTitle(''); setContent(''); setTagsInput(''); clearPhoto(); setPostType('story'); }}
              className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] rounded-xl transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || submitting}
              className={`px-4 py-1.5 text-xs font-bold rounded-full disabled:opacity-40 transition-colors ${
                isLostDog
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] hover:bg-blue-600 dark:hover:bg-[#d4e3ff]'
              }`}
            >
              {uploadingPhoto ? t('uploadingPhoto') : submitting ? t('posting') : t('postButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── EventCard ─────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: CommunityEvent;
  onJoin: (eventId: string) => void;
  joining: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onJoin, joining }) => {
  const { t, i18n } = useTranslation();
  const typeKey = (event.event_type ?? 'other') as EventType;
  const typeColor = EVENT_TYPE_COLORS[typeKey] ?? EVENT_TYPE_COLORS.other;

  return (
    <article className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 shadow-sm p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColor}`}>
              {t(typeKey)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-[#e2e2e6] font-jakarta text-sm leading-snug truncate">{event.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#8b919d] flex-shrink-0">
          <Users size={13} />
          <span>{event.participants_count ?? event.current_participants ?? 0}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500 dark:text-[#8b919d]">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatEventDate(event.start_date, i18n.language)}
        </span>
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {event.location}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-[#8b919d] leading-relaxed mb-4 line-clamp-2">{event.description}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-[#414751]">{t('by')} {event.organizer_name}</p>
        <button
          onClick={() => onJoin(event.id)}
          disabled={joining}
          className="px-4 py-1.5 text-xs font-bold bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-full hover:bg-blue-600 dark:hover:bg-[#d4e3ff] disabled:opacity-50 transition-colors"
        >
          {joining ? t('joining') : t('join')}
        </button>
      </div>
    </article>
  );
};

// ── CommunityView (main) ──────────────────────────────────────────────────────

interface CommunityViewProps {
  onNavigate: (view: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'mine'>('feed');
  const [feedFilter, setFeedFilter] = useState<FilterType>('all');
  const { t, i18n } = useTranslation();
  const { user } = useApp();

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myPostsLoading, setMyPostsLoading] = useState(false);

  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [joiningEvent, setJoiningEvent] = useState<string | null>(null);

  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState<EventType>('meetup');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventSubmitting, setEventSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      const data = await apiClient.getPosts({ limit: 30 });
      setPosts(data.posts);
    } catch (e: any) {
      setPostsError(e.message || 'Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  }, []);

  const fetchMyPosts = useCallback(async () => {
    setMyPostsLoading(true);
    try {
      const data = await apiClient.getMyPosts();
      setMyPosts(data.posts);
    } catch { /* silent */ }
    finally { setMyPostsLoading(false); }
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

  const fetchTrendingTags = useCallback(async () => {
    try {
      const data = await apiClient.getTrendingTags();
      setTrendingTags(data.tags.filter(t => t.tag));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchEvents();
    fetchTrendingTags();
  }, [fetchPosts, fetchEvents, fetchTrendingTags]);

  useEffect(() => {
    if (activeTab === 'mine') fetchMyPosts();
  }, [activeTab, fetchMyPosts]);

  const filteredPosts = feedFilter === 'all' ? posts : posts.filter(p => p.post_type === feedFilter);

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked_by_user: !p.liked_by_user, likes_count: p.likes_count + (p.liked_by_user ? -1 : 1) } : p
    ));
    try {
      await apiClient.likePost(postId);
    } catch {
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, liked_by_user: !p.liked_by_user, likes_count: p.likes_count + (p.liked_by_user ? -1 : 1) } : p
      ));
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await apiClient.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setMyPosts(prev => prev.filter(p => p.id !== postId));
    } catch { /* silent */ }
  };

  const handleCreatePost = async (title: string, content: string, postType: PostType, imageUrl?: string, tags?: string[]) => {
    await apiClient.createPost({ title, content, post_type: postType, image_url: imageUrl, tags });
    fetchPosts();
    fetchTrendingTags();
  };

  const handleJoinEvent = async (eventId: string) => {
    setJoiningEvent(eventId);
    try {
      await apiClient.joinEvent(eventId);
      setEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, participants_count: (e.participants_count ?? 0) + 1 } : e
      ));
    } catch { /* silent */ }
    finally { setJoiningEvent(null); }
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
      setEventTitle(''); setEventDesc(''); setEventType('meetup'); setEventLocation(''); setEventDate('');
      setIsEventModalOpen(false);
      fetchEvents();
    } catch { /* silent */ }
    finally { setEventSubmitting(false); }
  };

  const inputCls = 'w-full text-sm bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-[#414751]/40 rounded-xl px-3 py-2.5 text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#8b919d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#a4c9ff]';
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-[#8b919d] mb-1.5 uppercase tracking-wide';

  return (
    <div className="font-jakarta p-4 sm:p-6 lg:p-8 min-h-full bg-[#fbf9f8] dark:bg-[#111316]">
      {/* Tab bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1c1f] rounded-xl p-1">
          {(['feed', 'events', 'mine'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#1e2023] text-blue-600 dark:text-[#a4c9ff] shadow-sm'
                  : 'text-gray-500 dark:text-[#8b919d] hover:text-gray-800 dark:hover:text-[#e2e2e6]'
              }`}
            >
              {tab === 'feed' && <MessageCircle size={15} />}
              {tab === 'events' && <Calendar size={15} />}
              {tab === 'mine' && <UserCircle2 size={15} />}
              {t(tab === 'feed' ? 'feed' : tab === 'events' ? 'events' : 'myPosts')}
            </button>
          ))}
        </div>
        {activeTab === 'events' && (
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-bold hover:bg-blue-600 dark:hover:bg-[#d4e3ff] transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">{t('newEvent')}</span>
          </button>
        )}
      </div>

      {/* ── Feed tab ── */}
      {activeTab === 'feed' && (
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            <ComposeCard onPost={handleCreatePost} />

            {/* Filter chips */}
            <div className="flex gap-1.5 flex-wrap">
              {FILTER_TYPES.map(ft => (
                <button
                  key={ft}
                  onClick={() => setFeedFilter(ft)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    feedFilter === ft
                      ? ft === 'lost_dog'
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                      : ft === 'lost_dog'
                        ? 'text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20'
                        : 'text-gray-500 dark:text-[#8b919d] bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-[#414751]/20 hover:border-blue-200 dark:hover:border-[#a4c9ff]/30'
                  }`}
                >
                  {ft === 'all' ? t('filterAll') : ft === 'lost_dog' ? `🚨 ${t('lost_dog')}` : t(ft)}
                </button>
              ))}
            </div>

            {postsLoading && (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 p-5 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#282a2d]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-[#282a2d] rounded w-1/3" />
                        <div className="h-2.5 bg-gray-100 dark:bg-[#1a1c1f] rounded w-1/4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-[#282a2d] rounded w-3/4" />
                      <div className="h-3 bg-gray-100 dark:bg-[#1a1c1f] rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {postsError && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 text-center">
                <p className="text-sm text-red-600 dark:text-red-400">{postsError}</p>
                <button onClick={fetchPosts} className="mt-2 text-xs text-red-500 underline">{t('retry')}</button>
              </div>
            )}

            {!postsLoading && !postsError && filteredPosts.length === 0 && (
              <div className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 dark:bg-[#282a2d] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={24} className="text-gray-400 dark:text-[#414751]" />
                </div>
                <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('noPostsYet')}</p>
              </div>
            )}

            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Right panel */}
          <aside className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0 sticky top-4">
            {/* Community stats */}
            <div className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 shadow-sm p-5">
              <h2 className="text-xs font-bold text-gray-500 dark:text-[#8b919d] uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp size={14} />
                {t('communityPulse')}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-[#8b919d]">{t('postsThisWeek')}</span>
                  <span className="text-sm font-bold text-blue-500 dark:text-[#a4c9ff]">{posts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-[#8b919d]">{t('upcomingEventsCount')}</span>
                  <span className="text-sm font-bold text-amber-500 dark:text-[#ffd798]">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-[#8b919d]">{t('totalLikes')}</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-[#e2e2e6]">
                    {posts.reduce((sum, p) => sum + p.likes_count, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trending tags */}
            {trendingTags.length > 0 && (
              <div className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 shadow-sm p-5">
                <h2 className="text-xs font-bold text-gray-500 dark:text-[#8b919d] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Hash size={14} />
                  {t('trendingTags')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.slice(0, 10).map(({ tag, count }) => (
                    <button
                      key={tag}
                      onClick={() => setFeedFilter('all')}
                      className="inline-flex items-center gap-1 text-xs text-blue-500 dark:text-[#a4c9ff] bg-blue-50 dark:bg-[#a4c9ff]/10 hover:bg-blue-100 dark:hover:bg-[#a4c9ff]/20 px-2.5 py-1 rounded-full transition-colors"
                    >
                      <Hash size={10} />
                      {tag}
                      <span className="text-gray-400 dark:text-[#8b919d] ml-0.5">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming events preview */}
            <div className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-500 dark:text-[#8b919d] uppercase tracking-wider flex items-center gap-2">
                  <Zap size={14} />
                  {t('upcomingEvents')}
                </h2>
                <button onClick={() => setActiveTab('events')} className="text-xs text-blue-500 dark:text-[#a4c9ff] hover:underline font-semibold">
                  {t('seeAll')}
                </button>
              </div>
              {eventsLoading && <div className="text-xs text-gray-400 dark:text-[#8b919d] text-center py-4">{t('loading')}</div>}
              {!eventsLoading && events.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-[#8b919d] text-center py-4">{t('noUpcomingEvents')}</p>
              )}
              <div className="space-y-3">
                {events.slice(0, 3).map(event => (
                  <div key={event.id} className="flex gap-3 items-start group cursor-pointer" onClick={() => setActiveTab('events')}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${EVENT_TYPE_COLORS[event.event_type as EventType] ?? 'bg-gray-100 text-gray-400'}`}>
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-[#e2e2e6] truncate group-hover:text-blue-500 dark:group-hover:text-[#a4c9ff] transition-colors">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5 flex items-center gap-1">
                        <span>{formatEventDate(event.start_date, i18n.language)}</span>
                        {event.location && <><span>·</span><span className="truncate">{event.location}</span></>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── Events tab ── */}
      {activeTab === 'events' && (
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
            {eventsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 p-5 animate-pulse h-44" />
                ))}
              </div>
            )}
            {eventsError && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 text-center">
                <p className="text-sm text-red-600 dark:text-red-400">{eventsError}</p>
                <button onClick={fetchEvents} className="mt-2 text-xs text-red-500 underline">{t('retry')}</button>
              </div>
            )}
            {!eventsLoading && !eventsError && events.length === 0 && (
              <div className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 dark:bg-[#282a2d] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-gray-400 dark:text-[#414751]" />
                </div>
                <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-4">{t('noUpcomingEventsCreate')}</p>
                <button onClick={() => setIsEventModalOpen(true)} className="px-4 py-2 bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-bold hover:bg-blue-600 dark:hover:bg-[#d4e3ff] transition-colors">
                  {t('createEvent')}
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map(event => (
                <EventCard key={event.id} event={event} onJoin={handleJoinEvent} joining={joiningEvent === event.id} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mine tab ── */}
      {activeTab === 'mine' && (
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            {myPostsLoading && (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 p-5 animate-pulse h-36" />
                ))}
              </div>
            )}
            {!myPostsLoading && myPosts.length === 0 && (
              <div className="bg-white dark:bg-[#1e2023] rounded-2xl border border-gray-100 dark:border-[#414751]/20 p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 dark:bg-[#282a2d] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserCircle2 size={24} className="text-gray-400 dark:text-[#414751]" />
                </div>
                <p className="text-sm text-gray-500 dark:text-[#8b919d] mb-4">{t('noMyPosts')}</p>
                <button onClick={() => setActiveTab('feed')} className="px-4 py-2 bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl text-sm font-bold hover:bg-blue-600 dark:hover:bg-[#d4e3ff] transition-colors">
                  {t('createFirstPost')}
                </button>
              </div>
            )}
            {myPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title={t('createEvent')}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>{t('title')}</label>
            <input className={inputCls} value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder={t('eventNamePlaceholder')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('type')}</label>
              <select className={inputCls} value={eventType} onChange={e => setEventType(e.target.value as EventType)}>
                {EVENT_TYPES.map(et => (
                  <option key={et} value={et}>{t(et)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('date')}</label>
              <input type="datetime-local" className={inputCls} value={eventDate} onChange={e => setEventDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('location')} <span className="normal-case font-normal text-gray-400">({t('optional')})</span></label>
            <input className={inputCls} value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder={t('eventLocationPlaceholder')} />
          </div>
          <div>
            <label className={labelCls}>{t('description')}</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={eventDesc} onChange={e => setEventDesc(e.target.value)} placeholder={t('eventDescriptionPlaceholder')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-[#8b919d] border border-gray-200 dark:border-[#414751]/40 rounded-xl hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors">
              {t('cancel')}
            </button>
            <button
              onClick={handleCreateEvent}
              disabled={!eventTitle.trim() || !eventDesc.trim() || !eventDate || eventSubmitting}
              className="flex-1 py-2 text-sm font-bold bg-blue-500 dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl hover:bg-blue-600 dark:hover:bg-[#d4e3ff] disabled:opacity-40 transition-colors"
            >
              {eventSubmitting ? t('creating') : t('createEvent')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
