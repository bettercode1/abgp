-- Membership payment records (Razorpay). Run once on DB.
CREATE TABLE IF NOT EXISTS abgp.payments (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  gender VARCHAR(20),
  enrollment_remark VARCHAR(50),
  state VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  prant VARCHAR(50) NOT NULL,
  location_details TEXT NOT NULL,
  phone_no VARCHAR(10) NOT NULL,
  email VARCHAR(100) NOT NULL,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature TEXT,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_order_id
  ON abgp.payments (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;
