import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getDogs = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dogs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.id]
    );

    res.json({ dogs: result.rows });
  } catch (error) {
    console.error('Get dogs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDog = async (req: AuthRequest, res: Response) => {
  try {
    const { name, breed, age, weight, profile_picture, microchip_id, license_number } = req.body;

    const dogId = uuidv4();
    const result = await pool.query(
      'INSERT INTO dogs (id, user_id, name, breed, age, weight, profile_picture, microchip_id, license_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [dogId, req.user!.id, name, breed, age, weight, profile_picture || null, microchip_id || null, license_number || null]
    );

    res.status(201).json({
      message: 'Dog created successfully',
      dog: result.rows[0]
    });
  } catch (error) {
    console.error('Create dog error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, breed, age, weight, profile_picture, microchip_id, license_number } = req.body;

    const result = await pool.query(
      'UPDATE dogs SET name = $1, breed = $2, age = $3, weight = $4, profile_picture = $5, microchip_id = $6, license_number = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 AND user_id = $9 RETURNING *',
      [name, breed, age, weight, profile_picture || null, microchip_id || null, license_number || null, id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    res.json({
      message: 'Dog updated successfully',
      dog: result.rows[0]
    });
  } catch (error) {
    console.error('Update dog error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM dogs WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    res.json({ message: 'Dog deleted successfully' });
  } catch (error) {
    console.error('Delete dog error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDogHealthStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT * FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const dog = dogCheck.rows[0];

    // Get all health data
    const [vaccinationsResult, healthRecordsResult, appointmentsResult] = await Promise.all([
      pool.query('SELECT * FROM vaccinations WHERE dog_id = $1', [dogId]),
      pool.query('SELECT * FROM health_records WHERE dog_id = $1', [dogId]),
      pool.query('SELECT * FROM appointments WHERE dog_id = $1', [dogId])
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
      if (!v.next_due_date) return true;
      return new Date(v.next_due_date) > currentDate;
    });
    
    const vaccinationScore = vaccinations.length > 0 ? (upToDateVaccinations.length / vaccinations.length) * 40 : 0;
    score += vaccinationScore;
    
    if (vaccinationScore >= 35) factors.push('Vaccinations up to date');
    else if (vaccinationScore >= 20) factors.push('Some vaccinations due');
    else factors.push('Vaccinations need attention');

    // Health records score (30% weight)
    const recentHealthRecords = healthRecords.filter(r => {
      const recordDate = new Date(r.date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return recordDate > sixMonthsAgo;
    });
    
    const healthRecordScore = healthRecords.length > 0 ? Math.min((recentHealthRecords.length / 2) * 30, 30) : 0;
    score += healthRecordScore;
    
    if (healthRecordScore >= 25) factors.push('Regular health monitoring');
    else if (healthRecordScore >= 15) factors.push('Some health tracking');
    else factors.push('More health monitoring needed');

    // Appointment score (20% weight)
    const upcomingAppointments = appointments.filter(a => new Date(a.date) > currentDate);
    const appointmentScore = appointments.length > 0 ? Math.min((upcomingAppointments.length / 1) * 20, 20) : 0;
    score += appointmentScore;
    
    if (appointmentScore >= 15) factors.push('Appointments scheduled');
    else factors.push('Schedule regular checkups');

    // Care consistency score (10% weight)
    const careScore = Math.min(totalRecords * 2, 10);
    score += careScore;

    // Determine status and color
    let status, statusColor, nextAction;
    
    if (score >= 85) {
      status = 'Excellent';
      statusColor = 'green';
      nextAction = 'Keep up the great care routine!';
    } else if (score >= 70) {
      status = 'Good';
      statusColor = 'blue';
      nextAction = 'Consider scheduling a routine checkup';
    } else if (score >= 55) {
      status = 'Fair';
      statusColor = 'yellow';
      nextAction = 'Update vaccinations and schedule vet visit';
    } else if (score >= 40) {
      status = 'Needs Attention';
      statusColor = 'orange';
      nextAction = 'Schedule vet visit and update records';
    } else {
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
  } catch (error) {
    console.error('Get dog health status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};