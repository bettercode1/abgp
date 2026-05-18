/**
 * Indian mobile number validation (mirrors frontend rules).
 */
const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;

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

function isRepeatedDigitPhone(phone) {
  return /^(\d)\1{9}$/.test(phone);
}

function validatePhoneNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');

  if (digits.length !== 10) {
    return 'phone_no must be exactly 10 digits';
  }

  if (!/^[6-9]/.test(digits)) {
    return 'phone_no must start with 6, 7, 8, or 9';
  }

  if (BLOCKED_PHONE_NUMBERS.has(digits) || isRepeatedDigitPhone(digits)) {
    return 'please enter a valid personal mobile number';
  }

  if (!INDIAN_PHONE_RE.test(digits)) {
    return 'phone_no is not a valid Indian mobile number';
  }

  return null;
}

module.exports = { validatePhoneNumber, INDIAN_PHONE_RE };
