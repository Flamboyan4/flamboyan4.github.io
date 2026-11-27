/* Flamboyan 4 — shared mobile bottom sheets (all portals).
   The grab bar and non-interactive sheet headers handle drags; content scrolls normally.
   Images/video viewers and desktop dialogs are deliberately untouched. */
(()=>{
 'use strict';
 if(window.F4MobileSheets)return;
 const media=window.matchMedia('(max-width:1023px)');
 const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
 const panelSelectors=[
  '#f4-direct-dialog > section',
  '#f4-tx-receipt-dialog[data-scope="bank"] > .f4-tx-card',
  '#f4-superadmin-confirm .f4-sa-confirm-panel',
  '.v21-modal:not(.v21-lightbox) > .v21-modal-card',
  '#credentialModal > .f4-bank-credential-panel',
  '.v24-edit-overlay .v24-edit-card',
  '.f4-activity-dialog .f4-activity-dialog-panel',
  '.f4-control-overlay > .f4-control-panel',
  'dialog.f4-bank-sheet-modal',
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
  '#modal-rekening > .f4-account-dialog',
  '#modal-edit .f4-book-edit-card','.edit-modal .edit-modal-card',
  '#modal-koreksi-migrasi > div','#modal-doc-rapat > div',
  '.f4p-album-overlay > .f4p-album-card','#modal-gateway > div',
  '.f4g-comment-overlay > .f4g-panel'
 ];
 const selector=panelSelectors.join(',');
 const rootSelector=[
  '#f4-direct-dialog','#f4-superadmin-confirm','.v21-modal',
  '#f4-tx-receipt-dialog',
  '#credentialModal','.v24-edit-overlay','.f4-activity-dialog',
  '.sa-account-shade','.f4-jersey-print-veil',
  '.tc-date-overlay','.f4-ui-dialog','#f4-work-notice',
  '.f4-control-overlay','dialog.f4-bank-sheet-modal',
  '.f4-pm-shade','.f4-resident-sheet-overlay',
  '#modal-event-detail','#modal-arisan','#modal-cetak-kas',
  '#modal-keuangan','#modal-jersey','#modal-dokumentasi',
  '#modal-gallery-grid','#modal-saran','#modal-rekening','#modal-edit',
  '.edit-modal','#modal-koreksi-migrasi','#modal-doc-rapat',
  '.f4p-album-overlay','#modal-gateway','.f4g-comment-overlay'
 ].join(',');
 const savedHeights=new WeakMap(), originalStyles=new WeakMap(), timers=new WeakMap();
 const watched=new WeakSet();
 let active=null, drag=null, animating=null, refreshFrame=0, lastDragAt=-1000;
 let grip;
 const labels=expanded=>expanded
  ? 'Geser ke bawah untuk mengecilkan atau menutup panel'
  : 'Geser ke atas untuk memperbesar atau ke bawah untuk menutup panel';
 function visible(el){
  if(!media.matches||!el||!el.isConnected||el.closest('[hidden],.hidden,[inert]'))return false;
  const r=el.getBoundingClientRect();
  return r.width>0&&r.height>0&&
   getComputedStyle(el).visibility!=='hidden'&&!el.closest('[inert]');
 }
 // Use the panel's actual bottom after the dock reservation. A short
 // visual viewport (e.g. keyboard) must never force an oversized sheet.
 function fullHeight(rect){
  const viewport=window.visualViewport;
  const top=(viewport?.offsetTop||0)+8;
  const bottom=Math.min(rect.bottom,(viewport?.offsetTop||0)+(viewport?.height||window.innerHeight));
  return Math.max(0,Math.floor(bottom-top));
 }
 function expandable(panel){return !panel.matches('.f4-control-panel')&&!panel.closest('.f4-bank-select-dropdown');}
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
  if([...document.querySelectorAll('.f4-control-overlay:not([hidden])')].some(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden')&&!document.body.classList.contains('f4-direct-bank')){grip.hidden=true;return;}
  // Never read panel geometry or overwrite the grip while a gesture is in flight.
  if(drag?.panel?.isConnected&&visible(drag.panel)||animating?.panel?.isConnected&&visible(animating.panel))return;
  if(drag){if(drag.frame)cancelAnimationFrame(drag.frame);drag=null;grip.classList.remove('f4-sheet-handle-dragging');}
  if(animating){clearTimer(animating.panel);}
  if(!grip.isConnected)document.body.append(grip);
  // Native Portal Utama and Bank Sampah lightboxes are never bottom sheets.
  // A gallery sheet may remain mounted behind the fullscreen viewer.
  const lightbox=document.querySelector(
   '#lightbox-modal:not(.hidden):not([hidden]),.v21-lightbox:not(.hidden):not([hidden]),.f4p-photo-overlay:not([hidden])'
  );
  if(lightbox&&lightbox.getClientRects().length&&!document.querySelector('.f4g-comment-overlay:not([hidden])')){active=null;grip.hidden=true;return;}
  // Choose the uppermost currently visible sheet. A newer date picker/dialog
  // must not inherit the handle of a still-open sheet underneath it.
  let latest=null,front=null;
  for(const panel of document.querySelectorAll(selector)){
   if(!expandable(panel))continue;
   attach(panel); // Reconcile after a SPA mount, not only after DOM insertion.
   if(!visible(panel))continue;
   latest=panel;
   const r=panel.getBoundingClientRect();
   const x=Math.max(0,Math.min(window.innerWidth-1,r.left+r.width/2));
   const y=Math.max(0,Math.min(window.innerHeight-1,r.top+Math.min(40,r.height/2)));
   const hit=document.elementFromPoint(x,y);
   if(hit&&(panel.contains(hit)||hit===grip&&active===panel))front=panel;
  }
  active=front||latest;
  if(!active||!visible(active)){
   if(grip.parentNode!==document.body)document.body.append(grip);
   grip.hidden=true;return;
  }
  // Native dialogs and the resident sheet carry their handle in their own layer.
  const embedded=active.matches('dialog.f4-bank-sheet-modal,.f4-control-panel,.f4-resident-sheet-panel');
  const host=embedded?active:document.body;
  if(grip.parentNode!==host)host.append(grip);
  const r=active.getBoundingClientRect();
  if(!embedded&&r.top>=window.innerHeight){grip.hidden=true;return;}
  grip.style.left=embedded?'0px':Math.max(0,r.left)+'px';
  grip.style.top=embedded?'0px':Math.max(0,r.top)+'px';
  grip.style.width=embedded?'100%':r.width+'px';
  grip.hidden=false;
  updateLabel(active);
  // Keep the grip aligned while the sheet entrance animation is moving.
  // Once the CSS animation ends there are no extra animation frames.
  if((active.getAnimations?.({subtree:false})||[]).some(animation=>animation.playState==='running'))requestRefresh();
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
   panel.classList.contains('f4-sheet-expanded')||originalStyles.has(panel);
  if(!dirty)return;
  clearTimer(panel);
  panel.classList.remove('f4-sheet-dragging','f4-sheet-settling','f4-sheet-dismissing','f4-sheet-expanded','f4-sheet-gesture-ready');
  const original=originalStyles.get(panel);
  if(original){for(const [k,value,priority] of original){if(value)panel.style.setProperty(k,value,priority);else panel.style.removeProperty(k);}originalStyles.delete(panel);}
  savedHeights.delete(panel);
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
  if(!expandable(panel))return;
  if(panel.dataset.f4SheetGesture==='1')return;
  panel.dataset.f4SheetGesture='1';
  panel.classList.add('f4-sheet-draggable');
  const root=rootOf(panel);
  // Root remains the modal backdrop; only its usable flex area reserves the dock.
  if(root!==panel)root.classList.add('f4-sheet-overlay-root');
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
  if(panel.matches('dialog.f4-bank-sheet-modal')){if(panel.open)panel.close();return;}
  if(panel.matches('.f4-user-year-popover')){
   const details=panel.closest('details');if(details)details.open=false;
   return;
  }
  const closeSelector=
   panel.matches('.f4-bank-credential-panel')?'[onclick*="closeCredential"]':
   panel.matches('.v21-modal-card')?'.v21-close':
   panel.matches('.f4-tx-card')?'.f4-tx-close':
   panel.matches('.v24-edit-card')?'#v24Close':
   panel.matches('.f4-activity-dialog-panel')?'.f4-activity-dialog-close':
   panel.matches('.f4-jersey-print-dialog')?'.f4-jersey-print-cancel':
   panel.matches('.f4-work-notice-panel')?'.f4-work-notice-close':
   panel.matches('.f4-control-panel')?'.f4-control-x':
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
 // Measure the resting sheet once. During the gesture the visible height itself
 // changes, so its scroll viewport always ends at the dock, not behind it.
 function prepare(panel){
  if(!panel?.isConnected||!visible(panel))return null;
  for(const a of panel.getAnimations?.({subtree:false})||[]){if(a.playState==='running'&&a.animationName){try{a.finish()}catch{}}}
  const rect=panel.getBoundingClientRect();
  const wasExpanded=panel.classList.contains('f4-sheet-expanded');
  clearTimer(panel);
  if(!originalStyles.has(panel))originalStyles.set(panel,['animation','transform','transition','height','min-height','max-height','flex-shrink','will-change'].map(k=>[k,panel.style.getPropertyValue(k),panel.style.getPropertyPriority(k)]));
  const height=Math.max(1,fullHeight(rect));
  const initial=Math.min(height,rect.height);
  if(!wasExpanded&&!savedHeights.has(panel))savedHeights.set(panel,initial);
  const collapsed=Math.min(height,savedHeights.get(panel)||initial);
  panel.classList.remove('f4-sheet-settling','f4-sheet-dismissing');
  panel.classList.add('f4-sheet-dragging','f4-sheet-gesture-ready');
  panel.style.animation='none';
  panel.style.transition='none';
  panel.style.minHeight='0px';
  panel.style.flexShrink='0';
  panel.style.willChange='height,transform';
  const embedded=grip.parentNode===panel;
  const pose={panel,expanded:wasExpanded,height,initial,collapsed,embedded,bottom:rect.bottom,shown:initial,shift:0,rawDelta:0,frame:0};
  grip.classList.remove('f4-sheet-handle-settling');
  grip.style.transition='none';
  grip.style.left=embedded?'0px':Math.max(0,rect.left)+'px';
  grip.style.width=embedded?'100%':rect.width+'px';
  grip.style.transform='none';
  grip.hidden=false;
  active=panel;
  paintPose(pose,initial,0);
  return pose;
 }
 function paintPose(pose,shown,shift){
  const panel=pose.panel;
  panel.style.height=shown+'px';
  panel.style.maxHeight=shown+'px';
  panel.style.transform=shift?'translate3d(0,'+shift+'px,0)':'none';
  if(!pose.embedded){
   grip.style.top=Math.max(0,pose.bottom-shown)+'px';
   grip.style.transform=shift?'translate3d(0,'+shift+'px,0)':'none';
  }else grip.style.top='0px';
 }
 function animatePose(pose,target){
  if(!pose?.panel?.isConnected)return;
  const panel=pose.panel;
  clearTimer(panel);
  const dismissing=target==='dismiss',expanded=target==='expanded';
  const finalHeight=dismissing?pose.shown:expanded?pose.height:pose.collapsed;
  const shift=dismissing?pose.shown+Math.max(0,window.innerHeight-pose.bottom)+16:0;
  const duration=reduced.matches?0:(dismissing?180:220);
  const ease='cubic-bezier(.22,.72,.27,1)';
  panel.classList.remove('f4-sheet-dragging');
  panel.classList.add(dismissing?'f4-sheet-dismissing':'f4-sheet-settling');
  panel.style.transition=duration?'height '+duration+'ms '+ease+',max-height '+duration+'ms '+ease+',transform '+duration+'ms '+ease:'none';
  grip.classList.remove('f4-sheet-handle-dragging');
  grip.classList.add('f4-sheet-handle-settling');
  grip.style.transition=duration?'top '+duration+'ms '+ease+',transform '+duration+'ms '+ease:'none';
  const job={panel,frame:0};animating=job;
  job.frame=requestAnimationFrame(()=>{
   job.frame=0;
   if(animating!==job||!panel.isConnected)return;
   paintPose(pose,finalHeight,shift);
  });
  timers.set(panel,setTimeout(()=>{
   if(animating!==job)return;
   timers.delete(panel);animating=null;
   if(dismissing){
    dismiss(panel);
    clearPanel(panel);
    if(active===panel)active=null;
   }else{
    panel.style.transition='none';
    paintPose(pose,finalHeight,0);
    panel.classList.toggle('f4-sheet-expanded',expanded);
    panel.classList.remove('f4-sheet-settling','f4-sheet-dismissing');
    panel.style.removeProperty('will-change');
   }
   grip.style.removeProperty('transition');
   grip.style.removeProperty('transform');
   grip.classList.remove('f4-sheet-handle-settling');
   requestRefresh();
  },duration+34));
 }
 function settle(panel,expanded,collapsedHeight,pose){
  const p=pose||prepare(panel);if(!p)return;
  if(Number.isFinite(collapsedHeight)&&collapsedHeight>0){
   p.collapsed=Math.min(p.height,collapsedHeight);
   savedHeights.set(panel,p.collapsed);
  }
  animatePose(p,expanded?'expanded':'collapsed');
 }
 function exitDown(panel,pose){
  const p=pose||prepare(panel);if(p)animatePose(p,'dismiss');
 }
 const headerSelector='.rp-history-head,.f4-resident-sheet-top,.f4g-head,.f4-ui-dialog-header,.f4-activity-dialog-header,.v21-modal-header';
 function begin(event){
  if(!media.matches||drag||!active||!visible(active))return;
  if(event.pointerType==='mouse'&&event.button!==0)return;
  const target=event.target;
  const onGrip=grip.contains(target);
  const header=target?.closest?.(headerSelector);
  if(!onGrip&&(!header||!active.contains(header)||target.closest('button,a,input,select,textarea,label,[role="button"]')))return;
  const p=prepare(active);if(!p)return;
  drag={...p,id:event.pointerId,startY:event.clientY,startAt:performance.now(),moved:false,onGrip};
  grip.classList.add('f4-sheet-handle-dragging');
  event.preventDefault();
  try{grip.setPointerCapture?.(event.pointerId)}catch{}
 }
 function positionAt(d,y){
  const raw=y-d.startY;d.rawDelta=raw;
  if(Math.abs(raw)>5)d.moved=true;
  const desired=d.initial-raw,minimum=Math.min(96,d.initial);
  d.shown=Math.max(minimum,Math.min(d.height,desired));
  d.shift=Math.max(0,minimum-desired);
 }
 function move(event){
  if(!drag||event.pointerId!==drag.id)return;
  const d=drag;positionAt(d,event.clientY);
  if(!d.frame)d.frame=requestAnimationFrame(()=>{
   d.frame=0;if(drag===d&&d.panel.isConnected)paintPose(d,d.shown,d.shift);
  });
  event.preventDefault();
 }
 function finish(event,cancelled=false){
  if(!drag||event.pointerId!==drag.id)return;
  const d=drag;drag=null;
  if(d.frame)cancelAnimationFrame(d.frame);
  if(!cancelled&&Number.isFinite(event.clientY))positionAt(d,event.clientY);
  paintPose(d,d.shown,d.shift);
  grip.classList.remove('f4-sheet-handle-dragging');
  try{if(grip.hasPointerCapture?.(event.pointerId))grip.releasePointerCapture(event.pointerId)}catch{}
  const dy=d.rawDelta,velocity=dy/Math.max(1,performance.now()-d.startAt);
  lastDragAt=performance.now();
  if(cancelled){settle(d.panel,d.expanded,d.collapsed,d);return}
  if(!d.moved){settle(d.panel,d.onGrip?!d.expanded:d.expanded,d.collapsed,d);return}
  if(dy< -24||(dy< -12&&velocity<-.25))settle(d.panel,true,d.collapsed,d);
  else if(dy>36||(dy>15&&velocity>.28)){
   if(d.expanded&&dy<Math.max(120,d.height*.32))settle(d.panel,false,d.collapsed,d);
   else exitDown(d.panel,d);
  }else settle(d.panel,d.expanded,d.collapsed,d);
  event.preventDefault();
 }
 function start(){
  if(!document.body)return;
  grip=document.createElement('div');
  grip.className='f4-sheet-handle';
  grip.dataset.f4Persistent='shell';
  grip.hidden=true;
  grip.setAttribute('role','button');
  grip.setAttribute('tabindex','0');
  grip.setAttribute('aria-expanded','false');
  grip.setAttribute('aria-label',labels(false));
  document.body.appendChild(grip);
  document.addEventListener('pointerdown',begin,{capture:true,passive:false});
  // Document capture also works when a browser drops pointer capture or the
  // handle is reparented into a sheet's own stacking context.
  document.addEventListener('pointermove',move,{capture:true,passive:false});
  document.addEventListener('pointerup',event=>finish(event,false),true);
  document.addEventListener('pointercancel',event=>finish(event,true),true);
  grip.addEventListener('click',event=>{
   event.preventDefault();
   if(event.detail!==0||!active||!visible(active)||performance.now()-lastDragAt<350)return;
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
    if(record.removedNodes.length)added=true;
    for(const node of record.addedNodes){
     if(node===grip)continue;
     inspect(node);added=true;
    }
   }
   if(added)requestRefresh();
  });
  observer.observe(document.body,{subtree:true,childList:true});
  function resizeSheet(){
   if(active?.isConnected&&!drag&&!animating&&active.classList.contains('f4-sheet-expanded')){
    const h=fullHeight(active.getBoundingClientRect());
    if(h>0&&Math.abs(active.getBoundingClientRect().height-h)>1){active.style.height=h+'px';active.style.maxHeight=h+'px';}
   }
   requestRefresh();
  }
  document.addEventListener('f4:portal-changed',requestRefresh);
  window.addEventListener('resize',resizeSheet,{passive:true});
  window.addEventListener('scroll',()=>{if(active?.isConnected&&!grip?.hidden)requestRefresh()},{passive:true,capture:true});
  window.visualViewport?.addEventListener('resize',resizeSheet,{passive:true});
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
 window.F4MobileSheets={version:'20261127-sheet-touch-v92',refresh:requestRefresh};
})();