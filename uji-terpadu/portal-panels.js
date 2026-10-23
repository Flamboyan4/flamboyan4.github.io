/* Four-portal staging adapter: show one Portal Utama content panel at a time.
   It reuses ALL existing DOM/forms/click handlers without rebuilding the old portal. */
(()=>{
'use strict';
const main=document.querySelector('body>main');if(!main)return;
const sections=[...main.children].filter(e=>e.tagName==='SECTION');
const footer=document.getElementById('pembayaran');
const original=new Map(sections.map((s,i)=>[s,s.style.display]));
const current={panel:'beranda',role:'public',privateKind:'payments'};
const finance=document.getElementById('keuangan');
let finBlock=null;
const el=(tag,text,cls)=>{const a=document.createElement(tag);if(text!==undefined)a.textContent=String(text);if(cls)a.className=cls;return a};
function showPanel(panel){
 const known=['beranda','projek','kalender','pembayaran','komentar','keuangan'];
 if(!known.includes(panel))panel='beranda';
 if(panel==='keuangan'&&current.role==='public')panel='beranda';
 current.panel=panel;
 for(const [i,section] of sections.entries()){
  const id=section.id;
  let visible=panel==='beranda'?id!=='komentar-warga':
    panel==='projek'?id==='projek':
    panel==='kalender'?id==='rencana':
    panel==='komentar'?id==='komentar-warga':
    panel==='keuangan'?id==='keuangan':false;
  section.style.display=visible?original.get(section):'none';
 }
 if(footer)footer.style.display=panel==='pembayaran'?'':'none';
 main.style.flexGrow=panel==='pembayaran'?'0':'';
 main.style.minHeight=panel==='pembayaran'?'0':'';
 if(panel==='keuangan'&&current.role!=='public')createFinanceTabs();
 if(panel==='pembayaran'){requestAnimationFrame(()=>footer?.scrollIntoView({block:'start'}))}
 else window.scrollTo({top:0,behavior:'instant'});
}
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
  if(current.role==='public'&&current.panel==='keuangan')showPanel('beranda');
 }
});
showPanel('beranda');
})();