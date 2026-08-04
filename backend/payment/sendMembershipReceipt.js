/**
 * Send branded welcome email + PDF receipt after successful membership payment.
 * Best-effort only — never throws to callers.
 */
const { isSmtpConfigured } = require('./receiptConfig');
const { generateMembershipReceiptPdf } = require('./membershipReceiptPdf');
const { sendMembershipWelcomeEmail } = require('./membershipReceiptEmail');
const {
  getPaymentReceiptRowByOrderId,
  markReceiptEmailSent,
  wasReceiptEmailSent,
} = require('./paymentQueries');

/**
 * @param {string} razorpayOrderId
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
async function sendMembershipReceiptIfNeeded(razorpayOrderId) {
  const orderId = String(razorpayOrderId || '').trim();
  if (!orderId) {
    return { sent: false, reason: 'missing_order_id' };
  }

  if (!isSmtpConfigured()) {
    console.warn(
      '[membership-receipt] SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS in backend/.env'
    );
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const alreadySent = await wasReceiptEmailSent(orderId);
    if (alreadySent) {
      return { sent: false, reason: 'already_sent' };
    }

    const payment = await getPaymentReceiptRowByOrderId(orderId);
    if (!payment) {
      return { sent: false, reason: 'payment_not_found' };
    }
    if (payment.payment_status !== 'SUCCESS') {
      return { sent: false, reason: 'not_success' };
    }

    const pdfBuffer = await generateMembershipReceiptPdf(payment);
    const result = await sendMembershipWelcomeEmail(payment, pdfBuffer);

    if (result.sent) {
      await markReceiptEmailSent(orderId);
      console.log(
        '[membership-receipt] welcome email sent order=%s payment=%s to=%s',
        orderId,
        payment.razorpay_payment_id || '—',
        payment.email
      );
    }

    return result;
  } catch (err) {
    console.error('[membership-receipt] failed for order', orderId, err);
    return { sent: false, reason: 'send_failed' };
  }
}

module.exports = {
  sendMembershipReceiptIfNeeded,
};
