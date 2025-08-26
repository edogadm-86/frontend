import cron from 'node-cron';
import pool from '../config/database';
import { sendEmail, emailTemplates } from '../config/email';
import { format, addDays, isAfter, isBefore } from 'date-fns';

// Send appointment reminders
export const sendAppointmentReminders = async () => {
  try {
    console.log('Checking for appointment reminders...');
    
    // Get appointments that need reminders (1 hour before by default)
    const result = await pool.query(`
      SELECT 
        a.id, a.title, a.date, a.time, a.reminder_time,
        d.name as dog_name,
        u.email, u.name as user_name, u.language
      FROM appointments a
      JOIN dogs d ON a.dog_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.reminder = true 
        AND a.date = CURRENT_DATE
        AND EXTRACT(EPOCH FROM (a.time::time - CURRENT_TIME)) / 60 <= a.reminder_time
        AND EXTRACT(EPOCH FROM (a.time::time - CURRENT_TIME)) / 60 > 0
    `);

    for (const appointment of result.rows) {
      const reminderTemplate = emailTemplates.appointmentReminder(
        appointment.dog_name,
        appointment.title,
        format(new Date(appointment.date), 'MMM dd, yyyy'),
        appointment.time,
        appointment.language || 'en'
      );

      await sendEmail(appointment.email, reminderTemplate);
      console.log(`Sent appointment reminder to ${appointment.email} for ${appointment.dog_name}`);
    }
  } catch (error) {
    console.error('Error sending appointment reminders:', error);
  }
};

// Send vaccination reminders
export const sendVaccinationReminders = async () => {
  try {
    console.log('Checking for vaccination reminders...');
    
    // Get vaccinations due in the next 30 days
    const result = await pool.query(`
      SELECT 
        v.id, v.vaccine_name, v.next_due_date,
        d.name as dog_name,
        u.email, u.name as user_name, u.language
      FROM vaccinations v
      JOIN dogs d ON v.dog_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE v.next_due_date IS NOT NULL
        AND v.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        AND v.next_due_date >= CURRENT_DATE
    `);

    for (const vaccination of result.rows) {
      const reminderTemplate = emailTemplates.vaccinationReminder(
        vaccination.dog_name,
        vaccination.vaccine_name,
        format(new Date(vaccination.next_due_date), 'MMM dd, yyyy'),
        vaccination.language || 'en'
      );

      await sendEmail(vaccination.email, reminderTemplate);
      console.log(`Sent vaccination reminder to ${vaccination.email} for ${vaccination.dog_name}`);
    }
  } catch (error) {
    console.error('Error sending vaccination reminders:', error);
  }
};

// Schedule cron jobs
export const startEmailScheduler = () => {
  // Check for appointment reminders every 15 minutes
  cron.schedule('*/15 * * * *', sendAppointmentReminders);
  
  // Check for vaccination reminders daily at 9 AM
  cron.schedule('0 9 * * *', sendVaccinationReminders);
  
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