/**
 * Activities: tagged gallery posts for /activities page.
 * Public: approved only. Director: all + approve/reject. Prant: own posts.
 */
const express = require('express');
const { pool } = require('../db');
const { requireAuth, requireDirector, requireDirectorOrPrant } = require('../middleware/auth');

const router = express.Router();

const CATEGORIES = ['jagaran', 'andolan', 'sanghatan', 'margadarshan'];
const STATUSES = ['pending', 'approved', 'rejected'];

function toActivity(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category,
    ownerType: row.owner_type,
    prantKey: row.prant_key || undefined,
    submittedByEmail: row.submitted_by_email || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    videos: Array.isArray(row.videos) ? row.videos : [],
    eventDate: row.event_date ? String(row.event_date).slice(0, 10) : undefined,
    location: row.location || undefined,
    status: row.status,
    approvedAt: row.approved_at || undefined,
    approvedByEmail: row.approved_by_email || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeMediaArray(value, maxItems = 12) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((item, index) => {
    if (typeof item === 'string') {
      return { id: `media-${index}`, url: item };
    }
    if (item && typeof item === 'object' && item.url) {
      return {
        id: String(item.id || `media-${index}`),
        url: String(item.url),
        caption: item.caption ? String(item.caption).slice(0, 500) : undefined,
        title: item.title ? String(item.title).slice(0, 255) : undefined,
      };
    }
    return null;
  }).filter(Boolean);
}

function validatePayload(body) {
  const title = body?.title ? String(body.title).trim().slice(0, 255) : '';
  if (!title) return { error: 'title is required' };
  const category = body?.category ? String(body.category).trim() : '';
  if (!CATEGORIES.includes(category)) {
    return { error: 'Valid category required (jagaran, andolan, sanghatan, margadarshan)' };
  }
  const images = normalizeMediaArray(body?.images);
  const videos = normalizeMediaArray(body?.videos);
  if (images.length === 0 && videos.length === 0) {
    return { error: 'At least one image or video is required' };
  }
  return {
    title,
    description: body?.description ? String(body.description).trim().slice(0, 5000) : '',
    category,
    images,
    videos,
    eventDate: body?.eventDate ? String(body.eventDate).slice(0, 10) : null,
    location: body?.location ? String(body.location).trim().slice(0, 255) : null,
  };
}

/** Public approved activities (optional category + prant filter). */
router.get('/public', async (req, res) => {
  try {
    const { category, prant } = req.query || {};
    const clauses = [`status = 'approved'`];
    const params = [];
    let i = 1;

    if (category) {
      if (!CATEGORIES.includes(String(category))) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      clauses.push(`category = $${i++}`);
      params.push(String(category));
    }
    if (prant) {
      clauses.push(`LOWER(TRIM(prant_key)) = LOWER(TRIM($${i++}))`);
      params.push(String(prant));
    }

    const result = await pool.query(
      `SELECT id, title, description, category, owner_type, prant_key, submitted_by_email,
              images, videos, event_date, location, status, approved_at, approved_by_email,
              created_at, updated_at
       FROM abgp.activities
       WHERE ${clauses.join(' AND ')}
       ORDER BY COALESCE(event_date, created_at::date) DESC, created_at DESC`,
      params
    );

    const prantsResult = await pool.query(
      `SELECT DISTINCT TRIM(prant_key) AS prant_key
       FROM abgp.activities
       WHERE status = 'approved' AND prant_key IS NOT NULL AND TRIM(prant_key) <> ''
       ORDER BY prant_key ASC`
    );

    res.json({
      activities: result.rows.map(toActivity),
      filterOptions: {
        prants: prantsResult.rows.map((r) => r.prant_key).filter(Boolean),
        categories: CATEGORIES,
      },
    });
  } catch (err) {
    if (err && err.code === '42P01') {
      return res.status(503).json({
        error: 'Activities table missing. Run backend/migrations/011_activities.sql',
      });
    }
    console.error('Activities public list error:', err);
    res.status(500).json({ error: 'Failed to load activities' });
  }
});

