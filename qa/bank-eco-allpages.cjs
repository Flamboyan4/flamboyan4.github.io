'use strict';
// Frontend theme guard. No DB/Worker calls or user data.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const h=fs.readFileSync('bank-sampah/index.html','utf8');
const c=fs.readFileSync('portal-live/bank-eco-pages.css','utf8');
const js=[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(x=>x[1].includes('function v14Setup()'))?.[1];
assert(js,'Dashboard JS not found');new vm.Script(js,{filename:'bank-sampah:index-inline.js'});
assert(h.includes('/portal-live/bank-eco-pages.css?v=20261028-green-public-3'),'Bank theme import missing');
assert(c.includes('background:linear-gradient(115deg,#e2f5e7 0%,#d6efdf 100%)'),'Public hero must use soft green background');
assert(c.includes('@media screen')&&!c.includes('@media print{'),'Only screen theme permitted');
for(const name of ['pageSetoran','pagePenjualan','pageRiwayat','pageRiwayatJual',
 'pageMaster','pageRekonsiliasi','pagePengesahan','pageTabungan','pageLaporan',
 'pageDokumentasi','pageInventaris','pageProgress','pageProfile','pageAdmin']){
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
console.log('F4_BANK_FRESH_ECO_ALL_PAGES_OK');
