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