"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerVaccinationReminders = exports.triggerAppointmentReminders = exports.startEmailScheduler = exports.sendMedicationRecurringReminders = exports.sendEventReminders = exports.sendMedicationPush = exports.sendVaccinationReminders = exports.sendAppointmentReminders = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = __importDefault(require("../config/database"));
const email_1 = require("../config/email");
const date_fns_1 = require("date-fns");
const pushService_1 = require("./pushService");
// Send appointment reminders
const sendAppointmentReminders = async () => {
    try {
        console.log('Checking for appointment reminders...');
        const result = await database_1.default.query(`
      SELECT
        a.id, a.title, a.date, a.time, a.reminder_time,
        d.name as dog_name,
        u.id as user_id, u.email, u.name as user_name, u.language
      FROM appointments a
      JOIN dogs d ON a.dog_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.reminder = true
        AND a.date = CURRENT_DATE
        AND EXTRACT(EPOCH FROM (a.time::time - CURRENT_TIME)) / 60 <= a.reminder_time
        AND EXTRACT(EPOCH FROM (a.time::time - CURRENT_TIME)) / 60 > 0
    `);
        for (const appointment of result.rows) {
            const lang = appointment.language || 'en';
            // Email reminder
            const reminderTemplate = email_1.emailTemplates.appointmentReminder(appointment.dog_name, appointment.title, (0, date_fns_1.format)(new Date(appointment.date), 'MMM dd, yyyy'), appointment.time, lang);
            await (0, email_1.sendEmail)(appointment.email, reminderTemplate);
            console.log(`Sent appointment reminder to ${appointment.email} for ${appointment.dog_name}`);
            // Push notification
            await (0, pushService_1.sendPushToUser)(appointment.user_id, 'appointments', {
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
        const result = await database_1.default.query(`
      SELECT
        v.id, v.vaccine_name, v.next_due_date,
        d.name as dog_name,
        u.id as user_id, u.email, u.name as user_name, u.language
      FROM vaccinations v
      JOIN dogs d ON v.dog_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE v.next_due_date IS NOT NULL
        AND v.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        AND v.next_due_date >= CURRENT_DATE
    `);
        for (const vaccination of result.rows) {
            const lang = vaccination.language || 'en';
            const daysUntilDue = Math.ceil((new Date(vaccination.next_due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            // Email reminder (existing behaviour — sent every day if within 30 days)
            const reminderTemplate = email_1.emailTemplates.vaccinationReminder(vaccination.dog_name, vaccination.vaccine_name, (0, date_fns_1.format)(new Date(vaccination.next_due_date), 'MMM dd, yyyy'), lang);
            await (0, email_1.sendEmail)(vaccination.email, reminderTemplate);
            console.log(`Sent vaccination reminder to ${vaccination.email} for ${vaccination.dog_name}`);
            // Push only on meaningful milestones: 30, 7, or 1 day(s) before
            if ([30, 7, 1].includes(daysUntilDue)) {
                const dayLabel = daysUntilDue === 1
                    ? (lang === 'bg' ? 'утре' : 'tomorrow')
                    : (lang === 'bg' ? `след ${daysUntilDue} дни` : `in ${daysUntilDue} days`);
                await (0, pushService_1.sendPushToUser)(vaccination.user_id, 'vaccinations', {
                    title: lang === 'bg'
                        ? `Ваксинация скоро - ${vaccination.dog_name}`
                        : `Vaccination Due Soon - ${vaccination.dog_name}`,
                    body: lang === 'bg'
                        ? `${vaccination.vaccine_name} е дължима ${dayLabel}.`
                        : `${vaccination.vaccine_name} is due ${dayLabel}.`,
                    icon: '/pwa-192x192.png',
                    badge: '/pwa-192x192.png',
                    tag: `vaccination-${vaccination.id}`,
                    url: '/vaccinations',
                });
            }
        }
    }
    catch (error) {
        console.error('Error sending vaccination reminders:', error);
    }
};
exports.sendVaccinationReminders = sendVaccinationReminders;
// Send push notifications for new medication health records (called by health route)
const sendMedicationPush = async (userId, dogName, medication, dosage, language = 'en') => {
    const lang = language;
    await (0, pushService_1.sendPushToUser)(userId, 'medications', {
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
exports.sendMedicationPush = sendMedicationPush;
// Send push reminders for upcoming community events
const sendEventReminders = async () => {
    try {
        const { sendPushToUser } = await Promise.resolve().then(() => __importStar(require('./pushService')));
        // 24 h window: events starting 23–25 h from now
        const result24h = await database_1.default.query(`
      SELECT e.id, e.title, e.location, ep.user_id
      FROM events e
      JOIN event_participants ep ON ep.event_id = e.id AND ep.status = 'attending'
      WHERE e.start_date BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
    `);
        for (const row of result24h.rows) {
            await sendPushToUser(row.user_id, 'appointments', {
                title: 'Event tomorrow!',
                body: `"${row.title}" starts tomorrow${row.location ? ` at ${row.location}` : ''}.`,
                icon: '/pwa-192x192.png',
                tag: `event-24h-${row.id}`,
                url: '/community',
            });
        }
        // 1 h window: events starting 55–65 min from now
        const result1h = await database_1.default.query(`
      SELECT e.id, e.title, e.location, ep.user_id
      FROM events e
      JOIN event_participants ep ON ep.event_id = e.id AND ep.status = 'attending'
      WHERE e.start_date BETWEEN NOW() + INTERVAL '55 minutes' AND NOW() + INTERVAL '65 minutes'
    `);
        for (const row of result1h.rows) {
            await sendPushToUser(row.user_id, 'appointments', {
                title: 'Event in 1 hour!',
                body: `"${row.title}" starts in about 1 hour${row.location ? ` at ${row.location}` : ''}.`,
                icon: '/pwa-192x192.png',
                tag: `event-1h-${row.id}`,
                url: '/community',
            });
        }
        console.log(`Event reminders sent: ${result24h.rows.length} (24h), ${result1h.rows.length} (1h)`);
    }
    catch (error) {
        console.error('Error sending event reminders:', error);
    }
};
exports.sendEventReminders = sendEventReminders;
// Send push reminders for medication recurring reminders due today or tomorrow
const sendMedicationRecurringReminders = async () => {
    try {
        const result = await database_1.default.query(`
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
            const lang = row.language || 'en';
            const isToday = new Date(row.next_due_date).toDateString() === new Date().toDateString();
            const dayLabel = isToday
                ? (lang === 'bg' ? 'днес' : 'today')
                : (lang === 'bg' ? 'утре' : 'tomorrow');
            await (0, pushService_1.sendPushToUser)(row.user_id, 'medications', {
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
    }
    catch (error) {
        console.error('Error sending medication recurring reminders:', error);
    }
};
exports.sendMedicationRecurringReminders = sendMedicationRecurringReminders;
// Schedule cron jobs
const startEmailScheduler = () => {
    // Check for appointment reminders every 15 minutes
    node_cron_1.default.schedule('*/15 * * * *', exports.sendAppointmentReminders);
    // Check for vaccination reminders daily at 9 AM
    node_cron_1.default.schedule('0 9 * * *', exports.sendVaccinationReminders);
    // Check for event reminders every 15 minutes
    node_cron_1.default.schedule('*/15 * * * *', exports.sendEventReminders);
    // Check for medication recurring reminders daily at 8 AM
    node_cron_1.default.schedule('0 8 * * *', exports.sendMedicationRecurringReminders);
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