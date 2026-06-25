/**
 * ABGP API server – auth, complaints, content, prants (director/prant focus; no members table).
 */
const path = require('path');
// backend/.env first; root .env fills only variables not already set (no override)
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { requireAuth, requireDirector, requireDirectorOrPrant } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const complaintsRouter = require('./routes/complaints');
const contentRouter = require('./routes/content');
const membersRouter = require('./routes/members');
const prantsRouter = require('./routes/prants');
const petitionsRouter = require('./routes/petitions');
const prantAnnualReportsRouter = require('./routes/prantAnnualReports');
const paymentRouter = require('./payment/paymentRoutes');
const donationRouter = require('./donation/donationRoutes');
const memberAuthRouter = require('./member/memberAuthRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth/test', (req, res) => res.json({ message: 'Auth route is working' }));
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // For now, return a 410 to match the previous behavior, but ensure it's a JSON response
  res.status(410).json({
    error: 'Login is via Supabase. Use the app login page with your Supabase account.',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/auth', memberAuthRouter);

app.use('/api/complaints', requireAuth, requireDirector, complaintsRouter);
app.use('/api/content', contentRouter);
app.use('/api/members', membersRouter); 
app.use('/api/prants', requireAuth, requireDirector, prantsRouter);
app.use('/api/petitions', petitionsRouter);
app.use('/api/prant-annual-reports', requireAuth, prantAnnualReportsRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/donation', donationRouter);

app.get('/', (req, res) => res.json({
  name: 'ABGP API',
  health: '/health',
  api: '/api/auth, /api/content, /api/complaints, /api/members, /api/prants, /api/prant-annual-reports, /api/payment, /api/donation',
}));
function getDatabaseLabel() {
  try {
    const u = new URL(process.env.DATABASE_URL || '');
    return `${u.hostname}:${u.port || 5432}/${(u.pathname || '').replace(/^\//, '')}`;
  } catch {
    return 'unknown';
  }
}

app.get('/health', async (req, res) => {
  try {
    const { pool } = require('./db');
    const dbCheck = await pool.query(
      `SELECT current_database() AS db,
              (SELECT COUNT(*)::int FROM abgp.payments) AS payments,
              (SELECT COUNT(*)::int FROM abgp.donations) AS donations`
    );
    const row = dbCheck.rows[0] || {};
    return res.json({
      ok: true,
      database: 'connected',
      database_name: row.db,
      database_target: getDatabaseLabel(),
      payments_row_count: row.payments,
      donations_row_count: row.donations,
      payment_api: '/api/payment/health',
      donation_api: '/api/donation/health',
    });
  } catch (err) {
    const missingDonations = err && err.code === '42P01';
    return res.status(503).json({
      ok: false,
      database: missingDonations ? 'connected (donations table missing)' : 'disconnected',
      database_target: getDatabaseLabel(),
      error: err.code || err.message,
      migration_hint: missingDonations
        ? 'Run backend/migrations/008_donations_table.sql on the database.'
        : undefined,
    });
  }
});

function getDatabaseHostHint() {
  try {
    const u = new URL(process.env.DATABASE_URL);
    return `${u.hostname}:${u.port || 5432}`;
  } catch {
    return 'see DATABASE_URL in backend/.env';
  }
}

async function logDatabaseStatus() {
  try {
    const { pool } = require('./db');
    await pool.query('SELECT 1');
    console.log(`Database: connected (${getDatabaseHostHint()})`);
  } catch (err) {
    console.error(`Database: NOT CONNECTED (${getDatabaseHostHint()}) — ${err.message}`);
    console.error('  → Start local PostgreSQL, or run an SSH tunnel if you use the VPS database.');
    console.error('  → Example tunnel: ssh -L 5432:127.0.0.1:5432 user@your-vps-ip');
  }
}

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keyMode = keyId.startsWith('rzp_live_')
    ? 'live'
    : keyId.startsWith('rzp_test_')
      ? 'test'
      : 'not configured';
  console.log(`ABGP API listening on http://0.0.0.0:${PORT}`);
  console.log(`Razorpay: ${keyMode} key loaded (${keyId ? keyId.slice(0, 12) + '…' : 'missing'})`);
  logDatabaseStatus();
});
