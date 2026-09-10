/**
 * Sync a captured Razorpay payment to SUCCESS in abgp.payments.
 * Usage (on VPS): node scripts/syncPaymentFromRazorpay.cjs pay_XXXXX
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../db');
const { syncPaymentFromRazorpayPaymentId } = require('../payment/syncPaymentFromRazorpay');

async function main() {
  const paymentId = process.argv[2];
  if (!paymentId) {
    console.error('Usage: node scripts/syncPaymentFromRazorpay.cjs pay_XXXXX');
    process.exit(1);
  }
  try {
    const result = await syncPaymentFromRazorpayPaymentId(paymentId);
    console.log('Synced successfully:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Sync failed:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
