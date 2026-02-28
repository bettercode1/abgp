-- =============================================================================
-- ABGP Backend - PostgreSQL Schema (Schema: abgp)
-- =============================================================================

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS abgp;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- PRANT PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS abgp.prant_profiles (
  prant_key         VARCHAR(80) PRIMARY KEY,
  name              VARCHAR(255),
  contact_number    VARCHAR(50),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- CONTENT
-- =============================================================================
CREATE TABLE IF NOT EXISTS abgp.content (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section           VARCHAR(30) NOT NULL 
                    CHECK (section IN ('history', 'blog', 'news', 'videos', 'gallery', 'home')),
  owner_type        VARCHAR(20) NOT NULL 
                    CHECK (owner_type IN ('director', 'prant')),
  prant_key         VARCHAR(80),
  content           JSONB NOT NULL DEFAULT '{"images":[],"texts":[],"videos":[]}',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section, owner_type, prant_key)
);

CREATE INDEX IF NOT EXISTS idx_abgp_content_section 
  ON abgp.content(section);

CREATE INDEX IF NOT EXISTS idx_abgp_content_prant 
  ON abgp.content(prant_key) 
  WHERE prant_key IS NOT NULL;

-- =============================================================================
-- COMPLAINTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS abgp.complaints (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_email      VARCHAR(255),
  contact           VARCHAR(255),
  category          VARCHAR(50),
  form_data         JSONB,
  message           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abgp_complaints_member_email 
  ON abgp.complaints(member_email);

CREATE INDEX IF NOT EXISTS idx_abgp_complaints_created_at 
  ON abgp.complaints(created_at DESC);

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION abgp.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS content_updated_at ON abgp.content;
CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON abgp.content
  FOR EACH ROW 
  EXECUTE PROCEDURE abgp.set_updated_at();

DROP TRIGGER IF EXISTS prant_profiles_updated_at ON abgp.prant_profiles;
CREATE TRIGGER prant_profiles_updated_at
  BEFORE UPDATE ON abgp.prant_profiles
  FOR EACH ROW 
  EXECUTE PROCEDURE abgp.set_updated_at();