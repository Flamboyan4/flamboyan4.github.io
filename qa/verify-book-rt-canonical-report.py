#!/usr/bin/env python3
"""Isolated D1 RT/Arisan report regression: in-memory, no production writes."""
import pathlib
import sqlite3

src = pathlib.Path("cloudflare/worker-terpadu-operasional-teruji.js").read_text()
start = src.index("async function f4ContributionReport(")
end = src.index("__name(f4ContributionReport", start)
report_fn = src[start:end]
raw = report_fn.split("const found = await db.prepare(", 1)[1].split(").bind(...bind).all();", 1)[0]
sql = raw.strip().strip(chr(96))
sql = sql.replace("$" + '{where.join(" AND ")}', "a.status='aktif' AND p.status='aktif' AND a.period_year=? AND a.period_month=?")
assert (chr(36)+chr(123)) not in sql
assert "JOIN bookkeeping_allocation_details" not in sql, "Legacy detail join duplicates old data, drops new payments"
assert "a.contribution_type,a.amount_rp AS line_rp" in sql
for category in ("IURAN_BULANAN", "KEBERSIHAN", "ARISAN"):
    assert 'category === "'+category+'"' in report_fn
annual_start = src.index("async function f4YearlyReadOnlyReport")
annual_end = src.index("__name(f4YearlyReadOnlyReport", annual_start)
annual = src[annual_start:annual_end]
year_offset = annual.index("SELECT substr(p.paid_on,6,2) AS mon")
year_begin = annual.rfind(chr(96), 0, year_offset)
year_end = annual.index(chr(96), year_offset)
year_sql = annual[year_begin+1:year_end]
assert "JOIN bookkeeping_allocation_details" not in year_sql
assert "a.contribution_type IN ('IURAN_BULANAN','KEBERSIHAN')" in year_sql

db = sqlite3.connect(":memory:")
db.row_factory = sqlite3.Row
db.executescript("""
CREATE TABLE households(id TEXT PRIMARY KEY,house_code TEXT);
CREATE TABLE bookkeeping_payers(id TEXT PRIMARY KEY,display_name TEXT,household_id TEXT);
CREATE TABLE bookkeeping_payments(id TEXT PRIMARY KEY,payer_id TEXT,household_id TEXT,paid_on TEXT,status TEXT,payment_method TEXT);
CREATE TABLE bookkeeping_payment_allocations(id TEXT PRIMARY KEY,payment_id TEXT,payer_id TEXT,period_year INTEGER,period_month INTEGER,contribution_type TEXT,amount_rp INTEGER,status TEXT);
CREATE TABLE bookkeeping_allocation_details(id TEXT PRIMARY KEY,allocation_id TEXT,contribution_type TEXT,amount_rp INTEGER);
""")
for i in range(1,5):
    db.execute("INSERT INTO households VALUES(?,?)", (f"h{i}",f"A5/{i:02}"))
    db.execute("INSERT INTO bookkeeping_payers VALUES(?,?,?)",(f"p{i}",f"Warga Uji {i}",f"h{i}"))

def add(pid, payer, date, month, kinds, status="aktif", details=None):
    db.execute("INSERT INTO bookkeeping_payments VALUES(?,?,?,?,?,?)", (pid,payer,"h"+payer[-1],date,status,"Cash"))
    for i,(kind,rp) in enumerate(kinds):
        aid=pid+":"+str(i)
        db.execute("INSERT INTO bookkeeping_payment_allocations VALUES(?,?,?,?,?,?,?,?)",
                   (aid,pid,payer,2026,month,kind,rp,status))
        if i==0 and details:
            for j,(kind2,rp2) in enumerate(details):
                db.execute("INSERT INTO bookkeeping_allocation_details VALUES(?,?,?,?)",(aid+":"+str(j),aid,kind2,rp2))

# October detail breakdown duplicates the four canonical allocations.
add("old", "p1", "2026-10-12", 10,
    [("IURAN_BULANAN",25000),("KEBERSIHAN",20000),("KAS_LORONG",10000),("ARISAN",60000)],
    details=[("bulanan",25000),("kebersihan",20000),("kas_lorong",10000),("arisan",60000)])
# New November Worker records have no detail breakdown.
add("pay-a", "p2", "2026-11-07", 11,
    [("IURAN_BULANAN",25000),("KEBERSIHAN",20000),("KAS_LORONG",10000),("ARISAN",60000)])
# Multiple payments by the same payer are distinct units.
add("pay-b", "p3", "2026-11-07", 11, [("KEBERSIHAN",20000)])
add("pay-c", "p3", "2026-11-07", 11, [("KEBERSIHAN",20000)])
add("pay-cancel", "p4", "2026-11-07", 11, [("IURAN_BULANAN",25000)], status="dibatalkan")

def totals(month):
    rows=db.execute(sql,(2026,month)).fetchall()
    result,payer_totals={},{}
    for row in rows:
        k=row["contribution_type"];rp=row["line_rp"];p=row["payer_id"]
        result[k]=result.get(k,0)+rp
        payer_totals[(p,k)]=payer_totals.get((p,k),0)+rp
    return result,payer_totals

october,_=totals(10)
assert october=={"IURAN_BULANAN":25000,"KEBERSIHAN":20000,"KAS_LORONG":10000,"ARISAN":60000},october
november,payers=totals(11)
assert november=={"IURAN_BULANAN":25000,"KEBERSIHAN":60000,"KAS_LORONG":10000,"ARISAN":60000},november
assert payers[("p3","KEBERSIHAN")]==40000 and november["KEBERSIHAN"]/20000==3
annual=db.execute(year_sql,("2026-01-01","2026-12-31")).fetchall()
by_month={r["mon"]:r for r in annual}
assert by_month["10"]["rt"]==45000 and by_month["10"]["arisan"]==60000
assert by_month["11"]["rt"]==85000 and by_month["11"]["arisan"]==60000
print("F4_BOOK_RT_CANONICAL_ALLOCATION_REPORT_OK")
