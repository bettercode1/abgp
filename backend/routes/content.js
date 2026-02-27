/**
 * Content API (Director / Prant): get by section, upsert.
 * Director: owner_type=director, prant_key=null. Prant: owner_type=prant, prant_key=<prant>.
 */
const express = require('express');
const { pool } = require('../db');

const router = express.Router();
const SECTIONS = ['history', 'blog', 'news', 'videos', 'gallery', 'home'];

function toContent(row) {
  return {
    id: row.id,
    section: row.section,
    ownerType: row.owner_type,
    prantKey: row.prant_key ?? undefined,
    content: row.content ?? { images: [], texts: [], videos: [] },
    updatedAt: row.updated_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const { section, owner_type: ownerType, prant_key: prantKey } = req.query;
    if (!section || !SECTIONS.includes(section)) {
      return res.status(400).json({ error: 'Valid section required' });
    }
    const ot = ownerType || (req.user?.role === 'prant' ? 'prant' : 'director');
    const pk = ot === 'prant' ? (prantKey || req.user?.prant) : null;
    const result = await pool.query(
      `SELECT id, section, owner_type, prant_key, content, updated_at
       FROM content WHERE section = $1 AND owner_type = $2 AND (($3::text IS NULL AND prant_key IS NULL) OR prant_key = $3)`,
      [section, ot, pk]
    );
    if (result.rows.length === 0) {
      return res.json({
        section,
        ownerType: ot,
        prantKey: pk ?? undefined,
        content: { images: [], texts: [], videos: [] },
      });
    }
    res.json(toContent(result.rows[0]));
  } catch (err) {
    console.error('Content get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { section, content: contentPayload } = req.body || {};
    if (!section || !SECTIONS.includes(section)) {
      return res.status(400).json({ error: 'Valid section required' });
    }
    const ownerType = req.user?.role === 'prant' ? 'prant' : 'director';
    const prantKey = ownerType === 'prant' ? req.user?.prant : null;
    if (ownerType === 'prant' && section !== 'news') {
      return res.status(403).json({ error: 'Prant can only edit News section' });
    }
    const content = contentPayload && typeof contentPayload === 'object'
      ? contentPayload
      : { images: [], texts: [], videos: [] };
    const existing = await pool.query(
      'SELECT id FROM content WHERE section = $1 AND owner_type = $2 AND (($3::text IS NULL AND prant_key IS NULL) OR prant_key = $3)',
      [section, ownerType, prantKey || null]
    );
    let row;
    if (existing.rows.length > 0) {
      const up = await pool.query(
        'UPDATE content SET content = $1::jsonb, updated_at = NOW() WHERE id = $2 RETURNING id, section, owner_type, prant_key, content, updated_at',
        [JSON.stringify(content), existing.rows[0].id]
      );
      row = up.rows[0];
    } else {
      const ins = await pool.query(
        'INSERT INTO content (section, owner_type, prant_key, content) VALUES ($1, $2, $3, $4::jsonb) RETURNING id, section, owner_type, prant_key, content, updated_at',
        [section, ownerType, prantKey || null, JSON.stringify(content)]
      );
      row = ins.rows[0];
    }
    res.json(toContent(row));
  } catch (err) {
    console.error('Content put error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
