import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  NODE_ENV,
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

export const enviarCorreo = async ({ to, subject, html }) => {
  if (NODE_ENV !== 'production') {
    console.log('📧 Simulado:', { to, subject, html });
    return;
  }

  await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
};
