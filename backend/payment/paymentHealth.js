/**
 * Shared health checks for membership and donation payment routes.
 */
const { pool } = require('../db');
const { getRazorpayCredentials } = require('./paymentService');

function getRazorpayStatus() {
  const { keyId, keySecret } = getRazorpayCredentials();
  const id = String(keyId || '').trim();
  const secret = String(keySecret || '').trim();
  const keyIdOk = /^rzp_(test|live)_[A-Za-z0-9]+$/.test(id);
  const secretOk = secret.length >= 8;
  return {
    configured: keyIdOk && secretOk,
    mode: keyIdOk ? (id.startsWith('rzp_live_') ? 'live' : 'test') : 'missing',
  };
}

async function checkTable(tableName) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count FROM abgp.${tableName}`
    );
    return { ok: true, count: result.rows[0]?.count ?? 0 };
  } catch (err) {
    if (err && err.code === '42P01') {
      return { ok: false, missing: true };
    }
    return { ok: false, error: err instanceof Error ? err.message : 'query failed' };
  }
}

async function buildPaymentHealth() {
  const razorpay = getRazorpayStatus();
  const paymentsTable = await checkTable('payments');
  const ok = razorpay.configured && paymentsTable.ok;
  return {
    ok,
    service: 'payment',
    razorpay,
    payments_table: paymentsTable,
    routes: [
      'GET /membership-fee',
      'POST /create-order',
      'POST /create-renewal-order',
      'POST /verify-payment',
      'POST /payment-failed',
    ],
  };
}

async function buildDonationHealth() {
  const razorpay = getRazorpayStatus();
  const donationsTable = await checkTable('donations');
  const ok = razorpay.configured && donationsTable.ok;
  return {
    ok,
    service: 'donation',
    razorpay,
    donations_table: donationsTable,
    routes: ['POST /create-order', 'POST /verify-payment', 'POST /payment-failed'],
  };
}

module.exports = {
  buildPaymentHealth,
  buildDonationHealth,
};
