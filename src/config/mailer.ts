import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',  // Hostinger SMTP server
  port: 465,                   // or 587 for non-secure
  secure: true,                // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,  // SMTP username from Hostinger
    pass: process.env.SMTP_PASS   // SMTP password from Hostinger
  }
});

export default transporter;
