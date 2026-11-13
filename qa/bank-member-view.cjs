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
if(!css.includes('.f4-member-tools'))throw Error('Member savings CSS missing');
const dashboardCss=fs.readFileSync('portal-live/bank-eco-pages.css','utf8');
if(!dashboardCss.includes('#f4MemberContent #v14Recent .f4-member-recent-value'))throw Error('Mutation list must be owned by core dashboard CSS');
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
  'beratSahGram:confirmedGrams.byDeposit.has(d.id)?confirmedGrams.byDeposit.get(d.id):null',
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
  "v17PublicChartRows=(Array.isArray(report.bulanan)?report.bulanan:[]).slice(-6);",
  "p.missingWeight?'—':kg(p.berat)",
  "weight===null?'—':kg(weight)",
  "v14Stat('Berat tercatat'",
  "['beratTimbang','Timbang awal kg']",
  "['berat','Berat sesuai status kg']"
]){
 if(!bank.includes(phrase))throw Error('Weight presentation must preserve final versus raw grams: '+phrase);
}

// Mobile-banking regression: D1 statement is the only monetary source.
const app=fs.readFileSync('portal-live/bank-mobile-app.js','utf8');
new vm.Script(app,{filename:'bank-mobile-app.js'});
if(!bank.includes("const personalMutations=(d.mutasi||[]).map(x=>") ||
   !bank.includes("history.appendChild(v12Table(['Tanggal','Mutasi','Masuk','Keluar','Saldo','Resi'],personalMutations))"))
 throw Error('Member statement rendering must use its own mutasi (previously undefined variable)');
if(!bank.includes("window.dispatchEvent(new CustomEvent('f4-bank-member-statement',{detail:d}))"))
 throw Error('D1-backed member statement is not delivered to mobile screens');
// A member's house and member ID already appear on the card. Keep hidden DOM
// values for card, receipts and existing statement logic; do not show them twice.
if(!bank.includes('<div class="f4-profile-meta" hidden>'))throw Error('Repeated member house/ID is visible under profile name');
if(!bank.includes("querySelector('.f4-profile-meta').hidden=p.peran==='Warga'"))
 throw Error('Member profile metadata should hide without affecting admin accounts');
if(!bank.includes('id="pHome"')||!bank.includes('id="pId"'))
 throw Error('Internal house and member ID source nodes must remain available');
const profileCss=fs.readFileSync('portal-live/bank-eco-pages.css','utf8');
if(!profileCss.includes('#dashboardView #pageProfile .f4-profile-meta:not([hidden]){'))
 throw Error('Canonical profile CSS must respect the hidden metadata attribute');
// Reuse the sidebar's SVG convention; keep the member profile entry visible and functional.
if(!bank.includes("user:'<circle cx=")||!bank.includes('cy="8" r="4"'))
 throw Error('Shared outline user icon missing from Bank Sampah sidebar');
if(!bank.includes("v16Icon(currentRole==='superadmin'?'back':'user')"))
 throw Error('Kartu & Profil entry must use role-aware SVG, not bare text');
if(!bank.includes("currentRole==='warga'?'Kartu & Profil':'Profil pengurus'"))
 throw Error('Kartu & Profil label missing for members');
if(!app.includes('["Pencairan","bank-payout","pay.svg"]'))
 throw Error('Member payout must use a dedicated real SVG icon');
if(app.includes('el("span","f4-bank-currency-mark","Rp")')||
   app.includes('el("span","f4-bank-member-chevron","›")'))
 throw Error('Member action icons must not use text currency or arrow glyphs');
if(!app.includes('["Laporan","bank-report","book.svg"]'))
 throw Error('Member report must remain accessible in the member dock');
if(!app.includes('const adminDock=[')||!app.includes('dock().hidden=!isPrivate;'))
 throw Error('Manager mobile dock must be visible to logged-in admins');
if(!app.includes('["Beranda","dashboard","home.svg"],["Setoran","setoran","bank.svg"]')||
   !app.includes('["Laporan","laporan","book.svg"],["Penjualan","penjualan","cash.svg"]')||
   !app.includes('["Saldo","tabungan","pay.svg"]')||
   !app.includes('isAdminReport=dock&&route==="laporan"'))
 throw Error('Manager dock must preserve Beranda, Setoran, central gold Laporan, Penjualan and Saldo');
if(app.includes('f4BankAppShortcuts'))throw Error('Redundant shortcut tiles must be removed for all roles');
if(!app.includes('updateProfileCard()')||!app.includes('function memberBuckets()'))throw Error('Profile card or trusted chart missing');
if(app.includes('function ledger(){\n return [...($("v12History")'))
 throw Error('Member history must not depend on scraped hidden HTML');
const sample={
 saldo:3000,totalMasuk:3000,totalCair:0,wargaId:'member:test-001',
 mutasi:[{tanggal:'2026-10-30',jenis:'Hasil penjualan',kredit:3000,debit:0,saldo:3000}],
 setoran:[{tanggal:'2026-10-20',tanggalJual:'2026-10-30',beratKg:1.9,status:'Terkonfirmasi',nilaiSahRp:3000},
         {tanggal:'2026-09-08',beratKg:2,status:'Estimasi',estimasiRp:4000}]
};
const source=(name,next)=>{const start=app.indexOf('function '+name+'(');
 const end=app.indexOf('\nfunction '+next+'(',start);
 if(start<0||end<=start)throw Error('Cannot isolate '+name);
 return app.slice(start,end);
};
const result=new Function('memberStatement','rupiah',
 source('ledger','months')+'\n'+source('memberBuckets','weighingNextDate')+
 '\nreturn {ledger:ledger(),buckets:memberBuckets(),history:historyLines()};')
 (sample,n=>'Rp '+Number(n).toLocaleString('id-ID'));
if(result.ledger.length!==1||result.ledger[0].credit!==3000)throw Error('Actual ledger credit must remain 3000');
if(result.history.length!==3||result.history.filter(x=>x.kind==='deposit').length!==2)
 throw Error('History must show deposits as weight entries, separately from money');
if(result.buckets.length!==2||result.buckets[1].weight!==1.9||result.buckets[1].confirmed!==3000||
   result.buckets[0].estimated!==4000)
 throw Error('Weight/confirmed/pending monthly chart grouping is incorrect');

if(bank.includes('id="v17ValueBars"'))throw Error('Duplicate public value chart returned');
if(!bank.includes("const fields=['beratKg','pendingWeightKg','hasilPenjualan']"))
 throw Error('Public mode must keep approved weight and value separate');
console.log('BANK_MEMBER_VIEW_GUARD_OK');
