/**
 * Run a single SQL migration file. Usage: node scripts/run-migration.cjs migrations/005_payments_table.sql
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

const rel = process.argv[2];
if (!rel) {
  console.error('Usage: node scripts/run-migration.cjs <migration-file.sql>');
  process.exit(1);
}

const file = path.join(__dirname, '..', rel);
const sql = fs.readFileSync(file, 'utf8');

pool
  .query(sql)
  .then(() => {
    console.log('Migration applied:', rel);
    return pool.end();
  })
  .catch((err) => {
    console.error('Migration failed:', err.message);
    pool.end();
    process.exit(1);
  });
