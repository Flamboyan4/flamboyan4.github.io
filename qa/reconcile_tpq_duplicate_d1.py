#!/usr/bin/env python3
"""One-time guarded merge of duplicate TPQ A5/43 payer identities, operational D1.
Canonical: active 'warga' TPQ with 2026-11 payment.
Source: active 'lembaga' TPQ with 2026-09 and 2026-10 payments.
Only historical foreign-key relations and an additive Sep obligation are adjusted.
No money amounts, dates, methods, payment IDs, allocation IDs or financial status change.
"""
import json,os,time,urllib.request
account=os.environ["CLOUDFLARE_ACCOUNT_ID"];token=os.environ["CLOUDFLARE_API_TOKEN"]
root="https://api.cloudflare.com/client/v4/accounts/"+account
def api(path,method="GET",body=None):
    payload=json.dumps(body).encode("utf-8") if body is not None else None
    headers={"Authorization":"Bearer "+token,"Accept":"application/json"}
    if payload:headers["Content-Type"]="application/json"
    request=urllib.request.Request(root+path,method=method,data=payload,headers=headers)
    with urllib.request.urlopen(request,timeout=65) as response:
        result=json.load(response)
    if result.get("success") is not True:raise RuntimeError("Cloudflare API request failed")
    return result.get("result")
databases=api("/d1/database")
db=next((d for d in databases if d.get("name")=="flamboyan4-staging"),None)
if not db:raise RuntimeError("Operational D1 missing")
settings=api("/workers/scripts/flamboyan4-terpadu-staging/settings")
bound=next((b for b in settings.get("bindings",[]) if b.get("name")=="DB" and b.get("type")=="d1"),None)
if not bound or bound.get("id")!=db.get("uuid"):
    raise RuntimeError("D1 UUID differs from the production Worker binding")
path="/d1/database/"+db["uuid"]+"/query"
def q(sql,*args):
    out=api(path,"POST",{"sql":sql,"params":list(args)})
    if not isinstance(out,list) or len(out)!=1 or not out[0].get("success"):
        raise RuntimeError("Cloudflare D1 SQL execution failed")
    time.sleep(.12)
    return out[0].get("results") or []
def verify(value,expected,context):
    if value!=expected:raise RuntimeError("Reconciliation preflight mismatch: "+context)
def compare_rows():
    return q("""SELECT p.id,p.display_name,p.active,p.payer_type,p.member_id,p.household_id,
    h.house_code FROM bookkeeping_payers p JOIN households h ON h.id=p.household_id
    WHERE lower(trim(p.display_name))='tpq'
      AND upper(replace(h.house_code,' ',''))='A5/43'
    ORDER BY p.id LIMIT 5""")
people=compare_rows()
verify(len(people),2,"exactly two TPQ records")
types={x["payer_type"]:x for x in people}
verify(set(types),{"warga","lembaga"},"one warga, one lembaga")
keep=types["warga"];previous=types["lembaga"]
verify(keep["household_id"],previous["household_id"],"same household")
verify(keep["member_id"],None,"primary has no member login")
verify(previous["member_id"],None,"legacy has no member login")
# A partial previous run can be resumed without resetting or overwriting other records.
verify(int(keep["active"]),1,"canonical payer active")
if int(previous["active"]) not in (0,1):
    raise RuntimeError("Unexpected old payer status")
