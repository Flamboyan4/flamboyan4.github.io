/* Flamboyan 4 — native navigation and shared Cloudflare session, no portal iframe. */
(()=>{
'use strict';
/* Touch-only selection guard for dynamic clickable cards. Does not cancel
   pointer/touch events, scroll, pinch zoom, typing, or normal text selection. */
if(window.matchMedia('(pointer:coarse)').matches){
 const tappable='button,a[href],summary,[role="button"],[role="link"],[role="tab"],'+
  '[role="menuitem"],[onclick],.cursor-pointer,.media-album-card,.media-inventory-item,'+
  '.f4g-feed-card,.f4g-album-card,.v22-doc-card,.v22-member-feed-post,[data-bank-app-route]';
 document.addEventListener('selectstart',event=>{
  const node=event.target?.nodeType===1?event.target:event.target?.parentElement;
  if(!node?.closest||node.closest('input,textarea,select,[contenteditable],[data-allow-selection]'))return;
  if(node.closest(tappable)){event.preventDefault();return}
  /* Some legacy cards are assigned onclick in JS without an HTML attribute.
     Only guard an ancestor that behaves as a clickable control. */
  for(let el=node,depth=0;el&&el!==document.body&&depth<6;el=el.parentElement,depth++){
   if(typeof el.onclick==='function'&&getComputedStyle(el).cursor==='pointer'){
    event.preventDefault();return;
   }
  }
 },true);
}
const API='https://api.flamboyan4.web.id';
const paths={portal:'/',bank:'/bank-sampah/',book:'/pembukuan/',superadmin:'/superadmin/',donor:'/donatur/',rapat:'/rapat/',dokumentasi:'/dokumentasi/',finance:'/keuangan/',agenda:'/agenda/',profile:'/profil/'};
const residentKeys=['finance','agenda','profile'];
const pathname=location.pathname;
const portalKey=path=>Object.keys(paths).find(key=>paths[key]===path.replace(/index\.html$/i,'').replace(/\/?$/,'/'))||null;
// Version cross-portal navigation so an older HTML cache cannot reintroduce the old shell.
const shellRelease=document.documentElement.dataset.f4Release||'20261127-stable-bank-navbar-v8';
function shellUrl(path){const u=new URL(path,location.origin);if(u.origin!==location.origin)return u.href;const canonical=u.pathname.replace(/index\.html$/i,'').replace(/\/?$/,'/');if(Object.values(paths).filter(p=>p!==paths.donor).includes(canonical)){u.pathname=canonical;u.searchParams.set('f4ui',shellRelease);}return u.pathname+u.search+u.hash;}
// Version ordinary cross-portal links too, including legacy links not built by navButton.
document.addEventListener('click',event=>{const a=event.target?.closest?.('a[href]');if(!a||a.hasAttribute('download'))return;const u=new URL(a.href,location.origin);const canonical=u.pathname.replace(/index\.html$/i,'').replace(/\/?$/,'/');if(u.origin===location.origin&&canonical!==location.pathname.replace(/index\.html$/i,'').replace(/\/?$/,'/')&&Object.values(paths).filter(p=>p!==paths.donor).includes(canonical))a.href=shellUrl(u.href);},true);
const initialKey=portalKey(pathname)||'portal';
let portal=['rapat','dokumentasi',...residentKeys].includes(initialKey)?'simple':initialKey;
function applyPortalTheme(next){
 document.body.classList.remove('f4-direct-portal','f4-direct-simple','f4-direct-bank','f4-direct-book','f4-direct-superadmin','portal-mode','bank-mode','book-mode','superadmin-mode');
 document.body.classList.add('f4-direct-'+next,next==='book'?'book-mode':next==='bank'?'bank-mode':next==='superadmin'?'superadmin-mode':'portal-mode');
}
applyPortalTheme(portal);
// All navigation pictograms are locally hosted SVG files, never Unicode symbols.
const svg=name=>'<span class="f4-svg-icon f4-svg-'+name+'" aria-hidden="true"></span>';
const el=(tag,cl)=>{const n=document.createElement(tag);if(cl)n.className=cl;return n};
const bar=el('div');bar.id='f4-direct-bar';bar.dataset.f4Persistent='shell';
const hamburger=el('button');hamburger.id='f4-mobile-menu';hamburger.type='button';hamburger.innerHTML=svg('menu');hamburger.setAttribute('aria-label','Buka menu halaman');
const links=el('nav','f4-nav-links');links.setAttribute('aria-label','Pindah portal');
function navButton(key,url,label){
 const a=el('a');a.dataset.f4PortalTarget=key==='home'?'portal':key;a.href=shellUrl(url);a.title=label;a.setAttribute('aria-label',label);a.innerHTML=svg(key);
 if((portal==='portal'&&key==='home')||(portal==='bank'&&key==='bank')||(portal==='book'&&key==='book')||(portal==='superadmin'&&key==='superadmin'))a.classList.add('f4-selected');
 links.append(a);return a;
}
const portalMainLink=navButton('home',paths.portal,'Portal Utama');
// One shared Portal Utama icon on every portal and for every role:
// exactly the globe pictogram used by Bank Sampah; not the Beranda house.
portalMainLink.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18"></path></svg>';
navButton('bank',paths.bank,'Bank Sampah');
const bookLink=navButton('book',paths.book,'Pembukuan');const adminLink=navButton('superadmin',paths.superadmin,'Superadmin');const donorLink=navButton('donor',paths.donor,'Laporan Donatur');
bookLink.hidden=true;adminLink.hidden=true;donorLink.hidden=true;
const login=el('button','f4-direct-login');login.type='button';login.textContent='LOGIN';
const avatar=el('button');avatar.id='f4-direct-avatar';avatar.type='button';avatar.innerHTML=svg('user');avatar.hidden=true;avatar.setAttribute('aria-label','Buka menu akun');
const menu=el('div');menu.id='f4-direct-account-menu';menu.hidden=true;
const menuName=el('div','f4-nav-account-name');
const socialProfile=el('button');socialProfile.type='button';socialProfile.textContent='Profil Saya';socialProfile.dataset.accountAction='profile';socialProfile.hidden=true;
const settings=el('button');settings.type='button';settings.textContent='Pengaturan Akun';settings.dataset.accountAction='settings';
const logout=el('button');logout.type='button';logout.textContent='Keluar';logout.dataset.accountAction='logout';
menu.append(menuName,socialProfile,settings,logout);
const identity=el('div','f4-direct-identity');identity.id='f4-direct-identity';identity.hidden=true;
const identityName=el('strong');identity.append(identityName);
const meeting=el('a');meeting.id='f4-direct-meeting';meeting.href=shellUrl(paths.rapat);meeting.title='Rapat';meeting.setAttribute('aria-label','Rapat');
 meeting.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 12h8M8 16h8"/></svg>';
 meeting.setAttribute('aria-current',initialKey==='rapat'?'page':'false');meeting.classList.toggle('f4-selected',initialKey==='rapat');
 bar.append(hamburger,identity,links,login,meeting,avatar,menu);
 const barHost=el('div');barHost.id='f4-shell-top';barHost.dataset.f4Persistent='shell';
 barHost.append(bar);document.body.prepend(barHost);
// One scroll API for original page scripts and the persistent shell.
const mobileFrame=matchMedia('(max-width:1023px)');
function pageScrollElement(){
 if(mobileFrame.matches&&!document.body.classList.contains('f4-denied')){
  const root=document.querySelector('body.f4-direct-bank>.shell,body.f4-direct-superadmin>#f4-account-page:not([hidden]),body:is(.f4-direct-portal,.f4-direct-simple,.f4-direct-book)>main');
  if(root&&root.getClientRects().length)return root;
 }
 return document.scrollingElement||document.documentElement;
}
function scrollPage(method,...args){
 const root=pageScrollElement();
 if(root===document.scrollingElement||root===document.documentElement)window[method](...args);
 else root[method](...args);
}
const shellScroll={
 element:pageScrollElement,
 get y(){return pageScrollElement().scrollTop||0},
 get x(){return pageScrollElement().scrollLeft||0},
 scrollTo:(...args)=>scrollPage('scrollTo',...args),
 scrollBy:(...args)=>scrollPage('scrollBy',...args)
};
window.F4ShellScroll=shellScroll;
// Native element scroll events do not bubble to window. Forward only the
// active page root's scroll, once per frame, for existing scroll observers.
let scrollNotification=0;
document.addEventListener('scroll',event=>{
 if(event.target!==pageScrollElement()||event.target===document.scrollingElement||scrollNotification)return;
 scrollNotification=requestAnimationFrame(()=>{scrollNotification=0;window.dispatchEvent(new Event('scroll'))});
},{capture:true,passive:true});

// Persistent loading surface; navbar and dock are never replaced.
const routeLoading=el('div');routeLoading.id='f4-route-loading';routeLoading.dataset.f4Persistent='shell';routeLoading.hidden=true;
routeLoading.setAttribute('role','status');routeLoading.setAttribute('aria-live','polite');
routeLoading.innerHTML='<span class="f4-route-loading-indicator"><span class="f4-route-spinner" aria-hidden="true"></span><span>Memuat halaman…</span></span>';
document.body.append(routeLoading);
const swapFallback=el('div');swapFallback.id='f4-swap-fallback';swapFallback.dataset.f4Persistent='shell';swapFallback.setAttribute('aria-hidden','true');swapFallback.textContent='Memuat halaman…';document.body.append(swapFallback);
// Shared resident notification component for all native portals.
const notificationStyle=el('link');notificationStyle.dataset.f4Persistent='shell';notificationStyle.rel='stylesheet';notificationStyle.href='/portal-live/gallery-tag-notifications.css?v=20261126-single-notification-v1';document.head.append(notificationStyle);
const notificationScript=el('script');notificationScript.src='/portal-live/gallery-tag-notifications.js?v=20261127-finance-inbox-v58';document.head.append(notificationScript);
const dialog=el('div');dialog.id='f4-direct-dialog';dialog.hidden=true;
dialog.innerHTML='<section role="dialog" aria-modal="true" aria-label="Login Flamboyan 4"><h2>Login Flamboyan 4</h2><form id="f4-direct-login-form"><label for="f4-direct-username">Username</label><input id="f4-direct-username" required autocomplete="username"><label for="f4-direct-password">Password</label><div class="f4-direct-password-field"><input id="f4-direct-password" type="password" required autocomplete="current-password"><button type="button" id="f4-direct-show-password" aria-label="Tampilkan password" title="Tampilkan password" aria-pressed="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/></svg></button></div><p class="f4-login-error" id="f4-direct-login-error" role="status"></p><div class="f4-login-actions"><button type="button" id="f4-direct-close-login">Batal</button><button type="submit">Masuk</button></div></form></section>';
document.body.append(dialog);
const password=dialog.querySelector('#f4-direct-password');
const showPassword=dialog.querySelector('#f4-direct-show-password');
showPassword.addEventListener('click',()=>{
 const visible=password.type==='text';
 password.type=visible?'password':'text';
 showPassword.setAttribute('aria-pressed',String(!visible));
 const label=visible?'Tampilkan password':'Sembunyikan password';
 showPassword.setAttribute('aria-label',label);showPassword.title=label;
 showPassword.innerHTML=visible?
 '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/></svg>':
 '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 18 18M10.6 6.1A11 11 0 0 1 12 6c6.5 0 10 6 10 6a13.9 13.9 0 0 1-3.2 3.7M6.1 8C3.5 9.7 2 12 2 12a15 15 0 0 0 7 5.4"/><path d="M10 10a3 3 0 0 0 4 4"/></svg>';
 password.focus({preventScroll:true});
});
const gate=el('div');gate.id='f4-direct-gate';gate.hidden=true;document.body.append(gate);
function openLogin(){dialog.hidden=false;menu.hidden=true;dialog.querySelector('#f4-direct-username').focus();}
function closeLogin(){dialog.hidden=true;}
login.addEventListener('click',openLogin);
dialog.querySelector('#f4-direct-close-login').addEventListener('click',closeLogin);
dialog.addEventListener('click',e=>{if(e.target===dialog)closeLogin()});
window.f4ShowLogin=openLogin;
let session=null,role='public';

/* One permanent action rail: residents across their portals, staff on Portal Utama. */
const residentTools=(()=>{
 const accounts=Object.freeze([
  Object.freeze({key:'mandiri',bank:'Mandiri',number:'1330022606479',owner:'ROSALINDA'}),
  Object.freeze({key:'seabank',bank:'SeaBank',number:'901493321399',owner:'HERI JUWANDI'})
 ]);
 const qris='/assets/qris-flamboyan4.jpg';
 const icons={
  wallet:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18m0 3h-5a2 2 0 0 0 0 4h5"/><path d="M16 14h.01"/>',
  feedback:'<path d="M21 14a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3zM12 7v6m-3-3h6"/>',
  up:'<path d="M12 19V5m-6 6 6-6 6 6"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  qr:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h3v3h3m-6 3h3m3-6v-3m-9-9v3m0 6h-3m3 0v3"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  send:'<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>'
 };
 const glyph=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
 const root=el('div');root.id='f4-resident-tools';root.dataset.f4Persistent='shell';root.hidden=true;
 root.setAttribute('aria-label','Akses cepat warga');
 root.innerHTML='<button type="button" id="f4-resident-top" aria-label="Kembali ke atas" hidden>'+glyph('up')+'</button><div id="f4-resident-edge"><button type="button" class="f4-resident-edge-btn" data-action="feedback" data-expanded="false" aria-label="Tampilkan tombol kirim masukan" aria-expanded="false">'+glyph('feedback')+'<span>Masukan</span></button><button type="button" class="f4-resident-edge-btn" data-action="payment" data-expanded="false" aria-label="Tampilkan tombol pembayaran" aria-expanded="false">'+glyph('wallet')+'<span>Pembayaran</span></button></div><section id="f4-resident-pay-panel" aria-label="Metode pembayaran" hidden><div class="f4-resident-pay-head"><strong>Pembayaran</strong><button type="button" data-close-payment aria-label="Tutup pembayaran">'+glyph('close')+'</button></div><a class="f4-resident-qr" href="'+qris+'" download="QRIS_Flamboyan4.jpg">'+glyph('qr')+'Unduh QRIS</a><div class="f4-resident-pay-accounts"></div><p class="f4-resident-pay-status" role="status" aria-live="polite"></p></section>';
 document.body.append(root);
 const edge=root.querySelector('#f4-resident-edge'),top=root.querySelector('#f4-resident-top'),pay=root.querySelector('#f4-resident-pay-panel'),payStatus=pay.querySelector('.f4-resident-pay-status');
 const paymentButton=edge.querySelector('[data-action="payment"]'),feedbackButton=edge.querySelector('[data-action="feedback"]');
 for(const account of accounts){
  const row=el('div','f4-resident-pay-row'),info=el('div','f4-resident-pay-info'),name=el('strong'),number=el('span'),owner=el('small'),copy=el('button','f4-resident-pay-copy');
  name.textContent=account.bank;number.textContent=account.number;owner.textContent='a.n. '+account.owner;
  info.append(name,number,owner);copy.type='button';copy.setAttribute('aria-label','Salin rekening '+account.bank);copy.innerHTML=glyph('copy')+'<span>Salin</span>';
  copy.addEventListener('click',async()=>{copy.disabled=true;let ok=false;try{ok=await copyNumber(account.number)}finally{copy.disabled=false}payStatus.textContent=ok?'Nomor '+account.bank+' berhasil disalin.':'Gagal menyalin. Tekan lama nomor rekening.';copy.querySelector('span').textContent=ok?'Tersalin':'Salin';setTimeout(()=>{copy.querySelector('span').textContent='Salin'},1800)});
  row.append(info,copy);pay.querySelector('.f4-resident-pay-accounts').append(row);
 }
 const suggestion=el('dialog');suggestion.id='f4-resident-feedback';suggestion.dataset.f4Persistent='shell';suggestion.setAttribute('aria-labelledby','f4-resident-feedback-title');
 suggestion.innerHTML='<div class="f4-resident-feedback-head"><h2 id="f4-resident-feedback-title">Kotak Saran</h2><button type="button" data-close-feedback aria-label="Tutup">'+glyph('close')+'</button></div><form><p>Saran dikirim ke pengurus. Tak perlu nama atau data pribadi.</p><textarea name="pesan" rows="5" minlength="5" maxlength="2000" required placeholder="Tulis saran atau keluhan..."></textarea><div class="f4-resident-feedback-trap" aria-hidden="true"><label>Website (kosongkan)<input name="website" tabindex="-1" autocomplete="off"></label></div><button type="submit">'+glyph('send')+'Kirim Saran</button><p class="f4-resident-feedback-status" role="status" aria-live="polite"></p></form>';
 document.body.append(suggestion);
 const form=suggestion.querySelector('form'),send=form.querySelector('[type="submit"]'),feedbackStatus=form.querySelector('.f4-resident-feedback-status');
 let enabled=false,lastY=0,wasBottom=false,lastRoute='',drag=null,suppressClickUntil=0,lastSuggestionAt=0,sending=false,scrollFrame=0;
 function closePayment(){pay.hidden=true;paymentButton.setAttribute('aria-expanded','false');payStatus.textContent=''}
 const edgeButtons=[feedbackButton,paymentButton];
 const isExpanded=button=>button.dataset.expanded==='true';
 function setExpanded(value,only=null){
  for(const button of edgeButtons){
   const expanded=!!value&&(!only||only===button);
   button.dataset.expanded=String(expanded);button.style.removeProperty('--f4-edge-drag-width');
   const label=button===paymentButton?'Pembayaran':'Masukan';
   button.setAttribute('aria-label',expanded?label:'Tampilkan '+label.toLowerCase());
   button.setAttribute('aria-expanded',String(expanded));
  }
  if(!isExpanded(paymentButton))closePayment();
 }
 function openPayment(){
  if(!enabled)return false;
  setExpanded(true,paymentButton);pay.hidden=false;paymentButton.setAttribute('aria-expanded','true');return true;
 }
 function openFeedback(){
  if(!enabled)return false;
  closePayment();setExpanded(true,feedbackButton);
  if(!suggestion.open){feedbackStatus.textContent='';suggestion.showModal()}
  return true;
 }
 async function copyNumber(value){
  if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(value);return true}catch{}}
  const input=el('textarea');input.value=value;input.readOnly=true;input.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';document.body.append(input);input.select();
  let ok=false;try{ok=document.execCommand('copy')}catch{}input.remove();return ok;
 }
 function syncScroll(reset=false){
  if(!enabled)return;
  const scroller=shellScroll.element();
  const y=Math.max(0,shellScroll.y),height=scroller.clientHeight;
  const total=scroller.scrollHeight;
  const max=Math.max(0,total-height);
  const dock=document.getElementById('f4-direct-dock');
  const dockHeight=dock&&!dock.hidden?dock.getBoundingClientRect().height:0;
  // The final readable content is above the dock and its reserved bottom padding.
  const bottom=max-y<=Math.max(24,dockHeight+28);
  top.hidden=y<=120;
  if(reset){lastY=y;wasBottom=false;setExpanded(false);return}
  if(drag||suggestion.open){lastY=y;return}
  if(y<lastY-2){if(!bottom||wasBottom)setExpanded(false)}
  // Only the home portal may reveal the shortcuts automatically.
  else if(activePortalKey==='portal'&&bottom&&(!wasBottom||y>lastY+1))setExpanded(true);
  wasBottom=bottom;lastY=y;
 }
 function scheduleScroll(){
  if(scrollFrame)return;
  scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;syncScroll()});
 }
 function syncRole(next){
  const allowed=!!session?.account&&((next==='warga'&&['portal','bank','finance','agenda','profile','dokumentasi','rapat'].includes(activePortalKey))||(['admin','superadmin'].includes(next)&&activePortalKey==='portal'));
  document.body.classList.toggle('f4-resident-tools-active',allowed);
  root.hidden=!allowed;
  if(enabled===allowed)return;
  enabled=allowed;setExpanded(false);lastRoute='';drag=null;
  if(!enabled){top.hidden=true;if(suggestion.open)suggestion.close();form.reset();feedbackStatus.textContent=''}
  else {syncScroll(true);scheduleScroll();}
 }
 top.addEventListener('click',()=>shellScroll.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
 for(const button of edge.querySelectorAll('button')){
  button.addEventListener('pointerdown',e=>{
   if(e.button!==0||!e.isPrimary)return;
   drag={id:e.pointerId,x:e.clientX,start:isExpanded(button)?136:21,moved:false,button};
   button.setPointerCapture?.(e.pointerId);
  });
  button.addEventListener('pointermove',e=>{
   if(!drag||drag.id!==e.pointerId)return;
   const dx=drag.x-e.clientX;
   if(Math.abs(dx)>5)drag.moved=true;
   if(drag.moved)button.style.setProperty('--f4-edge-drag-width',Math.max(21,Math.min(136,drag.start+dx))+'px');
  });
  button.addEventListener('pointerup',e=>{
   if(!drag||drag.id!==e.pointerId)return;
   const d=drag;drag=null;
   if(d.moved){suppressClickUntil=Date.now()+350;setExpanded(d.x-e.clientX>6?true:e.clientX-d.x>6?false:isExpanded(button),button)}
   else button.style.removeProperty('--f4-edge-drag-width');
  });
  button.addEventListener('pointercancel',()=>{drag=null;button.style.removeProperty('--f4-edge-drag-width')});
  button.addEventListener('click',e=>{
   if(Date.now()<suppressClickUntil){e.preventDefault();return}
   if(!isExpanded(button)){setExpanded(true,button);return}
   if(button===paymentButton){if(pay.hidden)openPayment();else closePayment()}
   else openFeedback();
  });
 }
 pay.querySelector('[data-close-payment]').onclick=closePayment;
 suggestion.querySelector('[data-close-feedback]').onclick=()=>suggestion.close();
 suggestion.addEventListener('click',e=>{if(e.target===suggestion){const r=suggestion.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)suggestion.close()}});
 suggestion.addEventListener('close',()=>{if(enabled)feedbackButton.focus({preventScroll:true})});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!enabled||sending||form.elements.website.value)return;
  if(Date.now()-lastSuggestionAt<60000){feedbackStatus.textContent='Saran baru dapat dikirim lagi setelah satu menit.';return}
  const pesan=String(form.elements.pesan.value||'').trim();
  if(pesan.length<5||pesan.length>2000){feedbackStatus.textContent='Saran harus berisi 5–2000 karakter.';return}
  sending=true;send.disabled=true;feedbackStatus.textContent='Mengirim…';
  try{
   const response=await fetch(API+'/api/v2/public/portal/suggestions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pesan})});
   const result=await response.json();if(!response.ok||result.ok===false)throw Error(result.error||'HTTP '+response.status);
   lastSuggestionAt=Date.now();form.reset();feedbackStatus.textContent='Terima kasih! Pesan Anda telah terkirim.';
  }catch(error){feedbackStatus.textContent='Saran belum berhasil disimpan: '+error.message}
  finally{sending=false;send.disabled=false}
 });
 document.addEventListener('click',e=>{if(!pay.hidden&&!root.contains(e.target))closePayment()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pay.hidden){closePayment();paymentButton.focus()}});
 window.addEventListener('scroll',scheduleScroll,{passive:true});
 window.addEventListener('resize',scheduleScroll,{passive:true});
 window.visualViewport?.addEventListener('resize',scheduleScroll,{passive:true});
 if(window.ResizeObserver){const observer=new ResizeObserver(scheduleScroll);observer.observe(document.body);observer.observe(document.documentElement)}
 document.addEventListener('f4:portal-changed',()=>{lastRoute='';if(suggestion.open)suggestion.close();syncScroll(true);scheduleScroll()});
 window.addEventListener('f4-shared-bank-route',e=>{if(lastRoute===e.detail)return;lastRoute=e.detail;syncScroll(true);scheduleScroll()});
 return {syncRole,openPayment,copyNumber,accounts,qris,isBusy:()=>sending,refresh:()=>syncScroll()};
})();
window.F4ResidentTools=residentTools;

