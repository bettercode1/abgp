/**
 * Payment controller: create order, verify success, record failure.
 */
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getMembershipAmountPaise,
  getRazorpayKeyId,
  fetchRazorpayOrder,
  fetchRecentRazorpayPayments,
  getRazorpayDashboardPaymentsUrl,
} = require('./paymentService');
const {
  createPaymentRecord,
  updatePaymentSuccess,
  updatePaymentFailed,
  getPaymentByOrderId,
  getPaymentDetailsByOrderId,
  setPaymentRazorpayOrderId,
  listPayments,
  createPaymentRecordFromOrderNotes,
} = require('./paymentQueries');
const { findMemberForLogin, normalizePhone, updateExistingMemberPaymentDate } = require('../member/memberAuthQueries');
const { computeMembershipStatus } = require('../member/memberAuthService');

const { validatePaymentForm } = require('./validators');
const { formatRazorpayError, isRazorpayAuthError, isRazorpayError } = require('./razorpayErrors');

/** Razorpay receipt max length is 40 characters. */
function buildReceipt(phoneNo) {
  const digits = String(phoneNo).replace(/\D/g, '').slice(-10);
  const receipt = `mbr${digits}${Date.now()}`.slice(0, 40);
  return receipt;
}

/**
 * POST /api/payment/create-order
 * Validates form data, creates Razorpay order, saves PENDING record to DB.
 */
async function createOrder(req, res) {
  try {
    const validationError = validatePaymentForm(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

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
    } = req.body;

    const amountPaise = getMembershipAmountPaise();
    const receipt = buildReceipt(phone_no);

    const trimmed = {
      full_name: String(full_name).trim(),
      gender: String(gender).trim(),
      enrollment_remark: enrollment_remark ? String(enrollment_remark).trim().slice(0, 50) : null,
      state: String(state).trim(),
      district: String(district).trim(),
      prant: String(prant).trim(),
      location_details: String(location_details).trim(),
      phone_no: String(phone_no).trim(),
      email: String(email).trim().toLowerCase(),
    };

    const orderNotes = {
      full_name: trimmed.full_name.slice(0, 256),
      gender: trimmed.gender.slice(0, 20),
      member_type: 'NEW',
      state: trimmed.state.slice(0, 256),
      district: trimmed.district.slice(0, 256),
      prant: trimmed.prant.slice(0, 256),
      location_details: trimmed.location_details.slice(0, 256),
      phone_no: trimmed.phone_no.slice(0, 256),
      email: trimmed.email.slice(0, 256),
    };

    // Save member details first so a row always exists even if Razorpay fails later
    const inserted = await createPaymentRecord({
      ...trimmed,
      member_type: 'NEW',
      razorpay_order_id: null,
      amount: amountPaise,
      currency: 'INR',
    });
    console.log('[payment/create-order] saved pending record id=%s (before Razorpay)', inserted.id);

    const order = await createRazorpayOrder(receipt, orderNotes);
    await setPaymentRazorpayOrderId(inserted.id, order.id);
    console.log('[payment/create-order] linked order=%s to payment id=%s', order.id, inserted.id);

    return res.status(201).json({
      key_id: getRazorpayKeyId(),
      order_id: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      amount_inr: amountPaise / 100,
    });
  } catch (err) {
    console.error('[payment/create-order]', err);
    if (isRazorpayError(err)) {
      const message = formatRazorpayError(err);
      const status = isRazorpayAuthError(err) ? 503 : 502;
      return res.status(status).json({
        error: isRazorpayAuthError(err)
          ? 'Razorpay authentication failed. Regenerate the secret in the Razorpay Dashboard and paste the new Key Secret into backend/.env (Key ID and Secret must be from the same account and mode: test or live).'
          : message,
      });
    }
    if (err && typeof err === 'object' && err.code === '42P01') {
      return res.status(503).json({
        error: 'Payments table is missing. Run backend/migrations/005_payments_table.sql on the database.',
      });
    }
    if (err && typeof err === 'object' && err.code === '23505') {
      return res.status(409).json({ error: 'Duplicate payment order. Please try again.' });
    }
    const message = err instanceof Error ? err.message : 'Failed to create payment order';
    if (err && typeof err === 'object' && err.detail) {
      return res.status(500).json({ error: message, detail: err.detail });
    }
    const isConfig =
      message.includes('not configured') ||
      message.includes('key_id') ||
      message.includes('Razorpay keys');
    return res.status(isConfig ? 503 : 500).json({ error: message });
  }
}

