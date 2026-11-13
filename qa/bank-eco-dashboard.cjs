'use strict';
// Read-only regression check for one clean Bank Sampah dashboard stylesheet.
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
for(const item of ['.v14-head{','#v14QuickAction{','grid-template-columns:repeat(2,minmax(0,1fr))','.f4-eco-icon img','background:#fff']){
 if(!css.includes(item))throw Error('Admin dashboard base style missing: '+item);
}
if(css.includes('!important')||css.includes('f4-member-dashboard'))throw Error('Legacy priority declarations or member rules remain in dashboard stylesheet');
if(css.includes('Rp 6.000')||css.includes('33 warga')||css.includes('2 kg'))throw Error('Fake KPI values found in CSS');
assertChevron();
if(!html.includes('function v14WeightTrend(rows)')||!html.includes("title.textContent=mode==='nilai'?'Perkembangan nilai setoran':'Berat setoran per bulan'"))
  throw Error('Admin dashboard financial chart must track sale-confirmed values');

if(!html.includes("r.berat==null?'Berat jual belum tersedia':kg(r.berat)"))
 throw Error('Confirmed gram weight must not silently fall back to initial grams');
if(!html.includes("period.missingWeight"))
 throw Error('Admin chart must preserve missing final grams as unavailable');
// Print borders remain black in the canonical table rule; do not rely on
// deleted style fragments from the older dashboard revision.
for(const check of [
  "#v10Print th,#v10Print td{display:table-cell",
  "border:1px solid #000}",
  "#v27PrintReport th,#v27PrintReport td{border:1px solid #000",
  "@media print{"
]){
 if(!html.includes(check))throw Error('Bank PDF border rule missing: '+check);
}
console.log('F4_ECO_CLEAN_HEADER_STATIC_OK');
function assertChevron(){
 if(!html.includes('f4-eco-activity-arrow'))throw Error('Standard gallery chevron missing in activity list');
 if(!css.includes('.f4-eco-activity-arrow svg'))throw Error('Standard chevron styling missing');
 if(css.includes('content:"›"'))throw Error('Unaligned font chevron is forbidden');
 if(!html.includes('next.innerHTML=\'<svg'))throw Error('Gallery source icon removed');
}
