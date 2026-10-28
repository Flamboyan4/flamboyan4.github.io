-- Tahap pencatatan kas lorong: iuran warga (alokasi) -> satu jurnal batch.
-- Tabel transaksi lama tetap utuh. Baris iuran D1 individual dipertahankan untuk
-- audit namun tidak dihitung sebagai kas operasional, hanya batch yang diposting.
CREATE TABLE IF NOT EXISTS bookkeeping_kas_batches (
 id TEXT PRIMARY KEY,
 period_year INTEGER NOT NULL,
 period_month INTEGER NOT NULL,
 stage TEXT NOT NULL CHECK(stage IN ('setoran_rt','arisan','susulan')),
 booked_on TEXT NOT NULL,
 description TEXT NOT NULL,
 amount_rp INTEGER NOT NULL CHECK(amount_rp>0),
 item_count INTEGER NOT NULL CHECK(item_count>0),
 status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','dibatalkan')),
 cash_transaction_id TEXT NOT NULL UNIQUE,
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS bookkeeping_kas_batch_items (
 id TEXT PRIMARY KEY,
 batch_id TEXT NOT NULL REFERENCES bookkeeping_kas_batches(id),
 allocation_id TEXT NOT NULL,
 amount_rp INTEGER NOT NULL CHECK(amount_rp>0),
 status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','dibatalkan')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_f4_kas_unique_active_allocation
 ON bookkeeping_kas_batch_items(allocation_id) WHERE status='aktif';
CREATE INDEX IF NOT EXISTS idx_f4_kas_by_period
 ON bookkeeping_kas_batches(period_year,period_month,status,booked_on);
CREATE VIEW IF NOT EXISTS bookkeeping_cash_transactions_posted AS
 SELECT * FROM bookkeeping_cash_transactions
 WHERE NOT (transaction_type='iuran' AND source_payment_id LIKE 'pay-%');
