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
  '#f4-resident-sheet .f4-resident-sheet-panel',
  '.f4-pm-shade .f4-pm-dialog',
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
  '.f4-pm-shade','.f4-resident-sheet-overlay',
  '#modal-event-detail','#modal-arisan','#modal-cetak-kas',
  '#modal-keuangan','#modal-jersey','#modal-dokumentasi',
  '#modal-gallery-grid','#modal-saran','#modal-edit',
  '.edit-modal','#modal-koreksi-migrasi','#modal-doc-rapat',
  '.f4p-album-overlay','#modal-gateway'
 ].join(',');
 const savedHeights=new WeakMap(), timers=new WeakMap();
 const watched=new WeakSet();
 let active=null, drag=null, animating=null, refreshFrame=0, lastDragAt=-1000;
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
  // The picker and year menu are nested controls, never draggable sheets.
  if(document.querySelector('.f4-control-overlay')){grip.hidden=true;return;}
  // Never read panel geometry or overwrite the grip while a gesture is in flight.
  if(drag?.panel?.isConnected||animating?.panel?.isConnected)return;
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
  // Keep the grip aligned while the sheet entrance animation is moving.
  // Once the CSS animation ends there are no extra animation frames.
  if(active.getAnimations?.({subtree:false}).some(animation=>animation.playState==='running'))requestRefresh();
 }
 function requestRefresh(){
  if(!refreshFrame)refreshFrame=requestAnimationFrame(refresh);
 }
 function stopAnimation(panel){
  if(animating?.panel===panel){
   if(animating.frame)cancelAnimationFrame(animating.frame);
   animating=null;
  }
  if(grip){
   grip.classList.remove('f4-sheet-handle-settling');
   grip.style.removeProperty('transition');
  }
 }
 function clearTimer(panel){
  if(timers.has(panel)){clearTimeout(timers.get(panel));timers.delete(panel);}
  stopAnimation(panel);
 }
 function clearPanel(panel){
  if(!panel?.isConnected)return;
  // Observers watch class/style: do not write unchanged attributes or recurse.
  const dirty=panel.classList.contains('f4-sheet-gesture-ready')||
   panel.classList.contains('f4-sheet-dragging')||
   panel.classList.contains('f4-sheet-settling')||
   panel.classList.contains('f4-sheet-dismissing')||
   panel.classList.contains('f4-sheet-expanded')||
   ['transform','transition','height','max-height'].some(k=>panel.style.getPropertyValue(k));
  if(!dirty)return;
  clearTimer(panel);
  panel.classList.remove('f4-sheet-dragging','f4-sheet-settling','f4-sheet-dismissing','f4-sheet-expanded','f4-sheet-gesture-ready');
  for(const k of ['transform','transition','height','max-height']){
   if(panel.style.getPropertyValue(k))panel.style.removeProperty(k);
  }
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
  observe(root,records=>{
   // Some pickers are both the overlay and panel. Their transform writes
   // are not open/close state changes and must not force a layout read.
   if(root===panel&&(drag?.panel===panel||animating?.panel===panel)&&
    records.every(r=>r.attributeName==='style'))return;
   resetIfClosed(panel);
  });
  if(root!==panel)observe(panel,()=>{
   // Dragging and snapping already move both elements together; style
   // mutations must not enqueue another layout/paint pass.
   if(drag?.panel===panel||animating?.panel===panel)return;
   requestRefresh();
  });
  if(visible(panel))active=panel;
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
 // A single layout read at the start; all gesture frames use GPU transforms.
 function prepare(panel){
  if(!panel?.isConnected)return null;
  clearTimer(panel);
  const rect=panel.getBoundingClientRect();
  const wasExpanded=panel.classList.contains('f4-sheet-expanded');
  const height=Math.max(rect.height,fullHeight());
  if(!wasExpanded)savedHeights.set(panel,rect.height);
  const collapsed=Math.max(90,savedHeights.get(panel)||rect.height);
  const base=wasExpanded?0:height-rect.height;
  panel.classList.remove('f4-sheet-settling','f4-sheet-dismissing');
  panel.classList.add('f4-sheet-dragging','f4-sheet-expanded','f4-sheet-gesture-ready');
  panel.style.transition='none';
  panel.style.willChange='transform';
  panel.style.height=height+'px';
  panel.style.maxHeight=height+'px';
  panel.style.transform='translate3d(0,'+base+'px,0)';
  grip.classList.remove('f4-sheet-handle-settling');
  grip.style.transition='none';
  grip.style.left=Math.max(0,rect.left)+'px';
  grip.style.top=Math.max(0,rect.top)+'px';
  grip.style.width=rect.width+'px';
  grip.style.transform='translate3d(0,0,0)';
  grip.hidden=false;
  active=panel;
  return {panel,expanded:wasExpanded,height,base,collapsed,
   top:rect.top,bottom:rect.bottom,delta:0,frame:0};
 }
 function animatePose(pose,target){
  if(!pose?.panel?.isConnected)return;
  const panel=pose.panel;
  clearTimer(panel);
  const dismissing=target==='dismiss';
  const expanded=target==='expanded';
  const finalHeight=expanded?pose.height:pose.collapsed;
  const finalTop=dismissing?window.innerHeight+48:pose.bottom-finalHeight;
  const panelY=dismissing?pose.height+window.innerHeight+48:
   pose.height-finalHeight;
  const gripY=finalTop-pose.top;
  const duration=reduced.matches?0:(dismissing?190:225);
  const ease='cubic-bezier(.22,.72,.27,1)';
  const transition=duration?'transform '+duration+'ms '+ease:'none';
  panel.classList.remove('f4-sheet-dragging');
  panel.classList.add(dismissing?'f4-sheet-dismissing':'f4-sheet-settling');
  panel.style.transition=transition;
  panel.style.willChange='transform';
  grip.classList.remove('f4-sheet-handle-dragging');
  grip.classList.add('f4-sheet-handle-settling');
  grip.style.transition=transition;
  animating={panel,frame:0};
  const job=animating;
  // No animated height and no getBoundingClientRect per frame.
  job.frame=requestAnimationFrame(()=>{
   job.frame=0;
   if(animating!==job||!panel.isConnected)return;
   panel.style.transform='translate3d(0,'+panelY+'px,0)';
   grip.style.transform='translate3d(0,'+gripY+'px,0)';
  });
  timers.set(panel,setTimeout(()=>{
   if(animating!==job)return;
   timers.delete(panel);
   animating=null;
   if(dismissing){
    dismiss(panel);
    clearPanel(panel);
    if(active===panel)active=null;
    grip.classList.remove('f4-sheet-handle-settling');
    grip.style.removeProperty('transition');
    grip.style.removeProperty('transform');
    requestRefresh();
    return;
   }
   // Exchange the translated full-height sheet for its final size
   // in one frame. The visible top stays in the exact same place.
   panel.style.transition='none';
   panel.style.height=expanded?'calc(100dvh - 10px)':pose.collapsed+'px';
   panel.style.maxHeight=expanded?'calc(100dvh - 10px)':pose.collapsed+'px';
   panel.style.transform='none';
   panel.classList.toggle('f4-sheet-expanded',expanded);
   panel.classList.remove('f4-sheet-settling','f4-sheet-dismissing');
   panel.style.removeProperty('will-change');
   panel.style.removeProperty('transition');
   grip.style.transition='none';
   grip.style.top=Math.max(0,finalTop)+'px';
   grip.style.transform='none';
   grip.classList.remove('f4-sheet-handle-settling');
   requestRefresh();
  },duration+30));
  updateLabel(panel);
 }
 function settle(panel,expanded,collapsedHeight,pose){
  const p=pose||prepare(panel);
  if(!p)return;
  if(Number.isFinite(collapsedHeight)&&collapsedHeight>0){
   p.collapsed=collapsedHeight;
   savedHeights.set(panel,collapsedHeight);
  }
  animatePose(p,expanded?'expanded':'collapsed');
 }
 function exitDown(panel,pose){
  const p=pose||prepare(panel);
  if(p)animatePose(p,'dismiss');
 }
 function begin(event){
  if(!media.matches||!active||!visible(active))return;
  if(event.pointerType==='mouse'&&event.button!==0)return;
  const p=prepare(active);
  if(!p)return;
  drag={...p,id:event.pointerId,startY:event.clientY,
   startAt:performance.now(),moved:false,pending:p.base};
  grip.classList.add('f4-sheet-handle-dragging');
  grip.setPointerCapture?.(event.pointerId);
  event.preventDefault();
 }
 function move(event){
  if(!drag||event.pointerId!==drag.id)return;
  const d=drag;
  const raw=event.clientY-d.startY;
  const dy=Math.max(-d.base-15,Math.min(d.height+50-d.base,raw));
  d.delta=dy;
  if(Math.abs(dy)>6)d.moved=true;
  d.pending=d.base+dy;
  if(!d.frame){
   d.frame=requestAnimationFrame(()=>{
    d.frame=0;
    if(drag!==d||!d.panel.isConnected)return;
    d.panel.style.transform='translate3d(0,'+d.pending+'px,0)';
    grip.style.transform='translate3d(0,'+d.delta+'px,0)';
   });
  }
  event.preventDefault();
 }
 function finish(event,cancelled=false){
  if(!drag||event.pointerId!==drag.id)return;
  const d=drag;drag=null;
  if(d.frame)cancelAnimationFrame(d.frame);
  d.panel.style.transform='translate3d(0,'+d.pending+'px,0)';
  grip.style.transform='translate3d(0,'+d.delta+'px,0)';
  grip.classList.remove('f4-sheet-handle-dragging');
  if(grip.hasPointerCapture?.(event.pointerId))grip.releasePointerCapture(event.pointerId);
  const dy=d.delta,elapsed=Math.max(1,performance.now()-d.startAt);
  const velocity=dy/elapsed;
  if(d.moved)lastDragAt=performance.now();
  if(cancelled){settle(d.panel,d.expanded,d.collapsed,d);return;}
  if(dy< -55||(dy< -28&&velocity<-.48))settle(d.panel,true,d.collapsed,d);
  else if(dy>90||(dy>42&&velocity>.58)){
   const longPull=dy>Math.max(225,window.innerHeight*.30);
   if(d.expanded&&!longPull)settle(d.panel,false,d.collapsed,d);
   else exitDown(d.panel,d);
  }else settle(d.panel,d.expanded,d.collapsed,d);
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
    if(drag){
     if(drag.frame)cancelAnimationFrame(drag.frame);
     drag=null;grip.classList.remove('f4-sheet-handle-dragging');
    }
    document.querySelectorAll(selector).forEach(clearPanel);
    grip.style.removeProperty('transform');
   }
   requestRefresh();
  });
  requestRefresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
 window.F4MobileSheets={version:'20261110-compositor-v11',refresh:requestRefresh};
})();