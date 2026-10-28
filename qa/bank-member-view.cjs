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
for(const str of ['Estimasi saat timbang','Menunggu rekonsiliasi','function f4MemberDateID(raw)',
  "if(!isAdmin)$('f4-bank-quick')?.remove();","$('f4-monthly-trend')?.remove();",
  'f4-member-refresh','aria-label="Muat ulang data tabungan"',
  'Pencairan tabungan melalui pengurus Bank Sampah.','/portal-live/bank-member-polish.css?v=']){
  if(!bank.includes(str))throw Error('Member display missing: '+str);
}
if(/<button[^>]*f4-member-refresh[^>]*>\s*Perbarui/i.test(bank))throw Error('Visible refresh label forbidden');
if(!bridge.includes('Tabungan masuk dari hasil penjualan'))throw Error('Member ledger label missing');
if(!css.includes('.f4-member-recent-value')||!css.includes('.f4-member-tools'))throw Error('Member CSS missing');
console.log('BANK_MEMBER_VIEW_GUARD_OK');
