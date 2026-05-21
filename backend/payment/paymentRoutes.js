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

const router = express.Router();

router.get('/membership-fee', getMembershipFee);
router.post('/create-order', createOrder);
router.post('/create-renewal-order', createRenewalOrder);
router.post('/verify-payment', verifyPayment);
router.post('/payment-failed', paymentFailed);

router.get('/admin/overview', requireAuth, requireDirector, getPaymentsOverview);

module.exports = router;
