'use strict';
/* Pure static validation: all Bank Sampah portal modes, desktop/mobile, no DB access. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const h=fs.readFileSync('bank-sampah/index.html','utf8');
const css=fs.readFileSync('portal-live/bank-eco-pages.css','utf8');
const dashboard=fs.readFileSync('portal-live/bank-eco-dashboard.css','utf8');
const source=[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(x=>x[1].includes('function v14Setup()'))?.[1];
assert(source,'Bank app inline JavaScript missing');
new vm.Script(source,{filename:'bank-sampah/index.html:inline'});
assert(h.includes('/portal-live/bank-eco-pages.css?v=20261028-brighter-gold-deeper-green-2'),'Theme stylesheet cache not updated');
for(const name of ["pageProfile","pageSetoran","pageRiwayat","pageRiwayatJual","pagePenjualan","pageRekonsiliasi","pageMaster","pageProgress","pagePassword","pageAdmin","pagePengesahan","pageTabungan","pageBiaya","pageLaporan","pageKegiatan","pageDokumentasi","pageInventaris","pagePribadi"].concat(['pageDashboard','v11Public'])){
 assert(h.includes(name),'Missing portal view '+name);
}
for(const phrase of ['#v11Public .v17-public-banner.v27-banner-program','#v18PublicSide',
 '#sideNav','#v16Tabs.v16-tabs','.v16-item','#v17Finance','#pagePribadi',
 '#v12Private>.stats','#pageProgress','.f4-member-progress-section',
 '#pageSetoran','#pagePenjualan','#pageRekonsiliasi','#pagePengesahan','#pageTabungan',
 '#pageBiaya','#pageDokumentasi','#pageInventaris','#pageMaster','#pageAdmin',
 '.f4-member-progress-modal-panel','width:min(226px,75vw)',
 'max-width:1023px','max-width:760px','--eco-leaf:#118866',
 'background:#118866!important','background:var(--eco-gold)!important']){
 assert(css.includes(phrase),'Missing themed component '+phrase);
}
assert(!css.includes('#a0dcb3'),'Old mint gradient present');
assert(css.includes('--eco-gold:#F5B52E'),'Bright golden yellow token missing');
assert(css.includes('background:#086345!important;border:1px solid #054d35!important'),'Deep green public hero missing');
assert(css.includes('#v17Program .v17-feature{'),'Program card selector missing');
assert(css.includes('background:#fff!important;border:1px solid #e0eae3!important'),'Solid white program missing');
assert(css.includes('color:#fff!important;\n border:1px solid #E6A125!important'),'White text on bright gold missing');
assert(h.includes('background:#F5B52E!important;border:1px solid #E6A125!important;color:#fff!important'),'Mobile button must match desktop');
assert(css.includes('#v11Public .v17-public-banner :is(h1,h2,h3,strong)'),'White title missing');
assert(css.includes('color:#fff!important'),'Foreground contrast missing');
assert(!h.includes('.stats .stat:last-child{grid-column:1/-1}'),'Wide last savings card regression');
assert(css.includes('#dashboardView #pagePribadi #v12Private>.stats>.stat:last-child'),'Last card sizing not fixed');
assert(h.includes('aria-label="Muat ulang data tabungan"'),'Icon-only reload changed');
assert(h.includes('function bankMenuClose()'),'Drawer logic changed');
assert(dashboard.includes('.f4-eco-kpi'),'Dashboard design missing');
assert(!css.includes('@media print'),'Theme must not alter PDFs');
console.log('F4_BANK_CANONICAL_THEME_OK');
