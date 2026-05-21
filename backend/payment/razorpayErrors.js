/**
 * Normalize Razorpay SDK / API errors for API responses.
 */
function formatRazorpayError(err) {
  if (!err) return 'Payment gateway error';
  const api = err.error;
  if (api && typeof api === 'object') {
    const desc = api.description || api.reason || api.code;
    if (desc) return String(desc);
  }
  if (err.message) return String(err.message);
  return 'Payment gateway error';
}

function isRazorpayAuthError(err) {
  return err?.statusCode === 401;
}

function isRazorpayError(err) {
  return Boolean(err?.statusCode && err?.error);
}

module.exports = { formatRazorpayError, isRazorpayAuthError, isRazorpayError };
