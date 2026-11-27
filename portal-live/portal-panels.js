/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/portal-panels.js",function(__f4){


/* Four-portal staging adapter: show one Portal Utama content panel at a time.
   It reuses ALL existing DOM/forms/click handlers without rebuilding the old portal. */
(()=>{
'use strict';
const main=__f4.globals.document.querySelector('body>main');if(!main)return;
const paymentToggle=__f4.globals.document.getElementById('f4-mobile-payment-toggle');
const current={panel:'beranda',role:'public'};
const finance=__f4.globals.document.getElementById('keuangan');
let scrollScheduled=false,lastVisible='';
const sectionTargets={
 beranda:__f4.globals.document.querySelector('body>main>section:first-of-type'),
 keuangan:__f4.globals.document.getElementById('keuangan'),
 'kas-warga':__f4.globals.document.getElementById('keuangan'),
 projek:__f4.globals.document.getElementById('projek'),
 inventaris:__f4.globals.document.getElementById('container-inventaris-warga')||__f4.globals.document.getElementById('kegiatan'),
 kalender:__f4.globals.document.getElementById('rencana'),
  arisan:__f4.globals.document.getElementById('arisan'),
 komentar:__f4.globals.document.getElementById('komentar-warga'),
 pembayaran:paymentToggle
};
const el=(tag,text,cls)=>{const a=__f4.globals.document.createElement(tag);if(text!==__f4.globals.undefined)a.textContent=(0,__f4.globals.String)(text);if(cls)a.className=cls;return a};
const prefersReduced=()=>__f4.window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function reportVisible(panel){
 if(panel===lastVisible)return;
 lastVisible=panel;
 (__f4.window.parent!==window?__f4.window.parent:window).postMessage({type:'f4:portal-visible-panel',panel},__f4.globals.location.origin);
}
function visiblePanel(){
 if(scrollScheduled)return;
 scrollScheduled=true;
 (0,__f4.globals.requestAnimationFrame)(()=>{
  scrollScheduled=false;
  // Scrollspy: the last section reaching the reading line is the active menu.
  const landmarks=[
   ['beranda',sectionTargets.beranda],
   ['keuangan',current.role==='public'?null:sectionTargets.keuangan],
   ['keuangan',current.role==='public'?null:__f4.globals.document.getElementById('arisan')],
   ['kalender',sectionTargets.kalender],
   ['projek',sectionTargets.projek],
   ['inventaris',__f4.globals.document.getElementById('kegiatan')],
   ['komentar',sectionTargets.komentar]
  ];
  let active='beranda';
  for(const [name,node] of landmarks){
   if(node&&node.getClientRects().length&&node.getBoundingClientRect().top<=150)active=name;
  }
  current.panel=active;
  reportVisible(active);
 });
}
function showPanel(panel,recordHistory=true){
 // Inventaris sudah memiliki halaman khusus di Dokumentasi, bukan kartu di Beranda.
 if(panel==='inventaris'){__f4.globals.location.assign('/dokumentasi/?halaman=inventaris');return;}
 if(!__f4.globals.Object.hasOwn(sectionTargets,panel)||(['keuangan','kas-warga'].includes(panel)&&current.role==='public'))panel='beranda';
 if(panel==='pembayaran'&&__f4.globals.F4ResidentTools?.openPayment())return;
 if(panel==='pembayaran'){if(__f4.window.f4OpenMobilePayment)__f4.window.f4OpenMobilePayment();else __f4.globals.document.getElementById('f4-mobile-payment-toggle')?.click();return;}
 current.panel=panel;
 const element=sectionTargets[panel]||sectionTargets.beranda;
 if(!element)return;
 const top=__f4.globals.Math.max(0,__f4.window.scrollY+element.getBoundingClientRect().top-64);
 __f4.window.scrollTo({top:panel==='beranda'?0:top,behavior:panel==='beranda'||prefersReduced()?'instant':'smooth'});
 // Highlight immediately; scroll listener keeps it accurate as the view moves.
 reportVisible(panel==='kas-warga'?'keuangan':panel);
 if(recordHistory){
  const dest=new __f4.globals.URL(__f4.globals.location.href);dest.hash='';
  if(panel==='beranda')dest.searchParams.delete('halaman');else dest.searchParams.set('halaman',panel);
  const currentPage=new __f4.globals.URLSearchParams(__f4.globals.location.search).get('halaman')||'beranda';
  if(currentPage!==panel){__f4.globals.history.pushState({...__f4.globals.history.state,f4PortalPanel:panel},'',dest.pathname+dest.search);lastPanelPath=dest.pathname+dest.search;}
 }
}
let lastPanelPath=__f4.globals.location.pathname+__f4.globals.location.search;
 __f4.window.addEventListener('popstate',event=>{
 const path=__f4.globals.location.pathname+__f4.globals.location.search;
 if(path===lastPanelPath)return;
 lastPanelPath=path;
 const page=event.state?.f4PortalPanel||new __f4.globals.URLSearchParams(__f4.globals.location.search).get('halaman')||'beranda';
 if(__f4.globals.Object.hasOwn(sectionTargets,page))showPanel(page,false);
});
__f4.window.addEventListener('scroll',visiblePanel,{passive:true});
__f4.window.addEventListener('resize',visiblePanel,{passive:true});
__f4.window.f4GoBank=()=>{
  if(__f4.window.parent!==window)__f4.window.parent.postMessage({type:'f4:go-portal',portal:'bank-sampah'},__f4.globals.location.origin);
  else __f4.window.location.href='/bank-sampah/';
};
__f4.window.f4PortalSelectPanel=showPanel;
__f4.globals.document.querySelectorAll('a[href^="/?halaman="]').forEach(link=>{
 link.addEventListener('click',event=>{
  const panel=new __f4.globals.URL(link.href).searchParams.get('halaman');
  if(!__f4.globals.Object.hasOwn(sectionTargets,panel))return;
  event.preventDefault();showPanel(panel,true);
 });
});
__f4.window.addEventListener('message',event=>{
 if(event.origin!==__f4.globals.location.origin||event.source!==__f4.window.parent)return;
 if(event.data?.type==='f4:portal-panel')showPanel((0,__f4.globals.String)(event.data.panel||'beranda'));
 if(event.data?.type==='f4:demo-role'){
  const priorRole=current.role;
  current.role=(0,__f4.globals.String)(event.data.role||'public').toLowerCase();
  // This attribute is the UI's existing signed-in visibility guard for cash
  // print buttons and the recent ledger, not an authorization token.
  __f4.globals.document.body.dataset.previewRole=current.role;
  const authenticated=current.role!=='public';
  if(finance){finance.hidden=!authenticated;finance.classList.toggle('hidden',!authenticated);}
  __f4.globals.document.querySelectorAll('[data-f4-private-finance],[data-f4-panel="keuangan"]').forEach(node=>{
   node.hidden=!authenticated;node.classList.toggle('hidden',!authenticated);
  });
  if(!authenticated&&['keuangan','kas-warga','kalender'].includes(current.panel))showPanel('beranda');
  
  __f4.globals.document.dispatchEvent(new __f4.globals.CustomEvent('f4:cash-access-change',{detail:{authenticated}}));
  // The verified role must reveal the finance section before selecting it after SPA mounting.
  if(authenticated&&priorRole==='public'){
   const requested=new __f4.globals.URLSearchParams(__f4.globals.location.search).get('halaman');
   if(requested&&__f4.globals.Object.hasOwn(sectionTargets,requested))showPanel(requested,false);
  }
  visiblePanel();
 }
});
__f4.window.addEventListener('DOMContentLoaded',visiblePanel,{once:true});
visiblePanel();
})();
});
