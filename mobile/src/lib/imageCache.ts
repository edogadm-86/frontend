import { Capacitor } from '@capacitor/core';

/**
 * Cache remote image and return a URL safe to use in <img>.
 * - On web: returns a blob: URL (created via fetch) to bypass CORS.
 * - On native (Android/iOS): returns the direct backend URL (no CORS issues in WebView).
 */
export async function cacheImageToDevice(remoteUrl: string): Promise<string> {
  if (!remoteUrl) throw new Error('No image URL');

  if (Capacitor.getPlatform() === 'web') {
    try {
      const res = await fetch(remoteUrl, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log('[cacheImageToDevice] Web blob URL:', blobUrl);
      return blobUrl;
    } catch (e) {
      console.warn('[cacheImageToDevice] Web blob fetch failed, fallback to direct URL:', e);
      return remoteUrl;
    }
  }

  // Native (Android/iOS) → just use the direct URL
  console.log('[cacheImageToDevice] Native direct URL:', remoteUrl);
  return remoteUrl;
}

/** Invalidate cached copy (web only, revokes blob URL). */
export async function invalidateCachedImage(remoteUrl: string) {
  if (Capacitor.getPlatform() === 'web' && remoteUrl.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(remoteUrl);
      console.log('[invalidateCachedImage] Revoked blob URL:', remoteUrl);
    } catch {
      /* ignore */
    }
  }
}
