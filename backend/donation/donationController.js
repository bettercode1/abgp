const {
  createRazorpayOrderWithAmount,
  verifyRazorpaySignature,
  getRazorpayKeyId,
} = require('../payment/paymentService');
const { formatRazorpayError, isRazorpayAuthError, isRazorpayError } = require('../payment/razorpayErrors');
const { validateDonationForm, parseDonationAmount } = require('./validators');
const {
  createDonationRecord,
  setDonationRazorpayOrderId,
  getDonationByOrderId,
  updateDonationSuccess,
  updateDonationFailed,
} = require('./donationQueries');

function buildDonationReceipt(phoneNo) {
  const digits = String(phoneNo).replace(/\D/g, '').slice(-10);
  return `don${digits}${Date.now()}`.slice(0, 40);
}

function trimDonationPayload(body) {
  const amountInr = parseDonationAmount(body.donation_amount);
  return {
    donation_amount: amountInr,
    first_name: String(body.first_name).trim(),
    last_name: String(body.last_name).trim(),
    father_or_spouse_name: String(body.father_or_spouse_name).trim(),
    phone_no: String(body.phone_no).replace(/\D/g, '').slice(-10),
    email: String(body.email).trim().toLowerCase(),
    address_line1: String(body.address_line1).trim(),
    address_line2: body.address_line2 ? String(body.address_line2).trim() : null,
    city: String(body.city).trim(),
    pincode: String(body.pincode).replace(/\D/g, ''),
    pan: String(body.pan).trim().toUpperCase(),
  };
}

/**
 * POST /api/donation/create-order
 */
async function createDonationOrder(req, res) {
  try {
    const validationError = validateDonationForm(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const trimmed = trimDonationPayload(req.body);
    const amountPaise = Math.round(trimmed.donation_amount * 100);
    const receipt = buildDonationReceipt(trimmed.phone_no);

    const orderNotes = {
      type: 'donation',
      first_name: trimmed.first_name.slice(0, 256),
      last_name: trimmed.last_name.slice(0, 256),
      phone_no: trimmed.phone_no,
      email: trimmed.email.slice(0, 256),
      pan: trimmed.pan,
    };

    const inserted = await createDonationRecord({
      ...trimmed,
      razorpay_order_id: null,
    });
    console.log('[donation/create-order] saved pending record id=%s', inserted.id);

    const order = await createRazorpayOrderWithAmount(receipt, amountPaise, orderNotes);
    await setDonationRazorpayOrderId(inserted.id, order.id);
    console.log('[donation/create-order] linked order=%s to donation id=%s', order.id, inserted.id);

    return res.status(201).json({
      key_id: getRazorpayKeyId(),
      order_id: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      amount_inr: trimmed.donation_amount,
      donation_id: inserted.id,
    });
  } catch (err) {
    console.error('[donation/create-order]', err);
    if (isRazorpayError(err)) {
      const message = formatRazorpayError(err);
      const status = isRazorpayAuthError(err) ? 503 : 502;
      return res.status(status).json({
        error: isRazorpayAuthError(err)
          ? 'Razorpay authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.'
          : message,
      });
    }
    if (err && err.code === '42P01') {
      return res.status(503).json({
        error: 'Donations table is missing. Run backend/migrations/008_donations_table.sql on the database.',
      });
    }
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Duplicate donation order. Please try again.' });
    }
    const message = err instanceof Error ? err.message : 'Failed to create donation order';
    const isConfig =
      message.includes('not configured') ||
      message.includes('key_id') ||
      message.includes('Razorpay keys');
    return res.status(isConfig ? 503 : 500).json({ error: message });
  }
}

/**
 * POST /api/donation/verify-payment
 */
async function verifyDonationPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const orderId = String(razorpay_order_id);
    const existing = await getDonationByOrderId(orderId);
    if (!existing) {
      return res.status(404).json({ error: 'Donation record not found for this order' });
    }

    if (existing.payment_status === 'SUCCESS') {
      return res.status(200).json({ success: true, message: 'Already verified' });
    }

    const isValid = verifyRazorpaySignature(
      orderId,
      String(razorpay_payment_id),
      String(razorpay_signature)
    );

    if (!isValid) {
      console.error('[donation/verify-payment] Invalid signature for order', orderId);
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    const updated = await updateDonationSuccess({
      razorpay_order_id: orderId,
      razorpay_payment_id: String(razorpay_payment_id),
      razorpay_signature: String(razorpay_signature),
    });

    if (!updated) {
      return res.status(500).json({ error: 'Could not update donation record' });
    }

    console.log('[donation/verify-payment] SUCCESS id=%s order=%s', updated.id, orderId);
    return res.status(200).json({ success: true, donation_id: updated.id });
  } catch (err) {
    console.error('[donation/verify-payment]', err);
    return res.status(500).json({ error: 'Donation payment verification failed' });
  }
}

/**
 * POST /api/donation/payment-failed
 */
async function donationPaymentFailed(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({ error: 'razorpay_order_id is required' });
    }

    const existing = await getDonationByOrderId(String(razorpay_order_id));
    if (existing && existing.payment_status === 'SUCCESS') {
      return res.status(200).json({ recorded: true });
    }

    await updateDonationFailed({
      razorpay_order_id: String(razorpay_order_id),
      razorpay_payment_id: razorpay_payment_id ? String(razorpay_payment_id) : null,
    });

    return res.status(200).json({ recorded: true });
  } catch (err) {
    console.error('[donation/payment-failed]', err);
    return res.status(500).json({ error: 'Failed to record donation payment failure' });
  }
}

module.exports = {
  createDonationOrder,
  verifyDonationPayment,
  donationPaymentFailed,
};
