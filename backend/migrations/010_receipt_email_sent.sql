-- Track membership receipt welcome email (run once on DB)
ALTER TABLE abgp.payments
  ADD COLUMN IF NOT EXISTS receipt_email_sent_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_payments_receipt_email_sent
  ON abgp.payments (receipt_email_sent_at)
  WHERE receipt_email_sent_at IS NOT NULL;
