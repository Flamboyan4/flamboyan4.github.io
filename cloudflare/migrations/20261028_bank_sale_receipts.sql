-- Metadata nota penjualan Bank Sampah, tambahan tanpa mengubah tabel nominal.
-- Berhubungan dengan waste_sales.sale_id; pencatatan tetap diaudit oleh Worker.
CREATE TABLE IF NOT EXISTS waste_sale_receipts (
 sale_id TEXT PRIMARY KEY,
 receipt_no TEXT NOT NULL DEFAULT '',
 evidence_url TEXT NOT NULL DEFAULT '',
 updated_by TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
