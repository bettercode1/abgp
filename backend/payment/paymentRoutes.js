const express = require('express');
const { requireAuth, requireDirector } = require('../middleware/auth');
const {
  createOrder,
  createRenewalOrder,
  verifyPayment,
  paymentFailed,
  getMembershipFee,
  getPaymentsOverview,
} = require('./paymentController');
const { buildPaymentHealth } = require('./paymentHealth');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    const health = await buildPaymentHealth();
    return res.status(health.ok ? 200 : 503).json(health);
  } catch (err) {
    console.error('[payment/health]', err);
    return res.status(503).json({
      ok: false,
      service: 'payment',
      error: err instanceof Error ? err.message : 'Health check failed',
    });
  }
});

router.get('/membership-fee', getMembershipFee);
router.post('/create-order', createOrder);
router.post('/create-renewal-order', createRenewalOrder);
router.post('/verify-payment', verifyPayment);
router.post('/payment-failed', paymentFailed);

router.get('/admin/overview', requireAuth, requireDirector, getPaymentsOverview);

module.exports = router;
