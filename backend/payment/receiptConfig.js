/**
 * SMTP and receipt branding — all optional except SMTP for sending.
 */
const path = require('path');

function envString(key, fallback = '') {
  const v = process.env[key];
  if (v === undefined || v === null) return fallback;
  return String(v).trim();
}

function envInt(key, fallback) {
  const n = parseInt(envString(key), 10);
  return Number.isFinite(n) ? n : fallback;
}

function isSmtpConfigured() {
  const host = envString('SMTP_HOST');
  const user = envString('SMTP_USER');
  const pass = envString('SMTP_PASS');
  return Boolean(host && user && pass);
}

function getReceiptConfig() {
  return {
    smtp: {
      host: envString('SMTP_HOST'),
      port: envInt('SMTP_PORT', 587),
      secure: envString('SMTP_SECURE', 'false').toLowerCase() === 'true',
      user: envString('SMTP_USER'),
      pass: envString('SMTP_PASS'),
    },
    fromEmail: envString('MEMBERSHIP_RECEIPT_FROM', envString('SMTP_USER')),
    fromName: envString('MEMBERSHIP_RECEIPT_FROM_NAME', 'Akhil Bhartiya Grahak Panchayat'),
    businessName: envString('ABGP_BUSINESS_NAME', 'Abgpindia'),
    gstin: envString('ABGP_GSTIN'),
    websiteUrl: envString('ABGP_WEBSITE_URL', 'https://abgpindia.in').replace(/\/$/, ''),
    logoPath: path.join(__dirname, '..', 'assets', 'abgp-logo.jpg'),
    supportEmail: envString('ABGP_SUPPORT_EMAIL', 'vijaysagar1963@gmail.com'),
    supportPhone: envString('ABGP_SUPPORT_PHONE', ''),
  };
}

module.exports = {
  getReceiptConfig,
  isSmtpConfigured,
};
