import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getWalkLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    // Current ISO week: Monday–Sunday
    const leaderboardQuery = `
      SELECT
        d.id          AS dog_id,
        d.name        AS dog_name,
        d.profile_picture,
        u.id          AS owner_id,
        u.name        AS owner_name,
        COUNT(ts.id)::int                            AS walk_count,
        COALESCE(SUM(ts.distance_meters), 0)::float  AS total_distance_meters
      FROM training_sessions ts
      JOIN dogs  d ON ts.dog_id  = d.id
      JOIN users u ON d.user_id  = u.id
      WHERE
        ts.date >= date_trunc('week', CURRENT_DATE)
        AND ts.date <  date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
        AND u.walk_competition_opted_in = true
        AND ts.distance_meters IS NOT NULL
        AND ts.distance_meters > 0
      GROUP BY d.id, d.name, d.profile_picture, u.id, u.name
      ORDER BY total_distance_meters DESC
      LIMIT 10
    `;

    const { rows: top } = await pool.query(leaderboardQuery);

    // Also fetch the calling user's own position (even if outside top 10)
    let myEntry = null;
    const userId = req.user!.id;
    const myQuery = `
      SELECT
        d.id          AS dog_id,
        d.name        AS dog_name,
        d.profile_picture,
        u.id          AS owner_id,
        u.name        AS owner_name,
        COUNT(ts.id)::int                            AS walk_count,
        COALESCE(SUM(ts.distance_meters), 0)::float  AS total_distance_meters
      FROM training_sessions ts
      JOIN dogs  d ON ts.dog_id  = d.id
      JOIN users u ON d.user_id  = u.id
      WHERE
        ts.date >= date_trunc('week', CURRENT_DATE)
        AND ts.date <  date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
        AND u.id = $1
        AND u.walk_competition_opted_in = true
        AND ts.distance_meters IS NOT NULL
        AND ts.distance_meters > 0
      GROUP BY d.id, d.name, d.profile_picture, u.id, u.name
    `;
    const { rows: myRows } = await pool.query(myQuery, [userId]);

    if (myRows.length > 0) {
      // Calculate rank across all opted-in users
      const rankQuery = `
        SELECT COUNT(*)::int AS rank
        FROM (
          SELECT d2.id
          FROM training_sessions ts2
          JOIN dogs  d2 ON ts2.dog_id  = d2.id
          JOIN users u2 ON d2.user_id  = u2.id
          WHERE
            ts2.date >= date_trunc('week', CURRENT_DATE)
            AND ts2.date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
            AND u2.walk_competition_opted_in = true
            AND ts2.distance_meters IS NOT NULL
            AND ts2.distance_meters > 0
          GROUP BY d2.id
          HAVING COALESCE(SUM(ts2.distance_meters), 0) > $1
        ) better
      `;
      const { rows: rankRows } = await pool.query(rankQuery, [myRows[0].total_distance_meters]);
      myEntry = { ...myRows[0], rank: rankRows[0].rank + 1 };
    }

    // Last week's winner
    const lastWeekQuery = `
      SELECT
        d.id          AS dog_id,
        d.name        AS dog_name,
        d.profile_picture,
        u.name        AS owner_name,
        COALESCE(SUM(ts.distance_meters), 0)::float AS total_distance_meters,
        COUNT(ts.id)::int                           AS walk_count
      FROM training_sessions ts
      JOIN dogs  d ON ts.dog_id  = d.id
      JOIN users u ON d.user_id  = u.id
      WHERE
        ts.date >= date_trunc('week', CURRENT_DATE) - INTERVAL '7 days'
        AND ts.date <  date_trunc('week', CURRENT_DATE)
        AND u.walk_competition_opted_in = true
        AND ts.distance_meters IS NOT NULL
        AND ts.distance_meters > 0
      GROUP BY d.id, d.name, d.profile_picture, u.name
      ORDER BY total_distance_meters DESC
      LIMIT 1
    `;
    const { rows: lastWeekRows } = await pool.query(lastWeekQuery);

    res.json({
      leaderboard: top,
      my_entry: myEntry,
      last_week_winner: lastWeekRows[0] || null,
      week_start: new Date(
        new Date().setDate(new Date().getDate() - new Date().getDay() + (new Date().getDay() === 0 ? -6 : 1))
      ).toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCompetitionOptIn = async (req: AuthRequest, res: Response) => {
  try {
    const { opted_in } = req.body;
    if (typeof opted_in !== 'boolean') {
      return res.status(400).json({ error: 'opted_in must be a boolean' });
    }
    await pool.query(
      'UPDATE users SET walk_competition_opted_in = $1 WHERE id = $2',
      [opted_in, req.user!.id]
    );
    res.json({ message: 'Preference saved', walk_competition_opted_in: opted_in });
  } catch (error) {
    console.error('Competition opt-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
