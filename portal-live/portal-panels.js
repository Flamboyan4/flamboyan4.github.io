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
  finBlock.innerHTML='<div class="f4-user-finance-controls"><button type="button" data-finance-mode="lingkungan" class="active">Laporan Lingkungan</button><button type="button" data-finance-mode="saya">Keuangan Saya</button></div><div id="f4-personal-finance" hidden><p class="f4-user-status">Riwayat pembayaran dan kewajiban sesuai akun Anda.</p><div class="f4-user-finance-sub"><button type="button" data-kind="iuran_rt">Iuran RT</button><button type="button" data-kind="kebersihan">Kebersihan</button><button type="button" data-kind="kas_lorong">Kas Lorong</button><button type="button" data-kind="arisan">Arisan</button><button type="button" data-kind="fines">Denda</button><button type="button" data-kind="loans">Pinjaman</button></div><div id="f4-personal-data"></div></div>';
  finance.insertBefore(finBlock,finance.firstChild);
  const action=finBlock.querySelectorAll('[data-finance-mode]'),personal=finBlock.querySelector('#f4-personal-finance');
  action.forEach(b=>b.onclick=()=>setFinanceMode(b.dataset.financeMode==='saya'));
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
async function loadPersonal(kind){
 const requestId=++personalRequestSerial;
 if(!isMember(current.role))return;
 current.privateKind=kind;
 const area=document.getElementById('f4-personal-data');if(!area)return;
 const loading=el('p','','f4-user-status');area.replaceChildren(loading);
 const loadToken=window.F4Loading?.begin(loading,'Memuat riwayat keuangan pribadi…');
 finBlock.querySelectorAll('[data-kind]').forEach(b=>b.classList.toggle('active',b.dataset.kind===kind));
 // No payerId is accepted from the browser; Worker must resolve from session.
 const paths={iuran_rt:'/api/member/payments',kebersihan:'/api/member/payments',
  kas_lorong:'/api/member/payments',arisan:'/api/member/arisan',fines:'/api/member/fines',loans:'/api/member/loans'};
 try{
  const res=await fetch('https://api.flamboyan4.web.id'+paths[kind],{credentials:'include',cache:'no-store'});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.ok===false)throw Error(data.error||'HTTP '+res.status);
  if(requestId!==personalRequestSerial)return;
  const received=Array.isArray(data.rows)?data.rows:Array.isArray(data.data)?data.data:Array.isArray(data.transaksi)?data.transaksi:[];
  const types={iuran_rt:'IURAN_BULANAN',kebersihan:'KEBERSIHAN',kas_lorong:'KAS_LORONG'};
  const list=types[kind]?received.filter(row=>row.jenis===types[kind]):received;
  window.F4Loading?.success(loading,loadToken);area.replaceChildren();
  for(const row of list.slice(0,200)){
   const a=el('article',undefined,'f4-user-row'),info=el('div');
   info.append(el('strong',row.keterangan||row.periode||row.namaKegiatan||row.tanggal||'Catatan pribadi'));
   info.append(el('small',[row.tanggal||row.paid_on||'',row.status||''].filter(Boolean).join(' • ')));
   const amount=Number(row.nominalRp??row.nominal??row.amount_rp??0);
   a.append(info,el('strong','Rp '+amount.toLocaleString('id-ID')));area.append(a);
  }
  if(!list.length)area.append(el('p','Belum ada transaksi kategori ini untuk akun yang sedang masuk.','f4-user-status'));
 }catch(e){if(requestId!==personalRequestSerial)return;
  window.F4Loading?.error(loading,'Data belum tersedia: '+e.message+'. Akses tetap dibatasi pada akun yang login.',loadToken)}
}
const css=document.createElement('style');css.id='f4-portal-panels-style';
css.textContent='.f4-user-finance{background:#fff;border:1px solid #d9e0ee;border-radius:15px;padding:15px;margin:0 0 18px}.f4-user-finance-controls,.f4-user-finance-sub{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.f4-user-finance button{border:1px solid #d1d9ed;padding:9px 13px;background:#f1f2fc;color:#414087;border-radius:9px;font-size:12px;font-weight:700}.f4-user-finance button.active{background:#6153ed;color:white}.f4-user-status{font-size:12px;color:#68718a}.f4-user-row{display:flex;align-items:center;justify-content:space-between;gap:9px;border-bottom:1px solid #e4e9f2;padding:10px 0}.f4-user-row strong{font-size:12px}.f4-user-row small{font-size:10px;color:#718096;display:block}';

css.textContent+="\nfooter#pembayaran{background:#fff!important;color:#53607a!important;border-top:1px solid #e1e6f0!important;padding:30px 0 18px!important;margin-top:18px!important;scroll-margin-top:72px}\nfooter#pembayaran>div>div:first-child{background:#f8f9fc!important;border:1px solid #dce3ee!important;box-shadow:0 3px 15px #1b34550a!important}\nfooter#pembayaran>div>div:first-child>div:first-child{border-color:#e0e5ef!important}\nfooter#pembayaran>div>div:first-child>div:first-child h4{color:#2b3155!important}\nfooter#pembayaran>div>div:first-child>div:first-child>span{color:#728096!important}\nfooter#pembayaran .grid>div{background:white!important;border:1px solid #dde5ef!important}\nfooter#pembayaran .grid>div p.font-bold{color:#273655!important}\nfooter#pembayaran .grid>div p.text-slate-400{color:#68778d!important}\nfooter#pembayaran .grid button,footer#pembayaran .grid a{border-radius:9px}\nfooter#pembayaran>div>div:last-child{color:#738095!important}\nhtml{scroll-behavior:smooth}\n@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}\n";
css.textContent+="\n#keuangan.f4-finance-personal-active> :not(.f4-user-finance){display:none!important}\n#keuangan .f4-user-finance [hidden]{display:none!important}\n#keuangan .f4-user-finance-sub{\n flex-wrap:nowrap!important;overflow-x:auto;overflow-y:hidden;\n width:100%;min-width:0;max-width:100%;touch-action:pan-x;\n overscroll-behavior-x:contain;scroll-snap-type:x proximity;\n scrollbar-width:none;padding:2px 2px 6px;margin:0 0 9px;\n}\n#keuangan .f4-user-finance-sub::-webkit-scrollbar{display:none}\n#keuangan .f4-user-finance-sub>button{flex:0 0 auto;white-space:nowrap;scroll-snap-align:start}\n#keuangan .f4-user-finance-controls>button{white-space:nowrap}\n@media(max-width:760px){\n #keuangan .f4-user-finance{padding:12px}\n #keuangan .f4-user-finance-controls{gap:7px}\n #keuangan .f4-user-finance-controls>button{font-size:12px;padding:9px 11px}\n #keuangan .f4-user-finance-sub{gap:7px}\n #keuangan .f4-user-finance-sub>button{padding:9px 13px;font-size:12px}\n}\n";
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