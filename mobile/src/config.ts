// src/config.ts
const raw = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const trim = (s: string) => s.replace(/\/+$/, '');
const join = (base: string, path: string) =>
  `${trim(base)}/${path.replace(/^\/+/, '')}`;

// If your env already includes /api, remove the next line and just export trim(raw).
export const API_BASE_URL = join(raw, 'api');
