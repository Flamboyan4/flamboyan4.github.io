#!/usr/bin/env python3
"""Uji isolasi persetujuan saldo Bank Sampah: tanpa akses D1 produksi."""
from pathlib import Path
import sqlite3

root=Path(__file__).resolve().parents[1]
worker=(root/"cloudflare/worker-terpadu-operasional-teruji.js").read_text()
sql=(root/"cloudflare/migrations/20261030_treasury_bank_coverage.sql").read_text()
db=sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript((root/"cloudflare/migrations/20261030_treasury_center.sql").read_text())
db.executescript(sql)
db.executescript(sql)
db.execute("""INSERT INTO treasury_events(id,request_key,payload_hash,kind,occurred_on,note,created_by)
 VALUES ('recon1','ref:1','abc','incoming','2026-10-30','Bank Sampah','admin')""")
db.execute("""INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp)
 VALUES ('entry1','recon1','bank_warga','qris',3000)""")
db.execute("""INSERT INTO treasury_bank_source_coverage(source_id,event_id,fund_id,captured_amount_rp)
 VALUES ('ledger:1','recon1','bank_warga',3000)""")
assert db.execute("SELECT SUM(amount_rp) FROM treasury_entries WHERE fund_id='bank_warga'").fetchone()[0]==3000
try:
 db.execute("""INSERT INTO treasury_bank_source_coverage(source_id,event_id,fund_id,captured_amount_rp)
  VALUES ('ledger:1','recon1','bank_warga',3000)""")
except sqlite3.IntegrityError:
 pass
else:
 raise AssertionError("Duplicate source coverage must be rejected")
try:
 db.execute("""INSERT INTO treasury_bank_source_coverage(source_id,event_id,fund_id,captured_amount_rp)
 VALUES ('ledger:2','nonexistent','bank_warga',3000)""")
except sqlite3.IntegrityError:
 pass
else:
 raise AssertionError("Coverage must reference an approved treasury event")
for str_required in [
 'function treasuryBankPositions(fundId){',
 'async function treasuryApproveBankBalance(db,who,catalog,req){',
 'p.action==="approve-bank-balance"',
 'expectedSourceRp','expectedCentralRp',
 'INSERT INTO treasury_bank_source_coverage',
 'FROM treasury_bank_source_coverage z WHERE z.source_id=c.id',
 'SUM(cash_in_rp-cash_out_rp),0)',
 'SELECT COALESCE(SUM(amount_rp),0) FROM treasury_entries WHERE fund_id=?',
 'THEN ? ELSE 0 END',
 'confirmation!=="SUDAH COCOK"',
 'const requestFingerprint=await sha',
 'request_key=?'
]:
 assert str_required in worker,str_required
css=(root/"portal-live/treasury-center.css").read_text()
ui=(root/"portal-live/treasury-center.js").read_text()
assert '!important' not in css
assert '@media print' not in css
assert 'Pindah Dana' in ui
assert 'Saldo Bank Sampah' in ui
assert 'action:"approve-bank-balance"' in ui
assert 'expectedSourceRp:row.source' in ui
assert 'expectedCentralRp:row.central' in ui
assert 'Sahkan '+'' in ui
print("TREASURY_BANK_BALANCE_APPROVAL_OK=1")
