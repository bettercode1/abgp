-- Normalize phone_no to last 10 digits (fixes +91 prefix, spaces, and VARCHAR(10) truncation).
UPDATE abgp.payments
SET phone_no = RIGHT(REGEXP_REPLACE(COALESCE(phone_no, ''), '[^0-9]', '', 'g'), 10),
    updated_at = NOW()
WHERE phone_no IS NOT NULL
  AND LENGTH(REGEXP_REPLACE(COALESCE(phone_no, ''), '[^0-9]', '', 'g')) >= 10
  AND phone_no <> RIGHT(REGEXP_REPLACE(COALESCE(phone_no, ''), '[^0-9]', '', 'g'), 10);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'abgp' AND table_name = 'existing_members'
  ) THEN
    UPDATE abgp.existing_members
    SET phone_no = RIGHT(REGEXP_REPLACE(COALESCE(phone_no, ''), '[^0-9]', '', 'g'), 10)
    WHERE phone_no IS NOT NULL
      AND LENGTH(REGEXP_REPLACE(COALESCE(phone_no, ''), '[^0-9]', '', 'g')) >= 10
      AND phone_no <> RIGHT(REGEXP_REPLACE(COALESCE(phone_no, ''), '[^0-9]', '', 'g'), 10);
  END IF;
END $$;
