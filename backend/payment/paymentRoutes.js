const express = require('express');
const { createOrder, verifyPayment, paymentFailed } = require('./paymentController');

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/payment-failed', paymentFailed);

module.exports = router;
