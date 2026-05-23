import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../types';

const router = express.Router();

const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validatePartner = [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
  body('category_id').isUUID().withMessage('Valid category_id is required'),
];

const validatePromotion = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
];

// GET /api/partners/categories — public
router.get('/categories', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM partner_categories ORDER BY name_en ASC'
    );
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get partner categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/partners — public, filterable by ?category=slug&city=x&featured=true
router.get('/', async (req, res) => {
  try {
    const { category, city, featured } = req.query;

    let query = `
      SELECT p.*, pc.slug as category_slug, pc.name_en as category_name_en,
             pc.name_bg as category_name_bg, pc.icon as category_icon,
             COALESCE(
               json_agg(pp.*) FILTER (WHERE pp.id IS NOT NULL AND pp.is_active = true),
               '[]'
             ) as promotions
      FROM partners p
      JOIN partner_categories pc ON p.category_id = pc.id
      LEFT JOIN partner_promotions pp ON pp.partner_id = p.id
      WHERE p.is_active = true
    `;
    const params: any[] = [];

    if (category) {
      query += ` AND pc.slug = $${params.length + 1}`;
      params.push(category);
    }

    if (city) {
      query += ` AND p.city ILIKE $${params.length + 1}`;
      params.push(`%${city}%`);
    }

    if (featured === 'true') {
      query += ` AND p.is_featured = true`;
    }

    query += ` GROUP BY p.id, pc.slug, pc.name_en, pc.name_bg, pc.icon
               ORDER BY p.is_featured DESC, p.name ASC`;

    const result = await pool.query(query, params);
    res.json({ partners: result.rows });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/partners/:id — public, returns partner + promotions
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const partnerResult = await pool.query(
      `SELECT p.*, pc.slug as category_slug, pc.name_en as category_name_en,
              pc.name_bg as category_name_bg, pc.icon as category_icon
       FROM partners p
       JOIN partner_categories pc ON p.category_id = pc.id
       WHERE p.id = $1`,
      [id]
    );

    if (partnerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const promotionsResult = await pool.query(
      'SELECT * FROM partner_promotions WHERE partner_id = $1 AND is_active = true ORDER BY created_at DESC',
      [id]
    );

    res.json({
      partner: {
        ...partnerResult.rows[0],
        promotions: promotionsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/partners — admin only
router.post('/', authenticateToken, adminOnly, validatePartner, validateRequest, async (req: AuthRequest, res: express.Response) => {
  try {
    const {
      category_id, name, description, phone, email, website,
      address, city, latitude, longitude, working_hours,
      social_links, photos, logo_url, is_featured, is_active, google_place_id,
    } = req.body;

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO partners (id, category_id, name, description, phone, email, website,
        address, city, latitude, longitude, working_hours, social_links, photos,
        logo_url, is_featured, is_active, google_place_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [
        id, category_id, name, description || null, phone || null, email || null,
        website || null, address || null, city || null,
        latitude || null, longitude || null,
        JSON.stringify(working_hours || {}),
        JSON.stringify(social_links || {}),
        photos || [],
        logo_url || null,
        is_featured ?? false,
        is_active ?? true,
        google_place_id || null,
        req.user!.id,
      ]
    );

    res.status(201).json({ message: 'Partner created successfully', partner: result.rows[0] });
  } catch (error) {
    console.error('Create partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/partners/:id — admin only
router.put('/:id', authenticateToken, adminOnly, validatePartner, validateRequest, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const {
      category_id, name, description, phone, email, website,
      address, city, latitude, longitude, working_hours,
      social_links, photos, logo_url, is_featured, is_active, google_place_id,
    } = req.body;

    const result = await pool.query(
      `UPDATE partners SET
        category_id=$1, name=$2, description=$3, phone=$4, email=$5, website=$6,
        address=$7, city=$8, latitude=$9, longitude=$10, working_hours=$11,
        social_links=$12, photos=$13, logo_url=$14, is_featured=$15, is_active=$16,
        google_place_id=$17, updated_at=CURRENT_TIMESTAMP
       WHERE id=$18
       RETURNING *`,
      [
        category_id, name, description || null, phone || null, email || null,
        website || null, address || null, city || null,
        latitude || null, longitude || null,
        JSON.stringify(working_hours || {}),
        JSON.stringify(social_links || {}),
        photos || [],
        logo_url || null,
        is_featured ?? false,
        is_active ?? true,
        google_place_id || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json({ message: 'Partner updated successfully', partner: result.rows[0] });
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/partners/:id — admin only
router.delete('/:id', authenticateToken, adminOnly, async (_req: AuthRequest, res: express.Response) => {
  try {
    const { id } = (_req as any).params;

    const result = await pool.query('DELETE FROM partners WHERE id=$1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/partners/:id/promotions — admin only
router.post('/:id/promotions', authenticateToken, adminOnly, validatePromotion, validateRequest, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { title, description, discount_text, valid_until } = req.body;

    const partnerCheck = await pool.query('SELECT id FROM partners WHERE id=$1', [id]);
    if (partnerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const promoId = uuidv4();
    const result = await pool.query(
      `INSERT INTO partner_promotions (id, partner_id, title, description, discount_text, valid_until)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [promoId, id, title, description || null, discount_text || null, valid_until || null]
    );

    res.status(201).json({ message: 'Promotion created successfully', promotion: result.rows[0] });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/partners/:id/promotions/:promoId — admin only
router.delete('/:id/promotions/:promoId', authenticateToken, adminOnly, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id, promoId } = req.params;

    const result = await pool.query(
      'DELETE FROM partner_promotions WHERE id=$1 AND partner_id=$2 RETURNING id',
      [promoId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
