/**
 * One-off: send a sample ABGP welcome email + PDF receipt to a test address,
 * using dummy payment data. Does NOT touch the database.
 *
 * Usage:
 *   node scripts/sendTestReceiptEmail.cjs someone@example.com
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { isSmtpConfigured } = require('../payment/receiptConfig');
const { generateMembershipReceiptPdf } = require('../payment/membershipReceiptPdf');
const { sendMembershipWelcomeEmail } = require('../payment/membershipReceiptEmail');

async function main() {
  const to = process.argv[2];
  if (!to || !to.includes('@')) {
    console.error('Usage: node scripts/sendTestReceiptEmail.cjs someone@example.com');
    process.exit(1);
  }

  if (!isSmtpConfigured()) {
    console.error('SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) — aborting.');
    process.exit(1);
  }

  const samplePayment = {
    full_name: 'Test Member',
    email: to,
    phone_no: '9876543210',
    state: 'Maharashtra',
    district: 'Nagpur',
    member_type: 'NEW',
    enrollment_remark: null,
    razorpay_order_id: 'order_TEST00000000001',
    razorpay_payment_id: 'pay_TEST00000000001',
    amount: 10000, // paise -> ₹100.00
    currency: 'INR',
    payment_date: new Date(),
  };

  console.log(`Generating sample PDF receipt for ${to} ...`);
  const pdfBuffer = await generateMembershipReceiptPdf(samplePayment);

  console.log(`Sending test welcome email to ${to} ...`);
  const result = await sendMembershipWelcomeEmail(samplePayment, pdfBuffer);

  if (result.sent) {
    console.log('Test email sent successfully.');
  } else {
    console.error('Test email NOT sent. Reason:', result.reason);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test send crashed:', err);
  process.exit(1);
});
