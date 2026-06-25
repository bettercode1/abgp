/**
 * PostgreSQL query layer for abgp.donations table.
 */
const { pool } = require('../db');

async function createDonationRecord(data) {
  const {
    donation_amount,
    first_name,
    last_name,
    father_or_spouse_name,
    phone_no,
    email,
    address_line1,
    address_line2,
    city,
    pincode,
    pan,
    razorpay_order_id,
  } = data;

  const result = await pool.query(
    `INSERT INTO abgp.donations
       (donation_amount, first_name, last_name, father_or_spouse_name,
        phone_no, email, address_line1, address_line2, city, pincode, pan,
        razorpay_order_id, currency, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'INR','PENDING')
     RETURNING id`,
    [
      donation_amount,
      first_name,
      last_name,
      father_or_spouse_name,
      phone_no,
      email,
      address_line1,
      address_line2 || null,
      city,
      pincode,
      pan,
      razorpay_order_id || null,
    ]
  );
  return result.rows[0];
}

async function setDonationRazorpayOrderId(id, razorpay_order_id) {
  const result = await pool.query(
    `UPDATE abgp.donations
     SET razorpay_order_id = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, razorpay_order_id`,
    [razorpay_order_id, id]
  );
  return result.rows[0] || null;
}

async function getDonationByOrderId(razorpay_order_id) {
  const result = await pool.query(
    `SELECT id, payment_status FROM abgp.donations WHERE razorpay_order_id = $1`,
    [razorpay_order_id]
  );
  return result.rows[0] || null;
}

async function updateDonationSuccess(data) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  const result = await pool.query(
    `UPDATE abgp.donations
     SET razorpay_payment_id = $1,
         razorpay_signature  = $2,
         payment_status      = 'SUCCESS',
         payment_date        = NOW(),
         updated_at          = NOW()
     WHERE razorpay_order_id = $3
       AND payment_status != 'SUCCESS'
     RETURNING id`,
    [razorpay_payment_id, razorpay_signature, razorpay_order_id]
  );
  return result.rows[0] || null;
}

async function updateDonationFailed(data) {
  const { razorpay_order_id, razorpay_payment_id } = data;
  const result = await pool.query(
    `UPDATE abgp.donations
     SET razorpay_payment_id = COALESCE($1, razorpay_payment_id),
         payment_status      = 'FAILED',
         updated_at          = NOW()
     WHERE razorpay_order_id = $2
       AND payment_status != 'SUCCESS'
     RETURNING id`,
    [razorpay_payment_id || null, razorpay_order_id]
  );
  return result.rows[0] || null;
}

async function listAllDonations() {
  const result = await pool.query(
    `SELECT id, donation_amount, first_name, last_name, father_or_spouse_name,
            phone_country_code, phone_no, email, address_line1, address_line2,
            city, pincode, pan, razorpay_order_id, razorpay_payment_id,
            currency, payment_status, payment_date, created_at, updated_at
     FROM abgp.donations
     ORDER BY created_at DESC`
  );
  return result.rows;
}

async function deleteDonationById(id) {
  const result = await pool.query(
    `DELETE FROM abgp.donations WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createDonationRecord,
  setDonationRazorpayOrderId,
  getDonationByOrderId,
  updateDonationSuccess,
  updateDonationFailed,
  listAllDonations,
  deleteDonationById,
};
