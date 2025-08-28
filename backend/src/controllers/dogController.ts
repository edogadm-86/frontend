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

export const getDogHealthStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Get vaccination data
    const vaccinationsResult = await pool.query(
      'SELECT * FROM vaccinations WHERE dog_id = $1 ORDER BY date_given DESC',
      [dogId]
    );

    // Get health records
    const healthRecordsResult = await pool.query(
      'SELECT * FROM health_records WHERE dog_id = $1 ORDER BY date DESC',
      [dogId]
    );

    // Get recent appointments
    const appointmentsResult = await pool.query(
      'SELECT * FROM appointments WHERE dog_id = $1 AND date >= CURRENT_DATE - INTERVAL \'6 months\' ORDER BY date DESC',
      [dogId]
    );

    const vaccinations = vaccinationsResult.rows;
    const healthRecords = healthRecordsResult.rows;
    const appointments = appointmentsResult.rows;

    // Calculate health score
    let score = 0;
    let factors = [];

    // Vaccination score (40% of total)
    const recentVaccinations = vaccinations.filter(v => {
      const vaccinationDate = new Date(v.date_given);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return vaccinationDate >= oneYearAgo;
    });

    if (recentVaccinations.length >= 3) {
      score += 40;
      factors.push('Up-to-date vaccinations');
    } else if (recentVaccinations.length >= 1) {
      score += 25;
      factors.push('Some recent vaccinations');
    }

    // Health records score (30% of total)
    const recentHealthRecords = healthRecords.filter(r => {
      const recordDate = new Date(r.date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return recordDate >= sixMonthsAgo;
    });

    const illnessRecords = recentHealthRecords.filter(r => r.type === 'illness' || r.type === 'injury');
    const vetVisits = recentHealthRecords.filter(r => r.type === 'vet-visit');

    if (illnessRecords.length === 0 && vetVisits.length >= 1) {
      score += 30;
      factors.push('Regular vet checkups');
    } else if (illnessRecords.length <= 1) {
      score += 20;
      factors.push('Good health maintenance');
    } else {
      score += 10;
      factors.push('Some health concerns');
    }

    // Appointment compliance (20% of total)
    const upcomingAppointments = appointments.filter(a => new Date(a.date) >= new Date());
    if (upcomingAppointments.length > 0) {
      score += 20;
      factors.push('Scheduled appointments');
    } else if (appointments.length > 0) {
      score += 15;
      factors.push('Recent appointments');
    }

    // Regular care score (10% of total)
    if (healthRecords.length >= 5 || vaccinations.length >= 3) {
      score += 10;
      factors.push('Comprehensive care history');
    }

    // Determine status
    let status = 'Unknown';
    let statusColor = 'gray';
    let nextAction = 'Add more health data';

    if (score >= 85) {
      status = 'Excellent';
      statusColor = 'green';
      nextAction = 'Keep up the great work!';
    } else if (score >= 70) {
      status = 'Good';
      statusColor = 'blue';
      nextAction = 'Consider scheduling a checkup';
    } else if (score >= 50) {
      status = 'Fair';
      statusColor = 'yellow';
      nextAction = 'Schedule a vet visit soon';
    } else if (score >= 30) {
      status = 'Needs Attention';
      statusColor = 'orange';
      nextAction = 'Update vaccinations and schedule checkup';
    } else if (score > 0) {
      status = 'Poor';
      statusColor = 'red';
      nextAction = 'Immediate vet attention recommended';
    }

    // Check if we have enough data to show status
    const hasEnoughData = vaccinations.length > 0 || healthRecords.length > 0 || appointments.length > 0;

    res.json({
      hasEnoughData,
      score: Math.round(score),
      status,
      statusColor,
      nextAction,
      factors,
      summary: {
        totalVaccinations: vaccinations.length,
        recentVaccinations: recentVaccinations.length,
        totalHealthRecords: healthRecords.length,
        recentHealthRecords: recentHealthRecords.length,
        upcomingAppointments: upcomingAppointments.length
      }
    });
  } catch (error) {
    console.error('Get dog health status error:', error);
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