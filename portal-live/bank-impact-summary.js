/* Ringkasan uang hanya untuk sesi anggota; endpoint Cloudflare memverifikasi role. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id/api/v2/bank/finance-summary';
const nf=new Intl.NumberFormat('id-ID',{maximumFractionDigits:0});
const rupiah=value=>'Rp '+nf.format(value);
const fields=[
  ['Total penjualan sah','totalPenjualanRp'],
  ['Total tabungan warga','totalTabunganWargaRp'],
  ['Kas Bank Sampah','kasBankSampahRp']
];
let panel=null,busy=false,loaded=false,serial=0;
const isMember=()=>document.body.classList.contains('f4-bank-app-member');
const target=()=>document.querySelector('#bank-member-info #v17Transparansi');
function reset(){
  if(panel){panel.remove();panel=null;}
  busy=false;loaded=false;serial++;
}
function render(){
  if(!panel)return;
  if(loaded||busy)return;
  busy=true;
  const marker=++serial;
  fetch(API,{credentials:'include',mode:'cors',cache:'no-store'})
    .then(async response=>{
      const data=await response.json();
      if(!response.ok||data?.ok===false)throw Error(data?.error||'Ringkasan belum dapat dimuat');
      const values=fields.map(([,key])=>data[key]);
      if(!values.every(x=>Number.isSafeInteger(x)))throw Error('Nominal perlu diperiksa');
      return data;
    })
    .then(data=>{
      if(marker!==serial||!panel||!isMember())return;
      fields.forEach(([,key],i)=>{
        panel.querySelectorAll('.f4-bank-private-finance-card strong')[i].textContent=rupiah(data[key]);
      });
      const note=panel.querySelector('.f4-bank-private-finance-note');
      note.textContent='Dihitung dari transaksi sah dan saldo jurnal D1. Tidak termasuk estimasi.';
      loaded=true;
    }).catch(error=>{
      if(marker!==serial||!panel||!isMember())return;
      panel.querySelector('.f4-bank-private-finance-note').textContent='Ringkasan belum tersedia: '+(error.message||'Gangguan layanan');
    }).finally(()=>{if(marker===serial)busy=false});
}
function mount(){
  const host=target();
  if(!isMember()||!host) {if(panel)reset();return;}
  if(panel && panel.parentNode!==host)reset();
  if(!panel) {
    panel=document.createElement('section');
    panel.id='f4BankPrivateFinancialSummary';
    panel.setAttribute('aria-label','Ringkasan keuangan Bank Sampah');
    const title=document.createElement('h3');
    title.className='f4-bank-private-finance-title';
    title.textContent='Posisi keuangan Bank Sampah';
    const grid=document.createElement('div');
    grid.className='f4-bank-private-finance-grid';
    fields.forEach(([label])=>{
      const card=document.createElement('div');card.className='f4-bank-private-finance-card';
      const small=document.createElement('small');small.textContent=label;
      const amount=document.createElement('strong');amount.textContent='—';
      card.append(small,amount);grid.append(card);
    });
    const note=document.createElement('p');
    note.className='f4-bank-private-finance-note';
    note.textContent='Memuat saldo sah...';
    panel.append(title,grid,note);
    const anchor=host.querySelector('#v25ReportRoot');
    if(anchor)host.insertBefore(panel,anchor);else host.append(panel);
  }
  render();
}
const observer=new MutationObserver(()=>mount());
function init(){
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  mount();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.addEventListener('pageshow',mount);
})();
