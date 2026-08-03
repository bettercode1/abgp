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
    pincode,
    phone_no,
    email,
    razorpay_order_id,
    amount,
    currency,
  } = data;

  const type = member_type === 'EXISTING' ? 'EXISTING' : 'NEW';
  const pincodeDigits = pincode ? String(pincode).replace(/\D/g, '').slice(0, 6) : null;

  const result = await pool.query(
    `INSERT INTO abgp.payments
       (full_name, gender, enrollment_remark, member_type, state, district, prant,
        location_details, pincode, phone_no, email,
        razorpay_order_id, amount, currency, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'PENDING')
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
      pincodeDigits,
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

/**
 * Build WHERE clause for Insights filters (membership payments analytics).
 * Date uses COALESCE(payment_date, created_at).
 */
function buildInsightsFilter(filters = {}) {
  const clauses = [];
  const params = [];
  let i = 1;

  if (filters.from) {
    clauses.push(`COALESCE(payment_date, created_at) >= $${i++}::timestamptz`);
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push(`COALESCE(payment_date, created_at) < ($${i++}::date + INTERVAL '1 day')`);
    params.push(filters.to);
  }
  if (filters.prant) {
    clauses.push(`LOWER(TRIM(prant)) = LOWER(TRIM($${i++}))`);
    params.push(String(filters.prant));
  }
  if (filters.state) {
    clauses.push(`LOWER(TRIM(state)) = LOWER(TRIM($${i++}))`);
    params.push(String(filters.state));
  }
  if (filters.status) {
    clauses.push(`UPPER(TRIM(payment_status)) = UPPER(TRIM($${i++}))`);
    params.push(String(filters.status));
  }
  if (filters.member_type) {
    clauses.push(`UPPER(TRIM(member_type)) = UPPER(TRIM($${i++}))`);
    params.push(String(filters.member_type));
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params, nextIndex: i };
}

/**
 * Aggregated membership-payment insights for Director Insights dashboard.
 */
async function getPaymentInsights(filters = {}) {
  const page = Math.max(parseInt(String(filters.page), 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(String(filters.pageSize), 10) || 25, 1), 100);
  const offset = (page - 1) * pageSize;

  const { where, params, nextIndex } = buildInsightsFilter(filters);

  const summaryResult = await pool.query(
    `SELECT
       COUNT(*)::int AS total_count,
       COUNT(*) FILTER (WHERE UPPER(payment_status) = 'SUCCESS')::int AS success_count,
       COUNT(*) FILTER (WHERE UPPER(payment_status) = 'PENDING')::int AS pending_count,
       COUNT(*) FILTER (WHERE UPPER(payment_status) = 'FAILED')::int AS failed_count,
       COUNT(*) FILTER (WHERE UPPER(payment_status) = 'SUCCESS' AND UPPER(COALESCE(member_type, 'NEW')) = 'NEW')::int AS new_success_count,
       COUNT(*) FILTER (WHERE UPPER(payment_status) = 'SUCCESS' AND UPPER(COALESCE(member_type, 'NEW')) = 'EXISTING')::int AS renewal_success_count,
       COALESCE(SUM(amount) FILTER (WHERE UPPER(payment_status) = 'SUCCESS'), 0)::bigint AS success_amount_paise,
       COALESCE(AVG(amount) FILTER (WHERE UPPER(payment_status) = 'SUCCESS'), 0)::float AS avg_success_amount_paise
     FROM abgp.payments
     ${where}`,
    params
  );

  const byDateResult = await pool.query(
    `SELECT
       (COALESCE(payment_date, created_at))::date AS day,
       COUNT(*)::int AS count,
       COUNT(*) FILTER (WHERE UPPER(payment_status) = 'SUCCESS')::int AS success_count,
       COALESCE(SUM(amount) FILTER (WHERE UPPER(payment_status) = 'SUCCESS'), 0)::bigint AS success_amount_paise
     FROM abgp.payments
     ${where}
     GROUP BY (COALESCE(payment_date, created_at))::date
     ORDER BY day ASC`,
    params
  );

  const byPrantResult = await pool.query(
    `SELECT
       COALESCE(NULLIF(TRIM(prant), ''), 'unknown') AS prant,
       COUNT(*)::int AS count,
       COUNT(*) FILTER (WHERE UPPER(payment_status) = 'SUCCESS')::int AS success_count,
       COALESCE(SUM(amount) FILTER (WHERE UPPER(payment_status) = 'SUCCESS'), 0)::bigint AS success_amount_paise
     FROM abgp.payments
     ${where}
     GROUP BY COALESCE(NULLIF(TRIM(prant), ''), 'unknown')
     ORDER BY success_amount_paise DESC, success_count DESC, prant ASC`,
    params
  );

  const byStatusResult = await pool.query(
    `SELECT
       UPPER(COALESCE(NULLIF(TRIM(payment_status), ''), 'UNKNOWN')) AS status,
       COUNT(*)::int AS count,
       COALESCE(SUM(amount), 0)::bigint AS amount_paise
     FROM abgp.payments
     ${where}
     GROUP BY UPPER(COALESCE(NULLIF(TRIM(payment_status), ''), 'UNKNOWN'))
     ORDER BY count DESC`,
    params
  );

  const prantsResult = await pool.query(
    `SELECT DISTINCT TRIM(prant) AS prant
     FROM abgp.payments
     WHERE prant IS NOT NULL AND TRIM(prant) <> ''
     ORDER BY prant ASC`
  );

  const statesResult = await pool.query(
    `SELECT DISTINCT TRIM(state) AS state
     FROM abgp.payments
     WHERE state IS NOT NULL AND TRIM(state) <> ''
     ORDER BY state ASC`
  );

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM abgp.payments ${where}`,
    params
  );
  const totalRows = countResult.rows[0]?.total || 0;

  const listParams = [...params, pageSize, offset];
  const limitIdx = nextIndex;
  const offsetIdx = nextIndex + 1;
  const rowsResult = await pool.query(
    `SELECT id, full_name, gender, enrollment_remark, member_type, state, district, prant, location_details,
            phone_no, email, razorpay_order_id, razorpay_payment_id,
            amount, currency, payment_status, payment_date, created_at, updated_at
     FROM abgp.payments
     ${where}
     ORDER BY COALESCE(payment_date, created_at) DESC, id DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    listParams
  );

  const summary = summaryResult.rows[0] || {};
  return {
    summary: {
      total_count: summary.total_count || 0,
      success_count: summary.success_count || 0,
      pending_count: summary.pending_count || 0,
      failed_count: summary.failed_count || 0,
      new_success_count: summary.new_success_count || 0,
      renewal_success_count: summary.renewal_success_count || 0,
      success_amount_paise: Number(summary.success_amount_paise || 0),
      avg_success_amount_paise: Math.round(Number(summary.avg_success_amount_paise || 0)),
    },
    by_date: byDateResult.rows.map((r) => ({
      day: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
      count: r.count,
      success_count: r.success_count,
      success_amount_paise: Number(r.success_amount_paise || 0),
    })),
    by_prant: byPrantResult.rows.map((r) => ({
      prant: r.prant,
      count: r.count,
      success_count: r.success_count,
      success_amount_paise: Number(r.success_amount_paise || 0),
    })),
    by_status: byStatusResult.rows.map((r) => ({
      status: r.status,
      count: r.count,
      amount_paise: Number(r.amount_paise || 0),
    })),
    filter_options: {
      prants: prantsResult.rows.map((r) => r.prant).filter(Boolean),
      states: statesResult.rows.map((r) => r.state).filter(Boolean),
    },
    rows: rowsResult.rows,
    pagination: {
      page,
      pageSize,
      total: totalRows,
      totalPages: Math.max(Math.ceil(totalRows / pageSize), 1),
    },
  };
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
    pincode: notes.pincode ? String(notes.pincode).replace(/\D/g, '').slice(0, 6) : null,
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
  getPaymentInsights,
  createPaymentRecordFromOrderNotes,
};
