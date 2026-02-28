/**
 * Supabase auth helpers. Uses shared client from ./supabaseClient.
 */
import { supabase } from './supabaseClient';

const supabaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '';
const supabaseAnonKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : '';

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabase() {
  return isSupabaseConfigured() ? supabase : null;
}

export type UserRoleResult = { role: string | null; prant: string | null };

export async function getUserRoleAndPrant(userId: string): Promise<UserRoleResult> {
  const supabase = getSupabase();
  if (!supabase) return { role: null, prant: null };
  const { data, error } = await supabase
    .from('user_roles')
    .select('role, prant')
    .eq('id', userId)
    .single();
  if (error || !data) return { role: null, prant: null };
  return {
    role: data.role ?? null,
    prant: data.prant ?? null,
  };
}
