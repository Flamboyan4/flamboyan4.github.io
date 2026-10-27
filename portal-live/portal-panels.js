/* Four-portal staging adapter: show one Portal Utama content panel at a time.
   It reuses ALL existing DOM/forms/click handlers without rebuilding the old portal. */
(()=>{
'use strict';
const main=document.querySelector('body>main');if(!main)return;
const footer=document.getElementById('pembayaran');
const current={panel:'beranda',role:'public',privateKind:'iuran_rt'};
const finance=document.getElementById('keuangan');
const isMember=role=>['anggota','warga','member'].includes(String(role||'').toLowerCase());
let finBlock=null,scrollScheduled=false,lastVisible='';
const financeDisplayCache=new WeakMap();
const sectionTargets={
 beranda:document.querySelector('body>main>section:first-of-type'),
 keuangan:document.getElementById('keuangan'),
 projek:document.getElementById('projek'),
 inventaris:document.getElementById('container-inventaris-warga')||document.getElementById('kegiatan'),
 kalender:document.getElementById('rencana'),
 komentar:document.getElementById('komentar-warga'),
 pembayaran:footer
};
const el=(tag,text,cls)=>{const a=document.createElement(tag);if(text!==undefined)a.textContent=String(text);if(cls)a.className=cls;return a};
const prefersReduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function reportVisible(panel){
 if(panel===lastVisible)return;
 lastVisible=panel;
 (window.parent!==window?window.parent:window).postMessage({type:'f4:portal-visible-panel',panel},location.origin);
}
function visiblePanel(){
 if(scrollScheduled)return;
 scrollScheduled=true;
 requestAnimationFrame(()=>{
  scrollScheduled=false;
  // Scrollspy: the last section reaching the reading line is the active menu.
  const landmarks=[
   ['beranda',sectionTargets.beranda],
   ['keuangan',sectionTargets.keuangan],
   ['keuangan',document.getElementById('arisan')],
   ['projek',sectionTargets.projek],
   ['kalender',sectionTargets.kalender],
   ['inventaris',document.getElementById('kegiatan')],
   ['komentar',sectionTargets.komentar],
   ['pembayaran',footer]
  ];
  let active='beranda';
  for(const [name,node] of landmarks){
   if(node&&node.getBoundingClientRect().top<=150)active=name;
  }
  const atBottom=window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-12;
  if(atBottom&&footer)active='pembayaran';
  current.panel=active;
  reportVisible(active);
 });
}
function showPanel(panel){
 if(!Object.hasOwn(sectionTargets,panel))panel='beranda';
 current.panel=panel;
 if(panel==='keuangan'&&isMember(current.role))createFinanceTabs();
 const element=sectionTargets[panel]||sectionTargets.beranda;
 if(!element)return;
 const top=Math.max(0,window.scrollY+element.getBoundingClientRect().top-73);
 window.scrollTo({top,behavior:prefersReduced()?'auto':'smooth'});
 // Highlight immediately; scroll listener keeps it accurate as the view moves.
 reportVisible(panel);
}
window.addEventListener('scroll',visiblePanel,{passive:true});
window.addEventListener('resize',visiblePanel,{passive:true});
function createFinanceTabs(){
 if(!finance)return;
 if(!finBlock){
  finBlock=el('div',undefined,'f4-user-finance');
  finBlock.innerHTML='<div class="f4-user-finance-heading"><span class="f4-user-eyebrow">Laporan & pembayaran</span><p>Pantau laporan bersama atau catatan pembayaran sesuai akun.</p></div>'+
   '<div class="f4-user-finance-controls" role="group" aria-label="Pilihan laporan">'+
    '<button type="button" data-finance-mode="lingkungan" class="active">Laporan Lingkungan</button>'+
    '<button type="button" data-finance-mode="saya">Keuangan Saya</button></div>'+
   '<div id="f4-personal-finance" hidden>'+
    '<div class="f4-user-finance-intro"><span class="f4-user-finance-icon" aria-hidden="true">'+
     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 10h18M16 15h2"/></svg></span>'+
     '<div><h3>Riwayat Keuangan Pribadi</h3><p>Hanya menampilkan data milik akun yang sedang masuk.</p></div></div>'+
    '<div class="f4-user-finance-sub" role="group" aria-label="Kategori keuangan pribadi">'+
     '<button type="button" data-kind="iuran_rt">Iuran RT</button>'+
     '<button type="button" data-kind="kebersihan">Kebersihan</button>'+
     '<button type="button" data-kind="kas_lorong">Kas Lorong</button>'+
     '<button type="button" data-kind="arisan">Arisan</button>'+
     '<button type="button" data-kind="fines">Denda</button>'+
     '<button type="button" data-kind="loans">Pinjaman</button></div>'+
    '<div id="f4-personal-data" aria-live="polite"></div></div>';
  finance.insertBefore(finBlock,finance.firstChild);
  finBlock.querySelectorAll('[data-finance-mode]').forEach(b=>b.onclick=()=>setFinanceMode(b.dataset.financeMode==='saya'));
  finBlock.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>loadPersonal(b.dataset.kind));
 }
}
function setFinanceMode(own){
 if(!finance||!finBlock)return;
 const personal=finBlock.querySelector('#f4-personal-finance');
 const allowed=own&&isMember(current.role);
 finance.classList.toggle('f4-finance-personal-active',allowed);
 // CSS lama menggunakan display:grid!important pada kartu publik.
 // Override dengan inline !important, dan pulihkan tampilan aslinya nanti.
 for(const node of finance.children){
  if(node===finBlock)continue;
  if(allowed){
   if(!financeDisplayCache.has(node))
    financeDisplayCache.set(node,{
     value:node.style.getPropertyValue('display'),
     priority:node.style.getPropertyPriority('display')
    });
   node.style.setProperty('display','none','important');
  }else if(financeDisplayCache.has(node)){
   const previous=financeDisplayCache.get(node);
   if(previous.value)node.style.setProperty('display',previous.value,previous.priority);
   else node.style.removeProperty('display');
   financeDisplayCache.delete(node);
  }
 }
 if(personal)personal.hidden=!allowed;
 finBlock.querySelectorAll('[data-finance-mode]').forEach(b=>{
  const active=(b.dataset.financeMode==='saya')===allowed;
  b.classList.toggle('active',active);
  b.setAttribute('aria-pressed',String(active));
 });
 if(allowed)loadPersonal(current.privateKind);
}
let personalRequestSerial=0;
const personalYearByKind={};
async function loadPersonal(kind){
 const requestId=++personalRequestSerial;
 if(!isMember(current.role))return;
 current.privateKind=kind;
 const area=document.getElementById('f4-personal-data');if(!area)return;
 const loading=el('p','','f4-user-status');area.replaceChildren(loading);
 const loadToken=window.F4Loading?.begin(loading,'Memuat riwayat keuangan pribadi…');
 finBlock.querySelectorAll('[data-kind]').forEach(button=>{
  const selected=button.dataset.kind===kind;
  button.classList.toggle('active',selected);
  button.setAttribute('aria-pressed',String(selected));
 });
 // Rekening/penghuni ditentukan oleh sesi Worker, bukan parameter dari browser.
 const paths={iuran_rt:'/api/member/payments',kebersihan:'/api/member/payments',
  kas_lorong:'/api/member/payments',arisan:'/api/member/arisan',fines:'/api/member/fines',loans:'/api/member/loans'};
 const labels={iuran_rt:'Iuran RT',kebersihan:'Kebersihan',kas_lorong:'Kas Lorong',
  arisan:'Arisan',fines:'Denda',loans:'Pinjaman'};
 const money=value=>'Rp '+Number(value).toLocaleString('id-ID',{maximumFractionDigits:0});
 const amountOf=row=>{
  const raw=row.nominalRp??row.nominal??row.amount_rp??row.nilai_rp??row.jumlah_rp;
  if(raw===undefined||raw===null||raw==='')return null;
  const numeric=Number(raw);return Number.isFinite(numeric)?numeric:null;
 };
 const dateOf=row=>String(row.tanggal||row.paid_on||row.tanggal_bayar||row.created_at||'');
 const yearOf=row=>{
  const date=dateOf(row).match(/^(\d{4})/);
  // Bila tanggal transaksi kosong, tahun dari periode adalah fallback.
  return date?date[1]:(String(row.periode||'').match(/^(\d{4})/)||[])[1]||'unknown';
 };
 const niceDate=value=>{
  const match=String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(!match)return String(value||'—');
  return new Date(+match[1],+match[2]-1,+match[3]).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
 };
 try{
  const res=await fetch('https://api.flamboyan4.web.id'+paths[kind],{credentials:'include',cache:'no-store'});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.ok===false)throw Error(data.error||'HTTP '+res.status);
  if(requestId!==personalRequestSerial)return;
  const received=Array.isArray(data.rows)?data.rows:Array.isArray(data.data)?data.data:Array.isArray(data.transaksi)?data.transaksi:[];
  const types={iuran_rt:'IURAN_BULANAN',kebersihan:'KEBERSIHAN',kas_lorong:'KAS_LORONG'};
  const all=(types[kind]?received.filter(row=>row.jenis===types[kind]):received)
   .slice().sort((x,y)=>dateOf(y).localeCompare(dateOf(x)));
  window.F4Loading?.success(loading,loadToken);
  area.replaceChildren();
  const heading=el('div',undefined,'f4-user-category-heading');
  const head=el('h4',labels[kind]||'Riwayat');
  const filter=el('div',undefined,'f4-user-year-filter');
  filter.append(el('span','Tahun transaksi'));
  const currentYear=String(new Date().getFullYear());
  const years=[...new Set(all.map(yearOf).filter(y=>/^\d{4}$/.test(y)))].sort((a,b)=>b.localeCompare(a));
  const chosen=personalYearByKind[kind]??(years.includes(currentYear)?currentYear:(years[0]||currentYear));
  const options=[{value:'all',label:'Semua Tahun'},
   ...[...new Set([currentYear,...years])].sort((a,b)=>b.localeCompare(a)).map(year=>({value:year,label:year}))];
  if(all.some(row=>yearOf(row)==='unknown'))options.push({value:'unknown',label:'Tanpa tahun'});
  let selectedYear=options.some(option=>option.value===chosen)?chosen:currentYear;
  const picker=el('details',undefined,'f4-user-year-picker');
  const trigger=el('summary',undefined,'f4-user-year-trigger');
  trigger.setAttribute('aria-label','Pilih tahun transaksi');
  trigger.append(el('span',options.find(option=>option.value===selectedYear)?.label||selectedYear));
  const popup=el('div',undefined,'f4-user-year-popover');
  popup.setAttribute('aria-label','Daftar tahun transaksi');
  for(const option of options){
   const control=el('button',undefined,'f4-user-year-option');
   control.type='button';
   control.append(el('span',option.label));
   control.dataset.year=option.value;
   control.setAttribute('aria-pressed',String(option.value===selectedYear));
   control.onclick=()=>{
    selectedYear=option.value;
    trigger.firstElementChild.textContent=option.label;
    popup.querySelectorAll('[data-year]').forEach(button=>
     button.setAttribute('aria-pressed',String(button.dataset.year===selectedYear)));
    picker.open=false;
    renderYear();
    trigger.focus({preventScroll:true});
   };
   popup.append(control);
  }
  picker.append(trigger,popup);
  filter.append(picker);
  heading.append(head,filter);area.append(heading);
  const content=el('div',undefined,'f4-user-year-content');area.append(content);
  function renderYear(){
   if(requestId!==personalRequestSerial)return;
   const selected=selectedYear;
   personalYearByKind[kind]=selected;
   const list=selected==='all'?all:all.filter(row=>yearOf(row)===selected);
   content.replaceChildren();
   const period=selected==='all'?'seluruh tahun':selected==='unknown'?'tanpa tahun':'tahun '+selected;
   const counter=el('p',list.length+' catatan pada '+period,'f4-user-year-context');
   content.append(counter);
   if(!list.length){
    const empty=el('div',undefined,'f4-user-empty');
    empty.append(el('strong','Belum ada catatan '+(labels[kind]||'keuangan').toLowerCase()),
     el('p','Tidak ada transaksi yang tercatat untuk '+period+'. Silakan pilih tahun lain atau Semua Tahun.'));
    content.append(empty);return;
   }
   const amounts=list.map(amountOf).filter(value=>value!==null);
   const total=amounts.reduce((sum,value)=>sum+value,0);
   const stats=el('div',undefined,'f4-user-metrics');
   const metric=(label,value,style='')=>{
    const card=el('div',undefined,'f4-user-metric '+style);
    card.append(el('span',label),el('strong',value));return card;
   };
   stats.append(metric('Total nominal • '+(selected==='all'?'Semua Tahun':selected==='unknown'?'Tanpa tahun':selected),amounts.length?money(total):'—','f4-user-metric-primary'),
    metric('Jumlah catatan',list.length+' transaksi'),
    metric('Catatan terbaru',dateOf(list[0])?niceDate(dateOf(list[0])):'—'));
   content.append(stats);
   const listHeading=el('div',undefined,'f4-user-list-heading');
   listHeading.append(el('strong','Rincian catatan'),el('span','Terbaru dahulu'));
   content.append(listHeading);
   const entries=el('div',undefined,'f4-user-entries');
   content.append(entries);
   const controls=el('div',undefined,'f4-user-more-controls');
   content.append(controls);
   let visible=5;
   function paintEntries(){
    entries.replaceChildren();
    for(const row of list.slice(0,visible)){
     const item=el('article',undefined,'f4-user-row'),left=el('div',undefined,'f4-user-row-content');
     left.append(el('strong',row.keterangan||row.periode||row.namaKegiatan||row.nama_kegiatan||row.jenis||'Catatan pribadi'));
     const details=el('div',undefined,'f4-user-row-details');
     if(dateOf(row))details.append(el('time',niceDate(dateOf(row))));
     if(row.status)details.append(el('span',String(row.status),'f4-user-status-pill'));
     left.append(details);
     const amount=amountOf(row);
     item.append(left,el('strong',amount===null?'—':money(amount),'f4-user-amount'));
     entries.append(item);
    }
    controls.replaceChildren();
    if(list.length<=5)return;
    const shown=Math.min(visible,list.length);
    const count=el('span','Menampilkan '+shown+' dari '+list.length+' catatan');
    const button=el('button',shown<list.length?'Tampilkan '+Math.min(10,list.length-shown)+' berikutnya':'Tampilkan lebih sedikit','f4-user-more-button');
    button.type='button';
    button.setAttribute('aria-expanded',String(shown>5));
    button.onclick=()=>{
     visible=shown<list.length?Math.min(list.length,shown+10):5;
     paintEntries();
     if(visible===5)listHeading.scrollIntoView({block:'nearest',behavior:'auto'});
    };
    controls.append(count,button);
   }
   paintEntries();
  }
  renderYear();
 }catch(error){
  if(requestId!==personalRequestSerial)return;
  window.F4Loading?.error(loading,'Data belum tersedia: '+error.message+'. Akses tetap dibatasi pada akun yang login.',loadToken);
 }
}
const css=document.createElement('style');css.id='f4-portal-panels-style';
css.textContent='.f4-user-finance{background:#fff;border:1px solid #d9e0ee;border-radius:15px;padding:15px;margin:0 0 18px}.f4-user-finance-controls,.f4-user-finance-sub{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.f4-user-finance button{border:1px solid #d1d9ed;padding:9px 13px;background:#f1f2fc;color:#414087;border-radius:9px;font-size:12px;font-weight:700}.f4-user-finance button.active{background:#6153ed;color:white}.f4-user-status{font-size:12px;color:#68718a}.f4-user-row{display:flex;align-items:center;justify-content:space-between;gap:9px;border-bottom:1px solid #e4e9f2;padding:10px 0}.f4-user-row strong{font-size:12px}.f4-user-row small{font-size:10px;color:#718096;display:block}';

