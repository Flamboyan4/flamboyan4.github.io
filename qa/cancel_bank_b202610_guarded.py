#!/usr/bin/env python3
"""One-time guarded cancellation of the explicitly requested Bank Sampah test batch.
The original financial records stay auditable; only live postings are reversed.
Atomic D1 REST batch; refuse to write if the independently audited state differs.
No other batch or account can be modified by this script."""
import datetime,json,os,urllib.request,urllib.error
A=os.environ["CLOUDFLARE_ACCOUNT_ID"];T=os.environ["CLOUDFLARE_API_TOKEN"]
ROOT="https://api.cloudflare.com/client/v4/accounts/"+A
B="batch:B202610"; SALE="sale:P0002"; MEMBER="member:W017"
SOURCE="audit:bank-reverse:"+B
def cloud(path,payload=None):
 data=json.dumps(payload).encode() if payload is not None else None
 headers={"Authorization":"Bearer "+T,"Accept":"application/json"}
 if data:headers["Content-Type"]="application/json"
 req=urllib.request.Request(ROOT+path,method="POST" if data else "GET",headers=headers,data=data)
 with urllib.request.urlopen(req,timeout=65) as res:r=json.load(res)
 if not r.get("success"):raise RuntimeError("Cloudflare API rejected call")
 return r.get("result")
database=next((d for d in cloud("/d1/database") if d.get("name")=="flamboyan4-staging"),None)
if not database:raise RuntimeError("Expected D1 unavailable")
binding=next((b for b in cloud("/workers/scripts/flamboyan4-terpadu-staging/settings").get("bindings",[])
 if b.get("name")=="DB"),{})
if binding.get("type")!="d1" or binding.get("id")!=database["uuid"]:
 raise RuntimeError("Refuse unverified Worker D1 database")
path="/d1/database/"+database["uuid"]+"/query"
def batch(statements):
 result=cloud(path,{"batch":[{"sql":sql,"params":params or []} for sql,params in statements]})
 if not isinstance(result,list) or len(result)!=len(statements) or any(not x.get("success") for x in result):
  raise RuntimeError("D1 atomic batch rejected")
 return result
def read(sql,args=()):
 return batch([(sql,list(args))])[0].get("results") or []
def expected(test,reason):
 if not test:raise RuntimeError("REFUSED (no changes): "+reason)
# Confirm API's batch transport using two read-only statements first.
trial=batch([("SELECT 1 AS check_a",[]),("SELECT 2 AS check_b",[])])
expected(trial[0].get("results")==[{"check_a":1}] and trial[1].get("results")==[{"check_b":2}],
 "D1 batch transport is not recognized")
state=read("SELECT id,status FROM waste_batches WHERE id=?",(B,))
prior=read("SELECT id FROM audit_log WHERE id=?",(SOURCE,))
if state==[{"id":B,"status":"dibatalkan"}] and len(prior)==1:
 print("B202610_CANCEL_STATUS=ALREADY_CANCELLED_AND_AUDITED");exit(0)
expected(state==[{"id":B,"status":"disahkan"}] and not prior,"batch not in initial confirmed state")
sales=read("SELECT id,status,amount_received_rp,sold_on FROM waste_sales WHERE batch_id=? ORDER BY id",(B,))
expected(sales==[
 {"id":"sale:P0001","status":"dibatalkan","amount_received_rp":4000,"sold_on":"2026-10-18"},
 {"id":SALE,"status":"terkonfirmasi","amount_received_rp":1500,"sold_on":"2026-10-18"}
],"sale records differ from validated audit")
alloc=read("SELECT id,received_rp,citizen_rights_rp,operation_rp,neighborhood_rp,reserve_rp FROM waste_allocations WHERE batch_id=?",(B,))
expected(alloc==[{"id":"alloc:bank:"+B,"received_rp":1500,"citizen_rights_rp":750,
 "operation_rp":750,"neighborhood_rp":0,"reserve_rp":0}],"allocation mismatch")
deposits=read("SELECT id,status,deposited_on FROM waste_deposits WHERE batch_id=? ORDER BY id",(B,))
expected(deposits==[
 {"id":"deposit:S0001","status":"dibatalkan","deposited_on":"2026-10-18"},
 {"id":"deposit:S0002","status":"dibatalkan","deposited_on":"2026-10-18"},
 {"id":"deposit:S0003","status":"terkonfirmasi","deposited_on":"2026-10-18"}
],"deposit state changed")
credits=read("SELECT id,member_id,kind,amount_rp,reference_id FROM waste_savings_ledger WHERE batch_id=?",(B,))
expected(credits==[{"id":"bank-right:"+SALE+":"+MEMBER,"member_id":MEMBER,"kind":"kredit",
 "amount_rp":750,"reference_id":SALE+":"+MEMBER}],"member rights differ")
