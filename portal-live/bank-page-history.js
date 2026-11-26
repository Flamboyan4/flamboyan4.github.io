/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/bank-page-history.js",function(__f4){


/* Bank Sampah route history: clean shareable URLs, guarded Back and legacy hashes. */
(()=>{
 'use strict';
 if(__f4.window.f4BankPageHistory||typeof __f4.window.goPage!=='function')return;
 const go=__f4.window.goPage,publicFn=__f4.window.v11ShowPublic;
 const legal=/^[A-Za-z][A-Za-z0-9-]{0,47}$/;
 const params=new __f4.globals.URLSearchParams(__f4.globals.location.search);
 let oldHash='';
 try{oldHash=(0,__f4.globals.decodeURIComponent)(__f4.globals.location.hash.match(/^#bs-([^#]+)$/i)?.[1]||'')}catch{}
 const desired=params.get('halaman')||oldHash||'';
 let pending=legal.test(desired)?desired:'',restoring=false,initialized=false,route='',depth=0;
 const cleanUrl=page=>{
   const u=new __f4.globals.URL(__f4.globals.location.href);
   if(page==='public')u.searchParams.delete('halaman');else u.searchParams.set('halaman',page);
   u.hash='';return u.pathname+u.search;
 };
 const current=()=>{
   if(__f4.globals.document.getElementById('dashboardView')?.classList.contains('hidden'))return 'public';
   const active=[...__f4.globals.document.querySelectorAll('#dashboardView [id^="page"]')]
     .find(n=>!n.classList.contains('hidden')&&n.id!=='pageDashboard');
   const name=active?.id.slice(4)||'Dashboard';
   return name[0].toLowerCase()+name.slice(1);
 };
 if(__f4.globals.location.hash){
   const next=legal.test(desired)?desired:current();
   __f4.globals.history.replaceState({...__f4.globals.history.state,f4BankRoute:next},'',cleanUrl(next));
 }
 function record(page,replace=false){
   if(!page||restoring||(page===route&&new __f4.globals.URLSearchParams(__f4.globals.location.search).get('halaman')===(page==='public'?null:page)))return;
   route=page;
   const state={...__f4.globals.history.state,f4BankRoute:page,f4BankSidebarOverlay:false};
   __f4.globals.history[replace||!initialized?'replaceState':'pushState'](state,'',cleanUrl(page));
   initialized=true;
 }
 __f4.window.goPage=function(page){
   if(depth){go(page);return}
   if(!initialized){route=current();initialized=true;
     __f4.globals.history.replaceState({...__f4.globals.history.state,f4BankRoute:route,f4BankSidebarOverlay:false},'',cleanUrl(pending||route));}
   const before=route;go(page);
   const after=current();
   if(!restoring&&!pending&&after!==before)record(after);
 };
 if(typeof publicFn==='function')__f4.window.v11ShowPublic=function(...args){
   if(!initialized){route=current();initialized=true}
   publicFn.apply(this,args);
   if(!restoring)record('public');
 };
 __f4.window.addEventListener('popstate',e=>{
   const target=e.state?.f4BankRoute||new __f4.globals.URLSearchParams(__f4.globals.location.search).get('halaman')||'public';
   if(!legal.test(target)||target===route)return;
   restoring=true;
   try{
     if(target==='public'){publicFn?.();route='public';return}
     const dashboard=__f4.globals.document.getElementById('dashboardView');
     const visible=!dashboard?.classList.contains('hidden')||__f4.window.f4BankRevealPrivateForHistory?.();
     if(!visible){
       route='public';
       __f4.globals.history.replaceState({...__f4.globals.history.state,f4BankRoute:'public'},'',cleanUrl('public'));
       return;
     }
     __f4.window.goPage(target);
     route=__f4.window.f4BankAppCurrentRoute?.()||current();
     if(route!==target)__f4.globals.history.replaceState({...__f4.globals.history.state,f4BankRoute:route},'',cleanUrl(route));
   }finally{restoring=false}
 });
 function restoreBookmark(){
   if(!pending||__f4.globals.document.getElementById('dashboardView')?.classList.contains('hidden'))return;
   const target=pending;pending='';
   restoring=true;
   try{if(target!=='public')__f4.window.goPage(target);route=__f4.window.f4BankAppCurrentRoute?.()||current()}
   finally{restoring=false}
   __f4.globals.history.replaceState({...__f4.globals.history.state,f4BankRoute:route},'',cleanUrl(route));
 }
 const dashboard=__f4.globals.document.getElementById('dashboardView');
 if(dashboard)new __f4.globals.MutationObserver(restoreBookmark).observe(dashboard,{attributes:true,attributeFilter:['class']});
 if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',restoreBookmark,{once:true});
 else restoreBookmark();
 __f4.window.f4BankPageHistory={
  current:()=>route,
  begin:()=>{depth++},
  end:page=>{
    depth=__f4.globals.Math.max(0,depth-1);
    if(depth||restoring||pending)return;
    if(!initialized){route=current();initialized=true;__f4.globals.history.replaceState({...__f4.globals.history.state,f4BankRoute:route},'',cleanUrl(route))}
    record(page||current());
  }
 };
})();

});