source=previous["id"];target=keep["id"]
pay=q("""SELECT p.id,p.payer_id,p.status,p.amount_rp,p.paid_on,p.household_id,
a.id AS allocation_id,a.payer_id AS allocation_payer,a.period_year,a.period_month,
a.contribution_type,a.amount_rp AS allocation_amount,a.status AS allocation_status
FROM bookkeeping_payments p JOIN bookkeeping_payment_allocations a ON a.payment_id=p.id
WHERE p.payer_id IN (?,?) ORDER BY p.id,a.id""",source,target)
# If already partly relinked, the IDs stay stable; detect source payment month from allocations.
payids={x["id"] for x in pay}
verify(len(payids),3,"exactly three distinct payments")
month_pay={}
for payment_id in payids:
    lines=[x for x in pay if x["id"]==payment_id]
    verify(len({x["payer_id"] for x in lines}),1,"single payer per payment")
    verify(lines[0]["status"],"aktif","payment status")
    verify(lines[0]["household_id"],keep["household_id"],"payment household")
    verify(int(lines[0]["amount_rp"]),20000,"payment amount")
    verify(sum(int(x["allocation_amount"]) for x in lines),20000,"allocation total")
    months={int(x["period_month"]) for x in lines}
    verify(len(months),1,"payment covers single calendar month")
    month=next(iter(months))
    if month not in (9,10,11):raise RuntimeError("Unexpected TPQ payment period")
    if month in month_pay:raise RuntimeError("More than one TPQ payment in same month")
    month_pay[month]=payment_id
    for x in lines:
        verify(int(x["period_year"]),2026,"allocation year")
        verify(x["allocation_status"],"aktif","allocation status")
        if (x["contribution_type"],int(x["allocation_amount"])) not in (("KEBERSIHAN",20000),("IURAN_BULANAN",0)):
            raise RuntimeError("Unexpected financial category")
        # A previous partial step may have moved an allocation but not its parent payment.
        if x["payer_id"] not in (source,target) or x["allocation_payer"] not in (source,target):
            raise RuntimeError("Unrecognized TPQ payment owner")
verify(set(month_pay),{9,10,11},"September through November complete")
for x in pay:
    if x["period_month"]==11:
        verify(x["payer_id"],target,"November must belong to canonical payer")
    elif int(previous["active"])==1 and x["payer_id"] not in (source,target):
        raise RuntimeError("Old payment owner changed")
# The source and canonical obligations match for all three months.
versions=q("""SELECT payer_id,effective_from,qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan
FROM bookkeeping_payer_obligation_periods WHERE payer_id IN (?,?)
ORDER BY payer_id,effective_from""",source,target)
old_versions=[x for x in versions if x["payer_id"]==source]
new_versions=[x for x in versions if x["payer_id"]==target]
verify(len(old_versions),1,"one legacy obligation snapshot")
verify([x["effective_from"] for x in old_versions],["2000-01-01"],"legacy snapshot")
actual_dates=[x["effective_from"] for x in new_versions]
if actual_dates not in (["2026-10-01","2026-11-01"],["2026-09-01","2026-10-01","2026-11-01"]):
    raise RuntimeError("Unexpected canonical obligation version schedule")
for v in versions:
    verify([int(v["qty_iuran_bulanan"]),int(v["qty_kebersihan"]),int(v["qty_kas_lorong"]),int(v["qty_arisan"])],
         [0,1,0,0],"solely one cleaning unit")
for table in ("bookkeeping_cash_transactions","bookkeeping_fines","bookkeeping_loans","bookkeeping_advances"):
    verify(q("SELECT COUNT(*) AS n FROM "+table+" WHERE payer_id IN (?,?)",source,target)[0]["n"],0,"no dependent "+table)
