/**
 * Razorpay service layer.
 * All secret operations stay server-side only.
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');

/** Fixed membership fee in production: ₹100 */
const MEMBERSHIP_PRODUCTION_PAISE = 10000;

/** Local testing default (non-production): ₹100 */
const MEMBERSHIP_LOCAL_TEST_PAISE = 10000;

/**
 * Membership amount in paise — never taken from the client.
 * Production: ₹100 (10000 paise).
 * Local dev (NODE_ENV !== 'production'): ₹100 (10000 paise) unless MEMBERSHIP_AMOUNT_PAISE is set.
 */
function getMembershipAmountPaise() {
  const override = process.env.MEMBERSHIP_AMOUNT_PAISE;
  if (override !== undefined && String(override).trim() !== '') {
    const n = parseInt(String(override).trim(), 10);
    if (!Number.isFinite(n) || n < 100) {
      throw new Error('MEMBERSHIP_AMOUNT_PAISE must be at least 100 (paise)');
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
  let v = String(value || '').trim().replace(/\r$/, '');
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

/** If backend/.env has placeholders, use valid keys from project root .env when present. */
function mergeRazorpayFromRootEnv(keyId, keySecret) {
  const rootEnvPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(rootEnvPath)) {
    return { keyId, keySecret };
  }
  try {
    const parsed = dotenv.parse(fs.readFileSync(rootEnvPath));
    const rootId = normalizeEnvValue(parsed.RAZORPAY_KEY_ID);
    const rootSecret = normalizeEnvValue(parsed.RAZORPAY_KEY_SECRET);
    return {
      keyId: isInvalidRazorpayKeyId(keyId) && !isInvalidRazorpayKeyId(rootId) ? rootId : keyId,
      keySecret:
        isInvalidRazorpayKeySecret(keySecret) && !isInvalidRazorpayKeySecret(rootSecret)
          ? rootSecret
          : keySecret,
    };
  } catch {
    return { keyId, keySecret };
  }
}

function getRazorpayCredentials() {
  let keyId = normalizeEnvValue(process.env.RAZORPAY_KEY_ID);
  let keySecret = normalizeEnvValue(process.env.RAZORPAY_KEY_SECRET);
  ({ keyId, keySecret } = mergeRazorpayFromRootEnv(keyId, keySecret));
  return { keyId, keySecret };
}

function razorpayConfigError(keyId, keySecret) {
  if (isInvalidRazorpayKeyId(keyId)) {
    return (
      'RAZORPAY_KEY_ID is missing or invalid. Set it in backend/.env (e.g. rzp_live_xxx or rzp_test_xxx). ' +
      'Remove any REPLACE_ME placeholder lines.'
    );
  }
  if (isInvalidRazorpayKeySecret(keySecret)) {
    return (
      'RAZORPAY_KEY_SECRET is missing or invalid. Set it in backend/.env (from Razorpay Dashboard → Regenerate Key). ' +
      'No quotes or spaces around the value unless the whole value is quoted.'
    );
  }
  return 'Razorpay keys are not configured.';
}

function getRazorpay() {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (isInvalidRazorpayKeyId(keyId) || isInvalidRazorpayKeySecret(keySecret)) {
    throw new Error(razorpayConfigError(keyId, keySecret));
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
