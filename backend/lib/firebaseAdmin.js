/**
 * Firebase Admin SDK (service account) for auth verification and user management.
 * Use only on the backend; never expose service account credentials to the frontend.
 */
const admin = require('firebase-admin');

let _initialized = false;

function initFirebaseAdmin() {
  if (_initialized) return true;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    _initialized = true;
    return true;
  }

  const projectId = (process.env.FIREBASE_PROJECT_ID || '').trim();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY || '';
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n').trim();

  if (!projectId || !clientEmail || !privateKey) {
    return false;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  _initialized = true;
  return true;
}

function isFirebaseConfigured() {
  return initFirebaseAdmin();
}

function getAuth() {
  if (!initFirebaseAdmin()) return null;
  return admin.auth();
}

/**
 * @param {import('firebase-admin/auth').DecodedIdToken} decoded
 */
function getUserRoleAndPrantFromDecoded(decoded) {
  const role = decoded.role ?? null;
  const prant = decoded.prant ?? null;
  return {
    role: typeof role === 'string' ? role : null,
    prant: typeof prant === 'string' ? prant : null,
    email: decoded.email ?? null,
  };
}

async function verifyIdToken(token) {
  const auth = getAuth();
  if (!auth) throw new Error('Firebase admin not configured');
  return auth.verifyIdToken(token);
}

function normalizePrantKey(prantKey) {
  let key = String(prantKey || '').trim();
  if (key.toLowerCase().startsWith('prant-')) {
    key = key.slice(6);
  }
  return key;
}

/**
 * List all prant users from Firebase custom claims.
 * @returns {Promise<Array<{ prantKey: string, email: string, uid: string }>>}
 */
async function listPrantUserRoles() {
  const auth = getAuth();
  if (!auth) return [];

  const result = [];
  let nextPageToken;

  do {
    const list = await auth.listUsers(1000, nextPageToken);
    for (const user of list.users) {
      const claims = user.customClaims || {};
      if (claims.role !== 'prant' || !claims.prant) continue;
      const prantKey = normalizePrantKey(claims.prant);
      if (!prantKey) continue;
      result.push({
        prantKey,
        email: user.email || '',
        uid: user.uid,
      });
    }
    nextPageToken = list.pageToken;
  } while (nextPageToken);

  result.sort((a, b) => a.prantKey.localeCompare(b.prantKey));
  return result;
}

/**
 * @param {string} prantKey
 * @returns {Promise<string | null>}
 */
async function getAuthUserIdByPrant(prantKey) {
  const normalized = normalizePrantKey(prantKey);
  const prants = await listPrantUserRoles();
  const found = prants.find((p) => p.prantKey === normalized);
  return found?.uid ?? null;
}

/**
 * @param {string} uid
 * @param {{ role: string, prant?: string }} claims
 */
async function setUserClaims(uid, claims) {
  const auth = getAuth();
  if (!auth) throw new Error('Firebase admin not configured');
  await auth.setCustomUserClaims(uid, claims);
}

/**
 * @param {string} uid
 * @param {string} password
 */
async function updateUserPassword(uid, password) {
  const auth = getAuth();
  if (!auth) throw new Error('Firebase admin not configured');
  await auth.updateUser(uid, { password: String(password) });
}

module.exports = {
  isFirebaseConfigured,
  getAuth,
  verifyIdToken,
  getUserRoleAndPrantFromDecoded,
  listPrantUserRoles,
  getAuthUserIdByPrant,
  setUserClaims,
  updateUserPassword,
  normalizePrantKey,
};
