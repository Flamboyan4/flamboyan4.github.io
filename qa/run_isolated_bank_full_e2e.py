#!/usr/bin/env python3
"""Isolated Cloudflare D1 roundtrip: remote export is READ-ONLY; all writes LOCAL."""
import os, json, pathlib, urllib.request, urllib.error, subprocess
import sqlite3, hashlib, secrets, uuid, time, datetime, glob, sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
WRANGLER=str(ROOT/"node_modules/.bin/wrangler")
LOCAL=pathlib.Path("/tmp/flamboyan4-d1-canary-state")
CONFIG=ROOT/"qa/wrangler.local.json"
DUMP=pathlib.Path("/tmp/flamboyan4-d1-private-export.sql")
REPORT=ROOT/"ops-audit/local-bank-full-e2e.json"
REPORT.parent.mkdir(exist_ok=True)
result={"checked_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"type":"REMOTE_EXPORT_LOCAL_D1_BANK_FULL_E2E","tests":{},"status":"started"}
def save():
    REPORT.write_text(json.dumps(result,indent=2)+"\n",encoding="utf8")

def run(cmd,timeout=180):
    p=subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True,timeout=timeout)
    if p.returncode!=0:
        # Do not emit any part of the exported SQL, credentials, or private record values.
        raise RuntimeError("Command failed: "+str(cmd[:4])+" ("+str(p.returncode)+"); "+p.stderr[-600:].replace(os.environ.get("CLOUDFLARE_API_TOKEN","__NEVER__"),"[redacted]"))
    return p.stdout

def call(url,method="GET",payload=None,token=None):
    data=None if payload is None else json.dumps(payload).encode()
    headers={"Accept":"application/json"}
    if data is not None:headers["Content-Type"]="application/json"
    if token:headers["Authorization"]="Bearer "+token
    req=urllib.request.Request(url,method=method,data=data,headers=headers)
    try:
        with urllib.request.urlopen(req,timeout=8) as response:
            raw=response.read(1000000)
            return response.status,json.loads(raw)
    except urllib.error.HTTPError as error:
        return error.code,json.loads(error.read(1000000))

def assert_step(name,ok,details=None):
    result["tests"][name]={"passed":bool(ok)}
    if details is not None:result["tests"][name]["detail"]=details
    save()
    if not ok:raise AssertionError("Isolated test failed: "+name)

