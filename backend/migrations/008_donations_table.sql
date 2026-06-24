-- Donation form submissions (Payment Details form + Razorpay). Run once on DB.
-- Fields match src/pages/DonatePage.tsx

CREATE TABLE IF NOT EXISTS abgp.donations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Form fields
  donation_amount         NUMERIC(12, 2) NOT NULL,
  first_name              VARCHAR(100) NOT NULL,
  last_name               VARCHAR(100) NOT NULL,
  father_or_spouse_name   VARCHAR(200) NOT NULL,
  phone_country_code      VARCHAR(5) NOT NULL DEFAULT '+91',
  phone_no                VARCHAR(10) NOT NULL,
  email                   VARCHAR(255) NOT NULL,
  address_line1           TEXT NOT NULL,
  address_line2           TEXT,
  city                    VARCHAR(100) NOT NULL,
  pincode                 VARCHAR(6) NOT NULL,
  pan                     VARCHAR(10) NOT NULL,

  -- Razorpay / payment tracking
  razorpay_order_id       VARCHAR(255),
  razorpay_payment_id     VARCHAR(255),
  razorpay_signature      TEXT,
  currency                VARCHAR(10) NOT NULL DEFAULT 'INR',
  payment_status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  payment_date            TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_donations_razorpay_order_id
  ON abgp.donations (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donations_email
  ON abgp.donations (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_donations_phone
  ON abgp.donations (phone_no);

CREATE INDEX IF NOT EXISTS idx_donations_created_at
  ON abgp.donations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_donations_payment_status
  ON abgp.donations (payment_status);

DROP TRIGGER IF EXISTS donations_updated_at ON abgp.donations;
CREATE TRIGGER donations_updated_at
  BEFORE UPDATE ON abgp.donations
  FOR EACH ROW
  EXECUTE PROCEDURE abgp.set_updated_at();

COMMENT ON TABLE abgp.donations IS 'Donation form submissions from /donate (Akhil Bhartiya Grahak Panchayat)';
COMMENT ON COLUMN abgp.donations.donation_amount IS 'Amount in INR rupees as entered on the form';
COMMENT ON COLUMN abgp.donations.phone_country_code IS 'Country dial code shown on form (IN +91)';
COMMENT ON COLUMN abgp.donations.payment_status IS 'PENDING | SUCCESS | FAILED';
