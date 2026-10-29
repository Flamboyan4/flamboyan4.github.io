'use strict';
// Read-only regression check for the Bank Sampah compact header and pastel KPI cards.
const fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('bank-sampah/index.html','utf8');
const css=fs.readFileSync('portal-live/bank-eco-dashboard.css','utf8');
const core=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(x=>x[1].includes('function v14Setup()'))?.[1];
if(!core)throw Error('Dashboard source missing');
new vm.Script(core,{filename:'bank-sampah/index.html:inline'});
for(const item of ["page.classList.add('v14-home','f4-eco-dashboard')",'id="v14Title"','id="v14QuickAction"','v14-kpi f4-eco-kpi','f4-eco-icon',"iconNames=['bank','user','cash','calendar']","const isAdmin=profile.peran==='Admin'","v14BankQuickActions();","v14Stat('Saldo sah'","v14Stat('Berat tercatat'"]){
 if(!html.includes(item))throw Error('Missing dashboard feature: '+item);
}
if(html.includes('f4-eco-header-art')||html.includes('bank-eco-reference.webp')||html.includes('bank-eco-header.svg'))throw Error('Forced header illustration returned');
if(css.includes('f4-eco-header-art')||css.includes('bank-eco-reference.webp')||css.includes('bank-eco-header.svg'))throw Error('Old illustration CSS still present');
for(const item of ['.v14-head{','.f4-eco-head-copy{','#v14QuickAction{','flex-wrap:wrap!important','grid-template-columns:repeat(2,minmax(0,1fr))','f4-member-dashboard','.f4-eco-icon img','background:#fff!important']){
 if(!css.includes(item))throw Error('Responsive style missing: '+item);
}
if(css.includes('Rp 6.000')||css.includes('33 warga')||css.includes('2 kg'))throw Error('Fake KPI values found in CSS');
assertChevron();
if(!html.includes('function v14WeightTrend(rows)')||!html.includes("title.textContent=mode==='nilai'?'Perkembangan nilai setoran':'Berat setoran per bulan'"))
  throw Error('Admin dashboard financial chart must track sale-confirmed values');

if(!html.includes("r.berat==null?'Berat jual belum tersedia':kg(r.berat)"))
 throw Error('Confirmed gram weight must not silently fall back to initial grams');
if(!html.includes("period.missingWeight"))
 throw Error('Admin chart must preserve missing final grams as unavailable');
// PDF must not regress to thin green/grey borders from the dynamically inserted print style.
for(const check of [
 "border:1px solid #000!important;background:#fff!important",
 "#v10Print tbody td,#v27PrintReport tbody td{border-color:#000!important}",
 "#v10Print th,#v10Print td{font-size:9pt;border:1px solid #000;padding:6px}",
 "body #v10Print :is(table,thead,tbody,tfoot,tr,th,td)"
]){
 if(!html.includes(check))throw Error('Bank PDF border must remain black: '+check);
}
const shared=fs.readFileSync('portal-live/print-black-lines.css','utf8');
if(!shared.includes('@media print')||!shared.includes('border-color: #000 !important'))
 throw Error('Shared black-border print stylesheet is missing');
console.log('F4_ECO_CLEAN_HEADER_STATIC_OK');
function assertChevron(){
 if(!html.includes('f4-eco-activity-arrow'))throw Error('Standard gallery chevron missing in activity list');
 if(!css.includes('.f4-eco-activity-arrow svg'))throw Error('Standard chevron styling missing');
 if(css.includes('content:"›"'))throw Error('Unaligned font chevron is forbidden');
 if(!html.includes('next.innerHTML=\'<svg'))throw Error('Gallery source icon removed');
}