def allocation_snapshot():
    return q("""SELECT p.id,p.payer_id,a.id AS allocation_id,a.payer_id AS allocation_payer,
a.amount_rp,a.period_month,a.contribution_type
FROM bookkeeping_payments p JOIN bookkeeping_payment_allocations a ON a.payment_id=p.id
WHERE p.id IN (?,?,?) ORDER BY p.id,a.id""",month_pay[9],month_pay[10],month_pay[11])
before=allocation_snapshot()
verify(len(before),5,"five known allocation rows")
verify(sum(int(x["amount_rp"]) for x in before),60000,"total rupiah before")
# Guard write: one audit-plan row first, then narrowly scoped id-only operations.
audit="audit:tpq-a5-43-merge-20261110"
note=json.dumps({"canonical_id":target,"archived_id":source,"months":[9,10,11],
"total_rp":60000,"identity_only":True,"change":"Repoint Sep-Oct FK to existing Nov payer"})
q("""INSERT OR IGNORE INTO audit_log
(id,actor_account_id,scope,action,target_type,target_id,reason,before_json,after_json)
VALUES (?,NULL,'pembukuan','plan_merge_tpq_a5_43','bookkeeping_payers',?,
'Gabung ID lama lembaga TPQ dengan pembayar TPQ warga; nominal tetap',?,?)""",
audit,target,note,note)
# Bind September's historical obligation to canonical payer, preserving Oct-Nov versions.
q("""INSERT OR IGNORE INTO bookkeeping_payer_obligation_periods
(payer_id,effective_from,qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan,created_by)
VALUES (?,'2026-09-01',0,1,0,0,NULL)""",target)
# Two historical payments retain their original IDs and all monetary values.
for month in (9,10):
    payment_id=month_pay[month]
    q("""UPDATE bookkeeping_payment_allocations SET payer_id=?
    WHERE payment_id=? AND payer_id=? AND period_year=2026 AND period_month=?
      AND status='aktif'""",target,payment_id,source,month)
    q("""UPDATE bookkeeping_payments SET payer_id=?
    WHERE id=? AND payer_id=? AND status='aktif' AND amount_rp=20000""",
    target,payment_id,source)
# Archive only the superseded institution alias; no delete or rewrites of payment content.
q("UPDATE bookkeeping_payers SET active=0 WHERE id=? AND payer_type='lembaga' AND active=1",source)
q("UPDATE resident_directory_profiles SET status_aktif='Tidak' WHERE payer_id=?",source)
# Exact post-checks for both accounting identity and cents.
after=allocation_snapshot()
verify(len(after),len(before),"allocation row count invariant")
verify([(x["id"],x["allocation_id"],x["amount_rp"],x["period_month"],x["contribution_type"]) for x in after],
       [(x["id"],x["allocation_id"],x["amount_rp"],x["period_month"],x["contribution_type"]) for x in before],
       "all financial IDs amounts and months unchanged")
verify({x["payer_id"] for x in after},{target},"all payments consolidated")
verify({x["allocation_payer"] for x in after},{target},"all allocations consolidated")
verify(sum(int(x["amount_rp"]) for x in after),60000,"unchanged rupiah sum")
status=compare_rows()
verify({x["payer_type"]:int(x["active"]) for x in status},{"warga":1,"lembaga":0},"only one active payer")
# Backend outstanding for the surviving 'warga' identity will read 20k active
# KEBERSIHAN allocation against the 20k monthly obligation for all three months.
for month in (9,10,11):
    due=q("""SELECT COALESCE(SUM(a.amount_rp),0) AS amount FROM bookkeeping_payment_allocations a
    JOIN bookkeeping_payments p ON p.id=a.payment_id
    WHERE a.payer_id=? AND a.period_year=2026 AND a.period_month=?
    AND a.contribution_type='KEBERSIHAN' AND a.status='aktif' AND p.status='aktif'""",
    target,month)[0]["amount"]
    verify(int(due),20000,"monthly paid allocation "+str(month))
q("""INSERT OR IGNORE INTO audit_log
(id,actor_account_id,scope,action,target_type,target_id,reason,before_json,after_json)
VALUES (?,NULL,'pembukuan','verify_merge_tpq_a5_43','bookkeeping_payers',?,
'Identitas TPQ direkonsiliasi; pembayaran 3 bulan dan nominal tetap',?,?)""",
audit+":verified",target,note,json.dumps({"reconciled":True,"months":[9,10,11],"cash_unchanged":True,"active_payers":1}))
print("F4_TPQ_D1_RECONCILIATION_OK="+json.dumps(
{"live_worker_binding_verified":True,"active_tpq_accounts":1,"sept_paid":True,
"oct_paid":True,"nov_paid":True,"money_unchanged_rp":60000,
"payment_count_unchanged":3,"allocation_count_unchanged":5,"audit_verified":True}))
