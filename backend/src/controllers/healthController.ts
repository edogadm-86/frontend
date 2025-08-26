import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getHealthRecords = async (req: AuthRequest, res: Response) => {
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

    const result = await pool.query(
      'SELECT * FROM health_records WHERE dog_id = $1 ORDER BY date DESC',
      [dogId]
    );

    res.json({ healthRecords: result.rows });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { date, type, title, description, veterinarian, medication, dosage } = req.body;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const recordId = uuidv4();
    const result = await pool.query(
      'INSERT INTO health_records (id, dog_id, date, type, title, description, veterinarian, medication, dosage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [recordId, dogId, date, type, title, description, veterinarian || null, medication || null, dosage || null]
    );

    res.status(201).json({
      message: 'Health record created successfully',
      healthRecord: result.rows[0]
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;
    const { date, type, title, description, veterinarian, medication, dosage } = req.body;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'UPDATE health_records SET date = $1, type = $2, title = $3, description = $4, veterinarian = $5, medication = $6, dosage = $7 WHERE id = $8 AND dog_id = $9 RETURNING *',
      [date, type, title, description, veterinarian || null, medication || null, dosage || null, id, dogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    res.json({
      message: 'Health record updated successfully',
      healthRecord: result.rows[0]
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'DELETE FROM health_records WHERE id = $1 AND dog_id = $2 RETURNING id',
      [id, dogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};