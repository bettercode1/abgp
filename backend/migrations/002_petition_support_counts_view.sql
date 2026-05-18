-- Supporter counts derived from abgp.petition_supports (one row per supporter with name/phone).
-- Optional: the API falls back to an equivalent inline COUNT if this view is not deployed.
--   psql "$DATABASE_URL" -f backend/migrations/002_petition_support_counts_view.sql
--
-- If you previously created the draft petition_mail_sends table, drop it (not needed with the view approach):
DROP TABLE IF EXISTS abgp.petition_mail_sends;

CREATE OR REPLACE VIEW abgp.v_petition_support_counts AS
SELECT petition_id, COUNT(*)::int AS support_count
FROM abgp.petition_supports
GROUP BY petition_id;

COMMENT ON VIEW abgp.v_petition_support_counts IS 'Per-petition COUNT(*) from petition_supports; join from petitions for public counts.';
