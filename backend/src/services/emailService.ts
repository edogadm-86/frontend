import cron from 'node-cron';
import pool from '../config/database';
import { sendEmail, emailTemplates } from '../config/email';
import { format } from 'date-fns';
import { sendPushToUser } from './pushService';

// Send appointment reminders
export const sendAppointmentReminders = async () => {
  try {
    console.log('Checking for appointment reminders...');

    const result = await pool.query(`
      SELECT
        a.id, a.title, a.date, a.time, a.reminder_time,
        d.name as dog_name,
        u.id as user_id, u.email, u.name as user_name, u.language
      FROM appointments a
      JOIN dogs d ON a.dog_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.reminder = true
        AND a.date = CURRENT_DATE
        AND EXTRACT(EPOCH FROM (a.time::time - LOCALTIME)) / 60 <= a.reminder_time
        AND EXTRACT(EPOCH FROM (a.time::time - LOCALTIME)) / 60 > 0
    `);

    for (const appointment of result.rows) {
      const lang = appointment.language || 'bg';

      // Email reminder
      const reminderTemplate = emailTemplates.appointmentReminder(
        appointment.dog_name,
        appointment.title,
        format(new Date(appointment.date), 'MMM dd, yyyy'),
        appointment.time,
        lang
      );
      await sendEmail(appointment.email, reminderTemplate);
      console.log(`Sent appointment reminder to ${appointment.email} for ${appointment.dog_name}`);

      // Push notification
      await sendPushToUser(appointment.user_id, 'appointments', {
        title: lang === 'bg'
          ? `Напомняне за среща - ${appointment.dog_name}`
          : `Appointment Reminder - ${appointment.dog_name}`,
        body: lang === 'bg'
          ? `${appointment.title} в ${appointment.time}`
          : `${appointment.title} at ${appointment.time}`,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: `appointment-${appointment.id}`,
        url: '/appointments',
      });
    }
  } catch (error) {
    console.error('Error sending appointment reminders:', error);
  }
};

// Reminder milestones (days relative to next_due_date). Sending only on these exact days
// means each vaccine produces at most 3 "upcoming" and 3 "overdue" messages — no daily spam.
const VACCINE_UPCOMING_DAYS = [30, 7, 1];
const VACCINE_OVERDUE_DAYS = [1, 14, 30];

const formatDueDate = (d: Date | string, lang: string) =>
  new Date(d).toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// Send vaccination reminders (upcoming + overdue)
export const sendVaccinationReminders = async () => {
  try {
    console.log('Checking for vaccination reminders...');

    // Only the latest record per dog + vaccine counts: an older "Rabies" entry whose
    // due date passed must not trigger an overdue email once a newer one was added.
    const result = await pool.query(`
      SELECT * FROM (
        SELECT DISTINCT ON (v.dog_id, LOWER(TRIM(v.vaccine_name)))
          v.id, v.vaccine_name, v.next_due_date,
          (v.next_due_date - CURRENT_DATE) AS days_until_due,
          d.name AS dog_name,
          u.id AS user_id, u.email, u.language
        FROM vaccinations v
        JOIN dogs d ON v.dog_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE v.next_due_date IS NOT NULL
        ORDER BY v.dog_id, LOWER(TRIM(v.vaccine_name)), v.next_due_date DESC
      ) latest
      WHERE days_until_due = ANY($1::int[]) OR -days_until_due = ANY($2::int[])
    `, [VACCINE_UPCOMING_DAYS, VACCINE_OVERDUE_DAYS]);

    let sent = 0;
    for (const v of result.rows) {
      const lang = v.language || 'bg';
      const days = Number(v.days_until_due);
      const dueDate = formatDueDate(v.next_due_date, lang);
      const overdue = days < 0;

      try {
        await sendEmail(
          v.email,
          overdue
            ? emailTemplates.vaccinationOverdue(v.dog_name, v.vaccine_name, dueDate, lang)
            : emailTemplates.vaccinationReminder(v.dog_name, v.vaccine_name, dueDate, lang, days)
        );
        sent++;
      } catch {
        // sendEmail already logged; still try push
      }

      const dayLabel = overdue
        ? (lang === 'bg' ? `изтекла преди ${-days} дни` : `overdue by ${-days} days`)
        : days === 1
          ? (lang === 'bg' ? 'утре' : 'tomorrow')
          : (lang === 'bg' ? `след ${days} дни` : `in ${days} days`);

      await sendPushToUser(v.user_id, 'vaccinations', {
        title: overdue
          ? (lang === 'bg' ? `Изтекла ваксина - ${v.dog_name}` : `Vaccination Overdue - ${v.dog_name}`)
          : (lang === 'bg' ? `Ваксинация скоро - ${v.dog_name}` : `Vaccination Due Soon - ${v.dog_name}`),
        body: overdue
          ? `${v.vaccine_name}: ${dayLabel}.`
          : (lang === 'bg' ? `${v.vaccine_name} е дължима ${dayLabel}.` : `${v.vaccine_name} is due ${dayLabel}.`),
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: `vaccination-${v.id}`,
        url: '/vaccinations',
      });
    }
    console.log(`Vaccination reminders: ${result.rows.length} due, ${sent} emails sent`);
  } catch (error) {
    console.error('Error sending vaccination reminders:', error);
  }
};

