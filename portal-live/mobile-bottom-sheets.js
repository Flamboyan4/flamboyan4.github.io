/* Flamboyan 4 — gesture controller for website-owned mobile bottom sheets.
   Never overrides native alerts, never changes financial / form data.
   Fullscreen image and video viewers are deliberately excluded. */
(()=>{
 'use strict';
 if(window.F4MobileSheets)return;
 const mobile=window.matchMedia('(max-width:767px)');
 const panels=[
  '#f4-direct-dialog > section',
  '#f4-superadmin-confirm .f4-sa-confirm-panel',
  '.v21-modal:not(.v21-lightbox) > .v21-modal-card',
  '#credentialModal > .f4-bank-credential-panel',
  '.v24-edit-overlay .v24-edit-card',
  '.f4-activity-dialog .f4-activity-dialog-panel',
  '.f4-warga-picker-pop',
  '.sa-account-shade .sa-account-modal',
  '.f4-jersey-print-veil .f4-jersey-print-dialog',
  '.tc-date-overlay .tc-date-dialog',
  '.f4-ui-dialog .f4-ui-dialog-panel',
  '#f4-work-notice .f4-work-notice-panel',
  '.f4-pm-shade .f4-pm-dialog',
  '#keuangan .f4-user-year-popover',
  '#modal-event-detail > div',
  '#modal-arisan > div',
  '#modal-cetak-kas > div',
  '#modal-keuangan > div',
  '#modal-jersey > div',
  '#modal-dokumentasi > div',
  '#modal-gallery-grid > div',
  '#modal-saran > div',
  '#modal-edit .f4-book-edit-card',
  '.edit-modal .edit-modal-card',
  '#modal-koreksi-migrasi > div',
  '#modal-doc-rapat > div',
  '.f4p-album-overlay > .f4p-album-card',
  '#modal-gateway > div'
 ];
 const selector=panels.join(',');
 const overlaySelector=[
  '#f4-direct-dialog','#f4-superadmin-confirm','.v21-modal',
  '#credentialModal','.v24-edit-overlay','.f4-activity-dialog',
  '.f4-warga-picker-pop','.sa-account-shade','.f4-jersey-print-veil',
  '.tc-date-overlay','.f4-ui-dialog','#f4-work-notice',
  '.f4-pm-shade','.f4-user-year-picker',
  '#modal-event-detail','#modal-arisan','#modal-cetak-kas',
  '#modal-keuangan','#modal-jersey','#modal-dokumentasi',
  '#modal-gallery-grid','#modal-saran','#modal-edit',
  '.edit-modal','#modal-koreksi-migrasi','#modal-doc-rapat',
  '.f4p-album-overlay','#modal-gateway'
 ].join(',');
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const sheetLabel=expanded=>expanded
  ? 'Panel diperbesar. Geser ke bawah untuk mengecilkan atau menutup'
  : 'Geser ke atas untuk memperbesar atau ke bawah untuk menutup';
 const isVisible=el=>!!(el&&el.isConnected&&el.getClientRects().length);
 function positionGrip(panel){
  const grip=panel.querySelector(':scope > .f4-sheet-handle');
  if(!grip||!mobile.matches||!isVisible(panel))return;
  // A scrolling panel moves absolute children with its scroll offset.
  // Compensate that offset so the handle stays in view even while reading long content.
  grip.style.top=panel.scrollTop+'px';
  grip.style.left='0';
  grip.style.width='100%';
 }
 function setExpanded(panel,expanded){
  if(!panel.isConnected)return;
  panel.classList.remove('f4-sheet-dragging','f4-sheet-dismissing');
  panel.classList.toggle('f4-sheet-expanded',expanded);
  panel.style.removeProperty('transform');
  panel.style.removeProperty('transition');
  if(expanded){
   panel.style.setProperty('height','calc(100dvh - max(10px, env(safe-area-inset-top, 0px)))');
   panel.style.setProperty('max-height','calc(100dvh - max(10px, env(safe-area-inset-top, 0px)))');
  }else{
   panel.style.removeProperty('height');
   panel.style.removeProperty('max-height');
  }
  positionGrip(panel);
  const grip=panel.querySelector(':scope > .f4-sheet-handle');
  if(grip){
   grip.setAttribute('aria-expanded',String(expanded));
   grip.setAttribute('aria-label',sheetLabel(expanded));
   grip.title=sheetLabel(expanded);
  }
 }
 function dismiss(panel){
  if(!panel.isConnected)return;
  // Pickers have no backdrop; use their own closing semantics.
  if(panel.matches('.f4-warga-picker-pop')){
   const trigger=panel.closest('.f4-warga-picker')?.querySelector('.f4-warga-picker-open');
   if(trigger)trigger.click();else panel.hidden=true;
   return;
  }
  if(panel.matches('.f4-user-year-popover')){
   const details=panel.closest('details');
   if(details)details.open=false;
   return;
  }
  const buttonSelector=
    panel.matches('.f4-bank-credential-panel')?'[onclick*="closeCredential"]':
    panel.matches('.v21-modal-card')?'.v21-close':
    panel.matches('.v24-edit-card')?'#v24Close':
    panel.matches('.f4-activity-dialog-panel')?'.f4-activity-dialog-close':
    panel.matches('.f4-jersey-print-dialog')?'.f4-jersey-print-cancel':
    panel.matches('.f4-work-notice-panel')?'.f4-work-notice-close':
    panel.matches('.f4-book-edit-card')?'[onclick*="tutupEdit"]':
    panel.matches('#modal-koreksi-migrasi > div')?'[onclick*="tutupKoreksiMigrasi"]':
    panel.matches('#f4-direct-dialog > section')?'#f4-direct-close-login':'';
  if(buttonSelector){
   const button=panel.querySelector(buttonSelector);
   if(button){button.click();return;}
  }
  const root=panel.closest(overlaySelector);
  if(root&&root!==panel&&typeof root.click==='function'){
   // Existing overlay listeners perform the normal cancellation / history cleanup.
   root.click();
   return;
  }
  const close=panel.querySelector('button[aria-label^="Tutup"],button[onclick*="closeModal"],button[onclick*="tutup"]');
  if(close)close.click();
 }
 function exitDown(panel){
  panel.classList.remove('f4-sheet-dragging');
  panel.classList.add('f4-sheet-dismissing');
  panel.style.removeProperty('height');
  panel.style.removeProperty('max-height');
  panel.style.setProperty('transition',reduceMotion.matches?'none':'transform 160ms ease-out');
  panel.style.setProperty('transform','translate3d(0,105%,0)');
  window.setTimeout(()=>{
   if(panel.isConnected)dismiss(panel);
   if(panel.isConnected)setExpanded(panel,false);
  },reduceMotion.matches?0:165);
 }
 function attach(panel){
  if(panel.dataset.f4SheetGesture==='1')return;
  panel.dataset.f4SheetGesture='1';
  panel.classList.add('f4-sheet-draggable');
  const grip=document.createElement('div');
  grip.className='f4-sheet-handle';
  grip.setAttribute('role','button');
  grip.setAttribute('tabindex','0');
  grip.setAttribute('aria-expanded','false');
  grip.setAttribute('aria-label',sheetLabel(false));
  grip.title=sheetLabel(false);
  // Append rather than prepend: several old modules style the first child as a header.
  panel.append(grip);
  requestAnimationFrame(()=>positionGrip(panel));
  panel.addEventListener('scroll',()=>positionGrip(panel),{passive:true});
  let drag=null,lastDragAt=-1000;
  function begin(event){
   if(!mobile.matches||!isVisible(panel))return;
   if(event.pointerType==='mouse'&&event.button!==0)return;
   drag={id:event.pointerId,y:event.clientY,time:performance.now(),
    startHeight:panel.getBoundingClientRect().height,
    expanded:panel.classList.contains('f4-sheet-expanded'),
    delta:0,moved:false};
   panel.classList.add('f4-sheet-dragging');
   panel.style.removeProperty('transition');
   if(grip.setPointerCapture)grip.setPointerCapture(event.pointerId);
   event.preventDefault();
  }
  function move(event){
   if(!drag||event.pointerId!==drag.id)return;
   const dy=event.clientY-drag.y;
   drag.delta=dy;
   if(Math.abs(dy)>7)drag.moved=true;
   if(dy<0&&!drag.expanded){
    const topGap=Math.max(10,parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--f4-safe-sheet-top'))||10);
    const max=Math.max(220,window.innerHeight-topGap);
    panel.style.setProperty('max-height','calc(100dvh - 10px)');
    panel.style.setProperty('height',Math.min(max,drag.startHeight-dy)+'px');
    panel.style.setProperty('transform','translate3d(0,0,0)');
   }else{
    const offset=dy<0?Math.max(-10,dy*.10):Math.min(window.innerHeight,dy);
    panel.style.setProperty('transform','translate3d(0,'+offset+'px,0)');
   }
   event.preventDefault();
  }
  function finish(event){
   if(!drag||event.pointerId!==drag.id)return;
   const previous=drag;drag=null;
   const distance=previous.delta;
   const duration=Math.max(1,performance.now()-previous.time);
   const velocity=distance/duration;
   lastDragAt=previous.moved?performance.now():-1000;
   if(distance< -55||(distance< -25&&velocity<-.48)){
    setExpanded(panel,true);
   }else if(distance>85||(distance>40&&velocity>.58)){
    const longPull=distance>Math.max(220,window.innerHeight*.30);
    if(previous.expanded&&!longPull)setExpanded(panel,false);
    else exitDown(panel);
   }else{
    setExpanded(panel,previous.expanded);
   }
   if(grip.hasPointerCapture?.(event.pointerId))grip.releasePointerCapture(event.pointerId);
   if(previous.moved)event.preventDefault();
  }
  grip.addEventListener('pointerdown',begin);
  grip.addEventListener('pointermove',move);
  grip.addEventListener('pointerup',finish);
  grip.addEventListener('pointercancel',event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const original=drag.expanded;drag=null;setExpanded(panel,original);
  });
  grip.addEventListener('click',event=>{
   event.preventDefault();
   if(!mobile.matches)return;
   if(performance.now()-lastDragAt<350)return;
   setExpanded(panel,!panel.classList.contains('f4-sheet-expanded'));
  });
  grip.addEventListener('keydown',event=>{
   if(!mobile.matches)return;
   if(event.key==='ArrowUp'||event.key==='Enter'||event.key===' '){
    event.preventDefault();setExpanded(panel,true);
   }else if(event.key==='ArrowDown'){
    event.preventDefault();
    if(panel.classList.contains('f4-sheet-expanded'))setExpanded(panel,false);
    else exitDown(panel);
   }else if(event.key==='Escape'){
    event.preventDefault();exitDown(panel);
   }
  });
  // A normally closed and later reopened modal must not retain expanded sizing.
  const root=panel.closest(overlaySelector);
  if(root){
   const lifecycle=new MutationObserver(()=>{
    if(!isVisible(panel))setExpanded(panel,false);
    else requestAnimationFrame(()=>positionGrip(panel));
   });
   lifecycle.observe(root,{attributes:true,attributeFilter:['class','hidden','style','open']});
  }
 }
 function inspect(node){
  if(node.nodeType!==1)return;
  if(node.matches?.(selector))attach(node);
  node.querySelectorAll?.(selector).forEach(attach);
 }
 function start(){
  inspect(document.body);
  window.addEventListener('resize',()=>document.querySelectorAll(selector).forEach(positionGrip));
  const watcher=new MutationObserver(mutations=>{
   for(const mutation of mutations){
    mutation.addedNodes.forEach(inspect);
   }
  });
  watcher.observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
 window.F4MobileSheets={version:'20261109-draggable-v1'};
})();
