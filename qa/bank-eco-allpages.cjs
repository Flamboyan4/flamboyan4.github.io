'use strict';
/* Pure static validation: all Bank Sampah portal modes, desktop/mobile, no DB access. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const h=fs.readFileSync('bank-sampah/index.html','utf8');
const css=fs.readFileSync('portal-live/bank-eco-pages.css','utf8');
const dashboard=fs.readFileSync('portal-live/bank-eco-dashboard.css','utf8');
const source=[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(x=>x[1].includes('function v14Setup()'))?.[1];
assert(source,'Bank app inline JavaScript missing');
new vm.Script(source,{filename:'bank-sampah/index.html:inline'});
assert(/\/portal-live\/bank-eco-pages\.css\?v=[0-9]{8}-/.test(h),'Versioned theme stylesheet missing');
for(const name of ["pageProfile","pageSetoran","pageRiwayat","pageRiwayatJual","pagePenjualan","pageRekonsiliasi","pageMaster","pageProgress","pagePassword","pageAdmin","pagePengesahan","pageTabungan","pageBiaya","pageLaporan","pageKegiatan","pageDokumentasi","pageInventaris","pagePribadi"].concat(['pageDashboard','v11Public'])){
 assert(h.includes(name),'Missing portal view '+name);
}
for(const phrase of ['#v18PublicSide',
 '#sideNav','#v16Tabs.v16-tabs','.v16-item','#v17Finance','#pagePribadi',
 '#v12Private>.stats','#pageProgress','.f4-member-progress-section',
 '#pageSetoran','#pagePenjualan','#pageRekonsiliasi','#pagePengesahan','#pageTabungan',
 '#pageBiaya','#pageDokumentasi','#pageInventaris','#pageMaster','#pageAdmin',
 '.f4-member-progress-modal-panel','width:min(226px,75vw)',
 'max-width:1023px','max-width:760px','--eco-leaf:#087c50',
 'background:#086345!important','background:var(--eco-gold)!important']){
 assert(css.includes(phrase),'Missing themed component '+phrase);
}
assert(!css.includes('#a0dcb3'),'Old mint gradient present');
assert(css.includes('--eco-gold:#ffc026'),'Current golden yellow theme token missing');
assert(css.includes('background:#086345!important;border:1px solid #054d35!important'),'Deep green public hero missing');
assert(h.includes('<section id="v17Program" class="f4-bank-program"'), 'Program must be a separate semantic section');
assert(h.includes('#v17Program .f4-bank-program-step{'), 'Canonical unboxed program steps missing');
assert(!h.includes('v27-banner-program'), 'Obsolete program banner layout must be removed');
assert(!h.includes('v27CompactProgram'), 'Obsolete program DOM reparenting must be removed');
assert(h.includes('border:0}').valueOf() || h.includes('background:transparent;border:0'), 'Public program must not use cards');
assert(css.includes('color:#fff!important;\n border:1px solid #E6A125!important'),'White text on bright gold missing');
assert(h.includes('#v11Public .v17-public-banner #f4-public-my-savings'), 'Responsive member CTA missing');
assert(css.includes('#v11Public .v17-public-banner :is(h1,h2,h3,strong)'),'White title missing');
assert(css.includes('color:#fff!important'),'Foreground contrast missing');
assert(!h.includes('.stats .stat:last-child{grid-column:1/-1}'),'Wide last savings card regression');
const reportRule=h.match(/#v11Public #v25ReportMetrics\.v26-compact>\.v17-public-metric\{([^}]+)\}/);
assert(reportRule,'Public mobile report source missing');
assert(css.includes('background:#fff!important;border:1px solid #d8e5dc!important'),'Public report cards must stay white');
assert(css.includes('#dashboardView #pagePribadi #v12Private>.stats>.stat:last-child'),'Last card sizing not fixed');
assert(h.includes('aria-label="Muat ulang data tabungan"'),'Icon-only reload changed');
assert(h.includes('function bankMenuClose()'),'Drawer logic changed');
assert(dashboard.includes('.f4-eco-kpi'),'Dashboard design missing');
// Prevent the old compact/underlined dock from reappearing.
const dockSection=css.split('/* Navigasi bawah tunggal:')[1]?.split('body.f4-bank-drawer-open')[0];
assert(dockSection,'Canonical mobile dock section missing');
assert(!dockSection.includes('!important'),'Dock uses priority overrides');
assert(css.includes('body.f4-bank-app-private{--f4-bank-dock-height:64px}'),'Shared bank dock dimension missing');
assert(css.includes('height:var(--f4-bank-dock-height)'),'Dock must use shared height token');
assert(css.includes('padding-bottom:calc(var(--f4-bank-dock-height) + 8px)'),'Page must reserve same compact dock height');
assert(dockSection.includes('grid-template-rows:27px 15px'),'Icon-label spacing must stay compact');
assert(!dockSection.includes('safe-area-inset-bottom'),'Old double safe-area padding must not return');
assert((css.match(/\.f4-bank-app-dock-action\{/g)||[]).length===1,'Duplicated dock action rule');
assert((css.match(/\.f4-bank-app-dock:not\(\[hidden\]\)\{/g)||[]).length===1,'Duplicated dock container rule');
assert(!css.includes('tinggi 62px'),'Old compact dock returned');
assert(!css.includes('border-bottom:2px solid #087850'),'Underline-only tab returned');
assert(!css.includes('@media print'),'Theme must not alter PDFs');
// One public chart, two clear metrics, and no independently scrolling roster.
assert((h.match(/id="v17WeightBars"/g)||[]).length===1,'Public chart must be unique');
assert(!h.includes('id="v17ValueBars"'),'Second public chart returned');
assert(h.includes('data-public-chart-mode="nilai"'),'Public value tab missing');
assert(h.includes('data-public-chart-mode="berat"'),'Public weight tab missing');
assert(h.includes('f4-savings-roster f4-savings-members'),'Member roster must be frameless');
assert(h.includes("roster.className='f4-saldo-list'"),'Inline roster missing');
assert(h.includes("querySelectorAll('.f4-saldo-row')"),'Roster search must target row list');
assert(!h.includes('gulir daftar untuk melihat semuanya'),'Nested scroll instruction returned');
const modern=fs.readFileSync('portal-live/modern-portals.css','utf8');
assert(!modern.includes('#v9List{max-height:390px'),'Old capped roster in shared CSS returned');
assert(!h.includes('max-height:310px!important;overflow-y:auto!important'),'Old roster scrolling returned');
// Mobile Bank Sampah controls must not regress into the three bugs in the 31 Oct report.
assert(!dockSection.includes('transform:translateY(-8px)'),'Center caption must not overlap gold action');
assert(dockSection.includes('transform:translateY(-21px)'),'Raised central icon geometry changed');
const managerDrawer=css.split('/* Pengurus HP: drawer kiri')[1]?.split('@media screen and (max-width:760px)')[0];
assert(managerDrawer,'Admin mobile slide drawer style missing');
assert(managerDrawer.includes('transform:translateX(-105%)') &&
       managerDrawer.includes('transform:translateX(0)') &&
       managerDrawer.includes('flex-direction:column'),
 'Manager menu must slide from left in one column, not display as a grid popover');
assert(!managerDrawer.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),
 'Admin sidebar grid menu returned');
assert(!managerDrawer.includes('!important'),
 'Admin drawer must not use priority overrides');
assert(css.includes('/* Only HP has a bottom dock: hide equivalent routes in its slide drawer. */'),
 'The admin drawer must exclude bottom dock routes only on HP');
