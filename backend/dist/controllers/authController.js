"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.markNotificationRead = exports.getNotifications = exports.updateProfile = exports.getProfile = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
const email_1 = require("../config/email");
const crypto_2 = require("crypto");
const JWT_SECRET = process.env.JWT_SECRET;
const makeKey = (...parts) => (0, crypto_2.createHash)('sha1').update(parts.join('|')).digest('hex');
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '1d');
const register = async (req, res) => {
    try {
        const { name, email, password, phone, language = 'en' } = req.body;
        // Check if user already exists
        const existingUser = await database_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user
        const userId = (0, uuid_1.v4)();
        const result = await database_1.default.query('INSERT INTO users (id, name, email, password_hash, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, created_at', [userId, name, email, passwordHash, phone || null]);
        const user = result.rows[0];
        // Send welcome email
        try {
            const welcomeTemplate = email_1.emailTemplates.welcome(user.name, language);
            await (0, email_1.sendEmail)(user.email, welcomeTemplate);
        }
        catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const result = await database_1.default.query('SELECT id, name, email, phone, password_hash, created_at FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { email, language = 'en' } = req.body;
        // Check if user exists
        const userResult = await database_1.default.query('SELECT id, name FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            // Don't reveal if email exists or not for security
            return res.json({ message: 'If the email exists, a reset link has been sent.' });
        }
        const user = userResult.rows[0];
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
        // Store reset token in database
        await database_1.default.query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', [resetToken, resetTokenExpiry, user.id]);
        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const resetTemplate = email_1.emailTemplates.passwordReset(resetUrl, language);
        await (0, email_1.sendEmail)(email, resetTemplate);
        res.json({ message: 'If the email exists, a reset link has been sent.' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        // Find user with valid reset token
        const userResult = await database_1.default.query('SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()', [token]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        const user = userResult.rows[0];
        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // Update password and clear reset token
        await database_1.default.query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [passwordHash, user.id]);
        res.json({ message: 'Password reset successful' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
const getProfile = async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT id, name, email, phone, created_at FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const result = await database_1.default.query('UPDATE users SET name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, email, phone, updated_at', [name, email, phone || null, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                updatedAt: user.updated_at
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
const getNotifications = async (req, res) => {
    try {
        const notifications = [];
        // Get user's dogs
        const dogsResult = await database_1.default.query('SELECT id, name FROM dogs WHERE user_id = $1', [req.user.id]);
        const dogs = dogsResult.rows;
        if (dogs.length > 0) {
            // Check for upcoming vaccinations (due in next 30 days)
            const upcomingVaccinations = await database_1.default.query(`
      SELECT v.vaccine_name, v.next_due_date, v.dog_id, d.name as dog_name
      FROM vaccinations v
      JOIN dogs d ON v.dog_id = d.id
      WHERE d.user_id = $1 
        AND v.next_due_date IS NOT NULL
        AND v.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      ORDER BY v.next_due_date ASC
      `, [req.user.id]);
            // Vaccinations
            upcomingVaccinations.rows.forEach(vac => {
                const iso = new Date(vac.next_due_date).toISOString().slice(0, 10);
                const key = makeKey('vaccination', vac.dog_id, vac.vaccine_name, iso);
                const daysUntil = Math.ceil((new Date(vac.next_due_date).getTime() - Date.now()) / 86400000);
                notifications.push({
                    id: key,
                    title: `Vaccination due for ${vac.dog_name}`,
                    message: `${vac.vaccine_name} vaccination due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
                    time: `${daysUntil} day${daysUntil !== 1 ? 's' : ''} from now`,
                    type: daysUntil <= 7 ? 'warning' : 'info',
                    read: false,
                    created_at: new Date().toISOString()
                });
            });
            // Check for upcoming appointments (next 7 days)
            const upcomingAppointments = await database_1.default.query(`
        SELECT a.title, a.date, a.time, a.dog_id, d.name as dog_name
        FROM appointments a
        JOIN dogs d ON a.dog_id = d.id
        WHERE d.user_id = $1 
          AND a.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        ORDER BY a.date ASC, a.time ASC
      `, [req.user.id]);
            // Appointments
            upcomingAppointments.rows.forEach(apt => {
                const isoDate = new Date(apt.date).toISOString().slice(0, 10);
                const timeStr = String(apt.time); // ensure string
                const key = makeKey('appointment', apt.dog_id, apt.title, isoDate, timeStr);
                const appointmentDate = new Date(apt.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                appointmentDate.setHours(0, 0, 0, 0);
                const daysUntil = Math.ceil((appointmentDate.getTime() - today.getTime()) / 86400000);
                const timeText = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
                notifications.push({
                    id: key,
                    title: `Appointment reminder`,
                    message: `${apt.title} for ${apt.dog_name} ${timeText} at ${apt.time}`,
                    time: timeText,
                    type: daysUntil <= 1 ? 'warning' : 'info',
                    read: false,
                    created_at: new Date().toISOString()
                });
            });
            // Check for recent training achievements
            const recentTraining = await database_1.default.query(`
        SELECT t.progress, t.date, t.dog_id, d.name as dog_name, t.commands
        FROM training_sessions t
        JOIN dogs d ON t.dog_id = d.id
        WHERE d.user_id = $1 
          AND t.date >= CURRENT_DATE - INTERVAL '7 days'
          AND t.progress = 'excellent'
        ORDER BY t.date DESC
        LIMIT 3
      `, [req.user.id]);
            // Training
            recentTraining.rows.forEach(training => {
                const isoDate = new Date(training.date).toISOString().slice(0, 10);
                const key = makeKey('training', training.dog_id, isoDate, 'excellent');
                const trainingDate = new Date(training.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                trainingDate.setHours(0, 0, 0, 0);
                const daysAgo = Math.floor((today.getTime() - trainingDate.getTime()) / 86400000);
                const timeText = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`;
                notifications.push({
                    id: key,
                    title: `Training milestone`,
                    message: `${training.dog_name} had an excellent training session ${timeText}!`,
                    time: timeText,
                    type: 'success',
                    read: false,
                    created_at: new Date().toISOString()
                });
            });
        }
        // annotate read flags
        if (notifications.length > 0) {
            const keys = notifications.map(n => n.id);
            const placeholders = keys.map((_, i) => `$${i + 2}`).join(',');
            const readRes = await database_1.default.query(`SELECT notif_key FROM user_read_notifications
        WHERE user_id = $1 AND notif_key IN (${placeholders})`, [req.user.id, ...keys]);
            const readSet = new Set(readRes.rows.map(r => r.notif_key));
            notifications.forEach(n => { n.read = readSet.has(n.id); });
        }
        // Sort notifications by urgency and date
        notifications.sort((a, b) => {
            const urgencyOrder = { warning: 0, info: 1, success: 2 };
            if (a.type !== b.type) {
                return urgencyOrder[a.type] - urgencyOrder[b.type];
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        res.json({ notifications: notifications.slice(0, 10) });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getNotifications = getNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params; // this is the stable notif_key
        await database_1.default.query(`INSERT INTO user_read_notifications (user_id, notif_key)
       VALUES ($1, $2)
       ON CONFLICT (user_id, notif_key) DO NOTHING`, [req.user.id, id]);
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markNotificationRead = markNotificationRead;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // Get logged-in user
        const result = await database_1.default.query('SELECT id, password_hash FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        // Check current password
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        // Hash new password
        const saltRounds = 12;
        const newHash = await bcryptjs_1.default.hash(newPassword, saltRounds);
        // Update DB
        await database_1.default.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, user.id]);
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map