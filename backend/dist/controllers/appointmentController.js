"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointments = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const getAppointments = async (req, res) => {
    try {
        const { dogId } = req.params;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('SELECT * FROM appointments WHERE dog_id = $1 ORDER BY date ASC, time ASC', [dogId]);
        res.json({ appointments: result.rows });
    }
    catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAppointments = getAppointments;
const createAppointment = async (req, res) => {
    try {
        const { dogId } = req.params;
        const { title, type, date, time, location, notes, reminder, reminder_time } = req.body;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const appointmentId = (0, uuid_1.v4)();
        const result = await database_1.default.query('INSERT INTO appointments (id, dog_id, title, type, date, time, location, notes, reminder, reminder_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', [appointmentId, dogId, title, type, date, time, location || null, notes || null, reminder !== false, reminder_time || 60]);
        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: result.rows[0]
        });
    }
    catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createAppointment = createAppointment;
const updateAppointment = async (req, res) => {
    try {
        const { dogId, id } = req.params;
        const { title, type, date, time, location, notes, reminder, reminder_time } = req.body;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('UPDATE appointments SET title = $1, type = $2, date = $3, time = $4, location = $5, notes = $6, reminder = $7, reminder_time = $8 WHERE id = $9 AND dog_id = $10 RETURNING *', [title, type, date, time, location || null, notes || null, reminder !== false, reminder_time || 60, id, dogId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json({
            message: 'Appointment updated successfully',
            appointment: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateAppointment = updateAppointment;
const deleteAppointment = async (req, res) => {
    try {
        const { dogId, id } = req.params;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('DELETE FROM appointments WHERE id = $1 AND dog_id = $2 RETURNING id', [id, dogId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    }
    catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteAppointment = deleteAppointment;
//# sourceMappingURL=appointmentController.js.map