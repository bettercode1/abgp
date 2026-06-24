const express = require('express');
const {
  createDonationOrder,
  verifyDonationPayment,
  donationPaymentFailed,
} = require('./donationController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'donation', routes: ['POST /create-order', 'POST /verify-payment', 'POST /payment-failed'] });
});

router.post('/create-order', createDonationOrder);
router.post('/verify-payment', verifyDonationPayment);
router.post('/payment-failed', donationPaymentFailed);

module.exports = router;
