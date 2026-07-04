/**
 * Auth routes: Firebase session info. Login is handled on the frontend via Firebase Auth.
 */
const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  res.json({
    uid: req.user.id,
    email: req.user.email,
    role: req.user.role,
    prant: req.user.prant ?? null,
  });
});

router.post('/login', (req, res) => {
  res.status(410).json({
    error: 'Login is via Firebase. Use the app login page with your Firebase account.',
  });
});

module.exports = router;