// Send push notifications for new medication health records (called by health route)
export const sendMedicationPush = async (
  userId: string,
  dogName: string,
  medication: string,
  dosage: string,
  language: string = 'bg'
): Promise<void> => {
  const lang = language;
  await sendPushToUser(userId, 'medications', {
    title: lang === 'bg'
      ? `Нова медикация за ${dogName}`
      : `New Medication for ${dogName}`,
    body: lang === 'bg'
      ? `${medication}${dosage ? ' - ' + dosage : ''}`
      : `${medication}${dosage ? ' — ' + dosage : ''}`,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: `medication-${Date.now()}`,
    url: '/health',
  });
};

// Send push reminders for upcoming community events
export const sendEventReminders = async () => {
  try {
    const { sendPushToUser } = await import('./pushService');

    // 24 h window: events starting 23–25 h from now
    const result24h = await pool.query(`
      SELECT e.id, e.title, e.location, ep.user_id, u.language
      FROM events e
      JOIN event_participants ep ON ep.event_id = e.id AND ep.status = 'attending'
      JOIN users u ON u.id = ep.user_id
      WHERE e.start_date BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
    `);
    for (const row of result24h.rows) {
      await sendPushToUser(row.user_id, 'appointments', {
        title: row.language === 'en' ? 'Event tomorrow!' : 'Събитие утре!',
        body: row.language === 'en'
          ? `"${row.title}" starts tomorrow${row.location ? ` at ${row.location}` : ''}.`
          : `"${row.title}" започва утре${row.location ? ` в ${row.location}` : ''}.`,
        icon: '/pwa-192x192.png',
        tag: `event-24h-${row.id}`,
        url: '/community',
      });
    }

    // 1 h window: events starting 55–65 min from now
    const result1h = await pool.query(`
      SELECT e.id, e.title, e.location, ep.user_id, u.language
      FROM events e
      JOIN event_participants ep ON ep.event_id = e.id AND ep.status = 'attending'
      JOIN users u ON u.id = ep.user_id
      WHERE e.start_date BETWEEN NOW() + INTERVAL '55 minutes' AND NOW() + INTERVAL '65 minutes'
    `);
    for (const row of result1h.rows) {
      await sendPushToUser(row.user_id, 'appointments', {
        title: row.language === 'en' ? 'Event in 1 hour!' : 'Събитие след 1 час!',
        body: row.language === 'en'
          ? `"${row.title}" starts in about 1 hour${row.location ? ` at ${row.location}` : ''}.`
          : `"${row.title}" започва след около 1 час${row.location ? ` в ${row.location}` : ''}.`,
        icon: '/pwa-192x192.png',
        tag: `event-1h-${row.id}`,
        url: '/community',
      });
    }

    console.log(`Event reminders sent: ${result24h.rows.length} (24h), ${result1h.rows.length} (1h)`);
  } catch (error) {
    console.error('Error sending event reminders:', error);
  }
};

// Send push reminders for medication recurring reminders due today or tomorrow
export const sendMedicationRecurringReminders = async () => {
  try {
    const result = await pool.query(`
      SELECT mr.id, mr.name, mr.next_due_date,
             d.name as dog_name,
             u.id as user_id, u.language
      FROM medication_reminders mr
      JOIN dogs d ON mr.dog_id = d.id
      JOIN users u ON mr.user_id = u.id
      WHERE mr.is_active = true
        AND mr.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day'
    `);

    for (const row of result.rows) {
      const lang = row.language || 'bg';
      const isToday = new Date(row.next_due_date).toDateString() === new Date().toDateString();
      const dayLabel = isToday
        ? (lang === 'bg' ? 'днес' : 'today')
        : (lang === 'bg' ? 'утре' : 'tomorrow');

      await sendPushToUser(row.user_id, 'medications', {
        title: lang === 'bg'
          ? `Напомняне за лекарство - ${row.dog_name}`
          : `Medication Reminder - ${row.dog_name}`,
        body: lang === 'bg'
          ? `${row.name} е дължимо ${dayLabel}.`
          : `${row.name} is due ${dayLabel}.`,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: `med-reminder-${row.id}`,
        url: '/health',
      });
    }
    console.log(`Medication recurring reminders sent: ${result.rows.length}`);
  } catch (error) {
    console.error('Error sending medication recurring reminders:', error);
  }
};

// Schedule cron jobs
export const startEmailScheduler = () => {
  // Check for appointment reminders every 15 minutes
  cron.schedule('*/15 * * * *', sendAppointmentReminders);

  // Check for vaccination reminders daily at 9 AM
  cron.schedule('0 9 * * *', sendVaccinationReminders);

  // Check for event reminders every 15 minutes
  cron.schedule('*/15 * * * *', sendEventReminders);

  // Check for medication recurring reminders daily at 8 AM
  cron.schedule('0 8 * * *', sendMedicationRecurringReminders);

  console.log('Email scheduler started');
};

// Manual trigger functions for testing
export const triggerAppointmentReminders = async (req: any, res: any) => {
  try {
    await sendAppointmentReminders();
    res.json({ message: 'Appointment reminders sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reminders' });
  }
};

export const triggerVaccinationReminders = async (req: any, res: any) => {
  try {
    await sendVaccinationReminders();
    res.json({ message: 'Vaccination reminders sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reminders' });
  }
};
