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
const settings=el('button');settings.type='button';settings.textContent='Pengaturan Akun';settings.dataset.accountAction='settings';
const logout=el('button');logout.type='button';logout.textContent='Keluar';logout.dataset.accountAction='logout';
menu.append(menuName,settings,logout);
const identity=el('div','f4-direct-identity');identity.id='f4-direct-identity';identity.hidden=true;
const identityName=el('strong');identity.append(identityName);
bar.append(hamburger,identity,links,login,avatar,menu);document.body.prepend(bar);
// Persistent loading surface; navbar and dock are never replaced.
const routeLoading=el('div');routeLoading.id='f4-route-loading';routeLoading.dataset.f4Persistent='shell';routeLoading.hidden=true;
routeLoading.setAttribute('role','status');routeLoading.setAttribute('aria-live','polite');
routeLoading.innerHTML='<span class="f4-route-loading-indicator"><span class="f4-route-spinner" aria-hidden="true"></span><span>Memuat halaman…</span></span>';
document.body.append(routeLoading);
const swapFallback=el('div');swapFallback.id='f4-swap-fallback';swapFallback.dataset.f4Persistent='shell';swapFallback.setAttribute('aria-hidden','true');swapFallback.textContent='Memuat halaman…';document.body.append(swapFallback);
// Shared resident notification component for all native portals.
const notificationStyle=el('link');notificationStyle.dataset.f4Persistent='shell';notificationStyle.rel='stylesheet';notificationStyle.href='/portal-live/gallery-tag-notifications.css?v=20261126-single-notification-v1';document.head.append(notificationStyle);
const notificationScript=el('script');notificationScript.src='/portal-live/gallery-tag-notifications.js?v=20261127-first-paint-v5';document.head.append(notificationScript);
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
function updateSharedDock(next=session?.account&&validDockRole(role)?role:''){dock?.update(next)}
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
 Promise.resolve(ready).catch(()=>{}).then(afterPaint).finally(()=>{if(token===viewSequence){document.documentElement.removeAttribute('data-f4-swapping');routeLoading.hidden=true}});
}
function canAccessPortal(key){
 if(key==='book'||key==='superadmin')return sessionCheckCompleted&&!!session?.account&&role==='superadmin';
 if(key==='donor')return sessionCheckCompleted&&!!session?.account&&role==='donatur';
 if(residentKeys.includes(key))return sessionCheckCompleted&&!!session?.account&&role==='warga';
 return ['portal','bank','rapat','dokumentasi'].includes(key);
}
function updatePortalChrome(key){
 activePortalKey=key;
 portal=['rapat','dokumentasi',...residentKeys].includes(key)?'simple':key;
 document.documentElement.dataset.f4Shell=portal;
 applyPortalTheme(portal);hamburger.removeAttribute('aria-controls');hamburger.setAttribute('aria-expanded','false');syncPageMenu();dock?.setPortal(residentKeys.includes(key)?key:portal);updateSharedDock();if(sessionCheckCompleted)document.documentElement.classList.remove('f4-auth-pending');
 for(const a of links.querySelectorAll('[data-f4-portal-target]'))a.classList.toggle('f4-selected',a.dataset.f4PortalTarget===(portal==='simple'?'portal':key));
 settings.textContent=role==='donatur'?'Dashboard Donatur':role==='warga'?'Kartu & Profil': ['admin','superadmin'].includes(role)?'Profil Pengurus':'Kartu & Profil';
 document.getElementById('f4-direct-sidebar')?.remove();document.getElementById('f4-direct-sideback')?.remove();makePortalSide();
 document.dispatchEvent(new CustomEvent('f4:portal-changed',{detail:{key,portal}}));
}
async function navigatePortal(path,{replace=false,pop=false}={}){
 let target=new URL(path,location.origin);
 if(target.origin===location.origin&&portalKey(target.pathname)==='dokumentasi'&&target.searchParams.get('halaman')==='profil')target=new URL(paths.profile,location.origin);
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
  if(residentKeys.includes(key)){dock?.refresh?.();return true;}
  if(key==='portal'&&typeof window.f4PortalSelectPanel==='function'&&(!route||['beranda','keuangan','kas-warga','projek','kalender','arisan','pembayaran','komentar'].includes(route))){
   window.f4PortalSelectPanel(route||'beranda',!pop);dock?.refresh?.();return true;
  }
  if(key==='bank'&&session?.account&&['dashboard','profile','setoran','penjualan','bank-payout','bank-history','bank-report','laporan'].includes(route||'dashboard')){openBankRoute(route||'dashboard');return true}
  if(key==='book'&&typeof window.pilihMenu==='function'&&(!route||['monitor','inputdata','input','transaksi','kas','pinjaman','importbulk','talangan','denda','laporan','riwayat','dashboard','rumah','warga','config'].includes(route))){window.pilihMenu(route||'inputdata');return true}
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
  history[replace||pop?'replaceState':'pushState']({f4PortalKey:key},'',target.pathname+target.search+target.hash);
  await prepared.mount();mountedContent=prepared;if(!stillAllowed()){location.replace(shellUrl('/'));return false;}rememberActiveUrl();window.scrollTo({top:0,left:0,behavior:'instant'});return true;
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
window.addEventListener('popstate',()=>{
 const key=portalKey(location.pathname);
 if(key&&key!==activePortalKey)void navigatePortal(location.href,{pop:true});
});
document.addEventListener('click',event=>{
 const a=event.target?.closest?.('a[href]');
 if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target==='_blank'||a.hasAttribute('download'))return;
 const u=new URL(a.href,location.href);const key=portalKey(u.pathname);if(u.origin!==location.origin||!key||key==='donor'||(key===activePortalKey&&!a.hasAttribute('data-f4-portal-target')))return;
 event.preventDefault();void navigatePortal(u.href);
});
function openBankRoute(route){
 if(!session?.account)return;
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
 void navigatePortal(paths.book+(route==='input'?'?halaman=input':''));
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
 settings.textContent=role==='donatur'?'Dashboard Donatur':role==='warga'?'Kartu & Profil': ['admin','superadmin'].includes(role)?'Profil Pengurus':'Kartu & Profil';
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
function openAccountProfile(){
 menu.hidden=true;
 if(role==='donatur'){location.assign(paths.donor);return}
 if(!session?.account){openLogin();return}
 if(!['warga','admin','superadmin'].includes(role))return;
 if(portal==='bank'&&typeof window.f4OpenBankProfile==='function'){window.f4OpenBankProfile();return}
 openBankRoute('profile');
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
 // The scrolling sections must appear in the same sequence as the sidebar.
 // Rapat and Dokumentasi are separate pages, kept in their own group.
 const items=[
  ['beranda','Beranda','home'],['keuangan','Kas Warga','cash'],['projek','Projek','project'],
  ['kalender','Kalender','calendar'],['inventaris','Inventaris','inventory'],
  ['komentar','Obrolan','message'],['pembayaran','Pembayaran','pay'],
  ['dokumentasi','Dokumentasi','image'],['rapat','Rapat','meeting']
 ];
 for(const [key,label,iconName] of items){
  if(key==='dokumentasi'){const group=el('div','f4-direct-group-label f4-direct-other-pages');group.textContent='LAINNYA';side.append(group);}
  const b=el('button');b.type='button';b.dataset.f4Panel=key;
  if(key==='keuangan'){b.hidden=true;b.classList.add('hidden');}
  b.innerHTML=svg(iconName);
  b.setAttribute('aria-label',label);
  const labelEl=el('span','f4-direct-menu-label');labelEl.textContent=label;b.append(labelEl);
  b.addEventListener('click',()=>{
   closeSide();
   if(key==='rapat'||key==='dokumentasi'){void navigatePortal(paths[key]);return}
   if(portal==='simple'){void navigatePortal('/?halaman='+encodeURIComponent(key==='keuangan'?'kas-warga':key));return}
   if(key==='inventaris'){
    const target=document.getElementById('kegiatan');
    if(target)window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-74),behavior:'smooth'});
    else void navigatePortal('/dokumentasi/?halaman=inventaris');
    highlight(key);return;
   }
   try{window.f4PortalSelectPanel?.(key==='keuangan'?'kas-warga':key)}catch(err){console.warn('Panel:',err)}
   highlight(key);
  });
  side.append(b);
 }
 document.body.append(side);
 const backdrop=el('button');backdrop.id='f4-direct-sideback';backdrop.type='button';backdrop.hidden=true;
 backdrop.setAttribute('aria-label','Tutup menu');backdrop.onclick=closeSide;document.body.append(backdrop);
 highlight(residentKeys.includes(activePortalKey)?'':portal==='simple'?(activePortalKey==='rapat'?'rapat':'dokumentasi'):'beranda');
}
function highlight(key){document.querySelectorAll('#f4-direct-sidebar [data-f4-panel]').forEach(x=>x.setAttribute('aria-current',x.dataset.f4Panel===key?'page':'false'))}
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
 else if(portal==='book')window.bukaMenu?.();
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
const syncBarScroll=()=>bar.classList.toggle('f4-scrolled',portal!=='bank'&&window.scrollY>12);
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