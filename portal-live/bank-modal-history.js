/* Bank Sampah modal history: Back closes one visible popup, never its page.
   Scoped to this portal; no patches to pushState, native Back, or app routing.
   Gallery lightboxes retain their full-screen presentation. */
(()=>{
 'use strict';
 if(window.F4BankModalHistory)return;
 const rootSelectors=[
  '#f4-tx-receipt-dialog','#bank-prices','#f4BankWeighingDialog',
  '#v21Lightbox','#v21GalleryModal','#v24ProgressOverlay',
  '#credentialModal','.f4-activity-dialog','.f4-ui-dialog',
  '#f4-direct-dialog'
 ];
 const selector=rootSelectors.join(',');
 const frames=[];
 let serial=0,pending=false,scheduled=false;
 const watched=new WeakSet();
 const byId=id=>document.getElementById(id);
 function isVisible(node){
  if(!node||!node.isConnected||node.hidden||node.classList.contains('hidden'))return false;
  if(node.matches('dialog')&&!node.open)return false;
  if(node.closest('[inert]'))return false;
  const style=getComputedStyle(node);
  return style.display!=='none'&&style.visibility!=='hidden'&&node.getClientRects().length>0;
 }
 function ordered(){
  // A lightbox is above an album; the receipt and confirmation dialogs
  // have their own overlay layers, not separate page routes.
  const roots=[...document.querySelectorAll(selector)].filter(isVisible);
  roots.sort((a,b)=>{
   const az=Number.parseInt(getComputedStyle(a).zIndex,10)||0;
   const bz=Number.parseInt(getComputedStyle(b).zIndex,10)||0;
   return az-bz;
  });
  return roots;
 }
 function close(root){
  if(!isVisible(root))return;
  if(root.matches('dialog')){root.close();return;}
  if(root.id==='f4-tx-receipt-dialog'){
   window.F4TransactionReceipt?.close?.();return;
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
   if(history.state?.f4BankModalGuard===top.id){
    pending=true;
    history.back(); // Consumes the temporary guard on X, Escape or backdrop.
    return;
   }
   frames.pop();
  }
  for(const root of live){
   if(frames.some(frame=>frame.root===root))continue;
   const id=++serial;
   frames.push({id,root});
   history.pushState({...history.state,f4BankModalGuard:id},'',location.href);
  }
 }
 function queue(){
  if(scheduled)return;
  scheduled=true;queueMicrotask(refresh);
 }
 function watch(root){
  if(watched.has(root))return;
  watched.add(root);
  const observer=new MutationObserver(queue);
  observer.observe(root,{attributes:true,attributeFilter:['class','open','hidden','style']});
 }
 function inspect(node){
  if(node.nodeType!==1)return;
  if(node.matches?.(selector))watch(node);
  node.querySelectorAll?.(selector).forEach(watch);
 }
 // Capture-phase handler executes before the old gallery/sidebar routing.
 window.addEventListener('popstate',event=>{
  if(pending){
   pending=false;
   const top=frames.pop();
   if(top&&isVisible(top.root))close(top.root);
   event.stopImmediatePropagation();
   queue();
   return;
  }
  const top=frames.pop();
  if(!top)return;
  close(top.root);
  event.stopImmediatePropagation();
  queue();
 },true);
 function start(){
  if(!document.body)return;
  inspect(document.body);
  new MutationObserver(records=>{
   for(const record of records){
    for(const child of record.addedNodes)inspect(child);
   }
   queue();
  }).observe(document.body,{subtree:true,childList:true});
  queue();
  window.F4BankModalHistory={
   version:'20261114-bank-modal-back-v1',
   refresh:queue,
   getOpenCount:()=>frames.filter(frame=>isVisible(frame.root)).length
  };
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
