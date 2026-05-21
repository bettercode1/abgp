-- NEW = first-time registration via /login/member/new
-- EXISTING = renewal via existing member login
ALTER TABLE abgp.payments
  ADD COLUMN IF NOT EXISTS member_type VARCHAR(20) NOT NULL DEFAULT 'NEW';

UPDATE abgp.payments
SET member_type = 'EXISTING'
WHERE enrollment_remark = 'RENEWAL' AND member_type = 'NEW';

CREATE INDEX IF NOT EXISTS idx_payments_member_type ON abgp.payments (member_type);
