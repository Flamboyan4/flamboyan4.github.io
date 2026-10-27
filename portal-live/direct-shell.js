/* Flamboyan 4 — native navigation and shared Cloudflare session, no portal iframe. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id';
const paths={portal:'/',bank:'/bank-sampah/',book:'/pembukuan/',superadmin:'/superadmin/',rapat:'/rapat/',dokumentasi:'/dokumentasi/'};
const pathname=location.pathname;
const portal=pathname==='/bank-sampah/'?'bank':pathname==='/pembukuan/'?'book':pathname==='/superadmin/'?'superadmin':pathname==='/rapat/'||pathname==='/dokumentasi/'?'simple':'portal';
document.body.classList.add('f4-direct-'+portal);
document.body.classList.add(portal==='book'?'book-mode':portal==='bank'?'bank-mode':portal==='superadmin'?'superadmin-mode':'portal-mode');
// All navigation pictograms are locally hosted SVG files, never Unicode symbols.
const svg=name=>'<span class="f4-svg-icon f4-svg-'+name+'" aria-hidden="true"></span>';
const el=(tag,cl)=>{const n=document.createElement(tag);if(cl)n.className=cl;return n};
const bar=el('div');bar.id='f4-direct-bar';
const hamburger=el('button');hamburger.id='f4-mobile-menu';hamburger.type='button';hamburger.innerHTML=svg('menu');hamburger.setAttribute('aria-label','Buka menu halaman');
const links=el('nav','f4-nav-links');links.setAttribute('aria-label','Pindah portal');
function navButton(key,url,label){
 const a=el('a');a.href=url;a.title=label;a.setAttribute('aria-label',label);a.innerHTML=svg(key);
 if((portal==='portal'&&key==='home')||(portal==='bank'&&key==='bank')||(portal==='book'&&key==='book')||(portal==='superadmin'&&key==='superadmin'))a.classList.add('f4-selected');
 links.append(a);return a;
}
navButton('home',paths.portal,'Portal Utama');navButton('bank',paths.bank,'Bank Sampah');
const bookLink=navButton('book',paths.book,'Pembukuan');const adminLink=navButton('superadmin',paths.superadmin,'Superadmin');
bookLink.hidden=true;adminLink.hidden=true;
const login=el('button','f4-direct-login');login.type='button';login.textContent='LOGIN';
const avatar=el('button');avatar.id='f4-direct-avatar';avatar.type='button';avatar.innerHTML=svg('user');avatar.hidden=true;avatar.setAttribute('aria-label','Buka menu akun');
const menu=el('div');menu.id='f4-direct-account-menu';menu.hidden=true;
const menuName=el('div','f4-nav-account-name');
const settings=el('button');settings.type='button';settings.textContent='Pengaturan Akun';settings.dataset.accountAction='settings';
const logout=el('button');logout.type='button';logout.textContent='Keluar';logout.dataset.accountAction='logout';
menu.append(menuName,settings,logout);
bar.append(hamburger,links,login,avatar,menu);document.body.prepend(bar);
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
async function api(path,options){
 const r=await fetch(API+path,{credentials:'include',cache:'no-store',...options});
 const d=await r.json().catch(()=>({}));
 if(!r.ok||d.ok===false)throw Error(d.error||'HTTP '+r.status);
 return d;
}
function notifyRole(){
 if(portal==='bank'||portal==='portal'){
  const member=session?.member||{};
  window.postMessage({type:'f4:demo-role',role,identity:{nama:member.nama||session?.account?.username||'',rumah:member.rumah||'',wargaId:member.id||''}},location.origin);
 }
}
window.f4RefreshDirectAvatar=()=>avatarLoad();
function avatarLoad(){
 const img=el('img');img.alt='Foto profil';img.src=API+'/api/member/avatar?v='+Date.now();
 img.onerror=()=>{avatar.innerHTML=svg('user')};avatar.replaceChildren(img);
}
async function refreshSession(){
 try{session=await api('/api/v2/auth/session')}catch{session=null}
 role=String(session?.account?.role||'public').toLowerCase();
 if(role==='anggota')role='warga';
 const authed=!!session?.account;
 login.hidden=authed;avatar.hidden=!authed;bookLink.hidden=role!=='superadmin';adminLink.hidden=role!=='superadmin';
 menuName.textContent=(session?.member?.nama||session?.account?.username||'Pengguna')+' · '+(role==='warga'?'Anggota':role==='superadmin'?'Superadmin':role==='admin'?'Admin':'Publik');
 if(authed)avatarLoad();
 notifyRole();
 if(portal==='book'||portal==='superadmin'){
  if(role!=='superadmin'){
   document.body.classList.add('f4-denied');
   gate.hidden=false;
   gate.innerHTML='<h2>Akses Superadmin</h2><p>Halaman ini hanya dapat dibuka oleh Superadmin yang sudah login.</p><button type="button">Login</button>';
   gate.querySelector('button').onclick=openLogin;
  }else{document.body.classList.remove('f4-denied');gate.hidden=true}
 }
 document.documentElement.classList.remove('f4-auth-pending');
}
dialog.querySelector('form').addEventListener('submit',async e=>{
 e.preventDefault();const b=dialog.querySelector('[type=submit]');const status=dialog.querySelector('#f4-direct-login-error');
 b.disabled=true;status.textContent='';
 try{
  await api('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:dialog.querySelector('#f4-direct-username').value.trim(),password:dialog.querySelector('#f4-direct-password').value})});
  closeLogin();await refreshSession();
  if(portal==='book'||portal==='superadmin')location.reload();
 }catch(err){status.textContent='Login gagal: '+err.message}
 finally{b.disabled=false;dialog.querySelector('#f4-direct-password').value=''}
});
avatar.onclick=()=>{menu.hidden=!menu.hidden};
settings.onclick=()=>{menu.hidden=true;window.f4OpenUnifiedAccount?.()};
logout.onclick=async()=>{
 menu.hidden=true;
 try{await api('/api/auth/logout',{method:'POST'})}
 catch(e){if(window.f4UiDialog)await window.f4UiDialog.alert('Gagal keluar: '+e.message);else alert('Gagal keluar: '+e.message);return}
 session=null;role='public';
 if(portal==='book'||portal==='superadmin'){location.assign('/');return}
 window.f4CloseUnifiedAccount?.();await refreshSession();
};
document.addEventListener('pointerdown',e=>{if(!bar.contains(e.target))menu.hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;closeLogin()}});
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==window||!e.data)return;
 const data=e.data;
 if(data.type==='f4:auth-changed'||data.type==='f4:logout-request'){logout.click();}
 if(data.type==='f4:show-login')openLogin();
 if(data.type==='f4:bank-avatar-updated')avatarLoad();
 if(data.type==='f4:go-portal'||data.type==='f4:navigate'){
  const target=data.portal||data.target;
  if(paths[target])location.assign(paths[target]);
 }
 if(data.type==='f4:manage-home')location.assign(paths.superadmin);
 if(data.type==='f4:portal-visible-panel'&&portal==='portal')highlight(data.panel);
});
function makePortalSide(){
 if(portal!=='portal'&&portal!=='simple')return;
 const side=el('aside');side.id='f4-direct-sidebar';
 const brand=el('div','f4-direct-brand');
 const logo=el('img');logo.src='https://lh3.googleusercontent.com/d/1UdHmAbx4mjey0SvhFJ5ipBwfOB0aErZ8';logo.alt='Logo Flamboyan 4';
 const brandName=el('div');const h=el('h2');h.textContent='Portal Utama';
 const sub=el('small');sub.textContent='Flamboyan 4';brandName.append(h,sub);brand.append(logo,brandName);side.append(brand);
 const groupHead=el('div','f4-direct-group-label');groupHead.textContent='NAVIGASI';side.append(groupHead);
 // The scrolling sections must appear in the same sequence as the sidebar.
 // Rapat and Dokumentasi are separate pages, kept in their own group.
 const items=[
  ['beranda','Beranda','home'],['keuangan','Keuangan Warga','cash'],['projek','Projek','project'],
  ['kalender','Kalender','calendar'],['inventaris','Inventaris','inventory'],
  ['komentar','Komentar & Saran','message'],['pembayaran','Pembayaran','pay'],
  ['dokumentasi','Dokumentasi','image'],['rapat','Rapat','meeting']
 ];
 for(const [key,label,iconName] of items){
  if(key==='dokumentasi'){const group=el('div','f4-direct-group-label f4-direct-other-pages');group.textContent='HALAMAN LAINNYA';side.append(group);}
  const b=el('button');b.type='button';b.dataset.f4Panel=key;
  b.innerHTML=svg(iconName);
  const labelEl=el('span');labelEl.textContent=label;b.append(labelEl);
  b.addEventListener('click',()=>{
   closeSide();
   if(key==='rapat'||key==='dokumentasi'){location.assign(paths[key]);return}
   if(portal==='simple'){location.assign('/?halaman='+encodeURIComponent(key));return}
   if(key==='inventaris'){
    const target=document.getElementById('kegiatan');
    if(target)window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-74),behavior:'smooth'});
    else location.assign('/dokumentasi/#inventaris');
    highlight(key);return;
   }
   try{window.f4PortalSelectPanel?.(key)}catch(err){console.warn('Panel:',err)}
   highlight(key);
  });
  side.append(b);
 }
 document.body.append(side);
 const backdrop=el('button');backdrop.id='f4-direct-sideback';backdrop.type='button';backdrop.hidden=true;
 backdrop.setAttribute('aria-label','Tutup menu');backdrop.onclick=closeSide;document.body.append(backdrop);
 highlight(portal==='simple'?(pathname==='/rapat/'?'rapat':'dokumentasi'):'beranda');
}
function highlight(key){document.querySelectorAll('#f4-direct-sidebar [data-f4-panel]').forEach(x=>x.setAttribute('aria-current',x.dataset.f4Panel===key?'page':'false'))}
function closeSide(){document.querySelector('#f4-direct-sidebar')?.classList.remove('f4-open');const b=document.getElementById('f4-direct-sideback');if(b)b.hidden=true;hamburger.setAttribute('aria-expanded','false')}
hamburger.addEventListener('click',()=>{
 if(portal==='portal'||portal==='simple'){
  const side=document.getElementById('f4-direct-sidebar');if(!side){location.assign('/');return}
  const opened=side.classList.toggle('f4-open');document.getElementById('f4-direct-sideback').hidden=!opened;hamburger.setAttribute('aria-expanded',String(opened));
 }else if(portal==='bank')window.f4ToggleBankMenu?.();
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
const syncBarScroll=()=>bar.classList.toggle('f4-scrolled',window.scrollY>12);
window.addEventListener('scroll',syncBarScroll,{passive:true});
syncBarScroll();
// Existing original page integration uses direct window messages instead of parent iframe.
if(portal==='portal'){
 window.f4GoBank=()=>location.assign(paths.bank);
 const original=window.openModalDokumentasi;
 if(typeof original==='function')window.openModalDokumentasi=()=>location.assign(paths.dokumentasi);
}
if(portal==='bank'){
 const old=window.v11ShowLogin;
 window.v11ShowLogin=()=>openLogin();
}
// Native scroll is intentionally left to the browser. Only the fixed account
// overlay uses a non-window scrolling container, so give it explicit refresh.
let start=0,moving=false;
document.addEventListener('touchstart',e=>{
 const content=e.target.closest?.('#f4-unified-account .ua-content');
 if(e.touches.length!==1||!content||content.scrollTop>2||e.target.closest('input,button,textarea,select')){moving=false;return}
 start=e.touches[0].clientY;moving=true;
},{passive:true});
document.addEventListener('touchend',e=>{
 if(!moving||!document.querySelector('#f4-unified-account:not([hidden])'))return;
 moving=false;
 if(e.changedTouches[0].clientY-start>110){try{sessionStorage.setItem('f4-native-account-refresh','1')}catch{} location.reload()}
},{passive:true});
const legacy=new URLSearchParams(location.search).get('halaman');
if(portal==='portal'&&legacy){
 const key=String(legacy).split('/')[0];
 if(key==='bank-sampah'||key==='pembukuan'||key==='superadmin'||key==='rapat'||key==='dokumentasi'||key==='inventaris'){
  location.replace(key==='bank-sampah'?paths.bank:key==='pembukuan'?paths.book:key==='superadmin'?paths.superadmin:key==='inventaris'?'/dokumentasi/#inventaris':paths[key]);
  return;
 }
 if(['beranda','keuangan','projek','kalender','pembayaran','komentar'].includes(key)){
  window.addEventListener('load',()=>window.f4PortalSelectPanel?.(key),{once:true});
 }
}
let restore=false;
try{restore=sessionStorage.getItem('f4-native-account-refresh')==='1';sessionStorage.removeItem('f4-native-account-refresh')}catch{}
refreshSession().then(()=>{
 if((location.hash==='#akun'||restore)&&role!=='public')window.f4OpenUnifiedAccount?.();
});
/* Pair search and reload in native search toolbars on every portal.
   Preserve original input and button listeners; only move their DOM nodes. */
