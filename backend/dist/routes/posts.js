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
const pushService_1 = require("../services/pushService");
const router = express_1.default.Router();
const REACTION_TYPES = ['heart', 'paw', 'laugh', 'wow'];
const validatePost = [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
    (0, express_validator_1.body)('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
    (0, express_validator_1.body)('post_type').isIn(['story', 'question', 'tip', 'event', 'photo', 'video', 'lost_dog']).withMessage('Invalid post type'),
];
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
// ── SELECT helper ──────────────────────────────────────────────────────────────
// Builds the common SELECT fields for post listings.
function postSelect(currentUserId) {
    const likeJoin = currentUserId
        ? `LEFT JOIN post_likes pl ON pl.post_id = p.id AND pl.user_id = '${currentUserId}'`
        : '';
    const bookmarkJoin = currentUserId
        ? `LEFT JOIN post_bookmarks pb ON pb.post_id = p.id AND pb.user_id = '${currentUserId}'`
        : '';
    const userReaction = currentUserId ? 'pl.reaction_type' : 'NULL';
    const likedBy = currentUserId ? '(pl.reaction_type IS NOT NULL)' : 'false';
    const bookmarked = currentUserId ? '(pb.post_id IS NOT NULL)' : 'false';
    return { likeJoin, bookmarkJoin, userReaction, likedBy, bookmarked };
}
// ── Trending tags ──────────────────────────────────────────────────────────────
router.get('/trending-tags', async (_req, res) => {
    try {
        const result = await database_1.default.query(`
      SELECT tag, COUNT(*)::int AS count
      FROM posts, unnest(tags) AS tag
      WHERE is_public = true AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 15
    `);
        res.json({ tags: result.rows });
    }
    catch (error) {
        console.error('Trending tags error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Get bookmarked posts (auth) ────────────────────────────────────────────────
router.get('/bookmarked', auth_1.authenticateToken, async (req, res) => {
    try {
        const uid = req.user.id;
        const result = await database_1.default.query(`SELECT p.*, u.name as author_name, d.name as dog_name,
              pl.reaction_type as user_reaction,
              (pl.reaction_type IS NOT NULL) as liked_by_user,
              true as bookmarked_by_user,
              COALESCE((
                SELECT json_object_agg(rt, cnt)
                FROM (SELECT reaction_type rt, COUNT(*)::int cnt FROM post_likes WHERE post_id = p.id GROUP BY reaction_type) rc
              ), '{}') as reaction_counts
       FROM post_bookmarks bk
       JOIN posts p ON p.id = bk.post_id
       JOIN users u ON u.id = p.user_id
       LEFT JOIN dogs d ON d.id = p.dog_id
       LEFT JOIN post_likes pl ON pl.post_id = p.id AND pl.user_id = $1
       WHERE bk.user_id = $1
       ORDER BY bk.created_at DESC`, [uid]);
        res.json({ posts: result.rows });
    }
    catch (error) {
        console.error('Get bookmarked posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Get all public posts ───────────────────────────────────────────────────────
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const { page = 1, limit = 30, type, userId, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const currentUserId = req.user?.id ?? null;
        const params = currentUserId ? [currentUserId] : [];
        const reactionCountSubq = `
      COALESCE((
        SELECT json_object_agg(rt, cnt)
        FROM (SELECT reaction_type rt, COUNT(*)::int cnt FROM post_likes WHERE post_id = p.id GROUP BY reaction_type) rc
      ), '{}') as reaction_counts
    `;
        let query = `
      SELECT p.*, u.name as author_name, d.name as dog_name,
        ${currentUserId
            ? `pl.reaction_type as user_reaction, (pl.reaction_type IS NOT NULL) as liked_by_user,
             (pb.post_id IS NOT NULL) as bookmarked_by_user,`
            : `NULL as user_reaction, false as liked_by_user, false as bookmarked_by_user,`}
        ${reactionCountSubq}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN dogs d ON p.dog_id = d.id
      ${currentUserId ? `LEFT JOIN post_likes pl ON pl.post_id = p.id AND pl.user_id = $1
       LEFT JOIN post_bookmarks pb ON pb.post_id = p.id AND pb.user_id = $1` : ''}
      WHERE p.is_public = true
    `;
        if (type) {
            query += ` AND p.post_type = $${params.length + 1}`;
            params.push(type);
        }
        if (userId) {
            query += ` AND p.user_id = $${params.length + 1}`;
            params.push(userId);
        }
        if (search) {
            query += ` AND (p.title ILIKE $${params.length + 1} OR p.content ILIKE $${params.length + 1} OR $${params.length + 1} = ANY(p.tags))`;
            params.push(`%${search}%`);
        }
        query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);
        const result = await database_1.default.query(query, params);
        res.json({ posts: result.rows, pagination: { page: Number(page), limit: Number(limit) } });
    }
    catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Get my posts ───────────────────────────────────────────────────────────────
router.get('/my-posts', auth_1.authenticateToken, async (req, res) => {
    try {
        const uid = req.user.id;
        const result = await database_1.default.query(`SELECT p.*, u.name as author_name, d.name as dog_name,
              pl.reaction_type as user_reaction,
              (pl.reaction_type IS NOT NULL) as liked_by_user,
              (pb.post_id IS NOT NULL) as bookmarked_by_user,
              COALESCE((
                SELECT json_object_agg(rt, cnt)
                FROM (SELECT reaction_type rt, COUNT(*)::int cnt FROM post_likes WHERE post_id = p.id GROUP BY reaction_type) rc
              ), '{}') as reaction_counts
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN dogs d ON d.id = p.dog_id
       LEFT JOIN post_likes pl ON pl.post_id = p.id AND pl.user_id = $1
       LEFT JOIN post_bookmarks pb ON pb.post_id = p.id AND pb.user_id = $1
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`, [uid]);
        res.json({ posts: result.rows });
    }
    catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Create post ────────────────────────────────────────────────────────────────
router.post('/', auth_1.authenticateToken, validatePost, validateRequest, async (req, res) => {
    try {
        const { title, content, post_type, dog_id, image_url, video_url, tags, is_public = true, location_name } = req.body;
        const postId = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO posts (id, user_id, dog_id, title, content, post_type, image_url, video_url, tags, is_public, location_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [postId, req.user.id, dog_id || null, title, content, post_type,
            image_url || null, video_url || null, tags || [], is_public, location_name || null]);
        if (post_type === 'lost_dog') {
            (0, pushService_1.broadcastLostDogAlert)(req.user.id, title, req.body.location).catch(console.error);
        }
        res.status(201).json({ message: 'Post created successfully', post: result.rows[0] });
    }
    catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Update post ────────────────────────────────────────────────────────────────
router.put('/:id', auth_1.authenticateToken, validatePost, validateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, post_type, dog_id, image_url, video_url, tags, is_public, location_name } = req.body;
        const result = await database_1.default.query(`UPDATE posts SET title=$1, content=$2, post_type=$3, dog_id=$4, image_url=$5,
       video_url=$6, tags=$7, is_public=$8, location_name=$9, updated_at=CURRENT_TIMESTAMP
       WHERE id=$10 AND user_id=$11 RETURNING *`, [title, content, post_type, dog_id || null, image_url || null,
            video_url || null, tags || [], is_public, location_name || null, id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found or access denied' });
        }
        res.json({ message: 'Post updated successfully', post: result.rows[0] });
    }
    catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Delete post ────────────────────────────────────────────────────────────────
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('DELETE FROM posts WHERE id=$1 AND user_id=$2 RETURNING id', [id, req.user.id]);
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
// ── Report post ────────────────────────────────────────────────────────────────
router.post('/:id/report', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason = 'inappropriate' } = req.body;
        const reportId = (0, uuid_1.v4)();
        await database_1.default.query(`INSERT INTO post_reports (id, post_id, reporter_id, reason)
       VALUES ($1, $2, $3, $4) ON CONFLICT (post_id, reporter_id) DO NOTHING`, [reportId, id, req.user.id, reason]);
        res.json({ message: 'Report submitted' });
    }
    catch (error) {
        console.error('Report post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Mark lost dog as found ─────────────────────────────────────────────────────
router.post('/:id/mark-found', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query(`UPDATE posts SET is_resolved=true, resolved_at=CURRENT_TIMESTAMP
       WHERE id=$1 AND user_id=$2 AND post_type='lost_dog' RETURNING id`, [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found or access denied' });
        }
        res.json({ message: 'Marked as found' });
    }
    catch (error) {
        console.error('Mark found error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── React to post (heart | paw | laugh | wow) ─────────────────────────────────
router.post('/:id/react', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reaction_type = 'heart' } = req.body;
        if (!REACTION_TYPES.includes(reaction_type)) {
            return res.status(400).json({ error: 'Invalid reaction type' });
        }
        const existing = await database_1.default.query('SELECT id, reaction_type FROM post_likes WHERE post_id=$1 AND user_id=$2', [id, req.user.id]);
        if (existing.rows.length > 0) {
            if (existing.rows[0].reaction_type === reaction_type) {
                // Same reaction → remove it
                await database_1.default.query('DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2', [id, req.user.id]);
                await database_1.default.query('UPDATE posts SET likes_count=likes_count-1 WHERE id=$1 AND likes_count>0', [id]);
                return res.json({ reacted: false, reaction_type: null });
            }
            else {
                // Different reaction → update
                await database_1.default.query('UPDATE post_likes SET reaction_type=$1 WHERE post_id=$2 AND user_id=$3', [reaction_type, id, req.user.id]);
                return res.json({ reacted: true, reaction_type });
            }
        }
        else {
            // New reaction
            const likeId = (0, uuid_1.v4)();
            await database_1.default.query('INSERT INTO post_likes (id, post_id, user_id, reaction_type) VALUES ($1,$2,$3,$4)', [likeId, id, req.user.id, reaction_type]);
            await database_1.default.query('UPDATE posts SET likes_count=likes_count+1 WHERE id=$1', [id]);
            return res.json({ reacted: true, reaction_type });
        }
    }
    catch (error) {
        console.error('React post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Like post (legacy — maps to heart reaction) ────────────────────────────────
router.post('/:id/like', auth_1.authenticateToken, async (req, res) => {
    req.body.reaction_type = 'heart';
    // Inline the react logic for backward compat
    try {
        const { id } = req.params;
        const existing = await database_1.default.query('SELECT id FROM post_likes WHERE post_id=$1 AND user_id=$2', [id, req.user.id]);
        if (existing.rows.length > 0) {
            await database_1.default.query('DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2', [id, req.user.id]);
            await database_1.default.query('UPDATE posts SET likes_count=likes_count-1 WHERE id=$1 AND likes_count>0', [id]);
            res.json({ message: 'Post unliked', liked: false });
        }
        else {
            const likeId = (0, uuid_1.v4)();
            await database_1.default.query('INSERT INTO post_likes (id, post_id, user_id, reaction_type) VALUES ($1,$2,$3,$4)', [likeId, id, req.user.id, 'heart']);
            await database_1.default.query('UPDATE posts SET likes_count=likes_count+1 WHERE id=$1', [id]);
            res.json({ message: 'Post liked', liked: true });
        }
    }
    catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Bookmark post (toggle) ─────────────────────────────────────────────────────
router.post('/:id/bookmark', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await database_1.default.query('SELECT id FROM post_bookmarks WHERE post_id=$1 AND user_id=$2', [id, req.user.id]);
        if (existing.rows.length > 0) {
            await database_1.default.query('DELETE FROM post_bookmarks WHERE post_id=$1 AND user_id=$2', [id, req.user.id]);
            res.json({ bookmarked: false });
        }
        else {
            const bmId = (0, uuid_1.v4)();
            await database_1.default.query('INSERT INTO post_bookmarks (id, post_id, user_id) VALUES ($1,$2,$3)', [bmId, id, req.user.id]);
            res.json({ bookmarked: true });
        }
    }
    catch (error) {
        console.error('Bookmark post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Get reaction counts for a post ────────────────────────────────────────────
router.get('/:id/reactions', auth_1.optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const uid = req.user?.id ?? null;
        const countsRes = await database_1.default.query(`SELECT reaction_type, COUNT(*)::int as count FROM post_likes WHERE post_id=$1 GROUP BY reaction_type`, [id]);
        const counts = {};
        countsRes.rows.forEach(r => { counts[r.reaction_type] = r.count; });
        let userReaction = null;
        if (uid) {
            const ur = await database_1.default.query('SELECT reaction_type FROM post_likes WHERE post_id=$1 AND user_id=$2', [id, uid]);
            userReaction = ur.rows[0]?.reaction_type ?? null;
        }
        res.json({ counts, user_reaction: userReaction });
    }
    catch (error) {
        console.error('Get reactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Add comment ────────────────────────────────────────────────────────────────
router.post('/:id/comments', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, parent_id } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        if (parent_id) {
            const parentRes = await database_1.default.query('SELECT id, parent_id FROM post_comments WHERE id=$1 AND post_id=$2', [parent_id, id]);
            if (parentRes.rows.length === 0) {
                return res.status(400).json({ error: 'Parent comment not found' });
            }
            if (parentRes.rows[0].parent_id) {
                return res.status(400).json({ error: 'Cannot reply to a reply' });
            }
        }
        const commentId = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO post_comments (id, post_id, user_id, content, parent_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`, [commentId, id, req.user.id, content.trim(), parent_id || null]);
        await database_1.default.query('UPDATE posts SET comments_count=comments_count+1 WHERE id=$1', [id]);
        const userRes = await database_1.default.query('SELECT name FROM users WHERE id=$1', [req.user.id]);
        const comment = { ...result.rows[0], author_name: userRes.rows[0]?.name ?? 'Unknown' };
        res.status(201).json({ message: 'Comment added successfully', comment });
    }
    catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Edit own comment ───────────────────────────────────────────────────────────
router.patch('/:postId/comments/:commentId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { content } = req.body;
        if (!content?.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        const commentRes = await database_1.default.query('SELECT id, user_id FROM post_comments WHERE id=$1 AND post_id=$2', [commentId, postId]);
        if (commentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (commentRes.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own comments' });
        }
        const result = await database_1.default.query(`UPDATE post_comments SET content=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`, [content.trim(), commentId]);
        const userRes = await database_1.default.query('SELECT name FROM users WHERE id=$1', [req.user.id]);
        const comment = { ...result.rows[0], author_name: userRes.rows[0]?.name ?? 'Unknown' };
        res.json({ comment });
    }
    catch (error) {
        console.error('Edit comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Get comments ───────────────────────────────────────────────────────────────
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query(`SELECT c.*, u.name as author_name
       FROM post_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id=$1
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