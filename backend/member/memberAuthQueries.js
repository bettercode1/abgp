/**
 * Member lookup for login: abgp.payments (new registrations) and abgp.existing_members.
 */
const { pool } = require('../db');

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10);
}

function mapPaymentRow(row) {
  return {
    source: 'payments',
    id: row.id,
    full_name: row.full_name,
    gender: row.gender || 'Other',
    email: row.email,
    phone_no: row.phone_no,
    state: row.state,
    district: row.district,
    prant: row.prant,
    location_details: row.location_details,
    payment_date: row.payment_date,
    payment_status: row.payment_status,
  };
}

async function findLatestSuccessPayment(email, phone) {
  const result = await pool.query(
    `SELECT id, full_name, gender, state, district, prant, location_details,
            email, phone_no, payment_date, payment_status
     FROM abgp.payments
     WHERE LOWER(email) = $1
       AND phone_no = $2
       AND UPPER(COALESCE(payment_status, '')) IN ('SUCCESS', 'SUCCESSFUL')
       AND payment_date IS NOT NULL
     ORDER BY payment_date DESC
     LIMIT 1`,
    [email, phone]
  );
  return result.rows[0] ? mapPaymentRow(result.rows[0]) : null;
}

async function findLatestExistingMember(email, phone) {
  try {
    const result = await pool.query(
      `SELECT id, email, phone_no, full_name, gender, state, district, prant,
              location_details, payment_date
       FROM abgp.existing_members
       WHERE LOWER(TRIM(email)) = $1
         AND phone_no = $2
         AND payment_date IS NOT NULL
       ORDER BY payment_date DESC
       LIMIT 1`,
      [email, phone]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      source: 'existing_members',
      id: row.id,
      full_name: row.full_name || 'Member',
      gender: row.gender || 'Other',
      email: row.email,
      phone_no: row.phone_no,
      state: row.state || 'Unknown',
      district: row.district || 'Unknown',
      prant: row.prant || 'unknown',
      location_details: row.location_details || '',
      payment_date: row.payment_date,
      payment_status: 'SUCCESS',
    };
  } catch (err) {
    if (err.code === '42P01' || err.code === '42703') return null;
    throw err;
  }
}

async function findPaymentCandidatesByIdentifier(email, phone) {
  if (!email && !phone) return [];
  const conditions = [
    "UPPER(COALESCE(payment_status, '')) IN ('SUCCESS', 'SUCCESSFUL')",
    'payment_date IS NOT NULL',
  ];
  const params = [];
  if (email) {
    params.push(email);
    conditions.push(`LOWER(email) = $${params.length}`);
  }
  if (phone) {
    params.push(phone);
    conditions.push(`phone_no = $${params.length}`);
  }
  const result = await pool.query(
    `SELECT full_name, gender, state, district, prant, location_details,
            email, phone_no, payment_date
     FROM abgp.payments
     WHERE ${conditions.join(' AND ')}
     ORDER BY payment_date DESC`,
    params
  );
  return result.rows.map((row) => ({
    source: 'payments',
    full_name: row.full_name,
    gender: row.gender || 'Other',
    email: row.email,
    phone_no: row.phone_no,
    state: row.state,
    district: row.district,
    prant: row.prant,
    location_details: row.location_details,
    payment_date: row.payment_date,
  }));
}

async function findExistingCandidatesByIdentifier(email, phone) {
  if (!email && !phone) return [];
  const conditions = ['payment_date IS NOT NULL'];
  const params = [];
  if (email) {
    params.push(email);
    conditions.push(`LOWER(TRIM(email)) = $${params.length}`);
  }
  if (phone) {
    params.push(phone);
    conditions.push(`phone_no = $${params.length}`);
  }
  try {
    const result = await pool.query(
      `SELECT full_name, gender, state, district, prant, location_details,
              email, phone_no, payment_date
       FROM abgp.existing_members
       WHERE ${conditions.join(' AND ')}
       ORDER BY payment_date DESC`,
      params
    );
    return result.rows.map((row) => ({
      source: 'existing_members',
      full_name: row.full_name || 'Member',
      gender: row.gender || 'Other',
      email: row.email,
      phone_no: row.phone_no,
      state: row.state || 'Unknown',
      district: row.district || 'Unknown',
      prant: row.prant || 'unknown',
      location_details: row.location_details || '',
      payment_date: row.payment_date,
    }));
  } catch (err) {
    if (err.code === '42P01' || err.code === '42703') return [];
    throw err;
  }
}

