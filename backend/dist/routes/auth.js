"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// Public routes
router.post('/register', validation_1.validateUser, validation_1.validateRequest, authController_1.register);
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
], validation_1.validateRequest, authController_1.login);
// Password reset routes
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required')
], validation_1.validateRequest, authController_1.forgotPassword);
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Reset token is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validation_1.validateRequest, authController_1.resetPassword);
// Protected routes
router.get('/profile', auth_1.authenticateToken, authController_1.getProfile);
router.put('/profile', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Valid phone number required')
], validation_1.validateRequest, authController_1.updateProfile);
// Notification routes
router.get('/notifications', auth_1.authenticateToken, authController_1.getNotifications);
router.put('/notifications/:id/read', auth_1.authenticateToken, authController_1.markNotificationRead);
exports.default = router;
//# sourceMappingURL=auth.js.map