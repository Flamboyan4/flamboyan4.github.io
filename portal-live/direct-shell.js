/* Flamboyan 4 — native navigation and shared Cloudflare session, no portal iframe. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id';
const paths={portal:'/',bank:'/bank-sampah/',book:'/pembukuan/',superadmin:'/superadmin/',rapat:'/rapat/',dokumentasi:'/dokumentasi/'};
const pathname=location.pathname;
const portal=pathname==='/bank-sampah/'?'bank':pathname==='/pembukuan/'?'book':pathname==='/superadmin/'?'superadmin':pathname==='/rapat/'||pathname==='/dokumentasi/'?'simple':'portal';
document.body.classList.add('f4-direct-'+portal);
document.body.classList.add(portal==='book'?'book-mode':portal==='bank'?'bank-mode':portal==='superadmin'?'superadmin-mode':'portal-mode');
const icon={
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 21v-8h6v8"/>',
 bank:'<path d="M4 4v6h6M20 20v-6h-6"/><path d="M6 16a7 7 0 0 0 12-1M18 8A7 7 0 0 0 6 9"/>',
 book:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
 superadmin:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'
};
const svg=name=>'<svg aria-hidden="true" viewBox="0 0 24 24">'+icon[name]+'</svg>';
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
dialog.innerHTML='<section role="dialog" aria-modal="true" aria-label="Login Flamboyan 4"><h2>Login Flamboyan 4</h2><form id="f4-direct-login-form"><label for="f4-direct-username">Username</label><input id="f4-direct-username" required autocomplete="username"><label for="f4-direct-password">Password</label><input id="f4-direct-password" type="password" required autocomplete="current-password"><p class="f4-login-error" id="f4-direct-login-error" role="status"></p><div class="f4-login-actions"><button type="button" id="f4-direct-close-login">Batal</button><button type="submit">Masuk</button></div></form></section>';
document.body.append(dialog);
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
 catch(e){alert('Gagal keluar: '+e.message);return}
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
 const h=el('h2');h.textContent='Portal Utama';side.append(h);
 const items=[
  ['beranda','Beranda'],['keuangan','Keuangan Warga'],['rapat','Rapat'],['projek','Projek'],
  ['kalender','Kalender'],['dokumentasi','Dokumentasi'],['inventaris','Inventaris'],
  ['pembayaran','Pembayaran'],['komentar','Komentar & Saran']
 ];
 for(const [key,label] of items){
  const b=el('button');b.type='button';b.dataset.f4Panel=key;b.textContent=label;
  b.addEventListener('click',()=>{
   closeSide();
   if(key==='rapat'||key==='dokumentasi'){location.assign(paths[key]);return}
   if(portal==='simple'){location.assign('/?halaman='+encodeURIComponent(key));return}
   if(key==='inventaris'){location.assign('/dokumentasi/#inventaris');return}
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
})();