/**
 * Razorpay service layer.
 * All secret operations stay server-side only.
 */
const Razorpay = require('razorpay');
const crypto = require('crypto');

/** Fixed membership fee in production: ₹100 */
const MEMBERSHIP_PRODUCTION_PAISE = 10000;

/** Local testing only (non-production): ₹1 */
const MEMBERSHIP_LOCAL_TEST_PAISE = 100;

/**
 * Membership amount in paise — never taken from the client.
 * Production: ₹100 (10000 paise).
 * Local dev (NODE_ENV !== 'production'): ₹1 (100 paise) unless MEMBERSHIP_AMOUNT_PAISE is set.
 */
function getMembershipAmountPaise() {
  const override = process.env.MEMBERSHIP_AMOUNT_PAISE;
  if (override !== undefined && String(override).trim() !== '') {
    const n = parseInt(String(override).trim(), 10);
    if (!Number.isFinite(n) || n < 100) {
      throw new Error('MEMBERSHIP_AMOUNT_PAISE must be at least 100 (₹1)');
    }
    return n;
  }
  return process.env.NODE_ENV === 'production'
    ? MEMBERSHIP_PRODUCTION_PAISE
    : MEMBERSHIP_LOCAL_TEST_PAISE;
}

/**
 * Returns a Razorpay instance initialized with current env values.
 * Lazy so the server starts even before keys are configured.
 */
function normalizeEnvValue(value) {
  let v = String(value || '').trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

/** Reject empty values and obvious template placeholders only (not arbitrary substrings). */
function isInvalidRazorpayKeyId(keyId) {
  const v = normalizeEnvValue(keyId);
  if (!v) return true;
  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(v)) return true;
  return /REPLACE_ME|your_key_id|changeme/i.test(v);
}

function isInvalidRazorpayKeySecret(keySecret) {
  const v = normalizeEnvValue(keySecret);
  if (!v || v.length < 8) return true;
  return /^(REPLACE_ME|your_key_secret|changeme)$/i.test(v);
}

function getRazorpayCredentials() {
  return {
    keyId: normalizeEnvValue(process.env.RAZORPAY_KEY_ID),
    keySecret: normalizeEnvValue(process.env.RAZORPAY_KEY_SECRET),
  };
}

function getRazorpay() {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (isInvalidRazorpayKeyId(keyId) || isInvalidRazorpayKeySecret(keySecret)) {
    throw new Error(
      'Razorpay keys are missing or still set to template values in backend/.env. Save the file, restart the backend, and use matching Key ID + Secret from the same Razorpay mode (test or live).'
    );
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Create a Razorpay order for the membership fee.
 * @param {string} receipt - Unique receipt identifier (e.g. phone number)
 */
async function createRazorpayOrder(receipt, notes = {}) {
  const razorpay = getRazorpay();
  const amountPaise = getMembershipAmountPaise();
  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    payment_capture: 1,
    notes,
  });
  return order;
}

async function fetchRazorpayOrder(orderId) {
  const razorpay = getRazorpay();
  return razorpay.orders.fetch(orderId);
}

async function fetchRecentRazorpayPayments(count = 50) {
  const razorpay = getRazorpay();
  const result = await razorpay.payments.all({ count });
  return result.items || [];
}

function getRazorpayDashboardPaymentsUrl() {
  return 'https://dashboard.razorpay.com/app/payments';
}

/**
 * Verify Razorpay payment signature using HMAC-SHA256.
 * Returns true only when the signature is authentic.
 */
function verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
  const { keySecret } = getRazorpayCredentials();
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured');
  }
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');
  return expected === razorpay_signature;
}

/** Public Key ID for Checkout (safe to send to the browser). */
function getRazorpayKeyId() {
  const { keyId } = getRazorpayCredentials();
  if (isInvalidRazorpayKeyId(keyId)) {
    throw new Error(
      'Razorpay Key ID is missing or invalid in backend/.env (RAZORPAY_KEY_ID).'
    );
  }
  return keyId;
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getMembershipAmountPaise,
  getRazorpayKeyId,
  fetchRazorpayOrder,
  fetchRecentRazorpayPayments,
  getRazorpayDashboardPaymentsUrl,
};