// The persistent navbar owns its own menu state; mounted pages only report routes.
function syncPageMenu(){
 if(hamburger.dataset.f4MenuMode!=='menu'){
  hamburger.dataset.f4MenuMode='menu';hamburger.innerHTML=svg('menu');
 }
 if(!document.body.classList.contains('f4-account-open')){
  hamburger.title='Buka menu halaman';hamburger.setAttribute('aria-label','Buka menu halaman');
 }
}
syncPageMenu();
/* Shared dock presentation is mounted at the beginning of the document.
   Keep authentication and navigation dispatch here, not in the presentation. */
const dock=window.F4MobileDock;
let queuedDockAction=null,bankNavigationObserver=null,bankNavigationTimer=null;
const validDockRole=value=>dock?.validRole(value)||false;
const rememberDockHint=value=>dock?.remember(value);
function updateSharedDock(next=session?.account&&validDockRole(role)?role:''){dock?.update(next);residentTools.syncRole(next)}
function closeDockMenu(focus=false){dock?.closeMenu(focus)}
function cancelBankNavigation(){
 bankNavigationObserver?.disconnect();bankNavigationObserver=null;
 if(bankNavigationTimer){clearTimeout(bankNavigationTimer);bankNavigationTimer=null}
}
/* The production shell is the sole entry point for cross-portal navigation.
   A content adapter must provide both prepare and dispose before it can be
   switched in the same document. Never replay unscoped classic scripts. */
