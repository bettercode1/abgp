-- Admin-managed Facebook page links by state / district / zilla (run once on DB)
CREATE TABLE IF NOT EXISTS abgp.facebook_pages (
  id              SERIAL PRIMARY KEY,
  state_name      VARCHAR(100) NOT NULL,
  district        VARCHAR(100) NOT NULL,
  zilla_name      VARCHAR(150) NOT NULL,
  facebook_url    TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facebook_pages_state
  ON abgp.facebook_pages (state_name);

CREATE INDEX IF NOT EXISTS idx_facebook_pages_state_district
  ON abgp.facebook_pages (state_name, district);
