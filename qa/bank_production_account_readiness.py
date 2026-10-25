#!/usr/bin/env python3
"""Bank Sampah PRODUCTION read-only readiness census.

Reads Cloudflare D1 via SELECT and Cloudflare Worker binding configuration via GET.
Never prints names, usernames, member identifiers, credential hashes or account IDs.
Never POSTs to the Flamboyan application, never changes a D1 row.
"""
import datetime,hashlib,json,os,re,urllib.request

ACCOUNT=os.environ["CLOUDFLARE_ACCOUNT_ID"]
TOKEN=os.environ["CLOUDFLARE_API_TOKEN"]
BASE="https://api.cloudflare.com/client/v4/accounts/"+ACCOUNT

def cloudflare(path,method="GET",body=None):
    if method not in ("GET","POST"):raise RuntimeError("Disallowed HTTP method")
    headers={"Authorization":"Bearer "+TOKEN,"Accept":"application/json"}
    data=None if body is None else json.dumps(body).encode()
    if data is not None:headers["Content-Type"]="application/json"
    req=urllib.request.Request(BASE+path,method=method,headers=headers,data=data)
    with urllib.request.urlopen(req,timeout=40) as response:raw=json.load(response)
    if raw.get("success") is not True:raise RuntimeError("Cloudflare read-only request unsuccessful")
    return raw.get("result")

databases=cloudflare("/d1/database")
db=next((v for v in databases if v.get("name")=="flamboyan4-staging"),None)
if not db:raise RuntimeError("Expected D1 staging database not found")
settings=cloudflare("/workers/scripts/flamboyan4-terpadu-staging/settings")
bindings={b.get("name"):b for b in settings.get("bindings",[])}
if bindings.get("DB",{}).get("type")!="d1" or bindings["DB"].get("id")!=db["uuid"]:
    raise RuntimeError("Refuse unmatched Worker/D1 production database")
def get_rows(sql):
    if not sql.lstrip().upper().startswith(("SELECT ","PRAGMA ")):
        raise RuntimeError("Only SELECT/PRAGMA allowed")
    if ";" in sql:raise RuntimeError("Multiple SQL statements prohibited")
    ret=cloudflare("/d1/database/"+db["uuid"]+"/query","POST",{"sql":sql})
    if not isinstance(ret,list) or len(ret)!=1 or ret[0].get("success") is not True:
        raise RuntimeError("Cloudflare D1 SELECT unsuccessful")
    return ret[0].get("results",[])

members=get_rows("SELECT id,status FROM members")
accounts=get_rows("SELECT id,username,password_hash,password_scheme,role,status,member_id,locked_until FROM accounts")
photos=get_rows("SELECT progress_id,photo_url FROM bank_progress_photos")
deposits=get_rows("SELECT status,COUNT(*) AS n FROM waste_deposits GROUP BY status")
# Only grouped accounting metadata is logged; no identities or individual transactions.
payment_inventory=get_rows("SELECT status,COUNT(*) AS n FROM bookkeeping_payments GROUP BY status")
allocation_inventory=get_rows("SELECT contribution_type,COUNT(*) AS n,COALESCE(SUM(amount_rp),0) AS total FROM bookkeeping_payment_allocations GROUP BY contribution_type")
allocation_gap=get_rows("SELECT COUNT(*) AS total, SUM(CASE WHEN EXISTS (SELECT 1 FROM bookkeeping_payment_allocations a WHERE a.payment_id=p.id) THEN 0 ELSE 1 END) AS without_allocations FROM bookkeeping_payments p")
historical_months=get_rows("SELECT substr(p.paid_on,1,7) AS month,COUNT(DISTINCT p.id) AS payments,COUNT(a.id) AS allocations FROM bookkeeping_payments p LEFT JOIN bookkeeping_payment_allocations a ON a.payment_id=p.id WHERE substr(p.paid_on,1,7) IN ('2026-09','2026-10') GROUP BY substr(p.paid_on,1,7)")
payer_link_audit=get_rows("SELECT COUNT(*) AS linked_payers FROM bookkeeping_payers p JOIN members m ON m.id=p.member_id WHERE p.payer_type='warga' AND p.active=1")
now=datetime.datetime.now(datetime.timezone.utc)
valid_hash=lambda a: bool(re.fullmatch(r"pbkdf2-sha256:100000:[0-9a-f]{32}:[0-9a-f]{64}",str(a.get("password_hash") or ""))) and a.get("password_scheme")=="pbkdf2-sha256"
def is_locked(a):
    stamp=a.get("locked_until")
    if not stamp:return False
    try:
        return datetime.datetime.fromisoformat(str(stamp).replace(" ","T").replace("Z","+00:00")).replace(tzinfo=datetime.timezone.utc)>now
    except ValueError:return True