let activePortalKey=initialKey,lastActiveUrl=location.pathname+location.search+location.hash;
function rememberActiveUrl(){if(portalKey(location.pathname)===activePortalKey)lastActiveUrl=location.pathname+location.search+location.hash;}
function restoreActiveUrl(){if(portalKey(location.pathname)!==activePortalKey)history.replaceState({f4PortalKey:activePortalKey},'',lastActiveUrl);}
const contentAdapters=new Map();
let mountedContent=null,navigationPending=false,viewSequence=0;
function beginView(){
 if(navigationPending)return null;
 const token=++viewSequence;routeLoading.hidden=false;return token;
}
function afterPaint(){
 if(document.hidden)return Promise.resolve();
 return new Promise(resolve=>{
  const timer=setTimeout(resolve,120);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{clearTimeout(timer);resolve()}));
 });
}
function endView(token){
 if(token===null||token!==viewSequence)return;
 const ready=window.F4PortalRuntime?.waitForView?.()||Promise.resolve();
 Promise.resolve(ready).catch(()=>{}).then(afterPaint).finally(()=>{if(token===viewSequence){document.documentElement.removeAttribute('data-f4-swapping');routeLoading.hidden=true;residentTools.refresh()}});
}
function canAccessPortal(key){
 if(key==='book'||key==='superadmin')return sessionCheckCompleted&&!!session?.account&&role==='superadmin';
 if(key==='donor')return sessionCheckCompleted&&!!session?.account&&role==='donatur';
 if(key==='profile')return sessionCheckCompleted&&!!session?.account&&['warga','admin','superadmin'].includes(role);
 if(residentKeys.includes(key))return sessionCheckCompleted&&!!session?.account&&role==='warga';
 return ['portal','bank','rapat','dokumentasi'].includes(key);
}
function updatePortalChrome(key){
 activePortalKey=key;
 portal=['rapat','dokumentasi',...residentKeys].includes(key)?'simple':key;
 document.documentElement.dataset.f4Shell=portal;
 applyPortalTheme(portal);hamburger.removeAttribute('aria-controls');hamburger.setAttribute('aria-expanded','false');syncPageMenu();dock?.setPortal(residentKeys.includes(key)?key:portal);updateSharedDock();if(sessionCheckCompleted)document.documentElement.classList.remove('f4-auth-pending');
 for(const a of links.querySelectorAll('[data-f4-portal-target]'))a.classList.toggle('f4-selected',a.dataset.f4PortalTarget===(portal==='simple'?'portal':key));
 meeting.setAttribute('aria-current',key==='rapat'?'page':'false');meeting.classList.toggle('f4-selected',key==='rapat');
 syncAccountMenu();
 document.getElementById('f4-direct-sidebar')?.remove();document.getElementById('f4-direct-sideback')?.remove();makePortalSide();
 document.dispatchEvent(new CustomEvent('f4:portal-changed',{detail:{key,portal}}));
}
async function navigatePortal(path,{replace=false,pop=false}={}){
 let target=new URL(path,location.origin);
 if(target.origin===location.origin&&portalKey(target.pathname)==='dokumentasi'&&target.searchParams.get('halaman')==='profil')target=new URL(paths.profile,location.origin);
 if(target.origin===location.origin&&portalKey(target.pathname)==='bank'&&target.searchParams.get('halaman')==='profile')target=new URL(paths.profile+'?halaman=edit',location.origin);
 const key=portalKey(target.pathname);
 if(target.origin!==location.origin||!key)return false;
 if(navigationPending){if(pop)restoreActiveUrl();return false;}
 if(!canAccessPortal(key)){
  if(pop)restoreActiveUrl();
  if(!session?.account)openLogin();
  else showSessionNotice('Akun ini tidak memiliki akses ke portal tersebut.','Tutup',()=>{sessionNotice.hidden=true});
  return false;
 }
 const route=target.searchParams.get('halaman');
 const here=activePortalKey===key;
 if(here&&!target.hash){
  if(key==='profile'){
   if(mountedContent?.canLeave&&!mountedContent.canLeave()){if(pop)history.replaceState(history.state,'',lastActiveUrl);return false;}
   const edit=route==='edit'||role!=='warga',dest=paths.profile+(edit?'?halaman=edit':'');
   if(dest!==location.pathname+location.search)history[replace||pop?'replaceState':'pushState']({f4PortalKey:key},'',dest);
   window.f4ProfileSetMode?.(edit?'edit':'social');rememberActiveUrl();dock?.refresh?.();shellScroll.scrollTo({top:0,left:0,behavior:'instant'});return true;
  }
  if(residentKeys.includes(key)){dock?.refresh?.();return true;}
  if(key==='portal'&&typeof window.f4PortalSelectPanel==='function'&&(!route||['beranda','keuangan','kas-warga','projek','kalender','arisan','pembayaran','komentar'].includes(route))){
   window.f4PortalSelectPanel(route||'beranda',!pop);dock?.refresh?.();return true;
  }
  if(key==='bank'&&session?.account&&(!route||/^(?:dashboard|profile|pribadi|setoran|penjualan|tabungan|laporan|riwayat|riwayatJual|rekonsiliasi|master|admin|bank-[a-z-]+)$/.test(route))){openBankRoute(route||'dashboard');return true}
  if(key==='book'&&typeof window.pilihMenu==='function'&&(!route||['monitor','inputdata','input','transaksi','kas','pinjaman','importbulk','talangan','denda','laporan','riwayat','dashboard','rumah','warga','config'].includes(route))){window.pilihMenu(route||'inputdata',route==='kas'?{month:target.searchParams.get('bulan'),year:target.searchParams.get('tahun')}:null);return true}
  if(key==='superadmin'&&!route)return true;
 }
 const current=mountedContent,next=contentAdapters.get(key);
 // Existing pages stay operational until their own lifecycle is migrated.
 if(!current||!next){
  const url=shellUrl(target.href);
  if(replace||pop)location.replace(url);else location.assign(url);return true;
 }
 const viewToken=beginView();navigationPending=true;
 document.documentElement.setAttribute('data-f4-swapping','');
 const accountId=session?.account?.id||null,requestedRole=role;
 const stillAllowed=()=>accountId===(session?.account?.id||null)&&requestedRole===role&&canAccessPortal(key);
 let prepared=null,detached=false;
 try{
  if(current.canLeave&&!(await current.canLeave())){if(pop)restoreActiveUrl();showSessionNotice('Konten atau transaksi masih diproses.','Tutup',()=>{sessionNotice.hidden=true});return false;}
  prepared=await next.prepare(target);
  if(!prepared||typeof prepared.mount!=='function'||typeof prepared.dispose!=='function')throw Error('Lifecycle konten tidak lengkap.');
  if(!stillAllowed()){await prepared.dispose();if(pop)restoreActiveUrl();return false}
  if(current.canLeave&&!(await current.canLeave())){await prepared.dispose();if(pop)restoreActiveUrl();showSessionNotice('Transaksi masih diproses.','Tutup',()=>{sessionNotice.hidden=true});return false;}
  closeSide();closeDockMenu();menu.hidden=true;cancelBankNavigation();
  // Ensure the persistent loading surface has painted before disposing content.
  await afterPaint();
  if(!stillAllowed()){await prepared.dispose();if(pop)restoreActiveUrl();return false}
  if(current.canLeave&&!(await current.canLeave())){await prepared.dispose();if(pop)restoreActiveUrl();showSessionNotice('Transaksi masih diproses.','Tutup',()=>{sessionNotice.hidden=true});return false;}
  await current.dispose();mountedContent=null;detached=true;
  if(!stillAllowed()){await prepared.dispose();location.replace(shellUrl('/'));return false;}
  history[replace||pop?'replaceState':'pushState'](pop?{...history.state,f4PortalKey:key}:{f4PortalKey:key},'',target.pathname+target.search+target.hash);
  await prepared.mount();mountedContent=prepared;if(!stillAllowed()){location.replace(shellUrl('/'));return false;}rememberActiveUrl();shellScroll.scrollTo({top:0,left:0,behavior:'instant'});return true;
 }catch(error){
  try{await prepared?.dispose?.()}catch{}
  console.error('Navigasi portal:',error);
  if(!detached){if(pop)restoreActiveUrl();showSessionNotice('Portal belum dapat dimuat.','Coba Lagi',()=>{void navigatePortal(target.href,{replace})});return false;}
  // A hard reload is only an error recovery after the old content has been disposed.
  location.replace(shellUrl(canAccessPortal(key)?target.href:'/'));return false;
 }finally{navigationPending=false;endView(viewToken)}
}
window.F4PortalNavigation={
 go:navigatePortal,current:()=>activePortalKey,recordUrl:rememberActiveUrl,beginView,endView,
 activate:updatePortalChrome,
 contentReady(){
  if(portal==='portal'){window.f4GoBank=()=>navigatePortal(paths.bank);if(typeof window.openModalDokumentasi==='function')window.openModalDokumentasi=()=>navigatePortal(paths.dokumentasi)}
  if(portal==='bank')window.v11ShowLogin=()=>openLogin();
  if(sessionCheckCompleted)notifyRole();rememberActiveUrl();
  const calendar=document.getElementById('rencana'),inventory=document.getElementById('kegiatan');if(portal==='portal'&&calendar&&inventory&&calendar.parentElement===inventory.parentElement)inventory.before(calendar);
  window.F4MobileSheets?.refresh?.();
 },
 register(key,factory,{mounted}={}){
  if(!['portal','bank','book','superadmin','rapat','dokumentasi',...residentKeys].includes(key)||typeof factory?.prepare!=='function')throw Error('Factory konten harus memiliki prepare.');
  if(mounted&&(key!==activePortalKey||typeof mounted.dispose!=='function'||mountedContent))throw Error('Lifecycle konten aktif tidak valid.');
  contentAdapters.set(key,factory);if(mounted)mountedContent=mounted;
 }
};