/**
 * POST /api/payment/create-renewal-order
 * Membership renewal for existing member (email + phone).
 */
async function createRenewalOrder(req, res) {
  try {
    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : '';
    const phone = normalizePhone(req.body?.phone);

    if (!email || phone.length !== 10) {
      return res.status(400).json({ error: 'Valid email and 10-digit phone are required' });
    }

    const member = await findMemberForLogin(email, phone);
    if (!member) {
      return res.status(404).json({
        error: 'No membership found for this email and phone.',
      });
    }

    const amountPaise = getMembershipAmountPaise();
    const receipt = buildReceipt(phone);

    const orderNotes = {
      full_name: String(member.full_name).slice(0, 256),
      gender: String(member.gender || 'Other').slice(0, 20),
      enrollment_remark: 'RENEWAL',
      member_type: 'EXISTING',
      state: String(member.state).slice(0, 256),
      district: String(member.district).slice(0, 256),
      prant: String(member.prant).slice(0, 256),
      location_details: String(member.location_details || '').slice(0, 256),
      phone_no: phone,
      email,
      renewal: 'true',
    };

    // Always save renewal in abgp.payments (PENDING → SUCCESS/FAILED after checkout)
    const inserted = await createPaymentRecord({
      full_name: member.full_name,
      gender: member.gender || 'Other',
      enrollment_remark: 'RENEWAL',
      member_type: 'EXISTING',
      state: member.state,
      district: member.district,
      prant: member.prant,
      location_details: member.location_details || '',
      phone_no: phone,
      email,
      razorpay_order_id: null,
      amount: amountPaise,
      currency: 'INR',
    });
    console.log('[payment/create-renewal-order] saved PENDING in abgp.payments id=%s', inserted.id);

    const order = await createRazorpayOrder(receipt, orderNotes);
    await setPaymentRazorpayOrderId(inserted.id, order.id);
    console.log('[payment/create-renewal-order] linked order=%s to payment id=%s', order.id, inserted.id);

    return res.status(201).json({
      key_id: getRazorpayKeyId(),
      order_id: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      amount_inr: amountPaise / 100,
      renewal: true,
    });
  } catch (err) {
    console.error('[payment/create-renewal-order]', err);
    const message = err instanceof Error ? err.message : 'Failed to create renewal order';
    return res.status(500).json({ error: message });
  }
}

/**
 * POST /api/payment/verify-payment
 * Verifies Razorpay signature, updates DB to SUCCESS.
 */
