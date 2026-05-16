import webpush from 'web-push';
import pool from '../config/database';

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@edog.app'}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
}

export const sendPushToUser = async (
  userId: string,
  category: 'vaccinations' | 'appointments' | 'medications' | 'lost_dog_alerts',
  payload: PushPayload
): Promise<void> => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;

  try {
    // Check user's notification preferences for this category
    const prefsResult = await pool.query(
      `SELECT push_enabled, ${category} FROM user_notification_prefs WHERE user_id = $1`,
      [userId]
    );

    const prefs = prefsResult.rows[0];
    if (prefs && (!prefs.push_enabled || !prefs[category])) return;

    // Get all push subscriptions for this user
    const subsResult = await pool.query(
      `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1`,
      [userId]
    );

    for (const sub of subsResult.rows) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };

      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (err: any) {
        // 410 Gone = subscription expired; clean it up
        if (err.statusCode === 410) {
          await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
        } else {
          console.error(`Push send failed for subscription ${sub.id}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.error('sendPushToUser error:', error);
  }
};

// Broadcast to all users who opted in to lost_dog_alerts (excluding the poster)
export const broadcastLostDogAlert = async (
  excludeUserId: string,
  dogName: string,
  location?: string
): Promise<void> => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;

  try {
    const result = await pool.query(
      `SELECT ps.id, ps.endpoint, ps.p256dh, ps.auth
       FROM push_subscriptions ps
       JOIN user_notification_prefs unp ON unp.user_id = ps.user_id
       WHERE ps.user_id != $1
         AND unp.push_enabled = true
         AND unp.lost_dog_alerts = true`,
      [excludeUserId]
    );

    const payload: PushPayload = {
      title: 'Lost Dog Alert',
      body: location
        ? `A dog named "${dogName}" was reported lost near ${location}.`
        : `A dog named "${dogName}" was reported lost in your area.`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `lost-dog-${Date.now()}`,
      url: '/community',
    };

    for (const sub of result.rows) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (err: any) {
        if (err.statusCode === 410) {
          await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
        }
      }
    }
  } catch (error) {
    console.error('broadcastLostDogAlert error:', error);
  }
};