/* One pull-to-refresh controller for the active mobile content root.
   Never move the frame or intercept ordinary horizontal/vertical scrolling. */
(()=>{
 const indicator=el('div');indicator.id='f4-pull-refresh';indicator.dataset.f4Persistent='shell';indicator.hidden=true;
 indicator.setAttribute('aria-hidden','true');
 indicator.innerHTML='<svg viewBox="0 0 32 32" width="30" height="30" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="12" stroke="#e2e8f0" stroke-width="3"/><path d="M16 4a12 12 0 0 1 12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
 barHost.append(indicator);
 const dirty=new WeakSet(),threshold=72;
 let gesture=null,refreshing=false;
 const overlay='dialog[open],#f4-direct-dialog:not([hidden]),#f4-direct-sideback:not([hidden]),#f4-direct-account-menu:not([hidden]),#f4-resident-pay-panel:not([hidden]),#modal-saran:not(.hidden),#modal-event-detail:not(.hidden),#modal-keuangan:not(.hidden),#modal-cetak-kas:not(.hidden),#modal-arisan:not(.hidden),#modal-jersey:not(.hidden),#modal-dokumentasi:not(.hidden),#modal-gallery-grid:not(.hidden),#lightbox-modal:not(.hidden),.v21-modal:not(.hidden),.f4g-overlay:not([hidden])';
 const editing='input,textarea,select,[contenteditable]:not([contenteditable="false"])';
 function blocked(){
  return refreshing||unavailable();
 }
 function unavailable(){
  return !mobileFrame.matches||navigationPending||!routeLoading.hidden||
   !mountedContent||!sessionCheckCompleted||residentTools.isBusy()||
   document.documentElement.matches('[data-f4-starting],[data-f4-swapping],.f4p-overlay-active')||
   document.body.matches('.f4-denied,.f4-account-open')||
   Array.from(document.querySelectorAll(overlay)).some(n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden');
 }
 function hideIndicator(){
  indicator.hidden=true;indicator.removeAttribute('data-loading');indicator.style.removeProperty('--f4-pull-angle');
 }
 function reset(){gesture=null;if(!refreshing)hideIndicator();}
 function cancelReload(){refreshing=false;reset();}
 function noticeBusy(){showSessionNotice('Transaksi atau konten masih diproses.','Tutup',()=>{sessionNotice.hidden=true});}
 function canReload(){return !mountedContent?.canLeave||mountedContent.canLeave();}
 async function reloadDocument(root){
  if(!canReload()){reset();noticeBusy();return;}
  if(dirty.has(root)&&!window.confirm('Muat ulang halaman? Isian formulir yang belum disimpan dapat hilang.')){reset();return;}
  const url=location.href;
  refreshing=true;gesture=null;indicator.hidden=false;indicator.setAttribute('data-loading','');
  // Give the spinner a visible paint before initiating a native document reload.
  await Promise.all([afterPaint(),new Promise(resolve=>setTimeout(resolve,260))]);
  if(!refreshing||unavailable()||root!==shellScroll.element()||url!==location.href){cancelReload();return;}
  if(!canReload()){cancelReload();noticeBusy();return;}
  try{sessionStorage.setItem('f4-pull-reload',JSON.stringify({url:location.pathname+location.search+location.hash,at:Date.now()}));}catch{}
  try{location.reload();}catch(error){
   try{sessionStorage.removeItem('f4-pull-reload')}catch{}
   cancelReload();showSessionNotice('Halaman belum dapat dimuat ulang.','Tutup',()=>{sessionNotice.hidden=true});
  }
 }
 function nestedScroller(node,root){
  for(let n=node;n&&n!==root;n=n.parentElement){
   if(n.scrollHeight>n.clientHeight+2&&/^(auto|scroll)$/.test(getComputedStyle(n).overflowY))return true;
  }
  return false;
 }
 function markDirty(e){
  const node=e.target;
  if(!e.isTrusted||!node?.matches?.(editing)||node.matches('input[type="search"],input[type="button"],input[type="submit"],input[type="reset"]')||!node.closest('form'))return;
  const root=shellScroll.element();if(root.contains(node))dirty.add(root);
 }
 document.addEventListener('input',markDirty,true);
 document.addEventListener('change',markDirty,true);
 document.addEventListener('touchstart',e=>{
  reset();
  if(e.touches.length!==1||blocked())return;
  const root=shellScroll.element(),node=e.target?.nodeType===1?e.target:e.target?.parentElement;
  if(root===document.scrollingElement||root===document.documentElement||root.scrollTop>1||
    !/^(auto|scroll)$/.test(getComputedStyle(root).overflowY)||!node||!root.contains(node)||
    node.closest(editing)||nestedScroller(node,root))return;
  const t=e.touches[0];gesture={root,id:t.identifier,x:t.clientX,y:t.clientY,vertical:false,distance:0};
 },{capture:true,passive:true});
 document.addEventListener('touchmove',e=>{
  if(!gesture)return;
  const g=gesture;
  if(e.touches.length!==1||blocked()||g.root!==shellScroll.element()||g.root.scrollTop>1){reset();return}
  const t=e.touches[0];if(t.identifier!==g.id){reset();return}
  const dx=t.clientX-g.x,dy=t.clientY-g.y;
  if(!g.vertical){
   if(Math.max(Math.abs(dx),Math.abs(dy))<8)return;
   if(dy<=0||Math.abs(dx)>dy*.75){reset();return}
   g.vertical=true;
  }
  if(dy<=0||!e.cancelable){reset();return}
  e.preventDefault();g.distance=dy;
  indicator.hidden=false;indicator.style.setProperty('--f4-pull-angle',Math.min(1,dy/threshold)*360+'deg');
 },{capture:true,passive:false});
 document.addEventListener('touchend',e=>{
  const g=gesture;gesture=null;
  if(!g?.vertical||g.distance<threshold||e.touches.length||!Array.from(e.changedTouches).some(t=>t.identifier===g.id)||
    blocked()||g.root!==shellScroll.element()||g.root.scrollTop>1){reset();return;}
  void reloadDocument(g.root);
 },{capture:true,passive:true});
 document.addEventListener('touchcancel',reset,{capture:true,passive:true});
 document.addEventListener('f4:portal-changed',cancelReload);
 mobileFrame.addEventListener('change',cancelReload);
 window.addEventListener('pageshow',event=>{if(event.persisted)cancelReload();});
})();

window.addEventListener('popstate',()=>{
 const key=portalKey(location.pathname);
 if(key&&(key!==activePortalKey||key==='profile'))void navigatePortal(location.href,{pop:true});
});
document.addEventListener('click',event=>{
 const a=event.target?.closest?.('a[href]');
 if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target==='_blank'||a.hasAttribute('download'))return;
 const u=new URL(a.href,location.href);const key=portalKey(u.pathname);if(u.origin!==location.origin||!key||key==='donor'||(key===activePortalKey&&!a.hasAttribute('data-f4-portal-target')))return;
 event.preventDefault();void navigatePortal(u.href);
});
function openBankRoute(route){
 if(!session?.account)return;
 if(route==='profile'){openAccountProfile();return;}
 if(portal!=='bank'){void navigatePortal(paths.bank+'?halaman='+encodeURIComponent(route));return;}
 cancelBankNavigation();
 const accountId=session.account.id,requestedRole=role;
 function tryRoute(){
  if(!session?.account||session.account.id!==accountId||role!==requestedRole){cancelBankNavigation();return true}
  if(!document.body.classList.contains('f4-bank-app-private'))window.f4BankRevealPrivateForHistory?.();
  if(document.body.classList.contains('f4-bank-app-private')&&typeof window.goPage==='function'){
   cancelBankNavigation();window.goPage(route);return true;
  }
  return false;
 }
 if(tryRoute())return;
 // The verified account may arrive before the Bank Sampah view has mounted.
 // Wait for the original view, never reload the same document just to open a tab.
 bankNavigationObserver=new MutationObserver(tryRoute);
 bankNavigationObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 bankNavigationTimer=setTimeout(()=>{cancelBankNavigation();if(session?.account?.id===accountId)showSessionNotice('Halaman Bank Sampah belum siap.','Coba Lagi',()=>openBankRoute(route));},5000);
}
function openBookRoute(route){
 if(role!=='superadmin')return;
 if(portal==='book'&&typeof window.pilihMenu==='function'){window.pilihMenu(route);return;}
 void navigatePortal(paths.book+(route&&route!=='inputdata'?'?halaman='+encodeURIComponent(route):''));
}
function dockAction(key){
 if(!session?.account){
  const hintedRole=dock?.getRole();
  if(!sessionCheckCompleted&&hintedRole&&dock.allowed(hintedRole,key))queuedDockAction={key,role:hintedRole};
  return;
 }
 if(!dock?.allowed(role,key))return;
 if(key==='input'){
  if(portal==='bank'){openBankRoute('setoran');return;}
  if(portal==='book'){openBookRoute('input');return;}
  dock.toggleMenu();return;
 }
 closeDockMenu();
 if(key==='input-deposit'){openBankRoute('setoran');return}
 if(key==='input-iuran'){openBookRoute('input');return}
 if(key==='home'){
  if(portal==='portal'&&typeof window.f4PortalSelectPanel==='function'){window.f4PortalSelectPanel('beranda');dock?.refresh?.();return;}
  void navigatePortal(paths.portal);return;
 }
 if(role==='warga'&&['finance','agenda','profile'].includes(key)){
  void navigatePortal(paths[key]);return;
 }
 if(key==='book'){openBookRoute('inputdata');return;}
 if(key==='superadmin'){void navigatePortal(paths.superadmin);return;}
 const route={bank:'dashboard',deposit:'setoran',sale:'penjualan',payout:'bank-payout',history:'bank-history',report:role==='warga'?'bank-report':'laporan'}[key];
 if(route)openBankRoute(route);
}
let sessionCheckCompleted=false,sessionRetryTimer=null,sessionRetryCount=0;
// Only paint non-sensitive navigation labels before re-verifying the session.
if(dock?.getRole())login.hidden=true;
dock?.bind(dockAction);
let lastSessionRenewed=0,lastRenewAttempt=0,renewalPending=false;
const SESSION_RENEW_INTERVAL=15*60*1000;
const sessionChannel=typeof BroadcastChannel==='function'?new BroadcastChannel('f4-session'):null;
const sessionNotice=el('aside');sessionNotice.id='f4-session-notice';
sessionNotice.hidden=true;sessionNotice.setAttribute('role','status');
const sessionNoticeText=el('span'),sessionNoticeAction=el('button'),sessionNoticeClose=el('button');
sessionNoticeAction.type='button';
sessionNoticeClose.type='button';sessionNoticeClose.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';sessionNoticeClose.setAttribute('aria-label','Tutup pemberitahuan');
sessionNoticeClose.onclick=()=>{sessionNotice.hidden=true};
sessionNotice.append(sessionNoticeText,sessionNoticeAction,sessionNoticeClose);
document.body.append(sessionNotice);
const sessionNoticeStyle=document.createElement('style');sessionNoticeStyle.dataset.f4Persistent='shell';
sessionNoticeStyle.textContent='#f4-session-notice:not([hidden]){position:fixed;right:14px;bottom:18px;z-index:10010;display:flex;align-items:center;gap:12px;max-width:min(460px,calc(100vw - 28px));padding:12px 14px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;color:#22344b;box-shadow:0 8px 30px #0f172a26;font:13px/1.4 system-ui,sans-serif}#f4-session-notice span{flex:1;min-width:0}#f4-session-notice button{font:inherit;cursor:pointer;border:1px solid #cbd5e1;border-radius:8px;background:#eef2ff;color:#312e81;padding:6px 8px;white-space:nowrap}#f4-session-notice button:last-child{border:0;background:transparent;color:#475569;font-size:20px;padding:2px 4px}';
document.head.append(sessionNoticeStyle);
function showSessionNotice(message,actionLabel,action){
 sessionNoticeText.textContent=message;
 sessionNoticeAction.textContent=actionLabel;
 sessionNoticeAction.onclick=action;
 sessionNotice.hidden=false;
}
function clearSessionRetry(){
 if(sessionRetryTimer){clearTimeout(sessionRetryTimer);sessionRetryTimer=null}
 sessionRetryCount=0;
}
function scheduleSessionRetry(){
 if(sessionRetryTimer)return;
 const delay=Math.min(60000,6000*Math.pow(2,Math.min(sessionRetryCount++,4)));
 sessionRetryTimer=setTimeout(()=>{sessionRetryTimer=null;void refreshSession()},delay);
}
async function api(path,options){
 const r=await fetch(API+path,{credentials:'include',cache:'no-store',...options});
 const d=await r.json().catch(()=>({}));
 if(!r.ok||d.ok===false){
  const error=new Error(d.error||'HTTP '+r.status);
  error.status=r.status;
  throw error;
 }
 return d;
}
function notifyRole(){
 syncPageMenu();
 syncResidentSide();
 syncAccountMenu();
 if(portal==='bank'||portal==='portal'||activePortalKey==='dokumentasi'||residentKeys.includes(activePortalKey)){
  const member=session?.member||{};
  const data={type:'f4:demo-role',role,identity:{accountId:session?.account?.id||'',nama:session?.account?.displayName||member.nama||session?.account?.username||'',rumah:member.rumah||'',wargaId:member.id||''}};
  if(portal==='portal'||activePortalKey==='dokumentasi'||residentKeys.includes(activePortalKey))window.dispatchEvent(new MessageEvent('message',{data,origin:location.origin,source:window}));
  else window.postMessage(data,location.origin);
 }
}
function displayAccountName(){return String(session?.account?.displayName||session?.member?.nama||session?.account?.username||'Pengguna')}
function residentGreetingName(raw){
 const full=String(raw||'').trim().replace(/\s+/g,' ');
 if(!full)return 'Anggota';
 if(/^(?:nama (?:warga|anggota) (?:belum|tidak) tersedia|warga (?:tidak|belum) tersedia|anggota(?: bank sampah)?|—)$/i.test(full))return full;
 const words=full.split(' ');let title='Pak';
 while(words.length&&/^(?:pak|bapak|bpk|bp|bu|ibu)\.?$/i.test(words[0])){
  if(/^(?:bu|ibu)\.?$/i.test(words[0]))title='Bu';
  words.shift();
 }
 return words.length?title+' '+words[0]:full;
}
function updateAccountIdentity(){
 const name=displayAccountName();
 const show=Boolean(session?.account)&&['warga','admin','superadmin'].includes(role);
 identity.hidden=!show;
 const greeting=show?'Halo, '+(role==='warga'?residentGreetingName(name):name):'';
 identityName.textContent=greeting;identityName.title=greeting;
 menuName.textContent=name+' · '+(role==='warga'?'Anggota':role==='superadmin'?'Superadmin':role==='admin'?'Admin':role==='donatur'?'Donatur':'Publik');
 avatar.title=name;avatar.setAttribute('aria-label','Buka menu akun: '+name);
}
window.addEventListener('f4-account-profile-updated',event=>{
 const nama=String(event.detail?.nama||'').trim();
 if(!session?.account||!nama)return;
 session.account.displayName=nama;updateAccountIdentity();notifyRole();
});
window.f4RefreshDirectAvatar=()=>avatarLoad();
function avatarLoad(){
 const img=el('img');img.alt='Foto profil';img.width=40;img.height=40;img.src=API+'/api/member/avatar?v='+Date.now();
 img.onerror=()=>{avatar.innerHTML=svg('user')};avatar.replaceChildren(img);
}
async function refreshSession(){
 const previousAccountId=session?.account?.id||null;
 let verified;
 try{
  verified=await api('/api/v2/auth/session');
  session=verified;
  sessionCheckCompleted=true;
  clearSessionRetry();
  sessionNotice.hidden=true;
  // A different user logged in from another tab of this browser.
  // Reload once to avoid retaining any data belonging to the prior account.
  if(previousAccountId&&verified.account?.id&&previousAccountId!==verified.account.id){
   location.reload();return;
  }
 }catch(error){
  if(error.status!==401){
   showSessionNotice('Koneksi ke server terganggu. Sesi tidak dihapus; pemeriksaan akan dicoba lagi.','Coba Lagi',()=>{void refreshSession()});
   scheduleSessionRetry();
   // Do not turn an authenticated account into a guest on a transient failure.
   // On first load keep protected pages pending until the server responds.
   if(!sessionCheckCompleted){
    queuedDockAction=null;updateSharedDock('');
    // Public Bank Sampah must not be trapped behind the startup overlay
    // when the first session request times out. Reveal only PUBLIC data;
    // keep retrying and restore the verified account on reconnect.
    if(portal==='bank'){
     login.hidden=false;
     if(document.documentElement.classList.contains('f4-bank-auth-pending'))notifyRole();
    }else{
     login.hidden=true;
     if(portal==='book'||portal==='superadmin')document.documentElement.classList.add('f4-auth-pending');
    }
   }
   return;
  }
  const wasSignedIn=!!session?.account;
  session=null;
  sessionCheckCompleted=true;
  clearSessionRetry();
  if(wasSignedIn){
   showSessionNotice('Sesi login telah berakhir. Silakan login kembali.','Login',openLogin);
  }else{
   sessionNotice.hidden=true;
  }
 }
 role=String(session?.account?.role||'public').toLowerCase();
 if(role==='anggota')role='warga';
 const authed=!!session?.account;
 const tagAccount=authed&&['warga','admin','superadmin'].includes(role)?String(session.account.id||''):'';
 if(avatar.dataset.f4TagRole!==role)avatar.dataset.f4TagRole=role;
 if(avatar.dataset.f4TagAccount!==tagAccount)avatar.dataset.f4TagAccount=tagAccount;
 login.hidden=authed;avatar.hidden=!authed;bookLink.hidden=role!=='superadmin';adminLink.hidden=role!=='superadmin';donorLink.hidden=role!=='donatur';
 updateAccountIdentity();rememberDockHint(authed?role:'');updateSharedDock();
 syncAccountMenu();
 if(authed&&role!=='donatur')avatarLoad();
 notifyRole();
 if(portal==='book'||portal==='superadmin'){
  if(role!=='superadmin'){
   document.body.classList.add('f4-denied');
   gate.hidden=false;
   gate.replaceChildren();
   gate.setAttribute('role','main');
   gate.setAttribute('aria-label','Akses ditolak');
   const panel=el('section','f4-access-denied-panel');
   const symbol=el('div','f4-access-denied-symbol');
   symbol.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v5M12 17h.01"/></svg>';
   const heading=el('h1');
   heading.textContent='Akses Ditolak';
   const message=el('p');
   message.textContent='Portal '+(portal==='book'?'Pembukuan':'Superadmin')+' hanya dapat diakses oleh akun Superadmin yang memiliki izin.';
   const info=el('p','f4-access-denied-hint');
   info.textContent=authed?'Akun yang sedang digunakan tidak memiliki akses ke halaman ini.':'Silakan masuk melalui Portal Utama menggunakan akun yang memiliki izin.';
   const back=el('a','f4-access-denied-back');
   back.href='/';back.textContent='Kembali ke Portal Utama';
   panel.append(symbol,heading,message,info,back);
   gate.appendChild(panel);
  }else{
   document.body.classList.remove('f4-denied');gate.hidden=true;gate.replaceChildren();
  }
 }
 document.documentElement.classList.remove('f4-auth-pending');
 const queued=queuedDockAction;queuedDockAction=null;
 if(queued&&authed&&queued.role===role&&!document.body.classList.contains('f4-denied')){
  dockAction(queued.key);
 }
}
dialog.querySelector('form').addEventListener('submit',async e=>{
 e.preventDefault();const b=dialog.querySelector('[type=submit]');const status=dialog.querySelector('#f4-direct-login-error');
 b.disabled=true;status.textContent='';
 try{
  await api('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:dialog.querySelector('#f4-direct-username').value.trim(),password:dialog.querySelector('#f4-direct-password').value})});
  closeLogin();lastSessionRenewed=Date.now();await refreshSession();
  sessionChannel?.postMessage({type:'login'});
  if(portal==='book'||portal==='superadmin')location.reload();
 }catch(err){status.textContent='Login gagal: '+err.message}
 finally{b.disabled=false;dialog.querySelector('#f4-direct-password').value=''}
});
avatar.onclick=()=>{menu.hidden=!menu.hidden};
function syncAccountMenu(){
 socialProfile.hidden=!(sessionCheckCompleted&&session?.account&&role==='warga');
 settings.textContent=role==='donatur'?'Dashboard Donatur':role==='warga'?'Pengaturan Akun':['admin','superadmin'].includes(role)?'Profil Pengurus':'Kartu & Profil';
}
socialProfile.onclick=()=>{menu.hidden=true;if(canAccessPortal('profile')&&role==='warga')void navigatePortal(paths.profile);};
function openAccountProfile(){
 menu.hidden=true;
 if(role==='donatur'){location.assign(paths.donor);return}
 if(!session?.account){openLogin();return}
 if(!['warga','admin','superadmin'].includes(role))return;
 void navigatePortal(paths.profile+'?halaman=edit');
}
window.f4OpenAccountProfile=openAccountProfile;
settings.onclick=openAccountProfile;
logout.onclick=async()=>{
 menu.hidden=true;
 try{await api('/api/auth/logout',{method:'POST'})}
 catch(e){
  if(e.status!==401){if(window.f4UiDialog)await window.f4UiDialog.alert('Gagal keluar: '+e.message);else alert('Gagal keluar: '+e.message);return}
 }
 sessionChannel?.postMessage({type:'logout'});
 cancelBankNavigation();session=null;role='public';avatar.dataset.f4TagAccount='';queuedDockAction=null;rememberDockHint('');updateAccountIdentity();updateSharedDock();
 if(portal==='book'||portal==='superadmin'){location.assign(shellUrl('/'));return}
 window.f4CloseUnifiedAccount?.();await refreshSession();
 if(residentKeys.includes(activePortalKey))void navigatePortal(paths.portal,{replace:true});
};
// Change-password already revokes sessions and clears the cookie on the Worker.
 // Sync the browser to the now-public session; a second /auth/logout returns 401.
async function syncAfterSessionRevoked(share=true){
 if(share)sessionChannel?.postMessage({type:'logout'});
 menu.hidden=true;
 closeLogin();
 cancelBankNavigation();session=null;role='public';avatar.dataset.f4TagAccount='';queuedDockAction=null;rememberDockHint('');updateAccountIdentity();updateSharedDock();
 await refreshSession();
 if(portal==='book'||portal==='superadmin')location.replace(shellUrl('/'));
 else if(residentKeys.includes(activePortalKey))void navigatePortal(paths.portal,{replace:true});
}
window.addEventListener('f4-account-password-updated',()=>{void syncAfterSessionRevoked()});
if(sessionChannel)sessionChannel.onmessage=event=>{
 const type=event.data?.type;
 if(type==='logout'){
  // Cookie is shared across tabs on one browser, but not across devices.
  void syncAfterSessionRevoked(false);
 }else if(type==='login'){
  void refreshSession();
 }
};
async function renewActiveSession(){
 if(!session?.account||renewalPending||document.visibilityState==='hidden')return;
 const now=Date.now();
 if(now-lastSessionRenewed<SESSION_RENEW_INTERVAL||now-lastRenewAttempt<60000)return;
 lastRenewAttempt=now;
 renewalPending=true;
 try{
  await api('/api/v2/auth/renew',{method:'POST'});
  lastSessionRenewed=Date.now();
  sessionNotice.hidden=true;
 }catch(error){
  if(error.status===401){
   await refreshSession();
  }else{
   showSessionNotice('Koneksi ke server terganggu. Sesi tetap dipertahankan; akan dicoba lagi.','Coba Lagi',()=>{void refreshSession()});
   scheduleSessionRetry();
  }
 }finally{renewalPending=false}
}
const noteUserActivity=()=>{void renewActiveSession()};
document.addEventListener('pointerdown',noteUserActivity,{passive:true});
document.addEventListener('keydown',noteUserActivity);
document.addEventListener('scroll',noteUserActivity,{capture:true,passive:true});
document.addEventListener('touchstart',noteUserActivity,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')noteUserActivity()});
window.addEventListener('online',()=>{void refreshSession()});
document.addEventListener('pointerdown',e=>{if(!bar.contains(e.target))menu.hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;closeLogin()}});
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==window||!e.data)return;
 const data=e.data;
 if(data.type==='f4:auth-changed'){void syncAfterSessionRevoked()}
 if(data.type==='f4:logout-request'){logout.click()}
 if(data.type==='f4:show-login')openLogin();
 if(data.type==='f4:bank-avatar-updated')avatarLoad();
 if(data.type==='f4:go-portal'||data.type==='f4:navigate'){
  const target=data.portal||data.target;
  if(Object.hasOwn(paths,target))void navigatePortal(paths[target]);
 }
 if(data.type==='f4:manage-home')void navigatePortal(paths.superadmin);
 if(data.type==='f4:portal-visible-panel'&&portal==='portal'){highlight(data.panel);dock?.refresh?.();}
});
function makePortalSide(){
 if(portal!=='portal'&&portal!=='simple')return;
 const side=el('aside');side.id='f4-direct-sidebar';
 const brand=el('div','f4-direct-brand');
 const logo=el('img');logo.src='https://flamboyan4.web.id/assets/logo-flamboyan.svg?v=official-20261027-v2';logo.alt='Logo Flamboyan 4';
 const brandName=el('div');const h=el('h2');h.textContent='Portal Utama';
 const sub=el('small');sub.textContent='Flamboyan 4';brandName.append(h,sub);brand.append(logo,brandName);side.append(brand);
 const groupHead=el('div','f4-direct-group-label');groupHead.textContent='MENU';side.append(groupHead);
 // Dokumentasi and Inventaris are two tabs of the same page.
 // Payments remain in the shortcut; Rapat belongs to the shared navbar.
 const items=[
  ['beranda','Beranda','home'],['keuangan','Kas Warga','cash'],['projek','Projek','project'],
  ['kalender','Kalender','calendar'],['komentar','Obrolan','message'],
  ['dokumentasi','Dokumentasi','image'],['inventaris','Inventaris','inventory'],
  ['finance','Keuangan Saya','pay'],['agenda','Agenda','clock'],['profile','Profil Saya','user']
 ];
 for(const [key,label,iconName] of items){
  if(key==='dokumentasi'){const group=el('div','f4-direct-group-label f4-direct-other-pages');group.textContent='LAINNYA';side.append(group);}
  if(key==='finance'){const group=el('div','f4-direct-group-label f4-direct-other-pages');group.textContent='AKUN WARGA';group.dataset.f4ResidentSide='';group.hidden=true;side.append(group);}
  const b=el('button');b.type='button';b.dataset.f4Panel=key;
  if(residentKeys.includes(key)){b.dataset.f4ResidentSide='';b.hidden=true;}
  if(key==='keuangan'){b.hidden=true;b.classList.add('hidden');}
  b.innerHTML=svg(iconName);
  b.setAttribute('aria-label',label);
  const labelEl=el('span','f4-direct-menu-label');labelEl.textContent=label;b.append(labelEl);
  b.addEventListener('click',()=>{
   closeSide();
   if(residentKeys.includes(key)){if(canAccessPortal(key))void navigatePortal(paths[key]);return;}
   if(key==='dokumentasi'||key==='inventaris'){
    const inv=key==='inventaris';
    if(activePortalKey==='dokumentasi'){
     const tab=document.getElementById(inv?'media-tab-inventory':'media-tab-albums');
     if(tab){tab.click();highlight(key);shellScroll.scrollTo({top:0,behavior:'instant'});return}
    }
    void navigatePortal(paths.dokumentasi+(inv?'?halaman=inventaris':''));return;
   }
   if(portal==='simple'){void navigatePortal('/?halaman='+encodeURIComponent(key==='keuangan'?'kas-warga':key));return}
   try{window.f4PortalSelectPanel?.(key==='keuangan'?'kas-warga':key)}catch(err){console.warn('Panel:',err)}
   highlight(key);
  });
  side.append(b);
 }
 document.body.append(side);
 const backdrop=el('button');backdrop.id='f4-direct-sideback';backdrop.type='button';backdrop.hidden=true;
 backdrop.setAttribute('aria-label','Tutup menu');backdrop.onclick=closeSide;document.body.append(backdrop);
 syncResidentSide();
 highlight(residentKeys.includes(activePortalKey)?activePortalKey:activePortalKey==='dokumentasi'?(new URLSearchParams(location.search).get('halaman')==='inventaris'?'inventaris':'dokumentasi'):portal==='portal'?'beranda':'');
}
function syncResidentSide(){
 const allowed=sessionCheckCompleted&&!!session?.account&&role==='warga';
 document.querySelectorAll('#f4-direct-sidebar [data-f4-resident-side]').forEach(node=>{node.hidden=!allowed});
}
function highlight(key){document.querySelectorAll('#f4-direct-sidebar [data-f4-panel]').forEach(x=>x.setAttribute('aria-current',x.dataset.f4Panel===key?'page':'false'))}
 document.addEventListener('f4:documentation-tab',event=>{if(activePortalKey==='dokumentasi')highlight(event.detail==='inventaris'?'inventaris':'dokumentasi')});
