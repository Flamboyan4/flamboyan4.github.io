#!/usr/bin/env python3
"""Isolated Cloudflare D1 roundtrip: remote export is READ-ONLY; all writes LOCAL."""
import os, json, pathlib, urllib.request, urllib.error, subprocess
import sqlite3, hashlib, secrets, uuid, time, datetime, glob, sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
WRANGLER=str(ROOT/"node_modules/.bin/wrangler")
LOCAL=pathlib.Path("/tmp/flamboyan4-d1-canary-state")
CONFIG=ROOT/"qa/wrangler.local.json"
DUMP=pathlib.Path("/tmp/flamboyan4-d1-private-export.sql")
REPORT=ROOT/"ops-audit/local-cash-e2e.json"
REPORT.parent.mkdir(exist_ok=True)
result={"checked_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"type":"REMOTE_EXPORT_LOCAL_D1_ONLY","tests":{},"status":"started"}
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
        "TALANGAN_WRITE_ENABLED":"false","BANK_WRITE_ENABLED":"false",
        "PORTAL_WRITE_ENABLED":"false","SALE_DRAFT_ENABLED":"false"}
      }),encoding="utf8")
    assert_step("remote_target_verified",True)
    run([WRANGLER,"d1","export","flamboyan4-staging","--remote","--config",str(CONFIG),"--output",str(DUMP),"--yes"],timeout=180)
    assert_step("remote_export_read_only",DUMP.exists() and DUMP.stat().st_size>1000)
    run([WRANGLER,"d1","execute","flamboyan4-staging","--local","--config",str(CONFIG),"--file",str(DUMP),"--persist-to",str(LOCAL),"--yes"],timeout=180)
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
