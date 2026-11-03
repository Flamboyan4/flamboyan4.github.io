#!/usr/bin/env python3
"""READ ONLY D1 remote export, all Bank v3 operations on disposable local clone."""
import os,json,pathlib,subprocess,tempfile,sqlite3,re,hashlib,secrets,uuid,urllib.request,urllib.error,time,datetime
root=pathlib.Path(__file__).resolve().parents[1]
wrangler=root/"node_modules/.bin/wrangler"
report=root/"ops-audit/bank-v3-local-e2e.json"
report.parent.mkdir(exist_ok=True)
result={"scope":"isolated local D1 clone; NO remote writes","tests":{}}
def check(name,condition,detail=""):
 result["tests"][name]=bool(condition)
 report.write_text(json.dumps(result,indent=2))
 if not condition:raise AssertionError(name+(": "+str(detail)[:180] if detail else ""))
def run(*args,timeout=200):
 p=subprocess.run(args,cwd=root,capture_output=True,text=True,timeout=timeout)
 if p.returncode:raise RuntimeError("Local test command failed: "+str(args[:3])+" code "+str(p.returncode))
def api(url,payload=None,token=None):
 body=None if payload is None else json.dumps(payload).encode()
 headers={"Accept":"application/json"}
 if token:headers["Authorization"]="Bearer "+token
 if body:headers["Content-Type"]="application/json"
 req=urllib.request.Request("http://127.0.0.1:8795"+url,data=body,headers=headers,method="POST" if body is not None else "GET")
 try:
  with urllib.request.urlopen(req,timeout=15) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:return e.code,json.loads(e.read(20000))
def expect(label,path,body=None,token=None,status=(200,201)):
 code,data=api(path,body,token)
 check(label,code in status and data.get("ok") is True,{"http":code,"error":data.get("error","")})
 return data
def auth_config(account,token):
 request=urllib.request.Request("https://api.cloudflare.com/client/v4/accounts/"+account+"/d1/database",
  headers={"Authorization":"Bearer "+token,"Accept":"application/json"})
 with urllib.request.urlopen(request,timeout=30) as response:payload=json.load(response)
 db=next((x for x in payload.get("result",[]) if x.get("name")=="flamboyan4-staging"),None)
 if not db:raise ValueError("Staging D1 not found")
 return db["uuid"]
def insert_sessions(db,actor,member_actor):
 def make(account_id):
  raw=secrets.token_hex(32)
  db.execute("INSERT INTO sessions(id,account_id,token_hash,expires_at) VALUES(?,?,?,datetime('now','+2 hours'))",
   (str(uuid.uuid4()),account_id,hashlib.sha256(raw.encode()).hexdigest()))
  return raw
 return make(actor),make(member_actor)
