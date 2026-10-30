#!/usr/bin/env python3
"""Exercise the actual Bank Sampah treasury query against isolated SQLite fixtures."""
import re, sqlite3
from pathlib import Path

root=Path(__file__).resolve().parents[1]
worker=(root/"cloudflare"/"worker-terpadu-operasional-teruji.js").read_text()
match=re.search(r"list\(db,`(SELECT c\.id,c\.occurred_on,c\.fund_position,c\.transaction_type[\s\S]*?)`,\[confirmedOn\]\)",worker)
assert match,"Bank Sampah detection query not found"
query=match.group(1)
db=sqlite3.connect(":memory:")
db.row_factory=sqlite3.Row
db.executescript("""
CREATE TABLE treasury_config(id INTEGER PRIMARY KEY,confirmed_at TEXT);
CREATE TABLE treasury_events(request_key TEXT PRIMARY KEY);
CREATE TABLE treasury_source_exclusions(source_key TEXT PRIMARY KEY);
CREATE TABLE treasury_bank_source_coverage(source_id TEXT PRIMARY KEY);
CREATE TABLE waste_batches(id TEXT PRIMARY KEY,status TEXT,confirmed_at TEXT);
CREATE TABLE waste_sales(id TEXT PRIMARY KEY,batch_id TEXT,status TEXT);
CREATE TABLE waste_cash_ledger(
id TEXT PRIMARY KEY,occurred_on TEXT,source_transaction_id TEXT,
transaction_type TEXT,fund_position TEXT,note TEXT,cash_in_rp INTEGER,
cash_out_rp INTEGER,status TEXT);
INSERT INTO treasury_config VALUES(1,'2026-10-30 09:00:00');
INSERT INTO waste_batches VALUES('batch-new','disahkan','2026-10-30 12:00:00');
INSERT INTO waste_batches VALUES('batch-old','disahkan','2026-10-29 08:00:00');
INSERT INTO waste_batches VALUES('batch-draft','siap',NULL);
INSERT INTO waste_sales VALUES('sale-new','batch-new','terkonfirmasi');
INSERT INTO waste_sales VALUES('sale-old','batch-old','terkonfirmasi');
INSERT INTO waste_sales VALUES('sale-draft','batch-draft','draft');
""")
for pos,amount in [('tabungan_warga',50000),('operasional',25000),('kas_lorong',15000),('cadangan',10000)]:
 db.execute("""INSERT INTO waste_cash_ledger VALUES(?,?,?,?,?,?,?,?,?)""",
 ('new:'+pos,'2026-10-28','sale-new','penjualan_terkonfirmasi',pos,'hasil penjualan',amount,0,'aktif'))
db.execute("INSERT INTO waste_cash_ledger VALUES(?,?,?,?,?,?,?,?,?)",
 ('old','2026-10-28','sale-old','penjualan_terkonfirmasi','tabungan_warga','lama',20000,0,'aktif'))
db.execute("INSERT INTO waste_cash_ledger VALUES(?,?,?,?,?,?,?,?,?)",
 ('draft','2026-10-30','sale-draft','penjualan_terkonfirmasi','tabungan_warga','belum sah',30000,0,'aktif'))
db.execute("INSERT INTO waste_cash_ledger VALUES(?,?,?,?,?,?,?,?,?)",
 ('withdraw','2026-10-31','withdraw','pencairan_tabungan','tabungan_warga','pencairan',0,10000,'aktif'))
rows=[dict(x) for x in db.execute(query,('2026-10-30',)).fetchall()]
assert len(rows)==5,(rows,query)
sales=[r for r in rows if r['transaction_type']=='penjualan_terkonfirmasi']
assert {x['fund_position'] for x in sales}=={'tabungan_warga','operasional','kas_lorong','cadangan'}
assert all(x['occurred_on']=='2026-10-28' and x['treasury_date']=='2026-10-30' for x in sales)
assert {x['id'] for x in rows}.isdisjoint({'old','draft'})
db.execute("INSERT INTO treasury_source_exclusions VALUES('source:bank:new:operasional')")
db.execute("INSERT INTO treasury_events VALUES('source:bank:new:cadangan')")
rows2=[dict(x) for x in db.execute(query,('2026-10-30',)).fetchall()]
assert len(rows2)==3,rows2
db.execute("INSERT INTO treasury_bank_source_coverage VALUES('new:tabungan_warga')")
rows3=[dict(x) for x in db.execute(query,('2026-10-30',)).fetchall()]
assert len(rows3)==2,rows3
assert 'new:tabungan_warga' not in {x['id'] for x in rows3}
assert 'function treasuryBankFund(position)' in worker
for position,fund in [('tabungan_warga','bank_warga'),('operasional','bank_lingkungan'),
('kas_lorong','bank_kas_lorong'),('cadangan','bank_cadangan')]:
 assert f'if(value==="{position}")return "{fund}"' in worker or (position=='operasional' and 'value==="operasional"||value==="lingkungan"' in worker)
assert "bankSourceBalances" in worker
print("TREASURY_BANK_DETECTION_TIMING_AND_POSITIONS_OK=1")
