const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  try {
    console.log('Ensuring schema exists...');
    await pool.query('CREATE SCHEMA IF NOT EXISTS abgp;');
    console.log('Schema abgp ensured.');
  } catch (err) {
    console.error('Setup failed:', err);
  } finally {
    await pool.end();
  }
}

setup();
