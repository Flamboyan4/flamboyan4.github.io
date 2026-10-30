-- Pusat Keuangan: pos dana dinamis + catatan pembayaran baru tanpa mengubah data lama.
CREATE TABLE IF NOT EXISTS treasury_funds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  cash_location TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);
CREATE TABLE IF NOT EXISTS treasury_receipt_observations (
  id TEXT PRIMARY KEY,
  source_kind TEXT NOT NULL CHECK(source_kind IN ('jersey','project_order')),
  source_id TEXT NOT NULL,
  fund_id TEXT NOT NULL,
  amount_rp INTEGER NOT NULL CHECK(amount_rp>0 AND amount_rp<=10000000000),
  observed_on TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_treasury_receipt_source ON treasury_receipt_observations(source_kind,source_id,observed_on);
CREATE INDEX IF NOT EXISTS idx_treasury_funds_active ON treasury_funds(active,name);
