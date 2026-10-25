#!/usr/bin/env python3
"""Isolated Cloudflare D1 roundtrip: remote export is READ-ONLY; all writes LOCAL."""
import os, json, pathlib, urllib.request, urllib.error, subprocess
import sqlite3, hashlib, secrets, uuid, time, datetime, glob, sys, urllib.parse

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
        "IURAN_WRITE_ENABLED":"true","DENDA_PINJAMAN_WRITE_ENABLED":"false",
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
    migration=(ROOT/"cloudflare/migrations/20261025_bank_progress_photos.sql").read_text(encoding="utf8")
    connection.executescript(migration)
    connection.executescript((ROOT/"cloudflare/migrations/20261025_portal_legacy_arisan_jersey.sql").read_text(encoding="utf8"))
    portal_counts=(connection.execute("SELECT COUNT(*) FROM portal_arisan_schedule").fetchone()[0],
                   connection.execute("SELECT COUNT(*) FROM portal_jersey_orders").fetchone()[0])
    assert_step("portal_legacy_source_to_d1_local",portal_counts==(26,26))
    assert_step("bank_progress_photo_migration_local_only",
      "bank_progress_photos" in {x[0] for x in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")})
    if os.environ.get("F4_BANK_PRIVATE_AUDIT","").strip().lower() in ("true","1","yes"):
        from private_bank_roster_extract import emit
        emit(connection)
        assert_step("roster_encrypted_for_private_parity_check",True)
    # Original spreadsheet upload: 33 roster rows, 2 inventory, 1 documentation,
    # 3 progress entries, and zero manually entered deposit/expense rows.
    # Counts are an audit baseline, not proof of per-person identity migration.
    source_baseline={"roster_rows":33,"inventory_rows":2,"documentation_rows":1,
                     "progress_rows":3,"deposit_rows":0,"expense_rows":0}
    actual_counts={
      "active_members":connection.execute("SELECT COUNT(*) FROM members WHERE status='aktif'").fetchone()[0],
      "bank_inventory":connection.execute("SELECT COUNT(*) FROM inventory WHERE category='bank_sampah'").fetchone()[0],
      "bank_progress":connection.execute("SELECT COUNT(*) FROM progress_entries").fetchone()[0],
      "bank_deposits":connection.execute("SELECT COUNT(*) FROM waste_deposits").fetchone()[0],
      "bank_expenses":connection.execute("SELECT COUNT(*) FROM waste_expenses").fetchone()[0]
    }
    result["data_source_audit"]={"baseline":"user_uploaded_database_bank_sampah_xlsx",
      "sheet_input_counts":source_baseline,"d1_clone_counts_before_tests":actual_counts,
      "interpretation":"Counts-only comparison. No private roster names exported; row-level proof not claimed."}
    save()
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
    advance_payer="payer:qa:"+secrets.token_hex(10)
    connection.execute("INSERT INTO bookkeeping_payers(id,display_name,payer_type,active) VALUES(?,'LOCAL ADVANCE QA','lembaga',1)",(advance_payer,))
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
        # Photos are stored as separate rows in a D1 table, without overwriting notes.
        progress_photo="https://example.org/local-bank-progress-original.jpg"
        new_progress=call(base+"/api/v2/admin/bank/progress","POST",{
          "date":"2026-10-25","title":"Progress test Bank Sampah lokal",
          "stage":"Pengujian","description":"Hanya QA, bukan data produksi",
          "status":"Berjalan","nextStep":"Selesai QA","publicVisible":True,
          "photoUrl":progress_photo},temporary)
        assert_step("bank_progress_create_with_photo_atomic",
          new_progress[0]==201 and new_progress[1].get("photoSaved") is True,
          {"http":new_progress[0]})
        progress_id=new_progress[1]["id"]
        public_progress=call(base+"/api/v2/public/bank")
        photo_row=next((p for p in public_progress[1].get("progress",[]) if p.get("id")==progress_id),None)
        assert_step("bank_progress_photo_public_visible",
          public_progress[0]==200 and photo_row and photo_row.get("photoUrl")==progress_photo)
        edited_photo="https://example.org/local-bank-progress-updated.jpg"
        changed=call(base+"/api/v2/admin/bank/progress/edit","POST",{
          "id":progress_id,"date":"2026-10-25","title":"Progress test Bank Sampah lokal",
          "stage":"Pengujian","description":"Hanya QA, bukan data produksi",
          "status":"Berjalan","nextStep":"Selesai QA","publicVisible":True,
          "photoUrl":edited_photo},temporary)
        assert_step("bank_progress_edit_photo",changed[0]==200 and changed[1].get("photoUrl")==edited_photo)
        list_progress=call(base+"/api/v2/admin/bank/progress",token=temporary)
        assert_step("bank_progress_admin_shows_photo",
          list_progress[0]==200 and any(x.get("id")==progress_id and x.get("photoUrl")==edited_photo for x in list_progress[1].get("data",[])))
        rejected_photo=call(base+"/api/v2/admin/bank/progress/edit","POST",{
          "id":progress_id,"date":"2026-10-25","title":"Progress test Bank Sampah lokal",
          "stage":"Pengujian","description":"Hanya QA","status":"Berjalan",
          "publicVisible":True,"photoUrl":"javascript:alert(1)"},temporary)
        assert_step("bank_progress_rejects_unsafe_photo_url",rejected_photo[0]==400)
        removed_photo=call(base+"/api/v2/admin/bank/progress/edit","POST",{
          "id":progress_id,"date":"2026-10-25","title":"Progress test Bank Sampah lokal",
          "stage":"Pengujian","description":"Hanya QA","status":"Berjalan",
          "publicVisible":True,"photoUrl":""},temporary)
        assert_step("bank_progress_remove_photo_explicit",removed_photo[0]==200 and
          removed_photo[1].get("photoUrl") is None)
        with sqlite3.connect(str(files[0])) as check_photo:
            remaining=check_photo.execute("SELECT COUNT(*) FROM bank_progress_photos WHERE progress_id=?",(progress_id,)).fetchone()[0]
        assert_step("bank_progress_photo_remove_from_d1",remaining==0)
        # Photo cover saved as album media atomically (clone only), not discarded.
        cover_url="https://example.org/f4-local-cover.png"
        new_album=call(base+"/api/v2/admin/bank/albums","POST",{
          "title":"Album lokal pengujian sampul","category":"Kegiatan",
          "eventOn":"2026-10-25","description":"Hanya di database sementara",
          "visibility":"publik","coverUrl":cover_url},temporary)
        assert_step("bank_album_cover_saved_with_create",
          new_album[0]==201 and new_album[1].get("coverSaved") is True,
          {"http":new_album[0]})
        new_album_id=new_album[1].get("id")
        album_overview=call(base+"/api/v2/public/bank")
        cover_match=next((x for x in album_overview[1].get("albums",[]) if x.get("id")==new_album_id),None)
        assert_step("bank_public_album_cover_url_real",
          album_overview[0]==200 and cover_match and cover_match.get("coverUrl")==cover_url)
        album_detail=call(base+"/api/v2/public/bank/album/"+urllib.parse.quote(new_album_id,safe=""))
        assert_step("bank_cover_is_real_album_media",
          album_detail[0]==200 and any(x.get("external_url")==cover_url for x in album_detail[1].get("media",[])))
        bad_cover=call(base+"/api/v2/admin/bank/albums","POST",{
          "title":"Tidak lolos URL","category":"Kegiatan","eventOn":"2026-10-25",
          "visibility":"publik","coverUrl":"javascript:alert(1)"},temporary)
        assert_step("bank_cover_requires_https",bad_cover[0]==400)
        # Public cash transparency must read the SAME D1 journal as private bookkeeping.
        # No token, no Google Apps Script, no financial data copied into the report log.
        public_cash=call(base+"/api/v2/public/portal/cash")
        assert_step("portal_public_cash_d1_http",public_cash[0]==200 and public_cash[1].get("readOnly") is True,
            {"http":public_cash[0]})
        public_rows=public_cash[1]["data"]["rows"]
        with sqlite3.connect(str(files[0])) as readback:
            live_summary=readback.execute("""SELECT COUNT(*),COALESCE(SUM(debit_rp),0),COALESCE(SUM(credit_rp),0)
                FROM bookkeeping_cash_transactions WHERE status='aktif'""").fetchone()
        published=(len(public_rows),sum(int(x["debit"]) for x in public_rows),sum(int(x["kredit"]) for x in public_rows))
        assert_step("portal_public_cash_reconciles_local_d1",published==live_summary,
            {"matches":published==live_summary,"count":published[0]})
        # ONLY LOCAL: new Iuran, safe reversal, immutable source and year-end Kas Lorong split.
        payers=sqlite3.connect(str(files[0])).execute("""SELECT o.payer_id FROM bookkeeping_payer_iuran_obligations o
          JOIN bookkeeping_payers p ON p.id=o.payer_id
          WHERE p.active=1 AND o.qty_kas_lorong>0 AND p.household_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM bookkeeping_advances a WHERE a.payer_id=p.id AND a.status='aktif' AND a.amount_rp>COALESCE(a.reimbursed_rp,0))
          LIMIT 20""").fetchall()
        candidate=None
        for row in payers:
            d=call(base+"/api/bookkeeping/iuran/outstanding?payerId="+urllib.parse.quote(row[0])+"&year=2027&month=1",token=temporary)
            if d[0]==200 and sum(int(z["sisaRp"]) for z in d[1].get("komponen",[]))>0 and any(z["jenis"]=="KAS_LORONG" and z["sisaRp"]>0 for z in d[1].get("komponen",[])):
                candidate=(row[0],d[1]["komponen"]);break
        assert_step("cancel_test_payer_local_only",candidate is not None)
        payer,dues=candidate
        alokasi=[{"tahun":2027,"bulan":1,"jenis":z["jenis"],"nominal":int(z["sisaRp"])} for z in dues if int(z["sisaRp"])>0]
        kas_part=sum(z["nominal"] for z in alokasi if z["jenis"]=="KAS_LORONG")
        payment_req={"requestKey":str(uuid.uuid4()),"payerId":payer,"tanggal":"2026-10-25",
                     "metode":"Cash","catatan":"LOCAL CANCEL QA","jumlahRp":sum(z["nominal"] for z in alokasi),"alokasi":alokasi}
        pf_before=call(base+"/api/bookkeeping/year-end/preflight?year=2026",token=temporary)
        created=call(base+"/api/bookkeeping/iuran","POST",payment_req,temporary)
        payment_id=created[1].get("idPembayaran","")
        assert_step("new_iuran_create_local",created[0]==201 and payment_id.startswith("pay-"),{"http":created[0]})
        # Verify actual D1 edit endpoint; immutable sum/allocations and linked cash
        # keep the same balances, only date/method/note change atomically.
        edited=call(base+"/api/bookkeeping/iuran/edit","POST",{
          "idPembayaran":payment_id,"tanggal":"2026-10-24",
          "metode":"QRIS","catatan":"Koreksi metadata QA LOCAL"},temporary)
        if edited[0]!=200:print("ISOLATED_IURAN_EDIT_DIAG="+json.dumps({"status":edited[0],"error":edited[1].get("error","")}))
        assert_step("new_iuran_metadata_edit_atomic_local",edited[0]==200 and edited[1].get("ok") is True)
        with sqlite3.connect(str(files[0])) as check:
            pay=check.execute("SELECT paid_on,payment_method,amount_rp FROM bookkeeping_payments WHERE id=?",(payment_id,)).fetchone()
            linked_cash=check.execute("SELECT occurred_on,payment_method,debit_rp FROM bookkeeping_cash_transactions WHERE source_payment_id=?",(payment_id,)).fetchall()
            allocation_total=check.execute("SELECT SUM(amount_rp) FROM bookkeeping_payment_allocations WHERE payment_id=?",(payment_id,)).fetchone()[0]
        assert_step("new_iuran_edit_retains_amount_cash_consistency",
          pay==("2026-10-24","QRIS",payment_req["jumlahRp"]) and
          len(linked_cash)==(1 if kas_part else 0) and
          all(x[0]=="2026-10-24" and x[1]=="QRIS" and x[2]==kas_part for x in linked_cash) and
          allocation_total==payment_req["jumlahRp"])
        for scope in ("payments","arisan","fines","loans"):
            anonymous=call(base+"/api/member/"+scope)
            assert_step("member_private_"+scope+"_requires_login",anonymous[0] in (401,403))

        pf_during=call(base+"/api/bookkeeping/year-end/preflight?year=2026",token=temporary)
        assert_step("year_end_kas_lorong_only_no_false_orphan",
          pf_during[0]==200 and pf_during[1]["checks"]["invalidLinkedIuranRows"]==pf_before[1]["checks"]["invalidLinkedIuranRows"])
        forbidden=call(base+"/api/bookkeeping/iuran/cancel","POST",{"idPembayaran":payment_id,"alasan":"Local test"},None)
        assert_step("iuran_cancel_requires_auth",forbidden[0] in (401,403))
        canceled=call(base+"/api/bookkeeping/iuran/cancel","POST",{"idPembayaran":payment_id,"alasan":"Pembatalan simulasi LOCAL"},temporary)
        if canceled[0]!=200:print("ISOLATED_IURAN_CANCEL_DIAG="+json.dumps({"status":canceled[0],"error":canceled[1].get("error","")}))
        assert_step("new_iuran_cancel_atomic",canceled[0]==200 and canceled[1].get("status")=="dibatalkan",{"http":canceled[0],"reason":canceled[1].get("error","")})
        repeated=call(base+"/api/bookkeeping/iuran/cancel","POST",{"idPembayaran":payment_id,"alasan":"Pembatalan simulasi LOCAL"},temporary)
        assert_step("new_iuran_cancel_idempotent",repeated[0]==200 and repeated[1].get("duplikat") is True)
        replay=call(base+"/api/bookkeeping/iuran","POST",payment_req,temporary)
        assert_step("canceled_iuran_replay_rejected",replay[0]==409)
        with sqlite3.connect(str(files[0])) as view:
            st=view.execute("SELECT status FROM bookkeeping_payments WHERE id=?",(payment_id,)).fetchone()[0]
            alloc_st=view.execute("SELECT DISTINCT status FROM bookkeeping_payment_allocations WHERE payment_id=?",(payment_id,)).fetchall()
            cash_st=view.execute("SELECT status,debit_rp FROM bookkeeping_cash_transactions WHERE source_payment_id=?",(payment_id,)).fetchall()
        assert_step("new_iuran_cancel_db_consistent",st=="dibatalkan" and alloc_st==[("dibatalkan",)] and cash_st==[("dibatalkan",kas_part)])
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

        # The original batch has payouts/expenses: confirmed reversal MUST refuse.
        forbidden_reversal=call(bank_base+"/api/admin/reconciliation/cancel","POST",
          {"batch":batch_id,"konfirmasi":batch_id,"alasan":"LOCAL QA post-withdrawal reversal"},temporary)
        assert_step("confirmed_bank_reversal_rejects_spent_batch",forbidden_reversal[0]==409,
            {"http":forbidden_reversal[0]})
        with sqlite3.connect(str(files[0])) as view:
            status_after_guard=view.execute("SELECT status FROM waste_batches WHERE id=?",(batch_id,)).fetchone()[0]
        assert_step("spent_batch_still_confirmed",status_after_guard=="disahkan")

        # Independent fresh batch and fresh member: no historic payouts can taint this test.
        # No SQL changes are sent to remote D1; this executes on Wrangler's disposable clone.
        reverse_batch="batch:qa:reverse:"+secrets.token_hex(9)
        reverse_member="member:qa:reverse:"+secrets.token_hex(9)
        with sqlite3.connect(str(files[0])) as fixture:
            house=fixture.execute("SELECT id FROM households LIMIT 1").fetchone()
            if not house:raise AssertionError("Local clone has no household")
            fixture.execute("INSERT INTO members(id,household_id,display_name,status,joined_at) VALUES(?,?,?,'aktif','2026-10-25')",
                (reverse_member,house[0],"LOCAL QA REVERSAL MEMBER"))
            fixture.execute("INSERT INTO waste_batches(id,label,status) VALUES(?,?,'draft')",
                (reverse_batch,"LOCAL QA REVERSAL"))
        reverse_deposit=call(bank_base+"/api/v2/admin/bank/deposits","POST",
          {"requestKey":"QAReverseD"+secrets.token_hex(14),"batchId":reverse_batch,"memberId":reverse_member,
            "depositedOn":"2026-10-26","items":[{"itemId":bank_item,"grams":1000}]},temporary)
        assert_step("reverse_fixture_deposit_created",reverse_deposit[0]==201,{"http":reverse_deposit[0]})
        reverse_sale=str(uuid.uuid4())
        reverse_sold=call(bank_base+"/api/admin/sales/draft","POST",
          {"requestId":reverse_sale,"batchId":reverse_batch,"soldOn":"2026-10-26",
           "buyerName":"LOCAL QA REVERSAL",
           "receivedRp":bank_rate,"adjustmentNote":"QA TEST",
           "lines":[{"itemId":bank_item,"grams":1000,"priceRpPerKg":bank_rate}]},temporary)
        assert_step("reverse_fixture_sale_created",reverse_sold[0]==200,{"http":reverse_sold[0]})
        reverse_environment=bank_rate-(bank_rate//2)
        reverse_confirm=call(bank_base+"/api/admin/reconciliation/confirm","POST",
          {"batchId":reverse_batch,"saleId":reverse_sale,"operationRp":reverse_environment,"neighborhoodRp":0,"reserveRp":0},temporary)
        assert_step("reverse_fixture_confirmed",reverse_confirm[0]==201,{"http":reverse_confirm[0]})
        bad_identity=call(bank_base+"/api/admin/reconciliation/cancel","POST",
          {"batch":reverse_batch,"konfirmasi":reverse_batch,"alasan":"Authorized? Not yet."})
        assert_step("bank_reversal_requires_login",bad_identity[0] in (401,403))
        refused_mismatch=call(bank_base+"/api/admin/reconciliation/cancel","POST",
          {"batch":reverse_batch,"konfirmasi":"wrong","alasan":"LOCAL QA wrong confirmation"},temporary)
        assert_step("bank_reversal_checks_confirmation",refused_mismatch[0]==400)
        before_correction=call(bank_base+"/api/v2/admin/bank/savings",token=temporary)
        reverted=call(bank_base+"/api/admin/reconciliation/cancel","POST",
          {"batch":reverse_batch,"konfirmasi":reverse_batch,"alasan":"LOCAL QA eligible confirmed batch reversal"},temporary)
        assert_step("bank_confirmed_reversal_atomic",reverted[0]==200 and reverted[1].get("status")=="dibatalkan",
          {"http":reverted[0]})
        idempotent_reverse=call(bank_base+"/api/admin/reconciliation/cancel","POST",
          {"batch":reverse_batch,"konfirmasi":reverse_batch,"alasan":"LOCAL QA eligible confirmed batch reversal"},temporary)
        assert_step("bank_confirmed_reversal_idempotent",idempotent_reverse[0]==200 and idempotent_reverse[1].get("duplicate") is True)
        with sqlite3.connect(str(files[0])) as check:
            triple=(check.execute("SELECT status FROM waste_batches WHERE id=?",(reverse_batch,)).fetchone()[0],
              check.execute("SELECT status FROM waste_sales WHERE id=?",(reverse_sale,)).fetchone()[0],
              check.execute("SELECT DISTINCT status FROM waste_deposits WHERE batch_id=?",(reverse_batch,)).fetchone()[0])
            rights_after=check.execute("""SELECT COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit') THEN amount_rp ELSE -amount_rp END),0)
               FROM waste_savings_ledger WHERE member_id=?""",(reverse_member,)).fetchone()[0]
            original_cash=check.execute("SELECT DISTINCT status FROM waste_cash_ledger WHERE source_transaction_id=?",(reverse_sale,)).fetchall()
            remaining_alloc=check.execute("SELECT COUNT(*) FROM waste_allocations WHERE batch_id=?",(reverse_batch,)).fetchone()[0]
            correction=check.execute("SELECT COUNT(*) FROM waste_savings_ledger WHERE batch_id=? AND kind='koreksi_debit'",(reverse_batch,)).fetchone()[0]
        assert_step("bank_reversal_retains_audit_and_reverses_ledger",
          triple==("dibatalkan","dibatalkan","dibatalkan") and rights_after==0 and original_cash==[("dibatalkan",)] and remaining_alloc==1 and correction>=1,
          {"status":triple,"balance_zero":rights_after==0})
        active_alloc=call(bank_base+"/api/v2/admin/bank/allocations?limit=300",token=temporary)
        assert_step("bank_cancelled_allocation_excluded_from_active_reports",
            active_alloc[0]==200 and not any(x["batch_id"]==reverse_batch for x in active_alloc[1]["data"]))
        bank_public=call(bank_base+"/api/v2/public/bank")
        assert_step("bank_reversal_public_report_still_reads",bank_public[0]==200)

        # Public reports and member statements must show REAL D1 values, not UI defaults.
        public_month=call(bank_base+"/api/v2/public/bank/report?month=2026-10")
        assert_step("bank_public_monthly_report_has_real_rows",public_month[0]==200 and
          public_month[1].get("readOnly") is True and len(public_month[1].get("bulanan",[]))>=1,
          {"http":public_month[0]})
        with sqlite3.connect(str(files[0])) as verify:
            settled=verify.execute("""SELECT COUNT(*),COALESCE(SUM(a.received_rp),0),
                COALESCE(SUM(a.citizen_rights_rp),0),COALESCE(SUM(a.operation_rp),0)
                FROM waste_allocations a JOIN waste_batches b ON b.id=a.batch_id AND b.status='disahkan'
                JOIN waste_sales s ON s.batch_id=a.batch_id AND s.status='terkonfirmasi'
                WHERE substr(s.sold_on,1,7)='2026-10'""").fetchone()
            verified_deposit_weight=verify.execute("""SELECT COALESCE(SUM(d.total_grams),0)/1000.0 FROM waste_deposits d
                JOIN waste_batches b ON b.id=d.batch_id
                JOIN waste_sales s ON s.batch_id=b.id AND s.status='terkonfirmasi'
                WHERE d.status='terkonfirmasi' AND b.status='disahkan' AND substr(s.sold_on,1,7)='2026-10'""").fetchone()[0]
        summarized=public_month[1].get("ringkasan",{})
        assert_step("bank_public_monthly_report_reconciles_allocations",
          (summarized.get("batch"),summarized.get("hasilPenjualan"),summarized.get("hakWarga"),
           summarized.get("operasional"))==settled and summarized.get("beratKg")==verified_deposit_weight,
          {"totals_match":(summarized.get("hasilPenjualan"),summarized.get("hakWarga"))==settled[1:3]})
        summary_all=call(bank_base+"/api/v2/public/bank/report")
        assert_step("bank_public_report_includes_monthly_and_available_periods",
          summary_all[0]==200 and "2026-10" in summary_all[1].get("periodeTersedia",[]) and
          summary_all[1].get("ringkasan",{}).get("hasilPenjualan",0)>=bank_rate)
        public_overview=call(bank_base+"/api/v2/public/bank")
        assert_step("bank_public_overview_has_confirmed_weights",
          public_overview[0]==200 and "confirmedWeightKg" in public_overview[1].get("overview",{})
          and "confirmedSalesWeightKg" in public_overview[1].get("overview",{}))
        unauth_member=call(bank_base+"/api/member/savings")
        assert_step("bank_member_statement_not_public",unauth_member[0] in (401,403))
        with sqlite3.connect(str(files[0])) as member_fixture:
            member_fixture.execute("UPDATE accounts SET member_id=? WHERE id=?",(reverse_member,actor[0]))
        own=call(bank_base+"/api/member/savings",token=temporary)
        assert_step("bank_member_report_full_shape_private",
          own[0]==200 and own[1].get("anggota",{}).get("id")==reverse_member and
          own[1].get("saldoTersediaRp")==0 and own[1].get("riwayatLengkap") is True and
          len(own[1].get("mutasi",[]))>=2,{"http":own[0]})
        assert_step("bank_member_cancelled_deposit_hidden",
          own[0]==200 and not any(x.get("id")==reverse_deposit[1].get("id") for x in own[1].get("setoran",[])))

        # Talangan: 14-day maturity, repayment journal, idempotency and yearly preflight, all LOCAL.
        advance_amount=4000
        advance_request={"requestKey":"QAAdvance"+secrets.token_hex(18),
                         "tanggal":"2026-10-25","payerId":advance_payer,
                         "ditanggungOleh":"Kas Warga Flamboyan 4","keterangan":"LOCAL QA ONLY","jumlahRp":advance_amount}
        advance=call(bank_base+"/api/bookkeeping/talangan","POST",advance_request,temporary)
        aid=advance[1].get("id","")
        assert_step("advance_create",advance[0]==201 and aid.startswith("adv_"),{"status":advance[0]})
        assert_step("advance_due_14_days",advance[1].get("jatuhTempo")=="2026-11-08")
        blocked_iuran=call(bank_base+"/api/bookkeeping/iuran","POST",{
            "requestKey":str(uuid.uuid4()),"payerId":advance_payer,"tanggal":"2026-10-25",
            "metode":"Cash","catatan":"Blocked active Talangan LOCAL","jumlahRp":1000,
            "alokasi":[{"tahun":2026,"bulan":10,"jenis":"KAS_LORONG","nominal":1000}]},temporary)
        assert_step("active_advance_blocks_direct_iuran_api",blocked_iuran[0]==409 and "Talangan aktif" in blocked_iuran[1].get("error",""))

        advance_repeat=call(bank_base+"/api/bookkeeping/talangan","POST",advance_request,temporary)
        assert_step("advance_create_idempotent",advance_repeat[0]==200 and advance_repeat[1].get("duplikat") is True)
        repay_payload={"requestKey":"QARepay"+secrets.token_hex(18),
                       "advanceId":aid,"tanggal":"2026-10-25","jumlahRp":1500,"catatan":"LOCAL QA"}
        repaid=call(bank_base+"/api/bookkeeping/talangan/repay","POST",repay_payload,temporary)
        rid=repaid[1].get("id","")
        assert_step("advance_repayment",repaid[0]==201 and rid.startswith("ar_"),{"status":repaid[0]})
        repay_repeat=call(bank_base+"/api/bookkeeping/talangan/repay","POST",repay_payload,temporary)
        assert_step("advance_repayment_idempotent",repay_repeat[0]==200 and repay_repeat[1].get("duplikat") is True)
        overpay=call(bank_base+"/api/bookkeeping/talangan/repay","POST",
           {"requestKey":"QAOverpay"+secrets.token_hex(18),"advanceId":aid,
            "tanggal":"2026-10-25","jumlahRp":100000,"catatan":"reject"},temporary)
        assert_step("advance_overpayment_rejected",overpay[0]==409,{"status":overpay[0]})
        local=sqlite3.connect(str(files[0]))
        actual_adv=local.execute("SELECT amount_rp,reimbursed_rp,due_on FROM bookkeeping_advances WHERE id=?",(aid,)).fetchone()
        actual_repay=local.execute("SELECT COUNT(*) FROM bookkeeping_advance_repayments WHERE advance_id=? AND status='aktif'",(aid,)).fetchone()[0]
        repay_journal=local.execute("""SELECT COUNT(*) FROM bookkeeping_cash_transactions
          WHERE transaction_type='pelunasan_talangan' AND credit_rp=1500 AND id=?""",(repaid[1].get("kasId"),)).fetchone()[0]
        local.close()
        assert_step("advance_d1_due_and_balances",actual_adv==(4000,1500,"2026-11-08") and actual_repay==1 and repay_journal==1)
        fiscal=call(bank_base+"/api/bookkeeping/year-end/preflight?year=2026",token=temporary)
        assert_step("year_end_readonly_preflight",fiscal[0]==200 and fiscal[1].get("readOnly") is True,
            {"status":fiscal[0]})

        # Browser tests against actual deployed HTML but intercepted LOCAL Worker.
        # Credentials, production D1, and production API are never used for writes.
        if os.environ.get("F4_BANK_BROWSER_QA","").strip().lower() in ("1","true","yes"):
            from bank_isolated_browser_ui import test_ui
            browser_results=test_ui(temporary,reverse_member)
            assert_step("bank_admin_member_browser_pc_hp",len(browser_results)==2 and
              all(z["admin_tables"]>=1 and z["member_history_rows"]>=1 and z["member_csv"] and z["member_print"]
                for z in browser_results))
            result["browser_acceptance"]=browser_results
            save()
        def qa_enabled(key):
            return os.environ.get(key,"").strip().lower() in ("true","1","yes")
        if qa_enabled("F4_BANK_PRIVATE_AUDIT") or qa_enabled("F4_BANK_PORTAL_UI"):
            from bank_local_login_integration import verify
            summary,ephemeral_credentials=verify(files[0],base,assert_step)
            result["real_password_login_checks"]=summary
            save()
            if qa_enabled("F4_BANK_PORTAL_UI"):
                from bank_portal_login_browser_e2e import verify_portal_login
                portal_results=verify_portal_login(ephemeral_credentials)
                assert_step("real_portal_form_login_pc_hp_admin_member",
                    len(portal_results)==4 and all(x["login_form"] and x["session_cookie"] and x["logout"] for x in portal_results))
                result["portal_login_browser"]=portal_results
                save()
            if qa_enabled("F4_BANK_PRIVATE_AUDIT"):
                from bank_production_readonly_gate import verify as verify_production
                result["production_readonly_gate"]=verify_production(assert_step)
                save()

    finally:
        process.terminate()
        try:process.wait(timeout=8)
        except subprocess.TimeoutExpired:process.kill()
        log.close()
    connection=sqlite3.connect(str(files[0]))
    final=connection.execute(q).fetchone()
    actual=connection.execute("SELECT status,debit_rp FROM bookkeeping_cash_transactions WHERE id=?",(txid,)).fetchone()
    connection.close()
    # One canceled manual cash + one active Talangan repayment of Rp1.500.
    assert_step("cash_accounting_reconciles_canceled_cash_and_advance",final[0]==baseline[0]+3 and final[1]==baseline[1]-1500 and actual[0]=="dibatalkan")
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
    print("Bank Excel D1 COUNT AUDIT:",json.dumps(result.get("data_source_audit",{}),sort_keys=True))
    print("Isolated QA status:",result["status"],"checks:",len(result["tests"]))
