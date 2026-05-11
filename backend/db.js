/**
 * PostgreSQL connection pool for ABGP API.
 * Uses schema "abgp" on connect (matches VPS database).
 */
const { Pool } = require('pg');

console.log("Using DB URL:", process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@'));
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('connect', (client) => {
  client.query('SET search_path TO abgp').catch((err) => console.error('search_path SET failed:', err));
});

module.exports = { pool };
