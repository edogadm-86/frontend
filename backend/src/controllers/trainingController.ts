import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getTrainingSessions = async (req: AuthRequest, res: Response) => {
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
      'SELECT * FROM training_sessions WHERE dog_id = $1 ORDER BY date DESC',
      [dogId]
    );

    res.json({ trainingSessions: result.rows });
  } catch (error) {
    console.error('Get training sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTrainingSession = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { date, duration, commands, progress, notes, behavior_notes, walk_path, distance_meters, calories_burned } = req.body;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const sessionId = uuidv4();
    const walkPathJson = walk_path && Array.isArray(walk_path) && walk_path.length > 1
      ? JSON.stringify(walk_path)
      : null;
    const distM = distance_meters != null && distance_meters > 0 ? distance_meters : null;
    const cal = calories_burned != null && calories_burned > 0 ? Math.round(calories_burned) : null;
    const result = await pool.query(
      'INSERT INTO training_sessions (id, dog_id, date, duration, commands, progress, notes, behavior_notes, walk_path, distance_meters, calories_burned) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [sessionId, dogId, date, duration, commands || [], progress, notes, behavior_notes || null, walkPathJson, distM, cal]
    );

    res.status(201).json({
      message: 'Training session created successfully',
      trainingSession: result.rows[0]
    });
  } catch (error) {
    console.error('Create training session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTrainingSession = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;
    const { date, duration, commands, progress, notes, behavior_notes } = req.body;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'UPDATE training_sessions SET date = $1, duration = $2, commands = $3, progress = $4, notes = $5, behavior_notes = $6 WHERE id = $7 AND dog_id = $8 RETURNING *',
      [date, duration, commands || [], progress, notes, behavior_notes || null, id, dogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training session not found' });
    }

    res.json({
      message: 'Training session updated successfully',
      trainingSession: result.rows[0]
    });
  } catch (error) {
    console.error('Update training session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTrainingSession = async (req: AuthRequest, res: Response) => {
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
      'DELETE FROM training_sessions WHERE id = $1 AND dog_id = $2 RETURNING id',
      [id, dogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training session not found' });
    }

    res.json({ message: 'Training session deleted successfully' });
  } catch (error) {
    console.error('Delete training session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};