function closeSide(){document.querySelector('#f4-direct-sidebar')?.classList.remove('f4-open');const b=document.getElementById('f4-direct-sideback');if(b)b.hidden=true;hamburger.setAttribute('aria-expanded','false')}
hamburger.addEventListener('click',()=>{
 if(portal==='portal'||portal==='simple'){
  const side=document.getElementById('f4-direct-sidebar');if(!side){location.assign(shellUrl('/'));return}
  const opened=side.classList.toggle('f4-open');document.getElementById('f4-direct-sideback').hidden=!opened;hamburger.setAttribute('aria-expanded',String(opened));
 }else if(portal==='bank'){
  if(window.f4BankHandleNavbarMenu?.())return;
  // Verified private accounts must never open the legacy public menu during mounting.
  if(role==='admin'||role==='superadmin'||role==='warga')return;
  window.f4ToggleBankMenu?.();
 }
 else if(portal==='book'){const opened=document.getElementById('side-drawer')?.classList.contains('open');if(opened)window.tutupMenu?.();else window.bukaMenu?.();hamburger.setAttribute('aria-expanded',String(!opened));}
 else if(portal==='superadmin')window.f4ToggleSuperadminMenu?.();
});
makePortalSide();
if(portal==='portal'){
 // Align the real scroll order of Kalender before Inventaris, without
 // rebuilding the existing forms, cards or their event listeners.
 const calendarSection=document.getElementById('rencana');
 const inventorySection=document.getElementById('kegiatan');
 if(calendarSection&&inventorySection&&calendarSection.parentElement===inventorySection.parentElement)
   inventorySection.before(calendarSection);
}
// Utility bar is transparent at the top and becomes solid when scrolling.
// Bank memakai header solid, tanpa render ulang untuk setiap scroll.
const syncBarScroll=()=>bar.classList.toggle('f4-scrolled',portal!=='bank'&&shellScroll.y>12);
window.addEventListener('scroll',syncBarScroll,{passive:true});
document.addEventListener('f4:portal-changed',syncBarScroll);
syncBarScroll();
// Existing original page integration uses direct window messages instead of parent iframe.
if(portal==='portal'){
 window.f4GoBank=()=>navigatePortal(paths.bank);
 const original=window.openModalDokumentasi;
 if(typeof original==='function')window.openModalDokumentasi=()=>navigatePortal(paths.dokumentasi);
}
if(portal==='bank'){
 const old=window.v11ShowLogin;
 window.v11ShowLogin=()=>openLogin();
}
const legacy=new URLSearchParams(location.search).get('halaman');
if(initialKey==='bank'&&legacy==='profile'){location.replace(shellUrl(paths.profile+'?halaman=edit'));return;}
if(initialKey==='dokumentasi'&&legacy==='profil'){location.replace(shellUrl(paths.profile));return;}
if(portal==='portal'&&legacy){
 const key=String(legacy).split('/')[0];
 if(key==='bank-sampah'||key==='pembukuan'||key==='superadmin'||key==='rapat'||key==='dokumentasi'||key==='inventaris'){
  const destination=key==='bank-sampah'?paths.bank:key==='pembukuan'?paths.book:key==='superadmin'?paths.superadmin:key==='inventaris'?'/dokumentasi/?halaman=inventaris':paths[key];
  const docId=key==='rapat'?new URLSearchParams(location.search).get('doc'):null;
  location.replace(shellUrl(docId?destination+'?doc='+encodeURIComponent(docId):destination));
  return;
 }
 if(['beranda','keuangan','kas-warga','projek','kalender','arisan','pembayaran','komentar'].includes(key)){
  window.addEventListener('load',()=>window.f4PortalSelectPanel?.(key,false),{once:true});
 }
}
try{sessionStorage.removeItem('f4-native-account-refresh')}catch{}
window.F4PortalNavigation.initialSession=refreshSession().then(()=>{
 if(location.hash==='#akun'){
  history.replaceState(history.state,'',location.pathname+location.search);
  if(role!=='public')openAccountProfile();
 }
});
/* Pair search and reload in native search toolbars on every portal.
   Preserve original input and button listeners; only move their DOM nodes. */
