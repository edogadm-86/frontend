"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.emailTemplates = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create transporter
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
// Email templates
exports.emailTemplates = {
    welcome: (name, language = 'en') => ({
        subject: language === 'bg' ? 'Добре дошли в eDog!' : 'Welcome to eDog!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1B85F3; color: white; padding: 20px; text-align: center;">
          <h1>${language === 'bg' ? 'Добре дошли в eDog!' : 'Welcome to eDog!'}</h1>
        </div>
        <div style="padding: 20px;">
          <p>${language === 'bg' ? `Здравей ${name},` : `Hello ${name},`}</p>
          <p>${language === 'bg'
            ? 'Благодарим ви, че се присъединихте към eDog - вашият цифров паспорт за куче!'
            : 'Thank you for joining eDog - your digital dog passport!'}</p>
          <p>${language === 'bg'
            ? 'Вече можете да:'
            : 'You can now:'}</p>
          <ul>
            <li>${language === 'bg' ? 'Създавате профили за вашите кучета' : 'Create profiles for your dogs'}</li>
            <li>${language === 'bg' ? 'Следите ваксинации и здравни записи' : 'Track vaccinations and health records'}</li>
            <li>${language === 'bg' ? 'Планирате срещи и тренировки' : 'Schedule appointments and training sessions'}</li>
            <li>${language === 'bg' ? 'Съхранявате важна информация за спешни случаи' : 'Store important emergency information'}</li>
          </ul>
          <p>${language === 'bg' ? 'Започнете сега!' : 'Get started now!'}</p>
        </div>
      </div>
    `
    }),
    passwordReset: (resetUrl, language = 'en') => ({
        subject: language === 'bg' ? 'Нулиране на парола - eDog' : 'Password Reset - eDog',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1B85F3; color: white; padding: 20px; text-align: center;">
          <h1>${language === 'bg' ? 'Нулиране на парола' : 'Password Reset'}</h1>
        </div>
        <div style="padding: 20px;">
          <p>${language === 'bg'
            ? 'Получихме заявка за нулиране на паролата за вашия eDog акаунт.'
            : 'We received a request to reset your eDog account password.'}</p>
          <p>${language === 'bg'
            ? 'Кликнете на бутона по-долу за да нулирате паролата си:'
            : 'Click the button below to reset your password:'}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1B85F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              ${language === 'bg' ? 'Нулиране на парола' : 'Reset Password'}
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            ${language === 'bg'
            ? 'Ако не сте заявили нулиране на парола, моля игнорирайте този имейл.'
            : 'If you did not request a password reset, please ignore this email.'}
          </p>
          <p style="color: #666; font-size: 14px;">
            ${language === 'bg'
            ? 'Този линк ще изтече след 1 час.'
            : 'This link will expire in 1 hour.'}
          </p>
        </div>
      </div>
    `
    }),
    appointmentReminder: (dogName, appointmentTitle, date, time, language = 'en') => ({
        subject: language === 'bg' ? `Напомняне за среща - ${dogName}` : `Appointment Reminder - ${dogName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1B85F3; color: white; padding: 20px; text-align: center;">
          <h1>${language === 'bg' ? 'Напомняне за среща' : 'Appointment Reminder'}</h1>
        </div>
        <div style="padding: 20px;">
          <p>${language === 'bg'
            ? `Напомняме ви за предстоящата среща за ${dogName}:`
            : `This is a reminder for ${dogName}'s upcoming appointment:`}</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1B85F3;">${appointmentTitle}</h3>
            <p style="margin: 5px 0;"><strong>${language === 'bg' ? 'Дата:' : 'Date:'}</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>${language === 'bg' ? 'Час:' : 'Time:'}</strong> ${time}</p>
          </div>
          <p>${language === 'bg'
            ? 'Не забравяйте да се явите навреме!'
            : 'Don\'t forget to arrive on time!'}</p>
        </div>
      </div>
    `
    }),
    vaccinationReminder: (dogName, vaccineName, dueDate, language = 'en') => ({
        subject: language === 'bg' ? `Ваксинация скоро - ${dogName}` : `Vaccination Due Soon - ${dogName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FFA500; color: white; padding: 20px; text-align: center;">
          <h1>${language === 'bg' ? 'Ваксинация скоро' : 'Vaccination Due Soon'}</h1>
        </div>
        <div style="padding: 20px;">
          <p>${language === 'bg'
            ? `${dogName} трябва да получи ваксинация скоро:`
            : `${dogName} has a vaccination due soon:`}</p>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FFA500;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">${vaccineName}</h3>
            <p style="margin: 5px 0;"><strong>${language === 'bg' ? 'Дата:' : 'Due Date:'}</strong> ${dueDate}</p>
          </div>
          <p>${language === 'bg'
            ? 'Моля, свържете се с вашия ветеринар за да насрочите среща.'
            : 'Please contact your veterinarian to schedule an appointment.'}</p>
        </div>
      </div>
    `
    })
};
const sendEmail = async (to, template) => {
    try {
        const info = await transporter.sendMail({
            from: `"eDog" <${process.env.SMTP_USER}>`,
            to,
            subject: template.subject,
            html: template.html,
        });
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
exports.default = transporter;
//# sourceMappingURL=email.js.map