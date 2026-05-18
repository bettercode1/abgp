/** Allowed gender values for membership registration */
const GENDER_VALUES = ['Male', 'Female', 'Other'];

/** English letters, Devanagari (U+0900–U+097F), and spaces only */
const FULL_NAME_RE = /^[\u0900-\u097Fa-zA-Z]+(?:[\s\u0900-\u097Fa-zA-Z]+)*$/;

const { validateEmailAddress } = require('./emailValidation');
const { validatePhoneNumber } = require('./phoneValidation');

function validatePaymentForm(body) {
  const {
    full_name,
    gender,
    state,
    district,
    prant,
    location_details,
    phone_no,
    email,
  } = body;

  const name = full_name ? String(full_name).trim() : '';
  if (!name) return 'full_name is required';
  if (!FULL_NAME_RE.test(name)) {
    return 'full_name must contain only English or Devanagari letters';
  }

  const genderVal = gender ? String(gender).trim() : '';
  if (!genderVal || !GENDER_VALUES.includes(genderVal)) {
    return 'gender must be Male, Female, or Other';
  }

  if (!state || !String(state).trim()) return 'state is required';
  if (!district || !String(district).trim()) return 'district is required';
  if (!prant || !String(prant).trim()) return 'prant is required';

  if (!location_details || !String(location_details).trim()) {
    return 'address is required';
  }

  const phoneError = validatePhoneNumber(phone_no);
  if (phoneError) return phoneError;

  const emailError = validateEmailAddress(email);
  if (emailError) return emailError;

  return null;
}

module.exports = {
  GENDER_VALUES,
  FULL_NAME_RE,
  validatePaymentForm,
};
