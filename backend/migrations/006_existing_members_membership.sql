-- Columns for existing member login + membership renewal (run once if table already exists)
ALTER TABLE abgp.existing_members
  ADD COLUMN IF NOT EXISTS phone_no VARCHAR(10),
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
  ADD COLUMN IF NOT EXISTS state VARCHAR(50),
  ADD COLUMN IF NOT EXISTS district VARCHAR(50),
  ADD COLUMN IF NOT EXISTS prant VARCHAR(50),
  ADD COLUMN IF NOT EXISTS location_details TEXT,
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_existing_members_email_phone
  ON abgp.existing_members (LOWER(email), phone_no);
