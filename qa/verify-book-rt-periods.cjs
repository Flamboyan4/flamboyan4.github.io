'use strict';
/* Isolated, read-only mock of the exact operational D1 report handler.
 * No production network or credentials, and no database writes. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('cloudflare/worker-terpadu-operasional-teruji.js','utf8');
const start=source.indexOf('async function f4ContributionReport(db, request) {');
const end=source.indexOf('__name(f4ContributionReport, "f4ContributionReport");',start);
assert(start>0&&end>start,'Worker D1 RT report is missing');
const report=source.slice(start,end);
const mockContext={URL,Date,Map,Set,Number,String,RegExp,console,
 json:x=>x,safeError:message=>{throw Error(message)},
 validDateOnly:value=>/^\d{4}-\d{2}-\d{2}$/.test(value),
 getIuranTariffs:async()=>({TARIF_BULANAN:25000,TARIF_KEBERSIHAN:20000})};
const handler=vm.runInNewContext(report+'; f4ContributionReport;',mockContext);
const payer=(id,name,house,month,kind,amount,paymentId)=>({
 id:paymentId+'-'+month+'-'+kind,payment_id:paymentId,payer_id:id,display_name:name,
 house_code:house,payment_method:'Cash',period_year:2026,period_month:month,
 contribution_type:kind,line_rp:amount});
const rows=[
 ...[11,12].flatMap(m=>[
 payer('p:riadi','Pak Riadi','A6/13',m,'IURAN_BULANAN',25000,'pay:riadi'),
 payer('p:riadi','Pak Riadi','A6/13',m,'KEBERSIHAN',20000,'pay:riadi')]),
 payer('p:one','Pak Satu','A5/10',11,'IURAN_BULANAN',25000,'pay:one'),
 payer('p:one','Pak Satu','A5/10',11,'KEBERSIHAN',20000,'pay:one'),
 payer('p:partial','Bu Cicil','A5/11',11,'KEBERSIHAN',10000,'pay:partial')];
const versions=[
 ['p:riadi','Pak Riadi','A6/13','2026-01-01',1,1],
 ['p:one','Pak Satu','A5/10','2026-01-01',1,1],
 ['p:unpaid','Pak Belum','A5/20','2026-01-01',1,1],
 ['p:free','Pak Bebas','A5/21','2026-01-01',0,0],
 ['p:partial','Bu Cicil','A5/11','2026-01-01',0,1],
 ['p:no-clean','Pak Iuran','A5/22','2026-01-01',1,0],
 ['p:effective','Bu Baru','A5/23','2026-11-01',0,0],
 ['p:effective','Bu Baru','A5/23','2026-12-01',0,1]
].map(([payer_id,display_name,house_code,effective_from,qty_iuran_bulanan,qty_kebersihan])=>
 ({payer_id,display_name,house_code,effective_from,qty_iuran_bulanan,qty_kebersihan}));
let sqlCalls=0;
const db={prepare(sql){
 sqlCalls++;
 assert(/^SELECT\b/.test(sql.trim()),'The RT report must run only read-only queries');
 return {bind(...args){
   return {all:async()=>{
     if(sql.includes('bookkeeping_payment_allocations'))return {results:rows};
     if(sql.includes('bookkeeping_payer_obligation_periods'))return {results:versions};
     throw Error('Unexpected D1 query: '+sql.slice(0,100));
   }};
 }};
}};
(async()=>{
 const request={url:'https://api.example.test/api/bookkeeping/reports/contributions?kind=rt&level=month&from=2026-11-01&to=2026-12-31'};
 const result=await handler(db,request);
 assert.equal(result.ok,true);
 const data=result.data,byId=new Map(data.rows.map(x=>[x.idWarga,x]));
 assert.equal(data.labelPeriode,'November–Desember 2026');
 assert.equal(data.cekKewajibanPeriode,true);
 assert.equal(byId.get('p:riadi').nominalBulanan,50000);
 assert.equal(byId.get('p:riadi').nominalKebersihan,40000);
 assert.deepEqual(byId.get('p:riadi').rincianBulanan.map(x=>x.periode).join(','),'2026-11,2026-12');
 assert.equal(byId.get('p:riadi').wajibBulananPeriode.every(x=>x.dibayarRp===x.wajibRp),true);
 assert.equal(byId.get('p:unpaid').nominalBulanan,0);
 assert.equal(byId.get('p:unpaid').nominalKebersihan,0);
 assert.equal(byId.get('p:unpaid').wajibBulananPeriode.length,2);
 assert.equal(byId.get('p:unpaid').wajibKebersihanPeriode.length,2);
 assert.equal(byId.get('p:one').wajibKebersihanPeriode[0].dibayarRp,20000);
 assert.equal(byId.get('p:one').wajibKebersihanPeriode[1].dibayarRp,0);
 assert.equal(byId.has('p:free'),false,'Payer without obligations or payments must not be flagged');
 assert.equal(byId.get('p:no-clean').wajibKebersihanPeriode.length,0,'Cleaning-exempt payer must have no cleaning debt');
 assert.equal(byId.get('p:effective').wajibKebersihanPeriode.length,1,'New December obligation must not backdate to November');
 assert.equal(byId.get('p:effective').wajibKebersihanPeriode[0].periode,'2026-12');
 assert.equal(data.ringkasan.totalBulanan,75000);
 assert.equal(data.ringkasan.totalKebersihan,70000);
 assert.equal(data.ringkasan.totalSetoran,145000,'Unpaid obligations must not inflate cash totals');
 assert.equal(data.ringkasan.jumlahSetoranBulanan,3,'Count actual units, not residents');
 const dateOnly=await handler(db,{url:'https://api.example.test/api/bookkeeping/reports/contributions?kind=rt&level=date&from=2026-11-10&to=2026-11-10'});
 assert.equal(dateOnly.data.cekKewajibanPeriode,false);
 assert.equal(dateOnly.data.rows.some(x=>x.idWarga==='p:unpaid'),false,'Narrow transaction dates are not unpaid-duty months');
 // Client renderer: same helper powers preview and print, including red labels.
 const html=fs.readFileSync('pembukuan/index.html','utf8');
 const marker=html.indexOf('function f4RtLabelBulan(keys){');
 const tail=html.indexOf('function renderLaporanRt(d){',marker);
 assert(marker>0&&tail>marker,'Shared RT month renderer not found');
 const format=vm.runInNewContext(html.slice(marker,tail)+
   ';({label:f4RtLabelBulan,cell:f4RtCellMarkup,warning:f4RtCellWarning})',{
   BULAN:['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
   rupiah:n=>'Rp '+Number(n).toLocaleString('id-ID'),esc:s=>String(s),Number,String,Set,Array});
 assert.equal(format.label(['2026-11','2026-12']),'2 bulan: November–Desember 2026');
 assert(format.cell(byId.get('p:riadi'),'bulanan').includes('2 bulan: November–Desember 2026'));
 assert(format.cell(byId.get('p:unpaid'),'bulanan').includes('Belum bayar'));
 assert.equal(format.warning(byId.get('p:unpaid'),'kebersihan'),true);
 assert(format.cell(byId.get('p:one'),'kebersihan').includes('Belum bayar: Desember 2026'));
 assert.equal(format.cell(byId.get('p:no-clean'),'kebersihan').includes('rt-dash'),true);
 assert.equal(format.warning(byId.get('p:no-clean'),'kebersihan'),false);
 assert(format.cell(byId.get('p:partial'),'kebersihan').includes('Belum lunas'));
 assert(html.includes('f4RtCellMarkup(x,\'bulanan\')'),'Preview + print must render months in each cell');
 assert(html.includes('td.rt-warning{background:#fff1f2'),'Printed reports must retain red unpaid cues');
 console.log('F4_RT_MULTIMONTH_AND_HISTORICAL_UNPAID_OK; read-only queries='+sqlCalls);
})().catch(error=>{console.error(error);process.exitCode=1});
