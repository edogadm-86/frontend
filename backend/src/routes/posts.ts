import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validatePost = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('post_type').isIn(['story', 'question', 'tip', 'event', 'photo', 'video']).withMessage('Invalid post type'),
];

const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all public posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, userId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT p.*, u.name as author_name, d.name as dog_name 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN dogs d ON p.dog_id = d.id 
      WHERE p.is_public = true
    `;
    const params: any[] = [];

    if (type) {
      query += ` AND p.post_type = $${params.length + 1}`;
      params.push(type);
    }

    if (userId) {
      query += ` AND p.user_id = $${params.length + 1}`;
      params.push(userId);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM posts WHERE is_public = true';
    const countParams: any[] = [];
    
    if (type) {
      countQuery += ` AND post_type = $${countParams.length + 1}`;
      countParams.push(type);
    }

    if (userId) {
      countQuery += ` AND user_id = $${countParams.length + 1}`;
      countParams.push(userId);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      posts: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's posts
router.get('/my-posts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, d.name as dog_name 
       FROM posts p 
       LEFT JOIN dogs d ON p.dog_id = d.id 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
      [req.user!.id]
    );

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create post
router.post('/', authenticateToken, validatePost, validateRequest, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, content, post_type, dog_id, image_url, video_url, tags, is_public = true } = req.body;

    const postId = uuidv4();
    const result = await pool.query(
      `INSERT INTO posts (id, user_id, dog_id, title, content, post_type, image_url, video_url, tags, is_public) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [postId, req.user!.id, dog_id || null, title, content, post_type, image_url || null, video_url || null, tags || [], is_public]
    );

    res.status(201).json({
      message: 'Post created successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post
router.put('/:id', authenticateToken, validatePost, validateRequest, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { title, content, post_type, dog_id, image_url, video_url, tags, is_public } = req.body;

    const result = await pool.query(
      `UPDATE posts SET title = $1, content = $2, post_type = $3, dog_id = $4, image_url = $5, 
       video_url = $6, tags = $7, is_public = $8, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $9 AND user_id = $10 RETURNING *`,
      [title, content, post_type, dog_id || null, image_url || null, video_url || null, tags || [], is_public, id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or access denied' });
    }

    res.json({
      message: 'Post updated successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or access denied' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if already liked
    const existingLike = await pool.query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, req.user!.id]);
      await pool.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1', [id]);
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      const likeId = uuidv4();
      await pool.query('INSERT INTO post_likes (id, post_id, user_id) VALUES ($1, $2, $3)', [likeId, id, req.user!.id]);
      await pool.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [id]);
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const commentId = uuidv4();
    const result = await pool.query(
      `INSERT INTO post_comments (id, post_id, user_id, content) VALUES ($1, $2, $3, $4) RETURNING *`,
      [commentId, id, req.user!.id, content.trim()]
    );

    // Update comments count
    await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [id]);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: result.rows[0]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.name as author_name 
       FROM post_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = $1 
       ORDER BY c.created_at ASC`,
      [id]
    );

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;