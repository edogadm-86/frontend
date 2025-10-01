// src/lib/imageCache.ts
import { Capacitor } from '@capacitor/core';
import { Http } from '@capacitor-community/http';

function extFromUrl(url: string): string {
  const m = url.split('?')[0].match(/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i);
  return m ? m[1].toLowerCase() : 'jpeg';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/**
 * Downloads a remote image URL and returns a WebView-safe URL.
 * - Web: blob: URL (URL.createObjectURL)
 * - Native: base64 data URI (always works in <img>)
 */
export async function cacheImageToDevice(remoteUrl: string): Promise<string> {
  if (!remoteUrl) throw new Error('cacheImageToDevice: remoteUrl is empty');

  const platform = Capacitor.getPlatform();

  // ---- Web (vite dev, desktop browsers) ----
  if (platform === 'web') {
    const res = await fetch(remoteUrl, { credentials: 'omit', cache: 'no-store' });
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  // ---- Native (Android/iOS) ----
  let base64: string | undefined;
  let mime = `image/${extFromUrl(remoteUrl)}`;

  try {
    const resp = await Http.get({
      url: remoteUrl,
      responseType: 'arraybuffer', // some devices ignore this
    });

    if (resp?.data instanceof ArrayBuffer) {
      base64 = arrayBufferToBase64(resp.data);
    } else if (typeof resp?.data === 'string') {
      base64 = resp.data.replace(/^data:.*;base64,/, '');
      const match = resp.data.match(/^data:(.*?);base64,/);
      if (match) mime = match[1];
    } else {
      console.warn("⚠️ Http.get returned unexpected type", resp);
    }
  } catch (err) {
    console.error("❌ Http.get failed", err);
  }

  if (!base64) {
    alert("❌ Failed to download image\nURL: " + remoteUrl);
    throw new Error("Failed to download image or empty response");
  }

  const finalUri = `data:${mime};base64,${base64}`;

  // 🔔 Debug info: show both input + output
  alert(
    "📷 cacheImageToDevice debug\n\n" +
    "Remote URL:\n" + remoteUrl + "\n\n" +
    "Final URI length: " + finalUri.length
  );

  return finalUri;
}
