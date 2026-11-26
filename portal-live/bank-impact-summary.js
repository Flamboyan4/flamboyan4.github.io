/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/bank-impact-summary.js",function(__f4){


/* Ringkasan uang hanya untuk sesi anggota; endpoint Cloudflare memverifikasi role. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id/api/v2/bank/finance-summary';
const nf=new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:0});
const rupiah=value=>'Rp '+nf.format(value);
const fields=[
  ['Total penjualan sah','totalPenjualanRp'],
  ['Total tabungan warga','totalTabunganWargaRp'],
  ['Kas Bank Sampah','kasBankSampahRp']
];
let panel=null,busy=false,loaded=false,serial=0;
const isMember=()=>__f4.globals.document.body.classList.contains('f4-bank-app-member');
const target=()=>__f4.globals.document.querySelector('#bank-member-info > .f4-member-feature-content:has(> #v17Transparansi)');
function reset(){
  if(panel){panel.remove();panel=null;}
  busy=false;loaded=false;serial++;
}
function render(){
  if(!panel)return;
  if(loaded||busy)return;
  busy=true;
  const marker=++serial;
  (0,__f4.globals.fetch)(API,{credentials:'include',mode:'cors',cache:'no-store'})
    .then(async response=>{
      const data=await response.json();
      if(!response.ok||data?.ok===false)throw (0,__f4.globals.Error)(data?.error||'Ringkasan belum dapat dimuat');
      const values=fields.map(([,key])=>data[key]);
      if(!values.every(x=>__f4.globals.Number.isSafeInteger(x)))throw (0,__f4.globals.Error)('Nominal perlu diperiksa');
      return data;
    })
    .then(data=>{
      if(marker!==serial||!panel||!isMember())return;
      fields.forEach(([,key],i)=>{
        panel.querySelectorAll('.f4-bank-private-finance-card strong')[i].textContent=rupiah(data[key]);
      });
      const note=panel.querySelector('.f4-bank-private-finance-note');
      note.hidden=true;
      loaded=true;
    }).catch(error=>{
      if(marker!==serial||!panel||!isMember())return;
      const note=panel.querySelector('.f4-bank-private-finance-note');
      note.hidden=false;
      note.textContent='Ringkasan belum tersedia: '+(error.message||'Gangguan layanan');
    }).finally(()=>{if(marker===serial)busy=false});
}
function mount(){
  const host=target();
  if(!isMember()||!host) {if(panel)reset();return;}
  if(panel && panel.parentNode!==host)reset();
  if(!panel) {
    panel=__f4.globals.document.createElement('section');
    panel.id='f4BankPrivateFinancialSummary';
    panel.setAttribute('aria-label','Ringkasan keuangan Bank Sampah');
    const title=__f4.globals.document.createElement('h3');
    title.className='f4-bank-private-finance-title';
    title.textContent='BANK SAMPAH FLAMBOYAN 4';
    const grid=__f4.globals.document.createElement('div');
    grid.className='f4-bank-private-finance-grid';
    fields.forEach(([label])=>{
      const card=__f4.globals.document.createElement('div');card.className='f4-bank-private-finance-card';
      const small=__f4.globals.document.createElement('small');small.textContent=label;
      const amount=__f4.globals.document.createElement('strong');amount.textContent='—';
      card.append(small,amount);grid.append(card);
    });
    const note=__f4.globals.document.createElement('p');
    note.className='f4-bank-private-finance-note';
    note.hidden=true;
    note.setAttribute('role','status');
    note.textContent='';
    const hero=__f4.globals.document.createElement('div');
    hero.className='f4-bank-private-finance-hero';
    hero.append(title,grid);
    panel.append(hero,note);
    host.prepend(panel);
  }
  render();
}
const observer=new __f4.globals.MutationObserver(()=>mount());
function init(){
  observer.observe(__f4.globals.document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  mount();
}
if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
__f4.window.addEventListener('pageshow',mount);
})();

});
