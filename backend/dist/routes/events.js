"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// Validation middleware
const validateEvent = [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    (0, express_validator_1.body)('event_type').isIn(['meetup', 'training', 'competition', 'adoption', 'fundraiser', 'other']).withMessage('Invalid event type'),
    (0, express_validator_1.body)('start_date').isISO8601().withMessage('Valid start date is required'),
];
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
        const params = [];
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
        const result = await database_1.default.query(query, params);
        res.json({ events: result.rows });
    }
    catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user's events
router.get('/my-events', auth_1.authenticateToken, async (req, res) => {
    try {
        const result = await database_1.default.query(`SELECT e.*, 
             (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id AND ep.status = 'attending') as participants_count
       FROM events e 
       WHERE e.user_id = $1 
       ORDER BY e.start_date ASC`, [req.user.id]);
        res.json({ events: result.rows });
    }
    catch (error) {
        console.error('Get user events error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create event
router.post('/', auth_1.authenticateToken, validateEvent, validateRequest, async (req, res) => {
    try {
        const { title, description, event_type, location, latitude, longitude, start_date, end_date, max_participants, image_url, is_public = true } = req.body;
        const eventId = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO events (id, user_id, title, description, event_type, location, latitude, longitude, 
                          start_date, end_date, max_participants, image_url, is_public) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`, [eventId, req.user.id, title, description, event_type, location || null,
            latitude || null, longitude || null, start_date, end_date || null,
            max_participants || null, image_url || null, is_public]);
        res.status(201).json({
            message: 'Event created successfully',
            event: result.rows[0]
        });
    }
    catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update event
router.put('/:id', auth_1.authenticateToken, validateEvent, validateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, event_type, location, latitude, longitude, start_date, end_date, max_participants, image_url, is_public } = req.body;
        const result = await database_1.default.query(`UPDATE events SET title = $1, description = $2, event_type = $3, location = $4, 
                        latitude = $5, longitude = $6, start_date = $7, end_date = $8, 
                        max_participants = $9, image_url = $10, is_public = $11, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $12 AND user_id = $13 RETURNING *`, [title, description, event_type, location || null, latitude || null, longitude || null,
            start_date, end_date || null, max_participants || null, image_url || null, is_public, id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found or access denied' });
        }
        res.json({
            message: 'Event updated successfully',
            event: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete event
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found or access denied' });
        }
        res.json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Join/Leave event
router.post('/:id/join', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { dog_id, status = 'attending' } = req.body;
        // Check if event exists and has space
        const eventResult = await database_1.default.query('SELECT max_participants, current_participants FROM events WHERE id = $1', [id]);
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const event = eventResult.rows[0];
        if (event.max_participants && event.current_participants >= event.max_participants) {
            return res.status(400).json({ error: 'Event is full' });
        }
        // Check if already participating
        const existingParticipation = await database_1.default.query('SELECT id FROM event_participants WHERE event_id = $1 AND user_id = $2', [id, req.user.id]);
        if (existingParticipation.rows.length > 0) {
            // Update status
            await database_1.default.query('UPDATE event_participants SET status = $1, dog_id = $2 WHERE event_id = $3 AND user_id = $4', [status, dog_id || null, id, req.user.id]);
        }
        else {
            // Add participation
            const participationId = (0, uuid_1.v4)();
            await database_1.default.query('INSERT INTO event_participants (id, event_id, user_id, dog_id, status) VALUES ($1, $2, $3, $4, $5)', [participationId, id, req.user.id, dog_id || null, status]);
            // Update participant count
            if (status === 'attending') {
                await database_1.default.query('UPDATE events SET current_participants = current_participants + 1 WHERE id = $1', [id]);
            }
        }
        res.json({ message: 'Event participation updated successfully' });
    }
    catch (error) {
        console.error('Join event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get event participants
router.get('/:id/participants', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query(`SELECT ep.*, u.name as user_name, d.name as dog_name 
       FROM event_participants ep 
       JOIN users u ON ep.user_id = u.id 
       LEFT JOIN dogs d ON ep.dog_id = d.id 
       WHERE ep.event_id = $1 AND ep.status = 'attending' 
       ORDER BY ep.created_at ASC`, [id]);
        res.json({ participants: result.rows });
    }
    catch (error) {
        console.error('Get participants error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map