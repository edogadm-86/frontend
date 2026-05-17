import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();
router.use(authenticateToken);

// GET /api/dogs/:dogId/reminders
router.get('/:dogId/reminders', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM medication_reminders WHERE dog_id = $1 ORDER BY next_due_date ASC`,
      [req.params.dogId]
    );
    res.json({ reminders: result.rows });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/dogs/:dogId/reminders
router.post('/:dogId/reminders', async (req: AuthRequest, res) => {
  try {
    const { name, frequency_days, last_given_date, next_due_date, notes } = req.body;
    if (!name || !frequency_days || !next_due_date) {
      return res.status(400).json({ error: 'name, frequency_days and next_due_date are required' });
    }
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO medication_reminders (id, dog_id, user_id, name, frequency_days, last_given_date, next_due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, req.params.dogId, req.user!.id, name, frequency_days,
       last_given_date || null, next_due_date, notes || null]
    );
    res.status(201).json({ reminder: result.rows[0] });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/dogs/:dogId/reminders/:id  (also handles "mark as given")
router.put('/:dogId/reminders/:id', async (req: AuthRequest, res) => {
  try {
    const { name, frequency_days, last_given_date, next_due_date, notes, is_active } = req.body;
    const result = await pool.query(
      `UPDATE medication_reminders
       SET name = COALESCE($1, name),
           frequency_days = COALESCE($2, frequency_days),
           last_given_date = COALESCE($3, last_given_date),
           next_due_date = COALESCE($4, next_due_date),
           notes = COALESCE($5, notes),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND dog_id = $8 AND user_id = $9
       RETURNING *`,
      [name, frequency_days, last_given_date, next_due_date, notes,
       is_active, req.params.id, req.params.dogId, req.user!.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ reminder: result.rows[0] });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/dogs/:dogId/reminders/:id
router.delete('/:dogId/reminders/:id', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM medication_reminders WHERE id = $1 AND dog_id = $2 AND user_id = $3 RETURNING id`,
      [req.params.id, req.params.dogId, req.user!.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
