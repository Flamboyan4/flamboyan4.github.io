/* Production mobile navigation. Mount before the portal's content scripts.
   Session verification and all operational routing remain in direct-shell.js.
   Only non-sensitive role presentation may be restored before verification. */
(()=>{
'use strict';
if(window.F4MobileDock)return;
const el=(tag,cl)=>{const n=document.createElement(tag);if(cl)n.className=cl;return n};
const svg=name=>'<span class="f4-svg-icon f4-svg-'+name+'" aria-hidden="true"></span>';
const residentPath={'/keuangan/':'finance','/agenda/':'agenda','/profil/':'profile'};
let portal=residentPath[location.pathname.replace(/index\.html$/i,'').replace(/\/?$/,'/')]||document.documentElement.dataset.f4Shell||'portal';
const sharedDock=el('nav');sharedDock.id='f4-direct-dock';sharedDock.dataset.f4Persistent='shell';sharedDock.hidden=true;
sharedDock.setAttribute('aria-label','Navigasi utama');
const dockHost=el('div');dockHost.id='f4-shell-bottom';dockHost.dataset.f4Persistent='shell';dockHost.append(sharedDock);document.body.append(dockHost);
/* Lucide SVG paths, https://github.com/lucide-icons/lucide. Inline for first paint.
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
const dockPaths={
 home:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 bank:'<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>',
 add:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>',
 book:'<path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/>',
 superadmin:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
 cash:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
 calendar:'<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/>',
 user:'<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
 sale:'<path d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18"/><path d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25"/><circle cx="18" cy="20" r="2"/><circle cx="8" cy="20" r="2"/>',
 report:'<path d="M12 16v5"/><path d="M16 14.639V21"/><path d="M20 10.656V21"/><path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"/><path d="M4 18.463V21"/><path d="M8 14.656V21"/>'
};
const dockIcon=key=>dockPaths[key]?'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">'+dockPaths[key]+'</svg>':svg(key);
const dockItems={
 public:[['home','Beranda','home'],['bank','Bank Sampah','bank']],
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
  return age>=0&&age<15*60*1000&&validDockRole(hint?.role)&&hint.role!=='public'?hint.role:'';
 }catch{return '';}
}
function rememberDockHint(value){
 try{
  if(validDockRole(value)&&value!=='public')sessionStorage.setItem(dockHintKey,JSON.stringify({role:value,time:Date.now()}));
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
/* Portal identity and shortcut state are independent. The portal remains
   selected even while an input or other operational shortcut is open. */
function markSharedDock(){
 const route=bankRoute||new URLSearchParams(location.search).get('halaman')||window.f4BankAppCurrentRoute?.()||'dashboard';
 const currentBookRoute=bookRoute||new URLSearchParams(location.search).get('halaman')||'';
 let active=({portal:'home',simple:'home',book:'book',superadmin:'superadmin',bank:'bank',finance:'finance',agenda:'agenda',profile:'profile'})[portal]||'home';
 if(!dockItems[dockRole]?.some(item=>item[0]===active))active='home';
 let action='';
 if(dockRole==='superadmin'){
  if((portal==='bank'&&route==='setoran')||(portal==='book'&&currentBookRoute==='input'))action='input';
 }else if(dockRole==='admin'&&portal==='bank'){
  action=({setoran:'deposit',penjualan:'sale',laporan:'report'})[route]||'';
 }
 for(const b of sharedDock.querySelectorAll('[data-dock-key]')){
  if(b.dataset.dockKey===active){if(b.getAttribute('aria-current')!=='page')b.setAttribute('aria-current','page')}else if(b.hasAttribute('aria-current'))b.removeAttribute('aria-current');
  b.toggleAttribute('data-current-action',!!action&&b.dataset.dockKey===action);
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
 sharedDock.dataset.role=next;sharedDock.style.setProperty('--f4-dock-columns',String(dockItems[next]?.length||5));
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
 setPortal(next){if(!['portal','bank','book','superadmin','simple','finance','agenda','profile'].includes(next))return;portal=next;bankRoute='';bookRoute='';closeDockMenu();markSharedDock()}
};
const hint=readDockHint();if(hint)updateSharedDock(hint);else if(['portal','bank'].includes(portal)||['/rapat/','/dokumentasi/'].includes(location.pathname.replace(/index\.html$/i,'').replace(/\/?$/,'/')))updateSharedDock('public');
})();
