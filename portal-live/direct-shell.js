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
 cash:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 15h5"/>',
 meeting:'<path d="M7 2h7l5 5v15H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h5M9 13h6M9 17h6"/>',
 project:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m4 18 6-6 4 4 3-3 4 5"/>',
 inventory:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 pay:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M15 15h3"/>',
 message:'<path d="M21 11.5a8.5 8.5 0 0 1-12.1 7.7L3 21l1.8-5.7A8.5 8.5 0 1 1 21 11.5Z"/>',
 home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 21v-8h6v8"/>',
 bank:'<path d="m8 5 2-3 2 3M10 2h2c3.8 0 6.7 2.3 7.7 5.7M19 10l3 2-3 2M22 12c0 4-2.4 7.3-6 8.5M12 19l-2 3-2-3M10 22H9c-3.7 0-6.8-2.5-7.7-6"/>',
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
  ['pembayaran','Pembayaran','pay'],['komentar','Komentar & Saran','message'],
  ['rapat','Rapat','meeting'],['dokumentasi','Dokumentasi','image']
 ];
 for(const [key,label,iconName] of items){
  if(key==='rapat'){const group=el('div','f4-direct-group-label f4-direct-other-pages');group.textContent='HALAMAN LAINNYA';side.append(group);}
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
})();