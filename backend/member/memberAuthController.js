const { normalizePhone, findMemberForLogin, findMembersForLoginLookup } = require('./memberAuthQueries');
const { computeMembershipStatus } = require('./memberAuthService');
const { validatePhoneNumber } = require('../payment/phoneValidation');
const { validateEmailAddress } = require('../payment/emailValidation');

function validateLoginBody(body) {
  const email = body?.email ? String(body.email).trim().toLowerCase() : '';
  const phone = normalizePhone(body?.phone);

  const emailError = validateEmailAddress(email);
  if (emailError) return emailError;

  const phoneError = validatePhoneNumber(phone);
  if (phoneError) return phoneError;

  return null;
}

function validateLookupBody(body) {
  const email = body?.email ? String(body.email).trim().toLowerCase() : '';
  const phone = normalizePhone(body?.phone);
  if (!email && !phone) {
    return 'Email or phone is required';
  }
  if (email) {
    const emailError = validateEmailAddress(email);
    if (emailError) return emailError;
  }
  if (phone) {
    const phoneError = validatePhoneNumber(phone);
    if (phoneError) return phoneError;
  }
  return null;
}

/**
 * POST /api/auth/member/login
 * Verify email + phone against payments / existing_members and membership validity.
 */
async function memberLogin(req, res) {
  try {
    const validationError = validateLoginBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const email = String(req.body.email).trim().toLowerCase();
    const phone = normalizePhone(req.body.phone);

    const member = await findMemberForLogin(email, phone);
    if (!member) {
      return res.status(404).json({
        error: 'No membership found for this email and phone. Please register as a new member.',
      });
    }

    const lastPaidAt = member.last_payment_date || member.payment_date;
    const membership = computeMembershipStatus(lastPaidAt);

    return res.json({
      ok: true,
      member: {
        full_name: member.full_name,
        email: member.email,
        phone_no: member.phone_no,
        source: member.source,
        state: member.state,
        district: member.district,
        prant: member.prant,
        found_in_payments: member.found_in_payments,
        found_in_existing_members: member.found_in_existing_members,
      },
      membership,
      renew_required: membership.renewRequired,
    });
  } catch (err) {
    console.error('[auth/member/login]', err);
    return res.status(500).json({ error: 'Member login failed' });
  }
}

/**
 * POST /api/auth/member/login-lookup
 * Find all linked member profiles by email or phone with last payment info.
 */
async function memberLoginLookup(req, res) {
  try {
    const validationError = validateLookupBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : '';
    const phone = req.body?.phone ? normalizePhone(req.body.phone) : '';
    const matches = await findMembersForLoginLookup({ email, phone });

    return res.json({
      ok: true,
      matches: matches.map((member) => ({
        full_name: member.full_name,
        email: member.email,
        phone_no: member.phone_no,
        source: member.source,
        state: member.state,
        district: member.district,
        prant: member.prant,
        found_in_payments: member.found_in_payments,
        found_in_existing_members: member.found_in_existing_members,
        membership: computeMembershipStatus(member.last_payment_date),
      })),
    });
  } catch (err) {
    console.error('[auth/member/login-lookup]', err);
    return res.status(500).json({ error: 'Member lookup failed' });
  }
}

module.exports = { memberLogin, memberLoginLookup };
