/**
 * ABGP Backend API client.
 * Uses VITE_API_URL from .env when set (e.g. production/VPS); otherwise localhost for local dev.
 * All requests use API_BASE and automatically include Authorization: Bearer <token> from Supabase session when available.
 */
import { getSupabase } from './supabase';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export interface ApiMember {
  id: string;
  email: string;
  name?: string;
  role: string;
  prant?: string;
  isNewMember: boolean;
  addedAt: string;
}

export interface LoginResponse {
  user: { id: string; email: string; role: string; prant?: string; name?: string; contactNumber?: string };
  token: string;
}

/** Get Supabase access token from current session (used when caller does not pass token). */
async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function fetchJson<T = unknown>(
  url: string,
  token?: string | null,
  options: RequestInit = {}
): Promise<T> {
  // Prefer current Supabase session token so we always send a valid, up-to-date token
  const authToken = (await getAccessToken()) ?? token ?? null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function isApiConfigured(): boolean {
  return Boolean(API_BASE);
}

export async function loginWithApi(email: string, password: string): Promise<LoginResponse> {
  const url = `${API_BASE}/api/auth/login`;
  return fetchJson<LoginResponse>(url, undefined, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

export async function fetchMembersFromApi(token: string): Promise<ApiMember[]> {
  const data = await fetchJson<{ members: ApiMember[] }>(`${API_BASE}/api/members`, token);
  return data.members;
}

export async function addMemberViaApi(
  token: string,
  data: { email: string; name?: string; role?: string; prant?: string }
): Promise<ApiMember> {
  const res = await fetchJson<{ member: ApiMember }>(`${API_BASE}/api/members`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.member;
}

export async function deleteMemberViaApi(token: string, id: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/members/${id}`, token, { method: 'DELETE' });
}

export interface ApiPrant {
  prantKey: string;
  email: string;
  name?: string;
  contactNumber?: string;
}

/** Raw shape from API may use prant_key (snake_case); we normalize to prantKey */
type ApiPrantRaw = ApiPrant & { prant_key?: string };

export async function fetchPrantsFromApi(token: string): Promise<ApiPrant[]> {
  const data = await fetchJson<{ prants: ApiPrantRaw[] }>(`${API_BASE}/api/prants`, token);
  const raw = data.prants ?? [];
  return raw.map((p) => ({
    prantKey: p.prantKey ?? p.prant_key ?? '',
    email: p.email ?? '',
    name: p.name,
    contactNumber: p.contactNumber,
  })).filter((p) => p.prantKey);
}

export async function changePrantPassword(
  token: string,
  prantKey: string,
  newPassword: string
): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/prants/${prantKey}/change-password`, token, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });
}
