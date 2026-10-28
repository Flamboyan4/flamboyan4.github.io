-- Tahap pembukuan: sumber Kas Lorong (alokasi) / Denda Gorol (jurnal per warga)
-- menjadi SATU transaksi buku kas pada tiap batch. Jurnal sumber tetap utuh.
CREATE TABLE IF NOT EXISTS bookkeeping_kas_batches (
 id TEXT PRIMARY KEY,
 request_key TEXT NOT NULL UNIQUE,
 payload_hash TEXT NOT NULL,
 category TEXT NOT NULL CHECK(category IN ('kas_lorong','denda_gorol')),
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
 category TEXT NOT NULL CHECK(category IN ('kas_lorong','denda_gorol')),
 source_id TEXT NOT NULL,
 amount_rp INTEGER NOT NULL CHECK(amount_rp>0),
 status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','dibatalkan')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_f4_kas_unique_active_source
 ON bookkeeping_kas_batch_items(category,source_id) WHERE status='aktif';
CREATE INDEX IF NOT EXISTS idx_f4_kas_by_period
 ON bookkeeping_kas_batches(category,period_year,period_month,status,booked_on);
-- Biarkan transaksi lama yang sudah tercatat tetap dihitung sampai dibatch.
-- Uang baru dari iuran pay-UUID belum masuk Buku Kas; pembayaran denda baru
-- bertipe denda_menunggu_buku. Ketika denda lama dibatch, sumbernya digantikan
-- satu baris batch, tanpa menghapus histori.
CREATE VIEW IF NOT EXISTS bookkeeping_cash_transactions_posted AS
 SELECT c.* FROM bookkeeping_cash_transactions c
 WHERE NOT (
    c.transaction_type='iuran' AND c.source_payment_id LIKE 'pay-%'
   )
   AND c.transaction_type!='denda_menunggu_buku'
   AND NOT EXISTS (
     SELECT 1 FROM bookkeeping_kas_batch_items ki
     WHERE ki.category='denda_gorol' AND ki.source_id=c.id AND ki.status='aktif'
   );
