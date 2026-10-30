#!/usr/bin/env python3
"""Additive treasury schema and safety contracts, never touches production D1."""
import pathlib
import sqlite3

root = pathlib.Path(__file__).resolve().parents[1]
sql = (root / "cloudflare/migrations/20261030_treasury_center.sql").read_text()
worker = (root / "cloudflare/worker-terpadu-operasional-teruji.js").read_text()
html = (root / "superadmin/index.html").read_text()
ui = (root / "portal-live/treasury-center.js").read_text()

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript(sql)
db.executescript(sql)
assert db.execute("SELECT COUNT(*) FROM treasury_config").fetchone()[0] == 1
assert all(db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone()
           for name in ("treasury_events", "treasury_entries", "treasury_config"))

db.execute("""INSERT INTO treasury_events(id,request_key,payload_hash,kind,occurred_on,note,created_by)
            VALUES ('ev1','key1','test','opening','2026-10-30','Saldo awal','superadmin')""")
db.execute("""INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp)
            VALUES ('line1','ev1','kas_rt','cash:kas_rt',100000)""")
assert db.execute("SELECT SUM(amount_rp) FROM treasury_entries").fetchone()[0] == 100000
for stmt in (
    "INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp) VALUES ('zero','ev1','kas_rt','cash:kas_rt',0)",
    "INSERT INTO treasury_events(id,request_key,payload_hash,kind,occurred_on,note,created_by) VALUES ('ev2','key1','test','opening','2026-10-30','Duplikat','superadmin')",
    "INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp) VALUES ('missing','unknown','kas_rt','cash:kas_rt',300)"
):
    try:
        db.execute(stmt)
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError("Invariant not enforced: " + stmt)
assert "async function treasuryApi(" in worker
assert 'if (path === "/api/v2/admin/treasury")' in worker
assert 'const denied=superadmin(who)' in worker
assert "db.batch(statements)" in worker
assert "await db.batch(statements)" in worker
assert "finance" not in ""
assert 'Pusat Keuangan' in html
assert 'treasury-center.js' in html
assert 'f4OpenTreasuryCenter' in ui
print("TREASURY_SCHEMA_AND_ROUTE_GUARDS_OK=1")
