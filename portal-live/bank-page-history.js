/* In-page history for Bank Sampah: Back restores prior view, not prior portal. */
(()=>{
 'use strict';
 if(window.f4BankPageHistory||typeof window.goPage!=='function')return;
 const go=window.goPage,publicFn=window.v11ShowPublic;
 let restoring=false,initialized=false,route='';
 const current=()=>[...document.querySelectorAll('#dashboardView [id^="page"]')]
  .find(el=>!el.classList.contains('hidden')&&el.id!=='pageDashboard')?.id?.slice(4).toLowerCase()||
  (document.getElementById('dashboardView')?.classList.contains('hidden')?'public':'dashboard');
 function record(page,replace=false){
  if(!page||restoring||page===route)return;
  route=page;
  const state={...history.state,f4BankSidebarOverlay:false,f4BankRoute:page};
  const method=replace||!initialized?'replaceState':'pushState';
  history[method](state,'','#bs-'+encodeURIComponent(page));
  initialized=true;
 }
 // Preserve original page routing (API loading, protection, menu syncing).
 window.goPage=function(page){
  if(!initialized){route=current();initialized=true;
   history.replaceState({...history.state,f4BankRoute:route,f4BankSidebarOverlay:false},'',location.href);}
  const old=route;
  go(page);
  const target=current();
  if(!restoring&&target!==old)record(target);
 };
 if(typeof publicFn==='function'){
  window.v11ShowPublic=function(...args){
   if(!initialized){route=current();initialized=true;history.replaceState({...history.state,f4BankRoute:route},'',location.href)}
   publicFn.apply(this,args);
   if(!restoring)record('public');
  };
 }
 window.addEventListener('popstate',e=>{
  const target=e.state?.f4BankRoute;
  if(!target||target===route)return;
  restoring=true;
  try{
   if(target==='public'&&typeof publicFn==='function')publicFn();
   else go(target);
   route=target;
  }finally{restoring=false}
 });
 window.f4BankPageHistory={current:()=>route};
})();
