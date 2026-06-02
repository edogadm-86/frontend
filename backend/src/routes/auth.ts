import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword, getNotifications, markNotificationRead, changePassword, verifyEmail, resendVerification, deleteAccount } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateUser, validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const router = express.Router();

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many verification attempts, please try again later.',
});

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many resend attempts, please try again in an hour.',
});

// Brute-force limiter for credential endpoints only.
// Keyed by email so shared ingress IP doesn't affect other users.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email?.toLowerCase?.().trim();
    return email ? `auth:${email}` : (req.ip ?? 'unknown');
  },
  message: 'Too many authentication attempts, please try again later.',
});

// Public routes
router.post('/register', credentialLimiter, validateUser, validateRequest, register);
router.post('/login', credentialLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, login);

// Email verification routes
router.get('/verify-email', verifyLimiter, verifyEmail);
router.post('/resend-verification', resendLimiter, [
  body('email').isEmail().withMessage('Valid email is required')
], validateRequest, resendVerification);

// Password reset routes
router.post('/forgot-password', credentialLimiter, [
  body('email').isEmail().withMessage('Valid email is required')
], validateRequest, forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validateRequest, resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required')
], validateRequest, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.delete('/account', authenticateToken, deleteAccount);

// Notification routes
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationRead);

export default router;