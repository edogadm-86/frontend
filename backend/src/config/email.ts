import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Shared helpers ────────────────────────────────────────────────────────────

const __ = (en: string, bg: string, lang: string) => lang === 'bg' ? bg : en;

const btn = (url: string, label: string, color = '#1B85F3') =>
  `<div style="text-align:center;margin:32px 0;">` +
  `<a href="${url}" style="display:inline-block;background-color:${color};color:#ffffff;` +
  `font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;` +
  `letter-spacing:0.3px;">${label}</a></div>`;

const infoCard = (content: string, accent = '#1B85F3') =>
  `<div style="background-color:#f8faff;border-left:4px solid ${accent};` +
  `border-radius:0 8px 8px 0;padding:18px 22px;margin:24px 0;">${content}</div>`;

const infoRow = (label: string, value: string) =>
  `<p style="margin:6px 0;font-size:14px;color:#374151;">` +
  `<span style="font-weight:600;">${label}</span>&nbsp;${value}</p>`;

const smallNote = (text: string) =>
  `<p style="font-size:13px;color:#9ca3af;margin-top:28px;line-height:1.65;">${text}</p>`;

export const wrapEmail = (headerBg: string, icon: string, title: string, body: string, lang = 'en') => `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>eDog</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f7;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

        <!-- Header -->
        <tr>
          <td style="background-color:${headerBg};border-radius:12px 12px 0 0;padding:40px 48px 36px;text-align:center;">
            <div style="font-size:46px;line-height:1.1;margin-bottom:10px;">${icon}</div>
            <div style="color:#ffffff;font-size:26px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">eDog</div>
            <div style="color:rgba(255,255,255,0.85);font-size:15px;">${title}</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background-color:#ffffff;padding:40px 48px;color:#374151;font-size:15px;line-height:1.75;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;padding:22px 48px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">
              &copy; 2025 eDog &bull; ${__('All rights reserved', 'Всички права запазени', lang)}
            </p>
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              ${__('You received this email as a registered eDog user.',
                   'Получихте този имейл като регистриран потребител на eDog.', lang)}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── Templates ─────────────────────────────────────────────────────────────────

export const emailTemplates = {

  emailVerification: (verifyUrl: string, language = 'en') => ({
    subject: __('Verify your email – eDog', 'Потвърди имейла си – eDog', language),
    html: wrapEmail(
      '#1B85F3', '🐾',
      __('Verify your email address', 'Потвърди имейл адреса си', language),
      `<p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">
        ${__('Almost there!', 'Почти готово!', language)}
      </p>
      <p style="margin:0 0 16px;">
        ${__('Thanks for signing up for eDog! Please verify your email address to activate your account.',
             'Благодарим ти за регистрацията в eDog! Моля потвърди имейл адреса си, за да активираш акаунта си.',
             language)}
      </p>
      ${btn(verifyUrl, __('Verify Email', 'Потвърди имейл', language))}
      ${smallNote(
        __('This link expires in 24 hours. If you didn\'t create an eDog account, you can safely ignore this email.',
           'Линкът изтича след 24 часа. Ако не си се регистрирал в eDog, можеш спокойно да игнорираш този имейл.',
           language)
      )}`,
      language
    ),
  }),

  welcome: (name: string, language = 'en') => {
    const features = language === 'bg'
      ? [
          'Създай профили за кучетата си',
          'Следи ваксинации и здравни записи',
          'Планирай срещи и напомняния',
          'Съхрани информация за спешни случаи',
          'Свържи се с общността на eDog',
        ]
      : [
          'Create profiles for your dogs',
          'Track vaccinations and health records',
          'Schedule appointments and reminders',
          'Store important emergency information',
          'Connect with the eDog community',
        ];

    const featureRows = features
      .map(f =>
        `<tr><td style="padding:5px 0;font-size:14px;color:#374151;">` +
        `<span style="color:#1B85F3;font-weight:700;margin-right:10px;">✓</span>${f}</td></tr>`
      )
      .join('');

    return {
      subject: __('Welcome to eDog! 🐾', 'Добре дошли в eDog! 🐾', language),
      html: wrapEmail(
        '#1B85F3', '🐶',
        __('Your digital dog companion', 'Вашият дигитален спътник', language),
        `<p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">
          ${__(`Hello, ${name}!`, `Здравей, ${name}!`, language)}
        </p>
        <p style="margin:0 0 24px;">
          ${__('Welcome to eDog — your all-in-one platform for managing your dog\'s health, appointments, and life.',
               'Добре дошъл в eDog — твоята платформа за управление на здравето, срещите и живота на кучето ти.',
               language)}
        </p>
        <p style="margin:0 0 12px;font-weight:600;color:#111827;">
          ${__('Here\'s what you can do:', 'Какво можеш да правиш:', language)}
        </p>
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:4px;">
          ${featureRows}
        </table>`,
        language
      ),
    };
  },

  passwordReset: (resetUrl: string, language = 'en') => ({
    subject: __('Reset your password – eDog', 'Нулиране на парола – eDog', language),
    html: wrapEmail(
      '#1B85F3', '🔒',
      __('Password reset request', 'Заявка за нулиране на парола', language),
      `<p style="margin:0 0 16px;">
        ${__('We received a request to reset the password on your eDog account. Click the button below to choose a new one.',
             'Получихме заявка за нулиране на паролата за твоя eDog акаунт. Натисни бутона по-долу, за да зададеш нова парола.',
             language)}
      </p>
      ${btn(resetUrl, __('Reset Password', 'Нулирай паролата', language))}
      ${infoCard(
        infoRow('⏱', __('This link expires in <strong>1 hour</strong>.',
                         'Линкът изтича след <strong>1 час</strong>.', language)) +
        infoRow('🛡', __('If you didn\'t request this, your account is safe — just ignore this email.',
                         'Ако не си заявил нулиране, акаунтът ти е в безопасност — просто игнорирай този имейл.',
                         language))
      )}`,
      language
    ),
  }),

  appointmentReminder: (dogName: string, appointmentTitle: string, date: string, time: string, language = 'en') => ({
    subject: __(`Reminder: ${appointmentTitle} – ${dogName}`,
                `Напомняне: ${appointmentTitle} – ${dogName}`, language),
    html: wrapEmail(
      '#1B85F3', '📅',
      __('Upcoming appointment', 'Предстояща среща', language),
      `<p style="margin:0 0 16px;">
        ${__(`This is a friendly reminder about ${dogName}'s upcoming appointment.`,
             `Напомняме ти за предстоящата среща на ${dogName}.`,
             language)}
      </p>
      ${infoCard(
        `<p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#1B85F3;">${appointmentTitle}</p>` +
        infoRow(__('Dog:', 'Куче:', language), dogName) +
        infoRow(__('Date:', 'Дата:', language), date) +
        infoRow(__('Time:', 'Час:', language), time)
      )}
      <p style="margin:16px 0 0;">
        ${__('Don\'t forget to arrive a few minutes early. See you there! 🐾',
             'Не забравяй да дойдеш малко по-рано. Успех! 🐾', language)}
      </p>`,
      language
    ),
  }),

  vaccinationReminder: (dogName: string, vaccineName: string, dueDate: string, language = 'en') => ({
    subject: __(`Vaccination due soon – ${dogName}`, `Ваксинация скоро – ${dogName}`, language),
    html: wrapEmail(
      '#f59e0b', '💉',
      __('Vaccination reminder', 'Напомняне за ваксинация', language),
      `<p style="margin:0 0 16px;">
        ${__(`${dogName}'s vaccination is coming up soon. Please contact your veterinarian to schedule an appointment in time.`,
             `Ваксинацията на ${dogName} предстои скоро. Моля свържи се с ветеринаря си, за да насрочиш среща навреме.`,
             language)}
      </p>
      ${infoCard(
        `<p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#d97706;">${vaccineName}</p>` +
        infoRow(__('Dog:', 'Куче:', language), dogName) +
        infoRow(__('Due date:', 'Дата:', language), dueDate),
        '#f59e0b'
      )}
      ${smallNote(
        __('You can manage all vaccination records directly in the eDog app.',
           'Можеш да управляваш всички ваксинационни записи директно в приложението eDog.',
           language)
      )}`,
      language
    ),
  }),
};

// ─── Send helper ───────────────────────────────────────────────────────────────

export const sendEmail = async (to: string, template: { subject: string; html: string }) => {
  try {
    const info = await transporter.sendMail({
      from: `"eDog" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });
    if (process.env.NODE_ENV !== 'production') console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export default transporter;
