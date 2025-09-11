"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrainingSession = exports.updateTrainingSession = exports.createTrainingSession = exports.getTrainingSessions = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const getTrainingSessions = async (req, res) => {
    try {
        const { dogId } = req.params;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('SELECT * FROM training_sessions WHERE dog_id = $1 ORDER BY date DESC', [dogId]);
        res.json({ trainingSessions: result.rows });
    }
    catch (error) {
        console.error('Get training sessions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getTrainingSessions = getTrainingSessions;
const createTrainingSession = async (req, res) => {
    try {
        const { dogId } = req.params;
        const { date, duration, commands, progress, notes, behavior_notes } = req.body;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const sessionId = (0, uuid_1.v4)();
        const result = await database_1.default.query('INSERT INTO training_sessions (id, dog_id, date, duration, commands, progress, notes, behavior_notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [sessionId, dogId, date, duration, commands || [], progress, notes, behavior_notes || null]);
        res.status(201).json({
            message: 'Training session created successfully',
            trainingSession: result.rows[0]
        });
    }
    catch (error) {
        console.error('Create training session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createTrainingSession = createTrainingSession;
const updateTrainingSession = async (req, res) => {
    try {
        const { dogId, id } = req.params;
        const { date, duration, commands, progress, notes, behavior_notes } = req.body;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('UPDATE training_sessions SET date = $1, duration = $2, commands = $3, progress = $4, notes = $5, behavior_notes = $6 WHERE id = $7 AND dog_id = $8 RETURNING *', [date, duration, commands || [], progress, notes, behavior_notes || null, id, dogId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Training session not found' });
        }
        res.json({
            message: 'Training session updated successfully',
            trainingSession: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update training session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateTrainingSession = updateTrainingSession;
const deleteTrainingSession = async (req, res) => {
    try {
        const { dogId, id } = req.params;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('DELETE FROM training_sessions WHERE id = $1 AND dog_id = $2 RETURNING id', [id, dogId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Training session not found' });
        }
        res.json({ message: 'Training session deleted successfully' });
    }
    catch (error) {
        console.error('Delete training session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteTrainingSession = deleteTrainingSession;
//# sourceMappingURL=trainingController.js.map