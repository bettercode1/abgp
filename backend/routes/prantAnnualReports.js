/**
 * Prant annual reports: prants POST a PDF + title; directors GET all; prants GET own only.
 */
const express = require('express');
const { pool } = require('../db');

const router = express.Router();

function toReport(row) {
  return {
    reportId: row.report_id,
    prantKey: row.prant_key,
    submittedByEmail: row.submitted_by_email ?? undefined,
    title: row.title,
    notes: row.notes ?? undefined,
    pdfUrl: row.pdf_data,
    createdAt: row.created_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const role = req.user?.role;
    if (role === 'director') {
      const result = await pool.query(
        `SELECT report_id, prant_key, submitted_by_email, title, notes, pdf_data, created_at
         FROM abgp.prant_annual_reports
         ORDER BY created_at DESC
         LIMIT 300`
      );
      return res.json({ reports: result.rows.map(toReport) });
    }
    if (role === 'prant') {
      const pk = (req.user.prant || '').toString().trim();
      if (!pk) {
        return res.status(400).json({ error: 'Prant key missing on account' });
      }
      const result = await pool.query(
        `SELECT report_id, prant_key, submitted_by_email, title, notes, pdf_data, created_at
         FROM abgp.prant_annual_reports
         WHERE LOWER(TRIM(prant_key)) = LOWER(TRIM($1))
         ORDER BY created_at DESC
         LIMIT 100`,
        [pk]
      );
      return res.json({ reports: result.rows.map(toReport) });
    }
    return res.status(403).json({ error: 'Director or Prant only' });
  } catch (err) {
    if (err.code === '42P01') {
      console.error('prant_annual_reports table missing; run migrations/003_prant_annual_reports.sql');
      return res.json({ reports: [] });
    }
    console.error('prant annual reports list error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (req.user?.role !== 'prant') {
      return res.status(403).json({ error: 'Only prants can submit annual reports' });
    }
    const pk = (req.user.prant || '').toString().trim();
    if (!pk) {
      return res.status(400).json({ error: 'Prant key missing on account' });
    }
    const { title, notes, pdfData } = req.body || {};
    const titleStr = title != null ? String(title).trim() : '';
    if (!titleStr) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const pdf = String(pdfData);
    if (!pdf.startsWith('data:') || !pdf.includes('application/pdf')) {
      return res.status(400).json({ error: 'A PDF file is required (data URL with application/pdf)' });
    }
    const reportId = `par-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const email = req.user.email ? String(req.user.email).trim() : null;
    const notesStr = notes != null ? String(notes).trim() : null;

    const result = await pool.query(
      `INSERT INTO abgp.prant_annual_reports (report_id, prant_key, submitted_by_email, title, notes, pdf_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING report_id, prant_key, submitted_by_email, title, notes, pdf_data, created_at`,
      [reportId, pk, email, titleStr, notesStr || null, pdfData]
    );
    return res.status(201).json({ report: toReport(result.rows[0]) });
  } catch (err) {
    if (err.code === '42P01') {
      console.error('prant_annual_reports table missing; run migrations/003_prant_annual_reports.sql');
      return res.status(503).json({ error: 'Annual reports storage is not configured' });
    }
    console.error('prant annual report submit error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
