'use strict';
/* Pure isolated regressions: no Cloudflare credentials, no personal data or writes. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const worker=fs.readFileSync('cloudflare/worker-terpadu-operasional-teruji.js','utf8');
const html=fs.readFileSync('pembukuan/index.html','utf8');
function extract(name){
  const start=worker.indexOf('async function '+name+'(');
  const end=worker.indexOf('\n__name('+name+',',start);
  assert(start>=0&&end>start,'Worker function missing '+name);
  return worker.slice(start,end);
}
const sandbox={
 URL,Date,
 validDateOnly:s=>/^20\d{2}-\d{2}-\d{2}$/.test(s),
 safeError:(message,code)=>({ok:false,error:message,status:code}),
 json:payload=>payload,
 f4CurrentIuranMonth:()=> '2026-11-01',
 getIuranTariffs:async()=>({TARIF_BULANAN:25000,TARIF_KEBERSIHAN:20000,TARIF_KAS_LORONG:10000,TARIF_ARISAN:60000})
};
vm.createContext(sandbox);
vm.runInContext(extract('f4QuickIuranSummary')+'\n'+extract('f4ContributionReport'),sandbox);
function database(allocations,obligations){
 return {prepare(sql){
   if(sql.includes('JOIN bookkeeping_allocation_details'))throw Error('RT report must read canonical allocation lines only.');
   const rows=sql.includes('FROM bookkeeping_payment_allocations a')?allocations:obligations;
   return {bind(){return {all:async()=>({results:rows})}},all:async()=>({results:rows})};
 }};
}
const obligations=Array.from({length:34},(_,i)=>{
 const n=i+1;return {payer_id:'payer:'+n,household_id:'house:'+n,qty_iuran_bulanan:1,qty_kebersihan:1,
   qty_kas_lorong:n<=33?1:0,qty_arisan:n<=26?1:0};
});
function allocations(ids,aliasHouse='house:34'){
 let n=0,out=[];
 for(const id of ids){
   const house=id==='payer:old' ?aliasHouse:'house:'+id.split(':').at(-1);
   const num=id==='payer:old'?34:Number(id.split(':').at(-1));
   for(const [kind,amount] of [['IURAN_BULANAN',25000],['KEBERSIHAN',20000],
     ...(num<=33?[['KAS_LORONG',10000]]:[]),
     ...(num<=26?[['ARISAN',60000]]:[])]){
     out.push({id:'a'+ ++n,payer_id:id,household_id:house,amount_rp:amount,
       contribution_type:kind,payment_method:'cash'});
   }
 }
 return out;
}
function url(month){return 'https://api.example.test/api/bookkeeping/iuran/quick-summary?'+
  'level=month&from='+month+'-01&to='+month+'-31';}
(async()=>{
 const oct=allocations([...Array.from({length:33},(_,i)=>'payer:'+(i+1)),'payer:old']);
 const result=await sandbox.f4QuickIuranSummary(database(oct,obligations),new Request(url('2026-10')));
 assert.equal(result.ok,true);
 assert.equal(result.data.counts.total.lunas,34,'Oct must count 34 unique obliged people');
 assert.equal(result.data.counts.total.belum,0);
 assert.equal(result.data.counts.rt.lunas,34);
 assert.equal(result.data.counts.rt.belum,0);
 assert.equal(result.data.counts.kas.lunas,33);
 assert.equal(result.data.counts.arisan.lunas,26);
 const otherHouse=allocations([...Array.from({length:33},(_,i)=>'payer:'+(i+1)),'payer:old'],'house:elsewhere');
 const unmatched=await sandbox.f4QuickIuranSummary(database(otherHouse,obligations),new Request(url('2026-10')));
 assert.equal(unmatched.data.counts.total.belum,1,'Different houses must never be merged');
 const nov=allocations(Array.from({length:17},(_,i)=>'payer:'+(i+1)));
 const partial=await sandbox.f4QuickIuranSummary(database(nov,obligations),new Request(url('2026-11')));
 assert.equal(partial.data.counts.total.lunas,17);
 assert.equal(partial.data.counts.total.belum,17);
 // RT: 33 monthly deposits, but 31 payers pay 32 cleanliness units (one 2x).
 // Fixture emulates canonical D1 allocation rows, not duplicated legacy details.
 const reportAllocations=[];
 for(let i=1;i<=33;i++){
   reportAllocations.push({payer_id:'payer:'+i,display_name:'Test '+i,house_code:'A/'+i,
     payment_method:'cash',contribution_type:'IURAN_BULANAN',line_rp:25000});
 }
 for(let i=1;i<=31;i++){
   reportAllocations.push({payer_id:'payer:'+i,display_name:'Test '+i,house_code:'A/'+i,
     payment_method:'cash',contribution_type:'KEBERSIHAN',line_rp:i===31?40000:20000});
 }
 const report=await sandbox.f4ContributionReport(database(reportAllocations,[]),
   new Request('https://api.example.test/api/bookkeeping/reports/contributions?kind=rt&level=month&from=2026-10-01&to=2026-10-31'));
 assert.equal(report.data.ringkasan.totalBulanan,825000);
 assert.equal(report.data.ringkasan.totalKebersihan,640000);
 assert.equal(report.data.ringkasan.jumlahSetoranBulanan,33);
 assert.equal(report.data.ringkasan.jumlahSetoranKebersihan,32);
 assert.equal(report.data.ringkasan.totalSetoran,1465000);
 assert(html.includes('jumlahKebersihan=unit(r.jumlahSetoranKebersihan'),'RT UI must read unit counts');
 assert(!html.includes('orangBulanan=rows.filter'),'RT UI must not count unique people as paid units');
 console.log('F4_IURAN_OBLIGATION_AND_RT_UNITS_OK');
})().catch(err=>{console.error(err.stack||err);process.exitCode=1});
