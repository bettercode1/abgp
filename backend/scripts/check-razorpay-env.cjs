/**
 * Check Razorpay env vars without printing secrets.
 * Usage: node scripts/check-razorpay-env.cjs
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

console.log('backend/.env path:', path.join(__dirname, '../.env'));
console.log('root .env path:', path.join(__dirname, '../../.env'));
console.log('RAZORPAY_KEY_ID length:', keyId.length);
console.log('RAZORPAY_KEY_ID prefix:', keyId ? keyId.slice(0, 12) + '…' : '(empty)');
console.log('RAZORPAY_KEY_SECRET set:', keySecret.length >= 8);
console.log(
  'Key ID format OK:',
  /^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId) && !/REPLACE_ME/i.test(keyId)
);
