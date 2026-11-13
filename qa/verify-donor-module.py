#!/usr/bin/env python3
"""Donor ledger safety: one account = one donor; no double-posts or cross-account data."""
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
SQL = ROOT / "cloudflare/migrations/20261113_donatur_pendanaan.sql"
WORKER = ROOT / "cloudflare/worker-terpadu-operasional-teruji.js"

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript("""
CREATE TABLE accounts(id TEXT PRIMARY KEY,username TEXT UNIQUE,role TEXT CHECK(role IN ('anggota','admin','superadmin')));
CREATE TABLE portal_project_cards(id TEXT PRIMARY KEY,title TEXT);
CREATE TABLE treasury_events(id TEXT PRIMARY KEY,kind TEXT,occurred_on TEXT,note TEXT);
CREATE TABLE treasury_entries(id TEXT PRIMARY KEY,event_id TEXT,fund_id TEXT,location_id TEXT,amount_rp INTEGER);
INSERT INTO accounts VALUES('super','admin','superadmin');
INSERT INTO portal_project_cards VALUES('project-1','Gapura');
INSERT INTO treasury_events VALUES('income-1','incoming','2026-11-13','Bantuan perusahaan');
INSERT INTO treasury_events VALUES('income-2','incoming','2026-11-13','Bantuan tambahan');
INSERT INTO treasury_events VALUES('outgoing-1','outgoing','2026-11-13','Beli material');
INSERT INTO treasury_events VALUES('outgoing-2','outgoing','2026-11-13','Biaya tambahan');
INSERT INTO treasury_entries VALUES('line-i1','income-1','project:project-1','qris',1000);
INSERT INTO treasury_entries VALUES('line-i2','income-2','project:project-1','qris',100);
INSERT INTO treasury_entries VALUES('line-o1','outgoing-1','project:project-1','qris',-600);
INSERT INTO treasury_entries VALUES('line-o2','outgoing-2','project:project-1','qris',-300);
""")
db.executescript(SQL.read_text(encoding="utf-8"))
db.executescript("""
INSERT INTO donor_accounts(id,username,donor_name,password_hash) VALUES('donor-a','company_a','Company A','test-hash');
INSERT INTO donor_accounts(id,username,donor_name,password_hash) VALUES('donor-b','company_b','Company B','test-hash');
INSERT INTO donor_programs(id,project_id,fund_id,created_by) VALUES('prog-1','project-1','project:project-1','super');
""")

def linked(id, donor, event, kind, amount):
    db.execute(
        "INSERT INTO donor_finance_links(id,donor_account_id,program_id,treasury_event_id,kind,amount_rp,linked_by) VALUES(?,?,?,?,?,?,?)",
        (id, donor, "prog-1", event, kind, amount, "super"),
    )

def rejected(action, label):
    try:
        action()
    except sqlite3.IntegrityError:
        db.rollback()
        return
    raise AssertionError("Expected rejection: " + label)

linked("a-in", "donor-a", "income-1", "incoming", 700)
linked("b-in", "donor-b", "income-1", "incoming", 300)
linked("a-spend", "donor-a", "outgoing-1", "outgoing", 500)
linked("b-spend", "donor-b", "outgoing-1", "outgoing", 100)
db.commit()

assert db.execute("SELECT COALESCE(SUM(CASE WHEN kind='incoming' THEN amount_rp ELSE -amount_rp END),0) FROM donor_finance_links WHERE donor_account_id='donor-a'").fetchone()[0] == 200
assert db.execute("SELECT count(*) FROM donor_accounts WHERE id='donor-a'").fetchone()[0] == 1
assert db.execute("SELECT role FROM accounts WHERE id='super'").fetchone()[0] == "superadmin"
assert db.execute("SELECT count(*) FROM accounts").fetchone()[0] == 1
assert db.execute("PRAGMA foreign_key_check").fetchall() == []

rejected(lambda: linked("duplicate", "donor-a", "income-1", "incoming", 1), "oversubscribed journal")
rejected(lambda: linked("over-source", "donor-a", "income-2", "incoming", 101), "source ceiling")
rejected(lambda: linked("over-donor", "donor-a", "outgoing-2", "outgoing", 201), "donor balance")
rejected(lambda: linked("wrong-kind", "donor-a", "income-2", "outgoing", 1), "wrong treasury kind")
rejected(lambda: db.execute("UPDATE donor_finance_links SET note='edited' WHERE id='a-in'"), "immutable ledger")
rejected(lambda: db.execute("DELETE FROM donor_finance_links WHERE id='a-in'"), "no silent deletions")
assert db.execute("SELECT count(*) FROM treasury_entries").fetchone()[0] == 4
assert db.execute("SELECT count(*) FROM donor_finance_links").fetchone()[0] == 4
assert db.execute("SELECT count(*) FROM donor_finance_links WHERE donor_account_id='donor-a'").fetchone()[0] == 2

code=WORKER.read_text(encoding="utf-8")
assert 'requireRole(who,["donatur"])' in code
assert 'FROM donor_accounts WHERE id=?' in code
assert 'WHERE l.donor_account_id=?' in code
assert 'const denied=superadmin(who);if(denied)return denied;' in code
assert 'const donorAllowedRoutes=new Set(' in code
assert "path === \"/api/donor/dashboard\"" in code
assert "path === \"/api/admin/donors\"" in code
assert 'donor_organizations' not in code
assert '"donor_sessions"' in code
assert '"donor_accounts"' in code
assert "'donatur' AS role" in code
assert 'donor_account_memberships' not in code

for name in ("donatur.css","admin.css"):
    content=(ROOT / "donatur" / name).read_text(encoding="utf-8")
    assert "!important" not in content
for name in ("index.html","admin.html"):
    assert 'name="viewport"' in (ROOT / "donatur" / name).read_text(encoding="utf-8")
print("PASS: 1 account = 1 donor; allocations, immutable ledger and role isolation.")
