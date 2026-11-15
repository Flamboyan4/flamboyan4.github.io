#!/usr/bin/env python3
"""Read-only audit of the one explicitly requested historical Bank Sampah batch.
   Never edits D1. Logs only transaction structure, not member names or accounts."""
import json,os,urllib.request
account=os.environ["CLOUDFLARE_ACCOUNT_ID"]; token=os.environ["CLOUDFLARE_API_TOKEN"]
root="https://api.cloudflare.com/client/v4/accounts/"+account
def cloud(path,payload=None):
 data=json.dumps(payload).encode() if payload is not None else None
 request=urllib.request.Request(root+path,data=data,headers={"Authorization":"Bearer "+token,
 "Accept":"application/json",**({"Content-Type":"application/json"} if data else {})},method="POST" if data else "GET")
 with urllib.request.urlopen(request,timeout=40) as r: result=json.load(r)
 if not result.get("success"):raise RuntimeError("Cloudflare request failed")
 return result["result"]
dbs=cloud("/d1/database")
db=next((x for x in dbs if x.get("name")=="flamboyan4-staging"),None)
if not db:raise RuntimeError("D1 database missing")
settings=cloud("/workers/scripts/flamboyan4-terpadu-staging/settings")
binding=next((x for x in settings.get("bindings",[]) if x.get("name")=="DB"),{})
if binding.get("type")!="d1" or binding.get("id")!=db["uuid"]:
 raise RuntimeError("Worker D1 binding mismatch")
def select(sql,values=()):
 payload=cloud("/d1/database/"+db["uuid"]+"/query",{"sql":sql,"params":list(values)})
 if len(payload)!=1 or not payload[0].get("success"):raise RuntimeError("D1 SELECT failed")
 return payload[0].get("results") or []
batch="batch:B202610"
out={"database_binding_verified":True,"batch":batch}
out["batch_rows"]=select("SELECT id,status,confirmed_at FROM waste_batches WHERE id=?",(batch,))
out["sales"]=select("SELECT id,batch_id,status,sold_on,amount_received_rp FROM waste_sales WHERE batch_id=?",(batch,))
out["allocations"]=select("SELECT id,batch_id,received_rp,citizen_rights_rp,operation_rp,neighborhood_rp,reserve_rp FROM waste_allocations WHERE batch_id=?",(batch,))
deposits=select("SELECT id,status,deposited_on FROM waste_deposits WHERE batch_id=? ORDER BY id",(batch,))
out["deposits"]=deposits
out["deposits_total"]=len(deposits)
out["savings"]=select("SELECT id,kind,amount_rp,reference_id,member_id FROM waste_savings_ledger WHERE batch_id=? ORDER BY id",(batch,))
out["cash"]=select("SELECT id,source_transaction_id,transaction_type,fund_position,cash_in_rp,cash_out_rp,status FROM waste_cash_ledger WHERE source_transaction_id IN (SELECT id FROM waste_sales WHERE batch_id=?)",(batch,))
out["v3_settlements"]=select("SELECT batch_id,sale_id FROM bank_v3_settlements WHERE batch_id=?",(batch,))
out["v3_batches"]=select("SELECT batch_id,sale_id FROM bank_v3_batches WHERE batch_id=?",(batch,))
out["closed_year"]=select("SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year=2026")
out["payouts_related"]=select("SELECT COUNT(*) AS n FROM waste_savings_ledger WHERE kind='pencairan' AND member_id IN (SELECT member_id FROM waste_savings_ledger WHERE batch_id=?)",(batch,))
out["cash_outgoing_after"]=select("SELECT COUNT(*) AS n FROM waste_cash_ledger WHERE status='aktif' AND cash_out_rp>0 AND occurred_on >= COALESCE((SELECT MIN(sold_on) FROM waste_sales WHERE batch_id=?),'2026-10-01')",(batch,))
out["member_balances"]=select("""SELECT member_id,
 COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit') THEN amount_rp ELSE -amount_rp END),0) AS balance
 FROM waste_savings_ledger WHERE member_id IN
 (SELECT member_id FROM waste_savings_ledger WHERE batch_id=?) GROUP BY member_id""",(batch,))
out["fund_balances"]=select("""SELECT fund_position,COALESCE(SUM(cash_in_rp-cash_out_rp),0) AS balance
 FROM waste_cash_ledger WHERE status='aktif' AND fund_position IN
 ('tabungan_warga','operasional') GROUP BY fund_position""")
out["pending_member_payouts"]=select("""SELECT id,status FROM waste_payout_requests WHERE
 member_id IN (SELECT member_id FROM waste_savings_ledger WHERE batch_id=?)
 AND status NOT IN ('dibatalkan','ditolak','dibayar')""",(batch,))
out["treasury_event_matches"]=select("SELECT id,kind,occurred_on,note FROM treasury_events WHERE note LIKE '%B202610%'")
# No names or personal address data; IDs needed to validate exactly matched ledger entries.
print("BANK_B202610_READONLY_AUDIT="+json.dumps(out,ensure_ascii=False,sort_keys=True))
