-- Pincode for new member registration (run once on existing DB)
ALTER TABLE abgp.payments
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(6);
