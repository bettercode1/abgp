/**
 * One-off backfill: send the ABGP welcome email + PDF receipt to everyone who
 * completed a SUCCESS membership payment on/after a given date but never
 * received the email (e.g. paid before this feature was deployed).
 *
 * Safe to re-run: skips anyone with receipt_email_sent_at already set.
 *
 * Usage:
 *   node scripts/backfillMembershipReceipts.cjs --from=2026-08-01 --dry-run
 *   node scripts/backfillMembershipReceipts.cjs --from=2026-08-01
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../db');
const { isSmtpConfigured } = require('../payment/receiptConfig');
const { sendMembershipReceiptIfNeeded } = require('../payment/sendMembershipReceipt');

function parseArgs(argv) {
  const args = { from: '2026-08-01', dryRun: false, delayMs: 1500 };
  for (const arg of argv) {
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg.startsWith('--from=')) args.from = arg.slice('--from='.length);
    else if (arg.startsWith('--delay-ms=')) args.delayMs = parseInt(arg.slice('--delay-ms='.length), 10) || 1500;
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { from, dryRun, delayMs } = parseArgs(process.argv.slice(2));

  if (!dryRun && !isSmtpConfigured()) {
    console.error('SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) — aborting.');
    process.exit(1);
  }

  console.log(`Backfilling membership welcome emails for SUCCESS payments from ${from} onward...`);
  console.log(dryRun ? 'Mode: DRY RUN (no emails will be sent)' : 'Mode: LIVE (emails will be sent)');

  const result = await pool.query(
    `SELECT id, full_name, email, member_type, razorpay_order_id, payment_date, created_at
     FROM abgp.payments
     WHERE UPPER(payment_status) = 'SUCCESS'
       AND COALESCE(payment_date, created_at) >= $1::date
       AND receipt_email_sent_at IS NULL
       AND razorpay_order_id IS NOT NULL
     ORDER BY COALESCE(payment_date, created_at) ASC, id ASC`,
    [from]
  );

  const rows = result.rows;
  console.log(`Matched ${rows.length} payment(s) eligible for the backfill email.\n`);

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

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    process.stdout.write(`[${i + 1}/${rows.length}] order=${row.razorpay_order_id} email=${row.email} ... `);
    try {
      const outcome = await sendMembershipReceiptIfNeeded(row.razorpay_order_id);
      if (outcome.sent) {
        sent += 1;
        console.log('sent');
      } else {
        skipped += 1;
        console.log(`skipped (${outcome.reason || 'unknown'})`);
      }
    } catch (err) {
      failed += 1;
      console.log(`FAILED (${err instanceof Error ? err.message : err})`);
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

  await pool.end();
}

main().catch((err) => {
  console.error('Backfill script crashed:', err);
  process.exit(1);
});
