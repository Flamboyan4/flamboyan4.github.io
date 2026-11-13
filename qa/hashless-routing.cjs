'use strict';
/* URL route regression: isolated History API fixture, no network, no account/DB writes. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('portal-live/bank-page-history.js','utf8');

function make(initial='/bank-sampah/',canReveal=true){
 const base='https://flamboyan4.web.id';
 let url=new URL(initial,base),at=0;
 const stack=[{url:url.href,state:null}],events=new Map();
 const classes=(values=[])=>{const set=new Set(values);return {contains:x=>set.has(x),add:x=>set.add(x),remove:x=>set.delete(x)}};
 const dashboard={classList:classes()},home={id:'pageDashboard',classList:classes()},privatePage={id:'pagePribadi',classList:classes(['hidden'])};
 const location={
  get href(){return url.href},get pathname(){return url.pathname},
  get search(){return url.search},get hash(){return url.hash}
 };
 const history={
  get state(){return stack[at].state},
  pushState(state,_title,path){stack.splice(++at);url=new URL(path,url);stack.push({url:url.href,state})},
  replaceState(state,_title,path){url=new URL(path,url);stack[at]={url:url.href,state}},
  back(){if(!at)return;at--;url=new URL(stack[at].url);for(const cb of events.get('popstate')||[])cb({state:stack[at].state})}
 };
 const window={
  addEventListener(type,cb){const arr=events.get(type)||[];arr.push(cb);events.set(type,arr)},
  goPage(page){dashboard.classList.remove('hidden');home.classList[page==='dashboard'?'remove':'add']('hidden');
   privatePage.classList[page==='pribadi'?'remove':'add']('hidden')},
  v11ShowPublic(){dashboard.classList.add('hidden')},
  f4BankRevealPrivateForHistory(){if(!canReveal)return false;dashboard.classList.remove('hidden');return true}
 };
 const document={
  readyState:'complete',
  getElementById(id){return id==='dashboardView'?dashboard:null},
  querySelectorAll(sel){assert.equal(sel,'#dashboardView [id^="page"]');return [home,privatePage]}
 };
 const sandbox={window,document,location,history,URL,URLSearchParams,
  MutationObserver:class{observe(){}},
  console};
 vm.runInNewContext(source,sandbox,{timeout:2000});
 return {window,history,location,privatePage,dashboard};
}
const a=make();
a.window.goPage('pribadi');
assert.equal(new URLSearchParams(a.location.search).get('halaman'),'pribadi');
assert.equal(a.location.hash,'');
a.window.v11ShowPublic();
assert.equal(a.location.search,'');
assert.equal(a.location.hash,'');
a.history.back();
assert.equal(new URLSearchParams(a.location.search).get('halaman'),'pribadi');
assert.equal(a.dashboard.classList.contains('hidden'),false,'Back must reveal the authenticated dashboard');
assert.equal(a.privatePage.classList.contains('hidden'),false,'Back must restore private page');
const b=make('/bank-sampah/#bs-pribadi');
assert.equal(b.location.hash,'');
assert.equal(new URLSearchParams(b.location.search).get('halaman'),'pribadi');
const c=make();
c.window.f4BankPageHistory.begin();
c.window.goPage('dashboard');
c.window.f4BankPageHistory.end('bank-history');
assert.equal(new URLSearchParams(c.location.search).get('halaman'),'bank-history');
assert.equal(c.location.hash,'');
const d=make('/bank-sampah/',false);
d.window.goPage('pribadi');d.window.v11ShowPublic();d.history.back();
assert.equal(d.location.search,'','A revoked session must not restore a protected route');
assert.equal(d.dashboard.classList.contains('hidden'),true);
const sa=fs.readFileSync('superadmin/index.html','utf8');
const gallery=fs.readFileSync('portal-live/dokumentasi/media-preview.js','utf8');
const portal=fs.readFileSync('portal-live/portal-panels.js','utf8');
assert(sa.includes("url.searchParams.set('halaman'"),'Superadmin must write query URLs');
assert(gallery.includes("url.searchParams.set('halaman','inventaris')"),'Gallery inventory should be hashless');
assert(portal.includes("dest.searchParams.set('halaman',panel)"),'Portal panels should write query URLs');
for(const name of ['bank-sampah/index.html','superadmin/index.html']){
 const html=fs.readFileSync(name,'utf8');
 assert(!/history\.(?:pushState|replaceState)\([^\n]*['"]#(?:bs-|sa-)/.test(html),'Fragment route returned in '+name);
}
console.log('F4_HASHLESS_ROUTE_BACK_OK');
