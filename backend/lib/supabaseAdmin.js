/**
 * Supabase admin client (service role) for reading user_roles and auth admin.
 * Use only on the backend; never expose service role key to the frontend.
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _client = null;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  if (!_client) {
    _client = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  }
  return _client;
}

/**
 * Fetch role and prant for a Supabase user id from public.user_roles.
 * @param {string} userId - auth.users.id (uuid)
 * @returns {{ role: string | null, prant: string | null, email: string | null }}
 */
async function getUserRoleAndPrant(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { role: null, prant: null, email: null };
  let data, error;
  const res = await supabase.from('user_roles').select('role, prant, prant_key, email').eq('id', userId).single();
  data = res.data;
  error = res.error;
  if (error && data === null) {
    const fallback = await supabase.from('user_roles').select('role, prant_key, email').eq('id', userId).single();
    data = fallback.data;
    error = fallback.error;
  }
  if (error || !data) return { role: null, prant: null, email: null };
  return {
    role: data.role ?? null,
    prant: data.prant ?? data.prant_key ?? null,
    email: data.email ?? null,
  };
}

/**
 * Get auth user email by id from Supabase Auth (real login ID).
 * @param {string} userId - auth.users.id (uuid)
 * @returns {Promise<string | null>}
 */
async function getAuthUserEmailById(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !userId) return null;
  const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !user) return null;
  return user.email ?? null;
}

/**
 * List all prant rows from Supabase user_roles (role = 'prant').
 * Uses email from user_roles; if missing, fetches real email from Auth.
 * @returns {Promise<Array<{ prantKey: string, email: string }>>}
 */
async function listPrantUserRoles() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  // Support both column names: prant (legacy) or prant_key (your Supabase script)
  const { data, error } = await supabase
    .from('user_roles')
    .select('id, prant, prant_key, email')
    .eq('role', 'prant')
    .order('prant_key');
  if (error) {
    // Try prant only (legacy), or prant_key only (your schema)
    const fallbackPrant = await supabase
      .from('user_roles')
      .select('id, prant, email')
      .eq('role', 'prant')
      .not('prant', 'is', null)
      .order('prant');
    if (!fallbackPrant.error) return await buildPrantList(fallbackPrant.data);
    const fallbackPrantKey = await supabase
      .from('user_roles')
      .select('id, prant_key, email')
      .eq('role', 'prant')
      .not('prant_key', 'is', null)
      .order('prant_key');
    if (fallbackPrantKey.error) {
      console.error('[Supabase] user_roles list prant error:', fallbackPrantKey.error.message);
      return [];
    }
    return await buildPrantList(fallbackPrantKey.data);
  }
  return await buildPrantList(data);
}

async function buildPrantList(data) {
  if (!data) return [];
  const result = [];
  for (const row of data) {
    let email = '';
    if (row.id) {
      const authEmail = await getAuthUserEmailById(row.id);
      email = authEmail || '';
    }
    if (!email && row.email) email = String(row.email).trim();
    // Use prant_key (your schema) or prant (legacy)
    let prantKey = (row.prant_key ?? row.prant) ? String(row.prant_key || row.prant).trim() : '';
    if (!prantKey) continue;
    if (prantKey.toLowerCase().startsWith('prant-')) {
      prantKey = prantKey.slice(6);
    }
    result.push({ prantKey, email });
  }
  return result;
}

/**
 * Get Supabase auth user id for a prant key (from user_roles).
 * @param {string} prantKey
 * @returns {Promise<string | null>} auth user uuid or null
 */
async function getAuthUserIdByPrant(prantKey) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !prantKey) return null;
  // Try prant_key column first (your schema), then prant column (legacy)
  const { data: byPrantKey, error: err1 } = await supabase
    .from('user_roles')
    .select('id')
    .eq('role', 'prant')
    .eq('prant_key', prantKey)
    .maybeSingle();
  if (!err1 && byPrantKey) return byPrantKey.id;
  for (const key of [prantKey, `prant-${prantKey}`]) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'prant')
      .eq('prant', key)
      .maybeSingle();
    if (!error && data) return data.id;
  }
  return null;
}

module.exports = { getSupabaseAdmin, getUserRoleAndPrant, listPrantUserRoles, getAuthUserIdByPrant, getAuthUserEmailById };
