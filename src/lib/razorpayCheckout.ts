/** Shared Razorpay Checkout types and helpers (used by member register + renewal login). */

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal: { ondismiss: () => void | Promise<void> };
}

export interface RazorpayInstance {
  open: () => void;
  on: (
    event: string,
    handler: (response: RazorpayErrorResponse) => void | Promise<void>
  ) => void;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  error: {
    code?: string;
    description: string;
    reason?: string;
    source?: string;
    step?: string;
    metadata: { order_id: string; payment_id?: string };
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function logPaymentError(context: string, detail: unknown): void {
  console.error(`[ABGP Payment] ${context}`, detail);
}

export function resolveCheckoutKey(orderKeyId?: string): string | null {
  const key = orderKeyId?.trim();
  if (key && /^rzp_(test|live)_[A-Za-z0-9]+$/.test(key)) return key;
  return null;
}

export function formatRazorpayContact(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `+91${digits}` : phone.trim();
}

export function parsePaymentApiErrorMessage(err: unknown): string {
  if (err instanceof TypeError && /failed to fetch|networkerror|load failed/i.test(err.message)) {
    return 'Could not reach the payment server. Ensure the backend is running and VITE_API_URL is correct for production.';
  }
  if (!(err instanceof Error)) return 'Could not initiate payment. Please try again.';
  const raw = err.message.trim();
  if (raw.startsWith('<!DOCTYPE') || raw.startsWith('<html') || raw.includes('Cannot POST /api/')) {
    return 'Payment API is not available on the server. Deploy the latest backend, restart the API, then verify GET /api/payment/health and GET /api/donation/health return ok.';
  }
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    return parsed.error || raw;
  } catch {
    return raw;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
