/**
 * Welcome email with receipt PDF attachment for successful membership payments.
 */
const nodemailer = require('nodemailer');
const { getReceiptConfig, isSmtpConfigured } = require('./receiptConfig');
const { formatInrFromPaise, membershipLineLabel } = require('./membershipReceiptPdf');

function buildWelcomeLinks(websiteUrl) {
  const base = websiteUrl.replace(/\/$/, '');
  return [
    { label: 'ABGP Home', href: base },
    { label: 'Member Login', href: `${base}/login/member` },
    { label: 'Membership', href: `${base}/membership` },
    { label: 'Activities', href: `${base}/activities` },
    { label: 'File a Petition', href: `${base}/petition` },
    { label: 'Donate', href: `${base}/donate` },
    { label: 'Contact Us', href: `${base}/contact` },
  ];
}

function buildWelcomeHtml(payment) {
  const config = getReceiptConfig();
  const name = payment.full_name || 'Member';
  const amountInr = formatInrFromPaise(payment.amount);
  const lineLabel = membershipLineLabel(payment);
  const links = buildWelcomeLinks(config.websiteUrl);

  const linksHtml = links
    .map(
      (l) =>
        `<li style="margin:6px 0;"><a href="${l.href}" style="color:#FF6600;text-decoration:none;font-weight:600;">${l.label}</a></li>`
    )
    .join('');

  const supportLine = config.supportPhone
    ? `Email: <a href="mailto:${config.supportEmail}" style="color:#FF6600;">${config.supportEmail}</a> · Phone: ${config.supportPhone}`
    : `Email: <a href="mailto:${config.supportEmail}" style="color:#FF6600;">${config.supportEmail}</a>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(90deg,#FF6600,#e55a00);padding:24px 28px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">Welcome to ABGP</h1>
          <p style="margin:8px 0 0;color:#ffe8d6;font-size:14px;">Akhil Bhartiya Grahak Panchayat</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Dear <strong>${escapeHtml(name)}</strong>,</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
            Thank you for your membership payment of <strong>₹ ${amountInr}</strong>.
            Your ${escapeHtml(lineLabel.toLowerCase())} is confirmed.
            Your payment receipt is attached to this email as a PDF.
          </p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#444;">
            You may also receive a separate payment message from Razorpay — that is normal.
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff8f2;border:1px solid #ffd9b8;border-radius:8px;margin:0 0 20px;">
            <tr><td style="padding:16px 18px;font-size:14px;line-height:1.8;">
              <strong>Payment summary</strong><br>
              Payment ID: ${escapeHtml(payment.razorpay_payment_id || '—')}<br>
              Order ID: ${escapeHtml(payment.razorpay_order_id || '—')}<br>
              Amount: ₹ ${amountInr}
            </td></tr>
          </table>
          <h2 style="margin:0 0 12px;font-size:17px;color:#FF6600;">Explore the ABGP portal</h2>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#444;">
            Visit our website to access member services, consumer resources, activities, and more:
          </p>
          <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.6;">${linksHtml}</ul>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.7;">
            <strong>Member login:</strong> Use your registered email and phone at
            <a href="${config.websiteUrl}/login/member" style="color:#FF6600;">${config.websiteUrl}/login/member</a>
          </p>
          <p style="margin:20px 0 0;font-size:13px;color:#666;line-height:1.6;">
            Need help? ${supportLine}
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#888;text-align:center;">
          © Akhil Bhartiya Grahak Panchayat (ABGP) · <a href="${config.websiteUrl}" style="color:#FF6600;">${config.websiteUrl}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createMailTransport() {
  const config = getReceiptConfig();
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}

/**
 * @param {object} payment
 * @param {Buffer} pdfBuffer
 */
async function sendMembershipWelcomeEmail(payment, pdfBuffer) {
  if (!isSmtpConfigured()) {
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const config = getReceiptConfig();
  const to = String(payment.email || '').trim().toLowerCase();
  if (!to || !to.includes('@')) {
    return { sent: false, reason: 'invalid_email' };
  }

  const paymentId = payment.razorpay_payment_id || 'receipt';
  const subject = `ABGP Membership Confirmation — Receipt (${paymentId})`;
  const html = buildWelcomeHtml(payment);
  const filename = `ABGP-Membership-Receipt-${paymentId}.pdf`;

  const transport = createMailTransport();
  await transport.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  return { sent: true };
}

module.exports = {
  sendMembershipWelcomeEmail,
  buildWelcomeHtml,
  buildWelcomeLinks,
};
