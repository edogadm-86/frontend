import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import {
  getAdminStats,
  getAdminUsers,
  getReportedPosts,
  adminDeletePost,
  adminDismissReport,
  adminToggleUserActive,
  adminDeleteUser,
  getAdminDogs,
  adminDeleteDog,
  getAdminGrowthStats,
  adminSendBroadcastEmail,
  adminSendUserEmail,
} from '../controllers/adminController';

const router = express.Router();

// All admin routes require a valid token AND is_admin === true
router.use(authenticateToken, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/reported-posts', getReportedPosts);
router.delete('/posts/:postId', adminDeletePost);
router.post('/reports/:reportId/dismiss', adminDismissReport);
router.patch('/users/:userId/active', adminToggleUserActive);
router.delete('/users/:userId', adminDeleteUser);

router.get('/dogs', getAdminDogs);
router.delete('/dogs/:dogId', adminDeleteDog);

router.get('/stats/growth', getAdminGrowthStats);
router.post('/email/broadcast', adminSendBroadcastEmail);
router.post('/email/user/:userId', adminSendUserEmail);

export default router;
