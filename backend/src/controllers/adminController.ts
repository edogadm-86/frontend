import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

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
      `SELECT COUNT(*) FROM users u ${whereClause}`,
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
      `SELECT COUNT(*) FROM dogs d JOIN users u ON u.id = d.user_id ${whereClause}`,
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
