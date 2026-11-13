-- Donatur Flamboyan 4: 1 account = 1 donor (individual or company), no organization hierarchy.
-- Money remains exclusively in treasury_events/treasury_entries; this is an audited reference layer.
-- Additif: akun dan sesi donatur terisolasi dari akun warga / superadmin.
-- Tidak memerlukan perubahan CHECK(role) atau memindah tabel accounts lama.
CREATE TABLE IF NOT EXISTS donor_accounts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  password_scheme TEXT NOT NULL DEFAULT 'pbkdf2-sha256',
  status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','nonaktif')),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS donor_sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES donor_accounts(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_donor_sessions_active ON donor_sessions(account_id,expires_at,revoked_at);
CREATE TABLE IF NOT EXISTS donor_profiles (
  account_id TEXT PRIMARY KEY REFERENCES donor_accounts(id),
  donor_name TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donor_programs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE REFERENCES portal_project_cards(id),
  fund_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','arsip')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Each row links a portion of a posted Treasury journal to a donor; never double-post cash.
CREATE TABLE IF NOT EXISTS donor_finance_links (
  id TEXT PRIMARY KEY,
  donor_account_id TEXT NOT NULL REFERENCES donor_profiles(account_id),
  program_id TEXT NOT NULL REFERENCES donor_programs(id),
  treasury_event_id TEXT NOT NULL REFERENCES treasury_events(id),
  kind TEXT NOT NULL CHECK(kind IN ('incoming','outgoing')),
  amount_rp INTEGER NOT NULL CHECK(amount_rp>0 AND amount_rp<=100000000000),
  proof_url TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  linked_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(donor_account_id,program_id,treasury_event_id,kind)
);
CREATE INDEX IF NOT EXISTS idx_donor_finance_account ON donor_finance_links(donor_account_id,program_id,kind);
CREATE INDEX IF NOT EXISTS idx_donor_finance_event ON donor_finance_links(treasury_event_id,kind);

-- Multiple donors can share one transaction, but allocations cannot exceed the correct fund.
CREATE TRIGGER IF NOT EXISTS donor_finance_guard_insert BEFORE INSERT ON donor_finance_links
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM treasury_events e WHERE e.id=NEW.treasury_event_id AND e.kind=NEW.kind
  ) THEN RAISE(ABORT,'Tipe jurnal tidak cocok atau belum disahkan') END;
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM donor_programs p WHERE p.id=NEW.program_id AND p.status='aktif'
  ) THEN RAISE(ABORT,'Program tidak aktif') END;
  SELECT CASE WHEN (
    SELECT COALESCE(SUM(
      CASE WHEN NEW.kind='incoming' AND x.amount_rp>0 THEN x.amount_rp
           WHEN NEW.kind='outgoing' AND x.amount_rp<0 THEN -x.amount_rp ELSE 0 END
    ),0)
    FROM treasury_entries x JOIN donor_programs p ON p.fund_id=x.fund_id
    WHERE p.id=NEW.program_id AND x.event_id=NEW.treasury_event_id
  ) < NEW.amount_rp+(
    SELECT COALESCE(SUM(l.amount_rp),0)
    FROM donor_finance_links l JOIN donor_programs shared ON shared.id=l.program_id
    WHERE l.treasury_event_id=NEW.treasury_event_id
      AND shared.fund_id=(SELECT fund_id FROM donor_programs WHERE id=NEW.program_id)
      AND l.kind=NEW.kind
  ) THEN RAISE(ABORT,'Alokasi melebihi transaksi keuangan asli') END;
  SELECT CASE WHEN NEW.kind='outgoing' AND (
    SELECT COALESCE(SUM(CASE WHEN kind='incoming' THEN amount_rp ELSE -amount_rp END),0)
    FROM donor_finance_links
    WHERE donor_account_id=NEW.donor_account_id AND program_id=NEW.program_id
  ) < NEW.amount_rp THEN RAISE(ABORT,'Pengeluaran melebihi dana donatur tersedia') END;
END;
CREATE TRIGGER IF NOT EXISTS donor_finance_no_update BEFORE UPDATE ON donor_finance_links
BEGIN SELECT RAISE(ABORT,'Alokasi tidak dapat diubah langsung'); END;
CREATE TRIGGER IF NOT EXISTS donor_finance_no_delete BEFORE DELETE ON donor_finance_links
BEGIN SELECT RAISE(ABORT,'Alokasi tidak dapat dihapus langsung'); END;

CREATE TABLE IF NOT EXISTS donor_program_updates (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES donor_programs(id),
  occurred_on TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  progress_percent INTEGER CHECK(progress_percent BETWEEN 0 AND 100),
  photo_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'terbit' CHECK(status IN ('terbit','arsip')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_donor_updates_program ON donor_program_updates(program_id,status,occurred_on DESC);

CREATE TABLE IF NOT EXISTS donor_audit (
  id TEXT PRIMARY KEY,
  actor_account_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  summary_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_donor_audit_created ON donor_audit(created_at DESC);
