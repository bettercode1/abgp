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
  const { data, error } = await supabase
    .from('user_roles')
    .select('role, prant, email')
    .eq('id', userId)
    .single();
  if (error || !data) return { role: null, prant: null, email: null };
  return {
    role: data.role ?? null,
    prant: data.prant ?? null,
    email: data.email ?? null,
  };
}

/**
 * List all prant rows from Supabase user_roles (role = 'prant').
 * @returns {Promise<Array<{ prantKey: string, email: string }>>}
 */
async function listPrantUserRoles() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('user_roles')
    .select('prant, email')
    .eq('role', 'prant')
    .not('prant', 'is', null)
    .order('prant');
  if (error || !data) return [];
  return data.map((row) => ({ prantKey: row.prant, email: row.email ?? '' }));
}

/**
 * Get Supabase auth user id for a prant key (from user_roles).
 * @param {string} prantKey
 * @returns {Promise<string | null>} auth user uuid or null
 */
async function getAuthUserIdByPrant(prantKey) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_roles')
    .select('id')
    .eq('role', 'prant')
    .eq('prant', prantKey)
    .single();
  if (error || !data) return null;
  return data.id;
}

module.exports = { getSupabaseAdmin, getUserRoleAndPrant, listPrantUserRoles, getAuthUserIdByPrant };
