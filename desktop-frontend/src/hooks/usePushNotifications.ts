import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function swReady(timeoutMs = 8000): Promise<ServiceWorkerRegistration> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Service worker not ready')), timeoutMs);
    navigator.serviceWorker.ready.then((reg) => {
      clearTimeout(timer);
      resolve(reg);
    });
  });
}

export interface NotificationPrefs {
  push_enabled: boolean;
  vaccinations: boolean;
  appointments: boolean;
  medications: boolean;
  lost_dog_alerts: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  push_enabled: true,
  vaccinations: true,
  appointments: true,
  medications: true,
  lost_dog_alerts: true,
};

export type SubscribeError = 'permission_denied' | 'sw_not_ready' | 'server_error' | 'unknown';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SubscribeError | null>(null);

  const token = localStorage.getItem('authToken');

  const authFetch = useCallback(
    (path: string, options: RequestInit = {}) =>
      fetch(`${API_BASE_URL}/push${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers as Record<string, string> | undefined),
        },
      }),
    [token]
  );

  useEffect(() => {
    const supported =
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window;
    setIsSupported(supported);

    if (!supported) return;

    setPermission(Notification.permission);

    // Check if already subscribed (non-blocking)
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(!!sub))
      .catch(() => {});

    // Load prefs from backend
    if (token) {
      authFetch('/prefs')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.prefs) setPrefs((p) => ({ ...p, ...data.prefs }));
        })
        .catch(() => {});
    }
  }, [token]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setLoading(true);
    setError(null);

    try {
      // 1. Request browser permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError('permission_denied');
        return false;
      }

      // 2. Get VAPID public key from backend
      const keyRes = await authFetch('/vapid-public-key');
      if (!keyRes.ok) {
        setError('server_error');
        return false;
      }
      const { vapidPublicKey } = await keyRes.json();

      // 3. Get service worker registration (with timeout)
      let reg: ServiceWorkerRegistration;
      try {
        reg = await swReady();
      } catch {
        setError('sw_not_ready');
        return false;
      }

      // 4. Subscribe via PushManager
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // 5. Save subscription to backend
      const subJson = subscription.toJSON();
      const res = await authFetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint: subJson.endpoint, keys: subJson.keys }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        // Push current prefs to backend so defaults are saved
        await authFetch('/prefs', { method: 'PUT', body: JSON.stringify(prefs) });
        return true;
      }

      setError('server_error');
      return false;
    } catch (err) {
      console.error('Push subscribe error:', err);
      setError('unknown');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, authFetch, prefs]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const reg = await swReady();
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;

      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await authFetch('/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint }),
      });
      setIsSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe error:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const savePrefs = useCallback(
    async (newPrefs: NotificationPrefs): Promise<void> => {
      setPrefs(newPrefs);
      try {
        await authFetch('/prefs', { method: 'PUT', body: JSON.stringify(newPrefs) });
      } catch (err) {
        console.error('Save prefs error:', err);
      }
    },
    [authFetch]
  );

  return { isSupported, permission, isSubscribed, prefs, loading, error, subscribe, unsubscribe, savePrefs };
}
