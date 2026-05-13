const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth, requireDirector } = require('../middleware/auth');

// GET /api/petitions - List all petitions (Public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT petition_id, recipient_email, subject, email_body, created_at FROM abgp.petitions ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching petitions:', err);
    res.status(500).json({ error: 'Server error', details: err.message, code: err.code });
  }
});

// GET /api/petitions/:id - Get single petition (Public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT petition_id, recipient_email, subject, email_body, created_at FROM abgp.petitions WHERE petition_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching petition:', err);
    res.status(500).json({ error: 'Server error', details: err.message, code: err.code });
  }
});

// POST /api/petitions - Create new petition (Director Only)
router.post('/', requireAuth, requireDirector, async (req, res) => {
  try {
    const { 
      recipientEmail, 
      subject, 
      emailBody, 
      ccEmails, 
      bccEmails, 
      durationFrom, 
      durationTo, 
      attachments 
    } = req.body;

    console.log('Creating petition with data:', { recipientEmail, subject, ccEmails, bccEmails });

    if (!recipientEmail || !subject || !emailBody) {
      return res.status(400).json({ error: 'Recipient, Subject, and Body are required' });
    }

    const result = await pool.query(
      `INSERT INTO abgp.petitions 
       (recipient_email, subject, email_body, cc_emails, bcc_emails, duration_from, duration_to, attachments) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        recipientEmail, 
        subject, 
        emailBody, 
        ccEmails || null, 
        bccEmails || null, 
        durationFrom || null, 
        durationTo || null, 
        JSON.stringify(attachments || [])
      ]
    );
    console.log('Petition created successfully:', result.rows[0].petition_id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('CRITICAL ERROR creating petition:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message, 
      code: err.code,
      hint: err.code === 'ECONNREFUSED' ? 'Database connection refused. Check if PostgreSQL or SSH Tunnel is running on port 5432.' : undefined
    });
  }
});

// POST /api/petitions/:id/support - Record support (Public)
router.post('/:id/support', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phoneNo } = req.body;
    
    if (!fullName || !phoneNo) {
      return res.status(400).json({ error: 'Name and Phone are required' });
    }

    if (phoneNo.length !== 10) {
      return res.status(400).json({ error: 'Phone must be 10 digits' });
    }

    const result = await pool.query(
      'INSERT INTO abgp.petition_supports (petition_id, full_name, phone_no) VALUES ($1, $2, $3) RETURNING *',
      [id, fullName, phoneNo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error recording support:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/petitions/:id - Delete petition (Director Only)
router.delete('/:id', requireAuth, requireDirector, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM abgp.petitions WHERE petition_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    res.json({ message: 'Petition deleted successfully' });
  } catch (err) {
    console.error('Error deleting petition:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