assert(css.includes('[data-group="home"],[data-group="entry"],[data-group="money"]'),
 'Duplicate Beranda/Setoran/Penjualan/Laporan/Saldo menu groups returned');
assert(css.includes('#sideNav #v16NavList>.v16-mobile-extra'),
 'Extra admin routes must remain visible');
assert(h.includes("['riwayat','Riwayat setoran','edit']")&&
       h.includes("['pengesahan','Sahkan hasil','wallet']")&&
       h.includes("['biaya','Pengeluaran','wallet']"),
 'Admin extra menu routes may not be removed');
assert(h.includes('html.f4-bank-embedded body.v17-dashboard:not(.f4-bank-app-admin) #sideNav.side'),
 'Embedded old drawer must exclude the admin role');
const reportStyle=h.split('<style>')[1]?.split('</style>')[0];
const mobileReportStyle=h.split('<style id="f4-bank-mobile-3view-fix-20261028">')[1]?.split('</style>')[0];
assert(reportStyle && reportStyle.includes('grid-template-columns:repeat(auto-fit,minmax(156px,188px))'),
 'PC report KPI cards must be capped at a compact width');
assert(reportStyle.includes('min-height:68px') && reportStyle.includes('min-height:64px'),
 'Canonical report cards must be compact on both desktop and mobile');