(()=>{
 const css=document.createElement('style');css.id='f4-search-reload-layout';
 css.textContent=[
  '.f4-inline-search-refresh{display:flex!important;align-items:center!important;gap:8px!important;flex:1 1 230px!important;min-width:0!important;max-width:100%!important;width:auto!important}',
  '.f4-inline-search-refresh>input{flex:1 1 auto!important;width:100%!important;min-width:0!important;max-width:none!important;margin:0!important}',
  '.f4-inline-search-refresh>.f4-search-refresh-button{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 42px!important;width:42px!important;min-width:42px!important;max-width:42px!important;height:42px!important;min-height:42px!important;max-height:42px!important;padding:0!important;margin:0!important;border-radius:11px!important;line-height:1!important}',
  '.f4-inline-search-refresh>.f4-search-refresh-button .f4-action-symbol{display:grid!important;place-items:center!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important}',
  '.f4-inline-search-refresh>.f4-search-refresh-button svg{display:block!important;width:20px!important;height:20px!important;margin:auto!important}',
  '.f4-inline-search-refresh>.f4-search-refresh-button .f4-action-label{display:none!important}',
  '@media(max-width:760px){#f4-account-page .f4-admin-controls:has(.f4-inline-search-refresh),#f4-account-page .sa-controls:has(.f4-inline-search-refresh){display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important}#f4-account-page .f4-inline-search-refresh{flex:1 1 100%!important;width:100%!important}#f4-account-page .sa-account-filters .f4-inline-search-refresh{flex:1 1 100%!important}#f4-account-page .sa-account-filters select{flex:1 1 100%!important;max-width:none!important}}'
 ].join('\n');
 css.textContent+=[
  'button.f4-global-refresh{display:inline-grid!important;place-items:center!important;flex:0 0 42px!important;width:42px!important;min-width:42px!important;max-width:42px!important;height:42px!important;min-height:42px!important;max-height:42px!important;padding:0!important;margin:0!important;border-radius:10px!important;line-height:1!important;vertical-align:middle!important}',
  'button.f4-global-refresh>svg{display:block!important;width:20px!important;height:20px!important;max-width:20px!important;max-height:20px!important;margin:0!important;padding:0!important;fill:none!important;stroke:currentColor!important}',
  'button.f4-global-refresh>.f4-refresh-label{display:none!important}',
  '@media(max-width:760px){button.f4-global-refresh{flex-basis:40px!important;width:40px!important;min-width:40px!important;max-width:40px!important;height:40px!important;min-height:40px!important;max-height:40px!important}}'
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