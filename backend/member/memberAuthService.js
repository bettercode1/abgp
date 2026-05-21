/** Membership valid for 1 year from last successful payment_date */
const MEMBERSHIP_VALIDITY_YEARS = 1;

function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function computeMembershipStatus(paymentDate) {
  if (!paymentDate) {
    return {
      active: false,
      renewRequired: true,
      payment_date: null,
      expires_at: null,
      days_remaining: 0,
    };
  }

  const paidAt = new Date(paymentDate);
  const expiresAt = addYears(paidAt, MEMBERSHIP_VALIDITY_YEARS);
  const now = new Date();
  const active = now.getTime() <= expiresAt.getTime();
  const msLeft = expiresAt.getTime() - now.getTime();

  return {
    active,
    renewRequired: !active,
    payment_date: paidAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    days_remaining: active ? Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000))) : 0,
  };
}

module.exports = { computeMembershipStatus, MEMBERSHIP_VALIDITY_YEARS };
