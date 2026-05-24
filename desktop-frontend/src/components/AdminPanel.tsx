import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, TrendingUp, Dog, FileText, Search, RefreshCw, Trash2, X,
  Shield, AlertTriangle, ChevronLeft, ChevronRight, Mail, Send, Store, Plus, Edit2, Check,
  MessageSquare,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { apiClient } from '../lib/api';
import { AdminStats, AdminUserSummary, AdminDog, AdminReportedPost, AdminFeedbackItem } from '../types';
import { PartnerLocationPicker, type PickedLocation } from './PartnerLocationPicker';

type Tab = 'overview' | 'users' | 'dogs' | 'reports' | 'email' | 'partners' | 'feedback';

const NEW_USER_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function isNewUser(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < NEW_USER_THRESHOLD_MS;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: () => void; loading?: boolean; disabled?: boolean }> = ({
  checked, onChange, loading, disabled,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={e => { e.stopPropagation(); onChange(); }}
    disabled={disabled || loading}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
      checked ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
    }`}
  >
    {loading ? (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-3 h-3 border border-white/60 border-t-transparent rounded-full animate-spin" />
      </span>
    ) : (
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    )}
  </button>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: number | string;
  sub?: string; hint?: string; accent?: boolean; onClick?: () => void;
}> = ({ icon, label, value, sub, hint, accent, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left w-full bg-white dark:bg-[#1e2023] border rounded-xl p-4 flex items-start gap-3 transition-all duration-150 group ${
      onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'cursor-default'
    } ${accent ? 'border-[#005da7]/30 dark:border-[#a4c9ff]/20' : 'border-gray-100 dark:border-white/5'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
      accent
        ? 'bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 text-[#005da7] dark:text-[#a4c9ff]'
        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-[#8b919d]'
    } ${onClick ? 'group-hover:bg-[#005da7]/15 dark:group-hover:bg-[#a4c9ff]/15' : ''}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 dark:text-[#8b919d] font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-[#e2e2e6] leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-[#414751] mt-0.5">{sub}</p>}
      {hint && onClick && (
        <p className="text-[10px] text-[#005da7] dark:text-[#a4c9ff] mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          {hint} →
        </p>
      )}
    </div>
  </button>
);

// ── Compose email modal ───────────────────────────────────────────────────────
const ComposeModal: React.FC<{
  recipient: { id: string; name: string; email: string };
  onClose: () => void;
}> = ({ recipient, onClose }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const res = await apiClient.adminSendUserEmail(recipient.id, subject, body);
      setResult({ ok: true, msg: res.message });
      setSubject('');
      setBody('');
    } catch (e: any) {
      setResult({ ok: false, msg: e.message || 'Failed to send email' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1e2023] rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-[#e2e2e6]">Email to {recipient.name}</h3>
            <p className="text-xs text-gray-400 dark:text-[#414751] mt-0.5">{recipient.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Email subject…"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Message</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              placeholder="Write your message…"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30 resize-none"
            />
          </div>

          {result && (
            <div className={`rounded-xl px-4 py-3 text-sm ${result.ok ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
              {result.msg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] rounded-xl transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !body.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#005da7] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {sending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Custom tooltip for recharts ───────────────────────────────────────────────
const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#282a2d] border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-gray-400 dark:text-[#8b919d] mb-0.5">
        {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </p>
      <p className="font-semibold text-gray-900 dark:text-[#e2e2e6]">{payload[0].value} new users</p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [growthData, setGrowthData] = useState<{ date: string; registrations: number; active_users: number }[]>([]);
  const [avgDailyActive, setAvgDailyActive] = useState<number | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [reports, setReports] = useState<AdminReportedPost[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [dismissingReportId, setDismissingReportId] = useState<string | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [newUserCount, setNewUserCount] = useState(0);

  const [dogs, setDogs] = useState<AdminDog[]>([]);
  const [dogsTotal, setDogsTotal] = useState(0);
  const [dogPage, setDogPage] = useState(1);
  const [dogSearch, setDogSearch] = useState('');
  const [deletingDogId, setDeletingDogId] = useState<string | null>(null);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxLabel, setLightboxLabel] = useState('');

  // Email compose modal
  const [composeTarget, setComposeTarget] = useState<{ id: string; name: string; email: string } | null>(null);

  // Feedback
  const [feedbackItems, setFeedbackItems] = useState<AdminFeedbackItem[]>([]);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('');
  const [togglingFeedbackId, setTogglingFeedbackId] = useState<string | null>(null);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null);

  // Broadcast email
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const PAGE_SIZE = 20;

  const loadStats = useCallback(async () => {
    try {
      const res = await apiClient.getAdminStats();
      setStats(res.stats);
    } catch { /* non-fatal */ }
  }, []);

  const loadGrowthStats = useCallback(async () => {
    try {
      const res = await apiClient.getAdminGrowthStats(14);
      setGrowthData(res.data);
      setAvgDailyActive(res.avg_daily_active ?? null);
    } catch { /* non-fatal */ }
  }, []);

  const loadUsers = useCallback(async (pageNum = 1, searchStr = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getAdminUsers({ page: pageNum, limit: PAGE_SIZE, search: searchStr || undefined });
      setUsers(res.users);
      setUsersTotal(res.total);
      setNewUserCount(res.users.filter(u => isNewUser(u.created_at)).length);
    } catch (e: any) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getAdminReportedPosts();
      setReports(res.reports);
    } catch (e: any) {
      setError(e.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDogs = useCallback(async (pageNum = 1, searchStr = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getAdminDogs({ page: pageNum, limit: PAGE_SIZE, search: searchStr || undefined });
      setDogs(res.dogs);
      setDogsTotal(res.total);
    } catch (e: any) {
      setError(e.message || 'Failed to load dogs');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFeedback = useCallback(async (pageNum = 1, statusFilter = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getAdminFeedback({ page: pageNum, limit: PAGE_SIZE, status: statusFilter || undefined });
      setFeedbackItems(res.feedback);
      setFeedbackTotal(res.total);
    } catch (e: any) {
      setError(e.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); loadGrowthStats(); }, [loadStats, loadGrowthStats]);

  useEffect(() => {
    if (tab === 'users') loadUsers(page, search);
    if (tab === 'dogs') loadDogs(dogPage, dogSearch);
    if (tab === 'reports') loadReports();
    if (tab === 'feedback') loadFeedback(feedbackPage, feedbackStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab !== 'users') return;
    const t = setTimeout(() => { setPage(1); loadUsers(1, search); }, 400);
    return () => clearTimeout(t);
  }, [search, tab, loadUsers]);

  useEffect(() => {
    if (tab !== 'dogs') return;
    const t = setTimeout(() => { setDogPage(1); loadDogs(1, dogSearch); }, 400);
    return () => clearTimeout(t);
  }, [dogSearch, tab, loadDogs]);

  useEffect(() => {
    if (tab !== 'feedback') return;
    setFeedbackPage(1);
    loadFeedback(1, feedbackStatusFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackStatusFilter, tab]);

  const handlePageChange = (newPage: number) => { setPage(newPage); loadUsers(newPage, search); };
  const handleDogPageChange = (newPage: number) => { setDogPage(newPage); loadDogs(newPage, dogSearch); };

  const handleToggleActive = async (u: AdminUserSummary) => {
    const next = !u.is_active;
    setTogglingUserId(u.id);
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: next } : x));
    try {
      await apiClient.adminToggleUserActive(u.id, next);
    } catch (e: any) {
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: u.is_active } : x));
      alert(e.message || 'Failed to update user');
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleDeleteUser = async (u: AdminUserSummary) => {
    if (!confirm(`Delete "${u.name}"? This permanently removes their account and all associated data.`)) return;
    setDeletingUserId(u.id);
    try {
      await apiClient.adminDeleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setUsersTotal(prev => prev - 1);
    } catch (e: any) {
      alert(e.message || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteDog = async (dogId: string) => {
    if (!confirm('Delete this dog? This will also delete all their health records, vaccinations, and training history. This cannot be undone.')) return;
    setDeletingDogId(dogId);
    try {
      await apiClient.adminDeleteDog(dogId);
      setDogs(prev => prev.filter(d => d.id !== dogId));
      setDogsTotal(prev => prev - 1);
    } catch (e: any) {
      alert(e.message || 'Failed to delete dog');
    } finally {
      setDeletingDogId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId);
    try {
      await apiClient.adminDeletePost(postId);
      setReports(prev => prev.filter(r => r.post_id !== postId));
    } catch (e: any) {
      alert(e.message || 'Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    setDismissingReportId(reportId);
    try {
      await apiClient.adminDismissReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (e: any) {
      alert(e.message || 'Failed to dismiss report');
    } finally {
      setDismissingReportId(null);
    }
  };

  const handleToggleFeedbackStatus = async (item: AdminFeedbackItem) => {
    const next = item.status === 'open' ? 'resolved' : 'open';
    setTogglingFeedbackId(item.id);
    setFeedbackItems(prev => prev.map(f => f.id === item.id ? { ...f, status: next } : f));
    try {
      await apiClient.adminUpdateFeedbackStatus(item.id, next);
    } catch (e: any) {
      setFeedbackItems(prev => prev.map(f => f.id === item.id ? { ...f, status: item.status } : f));
      alert(e.message || 'Failed to update feedback status');
    } finally {
      setTogglingFeedbackId(null);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback entry? This cannot be undone.')) return;
    setDeletingFeedbackId(id);
    try {
      await apiClient.adminDeleteFeedback(id);
      setFeedbackItems(prev => prev.filter(f => f.id !== id));
      setFeedbackTotal(prev => prev - 1);
    } catch (e: any) {
      alert(e.message || 'Failed to delete feedback');
    } finally {
      setDeletingFeedbackId(null);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) return;
    if (!confirm(`Send this email to all active users?`)) return;
    setBroadcastSending(true);
    setBroadcastResult(null);
    try {
      const res = await apiClient.adminSendBroadcastEmail(broadcastSubject, broadcastBody);
      setBroadcastResult({ ok: true, msg: res.message });
      setBroadcastSubject('');
      setBroadcastBody('');
    } catch (e: any) {
      setBroadcastResult({ ok: false, msg: e.message || 'Failed to send broadcast' });
    } finally {
      setBroadcastSending(false);
    }
  };

  const openLightbox = (url: string, label: string) => { setLightboxUrl(url); setLightboxLabel(label); };

  const goToTab = (t: Tab) => setTab(t);
  const totalPages = Math.ceil(usersTotal / PAGE_SIZE);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',  label: 'Overview',       icon: <TrendingUp size={15} /> },
    { id: 'users',     label: 'Users',          icon: <Users size={15} />,         badge: newUserCount || undefined },
    { id: 'dogs',      label: 'Dogs',           icon: <Dog size={15} /> },
    { id: 'reports',   label: 'Reported Posts', icon: <AlertTriangle size={15} />, badge: reports.length || undefined },
    { id: 'email',     label: 'Email',          icon: <Mail size={15} /> },
    { id: 'partners',  label: 'Partners',       icon: <Store size={15} /> },
    { id: 'feedback',  label: 'Feedback',       icon: <MessageSquare size={15} />, badge: feedbackItems.filter(f => f.status === 'open').length || undefined },
  ];

  const inputCls = 'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30 dark:focus:ring-[#a4c9ff]/20';

  return (
    <div className="font-jakarta max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white p-2 transition-colors"
            >
              <X size={24} />
            </button>
            <img src={lightboxUrl} alt={lightboxLabel} className="w-full rounded-2xl object-contain max-h-[80vh] shadow-2xl" />
            {lightboxLabel && (
              <p className="text-center text-white/70 mt-3 text-sm font-medium">{lightboxLabel}</p>
            )}
          </div>
        </div>
      )}

      {/* Individual email compose modal */}
      {composeTarget && (
        <ComposeModal recipient={composeTarget} onClose={() => setComposeTarget(null)} />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#005da7] to-[#0090e7] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6]">Admin Panel</h1>
          <p className="text-xs text-gray-400 dark:text-[#8b919d]">Platform management & moderation</p>
        </div>
      </div>

      {/* Stat cards — always visible */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Users size={18} />} label="Total Users" value={stats.total_users} hint="View all users" accent onClick={() => goToTab('users')} />
          <StatCard icon={<TrendingUp size={18} />} label="New Today" value={stats.new_users_today} sub={`${stats.new_users_this_week} this week`} hint="View new users" accent={stats.new_users_today > 0} onClick={() => goToTab('users')} />
          <StatCard icon={<Dog size={18} />} label="Total Dogs" value={stats.total_dogs} sub={stats.total_users > 0 ? `${(stats.total_dogs / stats.total_users).toFixed(1)} per user` : undefined} hint="Manage dogs" onClick={() => goToTab('dogs')} />
          <StatCard icon={<FileText size={18} />} label="Community Posts" value={stats.total_posts} sub={`${stats.total_events} events`} hint="View reported posts" onClick={() => goToTab('reports')} />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-100 dark:border-white/5">
        <div className="flex gap-0.5 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${
                tab === t.id
                  ? 'border-[#005da7] dark:border-[#a4c9ff] text-[#005da7] dark:text-[#a4c9ff]'
                  : 'border-transparent text-gray-500 dark:text-[#8b919d] hover:text-gray-700 dark:hover:text-[#c1c7d3]'
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {t.badge > 99 ? '99+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {!stats ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400 dark:text-[#8b919d]">Loading stats…</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* New Registrations chart */}
              {growthData.length > 0 && (
                <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-[#c1c7d3] mb-4">New Registrations — last 14 days</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={growthData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#8b919d' }}
                        tickFormatter={v => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        tickLine={false}
                        axisLine={false}
                        interval={1}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#8b919d' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: '#005da7', fillOpacity: 0.06 }} />
                      <Bar dataKey="registrations" fill="#005da7" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Daily Active Users chart */}
              {growthData.length > 0 && (
                <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-[#c1c7d3]">Active Users per Day — last 14 days</h3>
                    {avgDailyActive !== null && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                        avg {avgDailyActive}/day
                      </span>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#8b919d' }}
                        tickFormatter={v => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        tickLine={false}
                        axisLine={false}
                        interval={1}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#8b919d' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        dataKey="active_users"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* User Growth numbers */}
              <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-[#c1c7d3] mb-4">User Growth</h3>
                <div className="space-y-3">
                  {[
                    { label: 'New today',        value: stats.new_users_today,    color: 'blue' as const },
                    { label: 'New this week',    value: stats.new_users_this_week },
                    { label: 'Total registered', value: stats.total_users },
                    ...(stats.active_users_today !== undefined
                      ? [{ label: 'Active today', value: stats.active_users_today, color: 'blue' as const }]
                      : []),
                    ...(avgDailyActive !== null
                      ? [{ label: 'Avg active / day (14d)', value: avgDailyActive, color: 'green' as const }]
                      : []),
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-[#8b919d]">{row.label}</span>
                      <span className={`text-sm font-semibold ${
                        row.color === 'blue'  ? 'text-[#005da7] dark:text-[#a4c9ff]'
                        : row.color === 'green' ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-900 dark:text-[#e2e2e6]'
                      }`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Summary */}
              <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-[#c1c7d3] mb-4">Platform Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Registered dogs', value: stats.total_dogs },
                    { label: 'Community posts', value: stats.total_posts },
                    { label: 'Events created',  value: stats.total_events },
                    { label: 'Avg dogs / user', value: stats.total_users > 0 ? (stats.total_dogs / stats.total_users).toFixed(1) : '—' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-[#8b919d]">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shop placeholder */}
              <div className="md:col-span-2 bg-gray-50 dark:bg-[#1a1c20] border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-gray-400 dark:text-[#414751]">store</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-[#8b919d]">Shop Management — Coming Soon</p>
                  <p className="text-xs text-gray-400 dark:text-[#414751] mt-0.5">Add, edit, and manage products for sale. Planned for a future release.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => { loadStats(); loadGrowthStats(); }}
              className="flex items-center gap-1.5 text-xs text-[#005da7] dark:text-[#a4c9ff] hover:opacity-80 font-medium"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b919d]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30 dark:focus:ring-[#a4c9ff]/20"
              />
            </div>
            <button
              onClick={() => loadUsers(page, search)}
              className="flex items-center gap-1.5 text-xs text-[#005da7] dark:text-[#a4c9ff] hover:opacity-80 font-medium px-3 py-2 bg-[#005da7]/5 dark:bg-[#a4c9ff]/10 rounded-xl"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-[#414751]">
              <Users size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">{search ? 'No users match your search.' : 'No users found.'}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-white/[0.02]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide hidden md:table-cell">Email</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide">Dogs</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide hidden lg:table-cell">Joined</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide hidden lg:table-cell">Last seen</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide">Enabled</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                    {users.map(u => {
                      const isNew = isNewUser(u.created_at);
                      return (
                        <tr
                          key={u.id}
                          className={`transition-colors ${
                            u.is_active
                              ? 'hover:bg-gray-50/60 dark:hover:bg-white/[0.02]'
                              : 'bg-gray-50/80 dark:bg-white/[0.015] opacity-60'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                                u.is_active ? 'bg-gradient-to-br from-[#005da7] to-[#0090e7]' : 'bg-gray-300 dark:bg-gray-600'
                              }`}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`font-medium ${u.is_active ? 'text-gray-900 dark:text-[#e2e2e6]' : 'text-gray-400 dark:text-[#414751] line-through'}`}>
                                    {u.name}
                                  </span>
                                  {isNew && <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">NEW</span>}
                                  {u.is_admin && <span className="bg-[#005da7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">ADMIN</span>}
                                  {!u.is_active && <span className="bg-red-100 dark:bg-red-500/10 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">DISABLED</span>}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-[#8b919d] md:hidden">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-[#8b919d] hidden md:table-cell">{u.email}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                              u.dog_count > 0
                                ? 'bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 text-[#005da7] dark:text-[#a4c9ff]'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-[#414751]'
                            }`}>
                              {u.dog_count}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-[#8b919d] text-xs hidden lg:table-cell">{formatDate(u.created_at)}</td>
                          <td className="px-4 py-3 text-gray-400 dark:text-[#414751] text-xs hidden lg:table-cell">
                            {u.last_seen ? timeAgo(u.last_seen) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                              <Toggle
                                checked={u.is_active}
                                onChange={() => handleToggleActive(u)}
                                loading={togglingUserId === u.id}
                                disabled={u.is_admin}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setComposeTarget({ id: u.id, name: u.name, email: u.email })}
                                title="Send email"
                                className="p-1.5 rounded-lg text-[#005da7] dark:text-[#a4c9ff] hover:bg-[#005da7]/10 dark:hover:bg-[#a4c9ff]/10 transition-colors"
                              >
                                <Mail size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={deletingUserId === u.id || u.is_admin}
                                title={u.is_admin ? 'Cannot delete admin' : 'Delete user'}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                {deletingUserId === u.id
                                  ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  : <Trash2 size={15} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-[#414751]">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, usersTotal)} of {usersTotal}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-gray-600 dark:text-[#c1c7d3] px-2">{page} / {totalPages}</span>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Dogs ── */}
      {tab === 'dogs' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b919d]" />
              <input
                type="text"
                value={dogSearch}
                onChange={e => setDogSearch(e.target.value)}
                placeholder="Search by dog name, breed or owner…"
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30 dark:focus:ring-[#a4c9ff]/20"
              />
            </div>
            <button onClick={() => loadDogs(dogPage, dogSearch)} className="flex items-center gap-1.5 text-xs text-[#005da7] dark:text-[#a4c9ff] hover:opacity-80 font-medium px-3 py-2 bg-[#005da7]/5 dark:bg-[#a4c9ff]/10 rounded-xl">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dogs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-[#414751]">
              <Dog size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">{dogSearch ? 'No dogs match your search.' : 'No dogs found.'}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-white/[0.02]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide">Dog</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide hidden sm:table-cell">Breed</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide hidden md:table-cell">Owner</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide hidden lg:table-cell">Details</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide hidden lg:table-cell">Registered</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                    {dogs.map(dog => {
                      const age = dog.date_of_birth
                        ? (() => {
                            const diff = Date.now() - new Date(dog.date_of_birth).getTime();
                            const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
                            return months < 12 ? `${months}mo` : `${Math.floor(months / 12)}y`;
                          })()
                        : null;

                      return (
                        <tr key={dog.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ${dog.profile_picture ? 'cursor-zoom-in' : ''}`}
                                onClick={() => dog.profile_picture && openLightbox(dog.profile_picture, `${dog.name} · ${dog.breed}`)}
                                title={dog.profile_picture ? 'View full photo' : undefined}
                              >
                                {dog.profile_picture ? (
                                  <img src={dog.profile_picture} alt={dog.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-white font-bold text-sm">{dog.name.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-[#e2e2e6]">{dog.name}</p>
                                <p className="text-xs text-gray-400 dark:text-[#8b919d] sm:hidden">{dog.breed}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-[#8b919d] hidden sm:table-cell">{dog.breed}</td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <p className="text-sm text-gray-700 dark:text-[#c1c7d3] font-medium">{dog.owner_name}</p>
                            <p className="text-xs text-gray-400 dark:text-[#414751]">{dog.owner_email}</p>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-2 flex-wrap">
                              {dog.sex && <span className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-[#8b919d] text-xs px-2 py-0.5 rounded-full capitalize">{dog.sex}</span>}
                              {age && <span className="bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 text-[#005da7] dark:text-[#a4c9ff] text-xs px-2 py-0.5 rounded-full">{age}</span>}
                              {dog.weight && <span className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-[#8b919d] text-xs px-2 py-0.5 rounded-full">{dog.weight} kg</span>}
                              {dog.microchip_id && <span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full" title={`Chip: ${dog.microchip_id}`}>Chipped</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 dark:text-[#414751] text-xs hidden lg:table-cell">{formatDate(dog.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleDeleteDog(dog.id)}
                                disabled={deletingDogId === dog.id}
                                title="Delete dog"
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40"
                              >
                                {deletingDogId === dog.id
                                  ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  : <Trash2 size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {Math.ceil(dogsTotal / PAGE_SIZE) > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-[#414751]">
                    Showing {(dogPage - 1) * PAGE_SIZE + 1}–{Math.min(dogPage * PAGE_SIZE, dogsTotal)} of {dogsTotal}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDogPageChange(dogPage - 1)} disabled={dogPage === 1} className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-gray-600 dark:text-[#c1c7d3] px-2">{dogPage} / {Math.ceil(dogsTotal / PAGE_SIZE)}</span>
                    <button onClick={() => handleDogPageChange(dogPage + 1)} disabled={dogPage === Math.ceil(dogsTotal / PAGE_SIZE)} className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Reported Posts ── */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-[#8b919d]">
              {reports.length} report{reports.length !== 1 ? 's' : ''} pending review
            </p>
            <button onClick={loadReports} className="flex items-center gap-1.5 text-xs text-[#005da7] dark:text-[#a4c9ff] hover:opacity-80 font-medium px-3 py-2 bg-[#005da7]/5 dark:bg-[#a4c9ff]/10 rounded-xl">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-[#414751]">
              <AlertTriangle size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No reported posts. All clear!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <div key={report.id} className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold px-2 py-0.5 rounded-full">Reported</span>
                        <span className="text-xs text-gray-400 dark:text-[#414751]">{timeAgo(report.reported_at)}</span>
                        <span className="text-xs text-gray-400 dark:text-[#414751]">by {report.reporter_name}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] truncate">{report.post_title}</h4>
                      <p className="text-xs text-gray-500 dark:text-[#8b919d] mt-0.5 line-clamp-2">{report.post_content}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs text-gray-400 dark:text-[#414751]">
                          Author: <span className="font-medium text-gray-600 dark:text-[#c1c7d3]">{report.post_author}</span>
                        </span>
                        <span className="text-xs text-gray-400 dark:text-[#414751]">
                          Reason: <span className="font-medium text-orange-600 dark:text-orange-400">{report.reason}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleDismissReport(report.id)} disabled={dismissingReportId === report.id} title="Dismiss report" className="p-2 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors disabled:opacity-40">
                        {dismissingReportId === report.id ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <X size={16} />}
                      </button>
                      <button onClick={() => handleDeletePost(report.post_id)} disabled={deletingPostId === report.post_id} title="Delete post" className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40">
                        {deletingPostId === report.post_id ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Email ── */}
      {tab === 'email' && (
        <div className="space-y-5">
          {/* Broadcast */}
          <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Send size={17} className="text-[#005da7] dark:text-[#a4c9ff]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-[#e2e2e6]">Broadcast Email</h3>
                <p className="text-xs text-gray-400 dark:text-[#414751] mt-0.5">
                  Send an announcement to all {stats?.total_users ?? '…'} active users
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Subject</label>
                <input type="text" value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} placeholder="e.g. New feature: Training tracker is live!" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Message</label>
                <textarea
                  value={broadcastBody}
                  onChange={e => setBroadcastBody(e.target.value)}
                  rows={6}
                  placeholder="Write your message here. Use line breaks for paragraphs."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {broadcastResult && (
                <div className={`rounded-xl px-4 py-3 text-sm border ${broadcastResult.ok ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                  {broadcastResult.msg}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-400 dark:text-[#414751]">
                  Emails are sent in the background. You'll get a count of recipients when queued.
                </p>
                <button
                  onClick={handleBroadcast}
                  disabled={broadcastSending || !broadcastSubject.trim() || !broadcastBody.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#1a1c20] text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0 ml-4"
                >
                  {broadcastSending
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white dark:border-[#1a1c20]/40 dark:border-t-[#1a1c20] rounded-full animate-spin" />
                    : <Send size={15} />}
                  Send to All
                </button>
              </div>
            </div>
          </div>

          {/* Individual email note */}
          <div className="bg-[#005da7]/5 dark:bg-[#a4c9ff]/5 border border-[#005da7]/15 dark:border-[#a4c9ff]/15 rounded-xl p-4 flex items-start gap-3">
            <Mail size={17} className="text-[#005da7] dark:text-[#a4c9ff] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-[#c1c7d3]">Individual emails</p>
              <p className="text-xs text-gray-500 dark:text-[#8b919d] mt-0.5">
                Go to the <button onClick={() => setTab('users')} className="underline text-[#005da7] dark:text-[#a4c9ff] font-medium">Users tab</button> and click the <Mail size={11} className="inline mx-0.5" /> icon on any user row to compose a private email to that user.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Partners ── */}
      {tab === 'partners' && <PartnersTab inputCls={inputCls} />}

      {/* ── Feedback ── */}
      {tab === 'feedback' && (
        <div className="space-y-4">
          {/* Filter + count bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-[#8b919d]">
                {feedbackTotal} item{feedbackTotal !== 1 ? 's' : ''}
              </span>
              {feedbackStatusFilter && (
                <button
                  onClick={() => setFeedbackStatusFilter('')}
                  className="flex items-center gap-1 text-xs text-[#005da7] dark:text-[#a4c9ff] hover:underline"
                >
                  <X size={11} /> clear filter
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {(['', 'open', 'resolved'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFeedbackStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    feedbackStatusFilter === s
                      ? 'bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                      : 'bg-gray-100 dark:bg-[#282a2d] text-gray-600 dark:text-[#8b919d] hover:bg-gray-200 dark:hover:bg-[#32363c]'
                  }`}
                >
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
              <button
                onClick={() => loadFeedback(feedbackPage, feedbackStatusFilter)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-[#c1c7d3] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : feedbackItems.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare size={32} className="mx-auto mb-3 text-gray-300 dark:text-[#414751]" />
              <p className="text-sm text-gray-400 dark:text-[#8b919d]">No feedback found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackItems.map(item => {
                const typeBadge: Record<string, string> = {
                  bug:     'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400',
                  feature: 'bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400',
                  general: 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-[#8b919d]',
                };
                return (
                  <div key={item.id} className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-4 flex gap-3">
                    {/* Left: type badge + status indicator */}
                    <div className="flex-shrink-0 pt-0.5">
                      <div className={`w-2 h-2 rounded-full mt-1 ${item.status === 'open' ? 'bg-amber-400' : 'bg-green-500'}`} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeBadge[item.type] ?? typeBadge.general}`}>
                          {item.type}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.status === 'open'
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] mb-1">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-[#8b919d] whitespace-pre-wrap mb-2">{item.description}</p>
                      {item.image_url && (
                        <button
                          onClick={() => openLightbox(item.image_url!, item.title)}
                          className="mb-2 rounded-lg overflow-hidden border border-gray-100 dark:border-white/10 inline-block"
                        >
                          <img src={item.image_url} alt="Attachment" className="h-24 object-cover" />
                        </button>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-[#414751]">
                        <span>{item.user_name}</span>
                        <span>·</span>
                        <span>{item.user_email}</span>
                        <span>·</span>
                        <span>{timeAgo(item.created_at)}</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <Toggle
                        checked={item.status === 'resolved'}
                        onChange={() => handleToggleFeedbackStatus(item)}
                        loading={togglingFeedbackId === item.id}
                      />
                      <span className="text-[9px] text-center text-gray-400 dark:text-[#414751]">
                        {item.status === 'resolved' ? 'Done' : 'Open'}
                      </span>
                      <button
                        onClick={() => handleDeleteFeedback(item.id)}
                        disabled={deletingFeedbackId === item.id}
                        className="p-1.5 rounded-lg text-gray-300 dark:text-[#414751] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      >
                        {deletingFeedbackId === item.id
                          ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {feedbackTotal > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400 dark:text-[#414751]">
                Page {feedbackPage} of {Math.ceil(feedbackTotal / PAGE_SIZE)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { const p = feedbackPage - 1; setFeedbackPage(p); loadFeedback(p, feedbackStatusFilter); }}
                  disabled={feedbackPage <= 1}
                  className="p-2 rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => { const p = feedbackPage + 1; setFeedbackPage(p); loadFeedback(p, feedbackStatusFilter); }}
                  disabled={feedbackPage >= Math.ceil(feedbackTotal / PAGE_SIZE)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Partners admin tab ────────────────────────────────────────────────────────
const EMPTY_PARTNER = {
  name: '', category_id: '', description: '', phone: '', email: '',
  website: '', address: '', city: '', logo_url: '',
  is_featured: false, is_active: true,
  latitude: null as number | null,
  longitude: null as number | null,
  google_place_id: '',
  photos: [] as string[],
};
const EMPTY_PROMO = { title: '', description: '', discount_text: '', valid_until: '' };

const PartnersTab: React.FC<{ inputCls: string }> = ({ inputCls }) => {
  const [partners, setPartners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PARTNER });
  const [saving, setSaving] = useState(false);
  const [promoTarget, setPromoTarget] = useState<any | null>(null);
  const [promoForm, setPromoForm] = useState({ ...EMPTY_PROMO });
  const [promoSaving, setPromoSaving] = useState(false);
  const [expandedPromos, setExpandedPromos] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        apiClient.getPartners(),
        apiClient.getPartnerCategories(),
      ]);
      setPartners(pRes.partners || []);
      setCategories(cRes.categories || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_PARTNER }); setShowForm(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name || '', category_id: p.category_id || '', description: p.description || '',
      phone: p.phone || '', email: p.email || '', website: p.website || '',
      address: p.address || '', city: p.city || '', logo_url: p.logo_url || '',
      is_featured: p.is_featured, is_active: p.is_active,
      latitude: p.latitude ?? null, longitude: p.longitude ?? null,
      google_place_id: p.google_place_id || '',
      photos: p.photos || [],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category_id) return;
    setSaving(true);
    try {
      if (editing) {
        await apiClient.adminUpdatePartner(editing.id, form);
      } else {
        await apiClient.adminCreatePartner(form);
      }
      setShowForm(false);
      await load();
    } catch (e: any) {
      alert(e.message || 'Failed to save partner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this partner?')) return;
    try {
      await apiClient.adminDeletePartner(id);
      await load();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const handleAddPromo = async () => {
    if (!promoTarget || !promoForm.title.trim()) return;
    setPromoSaving(true);
    try {
      await apiClient.adminCreatePromotion(promoTarget.id, promoForm);
      setPromoForm({ ...EMPTY_PROMO });
      await load();
    } catch (e: any) {
      alert(e.message || 'Failed to add promotion');
    } finally {
      setPromoSaving(false);
    }
  };

  const handleDeletePromo = async (partnerId: string, promoId: string) => {
    if (!window.confirm('Delete this promotion?')) return;
    try {
      await apiClient.adminDeletePromotion(partnerId, promoId);
      await load();
    } catch (e: any) {
      alert(e.message || 'Failed to delete promotion');
    }
  };

  const f = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleLocationPick = (loc: PickedLocation) => {
    setForm(prev => ({
      ...prev,
      name: prev.name || loc.name,
      phone: prev.phone || loc.phone,
      website: prev.website || loc.website,
      address: loc.address,
      city: loc.city,
      latitude: loc.latitude,
      longitude: loc.longitude,
      google_place_id: loc.google_place_id,
      logo_url: prev.logo_url || loc.logo_url,
      photos: prev.photos.length ? prev.photos : loc.photos,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-[#e2e2e6]">Partner Businesses</h2>
          <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">{partners.length} partner{partners.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Add Partner
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-[#e2e2e6] text-sm">
              {editing ? 'Edit Partner' : 'New Partner'}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2d]">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Business Name *</label>
              <input className={inputCls} value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Happy Paws Clinic" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Category *</label>
              <select className={inputCls} value={form.category_id} onChange={e => f('category_id', e.target.value)}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Description</label>
              <textarea className={inputCls} rows={2} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Short description of the business" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Phone</label>
              <input className={inputCls} value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+359 888 123 456" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Email</label>
              <input className={inputCls} type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="hello@business.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Website</label>
              <input className={inputCls} value={form.website} onChange={e => f('website', e.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">
                Photos
                {form.photos.length > 0 && (
                  <span className="ml-2 text-green-600 dark:text-green-400 font-normal">
                    ✓ {form.photos.length} photo{form.photos.length > 1 ? 's' : ''} from Google Maps
                  </span>
                )}
              </label>
              {form.photos.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-400 dark:text-[#8b919d]">Click a photo to set it as the cover image.</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {form.photos.map((url, i) => (
                      <div key={i} className="relative flex-shrink-0 group cursor-pointer"
                        onClick={() => {
                          if (i === 0) return;
                          const reordered = [url, ...form.photos.filter((_, j) => j !== i)];
                          f('photos', reordered);
                          f('logo_url', url);
                        }}
                      >
                        <img
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className={`h-20 w-32 object-cover rounded-lg border-2 transition-all ${
                            i === 0
                              ? 'border-[#005da7] ring-2 ring-[#005da7]/30'
                              : 'border-gray-200 dark:border-white/10 hover:border-[#005da7]/50 opacity-80 hover:opacity-100'
                          }`}
                        />
                        {i === 0 ? (
                          <span className="absolute top-1 left-1 text-[10px] bg-[#005da7] text-white px-1.5 py-0.5 rounded font-semibold">
                            Cover
                          </span>
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/20 transition-all">
                            <span className="text-[10px] text-white font-semibold opacity-0 group-hover:opacity-100 bg-black/60 px-2 py-1 rounded">
                              Set cover
                            </span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); f('photos', form.photos.filter((_, j) => j !== i)); }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] hidden group-hover:flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-[#8b919d] py-2">
                  Photos will be auto-fetched when you select a business from the map search below.
                </p>
              )}
              <input
                className={`${inputCls} mt-2`}
                value={form.logo_url}
                onChange={e => f('logo_url', e.target.value)}
                placeholder="Logo / cover image URL (auto-filled or enter manually)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">Address</label>
              <input className={inputCls} value={form.address} onChange={e => f('address', e.target.value)} placeholder="Auto-filled from map search" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1">City</label>
              <input className={inputCls} value={form.city} onChange={e => f('city', e.target.value)} placeholder="Auto-filled from map search" />
            </div>
          </div>

          {/* Location picker */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-2">
              Location on Map
              {form.google_place_id && (
                <span className="ml-2 text-green-600 dark:text-green-400 font-normal">✓ Linked to Google Maps</span>
              )}
            </label>
            <PartnerLocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              googlePlaceId={form.google_place_id}
              onPick={handleLocationPick}
              onCoordsChange={(lat, lng) => setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => f('is_featured', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#005da7] focus:ring-[#005da7]/30" />
              <span className="text-sm text-gray-700 dark:text-[#c1c7d3]">Featured partner</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => f('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#005da7] focus:ring-[#005da7]/30" />
              <span className="text-sm text-gray-700 dark:text-[#c1c7d3]">Active (visible to users)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.category_id}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity">
              {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
              {editing ? 'Save Changes' : 'Create Partner'}
            </button>
          </div>
        </div>
      )}

      {/* Partner list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#005da7] dark:border-[#a4c9ff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-16">
          <Store size={40} className="mx-auto mb-3 text-gray-300 dark:text-[#414751]" />
          <p className="text-sm text-gray-500 dark:text-[#8b919d]">No partners yet. Add your first partner business.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map(partner => (
            <div key={partner.id} className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
              {/* Partner row */}
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#282a2d] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {partner.logo_url
                    ? <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-contain" />
                    : <span className="material-symbols-outlined text-gray-400 dark:text-[#8b919d] text-[20px]">{partner.category_icon || 'store'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6] truncate">{partner.name}</p>
                    {partner.is_featured && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-bold">Featured</span>
                    )}
                    {!partner.is_active && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-[#282a2d] text-gray-500 font-bold">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-[#8b919d]">
                    {partner.category_name_en}
                    {partner.city ? ` · ${partner.city}` : ''}
                    {partner.phone ? ` · ${partner.phone}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setExpandedPromos(expandedPromos === partner.id ? null : partner.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">local_offer</span>
                    {partner.promotions?.length ?? 0}
                  </button>
                  <button
                    onClick={() => openEdit(partner)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Promotions panel */}
              {expandedPromos === partner.id && (
                <div className="border-t border-gray-100 dark:border-white/5 p-4 space-y-3 bg-gray-50/50 dark:bg-[#282a2d]/30">
                  <p className="text-xs font-semibold text-gray-500 dark:text-[#8b919d] uppercase tracking-wider">Promotions</p>

                  {/* Existing promos */}
                  {partner.promotions && partner.promotions.length > 0 ? (
                    <div className="space-y-2">
                      {partner.promotions.map((promo: any) => (
                        <div key={promo.id} className="flex items-start justify-between gap-2 bg-white dark:bg-[#1e2023] rounded-xl px-3 py-2 border border-gray-100 dark:border-white/5">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 dark:text-[#e2e2e6]">{promo.title}</p>
                            {promo.discount_text && <p className="text-xs text-orange-500 font-bold">{promo.discount_text}</p>}
                            {promo.description && <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">{promo.description}</p>}
                            {promo.valid_until && <p className="text-xs text-gray-400 dark:text-[#414751] mt-0.5">Until {new Date(promo.valid_until).toLocaleDateString()}</p>}
                          </div>
                          <button
                            onClick={() => handleDeletePromo(partner.id, promo.id)}
                            className="p-1 rounded-lg text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-[#414751]">No promotions yet.</p>
                  )}

                  {/* Add promo form */}
                  {promoTarget?.id === partner.id ? (
                    <div className="space-y-2 pt-1">
                      <input
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#005da7]/30"
                        placeholder="Promotion title *"
                        value={promoForm.title}
                        onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))}
                      />
                      <input
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#005da7]/30"
                        placeholder="Discount text (e.g. 20% off)"
                        value={promoForm.discount_text}
                        onChange={e => setPromoForm(p => ({ ...p, discount_text: e.target.value }))}
                      />
                      <input
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#005da7]/30"
                        placeholder="Description (optional)"
                        value={promoForm.description}
                        onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))}
                      />
                      <input
                        type="date"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1e2023] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#e2e2e6] focus:outline-none focus:ring-1 focus:ring-[#005da7]/30"
                        value={promoForm.valid_until}
                        onChange={e => setPromoForm(p => ({ ...p, valid_until: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setPromoTarget(null); setPromoForm({ ...EMPTY_PROMO }); }}
                          className="px-3 py-1.5 text-xs rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddPromo}
                          disabled={promoSaving || !promoForm.title.trim()}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                        >
                          {promoSaving ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Plus size={11} />}
                          Add Promotion
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setPromoTarget(partner); setPromoForm({ ...EMPTY_PROMO }); }}
                      className="flex items-center gap-1.5 text-xs text-[#005da7] dark:text-[#a4c9ff] font-medium hover:underline"
                    >
                      <Plus size={12} />
                      Add promotion
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
