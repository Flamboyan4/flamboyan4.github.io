/* Flamboyan 4 — shared mobile bottom sheets (all portals).
   Only the grab bar handles drags; normal page links, forms and scrolling remain native.
   Images/video viewers and desktop dialogs are deliberately untouched. */
(()=>{
 'use strict';
 if(window.F4MobileSheets)return;
 const media=window.matchMedia('(max-width:767px)');
 const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
 const panelSelectors=[
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
  '#modal-event-detail > div','#modal-arisan > div',
  '#modal-cetak-kas > div','#modal-keuangan > div',
  '#modal-jersey > div','#modal-dokumentasi > div',
  '#modal-gallery-grid > div','#modal-saran > div',
  '#modal-edit .f4-book-edit-card','.edit-modal .edit-modal-card',
  '#modal-koreksi-migrasi > div','#modal-doc-rapat > div',
  '.f4p-album-overlay > .f4p-album-card','#modal-gateway > div'
 ];
 const selector=panelSelectors.join(',');
 const rootSelector=[
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
 const savedHeights=new WeakMap(), timers=new WeakMap();
 const watched=new WeakSet();
 let active=null, drag=null, refreshFrame=0, lastDragAt=-1000;
 let grip;
 const labels=expanded=>expanded
  ? 'Geser ke bawah untuk mengecilkan atau menutup panel'
  : 'Geser ke atas untuk memperbesar atau ke bawah untuk menutup panel';
 function visible(el){
  if(!media.matches||!el||!el.isConnected)return false;
  const r=el.getBoundingClientRect();
  return r.width>0&&r.height>0&&
   getComputedStyle(el).visibility!=='hidden'&&!el.closest('[inert]');
 }
 function fullHeight(){
  return Math.max(220,Math.floor(window.visualViewport?.height||window.innerHeight)-10);
 }
 function updateLabel(panel){
  if(!grip)return;
  const expanded=!!panel?.classList.contains('f4-sheet-expanded');
  grip.setAttribute('aria-expanded',String(expanded));
  grip.setAttribute('aria-label',labels(expanded));
  grip.title=labels(expanded);
 }
 function refresh(){
  refreshFrame=0;
  if(!grip||!media.matches){if(grip)grip.hidden=true;return;}
  // Full-screen lightbox must have no drag control on top of the photo.
  const lightbox=document.querySelector('.v21-lightbox:not(.hidden):not([hidden])');
  if(lightbox&&lightbox.getClientRects().length){grip.hidden=true;return;}
  if(drag&&drag.panel.isConnected)active=drag.panel;
  else if(!visible(active)){
   active=null;
   for(const panel of document.querySelectorAll(selector)){
    if(visible(panel))active=panel;
   }
  }
  if(!active||!visible(active)){grip.hidden=true;return;}
  const r=active.getBoundingClientRect();
  if(r.top>=window.innerHeight){grip.hidden=true;return;}
  grip.style.left=Math.max(0,r.left)+'px';
  grip.style.top=Math.max(0,r.top)+'px';
  grip.style.width=r.width+'px';
  grip.hidden=false;
  updateLabel(active);
 }
 function requestRefresh(){
  if(!refreshFrame)refreshFrame=requestAnimationFrame(refresh);
 }
 function clearTimer(panel){
  if(timers.has(panel)){clearTimeout(timers.get(panel));timers.delete(panel);}
 }
 function clearPanel(panel){
  if(!panel?.isConnected)return;
  clearTimer(panel);
  panel.classList.remove('f4-sheet-dragging','f4-sheet-settling','f4-sheet-dismissing','f4-sheet-expanded');
  panel.style.removeProperty('transform');
  panel.style.removeProperty('transition');
  panel.style.removeProperty('height');
  panel.style.removeProperty('max-height');
 }
 function resetIfClosed(panel){
  if(!visible(panel)){
   clearPanel(panel);
   if(active===panel)active=null;
  }else active=panel;
  requestRefresh();
 }
 function rootOf(panel){return panel.closest(rootSelector)||panel;}
 function observe(el,callback){
  if(!el||watched.has(el))return;
  watched.add(el);
  const observer=new MutationObserver(callback);
  observer.observe(el,{attributes:true,attributeFilter:['class','hidden','style','open']});
 }
 function attach(panel){
  if(panel.dataset.f4SheetGesture==='1')return;
  panel.dataset.f4SheetGesture='1';
  panel.classList.add('f4-sheet-draggable');
  const root=rootOf(panel);
  observe(root,()=>resetIfClosed(panel));
  if(root!==panel)observe(panel,requestRefresh);
  const details=panel.closest('details');
  if(details)observe(details,()=>resetIfClosed(panel));
  requestRefresh();
 }
 function inspect(node){
  if(node.nodeType!==1)return;
  if(node.matches?.(selector))attach(node);
  node.querySelectorAll?.(selector).forEach(attach);
 }
 function dismiss(panel){
  if(!panel?.isConnected)return;
  if(panel.matches('.f4-warga-picker-pop')){
   const trigger=panel.closest('.f4-warga-picker')?.querySelector('.f4-warga-picker-open');
   if(trigger)trigger.click();else panel.hidden=true;
   return;
  }
  if(panel.matches('.f4-user-year-popover')){
   const details=panel.closest('details');if(details)details.open=false;
   return;
  }
  const closeSelector=
   panel.matches('.f4-bank-credential-panel')?'[onclick*="closeCredential"]':
   panel.matches('.v21-modal-card')?'.v21-close':
   panel.matches('.v24-edit-card')?'#v24Close':
   panel.matches('.f4-activity-dialog-panel')?'.f4-activity-dialog-close':
   panel.matches('.f4-jersey-print-dialog')?'.f4-jersey-print-cancel':
   panel.matches('.f4-work-notice-panel')?'.f4-work-notice-close':
   panel.matches('.f4-book-edit-card')?'[onclick*="tutupEdit"]':
   panel.matches('#modal-koreksi-migrasi > div')?'[onclick*="tutupKoreksiMigrasi"]':
   panel.matches('#f4-direct-dialog > section')?'#f4-direct-close-login':'';
  const button=closeSelector&&panel.querySelector(closeSelector);
  if(button){button.click();return;}
  const root=rootOf(panel);
  if(root!==panel){
   root.click(); // Existing backdrop listener maintains history/state.
   if(!visible(panel))return;
  }
  const fallback=panel.querySelector(
   'button[aria-label^="Tutup"],button[aria-label^="Close"],button[onclick*="closeModal"],button[onclick*="tutup"]');
  if(fallback)fallback.click();
 }
 function settle(panel,expanded,collapsedHeight){
  if(!panel?.isConnected)return;
  clearTimer(panel);
  const duration=reduced.matches?0:210;
  const target=expanded?fullHeight():Math.max(90,collapsedHeight||savedHeights.get(panel)||panel.getBoundingClientRect().height);
  panel.classList.remove('f4-sheet-dragging','f4-sheet-dismissing');
  panel.classList.add('f4-sheet-settling');
  panel.classList.toggle('f4-sheet-expanded',expanded);
  panel.style.transition=duration
   ?'transform '+duration+'ms cubic-bezier(.18,.75,.28,1),height '+duration+'ms cubic-bezier(.18,.75,.28,1)'
   :'none';
  requestAnimationFrame(()=>{
   if(!panel.isConnected)return;
   panel.style.height=target+'px';
   panel.style.maxHeight=target+'px';
   panel.style.transform='translate3d(0,0,0)';
   requestRefresh();
  });
  const timer=setTimeout(()=>{
   timers.delete(panel);
   if(!panel.isConnected)return;
   panel.classList.remove('f4-sheet-settling');
   panel.style.removeProperty('transition');
   panel.style.removeProperty('transform');
   if(expanded){
    panel.style.height='calc(100dvh - 10px)';
    panel.style.maxHeight='calc(100dvh - 10px)';
   }else{
    panel.style.removeProperty('height');
    panel.style.removeProperty('max-height');
   }
   requestRefresh();
  },duration+45);
  timers.set(panel,timer);
  updateLabel(panel);
 }
 function exitDown(panel){
  if(!panel?.isConnected)return;
  clearTimer(panel);
  const duration=reduced.matches?0:190;
  panel.classList.remove('f4-sheet-dragging','f4-sheet-settling');
  panel.classList.add('f4-sheet-dismissing');
  panel.style.transition=duration?'transform '+duration+'ms cubic-bezier(.25,.8,.25,1)':'none';
  requestAnimationFrame(()=>{
   panel.style.transform='translate3d(0,'+(window.innerHeight+40)+'px,0)';
   requestRefresh();
  });
  timers.set(panel,setTimeout(()=>{
   timers.delete(panel);
   dismiss(panel);
   clearPanel(panel);
   if(active===panel)active=null;
   requestRefresh();
  },duration+30));
 }
 function begin(event){
  if(!media.matches||!active||!visible(active))return;
  if(event.pointerType==='mouse'&&event.button!==0)return;
  const panel=active;
  clearTimer(panel);
  const r=panel.getBoundingClientRect();
  const expanded=panel.classList.contains('f4-sheet-expanded');
  if(!expanded)savedHeights.set(panel,r.height);
  const maxH=Math.max(r.height,fullHeight());
  drag={panel,id:event.pointerId,startY:event.clientY,startAt:performance.now(),
   expanded,collapsed:savedHeights.get(panel)||r.height,maxH,delta:0,moved:false,
   frame:0,pending:maxH-r.height};
  panel.classList.remove('f4-sheet-settling','f4-sheet-dismissing');
  panel.classList.add('f4-sheet-dragging');
  panel.style.transition='none';
  if(!expanded){
   // Grow behind the scenes and translate down by the same amount: no jump.
   panel.style.height=maxH+'px';
   panel.style.maxHeight=maxH+'px';
   panel.style.transform='translate3d(0,'+(maxH-r.height)+'px,0)';
  }else{
   panel.style.transform='translate3d(0,0,0)';
  }
  grip.classList.add('f4-sheet-handle-dragging');
  grip.setPointerCapture?.(event.pointerId);
  event.preventDefault();
  requestRefresh();
 }
 function move(event){
  if(!drag||event.pointerId!==drag.id)return;
  const dy=event.clientY-drag.startY;
  drag.delta=dy;
  if(Math.abs(dy)>6)drag.moved=true;
  drag.pending=drag.expanded
   ?Math.max(-15,Math.min(drag.maxH+50,dy))
   :Math.max(-15,Math.min(drag.maxH+50,drag.maxH-drag.collapsed+dy));
  if(!drag.frame){
   const current=drag;
   current.frame=requestAnimationFrame(()=>{
    current.frame=0;
    if(drag!==current||!current.panel.isConnected)return;
    current.panel.style.transform='translate3d(0,'+current.pending+'px,0)';
    requestRefresh();
   });
  }
  event.preventDefault();
 }
 function finish(event,cancelled=false){
  if(!drag||event.pointerId!==drag.id)return;
  const d=drag;drag=null;
  if(d.frame)cancelAnimationFrame(d.frame);
  // Apply the final finger position before deciding which direction to settle.
  d.panel.style.transform='translate3d(0,'+d.pending+'px,0)';
  grip.classList.remove('f4-sheet-handle-dragging');
  if(grip.hasPointerCapture?.(event.pointerId))grip.releasePointerCapture(event.pointerId);
  const dy=d.delta,elapsed=Math.max(1,performance.now()-d.startAt);
  const velocity=dy/elapsed;
  if(d.moved)lastDragAt=performance.now();
  if(!cancelled&&(dy< -55||(dy< -28&&velocity<-.48)))settle(d.panel,true,d.collapsed);
  else if(!cancelled&&(dy>90||(dy>42&&velocity>.58))){
   const longPull=dy>Math.max(225,window.innerHeight*.30);
   if(d.expanded&&!longPull)settle(d.panel,false,d.collapsed);
   else exitDown(d.panel);
  }else settle(d.panel,d.expanded,d.collapsed);
  if(d.moved)event.preventDefault();
 }
 function start(){
  if(!document.body)return;
  grip=document.createElement('div');
  grip.className='f4-sheet-handle';
  grip.hidden=true;
  grip.setAttribute('role','button');
  grip.setAttribute('tabindex','0');
  grip.setAttribute('aria-expanded','false');
  grip.setAttribute('aria-label',labels(false));
  document.body.appendChild(grip);
  grip.addEventListener('pointerdown',begin);
  grip.addEventListener('pointermove',move);
  grip.addEventListener('pointerup',finish);
  grip.addEventListener('pointercancel',event=>finish(event,true));
  grip.addEventListener('click',event=>{
   event.preventDefault();
   if(!active||!visible(active)||performance.now()-lastDragAt<350)return;
   const wasExpanded=active.classList.contains('f4-sheet-expanded');
   const h=savedHeights.get(active)||active.getBoundingClientRect().height;
   if(!wasExpanded)savedHeights.set(active,h);
   settle(active,!wasExpanded,h);
  });
  grip.addEventListener('keydown',event=>{
   if(!active||!media.matches)return;
   const key=event.key;
   if(key==='Escape'){event.preventDefault();exitDown(active);return;}
   if(key==='ArrowDown'){event.preventDefault();
    if(active.classList.contains('f4-sheet-expanded'))settle(active,false,savedHeights.get(active));
    else exitDown(active);
   }else if(key==='ArrowUp'||key==='Enter'||key===' '){
    event.preventDefault();
    settle(active,true,savedHeights.get(active)||active.getBoundingClientRect().height);
   }
  });
  inspect(document.body);
  const observer=new MutationObserver(records=>{
   let added=false;
   for(const record of records){
    for(const node of record.addedNodes){
     if(node===grip)continue;
     inspect(node);added=true;
    }
   }
   if(added)requestRefresh();
  });
  observer.observe(document.body,{subtree:true,childList:true});
  window.addEventListener('resize',requestRefresh,{passive:true});
  window.addEventListener('scroll',requestRefresh,{passive:true,capture:true});
  window.visualViewport?.addEventListener('resize',requestRefresh,{passive:true});
  media.addEventListener?.('change',()=>{
   if(!media.matches){
    if(drag){drag=null;grip.classList.remove('f4-sheet-handle-dragging');}
    document.querySelectorAll(selector).forEach(clearPanel);
   }
   requestRefresh();
  });
  requestRefresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
 window.F4MobileSheets={version:'20261109-safe-gesture-v8',refresh:requestRefresh};
})();