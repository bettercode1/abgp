/** Pending new-member registration (saved before Razorpay payment). */
export interface NewMemberRegistration {
  full_name: string;
  enrollment_remark: string;
  state: string;
  prant: string;
  district: string;
  location_details: string;
  phone_no: string;
  email: string;
  createdAt: string;
}

const PENDING_KEY = 'abgp-pending-member-registration';

export function savePendingMemberRegistration(data: Omit<NewMemberRegistration, 'createdAt'>): void {
  const payload: NewMemberRegistration = {
    ...data,
    createdAt: new Date().toISOString(),
  };
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload));
}

export function loadPendingMemberRegistration(): NewMemberRegistration | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NewMemberRegistration;
  } catch {
    return null;
  }
}

export function clearPendingMemberRegistration(): void {
  sessionStorage.removeItem(PENDING_KEY);
}
