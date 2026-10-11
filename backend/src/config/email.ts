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
              &copy; ${new Date().getFullYear()} eDog &bull; ${__('All rights reserved', 'Всички права запазени', lang)}
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

  vaccinationReminder: (dogName: string, vaccineName: string, dueDate: string, language = 'bg', daysUntilDue?: number) => ({
    subject: daysUntilDue === 1
      ? __(`Vaccination due tomorrow – ${dogName}`, `Ваксинацията е утре – ${dogName}`, language)
      : daysUntilDue
        ? __(`Vaccination due in ${daysUntilDue} days – ${dogName}`, `Ваксинация след ${daysUntilDue} дни – ${dogName}`, language)
        : __(`Vaccination due soon – ${dogName}`, `Ваксинация скоро – ${dogName}`, language),
    html: wrapEmail(
      '#f59e0b', '💉',
      __('Vaccination reminder', 'Напомняне за ваксинация', language),
      `<p style="margin:0 0 16px;">
        ${__(`${dogName}'s vaccination is coming up soon. Please contact your veterinarian to schedule an appointment in time.`,
             `Ваксинацията на ${dogName} предстои скоро. Свържи се с ветеринаря си, за да насрочиш среща навреме.`,
             language)}
      </p>
      ${infoCard(
        `<p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#d97706;">${vaccineName}</p>` +
        infoRow(__('Dog:', 'Куче:', language), dogName) +
        infoRow(__('Due date:', 'Дата:', language), dueDate),
        '#f59e0b'
      )}
      ${btn(`${process.env.FRONTEND_URL || 'https://edog.bg'}/`, __('Open eDog', 'Отвори eDog', language), '#d97706')}
      ${smallNote(
        __('You can manage all vaccination records directly in the eDog app.',
           'Можеш да управляваш всички ваксинационни записи директно в приложението eDog.',
           language)
      )}`,
      language
    ),
  }),

  dogBirthday: (p: {
    dogName: string;
    ownerName: string;
    age: number;
    sex?: string | null;
    photoUrl?: string | null;
    hasVaccinations: boolean;
    appUrl: string;
    unsubscribeUrl: string;
    language?: string;
  }) => {
    const language = p.language || 'bg';
    const female = /^f|жен/i.test(p.sex || '');
    const firstName = (p.ownerName || '').trim().split(/\s+/)[0] || '';
    const ageBg = p.age === 1 ? '1 година' : `${p.age} години`;
    const ageEn = p.age === 1 ? '1 year old' : `${p.age} years old`;
    const pronounBg = female ? 'ѝ' : 'му';

    const photo = p.photoUrl
      ? `<div style="text-align:center;margin:0 0 24px;">
           <img src="${p.photoUrl}" alt="${p.dogName}" width="180" height="180"
                style="width:180px;height:180px;border-radius:50%;object-fit:cover;border:4px solid #fde68a;" />
         </div>`
      : '';

    const tip = p.hasVaccinations
      ? __(`A birthday is a good moment for the yearly check-up. Log it in eDog so ${p.dogName}'s health history stays complete.`,
           `Рожденият ден е добър повод за годишния преглед при ветеринаря. Отбележи го в eDog, за да е пълна здравната история на ${p.dogName}.`,
           language)
      : __(`The best birthday gift is good health: add ${p.dogName}'s vaccinations in eDog and we'll remind you before the next one is due.`,
           `Най-добрият подарък е здравето: добави ваксините на ${p.dogName} в eDog и ще ти напомним навреме за следващата.`,
           language);

    return {
      subject: __(`🎂 Happy birthday, ${p.dogName}!`, `🎂 Честит рожден ден, ${p.dogName}!`, language),
      headers: {
        'List-Unsubscribe': `<${p.unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: wrapEmail(
        '#f59e0b', '🎂',
        __(`Happy birthday, ${p.dogName}!`, `Честит рожден ден, ${p.dogName}!`, language),
        `${photo}
        <p style="margin:0 0 16px;font-size:16px;">
          ${__(`Hi ${firstName},`, `Здравей${firstName ? ', ' + firstName : ''}!`, language)}
        </p>
        <p style="margin:0 0 16px;">
          ${__(`Today <strong>${p.dogName}</strong> turns <strong>${ageEn}</strong> 🎉 We wish many happy, healthy years full of walks, games and treats!`,
               `Днес <strong>${p.dogName}</strong> навършва <strong>${ageBg}</strong> 🎉 Пожелаваме ${pronounBg} още много здрави и щастливи години, пълни с разходки, игри и лакомства!`,
               language)}
        </p>
        ${infoCard(`<p style="margin:0;font-size:14px;color:#374151;">💡 ${tip}</p>`, '#f59e0b')}
        ${btn(p.appUrl, __(`Open ${p.dogName}'s profile`, `Отвори профила на ${p.dogName}`, language), '#d97706')}
        <p style="font-size:12px;color:#9ca3af;margin-top:28px;line-height:1.6;text-align:center;">
          ${__('Don\'t want birthday emails?', 'Не искаш поздравления за рожден ден?', language)}
          <a href="${p.unsubscribeUrl}" style="color:#9ca3af;">${__('Unsubscribe', 'Отпиши се', language)}</a>
        </p>`,
        language
      ),
    };
  },

  vaccinationOverdue: (dogName: string, vaccineName: string, dueDate: string, language = 'bg') => ({
    subject: __(`Vaccination overdue – ${dogName}`, `Изтекла ваксина – ${dogName}`, language),
    html: wrapEmail(
      '#dc2626', '⚠️',
      __('Vaccination overdue', 'Изтекла ваксинация', language),
      `<p style="margin:0 0 16px;">
        ${__(`${dogName}'s vaccination has expired. Book a vet visit soon — and if it is already done, update the record in eDog so we can remind you next time.`,
             `Ваксинацията на ${dogName} е изтекла. Запиши час при ветеринар — а ако вече е направена, обнови записа в eDog, за да ти напомним следващия път.`,
             language)}
      </p>
      ${infoCard(
        `<p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#dc2626;">${vaccineName}</p>` +
        infoRow(__('Dog:', 'Куче:', language), dogName) +
        infoRow(__('Was due:', 'Изтекла на:', language), dueDate),
        '#dc2626'
      )}
      ${btn(`${process.env.FRONTEND_URL || 'https://edog.bg'}/`, __('Update in eDog', 'Обнови в eDog', language), '#dc2626')}`,
      language
    ),
  }),
};

// ─── Send helper ───────────────────────────────────────────────────────────────

export const sendEmail = async (
  to: string,
  template: { subject: string; html: string; headers?: Record<string, string> }
) => {
  try {
    const info = await transporter.sendMail({
      from: `"eDog" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      headers: template.headers,
    });
    if (process.env.NODE_ENV !== 'production') console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export default transporter;
