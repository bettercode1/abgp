/**
 * Payment controller: create order, verify success, record failure.
 */
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getMembershipAmountPaise,
} = require('./paymentService');
const {
  createPaymentRecord,
  updatePaymentSuccess,
  updatePaymentFailed,
  getPaymentByOrderId,
} = require('./paymentQueries');

const { validatePaymentForm } = require('./validators');

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
    const receipt = `mbr_${String(phone_no).trim()}_${Date.now()}`;

    const order = await createRazorpayOrder(receipt);

    await createPaymentRecord({
      full_name: String(full_name).trim(),
      gender: String(gender).trim(),
      enrollment_remark: enrollment_remark ? String(enrollment_remark).trim().slice(0, 50) : null,
      state: String(state).trim(),
      district: String(district).trim(),
      prant: String(prant).trim(),
      location_details: String(location_details).trim(),
      phone_no: String(phone_no).trim(),
      email: String(email).trim().toLowerCase(),
      razorpay_order_id: order.id,
      amount: amountPaise,
      currency: 'INR',
    });

    return res.status(201).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create payment order';
    const isConfig = message.includes('not configured') || message.includes('key_id');
    return res.status(isConfig ? 503 : 500).json({ error: message });
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

    // Idempotency: reject if already processed
    const existing = await getPaymentByOrderId(String(razorpay_order_id));
    if (!existing) {
      return res.status(404).json({ error: 'Payment record not found' });
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
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    await updatePaymentSuccess({
      razorpay_order_id: String(razorpay_order_id),
      razorpay_payment_id: String(razorpay_payment_id),
      razorpay_signature: String(razorpay_signature),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
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
    return res.status(500).json({ error: 'Failed to record payment failure' });
  }
}

module.exports = { createOrder, verifyPayment, paymentFailed };
