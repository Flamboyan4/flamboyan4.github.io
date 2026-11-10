'use strict';
/* Isolated, read-only test of D1's RT report: cash-recognition and due statuses. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('cloudflare/worker-terpadu-operasional-teruji.js','utf8');
const start=source.indexOf('async function f4ContributionReport(db, request) {');
const end=source.indexOf('__name(f4ContributionReport, "f4ContributionReport");',start);
assert(start>0&&end>start,'Missing operational RT report handler');
const report=source.slice(start,end);
let nowValue='2026-11-10T06:00:00Z';
class MockDate extends Date{static now(){return Date.parse(nowValue)}}
const context={URL,Date:MockDate,Map,Set,Number,String,RegExp,console,
 json:value=>value,safeError:message=>{throw Error(message)},
 validDateOnly:value=>/^\d{4}-\d{2}-\d{2}$/.test(value),
 getIuranTariffs:async()=>({TARIF_BULANAN:25000,TARIF_KEBERSIHAN:20000})};
const handler=vm.runInNewContext(report+';f4ContributionReport;',context);
const payment=(id,name,house,paidOn,obligationMonth,kind,amount,paymentId)=>({
 id:paymentId+'-'+obligationMonth+'-'+kind,payment_id:paymentId,payer_id:id,
 display_name:name,house_code:house,payment_method:'Cash',
 period_year:2026,period_month:obligationMonth,contribution_type:kind,
 line_rp:amount,amount_rp:amount,paid_on:paidOn
});
const rows=[
 ...[11,12].flatMap(m=>[
 payment('p:riadi','Pak Riadi','A6/13','2026-11-09',m,'IURAN_BULANAN',25000,'pay:riadi'),
 payment('p:riadi','Pak Riadi','A6/13','2026-11-09',m,'KEBERSIHAN',20000,'pay:riadi')]),
 payment('p:one','Pak Satu','A5/10','2026-11-10',11,'IURAN_BULANAN',25000,'pay:one-nov'),
 payment('p:one','Pak Satu','A5/10','2026-11-10',11,'KEBERSIHAN',20000,'pay:one-nov'),
 payment('p:one','Pak Satu','A5/10','2026-12-10',12,'IURAN_BULANAN',25000,'pay:one-dec'),
 payment('p:one','Pak Satu','A5/10','2026-12-10',12,'KEBERSIHAN',20000,'pay:one-dec'),
 payment('p:partial','Bu Cicil','A5/11','2026-11-08',11,'KEBERSIHAN',10000,'pay:partial'),
 payment('p:effective','Bu Baru','A5/23','2026-12-11',12,'KEBERSIHAN',20000,'pay:effective'),
 payment('p:prepaid','Pak Awal','A5/24','2026-09-30',11,'IURAN_BULANAN',25000,'pay:prepaid')
];
const versions=[
 ['p:riadi','Pak Riadi','A6/13','2026-01-01',1,1],
 ['p:one','Pak Satu','A5/10','2026-01-01',1,1],
 ['p:unpaid','Pak Belum','A5/20','2026-01-01',1,1],
 ['p:free','Pak Bebas','A5/21','2026-01-01',0,0],
 ['p:partial','Bu Cicil','A5/11','2026-01-01',0,1],
 ['p:no-clean','Pak Iuran','A5/22','2026-01-01',1,0],
 ['p:effective','Bu Baru','A5/23','2026-11-01',0,0],
 ['p:effective','Bu Baru','A5/23','2026-12-01',0,1],
 ['p:prepaid','Pak Awal','A5/24','2026-01-01',1,0]
].map(([payer_id,display_name,house_code,effective_from,qty_iuran_bulanan,qty_kebersihan])=>
 ({payer_id,display_name,house_code,effective_from,qty_iuran_bulanan,qty_kebersihan}));
const sqlQueries=[];
const db={prepare(sql){
 assert(/^SELECT\b/.test(sql.trim()),'Report must never mutate D1');
 return {bind(...args){return {all:async()=>{
   sqlQueries.push({sql,args});
   if(sql.includes('bookkeeping_payer_obligation_periods'))
     return {results:versions.filter(x=>x.effective_from<=args[0])};
   if(sql.includes('bookkeeping_payment_allocations')){
     if(sql.includes('AS line_rp')){
       assert(sql.includes('p.paid_on>=?')&&sql.includes('p.paid_on<=?'),
         'RT cash report must filter received date, not obligation month');
       return {results:rows.filter(x=>x.paid_on>=args[0]&&x.paid_on<=args[1])};
     }
     assert(sql.includes('a.period_year'),'Status query should filter obligation month');
     return {results:rows.filter(x=>{
       const period=x.period_year+'-'+String(x.period_month).padStart(2,'0');
       return period>=args[0]&&period<=args[1];
     })};
   }
   throw Error('Unrecognized SQL '+sql.slice(0,120));
 }}};
}};
}};
const url=(from,to,level='month')=>({url:'https://api.test/api/bookkeeping/reports/contributions?'+
 new URLSearchParams({kind:'rt',level,from,to})});
const byId=r=>new Map(r.data.rows.map(x=>[x.idWarga,x]));
(async()=>{
 const nov=await handler(db,url('2026-11-01','2026-11-30'));
 assert.equal(nov.ok,true);
 const n=byId(nov);
 assert.equal(nov.data.labelPeriode,'November 2026');
 assert.equal(n.get('p:riadi').nominalBulanan,50000,'November records both months paid together');
 assert.equal(n.get('p:riadi').nominalKebersihan,40000);
 assert.equal(n.get('p:riadi').rincianBulanan.map(x=>x.periode).join(','),'2026-11,2026-12');
 assert.equal(n.get('p:riadi').wajibBulananPeriode[0].dibayarRp,25000);
 assert.equal(nov.data.ringkasan.totalSetoran,145000);
 assert.equal(nov.data.ringkasan.jumlahSetoranBulanan,3);
 assert.equal(n.get('p:unpaid').wajibBulananPeriode.length,1);
 assert.equal(n.get('p:partial').wajibKebersihanPeriode[0].dibayarRp,10000);
 assert.equal(n.get('p:prepaid').nominalBulanan,0);
 assert.equal(n.get('p:prepaid').wajibBulananPeriode[0].dibayarRp,25000,
  'Earlier advance covers monthly duty without becoming November cash');
 assert.equal(n.get('p:prepaid').pelunasanDiMuka[0].dibayarPada,'2026-09');
 assert.equal(n.has('p:free'),false);
 assert.equal(n.has('p:effective'),false);

 // Nov–Dec is cumulative: the *same* November cash appears once here,
 // but a disjoint December statement must exclude all November money.
 const range=await handler(db,url('2026-11-01','2026-12-31'));
 const combined=byId(range);
 assert.equal(range.data.labelPeriode,'November–Desember 2026');
 assert.equal(combined.get('p:riadi').nominalBulanan,50000);
 assert.equal(combined.get('p:riadi').nominalKebersihan,40000);
 assert.equal(range.data.ringkasan.totalSetoran,210000,'Combined months have 145k November + 65k December');

 // December is not overdue until it actually starts.
 assert.equal(combined.get('p:unpaid').wajibBulananPeriode.length,1);
 assert.equal(combined.get('p:one').wajibKebersihanPeriode.length,1);
 const beforeDecember=await handler(db,url('2026-12-01','2026-12-31'));
 assert.equal(beforeDecember.data.rows.some(x=>x.idWarga==='p:riadi'),false,
  'A December-only cash statement cannot recount Riadi November receipt');
 assert.equal(beforeDecember.data.ringkasan.totalSetoran,65000,
  'Prepayments are not rebooked even when December has a new payment');
 // The test contains future dated December payments to exercise filtering;
 // in production no future receipt should be entered before its actual date.

 nowValue='2026-12-10T06:00:00Z';
 const dec=await handler(db,url('2026-12-01','2026-12-31'));
 const d=byId(dec);
 assert.equal(dec.data.ringkasan.totalBulanan,25000);
 assert.equal(dec.data.ringkasan.totalKebersihan,40000);
 assert.equal(dec.data.ringkasan.totalSetoran,65000);
 assert.equal(d.get('p:riadi').nominalBulanan,0);
 assert.equal(d.get('p:riadi').nominalKebersihan,0);
 assert.equal(d.get('p:riadi').wajibBulananPeriode[0].dibayarRp,25000);
 assert.equal(d.get('p:riadi').wajibKebersihanPeriode[0].dibayarRp,20000);
 assert.equal(d.get('p:riadi').pelunasanDiMuka[0].dibayarPada,'2026-11');
 assert.equal(d.get('p:unpaid').wajibBulananPeriode.length,1);
 assert.equal(d.get('p:one').wajibKebersihanPeriode[0].dibayarRp,20000);
 assert.equal(d.get('p:effective').wajibKebersihanPeriode.length,1,
  'No backdated December-only duty in November');
 assert.equal(d.get('p:no-clean').wajibKebersihanPeriode.length,0);

 const date=await handler(db,url('2026-11-09','2026-11-09','date'));
 assert.equal(date.data.cekKewajibanPeriode,false);
 assert.equal(date.data.rows.find(x=>x.idWarga==='p:riadi').nominalBulanan,50000);
 assert.equal(date.data.rows.some(x=>x.idWarga==='p:unpaid'),false);
 // The exact same formatter renders HTML preview and print.
 const html=fs.readFileSync('pembukuan/index.html','utf8');
 const startHTML=html.indexOf('function f4RtLabelBulan(keys){');
 const endHTML=html.indexOf('function renderLaporanRt(d){',startHTML);
 assert(startHTML>=0&&endHTML>startHTML);
 const format=vm.runInNewContext(html.slice(startHTML,endHTML)+
   ';({label:f4RtLabelBulan,paidLabel:f4RtPaidPeriodLabel,note:f4RtKeteranganMarkup,cell:f4RtCellMarkup,warning:f4RtCellWarning})',{
     BULAN:['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
     rupiah:num=>'Rp '+Number(num).toLocaleString('id-ID'),esc:val=>String(val),
     reportKeteranganRt:()=>'',Number,String,Set,Array
   });
 assert.equal(format.paidLabel(n.get('p:riadi')),'2 bulan: November–Desember 2026');
 assert(format.note(n.get('p:riadi')).includes('2 bulan: November–Desember 2026'));
 assert(!format.cell(n.get('p:riadi'),'bulanan').includes('November'),'Money cell has no month labels');
 assert(format.note(d.get('p:riadi')).includes('Sudah dibayar November 2026 untuk Desember 2026'));
 assert(format.cell(d.get('p:riadi'),'bulanan').includes('rt-dash'),'Do not show money twice');
 assert.equal(format.warning(d.get('p:riadi'),'bulanan'),false,'Prepaid December is not red');
 assert(format.note(n.get('p:prepaid')).includes('Sudah dibayar September 2026 untuk November 2026'));
 assert(format.cell(n.get('p:unpaid'),'bulanan').includes('Belum bayar'));
 assert.equal(format.warning(n.get('p:no-clean'),'kebersihan'),false);
 assert(format.cell(n.get('p:partial'),'kebersihan').includes('Belum lunas'));
 assert(html.includes('f4RtKeteranganMarkup(x)'),'Screen/print must use memo column');
 assert(html.includes('Nominal merupakan setoran yang diterima pada periode laporan.'),
  'Print must explain cash basis');
 assert(html.includes('td.rt-warning{background:#fff1f2'),'Red unpaid flag retained');
 assert.equal(format.paidLabel({rincianBulanan:[],rincianKebersihan:[
  {periode:'2026-11',nominalRp:20000},{periode:'2026-11',nominalRp:20000}]}),'',
  'Two cleaning units in one month are NOT two different months');
 console.log('F4_RT_CASH_RECEIPT_ONCE_OK; read-only SQL='+sqlQueries.length);
})().catch(err=>{console.error(err);process.exitCode=1});
