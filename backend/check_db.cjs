const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDb() {
  try {
    const schemas = await pool.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'abgp'");
    console.log('Schemas:', schemas.rows);
    
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'abgp'");
    console.log('Tables in abgp schema:', tables.rows);
    
    const petitionsCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'petitions' AND table_schema = 'abgp'");
    console.log('Columns in abgp.petitions:', petitionsCols.rows);
  } catch (err) {
    console.error('DB check failed:', err);
  } finally {
    await pool.end();
  }
}

checkDb();
