'use strict';
// Read-only regression check for the Bank Sampah compact header and pastel KPI cards.
const fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('bank-sampah/index.html','utf8');
const css=fs.readFileSync('portal-live/bank-eco-dashboard.css','utf8');
const core=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(x=>x[1].includes('function v14Setup()'))?.[1];
if(!core)throw Error('Dashboard source missing');
new vm.Script(core,{filename:'bank-sampah/index.html:inline'});
for(const item of ["page.classList.add('v14-home','f4-eco-dashboard')",'id="v14Title"','id="v14QuickAction"','v14-kpi f4-eco-kpi','f4-eco-icon',"iconNames=['bank','user','cash','calendar']","const isAdmin=profile.peran==='Admin'","v14BankQuickActions();","v14Stat('Saldo tabungan terkonfirmasi'","v14Stat('Sampah terkumpul'"]){
 if(!html.includes(item))throw Error('Missing dashboard feature: '+item);
}
if(html.includes('f4-eco-header-art')||html.includes('bank-eco-reference.webp')||html.includes('bank-eco-header.svg'))throw Error('Forced header illustration returned');
if(css.includes('f4-eco-header-art')||css.includes('bank-eco-reference.webp')||css.includes('bank-eco-header.svg'))throw Error('Old illustration CSS still present');
for(const item of ['.v14-head{','.f4-eco-head-copy{','#v14QuickAction{','flex-wrap:wrap!important','grid-template-columns:repeat(2,minmax(0,1fr))','f4-member-dashboard','.f4-eco-icon img','background:#fff!important']){
 if(!css.includes(item))throw Error('Responsive style missing: '+item);
}
if(css.includes('Rp 6.000')||css.includes('33 warga')||css.includes('2 kg'))throw Error('Fake KPI values found in CSS');
console.log('F4_ECO_CLEAN_HEADER_STATIC_OK');
