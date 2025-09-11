"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVaccination = exports.updateVaccination = exports.createVaccination = exports.getVaccinations = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const getVaccinations = async (req, res) => {
    try {
        const { dogId } = req.params;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('SELECT * FROM vaccinations WHERE dog_id = $1 ORDER BY date_given DESC', [dogId]);
        res.json({ vaccinations: result.rows });
    }
    catch (error) {
        console.error('Get vaccinations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getVaccinations = getVaccinations;
const createVaccination = async (req, res) => {
    try {
        const { dogId } = req.params;
        const { vaccine_name, vaccine_type, date_given, next_due_date, veterinarian, batch_number, notes } = req.body;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const vaccinationId = (0, uuid_1.v4)();
        const result = await database_1.default.query('INSERT INTO vaccinations (id, dog_id, vaccine_name, vaccine_type, date_given, next_due_date, veterinarian, batch_number, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [vaccinationId, dogId, vaccine_name, vaccine_type, date_given, next_due_date || null, veterinarian, batch_number || null, notes || null]);
        res.status(201).json({
            message: 'Vaccination record created successfully',
            vaccination: result.rows[0]
        });
    }
    catch (error) {
        console.error('Create vaccination error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createVaccination = createVaccination;
const updateVaccination = async (req, res) => {
    try {
        const { dogId, id } = req.params;
        const { vaccine_name, vaccine_type, date_given, next_due_date, veterinarian, batch_number, notes } = req.body;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('UPDATE vaccinations SET vaccine_name = $1, vaccine_type = $2, date_given = $3, next_due_date = $4, veterinarian = $5, batch_number = $6, notes = $7 WHERE id = $8 AND dog_id = $9 RETURNING *', [vaccine_name, vaccine_type, date_given, next_due_date || null, veterinarian, batch_number || null, notes || null, id, dogId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vaccination record not found' });
        }
        res.json({
            message: 'Vaccination record updated successfully',
            vaccination: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update vaccination error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateVaccination = updateVaccination;
const deleteVaccination = async (req, res) => {
    try {
        const { dogId, id } = req.params;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('DELETE FROM vaccinations WHERE id = $1 AND dog_id = $2 RETURNING id', [id, dogId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vaccination record not found' });
        }
        res.json({ message: 'Vaccination record deleted successfully' });
    }
    catch (error) {
        console.error('Delete vaccination error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteVaccination = deleteVaccination;
//# sourceMappingURL=vaccinationController.js.map