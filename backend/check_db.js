const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://myapp:Better12@localhost:5432/ABGP' });

async function check() {
  await client.connect();
  try {
    const tables = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'content'");
    console.log('--- TABLE LOCATIONS ---');
    console.log(tables.rows);
    
    // Try querying with schema if found
    if (tables.rows.length > 0) {
      const schema = tables.rows[0].table_schema;
      const res = await client.query(`SELECT section, owner_type, content, updated_at FROM "${schema}".content ORDER BY updated_at DESC`);
      console.log('--- DATABASE CONTENT ---');
      res.rows.forEach(r => {
        const imgCount = r.content.images ? r.content.images.length : 0;
        const txtCount = r.content.texts ? r.content.texts.length : 0;
        console.log(`[${r.updated_at.toISOString()}] Section: ${r.section}, Owner: ${r.owner_type}, Images: ${imgCount}, Texts: ${txtCount}`);
      });
    } else {
      console.log('No table named "content" found anywhere!');
    }
    console.log('----------------------');
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await client.end();
  }
}

check();
