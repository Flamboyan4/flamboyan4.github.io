'use strict';
/* Pembukuan UI regression: source-only smoke test; no database access or writes. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('pembukuan/index.html','utf8');
const css=fs.readFileSync('portal-live/bookkeeping-simple.css','utf8');
const grid=fs.readFileSync('portal-live/bookkeeping-grid.css','utf8');
const src=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a);
 assert(a>=0&&b>a,'Missing code: '+start);return html.slice(a,b)};
const tags=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
for(const code of tags)new vm.Script(code);
assert(html.includes('bookkeeping-simple.css?v=20261105-simplified-v2'));
const inputNav=src('id="group-nav-inputdata"','id="group-nav-dataacuan"');
assert.deepEqual([...inputNav.matchAll(/data-book-input-section="([^"]+)"/g)].map(m=>m[1]),
 ['input','kas','lainnya']);
for(const key of ['transaksi','kas','talangan','denda','pinjaman'])
 assert(inputNav.includes('data-process-target="'+key+'"'),'Missing tab '+key);
assert(!inputNav.includes('data-process-target="importbulk"'));
const dataNav=src('id="group-nav-dataacuan"','id="tab-dashboard"');
assert(dataNav.includes('data-process-target="importbulk"'));
assert(dataNav.includes('f4-book-admin-tools'));
for(const key of ['dashboard','rumah','warga','config'])
 assert(dataNav.includes('data-process-target="'+key+'"'));
const history=src('id="tab-riwayat"','id="history-iuran-panel"');
const reports=src('id="tab-laporan"','id="report-kas-filter"');
for(const key of ['iuran','kasumum','batch','talangan','denda','pinjaman'])
 assert(history.includes('<option value="'+key+'">'),'History type '+key);
for(const key of ['kas','rt','arisan','denda','talangan','pinjaman','tahunan'])
 assert(reports.includes('<option value="'+key+'">'),'Report type '+key);
assert(html.includes('const picker=document.getElementById(\'f4-history-type\')'));
assert(html.includes('const picker=document.getElementById(\'f4-report-type\')'));
assert(html.includes('<form id="form-iuran"'));
assert(!html.includes('id="kekurangan-kas-card"'),'Duplicate legacy Kas Lorong repayment form must stay removed');
assert(!html.includes('form-kekurangan-kas'),'No second Kas repayment form');
assert(!html.includes('bayarKekuranganKas'),'No dead submit handler');
assert(!grid.includes('#kekurangan-kas-card'),'Obsolete layout rules must stay removed');
assert(html.includes('f4-iuran-preview'));
assert(html.includes('f4-book-period-controls'));
assert(css.includes('.f4-book-subnav.hidden{display:none}'));
assert(css.includes('#group-nav-inputdata.f4-book-tab-shell.hidden{display:none}'));
assert(!css.replace(/\/\*[\s\S]*?\*\//g,'').includes('!important'),
 'New CSS must not use !important');
const legacyPriority=(html.match(/!important/g)||[]).length;
assert(legacyPriority<=1943,'Old CSS priority rules must not grow beyond audited baseline');
assert(/bookkeeping-grid\.css\?v=[^"']+/.test(html),'Bookkeeping grid stylesheet must be linked');
assert(grid.includes('#modal-edit .f4-book-edit-card')&&grid.includes('max-height:calc(100dvh - 32px)'),'Edit modal must fit viewport');
assert(grid.includes('#modal-edit .f4-book-edit-form')&&grid.includes('overflow-y:auto'),'Edit form must scroll inside modal');
assert(grid.includes('z-index:320'),'Edit modal must render above direct-shell bar');

const kasPrint=src('function printKasSepertiLamanUtama(){','function printRtSepertiLamanUtama(){');
assert(kasPrint.includes('@page{size:A4 portrait;margin:10mm 11mm 11mm}'),'Kas print must fit A4');
assert(kasPrint.includes('table{width:100%;min-width:0;border-collapse:collapse;table-layout:fixed'),
 'Kas print table must fill its printable page width with fixed columns');
assert(kasPrint.includes('th,td{border:1px solid #334155'), 'Kas print ledger needs aligned grid lines');
assert(kasPrint.includes('.header{display:grid;grid-template-columns:38px minmax(0,1fr) auto'),
 'Kas report letterhead must be compact');
assert(kasPrint.includes('font:11px/1.36 Arial,Helvetica,sans-serif'),
 'Kas report must not use tiny default serif type');
assert(kasPrint.includes('.logo{display:block;width:38px;height:38px'), 'Kas report logo must be appropriately small');
assert(!kasPrint.includes('*{}body{line-height'), 'Kas print style must not retain the broken empty selectors');
assert(!kasPrint.includes('style="width:5%"'), 'Kas report columns must use corrected proportional widths');

assert(html.includes('class="f4-book-iuran-grid desktop-compact-form"'));
const iuranForm=src('<form id="form-iuran"','</form>');
for(const cls of ['f4-book-warga','f4-book-date-method','f4-book-period',
 'f4-book-preview-column','f4-book-money','f4-book-submit','f4-book-submit-spacer']){
 assert(iuranForm.includes('class="'+cls)||iuranForm.includes('class="'+cls+' '),
 'Missing iuran grid element '+cls);
}
const divTags=[...iuranForm.matchAll(/<[/]?div[^>]*>/g)].map(m=>m[0]);
let divDepth=0;
for(const tag of divTags){
 divDepth+=tag.startsWith('</')?-1:1;
 assert(divDepth>=0,'Iuran layout has unexpected closing div');
}
assert.equal(divDepth,0,'Iuran layout divs are not balanced');
assert(grid.includes('>.f4-book-warga{grid-column:1;grid-row:1}'));
assert(grid.includes('>.f4-book-preview-column{grid-column:2;grid-row:1/4;align-self:start}'));
assert(grid.includes('>.f4-book-money{grid-column:1;grid-row:4}'));
assert(grid.includes('>.f4-book-submit{grid-column:2;grid-row:4;align-self:start}'));
assert(grid.includes('.f4-book-submit-spacer{display:none}'),'Mobile submit spacer not removed');
assert(grid.includes('grid-template-columns:minmax(0,7fr) minmax(0,5fr)'),
 'History filter columns must fill the entire width');
assert(!html.includes('.history-iuran-search .custom-select-wrap{width:110px!important}'),
 'Old 110px status override must stay removed');
assert(!html.includes('min-height:50px!important;'),
 'Old mobile 50px overrides must stay removed');

assert(!html.includes('#tab-input #form-iuran{display:flex!important'));
assert(!grid.includes('!important'),'Grid owner must use ordinary scoped selectors');
for(const mod of ['#tab-input','#tab-transaksi','#tab-kas','#tab-talangan','#tab-denda',
 '#tab-pinjaman','#tab-riwayat','#tab-laporan','#tab-dashboard','#tab-rumah','#tab-warga'])
 assert(grid.includes(mod),'Missing grid coverage: '+mod);
assert(grid.includes('@media screen and (max-width:767px)'));
assert(grid.includes('#tab-riwayat #history-iuran-panel .history-iuran-filter'));
assert(grid.includes('#tab-riwayat #iuran-quick-summary .iuran-quick-grid'));
assert(grid.includes('#tab-transaksi #form-transaksi-kas.trx-layout .trx-type{grid-column:1/5;grid-row:1}'));
assert(grid.includes('#tab-transaksi #form-transaksi-kas.trx-layout :is(.trx-type,.trx-desc,.trx-note,.trx-status,.trx-save){grid-column:1/-1}'));
assert(!html.includes('#tab-transaksi .trx-layout{\\n    display:grid!important'));

assert(html.includes('const extra=[...(titleCell?.querySelectorAll'));
assert(html.includes('p.textContent=f4IuranPeriodDisplay(d.labelPeriode'));
assert(html.includes('function printLaporan()'));
const periodCode=src('function f4IuranPeriodDisplay(label){','let IURAN_QUICK_DATA=');
const periodLabel=vm.runInNewContext(periodCode+
 ';f4IuranPeriodDisplay("2026-11 s.d. 2026-11")',{Date,Intl});
assert.equal(periodLabel,'November 2026');


// Navigate using the actual menu controller, with inert DOM and financial callbacks.
function element(){const classes=new Set();return {
 dataset:{},value:'',textContent:'',attributes:{},
 classList:{add(...x){x.forEach(k=>classes.add(k))},remove(...x){x.forEach(k=>classes.delete(k))},
 toggle(k,v){v?classes.add(k):classes.delete(k)},contains(k){return classes.has(k)}},
 setAttribute(k,v){this.attributes[k]=v}
}}
const sections=Object.fromEntries(['input','kas','lainnya'].map(x=>[x,element()]));
for(const [k,v] of Object.entries(sections))v.dataset.bookInputSection=k;
const buttons=Object.fromEntries(['transaksi','kas','talangan','denda','pinjaman',
 'dashboard','rumah','warga','config','importbulk'].map(x=>[x,element()]));
const side=Object.fromEntries(['inputdata','riwayat','laporan','dataacuan'].map(x=>[x,element()]));
const ids=Object.fromEntries(['group-nav-inputdata','group-nav-dataacuan','f4-book-subnav-kas',
 'f4-book-subnav-lainnya','page-title','page-subtitle','page-heading'].map(x=>[x,element()]));
for(const x of ['input','transaksi','kas','talangan','denda','pinjaman','importbulk',
 'dashboard','rumah','warga','config','riwayat','laporan'])ids['tab-'+x]=element();
const admin=element(),doc={
 getElementById:k=>ids[k]||null,
 querySelectorAll:q=>q==='.custom-select-wrap.open'?[]:q==='.tab-panel'?
 Object.keys(ids).filter(k=>k.startsWith('tab-')).map(k=>ids[k]):
 q==='.drawer-item'?Object.values(side):q==='.process-btn'?Object.values(buttons):
 q==='[data-book-input-section]'?Object.values(sections):[],
 querySelector:q=>{const a=q.match(/^\[data-menu-group="([^"]+)"\]$/);
 if(a)return side[a[1]]||null;
 const b=q.match(/^\[data-process-target="([^"]+)"\]$/);
 if(b)return buttons[b[1]]||null;
 return q==='.f4-book-admin-tools'?admin:null}
};
const noop=()=>{},context={document:doc,window:{scrollTo:noop},tutupMenu:noop,
 loadRiwayat:noop,pilihRiwayat:noop,initTransaksiKasUi:noop,
 KAS_LOADED:true,renderPembukuanKas:noop,loadPembukuanKas:noop,
 initPinjamanUi:noop,loadPinjaman:noop,initTalanganUi:noop,loadTalangan:noop,
 initDendaUi:noop,loadDenda:noop,initLaporanUi:noop,loadLaporan:noop,
 bulkRefreshControls:noop,lucide:{createIcons:noop}};
vm.createContext(context);
vm.runInContext(src('function pilihMenu(n){','\nfunction pilihRiwayat(type)'),context);
for(const [route,section,sub] of [['input','input',null],['transaksi','kas','f4-book-subnav-kas'],
 ['kas','kas','f4-book-subnav-kas'],['denda','lainnya','f4-book-subnav-lainnya'],
 ['pinjaman','lainnya','f4-book-subnav-lainnya']]){
 context.pilihMenu(route);
 assert(sections[section].classList.contains('active'),route+' parent missing');
 if(sub)assert(!ids[sub].classList.contains('hidden'),route+' submenu missing');
}
context.pilihMenu('importbulk');
assert(side.dataacuan.classList.contains('active'),'Import goes to Data Acuan');
assert.equal(admin.attributes.open,'','Admin tool must be expanded for import');
context.pilihMenu('warga');
assert(buttons.warga.classList.contains('active'),'Warga list still reachable');
// Startup performance: avoid fetching large, hidden ledgers on the first screen.
const boot=src('async function muatUlang(){','function renderSemua(){');
assert(boot.includes("action:'bootstrap'"),'Startup must still load residents and tariff data');
assert(!boot.includes('setTimeout(()=>loadRiwayat(true)'),'History should not prefetch at startup');
assert(!boot.includes('loadKekuranganKas('),'No obsolete shortage fetch on page load');
assert(boot.includes("if(!document.getElementById('tab-riwayat')?.classList.contains('hidden'))"),
 'Manual refresh on history must still refresh it');
const nav=src('function pilihMenu(n){','function pilihRiwayat(type){');
assert(nav.includes("if(n==='riwayat')pilihRiwayat('iuran')"),
 'Navigation to history must issue only one history request');
assert(!nav.includes("loadRiwayat(true);pilihRiwayat('iuran')"),
 'History nav should not fetch twice');
assert(html.includes('/api/bookkeeping/iuran/suggested-period?'),
 'Main Iuran form must select the oldest open monthly obligation');
assert(html.includes('/api/bookkeeping/iuran/outstanding?'),
 'Main Iuran form must read month-specific outstanding including Kas Lorong');
assert(html.includes('updateNominalParsialInfo()'),
 'Main Iuran form must still preview partial Kas Lorong payments');

const cashForm=src('<form id="form-transaksi-kas"','</form>');
assert(cashForm.includes('id="trx-status" class="trx-status hidden'), 'Cash save status must keep a grid positioning class');
assert(cashForm.includes('aria-live="polite"'), 'Cash save feedback must be announced accessibly');
assert(grid.includes('.trx-status{grid-column:1/-1;grid-row:4}'), 'Desktop transaction feedback must span the full row');
assert(grid.includes('.trx-status{width:100%;overflow-wrap:anywhere}'), 'Long cash API errors must not squeeze the grid');
const trxNoticeCode=src("function trxMsg(t,type='info'){","function formatNominalInput(el){");
const trxStatusMock={
 className:'trx-status hidden', textContent:'',
 classList:{add(...classes){trxStatusMock.className+=' '+classes.join(' ')}}
};
const trxMsgIsolated=new Function('document',trxNoticeCode+';return trxMsg')({
 getElementById:id=>id==='trx-status'?trxStatusMock:null
});
trxMsgIsolated('Transaksi berhasil disimpan.','success');
assert(trxStatusMock.className.split(' ').includes('trx-status'), 'Success state must not erase grid class');
assert(!trxStatusMock.className.split(' ').includes('hidden'), 'Success state should be visible');
trxMsgIsolated('Koneksi bermasalah.','error');
assert(trxStatusMock.className.split(' ').includes('trx-status'), 'Error state must retain grid class');
assert(html.includes("trxMsg('Transaksi berhasil disimpan. Rinciannya tersedia di Riwayat.','success')"),
 'Cash save notification should use readable text without the long internal transaction ID');

assert(!html.includes('kekurangankas')&&!html.includes('bayarkekurangankas'),
 'Removed legacy endpoints must never be called');
assert(html.includes('rel="preconnect" href="https://api.flamboyan4.web.id"'),
 'API preconnect should be declared in head');

console.log('F4_BOOKKEEPING_SIMPLIFIED_UI_OK');