assert(mobileReportStyle && !mobileReportStyle.includes('#v25ReportMetrics.v26-compact'),
 'Mobile report CSS duplicated instead of sharing the canonical report styling');
assert(!h.includes('min-height:95px!important'),'Old oversized report KPI rule returned');
assert(!h.includes("Ringkasan hasil penjualan dan manfaat untuk warga serta lingkungan, berdasarkan pembukuan yang sudah disahkan."),
 'Verbose report introduction returned');
assert(!h.includes("Nilai sah berasal dari penjualan yang disahkan. Perkiraan menunggu disajikan terpisah dan tidak menambah saldo."),
 'Verbose approval note returned');
assert(!h.includes("data.catatan+' Data pribadi warga tidak ditampilkan.'"),
 'Duplicated report footnote returned');
for(const label of ['Berat sah','Belum sah','Penjualan','Hak warga','Dana lingkungan','Perkiraan']){
 assert(h.includes("v17PublicStat('"+label+"'"),'Compact KPI title missing: '+label);
}
assert(h.includes("'✓ Data sah · ◷ Perkiraan terpisah · 🔒 Privasi'"),
 'Single compact report status line missing');
assert(h.includes("const print=v21Node('button','secondary','PDF')"),'PDF button label not compact');
assert(h.includes("const csv=v21Node('button','secondary','CSV')"),'CSV button label not compact');
assert(!h.includes("const print=v21Node('button','secondary','Cetak / PDF')"),'Old public PDF label returned');
assert(!h.includes("const csv=v21Node('button','secondary','Unduh CSV')"),'Old public CSV label returned');

// Member account accordions must have one canonical right chevron, not a native
// triangle on the left for password and a custom icon on the right for photo.
const summarySelector='#dashboardView #pageProfile :is(#v15PhotoPanel,#v15PasswordBox)>summary';
assert(css.includes(summarySelector+'{'),'Both profile summaries must share one CSS rule');
assert(css.includes(summarySelector+'::-webkit-details-marker{display:none}'),'Native Safari triangle must be hidden');
assert(css.includes(summarySelector+'::marker{content:\'\'}'),'Native details marker must be removed');
assert(css.includes(summarySelector+'::after{'),'Right chevron must be shared');
assert(css.includes('#dashboardView #pageProfile :is(#v15PhotoPanel,#v15PasswordBox)[open]>summary::after'),
 'Both accordions must flip their chevron when open');
assert(!css.includes('#dashboardView #pageProfile #v15PasswordBox>summary{'),
 'Obsolete password-specific override returned');
assert(!h.includes('#v15PasswordBox>summary{cursor:pointer'),
 'Old left-side triangle style returned');
assert(h.includes("summary.textContent='Ganti password'"),'Password must have no emoji or separate triangle');
assert(h.includes('/portal-live/bank-eco-pages.css?v=20261031-profile-chevron-rp-v29'),
 'Bank Sampah profile/dock stylesheet must be cache-busted');
assert(h.includes('/portal-live/bank-mobile-app.js?v=20261031-payout-rp-v16'),
 'Member payout icon script must be refreshed');
assert(css.includes('.f4-bank-currency-mark{'),
 'Rp payout icon must use the canonical bank dock styles');

console.log('F4_BANK_CANONICAL_THEME_OK');