async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const orderId = String(razorpay_order_id);
    let existing = await getPaymentByOrderId(orderId);

    if (!existing) {
      try {
        const rzOrder = await fetchRazorpayOrder(orderId);
        const recovered = await createPaymentRecordFromOrderNotes(
          orderId,
          rzOrder,
          getMembershipAmountPaise()
        );
        console.log('[payment/verify-payment] recovered missing DB row id=%s order=%s', recovered.id, orderId);
        existing = await getPaymentByOrderId(orderId);
      } catch (recoverErr) {
        console.error('[payment/verify-payment] could not recover record for order', orderId, recoverErr);
        return res.status(404).json({ error: 'Payment record not found for this order' });
      }
    }

    if (existing.payment_status === 'SUCCESS') {
      return res.status(200).json({ success: true, message: 'Already verified' });
    }

    const isValid = verifyRazorpaySignature(
      String(razorpay_order_id),
      String(razorpay_payment_id),
      String(razorpay_signature)
    );

    if (!isValid) {
      console.error('[payment/verify-payment] Invalid signature for order', razorpay_order_id);
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    const updated = await updatePaymentSuccess({
      razorpay_order_id: orderId,
      razorpay_payment_id: String(razorpay_payment_id),
      razorpay_signature: String(razorpay_signature),
    });

    if (!updated) {
      console.error('[payment/verify-payment] update affected 0 rows for order', orderId);
      return res.status(500).json({ error: 'Could not update payment record' });
    }

    const details = await getPaymentDetailsByOrderId(orderId);
    if (details?.email && details?.phone_no) {
      // Best-effort sync only; verification is already complete at this point.
      try {
        await updateExistingMemberPaymentDate(
          String(details.email).trim().toLowerCase(),
          String(details.phone_no).trim(),
          new Date()
        );
      } catch (syncErr) {
        console.warn(
          '[payment/verify-payment] non-fatal member payment_date sync failed for order=%s',
          orderId,
          syncErr
        );
      }
    }

    console.log(
      '[payment/verify-payment] SUCCESS id=%s order=%s remark=%s',
      updated.id,
      orderId,
      details?.enrollment_remark || '—'
    );
    return res.status(200).json({
      success: true,
      payment_id: updated.id,
      enrollment_remark: details?.enrollment_remark || null,
      membership: computeMembershipStatus(new Date()),
    });
  } catch (err) {
    console.error('[payment/verify-payment]', err);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
}

/**
 * POST /api/payment/payment-failed
 * Records a failed payment attempt in the DB.
 */
async function paymentFailed(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({ error: 'razorpay_order_id is required' });
    }

    // Idempotency: do not overwrite a SUCCESS
    const existing = await getPaymentByOrderId(String(razorpay_order_id));
    if (existing && existing.payment_status === 'SUCCESS') {
      return res.status(200).json({ recorded: true });
    }

    await updatePaymentFailed({
      razorpay_order_id: String(razorpay_order_id),
      razorpay_payment_id: razorpay_payment_id ? String(razorpay_payment_id) : null,
    });

    return res.status(200).json({ recorded: true });
  } catch (err) {
    console.error('[payment/payment-failed]', err);
    return res.status(500).json({ error: 'Failed to record payment failure' });
  }
}

/**
 * GET /api/payment/membership-fee
 * Public fee for UI display only; charge amount always comes from create-order.
 */
function getMembershipFee(req, res) {
  try {
    const amountPaise = getMembershipAmountPaise();
    return res.json({
      amount_paise: amountPaise,
      amount_inr: amountPaise / 100,
      currency: 'INR',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read membership fee';
    return res.status(500).json({ error: message });
  }
}

/**
 * GET /api/payment/admin/overview — Director: DB rows + recent Razorpay payments.
 */
async function getPaymentsOverview(req, res) {
  try {
    const [database, razorpayItems] = await Promise.all([
      listPayments(100),
      fetchRecentRazorpayPayments(50),
    ]);

    const razorpay = razorpayItems.map((p) => ({
      payment_id: p.id,
      order_id: p.order_id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      method: p.method,
      email: p.email,
      contact: p.contact,
      created_at: p.created_at,
    }));

    return res.json({
      database,
      razorpay,
      dashboard_url: getRazorpayDashboardPaymentsUrl(),
    });
  } catch (err) {
    console.error('[payment/admin/overview]', err);
    if (isRazorpayError(err)) {
      return res.status(502).json({ error: formatRazorpayError(err) });
    }
    if (err && err.code === '42P01') {
      return res.status(503).json({
        error: 'Payments table missing on this database. Run backend/migrations/005_payments_table.sql',
      });
    }
    return res.status(500).json({ error: 'Failed to load payment overview' });
  }
}

module.exports = {
  createOrder,
  createRenewalOrder,
  verifyPayment,
  paymentFailed,
  getMembershipFee,
  getPaymentsOverview,
};
