import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { Share } from '@capacitor/share';

function fileNameFromDoc(docUrl: string, fallback = 'document.pdf') {
  try {
    const u = new URL(docUrl);
    const last = u.pathname.split('/').pop() || fallback;
    return last.includes('.') ? last : fallback;
  } catch {
    return fallback;
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

export async function openDocument(remoteUrl: string, name?: string) {
  if (!remoteUrl) return;

  const fileName = fileNameFromDoc(remoteUrl, name || 'document.pdf');

  // WEB
  if (Capacitor.getPlatform() === 'web') {
    const res = await fetch(remoteUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }

  // NATIVE
  let base64: string;
  try {
    const resp = await CapacitorHttp.get({ url: remoteUrl, responseType: 'arraybuffer' });
    const bytes = new Uint8Array(resp.data);
    base64 = btoa(String.fromCharCode(...bytes));
  } catch {
    const res = await fetch(remoteUrl);
    const blob = await res.blob();
    base64 = await blobToBase64(blob);
  }

  await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
  });

  const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });

  await Share.share({
    title: 'Open Document',
    text: fileName,
    url: Capacitor.convertFileSrc(uri),
  });
}
