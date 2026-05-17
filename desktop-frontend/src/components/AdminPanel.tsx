import React, { useEffect, useState, useCallback } from 'react';
import { Users, TrendingUp, Dog, FileText, Search, RefreshCw, Trash2, X, Shield, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../lib/api';
import { AdminStats, AdminUserSummary, AdminDog, AdminReportedPost } from '../types';

type Tab = 'overview' | 'users' | 'dogs' | 'reports';

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

// ── Toggle switch ────────────────────────────────────────────────────────────
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
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    )}
  </button>
);

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  hint?: string;
  accent?: boolean;
  onClick?: () => void;
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

// ── Main component ────────────────────────────────────────────────────────────
export const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
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
  const [newUserCount, setNewUserCount] = useState(0);

  const [dogs, setDogs] = useState<AdminDog[]>([]);
  const [dogsTotal, setDogsTotal] = useState(0);
  const [dogPage, setDogPage] = useState(1);
  const [dogSearch, setDogSearch] = useState('');
  const [deletingDogId, setDeletingDogId] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  const loadStats = useCallback(async () => {
    try {
      const res = await apiClient.getAdminStats();
      setStats(res.stats);
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

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (tab === 'users') loadUsers(page, search);
    if (tab === 'dogs') loadDogs(dogPage, dogSearch);
    if (tab === 'reports') loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Debounced search — users
  useEffect(() => {
    if (tab !== 'users') return;
    const t = setTimeout(() => { setPage(1); loadUsers(1, search); }, 400);
    return () => clearTimeout(t);
  }, [search, tab, loadUsers]);

  // Debounced search — dogs
  useEffect(() => {
    if (tab !== 'dogs') return;
    const t = setTimeout(() => { setDogPage(1); loadDogs(1, dogSearch); }, 400);
    return () => clearTimeout(t);
  }, [dogSearch, tab, loadDogs]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadUsers(newPage, search);
  };

  const handleToggleActive = async (u: AdminUserSummary) => {
    const next = !u.is_active;
    setTogglingUserId(u.id);
    // optimistic update
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: next } : x));
    try {
      await apiClient.adminToggleUserActive(u.id, next);
    } catch (e: any) {
      // revert on failure
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: u.is_active } : x));
      alert(e.message || 'Failed to update user');
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleDogPageChange = (newPage: number) => {
    setDogPage(newPage);
    loadDogs(newPage, dogSearch);
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

  const goToTab = (t: Tab) => setTab(t);

  const totalPages = Math.ceil(usersTotal / PAGE_SIZE);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',  label: 'Overview',        icon: <TrendingUp size={15} /> },
    { id: 'users',     label: 'Users',            icon: <Users size={15} />,         badge: newUserCount || undefined },
    { id: 'dogs',      label: 'Dogs',             icon: <Dog size={15} /> },
    { id: 'reports',   label: 'Reported Posts',   icon: <AlertTriangle size={15} />, badge: reports.length || undefined },
  ];

  return (
    <div className="font-jakarta max-w-6xl mx-auto px-4 py-6 space-y-6">

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

      {/* Stat cards — always visible, clickable */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Users size={18} />}
            label="Total Users"
            value={stats.total_users}
            hint="View all users"
            accent
            onClick={() => goToTab('users')}
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="New Today"
            value={stats.new_users_today}
            sub={`${stats.new_users_this_week} this week`}
            hint="View new users"
            accent={stats.new_users_today > 0}
            onClick={() => goToTab('users')}
          />
          <StatCard
            icon={<Dog size={18} />}
            label="Total Dogs"
            value={stats.total_dogs}
            sub={stats.total_users > 0 ? `${(stats.total_dogs / stats.total_users).toFixed(1)} per user` : undefined}
            hint="Manage dogs"
            onClick={() => goToTab('dogs')}
          />
          <StatCard
            icon={<FileText size={18} />}
            label="Community Posts"
            value={stats.total_posts}
            sub={`${stats.total_events} events`}
            hint="View reported posts"
            onClick={() => goToTab('reports')}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-100 dark:border-white/5">
        <div className="flex gap-0.5">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
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
              <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-[#c1c7d3] mb-4">User Growth</h3>
                <div className="space-y-3">
                  {[
                    { label: 'New today',       value: stats.new_users_today,    color: true },
                    { label: 'New this week',   value: stats.new_users_this_week },
                    { label: 'Total registered',value: stats.total_users },
                    ...(stats.active_users_today !== undefined
                      ? [{ label: 'Active today', value: stats.active_users_today, color: true }]
                      : []),
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-[#8b919d]">{row.label}</span>
                      <span className={`text-sm font-semibold ${row.color ? 'text-[#005da7] dark:text-[#a4c9ff]' : 'text-gray-900 dark:text-[#e2e2e6]'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-[#c1c7d3] mb-4">Platform Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Registered dogs',  value: stats.total_dogs },
                    { label: 'Community posts',  value: stats.total_posts },
                    { label: 'Events created',   value: stats.total_events },
                    { label: 'Avg dogs / user',  value: stats.total_users > 0 ? (stats.total_dogs / stats.total_users).toFixed(1) : '—' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-[#8b919d]">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-[#e2e2e6]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

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
              onClick={loadStats}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                    {users.map(u => {
                      const isNew = isNewUser(u.created_at);
                      const isSelf = false; // admin can't disable self — enforced server-side too
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
                                u.is_active
                                  ? 'bg-gradient-to-br from-[#005da7] to-[#0090e7]'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`font-medium ${u.is_active ? 'text-gray-900 dark:text-[#e2e2e6]' : 'text-gray-400 dark:text-[#414751] line-through'}`}>
                                    {u.name}
                                  </span>
                                  {isNew && (
                                    <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">NEW</span>
                                  )}
                                  {u.is_admin && (
                                    <span className="bg-[#005da7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">ADMIN</span>
                                  )}
                                  {!u.is_active && (
                                    <span className="bg-red-100 dark:bg-red-500/10 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">DISABLED</span>
                                  )}
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
                            <div className="flex items-center justify-center gap-2">
                              <Toggle
                                checked={u.is_active}
                                onChange={() => handleToggleActive(u)}
                                loading={togglingUserId === u.id}
                                disabled={u.is_admin}
                              />
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
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-gray-600 dark:text-[#c1c7d3] px-2">{page} / {totalPages}</span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
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
            <button
              onClick={() => loadDogs(dogPage, dogSearch)}
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
                              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
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
                              {dog.sex && (
                                <span className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-[#8b919d] text-xs px-2 py-0.5 rounded-full capitalize">
                                  {dog.sex}
                                </span>
                              )}
                              {age && (
                                <span className="bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 text-[#005da7] dark:text-[#a4c9ff] text-xs px-2 py-0.5 rounded-full">
                                  {age}
                                </span>
                              )}
                              {dog.weight && (
                                <span className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-[#8b919d] text-xs px-2 py-0.5 rounded-full">
                                  {dog.weight} kg
                                </span>
                              )}
                              {dog.microchip_id && (
                                <span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full" title={`Chip: ${dog.microchip_id}`}>
                                  Chipped
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 dark:text-[#414751] text-xs hidden lg:table-cell">
                            {formatDate(dog.created_at)}
                          </td>
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
                    <button
                      onClick={() => handleDogPageChange(dogPage - 1)}
                      disabled={dogPage === 1}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-gray-600 dark:text-[#c1c7d3] px-2">{dogPage} / {Math.ceil(dogsTotal / PAGE_SIZE)}</span>
                    <button
                      onClick={() => handleDogPageChange(dogPage + 1)}
                      disabled={dogPage === Math.ceil(dogsTotal / PAGE_SIZE)}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
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
            <button
              onClick={loadReports}
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
                        <span className="bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Reported
                        </span>
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
                      <button
                        onClick={() => handleDismissReport(report.id)}
                        disabled={dismissingReportId === report.id}
                        title="Dismiss report"
                        className="p-2 rounded-lg text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors disabled:opacity-40"
                      >
                        {dismissingReportId === report.id
                          ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          : <X size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeletePost(report.post_id)}
                        disabled={deletingPostId === report.post_id}
                        title="Delete post"
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      >
                        {deletingPostId === report.post_id
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={16} />}
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
  );
};
