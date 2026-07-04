/**
 * Auth middleware: verify Firebase ID token (Bearer), then read role/prant from custom claims.
 * Frontend sends the Firebase ID token in Authorization: Bearer <token>.
 */
const {
  isFirebaseConfigured,
  verifyIdToken,
  getUserRoleAndPrantFromDecoded,
} = require('../lib/firebaseAdmin');

async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);

  if (!isFirebaseConfigured()) {
    return res.status(503).json({ error: 'Server auth not configured' });
  }

  try {
    const decoded = await verifyIdToken(token);
    const { role, prant } = getUserRoleAndPrantFromDecoded(decoded);
    req.user = {
      id: decoded.uid,
      email: decoded.email || null,
      role: role || 'member',
      prant: prant ?? undefined,
    };
    next();
  } catch (err) {
    console.error('Firebase token verification failed:', err.message);
    return res.status(401).json({
      error: 'Invalid or expired token',
      details: err.message,
    });
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

module.exports = { requireAuth, requireDirector, requireDirectorOrPrant };
