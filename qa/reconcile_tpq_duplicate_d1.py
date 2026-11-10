#!/usr/bin/env python3
"""Guarded reconciliation of duplicate TPQ payer identities on bound operational D1.
Changes only payer foreign keys for an already-posted November payment; all
financial amounts, dates, periods, methods, payment IDs and allocation IDs
remain unchanged. Refuses to operate if the live data differs from audit.
"""
import json,os,urllib.request,uuid,time
a=os.environ["CLOUDFLARE_ACCOUNT_ID"];t=os.environ["CLOUDFLARE_API_TOKEN"]
base="https://api.cloudflare.com/client/v4/accounts/"+a
def call(path,method="GET",payload=None):
    data=json.dumps(payload).encode() if payload is not None else None
    headers={"Authorization":"Bearer "+t,"Accept":"application/json"}
    if data:headers["Content-Type"]="application/json"
    request=urllib.request.Request(base+path,headers=headers,method=method,data=data)
    with urllib.request.urlopen(request,timeout=70) as r:res=json.load(r)
    if res.get("success") is not True:raise RuntimeError("Cloudflare rejected the request")
    return res.get("result")
d=next((x for x in call("/d1/database") if x.get("name")=="flamboyan4-staging"),None)
if not d:raise RuntimeError("Bound DB unavailable; no changes")
setting=call("/workers/scripts/flamboyan4-terpadu-staging/settings")
bind=next((x for x in setting.get("bindings",[]) if x.get("type")=="d1" and x.get("name")=="DB"),None)
if not bind or bind.get("id")!=d["uuid"]:raise RuntimeError("Refuse different D1 binding")
path="/d1/database/"+d["uuid"]+"/query"
def q(sql,*params):
    res=call(path,"POST",{"sql":sql,"params":list(params)})
    if not isinstance(res,list) or len(res)!=1 or not res[0].get("success"):
        raise RuntimeError("D1 statement rejected")
    time.sleep(.12)
    return res[0].get("results") or []
def assert_equal(x,y,what):
    if x!=y:raise RuntimeError("Guard mismatch: "+what)
    return True
people=q("""SELECT p.id,p.active,p.display_name,p.household_id,p.member_id,p.payer_type,
h.house_code FROM bookkeeping_payers p
JOIN households h ON h.id=p.household_id
WHERE upper(replace(h.house_code,' ',''))='A5/43' AND lower(trim(p.display_name))='tpq'
ORDER BY p.id LIMIT 5""")
assert_equal(len(people),2,"expected exactly two historic TPQ identities")
assert_equal(len({p["household_id"] for p in people}),1,"payer household")
for p in people:
    assert_equal(p["payer_type"],"warga","payer type")
    assert_equal(p["member_id"],None,"payer must not own a separate login/member")
profiles=q("SELECT payer_id,status_aktif FROM resident_directory_profiles WHERE payer_id IN (?,?)",people[0]["id"],people[1]["id"])
profile={x["payer_id"]:x["status_aktif"] for x in profiles}
payment=q("""SELECT p.id,p.payer_id,p.status,p.amount_rp,p.paid_on,p.household_id,
a.id AS alloc_id,a.payer_id AS alloc_payer,a.period_year,a.period_month,
a.contribution_type,a.amount_rp AS alloc_amount,a.status AS alloc_status
FROM bookkeeping_payments p JOIN bookkeeping_payment_allocations a ON a.payment_id=p.id
WHERE p.payer_id IN (?,?) ORDER BY p.payer_id,p.id,a.id""",people[0]["id"],people[1]["id"])
byid={p["id"]:[] for p in people}
for row in payment:byid[row["payer_id"]].append(row)
def months(payer):
    return {int(x["period_month"]) for x in byid[payer] if x["period_year"]==2026 and x["contribution_type"]=="KEBERSIHAN" and x["alloc_amount"]==20000 and x["status"]=="aktif" and x["alloc_status"]=="aktif"}
