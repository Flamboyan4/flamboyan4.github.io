#!/usr/bin/env python3
"""Check additive central-finance extensions without accessing production D1."""
from pathlib import Path
import sqlite3

root=Path(__file__).resolve().parents[1]
db=sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
for name in ("20261030_treasury_center.sql","20261030_treasury_dynamic_funds.sql"):
    sql=(root/"cloudflare"/"migrations"/name).read_text()
    assert "DROP TABLE" not in sql.upper() and "DELETE FROM" not in sql.upper()
    db.executescript(sql)
    db.executescript(sql)
for name in ("treasury_events","treasury_entries","treasury_funds","treasury_receipt_observations","treasury_source_exclusions"):
    assert db.execute("SELECT name FROM sqlite_master WHERE name=? AND type='table'",(name,)).fetchone()
db.execute("INSERT INTO treasury_funds(id,name,cash_location,created_by) VALUES('fund:1','Donasi Gapura','cash:fund:1','admin')")
try:
    db.execute("INSERT INTO treasury_funds(id,name,cash_location,created_by) VALUES('fund:2','donasi gapura','cash:fund:2','admin')")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError("Fund names should be case-insensitive unique")
db.execute("INSERT INTO treasury_receipt_observations(id,source_kind,source_id,fund_id,amount_rp,observed_on) VALUES('ob:1','project_order','order:1','fund:1',120000,'2026-10-30')")
try:
    db.execute("INSERT INTO treasury_receipt_observations(id,source_kind,source_id,fund_id,amount_rp,observed_on) VALUES('ob:2','project_order','order:2','fund:1',0,'2026-10-30')")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError("Zero-value receipts must be rejected")
db.execute("INSERT INTO treasury_source_exclusions(source_key,reason,excluded_by) VALUES('source:book:cash1','Termasuk saldo awal','admin')")
try:
    db.execute("INSERT INTO treasury_source_exclusions(source_key,reason,excluded_by) VALUES('source:book:cash1','Duplikat','admin')")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError("Source exclusion must be idempotent")
print("TREASURY_DYNAMIC_SCHEMA_AND_IDEMPOTENCY_OK=1")
