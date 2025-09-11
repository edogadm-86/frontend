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
const validatePost = [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
    (0, express_validator_1.body)('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
    (0, express_validator_1.body)('post_type').isIn(['story', 'question', 'tip', 'event', 'photo', 'video']).withMessage('Invalid post type'),
];
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
        const params = [];
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
        const result = await database_1.default.query(query, params);
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM posts WHERE is_public = true';
        const countParams = [];
        if (type) {
            countQuery += ` AND post_type = $${countParams.length + 1}`;
            countParams.push(type);
        }
        if (userId) {
            countQuery += ` AND user_id = $${countParams.length + 1}`;
            countParams.push(userId);
        }
        const countResult = await database_1.default.query(countQuery, countParams);
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
    }
    catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user's posts
router.get('/my-posts', auth_1.authenticateToken, async (req, res) => {
    try {
        const result = await database_1.default.query(`SELECT p.*, d.name as dog_name 
       FROM posts p 
       LEFT JOIN dogs d ON p.dog_id = d.id 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`, [req.user.id]);
        res.json({ posts: result.rows });
    }
    catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create post
router.post('/', auth_1.authenticateToken, validatePost, validateRequest, async (req, res) => {
    try {
        const { title, content, post_type, dog_id, image_url, video_url, tags, is_public = true } = req.body;
        const postId = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO posts (id, user_id, dog_id, title, content, post_type, image_url, video_url, tags, is_public) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [postId, req.user.id, dog_id || null, title, content, post_type, image_url || null, video_url || null, tags || [], is_public]);
        res.status(201).json({
            message: 'Post created successfully',
            post: result.rows[0]
        });
    }
    catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update post
router.put('/:id', auth_1.authenticateToken, validatePost, validateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, post_type, dog_id, image_url, video_url, tags, is_public } = req.body;
        const result = await database_1.default.query(`UPDATE posts SET title = $1, content = $2, post_type = $3, dog_id = $4, image_url = $5, 
       video_url = $6, tags = $7, is_public = $8, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $9 AND user_id = $10 RETURNING *`, [title, content, post_type, dog_id || null, image_url || null, video_url || null, tags || [], is_public, id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found or access denied' });
        }
        res.json({
            message: 'Post updated successfully',
            post: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete post
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found or access denied' });
        }
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Like/Unlike post
router.post('/:id/like', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if already liked
        const existingLike = await database_1.default.query('SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, req.user.id]);
        if (existingLike.rows.length > 0) {
            // Unlike
            await database_1.default.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, req.user.id]);
            await database_1.default.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1', [id]);
            res.json({ message: 'Post unliked', liked: false });
        }
        else {
            // Like
            const likeId = (0, uuid_1.v4)();
            await database_1.default.query('INSERT INTO post_likes (id, post_id, user_id) VALUES ($1, $2, $3)', [likeId, id, req.user.id]);
            await database_1.default.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [id]);
            res.json({ message: 'Post liked', liked: true });
        }
    }
    catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add comment
router.post('/:id/comments', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        const commentId = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO post_comments (id, post_id, user_id, content) VALUES ($1, $2, $3, $4) RETURNING *`, [commentId, id, req.user.id, content.trim()]);
        // Update comments count
        await database_1.default.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [id]);
        res.status(201).json({
            message: 'Comment added successfully',
            comment: result.rows[0]
        });
    }
    catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get comments for a post
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query(`SELECT c.*, u.name as author_name 
       FROM post_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = $1 
       ORDER BY c.created_at ASC`, [id]);
        res.json({ comments: result.rows });
    }
    catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map