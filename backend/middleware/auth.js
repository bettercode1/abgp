/**
 * JWT auth middleware. Attach after login; expects Authorization: Bearer <token>.
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'abgp-dev-secret-change-in-production';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email, role, prant }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
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

module.exports = { JWT_SECRET, requireAuth, requireDirector, requireDirectorOrPrant };