css.textContent+="\nfooter#pembayaran{background:#fff!important;color:#53607a!important;border-top:1px solid #e1e6f0!important;padding:30px 0 18px!important;margin-top:18px!important;scroll-margin-top:72px}\nfooter#pembayaran>div>div:first-child{background:#f8f9fc!important;border:1px solid #dce3ee!important;box-shadow:0 3px 15px #1b34550a!important}\nfooter#pembayaran>div>div:first-child>div:first-child{border-color:#e0e5ef!important}\nfooter#pembayaran>div>div:first-child>div:first-child h4{color:#2b3155!important}\nfooter#pembayaran>div>div:first-child>div:first-child>span{color:#728096!important}\nfooter#pembayaran .grid>div{background:white!important;border:1px solid #dde5ef!important}\nfooter#pembayaran .grid>div p.font-bold{color:#273655!important}\nfooter#pembayaran .grid>div p.text-slate-400{color:#68778d!important}\nfooter#pembayaran .grid button,footer#pembayaran .grid a{border-radius:9px}\nfooter#pembayaran>div>div:last-child{color:#738095!important}\nhtml{scroll-behavior:smooth}\n@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}\n";
css.textContent+="\n#keuangan.f4-finance-personal-active> :not(.f4-user-finance){display:none!important}\n#keuangan .f4-user-finance [hidden]{display:none!important}\n#keuangan .f4-user-finance-sub{\n flex-wrap:nowrap!important;overflow-x:auto;overflow-y:hidden;\n width:100%;min-width:0;max-width:100%;touch-action:pan-x;\n overscroll-behavior-x:contain;scroll-snap-type:x proximity;\n scrollbar-width:none;padding:2px 2px 6px;margin:0 0 9px;\n}\n#keuangan .f4-user-finance-sub::-webkit-scrollbar{display:none}\n#keuangan .f4-user-finance-sub>button{flex:0 0 auto;white-space:nowrap;scroll-snap-align:start}\n#keuangan .f4-user-finance-controls>button{white-space:nowrap}\n@media(max-width:760px){\n #keuangan .f4-user-finance{padding:12px}\n #keuangan .f4-user-finance-controls{gap:7px}\n #keuangan .f4-user-finance-controls>button{font-size:12px;padding:9px 11px}\n #keuangan .f4-user-finance-sub{gap:7px}\n #keuangan .f4-user-finance-sub>button{padding:9px 13px;font-size:12px}\n}\n";
css.textContent+="\n/* Keuangan Saya — putih, ringkas, mobile-first, tanpa angka contoh. */\n"+
"#keuangan .f4-user-finance{border:1px solid #e2e5f0;border-radius:18px;padding:18px 20px 20px;background:#fff;box-shadow:0 6px 25px rgba(27,35,67,.035);min-width:0}\n"+
"#keuangan .f4-user-finance-heading{margin:0 0 15px;display:flex;flex-direction:column;gap:3px}\n"+
"#keuangan .f4-user-eyebrow{color:#6a5ad4;font-weight:800;font-size:11px;letter-spacing:.09em;text-transform:uppercase}\n"+
"#keuangan .f4-user-finance-heading p{margin:0;font-size:13px;color:#758096}\n"+
"#keuangan .f4-user-finance-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:1px solid #e4e6f1;border-radius:13px;padding:4px;gap:4px;margin:0 0 18px;background:#f8f9fd}\n"+
"#keuangan .f4-user-finance-controls>button{width:100%;min-width:0;min-height:44px;padding:9px 8px;border:0;border-radius:10px;background:transparent;color:#59627a;font-size:13px;font-weight:750;white-space:normal}\n"+
"#keuangan .f4-user-finance-controls>button.active{background:#6555e7;color:#fff;box-shadow:0 2px 8px #5140c02a}\n"+
"#keuangan .f4-user-finance-intro{display:flex;gap:12px;align-items:center;padding:0 0 15px;margin-bottom:12px;border-bottom:1px solid #edf0f5}\n"+
"#keuangan .f4-user-finance-icon{display:grid;place-items:center;background:#f0eeff;color:#6555d7;border-radius:12px;flex:0 0 44px;width:44px;height:44px}\n"+
"#keuangan .f4-user-finance-icon svg{width:23px;height:23px}\n"+
"#keuangan .f4-user-finance-intro h3{font-size:17px!important;line-height:1.3!important;font-weight:800;margin:0;color:#26344f}\n"+
"#keuangan .f4-user-finance-intro p{margin:4px 0 0;color:#79839a;font-size:12px;line-height:1.4}\n"+
"#keuangan .f4-user-finance-sub{display:flex;gap:7px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:2px 1px 9px;margin-bottom:12px}\n"+
"#keuangan .f4-user-finance-sub>button{flex:0 0 auto;padding:9px 13px;min-height:39px;white-space:nowrap;border:1px solid #e0e4ed;background:#fff;color:#59657d;border-radius:10px;font-size:12px;font-weight:750}\n"+
"#keuangan .f4-user-finance-sub>button.active{background:#efedff;border-color:#aea5fa;color:#5745c5;box-shadow:none}\n"+
"#keuangan .f4-user-category-heading,#keuangan .f4-user-list-heading{display:flex;align-items:center;justify-content:space-between;gap:9px;margin:9px 0 11px}\n"+
"#keuangan .f4-user-category-heading h4{margin:0;color:#293550;font-size:16px;font-weight:800}\n"+
"#keuangan .f4-user-count{background:#f4f5f9;color:#6e778a;padding:4px 9px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}\n"+
"#keuangan .f4-user-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:18px}\n"+
"#keuangan .f4-user-metric{min-width:0;border:1px solid #e8eaf2;background:#fbfcfe;border-radius:13px;padding:13px 12px}\n"+
"#keuangan .f4-user-metric span{display:block;color:#7d8595;font-size:11px;font-weight:650;line-height:1.45}\n"+
"#keuangan .f4-user-metric strong{display:block;color:#283752;font-size:17px;line-height:1.3;font-weight:800;margin-top:6px;overflow-wrap:anywhere}\n"+
"#keuangan .f4-user-metric-primary{border-color:#dedafa;background:#f8f7ff}\n"+
"#keuangan .f4-user-metric-primary strong{color:#5949d2}\n"+
"#keuangan .f4-user-list-heading{margin:0 0 5px;padding-top:2px}\n"+
"#keuangan .f4-user-list-heading strong{font-size:14px;color:#35435a}\n"+
"#keuangan .f4-user-list-heading span{font-size:11px;color:#909aaa}\n"+
"#keuangan .f4-user-entries{border:1px solid #edf0f4;border-radius:13px;overflow:hidden;background:#fff}\n"+
"#keuangan .f4-user-row{padding:13px 14px;border-bottom:1px solid #eef0f4;gap:14px;background:#fff}\n"+
"#keuangan .f4-user-row:last-child{border-bottom:0}\n"+
"#keuangan .f4-user-row-content{min-width:0;flex:1}\n"+
"#keuangan .f4-user-row-content>strong{color:#27364e;font-size:13px;line-height:1.45;font-weight:800;overflow-wrap:anywhere}\n"+
"#keuangan .f4-user-row-details{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:5px;color:#8892a1;font-size:11px}\n"+
"#keuangan .f4-user-status-pill{padding:2px 7px;background:#eef7f1;color:#3d805c;border-radius:99px;font-size:10px;font-weight:750}\n"+
"#keuangan .f4-user-amount{color:#354367;font-size:14px!important;white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums}\n"+
"#keuangan .f4-user-empty{background:#fbfcff;border:1px dashed #d9dfec;padding:22px 16px;border-radius:12px;text-align:center;color:#34445c}\n"+
"#keuangan .f4-user-empty strong{font-size:14px}#keuangan .f4-user-empty p{color:#8290a3;font-size:12px;margin:7px auto 0;max-width:350px}\n"+
"@media(max-width:760px){#keuangan .f4-user-finance{padding:13px!important;border-radius:16px}#keuangan .f4-user-finance-heading{margin-bottom:12px}#keuangan .f4-user-finance-heading p{font-size:12px}#keuangan .f4-user-finance-controls>button{font-size:12px;padding:9px 5px}#keuangan .f4-user-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#keuangan .f4-user-metric{padding:12px}#keuangan .f4-user-metric-primary{grid-column:1/-1}#keuangan .f4-user-metric strong{font-size:16px}#keuangan .f4-user-finance-intro h3{font-size:16px!important}#keuangan .f4-user-row{padding:12px 11px}#keuangan .f4-user-amount{font-size:12px!important}}\n";
css.textContent+=[
 '#keuangan .f4-user-category-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:7px 0 6px}',
 '#keuangan .f4-user-year-filter{display:flex;align-items:center;gap:8px;margin-left:auto;color:#6f7b8f;font-size:11px;font-weight:700}',
 '#keuangan .f4-user-year-picker{position:relative;min-width:110px;z-index:12;color:#5545b7}',
 '#keuangan .f4-user-year-trigger{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:112px;min-height:40px;padding:9px 12px;border:1px solid #ddd9f4;border-radius:10px;background:#fff;color:#5544b5;font:750 12px system-ui;cursor:pointer;list-style:none;user-select:none}',
 '#keuangan .f4-user-year-trigger::-webkit-details-marker{display:none}',
 '#keuangan .f4-user-year-trigger:after{content:"";width:7px;height:7px;flex:none;border-right:1.8px solid currentColor;border-bottom:1.8px solid currentColor;transform:rotate(45deg) translateY(-2px)}',
 '#keuangan .f4-user-year-picker[open]>.f4-user-year-trigger{background:#f7f5ff;border-color:#afa5ed}',
 '#keuangan .f4-user-year-picker[open]>.f4-user-year-trigger:after{transform:rotate(225deg) translateY(-1px)}',
 '#keuangan .f4-user-year-popover{position:absolute;z-index:100;right:0;top:calc(100% + 7px);width:max-content;min-width:100%;max-width:min(82vw,240px);max-height:240px;overflow-y:auto;padding:5px;background:#fff;border:1px solid #e4def8;border-radius:12px;box-shadow:0 14px 34px rgba(39,38,93,.15)}',
 '#keuangan .f4-user-year-popover button.f4-user-year-option{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;min-height:39px;padding:9px 12px;border:0;border-radius:8px;background:#fff;color:#495670;font:650 12px system-ui;text-align:left;white-space:nowrap}',
 '#keuangan .f4-user-year-popover button.f4-user-year-option[aria-pressed=true]{background:#f1eeff;color:#5944c5;font-weight:800}',
 '#keuangan .f4-user-year-popover button.f4-user-year-option[aria-pressed=true]:after{content:"✓";font-weight:900}',
 '#keuangan .f4-user-year-popover button.f4-user-year-option:hover{background:#f7f6ff}',
 '#keuangan .f4-user-year-context{font-size:11px;color:#80899a;margin:0 0 12px}',
 '#keuangan .f4-user-more-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:10px}',
 '#keuangan .f4-user-more-controls>span{font-size:11px;color:#8b94a3}',
 '#keuangan .f4-user-more-controls button.f4-user-more-button{background:#f4f1ff;border:1px solid #ddd7f5;color:#5544bb;border-radius:10px;padding:9px 13px;min-height:39px;font-size:12px;font-weight:800}',
 '@media(max-width:760px){#keuangan .f4-user-category-heading{align-items:center}#keuangan .f4-user-category-heading h4{font-size:15px}#keuangan .f4-user-year-filter span{font-size:11px}#keuangan .f4-user-more-controls button{margin-left:auto}}'
].join('\n');
document.addEventListener('pointerdown',event=>{
 const open=document.querySelector('#keuangan .f4-user-year-picker[open]');
 if(open&&!open.contains(event.target))open.open=false;
},true);
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 const open=document.querySelector('#keuangan .f4-user-year-picker[open]');
 if(open){open.open=false;open.querySelector('summary')?.focus({preventScroll:true});}
},true);
document.head.append(css);
window.f4GoBank=()=>{
  if(window.parent!==window)window.parent.postMessage({type:'f4:go-portal',portal:'bank-sampah'},location.origin);
  else window.location.href='/bank-sampah/';
};
window.f4PortalSelectPanel=showPanel;
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==window.parent)return;
 if(event.data?.type==='f4:portal-panel')showPanel(String(event.data.panel||'beranda'));
 if(event.data?.type==='f4:demo-role'){
  current.role=String(event.data.role||'public').toLowerCase();
  // This attribute is the UI's existing signed-in visibility guard for cash
  // print buttons and the recent ledger, not an authorization token.
  document.body.dataset.previewRole=current.role;
  // Only members can select a personal ledger; Admin/Superadmin see
  // Laporan Lingkungan without duplicate controls.
  personalRequestSerial++;
  if(isMember(current.role)){
   createFinanceTabs();finBlock.hidden=false;setFinanceMode(false);
  }else{
   setFinanceMode(false);
   finance?.classList.remove('f4-finance-personal-active');
   if(finBlock){
    finBlock.hidden=true;
    const personal=finBlock.querySelector('#f4-personal-finance');
    if(personal)personal.hidden=true;
   }
  }
  visiblePanel();
 }
});
window.addEventListener('DOMContentLoaded',visiblePanel,{once:true});
visiblePanel();
})();