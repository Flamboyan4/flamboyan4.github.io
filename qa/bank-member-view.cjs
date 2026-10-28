/* Static no-DB Bank Sampah member regression. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm');
const bank=fs.readFileSync('bank-sampah/index.html','utf8');
const bridge=fs.readFileSync('portal-live/live-bank-readonly.js','utf8');
const css=fs.readFileSync('portal-live/bank-member-polish.css','utf8');
const inline=[...bank.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(x=>x[2].includes('async function v14LoadDashboard'));
if(!inline)throw Error('Bank member code not found');
new vm.Script(inline[2],{filename:'bank-sampah:index-inline.js'});
new vm.Script(bridge,{filename:'portal-live/live-bank-readonly.js'});
for(const str of ['Perkiraan setoran','Hasil jual','function f4MemberDateID(raw)',
  "if(!isAdmin)$('f4-bank-quick')?.remove();","$('f4-monthly-trend')?.remove();",
  'f4-member-refresh','aria-label="Muat ulang data tabungan"',
  'function v37MemberWeightChart(rows)','/portal-live/bank-member-polish.css?v=']){
  if(!bank.includes(str))throw Error('Member display missing: '+str);
}
if(/<button[^>]*f4-member-refresh[^>]*>\s*Perbarui/i.test(bank))throw Error('Visible refresh label forbidden');
if(!bridge.includes('Tabungan masuk dari hasil penjualan'))throw Error('Member ledger label missing');
if(!css.includes('.f4-member-recent-value')||!css.includes('.f4-member-tools'))throw Error('Member CSS missing');
if(!bank.includes("title.textContent=mode==='nilai'?'Nilai setoran saya':'Berat sampah saya'"))
  throw Error('Dynamic member value/weight chart missing');
if(!bank.includes("sub.textContent=p.belumAda?"))throw Error('Chart status label missing');

const worker=fs.readFileSync('cloudflare/worker-terpadu-operasional-teruji.js','utf8');
const sampleStart=worker.indexOf('function f4DivideGrams(entries,totalGrams){');
const sampleEnd=worker.indexOf('__name(f4DivideGrams,"f4DivideGrams");',sampleStart);
if(sampleStart<0||sampleEnd<=sampleStart)throw Error('Authoritative final-gram allocation missing');
const divide=new Function(worker.slice(sampleStart,sampleEnd)+'return f4DivideGrams;')();
const testCases=[
 {rows:[{id:'A',grams:1000},{id:'B',grams:1000}],sold:1900,expected:[950,950]},
 {rows:[{id:'A',grams:1000},{id:'B',grams:1000}],sold:1901,expected:[951,950]},
 {rows:[{id:'A',grams:500},{id:'B',grams:250},{id:'C',grams:250}],sold:901,expected:null},
 {rows:[{id:'A',grams:400}],sold:0,expected:[0]}
];
for(const input of testCases){
 const actual=divide(input.rows,input.sold);
 if(!actual||actual.reduce((n,row)=>n+row.grams,0)!==input.sold)
  throw Error('Final-weight gram conservation failed for '+input.sold);
 if(input.expected&&input.expected.some((n,i)=>n!==actual[i].grams))
  throw Error('Final-weight proration failed for '+input.sold);
}
for(const phrase of [
  'async function f4ConfirmedDepositGrams(db,batchIds)',
  'waste_sale_lines l ON l.sale_id=s.id',
  'beratSahGram:finalGrams.has(d.id)?finalGrams.get(d.id):null',
  'COALESCE(SUM(l.grams),0)/1000.0 AS beratKg',
  'AS confirmedWeightKg',
]){
 if(!worker.includes(phrase))throw Error('Worker final-weight D1 source missing: '+phrase);
}
for(const phrase of [
  'beratTimbangKg:number(x.beratGram)/1000',
  'beratSahKg:x.beratSahGram==null?null',
  "beratKg:x.status==='terkonfirmasi'?",
  'beratSah:x.beratSahGram==null?null',
]){
 if(!bridge.includes(phrase))throw Error('Member/admin weight binding missing: '+phrase);
}
for(const phrase of [
  "p.missingWeight?'—':kg(p.berat)",
  "weight===null?'—':kg(weight)",
  "v14Stat('Berat tercatat'",
  "['beratTimbang','Timbang awal kg']",
  "['Tanggal','Berat akhir (kg)','Timbang awal (kg)'"
]){
 if(!bank.includes(phrase))throw Error('Weight presentation must preserve final versus raw grams: '+phrase);
}

console.log('BANK_MEMBER_VIEW_GUARD_OK');