function pickLatestDate(a, b) {
  const left = paymentDateMs(a);
  const right = paymentDateMs(b);
  return left >= right ? a : b;
}

function paymentDateMs(value) {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * Lookup in abgp.payments (SUCCESS) and abgp.existing_members.
 * Membership expiry uses the latest payment_date across both tables.
 */
async function findMemberForLogin(email, phone) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedEmail || normalizedPhone.length !== 10) {
    return null;
  }

  const [fromPayments, fromExisting] = await Promise.all([
    findLatestSuccessPayment(normalizedEmail, normalizedPhone),
    findLatestExistingMember(normalizedEmail, normalizedPhone),
  ]);

  if (!fromPayments && !fromExisting) return null;

  const payMs = paymentDateMs(fromPayments?.payment_date);
  const existMs = paymentDateMs(fromExisting?.payment_date);
  const lastMs = Math.max(payMs, existMs);

  let profile = fromPayments || fromExisting;
  if (fromPayments && fromExisting) {
    profile = payMs >= existMs ? fromPayments : fromExisting;
  }

  const lastPaymentDate = lastMs > 0 ? new Date(lastMs) : null;

  return {
    ...profile,
    payment_date: lastPaymentDate,
    last_payment_date: lastPaymentDate,
    found_in_payments: Boolean(fromPayments),
    found_in_existing_members: Boolean(fromExisting),
  };
}

/**
 * Find all candidate member profiles linked with either email or phone.
 * Used by member login discovery step.
 */
async function findMembersForLoginLookup(identifier) {
  const normalizedEmail = identifier?.email ? String(identifier.email).trim().toLowerCase() : '';
  const normalizedPhone = identifier?.phone ? normalizePhone(identifier.phone) : '';
  if (!normalizedEmail && normalizedPhone.length !== 10) return [];

  const [paymentCandidates, existingCandidates] = await Promise.all([
    findPaymentCandidatesByIdentifier(
      normalizedEmail || null,
      normalizedPhone.length === 10 ? normalizedPhone : null
    ),
    findExistingCandidatesByIdentifier(
      normalizedEmail || null,
      normalizedPhone.length === 10 ? normalizedPhone : null
    ),
  ]);

  const merged = new Map();
  for (const candidate of [...paymentCandidates, ...existingCandidates]) {
    const key = `${String(candidate.full_name || '').trim().toLowerCase()}|${String(candidate.email || '').trim().toLowerCase()}|${String(candidate.phone_no || '').trim()}`;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, {
        ...candidate,
        found_in_payments: candidate.source === 'payments',
        found_in_existing_members: candidate.source === 'existing_members',
        last_payment_date: candidate.payment_date || null,
      });
      continue;
    }
    merged.set(key, {
      ...current,
      found_in_payments: current.found_in_payments || candidate.source === 'payments',
      found_in_existing_members:
        current.found_in_existing_members || candidate.source === 'existing_members',
      last_payment_date: pickLatestDate(current.last_payment_date, candidate.payment_date),
    });
  }

  return Array.from(merged.values()).sort(
    (a, b) => paymentDateMs(b.last_payment_date) - paymentDateMs(a.last_payment_date)
  );
}

async function updateExistingMemberPaymentDate(email, phone, paymentDate) {
  try {
    await pool.query(
      `UPDATE abgp.existing_members
       SET payment_date = $3, updated_at = NOW()
       WHERE LOWER(TRIM(email)) = $1 AND phone_no = $2`,
      [email, phone, paymentDate]
    );
  } catch (err) {
    // Some deployments still run older schema variants for existing_members.
    // Keep this sync step non-fatal for the payment verification response.
    if (err.code !== '42P01' && err.code !== '42703') throw err;
  }
}

module.exports = {
  normalizePhone,
  findMemberForLogin,
  findMembersForLoginLookup,
  updateExistingMemberPaymentDate,
};
