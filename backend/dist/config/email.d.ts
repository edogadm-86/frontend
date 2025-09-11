import nodemailer from 'nodemailer';
declare const transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
export declare const emailTemplates: {
    welcome: (name: string, language?: string) => {
        subject: string;
        html: string;
    };
    passwordReset: (resetUrl: string, language?: string) => {
        subject: string;
        html: string;
    };
    appointmentReminder: (dogName: string, appointmentTitle: string, date: string, time: string, language?: string) => {
        subject: string;
        html: string;
    };
    vaccinationReminder: (dogName: string, vaccineName: string, dueDate: string, language?: string) => {
        subject: string;
        html: string;
    };
};
export declare const sendEmail: (to: string, template: {
    subject: string;
    html: string;
}) => Promise<{
    success: boolean;
    messageId: string;
}>;
export default transporter;
//# sourceMappingURL=email.d.ts.map