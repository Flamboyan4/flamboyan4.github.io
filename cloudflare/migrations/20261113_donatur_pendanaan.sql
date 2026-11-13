-- Modul Donatur Eksternal — hanya metadata alokasi; uang tetap dicatat sekali di treasury_events/entries.
-- Terapkan di D1 staging, uji, baru produksi. Tidak mengubah transaksi atau akun lama.
-- PENTING: sebelum membuat akun role 'donatur', periksa CHECK(role) pada tabel accounts yang sudah ada.
CREATE TABLE IF NOT EXISTS donor_organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','arsip')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS donor_account_memberships (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id),
  organization_id TEXT NOT NULL REFERENCES donor_organizations(id),
  status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','nonaktif')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_donor_membership_org ON donor_account_memberships(organization_id,status);

-- Satu program bisa didukung banyak organisasi; fund_id menunjuk pos Pusat Keuangan yang sudah ada.
CREATE TABLE IF NOT EXISTS donor_programs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE REFERENCES portal_project_cards(id),
  fund_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','arsip')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- BUKAN transaksi keuangan. Setiap baris hanya mengaitkan porsi jurnal yang sudah disahkan.
CREATE TABLE IF NOT EXISTS donor_finance_links (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES donor_organizations(id),
  program_id TEXT NOT NULL REFERENCES donor_programs(id),
  treasury_event_id TEXT NOT NULL REFERENCES treasury_events(id),
  kind TEXT NOT NULL CHECK(kind IN ('incoming','outgoing')),
  amount_rp INTEGER NOT NULL CHECK(amount_rp>0 AND amount_rp<=100000000000),
  proof_url TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  linked_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id,program_id,treasury_event_id,kind)
);
CREATE INDEX IF NOT EXISTS idx_donor_finance_org ON donor_finance_links(organization_id,program_id,kind);
CREATE INDEX IF NOT EXISTS idx_donor_finance_event ON donor_finance_links(treasury_event_id,kind);

-- Trigger menjaga alokasi tidak melebihi nilai jurnal pada fund yang benar.
-- Tidak memperbolehkan menghubungkan opening, move, atau allocation sebagai donasi/pengeluaran.
CREATE TRIGGER IF NOT EXISTS donor_finance_guard_insert
BEFORE INSERT ON donor_finance_links
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM treasury_events e WHERE e.id=NEW.treasury_event_id AND e.kind=NEW.kind
  ) THEN RAISE(ABORT,'Tipe jurnal tidak cocok atau belum disahkan') END;
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM donor_programs p WHERE p.id=NEW.program_id AND p.status='aktif'
  ) THEN RAISE(ABORT,'Program tidak aktif') END;
  SELECT CASE WHEN (
    SELECT COALESCE(SUM(
      CASE WHEN NEW.kind='incoming' AND a.amount_rp>0 THEN a.amount_rp
           WHEN NEW.kind='outgoing' AND a.amount_rp<0 THEN -a.amount_rp
           ELSE 0 END
    ),0)
    FROM treasury_entries a
    JOIN donor_programs p ON p.fund_id=a.fund_id
    WHERE p.id=NEW.program_id AND a.event_id=NEW.treasury_event_id
  ) < NEW.amount_rp+(
    SELECT COALESCE(SUM(l.amount_rp),0) FROM donor_finance_links l
    JOIN donor_programs shared ON shared.id=l.program_id
    WHERE l.treasury_event_id=NEW.treasury_event_id
      AND shared.fund_id=(SELECT fund_id FROM donor_programs WHERE id=NEW.program_id)
      AND l.kind=NEW.kind
  ) THEN RAISE(ABORT,'Alokasi melebihi transaksi keuangan asli') END;
  SELECT CASE WHEN NEW.kind='outgoing' AND (
    SELECT COALESCE(SUM(CASE WHEN kind='incoming' THEN amount_rp ELSE -amount_rp END),0)
    FROM donor_finance_links
    WHERE organization_id=NEW.organization_id AND program_id=NEW.program_id
  ) < NEW.amount_rp THEN RAISE(ABORT,'Pengeluaran melebihi dana donatur tersedia') END;
END;
-- Revisi selalu melalui pembatalan terverifikasi dan tautan baru, tidak diam-diam mengubah histori.
CREATE TRIGGER IF NOT EXISTS donor_finance_no_update BEFORE UPDATE ON donor_finance_links
BEGIN SELECT RAISE(ABORT,'Riwayat alokasi tidak dapat diedit langsung'); END;
CREATE TRIGGER IF NOT EXISTS donor_finance_no_delete BEFORE DELETE ON donor_finance_links
BEGIN SELECT RAISE(ABORT,'Riwayat alokasi tidak dapat dihapus langsung'); END;

-- Kabar perkembangan per program (hanya dipublikasikan untuk donor terkait).
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

-- Audit khusus modul donatur; tidak bergantung pada batasan scope audit_log lama.
CREATE TABLE IF NOT EXISTS donor_audit (
  id TEXT PRIMARY KEY,
  actor_account_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  summary_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_donor_audit_created ON donor_audit(created_at DESC);
