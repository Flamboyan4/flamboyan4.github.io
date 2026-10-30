// Safety checks for fund lifecycle and Bank Sampah approval.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const worker=fs.readFileSync("cloudflare/worker-terpadu-operasional-teruji.js","utf8");
const ui=fs.readFileSync("portal-live/treasury-center.js","utf8");
const css=fs.readFileSync("portal-live/treasury-center.css","utf8");
const marker="async function treasuryApproveBankBalance(db,who,catalog,req){";
const a=worker.indexOf(marker),b=worker.indexOf("__name(treasuryApproveBankBalance",a);
assert(a>=0&&b>a);
const posA=worker.indexOf("function treasuryBankPositions(fundId){"),posB=worker.indexOf("__name(treasuryBankPositions",posA);
assert(posA>=0&&posB>posA);
const positions=new Function(worker.slice(posA,posB)+";return treasuryBankPositions;")();
const run=new Function("one","list","sha","ok","err","crypto","treasuryBankPositions",
  worker.slice(a,b)+";return treasuryApproveBankBalance;");
function makeScenario({central=0,already=["old"],linked=[],excluded=[],sourceRows}={}){
 const rows=sourceRows||[
  {id:"old",fund_position:"tabungan_warga",cash_in_rp:3000,cash_out_rp:0},
  {id:"fresh",fund_position:"tabungan_warga",cash_in_rp:1000,cash_out_rp:0}
 ];
 const statements=[],seen=[];
 const db={
  prepare(sql){return {bind(...params){return {sql,params}}}},
  async batch(batch){statements.push(...batch);return batch.map(()=>({meta:{changes:1}}))}
 };
 const fakeOne=async (_db,sql)=>{
  if(sql.includes("request_key=?"))return null;
  if(sql.includes("SUM(amount_rp)"))return {value:central};
  throw Error("Unexpected SELECT ONE: "+sql);
 };
 const fakeList=async (_db,sql)=>{
  if(sql.includes("FROM waste_cash_ledger"))return rows;
  if(sql.includes("FROM treasury_bank_source_coverage"))return already.map(id=>({source_id:id,captured_amount_rp:rows.find(x=>x.id===id)?.cash_in_rp||0}));
  if(sql.includes("FROM treasury_events"))return linked.map(request_key=>({request_key}));
  if(sql.includes("FROM treasury_source_exclusions"))return excluded.map(source_key=>({source_key}));
  throw Error("Unexpected SELECT LIST: "+sql);
 };
 const approve=run(fakeOne,fakeList,async str=>crypto.createHash("sha256").update(str).digest("hex"),
   x=>({status:200,body:x}),(message,status)=>({status,body:{error:message}}),crypto.webcrypto,positions);
 const fund={id:"bank_warga",name:"Bank Sampah — Hak Warga",cash:"cash:bank_sampah"};
 const req={
  fundId:"bank_warga",location:"qris",expectedSourceRp:4000,
  expectedCentralRp:central,expectedAvailableRp:1000,
  requestKey:"00000000-0000-4000-8000-000000000001",confirmation:"SUDAH COCOK"
 };
 return {approve,db,statements,seen,catalog:{funds:[fund]},req};
}
(async()=>{
 const scenario=makeScenario();
 const success=await scenario.approve(scenario.db,{id:"admin"},scenario.catalog,scenario.req);
 assert.equal(success.status,200);
 assert.equal(success.body.amountRp,1000);
 const entry=scenario.statements.find(x=>x.sql.includes("INSERT INTO treasury_entries"));
 assert(entry,"Journal entry missing");
 assert.equal(entry.params.at(-1),1000,"Approval must book new 1000, not stale gap 4000");
 const coverage=scenario.statements.filter(x=>x.sql.includes("INSERT INTO treasury_bank_source_coverage"));
 assert.equal(coverage.length,1);
 assert.equal(coverage[0].params[0],"fresh");
 const conflicting=makeScenario({central:3500});
 conflicting.req.expectedCentralRp=3500;
 const denied=await conflicting.approve(conflicting.db,{id:"admin"},conflicting.catalog,conflicting.req);
 assert.equal(denied.status,409,"Partial gap must not be over-posted");
 assert.equal(conflicting.statements.length,0);
 const linked=makeScenario({linked:["source:bank:fresh"]});
 linked.req.expectedAvailableRp=0;
 const linkedResult=await linked.approve(linked.db,{id:"admin"},linked.catalog,linked.req);
 assert.equal(linkedResult.status,409,"Linked source cannot be booked again");
 assert.equal(linked.statements.length,0);
 const excluded=makeScenario({excluded:["source:bank:fresh"]});
 excluded.req.expectedAvailableRp=0;
 const exclResult=await excluded.approve(excluded.db,{id:"admin"},excluded.catalog,excluded.req);
 assert.equal(exclResult.status,409);
 assert.equal(excluded.statements.length,0);
 assert.match(worker,/p\.action==="remove-fund"\|\|p\.action==="restore-fund"/);
 assert.match(worker,/p\.action==="update-fund"/);
 assert.match(worker,/NOT EXISTS\(SELECT 1 FROM treasury_entries WHERE fund_id=\?\)/);
 assert.match(worker,/HAVING SUM\(amount_rp\)<>0/);
 assert.match(worker,/active!==false/);
 assert.match(worker,/name:"Tunai "/);
 assert.match(ui,/function buildDynamicFund\(target,data,refresh\)/);
 for(const action of ["remove-fund","restore-fund","update-fund"]){
  assert(ui.includes('action:"'+action+'"'),action);
 }
 assert(ui.includes('expectedAvailableRp:row.available'));
 assert(ui.includes('row.available<=row.diff'));
 assert(ui.includes('const funds=data.catalog.funds.filter(f=>f.active!==false)'));
 assert.match(worker,/Nama pos yang sudah ada transaksi tidak bisa diubah/);
 assert.match(ui,/newName.readOnly=!!fund.hasHistory/);
 assert.match(ui,/const visibleSources=sources.filter/);
 assert.match(ui,/for\(const src of visibleSources\.slice/);
 assert.match(worker,/bankPendingCounts:bankUnreviewed\.map/);
 assert(!css.includes("!important"),"No CSS important overrides");
 assert.equal((css.match(/@media\(max-width:760px\)/g)||[]).length,1,"Only one mobile rule block");
 console.log("TREASURY_LIFECYCLE_AND_UNPOSTED_ONLY_OK=1");
})().catch(e=>{console.error(e);process.exitCode=1});
