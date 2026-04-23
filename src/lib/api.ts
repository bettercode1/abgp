/**
 * ABGP Backend API client.
 * Uses VITE_API_URL from .env when set (e.g. production/VPS); otherwise localhost for local dev.
 * All requests use API_BASE and automatically include Authorization: Bearer <token> from Supabase session when available.
 */
import { getSupabase } from './supabase';

const RAW_API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
// Support both:
// - VITE_API_URL=https://host
// - VITE_API_URL=https://host/api
// so endpoint builders never produce /api/api/*
const API_BASE = RAW_API_BASE.endsWith('/api') ? RAW_API_BASE : `${RAW_API_BASE}/api`;

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
  options: RequestInit = {},
  requireAuth = false
): Promise<T> {
  // Prefer current Supabase session token so we always send a valid, up-to-date token
  const authToken = (await getAccessToken()) ?? token ?? null;
  if (requireAuth && !authToken) {
    throw new Error('Authentication required. Please log in again.');
  }

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
  const url = `${API_BASE}/auth/login`;
  return fetchJson<LoginResponse>(url, undefined, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

export async function fetchMembersFromApi(token: string): Promise<ApiMember[]> {
  const data = await fetchJson<{ members: ApiMember[] }>(`${API_BASE}/members`, token, {}, true);
  return data.members;
}

export async function addMemberViaApi(
  token: string,
  data: { email: string; name?: string; role?: string; prant?: string }
): Promise<ApiMember> {
  const res = await fetchJson<{ member: ApiMember }>(`${API_BASE}/members`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
  return res.member;
}

export async function deleteMemberViaApi(token: string, id: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/members/${id}`, token, { method: 'DELETE' }, true);
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
  const supabase = getSupabase();
  const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  const sessionToken = sessionData.session?.access_token ?? token ?? null;
  console.log(sessionToken);
  if (!sessionToken) {
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    throw new Error('Authentication required. Please log in again.');
  }
  const res = await fetch(`${API_BASE}/prants`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const responseData = (await res.json()) as { prants: ApiPrantRaw[] };
  const raw = responseData.prants ?? [];
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
  await fetchJson<void>(`${API_BASE}/prants/${prantKey}/change-password`, token, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  }, true);
}
