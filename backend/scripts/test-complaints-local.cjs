/**
 * Local complaints flow test — uses PostgreSQL on localhost:5433 only (no prod deploy).
 * Usage: node scripts/test-complaints-local.cjs
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const admin = require('firebase-admin');
const { getPrantForStateDistrict } = require('../lib/stateDistrictPrant');

const LOCAL_DB = process.env.LOCAL_TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/abgp_complaints_test';
const API_BASE = process.env.LOCAL_TEST_API_URL || 'http://127.0.0.1:3002';
const FIREBASE_API_KEY = (process.env.VITE_FIREBASE_API_KEY || '').trim();

const results = [];

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
  console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function setupDatabase() {
  const adminPool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5433/postgres' });
  const dbName = 'abgp_complaints_test';
  const exists = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!exists.rows.length) {
    await adminPool.query(`CREATE DATABASE ${dbName}`);
  }
  await adminPool.end();

  const pool = new Pool({ connectionString: LOCAL_DB, options: '-c search_path=abgp' });
  await pool.query('CREATE SCHEMA IF NOT EXISTS abgp');
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS abgp.complaints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_email VARCHAR(255),
      contact VARCHAR(255),
      category VARCHAR(50),
      form_data JSONB,
      message TEXT,
      assigned_prant_key VARCHAR(80),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const mig012 = fs.readFileSync(path.join(__dirname, '../migrations/012_complaints_v2.sql'), 'utf8');
  await pool.query(mig012);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS abgp.payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
    CREATE TABLE IF NOT EXISTS abgp.donations (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
  `);

  return pool;
}

async function getIdTokenForClaims(email, claims) {
  if (!FIREBASE_API_KEY) throw new Error('VITE_FIREBASE_API_KEY missing');
  const { isFirebaseConfigured, getAuth } = require('../lib/firebaseAdmin');
  if (!isFirebaseConfigured()) throw new Error('Firebase admin not configured');

  const auth = getAuth();
  const password = `Test_${Date.now()}_x9!`;
  let user;
  try {
    user = await auth.createUser({ email, password, emailVerified: true });
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      user = await auth.getUserByEmail(email);
      await auth.updateUser(user.uid, { password });
    } else throw e;
  }
  await auth.setCustomUserClaims(user.uid, claims);

  const customToken = await auth.createCustomToken(user.uid);
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!data.idToken) throw new Error(data.error?.message || 'No idToken');
  return { idToken: data.idToken, uid: user.uid, email };
}

async function api(method, pathSuffix, token, body) {
  const res = await fetch(`${API_BASE}${pathSuffix}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

async function testPrantMapping() {
  console.log('\n1. Prant routing (state/district → prant key)');
  const cases = [
    { state: 'Gujarat', district: 'Ahmedabad', expect: 'gujarat' },
    { state: 'Delhi', district: 'Central Delhi', expect: 'delhi' },
    { state: 'Maharashtra', district: '', expect: 'maharashtraVidharbh' },
  ];
  for (const c of cases) {
    const got = getPrantForStateDistrict(c.state, c.district);
    if (got === c.expect) pass(`Map ${c.state}/${c.district || '(default)'}`, got);
    else fail(`Map ${c.state}/${c.district || '(default)'}`, `expected ${c.expect}, got ${got}`);
  }
}

async function testDatabaseFlow(pool) {
  console.log('\n2. Database insert + prant assignment');
  const prantKey = getPrantForStateDistrict('Gujarat', 'Ahmedabad');
  const insert = await pool.query(
    `INSERT INTO abgp.complaints (
       member_email, contact, category, form_data, message,
       assigned_prant_key, state, district, status, attachments, submitted_by_uid
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'submitted','[]'::jsonb,$9)
     RETURNING id, assigned_prant_key`,
    ['test@example.com', '9999999999', 'food', '{}', 'Test complaint', prantKey, 'Gujarat', 'Ahmedabad', 'test-uid-1']
  );
  const id = insert.rows[0].id;
  if (insert.rows[0].assigned_prant_key === 'gujarat') {
    pass('Complaint saved with correct prant', 'gujarat');
  } else {
    fail('Complaint prant assignment', insert.rows[0].assigned_prant_key);
  }

  const prantList = await pool.query(
    `SELECT id FROM abgp.complaints WHERE LOWER(TRIM(assigned_prant_key)) = LOWER(TRIM($1))`,
    ['gujarat']
  );
  if (prantList.rows.some((r) => r.id === id)) pass('Prant inbox query finds complaint');
  else fail('Prant inbox query');

  const adminList = await pool.query(`SELECT id, status FROM abgp.complaints ORDER BY created_at DESC LIMIT 5`);
  if (adminList.rows.some((r) => r.id === id)) pass('Admin list query finds complaint');
  else fail('Admin list query');

  await pool.query(`UPDATE abgp.complaints SET status = 'in_review', prant_notes = 'Looking into it' WHERE id = $1`, [id]);
  const updated = await pool.query(`SELECT status, prant_notes FROM abgp.complaints WHERE id = $1`, [id]);
  if (updated.rows[0]?.status === 'in_review') pass('Status update to in_review');
  else fail('Status update');

  await pool.query('DELETE FROM abgp.complaints WHERE id = $1', [id]);
}

async function testHttpApi() {
  console.log('\n3. HTTP API (local backend on :3002)');

  const health = await fetch(`${API_BASE}/health`).catch(() => null);
  if (!health?.ok && health?.status !== 200) {
    fail('Backend reachable at ' + API_BASE, health ? `status ${health.status}` : 'connection refused');
    return;
  }
  pass('Backend health check');

  const unauth = await api('GET', '/api/complaints/mine', null);
  if (unauth.status === 401) pass('Unauthenticated request rejected (401)');
  else fail('Unauthenticated request', `status ${unauth.status}`);

  const ts = Date.now();
  const memberEmail = `complaint-test-member-${ts}@test.local`;
  const prantEmail = `complaint-test-prant-${ts}@test.local`;
  const directorEmail = `complaint-test-director-${ts}@test.local`;

  let memberToken;
  let prantToken;
  let directorToken;
  try {
    memberToken = (await getIdTokenForClaims(memberEmail, { role: 'member' })).idToken;
    prantToken = (await getIdTokenForClaims(prantEmail, { role: 'prant', prant: 'gujarat' })).idToken;
    directorToken = (await getIdTokenForClaims(directorEmail, { role: 'director' })).idToken;
    pass('Firebase test tokens obtained');
  } catch (e) {
    fail('Firebase test tokens', e.message);
    return;
  }

  const submit = await api('POST', '/api/complaints', memberToken, {
    memberEmail,
    contact: '9876543210',
    category: 'food',
    formData: { outletName: 'Test Shop' },
    message: 'Automated local test complaint',
    state: 'Gujarat',
    district: 'Ahmedabad',
    attachments: [],
  });

  if (submit.status !== 201) {
    fail('Member submit complaint', `status ${submit.status} ${JSON.stringify(submit.json)}`);
    return;
  }
  const complaint = submit.json.complaint;
  if (complaint?.assignedPrantKey === 'gujarat') {
    pass('API: complaint routed to gujarat prant', complaint.id);
  } else {
    fail('API: prant routing', complaint?.assignedPrantKey);
  }

  const mine = await api('GET', '/api/complaints/mine', memberToken);
  if (mine.status === 200 && mine.json.complaints?.some((c) => c.id === complaint.id)) {
    pass('Member sees own complaint in /mine');
  } else {
    fail('Member /mine list', `status ${mine.status}`);
  }

  const prantList = await api('GET', '/api/complaints/prant/list', prantToken);
  const inPrantInbox = prantList.json.complaints?.some((c) => c.id === complaint.id);
  if (prantList.status === 200 && inPrantInbox) {
    pass('Gujarat prant sees complaint in inbox');
  } else {
    fail('Prant inbox', `status ${prantList.status}, found=${inPrantInbox}`);
  }

  const wrongPrant = await getIdTokenForClaims(`complaint-test-mp-${ts}@test.local`, {
    role: 'prant',
    prant: 'mpMalwa',
  });
  const wrongList = await api('GET', '/api/complaints/prant/list', wrongPrant.idToken);
  const inWrong = wrongList.json.complaints?.some((c) => c.id === complaint.id);
  if (wrongList.status === 200 && !inWrong) pass('Other prant does NOT see this complaint');
  else fail('Cross-prant isolation', `found=${inWrong}`);

  const patch = await api('PATCH', `/api/complaints/${complaint.id}`, prantToken, {
    status: 'in_review',
    prantNotes: 'Test note from prant',
  });
  if (patch.status === 200 && patch.json.complaint?.status === 'in_review') {
    pass('Prant updated status to in_review');
  } else {
    fail('Prant PATCH', `status ${patch.status}`);
  }

  const adminList = await api('GET', '/api/complaints/admin/list?page=1&pageSize=20', directorToken);
  const inAdmin = adminList.json.complaints?.some((c) => c.id === complaint.id);
  if (adminList.status === 200 && inAdmin) {
    pass('Director admin list includes complaint');
  } else {
    fail('Director admin list', `status ${adminList.status}, found=${inAdmin}`);
  }

  const adminPatch = await api('PATCH', `/api/complaints/${complaint.id}`, directorToken, {
    status: 'resolved',
    prantNotes: 'Closed by director test',
  });
  if (adminPatch.status === 200 && adminPatch.json.complaint?.status === 'resolved') {
    pass('Director can update status to resolved');
  } else {
    fail('Director PATCH', `status ${adminPatch.status}`);
  }

  await api('DELETE', `/api/complaints/${complaint.id}`, directorToken).catch(() => {});
}

async function main() {
  console.log('=== ABGP Complaints Local Test ===');
  console.log('DB:', LOCAL_DB.replace(/:[^:@]*@/, ':***@'));

  try {
    const pool = await setupDatabase();
    await pool.end();
    pass('Local test database ready (port 5433)');
  } catch (e) {
    fail('Database setup', e.message);
  }

  await testPrantMapping();

  try {
    const pool = await setupDatabase();
    try {
      await testDatabaseFlow(pool);
    } finally {
      await pool.end();
    }
  } catch (e) {
    fail('Database flow', e.message);
  }

  await testHttpApi();

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
