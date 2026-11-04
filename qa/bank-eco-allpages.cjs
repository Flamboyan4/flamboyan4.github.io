'use strict';
/* Pure static validation: all Bank Sampah portal modes, desktop/mobile, no DB access. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const h=fs.readFileSync('bank-sampah/index.html','utf8');
const css=fs.readFileSync('portal-live/bank-eco-pages.css','utf8');
const dashboard=fs.readFileSync('portal-live/bank-eco-dashboard.css','utf8');
const mobile=fs.readFileSync('portal-live/bank-mobile-app.js','utf8');
new vm.Script(mobile,{filename:'portal-live/bank-mobile-app.js'});
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
assert(h.includes('#f4-public-my-savings{display:inline-flex') &&
       h.includes('@media(max-width:700px){#f4-public-my-savings{width:100%;max-width:none;min-height:44px') &&
       h.includes("getElementById('f4-public-my-savings')"),
 'Responsive member CTA missing');
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
// Public progress is weight-only until authentication; financial value stays private.
assert((h.match(/id="f4DevChart"/g)||[]).length===1,'Public progress chart must be unique');
assert(!h.includes('id="v17ValueBars"'),'Legacy value chart must not return');
assert(h.includes('data-dev-mode="berat" aria-pressed="true"'),'Public weight mode missing');
assert(h.includes('data-dev-mode="nilai" aria-pressed="false" class="hidden" hidden'),
 'Financial value tab must stay hidden for guests');
assert(h.includes('id="v17Transparansi" class="v17-section hidden" hidden'),
 'Public financial transparency section must remain hidden');
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
// Admin HP retains shortcut actions; desktop manager uses a compact direct sidebar.
const adminMobile=css.split('/* Pengelola HP: menu slide untuk Keuangan dan Pengelolaan;')[1]
  ?.split('@media screen and (max-width:760px)')[0];
assert(adminMobile,'Admin mobile navigation owner missing');
assert(adminMobile.includes('html body.f4-bank-app-admin.v17-dashboard #sideNav.side.open') &&
       adminMobile.includes('transform:translateX(0);visibility:visible;pointer-events:auto'),
 'Admin mobile slide drawer must open, not remain forcibly hidden');
assert(adminMobile.includes('html body.f4-bank-app-admin #v16Backdrop.open'),
 'Admin slide backdrop must open with the drawer');
assert(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'Admin shortcuts must be four equal columns');
assert(mobile.includes('dock().hidden=!isPrivate||next==="admin"'),'Admin dock must stay hidden');
assert(mobile.includes('function syncAdminBack()'),'Manager screens need a back control');
assert(!mobile.includes('const adminDock='),'Repeated manager dock routes must be removed');
assert(h.includes("const v16AdminSidebar=new Set(['home','deposit','sale']);") &&
       mobile.includes('function ensureDesktopAdminSidebar()') &&
       mobile.includes('anchor.after(items);') &&
       css.includes('>.v16-item:is([data-group="deposit"],[data-group="sale"]){') &&
       css.includes('#f4BankAdminShortcuts{\n  display:none'),
 'Desktop manager sidebar must own quick routes, excluding Setoran and Penjualan');
assert(!css.includes('v16-mobile-extra')&&!h.includes('v16-mobile-extra'),
 'Duplicated tab submenus must not return to the admin sidebar');
assert(!h.includes('const extras=['),
 'Admin drawer must not dynamically inject tab links');
// Admin routes are checked against the new six-category map below.
assert(h.includes("window.f4OpenBankProfile=openOriginalProfile;"),
 'Profile must stay available from the account icon');
assert(h.includes('html.f4-bank-embedded body.v17-dashboard:not(.f4-bank-app-admin) #sideNav.side'),
 'Embedded old drawer must exclude the admin role');
const reportStyle=h.split('<style>')[1]?.split('</style>')[0];
const compactOwner=h.split('<style id="f4-bank-admin-report-compact-20261027">')[1]?.split('</style>')[0];
assert(reportStyle && reportStyle.includes('grid-template-columns:repeat(3,minmax(0,165px))'),
 'Private report KPI cards must keep equal compact columns');
assert(reportStyle.includes('min-height:49px') && reportStyle.includes('gap:6px;margin:8px 0 10px'),
 'Private report cards must stay compact across viewports');
assert(compactOwner && !compactOwner.includes('#v25ReportMetrics.v26-compact'),
 'Mobile report CSS duplicated instead of sharing the canonical report styling');
assert(!h.includes('<style id="f4-bank-mobile-3view-fix-20261028">'),
 'Old separate mobile override owner returned');
assert(!h.includes('min-height:95px!important'),'Old oversized report KPI rule returned');
assert(!h.includes("Ringkasan hasil penjualan dan manfaat untuk warga serta lingkungan, berdasarkan pembukuan yang sudah disahkan."),
 'Verbose report introduction returned');
assert(!h.includes("Nilai sah berasal dari penjualan yang disahkan. Perkiraan menunggu disajikan terpisah dan tidak menambah saldo."),
 'Verbose approval note returned');
assert(!h.includes("data.catatan+' Data pribadi warga tidak ditampilkan.'"),
 'Duplicated report footnote returned');
for(const label of ['Anggota aktif','Jenis barang','Berat terkonfirmasi','Kegiatan terpublikasi']){
 assert(h.includes("v17PublicStat('"+label+"'"),'Public safe metric missing: '+label);
}
assert(h.includes('🔒 Saldo dan riwayat pribadi tersedia setelah login.'),
 'Guest message must explain private financial records');
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
assert(/\/portal-live\/bank-eco-pages\.css\?v=\d{8}-[a-z0-9-]+/.test(h),
 'Bank Sampah profile/dock stylesheet must be versioned');
assert(/\/portal-live\/bank-mobile-app\.js\?v=\d{8}-[a-z0-9-]+/.test(h),
 'Bank Sampah mobile app script must be versioned');
assert(css.includes('.f4-bank-currency-mark{'),
 'Rp payout icon must use the canonical bank dock styles');
assert(h.includes('id="f4BankPageGreeting"'), 'Manager greeting must be scopeable to the home route');
assert(mobile.includes('greeting.hidden=roleType()!=="admin"||screen!=="dashboard"'),
 'Manager greeting may only display on Admin Beranda, not after an account switch');
assert(!mobile.includes('Beranda Pengelola') && !mobile.includes('Mulai pencatatan dan periksa pekerjaan Bank Sampah'),
 'Duplicate manager homepage title/intro returned');
assert(h.includes("if(/admin/i.test(String(profile?.peran||''))){") &&
       h.includes("tabs.classList.add('hidden');return;"),
 'Manager routes must not duplicate direct sidebar entries as category tabs');
assert(!h.includes('Album foto dan video kegiatan Bank Sampah Flamboyan 4'),
 'Redundant documentation subtitle returned');
assert(css.includes('.f4-compact-sale-row>input{grid-column:span 2}') &&
       css.includes('.f4-compact-sale-row>.f4-compact-entry-group{grid-column:span 4}'),
 'Sale price input must be allocated more width than the weight input');

// Bank Sampah: shared form grid is owned by bank-eco-pages.css, not desktop overrides.
assert(css.includes('grid-template-columns:repeat(12,minmax(0,1fr))'),
 'Shared twelve-track Bank Sampah entry grid missing');
assert(css.includes('#dashboardView .section :is(#saleForm,#setoranForm)>.f4-entry-right{') &&
       h.includes('class="f4-entry-right"') &&
       h.includes('class="f4-sale-side"') &&
       h.includes('class="f4-sale-payment-fields"'),
 'Sale payment must remain inside its independent desktop panel');
assert(css.includes('#saleForm .f4-sale-top-fields>.field{'),
 'Sale three-field row must keep its explicit column spans');
assert(!css.includes('body.f4-bank-app-private #dashboardView #pageSetoran .f4-entry-top-fields,'),
 'Legacy desktop grid override was reintroduced');
assert(/\/portal-live\/bank-eco-pages\.css\?v=\d{8}-[a-z0-9-]+/.test(h),
 'Bank entry stylesheet requires a current version key');
const modernCss=fs.readFileSync('portal-live/modern-portals.css','utf8');
assert(!modernCss.includes('max-width:850px!important') &&
       css.includes('#saleForm .f4-sale-note-fields{'),
 'Bank goods must fill the full grid and sale notes must have a single canonical owner');
assert(!h.includes('.f4-sale-note-fields{display:grid;'),
 'Retired inline sale notes grid returned to Bank HTML');
assert(!modernCss.includes('#setoranForm')&&!modernCss.includes('#saleForm'),
 'Legacy forced Setoran/Penjualan CSS must not return to modern-portals.css');
assert(h.includes("amountGroup.append(weight,remove)") &&
       h.includes("priceGroup.append(price,remove)"),
 'Deposit/sale row delete action must share its grid cell with the amount input');
assert(css.includes('.f4-compact-row>select{grid-column:span 6}') &&
       css.includes('.f4-compact-sale-row>input{grid-column:span 2}') &&
       css.includes('.f4-compact-sale-row>.f4-compact-entry-group{grid-column:span 4}'),
 'Sale goods grid must use 6-2-4 tracks so price is wider than weight');
assert(css.includes('max-height:var(--bank-input-h);padding-block:0;align-self:start'),
 'Setoran and Penjualan native inputs must have a fixed, equal control height');
assert(css.includes('align-content:start;gap:4px;min-width:0;margin:0') &&
       css.includes('align-content:start;gap:6px;min-width:0;margin:0') &&
       css.includes('#saleForm .f4-sale-top-fields{\n gap:8px'),
 'Sale field spacing must not inherit legacy bottom margins');
assert(css.includes('#saleForm .f4-sale-note-fields>.field>label{') &&
       css.includes('#saleForm .f4-sale-note-fields>.field>input{'),
 'Sale proof and reason labels/inputs must share one owner');
assert(h.includes("wrap.className='field f4-field-stack'"),
 'Dynamically created sale reason must use the same field structure');
// The Warga picker is an enhanced button, not the hidden #setWarga <select>.
const pickerOwner=h.match(/<style id="f4-bank-member-search-style">([\s\S]*?)<\/style>/)?.[1]||'';
assert(pickerOwner.includes('.f4-warga-picker-open{box-sizing:border-box;') &&
       pickerOwner.includes('height:42px;min-height:42px;max-height:42px;') &&
       pickerOwner.includes('padding:0 13px!important;'),
 'The visible warga picker must match the adjacent 42px date control');
assert(!pickerOwner.includes('min-height:47px'),'Old 47px warga picker returned');
assert(h.includes("trigger.className='f4-warga-picker-open'"),
 'Warga picker button must remain wired to searchable warga selection');
// Six operational menu categories; no orphaned finance, inventory, history, or approval routes.
const navSource=h.match(/const v16Groups=\[([\s\S]*?)\];/)?.[1]||'';
const adminGroups=[...navSource.matchAll(/\{id:'([^']+)',label:'([^']+)',icon:'[^']+',admin:true/g)]
 .map(x=>x[1]);
assert.deepEqual(adminGroups,['home','deposit','sale','finance','management','report'],
 'Admin sidebar must contain six operational categories');
for(const route of ['setoran','bank-admin-history','penjualan','bank-admin-sale-history',
 'rekonsiliasi','bank-admin-cash','tabungan','bank-payout-admin',
 'admin','master','bank-admin-docs','laporan','bank-admin-progress']){
 assert(navSource.includes("['"+route+"',"),
  'Operational route is inaccessible: '+route);
}
assert(h.includes('window.v16Sync=v16Sync;') &&
       h.includes('window.v17LoadPublic=v17LoadPublic;') &&
       !navSource.includes("['biaya','Pengeluaran']") &&
       !navSource.includes("['profile','Profil pengurus']"),
 'Expense must be within Debit/Kredit, and profile through the account icon');
assert(mobile.includes('function showAdminProgress()') &&
       mobile.includes('function restoreAdminProgress()') &&
       mobile.includes('showAdminHistory(saleHistory?"penjualan":"setoran")'),
 'Separate sale history or safe progress lifecycle is missing');
assert(mobile.includes('f4BankAdminOperations') &&
       mobile.includes('adminShortcuts.map(adminShortcut)') &&
       mobile.includes('Catat Setoran') &&
       mobile.includes('Catat Penjualan'),
 'Task-first entry and eight shortcuts are missing');
assert(mobile.includes('["Saldo Warga","tabungan","coins"]') &&
       !mobile.includes('["Profil","profile","user-round"]'),
 'Saldo Warga must replace the redundant profile quick access');
assert(mobile.includes('ensureCashExpenseForm()') &&
       mobile.includes('adminCashTab==="out"') &&
       h.includes("new CustomEvent('f4-bank-expense-saved'"),
 'Expense form and ledger must share the Pengeluaran tab and refresh after saving');
assert(css.includes('.f4-bank-cash-expense-section[hidden]{display:none}') &&
       css.includes('.f4-bank-price-shortcut-copy{'),
 'Embedded expense and prominent member price action style owners missing');
assert(css.includes('grid-area:actions') &&
       !css.includes('grid-area:next') &&
       css.includes('grid-area:recent'),
 'Operational dashboard grid contains duplicate/empty follow-up card');
assert(css.includes('#v16Tabs.v16-tabs:not(.hidden)') &&
       mobile.includes('tabs.hidden=false') &&
       mobile.includes('for(const [key,,panel] of options)panel?.classList.toggle("hidden",key!==selected);'),
 'Useful tabs must remain for Riwayat and Debit/Kredit on mobile');
assert(mobile.includes('const unframed=admin&&page.parentElement===section;'),
 'Admin page outer frames must be removed on PC as well as HP');
assert(!mobile.includes('const unframed=mobile&&page.parentElement===section;'),
 'Mobile-only outer frame removal regressed');
assert(h.includes('class="f4-sale-payment-fields"') &&
       h.indexOf('id="saleReceived"') < h.indexOf('id="saleStatus"') &&
       css.includes('#saleForm .f4-sale-payment-fields{') &&
       css.includes('grid-template-columns:repeat(2,minmax(0,1fr));') &&
       css.includes('#dashboardView .section :is(#saleForm,#setoranForm){'),
 'Desktop Sale and Setoran must use equal columns with amount before payment status');
assert(!css.includes('#dashboardView .section>.card:not(#pageDashboard,#pageProfile)'),
 'Old desktop outside card owner returned');
assert(css.includes('grid-template-rows:18px 42px auto;align-content:start;') &&
       css.includes('.f4-bank-own-field input{'),
 'Own-deposit date and amount must share fixed label/control baselines');
// Primary work cards must carry real icons, labels and action affordances.
assert(mobile.includes('f4-bank-admin-operation-icon') &&
       mobile.includes('f4-bank-admin-operation-copy') &&
       mobile.includes('f4-bank-admin-operation-arrow'),
 'Admin primary task cards must include icon, copy and directional affordance');
assert(css.includes('#f4BankAdminOperations .f4-bank-admin-operation-copy strong{') &&
       css.includes('grid-template-columns:48px minmax(0,1fr) 28px;'),
 'Admin primary task cards no longer use the canonical focal layout');
assert(css.includes('#dashboardView .section :is(#saleForm,#setoranForm)>.f4-entry-right{') &&
       h.includes('class="f4-setoran-side"') &&
       h.includes('class="f4-sale-main"') &&
       h.includes('class="f4-sale-side"') &&
       css.includes('grid-column:1;grid-row:1;align-self:start') &&
       !css.includes('grid-row:1 / span 2;align-self:start'),
 'PC Sale and Setoran entry panels must remain independent of right-side controls');
console.log('F4_BANK_CANONICAL_THEME_OK');
