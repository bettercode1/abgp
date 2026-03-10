/**
 * Seed Supabase with prant login IDs from ABGP_Login_Credentials (prant-*@abgpindia.com).
 * Creates Auth users and public.user_roles rows so the director dashboard shows real data.
 *
 * Usage: from backend folder, with .env set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY):
 *   node scripts/seed-supabase-prants.js
 *
 * New users get a temporary password (default: ChangeMe123!). Director can change via dashboard.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_PASSWORD = process.env.SEED_PRANT_PASSWORD || 'ChangeMe123!';

// Same 38 prant keys as frontend PRANT_KEYS (prantKeys.ts)
const PRANT_KEYS = [
  'andhra', 'arunachal', 'assam', 'biharDakshin', 'biharUttar', 'chattisgarh',
  'delhi', 'gujarat', 'haryana', 'himachal', 'jammuKashmir', 'jharkhand',
  'karnataka', 'kerala', 'mpMadhyabharat', 'mpMahakaushal', 'mpMalwa',
  'maharashtraDevgiri', 'maharashtraKonkan', 'madhyaMaharashtra', 'maharashtraVidharbh',
  'meghalaya', 'odishaPashchim', 'odishaPurba', 'punjab',
  'rajasthanChittor', 'rajasthanJaipur', 'rajasthanJodhpur', 'sikkim',
  'tamilnaduDakshin', 'tamilnaduUttar', 'telangana',
  'upAvadh', 'upBraj', 'upGoraksha', 'upKanpur', 'upKashi', 'upMeerut',
  'uttarakhand',
];

function prantKeyToEmail(prantKey) {
  const slug = prantKey.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  return `prant-${slug}@abgpindia.com`;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const emailToId = new Map();
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, per_page: perPage });
    if (error) {
      console.error('listUsers error:', error.message);
      process.exit(1);
    }
    for (const u of data.users || []) {
      if (u.email) emailToId.set(u.email.toLowerCase(), u.id);
    }
    if (!data.users?.length || data.users.length < perPage) break;
    page++;
  }

  console.log('Existing Auth users:', emailToId.size);

  for (const prantKey of PRANT_KEYS) {
    const email = prantKeyToEmail(prantKey);
    let userId = emailToId.get(email.toLowerCase());

    if (!userId) {
      const { data: user, error } = await supabase.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });
      if (error) {
        console.error(`Create ${email}:`, error.message);
        continue;
      }
      userId = user.user?.id;
      if (userId) emailToId.set(email.toLowerCase(), userId);
      console.log('Created:', email);
    }

    if (!userId) continue;

    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert(
        { id: userId, email, prant: prantKey, role: 'prant' },
        { onConflict: 'id' }
      );
    if (roleError) {
      console.error(`user_roles ${email}:`, roleError.message);
    }
  }

  console.log('Done. Prant logins use', prantKeyToEmail('andhra'), 'etc. Director can change passwords from the panel.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
