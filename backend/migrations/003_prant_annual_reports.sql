-- Prant-submitted annual reports (PDF + metadata); directors list all, prants list own.
--   psql "$DATABASE_URL" -f backend/migrations/003_prant_annual_reports.sql

CREATE TABLE IF NOT EXISTS abgp.prant_annual_reports (
  report_id TEXT PRIMARY KEY,
  prant_key TEXT NOT NULL,
  submitted_by_email TEXT,
  title TEXT NOT NULL,
  notes TEXT,
  pdf_data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prant_annual_reports_prant_created
  ON abgp.prant_annual_reports (prant_key, created_at DESC);

COMMENT ON TABLE abgp.prant_annual_reports IS 'Annual report PDFs submitted by prants; visible to director.';
