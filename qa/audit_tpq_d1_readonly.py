#!/usr/bin/env python3
"""Read-only audit of TPQ October 2026 in the bound operational D1 database.
No personal rosters, credentials or raw query results appear in logs."""
import json, os, sys, urllib.request, urllib.error

account=os.environ["CLOUDFLARE_ACCOUNT_ID"]
token=os.environ["CLOUDFLARE_API_TOKEN"]
base="https://api.cloudflare.com/client/v4/accounts/"+account
headers={"Authorization":"Bearer "+token,"Accept":"application/json"}

def call(path, method="GET", data=None):
    payload=None if data is None else json.dumps(data).encode()
    req=urllib.request.Request(base+path,data=payload,method=method,
        headers={**headers,**({"Content-Type":"application/json"} if payload else {})})
    with urllib.request.urlopen(req,timeout=70) as result:
        response=json.load(result)
    if response.get("success") is not True:raise RuntimeError("Cloudflare API call rejected")
    return response.get("result")

def query(db,sql,params=None):
    result=call("/d1/database/"+db+"/query","POST",{"sql":sql,"params":params or []})
    if not isinstance(result,list) or len(result)!=1 or not result[0].get("success"):
        raise RuntimeError("D1 query rejected")
    return result[0].get("results") or []

def label(payer_id):
    if payer_id=="W0018":return "historical_W0018"
    if payer_id and payer_id.startswith("payer:"):return "new_payer"
    if payer_id:return "other_id"
    return "missing"

databases=call("/d1/database")
db=next((d for d in databases if d.get("name")=="flamboyan4-staging"),None)
if db is None:raise RuntimeError("Expected operational D1 database missing")
worker=call("/workers/scripts/flamboyan4-terpadu-staging/settings")
bindings=worker.get("bindings") or []
bound=next((b for b in bindings if b.get("name")=="DB" and b.get("type")=="d1"),None)
if not bound or bound.get("id")!=db.get("uuid"):
    raise RuntimeError("D1 ID does not match the deployed Worker DB binding")
dbid=db["uuid"]

payers=query(dbid,"""SELECT p.id,p.display_name,p.active,p.household_id,h.house_code
FROM bookkeeping_payers p LEFT JOIN households h ON h.id=p.household_id
WHERE p.id='W0018' OR lower(trim(p.display_name))='tpq'
OR upper(replace(h.house_code,' ',''))='A5/43'
ORDER BY p.id LIMIT 30""")
tpq=[p for p in payers if str(p.get("display_name") or "").strip().lower()=="tpq"]
house=[p for p in payers if str(p.get("house_code") or "").upper().replace(" ","")=="A5/43"]
records=query(dbid,"""SELECT p.id,p.payer_id,p.paid_on,p.amount_rp AS received,
p.status AS payment_status,a.id AS allocation_id,a.payer_id AS allocation_payer,
a.period_year,a.period_month,a.contribution_type,a.amount_rp AS allocated,
a.status AS allocation_status
FROM bookkeeping_payments p LEFT JOIN bookkeeping_payment_allocations a ON a.payment_id=p.id
WHERE p.id IN ('PAY0021','PAY0052')
ORDER BY p.id,a.period_year,a.period_month,a.id LIMIT 30""")
versions=query(dbid,"""SELECT v.payer_id,v.effective_from,v.qty_iuran_bulanan,
v.qty_kebersihan,v.qty_kas_lorong,v.qty_arisan
FROM bookkeeping_payer_obligation_periods v JOIN bookkeeping_payers p ON p.id=v.payer_id
LEFT JOIN households h ON h.id=p.household_id
WHERE (p.id='W0018' OR lower(trim(p.display_name))='tpq')
  AND (upper(replace(h.house_code,' ',''))='A5/43' OR p.id='W0018')
ORDER BY v.payer_id,v.effective_from LIMIT 35""")
tariffs=query(dbid,"SELECT contribution_type,amount_rp FROM bookkeeping_contribution_tariffs WHERE contribution_type='KEBERSIHAN'")
allocations=query(dbid,"""SELECT a.payer_id,a.period_year,a.period_month,a.contribution_type,
a.amount_rp,a.status AS allocation_status,p.status AS payment_status,
p.id AS payment_id
FROM bookkeeping_payment_allocations a JOIN bookkeeping_payments p ON p.id=a.payment_id
JOIN bookkeeping_payers bp ON bp.id=p.payer_id
LEFT JOIN households h ON h.id=bp.household_id
WHERE a.period_year=2026 AND a.period_month IN (9,10)
AND (bp.id='W0018' OR lower(trim(bp.display_name))='tpq')
AND (upper(replace(h.house_code,' ',''))='A5/43' OR bp.id='W0018')
ORDER BY a.period_month,a.payer_id,p.id LIMIT 60""")
report={
    "db_binding_verified":True,
    "payers":[{"id_class":label(p["id"]),"id_equals_original":p["id"]=="W0018",
      "name_tpq":str(p["display_name"] or "").strip().lower()=="tpq",
      "same_house":str(p["house_code"] or "").upper().replace(" ","")=="A5/43",
      "active":int(p["active"] or 0)} for p in payers],
    "source_records":[{"payment":r["id"],"payment_payer":label(r["payer_id"]),
      "allocation":r["allocation_id"],"allocation_payer":label(r["allocation_payer"]),
      "period":str(r["period_year"])+"-"+str(r["period_month"]),
      "category":r["contribution_type"],"paid_date":r["paid_on"],
      "paid_rp":r["received"],"allocated_rp":r["allocated"],
      "payment_status":r["payment_status"],"allocation_status":r["allocation_status"]} for r in records],
    "obligation_versions":[{"id_class":label(v["payer_id"]),"effective":v["effective_from"],
      "qty":[v["qty_iuran_bulanan"],v["qty_kebersihan"],v["qty_kas_lorong"],v["qty_arisan"]]} for v in versions],
    "tariff_kebersihan":[x["amount_rp"] for x in tariffs],
    "allocations":[{"payer":label(a["payer_id"]),
      "period":str(a["period_year"])+"-"+str(a["period_month"]),
      "category":a["contribution_type"],"amount":a["amount_rp"],
      "payment_status":a["payment_status"],"allocation_status":a["allocation_status"],
      "known_bulk":a["payment_id"] in ("PAY0021","PAY0052")} for a in allocations]
}
print("F4_TPQ_AUDIT_JSON="+json.dumps(report,separators=(",",":"),ensure_ascii=False))
