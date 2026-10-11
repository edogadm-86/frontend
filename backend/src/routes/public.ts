// routes/public.ts
import { Router } from 'express';
import pool from '../config/database';
import { isValidBirthdayUnsubscribeToken } from '../services/birthdayService';

const router = Router();

// GET /api/public/dog/:id
router.get('/dog/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.id, d.name, d.breed, d.date_of_birth, d.weight, d.profile_picture,
              u.name as owner_name, u.phone as owner_phone,
              EXISTS (
                SELECT 1 FROM posts p
                WHERE p.dog_id = d.id
                  AND p.post_type = 'lost_dog'
                  AND p.is_resolved = false
              ) AS is_lost
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
        is_lost: dog.is_lost,
      },
      owner: {
        name: dog.owner_name,
        phone: dog.owner_phone,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// One-click unsubscribe from dog birthday emails (link + List-Unsubscribe header in the email)
const unsubscribeBirthday = async (req: any, res: any) => {
  const userId = String(req.query.u || '');
  const token = String(req.query.t || '');
  const ok = /^[0-9a-f-]{36}$/i.test(userId) && isValidBirthdayUnsubscribeToken(userId, token);
  if (ok) {
    await pool.query('UPDATE users SET birthday_emails = FALSE WHERE id = $1', [userId]).catch(() => {});
  }
  if (req.method === 'POST') return res.status(ok ? 200 : 400).end();
  const frontend = process.env.FRONTEND_URL || 'https://edog.bg';
  res.status(ok ? 200 : 400).type('html').send(`<!DOCTYPE html><html lang="bg"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>eDog</title></head>
<body style="font-family:Helvetica,Arial,sans-serif;background:#eef2f7;margin:0;padding:48px 16px;text-align:center;color:#374151;">
<div style="max-width:420px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
<div style="font-size:40px;">${ok ? '✅' : '⚠️'}</div>
<h1 style="font-size:20px;">${ok ? 'Отписахте се от поздравленията за рожден ден' : 'Невалиден линк'}</h1>
<p style="font-size:14px;color:#6b7280;">${ok
  ? 'Няма да получавате повече имейли за рождения ден на кучето. Напомнянията за ваксини продължават.'
  : 'Линкът за отписване е невалиден или непълен.'}</p>
<a href="${frontend}" style="display:inline-block;margin-top:12px;background:#005da7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">eDog</a>
</div></body></html>`);
};
router.get('/unsubscribe/birthday', unsubscribeBirthday);
router.post('/unsubscribe/birthday', unsubscribeBirthday);

export default router;
