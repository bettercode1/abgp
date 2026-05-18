/**
 * Server-side email validation (mirrors frontend rules).
 */
const DISPOSABLE_DOMAIN_KEYWORDS = ['tempmail', 'mailinator', '10minutemail', 'yopmail'];

const BLOCKED_DOMAINS = new Set([
  'gmiallll.com',
  'outlookkk.net',
  'mailinator.com',
  'yopmail.com',
  '10minutemail.com',
  'tempmail.com',
]);

const EMAIL_LOCAL_RE = /^[a-z0-9]+(?:\.[a-z0-9]+)*$/;
const EMAIL_RE = /^[a-z0-9]+(?:\.[a-z0-9]+)*@[a-z]+\.[a-z]+(\.[a-z]+)?$/;

const SUSPICIOUS_LOCAL_PATTERNS = [
  /^test\d*$/,
  /^user\d*$/,
  /^admin\d*$/,
  /^demo\d*$/,
  /^abc\d{6,}$/,
  /\d{8,}/,
  /^(qwerty|asdfgh|zxcvbn|password|111111|123456|1234567890|abcdef)$/,
];

function parseEmailParts(email) {
  const trimmed = String(email).trim().toLowerCase();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return null;
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (!local || !domain) return null;
  return { local, domain, full: trimmed };
}

function isBlockedDomain(domain) {
  const d = domain.toLowerCase();
  if (BLOCKED_DOMAINS.has(d)) return true;
  return DISPOSABLE_DOMAIN_KEYWORDS.some((kw) => d.includes(kw));
}

function isSuspiciousLocal(local) {
  return SUSPICIOUS_LOCAL_PATTERNS.some((re) => re.test(local));
}

function validateEmailAddress(email) {
  const trimmed = email ? String(email).trim().toLowerCase() : '';
  if (!trimmed) return 'email is required';

  const parts = parseEmailParts(trimmed);
  if (!parts) {
    return 'email format is invalid (use name@domain.com)';
  }

  if (!EMAIL_LOCAL_RE.test(parts.local) || parts.local.endsWith('.')) {
    return 'email local part may only use a-z, 0-9, and periods';
  }

  if (!EMAIL_RE.test(trimmed)) {
    return 'email format is invalid (use name@domain.com)';
  }

  if (isBlockedDomain(parts.domain)) {
    return 'temporary or blocked email domains are not allowed';
  }

  if (isSuspiciousLocal(parts.local)) {
    return 'please use a personal email address, not a test or automated pattern';
  }

  return null;
}

module.exports = { validateEmailAddress, EMAIL_RE };
