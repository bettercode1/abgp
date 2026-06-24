/**
 * PostgreSQL connection pool for ABGP API.
 * Uses schema "abgp" on connect (matches VPS database).
 */
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || '';
if (dbUrl) {
  console.log('Using DB URL:', dbUrl.replace(/:[^:@]*@/, ':***@'));
} else {
  console.error('DATABASE_URL is not set in backend/.env');
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  options: '-c search_path=abgp',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message || err);
});

module.exports = { pool };
