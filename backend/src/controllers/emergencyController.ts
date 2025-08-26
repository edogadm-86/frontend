import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getEmergencyContacts = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.id]
    );

    res.json({ emergencyContacts: result.rows });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createEmergencyContact = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, phone, address, available_24h } = req.body;

    const contactId = uuidv4();
    const result = await pool.query(
      'INSERT INTO emergency_contacts (id, user_id, name, type, phone, address, available_24h) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [contactId, req.user!.id, name, type, phone, address || null, available_24h !== false]
    );

    res.status(201).json({
      message: 'Emergency contact created successfully',
      emergencyContact: result.rows[0]
    });
  } catch (error) {
    console.error('Create emergency contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEmergencyContact = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, phone, address, available_24h } = req.body;

    const result = await pool.query(
      'UPDATE emergency_contacts SET name = $1, type = $2, phone = $3, address = $4, available_24h = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [name, type, phone, address || null, available_24h !== false, id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emergency contact not found' });
    }

    res.json({
      message: 'Emergency contact updated successfully',
      emergencyContact: result.rows[0]
    });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEmergencyContact = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emergency contact not found' });
    }

    res.json({ message: 'Emergency contact deleted successfully' });
  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};