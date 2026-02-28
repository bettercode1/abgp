/**
 * Auth middleware: verify Supabase JWT (Bearer token), then load role/prant from Supabase user_roles.
 * Frontend sends the Supabase session access_token in Authorization: Bearer <token>.
 */
const jwt = require('jsonwebtoken');
const { getUserRoleAndPrant } = require('../lib/supabaseAdmin');

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  if (!SUPABASE_JWT_SECRET) {
    return res.status(503).json({ error: 'Server auth not configured' });
  }
  let payload;
  try {
    payload = jwt.verify(token, SUPABASE_JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const userId = payload.sub;
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  getUserRoleAndPrant(userId)
    .then(({ role, prant, email }) => {
      req.user = {
        id: userId,
        email: email || payload.email || null,
        role: role || 'member',
        prant: prant ?? undefined,
      };
      next();
    })
    .catch((err) => {
      console.error('user_roles lookup error:', err);
      res.status(500).json({ error: 'Server error' });
    });
}

function requireDirector(req, res, next) {
  if (req.user?.role !== 'director') {
    return res.status(403).json({ error: 'Director only' });
  }
  next();
}

function requireDirectorOrPrant(req, res, next) {
  if (req.user?.role !== 'director' && req.user?.role !== 'prant') {
    return res.status(403).json({ error: 'Director or Prant only' });
  }
  next();
}

module.exports = { requireAuth, requireDirector, requireDirectorOrPrant };
