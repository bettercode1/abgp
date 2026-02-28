/**
 * Auth is handled by Supabase (frontend). No login endpoint here.
 * Frontend sends Supabase access_token as Bearer for protected API routes.
 */
const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.status(410).json({
    error: 'Login is via Supabase. Use the app login page with your Supabase account.',
  });
});

module.exports = router;
