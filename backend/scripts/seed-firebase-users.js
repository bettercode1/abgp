/**
 * Seed Firebase Auth users with custom claims (director / prant roles).
 *
 * Usage (from backend folder):
 *   node scripts/seed-firebase-users.js
 *   node scripts/seed-firebase-users.js path/to/firebase-users.json
 *
 * JSON format (see data/firebase-users.example.json):
 * [
 *   { "email": "director@abgpindia.com", "password": "...", "role": "director" },
 *   { "email": "prant-gujarat@abgpindia.com", "password": "...", "role": "prant", "prant": "gujarat" }
 * ]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const {
  isFirebaseConfigured,
  getAuth,
  setUserClaims,
  normalizePrantKey,
} = require('../lib/firebaseAdmin');

const defaultDataPath = path.join(__dirname, '..', 'data', 'firebase-users.json');

async function upsertUser(auth, entry) {
  const email = String(entry.email || '').trim().toLowerCase();
  const password = String(entry.password || '');
  const role = String(entry.role || '').trim();
  const prant = entry.prant ? normalizePrantKey(entry.prant) : undefined;

  if (!email || !password) {
    throw new Error(`Missing email or password for entry: ${JSON.stringify(entry)}`);
  }
  if (role !== 'director' && role !== 'prant') {
    throw new Error(`Invalid role "${role}" for ${email}`);
  }
  if (role === 'prant' && !prant) {
    throw new Error(`Prant role requires "prant" key for ${email}`);
  }

  let user;
  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password });
    console.log('Updated password:', email);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
    user = await auth.createUser({ email, password, emailVerified: true });
    console.log('Created:', email);
  }

  const claims = role === 'prant' ? { role, prant } : { role };
  await setUserClaims(user.uid, claims);
  console.log('  claims:', claims);
}

async function main() {
  if (!isFirebaseConfigured()) {
    console.error('Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in backend/.env');
    console.error('Or set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file.');
    process.exit(1);
  }

  const dataPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultDataPath;
  if (!fs.existsSync(dataPath)) {
    console.error(`User list not found: ${dataPath}`);
    console.error('Copy backend/data/firebase-users.example.json to backend/data/firebase-users.json and fill in users.');
    process.exit(1);
  }

  const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!Array.isArray(users) || users.length === 0) {
    console.error('firebase-users.json must be a non-empty array.');
    process.exit(1);
  }

  const auth = getAuth();
  for (const entry of users) {
    await upsertUser(auth, entry);
  }

  console.log(`Done. Seeded ${users.length} user(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
