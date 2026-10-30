-- Jejak sumber yang sudah diperiksa dalam pengesahan saldo Bank Sampah.
-- Tambahan murni; tidak mengubah jurnal lama atau mutasi yang telah disahkan.
CREATE TABLE IF NOT EXISTS treasury_bank_source_coverage (
 source_id TEXT PRIMARY KEY,
 event_id TEXT NOT NULL REFERENCES treasury_events(id),
 fund_id TEXT NOT NULL,
 captured_amount_rp INTEGER NOT NULL,
 captured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_treasury_bank_coverage_fund ON treasury_bank_source_coverage(fund_id, captured_at);