cash=read("""SELECT id,transaction_type,fund_position,cash_in_rp,cash_out_rp,status
 FROM waste_cash_ledger WHERE source_transaction_id=? ORDER BY id""",(SALE,))
expected(cash==[
 {"id":"bank-sale-cash:"+SALE+":operasional","transaction_type":"penjualan_terkonfirmasi",
  "fund_position":"operasional","cash_in_rp":750,"cash_out_rp":0,"status":"aktif"},
 {"id":"bank-sale-cash:"+SALE+":tabungan_warga","transaction_type":"penjualan_terkonfirmasi",
  "fund_position":"tabungan_warga","cash_in_rp":750,"cash_out_rp":0,"status":"aktif"}
],"cash journals differ")
funds=read("""SELECT fund_position,COALESCE(SUM(cash_in_rp-cash_out_rp),0) AS balance
 FROM waste_cash_ledger WHERE status='aktif' AND fund_position IN ('tabungan_warga','operasional')
 GROUP BY fund_position""")
expected({x["fund_position"]:x["balance"] for x in funds}=={"tabungan_warga":750,"operasional":750},
 "bank-wide available funds have changed")
rights=read("""SELECT COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit')
 THEN amount_rp ELSE -amount_rp END),0) AS balance FROM waste_savings_ledger WHERE member_id=?""",(MEMBER,))
expected(rights==[{"balance":750}],"member balance has changed")
expected(not read("SELECT id FROM fiscal_closings WHERE fiscal_year=2026"),"year already closed")
expected(not read("SELECT batch_id FROM bank_v3_settlements WHERE batch_id=?",(B,)),"v3 settlement exists")
expected(not read("SELECT batch_id FROM bank_v3_batches WHERE batch_id=?",(B,)),"v3 inventory batch exists")
expected(not read("SELECT id FROM waste_savings_ledger WHERE member_id=? AND kind='pencairan' LIMIT 1",(MEMBER,)),
 "member has withdrawn savings")
expected(not read("SELECT id FROM waste_payout_requests WHERE member_id=? AND status NOT IN ('dibatalkan','ditolak','dibayar') LIMIT 1",(MEMBER,)),
 "member payout request exists")
expected(not read("SELECT id FROM waste_cash_ledger WHERE status='aktif' AND cash_out_rp>0 AND occurred_on>='2026-10-18' LIMIT 1"),
 "cash outflow exists after sale")
expected(not read("SELECT id FROM treasury_events WHERE note LIKE '%B202610%' LIMIT 1"),
 "a matching central treasury event exists")
actor=read("SELECT actor_account_id FROM audit_log WHERE id=?",("audit:bank-confirm:"+SALE,))
if len(actor)!=1:
 actor=read("SELECT actor_account_id FROM audit_log WHERE target_type='waste_batches' AND target_id=? AND action='confirm_reconciliation' ORDER BY id DESC LIMIT 1",(B,))
expected(len(actor)==1 and actor[0].get("actor_account_id"),"original confirm actor unavailable")
actor_id=actor[0]["actor_account_id"]
date=(datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))).date().isoformat()
guard="""(SELECT status FROM waste_batches WHERE id='batch:B202610')='disahkan'
 AND (SELECT status FROM waste_sales WHERE id='sale:P0002')='terkonfirmasi'
 AND (SELECT status FROM waste_deposits WHERE id='deposit:S0003')='terkonfirmasi'
 AND (SELECT COUNT(*) FROM waste_sales WHERE batch_id='batch:B202610' AND status='terkonfirmasi')=1
 AND (SELECT COUNT(*) FROM waste_deposits WHERE batch_id='batch:B202610' AND status='terkonfirmasi')=1
 AND (SELECT COUNT(*) FROM waste_cash_ledger WHERE source_transaction_id='sale:P0002' AND status='aktif')=2
 AND (SELECT COALESCE(SUM(cash_in_rp-cash_out_rp),0) FROM waste_cash_ledger
 WHERE status='aktif' AND fund_position='tabungan_warga')>=750
 AND (SELECT COALESCE(SUM(cash_in_rp-cash_out_rp),0) FROM waste_cash_ledger
 WHERE status='aktif' AND fund_position='operasional')>=750
 AND (SELECT COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit') THEN amount_rp
 ELSE -amount_rp END),0) FROM waste_savings_ledger WHERE member_id='member:W017')>=750
 AND NOT EXISTS(SELECT 1 FROM waste_savings_ledger WHERE member_id='member:W017' AND kind='pencairan')
 AND NOT EXISTS(SELECT 1 FROM waste_payout_requests WHERE member_id='member:W017'
 AND status NOT IN ('dibatalkan','ditolak','dibayar'))
 AND NOT EXISTS(SELECT 1 FROM waste_cash_ledger WHERE status='aktif' AND cash_out_rp>0
 AND occurred_on>='2026-10-18')
 AND NOT EXISTS(SELECT 1 FROM fiscal_closings WHERE fiscal_year=2026)
 AND NOT EXISTS(SELECT 1 FROM audit_log WHERE id='audit:bank-reverse:batch:B202610')"""
