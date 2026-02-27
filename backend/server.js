/**
 * ABGP API server – auth, members, complaints, content, prants (dashboard).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { requireAuth, requireDirector, requireDirectorOrPrant } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const membersRouter = require('./routes/members');
const complaintsRouter = require('./routes/complaints');
const contentRouter = require('./routes/content');
const prantsRouter = require('./routes/prants');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);

app.use('/api/members', requireAuth, requireDirector, membersRouter);
app.use('/api/complaints', requireAuth, requireDirector, complaintsRouter);
app.use('/api/content', requireAuth, requireDirectorOrPrant, contentRouter);
app.use('/api/prants', requireAuth, requireDirector, prantsRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`ABGP API listening on http://localhost:${PORT}`);
});
