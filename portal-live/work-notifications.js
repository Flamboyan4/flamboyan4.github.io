/* Notifikasi pekerjaan aktual Bank Sampah & Pusat Keuangan — tanpa data publik. */
(()=>{
'use strict';
const portal=location.pathname.startsWith('/superadmin')?'superadmin':
 location.pathname.startsWith('/bank-sampah')?'bank':null;
if(!portal)return;
const API='https://api.flamboyan4.web.id';
const $=id=>document.getElementById(id);
const bellIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9"/><path d="M10 21h4"/></svg>';
const closeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const refreshIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14-5L4 8m0-5v5h5"/><path d="M4 13a8 8 0 0 0 14 5l2-2m0 5v-5h-5"/></svg>';
const icons={
 sale:'<svg viewBox="0 0 24 24"><path d="M3 7h18l-2 13H5L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></svg>',
 approve:'<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 3 3 5-6"/></svg>',
 payout:'<svg viewBox="0 0 24 24"><path d="M3 7h18v13H3zM3 10h18"/><path d="M12 13v4M10 15h4"/></svg>',
 treasury:'<svg viewBox="0 0 24 24"><path d="M3 7h18v13H3zM3 10h18"/><path d="M7 4h10"/></svg>',
 warning:'<svg viewBox="0 0 24 24"><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3v.1"/></svg>'
};
let bell=null,overlay=null,panel=null,items=[],loadError='',lastFetch=0,loading=false,sequence=0,ready=false,open=false;
function isAuthorized(){
 if(portal==='bank')return document.body.classList.contains('f4-bank-app-admin')&&
   !$('dashboardView')?.classList.contains('hidden');
 return Boolean($('f4-account-page')&&!$('f4-account-page').hidden&&document.body.classList.contains('f4-direct-superadmin'));
}
function create(tag,cls,txt){
 const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;
}
function headingTarget(){
 if(portal==='bank'){
  const greeting=$('f4BankPageGreeting');
  return greeting && !greeting.hidden ? greeting : null;
 }
 return $('f4-account-page')?.querySelector(':scope > main > .f4-work-heading')||null;
}
function mount(){
 const target=headingTarget();
 if(!target)return false;
 if(!bell||!bell.isConnected){
  bell=create('button');bell.id='f4-work-bell';bell.type='button';bell.hidden=true;
  bell.innerHTML=bellIcon;
  bell.title='Notifikasi pekerjaan';
  bell.setAttribute('aria-label','Notifikasi pekerjaan');
  bell.setAttribute('aria-haspopup','dialog');bell.setAttribute('aria-expanded','false');
  const count=create('span');count.id='f4-work-bell-count';count.hidden=true;count.setAttribute('aria-hidden','true');bell.append(count);
  bell.addEventListener('click',()=>{if(isAuthorized())show()});
 }
 if(bell.parentElement!==target)target.append(bell);
 if(!overlay){
  overlay=create('div');overlay.id='f4-work-notice';overlay.hidden=true;
  panel=create('section','f4-work-notice-panel');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-label','Notifikasi pekerjaan');
  const header=create('div','f4-work-notice-header'),h=create('h2',null,'Notifikasi');
  const tools=create('div','f4-work-notice-tools');
  const refresh=create('button','f4-work-notice-refresh');refresh.type='button';
  refresh.innerHTML=refreshIcon;refresh.title='Muat ulang notifikasi';
  refresh.setAttribute('aria-label','Muat ulang notifikasi');
  refresh.onclick=()=>refreshData(true);
  const close=create('button','f4-work-notice-close');close.type='button';
  close.innerHTML=closeIcon;close.title='Tutup notifikasi';
  close.setAttribute('aria-label','Tutup notifikasi');
  close.onclick=hide;
  tools.append(refresh,close);
  header.append(h,tools);
  const list=create('div','f4-work-notice-list');list.id='f4-work-notice-list';
  panel.append(header,list);overlay.append(panel);
  overlay.addEventListener('click',event=>{if(event.target===overlay)hide()});
  document.body.append(overlay);
 }
 return true;
}
function hide(){
 if(!overlay)return;
 open=false;overlay.hidden=true;document.body.classList.remove('f4-notice-open');
 bell?.setAttribute('aria-expanded','false');
 if(bell&&bell.isConnected)bell.focus({preventScroll:true});
}
function reset(){
 sequence++;loading=false;lastFetch=0;loadError='';items=[];
 const count=$('f4-work-bell-count');
 if(count)count.hidden=true;
 hide();
}
async function get(path){
 const r=await fetch(API+path,{credentials:'include',mode:'cors',cache:'no-store'});
 const data=await r.json().catch(()=>({}));
 if(!r.ok||data.ok===false){
  const error=new Error(data.error||'HTTP '+r.status);error.status=r.status;throw error;
 }
 return data;
}
function makeItems(data){
 if(portal==='bank'){
  return [
   {key:'sale',title:'Setoran belum dijual',description:'Setoran dan stok yang masih menunggu penjualan',count:Number(data.unsoldDeposits)||0,route:'penjualan'},
   {key:'approve',title:'Penjualan belum disahkan',description:'Hasil lapak menunggu pemeriksaan dan pengesahan',count:Number(data.pendingApprovals)||0,route:'rekonsiliasi'},
   {key:'payout',title:'Pengajuan pencairan',description:'Permintaan pencairan warga yang belum selesai',count:Number(data.pendingPayouts)||0,route:'bank-payout-admin'}
  ];
 }
 return [
  {key:'treasury',title:'Dana menunggu pengesahan',description:'Transaksi dari program yang belum dicatat di Pusat Keuangan',count:Number(data.pendingCount)||0,route:'treasury'},
  {key:'warning',title:data.needsOpening?'Saldo awal belum disahkan':'Perlu pemeriksaan',description:data.needsOpening?'Sahkan saldo pembuka agar pencatatan terpadu berjalan':'Selisih atau data sumber yang perlu diperiksa',count:data.needsOpening?1:Number(data.warningCount)||0,route:'treasury'}
 ];
}
function navigate(item){
 hide();
 if(portal==='bank')window.goPage?.(item.route);
 else if(typeof window.f4SuperadminNavigate==='function')window.f4SuperadminNavigate('treasury');
 else location.hash='#sa-treasury';
}
function paint(){
 if(!bell)return;
 const active=isAuthorized();
 bell.hidden=!active;
 if(!active){reset();return}
 const total=items.reduce((n,x)=>n+x.count,0),badge=$('f4-work-bell-count');
 if(badge){badge.hidden=total<1;badge.textContent=total>99?'99+':String(total)}
 bell.setAttribute('aria-label',total>0?'Notifikasi pekerjaan, '+total+' tugas menunggu':'Notifikasi pekerjaan, tidak ada tugas menunggu');
 if(!overlay||!open)return;
 const host=$('f4-work-notice-list');host.replaceChildren();
 const filtered=items.filter(x=>x.count>0);
 if(loadError){
  host.append(create('p','f4-work-notice-muted',loadError));
 }else if(loading&&lastFetch===0){
  host.append(create('p','f4-work-notice-muted','Memeriksa tugas terbaru…'));
 }else if(!filtered.length){
  host.append(create('p','f4-work-notice-muted','Belum ada pekerjaan yang menunggu tindakan.'));
 }else for(const item of filtered){
  const button=create('button','f4-work-notice-item');button.type='button';
  const icon=create('span','f4-work-notice-item-icon');icon.innerHTML=icons[item.key]||icons.treasury;
  const copy=create('span','f4-work-notice-copy');
  copy.append(create('strong',null,item.title),create('small',null,item.description));
  const num=create('span','f4-work-notice-num',String(item.count));
  button.append(icon,copy,num);button.onclick=()=>navigate(item);host.append(button);
 }
}
async function refreshData(force=false){
 if(!mount())return;
 if(!isAuthorized()){reset();paint();return}
 if(loading)return;
 if(!force&&Date.now()-lastFetch<55000){paint();return}
 loading=true;loadError='';const request=++sequence;
 paint();
 try{
  const data=await get(portal==='bank'?'/api/admin/bank/action-counts':'/api/v2/admin/treasury?view=notifications');
  if(request!==sequence||!isAuthorized())return;
  items=makeItems(data);lastFetch=Date.now();
 }catch(error){
  if(request!==sequence)return;
  items=[];lastFetch=0;
  loadError=error.status===401||error.status===403?'Sesi berubah. Masuk ulang untuk melihat tugas.':
    'Notifikasi belum dapat dimuat. Coba Perbarui.';
 }finally{
  if(request===sequence){loading=false;paint()}
 }
}
function show(){
 if(!mount()||!isAuthorized())return;
 const rect=bell.getBoundingClientRect();
 overlay.style.setProperty('--f4-notice-top',Math.max(16,Math.min(window.innerHeight-160,rect.bottom+10))+'px');
 open=true;overlay.hidden=false;document.body.classList.add('f4-notice-open');bell.setAttribute('aria-expanded','true');
 paint();refreshData(true);
 panel.querySelector('.f4-work-notice-close')?.focus({preventScroll:true});
}
function sync(){
 if(!mount())return;
 if(!isAuthorized()){
  if(ready){ready=false;reset()}
  bell.hidden=true;return;
 }
 bell.hidden=false;
 if(!ready){ready=true;refreshData(true)}
}
function start(){
 mount();sync();
 const bodyObserver=new MutationObserver(sync);
 bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 const target=portal==='bank' ?$('dashboardView'):$('f4-account-page');
 if(target)new MutationObserver(sync).observe(target,{attributes:true,attributeFilter:['class','hidden']});
 if(portal==='superadmin'){
  const main=$('f4-account-page')?.querySelector(':scope > main');
  if(main)new MutationObserver(sync).observe(main,{childList:true});
 }else{
  const greeting=$('f4BankPageGreeting');
  if(greeting)new MutationObserver(sync).observe(greeting,{attributes:true,attributeFilter:['hidden']});
 }
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){e.stopPropagation();hide()}},true);
 window.addEventListener('f4-treasury-updated',()=>refreshData(true));
 window.addEventListener('focus',()=>{if(isAuthorized())refreshData()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshData()});
 document.addEventListener('f4-bank-data-changed',()=>refreshData(true));
 window.addEventListener('f4-bank-data-changed',()=>refreshData(true));
 const interval=setInterval(()=>{sync();if(!document.hidden&&isAuthorized())refreshData()},60000);
 window.addEventListener('pagehide',()=>{clearInterval(interval);reset()},{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
