/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/superadmin-content.js",function(__f4){



(()=>{
'use strict';
const API='https://api.flamboyan4.web.id',root=__f4.globals.document.getElementById('f4-account-page'),side=root.querySelector('aside'),main=root.querySelector('main'),guard=__f4.globals.document.getElementById('guard');
const saBackdrop=__f4.globals.document.createElement('div');
saBackdrop.className='f4-sa-mobile-backdrop';saBackdrop.hidden=true;saBackdrop.setAttribute('aria-hidden','true');root.append(saBackdrop);
const saEmbedded=__f4.window.parent!==window;
const standaloneButton=__f4.globals.document.createElement('button');
standaloneButton.type='button';standaloneButton.className='f4-sa-standalone-menu';
standaloneButton.setAttribute('aria-label','Buka menu Superadmin');
standaloneButton.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
if(!saEmbedded){__f4.globals.document.body.append(standaloneButton);standaloneButton.onclick=()=>__f4.window.f4ToggleSuperadminMenu();}
function saMenuOpened(){return root.classList.contains('f4-sa-drawer-open')}
function saNotifyMenu(open){
 if(saEmbedded)__f4.window.parent.postMessage({type:'f4:sidebar-state',portal:'superadmin',open},__f4.globals.location.origin);
 const expanded=(0,__f4.globals.String)(open);
 standaloneButton.setAttribute('aria-expanded',expanded);
 __f4.globals.document.getElementById('f4-mobile-menu')?.setAttribute('aria-expanded',expanded);
}
function saCloseDrawer(fromHistory=false){
 if(!saMenuOpened())return;
 if(!fromHistory&&__f4.globals.history.state?.f4SaDrawer){__f4.globals.history.back();return}
 root.classList.remove('f4-sa-drawer-open');
 side.classList.remove('f4-open');saBackdrop.hidden=true;
 root.prepend(side);root.append(saBackdrop);
 main.inert=false;
 __f4.globals.document.documentElement.classList.remove('f4-sa-drawer-lock');
 saNotifyMenu(false);
}
__f4.window.f4ToggleSuperadminMenu=()=>{
 if(saMenuOpened()){saCloseDrawer();return}
 if((0,__f4.globals.matchMedia)('(min-width:1024px)').matches)return;
 __f4.globals.history.pushState({...__f4.globals.history.state,f4SaDrawer:true},'',__f4.globals.location.href);
 root.classList.add('f4-sa-drawer-open');
 // Mount the existing drawer above the persistent dock, outside the scroll root.
 __f4.globals.document.body.append(saBackdrop,side);
 side.classList.add('f4-open');saBackdrop.hidden=false;
 main.inert=true;
 __f4.globals.document.documentElement.classList.add('f4-sa-drawer-lock');
 saNotifyMenu(true);
};
__f4.cleanup(()=>saCloseDrawer(true));
saBackdrop.addEventListener('click',()=>saCloseDrawer());
__f4.window.addEventListener('popstate',()=>{if(!__f4.globals.history.state?.f4SaDrawer)saCloseDrawer(true)});
__f4.globals.document.addEventListener('keydown',e=>{if(e.key==='Escape'&&saMenuOpened()){e.preventDefault();saCloseDrawer()}});
__f4.window.addEventListener('resize',()=>{if(__f4.globals.innerWidth>=1024)saCloseDrawer(true)});
const groups=[['overview','Ringkasan Sistem'],['treasury','Pusat Keuangan'],['accounts','Akun & Hak Akses'],['content','Portal Utama'],['bank','Bank Sampah'],['masters','Data & Aturan'],['audit','Pengaturan & Audit']];
const submenu={
 content:[['projects','Project Card'],['agenda','Rencana Kegiatan'],['documentation','Dokumentasi'],['inventory','Inventaris'],['banners','Banner Slider'],['meetings','Hasil Rapat'],['arisan','Jadwal Arisan'],['jersey','Pesanan Jersey']],
 bank:[['bank_progress','Kegiatan'],['bank_albums','Dokumentasi'],['bank_inventory','Inventaris'],['bankcatalog','Jenis & Harga'],['bank_weighing','Jadwal Timbang']],
 masters:[['residents','Data Warga & Rumah'],['obligations','Kewajiban Iuran'],['tariffs','Tarif Iuran'],['settings','Aturan Tanggal']]
};
// Kelompok navigasi ringkas; kunci modul lama tetap digunakan oleh API dan tautan.
const moduleGroups={
 content:[
  {id:'publikasi',label:'Publikasi',items:['projects','banners','documentation']},
  {id:'kegiatan',label:'Kegiatan & Arsip',items:['agenda','meetings','inventory']},
  {id:'program',label:'Program Warga',items:['arisan','jersey']}
 ],
 bank:[
  {id:'publikasi',label:'Publikasi',items:['bank_progress','bank_albums','bank_inventory']},
  {id:'pengaturan',label:'Pengaturan',items:['bankcatalog','bank_weighing']}
 ]
};
let role='public',group='overview',active='',accounts=[],accountSearch='',residentRows=[];
const el=(tag,text,cls)=>{const v=__f4.globals.document.createElement(tag);if(text!==__f4.globals.undefined)v.textContent=(0,__f4.globals.String)(text);if(cls)v.className=cls;return v};
const button=(label,on,cls)=>{const b=el('button',label,cls);b.type='button';b.onclick=on;return b};
const title=(name,desc)=>{
 rememberTabScroll();
 main.replaceChildren();
 const category=group==='content'?'Portal Utama':group==='bank'?'Bank Sampah':group==='masters'?'Data & Aturan':'';
 const moduleName=submenu[group]?.find(([key])=>key===active)?.[1];
 const h=el('header',__f4.globals.undefined,'f4-work-heading');
 h.append(el('h2',moduleName||name),el('p',moduleName?category+' · Superadmin':desc));
 main.append(h);
 renderTabs();
 // The active submenu tab already names the module. Do not repeat
 // its title/description beneath the tab navigation.
};
const section=(label)=>{const s=el('section',__f4.globals.undefined,'sa-section');s.append(el('h3',label));main.append(s);return s};
const value=(o,keys)=>{for(const k of keys)if(o&&o[k]!==__f4.globals.undefined&&o[k]!==null)return (0,__f4.globals.String)(o[k]);return ''};
const rows=(o)=>__f4.globals.Array.isArray(o)?o:__f4.globals.Array.isArray(o?.rows)?o.rows:__f4.globals.Array.isArray(o?.data)?o.data:__f4.globals.Array.isArray(o?.accounts)?o.accounts:__f4.globals.Array.isArray(o?.akun)?o.akun:[];
const notice=(text)=>{const n=el('p',text,'f4-admin-note');main.append(n);return n};
const safe=(error)=>(0,__f4.globals.String)(error&&error.message||error);
async function get(path){const res=await (0,__f4.globals.fetch)(API+path,{credentials:'include',cache:'no-store'});const d=await res.json().catch(()=>({}));if(!res.ok||d.ok===false)throw (0,__f4.globals.Error)(d.error||('HTTP '+res.status));return d}
function saSidebarIcon(key){
 const paths={
 overview:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 10h18M10 10v11"/>',
 treasury:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
 accounts:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 content:'<path d="m3 10 9-7 9 7v11H3zM9 21v-8h6v8"/>',
 bank:'<path d="m7 6 2-3 4 6M7 6l-3 5m9-2 4-1-2-5M19 12l2 4-5 0m3-4-3-4M16 16l-3 4 5 0M9 20H5l-2-4 3-5m-3 5h6"/>',
 masters:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
 audit:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
 donor:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18M12 10v5"/>'
 };
 const svg=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.innerHTML=paths[key]||paths.overview;return svg;
}
function sidebar(g=group){
 group=g;
 // Keep the same sidebar nodes across route changes. Rebuilding them makes
 // the logo, icons and active state visibly jump while modules load.
 const existing=[...side.querySelectorAll('button[data-sa-group]')];
 if(existing.length===groups.length&&side.querySelector('.f4-direct-brand')&&side.querySelector('.sa-donor-link')){
  for(const b of existing){
   const selected=b.dataset.saGroup===g;
   b.classList.toggle('active',selected);
   b.setAttribute('aria-current',selected?'page':'false');
  }
  __f4.globals.document.body.dataset.saArea=g;
  __f4.window.f4SuperadminArea=g;
  return;
 }
 side.replaceChildren();
 const brand=el('div',__f4.globals.undefined,'f4-direct-brand');const img=el('img');img.src='/assets/logo-flamboyan.svg?v=official-20261027-v2';img.alt='Logo Flamboyan 4';img.className='f4-sa-logo';
 const text=el('div');text.append(el('h2','Superadmin'),el('small','Flamboyan 4'));brand.append(img,text);side.append(brand);
 side.append(el('div','MENU','f4-direct-group-label'));
 for(const [key,label] of groups){
  const b=button('',()=>open(key),g===key?'active':'');
  b.dataset.saGroup=key;
  const icon=saSidebarIcon(key);const caption=el('span',label,'f4-direct-menu-label');
  b.setAttribute('aria-label',label);b.append(icon,caption);
  b.setAttribute('aria-current',g===key?'page':'false');side.append(b);
 }
 side.append(el('div','LAINNYA','f4-direct-group-label f4-direct-other-pages'));
 const donorLink=el('a',__f4.globals.undefined,'sa-donor-link');donorLink.href='/donatur/admin.html';
 const donorIcon=saSidebarIcon('donor');donorLink.setAttribute('aria-label','Donatur & Pendanaan');
 donorLink.append(donorIcon,el('span','Donatur & Pendanaan','f4-direct-menu-label'));side.append(donorLink);
 __f4.globals.document.body.dataset.saArea=g;
 __f4.window.f4SuperadminArea=g;

}
const tabScrollPositions={content:0,bank:0,masters:0};
function rememberTabScroll(){
 const existing=main.querySelector('.sa-tabbar');
 const previousGroup=existing?.dataset.group;
 if(previousGroup&&__f4.globals.Object.hasOwn(tabScrollPositions,previousGroup))
  tabScrollPositions[previousGroup]=existing.scrollLeft;
}
__f4.window.f4SuperadminRememberTabScroll=rememberTabScroll;
function renderTabs(){
 const current=submenu[group];
 if(!current||!active||!current.some(([key])=>key===active))return;
 main.querySelector('.sa-tabbar')?.remove();
 main.querySelector('.sa-module-nav')?.remove();
 const grouped=moduleGroups[group];
 const activeGroup=grouped?.find(item=>item.items.includes(active));
 const options=grouped
  ?grouped.map(item=>[item.id,item.label,item.items[0]])
  :current.map(([key,label])=>[key,label,key]);
 const tabs=el('nav',__f4.globals.undefined,'sa-tabbar');
 tabs.dataset.group=group;
 tabs.setAttribute('role','tablist');
 tabs.setAttribute('aria-label',group==='content'?'Kelompok Portal Utama':group==='bank'?'Kelompok Bank Sampah':'Menu Data & Aturan');
 for(const [key,label,first] of options){
  const selected=grouped?activeGroup?.id===key:active===key;
  const tab=button(label,()=>openEditor(first));
  tab.setAttribute('role','tab');
  tab.setAttribute('aria-selected',(0,__f4.globals.String)(selected));
  tab.tabIndex=selected?0:-1;
  tab.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   const index=options.findIndex(option=>option[0]===key);
   const next=event.key==='Home'?0:event.key==='End'?options.length-1:
    (index+(event.key==='ArrowRight'?1:-1)+options.length)%options.length;
   openEditor(options[next][2]);
   main.querySelectorAll('.sa-tabbar [role="tab"]')[next]?.focus({preventScroll:true});
  });
  tabs.append(tab);
 }
 main.querySelector('.f4-work-heading')?.after(tabs);
 tabs.scrollLeft=tabScrollPositions[group]||0;
 const currentTab=tabs.querySelector('[aria-selected="true"]');
 if(currentTab){
  const currentRect=currentTab.getBoundingClientRect(),railRect=tabs.getBoundingClientRect();
  if(currentRect.right>railRect.right)tabs.scrollLeft+=currentRect.right-railRect.right+8;
  if(currentRect.left<railRect.left)tabs.scrollLeft-=railRect.left-currentRect.left+8;
 }
 tabScrollPositions[group]=tabs.scrollLeft;
 if(activeGroup){
  const moduleNav=el('nav',__f4.globals.undefined,'sa-module-nav');
  moduleNav.setAttribute('aria-label','Pilih fitur '+activeGroup.label);
  for(const key of activeGroup.items){
   const entry=current.find(([id])=>id===key);
   if(!entry)continue;
   const chosen=key===active;
   const item=button(entry[1],()=>openEditor(key),chosen?'is-active':'');
   if(chosen)item.setAttribute('aria-current','page');
   moduleNav.append(item);
  }
  if(group==='content'&&activeGroup.id==='publikasi'){
   const galleryButton=button('Unggahan Warga',()=>__f4.globals.location.assign('/dokumentasi/?kelola=1&f4ui=20261126-borderless-shell-v2'));
   galleryButton.title='Tinjau, pindahkan dan hapus foto warga';
   moduleNav.append(galleryButton);
  }
  tabs.after(moduleNav);
 }
}
__f4.window.f4SuperadminRenderTabs=renderTabs;
__f4.window.f4RenderManagementSidebar=(origin)=>{
 const g=origin==='portal'?'content':origin==='bank'?'bank':origin==='book'?'masters':group;
 sidebar(g);
};
const f4SaNav={ready:false,restoring:false};
function f4SaRememberRoute(replace=false){
 if(!f4SaNav.ready||f4SaNav.restoring)return;
 const route={group,kind:active};
 const previous=__f4.globals.history.state?.f4SaRoute;
 if(previous?.group===route.group&&previous?.kind===route.kind)return;
 const state={...__f4.globals.history.state,f4SaDrawer:false,f4SaRoute:route};
 const url=new __f4.globals.URL(__f4.globals.location.href);url.searchParams.set('halaman',group+(active?'/'+active:''));url.hash='';
 __f4.globals.history[replace?'replaceState':'pushState'](state,'',url.pathname+url.search);
}
__f4.window.addEventListener('popstate',()=>{
 const route=__f4.globals.history.state?.f4SaRoute;
 if(!f4SaNav.ready||!route||!groups.some(([id])=>id===route.group))return;
 if(group===route.group&&(!route.kind||active===route.kind))return;
 f4SaNav.restoring=true;
 try{
  saCloseDrawer(true);
  open(route.group,false);
  if(route.kind&&submenu[route.group]?.some(([id])=>id===route.kind)&&active!==route.kind)
   openEditor(route.kind);
 }finally{f4SaNav.restoring=false}
});
function open(name,push=true){
 if(role!=='superadmin'||!groups.some(([key])=>key===name))return;
 const viewToken=__f4.globals.F4PortalNavigation?.beginView();
 try{
 saCloseDrawer(true);
 if(__f4.globals.history.state?.f4SaDrawer)__f4.globals.history.replaceState({...__f4.globals.history.state,f4SaDrawer:false},'',__f4.globals.location.href);
 __f4.window.f4CancelSuperadminEditor?.();
 active='';sidebar(name);
 if(push&&__f4.window.parent!==window)
  __f4.window.parent.postMessage({type:'f4:superadmin-section',section:name},__f4.globals.location.origin);
 if(name==='overview')overview();
 if(name==='treasury')__f4.window.f4OpenTreasuryCenter?.();
 if(name==='accounts')accountsPage();
 if(name==='content'||name==='bank'||name==='masters'){
   openEditor(submenu[name][0][0]);
   return;
 }
 if(name==='audit')auditPage();
 if(!submenu[name])f4SaRememberRoute();
 }finally{__f4.globals.F4PortalNavigation?.endView(viewToken??null)}
}
function bankWeighingPage(){
 title('Jadwal Penimbangan','Atur frekuensi dan tanggal penimbangan Bank Sampah.');
 const panel=section('Jadwal Rutin');
 const form=el('form',__f4.globals.undefined,'sa-weighing-form');
 const weekdays=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
 const row=(name,id,control)=>{
  const label=el('label',name,'sa-weighing-label');label.htmlFor=id;
  control.id=id;
  const field=el('div',__f4.globals.undefined,'sa-weighing-field');field.append(label,control);
  return field;
 };
 const frequency=el('select');frequency.required=true;
 [['weekly','Setiap minggu'],['biweekly','Setiap 2 minggu'],['monthly','Setiap bulan']].forEach(([value,name])=>frequency.add(new __f4.globals.Option(name,value)));
 const weekday=el('select');weekday.required=true;
 weekdays.forEach((name,i)=>weekday.add(new __f4.globals.Option(name,(0,__f4.globals.String)(i))));
 const anchor=el('input');anchor.type='date';
 const monthly=el('select');for(let i=1;i<=31;i++)monthly.add(new __f4.globals.Option('Tanggal '+i,(0,__f4.globals.String)(i)));
 const frequencyField=row('Frekuensi','saBankWeighingFrequency',frequency);
 const weekdayField=row('Hari penimbangan','saBankWeighingDay',weekday);
 const anchorField=row('Tanggal penimbangan pertama','saBankWeighingAnchor',anchor);
 const monthField=row('Tanggal setiap bulan','saBankWeighingMonthDate',monthly);
 const preview=el('p','', 'sa-weighing-preview');
 const status=el('p','Memuat jadwal…','sa-weighing-status');
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const actions=el('div',__f4.globals.undefined,'sa-weighing-actions');
 const save=el('button','Simpan Jadwal','sa-action sa-action-primary');save.type='submit';save.disabled=true;
 actions.append(save);
 form.append(frequencyField,weekdayField,anchorField,monthField,preview,actions,status);
 panel.append(form);
 let loaded=false,waiting=false,serverVersion=0;
 const today=()=>new __f4.globals.Date(__f4.globals.Date.now()+7*3600000).toISOString().slice(0,10);
 const dateAt=value=>{
  if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value||''))return null;
  const date=new __f4.globals.Date(value+'T00:00:00Z');
  return __f4.globals.Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?date:null;
 };
 const format=date=>new __f4.globals.Intl.DateTimeFormat('id-ID',{
  weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'UTC'
 }).format(date);
 function nextOccurrence(){
  const now=dateAt(today());let date=new __f4.globals.Date(now);
  if(frequency.value==='weekly'){
   date.setUTCDate(date.getUTCDate()+((0,__f4.globals.Number)(weekday.value)-date.getUTCDay()+7)%7);
  }else if(frequency.value==='biweekly'){
   const base=dateAt(anchor.value);if(!base)return null;
   const cycles=__f4.globals.Math.max(0,__f4.globals.Math.ceil((now-base)/86400000/14));
   date=new __f4.globals.Date(base.getTime()+cycles*14*86400000);
  }else{
   const n=(0,__f4.globals.Number)(monthly.value),year=date.getUTCFullYear(),month=date.getUTCMonth();
   const occurrence=(y,m)=>new __f4.globals.Date(__f4.globals.Date.UTC(y,m,__f4.globals.Math.min(n,new __f4.globals.Date(__f4.globals.Date.UTC(y,m+1,0)).getUTCDate())));
   date=occurrence(year,month);
   if(date<now)date=occurrence(year,month+1);
  }
  return date;
 }
 function update(){
  weekdayField.hidden=frequency.value==='monthly'||frequency.value==='biweekly';
  anchorField.hidden=frequency.value!=='biweekly';
  monthField.hidden=frequency.value!=='monthly';
  if(frequency.value==='biweekly'&&dateAt(anchor.value))
   weekday.value=(0,__f4.globals.String)(dateAt(anchor.value).getUTCDay());
  const next=nextOccurrence();
  preview.textContent=next?'Penimbangan berikutnya: '+format(next):'Pilih tanggal penimbangan pertama.';
  const valid=!!next&&(frequency.value!=='biweekly'||!!dateAt(anchor.value));
  save.disabled=waiting||!loaded||!valid;
 }
 frequency.onchange=update;weekday.onchange=update;anchor.onchange=update;monthly.onchange=update;
 async function load(){
  waiting=true;update();
  try{
   const data=await get('/api/public/bank/weighing-schedule');
   if(!__f4.globals.Number.isInteger(data.weekday)||data.weekday<0||data.weekday>6)
    throw (0,__f4.globals.Error)('Jadwal dari server tidak valid.');
   serverVersion=(0,__f4.globals.Number)(data.schemaVersion)||1;
   frequency.value=['weekly','biweekly','monthly'].includes(data.frequency)?data.frequency:'weekly';
   weekday.value=(0,__f4.globals.String)(data.weekday);
   anchor.value=dateAt(data.anchorDate)?data.anchorDate:today();
   monthly.value=(0,__f4.globals.String)(data.dayOfMonth>=1&&data.dayOfMonth<=31?data.dayOfMonth:1);
   loaded=true;
   status.textContent=serverVersion>=2?'Jadwal aktif telah dimuat.':'Layanan jadwal sedang diperbarui.';
  }catch(error){loaded=false;status.textContent='Gagal memuat jadwal: '+safe(error);}
  finally{waiting=false;update();}
 }
 form.onsubmit=async event=>{
  event.preventDefault();if(save.disabled||waiting)return;
  const rule={frequency:frequency.value,weekday:(0,__f4.globals.Number)(weekday.value)};
  if(rule.frequency==='biweekly')rule.anchorDate=anchor.value;
  if(rule.frequency==='monthly')rule.dayOfMonth=(0,__f4.globals.Number)(monthly.value);
  waiting=true;update();status.textContent='Menyimpan jadwal…';
  try{
   const res=await (0,__f4.globals.fetch)(API+'/api/superadmin/bank/weighing-schedule',{
    method:'POST',credentials:'include',cache:'no-store',
    headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify(rule)
   });
   const data=await res.json().catch(()=>({}));
   if(!res.ok||data.ok===false)throw (0,__f4.globals.Error)(data.error||'HTTP '+res.status);
   if(data.frequency!==rule.frequency||
      (rule.frequency==='biweekly'&&data.anchorDate!==rule.anchorDate)||
      (rule.frequency==='monthly'&&(0,__f4.globals.Number)(data.dayOfMonth)!==rule.dayOfMonth))
    throw (0,__f4.globals.Error)('Server belum mengonfirmasi pola jadwal yang dipilih.');
   status.textContent='Jadwal tersimpan. '+preview.textContent;
   loaded=true;serverVersion=(0,__f4.globals.Number)(data.schemaVersion)||serverVersion;
  }catch(error){status.textContent='Gagal menyimpan: '+safe(error);}
  finally{waiting=false;update();}
 };
 load();
}

