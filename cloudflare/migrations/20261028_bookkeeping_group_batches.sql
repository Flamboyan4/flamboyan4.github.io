-- Buku Kas gabungan. Tabel tambahan; sumber pembayaran dan jurnal lama tidak dihapus.
-- UNIQUE(kind,source_id) mencegah alokasi masuk dua batch.
CREATE TABLE IF NOT EXISTS bookkeeping_group_batches (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('kas_lorong','denda_gorol')),
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  period_phase TEXT NOT NULL DEFAULT 'susulan',
  posted_on TEXT NOT NULL,
  note TEXT NOT NULL,
  amount_rp INTEGER NOT NULL,
  item_count INTEGER NOT NULL,
  cash_transaction_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'aktif',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS bookkeeping_group_items (
  kind TEXT NOT NULL CHECK(kind IN ('kas_lorong','denda_gorol')),
  source_id TEXT NOT NULL,
  batch_id TEXT NOT NULL REFERENCES bookkeeping_group_batches(id),
  payment_id TEXT NOT NULL,
  amount_rp INTEGER NOT NULL,
  PRIMARY KEY(kind,source_id)
);
CREATE INDEX IF NOT EXISTS idx_bookkeeping_group_batches_period ON bookkeeping_group_batches(kind,period_year,period_month,posted_on);
CREATE INDEX IF NOT EXISTS idx_bookkeeping_group_items_batch ON bookkeeping_group_items(batch_id);
