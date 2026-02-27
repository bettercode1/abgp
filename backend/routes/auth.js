/**
 * POST /api/auth/login - email, password -> { user, token }
 */
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const normalized = String(email).trim().toLowerCase();
    const result = await pool.query(
      'SELECT id, email, password_hash, role, prant, name, contact_number FROM users WHERE LOWER(email) = $1',
      [normalized]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const row = result.rows[0];
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = {
      id: row.id,
      email: row.email,
      role: row.role,
      prant: row.prant ?? undefined,
      name: row.name ?? undefined,
      contactNumber: row.contact_number ?? undefined,
    };
    const token = jwt.sign(
      { id: row.id, email: row.email, role: row.role, prant: row.prant },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
