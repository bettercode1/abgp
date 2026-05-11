/**
 * ABGP API server – auth, complaints, content, prants (director/prant focus; no members table).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { requireAuth, requireDirector, requireDirectorOrPrant } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const complaintsRouter = require('./routes/complaints');
const contentRouter = require('./routes/content');
const membersRouter = require('./routes/members');
const prantsRouter = require('./routes/prants');

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

app.use('/api/complaints', requireAuth, requireDirector, complaintsRouter);
app.get('/api/content', contentRouter); // Public GET
app.use('/api/content', requireAuth, requireDirectorOrPrant, contentRouter); // Protected PUT/DELETE
// app.use('/api/members', requireAuth, requireDirector, membersRouter); // DISABLED PER REQUEST
app.use('/api/prants', requireAuth, requireDirector, prantsRouter);

app.get('/', (req, res) => res.json({ name: 'ABGP API', health: '/health', api: '/api/auth, /api/content, /api/complaints, /api/members, /api/prants' }));
app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ABGP API listening on http://0.0.0.0:${PORT}`);
});
