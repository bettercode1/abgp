/**
 * ABGP Backend API client.
 * Uses VITE_API_URL from .env when set (e.g. production/VPS); otherwise localhost for local dev.
 * All requests use API_BASE and automatically include Authorization: Bearer <token> from Supabase session when available.
 */
import { getSupabase } from './supabase';

const RAW_API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
// Dev: empty VITE_API_URL → relative /api (Vite proxy → backend:3001).
// Prod: set VITE_API_URL to your API host, e.g. https://api.yourdomain.com
const API_BASE = RAW_API_BASE
  ? RAW_API_BASE.endsWith('/api')
    ? RAW_API_BASE
    : `${RAW_API_BASE}/api`
  : '/api';

export interface ApiMember {
  id: string;
  email: string;
  name?: string;
  role: string;
  prant?: string;
  isNewMember: boolean;
  addedAt: string;
}

export interface ApiPetition {
  petition_id: string;
  recipient_email: string;
  subject: string;
  email_body: string;
  created_at: string;
  cc_emails?: string;
  bcc_emails?: string;
  duration_from?: string;
  duration_to?: string;
  attachments?: { name: string; url: string }[];
  /** COUNT(*) from petition_supports (exposed via v_petition_support_counts or inline subquery). */
  support_count?: number;
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

export interface ApiContent {
  section: string;
  content: {
    images: any[];
    texts: any[];
    videos: any[];
  };
  ownerType: 'director' | 'prant';
  prantKey?: string;
  updatedAt?: string;
}

export async function fetchContentViaApi(
  token: string,
  section: string,
  ownerType?: 'director' | 'prant',
  prantKey?: string
): Promise<ApiContent> {
  let url = `${API_BASE}/content?section=${section}`;
  if (ownerType) url += `&owner_type=${ownerType}`;
  if (prantKey) url += `&prant_key=${prantKey}`;
  return fetchJson<ApiContent>(url, token, {}, false);
}

export async function saveContentViaApi(
  token: string,
  section: string,
  content: any
): Promise<ApiContent> {
  return fetchJson<ApiContent>(`${API_BASE}/content`, token, {
    method: 'PUT',
    body: JSON.stringify({ section, content }),
  }, true);
}

export async function deleteContentViaApi(
  token: string,
  section: string
): Promise<void> {
  await fetchJson<void>(`${API_BASE}/content?section=${section}`, token, {
    method: 'DELETE',
  }, true);
}

export interface ApiComplaint {
  id: string;
  memberEmail?: string;
  contact?: string;
  category?: string;
  formData?: any;
  message?: string;
  at: string;
}

export async function fetchComplaintsFromApi(token: string, memberEmail?: string): Promise<ApiComplaint[]> {
  let url = `${API_BASE}/complaints`;
  if (memberEmail) url += `?member_email=${encodeURIComponent(memberEmail)}`;
  const data = await fetchJson<{ complaints: ApiComplaint[] }>(url, token, {}, true);
  return data.complaints;
}

export async function addComplaintViaApi(
  token: string,
  data: {
    memberEmail?: string;
    contact?: string;
    category?: string;
    formData?: any;
    message?: string;
  }
): Promise<ApiComplaint> {
  const res = await fetchJson<{ complaint: ApiComplaint }>(`${API_BASE}/complaints`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
  return res.complaint;
}

export async function deleteComplaintViaApi(token: string, id: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/complaints/${id}`, token, {
    method: 'DELETE',
  }, true);
}

export async function fetchPetitionsFromApi(): Promise<ApiPetition[]> {
  return fetchJson<ApiPetition[]>(`${API_BASE}/petitions`, null, {}, false);
}

export async function fetchPetitionDetailFromApi(id: string): Promise<ApiPetition> {
  return fetchJson<ApiPetition>(`${API_BASE}/petitions/${id}`, null, {}, false);
}

export type PetitionWritePayload = {
  recipientEmail: string;
  subject: string;
  emailBody: string;
  ccEmails?: string;
  bccEmails?: string;
  durationFrom?: string;
  durationTo?: string;
  attachments?: { name: string; url: string }[];
};

export async function createPetitionViaApi(
  token: string,
  data: PetitionWritePayload
): Promise<ApiPetition> {
  return fetchJson<ApiPetition>(`${API_BASE}/petitions`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}

export async function updatePetitionViaApi(
  token: string,
  id: string,
  data: PetitionWritePayload
): Promise<ApiPetition> {
  return fetchJson<ApiPetition>(`${API_BASE}/petitions/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, true);
}

export async function addPetitionSupportViaApi(
  petitionId: string,
  data: { fullName: string; phoneNo: string }
): Promise<any> {
  return fetchJson<any>(`${API_BASE}/petitions/${petitionId}/support`, null, {
    method: 'POST',
    body: JSON.stringify(data),
  }, false);
}

export async function deletePetitionViaApi(token: string, id: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/petitions/${id}`, token, { method: 'DELETE' }, true);
}

export interface ApiPrantAnnualReport {
  reportId: string;
  prantKey: string;
  submittedByEmail?: string;
  title: string;
  notes?: string;
  pdfUrl: string;
  createdAt: string;
}

export async function fetchPrantAnnualReportsViaApi(token: string): Promise<ApiPrantAnnualReport[]> {
  const data = await fetchJson<{ reports: ApiPrantAnnualReport[] }>(`${API_BASE}/prant-annual-reports`, token, {}, true);
  return Array.isArray(data.reports) ? data.reports : [];
}

export async function submitPrantAnnualReportViaApi(
  token: string,
  body: { title: string; notes?: string; pdfData: string }
): Promise<ApiPrantAnnualReport> {
  const data = await fetchJson<{ report: ApiPrantAnnualReport }>(`${API_BASE}/prant-annual-reports`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  }, true);
  return data.report;
}

// ─── Payment APIs ──────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  full_name: string;
  gender: string;
  enrollment_remark?: string;
  state: string;
  district: string;
  prant: string;
  location_details: string;
  phone_no: string;
  email: string;
}

export interface MembershipFeeResponse {
  amount_paise: number;
  amount_inr: number;
  currency: string;
}

export interface CreateOrderResponse {
  /** Razorpay Key ID (public) — same key used to create the order on the server */
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  amount_inr: number;
}

export async function getMembershipFee(): Promise<MembershipFeeResponse> {
  return fetchJson<MembershipFeeResponse>(`${API_BASE}/payment/membership-fee`, null);
}

export async function createPaymentOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  return fetchJson<CreateOrderResponse>(`${API_BASE}/payment/create-order`, null, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface MembershipStatus {
  active: boolean;
  renewRequired: boolean;
  payment_date: string | null;
  expires_at: string | null;
  days_remaining: number;
}

export interface MemberLoginResponse {
  ok: boolean;
  member: {
    full_name: string;
    email: string;
    phone_no: string;
    source: string;
    state: string;
    district: string;
    prant: string;
    found_in_payments?: boolean;
    found_in_existing_members?: boolean;
  };
  membership: MembershipStatus;
  renew_required: boolean;
}

export interface MemberLookupMatch {
  full_name: string;
  email: string;
  phone_no: string;
  source: string;
  state: string;
  district: string;
  prant: string;
  found_in_payments?: boolean;
  found_in_existing_members?: boolean;
  membership: MembershipStatus;
}

export interface MemberLoginLookupResponse {
  ok: boolean;
  matches: MemberLookupMatch[];
}

export async function memberLoginApi(email: string, phone: string): Promise<MemberLoginResponse> {
  return fetchJson<MemberLoginResponse>(`${API_BASE}/auth/member/login`, null, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), phone }),
  });
}

export async function memberLoginLookupApi(data: {
  email?: string;
  phone?: string;
}): Promise<MemberLoginLookupResponse> {
  return fetchJson<MemberLoginLookupResponse>(`${API_BASE}/auth/member/login-lookup`, null, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createRenewalOrder(email: string, phone: string): Promise<CreateOrderResponse> {
  return fetchJson<CreateOrderResponse>(`${API_BASE}/payment/create-renewal-order`, null, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), phone }),
  });
}

export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean; membership?: MembershipStatus }> {
  return fetchJson<{ success: boolean; membership?: MembershipStatus }>(`${API_BASE}/payment/verify-payment`, null, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function recordPaymentFailed(data: {
  razorpay_order_id: string;
  razorpay_payment_id?: string;
}): Promise<{ recorded: boolean }> {
  return fetchJson<{ recorded: boolean }>(`${API_BASE}/payment/payment-failed`, null, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Donation APIs ─────────────────────────────────────────────────────────────

export interface CreateDonationOrderPayload {
  donation_amount: number;
  first_name: string;
  last_name: string;
  father_or_spouse_name: string;
  phone_no: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  pincode: string;
  pan: string;
}

export interface CreateDonationOrderResponse extends CreateOrderResponse {
  donation_id: string;
}

export async function createDonationOrder(
  payload: CreateDonationOrderPayload
): Promise<CreateDonationOrderResponse> {
  return fetchJson<CreateDonationOrderResponse>(`${API_BASE}/donation/create-order`, null, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyDonationPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean; donation_id?: string }> {
  return fetchJson<{ success: boolean; donation_id?: string }>(
    `${API_BASE}/donation/verify-payment`,
    null,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function recordDonationPaymentFailed(data: {
  razorpay_order_id: string;
  razorpay_payment_id?: string;
}): Promise<{ recorded: boolean }> {
  return fetchJson<{ recorded: boolean }>(`${API_BASE}/donation/payment-failed`, null, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface DbMembershipPayment {
  id: number;
  full_name: string;
  gender?: string;
  enrollment_remark?: string | null;
  member_type?: 'NEW' | 'EXISTING' | string;
  state: string;
  district: string;
  prant: string;
  location_details: string;
  phone_no: string;
  email: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  payment_status: string;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface RazorpayPaymentSummary {
  payment_id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  email: string | null;
  contact: string | null;
  created_at: number;
}

export interface MembershipPaymentsOverview {
  database: DbMembershipPayment[];
  razorpay: RazorpayPaymentSummary[];
  dashboard_url: string;
}

export async function fetchMembershipPaymentsOverview(
  token: string
): Promise<MembershipPaymentsOverview> {
  return fetchJson<MembershipPaymentsOverview>(`${API_BASE}/payment/admin/overview`, token);
}
