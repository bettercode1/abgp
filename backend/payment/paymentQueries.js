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
    member_type,
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

  const type = member_type === 'EXISTING' ? 'EXISTING' : 'NEW';

  const result = await pool.query(
    `INSERT INTO abgp.payments
       (full_name, gender, enrollment_remark, member_type, state, district, prant,
        location_details, phone_no, email,
        razorpay_order_id, amount, currency, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'PENDING')
     RETURNING id`,
    [
      full_name,
      gender,
      enrollment_remark || null,
      type,
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

async function getPaymentDetailsByOrderId(razorpay_order_id) {
  const result = await pool.query(
    `SELECT id, full_name, gender, state, district, prant, location_details,
            email, phone_no, enrollment_remark, member_type, payment_status
     FROM abgp.payments WHERE razorpay_order_id = $1`,
    [razorpay_order_id]
  );
  return result.rows[0] || null;
}

async function setPaymentRazorpayOrderId(paymentId, razorpay_order_id) {
  const result = await pool.query(
    `UPDATE abgp.payments
     SET razorpay_order_id = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, razorpay_order_id`,
    [razorpay_order_id, paymentId]
  );
  return result.rows[0] || null;
}

async function listPayments(limit = 100) {
  const safeLimit = Math.min(Math.max(parseInt(String(limit), 10) || 100, 1), 200);
  const result = await pool.query(
    `SELECT id, full_name, gender, enrollment_remark, member_type, state, district, prant, location_details,
            phone_no, email, razorpay_order_id, razorpay_payment_id,
            amount, currency, payment_status, payment_date, created_at, updated_at
     FROM abgp.payments
     ORDER BY created_at DESC
     LIMIT $1`,
    [safeLimit]
  );
  return result.rows;
}

/** Recover a row from Razorpay order notes when create-order DB insert was missed. */
async function createPaymentRecordFromOrderNotes(orderId, rzOrder, amountFallback) {
  const notes = rzOrder?.notes || {};
  const amount =
    typeof rzOrder?.amount === 'number' ? rzOrder.amount : amountFallback || 0;
  const isRenewal = notes.renewal === 'true' || notes.renewal === true;
  const enrollmentRemark = notes.enrollment_remark || (isRenewal ? 'RENEWAL' : null);
  const memberType =
    notes.member_type === 'EXISTING' || isRenewal ? 'EXISTING' : 'NEW';

  return createPaymentRecord({
    full_name: notes.full_name || 'Unknown',
    gender: notes.gender || 'Other',
    enrollment_remark: enrollmentRemark,
    member_type: memberType,
    state: notes.state || 'Unknown',
    district: notes.district || 'Unknown',
    prant: notes.prant || 'unknown',
    location_details: notes.location_details || '',
    phone_no: String(notes.phone_no || '').replace(/\D/g, '').slice(-10) || '0000000000',
    email: notes.email || 'unknown@unknown.com',
    razorpay_order_id: orderId,
    amount,
    currency: rzOrder?.currency || 'INR',
  });
}

module.exports = {
  createPaymentRecord,
  updatePaymentSuccess,
  updatePaymentFailed,
  getPaymentByOrderId,
  getPaymentDetailsByOrderId,
  setPaymentRazorpayOrderId,
  listPayments,
  createPaymentRecordFromOrderNotes,
};
