/* Portal Utama / Kas Saya — per-warga dues & compact payment history.
   Existing history DOM and listeners are moved, never cloned or rebuilt. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id';
const money=value=>'Rp'+Math.max(0,Number(value)||0).toLocaleString('id-ID',{maximumFractionDigits:0});
const svg=(kind)=>{
 const paths={
  dues:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 7v5l3 2"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  arrow:'<path d="m9 18 6-6-6-6"/>'
 };
 return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[kind]+'</svg>';
};
const mk=(tag,cls,txt)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(txt!==undefined)node.textContent=txt;
 return node;
};
const media=window.matchMedia('(max-width:767px)');
let activeSheet=null,triggerOfSheet=null,requestSerial=0;
function enhance(personal){
 if(personal.dataset.f4DuesEnhanced==='1')return;
 const finBlock=personal.closest('.f4-user-finance');
 const intro=personal.querySelector(':scope > .f4-user-finance-intro');
 const tabs=personal.querySelector(':scope > .f4-user-finance-sub');
 const data=personal.querySelector(':scope > #f4-personal-data');
 if(!finBlock||!intro||!tabs||!data)return;
 personal.dataset.f4DuesEnhanced='1';
 const layout=mk('div','f4-resident-layout');
 const dues=mk('section','f4-resident-dues');
 dues.setAttribute('aria-label','Rincian kewajiban bulanan');
 dues.innerHTML='<div class="f4-resident-card-heading"><span class="f4-resident-card-icon">'+svg('dues')+'</span><div><h3>Rincian Kewajiban</h3><p>Sesuai kewajiban akun Anda</p></div></div>';
 const duesContent=mk('div','f4-resident-dues-content','Memuat kewajiban…');
 duesContent.id='f4-resident-dues-content';
 duesContent.setAttribute('aria-live','polite');
 dues.append(duesContent);
 const right=mk('section','f4-resident-right');
 right.innerHTML='<div class="f4-resident-status-heading"><div><h3>Status Pembayaran</h3><p id="f4-resident-period">Bulan berjalan</p></div><span id="f4-resident-badge" class="f4-resident-badge" role="status">Memuat</span></div>';
 const statusContent=mk('div','f4-resident-status-content','Memuat status pembayaran…');
 statusContent.id='f4-resident-status-content';
 statusContent.setAttribute('aria-live','polite');
 const actions=mk('div','f4-resident-mobile-actions');
 for(const [kind,label] of [['dues','Rincian kewajiban'],['history','Riwayat pembayaran']]){
  const button=mk('button','f4-resident-sheet-opener');
  button.type='button';
  button.dataset.residentOpen=kind;
  button.innerHTML=svg(kind)+'<span>'+label+'</span>'+svg('arrow');
  button.onclick=()=>openSheet(finBlock,kind,button);
  actions.append(button);
 }
 const pane=mk('div','f4-resident-history-pane');
 pane.append(intro,tabs,data); // Preserve all original tab/filter click handlers.
 // PC has three independent cards; mobile keeps the status card visible
 // and moves the existing dues/history nodes into bottom sheets on demand.
 right.append(statusContent,actions);
 layout.append(dues,right,pane);
 personal.replaceChildren(layout);
 const overlay=mk('div','f4-resident-sheet-overlay');
 overlay.id='f4-resident-sheet';
 overlay.hidden=true;
 overlay.setAttribute('aria-label','Informasi keuangan warga');
 overlay.innerHTML='<section class="f4-resident-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="f4-resident-sheet-title" tabindex="-1"><div class="f4-resident-sheet-top"><h3 id="f4-resident-sheet-title">Informasi</h3><button type="button" class="f4-resident-sheet-close" aria-label="Tutup rincian">'+svg('x')+'</button></div><div class="f4-resident-sheet-content"></div></section>';
 overlay.addEventListener('click',e=>{if(e.target===overlay)closeSheet()});
 overlay.querySelector('.f4-resident-sheet-close').onclick=closeSheet;
 finBlock.append(overlay);
 const watch=new MutationObserver(()=>{
  if(personal.hidden){if(activeSheet)closeSheet();return}
  loadDues(personal);
 });
 watch.observe(personal,{attributes:true,attributeFilter:['hidden']});
 if(!personal.hidden)loadDues(personal);
}
function currentPeriod(){
 // Date in WIB (UTC+7), matching the backend due-month convention.
 return new Date(Date.now()+7*60*60*1000).toISOString().slice(0,7);
}
function writeDues(personal,data){
 const list=personal.querySelector('#f4-resident-dues-content');
 const status=personal.querySelector('#f4-resident-status-content');
 const badge=personal.querySelector('#f4-resident-badge');
 const subtitle=personal.querySelector('#f4-resident-period');
 if(!list||!status||!badge||!subtitle)return;
 const period=data.period||currentPeriod();
 const parts=period.split('-');
 subtitle.textContent=new Date(Number(parts[0]),Number(parts[1])-1,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'});
 list.replaceChildren();status.replaceChildren();
 badge.className='f4-resident-badge';
 if(!data.linked||!data.configured||!Array.isArray(data.components)){
  badge.textContent='Belum tersedia';
  list.append(mk('p','f4-resident-placeholder',!data.linked?'Akun belum terhubung ke data pembayar.':'Kewajiban bulanan belum diatur oleh pengurus.'));
  status.append(mk('p','f4-resident-placeholder','Status belum dapat ditentukan.'));
  return;
 }
 const breakdown=[];
 for(const item of data.components){
  const due=Math.max(0,Number(item.wajibRp)||0);
  if(!due)continue;
  if(item.jenis==='IURAN_BULANAN'){
   if(due%25000===0){
    const count=due/25000;
    breakdown.push(['Kas RT',10000*count],['Kas RW',5000*count],['Keamanan',10000*count]);
   }else breakdown.push(['Iuran RT, RW & Keamanan',due]);
  }else{
   const titles={KEBERSIHAN:'Kebersihan',KAS_LORONG:'Kas Lorong',ARISAN:'Arisan'};
   breakdown.push([titles[item.jenis]||item.jenis,due]);
  }
 }
 const rows=mk('div','f4-resident-dues-rows');
 if(!breakdown.length)rows.append(mk('p','f4-resident-placeholder','Tidak ada iuran rutin untuk periode ini.'));
 for(const [label,amount] of breakdown){
  const row=mk('div','f4-resident-dues-row');
  row.append(mk('span','',label),mk('strong','',money(amount)));
  rows.append(row);
 }
 const total=mk('div','f4-resident-dues-total');
 total.append(mk('span','','Total per bulan'),mk('strong','',money(data.totalWajibRp)));
 list.append(rows,total);
 const due=Math.max(0,Number(data.totalWajibRp)||0);
 const paid=Math.max(0,Number(data.totalTerbayarRp)||0);
 const remaining=Math.max(0,Number(data.totalSisaRp)||0);
 const primary=mk('div','f4-resident-payment-primary');
 if(due===0){
  badge.classList.add('is-neutral');badge.textContent='Tanpa tagihan';
  primary.append(mk('strong','','Tidak ada kewajiban'),mk('span','','Periode ini'));
 }else if(remaining===0){
  badge.classList.add('is-paid');badge.textContent='Lunas';
  primary.append(mk('strong','',money(due)),mk('span','','Telah dibayar'));
 }else if(paid===0){
  badge.classList.add('is-unpaid');badge.textContent='Belum bayar';
  primary.append(mk('strong','',money(due)),mk('span','','Belum ada pembayaran'));
 }else{
  badge.classList.add('is-partial');badge.textContent='Kurang bayar';
  primary.append(mk('div','f4-resident-payment-split'));
  const split=primary.firstElementChild;
  const left=mk('div','');
  left.append(mk('span','','Sudah dibayar'),mk('strong','',money(paid)));
  const right=mk('div','');
  right.append(mk('span','','Kekurangan'),mk('strong','f4-resident-remaining',money(remaining)));
  split.append(left,right);
 }
 status.append(primary);
}
async function loadDues(personal){
 const serial=++requestSerial;
 const list=personal.querySelector('#f4-resident-dues-content');
 if(!list)return;
 const status=personal.querySelector('#f4-resident-status-content');
 list.textContent='Memuat kewajiban…';
 if(status)status.textContent='Memeriksa pembayaran…';
 try{
  const period=currentPeriod();
  const response=await fetch(API+'/api/member/dues?month='+encodeURIComponent(period),{credentials:'include',cache:'no-store'});
  const body=await response.json().catch(()=>({}));
  if(!response.ok||body.ok===false)throw Error(body.error||'Status belum tersedia');
  if(serial!==requestSerial||personal.hidden)return;
  writeDues(personal,body);
 }catch(error){
  if(serial!==requestSerial||personal.hidden)return;
  const badge=personal.querySelector('#f4-resident-badge');
  badge.textContent='Belum tersedia';
  badge.className='f4-resident-badge is-neutral';
  list.textContent='Rincian belum dapat dimuat.';
  if(status)status.textContent='Status belum dapat diperiksa. Coba muat ulang halaman.';
 }
}
function openSheet(finBlock,kind,button){
 if(!media.matches)return;
 closeSheet();
 const overlay=finBlock.querySelector('#f4-resident-sheet');
 const personal=finBlock.querySelector('#f4-personal-finance');
 const node=personal?.querySelector(kind==='dues'?'.f4-resident-dues':'.f4-resident-history-pane');
 if(!overlay||!node)return;
 const target=overlay.querySelector('.f4-resident-sheet-content');
 const title=overlay.querySelector('#f4-resident-sheet-title');
 title.textContent=kind==='dues'?'Rincian Kewajiban':'Riwayat Pembayaran';
 overlay.dataset.kind=kind;
 target.append(node);
 overlay.hidden=false;
 document.body.classList.add('f4-resident-sheet-open');
 activeSheet={overlay,personal,node,kind};
 triggerOfSheet=button;
 overlay.querySelector('.f4-resident-sheet-close').focus({preventScroll:true});
 window.F4MobileSheets?.refresh?.();
}
function closeSheet(){
 if(!activeSheet)return;
 const {overlay,personal,node,kind}=activeSheet;
 if(kind==='dues')personal.querySelector('.f4-resident-layout')?.prepend(node);
 else personal.querySelector('.f4-resident-layout')?.append(node);
 overlay.hidden=true;
 overlay.querySelector('.f4-resident-sheet-content').replaceChildren();
 document.body.classList.remove('f4-resident-sheet-open');
 activeSheet=null;
 if(triggerOfSheet?.isConnected)triggerOfSheet.focus({preventScroll:true});
 triggerOfSheet=null;
 window.F4MobileSheets?.refresh?.();
}
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&activeSheet){event.preventDefault();closeSheet()}
});
media.addEventListener?.('change',()=>{if(!media.matches)closeSheet()});
function scan(){
 document.querySelectorAll('#keuangan .f4-user-finance #f4-personal-finance').forEach(enhance);
}
const observer=new MutationObserver(scan);
function init(){
 const root=document.getElementById('keuangan');
 if(!root)return;
 observer.observe(root,{subtree:true,childList:true});
 scan();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
