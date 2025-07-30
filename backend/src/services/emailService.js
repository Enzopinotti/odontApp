// backend/src/services/emailService.js
import nodemailer from 'nodemailer';
import { templates } from './emailTemplates.js';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const enviarCorreo = async ({ to, subject, html, template, vars = {} }) => {
  const finalHtml = template && templates[template]
    ? templates[template](vars)
    : html;

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html: finalHtml,
    });

    console.log(`✅ Correo enviado a ${to}: ${info.messageId}`);
  } catch (err) {
    console.error('❌ Error enviando correo:', err.message);
    throw err;
  }
};
