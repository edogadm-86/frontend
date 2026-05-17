import { Response, NextFunction } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Fast path: is_admin was already decoded from the JWT
  if (req.user?.is_admin === true) {
    return next();
  }

  // Fallback: JWT predates the is_admin field — check the DB directly
  if (!req.user?.id) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows[0]?.is_admin === true) {
      req.user.is_admin = true;
      return next();
    }
  } catch {
    // fall through to 403
  }

  return res.status(403).json({ error: 'Admin access required' });
};
