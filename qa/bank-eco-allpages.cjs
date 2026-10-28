'use strict';
// Frontend theme guard. No DB/Worker calls or user data.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const h=fs.readFileSync('bank-sampah/index.html','utf8');
const c=fs.readFileSync('portal-live/bank-eco-pages.css','utf8');
const js=[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(x=>x[1].includes('function v14Setup()'))?.[1];
assert(js,'Dashboard JS not found');new vm.Script(js,{filename:'bank-sampah:index-inline.js'});
assert(h.includes('/portal-live/bank-eco-pages.css?v=20261028-leaf-green-4'),'Bank theme import missing');
assert(c.includes('background:linear-gradient(115deg,#a0dcb3 0%,#b6e4c6 62%,#c7ead5 100%)'),'Public banner needs stronger leaf green');
assert(c.includes('@media screen')&&!c.includes('@media print{'),'Only screen theme permitted');
for(const name of ['pageSetoran','pagePenjualan','pageRiwayat','pageRiwayatJual',
 'pageMaster','pageRekonsiliasi','pagePengesahan','pageTabungan','pageLaporan',
 'pageDokumentasi','pageInventaris','pageProgress','pagePribadi','pageProfile','pageAdmin']){
 assert(c.includes('#'+name),'Page style coverage missing: '+name);
}
for(const key of ['#v11Public','.v17-public-banner','.v17-public-metric',
 '#v18PublicSide','#sideNav.side','width:min(226px,75vw)','max-width:1023px',
 '.open','transform:translateX(0)','grid-template-columns:minmax(0,1fr)']){
 assert(c.includes(key),'Drawer/style check failed: '+key);
}
assert(h.includes('Saldo sah ada di Tabungan Saya.'),'Finance disclaimer not shortened');
assert(h.includes('Estimasi timbang ≠ saldo tabungan.'),'Important finance disclaimer absent');
assert(h.includes('aria-label="Muat ulang data tabungan"'),'Icon refresh was changed');
assert(h.includes('function bankMenuClose()'),'Existing menu close handler missing');
assert(h.includes("page.id='pagePribadi'"),'Tabungan Saya DOM missing');
for(const key of ['#pagePribadi #v12Private>.stats', '#pagePribadi #v12Deposits>.details-panel',
 '#pagePribadi #v12History th', '#pageProgress .f4-member-progress-summary',
 '#pageProgress .f4-member-progress-section', '#pageProgress .f4-member-progress-step',
 '#v11Public #v17Perkembangan .v17-panel',
 'border-left:5px solid #118866']){
 assert(c.includes(key),'Leaf green theme missing: '+key);
}
console.log('F4_BANK_FRESH_ECO_ALL_PAGES_OK');
