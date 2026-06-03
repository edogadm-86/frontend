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

export const getDogPhotos = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    const result = await pool.query(
      'SELECT * FROM dog_photos WHERE dog_id = $1 ORDER BY taken_at DESC, created_at DESC',
      [dogId]
    );
    res.json({ photos: result.rows });
  } catch (error) {
    console.error('Get dog photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDogPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { photo_url, caption, milestone_tag, taken_at } = req.body;

    if (!photo_url) return res.status(400).json({ error: 'photo_url is required' });
    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO dog_photos (id, dog_id, user_id, photo_url, caption, milestone_tag, taken_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, dogId, req.user!.id, photo_url, caption || null, milestone_tag || null, taken_at || new Date().toISOString().slice(0, 10)]
    );
    res.status(201).json({ photo: result.rows[0] });
  } catch (error) {
    console.error('Create dog photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDogPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;
    const { caption, milestone_tag, taken_at } = req.body;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      `UPDATE dog_photos SET caption = $1, milestone_tag = $2, taken_at = $3, updated_at = NOW()
       WHERE id = $4 AND dog_id = $5 RETURNING *`,
      [caption || null, milestone_tag || null, taken_at, id, dogId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
    res.json({ photo: result.rows[0] });
  } catch (error) {
    console.error('Update dog photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDogPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'DELETE FROM dog_photos WHERE id = $1 AND dog_id = $2 RETURNING id',
      [id, dogId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
    res.json({ message: 'Photo deleted' });
  } catch (error) {
    console.error('Delete dog photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
