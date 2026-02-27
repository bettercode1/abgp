/**
 * Prants API (Director only): list prant users (email, name, contact_number), update profile, change password.
 */
const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, prant, name, contact_number
       FROM users WHERE role = 'prant' AND prant IS NOT NULL
       ORDER BY prant`
    );
    const prants = result.rows.map((row) => ({
      prantKey: row.prant,
      email: row.email,
      name: row.name ?? undefined,
      contactNumber: row.contact_number ?? undefined,
    }));
    res.json({ prants });
  } catch (err) {
    console.error('Prants list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:prantKey', async (req, res) => {
  try {
    const { prantKey } = req.params;
    const { name, contactNumber } = req.body || {};
    const updates = [];
    const values = [];
    let i = 1;
    if (name !== undefined) {
      updates.push(`name = $${i++}`);
      values.push(String(name).trim() || null);
    }
    if (contactNumber !== undefined) {
      updates.push(`contact_number = $${i++}`);
      values.push(String(contactNumber).trim() || null);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Provide name and/or contactNumber' });
    }
    values.push(prantKey);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
       WHERE role = 'prant' AND prant = $${i}
       RETURNING id, email, prant, name, contact_number`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prant not found' });
    }
    const row = result.rows[0];
    res.json({
      prantKey: row.prant,
      email: row.email,
      name: row.name ?? undefined,
      contactNumber: row.contact_number ?? undefined,
    });
  } catch (err) {
    console.error('Prant update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:prantKey/change-password', async (req, res) => {
  try {
    const { prantKey } = req.params;
    const { newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const hash = await bcrypt.hash(String(newPassword), 10);
    const result = await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW()
       WHERE role = 'prant' AND prant = $2
       RETURNING id, email, prant`,
      [hash, prantKey]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prant not found' });
    }
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
