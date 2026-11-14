/* Bank Sampah: unified modal Back guard. Picker and admin menu included.
   The page history only receives Back after the topmost popup has closed. */
(()=>{
 'use strict';
 if(window.F4BankModalHistory)return;
 const selector=[
  '#f4-tx-receipt-dialog','#bank-prices','#f4BankWeighingDialog',
  '#f4BankAdminMenuSheet','#v21Lightbox','#v21GalleryModal',
  '#v24ProgressOverlay','#credentialModal','.f4-activity-dialog',
  '.f4-ui-dialog','#f4-direct-dialog','#f4-work-notice',
  '.f4-warga-picker-pop'
 ].join(',');
 const frames=[],watched=new WeakSet();
 let serial=0,scheduled=false,consuming=null;
 function visible(root){
  if(!root?.isConnected||root.hidden||root.classList.contains('hidden'))return false;
  if(root.matches('dialog')&&!root.open)return false;
  if(root.closest('[inert]'))return false;
  const style=getComputedStyle(root);
  return style.display!=='none'&&style.visibility!=='hidden'&&root.getClientRects().length>0;
 }
 function stack(){
  return [...document.querySelectorAll(selector)].filter(visible).sort((a,b)=>{
   const az=Number.parseInt(getComputedStyle(a).zIndex,10)||0;
   const bz=Number.parseInt(getComputedStyle(b).zIndex,10)||0;
   return az-bz;
  });
 }
 function close(root){
  if(!visible(root))return;
  if(root.matches('.f4-warga-picker-pop')){root._f4Close?.(true);return;}
  if(root.matches('dialog')){root.close();return;}
  if(root.id==='f4-tx-receipt-dialog'&&window.F4TransactionReceipt?.close){
   window.F4TransactionReceipt.close();return;
  }
  const buttons={
   'v21Lightbox':'.v21-close','v21GalleryModal':'.v21-close',
   'v24ProgressOverlay':'#v24Close',
   'credentialModal':'[onclick*="closeCredential"]',
   'f4-direct-dialog':'#f4-direct-close-login'
  };
  const target=root.querySelector(buttons[root.id]||
    '.f4-ui-dialog-cancel,.f4-activity-dialog-close,.f4-work-notice-close,'+
    'button[aria-label^="Tutup"],button[aria-label^="Close"],button[onclick*="closeModal"]');
  if(target)target.click();
 }
 function refresh(){
  scheduled=false;
  if(consuming)return;
  const top=frames[frames.length-1];
  if(top&&!visible(top.root)){
   if(history.state?.f4BankModalGuard===top.id){
    consuming=top;history.back();return;
   }
   frames.pop();top.after?.();
  }
  for(const root of stack()){
   if(frames.some(x=>x.root===root))continue;
   const id=++serial;
   frames.push({id,root,after:null});
   history.pushState({...history.state,f4BankModalGuard:id},'',location.href);
  }
 }
 function schedule(){
  if(scheduled)return;
  scheduled=true;queueMicrotask(refresh);
 }
 function watch(node){
  if(watched.has(node))return;
  watched.add(node);
  new MutationObserver(schedule).observe(node,{
   attributes:true,attributeFilter:['class','hidden','open','style']
  });
 }
 function inspect(node){
  if(node.nodeType!==1)return;
  if(node.matches?.(selector))watch(node);
  node.querySelectorAll?.(selector).forEach(watch);
 }
 // Capture before page/router listeners. Consume exactly one modal guard.
 window.addEventListener('popstate',event=>{
  if(consuming){
   const frame=consuming;consuming=null;
   const i=frames.indexOf(frame);if(i>=0)frames.splice(i,1);
   if(visible(frame.root))close(frame.root);
   event.stopImmediatePropagation();
   if(frame.after)queueMicrotask(frame.after);
   schedule();return;
  }
  const frame=frames.pop();
  if(!frame)return;
  if(visible(frame.root))close(frame.root);
  event.stopImmediatePropagation();
  if(frame.after)queueMicrotask(frame.after);
  schedule();
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||!frames.length)return;
  const top=frames[frames.length-1];
  if(!visible(top.root))return;
  event.preventDefault();event.stopImmediatePropagation();
  close(top.root);schedule();
 },true);
 function closeAndThen(root,callback){
  const frame=frames.findLast(item=>item.root===root);
  if(frame){
   frame.after=typeof callback==='function'?callback:null;
   close(root);schedule();
  }else{
   if(visible(root))close(root);
   if(typeof callback==='function')queueMicrotask(callback);
  }
 }
 function init(){
  inspect(document.body);
  new MutationObserver(records=>{
   for(const record of records)for(const child of record.addedNodes)inspect(child);
   schedule();
  }).observe(document.body,{subtree:true,childList:true});
  schedule();
 }
 window.F4BankModalHistory={
  version:'20261114-modal-guard-v3',refresh:schedule,closeAndThen,
  getOpenCount:()=>frames.filter(x=>visible(x.root)).length
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();