// routes/public.ts
import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// GET /api/public/dog/:id
router.get('/dog/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.id, d.name, d.breed, d.date_of_birth, d.weight, d.profile_picture,
              u.name as owner_name, u.phone as owner_phone
       FROM dogs d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'Dog not found' });

    // expose only safe fields
    const dog = result.rows[0];
    res.json({
      dog: {
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        date_of_birth: dog.date_of_birth,
        weight: dog.weight,
        profile_picture: dog.profile_picture,
      },
      owner: {
        name: dog.owner_name,
        phone: dog.owner_phone, // you may decide to hide this or show only partially
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