old=[p for p in people if months(p["id"])=={9,10}]
other=[p for p in people if months(p["id"])=={11}]
if len(old)!=1 or len(other)!=1 or old[0]["id"]==other[0]["id"]:
    raise RuntimeError("Cannot identify one Sep-Oct payer and one Nov payer")
keep,duplicate=old[0]["id"],other[0]["id"]
# Keep exactly the verified historical three payment entries; zero-value IURAN_BULANAN is allowed.
payids={x["id"] for x in payment}
assert_equal(len(payids),3,"three payments in total")
for pid in payids:
    lines=[x for x in payment if x["id"]==pid]
    assert_equal(len({x["payer_id"] for x in lines}),1,"payment payer")
    assert_equal(lines[0]["status"],"aktif","payment active")
    assert_equal(lines[0]["amount_rp"],20000,"payment amount")
    assert_equal(lines[0]["household_id"],old[0]["household_id"],"payment household")
    assert_equal(sum(int(x["alloc_amount"]) for x in lines),20000,"allocated total")
    for x in lines:
        if x["alloc_payer"]!=x["payer_id"] and not (x["payer_id"]==keep and x["alloc_payer"]==duplicate):
            raise RuntimeError("Unexpected allocation-payer mismatch")
        if int(x["period_year"])!=2026 or int(x["period_month"]) not in (9,10,11):
            raise RuntimeError("Unexpected payment period")
        if (x["contribution_type"],int(x["alloc_amount"])) not in (("KEBERSIHAN",20000),("IURAN_BULANAN",0)):
            raise RuntimeError("Unexpected category or amount")
assert_equal(set(int(x["period_month"]) for x in payment if x["contribution_type"]=="KEBERSIHAN"),{9,10,11},"month coverage")
nov_payment_ids={x["id"] for x in payment if int(x["period_month"])==11 and x["contribution_type"]=="KEBERSIHAN"}
assert_equal(len(nov_payment_ids),1,"single November payment")
nov_id=next(iter(nov_payment_ids))
# Verify old and newer obligation versions all describe only one monthly cleaning fee.
vers=q("""SELECT payer_id,effective_from,qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan
FROM bookkeeping_payer_obligation_periods WHERE payer_id IN (?,?) ORDER BY payer_id,effective_from""",keep,duplicate)
assert_equal(len([x for x in vers if x["payer_id"]==keep]),1,"historical versions")
assert_equal(len([x for x in vers if x["payer_id"]==duplicate]),2,"duplicate versions")
for x in vers:
    assert_equal([x["qty_iuran_bulanan"],x["qty_kebersihan"],x["qty_kas_lorong"],x["qty_arisan"]],[0,1,0,0],"obligation types")
assert_equal([x["effective_from"] for x in vers if x["payer_id"]==keep],["2000-01-01"],"base period")
assert_equal([x["effective_from"] for x in vers if x["payer_id"]==duplicate],["2026-10-01","2026-11-01"],"duplicate period")
for table in ("bookkeeping_cash_transactions","bookkeeping_fines","bookkeeping_loans","bookkeeping_advances"):
    found=q("SELECT COUNT(*) AS n FROM "+table+" WHERE payer_id IN (?,?)",keep,duplicate)
    assert_equal(found[0]["n"],0,"no dependent records in "+table)
# Protect all monetary totals using a live BEFORE snapshot.
def invariant():
    r=q("""SELECT COUNT(DISTINCT p.id) AS payments,COALESCE(SUM(a.amount_rp),0) AS allocation_rp
    FROM bookkeeping_payments p JOIN bookkeeping_payment_allocations a ON a.payment_id=p.id
    WHERE p.id IN (?,?,?)""",*sorted(payids))[0]
    return (r["payments"],r["allocation_rp"])
before=invariant()
assert_equal(before,(3,60000),"total financial invariants")
# Audit the repair in D1 BEFORE any foreign key changes.
audit_id="audit:reconcile-tpq-A5-43-20261110"
audit_payload=json.dumps({"house":"A5/43","keep":keep,"merged":duplicate,"nov_payment":nov_id,
    "previous_allocation_total":60000,"description":"id-only correction; no new money or payment"})
