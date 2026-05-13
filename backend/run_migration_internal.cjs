const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const migrationPath = path.join(__dirname, 'migrations', '004_update_petitions_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('Running migration from:', migrationPath);
  try {
    await pool.query(sql);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
