-- Prant/Director activity posts for the public Activities page (gallery + approval workflow).
--   psql "$DATABASE_URL" -f backend/migrations/011_activities.sql

CREATE TABLE IF NOT EXISTS abgp.activities (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  category          VARCHAR(30) NOT NULL
                    CHECK (category IN ('jagaran', 'andolan', 'sanghatan', 'margadarshan')),
  owner_type        VARCHAR(20) NOT NULL
                    CHECK (owner_type IN ('director', 'prant')),
  prant_key         VARCHAR(80),
  submitted_by_email VARCHAR(255),
  images            JSONB NOT NULL DEFAULT '[]'::jsonb,
  videos            JSONB NOT NULL DEFAULT '[]'::jsonb,
  event_date        DATE,
  location          VARCHAR(255),
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at       TIMESTAMPTZ,
  approved_by_email VARCHAR(255),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abgp_activities_status_created
  ON abgp.activities (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_abgp_activities_category_status
  ON abgp.activities (category, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_abgp_activities_prant_status
  ON abgp.activities (prant_key, status, created_at DESC)
  WHERE prant_key IS NOT NULL;

DROP TRIGGER IF EXISTS activities_updated_at ON abgp.activities;
CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON abgp.activities
  FOR EACH ROW EXECUTE FUNCTION abgp.set_updated_at();

COMMENT ON TABLE abgp.activities IS 'Tagged activity/event posts; prant posts require director approval.';
