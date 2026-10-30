-- Pengajuan pencairan Bank Sampah: permintaan tidak mengurangi saldo sampai benar-benar dibayar.
CREATE TABLE IF NOT EXISTS waste_payout_requests (
  id TEXT PRIMARY KEY,
  request_key TEXT NOT NULL UNIQUE,
  member_id TEXT NOT NULL REFERENCES members(id),
  amount_rp INTEGER NOT NULL CHECK(amount_rp>0 AND amount_rp<=100000000),
  method TEXT NOT NULL DEFAULT 'tunai' CHECK(method IN ('tunai')),
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'diajukan' CHECK(status IN ('diajukan','disetujui','ditolak','dibayar','dibatalkan')),
  requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by TEXT,
  reviewed_at TEXT,
  admin_note TEXT NOT NULL DEFAULT '',
  paid_by TEXT,
  paid_at TEXT,
  ledger_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_waste_payout_member ON waste_payout_requests(member_id,requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_waste_payout_status ON waste_payout_requests(status,requested_at DESC);
