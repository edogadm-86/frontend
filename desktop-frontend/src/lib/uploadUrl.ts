// Uploaded files may have been saved with an absolute URL from whichever
// domain was used at upload time. Strip the origin so the path is always
// relative to the current host, making images work on any domain.
const UPLOAD_ORIGINS = new Set([
  'edog.dogpass.net',
  'edog.bg',
  'www.edog.bg',
  'test.edog.bg',
  'localhost',
]);

export function resolveUploadUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const { hostname, pathname, search } = new URL(url);
    if (UPLOAD_ORIGINS.has(hostname)) return pathname + search;
  } catch {
    // already relative — use as-is
  }
  return url;
}

// Google Maps JS SDK saves photos as internal session URLs (js/PhotoService.GetPhoto)
// that carry a short-lived `token` and an `r_url` tied to the page domain. They expire
// and break when viewed from a different domain. Convert them to the stable REST endpoint
// (/maps/api/place/photo?photo_reference=...) which has no referrer or session dependency.
export function toStablePlacePhotoUrl(url: string, apiKey: string): string {
  if (!url || !url.includes('PhotoService.GetPhoto')) return url;
  // The photo reference is the value of the protobuf-encoded `1s` field in the query string.
  const match = url.match(/[?&]1s([^&]+)/);
  if (!match) return url;
  const ref = match[1];
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${encodeURIComponent(ref)}&key=${encodeURIComponent(apiKey)}`;
}