save()
try:
    account=os.environ["CLOUDFLARE_ACCOUNT_ID"]
    token=os.environ["CLOUDFLARE_API_TOKEN"]
    url="https://api.cloudflare.com/client/v4/accounts/"+account+"/d1/database"
    req=urllib.request.Request(url,headers={"Authorization":"Bearer "+token,"Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=25) as response:js=json.load(response)
    entries=js.get("result",[])
    db=next((x for x in entries if x.get("name")=="flamboyan4-staging"),None)
    if not db:raise ValueError("Target staging D1 not found")
    id=db["uuid"]
    CONFIG.parent.mkdir(exist_ok=True)
    CONFIG.write_text(json.dumps({
      "name":"f4-ops-local-only",
      "main":"../cloudflare/worker-terpadu-operasional-teruji.js",
      "compatibility_date":"2026-10-21",
      "d1_databases":[{"binding":"DB","database_name":"flamboyan4-staging","database_id":id}],
      "r2_buckets":[{"binding":"PHOTOS","bucket_name":"f4-local-only"}],
      "vars":{"AUTH_ENABLED":"true","FINANCE_WRITE_ENABLED":"true","MANUAL_CASH_WRITE_ENABLED":"true",
        "IURAN_WRITE_ENABLED":"false","DENDA_PINJAMAN_WRITE_ENABLED":"false",
        "TALANGAN_WRITE_ENABLED":"true","BANK_WRITE_ENABLED":"true",
        "BANK_RECONCILIATION_WRITE_ENABLED":"true","BANK_PAYOUT_WRITE_ENABLED":"true",
        "BANK_EXPENSE_WRITE_ENABLED":"true","BANK_CANCEL_WRITE_ENABLED":"true",
        "BANK_INVENTORY_WRITE_ENABLED":"true","BANK_MEDIA_WRITE_ENABLED":"true",
        "PORTAL_WRITE_ENABLED":"false","SALE_DRAFT_ENABLED":"true"}
      }),encoding="utf8")
    assert_step("remote_target_verified",True)
    run([WRANGLER,"d1","export","flamboyan4-staging","--remote","--config",str(CONFIG),"--output",str(DUMP),"--skip-confirmation"],timeout=180)
    assert_step("remote_export_read_only",DUMP.exists() and DUMP.stat().st_size>1000)
    import re
    sqltext=DUMP.read_text(encoding="utf-8")
    ddl_tables=re.findall(r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[\"`\[]?([A-Za-z0-9_]+)",sqltext,re.I)
    result["export_meta"]={"sql_bytes":len(sqltext),"table_ddls":len(ddl_tables),"has_cash_create":bool(re.search(r"CREATE\s+TABLE[^;]*bookkeeping_cash_transactions",sqltext,re.I)),"cash_refs":sqltext.lower().count("bookkeeping_cash_transactions")}
    save()
    # Cloudflare export may order child-table INSERT before parent CREATE TABLE.
    # Reorder statements only in this ephemeral local copy; never modify remote.
    statements=[];buffer=""
    for line in sqltext.splitlines(keepends=True):
        buffer+=line
        if sqlite3.complete_statement(buffer):
            statements.append(buffer)
            buffer=""
    if buffer.strip():raise ValueError("Unterminated SQL export statement")
    def identify(st):
        stripped=re.sub(r"(?m)^\s*--[^\n]*\n","",st).strip()
        return stripped.upper().lstrip()
    schema=[];inserts=[];indices=[];other=[]
    for stmt in statements:
        tag=identify(stmt)
        if not tag or tag in ("BEGIN TRANSACTION;","COMMIT;","ROLLBACK;") or tag.startswith("PRAGMA "):continue
        if tag.startswith("CREATE TABLE ") or tag.startswith("CREATE VIRTUAL TABLE "):schema.append(stmt)
        elif tag.startswith("INSERT INTO ") or tag.startswith("REPLACE INTO "):inserts.append(stmt)
        elif tag.startswith("CREATE INDEX ") or tag.startswith("CREATE UNIQUE INDEX "):indices.append(stmt)
        else:other.append(stmt)
    result["export_meta"]["groups"]={"schema":len(schema),"inserts":len(inserts),"indices":len(indices),"other":len(other)}
    save()
    ordered=pathlib.Path("/tmp/f4-ordered-ephemeral.sql")
    ordered.write_text("PRAGMA defer_foreign_keys=TRUE;\n"+"\n".join(schema+inserts+indices+other),encoding="utf8")
    run([WRANGLER,"d1","execute","flamboyan4-staging","--local","--config",str(CONFIG),"--file",str(ordered),"--persist-to",str(LOCAL),"--yes"],timeout=180)
    files=list(LOCAL.rglob("*.sqlite"))
    if not files:raise ValueError("Local SQLite state missing after import")
    connection=sqlite3.connect(str(files[0]))
    connection.execute("PRAGMA foreign_keys=ON")
    table_names=[x[0] for x in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")]
    assert_step("local_clone_schema",len(table_names)>=50,{"table_count":len(table_names)})
    actor=connection.execute("SELECT id FROM accounts WHERE role='superadmin' AND status='aktif' LIMIT 1").fetchone()
    if not actor:raise ValueError("Active superadmin account not found in local clone")
    temporary=secrets.token_hex(32)
    digest=hashlib.sha256(temporary.encode()).hexdigest()
    connection.execute("INSERT INTO sessions(id,account_id,token_hash,expires_at) VALUES(?,?,?,datetime('now','+2 hours'))",(str(uuid.uuid4()),actor[0],digest))
    connection.commit()
    q="SELECT COUNT(*),COALESCE(SUM(CASE WHEN status='aktif' THEN debit_rp-credit_rp ELSE 0 END),0) FROM bookkeeping_cash_transactions"
    baseline=connection.execute(q).fetchone()
    # Synthetic fixture exists ONLY in the LOCAL D1 clone.
    selected_member=connection.execute("SELECT id FROM members WHERE status='aktif' LIMIT 1").fetchone()
    selected_item=connection.execute("""SELECT i.id,p.citizen_rate_rp_per_kg
      FROM waste_items i JOIN waste_prices p ON p.waste_item_id=i.id
      WHERE i.active=1 AND p.citizen_rate_rp_per_kg>0 AND p.effective_from<='2026-10-25'
      ORDER BY p.effective_from DESC LIMIT 1""").fetchone()
    if not selected_member or not selected_item:raise ValueError("Active member or priced category missing")
    bank_member,bank_item=selected_member[0],selected_item[0]
    bank_rate=int(selected_item[1])
    batch_id="batch:qa:"+secrets.token_hex(10)
    connection.execute("INSERT INTO waste_batches(id,label,status) VALUES(?,?,'draft')",(batch_id,"QA LOCAL ONLY"))
    connection.commit()
    connection.close()
    assert_step("temporary_session_only_in_clone",True)
    log=open("/tmp/f4-wrangler-local.log","w")
    process=subprocess.Popen([WRANGLER,"dev","--local","--config",str(CONFIG),"--persist-to",str(LOCAL),"--port","8787"],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT)
    try:
        health=None
        for attempt in range(35):
            if process.poll() is not None:raise RuntimeError("Local Worker stopped unexpectedly")
            try:
                health=call("http://127.0.0.1:8787/api/health")
                if health[0]==200:break
            except Exception:pass
            time.sleep(1)
        assert_step("local_worker_health",health is not None and health[0]==200)
        base="http://127.0.0.1:8787"
        key="CashQA"+secrets.token_hex(16)
        original={"tanggal":"2026-10-25","jenis":"debit","jumlahRp":123,"kategori":"QA Isolated","keterangan":"Uji otomatis (salinan D1)","metode":"Cash","catatan":"Not production","requestKey":key}
        unauthorized=call(base+"/api/bookkeeping/cash","POST",original)
        assert_step("public_cash_write_blocked",unauthorized[0] in (401,403),{"status":unauthorized[0]})
        create=call(base+"/api/bookkeeping/cash","POST",original,temporary)
        txid=create[1].get("id","")
        assert_step("cash_create",create[0] in (200,201) and txid.startswith("cash-"),{"status":create[0]})
        replay=call(base+"/api/bookkeeping/cash","POST",original,temporary)
        assert_step("cash_idempotency",replay[0]==200 and replay[1].get("id")==txid and replay[1].get("duplikat") is True)
        ledger=call(base+"/api/bookkeeping/cash?limit=300",token=temporary)
        assert_step("cash_read",ledger[0]==200 and txid in json.dumps(ledger[1]))
        altered={k:v for k,v in original.items() if k!="requestKey"}
        altered.update({"id":txid,"jumlahRp":234})
        edit=call(base+"/api/bookkeeping/cash/edit","POST",altered,temporary)
        assert_step("cash_edit",edit[0]==200 and edit[1].get("updated") is True)
        cancel=call(base+"/api/bookkeeping/cash/cancel","POST",{"id":txid},temporary)
        assert_step("cash_cancel",cancel[0]==200 and cancel[1].get("status")=="dibatalkan")
        duplicate_cancel=call(base+"/api/bookkeeping/cash/cancel","POST",{"id":txid},temporary)
        assert_step("cash_double_cancel_blocked",duplicate_cancel[0] in (400,409))

        # Fully isolated money-flow test: no remote writes are possible via --local.
        bank_base=base
        deposit_key="QADeposit"+secrets.token_hex(18)
        deposit_data={"requestKey":deposit_key,"batchId":batch_id,"memberId":bank_member,
                      "depositedOn":"2026-10-25","items":[{"itemId":bank_item,"grams":1000}]}
        deposited=call(bank_base+"/api/v2/admin/bank/deposits","POST",deposit_data,temporary)
        assert_step("bank_deposit_save",deposited[0]==201 and deposited[1].get("id","").startswith("deposit:api:"),{"status":deposited[0]})
        deposit_dup=call(bank_base+"/api/v2/admin/bank/deposits","POST",deposit_data,temporary)
        assert_step("bank_deposit_idempotent",deposit_dup[0]==200 and deposit_dup[1].get("duplicate") is True)
        sale_id=str(uuid.uuid4())
        sale_gross=bank_rate
        sale_data={"requestId":sale_id,"batchId":batch_id,"soldOn":"2026-10-25","buyerName":"LOCAL QA TEST",
                   "lines":[{"itemId":bank_item,"grams":1000,"priceRpPerKg":bank_rate}],
                   "receivedRp":sale_gross,"adjustmentNote":"LOCAL TEST"}
        sold=call(bank_base+"/api/admin/sales/draft","POST",sale_data,temporary)
        assert_step("bank_draft_sale_save",sold[0]==200 and sold[1].get("id")==sale_id,{"status":sold[0]})
        preview=call(bank_base+"/api/admin/reconciliation/preview","POST",{"batchId":batch_id},temporary)
        data=preview[1]
        assert_step("bank_preview_50_50",preview[0]==200 and data.get("citizenRightsRp")==sale_gross//2
            and data.get("environmentRp")==sale_gross-sale_gross//2
            and sum(v.get("amountRp",0) for v in data.get("rights",[]))==sale_gross//2,
            {"status":preview[0]})
        environmental=data["environmentRp"]
        confirmed=call(bank_base+"/api/admin/reconciliation/confirm","POST",{"batchId":batch_id,"saleId":sale_id,
              "operationRp":environmental,"neighborhoodRp":0,"reserveRp":0},temporary)
        assert_step("bank_reconcile_confirm",confirmed[0]==201 and confirmed[1].get("status")=="disahkan",
            {"status":confirmed[0]})
        confirmed_again=call(bank_base+"/api/admin/reconciliation/confirm","POST",{"batchId":batch_id,"saleId":sale_id,
              "operationRp":environmental,"neighborhoodRp":0,"reserveRp":0},temporary)
        assert_step("bank_confirm_idempotent",confirmed_again[0]==200 and confirmed_again[1].get("duplicate") is True,
            {"status":confirmed_again[0]})
        wkey="QAWithdraw"+secrets.token_hex(18)
        overdraw={"requestKey":wkey,"memberId":bank_member,"withdrawnOn":"2026-10-25",
                  "amountRp":sale_gross+100000,"note":"LOCAL QA negative test"}
        rejected=call(bank_base+"/api/v2/admin/bank/withdrawals","POST",overdraw,temporary)
        assert_step("bank_overdraw_blocked",rejected[0] in (400,409),{"status":rejected[0]})
        withdraw_amount=max(1,min(25,sale_gross//2))
        withdrawn=call(bank_base+"/api/v2/admin/bank/withdrawals","POST",
            {"requestKey":"QAWithdraw"+secrets.token_hex(18),"memberId":bank_member,
             "withdrawnOn":"2026-10-25","amountRp":withdraw_amount,"note":"LOCAL QA cash out"},temporary)
        assert_step("bank_payout_save",withdrawn[0]==201 and withdrawn[1].get("amountRp")==withdraw_amount,
            {"status":withdrawn[0]})
        expense_amount=max(1,min(20,environmental))
        expense=call(bank_base+"/api/v2/admin/bank/expenses","POST",
           {"requestKey":"QAExpense"+secrets.token_hex(18),"incurredOn":"2026-10-25","kind":"pengeluaran",
            "budgetPost":"operasional","description":"Biaya percobaan LOCAL QA","quantity":1,
            "unit":"unit","unitPriceRp":expense_amount,"vendor":"","note":"QA","toInventory":False,"evidenceUrl":""},
            temporary)
        assert_step("bank_expense_save",expense[0]==201 and expense[1].get("nominal")==expense_amount,{"status":expense[0]})
        # Query local persistent DB after the API writes (never remote D1).
        check_db=sqlite3.connect(str(files[0]))
        allocated=check_db.execute("SELECT citizen_rights_rp,operation_rp FROM waste_allocations WHERE batch_id=?",(batch_id,)).fetchone()
        rights=check_db.execute("SELECT COALESCE(SUM(amount_rp),0) FROM waste_savings_ledger WHERE batch_id=? AND kind='kredit'",(batch_id,)).fetchone()[0]
        withdraws=check_db.execute("SELECT COALESCE(SUM(amount_rp),0) FROM waste_savings_ledger WHERE member_id=? AND kind='pencairan' AND note='LOCAL QA cash out'",(bank_member,)).fetchone()[0]
        fbal=check_db.execute("""SELECT fund_position,COALESCE(SUM(cash_in_rp-cash_out_rp),0)
          FROM waste_cash_ledger WHERE status='aktif' AND source_transaction_id LIKE ?
          GROUP BY fund_position""",("bank%",)).fetchall()
        check_db.close()
        assert_step("bank_allocated_ledger_50_50",allocated==(sale_gross//2,environmental) and rights==sale_gross//2,
            {"rights":rights,"environment":environmental})
        assert_step("bank_payout_and_expense_ledger",withdraws==withdraw_amount and withdrawn[0]==201 and expense[0]==201)

    finally:
        process.terminate()
        try:process.wait(timeout=8)
        except subprocess.TimeoutExpired:process.kill()
        log.close()
    connection=sqlite3.connect(str(files[0]))
    final=connection.execute(q).fetchone()
    actual=connection.execute("SELECT status,debit_rp FROM bookkeeping_cash_transactions WHERE id=?",(txid,)).fetchone()
    connection.close()
    assert_step("cash_accounting_unchanged_after_cancel",final[0]==baseline[0]+1 and final[1]==baseline[1] and actual[0]=="dibatalkan")
    result["status"]="passed"
except Exception as error:
    result["status"]="failed"
    result["error"]=type(error).__name__+": "+str(error)[:300]
    raise
finally:
    save()
    try:DUMP.unlink()
    except FileNotFoundError:pass
    try:CONFIG.unlink()
    except FileNotFoundError:pass
    print("Isolated QA status:",result["status"],"checks:",len(result["tests"]))
