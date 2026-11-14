/* Bank Sampah: single, handle-only mobile sheet interaction.
   No global scroll handling, no viewport-height writes during gestures. */
(()=>{
 'use strict';
 if(window.F4BankSheetGestures)return;
 const mobile=window.matchMedia('(max-width:767px)');
 const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
 const selectors=[
  'dialog.f4-bank-sheet-modal',
  '#f4-tx-receipt-dialog[data-scope="bank"] > .f4-tx-card',
  '#f4-direct-dialog > section',
  '.v21-modal:not(.v21-lightbox) > .v21-modal-card',
  '#credentialModal > .f4-bank-credential-panel',
  '.v24-edit-overlay > .v24-edit-card',
  '.f4-activity-dialog > .f4-activity-dialog-panel',
  '.f4-ui-dialog > .f4-ui-dialog-panel',
  '#f4-work-notice > .f4-work-notice-panel'
 ].join(',');
 const attached=new WeakSet();
 let activeGesture=null;
 function root(panel){
  return panel.matches('dialog')?panel:panel.closest(
   '#f4-tx-receipt-dialog,#f4-direct-dialog,.v21-modal,#credentialModal,'+
   '.v24-edit-overlay,.f4-activity-dialog,.f4-ui-dialog,#f4-work-notice')||panel;
 }
 function visible(panel){
  if(!panel?.isConnected||panel.hidden||panel.classList.contains('hidden'))return false;
  const parent=root(panel);
  if(parent.hidden||parent.classList.contains('hidden'))return false;
  if(parent.matches('dialog')&&!parent.open)return false;
  if(getComputedStyle(parent).display==='none')return false;
  return panel.getClientRects().length>0;
 }
 function cleanup(panel){
  panel.style.removeProperty('transform');
  panel.style.removeProperty('transition');
  panel.classList.remove('f4-bank-sheet-moving','f4-bank-sheet-dismissing');
 }
 function setExpanded(panel,expanded){
  cleanup(panel);
  panel.classList.toggle('f4-bank-sheet-expanded',expanded);
  const handle=panel.querySelector(':scope > .f4-bank-sheet-grip');
  if(handle)handle.setAttribute('aria-expanded',String(expanded));
 }
 function closeSheet(panel){
  const parent=root(panel);
  if(parent.matches('dialog')){if(parent.open)parent.close();return;}
  const selectors={
   'v21Lightbox':'.v21-close',
   'v21GalleryModal':'.v21-close',
   'v24ProgressOverlay':'#v24Close',
   'credentialModal':'[onclick*="closeCredential"]',
   'f4-direct-dialog':'#f4-direct-close-login',
   'f4-tx-receipt-dialog':'.f4-tx-close'
  };
  const target=parent.querySelector(selectors[parent.id]||
    '.f4-activity-dialog-close,.f4-ui-dialog-cancel,.f4-work-notice-close,'+
    'button[aria-label^="Tutup"],button[aria-label^="Close"]');
  if(target){target.click();return;}
  // A sheet without a safe close button must not be dismissed by a generic
  // backdrop click (which can accidentally trigger an underlying action).
  cleanup(panel);
 }
 function animateBack(panel){
  panel.classList.remove('f4-bank-sheet-moving');
  panel.style.transition=reduced.matches?'none':'transform 240ms cubic-bezier(.2,.8,.2,1)';
  panel.style.transform='translate3d(0,0,0)';
  const reset=()=>cleanup(panel);
  panel.addEventListener('transitionend',reset,{once:true});
  setTimeout(reset,290);
 }
 function dismiss(panel){
  panel.classList.remove('f4-bank-sheet-moving');
  panel.classList.add('f4-bank-sheet-dismissing');
  panel.style.transition=reduced.matches?'none':'transform 210ms cubic-bezier(.2,.8,.2,1)';
  panel.style.transform='translate3d(0,110%,0)';
  setTimeout(()=>{if(visible(panel))closeSheet(panel);setExpanded(panel,false);},reduced.matches?0:220);
 }
 function attach(panel){
  if(attached.has(panel))return;
  attached.add(panel);
  panel.classList.add('f4-bank-gesture-sheet');
  const grip=document.createElement('div');
  grip.className='f4-bank-sheet-grip';
  grip.setAttribute('role','button');
  grip.setAttribute('tabindex','0');
  grip.setAttribute('aria-label','Geser ke atas untuk memperbesar atau ke bawah untuk menutup');
  grip.setAttribute('aria-expanded','false');
  grip.innerHTML='<span aria-hidden="true"></span>';
  panel.prepend(grip);
  let lastCompleted=0;
  grip.addEventListener('pointerdown',event=>{
   if(!mobile.matches||!visible(panel)||activeGesture||event.button!==0)return;
   if(event.isPrimary===false)return;
   activeGesture={
    panel,id:event.pointerId,y:event.clientY,last:event.clientY,
    started:performance.now(),height:panel.getBoundingClientRect().height,
    moved:false,expanded:panel.classList.contains('f4-bank-sheet-expanded')
   };
   grip.setPointerCapture?.(event.pointerId);
  });
  grip.addEventListener('pointermove',event=>{
   const g=activeGesture;
   if(!g||g.panel!==panel||g.id!==event.pointerId)return;
   g.last=event.clientY;
   const delta=event.clientY-g.y;
   if(!g.moved&&Math.abs(delta)<14)return;
   if(!g.moved){
    g.moved=true;panel.classList.add('f4-bank-sheet-moving');
    panel.style.transition='none';
   }
   // Drag only the top handle. Scrolling inside the sheet stays completely native.
   const motion=delta<0?Math.max(-44,delta*.35):Math.min(g.height+50,delta);
   panel.style.transform='translate3d(0,'+motion+'px,0)';
   event.preventDefault();
  });
  function end(event,cancel=false){
   const g=activeGesture;
   if(!g||g.panel!==panel||g.id!==event.pointerId)return;
   activeGesture=null;
   if(grip.hasPointerCapture?.(event.pointerId))grip.releasePointerCapture(event.pointerId);
   const delta=g.last-g.y;
   if(!g.moved)return; // A deliberate tap toggles size; only swipes suppress click.
   const speed=delta/Math.max(1,performance.now()-g.started);
   if(cancel){animateBack(panel);return;}
   if(g.expanded){
    if(delta>85)setExpanded(panel,false);
    else animateBack(panel);
   }else if(delta< -65){
    setExpanded(panel,true);
   }else if(delta>Math.max(150,g.height*.30)||(delta>95&&speed>.9)){
    dismiss(panel);
   }else animateBack(panel);
   lastCompleted=performance.now();
  }
  grip.addEventListener('pointerup',event=>end(event));
  grip.addEventListener('pointercancel',event=>end(event,true));
  grip.addEventListener('click',event=>{
   event.preventDefault();
   if(performance.now()-lastCompleted<350||!visible(panel))return;
   setExpanded(panel,!panel.classList.contains('f4-bank-sheet-expanded'));
  });
  grip.addEventListener('keydown',event=>{
   if(!mobile.matches||!visible(panel))return;
   if(event.key==='ArrowUp'){event.preventDefault();setExpanded(panel,true);}
   if(event.key==='ArrowDown'){
    event.preventDefault();
    if(panel.classList.contains('f4-bank-sheet-expanded'))setExpanded(panel,false);
    else dismiss(panel);
   }
   if(event.key==='Escape'){event.preventDefault();dismiss(panel);}
   if(event.key==='Enter'||event.key===' '){
    event.preventDefault();setExpanded(panel,!panel.classList.contains('f4-bank-sheet-expanded'));
   }
  });
  if(panel.matches('dialog')){
   panel.addEventListener('close',()=>setExpanded(panel,false));
  }else{
   const parent=root(panel);
   new MutationObserver(()=>{
    if(!visible(panel))setExpanded(panel,false);
   }).observe(parent,{attributes:true,attributeFilter:['class','hidden','style']});
  }
 }
 function inspect(node){
  if(node.nodeType!==1)return;
  if(node.matches?.(selectors))attach(node);
  node.querySelectorAll?.(selectors).forEach(attach);
 }
 function init(){
  inspect(document.body);
  new MutationObserver(records=>{
   records.forEach(record=>record.addedNodes.forEach(inspect));
  }).observe(document.body,{subtree:true,childList:true});
  mobile.addEventListener?.('change',()=>{
   document.querySelectorAll(selectors).forEach(panel=>setExpanded(panel,false));
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
 window.F4BankSheetGestures={version:'20261114-bank-native-gesture-v1'};
})();