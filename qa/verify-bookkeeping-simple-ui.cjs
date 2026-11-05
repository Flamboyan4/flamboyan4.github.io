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
assert(html.includes('bookkeeping-simple.css?v=20261105-simplified-v1'));
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
assert(html.includes('<details id="kekurangan-kas-card"'));
assert(html.includes('id="kurang-kas-state"'));
assert(html.includes('f4-iuran-preview'));
assert(html.includes('f4-book-period-controls'));
assert(css.includes('.f4-book-subnav.hidden{display:none}'));
assert(css.includes('#group-nav-inputdata.f4-book-tab-shell.hidden{display:none}'));
assert(!css.replace(/\/\*[\s\S]*?\*\//g,'').includes('!important'),
 'New CSS must not use !important');
const legacyPriority=(html.match(/!important/g)||[]).length;
assert(legacyPriority<=1963,'Old CSS priority rules must not grow beyond audited baseline');
assert(html.includes('bookkeeping-grid.css?v=20261105-grid-v1'));
assert(html.includes('class="f4-book-iuran-grid desktop-compact-form"'));
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
console.log('F4_BOOKKEEPING_SIMPLIFIED_UI_OK');
