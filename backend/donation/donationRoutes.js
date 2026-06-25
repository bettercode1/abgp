const express = require('express');
const {
  createDonationOrder,
  verifyDonationPayment,
  donationPaymentFailed,
  listDonationsAdmin,
  deleteDonationAdmin,
} = require('./donationController');
const { buildDonationHealth } = require('../payment/paymentHealth');
const { requireAuth, requireDirector } = require('../middleware/auth');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    const health = await buildDonationHealth();
    return res.status(health.ok ? 200 : 503).json(health);
  } catch (err) {
    console.error('[donation/health]', err);
    return res.status(503).json({
      ok: false,
      service: 'donation',
      error: err instanceof Error ? err.message : 'Health check failed',
    });
  }
});

router.post('/create-order', createDonationOrder);
router.post('/verify-payment', verifyDonationPayment);
router.post('/payment-failed', donationPaymentFailed);

router.get('/admin/list', requireAuth, requireDirector, listDonationsAdmin);
router.delete('/admin/:id', requireAuth, requireDirector, deleteDonationAdmin);

module.exports = router;
