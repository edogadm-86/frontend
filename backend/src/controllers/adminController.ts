import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { sendEmail } from '../config/email';

const buildAdminEmailHtml = (recipientName: string, body: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #005da7; color: white; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 22px;">eDog</h1>
    </div>
    <div style="padding: 24px; background: #ffffff;">
      <p style="color: #333; margin: 0 0 16px 0;">Hello ${recipientName},</p>
      <div style="color: #333; line-height: 1.7;">${body.replace(/\n/g, '<br>')}</div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px; margin: 0;">You received this email as a registered eDog user.</p>
    </div>
  </div>
`;

export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [usersRes, dogsRes, postsRes, eventsRes, newTodayRes, newWeekRes, activeTodayRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM dogs'),
      pool.query('SELECT COUNT(*) FROM posts'),
      pool.query('SELECT COUNT(*) FROM events'),
      pool.query("SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE"),
      pool.query("SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM users WHERE last_seen_at >= CURRENT_DATE"),
    ]);

    res.json({
      stats: {
        total_users: parseInt(usersRes.rows[0].count),
        new_users_today: parseInt(newTodayRes.rows[0].count),
        new_users_this_week: parseInt(newWeekRes.rows[0].count),
        total_dogs: parseInt(dogsRes.rows[0].count),
        total_posts: parseInt(postsRes.rows[0].count),
        total_events: parseInt(eventsRes.rows[0].count),
        active_users_today: parseInt(activeTodayRes.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Admin getStats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = search
      ? `WHERE (u.name ILIKE $3 OR u.email ILIKE $3)`
      : '';
    const params: any[] = search
      ? [limit, offset, `%${search}%`]
      : [limit, offset];

    const usersRes = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.phone,
         u.is_admin,
         u.is_active,
         u.created_at,
         u.last_seen_at,
         COUNT(d.id)::int AS dog_count,
         COUNT(p.id)::int AS post_count
       FROM users u
       LEFT JOIN dogs d ON d.user_id = u.id
       LEFT JOIN posts p ON p.user_id = u.id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM users u ${search ? 'WHERE (u.name ILIKE $1 OR u.email ILIKE $1)' : ''}`,
      search ? [`%${search}%`] : []
    );

    res.json({
      users: usersRes.rows.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        is_admin: u.is_admin,
        is_active: u.is_active ?? true,
        created_at: u.created_at,
        last_seen: u.last_seen_at,
        dog_count: u.dog_count,
        post_count: u.post_count,
        recently_active: u.last_seen_at
          ? Date.now() - new Date(u.last_seen_at).getTime() < 7 * 24 * 60 * 60 * 1000
          : false,
      })),
      total: parseInt(countRes.rows[0].count),
    });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReportedPosts = async (req: AuthRequest, res: Response) => {
  try {
    const reportsRes = await pool.query(
      `SELECT
         pr.id,
         pr.post_id,
         pr.reason,
         pr.created_at AS reported_at,
         reporter.name AS reporter_name,
         p.title AS post_title,
         p.content AS post_content,
         author.name AS post_author,
         author.id AS post_author_id
       FROM post_reports pr
       JOIN users reporter ON reporter.id = pr.reporter_id
       JOIN posts p ON p.id = pr.post_id
       JOIN users author ON author.id = p.user_id
       ORDER BY pr.created_at DESC`
    );

    res.json({ reports: reportsRes.rows });
  } catch (error) {
    console.error('Admin getReportedPosts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminDeletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [postId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Admin deletePost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminDismissReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const result = await pool.query('DELETE FROM post_reports WHERE id = $1 RETURNING id', [reportId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report dismissed' });
  } catch (error) {
    console.error('Admin dismissReport error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminToggleUserActive = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }

    if (userId === req.user!.id && !is_active) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, is_active',
      [is_active, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Admin toggleUserActive error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminDogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = search
      ? `WHERE (d.name ILIKE $3 OR d.breed ILIKE $3 OR u.name ILIKE $3 OR u.email ILIKE $3)`
      : '';
    const params: any[] = search ? [limit, offset, `%${search}%`] : [limit, offset];

    const dogsRes = await pool.query(
      `SELECT
         d.id,
         d.name,
         d.breed,
         d.sex,
         d.date_of_birth,
         d.weight,
         d.profile_picture,
         d.microchip_id,
         d.created_at,
         u.id   AS owner_id,
         u.name AS owner_name,
         u.email AS owner_email
       FROM dogs d
       JOIN users u ON u.id = d.user_id
       ${whereClause}
       ORDER BY d.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM dogs d JOIN users u ON u.id = d.user_id ${search ? 'WHERE (d.name ILIKE $1 OR d.breed ILIKE $1 OR u.name ILIKE $1 OR u.email ILIKE $1)' : ''}`,
      search ? [`%${search}%`] : []
    );

    res.json({
      dogs: dogsRes.rows,
      total: parseInt(countRes.rows[0].count),
    });
  } catch (error) {
    console.error('Admin getDogs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminDeleteDog = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const result = await pool.query('DELETE FROM dogs WHERE id = $1 RETURNING id', [dogId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    res.json({ message: 'Dog deleted' });
  } catch (error) {
    console.error('Admin deleteDog error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminDeleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminGrowthStats = async (req: AuthRequest, res: Response) => {
  try {
    const days = Math.min(90, Math.max(7, parseInt(req.query.days as string) || 14));

    // New registrations per day
    const regRes = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*)::int AS count
       FROM users
       WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [days]
    );

    // Daily active users per day (based on last_seen_at)
    const dauRes = await pool.query(
      `SELECT DATE(last_seen_at) AS date, COUNT(*)::int AS count
       FROM users
       WHERE last_seen_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
         AND last_seen_at IS NOT NULL
       GROUP BY DATE(last_seen_at)
       ORDER BY date`,
      [days]
    );

    // 14-day average DAU
    const avgDauRes = await pool.query(
      `SELECT ROUND(AVG(daily_count))::int AS avg_dau
       FROM (
         SELECT DATE(last_seen_at) AS date, COUNT(*)::int AS daily_count
         FROM users
         WHERE last_seen_at >= CURRENT_DATE - INTERVAL '14 days'
           AND last_seen_at IS NOT NULL
         GROUP BY DATE(last_seen_at)
       ) sub`
    );

    const regByDate: Record<string, number> = {};
    for (const row of regRes.rows) {
      regByDate[new Date(row.date).toISOString().split('T')[0]] = row.count;
    }

    const dauByDate: Record<string, number> = {};
    for (const row of dauRes.rows) {
      dauByDate[new Date(row.date).toISOString().split('T')[0]] = row.count;
    }

    const data: { date: string; registrations: number; active_users: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      data.push({
        date: key,
        registrations: regByDate[key] ?? 0,
        active_users: dauByDate[key] ?? 0,
      });
    }

    res.json({
      data,
      avg_daily_active: avgDauRes.rows[0]?.avg_dau ?? 0,
    });
  } catch (error) {
    console.error('Admin getGrowthStats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminSendBroadcastEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, body } = req.body;
    if (!subject?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    const usersRes = await pool.query(
      "SELECT id, name, email FROM users WHERE is_active = true AND email IS NOT NULL ORDER BY created_at"
    );

    const recipients = usersRes.rows;
    res.json({ message: `Broadcast queued for ${recipients.length} users`, total: recipients.length });

    (async () => {
      let sent = 0, failed = 0;
      for (const user of recipients) {
        try {
          await sendEmail(user.email, { subject, html: buildAdminEmailHtml(user.name, body) });
          sent++;
        } catch {
          failed++;
        }
      }
      console.log(`[Admin Broadcast] Done: ${sent}/${recipients.length} sent, ${failed} failed`);
    })();
  } catch (error) {
    console.error('Admin broadcastEmail error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminSendUserEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { subject, body } = req.body;

    if (!subject?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    const userRes = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = userRes.rows[0];
    if (!user.email) return res.status(400).json({ error: 'User has no email address' });

    await sendEmail(user.email, { subject, html: buildAdminEmailHtml(user.name, body) });
    res.json({ message: `Email sent to ${user.name}` });
  } catch (error) {
    console.error('Admin sendUserEmail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
