import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../types';

const verifyDogOwnership = async (dogId: string, userId: string) => {
  const result = await pool.query(
    'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
    [dogId, userId]
  );
  return result.rows.length > 0;
};

export const getGroomingSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    const result = await pool.query(
      'SELECT * FROM grooming_sessions WHERE dog_id = $1 ORDER BY date DESC',
      [dogId]
    );
    res.json({ groomingSessions: result.rows });
  } catch (error) {
    console.error('Get grooming sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createGroomingSession = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { date, groomer_name, groomer_contact, services, cost, coat_condition, notes, next_grooming_date } = req.body;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO grooming_sessions
       (id, dog_id, user_id, date, groomer_name, groomer_contact, services, cost, coat_condition, notes, next_grooming_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        id, dogId, req.user!.id, date,
        groomer_name || null, groomer_contact || null,
        services || [],
        cost != null ? cost : null,
        coat_condition != null ? coat_condition : null,
        notes || null,
        next_grooming_date || null,
      ]
    );
    res.status(201).json({ groomingSession: result.rows[0] });
  } catch (error) {
    console.error('Create grooming session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateGroomingSession = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;
    const { date, groomer_name, groomer_contact, services, cost, coat_condition, notes, next_grooming_date } = req.body;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      `UPDATE grooming_sessions
       SET date = $1, groomer_name = $2, groomer_contact = $3, services = $4,
           cost = $5, coat_condition = $6, notes = $7, next_grooming_date = $8, updated_at = NOW()
       WHERE id = $9 AND dog_id = $10 RETURNING *`,
      [
        date,
        groomer_name || null, groomer_contact || null,
        services || [],
        cost != null ? cost : null,
        coat_condition != null ? coat_condition : null,
        notes || null,
        next_grooming_date || null,
        id, dogId,
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Grooming session not found' });
    res.json({ groomingSession: result.rows[0] });
  } catch (error) {
    console.error('Update grooming session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteGroomingSession = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'DELETE FROM grooming_sessions WHERE id = $1 AND dog_id = $2 RETURNING id',
      [id, dogId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Grooming session not found' });
    res.json({ message: 'Grooming session deleted' });
  } catch (error) {
    console.error('Delete grooming session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
