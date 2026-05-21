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
});

pool.on('connect', (client) => {
  client.query('SET search_path TO abgp').catch((err) => {
    console.error('CRITICAL: search_path SET failed. This usually means the connection is unstable or the schema "abgp" does not exist.', err);
  });
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = { pool };
