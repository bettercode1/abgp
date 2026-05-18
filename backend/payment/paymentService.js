/**
 * Razorpay service layer.
 * All secret operations stay server-side only.
 */
const Razorpay = require('razorpay');
const crypto = require('crypto');

/** Membership fee in paise (₹1 = 100 paise). Configured via env. */
const MEMBERSHIP_AMOUNT_PAISE = parseInt(
  process.env.MEMBERSHIP_AMOUNT_PAISE || '50000',
  10
);

/**
 * Returns a Razorpay instance initialized with current env values.
 * Lazy so the server starts even before keys are configured.
 */
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create a Razorpay order for the membership fee.
 * @param {string} receipt - Unique receipt identifier (e.g. phone number)
 */
async function createRazorpayOrder(receipt) {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: MEMBERSHIP_AMOUNT_PAISE,
    currency: 'INR',
    receipt,
    payment_capture: 1,
  });
  return order;
}

/**
 * Verify Razorpay payment signature using HMAC-SHA256.
 * Returns true only when the signature is authentic.
 */
function verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured');
  }
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');
  return expected === razorpay_signature;
}

function getMembershipAmountPaise() {
  return MEMBERSHIP_AMOUNT_PAISE;
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getMembershipAmountPaise,
};
