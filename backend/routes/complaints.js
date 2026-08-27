/**
 * Complaints API — members submit, prants handle, directors oversee all.
 */
const express = require('express');
const path = require('path');
const { pool } = require('../db');
const { requireDirector, requireDirectorOrPrant } = require('../middleware/auth');
const { normalizePrantKey } = require('../lib/prantNormalize');
const { getPrantForStateDistrict } = require('../lib/stateDistrictPrant');
const { saveComplaintAttachments, resolveAttachmentPath } = require('../lib/complaintAttachments');

const router = express.Router();

const COMPLAINT_STATUSES = new Set(['submitted', 'in_review', 'resolved', 'closed']);
const PRANT_ALLOWED_STATUSES = new Set(['in_review', 'resolved']);

const COMPLAINT_COLUMNS = `
  id, member_email, contact, category, form_data, message,
  assigned_prant_key, state, district, status, attachments,
  submitted_by_uid, prant_notes, handled_by, handled_at,
  created_at, updated_at
`;

function toComplaint(row) {
  if (!row) return null;
  return {
    id: row.id,
    memberEmail: row.member_email ?? undefined,
    contact: row.contact ?? undefined,
    category: row.category ?? undefined,
    formData: row.form_data ?? undefined,
    message: row.message ?? undefined,
    assignedPrantKey: row.assigned_prant_key ?? undefined,
    state: row.state ?? undefined,
    district: row.district ?? undefined,
    status: row.status ?? 'submitted',
    attachments: Array.isArray(row.attachments) ? row.attachments : row.attachments || [],
    submittedByUid: row.submitted_by_uid ?? undefined,
    prantNotes: row.prant_notes ?? undefined,
    handledBy: row.handled_by ?? undefined,
    handledAt: row.handled_at ?? undefined,
    at: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

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
  if (filters.status) {
    clauses.push(`LOWER(TRIM(status)) = LOWER(TRIM($${i++}))`);
    params.push(String(filters.status));
  }
  if (filters.submittedByUid) {
    clauses.push(`submitted_by_uid = $${i++}`);
    params.push(String(filters.submittedByUid));
  }
  if (filters.q) {
    const q = `%${String(filters.q).trim().toLowerCase()}%`;
    clauses.push(
      `(LOWER(COALESCE(member_email, '')) LIKE $${i} OR LOWER(COALESCE(contact, '')) LIKE $${i} OR LOWER(COALESCE(message, '')) LIKE $${i} OR LOWER(COALESCE(district, '')) LIKE $${i})`
    );
    params.push(q);
    i += 1;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params, nextIndex: i };
}

/** GET /api/complaints/mine — logged-in member: own complaints */
router.get('/mine', async (req, res) => {
  try {
    const uid = req.user?.id;
    const email = req.user?.email ? String(req.user.email).trim().toLowerCase() : null;
    if (!uid && !email) {
      return res.status(400).json({ error: 'User identity required' });
    }

    const result = await pool.query(
      `SELECT ${COMPLAINT_COLUMNS}
       FROM abgp.complaints
       WHERE submitted_by_uid = $1
          OR ($2::text IS NOT NULL AND LOWER(member_email) = LOWER($2))
       ORDER BY created_at DESC
       LIMIT 200`,
      [uid, email]
    );
    return res.json({ complaints: result.rows.map(toComplaint) });
  } catch (err) {
    console.error('Complaints mine error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** GET /api/complaints/prant/list — prant (or director): complaints for prant */
router.get('/prant/list', requireDirectorOrPrant, async (req, res) => {
  try {
    const isDirector = req.user?.role === 'director';
    const prantKey = isDirector
      ? req.query.prant ? String(req.query.prant).trim() : null
      : normalizePrantKey(req.user?.prant);

    if (!isDirector && !prantKey) {
      return res.status(400).json({ error: 'Prant not configured for this account' });
    }

    const page = Math.max(parseInt(String(req.query.page), 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize), 10) || 25, 1), 100);
    const offset = (page - 1) * pageSize;

    const filters = {
      from: req.query.from ? String(req.query.from).slice(0, 10) : undefined,
      to: req.query.to ? String(req.query.to).slice(0, 10) : undefined,
      category: req.query.category ? String(req.query.category).trim() : undefined,
      status: req.query.status ? String(req.query.status).trim() : undefined,
      q: req.query.q ? String(req.query.q).trim().slice(0, 100) : undefined,
      prant: prantKey || undefined,
    };

    const { where, params, nextIndex } = buildComplaintsFilter(filters);

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM abgp.complaints ${where}`,
      params
    );
    const total = countResult.rows[0]?.total || 0;

    const rowsResult = await pool.query(
      `SELECT ${COMPLAINT_COLUMNS}
       FROM abgp.complaints
       ${where}
       ORDER BY created_at DESC
       LIMIT $${nextIndex} OFFSET $${nextIndex + 1}`,
      [...params, pageSize, offset]
    );

    return res.json({
      complaints: rowsResult.rows.map(toComplaint),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (err) {
    console.error('Complaints prant list error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** POST /api/complaints — any authenticated user submits a complaint */
router.post('/', async (req, res) => {
  try {
    const {
      memberEmail,
      contact,
      category,
      formData,
      message,
      state,
      district,
      assignedPrantKey,
      attachments,
    } = req.body || {};

    const categoryVal = category ? String(category).trim() : '';
    if (!categoryVal) {
      return res.status(400).json({ error: 'category is required' });
    }

    const stateVal = state ? String(state).trim() : '';
    const districtVal = district ? String(district).trim() : '';
    if (!stateVal || !districtVal) {
      return res.status(400).json({ error: 'state and district are required' });
    }

    let prantKey = assignedPrantKey ? normalizePrantKey(assignedPrantKey) : '';
    const mappedPrant = getPrantForStateDistrict(stateVal, districtVal);
    if (mappedPrant) {
      prantKey = mappedPrant;
    }
    if (!prantKey || prantKey === 'unknown') {
      return res.status(400).json({ error: 'Could not assign prant for this district' });
    }

    const emailVal =
      (memberEmail ? String(memberEmail).trim() : '') ||
      (req.user?.email ? String(req.user.email).trim() : '') ||
      null;
    const contactVal = contact ? String(contact).trim() : null;
    const messageVal = message ? String(message).trim() : null;
    const uid = req.user?.id || null;

    const insertResult = await pool.query(
      `INSERT INTO abgp.complaints (
         member_email, contact, category, form_data, message,
         assigned_prant_key, state, district, status, attachments, submitted_by_uid
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'submitted', '[]'::jsonb, $9)
       RETURNING id`,
      [
        emailVal,
        contactVal,
        categoryVal,
        formData && typeof formData === 'object' ? JSON.stringify(formData) : null,
        messageVal,
        prantKey,
        stateVal,
        districtVal,
        uid,
      ]
    );

    const complaintId = insertResult.rows[0].id;
    let attachmentMeta = [];
    try {
      attachmentMeta = await saveComplaintAttachments(complaintId, attachments);
    } catch (attachErr) {
      await pool.query('DELETE FROM abgp.complaints WHERE id = $1', [complaintId]);
      return res.status(400).json({ error: attachErr.message || 'Invalid attachments' });
    }

    const finalResult = await pool.query(
      `UPDATE abgp.complaints
       SET attachments = $2::jsonb, updated_at = NOW()
       WHERE id = $1
       RETURNING ${COMPLAINT_COLUMNS}`,
      [complaintId, JSON.stringify(attachmentMeta)]
    );

    return res.status(201).json({ complaint: toComplaint(finalResult.rows[0]) });
  } catch (err) {
    console.error('Complaint add error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** PATCH /api/complaints/:id — prant or director updates status / notes */
router.patch('/:id', requireDirectorOrPrant, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, prantNotes } = req.body || {};

    const existing = await pool.query(
      `SELECT id, assigned_prant_key, status FROM abgp.complaints WHERE id = $1`,
      [id]
    );
    if (!existing.rows.length) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const row = existing.rows[0];
    const isDirector = req.user?.role === 'director';
    if (!isDirector) {
      const userPrant = normalizePrantKey(req.user?.prant);
      if (normalizePrantKey(row.assigned_prant_key) !== userPrant) {
        return res.status(403).json({ error: 'Not allowed for this prant' });
      }
    }

    const updates = [];
    const params = [id];
    let i = 2;

    if (status !== undefined) {
      const nextStatus = String(status).trim().toLowerCase();
      if (!COMPLAINT_STATUSES.has(nextStatus)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      if (!isDirector && !PRANT_ALLOWED_STATUSES.has(nextStatus)) {
        return res.status(403).json({ error: 'Prant cannot set this status' });
      }
      updates.push(`status = $${i++}`);
      params.push(nextStatus);
      updates.push(`handled_by = $${i++}`);
      params.push(req.user?.email || req.user?.id || 'staff');
      updates.push('handled_at = NOW()');
    }

    if (prantNotes !== undefined) {
      updates.push(`prant_notes = $${i++}`);
      params.push(prantNotes ? String(prantNotes).trim() : null);
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    updates.push('updated_at = NOW()');

    const result = await pool.query(
      `UPDATE abgp.complaints SET ${updates.join(', ')} WHERE id = $1 RETURNING ${COMPLAINT_COLUMNS}`,
      params
    );

    return res.json({ complaint: toComplaint(result.rows[0]) });
  } catch (err) {
    console.error('Complaint patch error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** GET /api/complaints/files/:complaintId/:fileName — download attachment (auth required) */
router.get('/files/:complaintId/:fileName', async (req, res) => {
  try {
    const { complaintId, fileName } = req.params;
    const existing = await pool.query(
      `SELECT id, assigned_prant_key, submitted_by_uid, member_email, attachments
       FROM abgp.complaints WHERE id = $1`,
      [complaintId]
    );
    if (!existing.rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }

    const row = existing.rows[0];
    const role = req.user?.role;
    const uid = req.user?.id;
    const email = req.user?.email ? String(req.user.email).toLowerCase() : '';
    const isOwner =
      (uid && row.submitted_by_uid === uid) ||
      (email && row.member_email && String(row.member_email).toLowerCase() === email);
    const isPrant =
      role === 'prant' &&
      normalizePrantKey(row.assigned_prant_key) === normalizePrantKey(req.user?.prant);
    const isDirector = role === 'director';

    if (!isOwner && !isPrant && !isDirector) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const diskPath = resolveAttachmentPath(complaintId, fileName);
    if (!diskPath) {
      return res.status(404).json({ error: 'File not found' });
    }

    const attachments = Array.isArray(row.attachments) ? row.attachments : [];
    const meta = attachments.find((a) => a.url && a.url.endsWith(`/${fileName}`));
    if (meta?.mimeType) {
      res.setHeader('Content-Type', meta.mimeType);
    }
    return res.sendFile(path.resolve(diskPath));
  } catch (err) {
    console.error('Complaint file error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** GET /api/complaints/admin/list — Director */
router.get('/admin/list', requireDirector, async (req, res) => {
  try {
    const { from, to, category, prant, status, q } = req.query || {};
    const filters = {
      from: from ? String(from).slice(0, 10) : undefined,
      to: to ? String(to).slice(0, 10) : undefined,
      category: category ? String(category).trim() : undefined,
      prant: prant ? String(prant).trim() : undefined,
      status: status ? String(status).trim() : undefined,
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

    const rowsResult = await pool.query(
      `SELECT ${COMPLAINT_COLUMNS}
       FROM abgp.complaints
       ${where}
       ORDER BY created_at DESC
       LIMIT $${nextIndex} OFFSET $${nextIndex + 1}`,
      [...params, pageSize, offset]
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
    const statusesResult = await pool.query(
      `SELECT DISTINCT TRIM(status) AS status
       FROM abgp.complaints
       WHERE status IS NOT NULL AND TRIM(status) <> ''
       ORDER BY status ASC`
    );

    return res.json({
      complaints: rowsResult.rows.map(toComplaint),
      filter_options: {
        categories: categoriesResult.rows.map((r) => r.category).filter(Boolean),
        prants: prantsResult.rows.map((r) => r.prant).filter(Boolean),
        statuses: statusesResult.rows.map((r) => r.status).filter(Boolean),
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
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireDirector, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM abgp.complaints WHERE id = $1', [id]);
    return res.status(204).end();
  } catch (err) {
    console.error('Complaint delete error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

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

const COMPLAINTS_EXPORT_ROW_LIMIT = 20000;

router.get('/admin/export', requireDirector, async (req, res) => {
  try {
    const { from, to, category, prant, status, q } = req.query || {};
    const filters = {
      from: from ? String(from).slice(0, 10) : undefined,
      to: to ? String(to).slice(0, 10) : undefined,
      category: category ? String(category).trim() : undefined,
      prant: prant ? String(prant).trim() : undefined,
      status: status ? String(status).trim() : undefined,
      q: q ? String(q).trim().slice(0, 100) : undefined,
    };

    const { where, params, nextIndex } = buildComplaintsFilter(filters);
    const result = await pool.query(
      `SELECT ${COMPLAINT_COLUMNS}
       FROM abgp.complaints
       ${where}
       ORDER BY created_at DESC
       LIMIT $${nextIndex}`,
      [...params, COMPLAINTS_EXPORT_ROW_LIMIT]
    );

    const headers = [
      'Date',
      'Status',
      'Category',
      'State',
      'District',
      'Member Email',
      'Contact',
      'Assigned Prant',
      'Message',
      'Details',
    ];
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
          row.status,
          row.category,
          row.state,
          row.district,
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
