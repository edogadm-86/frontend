import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Return the public VAPID key so the frontend can subscribe
router.get('/vapid-public-key', (_req: Request, res: Response) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(503).json({ error: 'Push notifications not configured' });
  }
  res.json({ vapidPublicKey: key });
});

// Save a new push subscription for the authenticated user
router.post('/subscribe', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  try {
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, p256dh = $3, auth = $4`,
      [userId, endpoint, keys.p256dh, keys.auth]
    );

    // Create default prefs row if it doesn't exist yet
    await pool.query(
      `INSERT INTO user_notification_prefs (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('subscribe error:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Remove a push subscription
router.post('/unsubscribe', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint required' });
  }

  try {
    await pool.query(
      'DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [userId, endpoint]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

// Get notification preferences
router.get('/prefs', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const result = await pool.query(
      'SELECT push_enabled, vaccinations, appointments, medications, lost_dog_alerts FROM user_notification_prefs WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Return defaults
      return res.json({
        prefs: {
          push_enabled: true,
          vaccinations: true,
          appointments: true,
          medications: true,
          lost_dog_alerts: true,
        },
      });
    }

    res.json({ prefs: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Update notification preferences
router.put('/prefs', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { push_enabled, vaccinations, appointments, medications, lost_dog_alerts } = req.body;

  try {
    await pool.query(
      `INSERT INTO user_notification_prefs (user_id, push_enabled, vaccinations, appointments, medications, lost_dog_alerts)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         push_enabled = $2,
         vaccinations = $3,
         appointments = $4,
         medications = $5,
         lost_dog_alerts = $6,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, push_enabled, vaccinations, appointments, medications, lost_dog_alerts]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Send a test push to the authenticated user
router.post('/test', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const { sendPushToUser } = await import('../services/pushService');
    await sendPushToUser(userId, 'vaccinations', {
      title: '🐾 eDog Test Notification',
      body: 'Push notifications are working correctly!',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'test',
      url: '/',
    });
    res.json({ success: true, message: 'Test push sent' });
  } catch (error) {
    console.error('Test push error:', error);
    res.status(500).json({ error: 'Failed to send test push' });
  }
});

export default router;
