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
const prantsRouter = require('./routes/prants');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);

app.use('/api/complaints', requireAuth, requireDirector, complaintsRouter);
app.use('/api/content', requireAuth, requireDirectorOrPrant, contentRouter);
app.use('/api/prants', requireAuth, requireDirector, prantsRouter);

app.get('/', (req, res) => res.json({ name: 'ABGP API', health: '/health', api: '/api/auth, /api/content, /api/complaints, /api/prants' }));
app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ABGP API listening on http://0.0.0.0:${PORT}`);
});
