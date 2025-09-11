"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerVaccinationReminders = exports.triggerAppointmentReminders = exports.startEmailScheduler = exports.sendVaccinationReminders = exports.sendAppointmentReminders = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = __importDefault(require("../config/database"));
const email_1 = require("../config/email");
const date_fns_1 = require("date-fns");
// Send appointment reminders
const sendAppointmentReminders = async () => {
    try {
        console.log('Checking for appointment reminders...');
        // Get appointments that need reminders (1 hour before by default)
        const result = await database_1.default.query(`
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
            const reminderTemplate = email_1.emailTemplates.appointmentReminder(appointment.dog_name, appointment.title, (0, date_fns_1.format)(new Date(appointment.date), 'MMM dd, yyyy'), appointment.time, appointment.language || 'en');
            await (0, email_1.sendEmail)(appointment.email, reminderTemplate);
            console.log(`Sent appointment reminder to ${appointment.email} for ${appointment.dog_name}`);
        }
    }
    catch (error) {
        console.error('Error sending appointment reminders:', error);
    }
};
exports.sendAppointmentReminders = sendAppointmentReminders;
// Send vaccination reminders
const sendVaccinationReminders = async () => {
    try {
        console.log('Checking for vaccination reminders...');
        // Get vaccinations due in the next 30 days
        const result = await database_1.default.query(`
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
            const reminderTemplate = email_1.emailTemplates.vaccinationReminder(vaccination.dog_name, vaccination.vaccine_name, (0, date_fns_1.format)(new Date(vaccination.next_due_date), 'MMM dd, yyyy'), vaccination.language || 'en');
            await (0, email_1.sendEmail)(vaccination.email, reminderTemplate);
            console.log(`Sent vaccination reminder to ${vaccination.email} for ${vaccination.dog_name}`);
        }
    }
    catch (error) {
        console.error('Error sending vaccination reminders:', error);
    }
};
exports.sendVaccinationReminders = sendVaccinationReminders;
// Schedule cron jobs
const startEmailScheduler = () => {
    // Check for appointment reminders every 15 minutes
    node_cron_1.default.schedule('*/15 * * * *', exports.sendAppointmentReminders);
    // Check for vaccination reminders daily at 9 AM
    node_cron_1.default.schedule('0 9 * * *', exports.sendVaccinationReminders);
    console.log('Email scheduler started');
};
exports.startEmailScheduler = startEmailScheduler;
// Manual trigger functions for testing
const triggerAppointmentReminders = async (req, res) => {
    try {
        await (0, exports.sendAppointmentReminders)();
        res.json({ message: 'Appointment reminders sent' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send reminders' });
    }
};
exports.triggerAppointmentReminders = triggerAppointmentReminders;
const triggerVaccinationReminders = async (req, res) => {
    try {
        await (0, exports.sendVaccinationReminders)();
        res.json({ message: 'Vaccination reminders sent' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send reminders' });
    }
};
exports.triggerVaccinationReminders = triggerVaccinationReminders;
//# sourceMappingURL=emailService.js.map