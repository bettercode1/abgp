const express = require('express');
const {
  createDonationOrder,
  verifyDonationPayment,
  donationPaymentFailed,
} = require('./donationController');

const router = express.Router();

router.post('/create-order', createDonationOrder);
router.post('/verify-payment', verifyDonationPayment);
router.post('/payment-failed', donationPaymentFailed);

module.exports = router;
