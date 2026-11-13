'use strict';
/* Read-only layout + CSS specificity audit; no database or API access. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=path=>fs.readFileSync(path,'utf8');
const expected={
 'portal-live/direct-shell.css':170,
 'portal-live/portal-polish.css':167,
 'portal-live/home-base.css':78,
 'portal-live/bank-eco-pages.css':323,
 'portal-live/dokumentasi/site.css':2,
 'portal-live/treasury-center.css':0,
 'index.html':0,
 'bank-sampah/index.html':1274,
 'pembukuan/index.html':2123,
 'superadmin/index.html':3,
 'rapat/index.html':177,
 'dokumentasi/index.html':37,
 'portal-live/modern-portals.css':1324,
 'portal-live/bank-eco-dashboard.css':396,
 'portal-live/dokumentasi/media-theme.css':112,
 'portal-live/unified-account.css':90,
 'portal-live/home-overrides.css':44,
 'portal-live/bank-member-polish.css':18,
 'portal-live/loading-state.css':3
};
const totals={};
for(const [path,max] of Object.entries(expected)){
 const count=(read(path).match(/!important/g)||[]).length;
 totals[path]=count;
 assert(count<=max, 'New !important rules detected in '+path+': '+count+' > '+max);
}
const required=[
 ['portal-live/direct-shell.css',[
   '--f4-grid-gap:16px','--f4-grid-gap-compact:10px','--f4-content-max:1180px',
   '.f4-grid{display:grid;grid-template-columns:repeat(var(--f4-grid-cols,12)',
   '.f4-grid[data-cols="5"]','@media(max-width:640px)']],
 ['index.html',['class="f4-page-width','class="f4-cash-overview"','class="f4-cash-summary"','data-cols="2"']],
 ['pembukuan/index.html',['class="grid f4-grid mb-6" data-cols="5"',
   'class="kas-summary grid f4-grid mb-5" data-cols="4"','class="grid f4-grid mb-5" data-cols="4"']],
 ['bank-sampah/index.html',['--f4-public-grid-gap:var(--f4-grid-gap,16px)',
   '#v11Public .v17-public-main>.v17-section{margin-top:0}']],
 ['portal-live/bank-eco-pages.css',[
   '#f4BankAppHome[data-bank-role="member"]',
   '#f4BankAppHome[data-bank-role="admin"]',
   'grid-template-columns:repeat(2,minmax(0,1fr))',
   'gap:var(--f4-grid-gap,16px)']],
 ['superadmin/index.html',['.sa-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--f4-grid-gap,16px)',
   '.f4-obligation-identity{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))']],
 ['portal-live/treasury-center.css',['.tc-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--f4-grid-gap,16px)',
   '.tc-center{display:grid;gap:var(--f4-grid-gap,16px)']],
 ['portal-live/dokumentasi/site.css',['.media-album-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--f4-grid-gap,16px)']],
 ['rapat/index.html',['id="container-grid-rapat" class="grid f4-grid w-full" data-cols="3"']]
];
for(const [path,tokens] of required){
 const source=read(path);
 for(const token of tokens)assert(source.includes(token),'Layout marker missing in '+path+': '+token);
}
const core=read('portal-live/direct-shell.css');
const begin=core.indexOf('/* Layout tunggal untuk kartu');
const end=core.indexOf('#f4-direct-bar,#f4-direct-bar',begin);
assert(begin>=0&&end>begin,'Single shared grid definition missing');
assert(!core.slice(begin,end).includes('!important'),'Shared grid must not use !important');
for(const selector of ['.f4-grid{display:grid;', '.f4-grid[data-cols="2"]{--f4-grid-cols:2}', '.f4-grid[data-cols="3"]{--f4-grid-cols:3}']){
 assert.equal(core.split(selector).length-1,1,'Duplicated shared grid selector: '+selector);
}
const bank=read('bank-sampah/index.html');
const book=read('pembukuan/index.html');
const sa=read('superadmin/index.html');
const finance=read('portal-live/treasury-center.css');
const shared=read('portal-live/modern-portals.css');
assert(core.includes('--f4-control-height:42px'),'Control height token missing');
assert(core.includes('.f4-controls{display:flex')&&core.includes('.f4-field-stack{display:grid'),'Canonical form controls missing');
assert(!sa.includes('portal-live/account-workspace.css'),'Legacy management overlay stylesheet still stacked on Superadmin');
assert(!fs.existsSync('portal-live/account-workspace.css'),'Unreferenced legacy account workspace CSS returned');
assert(!sa.includes('Override legacy account-workspace'),'Legacy override-only Superadmin block returned');
assert.equal(sa.split('.sa-account-note{').length-1,1,'Superadmin account note still has duplicate ownership');
assert(bank.includes('class="field f4-field-stack"'),'Bank weighing forms do not use aligned field stacks');
assert(book.includes('class="f4-field-stack"'),'Bookkeeping report filters do not use aligned field stacks');
assert(shared.includes('min-height:var(--f4-control-height,42px)'),'Shared visual controls still have divergent 43/44px sizes');
assert(finance.includes('height:var(--f4-control-height,42px)'),'Treasury form input baseline not unified');
// Gallery icon controls: owner rules must not be reintroduced with forced priority.
const galleryCss=read('portal-live/dokumentasi/site.css');
const iconStart=galleryCss.indexOf('/* Refinement: semua kontrol navigasi');
const iconEnd=galleryCss.indexOf('.portal-month-controls button{',iconStart);
assert(iconStart>=0&&iconEnd>iconStart,'Gallery icon control rule missing');
const iconRule=galleryCss.slice(iconStart,iconEnd);
assert(!iconRule.includes('!important'),'Legacy priority returned to gallery icon controls');
assert(iconRule.includes('display:inline-grid;place-items:center;'),'Gallery icon alignment must remain centered');
assert(galleryCss.includes('[hidden]{display:none!important}'),'Hidden element guard must remain intact');
// Avoid mobile/desktop duplicate ownership where later canonical rules already win.
const memberCss=read('portal-live/bank-member-polish.css');
const dashboardCss=read('portal-live/bank-eco-dashboard.css');
const homeOverrides=read('portal-live/home-overrides.css');
assert(!memberCss.includes('#dashboardView #pageDashboard.f4-member-dashboard .f4-member-finance-note{'),
  'Obsolete member note override returned');
assert(dashboardCss.includes('body #dashboardView #pageDashboard.f4-member-dashboard .f4-member-finance-note{'),
  'Canonical member note is missing');
assert.equal(homeOverrides.split('#f4-private-transactions tbody tr[hidden]{display:none!important}').length-1,1,
  'Duplicate responsive hidden-row override returned');
// CSS ownership: adjacent legacy overlays are coalesced at their original cascade location.
const styleCount=source=>(source.match(/<style\b[^>]*>/gi)||[]).length;
assert(styleCount(read('pembukuan/index.html'))<=32,'Bookkeeping legacy CSS blocks regressed');
assert(styleCount(read('bank-sampah/index.html'))<=11,'Bank Sampah legacy CSS blocks regressed');
const remaining=Object.values(totals).reduce((a,b)=>a+b,0);
console.log('UNIFIED_GRID_STATIC_OK=1');
console.log('LEGACY_IMPORTANT_COUNT='+remaining);
console.log('LEGACY_IMPORTANT_BY_FILE='+JSON.stringify(totals));
console.log('NOTICE: legacy forced rules remain; this check prohibits new forced rules.');
