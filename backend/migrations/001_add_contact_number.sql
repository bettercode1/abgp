-- Add contact_number to users (for prant Name/Number in dashboard).
-- Run if schema was applied before this column existed:
--   psql -U postgres -d your_database_name -f migrations/001_add_contact_number.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50) NULL;

COMMENT ON COLUMN users.contact_number IS 'Prant contact phone; Director can edit in dashboard.';
