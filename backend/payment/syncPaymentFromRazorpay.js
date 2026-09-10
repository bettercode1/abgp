/**
 * Sync a captured Razorpay payment into abgp.payments as SUCCESS (admin recovery).
 */
const { pool } = require('../db');
const { normalizePhone } = require('../member/memberAuthQueries');
const {
  getPaymentByOrderId,
  createPaymentRecordFromOrderNotes,
} = require('./paymentQueries');
const { fetchRazorpayOrder, fetchRazorpayPayment } = require('./paymentService');
const { sendMembershipReceiptIfNeeded } = require('./sendMembershipReceipt');

const PHONE_NORM_SQL = `RIGHT(REGEXP_REPLACE(COALESCE(phone_no, ''), '[^0-9]', '', 'g'), 10)`;

async function findPendingByPhoneOrEmail(phone, email) {
  const params = [];
  const clauses = ["UPPER(COALESCE(payment_status, '')) NOT IN ('SUCCESS', 'SUCCESSFUL')"];
  if (phone) {
    params.push(phone);
    clauses.push(`${PHONE_NORM_SQL} = $${params.length}`);
  }
  if (email) {
    params.push(email);
    clauses.push(`LOWER(TRIM(email)) = $${params.length}`);
  }
  if (!params.length) return null;
  const result = await pool.query(
    `SELECT id, razorpay_order_id, email, phone_no, payment_status
     FROM abgp.payments
     WHERE ${clauses.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT 1`,
    params
  );
  return result.rows[0] || null;
}

/**
 * @param {string} razorpayPaymentId e.g. pay_TZTEPSE3WBXPkQ
 */
async function syncPaymentFromRazorpayPaymentId(razorpayPaymentId) {
  const paymentId = String(razorpayPaymentId || '').trim();
  if (!paymentId.startsWith('pay_')) {
    throw new Error('Invalid Razorpay payment id');
  }

  const rp = await fetchRazorpayPayment(paymentId);
  const status = String(rp.status || '').toLowerCase();
  if (status !== 'captured' && status !== 'authorized') {
    throw new Error(`Razorpay payment is "${rp.status}", not captured`);
  }

  const orderId = rp.order_id;
  if (!orderId) {
    throw new Error('Razorpay payment has no order_id');
  }

  const paidAt = rp.created_at ? new Date(Number(rp.created_at) * 1000) : new Date();
  const contactPhone = normalizePhone(rp.contact || '');
  const email = rp.email ? String(rp.email).trim().toLowerCase() : '';

  let existing = await getPaymentByOrderId(orderId);
  if (!existing) {
    const byPayId = await pool.query(
      `SELECT id, payment_status, razorpay_order_id FROM abgp.payments WHERE razorpay_payment_id = $1 LIMIT 1`,
      [paymentId]
    );
    existing = byPayId.rows[0] || null;
  }
  if (!existing) {
    const pending = await findPendingByPhoneOrEmail(
      contactPhone.length === 10 ? contactPhone : null,
      email || null
    );
    if (pending) {
      await pool.query(
        `UPDATE abgp.payments SET razorpay_order_id = $2, updated_at = NOW() WHERE id = $1`,
        [pending.id, orderId]
      );
      existing = await getPaymentByOrderId(orderId);
    }
  }
  if (!existing) {
    const rzOrder = await fetchRazorpayOrder(orderId);
    await createPaymentRecordFromOrderNotes(orderId, rzOrder, rp.amount);
    existing = await getPaymentByOrderId(orderId);
  }
  if (!existing) {
    throw new Error('Could not find or create payment row for order ' + orderId);
  }

  await pool.query(
    `UPDATE abgp.payments
     SET payment_status = 'SUCCESS',
         razorpay_payment_id = $1,
         razorpay_order_id = COALESCE(razorpay_order_id, $2),
         payment_date = COALESCE(payment_date, $3),
         phone_no = CASE
           WHEN $4::text <> '' AND LENGTH($4) = 10 THEN $4
           ELSE phone_no
         END,
         email = CASE
           WHEN $5::text <> '' THEN $5
           ELSE email
         END,
         updated_at = NOW()
     WHERE razorpay_order_id = $2
        OR id = $6`,
    [paymentId, orderId, paidAt, contactPhone, email, existing.id]
  );

  const row = await pool.query(
    `SELECT email, phone_no, payment_status, payment_date, razorpay_order_id
     FROM abgp.payments WHERE razorpay_order_id = $1 OR razorpay_payment_id = $2 LIMIT 1`,
    [orderId, paymentId]
  );

  sendMembershipReceiptIfNeeded(orderId).catch((err) => {
    console.warn('[syncPaymentFromRazorpay] receipt email failed', err.message || err);
  });

  return {
    order_id: orderId,
    payment_id: paymentId,
    row: row.rows[0] || null,
  };
}

module.exports = { syncPaymentFromRazorpayPaymentId };
