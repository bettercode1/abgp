/**
 * Complaints API (Director only): list all, list by member_email.
 */
const express = require('express');
const { pool } = require('../db');

const router = express.Router();

function toComplaint(row) {
  return {
    id: row.id,
    memberEmail: row.member_email ?? undefined,
    contact: row.contact ?? undefined,
    category: row.category ?? undefined,
    formData: row.form_data ?? undefined,
    message: row.message ?? undefined,
    at: row.created_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const { member_email: memberEmail } = req.query;
    let result;
    if (memberEmail && String(memberEmail).trim()) {
      const email = String(memberEmail).trim().toLowerCase();
      result = await pool.query(
        `SELECT id, member_email, contact, category, form_data, message, created_at
         FROM complaints WHERE LOWER(member_email) = $1 ORDER BY created_at DESC`,
        [email]
      );
    } else {
      result = await pool.query(
        `SELECT id, member_email, contact, category, form_data, message, created_at
         FROM complaints ORDER BY created_at DESC LIMIT 500`
      );
    }
    res.json({ complaints: result.rows.map(toComplaint) });
  } catch (err) {
    console.error('Complaints list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { memberEmail, contact, category, formData, message } = req.body || {};
    const result = await pool.query(
      `INSERT INTO complaints (member_email, contact, category, form_data, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, member_email, contact, category, form_data, message, created_at`,
      [
        memberEmail ? String(memberEmail).trim() : null,
        contact ? String(contact).trim() : null,
        category ? String(category).trim() : null,
        formData && typeof formData === 'object' ? JSON.stringify(formData) : null,
        message ? String(message).trim() : null,
      ]
    );
    res.status(201).json({ complaint: toComplaint(result.rows[0]) });
  } catch (err) {
    console.error('Complaint add error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
