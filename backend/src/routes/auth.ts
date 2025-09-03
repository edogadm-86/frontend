import express from 'express';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword, getNotifications, markNotificationRead } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateUser, validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const router = express.Router();

// Public routes
router.post('/register', validateUser, validateRequest, register);
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, login);

// Password reset routes
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], validateRequest, forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required')
], validateRequest, updateProfile);

// Notification routes
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationRead);

export default router;