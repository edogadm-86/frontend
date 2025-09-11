"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDogHealthStatus = exports.deleteDog = exports.updateDog = exports.createDog = exports.getDogs = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const getDogs = async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT * FROM dogs WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json({ dogs: result.rows });
    }
    catch (error) {
        console.error('Get dogs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDogs = getDogs;
const createDog = async (req, res) => {
    try {
        const { name, breed, date_of_birth, weight, profile_picture, microchip_id, passport_number, sex, colour, features } = req.body;
        const dogId = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO dogs 
        (id, user_id, name, breed, date_of_birth, weight, profile_picture, microchip_id, passport_number, sex, colour, features) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`, [
            dogId,
            req.user.id,
            name,
            breed,
            date_of_birth,
            weight,
            profile_picture || null,
            microchip_id || null,
            passport_number || null,
            sex || null,
            colour || null,
            features || null
        ]);
        res.status(201).json({
            message: 'Dog created successfully',
            dog: result.rows[0]
        });
    }
    catch (error) {
        console.error('Create dog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createDog = createDog;
const updateDog = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, breed, date_of_birth, weight, profile_picture, microchip_id, passport_number, sex, colour, features } = req.body;
        const result = await database_1.default.query(`UPDATE dogs 
       SET 
         name = $1, 
         breed = $2, 
         date_of_birth = $3, 
         weight = $4, 
         profile_picture = $5, 
         microchip_id = $6, 
         passport_number = $7,
         sex = $8,
         colour = $9,
         features = $10,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND user_id = $12
       RETURNING *`, [
            name,
            breed,
            date_of_birth,
            weight,
            profile_picture || null,
            microchip_id || null,
            passport_number || null,
            sex || null,
            colour || null,
            features || null,
            id,
            req.user.id
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        res.json({
            message: 'Dog updated successfully',
            dog: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update dog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateDog = updateDog;
const deleteDog = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('DELETE FROM dogs WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        res.json({ message: 'Dog deleted successfully' });
    }
    catch (error) {
        console.error('Delete dog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteDog = deleteDog;
const getDogHealthStatus = async (req, res) => {
    try {
        const { dogId } = req.params;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT * FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const dog = dogCheck.rows[0];
        // Get all health data
        const [vaccinationsResult, healthRecordsResult, appointmentsResult] = await Promise.all([
            database_1.default.query('SELECT * FROM vaccinations WHERE dog_id = $1', [dogId]),
            database_1.default.query('SELECT * FROM health_records WHERE dog_id = $1', [dogId]),
            database_1.default.query('SELECT * FROM appointments WHERE dog_id = $1', [dogId])
        ]);
        const vaccinations = vaccinationsResult.rows;
        const healthRecords = healthRecordsResult.rows;
        const appointments = appointmentsResult.rows;
        // Check if we have enough data to calculate health status
        const totalRecords = vaccinations.length + healthRecords.length + appointments.length;
        if (totalRecords < 2) {
            return res.json({
                hasEnoughData: false,
                message: 'Not enough data to calculate health status'
            });
        }
        // Calculate health score
        let score = 0;
        const factors = [];
        // Vaccination score (40% weight)
        const currentDate = new Date();
        const upToDateVaccinations = vaccinations.filter(v => {
            if (!v.next_due_date)
                return true;
            return new Date(v.next_due_date) > currentDate;
        });
        const vaccinationScore = vaccinations.length > 0 ? (upToDateVaccinations.length / vaccinations.length) * 40 : 0;
        score += vaccinationScore;
        if (vaccinationScore >= 35)
            factors.push('Vaccinations up to date');
        else if (vaccinationScore >= 20)
            factors.push('Some vaccinations due');
        else
            factors.push('Vaccinations need attention');
        // Health records score (30% weight)
        const recentHealthRecords = healthRecords.filter(r => {
            const recordDate = new Date(r.date);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return recordDate > sixMonthsAgo;
        });
        const healthRecordScore = healthRecords.length > 0 ? Math.min((recentHealthRecords.length / 2) * 30, 30) : 0;
        score += healthRecordScore;
        if (healthRecordScore >= 25)
            factors.push('Regular health monitoring');
        else if (healthRecordScore >= 15)
            factors.push('Some health tracking');
        else
            factors.push('More health monitoring needed');
        // Appointment score (20% weight)
        const upcomingAppointments = appointments.filter(a => new Date(a.date) > currentDate);
        const appointmentScore = appointments.length > 0 ? Math.min((upcomingAppointments.length / 1) * 20, 20) : 0;
        score += appointmentScore;
        if (appointmentScore >= 15)
            factors.push('Appointments scheduled');
        else
            factors.push('Schedule regular checkups');
        // Care consistency score (10% weight)
        const careScore = Math.min(totalRecords * 2, 10);
        score += careScore;
        // Determine status and color
        let status, statusColor, nextAction;
        if (score >= 85) {
            status = 'Excellent';
            statusColor = 'green';
            nextAction = 'Keep up the great care routine!';
        }
        else if (score >= 70) {
            status = 'Good';
            statusColor = 'blue';
            nextAction = 'Consider scheduling a routine checkup';
        }
        else if (score >= 55) {
            status = 'Fair';
            statusColor = 'yellow';
            nextAction = 'Update vaccinations and schedule vet visit';
        }
        else if (score >= 40) {
            status = 'Needs Attention';
            statusColor = 'orange';
            nextAction = 'Schedule vet visit and update records';
        }
        else {
            status = 'Poor';
            statusColor = 'red';
            nextAction = 'Immediate vet attention recommended';
        }
        res.json({
            hasEnoughData: true,
            score: Math.round(score),
            status,
            statusColor,
            nextAction,
            factors,
            summary: {
                totalVaccinations: vaccinations.length,
                upToDateVaccinations: upToDateVaccinations.length,
                totalHealthRecords: healthRecords.length,
                recentHealthRecords: recentHealthRecords.length,
                totalAppointments: appointments.length,
                upcomingAppointments: upcomingAppointments.length
            }
        });
    }
    catch (error) {
        console.error('Get dog health status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDogHealthStatus = getDogHealthStatus;
//# sourceMappingURL=dogController.js.map