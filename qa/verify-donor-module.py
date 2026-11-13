#!/usr/bin/env python3
"""Regression for donor-only allocations: never write cash twice or leak org scope."""
from pathlib import Path
import sqlite3
import re

ROOT = Path(__file__).resolve().parents[1]
SQL = ROOT / "cloudflare/migrations/20261113_donatur_pendanaan.sql"
WORKER = ROOT / "cloudflare/worker-terpadu-operasional-teruji.js"

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript("""
CREATE TABLE accounts(id TEXT PRIMARY KEY, username TEXT UNIQUE, role TEXT);
CREATE TABLE portal_project_cards(id TEXT PRIMARY KEY,title TEXT);
CREATE TABLE treasury_events(id TEXT PRIMARY KEY,kind TEXT,occurred_on TEXT,note TEXT);
CREATE TABLE treasury_entries(id TEXT PRIMARY KEY,event_id TEXT,fund_id TEXT,location_id TEXT,amount_rp INTEGER);
INSERT INTO accounts VALUES('super','admin','superadmin');
INSERT INTO accounts VALUES('user-a','companya','donatur');
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
INSERT INTO donor_organizations(id,name,created_by) VALUES('org-a','Company A','super');
INSERT INTO donor_organizations(id,name,created_by) VALUES('org-b','Company B','super');
INSERT INTO donor_account_memberships(account_id,organization_id) VALUES('user-a','org-a');
INSERT INTO donor_programs(id,project_id,fund_id,created_by) VALUES('prog-1','project-1','project:project-1','super');
""")
def linked(id, org, event, kind, amount):
    db.execute(
        "INSERT INTO donor_finance_links(id,organization_id,program_id,treasury_event_id,kind,amount_rp,linked_by) VALUES(?,?,?,?,?,?,?)",
        (id, org, "prog-1", event, kind, amount, "super"),
    )

def rejected(action, label):
    try:
        action()
    except sqlite3.IntegrityError:
        db.rollback()
        return
    raise AssertionError("Expected constraint: " + label)

linked("a-in", "org-a", "income-1", "incoming", 700)
linked("b-in", "org-b", "income-1", "incoming", 300)
linked("a-spend", "org-a", "outgoing-1", "outgoing", 500)
linked("b-spend", "org-b", "outgoing-1", "outgoing", 100)
db.commit()
assert db.execute("SELECT SUM(CASE WHEN kind='incoming' THEN amount_rp ELSE -amount_rp END) FROM donor_finance_links WHERE organization_id='org-a'").fetchone()[0] == 200

rejected(lambda: linked("duplicate", "org-a", "income-1", "incoming", 1), "oversubscribed journal")
rejected(lambda: linked("over-source", "org-a", "income-2", "incoming", 101), "source ceiling")
rejected(lambda: linked("over-donor", "org-a", "outgoing-2", "outgoing", 201), "donor balance")
rejected(lambda: linked("wrong-kind", "org-a", "income-2", "outgoing", 1), "wrong treasury kind")
rejected(lambda: db.execute("UPDATE donor_finance_links SET note='edited' WHERE id='a-in'"), "immutable audit")
rejected(lambda: db.execute("DELETE FROM donor_finance_links WHERE id='a-in'"), "no silent deletions")

assert db.execute("SELECT count(*) FROM treasury_entries").fetchone()[0] == 4, "Donor links must not duplicate treasury"
assert db.execute("SELECT count(*) FROM donor_account_memberships WHERE organization_id='org-a'").fetchone()[0] == 1
code = WORKER.read_text(encoding="utf-8")
assert 'requireRole(who,["donatur"])' in code
assert 'const organization=await one(db,' in code
assert 'WHERE l.organization_id=?' in code
assert 'const denied=superadmin(who);if(denied)return denied;' in code
assert "path === \"/api/donor/dashboard\"" in code
assert "path === \"/api/admin/donors\"" in code
for name in ("donatur.css", "admin.css"):
    content = (ROOT / "donatur" / name).read_text(encoding="utf-8")
    assert "!important" not in content, f"{name}: !important not allowed"
for name in ("index.html", "admin.html"):
    assert 'name="viewport"' in (ROOT / "donatur" / name).read_text(encoding="utf-8")
print("PASS: donor allocation ceilings, company isolation prerequisites, immutable treasury and UI policies.")
