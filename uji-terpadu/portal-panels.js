/* Four-portal staging adapter: show one Portal Utama content panel at a time.
   It reuses ALL existing DOM/forms/click handlers without rebuilding the old portal. */
(()=>{
'use strict';
const main=document.querySelector('body>main');if(!main)return;
const footer=document.getElementById('pembayaran');
const current={panel:'beranda',role:'public',privateKind:'payments'};
const finance=document.getElementById('keuangan');
let finBlock=null,scrollScheduled=false,lastVisible='';
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
 if(window.parent!==window)window.parent.postMessage({type:'f4:portal-visible-panel',panel},location.origin);
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
   ['inventaris',document.getElementById('kegiatan')],
   ['kalender',sectionTargets.kalender],
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
 if(panel==='keuangan'&&current.role!=='public')createFinanceTabs();
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
  finBlock.innerHTML='<div class="f4-user-finance-controls"><button type="button" data-finance-mode="lingkungan" class="active">Laporan Lingkungan</button><button type="button" data-finance-mode="saya">Keuangan Saya</button></div><div id="f4-personal-finance" hidden><p class="f4-user-status">Pilih jenis riwayat pribadi.</p><div class="f4-user-finance-sub"><button type="button" data-kind="payments">Iuran</button><button type="button" data-kind="arisan">Arisan</button><button type="button" data-kind="fines">Denda</button><button type="button" data-kind="loans">Pinjaman</button></div><div id="f4-personal-data"></div></div>';
  finance.insertBefore(finBlock,finance.firstChild);
  const action=finBlock.querySelectorAll('[data-finance-mode]'),personal=finBlock.querySelector('#f4-personal-finance');
  action.forEach(b=>b.onclick=()=>{
   const own=b.dataset.financeMode==='saya';
   action.forEach(x=>x.classList.toggle('active',x===b));
   personal.hidden=!own;
   [...finance.children].forEach(x=>{if(x!==finBlock)x.style.display=own?'none':''});
   if(own)loadPersonal(current.privateKind);
  });
  finBlock.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>loadPersonal(b.dataset.kind));
 }
}
async function loadPersonal(kind){
 if(current.role==='public')return;
 current.privateKind=kind;
 const area=document.getElementById('f4-personal-data');if(!area)return;
 area.replaceChildren(el('p','Memuat riwayat pribadi dari Cloudflare…','f4-user-status'));
 finBlock.querySelectorAll('[data-kind]').forEach(b=>b.classList.toggle('active',b.dataset.kind===kind));
 // No payerId is accepted from the browser; Worker must resolve from session.
 const paths={payments:'/api/member/payments',arisan:'/api/member/arisan',fines:'/api/member/fines',loans:'/api/member/loans'};
 try{
  const res=await fetch('https://api.flamboyan4.web.id'+paths[kind],{credentials:'include',cache:'no-store'});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.ok===false)throw Error(data.error||'HTTP '+res.status);
  const list=Array.isArray(data.rows)?data.rows:Array.isArray(data.data)?data.data:Array.isArray(data.transaksi)?data.transaksi:[];
  area.replaceChildren(el('p',list.length+' catatan ditemukan.','f4-user-status'));
  for(const row of list.slice(0,200)){
   const a=el('article',undefined,'f4-user-row'),info=el('div');
   info.append(el('strong',row.keterangan||row.periode||row.namaKegiatan||row.tanggal||'Catatan pribadi'));
   info.append(el('small',[row.tanggal||row.paid_on||'',row.status||''].filter(Boolean).join(' • ')));
   const amount=Number(row.nominalRp??row.nominal??row.amount_rp??0);
   a.append(info,el('strong','Rp '+amount.toLocaleString('id-ID')));area.append(a);
  }
  if(!list.length)area.append(el('p','Belum ada catatan untuk akun ini.','f4-user-status'));
 }catch(e){area.replaceChildren(el('p','Data belum tersedia: '+e.message+'. Akses tetap dibatasi pada akun yang login.','f4-user-status'))}
}
const css=document.createElement('style');css.id='f4-portal-panels-style';
css.textContent='.f4-user-finance{background:#fff;border:1px solid #d9e0ee;border-radius:15px;padding:15px;margin:0 0 18px}.f4-user-finance-controls,.f4-user-finance-sub{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.f4-user-finance button{border:1px solid #d1d9ed;padding:9px 13px;background:#f1f2fc;color:#414087;border-radius:9px;font-size:12px;font-weight:700}.f4-user-finance button.active{background:#48418d;color:white}.f4-user-status{font-size:12px;color:#68718a}.f4-user-row{display:flex;align-items:center;justify-content:space-between;gap:9px;border-bottom:1px solid #e4e9f2;padding:10px 0}.f4-user-row strong{font-size:12px}.f4-user-row small{font-size:10px;color:#718096;display:block}';

css.textContent+="\nfooter#pembayaran{background:#fff!important;color:#53607a!important;border-top:1px solid #e1e6f0!important;padding:30px 0 18px!important;margin-top:18px!important;scroll-margin-top:72px}\nfooter#pembayaran>div>div:first-child{background:#f8f9fc!important;border:1px solid #dce3ee!important;box-shadow:0 3px 15px #1b34550a!important}\nfooter#pembayaran>div>div:first-child>div:first-child{border-color:#e0e5ef!important}\nfooter#pembayaran>div>div:first-child>div:first-child h4{color:#2b3155!important}\nfooter#pembayaran>div>div:first-child>div:first-child>span{color:#728096!important}\nfooter#pembayaran .grid>div{background:white!important;border:1px solid #dde5ef!important}\nfooter#pembayaran .grid>div p.font-bold{color:#273655!important}\nfooter#pembayaran .grid>div p.text-slate-400{color:#68778d!important}\nfooter#pembayaran .grid button,footer#pembayaran .grid a{border-radius:9px}\nfooter#pembayaran>div>div:last-child{color:#738095!important}\nhtml{scroll-behavior:smooth}\n@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}\n";
document.head.append(css);
window.f4GoBank=()=>{
  if(window.parent!==window)window.parent.postMessage({type:'f4:go-portal',portal:'bank-sampah'},location.origin);
  else window.location.href='../#bank-sampah';
};
window.f4PortalSelectPanel=showPanel;
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==window.parent)return;
 if(event.data?.type==='f4:portal-panel')showPanel(String(event.data.panel||'beranda'));
 if(event.data?.type==='f4:demo-role'){
  current.role=event.data.role||'public';
  if(current.role!=='public')createFinanceTabs();
  else if(finBlock){
    const personal=finBlock.querySelector('#f4-personal-finance');
    if(personal)personal.hidden=true;
    finBlock.querySelectorAll('[data-finance-mode]').forEach(b=>b.classList.toggle('active',b.dataset.financeMode==='lingkungan'));
    [...finance.children].forEach(node=>{if(node!==finBlock)node.style.display='';});
    finBlock.hidden=true;
  }
  if(finBlock&&current.role!=='public')finBlock.hidden=false;
  visiblePanel();
 }
});
window.addEventListener('DOMContentLoaded',visiblePanel,{once:true});
visiblePanel();
})();