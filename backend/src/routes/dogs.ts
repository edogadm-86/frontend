import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDogs, createDog, updateDog, deleteDog, getDogHealthStatus } from '../controllers/dogController';
import { authenticateToken } from '../middleware/auth';
import { validateDog, validateRequest } from '../middleware/validation';
import { AuthRequest } from '../types';
import pool from '../config/database';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/', getDogs);
router.get('/:dogId/health-status', getDogHealthStatus);
router.post('/', validateDog, validateRequest, createDog);
router.put('/:id', validateDog, validateRequest, updateDog);
router.delete('/:id', deleteDog);

// ── Weight history ────────────────────────────────────────────────────────────

router.get('/:dogId/weight', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM weight_history WHERE dog_id = $1 ORDER BY date ASC`,
      [req.params.dogId]
    );
    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Get weight history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:dogId/weight', async (req: AuthRequest, res) => {
  try {
    const { weight, date, notes } = req.body;
    if (!weight || !date) return res.status(400).json({ error: 'weight and date are required' });
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO weight_history (id, dog_id, weight, date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, req.params.dogId, weight, date, notes || null]
    );
    // Keep the dog's current weight field in sync with latest entry
    await pool.query(`UPDATE dogs SET weight = $1 WHERE id = $2`, [weight, req.params.dogId]);
    res.status(201).json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Add weight entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:dogId/weight/:entryId', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM weight_history WHERE id = $1 AND dog_id = $2 RETURNING id`,
      [req.params.entryId, req.params.dogId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Delete weight entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;