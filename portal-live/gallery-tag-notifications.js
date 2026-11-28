/* One header inbox: resident photo tags and authorized operational tasks. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id/api/v2/gallery';
const bar=document.getElementById('f4-direct-bar'),avatar=document.getElementById('f4-direct-avatar');
if(!bar||!avatar||document.getElementById('f4-tag-bell'))return;
const eligible=()=>!avatar.hidden&&Boolean(avatar.dataset.f4TagAccount);
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
const bell=el('button');bell.id='f4-tag-bell';bell.type='button';bell.hidden=true;
bell.setAttribute('aria-label','Notifikasi');bell.setAttribute('aria-haspopup','dialog');bell.setAttribute('aria-expanded','false');
bell.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/></svg>';
const count=el('span','f4-tag-bell-count');count.hidden=true;bell.append(count);bar.insertBefore(bell,avatar);
const dialog=el('dialog','f4-tag-inbox');dialog.setAttribute('aria-label','Notifikasi');
const head=el('header','f4-tag-inbox-head'),title=el('h2','','Notifikasi'),close=el('button','f4-tag-inbox-close');close.type='button';close.setAttribute('aria-label','Kembali');close.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg>';head.append(close,title);
const list=el('div','f4-tag-inbox-list');dialog.append(head,list);document.body.append(dialog);
let items=[],busy=false,generation=0,openingPhoto=false,failed=false,lastCheck=0,accountKey='';
const currentPortal=()=>location.pathname.startsWith('/bank-sampah')?'bank':location.pathname.startsWith('/superadmin')?'superadmin':null;
let portal=currentPortal();
const workEligible=()=>eligible()&&(avatar.dataset.f4TagRole==='superadmin'||(portal==='bank'&&avatar.dataset.f4TagRole==='admin'&&document.body.classList.contains('f4-bank-app-admin')&&!document.getElementById('dashboardView')?.classList.contains('hidden')));
let workItems=[],workBusy=false,workFailed=false,workChecked=0,workGeneration=0,workAccount='',workAgain=false;
const workCount=value=>Number.isSafeInteger(Number(value))&&Number(value)>0?Number(value):0;
const row=(group,title,description,count,route)=>({group,title,description,count:workCount(count),route});
const bankRows=data=>[
 row('Bank Sampah','Setoran belum dijual','Setoran dan stok menunggu penjualan',data.unsoldDeposits,'/bank-sampah/?halaman=penjualan'),
 row('Bank Sampah','Penjualan belum disahkan','Hasil lapak menunggu pengesahan',data.pendingApprovals,'/bank-sampah/?halaman=rekonsiliasi'),
 row('Bank Sampah','Pengajuan pencairan','Permintaan pencairan warga belum selesai',data.pendingPayouts,'/bank-sampah/?halaman=bank-payout-admin')
];
const treasuryRows=data=>[
 row('Pusat Keuangan','Transaksi belum disahkan','Transaksi program menunggu pemeriksaan dan pengesahan',data.pendingCount,'/superadmin/?halaman=treasury'),
 row('Pusat Keuangan',data.needsOpening?'Saldo awal belum disahkan':'Perlu pemeriksaan',data.needsOpening?'Sahkan saldo pembuka':'Selisih atau data sumber perlu diperiksa',data.needsOpening?1:data.warningCount,'/superadmin/?halaman=treasury')
];
const bookPeriods=()=>{
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'numeric'}).formatToParts(new Date());
 const year=Number(parts.find(x=>x.type==='year').value),month=Number(parts.find(x=>x.type==='month').value);
 return [0,1,2].map(offset=>{const d=new Date(Date.UTC(year,month-1-offset,1));return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,label:new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric',timeZone:'UTC'}).format(d)};});
};
const bookRows=(data,p)=>[row('Pembukuan','Iuran Kas Lorong belum dibukukan',p.label+' · Pembayaran yang siap dibukukan',data.data?.ringkasan?.qtyBelum,'/pembukuan/?halaman=kas&bulan='+p.month+'&tahun='+p.year)];
async function workRequest(path){
 const response=await fetch('https://api.flamboyan4.web.id'+path,{credentials:'include',mode:'cors',cache:'no-store'});
 const data=await response.json();
 if(!response.ok||data.ok===false)throw Error(data.error||'HTTP '+response.status);
 return data;
}
function clearWork(){
 workGeneration++;workItems=[];workBusy=false;workFailed=false;workChecked=0;workAccount='';workAgain=false;
}
async function refreshWork(force=false){
 if(!workEligible()){if(workAccount)clearWork();paint();return;}
 const key=avatar.dataset.f4TagAccount;
 if(key!==workAccount){clearWork();workAccount=key;}
 if(workBusy){if(force)workAgain=true;return;}
 if(!force&&Date.now()-workChecked<45000)return;
 const stamp=workGeneration;workBusy=true;workFailed=false;paint();
 try{
  const requests=[workRequest('/api/admin/bank/action-counts').then(bankRows)];
  if(avatar.dataset.f4TagRole==='superadmin'){
   requests.push(workRequest('/api/v2/admin/treasury?view=notifications').then(treasuryRows));
   for(const p of bookPeriods())requests.push(workRequest('/api/bookkeeping/kas-batches?category=kas_lorong&year='+p.year+'&month='+p.month).then(data=>bookRows(data,p)));
  }
  const results=await Promise.allSettled(requests);
  if(stamp!==workGeneration||!workEligible()||key!==avatar.dataset.f4TagAccount)return;
  workItems=results.flatMap(r=>r.status==='fulfilled'?r.value:[]);
  workFailed=results.some(r=>r.status==='rejected');workChecked=Date.now();
 }catch(error){
  if(stamp===workGeneration){workFailed=true;workChecked=Date.now();}
 }finally{
  if(stamp===workGeneration){workBusy=false;paint();if(workAgain){workAgain=false;refreshWork(true);}}
 }
}
function openWork(item){
 if(!workEligible())return;
 // Consume the inbox history entry before routing, so Back never opens a stale notification panel.
 const route=()=>{
  if(!workEligible())return;
  const target=new URL(item.route,location.origin);
  if(target.pathname==='/superadmin/'&&portal==='superadmin'&&typeof window.f4SuperadminNavigate==='function'){window.f4SuperadminNavigate('treasury');return;}
  if(window.F4PortalNavigation)void window.F4PortalNavigation.go(target.href);
  else location.assign(target.href);
 };
 if(history.state?.f4TagInbox===true){
  pendingWorkRoute=route;requestClose();
 }else{hideInbox(true);route();}
}
let pendingWorkRoute=null;
function paintWork(){
 if(!workEligible())return;
 list.append(el('h3','f4-tag-inbox-section','Tugas pengelola'));
 const active=workItems.filter(x=>x.count>0);
 if(workFailed){const p=el('p','f4-tag-inbox-empty','Sebagian tugas belum dapat dimuat.');const retry=el('button','f4-tag-inbox-retry','Coba lagi');retry.type='button';retry.onclick=()=>refreshWork(true);list.append(p,retry);}
 else if(workBusy&&!workChecked)list.append(el('p','f4-tag-inbox-empty','Memeriksa tugas…'));
 else if(!active.length)list.append(el('p','f4-tag-inbox-empty','Tidak ada tugas menunggu.'));
 let group='';
 for(const item of active){
  if(item.group!==group){group=item.group;list.append(el('h3','f4-tag-inbox-section',group));}
  const button=el('button','f4-tag-inbox-item is-unread');button.type='button';
  const symbol=el('span','f4-tag-inbox-symbol');symbol.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="m8 12 3 3 5-6"/></svg>';
  const copy=el('span','f4-tag-inbox-copy');copy.append(el('strong','',item.title),el('small','',item.description));
  button.append(symbol,copy,el('strong','f4-tag-work-count',String(item.count)));button.onclick=()=>openWork(item);list.append(button);
 }
 list.append(el('h3','f4-tag-inbox-section','Dokumentasi'));
}
const request=async(path,options={})=>{
 const response=await fetch(API+path,{credentials:'include',cache:'no-store',...options});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||data.ok===false){const e=new Error(data.error||'HTTP '+response.status);e.status=response.status;throw e}return data;
};
function paint(){
 const unread=items.filter(x=>!x.read).length;
 const tasks=workEligible()&&workAccount===avatar.dataset.f4TagAccount?workItems.reduce((n,x)=>n+x.count,0):0;
 const total=unread+tasks;
 count.hidden=!total;count.textContent=total>99?'99+':String(total);
 bell.setAttribute('aria-label','Notifikasi'+(total?', '+total+' pemberitahuan':'')+(tasks?', '+tasks+' tugas menunggu':''));
 if(!dialog.open)return;
 list.replaceChildren();
 paintWork();
 if(busy&&!items.length){list.append(el('p','f4-tag-inbox-empty','Memuat notifikasi…'));return;}
 if(failed){const p=el('p','f4-tag-inbox-empty','Notifikasi belum dapat dimuat.');const retry=el('button','f4-tag-inbox-retry','Coba lagi');retry.type='button';retry.onclick=()=>refresh(true);list.append(p,retry);}
 if(!items.length&&!failed){list.append(el('p','f4-tag-inbox-empty','Belum ada foto yang menandai Anda.'));return;}
 for(const group of [{label:'Baru',rows:items.filter(x=>!x.read)},{label:'Sebelumnya',rows:items.filter(x=>x.read)}]){
  if(!group.rows.length)continue;
  list.append(el('h3','f4-tag-inbox-section',group.label));
  for(const item of group.rows){
  const button=el('button','f4-tag-inbox-item'+(item.read?'':' is-unread'));button.type='button';
  const img=el('img','f4-tag-inbox-photo');img.src=item.photoUrl;img.alt='';img.loading='lazy';
  const symbol=el('span','f4-tag-inbox-symbol');
  symbol.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 20v-2a7 7 0 0 1 14 0v2M3 6V3h3m12 0h3v3M3 18v3h3m12 0h3v-3"/></svg>';
  const copy=el('span','f4-tag-inbox-copy');copy.append(el('span','f4-tag-inbox-message','Anda ditandai dalam sebuah foto'),el('strong','',item.title||'Dokumentasi Warga'));
  button.append(symbol,copy,img);
  if(!item.read)button.classList.add('is-unread');
  button.onclick=async()=>{
   if(!eligible()||openingPhoto)return;
   const stamp=generation,key=avatar.dataset.f4TagAccount;
   openingPhoto=true;button.disabled=true;button.setAttribute('aria-busy','true');
   const url=new URL('/dokumentasi/',location.origin);
   if(item.albumId)url.searchParams.set('album',item.albumId);
   url.searchParams.set('foto',item.id);url.searchParams.set('notifikasi','1');
   const replaceEntry=history.state?.f4TagInbox===true;
   try{
    hideInbox(true);
    const navigation=window.F4PortalNavigation
     ?window.F4PortalNavigation.go(url.href,{replace:replaceEntry})
     :(replaceEntry?location.replace(url.href):location.assign(url.href),true);
    // Reading the notification must not block the photo navigation.
    void request('/tag-notifications/read',{method:'POST',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify({id:item.id})}).then(()=>{
     if(stamp!==generation||key!==avatar.dataset.f4TagAccount)return;
     const current=items.find(x=>x.id===item.id);if(current)current.read=true;
     paint();
    }).catch(error=>console.warn('Status baca notifikasi:',error));
    if(await navigation===false&&stamp===generation&&eligible()){
     openInbox(false);
     list.prepend(el('p','f4-tag-inbox-empty','Foto belum dapat dibuka. Silakan coba lagi.'));
    }
   }catch(error){
    if(stamp===generation&&eligible()){
     openInbox(false);
     list.prepend(el('p','f4-tag-inbox-empty','Foto belum dapat dibuka. Silakan coba lagi.'));
    }
   }finally{
    openingPhoto=false;button.disabled=false;button.removeAttribute('aria-busy');
   }
  };list.append(button);
  }
 }
}
function reset(){clearWork();pendingWorkRoute=null;generation++;items=[];busy=false;failed=false;lastCheck=0;accountKey='';bell.hidden=true;if(dialog.open)requestClose();paint();}
async function refresh(force=false){
 if(!eligible()){if(accountKey||!bell.hidden)reset();return;}
 const key=avatar.dataset.f4TagAccount;
 if(accountKey!==key){reset();accountKey=key;}
 bell.hidden=false;
 void refreshWork(force);
 if(busy||(!force&&Date.now()-lastCheck<30000))return;
 busy=true;failed=false;const stamp=generation;paint();
 try{
  const data=await request('/tag-notifications');
  if(stamp!==generation||!eligible())return;
  items=Array.isArray(data.items)?data.items:[];lastCheck=Date.now();
 }catch(e){
  if(stamp!==generation)return;
  if(e.status===401&&!workEligible()){reset();return;}
  failed=true;lastCheck=Date.now();
 }finally{if(stamp===generation){busy=false;paint();}}
}
let closeTimer=0,closing=false;
function hideInbox(immediate=false){
 if(!dialog.open||(!immediate&&closing))return;
 clearTimeout(closeTimer);
 const finish=()=>{
  clearTimeout(closeTimer);closing=false;dialog.classList.remove('is-closing');
  if(dialog.open)dialog.close();
  document.documentElement.classList.remove('f4-tag-inbox-open');
  bell.setAttribute('aria-expanded','false');
 };
 if(immediate||matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
 closing=true;dialog.classList.add('is-closing');
 closeTimer=setTimeout(finish,220);
}
function openInbox(record=true){
 if(!eligible()||dialog.open)return;
 if(record&&history.state?.f4TagInbox!==true)history.pushState({...history.state,f4TagInbox:true},'',location.href);
 document.documentElement.classList.add('f4-tag-inbox-open');
 dialog.showModal();bell.setAttribute('aria-expanded','true');paint();refresh(true);
}
function requestClose(){
 if(!dialog.open)return;
 if(history.state?.f4TagInbox===true)history.back();
 hideInbox();
}
bell.onclick=()=>openInbox();
close.onclick=requestClose;
dialog.addEventListener('cancel',e=>{e.preventDefault();requestClose();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)requestClose();}});
dialog.addEventListener('close',()=>{document.documentElement.classList.remove('f4-tag-inbox-open');bell.setAttribute('aria-expanded','false');if(!bell.hidden)bell.focus({preventScroll:true});});
window.addEventListener('popstate',e=>{
 if(history.state?.f4TagInbox===true&&eligible()){e.stopImmediatePropagation();openInbox(false);}
 else if(dialog.open||pendingWorkRoute){e.stopImmediatePropagation();if(pendingWorkRoute){const route=pendingWorkRoute;pendingWorkRoute=null;hideInbox(true);route();}else if(!closing)hideInbox();}
},true);
window.addEventListener('pagehide',()=>hideInbox(true));
// Do not resurrect an inbox after reloading the underlying page.
if(history.state?.f4TagInbox===true){const state={...history.state};delete state.f4TagInbox;history.replaceState(state,'',location.href);}
new MutationObserver(()=>{if(!eligible()){if(accountKey||!bell.hidden)reset();}else refresh(true);}).observe(avatar,{attributes:true,attributeFilter:['hidden','data-f4-tag-account','data-f4-tag-role']});
const syncWork=()=>{if(!workEligible()){if(workAccount)clearWork();paint();}else if(workAccount!==avatar.dataset.f4TagAccount)refreshWork(true);};
new MutationObserver(syncWork).observe(document.body,{attributes:true,attributeFilter:['class']});
let surfaceObserver=null;
function bindWorkSurface(){surfaceObserver?.disconnect();surfaceObserver=null;const surface=portal?document.getElementById(portal==='bank'?'dashboardView':'f4-account-page'):null;if(surface){surfaceObserver=new MutationObserver(syncWork);surfaceObserver.observe(surface,{attributes:true,attributeFilter:['class','hidden']})}}
bindWorkSurface();
document.addEventListener('f4:portal-changed',()=>{portal=currentPortal();pendingWorkRoute=null;if(avatar.dataset.f4TagRole!=='superadmin')clearWork();bindWorkSurface();paint();syncWork()});
const changed=()=>{if(workEligible())refreshWork(true);};
window.addEventListener('f4-bank-data-changed',changed);document.addEventListener('f4-bank-data-changed',changed);
window.addEventListener('f4-treasury-updated',changed);
window.addEventListener('f4-bookkeeping-updated',changed);
window.addEventListener('focus',()=>refresh());document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
window.addEventListener('pageshow',()=>refresh(true));
setInterval(()=>{if(!document.hidden&&eligible())refresh();},60000);
refresh(true);
})();
