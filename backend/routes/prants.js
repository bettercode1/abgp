/**
 * Prants API (Director only): list from Supabase user_roles + prant_profiles, update profile, change password via Supabase Admin.
 */
const express = require('express');
const { pool } = require('../db');
const { listPrantUserRoles, getAuthUserIdByPrant, getSupabaseAdmin } = require('../lib/supabaseAdmin');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const prantRoles = await listPrantUserRoles();
    if (prantRoles.length === 0) {
      return res.json({ prants: [] });
    }
    const result = await pool.query(
      'SELECT prant_key, name, contact_number FROM prant_profiles WHERE prant_key = ANY($1)',
      [prantRoles.map((p) => p.prantKey)]
    );
    const profilesByKey = {};
    for (const row of result.rows) {
      profilesByKey[row.prant_key] = { name: row.name ?? undefined, contactNumber: row.contact_number ?? undefined };
    }
    const prants = prantRoles.map((p) => ({
      prantKey: p.prantKey,
      email: p.email,
      name: profilesByKey[p.prantKey]?.name,
      contactNumber: profilesByKey[p.prantKey]?.contactNumber,
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
    const prantRoles = await listPrantUserRoles();
    if (!prantRoles.some((p) => p.prantKey === prantKey)) {
      return res.status(404).json({ error: 'Prant not found' });
    }
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
      `UPDATE prant_profiles SET ${updates.join(', ')}, updated_at = NOW() WHERE prant_key = $${i} RETURNING prant_key, name, contact_number`,
      values
    );
    let row;
    if (result.rows.length === 0) {
      const ins = await pool.query(
        'INSERT INTO prant_profiles (prant_key, name, contact_number) VALUES ($1, $2, $3) RETURNING prant_key, name, contact_number',
        [prantKey, name !== undefined ? String(name).trim() || null : null, contactNumber !== undefined ? String(contactNumber).trim() || null : null]
      );
      row = ins.rows[0];
    } else {
      row = result.rows[0];
    }
    const email = prantRoles.find((p) => p.prantKey === prantKey)?.email;
    res.json({
      prantKey: row.prant_key,
      email: email ?? undefined,
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
    const userId = await getAuthUserIdByPrant(prantKey);
    if (!userId) {
      return res.status(404).json({ error: 'Prant not found' });
    }
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase admin not configured' });
    }
    const { error } = await supabase.auth.admin.updateUserById(userId, { password: String(newPassword) });
    if (error) {
      console.error('Supabase password update error:', error);
      return res.status(400).json({ error: error.message || 'Password update failed' });
    }
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
