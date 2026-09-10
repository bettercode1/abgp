/**
 * Production smoke test — read-only / unauthenticated checks only.
 * Usage: node scripts/prod-smoke-test.cjs [API_BASE]
 * Default API_BASE: https://abgpindia.in/api (falls back to http://207.180.226.196:3001/api)
 */
const API_CANDIDATES = [
  process.argv[2],
  'https://abgpindia.in/api',
  'http://207.180.226.196:3001/api',
].filter(Boolean);

const HEALTH_CANDIDATES = [
  process.argv[2]?.replace(/\/api\/?$/, '') || null,
  'https://abgpindia.in',
  'http://207.180.226.196:3001',
].filter(Boolean);

const results = [];

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
  console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(base, method, path, body, token) {
  const url = `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { _raw: text.slice(0, 200) };
  }
  return { status: res.status, json, url };
}

async function resolveApiBase() {
  for (const base of API_CANDIDATES) {
    try {
      const r = await request(base.replace(/\/api\/?$/, ''), 'GET', '/health');
      if (r.status === 200 && r.json.ok) return base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
    } catch {
      // try next
    }
  }
  for (const base of API_CANDIDATES) {
    try {
      const apiBase = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
      const r = await request(apiBase, 'GET', '/payment/health');
      if (r.status === 200) return apiBase;
    } catch {
      // try next
    }
  }
  return null;
}

async function testHealth(apiBase) {
  console.log('\n## Infrastructure');
  const root = apiBase.replace(/\/api\/?$/, '');
  try {
    const h = await request(root, 'GET', '/health');
    if (h.status === 200 && h.json.ok && h.json.database === 'connected') {
      pass('GET /health', `db=${h.json.database_name}, payments=${h.json.payments_row_count}`);
    } else {
      fail('GET /health', `status ${h.status} ${JSON.stringify(h.json).slice(0, 120)}`);
    }
  } catch (e) {
    fail('GET /health', e.message);
  }

  for (const [name, path] of [
    ['GET /api/payment/health', '/payment/health'],
    ['GET /api/donation/health', '/donation/health'],
    ['GET /api/payment/membership-fee', '/payment/membership-fee'],
  ]) {
    try {
      const r = await request(apiBase, 'GET', path);
      if (r.status >= 200 && r.status < 300) pass(name, `status ${r.status}`);
      else fail(name, `status ${r.status}`);
    } catch (e) {
      fail(name, e.message);
    }
  }
}

async function testPublicEndpoints(apiBase) {
  console.log('\n## Public endpoints (no auth)');

  const publicGets = [
    ['GET /api/content?section=news', '/content?section=news'],
    ['GET /api/petitions', '/petitions'],
    ['GET /api/activities/public', '/activities/public'],
  ];

  for (const [name, path] of publicGets) {
    try {
      const r = await request(apiBase, 'GET', path);
      if (r.status === 200) pass(name, `status ${r.status}`);
      else fail(name, `status ${r.status}`);
    } catch (e) {
      fail(name, e.message);
    }
  }

  try {
    const r = await request(apiBase, 'POST', '/auth/login', { email: 'x@y.com', password: 'x' });
    if (r.status === 410) pass('POST /api/auth/login (deprecated)', 'returns 410 as expected');
    else fail('POST /api/auth/login', `expected 410, got ${r.status}`);
  } catch (e) {
    fail('POST /api/auth/login', e.message);
  }
}

async function testAuthGuards(apiBase) {
  console.log('\n## Auth guards (expect 401 without token)');

  const protectedRoutes = [
    ['GET /api/complaints/mine', 'GET', '/complaints/mine'],
    ['GET /api/complaints/prant/list', 'GET', '/complaints/prant/list'],
    ['POST /api/complaints', 'POST', '/complaints', { category: 'food', state: 'Gujarat', district: 'Ahmedabad' }],
    ['GET /api/complaints/admin/list', 'GET', '/complaints/admin/list'],
    ['GET /api/payment/admin/overview', 'GET', '/payment/admin/overview'],
    ['GET /api/donation/admin/list', 'GET', '/donation/admin/list'],
    ['GET /api/prants', 'GET', '/prants'],
    ['GET /api/prant-annual-reports', 'GET', '/prant-annual-reports'],
    ['GET /api/activities', 'GET', '/activities'],
    ['GET /api/members', 'GET', '/members'],
    ['GET /api/auth/me', 'GET', '/auth/me'],
  ];

  for (const [name, method, path, body] of protectedRoutes) {
    try {
      const r = await request(apiBase, method, path, body);
      if (r.status === 401) pass(name, '401 Unauthorized');
      else if (r.status === 403) pass(name, '403 Forbidden (auth middleware reached)');
      else fail(name, `expected 401/403, got ${r.status}`);
    } catch (e) {
      fail(name, e.message);
    }
  }
}

async function testComplaintsValidation(apiBase) {
  console.log('\n## Complaints validation (invalid token → 401)');

  try {
    const r = await request(apiBase, 'POST', '/complaints', {
      category: 'food',
      state: 'Gujarat',
      district: 'Ahmedabad',
    }, 'invalid-token');
    if (r.status === 401) pass('POST /api/complaints invalid token', '401');
    else fail('POST /api/complaints invalid token', `status ${r.status}`);
  } catch (e) {
    fail('POST /api/complaints invalid token', e.message);
  }
}

async function testFrontend(apiBase) {
  console.log('\n## Frontend');
  for (const url of ['https://abgpindia.in/', 'https://abgpindia.in/login', 'https://abgpindia.in/panel']) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'follow' });
      if (res.status === 200) pass(`Frontend ${url}`, `status ${res.status}`);
      else fail(`Frontend ${url}`, `status ${res.status}`);
    } catch (e) {
      fail(`Frontend ${url}`, e.message);
    }
  }
}

async function main() {
  console.log('=== ABGP Production Smoke Test ===');
  const apiBase = await resolveApiBase();
  if (!apiBase) {
    fail('Resolve API base', 'Could not reach production API');
    process.exit(1);
  }
  pass('API base resolved', apiBase);

  await testHealth(apiBase);
  await testPublicEndpoints(apiBase);
  await testAuthGuards(apiBase);
  await testComplaintsValidation(apiBase);
  await testFrontend(apiBase);

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n=== Summary: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
