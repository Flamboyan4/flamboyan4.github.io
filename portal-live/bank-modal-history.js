/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/bank-modal-history.js",function(__f4){


/* Bank Sampah modal history: Back closes one visible popup, never its page.
   Scoped to this portal; no patches to pushState, native Back, or app routing.
   Gallery lightboxes retain their full-screen presentation. */
(()=>{
 'use strict';
 if(__f4.window.F4BankModalHistory)return;
 const rootSelectors=[
  '#f4-tx-receipt-dialog','#bank-prices','#f4BankWeighingDialog',
  '#f4-direct-sidebar[data-bank-admin-drawer]','.f4-warga-picker-pop',
  '#v21Lightbox','#v21GalleryModal','#v24ProgressOverlay',
  '#credentialModal','.f4-activity-dialog','.f4-ui-dialog',
  '#f4-direct-dialog'
 ];
 const selector=rootSelectors.join(',');
 const frames=[];
 const afterClose=new __f4.globals.WeakMap();
 let serial=0,pending=false,scheduled=false;
 const watched=new __f4.globals.WeakSet();
 const byId=id=>__f4.globals.document.getElementById(id);
 function isVisible(node){
  if(!node||!node.isConnected||node.hidden||node.classList.contains('hidden'))return false;
  if(node.matches('dialog')&&!node.open)return false;
  if(node.matches('[data-bank-admin-drawer]')&&!node.classList.contains('f4-open'))return false;
  if(node.closest('[inert]'))return false;
  const style=(0,__f4.globals.getComputedStyle)(node);
  return style.display!=='none'&&style.visibility!=='hidden'&&node.getClientRects().length>0;
 }
 function ordered(){
  // A lightbox is above an album; the receipt and confirmation dialogs
  // have their own overlay layers, not separate page routes.
  const roots=[...__f4.globals.document.querySelectorAll(selector)].filter(isVisible);
  roots.sort((a,b)=>{
   // An open HTML dialog is in the browser top layer regardless of z-index.
   if(a.matches('dialog')!==b.matches('dialog'))return a.matches('dialog')?1:-1;
   const az=__f4.globals.Number.parseInt((0,__f4.globals.getComputedStyle)(a).zIndex,10)||0;
   const bz=__f4.globals.Number.parseInt((0,__f4.globals.getComputedStyle)(b).zIndex,10)||0;
   return az-bz;
  });
  return roots;
 }
 function close(root){
  if(!isVisible(root))return;
  if(root.matches('.f4-warga-picker-pop,[data-bank-admin-drawer]')){root.f4Close?.();return;}
  if(root.matches('dialog')){root.close();return;}
  if(root.id==='f4-tx-receipt-dialog'){
   __f4.window.F4TransactionReceipt?.close?.();return;
  }
  const selectors={
   v21Lightbox:'.v21-close',v21GalleryModal:'.v21-close',
   v24ProgressOverlay:'#v24Close',
   credentialModal:'[onclick*="closeCredential"]',
   'f4-direct-dialog':'#f4-direct-close-login'
  };
  let candidate=selectors[root.id]&&root.querySelector(selectors[root.id]);
  if(!candidate)candidate=root.querySelector(
   '.f4-ui-dialog-cancel,.f4-activity-dialog-close,'+
   '.f4-ui-dialog-accept,button[aria-label^="Tutup"],'+
   'button[aria-label^="Close"],button[onclick*="closeModal"]'
  );
  if(candidate){candidate.click();return;}
  // Refuse an unsafe generic dismissal rather than leaving click-blocking
  // backdrops or accidentally submitting a destructive form.
 }
 function refresh(){
  scheduled=false;
  if(pending)return;
  const live=ordered();
  // Only one outstanding frame is consumed per Back operation.
  const top=frames[frames.length-1];
  if(top&&!isVisible(top.root)){
   if(__f4.globals.history.state?.f4BankModalGuard===top.id){
    pending=true;
    __f4.globals.history.back(); // Consumes the temporary guard on X, Escape or backdrop.
    return;
   }
   frames.pop();
   runAfter(top?.root);
  }
  for(const root of live)registerOpen(root);
 }
 // Called directly by native dialogs so Back works immediately, before DOM observers.
 function registerOpen(root){
  if(!isVisible(root)||frames.some(frame=>frame.root===root))return;
  watch(root);
  const id=++serial;
  frames.push({id,root});
  __f4.globals.history.pushState({...__f4.globals.history.state,f4BankModalGuard:id},'',__f4.globals.location.href);
 }
 function queue(){
  if(scheduled)return;
  scheduled=true;(0,__f4.globals.queueMicrotask)(refresh);
 }
 function runAfter(root){
  if(!root)return;
  const callback=afterClose.get(root);
  afterClose.delete(root);
  if(callback)(0,__f4.globals.queueMicrotask)(callback);
 }
 function closeAndThen(root,callback){
  if(typeof callback==='function')afterClose.set(root,callback);
  if(isVisible(root))close(root);
  queue();
 }
 function watch(root){
  if(watched.has(root))return;
  watched.add(root);
  const observer=new __f4.globals.MutationObserver(queue);
  observer.observe(root,{attributes:true,attributeFilter:['class','open','hidden','style']});
 }
 function inspect(node){
  if(node.nodeType!==1)return;
  if(node.matches?.(selector))watch(node);
  node.querySelectorAll?.(selector).forEach(watch);
 }
 // Capture-phase handler executes before the old gallery/sidebar routing.
 __f4.window.addEventListener('popstate',event=>{
  // Native date/month and select pickers own their temporary Back entry.
  // Do not close the receipt/dialog underneath a visible picker.
  if(__f4.globals.document.querySelector('.f4-control-overlay'))return;
  // A route push may carry a copied modal guard. Back must still close
  // the top visible sheet on its FIRST popstate, even if that id was copied.
  if(pending){
   pending=false;
   const top=frames.pop();
   if(top&&isVisible(top.root))close(top.root);
   event.stopImmediatePropagation();
   runAfter(top?.root);
   queue();
   return;
  }
  const top=frames.pop();
  if(!top)return;
  close(top.root);
  event.stopImmediatePropagation();
  runAfter(top.root);
  queue();
 },true);
 function start(){
  if(!__f4.globals.document.body)return;
  inspect(__f4.globals.document.body);
  new __f4.globals.MutationObserver(records=>{
   for(const record of records){
    for(const child of record.addedNodes)inspect(child);
   }
   queue();
  }).observe(__f4.globals.document.body,{subtree:true,childList:true});
  queue();
  __f4.window.F4BankModalHistory={
   version:'20261114-bank-modal-back-v5',
   refresh:queue,registerOpen,closeAndThen,
   getOpenCount:()=>frames.filter(frame=>isVisible(frame.root)).length
  };
 }
 if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();

});
