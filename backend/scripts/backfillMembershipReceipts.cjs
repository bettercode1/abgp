/**
 * One-off backfill: send the ABGP welcome email + PDF receipt to everyone who
 * completed a SUCCESS membership payment on/after a given date but never
 * received the email (e.g. paid before this feature was deployed).
 *
 * Safe to re-run: skips anyone with receipt_email_sent_at already set.
 *
 * Usage:
 *   node scripts/backfillMembershipReceipts.cjs --from=2026-08-01 --dry-run
 *   node scripts/backfillMembershipReceipts.cjs --from=2026-08-01                (uses safe default limit, see DEFAULT_LIMIT below)
 *   node scripts/backfillMembershipReceipts.cjs --from=2026-08-01 --limit=80    (send only the next 80 unsent, run daily)
 *   node scripts/backfillMembershipReceipts.cjs --from=2026-08-01 --limit=3     (small sanity-check batch)
 *
 * Note: membership@abgpindia.in is a newly created GoDaddy/Titan mailbox, which
 * has a temporary reduced sending limit (observed to fail around ~95/day while
 * new). DEFAULT_LIMIT is set below that ceiling as a safety net in case --limit
 * is forgotten. The script also auto-stops early if it detects repeated
 * "exceeded a sending limit" throttling from the SMTP server, so remaining
 * rows are left unsent (and untouched) for tomorrow's run instead of wasting
 * time hammering a throttled mailbox.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../db');
const { isSmtpConfigured } = require('../payment/receiptConfig');
const { sendMembershipReceiptIfNeeded } = require('../payment/sendMembershipReceipt');

const DEFAULT_LIMIT = 80;
const CONSECUTIVE_FAILURE_STOP_THRESHOLD = 3;

function parseArgs(argv) {
  const args = { from: '2026-08-01', dryRun: false, delayMs: 1500, limit: DEFAULT_LIMIT };
  for (const arg of argv) {
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg.startsWith('--from=')) args.from = arg.slice('--from='.length);
    else if (arg.startsWith('--delay-ms=')) args.delayMs = parseInt(arg.slice('--delay-ms='.length), 10) || 1500;
    else if (arg.startsWith('--limit=')) args.limit = parseInt(arg.slice('--limit='.length), 10) || DEFAULT_LIMIT;
    else if (arg === '--no-limit') args.limit = null;
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { from, dryRun, delayMs, limit } = parseArgs(process.argv.slice(2));

  if (!dryRun && !isSmtpConfigured()) {
    console.error('SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) — aborting.');
    process.exit(1);
  }

  console.log(`Backfilling membership welcome emails for SUCCESS payments from ${from} onward...`);
  console.log(dryRun ? 'Mode: DRY RUN (no emails will be sent)' : 'Mode: LIVE (emails will be sent)');
  if (limit) console.log(`Batch limit: ${limit} email(s) this run`);

  const limitClause = limit ? `LIMIT ${limit}` : '';
  const result = await pool.query(
    `SELECT id, full_name, email, member_type, razorpay_order_id, payment_date, created_at
     FROM abgp.payments
     WHERE UPPER(payment_status) = 'SUCCESS'
       AND COALESCE(payment_date, created_at) >= $1::date
       AND receipt_email_sent_at IS NULL
       AND razorpay_order_id IS NOT NULL
     ORDER BY COALESCE(payment_date, created_at) ASC, id ASC
     ${limitClause}`,
    [from]
  );

  const rows = result.rows;
  console.log(`Matched ${rows.length} payment(s) eligible for this run.\n`);

  if (rows.length === 0) {
    await pool.end();
    return;
  }

  if (dryRun) {
    rows.forEach((r, idx) => {
      const when = (r.payment_date || r.created_at) instanceof Date
        ? (r.payment_date || r.created_at).toISOString()
        : String(r.payment_date || r.created_at);
      console.log(
        `${idx + 1}. id=${r.id} order=${r.razorpay_order_id} name="${r.full_name}" email=${r.email} type=${r.member_type} date=${when}`
      );
    });
    console.log(`\nDry run complete. ${rows.length} email(s) would be sent. Re-run without --dry-run to send for real.`);
    await pool.end();
    return;
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  let consecutiveSendFailures = 0;
  let stoppedEarly = false;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    process.stdout.write(`[${i + 1}/${rows.length}] order=${row.razorpay_order_id} email=${row.email} ... `);
    try {
      const outcome = await sendMembershipReceiptIfNeeded(row.razorpay_order_id);
      if (outcome.sent) {
        sent += 1;
        consecutiveSendFailures = 0;
        console.log('sent');
      } else {
        skipped += 1;
        console.log(`skipped (${outcome.reason || 'unknown'})`);
        if (outcome.reason === 'send_failed') {
          consecutiveSendFailures += 1;
        } else {
          consecutiveSendFailures = 0;
        }
      }
    } catch (err) {
      failed += 1;
      consecutiveSendFailures += 1;
      console.log(`FAILED (${err instanceof Error ? err.message : err})`);
    }

    if (consecutiveSendFailures >= CONSECUTIVE_FAILURE_STOP_THRESHOLD) {
      console.log(
        `\nStopping early after ${consecutiveSendFailures} consecutive send failures — likely SMTP throttling ` +
          '(e.g. "exceeded a sending limit"). Remaining rows are untouched and will be retried on the next run.'
      );
      stoppedEarly = true;
      break;
    }

    if (i < rows.length - 1) {
      await sleep(delayMs);
    }
  }

  console.log('\n--- Backfill summary ---');
  console.log(`Total matched: ${rows.length}`);
  console.log(`Sent:          ${sent}`);
  console.log(`Skipped:       ${skipped}`);
  console.log(`Failed:        ${failed}`);
  if (stoppedEarly) {
    console.log('Stopped early: yes (SMTP throttling detected)');
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Backfill script crashed:', err);
  process.exit(1);
});
