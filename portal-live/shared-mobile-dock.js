/* Production mobile navigation. Mount before the portal's content scripts.
   Session verification and all operational routing remain in direct-shell.js.
   Only non-sensitive role presentation may be restored before verification. */
(()=>{
'use strict';
if(window.F4MobileDock)return;
const el=(tag,cl)=>{const n=document.createElement(tag);if(cl)n.className=cl;return n};
const svg=name=>'<span class="f4-svg-icon f4-svg-'+name+'" aria-hidden="true"></span>';
let portal=document.documentElement.dataset.f4Shell||'portal';
const sharedDock=el('nav');sharedDock.id='f4-direct-dock';sharedDock.dataset.f4Persistent='shell';sharedDock.hidden=true;
sharedDock.setAttribute('aria-label','Navigasi utama');document.body.append(sharedDock);
const dockPaths={
 add:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',
 sale:'<path d="M2 3h2l2.5 11.1A2 2 0 0 0 8.5 16h9.4a2 2 0 0 0 2-1.6L22 7H5"/><circle cx="9" cy="20" r="1.25"/><circle cx="18" cy="20" r="1.25"/>',
 history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
 report:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
 payout:'<rect x="3" y="9" width="18" height="12" rx="2"/><circle cx="12" cy="15" r="2.5"/><path d="M12 7V2m-3 3 3-3 3 3"/>'
};
const dockIcon=key=>dockPaths[key]?'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">'+dockPaths[key]+'</svg>':svg(key);
const dockItems={
 superadmin:[['home','Beranda','home'],['bank','Bank Sampah','bank'],['input','Input','add'],['book','Pembukuan','book'],['superadmin','Superadmin','superadmin']],
 admin:[['home','Beranda','home'],['bank','Bank Sampah','bank'],['deposit','Input','add'],['sale','Penjualan','sale'],['report','Laporan','report']],
 warga:[['home','Beranda','home'],['bank','Bank Sampah','bank'],['finance','Keuangan','cash'],['agenda','Agenda','calendar'],['profile','Profil','user']]
};

let dockRole='',dockMenu=null,dockTrigger=null,bankRoute='',bookRoute='',handler=null,pending=null;
const dockHintKey='f4-mobile-nav-presentation-v2';
function validDockRole(value){return Object.prototype.hasOwnProperty.call(dockItems,value);}
function readDockHint(){
 if(!window.matchMedia('(max-width:1023px)').matches)return '';
 try{
  const hint=JSON.parse(sessionStorage.getItem(dockHintKey)||'null');
  const age=Date.now()-Number(hint?.time);
  return age>=0&&age<15*60*1000&&validDockRole(hint?.role)?hint.role:'';
 }catch{return '';}
}
function rememberDockHint(value){
 try{
  if(validDockRole(value))sessionStorage.setItem(dockHintKey,JSON.stringify({role:value,time:Date.now()}));
  else sessionStorage.removeItem(dockHintKey);
 }catch{}
}

function closeDockMenu(focus=false){
 if(dockMenu)dockMenu.hidden=true;
 if(dockTrigger){dockTrigger.setAttribute('aria-expanded','false');if(focus)dockTrigger.focus();}
}

function allowed(role,key){return !!dockItems[role]?.some(x=>x[0]===key)||(role==='superadmin'&&['input-deposit','input-iuran'].includes(key))}
function dockAction(key){if(!allowed(dockRole,key))return;if(handler)handler(key);else pending={key,role:dockRole}}
function toggleMenu(){if(!dockMenu)return;dockMenu.hidden=!dockMenu.hidden;dockTrigger.setAttribute('aria-expanded',String(!dockMenu.hidden))}
function markSharedDock(){
 const shownRole=dockRole;
 const route=bankRoute||new URLSearchParams(location.search).get('halaman')||window.f4BankAppCurrentRoute?.()||'dashboard';
 let active=portal==='portal'||portal==='simple'?'home':portal==='book'?((bookRoute||new URLSearchParams(location.search).get('halaman'))==='input'?'input':'book'):portal==='superadmin'?'superadmin':'bank';
 if(portal==='bank'){
  if(shownRole==='superadmin'&&route==='setoran')active='input';
  if(shownRole==='admin')active=({setoran:'deposit',penjualan:'sale',laporan:'report'})[route]||'bank';
  if(shownRole==='warga')active='bank';
 }
 if(shownRole==='warga'){
  if(portal==='portal')active=({keuangan:'finance',arisan:'agenda',kalender:'agenda'})[new URLSearchParams(location.search).get('halaman')]||'home';
  else if(portal==='simple'&&location.pathname.replace(/index\.html$/i,'').replace(/\/?$/,'/')==='/dokumentasi/')active=new URLSearchParams(location.search).get('halaman')==='profil'?'profile':'home';
 }
 for(const b of sharedDock.querySelectorAll('[data-dock-key]')){
  if(b.dataset.dockKey===active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
 }
}
function updateSharedDock(next=''){
 if(!validDockRole(next))next='';
 if(next!==dockRole){
  dockRole=next;dockMenu=null;dockTrigger=null;sharedDock.replaceChildren();
  if(next){
   for(const [i,[key,label,icon]] of dockItems[next].entries()){
    const b=el('button','f4-direct-dock-item'+(i===2&&next!=='warga'?' is-primary':''));
    b.type='button';b.dataset.dockKey=key;
    const name=label;
    const symbol=el('span','f4-direct-dock-icon');
    symbol.innerHTML=dockIcon(icon);
    const caption=el('span','f4-direct-dock-label');caption.textContent=name;
    b.append(symbol,caption);b.setAttribute('aria-label',name);b.onclick=()=>dockAction(key);sharedDock.append(b);
    if(key==='input')dockTrigger=b;
   }
   if(dockTrigger){
    dockTrigger.setAttribute('aria-expanded','false');dockTrigger.setAttribute('aria-controls','f4-direct-dock-input');
    dockMenu=el('div','f4-direct-dock-menu');dockMenu.id='f4-direct-dock-input';dockMenu.hidden=true;
    dockMenu.setAttribute('role','group');dockMenu.setAttribute('aria-label','Pilih input');
    for(const [label,icon,run] of [['Catat Setoran','bank',()=>dockAction('input-deposit')],['Input Iuran','cash',()=>dockAction('input-iuran')]]){
     const b=el('button');b.type='button';b.innerHTML=dockIcon(icon);
     const caption=el('span');caption.textContent=label;b.append(caption);
     b.onclick=()=>{closeDockMenu();if(dockRole==='superadmin')run();};dockMenu.append(b);
    }
    sharedDock.append(dockMenu);
   }
  }
 }
 sharedDock.hidden=!next;document.body.classList.toggle('f4-shared-dock',!!next);markSharedDock();
}

window.addEventListener('f4-shared-bank-route',e=>{bankRoute=String(e.detail||'');markSharedDock();});
window.addEventListener('f4-shared-book-route',e=>{bookRoute=String(e.detail||'');markSharedDock();});
document.addEventListener('pointerdown',e=>{if(!sharedDock.contains(e.target))closeDockMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dockMenu&&!dockMenu.hidden)closeDockMenu(true);});
window.matchMedia('(max-width:1023px)').addEventListener('change',()=>closeDockMenu());


window.F4MobileDock={
 getRole:()=>dockRole,validRole:validDockRole,allowed,remember:rememberDockHint,update:updateSharedDock,
 closeMenu:closeDockMenu,toggleMenu,refresh:markSharedDock,
 bind(fn){handler=fn;const p=pending;pending=null;if(p&&p.role===dockRole)fn(p.key)},
 setPortal(next){if(!['portal','bank','book','superadmin','simple'].includes(next))return;portal=next;bankRoute='';bookRoute='';closeDockMenu();markSharedDock()}
};
const hint=readDockHint();if(hint)updateSharedDock(hint);
})();
