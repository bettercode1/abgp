/** Shared validation for new member registration form */

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;
export type GenderOption = (typeof GENDER_OPTIONS)[number];

export const FULL_NAME_PATTERN = /^[\u0900-\u097Fa-zA-Z]+(?:[\s\u0900-\u097Fa-zA-Z]+)*$/;

/** India mobile: 10 digits, starts with 6–9 */
export const INDIAN_PHONE_PATTERN = /^[6-9]\d{9}$/;

const BLOCKED_PHONE_NUMBERS = new Set([
  '9999999999',
  '8888888888',
  '7777777777',
  '6666666666',
  '5555555555',
  '4444444444',
  '3333333333',
  '2222222222',
  '1111111111',
  '0000000000',
  '1234567890',
  '0123456789',
]);

export type PhoneValidationError = 'length' | 'start' | 'fake' | 'repeated';

/** Local: a-z, 0-9, dots (no leading/trailing/consecutive). Domain: a-z, 1–2 dots */
export const EMAIL_LOCAL_PATTERN = /^[a-z0-9]+(?:\.[a-z0-9]+)*$/;
export const EMAIL_PATTERN = /^[a-z0-9]+(?:\.[a-z0-9]+)*@[a-z]+\.[a-z]+(\.[a-z]+)?$/;

const DISPOSABLE_DOMAIN_KEYWORDS = ['tempmail', 'mailinator', '10minutemail', 'yopmail'];

const BLOCKED_DOMAINS = new Set([
  'gmiallll.com',
  'outlookkk.net',
  'mailinator.com',
  'yopmail.com',
  '10minutemail.com',
  'tempmail.com',
]);

const COMMON_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.in',
  'outlook.com',
  'hotmail.com',
  'rediffmail.com',
  'icloud.com',
  'live.com',
];

const DOMAIN_TYPO_MAP: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmailcom': 'gmail.com',
  'gmail.co': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outlookcom': 'outlook.com',
};

const SUSPICIOUS_LOCAL_PATTERNS: RegExp[] = [
  /^test\d*$/,
  /^user\d*$/,
  /^admin\d*$/,
  /^demo\d*$/,
  /^abc\d{6,}$/,
  /\d{8,}/,
  /^(qwerty|asdfgh|zxcvbn|password|111111|123456|1234567890|abcdef)$/,
];

export type EmailValidationError =
  | 'format'
  | 'blocked'
  | 'suspicious'
  | 'typo';

export interface EmailValidationResult {
  valid: boolean;
  error?: EmailValidationError;
  suggestion?: string;
}

export function sanitizeFullNameInput(value: string): string {
  return value.replace(/[^\u0900-\u097Fa-zA-Z\s]/g, '');
}

export function isValidFullName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && FULL_NAME_PATTERN.test(trimmed);
}

export function isValidGender(value: string): value is GenderOption {
  return GENDER_OPTIONS.includes(value as GenderOption);
}

function isRepeatedDigitPhone(phone: string): boolean {
  return /^(\d)\1{9}$/.test(phone);
}

export interface PhoneValidationResult {
  valid: boolean;
  error?: PhoneValidationError;
}

export function validatePhone(value: string): PhoneValidationResult {
  const phone = value.replace(/\D/g, '');

  if (phone.length !== 10) {
    return { valid: false, error: 'length' };
  }

  if (!/^[6-9]/.test(phone)) {
    return { valid: false, error: 'start' };
  }

  if (BLOCKED_PHONE_NUMBERS.has(phone) || isRepeatedDigitPhone(phone)) {
    return { valid: false, error: phone.match(/^(\d)\1{9}$/) ? 'repeated' : 'fake' };
  }

  if (!INDIAN_PHONE_PATTERN.test(phone)) {
    return { valid: false, error: 'start' };
  }

  return { valid: true };
}

export function isValidPhone(value: string): boolean {
  return validatePhone(value).valid;
}

export function getPhoneErrorMessage(
  result: PhoneValidationResult,
  t: (key: string) => string
): string {
  switch (result.error) {
    case 'length':
      return t('login.phoneLengthInvalid');
    case 'start':
      return t('login.phoneStartInvalid');
    case 'fake':
      return t('login.phoneFakeInvalid');
    case 'repeated':
      return t('login.phoneRepeatedInvalid');
    default:
      return t('login.phoneInvalid');
  }
}

