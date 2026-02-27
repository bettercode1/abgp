-- ABGP Backend - PostgreSQL Schema
-- Run this file against your database to create all tables.
-- Example: psql -U postgres -d abgp_db -f schema.sql

-- =============================================================================
-- USERS (auth: login, role, prant)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  role              VARCHAR(20) NOT NULL CHECK (role IN ('member', 'director', 'prant')),
  prant             VARCHAR(80) NULL,  -- only for role = 'prant'; e.g. 'gujarat', 'maharashtraKonkan'
  name              VARCHAR(255) NULL,
  contact_number    VARCHAR(50) NULL,   -- prant contact phone (Director-editable in dashboard)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_prant ON users(prant) WHERE prant IS NOT NULL;

-- =============================================================================
-- CONTENT (Director / Prant: images, texts, videos per section)
-- =============================================================================
CREATE TABLE IF NOT EXISTS content (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section           VARCHAR(30) NOT NULL CHECK (section IN ('history', 'blog', 'news', 'videos', 'gallery', 'home')),
  owner_type        VARCHAR(20) NOT NULL CHECK (owner_type IN ('director', 'prant')),
  prant_key         VARCHAR(80) NULL,  -- null for director; set for prant (e.g. 'gujarat')
  content           JSONB NOT NULL DEFAULT '{"images":[],"texts":[],"videos":[]}',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section, owner_type, prant_key)
);

CREATE INDEX IF NOT EXISTS idx_content_section ON content(section);
CREATE INDEX IF NOT EXISTS idx_content_prant ON content(prant_key) WHERE prant_key IS NOT NULL;

-- =============================================================================
-- COMPLAINTS (complaint form submissions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS complaints (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_email      VARCHAR(255) NULL,
  contact           VARCHAR(255) NULL,
  category          VARCHAR(50) NULL,
  form_data         JSONB NULL,
  message           TEXT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_member_email ON complaints(member_email);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);

-- =============================================================================
-- JOIN REGISTRATIONS (Petition page "Register / Join Us" form)
-- =============================================================================
CREATE TABLE IF NOT EXISTS join_registrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  phone             VARCHAR(50) NULL,
  address           TEXT NULL,
  state             VARCHAR(100) NULL,
  district          VARCHAR(100) NULL,
  city              VARCHAR(100) NULL,
  pincode           VARCHAR(20) NULL,
  message           TEXT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_join_registrations_email ON join_registrations(email);
CREATE INDEX IF NOT EXISTS idx_join_registrations_created_at ON join_registrations(created_at DESC);

-- Optional: trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS content_updated_at ON content;
CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
