-- Historical iuran rules: add-only snapshots per payer, effective from a month.
-- Never rewrite any payment/allocation or original master record.
CREATE TABLE IF NOT EXISTS bookkeeping_payer_obligation_periods (
  payer_id TEXT NOT NULL REFERENCES bookkeeping_payers(id),
  effective_from TEXT NOT NULL,
  qty_iuran_bulanan INTEGER NOT NULL DEFAULT 0,
  qty_kebersihan INTEGER NOT NULL DEFAULT 0,
  qty_kas_lorong INTEGER NOT NULL DEFAULT 0,
  qty_arisan INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  PRIMARY KEY (payer_id, effective_from),
  CHECK(length(effective_from)=10 AND substr(effective_from,5,1)='-' AND substr(effective_from,8,3)='-01'),
  CHECK(qty_iuran_bulanan BETWEEN 0 AND 100),
  CHECK(qty_kebersihan BETWEEN 0 AND 100),
  CHECK(qty_kas_lorong BETWEEN 0 AND 100),
  CHECK(qty_arisan BETWEEN 0 AND 100)
);
CREATE INDEX IF NOT EXISTS idx_bookkeeping_obligation_periods_effective
  ON bookkeeping_payer_obligation_periods(effective_from, payer_id);
-- Take one immutable baseline from the existing master, but NEVER create an
-- artificial earlier baseline for payers who already have a dated version.
INSERT INTO bookkeeping_payer_obligation_periods
 (payer_id,effective_from,qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan,created_by)
SELECT o.payer_id,'2000-01-01',
 COALESCE(o.qty_iuran_bulanan,0),COALESCE(o.qty_kebersihan,0),
 COALESCE(o.qty_kas_lorong,0),COALESCE(o.qty_arisan,0),'baseline-migration'
FROM bookkeeping_payer_iuran_obligations o
WHERE NOT EXISTS(SELECT 1 FROM bookkeeping_payer_obligation_periods h WHERE h.payer_id=o.payer_id);
