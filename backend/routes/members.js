/**
 * Members API (Director only): list, add, delete.
 */
const express = require('express');
const { pool } = require('../db');

const router = express.Router();

function toMember(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? undefined,
    role: row.role,
    prant: row.prant ?? undefined,
    isNewMember: row.is_new_member,
    addedAt: row.added_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, prant, is_new_member, added_at FROM members ORDER BY added_at DESC'
    );
    res.json({ members: result.rows.map(toMember) });
  } catch (err) {
    if (err.code === '42P01' || /relation .* does not exist/i.test(err.message)) {
      return res.json({ members: [] });
    }
    console.error('Members list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, name, role = 'member', prant } = req.body || {};
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Email required' });
    }
    const normalized = String(email).trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM members WHERE LOWER(email) = $1', [normalized]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Member already exists' });
    }
    const result = await pool.query(
      `INSERT INTO members (email, name, role, prant, is_new_member, added_at)
       VALUES ($1, $2, $3, $4, true, NOW())
       RETURNING id, email, name, role, prant, is_new_member, added_at`,
      [normalized, name ? String(name).trim() : null, role, prant || null]
    );
    res.status(201).json({ member: toMember(result.rows[0]) });
  } catch (err) {
    console.error('Member add error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Member delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
