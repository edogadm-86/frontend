import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, title, description, imageUrl } = req.body;
    if (!type || !title || !description) {
      return res.status(400).json({ error: 'type, title and description are required' });
    }
    if (!['bug', 'feature', 'general'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    const id = uuidv4();
    await pool.query(
      `INSERT INTO feedback (id, user_id, type, title, description, image_url) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, req.user!.id, type, title.trim(), description.trim(), imageUrl || null]
    );
    res.status(201).json({ message: 'Feedback submitted' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
