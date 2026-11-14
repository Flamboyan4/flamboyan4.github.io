#!/usr/bin/env python3
"""READ-ONLY production Bank Sampah D1/API integrity. Outputs aggregates only."""
import json,os,re,sys,urllib.request,urllib.error
ACCOUNT=os.getenv("CLOUDFLARE_ACCOUNT_ID","")
TOKEN=os.getenv("CLOUDFLARE_API_TOKEN","")
ROOT="https://api.cloudflare.com/client/v4/accounts/"+ACCOUNT
checks={};counts={}
def check(name,ok):checks[name]=bool(ok)
def request(url,token=False,sql=None):
    data=None if sql is None else json.dumps({"sql":sql}).encode()
    headers={"Accept":"application/json","User-Agent":"F4-Bank-Audit-ReadOnly"}
    if token:headers["Authorization"]="Bearer "+TOKEN
    if data:headers["Content-Type"]="application/json"
    req=urllib.request.Request(url,data=data,headers=headers,method="POST" if data else "GET")
    try:
        with urllib.request.urlopen(req,timeout=25) as res:return res.status,json.loads(res.read(2000000))
    except urllib.error.HTTPError as ex:
        try:body=json.loads(ex.read(200000))
        except Exception:body={}
        return ex.code,body
def cloud(path,sql=None):
    http,body=request(ROOT+path,True,sql)
    if http!=200 or body.get("success") is not True:raise RuntimeError("Cloudflare API unavailable")
    return body["result"]
def select(db,sql):
    if not re.match(r"^SELECT\s+",sql,re.I) or any(x in sql for x in (";","--","/*")):
        raise ValueError("Only one SELECT statement allowed")
    data=cloud("/d1/database/"+db+"/query",sql)
    if not isinstance(data,list) or len(data)!=1 or not data[0].get("success"):
        raise RuntimeError("D1 SELECT returned an error")
    return data[0].get("results",[])
def count(db,sql):
    return int(select(db,sql)[0]["n"])
def api(name,path,expect,fields=()):
    try:
        status,data=request("https://api.flamboyan4.web.id"+path)
        check(name,status in expect and all(k in data for k in fields))
        counts[name+"_status"]=status
    except Exception:check(name,False)
api("health","/api/health",{200})
api("public_overview","/api/v2/public/bank",{200},("overview","progress"))
api("report_requires_login","/api/v2/public/bank/report",{401,403})
api("savings_requires_login","/api/member/savings",{401,403})
api("admin_requires_login","/api/v2/admin/bank/members?limit=1",{401,403})
if not ACCOUNT or not TOKEN:check("cloudflare_credentials",False)
else:
  try:
    databases=cloud("/d1/database")
    database=next((x for x in databases if x.get("name")=="flamboyan4-staging"),None)
    check("database_exists",bool(database))
    if not database:raise RuntimeError("database not found")
    db=database["uuid"]
    settings=cloud("/workers/scripts/flamboyan4-terpadu-staging/settings")
    binding=next((x for x in settings.get("bindings",[]) if x.get("name")=="DB"),{})
    check("worker_binding",binding.get("type")=="d1" and binding.get("id")==db)
    names={r["name"] for r in select(db,"SELECT name FROM sqlite_master WHERE type='table'")}
    tables=["members","accounts","waste_deposits","waste_sales","waste_payout_requests",
      "bank_v3_inventory_lots","bank_v3_inventory_movements","bank_v3_batches",
      "bank_v3_settlements","waste_cash_ledger"]
    check("required_tables",all(n in names for n in tables))
    counts["required_tables_present"]=sum(n in names for n in tables)
    for name in tables:
        if name in names:counts["rows_"+name]=count(db,"SELECT COUNT(*) AS n FROM "+name)
    if {"members","waste_payout_requests"}<=names:
        check("payout_member_reference",count(db,"SELECT COUNT(*) AS n FROM waste_payout_requests p LEFT JOIN members m ON m.id=p.member_id WHERE m.id IS NULL")==0)
        check("paid_payout_has_ledger",count(db,"SELECT COUNT(*) AS n FROM waste_payout_requests WHERE status='dibayar' AND (ledger_id IS NULL OR ledger_id='')")==0)
    if {"members","bank_v3_inventory_lots"}<=names:
        check("inventory_member_reference",count(db,"SELECT COUNT(*) AS n FROM bank_v3_inventory_lots l LEFT JOIN members m ON m.id=l.member_id WHERE l.owner_kind='member' AND m.id IS NULL")==0)
        check("inventory_weights",count(db,"SELECT COUNT(*) AS n FROM bank_v3_inventory_lots WHERE remaining_grams<0 OR remaining_grams>initial_grams")==0)
    if {"bank_v3_inventory_movements","bank_v3_inventory_lots"}<=names:
        check("movement_lot_reference",count(db,"SELECT COUNT(*) AS n FROM bank_v3_inventory_movements m LEFT JOIN bank_v3_inventory_lots l ON l.id=m.lot_id WHERE l.id IS NULL")==0)
        check("movement_grams",count(db,"SELECT COUNT(*) AS n FROM bank_v3_inventory_movements WHERE allocated_grams!=sold_grams+stock_grams+loss_grams")==0)
    if {"bank_v3_batches","bank_v3_settlements"}<=names:
        check("settlement_batch_reference",count(db,"SELECT COUNT(*) AS n FROM bank_v3_settlements s LEFT JOIN bank_v3_batches b ON b.batch_id=s.batch_id WHERE b.batch_id IS NULL")==0)
        check("settlement_rights_sum",count(db,"SELECT COUNT(*) AS n FROM bank_v3_settlements WHERE gross_rp!=citizen_rights_rp+bank_rights_rp")==0)
    check("d1_queries_completed",True)
  except Exception as e:
    check("d1_queries_completed",False);counts["d1_error_class"]=type(e).__name__
failed=[k for k,v in checks.items() if not v]
print("BANK_INTEGRITY_READONLY="+json.dumps({"checks":checks,"counts":counts,"failed":failed,"data_modified":False},sort_keys=True))
if failed:sys.exit(1)
