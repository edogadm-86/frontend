import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateEvent = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('event_type').isIn(['meetup', 'training', 'competition', 'adoption', 'fundraiser', 'other']).withMessage('Invalid event type'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
];

const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all public events
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, location, upcoming = 'true' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT e.*, u.name as organizer_name, 
             (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id AND ep.status = 'attending') as participants_count
      FROM events e 
      JOIN users u ON e.user_id = u.id 
      WHERE e.is_public = true
    `;
    const params: any[] = [];

    if (upcoming === 'true') {
      query += ` AND e.start_date >= NOW()`;
    }

    if (type) {
      query += ` AND e.event_type = $${params.length + 1}`;
      params.push(type);
    }

    if (location) {
      query += ` AND e.location ILIKE $${params.length + 1}`;
      params.push(`%${location}%`);
    }

    query += ` ORDER BY e.start_date ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    res.json({ events: result.rows });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's events
router.get('/my-events', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, 
             (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id AND ep.status = 'attending') as participants_count
       FROM events e 
       WHERE e.user_id = $1 
       ORDER BY e.start_date ASC`,
      [req.user!.id]
    );

    res.json({ events: result.rows });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create event
router.post('/', authenticateToken, validateEvent, validateRequest, async (req: AuthRequest, res) => {
  try {
    const { 
      title, description, event_type, location, latitude, longitude, 
      start_date, end_date, max_participants, image_url, is_public = true 
    } = req.body;

    const eventId = uuidv4();
    const result = await pool.query(
      `INSERT INTO events (id, user_id, title, description, event_type, location, latitude, longitude, 
                          start_date, end_date, max_participants, image_url, is_public) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [eventId, req.user!.id, title, description, event_type, location || null, 
       latitude || null, longitude || null, start_date, end_date || null, 
       max_participants || null, image_url || null, is_public]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event
router.put('/:id', authenticateToken, validateEvent, validateRequest, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, event_type, location, latitude, longitude, 
      start_date, end_date, max_participants, image_url, is_public 
    } = req.body;

    const result = await pool.query(
      `UPDATE events SET title = $1, description = $2, event_type = $3, location = $4, 
                        latitude = $5, longitude = $6, start_date = $7, end_date = $8, 
                        max_participants = $9, image_url = $10, is_public = $11, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $12 AND user_id = $13 RETURNING *`,
      [title, description, event_type, location || null, latitude || null, longitude || null, 
       start_date, end_date || null, max_participants || null, image_url || null, is_public, id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }

    res.json({
      message: 'Event updated successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join/Leave event
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { dog_id, status = 'attending' } = req.body;

    // Check if event exists and has space
    const eventResult = await pool.query(
      'SELECT max_participants, current_participants FROM events WHERE id = $1',
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];
    if (event.max_participants && event.current_participants >= event.max_participants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if already participating
    const existingParticipation = await pool.query(
      'SELECT id FROM event_participants WHERE event_id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    if (existingParticipation.rows.length > 0) {
      // Update status
      await pool.query(
        'UPDATE event_participants SET status = $1, dog_id = $2 WHERE event_id = $3 AND user_id = $4',
        [status, dog_id || null, id, req.user!.id]
      );
    } else {
      // Add participation
      const participationId = uuidv4();
      await pool.query(
        'INSERT INTO event_participants (id, event_id, user_id, dog_id, status) VALUES ($1, $2, $3, $4, $5)',
        [participationId, id, req.user!.id, dog_id || null, status]
      );

      // Update participant count
      if (status === 'attending') {
        await pool.query('UPDATE events SET current_participants = current_participants + 1 WHERE id = $1', [id]);
      }
    }

    res.json({ message: 'Event participation updated successfully' });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get event participants
router.get('/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ep.*, u.name as user_name, d.name as dog_name 
       FROM event_participants ep 
       JOIN users u ON ep.user_id = u.id 
       LEFT JOIN dogs d ON ep.dog_id = d.id 
       WHERE ep.event_id = $1 AND ep.status = 'attending' 
       ORDER BY ep.created_at ASC`,
      [id]
    );

    res.json({ participants: result.rows });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;