/** Red border only after blur (not while typing) */
export function shouldShowPhoneFieldError(phone: string, touched: boolean): boolean {
  if (!touched) return false;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return true;
  return !validatePhone(phone).valid;
}

export function shouldShowEmailFieldError(email: string, touched: boolean): boolean {
  if (!touched) return false;
  const trimmed = email.trim();
  if (trimmed.length === 0) return true;
  return !validateEmail(email).valid;
}

export function sanitizeEmailInput(value: string): string {
  const lower = value.toLowerCase();
  const atIndex = lower.indexOf('@');

  if (atIndex === -1) {
    return sanitizeEmailLocalPart(lower);
  }

  const local = sanitizeEmailLocalPart(lower.slice(0, atIndex));
  const domainRaw = lower.slice(atIndex + 1).replace(/@/g, '');
  const domain = sanitizeEmailDomainPart(domainRaw);

  return `${local}@${domain}`;
}

function sanitizeEmailLocalPart(local: string): string {
  let cleaned = local.replace(/[^a-z0-9.]/g, '');
  cleaned = cleaned.replace(/\.{2,}/g, '.');
  cleaned = cleaned.replace(/^\.+/, '');
  return cleaned;
}

function sanitizeEmailDomainPart(domain: string): string {
  const cleaned = domain.replace(/[^a-z.]/g, '');
  let dotCount = 0;
  let result = '';
  for (const ch of cleaned) {
    if (ch === '.') {
      if (dotCount >= 2) continue;
      if (result.length === 0 || result.endsWith('.')) continue;
      dotCount += 1;
    }
    result += ch;
  }
  return result;
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function parseEmailParts(email: string): { local: string; domain: string } | null {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return null;
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (!local || !domain) return null;
  return { local, domain };
}

function isBlockedDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  if (BLOCKED_DOMAINS.has(d)) return true;
  return DISPOSABLE_DOMAIN_KEYWORDS.some((kw) => d.includes(kw));
}

function isSuspiciousLocal(local: string): boolean {
  return SUSPICIOUS_LOCAL_PATTERNS.some((re) => re.test(local));
}

/** Suggest corrected full email (e.g. user@gmial.com → user@gmail.com) */
export function getEmailSuggestion(email: string): string | null {
  const parts = parseEmailParts(email);
  if (!parts) return null;

  const { local, domain } = parts;
  const normalizedDomain = domain.replace(/\.$/, '');

  if (DOMAIN_TYPO_MAP[normalizedDomain]) {
    return `${local}@${DOMAIN_TYPO_MAP[normalizedDomain]}`;
  }

  let best: string | null = null;
  let bestDist = 3;
  for (const candidate of COMMON_DOMAINS) {
    if (normalizedDomain === candidate) return null;
    const dist = levenshtein(normalizedDomain, candidate);
    if (dist > 0 && dist < bestDist && normalizedDomain.length >= 4) {
      bestDist = dist;
      best = candidate;
    }
  }

  return best ? `${local}@${best}` : null;
}

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed.includes('@')) {
    return { valid: false, error: 'format' };
  }

  const parts = parseEmailParts(trimmed);
  if (!parts) {
    return { valid: false, error: 'format' };
  }

  const { local, domain } = parts;

  if (!EMAIL_LOCAL_PATTERN.test(local) || local.endsWith('.')) {
    return { valid: false, error: 'format' };
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return { valid: false, error: 'format' };
  }

  if (isBlockedDomain(domain)) {
    return { valid: false, error: 'blocked' };
  }

  if (isSuspiciousLocal(local)) {
    return { valid: false, error: 'suspicious' };
  }

  const suggestion = getEmailSuggestion(trimmed);
  if (suggestion && suggestion !== trimmed) {
    return { valid: false, error: 'typo', suggestion };
  }

  return { valid: true };
}

export function isValidEmail(email: string): boolean {
  return validateEmail(email).valid;
}

export function getEmailErrorMessage(
  result: EmailValidationResult,
  t: (key: string, opts?: Record<string, string>) => string
): string {
  switch (result.error) {
    case 'blocked':
      return t('login.emailBlocked');
    case 'suspicious':
      return t('login.emailSuspicious');
    case 'typo':
      return t('login.emailTypo', { email: result.suggestion ?? '' });
    default:
      return t('login.emailInvalid');
  }
}