active_members={r["id"] for r in members if r.get("status")=="aktif"}
active_accounts=[a for a in accounts if a.get("status")=="aktif"]
linked={member_id:[a for a in active_accounts if a.get("member_id")==member_id and a.get("role")=="anggota"] for member_id in active_members}
member_accounts=[a for a in active_accounts if a.get("role")=="anggota"]
manager_accounts=[a for a in active_accounts if a.get("role") in ("admin","superadmin")]
report={
  "active_members":len(active_members),
  "active_member_logins":len(member_accounts),
  "active_members_without_one_login":sum(len(v)!=1 for v in linked.values()),
  "active_members_invalid_password_hash":sum(not valid_hash(v[0]) for v in linked.values() if len(v)==1),
  "active_members_locked":sum(is_locked(v[0]) for v in linked.values() if len(v)==1),
  "orphan_active_member_logins":sum(a.get("member_id") not in active_members for a in member_accounts),
  "active_manager_accounts":len(manager_accounts),
  "active_managers_invalid_password_hash":sum(not valid_hash(a) for a in manager_accounts),
  "active_managers_locked":sum(is_locked(a) for a in manager_accounts),
  "active_superadmin_accounts":sum(a.get("role")=="superadmin" for a in manager_accounts),
  "photo_references":len(photos),
  "missing_photo_references":sum(not str(p.get("photo_url") or "").startswith("https://") for p in photos),
  "historical_deposit_status_counts":{str(x.get("status")):int(x["n"]) for x in deposits},
  "auth_binding_enabled":bindings.get("AUTH_ENABLED",{}).get("text")=="true",
  "bank_write_binding_enabled":bindings.get("BANK_WRITE_ENABLED",{}).get("text")=="true",
  "bank_reconciliation_binding_enabled":bindings.get("BANK_RECONCILIATION_WRITE_ENABLED",{}).get("text")=="true",
  "bank_payout_binding_enabled":bindings.get("BANK_PAYOUT_WRITE_ENABLED",{}).get("text")=="true",
  "bank_expense_binding_enabled":bindings.get("BANK_EXPENSE_WRITE_ENABLED",{}).get("text")=="true",
  "payments_status_counts":{str(x.get("status")):x.get("n") for x in payment_inventory},
  "allocations_by_kind":{str(x.get("contribution_type")):{"rows":x.get("n"),"total":x.get("total")} for x in allocation_inventory},
  "payments_without_allocations":allocation_gap[0].get("without_allocations") if allocation_gap else None,
  "payments_all":allocation_gap[0].get("total") if allocation_gap else None,
  "sep_oct_2026_allocation_counts":historical_months,
  "payer_member_link_count":payer_link_audit[0].get("linked_payers") if payer_link_audit else None,
  "database_mutated":False
}
report["ready_for_genuine_user_acceptance"]=all([
 report["active_members"]==33,
 report["active_members_without_one_login"]==0,
 report["active_members_invalid_password_hash"]==0,
 report["active_members_locked"]==0,
 report["orphan_active_member_logins"]==0,
 report["active_manager_accounts"]>=1,
 report["active_managers_invalid_password_hash"]==0,
 report["active_managers_locked"]==0,
 report["active_superadmin_accounts"]>=1,
 report["auth_binding_enabled"],
 report["bank_write_binding_enabled"],
 report["bank_reconciliation_binding_enabled"],
 report["bank_payout_binding_enabled"],
 report["bank_expense_binding_enabled"]
])
# Aggregate values ONLY. Do not add usernames, hashes, or resident-specific values to output.
print("BANK_PRODUCTION_READINESS="+json.dumps(report,sort_keys=True))
if not report["ready_for_genuine_user_acceptance"]:
    raise RuntimeError("Production readiness blockers found. See only aggregate counts above.")
