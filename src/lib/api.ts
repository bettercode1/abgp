/**
 * ABGP Backend API client. Uses VITE_API_URL when set.
 */
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
  : '';

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

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function isApiConfigured(): boolean {
  return Boolean(API_BASE);
}

export async function loginWithApi(email: string, password: string): Promise<LoginResponse> {
  const url = `${API_BASE}/api/auth/login`;
  return fetchJson<LoginResponse>(url, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

export async function fetchMembersFromApi(token: string): Promise<ApiMember[]> {
  const url = `${API_BASE}/api/members`;
  const data = await fetchJson<{ members: ApiMember[] }>(url, {
    headers: authHeaders(token),
  });
  return data.members;
}

export async function addMemberViaApi(
  token: string,
  data: { email: string; name?: string; role?: string; prant?: string }
): Promise<ApiMember> {
  const url = `${API_BASE}/api/members`;
  const res = await fetchJson<{ member: ApiMember }>(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.member;
}

export async function deleteMemberViaApi(token: string, id: string): Promise<void> {
  const url = `${API_BASE}/api/members/${id}`;
  await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}
