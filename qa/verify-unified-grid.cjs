'use strict';
/* Read-only layout + CSS specificity audit; no database or API access. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=path=>fs.readFileSync(path,'utf8');
const expected={
 'portal-live/direct-shell.css':171,
 'portal-live/portal-polish.css':179,
 'portal-live/home-base.css':82,
 'portal-live/bank-eco-pages.css':323,
 'portal-live/dokumentasi/site.css':12,
 'portal-live/treasury-center.css':0,
 'index.html':0,
 'bank-sampah/index.html':1322,
 'pembukuan/index.html':2228,
 'superadmin/index.html':152,
 'rapat/index.html':177,
 'dokumentasi/index.html':37
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
 ['index.html',['class="f4-page-width','class="grid f4-grid mb-8','data-cols="3"','data-cols="2"']],
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
const remaining=Object.values(totals).reduce((a,b)=>a+b,0);
console.log('UNIFIED_GRID_STATIC_OK=1');
console.log('LEGACY_IMPORTANT_COUNT='+remaining);
console.log('LEGACY_IMPORTANT_BY_FILE='+JSON.stringify(totals));
console.log('NOTICE: legacy forced rules remain; this check prohibits new forced rules.');
