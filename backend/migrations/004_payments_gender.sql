-- Add gender to membership payments (run once on existing DB)
ALTER TABLE abgp.payments
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
