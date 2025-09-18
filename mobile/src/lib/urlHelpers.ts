// src/utils/urlHelpers.ts
import { API_BASE_URL } from '../config'; // e.g. "https://edog.dogpass.net/api"

export const apiOrigin = (() => {
  try {
    const url = new URL(API_BASE_URL);
    return url.origin; // "https://edog.dogpass.net"
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
    return ''; // signal "use only for preview"
  }

  // 2) If backend/DB gave you '/uploads/<filename>', normalize to API route
  if (u.startsWith('/uploads/')) {
    return toAbsoluteApiUrl(`/api${u}`);
  }

  // 3) If already in /api/uploads, normalize it
  if (u.startsWith('/api/uploads/')) {
    return toAbsoluteApiUrl(u);
  }

  // 4) If it's a bare filename, map to your route
  if (!u.includes('/')) {
    return toAbsoluteApiUrl(`/api/uploads/${u}`);
  }

  // 5) If it's already absolute http(s), just return it
  if (/^https?:\/\//i.test(u)) {
    return u;
  }

  // 6) Fallback: assume it's relative to /api/uploads
  return toAbsoluteApiUrl(`/api/uploads/${u}`);
};