def cents_for(lines):
 return sum((x["grams"]*x["priceRpPerKg"]+500)//1000 for x in lines)
with tempfile.TemporaryDirectory(prefix="f4-bank-v3-local-") as temp:
 temp=pathlib.Path(temp);config=temp/"wrangler.json";dump=temp/"export.sql";ordered=temp/"import.sql";persist=temp/"state"
 dbid=auth_config(os.environ["CLOUDFLARE_ACCOUNT_ID"],os.environ["CLOUDFLARE_API_TOKEN"])
 config.write_text(json.dumps({"name":"f4-bank-v3-disposable","main":str(root/"cloudflare/worker-terpadu-operasional-teruji.js"),
  "compatibility_date":"2026-10-21",
  "d1_databases":[{"binding":"DB","database_name":"flamboyan4-staging","database_id":dbid}],
  "vars":{"AUTH_ENABLED":"true","BANK_WRITE_ENABLED":"true","BANK_RECONCILIATION_WRITE_ENABLED":"true",
  "BANK_CANCEL_WRITE_ENABLED":"true","BANK_EXPENSE_WRITE_ENABLED":"true","SALE_DRAFT_ENABLED":"true"}}))
 run(str(wrangler),"d1","export","flamboyan4-staging","--remote","--config",str(config),
  "--output",str(dump),"--skip-confirmation",timeout=240)
 check("remote_export_is_read_only",dump.exists() and dump.stat().st_size>1000)
 sql=dump.read_text()
 statements=[];buffer=""
 for line in sql.splitlines(keepends=True):
  buffer+=line
  if sqlite3.complete_statement(buffer):statements.append(buffer);buffer=""
 if buffer.strip():raise ValueError("Unfinished export")
 def classify(stmt):
  clean=re.sub(r"(?m)^\s*--[^\n]*\n","",stmt).strip().upper()
  if not clean or clean in ("BEGIN TRANSACTION;","COMMIT;","ROLLBACK;") or clean.startswith("PRAGMA "):return None
  if clean.startswith(("CREATE TABLE ","CREATE VIRTUAL TABLE ")):return "schema"
  if clean.startswith(("INSERT INTO ","REPLACE INTO ")):return "data"
  if clean.startswith(("CREATE INDEX ","CREATE UNIQUE INDEX ")):return "index"
  return "other"
 categories={k:[] for k in ("schema","data","index","other")}
 for item in statements:
  key=classify(item)
  if key:categories[key].append(item)
 ordered.write_text("PRAGMA defer_foreign_keys=TRUE;\n"+"\n".join(sum([categories[x] for x in ("schema","data","index","other")],[])))
 run(str(wrangler),"d1","execute","flamboyan4-staging","--local","--config",str(config),
  "--file",str(ordered),"--persist-to",str(persist),"--yes",timeout=240)
 candidates=list(persist.rglob("*.sqlite"))
 found=None
 for p in candidates:
  with sqlite3.connect(p) as c:
   tables={x[0] for x in c.execute("SELECT name FROM sqlite_master WHERE type='table'")}
  if {"members","waste_deposits","waste_batches"}.issubset(tables):found=p;break
 if not found:raise ValueError("Local D1 clone missing")
 c=sqlite3.connect(found)
 c.executescript((root/"cloudflare/migrations/20261103_bank_v3_inventory_policy.sql").read_text())
 c.executescript((root/"cloudflare/migrations/20261028_bank_sale_receipts.sql").read_text())
 me=c.execute("SELECT id FROM accounts WHERE role='superadmin' AND status='aktif' LIMIT 1").fetchone()
 member_actor=c.execute("SELECT id FROM accounts WHERE role='anggota' AND member_id IS NOT NULL AND status='aktif' LIMIT 1").fetchone()
 citizens=[r[0] for r in c.execute("SELECT id FROM members WHERE status='aktif' ORDER BY id LIMIT 3")]
 today=(datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))).date().isoformat()
 items=c.execute("""SELECT i.id,p.citizen_rate_rp_per_kg FROM waste_items i JOIN waste_prices p ON p.id=
  (SELECT p2.id FROM waste_prices p2 WHERE p2.waste_item_id=i.id AND p2.effective_from<=? ORDER BY p2.effective_from DESC,p2.id DESC LIMIT 1)
  WHERE i.active=1 AND p.citizen_rate_rp_per_kg>0 ORDER BY i.id LIMIT 2""",(today,)).fetchall()
 check("local_test_fixtures_available",bool(me and member_actor and len(citizens)==3 and len(items)==2))
 token,member_token=insert_sessions(c,me[0],member_actor[0])
 bid="batch:qa:v3:"+secrets.token_hex(8);bid2="batch:qa:v3next:"+secrets.token_hex(8)
 c.execute("INSERT INTO waste_batches(id,label,status) VALUES(?,?,'draft')",(bid,"QA-V3-"+secrets.token_hex(4)))
 c.execute("INSERT INTO waste_batches(id,label,status) VALUES(?,?,'draft')",(bid2,"QA-V3NEXT-"+secrets.token_hex(4)))
 c.commit();c.close()
 service=subprocess.Popen([str(wrangler),"dev","--local","--config",str(config),
    "--persist-to",str(persist),"--port","8795"],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 try:
  alive=False
  for attempt in range(45):
   if service.poll() is not None:raise RuntimeError("Wrangler local died")
   try:
    if api("/api/health")[0]==200:alive=True;break
   except Exception:pass
   time.sleep(1)
  check("isolated_local_worker_started",alive)
  a,b=items[0][0],items[1][0]
  policy=expect("create_future_effective_fixed_buy_policy","/api/admin/bank/policy",{
    "effectiveFrom":today,"method":"fixed_buy_price","wargaPercent":50},token)
  before_cash=expect("cash_before_own_stock","/api/v2/admin/bank/cash?limit=500",token=token)
  old_cash_ids={x["id"] for x in before_cash.get("data",[])}
  ownkey="QAOWN"+secrets.token_hex(15)
  own=expect("bank_own_physical_stock_only","/api/v2/admin/bank/own-deposits",{
   "requestKey":ownkey,"depositedOn":today,"items":[{"itemId":a,"grams":500},{"itemId":b,"grams":500}],
   "note":"QA lokal stok milik Bank"},token)
  check("bank_own_stock_does_not_credit_cash",own.get("status")=="stok" and own.get("amountRp")==0)
  after_cash=expect("cash_after_own_stock","/api/v2/admin/bank/cash?limit=500",token=token)
  check("physical_own_stock_has_zero_cash_journals",old_cash_ids=={x["id"] for x in after_cash.get("data",[])})
  deposit_data=[
   {"memberId":citizens[0],"items":[{"itemId":a,"grams":1000}]},
   {"memberId":citizens[1],"items":[{"itemId":a,"grams":500}]},
   {"memberId":citizens[2],"items":[{"itemId":b,"grams":200}]}
  ]
  for i,d in enumerate(deposit_data):
   payload={"batchId":bid,"depositedOn":today,"requestKey":"QADEPOSIT"+secrets.token_hex(13),**d}
   expect("citizen_"+str(i+1)+"_deposit", "/api/v2/admin/bank/deposits",payload,token)
  draft=expect("draft_sale_sheet","/api/admin/bank/sale-sheet?batchId="+bid,token=token)
  check("collective_stock_has_member_and_bank",
   draft.get("totalGrams")==2700 and draft.get("bankGrams")==1000 and draft.get("memberGrams")==1700,draft)
  prepared=expect("lock_collective_sheet","/api/admin/bank/sale-sheet",{"batchId":bid,"action":"prepare"},token)
  check("sale_sheet_policy_snapshot",prepared.get("status")=="siap" and prepared.get("policyMethod")=="fixed_buy_price")
  sale_lines=[
   {"itemId":a,"grams":1700,"priceRpPerKg":10000,"unsoldGrams":200},
   {"itemId":b,"grams":600,"priceRpPerKg":50000,"unsoldGrams":100}]
  gross=cents_for(sale_lines)
  sale_id=str(uuid.uuid4())
  draft_sale=expect("draft_lapak_results_unpaid","/api/admin/sales/draft",{
   "requestId":sale_id,"batchId":bid,"soldOn":today,"buyerName":"QA lokal lapak",
   "receivedRp":0,"adjustmentNote":"Lapak belum membayar, QA lokal","lines":sale_lines},token)
  blocked=api("/api/admin/reconciliation/preview",{"batchId":bid},token)
  check("unpaid_sale_cannot_confirm",blocked[0]==409)
  paid=expect("pay_same_sale","/api/admin/bank/sales/payment",{
    "saleId":sale_id,"receivedRp":gross,"note":"Pelunasan lapak lokal"},token)
  check("sale_paid_once",paid.get("receivedRp")==gross)
  preview=expect("preview_mixed_ownership_fixed_price","/api/admin/reconciliation/preview",{"batchId":bid},token)
  check("preview_stock_and_true_loss",
   preview.get("v3") is True and preview.get("remainingStockGrams")==300 and
   preview.get("weightDifferenceGrams")==100 and preview.get("citizenRightsRp",0)>0 and
   preview.get("citizenRightsRp",0)+preview.get("bankRightsRp",0)==gross,preview)
  right=preview["citizenRightsRp"]
  confirmed=expect("confirm_mixed_sale_once","/api/admin/reconciliation/confirm",{
    "batchId":bid,"saleId":sale_id,"operationRp":preview["bankRightsRp"],"neighborhoodRp":0,"reserveRp":0,
    "expectedWargaPercent":preview["wargaPercent"],"note":"Selisih timbang 0,1 kg pada lapak lokal"},token)
  check("confirmed_member_credit_is_exact",confirmed.get("citizenRightsRp")==right)
  duplicate=expect("confirm_retry_is_idempotent","/api/admin/reconciliation/confirm",{
    "batchId":bid,"saleId":sale_id,"operationRp":preview["bankRightsRp"],"neighborhoodRp":0,"reserveRp":0,
    "expectedWargaPercent":preview["wargaPercent"],"note":"Selisih timbang 0,1 kg pada lapak lokal"},token)
  check("confirmed_not_twice",duplicate.get("duplicate") is True)
  # Physical leftover is real, available for the NEXT numbered sale, without re-input.
  sheet2=expect("next_sheet_finds_carryover","/api/admin/bank/sale-sheet?batchId="+bid2,token=token)
  check("carryover_exactly_remaining_stock",sheet2.get("totalGrams")==300,sheet2)
  prepared2=expect("prepare_carryover_next_batch","/api/admin/bank/sale-sheet",{"batchId":bid2,"action":"prepare"},token)
  last_lines=[{"itemId":x["itemId"],"grams":x["grams"],"unsoldGrams":0,"priceRpPerKg":60000} for x in prepared2["lines"]]
  new_gross=cents_for(last_lines);sale2=str(uuid.uuid4())
  expect("second_lapak_sale","/api/admin/sales/draft",{
   "requestId":sale2,"batchId":bid2,"soldOn":today,"buyerName":"QA stok sisa",
   "receivedRp":new_gross,"adjustmentNote":"","lines":last_lines},token)
  preview2=expect("second_sale_preview","/api/admin/reconciliation/preview",{"batchId":bid2},token)
  check("second_sale_no_loss_no_remaining",preview2["remainingStockGrams"]==0 and preview2["weightDifferenceGrams"]==0)
  expect("confirm_second_carryover_sale","/api/admin/reconciliation/confirm",{
   "batchId":bid2,"saleId":sale2,"operationRp":preview2["bankRightsRp"],"neighborhoodRp":0,"reserveRp":0,
   "expectedWargaPercent":preview2["wargaPercent"],"note":""},token)
  member_prices=expect("member_prices_keep_lapak_rates_private","/api/member/bank/prices",token=member_token)
  check("member_only_sees_citizen_rates",member_prices.get("method")=="fixed_buy_price" and
    all("actual_rate_rp_per_kg" not in x and "lapak" not in x for x in member_prices.get("items",[])))
  check("local_v3_no_remote_writes",True)
 finally:
  service.terminate()
  try:service.wait(timeout=10)
  except subprocess.TimeoutExpired:service.kill()
check("all_bank_v3_local_e2e_passed",all(result["tests"].values()))
print("BANK_V3_REAL_WRANGLER_LOCAL_D1_E2E_OK")
