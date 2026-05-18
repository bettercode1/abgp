/**
 * PostgreSQL query layer for abgp.payments table.
 * All queries use parameterized statements to prevent SQL injection.
 */
const { pool } = require('../db');

/**
 * Insert a new PENDING payment record when the Razorpay order is created.
 */
async function createPaymentRecord(data) {
  const {
    full_name,
    gender,
    enrollment_remark,
    state,
    district,
    prant,
    location_details,
    phone_no,
    email,
    razorpay_order_id,
    amount,
    currency,
  } = data;

  const result = await pool.query(
    `INSERT INTO abgp.payments
       (full_name, gender, enrollment_remark, state, district, prant,
        location_details, phone_no, email,
        razorpay_order_id, amount, currency, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'PENDING')
     RETURNING id`,
    [
      full_name,
      gender,
      enrollment_remark || null,
      state,
      district,
      prant,
      location_details,
      phone_no,
      email,
      razorpay_order_id,
      amount,
      currency || 'INR',
    ]
  );
  return result.rows[0];
}

/**
 * Mark a payment as SUCCESS after signature verification.
 */
async function updatePaymentSuccess(data) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  const result = await pool.query(
    `UPDATE abgp.payments
     SET razorpay_payment_id = $1,
         razorpay_signature  = $2,
         payment_status      = 'SUCCESS',
         payment_date        = NOW(),
         updated_at          = NOW()
     WHERE razorpay_order_id = $3
     RETURNING id, payment_status`,
    [razorpay_payment_id, razorpay_signature, razorpay_order_id]
  );
  return result.rows[0] || null;
}

/**
 * Mark a payment as FAILED.
 */
async function updatePaymentFailed(data) {
  const { razorpay_order_id, razorpay_payment_id } = data;

  const result = await pool.query(
    `UPDATE abgp.payments
     SET razorpay_payment_id = $1,
         payment_status      = 'FAILED',
         payment_date        = NOW(),
         updated_at          = NOW()
     WHERE razorpay_order_id = $2
     RETURNING id, payment_status`,
    [razorpay_payment_id || null, razorpay_order_id]
  );
  return result.rows[0] || null;
}

/**
 * Fetch an existing record by Razorpay order ID (idempotency check).
 */
async function getPaymentByOrderId(razorpay_order_id) {
  const result = await pool.query(
    `SELECT id, payment_status FROM abgp.payments WHERE razorpay_order_id = $1`,
    [razorpay_order_id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createPaymentRecord,
  updatePaymentSuccess,
  updatePaymentFailed,
  getPaymentByOrderId,
};
