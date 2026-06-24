const { validateEmailAddress } = require('../payment/emailValidation');
const { validatePhoneNumber } = require('../payment/phoneValidation');

const PAN_RE = /^[A-Z]{3}[PCHFAT][A-Z][0-9]{4}[A-Z]$/;
const PINCODE_RE = /^[1-9]\d{5}$/;
const NAME_RE = /^[\u0900-\u097Fa-zA-Z]+(?:[\s\u0900-\u097Fa-zA-Z]+)*$/;

const MIN_DONATION_INR = 1;
const MAX_DONATION_INR = 1000000;

function parseDonationAmount(value) {
  const n = Number(String(value).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function isValidPincode(pincode) {
  const digits = String(pincode || '').replace(/\D/g, '');
  if (!PINCODE_RE.test(digits)) return false;
  const n = parseInt(digits, 10);
  return n >= 110001 && n <= 999999;
}

function validateDonationForm(body) {
  const amountInr = parseDonationAmount(body?.donation_amount);
  if (amountInr === null) return 'donation_amount is required';
  if (amountInr < MIN_DONATION_INR) return `donation_amount must be at least ₹${MIN_DONATION_INR}`;
  if (amountInr > MAX_DONATION_INR) return `donation_amount must not exceed ₹${MAX_DONATION_INR}`;

  const firstName = body?.first_name ? String(body.first_name).trim() : '';
  const lastName = body?.last_name ? String(body.last_name).trim() : '';
  if (!firstName) return 'first_name is required';
  if (!lastName) return 'last_name is required';
  if (!NAME_RE.test(firstName)) return 'first_name must contain only letters';
  if (!NAME_RE.test(lastName)) return 'last_name must contain only letters';

  const fatherOrSpouse = body?.father_or_spouse_name
    ? String(body.father_or_spouse_name).trim()
    : '';
  if (!fatherOrSpouse) return 'father_or_spouse_name is required';

  const phoneError = validatePhoneNumber(body?.phone_no);
  if (phoneError) return phoneError;

  const emailError = validateEmailAddress(body?.email);
  if (emailError) return emailError;

  const addressLine1 = body?.address_line1 ? String(body.address_line1).trim() : '';
  if (!addressLine1) return 'address_line1 is required';

  const city = body?.city ? String(body.city).trim() : '';
  if (!city) return 'city is required';

  const pincode = body?.pincode ? String(body.pincode).replace(/\D/g, '') : '';
  if (!isValidPincode(pincode)) return 'pincode is invalid';

  const pan = body?.pan ? String(body.pan).trim().toUpperCase() : '';
  if (!pan) return 'pan is required';
  if (!PAN_RE.test(pan)) return 'pan format is invalid';

  return null;
}

module.exports = {
  parseDonationAmount,
  validateDonationForm,
  MIN_DONATION_INR,
  MAX_DONATION_INR,
};