function openEditor(kind){
 if(role!=='superadmin')return;
 const target=__f4.globals.Object.entries(submenu).find(([,items])=>items.some(([key])=>key===kind));
 if(!target)return;
 const viewToken=__f4.globals.F4PortalNavigation?.beginView();
 try{
 const switched=active!==kind,priorGroup=group;
 active=kind;group=target[0];
 if(priorGroup!==group||!side.querySelector('button.active'))sidebar(group);
 if(kind==='residents'||kind==='bankcatalog')__f4.window.f4CancelSuperadminEditor?.();
 if(kind==='residents')__f4.window.openWarga();
 else if(kind==='bankcatalog')catalogPage();
 else if(kind==='bank_weighing')bankWeighingPage();
 else if(typeof __f4.window.openSuperadminEditor==='function')__f4.window.openSuperadminEditor(kind);
 else title('Memuat Modul','Editor sedang disiapkan…');
 if(switched){
  const smooth=(0,__f4.globals.matchMedia)('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  main.scrollTo?.({top:0,behavior:smooth});
 }
 f4SaRememberRoute();
 }finally{__f4.globals.F4PortalNavigation?.endView(viewToken??null)}
}
__f4.window.f4SuperadminSwitchModule=openEditor;
function overview(){
 title('Pusat pengelolaan','Administrasi warga Flamboyan 4');
 const cards=el('div',__f4.globals.undefined,'sa-grid sa-overview-grid');main.append(cards);
 for(const [key,label,icon,go] of [
  ['accounts','Akun terdaftar','user',()=>open('accounts')],
  ['houses','Unit rumah','home',()=>openEditor('residents')],
  ['projects','Projek portal','project',()=>openEditor('projects')]
 ]){
  const item=button('',go,'sa-card');
  const symbol=el('img');symbol.src='/assets/icons/'+icon+'.svg';symbol.alt='';
  item.append(symbol);
  item.append(el('small',label),el('strong','—'),el('span','Memeriksa data'));
  item.dataset.card=key;cards.append(item);
 }
 const status=el('div',__f4.globals.undefined,'sa-overview-status');
 const state=el('span','Memeriksa koneksi…','sa-overview-state');
 status.append(state);main.querySelector('.f4-work-heading').append(status);
 const workspace=el('section',__f4.globals.undefined,'sa-work-menu');
 const head=el('header');head.append(el('h3','Ruang kerja'));
 const search=el('input');search.type='search';search.placeholder='Cari menu, misalnya jadwal timbang';search.setAttribute('aria-label','Cari menu pengelolaan');
 head.append(search);workspace.append(head);main.append(workspace);
 const list=el('div',__f4.globals.undefined,'sa-work-groups');
 const empty=el('p','Menu tidak ditemukan. Coba nama kegiatan atau jenis data.');empty.hidden=true;
 workspace.append(list,empty);
 const workflows=[
  ['Warga & akses','user',[['Data warga dan rumah','residents'],['Akun & hak akses','accounts'],['Kewajiban iuran','obligations']]],
  ['Keuangan & aturan','cash',[['Posisi kas lintas program','treasury'],['Tarif iuran','tariffs'],['Aturan tanggal','settings']]],
  ['Bank Sampah','bank',[['Jadwal timbang','bank_weighing'],['Jenis sampah & harga','bankcatalog'],['Kegiatan Bank Sampah','bank_progress'],['Dokumentasi Bank Sampah','bank_albums'],['Inventaris Bank Sampah','bank_inventory']]],
  ['Publikasi & kegiatan','calendar',submenu.content.map(([id,label])=>[label,id])]
 ];
 for(const [label,icon,destinations] of workflows){
  const area=el('section'),heading=el('h4'),glyph=el('img');
  glyph.src='/assets/icons/'+icon+'.svg';glyph.alt='';heading.append(glyph,__f4.globals.document.createTextNode(label));area.append(heading);
  for(const [name,id] of destinations){
   const action=button(name,()=>groups.some(([key])=>key===id)?open(id):openEditor(id),'sa-work-link');
   action.dataset.search=(label+' '+name).toLocaleLowerCase('id');area.append(action);
  }
  list.append(area);
 }
 search.oninput=()=>{
  const words=search.value.trim().toLocaleLowerCase('id').split(/\s+/);
  for(const area of list.children){
   for(const action of area.querySelectorAll('button'))action.hidden=!words.every(word=>action.dataset.search.includes(word));
   area.hidden=!area.querySelector('button:not([hidden])');
  }
  empty.hidden=!!list.querySelector('section:not([hidden])');
 };
 const pulls=[['accounts','/api/superadmin/accounts/preview'],['houses','/api/v2/admin/residents'],['projects','/api/v2/admin/content/projects']];
 __f4.globals.Promise.allSettled(pulls.map(async ([id,path])=>{
  const card=cards.querySelector('[data-card="'+id+'"]');
  try{
   const result=rows(await get(path));
   if(!card?.isConnected)return;
   const count=id==='houses'?new __f4.globals.Set(result.map(r=>r.household_id).filter(__f4.globals.Boolean)).size:result.length;
   card.querySelector('strong').textContent=(0,__f4.globals.String)(count);
   card.querySelector('span').textContent={accounts:'Kelola akses',houses:'Lihat data warga',projects:'Kelola projek'}[id];
  }catch(error){
   if(card?.isConnected){
    card.querySelector('strong').textContent='—';
    card.querySelector('span').textContent='Gagal dimuat';
    card.title=safe(error);
   }
   throw error;
  }
 })).then(results=>{
  if(!status.isConnected)return;
  const failed=results.filter(result=>result.status==='rejected').length;
  state.className='sa-overview-state'+(failed?' is-warning':'');
  state.textContent=failed?failed+' layanan perlu diperiksa':'● Sistem terhubung';
  if(failed){
   const link=button('Periksa layanan',()=>open('audit'),'sa-action');
   status.append(link);
  }
 });
}
// Match original Bank Sampah account-management table, add centralized role.
let accountRoleFilter='',accountStatusFilter='',accountRequestSerial=0;
const normalizedRole=(value)=>{
 const role=(0,__f4.globals.String)(value||'').trim().toLowerCase();
 if(['warga','anggota','member','resident'].includes(role))return 'anggota';
 if(['superadmin','super_admin','super-admin'].includes(role))return 'superadmin';
 if(['admin','administrator'].includes(role))return 'admin';
 return role||'publik';
};
function accountName(a){return value(a,['nama','name','display_name','full_name','username'])||'Tanpa nama'}
function accountHouse(a){return value(a,['rumah','house','house_code','nomor_rumah','unit'])}
function accountUser(a){return value(a,['username','user_name','login'])}
function accountId(a){return value(a,['wargaId','warga_id','member_id','payer_id','resident_id'])}
function accountStatus(a){
 const enabled=a.aktif??a.active??a.is_active;
 if(enabled===false||enabled===0||enabled==='0')return 'Nonaktif';
 const state=(0,__f4.globals.String)(a.status||a.account_status||'').trim();
 if(/nonaktif|inactive|disabled|suspend/i.test(state))return 'Nonaktif';
 if(a.perluAktivasi||/pending|belum/i.test(state))return 'Belum aktif';
 if(enabled===true||enabled===1||enabled==='1'||/aktif|active/i.test(state))return 'Aktif';
 // Display status only when an explicit account status is available from API.
 return '—';
}

async function manageAccount(a,action){
 const old=accountName(a),house=accountHouse(a),username=accountUser(a);
 const shade=el('div',__f4.globals.undefined,'sa-account-shade'),panel=el('section',__f4.globals.undefined,'sa-account-modal');
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
 const heading=el('h3',action==='edit'?'Edit nama warga':action==='deactivate'?'Nonaktifkan akun':'Pergantian penghuni');
 const subtitle=el('p',old+' · '+house+' · '+username,'sa-account-subtitle');
 const msg=el('p',action==='handover'?'Penghuni lama tetap tercatat dalam riwayat keuangan dan tabungan. Penghuni baru mendapat ID serta akun terpisah.':action==='deactivate'?'Akun dinonaktifkan tanpa menghapus transaksi dan riwayatnya.':'Hanya untuk koreksi nama pemilik yang sama. Jika orangnya berubah, pilih Ganti penghuni.','sa-account-info');
 const form=el('form');
 let name,user;
 if(action!=='deactivate'){
  const label=el('label','Nama lengkap');name=el('input');name.required=true;name.minLength=2;name.maxLength=160;name.value=action==='edit'?old:'';
  label.append(name);form.append(label);
 }
 if(action==='handover'){
  const label=el('label','Username baru (berbeda dari pemilik lama)');
  user=el('input');user.required=true;user.pattern='[a-z0-9][a-z0-9-]{3,39}';user.placeholder=(username||'warga')+'-2';
  label.append(user);form.append(label);
 }
 const feedback=el('p','','sa-account-feedback');feedback.setAttribute('role','status');
 const buttons=el('div',__f4.globals.undefined,'sa-account-modal-actions');
 const cancel=button('Batal',()=>shade.remove(),'sa-account-reset');
 const save=button(action==='handover'?'Ganti penghuni':action==='deactivate'?'Ya, Nonaktifkan':'Simpan',()=>{},'sa-action sa-action-primary');
 save.type='submit';buttons.append(cancel,save);form.append(feedback,buttons);panel.append(heading,subtitle,msg,form);shade.append(panel);__f4.globals.document.body.append(shade);
 shade.onclick=e=>{if(e.target===shade)shade.remove()};
 form.onsubmit=async e=>{
  e.preventDefault();save.disabled=true;feedback.textContent='Memproses perubahan…';
  const payload={action,accountId:a.id};
  if(name)payload.name=name.value.trim();
  if(user){payload.username=user.value.trim().toLowerCase();payload.confirmation='GANTI PENGHUNI'}
  if(action==='deactivate')payload.confirmation='NONAKTIFKAN AKUN';
  try{
   const r=await (0,__f4.globals.fetch)(API+'/api/superadmin/accounts/manage-member',{method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify(payload)});
   const data=await r.json().catch(()=>({}));if(!r.ok||data.ok===false)throw (0,__f4.globals.Error)(data.error||'HTTP '+r.status);
   feedback.textContent=action==='handover'?'Selesai. Username baru: '+data.username+' · Password awal: '+data.passwordAwal+'. Berikan secara pribadi.':
    action==='deactivate'?'Akun lama nonaktif; riwayatnya tetap disimpan.':'Nama berhasil diperbarui.';
   save.disabled=false;save.textContent='Tutup';
   form.onsubmit=e=>{e.preventDefault();shade.remove();accountsPage()};
  }catch(error){feedback.textContent='Gagal: '+error.message;save.disabled=false}
 };
 if(name)name.focus();else save.focus();
}
async function accountRequest(a,operation){
 const id=(0,__f4.globals.String)(a?.id||'');
 if(!/^account:[A-Za-z0-9_-]{1,100}$/.test(id)||(0,__f4.globals.String)(a?.role)!=='anggota')
   throw (0,__f4.globals.Error)('Akun anggota tidak valid.');
 const activation=operation==='activate';
 const path=activation?'/api/superadmin/accounts/activate-member':'/api/superadmin/accounts/reset-member';
 const payload={accountId:id,confirmation:activation?'AKTIFKAN AKUN WARGA':'RESET PASSWORD WARGA'};
 const res=await (0,__f4.globals.fetch)(API+path,{method:'POST',credentials:'include',cache:'no-store',
  headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify(payload)});
 const result=await res.json().catch(()=>({}));
 if(!res.ok||result.ok===false)throw (0,__f4.globals.Error)(result.error||'HTTP '+res.status);
 return result;
}
async function accountSingleAction(a,operation,control){
 const activation=operation==='activate',username=accountUser(a);
 if(!await __f4.window.f4UiDialog.confirm((activation?'Aktifkan akun ':'Reset password akun ')+username+'? Password awal akan menjadi 1234'+(activation?'.':', dan semua sesi lama akan dikeluarkan.') ))return;
 control.disabled=true;
 try{
  const result=await accountRequest(a,operation);
  await __f4.window.f4UiDialog.alert((activation?'Akun aktif.':'Password direset.')+'\nUsername: '+(result.username||username)+'\nPassword awal: '+(result.passwordAwal||'1234')+'\nSampaikan secara pribadi kepada warga.');
  accountsPage();
 }catch(e){await __f4.window.f4UiDialog.alert('Perubahan akun gagal: '+safe(e));control.disabled=false}
}
function accountsPage(){
 title('Akun & Hak Akses','Kelola identitas dan hak akses akun Flamboyan 4.');
 const pageHeading=main.querySelector('.f4-work-heading');if(pageHeading){pageHeading.classList.replace('f4-work-heading','sa-accounts-page-heading');}
 const panel=el('section',__f4.globals.undefined,'sa-accounts-shell');
 const heading=el('div',__f4.globals.undefined,'sa-account-head'),head=el('div');
 head.append(el('h3','Daftar Akun'));
 const actions=el('div',__f4.globals.undefined,'sa-account-actions');
 const prepare=button('Siapkan semua akun',async()=>{
  const pending=accounts.filter(a=>a.role==='anggota'&&a.perluAktivasi===true);
  if(!pending.length)return;
  if(!await __f4.window.f4UiDialog.confirm('Aktifkan '+pending.length+' akun anggota yang belum aktif? Password awal setiap akun: 1234. Akun yang sudah aktif tidak berubah.'))return;
  prepare.disabled=true;
  let made=0;
  try{
   for(const a of pending){await accountRequest(a,'activate');made++}
   await __f4.window.f4UiDialog.alert(made+' akun berhasil diaktifkan. Berikan username dan password awal 1234 langsung kepada warga.');
  }catch(error){await __f4.window.f4UiDialog.alert(made+' akun berhasil diaktifkan sebelum proses berhenti: '+safe(error))}
  accountsPage();
 },'sa-action sa-action-primary');
 prepare.disabled=true;prepare.title='Memeriksa akun yang belum aktif';
 actions.append(prepare);
 heading.append(head);panel.append(heading);
 const noticeBox=el('p','Aktivasi dan reset akun anggota. Hak akses pengurus dikelola terpisah.','sa-account-note');
 panel.append(noticeBox);
 const listWrap=el('div',__f4.globals.undefined,'sa-account-table');
 const filters=el('div',__f4.globals.undefined,'sa-account-filters');
 const input=el('input');input.placeholder='Cari nama, rumah atau username…';
 input.setAttribute('aria-label','Cari akun warga');input.value=accountSearch;
 input.oninput=()=>{accountSearch=input.value;paintAccounts()};
 const filter=el('select');filter.id='sa-role-filter';filter.setAttribute('aria-label','Filter peran akun');
 for(const [v,label] of [['','Semua peran'],['anggota','Anggota'],['admin','Admin'],['superadmin','Superadmin']])
   filter.add(new __f4.globals.Option(label,v));
 filter.value=accountRoleFilter;
 filter.onchange=()=>{accountRoleFilter=filter.value;paintAccounts()};
 const accountReload=button('Muat ulang',()=>accountsPage(),'sa-action');accountReload.title='Muat ulang daftar akun';accountReload.setAttribute('aria-label','Muat ulang');
 const searchRow=el('div',__f4.globals.undefined,'sa-account-search-row');
 searchRow.append(input,accountReload);
 const filterRow=el('div',__f4.globals.undefined,'sa-account-filter-row');
 const roleSlot=el('div',__f4.globals.undefined,'sa-account-filter-slot');roleSlot.append(filter);
 const statusSlot=el('div',__f4.globals.undefined,'sa-account-filter-slot');
 const stats=el('p','', 'sa-account-count');stats.id='sa-account-count';stats.dataset.f4Count='accounts';
 const statusFilter=el('select');statusFilter.id='sa-status-filter';statusFilter.setAttribute('aria-label','Filter status akun');
 for(const [key,label] of [['','Semua status'],['Aktif','Aktif'],['Belum aktif','Belum aktif'],['Nonaktif','Nonaktif'],['—','Status belum tercatat']]){
  statusFilter.add(new __f4.globals.Option(label,key));
 }
 statusFilter.value=accountStatusFilter;
 statusFilter.onchange=()=>{accountStatusFilter=statusFilter.value;paintAccounts()};
 statusSlot.append(statusFilter);filterRow.append(roleSlot,statusSlot,actions,stats);filters.append(searchRow,filterRow);
 const loadState=el('p',__f4.globals.undefined,'f4-admin-note');panel.append(loadState);
 const loadToken=__f4.globals.F4Loading.begin(loadState,'Memuat daftar akun…');
 listWrap.append(filters);
 const scroll=el('div',__f4.globals.undefined,'sa-account-scroll');
 const table=el('table',__f4.globals.undefined,'sa-account-grid');
 const thead=el('thead'),tr=el('tr');
 for(const name of ['Nama warga','Rumah','Username','Role','Status','Aksi'])tr.append(el('th',name));
 thead.append(tr);table.append(thead);
 const tbody=el('tbody');tbody.id='sa-accounts';table.append(tbody);scroll.append(table);listWrap.append(scroll);
 panel.append(listWrap);main.append(panel);
 const serial=++accountRequestSerial;
 get('/api/superadmin/accounts/preview').then(data=>{
  if(serial!==accountRequestSerial||!main.contains(panel))return;
  accounts=rows(data);
  const counts=new __f4.globals.Map();
  for(const account of accounts){
   const state=accountStatus(account);
   counts.set(state,(counts.get(state)||0)+1);
  }
  for(const option of statusFilter.options){
   option.textContent+=' ('+(option.value?(counts.get(option.value)||0):accounts.length)+')';
  }
  const pending=accounts.filter(a=>a.role==='anggota'&&a.perluAktivasi===true);
  prepare.disabled=!pending.length;
  prepare.title=pending.length?'Aktifkan '+pending.length+' akun anggota yang belum aktif':'Tidak ada akun anggota yang perlu diaktifkan';
  __f4.globals.F4Loading.success(loadState,loadToken);
  paintAccounts();
 }).catch(error=>{
  if(serial!==accountRequestSerial||!main.contains(panel))return;
  __f4.globals.F4Loading.error(loadState,'Daftar akun belum dapat dibaca: '+safe(error),loadToken);
  stats.textContent='';
  tbody.replaceChildren(el('tr',__f4.globals.undefined,'sa-account-error'));
  const cell=el('td','Sambungan akun perlu diperiksa.');cell.colSpan=6;tbody.lastChild.append(cell);
 });
}
function compactAccountAction(control,kind){
 // Unmodified Lucide 0.456.0 SVG geometry (lucide-icons/lucide, ISC/MIT).
 const icons={
  "activate": "<path d=\"M2 21a8 8 0 0 1 13.292-6\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"m16 19 2 2 4-4\" />",
  "reset": "<path d=\"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z\" /><circle cx=\"16.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />",
  "edit": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /><path d=\"m15 5 4 4\" />",
  "deactivate": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m15 9-6 6\" /><path d=\"m9 9 6 6\" />",
  "handover": "<path d=\"m16 3 4 4-4 4\" /><path d=\"M20 7H4\" /><path d=\"m8 21-4-4 4-4\" /><path d=\"M4 17h16\" />"
};
 const label=control.textContent;
 const svg=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','24');svg.setAttribute('height','24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
 svg.innerHTML=icons[kind];
 control.setAttribute('aria-label',label);if(!control.title)control.title=label;
 // This action already owns its SVG. Opt out of the global table icon rewriter.
 control.setAttribute('data-f4-keep-label','');
 control.classList.add('sa-account-icon-action');control.replaceChildren(svg);return control;
}
function paintAccounts(){
 const tbody=__f4.globals.document.getElementById('sa-accounts');
 const count=__f4.globals.document.getElementById('sa-account-count');
 if(!tbody||!count)return;
 const term=accountSearch.trim().toLowerCase(),roleFilter=accountRoleFilter;
 const filtered=accounts.filter(a=>{
  const role=normalizedRole(a.role||a.peran||a.account_role);
  if(roleFilter&&role!==roleFilter)return false;
  if(accountStatusFilter&&accountStatus(a)!==accountStatusFilter)return false;
  return [accountName(a),accountHouse(a),accountUser(a),accountId(a),role]
    .join(' ').toLowerCase().includes(term);
 });
 count.textContent=filtered.length+' dari '+accounts.length+' akun';
 tbody.replaceChildren();
 for(const a of filtered){
  const tr=el('tr');
  const name=el('td'),namelabel=el('strong',accountName(a));
  name.append(namelabel);
  // Account/member IDs remain internal for editing and audits; no IDs on list cards.
  const house=el('td',accountHouse(a)||'—');
  const user=el('td',accountUser(a)||'—');
  const role=el('td'),tag=el('span',({anggota:'Anggota',admin:'Admin',superadmin:'Superadmin'})[normalizedRole(a.role||a.peran||a.account_role)]||'Publik','sa-account-role');
  tag.dataset.role=normalizedRole(a.role||a.peran||a.account_role);role.append(tag);
  const status=el('td',__f4.globals.undefined,'sa-account-status'),statusLabel=el('span',accountStatus(a));
  statusLabel.dataset.status=accountStatus(a);status.append(statusLabel);
  const action=el('td');
  const member=normalizedRole(a.role||a.peran||a.account_role)==='anggota';
  const canActivate=member&&a.perluAktivasi===true;
  const canReset=member&&accountStatus(a)==='Aktif';
  if(canActivate||canReset){
   const operation=canActivate?'activate':'reset';
   const control=button(canActivate?'Aktifkan':'Reset password',()=>accountSingleAction(a,operation,control),'sa-account-reset');
   control.title=canActivate?'Aktifkan akun anggota':'Reset password anggota ke 1234 dan putuskan sesi lama';
   action.append(compactAccountAction(control,operation));
  }
  if(member&&accountStatus(a)==='Aktif'){
   action.append(compactAccountAction(button('Edit',()=>manageAccount(a,'edit'),'sa-account-manage'),'edit'));
   action.append(compactAccountAction(button('Nonaktifkan',()=>manageAccount(a,'deactivate'),'sa-account-manage sa-account-warning'),'deactivate'));
   action.append(compactAccountAction(button('Ganti penghuni',()=>manageAccount(a,'handover'),'sa-account-manage'),'handover'));
  }
  if(!action.children.length)action.append(el('span','—'));
  tr.append(name,house,user,role,status,action);
  tbody.append(tr);
 }
 if(!filtered.length){
  const tr=el('tr'),cell=el('td','Tidak ada akun yang cocok.');cell.colSpan=6;tr.append(cell);tbody.append(tr);
 }
}
async function catalogPage(){
 title('Harga Sampah');
 const info=notice('');const loadingToken=__f4.globals.F4Loading.begin(info,'Memuat daftar jenis dan harga…');
 const wrap=el('div',__f4.globals.undefined,'f4-obligation-scroll');
 const table=el('table',__f4.globals.undefined,'f4-obligation-grid');table.dataset.module='bankcatalog';
 const head=el('thead'),tr=el('tr');
 for(const label of ['Jenis barang','Harga/kg','Sumber data','Status'])tr.append(el('th',label));
 head.append(tr);table.append(head);
 const body=el('tbody');table.append(body);wrap.append(table);main.append(wrap);
 // Referensi harga yang pernah diberikan pengelola. Ini bukan transaksi maupun record D1.
 const reference=[['Besi',5000],['Baja Ringan',4000],['Kardus',2000],['Duplex',700],['Gabruk','1500–1700'],
  ['Aluminium Kaleng',25000],['Kaleng',2500],['Gelas Plastik Bersih',4000],
  ['Botol/Gelas Plastik Kotor',2000],['Botol Aqua Bodong',4500],['Galon',3000]];
 const norm=x=>(0,__f4.globals.String)(x||'').toLocaleLowerCase('id-ID').replace(/[^a-z0-9]/g,'');
 const money=n=>typeof n==='number'?'Rp '+n.toLocaleString('id-ID'):'Rp '+n+' (kisaran)';
 const priceOf=x=>{for(const key of ['harga_lapak','harga','harga_per_kg','harga_lapak_rp','price_per_kg_rp','price_rp','price_per_kg','price','unit_price_rp','buy_price_rp'])if(x[key]!=null&&x[key]!=='')return x[key];return null;};
 const draw=(saved,problem='')=>{
  body.replaceChildren();
  const actual=new __f4.globals.Map(saved.map(x=>[norm(value(x,['nama','nama_barang','jenis','name','item_name'])),x]));
  const all=reference.map(([name,price])=>({name,price,item:actual.get(norm(name))}));
  for(const x of saved)if(!reference.some(([name])=>norm(name)===norm(value(x,['nama','nama_barang','jenis','name','item_name']))))
    all.push({name:value(x,['nama','nama_barang','jenis','name','item_name'])||'Jenis tanpa nama',price:null,item:x});
  for(const x of all){
   const row=el('tr');
   const current=x.item&&priceOf(x.item);
   row.append(el('td',x.name),el('td',current==null?(x.price==null?'—':money(x.price)):money((0,__f4.globals.Number)(current)||current)),
    el('td',x.item?'Data aktif':'Harga lama'),el('td',x.item?'Tercatat':'Belum tercatat'));
   body.append(row);
  }
  const missing=all.filter(x=>!x.item).length;
  if(problem)__f4.globals.F4Loading.error(info,'Daftar harga belum dapat dibaca: '+problem,loadingToken);
  else if(missing)__f4.globals.F4Loading.empty(info,missing+' jenis acuan belum tersedia.',loadingToken);
  else __f4.globals.F4Loading.success(info,loadingToken);
 };
 try{
  const d=await get('/api/v2/admin/bank/catalog');
  if(active!=='bankcatalog'||!main.contains(info))return;
  draw(rows(d));
 }catch(e){if(active==='bankcatalog'&&main.contains(info))draw([],safe(e))}
 main.append(el('p','Harga lama hanya untuk perbandingan. Ubah harga melalui pengelolaan Bank Sampah.','sa-warn'));
}
function wargaForm(mode,row={}){
 if(role!=='superadmin')return;
 const isHouse=mode.endsWith('house'),isNew=mode.startsWith('add_');
 title((isNew?'Tambah ':'Edit ')+(isHouse?'Rumah':'Warga'),'Kelola data warga dan rumah.');
 const card=section('Informasi '+(isHouse?'rumah':'warga')),form=el('form',__f4.globals.undefined,'f4-admin-editor'),grid=el('div',__f4.globals.undefined,'f4-admin-fields');
 const houseFields=[['rumah','Nomor rumah','text',true],['nama_pemilik','Nama pemilik','text'],['kontak_pemilik','Nomor HP pemilik','tel'],['status_rumah','Status rumah','text'],['tipe_unit','Tipe unit','text'],['keterangan_rumah','Keterangan','textarea']];
 const residentFields=[['nama','Nama warga','text',true],['status_tinggal','Status tinggal','text'],['status_aktif','Status aktif','text'],['nomor_hp','Nomor HP','tel'],['keterangan_warga','Keterangan','textarea']];
 const fields=isHouse?houseFields:residentFields;
 if(!isHouse&&isNew){
  const outer=el('label');outer.append(el('span','Pilih rumah'));
  const select=el('select');select.name='household_id';select.required=true;select.append(new __f4.globals.Option('Pilih rumah',''));
  for(const [id,code] of new __f4.globals.Map(residentRows.map(x=>[x.household_id,x.rumah]))){if(id&&code)select.append(new __f4.globals.Option(code,id))}
  outer.append(select);grid.append(outer);
 }
 for(const [key,label,type,required] of fields){
  const outer=el('label');outer.append(el('span',label));
  const control=el(type==='textarea'?'textarea':'input');
  if(type!=='textarea')control.type=type;
  control.name=key;control.required=!!required;control.value=(0,__f4.globals.String)(row[key]??'');
  const examples={rumah:'Contoh: A5/41',nama_pemilik:'Contoh: Pak Heri',kontak_pemilik:'Contoh: 081234567890',status_rumah:'Contoh: Dihuni / Kosong / Disewakan',tipe_unit:'Contoh: Rumah tinggal',keterangan_rumah:'Contoh: Rumah kosong, pemilik tinggal di luar kota',nama:'Contoh: Pak Heri (Ali)',status_tinggal:'Contoh: Pemilik / Penyewa / Penghuni',status_aktif:'Contoh: Aktif',nomor_hp:'Contoh: 081234567890',keterangan_warga:'Contoh: Humas / Ketua RT / Kebersihan 2x'};
  control.placeholder=examples[key]||'Isi '+label.toLowerCase();
  if(type==='textarea')control.rows=3;
  outer.append(control);grid.append(outer);
 }
 form.append(grid);const note=el('p','','f4-admin-note'),actions=el('div',__f4.globals.undefined,'f4-warga-form-actions');
 const save=button(isNew?'Tambah':'Simpan Perubahan',()=>{if(form.reportValidity())form.dispatchEvent(new __f4.globals.Event('submit',{bubbles:true,cancelable:true}))},'f4-admin-primary');
 actions.append(button('Batal',openWarga,'sa-action'),save);form.append(note,actions);card.append(form);
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const data={action:mode};
  for(const control of form.querySelectorAll('[name]')){
   const val=(0,__f4.globals.String)(control.value||'').trim();
   if(control.required&&!val){note.textContent=control.name+' wajib diisi.';control.focus();return}
   data[control.name]=val;
  }
  if(mode==='edit_house')data.household_id=row.household_id;
  if(mode==='edit_resident'){data.payer_id=row.payer_id;data.active=row.active!==0}
  save.disabled=true;note.textContent='Menyimpan perubahan…';
  try{
   const response=await (0,__f4.globals.fetch)(API+'/api/v2/admin/residents',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify(data)});
   const result=await response.json().catch(()=>({}));
   if(!response.ok||result.ok===false)throw (0,__f4.globals.Error)(result.error||'HTTP '+response.status);
   await openWarga();
   const message=el('p','Data berhasil disimpan.','sa-chip');main.insertBefore(message,main.children[1]||null);
  }catch(e){note.textContent='Gagal menyimpan: '+safe(e)}
  finally{save.disabled=false}
 });
}
async function openWarga(){
 active='residents';group='masters';
 if(!side.querySelector('button.active'))sidebar('masters');
 title('Data Warga & Rumah','Master lintas portal — identitas dan nomor rumah dikelola satu kali');
 const bar=el('div',__f4.globals.undefined,'sa-controls sa-resident-controls f4-controls'),search=el('input');search.placeholder='Cari warga atau rumah';
 const houseButton=button('Tambah Rumah',()=>wargaForm('add_house'),'sa-action sa-resident-icon-action');
 houseButton.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6"/><path d="M18 12v7m-3-3h6"/></svg>';
 houseButton.title='Tambah Rumah';houseButton.setAttribute('aria-label','Tambah Rumah');
 const residentButton=button('Tambah Warga',()=>wargaForm('add_resident'),'sa-action sa-resident-icon-action');
 residentButton.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 12-5M19 14v7m-3.5-3.5h7"/></svg>';
 residentButton.title='Tambah Warga';residentButton.setAttribute('aria-label','Tambah Warga');
 const reloadButton=button('Muat ulang',openWarga,'sa-action sa-resident-icon-action');
 reloadButton.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.1 5.4M20 4v7h-7"/></svg>';
 reloadButton.title='Muat ulang';reloadButton.setAttribute('aria-label','Muat ulang');
 // Pencarian dan tiga aksi berada pada SATU baris di HP.
 const searchAndReload=el('div',__f4.globals.undefined,'f4-inline-search-refresh');
 reloadButton.classList.add('f4-search-refresh-button');
 searchAndReload.append(search,reloadButton);
 bar.append(searchAndReload,houseButton,residentButton);
 main.append(bar);const info=notice(''),list=el('div',__f4.globals.undefined,'sa-list');main.append(list);
 const loadToken=__f4.globals.F4Loading.begin(info,'Memuat data warga…');
 const render=()=>{list.replaceChildren();const q=search.value.toLowerCase();
  const wrap=el('div',__f4.globals.undefined,'sa-resident-scroll'),table=el('table',__f4.globals.undefined,'sa-resident-grid');
  const head=el('thead'),headrow=el('tr');
  for(const name of ['Nama warga','Nomor rumah','Status tinggal / rumah','Keterangan rumah','Kontak pemilik','Aksi'])headrow.append(el('th',name));
  head.append(headrow);table.append(head);
  const body=el('tbody');let count=0;
  for(const o of residentRows.filter(x=>__f4.globals.JSON.stringify(x).toLowerCase().includes(q))){
   count++;
   const tr=el('tr');
   const values=[value(o,['nama','nama_warga','nama_pemilik'])||('Rumah '+(value(o,['rumah'])||'belum bernomor')+' • Kosong'),
     value(o,['rumah'])||'—',
     value(o,['status_tinggal','status_rumah'])||'—',
     value(o,['keterangan_rumah','deskripsi_rumah'])||'—',
     value(o,['kontak_pemilik'])||'—'];
   for(const val of values)tr.append(el('td',val));
   const actions=el('td');actions.append(button('Edit',()=>wargaForm(o.payer_id?'edit_resident':'edit_house',o),'sa-action'));
   tr.append(actions);body.append(tr);
  }
  if(!count){const tr=el('tr'),td=el('td','Belum ada data yang cocok.');td.colSpan=6;tr.append(td);body.append(tr)}
  table.append(body);wrap.append(table);list.append(wrap);
 };search.oninput=render;
 try{residentRows=rows(await get('/api/v2/admin/residents'));render();if(residentRows.length)__f4.globals.F4Loading.success(info,loadToken);else __f4.globals.F4Loading.empty(info,'Belum ada data warga/rumah.',loadToken);}
 catch(e){__f4.globals.F4Loading.error(info,'Tidak dapat memuat data acuan: '+safe(e),loadToken)}
}
function auditPage(){
 title('Pengaturan & Audit','Pemeriksaan layanan, kontrol dan jejak perubahan');
 const status=section('Koneksi layanan');const list=el('div',__f4.globals.undefined,'sa-list');status.append(list);
 for(const [name,url] of [['Sesi autentikasi','/api/v2/auth/session'],['Master warga','/api/v2/admin/residents'],['Konten projek','/api/v2/admin/content/projects']]){
 const item=el('div',__f4.globals.undefined,'sa-item'),label=el('strong',name),state=el('span','Memeriksa…','sa-chip');item.append(label,state);list.append(item);
 get(url).then(()=>state.textContent='Terhubung').catch(e=>state.textContent='Perlu diperiksa');
 }
 const log=section('Audit & Cadangan');
 log.append(el('p','Riwayat perubahan dan cadangan belum tersedia untuk ditampilkan. Status ini tidak berarti data sudah dicadangkan.'));
 const btn=button('Periksa ulang koneksi',auditPage,'sa-action');status.append(btn);
}
__f4.window.openWarga=openWarga;
__f4.window.f4SuperadminNavigate=open;
async function boot(){
 try{
  const s=await get('/api/v2/auth/session');
  role=(0,__f4.globals.String)(s?.account?.role||s?.role||'').toLowerCase();
  if(role!=='superadmin')throw (0,__f4.globals.Error)('Hanya role Superadmin yang memiliki izin masuk. Silakan login dengan akun berwenang.');
  __f4.globals.document.body.classList.add('role-superadmin');guard.hidden=true;root.hidden=false;
  const own=new __f4.globals.URLSearchParams(__f4.globals.location.search).get('halaman')||__f4.globals.location.hash.replace(/^#sa-/,'');
  let requested=own.split('/')[0],initialModule=own.split('/')[1]||'';
  // Existing bookmarks to the removed duplicate Bagi Hasil open the restored schedule.
  if(requested==='bank'&&initialModule==='bank_split')initialModule='bank_weighing';
  // Match the parent URL before first paint; do not paint Overview and then
  // immediately replace it with Content/Data Acuan (visible as a flash).
  if(__f4.window.parent!==window){
   try{
    const parentFragment=new __f4.globals.URLSearchParams(__f4.window.parent.location.search).get('halaman')||__f4.window.parent.location.hash.match(/^#superadmin\/(overview|treasury|accounts|content|bank|masters|audit)$/)?.[1];
    if(parentFragment)requested=parentFragment;
   }catch{}
  }
  open(groups.some(x=>x[0]===requested)?requested:'overview',false);
  if(initialModule&&submenu[group]?.some(([key])=>key===initialModule))openEditor(initialModule);
  f4SaNav.ready=true;
  const canonical=new __f4.globals.URL(__f4.globals.location.href);canonical.searchParams.set('halaman',group+(active?'/'+active:''));canonical.hash='';
   __f4.globals.history.replaceState({...__f4.globals.history.state,f4SaDrawer:false,f4SaRoute:{group,kind:active}},'',canonical.pathname+canonical.search);
  if(__f4.window.parent!==window)__f4.window.parent.postMessage({type:'f4:ready',portal:'superadmin'},__f4.globals.location.origin);
 }catch(e){guard.replaceChildren(el('h2','Akses Portal Superadmin ditolak'),el('p',safe(e)));guard.append(button('Kembali ke Portal Utama',()=>{
   if(__f4.window.parent!==window)__f4.window.parent.postMessage({type:'f4:go-portal',portal:'portal'},__f4.globals.location.origin);
   else __f4.globals.location.href='/?f4ui=20261126-borderless-shell-v2';
 },'sa-action'));}
}
__f4.window.addEventListener('message',e=>{
 if(e.origin!==__f4.globals.location.origin||e.source!==__f4.window.parent)return;
 if(e.data?.type==='f4:superadmin-open-section'&&e.data.section!==group)open(e.data.section);
});
boot();
})();

});
