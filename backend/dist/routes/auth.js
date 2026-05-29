"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
const verifyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many verification attempts, please try again later.',
});
const resendLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many resend attempts, please try again in an hour.',
});
// Public routes
router.post('/register', validation_1.validateUser, validation_1.validateRequest, authController_1.register);
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
], validation_1.validateRequest, authController_1.login);
// Email verification routes
router.get('/verify-email', verifyLimiter, authController_1.verifyEmail);
router.post('/resend-verification', resendLimiter, [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required')
], validation_1.validateRequest, authController_1.resendVerification);
// Password reset routes
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required')
], validation_1.validateRequest, authController_1.forgotPassword);
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Reset token is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validation_1.validateRequest, authController_1.resetPassword);
// Protected routes
router.get('/profile', auth_1.authenticateToken, authController_1.getProfile);
router.put('/profile', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Valid phone number required')
], validation_1.validateRequest, authController_1.updateProfile);
router.post('/change-password', auth_1.authenticateToken, authController_1.changePassword);
router.delete('/account', auth_1.authenticateToken, authController_1.deleteAccount);
// Notification routes
router.get('/notifications', auth_1.authenticateToken, authController_1.getNotifications);
router.put('/notifications/:id/read', auth_1.authenticateToken, authController_1.markNotificationRead);
exports.default = router;
//# sourceMappingURL=auth.js.map