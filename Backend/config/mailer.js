import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, text, html }) {
  const fromRaw = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@smartfinhub.com';
  const from = fromRaw.includes('<') ? fromRaw : `Smart Fin Hub <${fromRaw}>`;
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: text || (html && html.replace(/<[^>]*>/g, '')),
    html: html || text,
  });
  return info;
}

export async function verifyMailer() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP credentials missing. OTP emails are NOT ready (dev fallback mode).');
    return false;
  }
  try {
    await transporter.verify();
    console.log('[Mailer] SMTP transporter verified. OTP emails are ready to send.');
    return true;
  } catch (err) {
    console.error('[Mailer] SMTP verify failed. OTP emails are NOT ready.', err.message);
    return false;
  }
}

export default transporter;