/** Authenticated list — director: all; prant: own only. */
router.get('/', requireAuth, requireDirectorOrPrant, async (req, res) => {
  try {
    const { status, category } = req.query || {};
    const clauses = [];
    const params = [];
    let i = 1;

    if (req.user.role === 'prant') {
      clauses.push(`owner_type = 'prant'`);
      clauses.push(`LOWER(TRIM(prant_key)) = LOWER(TRIM($${i++}))`);
      params.push(String(req.user.prant || ''));
    }
    if (status && STATUSES.includes(String(status))) {
      clauses.push(`status = $${i++}`);
      params.push(String(status));
    }
    if (category && CATEGORIES.includes(String(category))) {
      clauses.push(`category = $${i++}`);
      params.push(String(category));
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT id, title, description, category, owner_type, prant_key, submitted_by_email,
              images, videos, event_date, location, status, approved_at, approved_by_email,
              created_at, updated_at
       FROM abgp.activities
       ${where}
       ORDER BY created_at DESC`,
      params
    );

    res.json({ activities: result.rows.map(toActivity) });
  } catch (err) {
    if (err && err.code === '42P01') {
      return res.status(503).json({
        error: 'Activities table missing. Run backend/migrations/011_activities.sql',
      });
    }
    console.error('Activities list error:', err);
    res.status(500).json({ error: 'Failed to load activities' });
  }
});

router.post('/', requireAuth, requireDirectorOrPrant, async (req, res) => {
  try {
    const parsed = validatePayload(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const isDirector = req.user.role === 'director';
    const ownerType = isDirector ? 'director' : 'prant';
    const prantKey = isDirector ? null : String(req.user.prant || '').trim() || null;
    if (!isDirector && !prantKey) {
      return res.status(400).json({ error: 'Prant key missing on account' });
    }
    const status = isDirector ? 'approved' : 'pending';
    const submittedByEmail = req.user.email || null;
    const approvedAt = status === 'approved' ? new Date() : null;
    const approvedByEmail = status === 'approved' ? submittedByEmail : null;

    const result = await pool.query(
      `INSERT INTO abgp.activities
         (title, description, category, owner_type, prant_key, submitted_by_email,
          images, videos, event_date, location, status, approved_at, approved_by_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::date, $10, $11, $12, $13)
       RETURNING id, title, description, category, owner_type, prant_key, submitted_by_email,
                 images, videos, event_date, location, status, approved_at, approved_by_email,
                 created_at, updated_at`,
      [
        parsed.title,
        parsed.description,
        parsed.category,
        ownerType,
        prantKey,
        submittedByEmail,
        JSON.stringify(parsed.images),
        JSON.stringify(parsed.videos),
        parsed.eventDate,
        parsed.location,
        status,
        approvedAt,
        approvedByEmail,
      ]
    );

    res.status(201).json({ activity: toActivity(result.rows[0]) });
  } catch (err) {
    if (err && err.code === '42P01') {
      return res.status(503).json({
        error: 'Activities table missing. Run backend/migrations/011_activities.sql',
      });
    }
    console.error('Activities create error:', err);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

router.put('/:id', requireAuth, requireDirectorOrPrant, async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = validatePayload(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const existing = await pool.query(
      'SELECT * FROM abgp.activities WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    const row = existing.rows[0];

    if (req.user.role === 'prant') {
      const pk = String(req.user.prant || '').trim();
      if (row.owner_type !== 'prant' || String(row.prant_key || '').trim().toLowerCase() !== pk.toLowerCase()) {
        return res.status(403).json({ error: 'Not allowed to edit this activity' });
      }
      if (row.status === 'approved') {
        return res.status(403).json({ error: 'Approved activities cannot be edited. Contact the director.' });
      }
    }

    const status = req.user.role === 'director' ? row.status : 'pending';

    const result = await pool.query(
      `UPDATE abgp.activities
       SET title = $1, description = $2, category = $3, images = $4::jsonb, videos = $5::jsonb,
           event_date = $6::date, location = $7, status = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING id, title, description, category, owner_type, prant_key, submitted_by_email,
                 images, videos, event_date, location, status, approved_at, approved_by_email,
                 created_at, updated_at`,
      [
        parsed.title,
        parsed.description,
        parsed.category,
        JSON.stringify(parsed.images),
        JSON.stringify(parsed.videos),
        parsed.eventDate,
        parsed.location,
        status,
        id,
      ]
    );

    res.json({ activity: toActivity(result.rows[0]) });
  } catch (err) {
    console.error('Activities update error:', err);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

router.patch('/:id/approve', requireAuth, requireDirector, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE abgp.activities
       SET status = 'approved', approved_at = NOW(), approved_by_email = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, description, category, owner_type, prant_key, submitted_by_email,
                 images, videos, event_date, location, status, approved_at, approved_by_email,
                 created_at, updated_at`,
      [id, req.user.email || null]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json({ activity: toActivity(result.rows[0]) });
  } catch (err) {
    console.error('Activities approve error:', err);
    res.status(500).json({ error: 'Failed to approve activity' });
  }
});

router.patch('/:id/reject', requireAuth, requireDirector, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE abgp.activities
       SET status = 'rejected', approved_at = NULL, approved_by_email = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, description, category, owner_type, prant_key, submitted_by_email,
                 images, videos, event_date, location, status, approved_at, approved_by_email,
                 created_at, updated_at`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json({ activity: toActivity(result.rows[0]) });
  } catch (err) {
    console.error('Activities reject error:', err);
    res.status(500).json({ error: 'Failed to reject activity' });
  }
});

router.delete('/:id', requireAuth, requireDirectorOrPrant, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM abgp.activities WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    const row = existing.rows[0];

    if (req.user.role === 'prant') {
      const pk = String(req.user.prant || '').trim();
      if (row.owner_type !== 'prant' || String(row.prant_key || '').trim().toLowerCase() !== pk.toLowerCase()) {
        return res.status(403).json({ error: 'Not allowed to delete this activity' });
      }
    }

    await pool.query('DELETE FROM abgp.activities WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error('Activities delete error:', err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
