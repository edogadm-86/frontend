// src/utils/urlHelpers.ts
import { API_BASE_URL } from '../config'; // e.g. "http://localhost:3001/api"

export const apiOrigin = (() => {
  try { 
    const url = new URL(API_BASE_URL);
    return url.origin; 
  } catch { 
    return 'http://localhost:3001'; 
  }
})();

/** Ensure an absolute http(s) URL pointing to the API origin. */
export const toAbsoluteApiUrl = (path: string) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiOrigin}${normalized}`;
};

/** Normalize any upload return into the actual public URL your backend serves. */
export const normalizeUploadUrl = (u: string) => {
  if (!u) return u;

  // 1) Never persist blob: URLs — those are only for local previews
  if (u.startsWith('blob:')) {
    return ''; // signal "don't persist"; your caller can keep a local preview if needed
  }

  // 2) If backend/DB gave you '/uploads/<filename>', convert to your real route:
  if (u.startsWith('/uploads/')) {
    const filename = u.split('/').pop();
    return toAbsoluteApiUrl(`/uploads/${filename}`);
  }

  // 3) If it's already your real route, just make it absolute:
  if (u.startsWith('/api/uploads/')) {
    return toAbsoluteApiUrl(u);
  }

  // 4) If it's a bare filename, also map to your route:
  if (!u.includes('/')) {
    return toAbsoluteApiUrl(`/uploads/${u}`);
  }

  // 5) If it's already absolute http(s), keep it:
  return u;
};