(()=>{
 const css=document.createElement('style');css.id='f4-search-reload-layout';
 css.textContent=[
  '.f4-inline-search-refresh{display:flex;align-items:center;gap:8px;flex:1 1 230px;min-width:0;max-width:100%;width:auto}',
  '.f4-inline-search-refresh>input{flex:1 1 auto;width:100%;min-width:0;max-width:none;margin:0}',
  '.f4-inline-search-refresh>.f4-search-refresh-button{display:inline-flex;align-items:center;justify-content:center;flex:0 0 42px;width:42px;min-width:42px;max-width:42px;height:42px;min-height:42px;max-height:42px;padding:0;margin:0;border-radius:11px;line-height:1}',
  '.f4-inline-search-refresh>.f4-search-refresh-button .f4-action-symbol{display:grid;place-items:center;width:100%;height:100%;margin:0;padding:0}',
  '.f4-inline-search-refresh>.f4-search-refresh-button svg{display:block;width:20px;height:20px;margin:auto}',
  '.f4-inline-search-refresh>.f4-search-refresh-button .f4-action-label{display:none}',
  '@media(max-width:760px){#f4-account-page .f4-admin-controls:has(.f4-inline-search-refresh),#f4-account-page .sa-controls:has(.f4-inline-search-refresh){display:flex;flex-wrap:wrap;align-items:center;gap:8px}#f4-account-page .f4-inline-search-refresh{flex:1 1 100%;width:100%}#f4-account-page .sa-account-filters .f4-inline-search-refresh{flex:1 1 100%}#f4-account-page .sa-account-filters select{flex:1 1 100%;max-width:none}}'
 ].join('\n');
 css.textContent+=[
  'button.f4-global-refresh{display:inline-grid;place-items:center;flex:0 0 42px;width:42px;min-width:42px;max-width:42px;height:42px;min-height:42px;max-height:42px;padding:0;margin:0;border-radius:10px;line-height:1;vertical-align:middle}',
  'button.f4-global-refresh>svg{display:block;width:20px;height:20px;max-width:20px;max-height:20px;margin:0;padding:0;fill:none;stroke:currentColor}',
  'button.f4-global-refresh>.f4-refresh-label{display:none}',
  '@media(max-width:760px){button.f4-global-refresh{flex-basis:40px;width:40px;min-width:40px;max-width:40px;height:40px;min-height:40px;max-height:40px}}'
 ].join('\n');
 document.head.append(css);
 const containers='.f4-admin-controls,.sa-controls,.sa-resident-controls,.sa-account-filters,.search-toolbar,.search-bar,.filter-bar,.f4-search-controls,.toolbar';
 function enhance(){
  document.querySelectorAll(containers).forEach(bar=>{
   if(bar.closest('.f4-inline-search-refresh'))return;
   const children=[...bar.children],search=children.find(node=>
    node.matches?.('input:not([type="hidden"])')&&
    /cari|search|filter/i.test([node.placeholder,node.getAttribute('aria-label'),node.type].join(' ')));
   if(!search)return;
   const reload=children.find(node=>node.matches?.('button')&&
    /muat\s*ulang|perbarui|refresh/i.test([node.textContent,node.title,node.getAttribute('aria-label'),node.dataset.f4ActionOriginal].join(' ')));
   if(!reload)return;
   const pair=document.createElement('div');pair.className='f4-inline-search-refresh';
   bar.insertBefore(pair,search);
   pair.append(search,reload);
   reload.classList.add('f4-search-refresh-button');
   reload.setAttribute('aria-label',reload.getAttribute('aria-label')||reload.title||'Muat ulang');
   reload.title=reload.title||'Muat ulang';
   if(!reload.querySelector('svg')){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2');
    svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
    svg.setAttribute('aria-hidden','true');
    svg.innerHTML='<path d="M20 11a8 8 0 1 0-2.1 5.5"/><path d="M20 4v7h-7"/>';
    const symbol=document.createElement('span');symbol.className='f4-action-symbol';symbol.append(svg);
    const label=document.createElement('span');label.className='f4-action-label';label.textContent=reload.textContent.trim()||'Muat ulang';
    reload.replaceChildren(symbol,label);reload.classList.add('f4-icon-action');
   }
  });
  // Icon-only Muat ulang/Perbarui in all three portals, without altering callbacks.
  document.querySelectorAll('button').forEach(button=>{
   if(button.dataset.f4RefreshIconified==='1')return;
   const label=String(button.dataset.f4ActionOriginal||button.textContent||'').trim();
   if(!/^(muat\s*ulang|perbarui|refresh)$/i.test(label))return;
   button.dataset.f4RefreshIconified='1';
   button.setAttribute('aria-label',label);button.title=label;
   button.classList.remove('f4-icon-action');button.classList.add('f4-global-refresh');
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');
   svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2');
   svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
   svg.setAttribute('aria-hidden','true');
   svg.innerHTML='<path d="M20 11a8 8 0 1 0-2.1 5.5"/><path d="M20 4v7h-7"/>';
   const caption=document.createElement('span');caption.className='f4-refresh-label';caption.textContent=label;
   button.replaceChildren(svg,caption);
  });
 }
 let scheduled=false;
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 new MutationObserver(mutations=>{
  if(mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&
   (n.matches?.(containers)||n.querySelector?.(containers)||n.matches?.('button')||n.querySelector?.('button')))))schedule();
 }).observe(document.body,{childList:true,subtree:true});
})();

})();