import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
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


export async function openDocument(remoteUrl: string, name?: string) {
  if (!remoteUrl) return;

  const fileName = fileNameFromDoc(remoteUrl, name || 'document');

  // WEB
  if (Capacitor.getPlatform() === 'web') {
    try {
      const res = await fetch(remoteUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // open in new tab if PDF or image
      if (fileName.match(/\.(pdf|png|jpe?g|gif|webp)$/i)) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // trigger download otherwise
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error('openDocument web error:', e);
    }
    return;
  }

  // NATIVE
  try {
    const res = await fetch(remoteUrl, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
    const blob = await res.blob();

    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const path = `${Date.now()}-${fileName}`;
    await Filesystem.writeFile({
      data: base64,
      path,
      directory: Directory.Cache,
    });

    const fileUri = (await Filesystem.getUri({ path, directory: Directory.Cache })).uri;

    await Share.share({
      title: fileName,
      url: fileUri,
    });
  } catch (e) {
    console.error('openDocument native error:', e);
  }
}

