'use strict';
// Minimal build-time contract: no transaction/API changes and no fake hard-coded KPIs.
const fs=require('node:fs'),vm=require('node:vm');
const h=fs.readFileSync('bank-sampah/index.html','utf8');
const c=fs.readFileSync('portal-live/bank-eco-dashboard.css','utf8');
const art=fs.readFileSync('assets/bank-eco-header.svg','utf8');
const scripts=[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
const body=scripts.find(x=>x[1].includes('function v14Setup()'))?.[1];
if(!body)throw Error('Existing dashboard source missing');
new vm.Script(body,{filename:'bank-sampah/index-inline.js'});
if(!art.includes('<svg')||!art.includes('</svg>'))throw Error('Eco header SVG malformed');
for(const t of ['v14-kpi f4-eco-kpi','f4-eco-panel-heading','class="f4-eco-head-copy"',
  '/portal-live/bank-eco-dashboard.css?v=','f4MemberDateID(r.tanggal)',
  "const isAdmin=profile.peran==='Admin'","v14Stat('Saldo tabungan terkonfirmasi'",
  "v14Stat('Sampah terkumpul'","v14BankQuickActions();"]){
 if(!h.includes(t))throw Error('Dashboard source missing: '+t);
}
for(const t of ['#v14Primary>.f4-eco-kpi','nth-child(4)','f4-member-dashboard',
  'grid-template-columns:repeat(2,minmax(0,1fr))','/assets/bank-eco-header.svg','background:#fff!important']){
 if(!c.includes(t))throw Error('Eco CSS missing: '+t);
}
if(c.includes('Rp 6.000')||c.includes('33 warga')||c.includes('2 kg'))throw Error('Do not hardcode member or admin figures');
console.log('F4_ECO_DASHBOARD_STATIC_OK');
