-- Complaints v2: location, status workflow, attachments, handler fields.
ALTER TABLE abgp.complaints ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE abgp.complaints ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE abgp.complaints ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'submitted';
ALTER TABLE abgp.complaints ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE abgp.complaints ADD COLUMN IF NOT EXISTS submitted_by_uid VARCHAR(128);
ALTER TABLE abgp.complaints ADD COLUMN IF NOT EXISTS prant_notes TEXT;
ALTER TABLE abgp.complaints ADD COLUMN IF NOT EXISTS handled_by VARCHAR(255);
ALTER TABLE abgp.complaints ADD COLUMN IF NOT EXISTS handled_at TIMESTAMPTZ;
ALTER TABLE abgp.complaints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_abgp_complaints_status ON abgp.complaints(status);
CREATE INDEX IF NOT EXISTS idx_abgp_complaints_submitted_by_uid ON abgp.complaints(submitted_by_uid);
