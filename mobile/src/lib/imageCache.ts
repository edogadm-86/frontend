import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

function fileNameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').pop() || 'image';
    const ext = last.includes('.') ? last.split('.').pop() : 'jpg';
    const hash = btoa(url).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
    return `edog-${hash}.${ext}`;
  } catch {
    return `edog-${Date.now()}.jpg`;
  }
}

async function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Cache remote image and return a URL safe to use in <img>.
 * - On web: returns a blob: URL (created via fetch) -> bypasses CORP.
 * - On native: saves to Filesystem Cache and returns a file:// converted URL.
 */
export async function cacheImageToDevice(remoteUrl: string): Promise<string> {
  if (!remoteUrl) throw new Error('No image URL');

  // WEB: use fetch -> Blob -> ObjectURL (same-origin blob:, avoids CORP)
  if (Capacitor.getPlatform() === 'web') {
    try {
      const res = await fetch(remoteUrl, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn('Web blob fallback failed, using remote URL:', e);
      return remoteUrl; // best-effort fallback
    }
  }

  // NATIVE (Android/iOS)
  const fileName = fileNameFromUrl(remoteUrl);
  const path = `images/${fileName}`;

  // already cached?
  try {
    const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
    return Capacitor.convertFileSrc(uri);
  } catch {
    /* not cached yet */
  }

  // download (prefer native HTTP)
  let base64: string;
  try {
    const resp = await CapacitorHttp.get({ url: remoteUrl, responseType: 'arraybuffer' });
    const bytes = new Uint8Array(resp.data);
    base64 = btoa(String.fromCharCode(...bytes));
  } catch {
    const res = await fetch(remoteUrl, { mode: 'cors' });
    const blob = await res.blob();
    base64 = await blobToBase64(blob);
  }

  await Filesystem.writeFile({
    path,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  });

  const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
  return Capacitor.convertFileSrc(uri);
}

/** Remove cached copy (call after user changes picture). */
export async function invalidateCachedImage(remoteUrl: string) {
  if (!remoteUrl) return;

  if (Capacitor.getPlatform() === 'web') {
    // No persistent cache to clear; blob URLs are ephemeral & revoked by caller.
    return;
  }
  const fileName = fileNameFromUrl(remoteUrl);
  const path = `images/${fileName}`;
  try {
    await Filesystem.deleteFile({ path, directory: Directory.Cache });
  } catch {
    /* ignore */
  }
}
