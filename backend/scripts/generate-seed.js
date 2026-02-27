/**
 * Generates backend/seed-prants.sql with unique password per prant.
 * Password pattern: Prant-<prantKey>-2025 (e.g. Prant-andhra-2025)
 * Also writes backend/prant-passwords.csv with email,password for your reference.
 */
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const PRANT_KEYS = [
  'andhra', 'arunachal', 'assam', 'biharDakshin', 'biharUttar', 'chattisgarh', 'delhi', 'gujarat',
  'haryana', 'himachal', 'jammuKashmir', 'jharkhand', 'karnataka', 'kerala', 'mpMadhyabharat',
  'mpMahakaushal', 'mpMalwa', 'maharashtraDevgiri', 'maharashtraKonkan', 'madhyaMaharashtra',
  'maharashtraVidharbh', 'meghalaya', 'odishaPashchim', 'odishaPurba', 'punjab', 'rajasthanChittor',
  'rajasthanJaipur', 'rajasthanJodhpur', 'sikkim', 'tamilnaduDakshin', 'tamilnaduUttar', 'telangana',
  'upAvadh', 'upBraj', 'upGoraksha', 'upKanpur', 'upKashi', 'upMeerut', 'uttarakhand',
];

function emailFromPrant(key) {
  const slug = key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  return `prant-${slug}@abgpindia.com`;
}

function nameFromPrant(key) {
  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  return `Prant ${label}`;
}

async function main() {
  const directorPassword = 'Director-ABGP-2025';
  const directorHash = await bcrypt.hash(directorPassword, 10);

  const prantRows = [];
  const csvLines = ['email,password,prant'];

  for (let i = 0; i < PRANT_KEYS.length; i++) {
    const key = PRANT_KEYS[i];
    const password = `Prant-${key}-2025`;
    const hash = await bcrypt.hash(password, 10);
    const email = emailFromPrant(key);
    const name = nameFromPrant(key);
    const n = i + 1;
    const uuid = `b${String(n).padStart(7, '0')}-0000-0000-0000-0000000000${String(n).padStart(2, '0')}`;
    prantRows.push(`('${uuid}', '${email}', '${hash}', 'prant', '${key}', '${name}', NULL, NOW(), NOW())`);
    csvLines.push(`${email},${password},${key}`);
  }

  const sql = `-- ABGP Backend - Seed 38 Prant logins + 1 Director
-- Each account has a UNIQUE password. See prant-passwords.csv for the list.
-- Run AFTER schema.sql.

-- =============================================================================
-- 1 DIRECTOR
-- Password: Director-ABGP-2025
-- =============================================================================
INSERT INTO users (id, email, password_hash, role, prant, name, contact_number, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'director@abgpindia.com',
  '${directorHash}',
  'director',
  NULL,
  'ABGP Director',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 38 PRANT LOGINS (password pattern: Prant-<prantKey>-2025)
-- =============================================================================
INSERT INTO users (id, email, password_hash, role, prant, name, contact_number, created_at, updated_at) VALUES
${prantRows.join(',\n')}
ON CONFLICT (email) DO NOTHING;
`;

  const backendDir = path.join(__dirname, '..');
  fs.writeFileSync(path.join(backendDir, 'seed-prants.sql'), sql, 'utf8');
  fs.writeFileSync(path.join(backendDir, 'prant-passwords.csv'), csvLines.join('\n') + '\n', 'utf8');

  // Add director to CSV
  const fullCsv = ['email,password,prant', `director@abgpindia.com,${directorPassword},director`, ...csvLines.slice(1)].join('\n') + '\n';
  fs.writeFileSync(path.join(backendDir, 'prant-passwords.csv'), fullCsv, 'utf8');

  console.log('Generated seed-prants.sql and prant-passwords.csv');
  console.log('Director: director@abgpindia.com / Director-ABGP-2025');
  console.log('Prants: password = Prant-<prantKey>-2025 (e.g. Prant-gujarat-2025)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
