import crypto from 'crypto';
import pool from '../config/database';
import { sendEmail, emailTemplates } from '../config/email';
import { sendPushToUser } from './pushService';

// Daily "happy birthday" email for every dog whose birthday is today (Europe/Sofia, the DB timezone).
// Dogs born on 29 Feb are greeted on 28 Feb in non-leap years.

const appUrl = () => process.env.FRONTEND_URL || 'https://edog.bg';
const apiBaseUrl = () => process.env.PUBLIC_API_URL || `${appUrl()}/api`;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const birthdayUnsubscribeToken = (userId: string) =>
  crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'edog')
    .update(`birthday-unsubscribe:${userId}`)
    .digest('hex')
    .slice(0, 32);

export const isValidBirthdayUnsubscribeToken = (userId: string, token: string) => {
  const expected = birthdayUnsubscribeToken(userId);
  return token.length === expected.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
};

// The column is also in scripts/migrate.ts; this keeps the job working if the migration hasn't run yet.
const ensureSchema = () =>
  pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS birthday_emails BOOLEAN NOT NULL DEFAULT TRUE');

export const sendDogBirthdayEmails = async () => {
  try {
    await ensureSchema();
    const result = await pool.query(`
      SELECT d.id AS dog_id, d.name AS dog_name, d.sex, d.profile_picture,
             EXTRACT(YEAR FROM age(CURRENT_DATE, d.date_of_birth))::int AS age,
             EXISTS (SELECT 1 FROM vaccinations v WHERE v.dog_id = d.id) AS has_vaccinations,
             u.id AS user_id, u.email, u.name AS owner_name, u.language
      FROM dogs d
      JOIN users u ON u.id = d.user_id
      WHERE d.date_of_birth IS NOT NULL
        AND d.date_of_birth < CURRENT_DATE
        AND u.email_verified = TRUE
        AND COALESCE(u.is_active, TRUE) = TRUE
        AND u.birthday_emails = TRUE
        AND (
          (EXTRACT(MONTH FROM d.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
           AND EXTRACT(DAY FROM d.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE))
          OR (
            -- 29 Feb birthdays on 28 Feb of non-leap years
            EXTRACT(MONTH FROM d.date_of_birth) = 2 AND EXTRACT(DAY FROM d.date_of_birth) = 29
            AND EXTRACT(MONTH FROM CURRENT_DATE) = 2 AND EXTRACT(DAY FROM CURRENT_DATE) = 28
            AND EXTRACT(DAY FROM (date_trunc('year', CURRENT_DATE) + INTERVAL '1 month 28 days')) <> 29
          )
        )
    `);

    let sent = 0;
    for (const row of result.rows) {
      if (row.age < 1) continue;
      const lang = row.language || 'bg';
      const unsubscribeUrl =
        `${apiBaseUrl()}/public/unsubscribe/birthday?u=${row.user_id}&t=${birthdayUnsubscribeToken(row.user_id)}`;
      const photoUrl = typeof row.profile_picture === 'string' && row.profile_picture.startsWith('https://')
        ? row.profile_picture
        : null;

      try {
        await sendEmail(row.email, emailTemplates.dogBirthday({
          dogName: escapeHtml(row.dog_name),
          ownerName: escapeHtml(row.owner_name || ''),
          age: row.age,
          sex: row.sex,
          photoUrl,
          hasVaccinations: row.has_vaccinations,
          appUrl: appUrl(),
          unsubscribeUrl,
          language: lang,
        }));
        sent++;
      } catch {
        // sendEmail already logged the failure; continue with the next dog
      }

      // No dedicated push category for greetings; 'vaccinations' is the closest health-related one
      await sendPushToUser(row.user_id, 'vaccinations', {
        title: lang === 'bg' ? `🎂 Честит рожден ден, ${row.dog_name}!` : `🎂 Happy birthday, ${row.dog_name}!`,
        body: lang === 'bg'
          ? `${row.dog_name} навършва ${row.age === 1 ? '1 година' : `${row.age} години`} днес 🎉`
          : `${row.dog_name} turns ${row.age} today 🎉`,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: `birthday-${row.dog_id}-${new Date().getFullYear()}`,
        url: '/',
      }).catch(() => {});
    }
    console.log(`Dog birthday emails: ${result.rows.length} birthdays, ${sent} emails sent`);
  } catch (error) {
    console.error('Error sending dog birthday emails:', error);
  }
};