reason="Pembatalan data uji coba sistem batch B202610 atas permintaan pengelola, 15 November 2026"
reversal="bank-reverse:"+SALE+":"+MEMBER
stmts=[
 ("""INSERT INTO waste_savings_ledger(id,member_id,transaction_on,kind,amount_rp,
 batch_id,reference_id,note,created_by)
 VALUES(?,?,?,'koreksi_debit',CASE WHEN """+guard+""" THEN 750 ELSE -1 END,?,?,?,?)""",
 [reversal,MEMBER,date,B,SALE+":"+MEMBER,reason,actor_id]),
 ("UPDATE waste_cash_ledger SET status='dibatalkan' WHERE source_transaction_id=? AND status='aktif' AND transaction_type='penjualan_terkonfirmasi'",[SALE]),
 ("UPDATE waste_deposits SET status='dibatalkan' WHERE id='deposit:S0003' AND batch_id=? AND status='terkonfirmasi'",[B]),
 ("UPDATE waste_sales SET status='dibatalkan' WHERE id=? AND batch_id=? AND status='terkonfirmasi'",[SALE,B]),
 ("UPDATE waste_batches SET status='dibatalkan' WHERE id=? AND status='disahkan'",[B]),
 ("""INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json)
 VALUES(?,?,'banksampah','reverse_confirmed_batch','waste_batches',?,?,?)""",
 [SOURCE,actor_id,B,reason,json.dumps({"source":"guarded_one_time_cloudflare_d1",
 "saleId":SALE,"cashReversedRp":1500,"rightsReversedRp":750,"memberCount":1,
 "historicalCancelledDepositsPreserved":2,"historicalCancelledSalesPreserved":1})])
]
# D1 REST batch is an atomic transaction. Never send individual writes.
try:
 outcome=batch(stmts)
except Exception:
 if read("SELECT status FROM waste_batches WHERE id=?",(B,))==[{"status":"dibatalkan"}] and read("SELECT id FROM audit_log WHERE id=?",(SOURCE,)):
  print("B202610_CANCEL_STATUS=COMMITTED_AND_AUDITED_RESPONSE_LOST");exit(0)
 raise
changes=[int((x.get("meta") or {}).get("changes",0)) for x in outcome]
expected(changes==[1,2,1,1,1,1],"D1 write affected unexpected number of rows: "+str(changes))
expected(read("SELECT status FROM waste_batches WHERE id=?",(B,))==[{"status":"dibatalkan"}],
 "batch was not cancelled")
expected(read("SELECT status FROM waste_sales WHERE id=?",(SALE,))==[{"status":"dibatalkan"}],
 "active sale was not cancelled")
expected(read("SELECT status FROM waste_deposits WHERE id='deposit:S0003'")==[{"status":"dibatalkan"}],
 "active deposit was not cancelled")
expected(read("SELECT status FROM waste_cash_ledger WHERE source_transaction_id=? ORDER BY id",(SALE,))==[
 {"status":"dibatalkan"},{"status":"dibatalkan"}],"cash was not reversed")
expected(read("""SELECT COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit')
 THEN amount_rp ELSE -amount_rp END),0) AS balance FROM waste_savings_ledger WHERE member_id=?""",(MEMBER,))==[{"balance":0}],
 "member balance did not return to zero")
print("B202610_CANCEL_STATUS=SUCCESS")
print("B202610_POSTCHECKS="+json.dumps({"batch":"dibatalkan","sale":"dibatalkan",
 "confirmed_deposit":"dibatalkan","cash_journals_reversed":2,
 "member_rights_corrected_rp":750,"bank_cash_reversed_rp":1500,
 "history_preserved":True},sort_keys=True))
