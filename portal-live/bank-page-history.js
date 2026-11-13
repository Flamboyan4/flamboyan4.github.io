/* Bank Sampah route history: clean shareable URLs, guarded Back and legacy hashes. */
(()=>{
 'use strict';
 if(window.f4BankPageHistory||typeof window.goPage!=='function')return;
 const go=window.goPage,publicFn=window.v11ShowPublic;
 const legal=/^[A-Za-z][A-Za-z0-9-]{0,47}$/;
 const params=new URLSearchParams(location.search);
 let oldHash='';
 try{oldHash=decodeURIComponent(location.hash.match(/^#bs-([^#]+)$/i)?.[1]||'')}catch{}
 const desired=params.get('halaman')||oldHash||'';
 let pending=legal.test(desired)?desired:'',restoring=false,initialized=false,route='';
 const cleanUrl=page=>{
   const u=new URL(location.href);
   if(page==='public')u.searchParams.delete('halaman');else u.searchParams.set('halaman',page);
   u.hash='';return u.pathname+u.search;
 };
 const current=()=>{
   if(document.getElementById('dashboardView')?.classList.contains('hidden'))return 'public';
   const active=[...document.querySelectorAll('#dashboardView [id^="page"]')]
     .find(n=>!n.classList.contains('hidden')&&n.id!=='pageDashboard');
   const name=active?.id.slice(4)||'Dashboard';
   return name[0].toLowerCase()+name.slice(1);
 };
 if(location.hash){
   const next=legal.test(desired)?desired:current();
   history.replaceState({...history.state,f4BankRoute:next},'',cleanUrl(next));
 }
 function record(page,replace=false){
   if(!page||restoring||page===route)return;
   route=page;
   const state={...history.state,f4BankRoute:page,f4BankSidebarOverlay:false};
   history[replace||!initialized?'replaceState':'pushState'](state,'',cleanUrl(page));
   initialized=true;
 }
 window.goPage=function(page){
   if(!initialized){route=current();initialized=true;
     history.replaceState({...history.state,f4BankRoute:route,f4BankSidebarOverlay:false},'',cleanUrl(pending||route));}
   const before=route;go(page);
   const after=current();
   if(!restoring&&after!==before)record(after);
 };
 if(typeof publicFn==='function')window.v11ShowPublic=function(...args){
   if(!initialized){route=current();initialized=true}
   publicFn.apply(this,args);
   if(!restoring)record('public');
 };
 window.addEventListener('popstate',e=>{
   const target=e.state?.f4BankRoute||new URLSearchParams(location.search).get('halaman')||'public';
   if(!legal.test(target)||target===route)return;
   restoring=true;
   try{
     if(target==='public')publicFn?.();else if(!document.getElementById('dashboardView')?.classList.contains('hidden'))go(target);
     route=target;
   }finally{restoring=false}
 });
 function restoreBookmark(){
   if(!pending||document.getElementById('dashboardView')?.classList.contains('hidden'))return;
   const target=pending;pending='';
   restoring=true;
   try{if(target!=='public')window.goPage(target);route=current()}
   finally{restoring=false}
   history.replaceState({...history.state,f4BankRoute:route},'',cleanUrl(route));
 }
 const dashboard=document.getElementById('dashboardView');
 if(dashboard)new MutationObserver(restoreBookmark).observe(dashboard,{attributes:true,attributeFilter:['class']});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreBookmark,{once:true});
 else restoreBookmark();
 window.f4BankPageHistory={current:()=>route};
})();
