-- Pusat Keuangan: jurnal lokasi dan kepemilikan dana terpisah dari buku kas sumber.
-- Tidak mengimpor, mengubah, atau menghitung ganda transaksi lama.
CREATE TABLE IF NOT EXISTS treasury_events (
 id TEXT PRIMARY KEY,
 request_key TEXT NOT NULL UNIQUE,
 payload_hash TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('opening','incoming','outgoing','move','allocation')),
 occurred_on TEXT NOT NULL,
 note TEXT NOT NULL,
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS treasury_entries (
 id TEXT PRIMARY KEY,
 event_id TEXT NOT NULL REFERENCES treasury_events(id),
 fund_id TEXT NOT NULL,
 location_id TEXT NOT NULL,
 amount_rp INTEGER NOT NULL CHECK(amount_rp<>0 AND amount_rp BETWEEN -100000000000 AND 100000000000)
);
CREATE INDEX IF NOT EXISTS idx_treasury_entries_position ON treasury_entries(fund_id,location_id,event_id);
CREATE INDEX IF NOT EXISTS idx_treasury_events_date ON treasury_events(occurred_on,id);
CREATE TABLE IF NOT EXISTS treasury_config (
 id INTEGER PRIMARY KEY CHECK(id=1),
 confirmed_on TEXT,
 confirmed_at TEXT,
 confirmed_by TEXT
);
INSERT OR IGNORE INTO treasury_config(id) VALUES(1);