q("""INSERT OR IGNORE INTO audit_log
(id,actor_account_id,scope,action,target_type,target_id,reason,before_json,after_json)
VALUES (?,NULL,'pembukuan','reconcile_tpq_duplicate_identity','bookkeeping_payers',?,
'Koreksi identitas TPQ A5/43; tanpa transaksi dan nominal baru',?,?)""",
audit_id,duplicate,audit_payload,audit_payload)
# Repoint *one* existing November transaction to the earlier canonical TPQ payer.
# A retry after a partial failure remains safe: conditional WHERE + postconditions.
pnow=q("SELECT payer_id FROM bookkeeping_payments WHERE id=?",nov_id)
if not pnow:raise RuntimeError("November payment disappeared")
if pnow[0]["payer_id"]==duplicate:
    q("""UPDATE bookkeeping_payments SET payer_id=?
      WHERE id=? AND payer_id=? AND status='aktif'""",keep,nov_id,duplicate)
elif pnow[0]["payer_id"]!=keep:
    raise RuntimeError("Unexpected November payment owner")
anow=q("SELECT id,payer_id FROM bookkeeping_payment_allocations WHERE payment_id=?",nov_id)
assert_equal(len(anow),1,"single November allocation")
if anow[0]["payer_id"]==duplicate:
    q("""UPDATE bookkeeping_payment_allocations SET payer_id=?
      WHERE id=? AND payment_id=? AND payer_id=? AND period_year=2026
      AND period_month=11 AND contribution_type='KEBERSIHAN' AND amount_rp=20000
      AND status='aktif'""",keep,anow[0]["id"],nov_id,duplicate)
elif anow[0]["payer_id"]!=keep:
    raise RuntimeError("Unexpected November allocation owner")
q("UPDATE bookkeeping_payers SET active=0 WHERE id=? AND active=1",duplicate)
if duplicate in profile:
    q("UPDATE resident_directory_profiles SET status_aktif='Tidak' WHERE payer_id=?",duplicate)
# Verify no outstanding for any covered month under canonical payer.
people_after=q("SELECT id,active FROM bookkeeping_payers WHERE id IN (?,?)",keep,duplicate)
assert_equal({x["id"]:x["active"] for x in people_after},{keep:1,duplicate:0},"one active identity")
pay_after=q("""SELECT p.payer_id,a.payer_id AS allocation_payer,a.period_month,a.amount_rp,
a.contribution_type,a.status AS al_status,p.status AS p_status
FROM bookkeeping_payment_allocations a JOIN bookkeeping_payments p ON p.id=a.payment_id
WHERE p.id IN (?,?,?)""",*sorted(payids))
if any(x["payer_id"]!=keep or x["allocation_payer"]!=keep for x in pay_after):
    raise RuntimeError("Incomplete relinking of payment and allocation payer IDs")
for month in (9,10,11):
    amount=sum(x["amount_rp"] for x in pay_after if x["period_month"]==month and x["contribution_type"]=="KEBERSIHAN" and x["p_status"]=="aktif" and x["al_status"]=="aktif")
    assert_equal(amount,20000,"month "+str(month)+" must be fully allocated")
assert_equal(invariant(),before,"financial totals unchanged")
q("""INSERT OR IGNORE INTO audit_log
(id,actor_account_id,scope,action,target_type,target_id,reason,before_json,after_json)
VALUES (?,NULL,'pembukuan','reconcile_tpq_duplicate_verified','bookkeeping_payers',?,
'Verifikasi akhir rekonsiliasi TPQ A5/43',?,?)""",
audit_id+":verified",keep,audit_payload,
json.dumps({"canonical":keep,"archived_duplicate":duplicate,"months":[9,10,11],
"paid_per_month_rp":20000,"financial_total_unchanged":True}))
print("F4_TPQ_RECONCILED="+json.dumps({"db_binding_verified":True,"active_tpq":1,
"month_september_paid":True,"month_october_paid":True,"month_november_paid":True,
"financial_total_unchanged":True,"payment_count":3,
"duplicate_id_inactivated":True,"audit_written":True}))
