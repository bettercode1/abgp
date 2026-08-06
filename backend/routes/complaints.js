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
    assignedPrantKey: row.assigned_prant_key ?? undefined,
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
        `SELECT id, member_email, contact, category, form_data, message, assigned_prant_key, created_at
         FROM abgp.complaints WHERE LOWER(member_email) = $1 ORDER BY created_at DESC`,
        [email]
      );
    } else {
      result = await pool.query(
        `SELECT id, member_email, contact, category, form_data, message, assigned_prant_key, created_at
         FROM abgp.complaints ORDER BY created_at DESC LIMIT 500`
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
      `INSERT INTO abgp.complaints (member_email, contact, category, form_data, message)
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM abgp.complaints WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error('Complaint delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Build WHERE clause for admin list/export filters.
 * Date range applies to created_at (complaints have no separate "payment date").
 */
function buildComplaintsFilter(filters = {}) {
  const clauses = [];
  const params = [];
  let i = 1;

  if (filters.from) {
    clauses.push(`created_at >= $${i++}::timestamptz`);
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push(`created_at < ($${i++}::date + INTERVAL '1 day')`);
    params.push(filters.to);
  }
  if (filters.category) {
    clauses.push(`LOWER(TRIM(category)) = LOWER(TRIM($${i++}))`);
    params.push(String(filters.category));
  }
  if (filters.prant) {
    clauses.push(`LOWER(TRIM(assigned_prant_key)) = LOWER(TRIM($${i++}))`);
    params.push(String(filters.prant));
  }
  if (filters.q) {
    const q = `%${String(filters.q).trim().toLowerCase()}%`;
    clauses.push(
      `(LOWER(COALESCE(member_email, '')) LIKE $${i} OR LOWER(COALESCE(contact, '')) LIKE $${i} OR LOWER(COALESCE(message, '')) LIKE $${i})`
    );
    params.push(q);
    i += 1;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params, nextIndex: i };
}

/**
 * GET /api/complaints/admin/list — Director: paginated + filtered complaints list.
 * Query: from, to, category, prant, q, page, pageSize
 */
router.get('/admin/list', async (req, res) => {
  try {
    const { from, to, category, prant, q } = req.query || {};
    const filters = {
      from: from ? String(from).slice(0, 10) : undefined,
      to: to ? String(to).slice(0, 10) : undefined,
      category: category ? String(category).trim() : undefined,
      prant: prant ? String(prant).trim() : undefined,
      q: q ? String(q).trim().slice(0, 100) : undefined,
    };

    const page = Math.max(parseInt(String(req.query.page), 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize), 10) || 25, 1), 100);
    const offset = (page - 1) * pageSize;

    const { where, params, nextIndex } = buildComplaintsFilter(filters);

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM abgp.complaints ${where}`,
      params
    );
    const total = countResult.rows[0]?.total || 0;

    const listParams = [...params, pageSize, offset];
    const rowsResult = await pool.query(
      `SELECT id, member_email, contact, category, form_data, message, assigned_prant_key, created_at
       FROM abgp.complaints
       ${where}
       ORDER BY created_at DESC
       LIMIT $${nextIndex} OFFSET $${nextIndex + 1}`,
      listParams
    );

    const categoriesResult = await pool.query(
      `SELECT DISTINCT TRIM(category) AS category
       FROM abgp.complaints
       WHERE category IS NOT NULL AND TRIM(category) <> ''
       ORDER BY category ASC`
    );
    const prantsResult = await pool.query(
      `SELECT DISTINCT TRIM(assigned_prant_key) AS prant
       FROM abgp.complaints
       WHERE assigned_prant_key IS NOT NULL AND TRIM(assigned_prant_key) <> ''
       ORDER BY prant ASC`
    );

    res.json({
      complaints: rowsResult.rows.map(toComplaint),
      filter_options: {
        categories: categoriesResult.rows.map((r) => r.category).filter(Boolean),
        prants: prantsResult.rows.map((r) => r.prant).filter(Boolean),
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (err) {
    console.error('Complaints admin list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Escape a value for a CSV cell (quote if it contains comma, quote, or newline). */
function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatCsvDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCsvTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/** Hard cap on rows for a single CSV export (avoid unbounded memory use). */
const COMPLAINTS_EXPORT_ROW_LIMIT = 20000;

/**
 * GET /api/complaints/admin/export — Director: CSV report of complaints.
 * Accepts the same filters as /admin/list (from, to, category, prant, q).
 */
router.get('/admin/export', async (req, res) => {
  try {
    const { from, to, category, prant, q } = req.query || {};
    const filters = {
      from: from ? String(from).slice(0, 10) : undefined,
      to: to ? String(to).slice(0, 10) : undefined,
      category: category ? String(category).trim() : undefined,
      prant: prant ? String(prant).trim() : undefined,
      q: q ? String(q).trim().slice(0, 100) : undefined,
    };

    const { where, params, nextIndex } = buildComplaintsFilter(filters);
    const result = await pool.query(
      `SELECT id, member_email, contact, category, form_data, message, assigned_prant_key, created_at
       FROM abgp.complaints
       ${where}
       ORDER BY created_at DESC
       LIMIT $${nextIndex}`,
      [...params, COMPLAINTS_EXPORT_ROW_LIMIT]
    );

    const headers = ['Date', 'Time', 'Category', 'Member Email', 'Contact', 'Assigned Prant', 'Message', 'Details'];
    const lines = [headers.map(csvCell).join(',')];
    for (const row of result.rows) {
      let details = '';
      try {
        details = row.form_data ? JSON.stringify(row.form_data) : '';
      } catch {
        details = '';
      }
      lines.push(
        [
          formatCsvDate(row.created_at),
          formatCsvTime(row.created_at),
          row.category,
          row.member_email,
          row.contact,
          row.assigned_prant_key,
          row.message,
          details,
        ]
          .map(csvCell)
          .join(',')
      );
    }

    const csv = `\uFEFF${lines.join('\r\n')}`;
    const dateStamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="abgp-complaints-${dateStamp}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Complaints admin export error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
