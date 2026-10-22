
/* Ringkasan finansial publik memakai sumber lama yang sama dengan portal aktif, hanya membaca transaksi.
   Tidak mengubah, mengesahkan, atau mengklaim saldo final di D1. */
const KAS_API='https://script.google.com/macros/s/AKfycbwmI7Gw3JCMg1Cb2CCHgXULcOxdEIDkOc4dPl8soHHJXZ3mUC1G9diZn4kNEXzoMrU/exec';
const money=n=>'Rp '+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(n||0);
const $=id=>document.getElementById(id);
const number=x=>typeof x==='number'?x:Number(String(x||'0').replace(/[^\d-]/g,''))||0;
function isoDate(raw){
 const v=String(raw||'').trim();
 if(/^\d{4}-\d{2}-\d{2}/.test(v))return v.slice(0,10);
 const m=v.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
 if(m)return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
 return '';
}
function publicJsonp(){
 return new Promise((resolve,reject)=>{
  const callback='__kasPublic_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  const script=document.createElement('script');let done=false;
  const clear=()=>{if(done)return;done=true;clearTimeout(timer);delete window[callback];script.remove()};
  const timer=setTimeout(()=>{clear();reject(new Error('Waktu pemuatan pembukuan habis'))},13000);
  window[callback]=result=>{clear();resolve(result)};
  script.onerror=()=>{clear();reject(new Error('Pembukuan lama tidak dapat dijangkau'))};
  script.src=KAS_API+'?action=datatransaksikas&status=AKTIF&callback='+encodeURIComponent(callback)+'&_='+Date.now();
  document.head.append(script);
 });
}
export async function initPortalFinance(){
 const open=$('finance-view-all'),dlg=$('finance-dialog');if(!open||!dlg)return;
 const close=$('finance-dialog-close'),select=$('finance-month'),rows=$('finance-transaction-rows');
 const title=$('finance-dialog-period'),totals=$('finance-dialog-totals'),note=$('finance-source');
 let entries=[];
 close.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19"/></svg>';close.onclick=()=>dlg.close();dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
 function show(){
  const month=select.value,list=entries.filter(x=>!month||x.iso.startsWith(month));
  rows.replaceChildren();
  let masuk=0,keluar=0;
  list.forEach(x=>{
   masuk+=x.debit;keluar+=x.credit;
   const tr=document.createElement('tr');
   [x.rawDate,x.description,x.debit?money(x.debit):'–',x.credit?money(x.credit):'–'].forEach(txt=>{
    const cell=document.createElement('td');cell.textContent=txt;tr.append(cell)
   });rows.append(tr);
  });
  if(!list.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=4;td.textContent='Belum ada transaksi untuk periode ini.';tr.append(td);rows.append(tr)}
  totals.textContent='Masuk '+money(masuk)+' · Keluar '+money(keluar);
  title.textContent=month?'Periode '+month:'Seluruh transaksi aktif';
 }
 select.onchange=show;
 open.onclick=()=>{show();if(!dlg.open)dlg.showModal()};
 try{
  const payload=await publicJsonp();
  if(!payload||payload.status!=='success'||!payload.data||!Array.isArray(payload.data.rows))throw new Error('Data sumber tidak sesuai');
  entries=payload.data.rows.map(r=>{
   const debit=number(r.debit),credit=number(r.kredit),jenis=String(r.jenis||'').toLowerCase();
   return{debit,credit,rawDate:String(r.tanggal||''),iso:isoDate(r.tanggal),
    description:String(r.keterangan||r.kategori||'-').slice(0,250),
    kind:jenis};
  }).filter(r=>r.iso&&(r.debit>0||r.credit>0))
    .sort((a,b)=>b.iso.localeCompare(a.iso));
  if(!entries.length)throw new Error('Belum ada transaksi aktif');
  const totalIn=entries.reduce((sum,r)=>sum+r.debit,0),totalOut=entries.reduce((sum,r)=>sum+r.credit,0);
  const months=[...new Set(entries.map(x=>x.iso.slice(0,7)))].sort().reverse();
  const latest=months[0],active=entries.filter(x=>x.iso.startsWith(latest));
  const curIn=active.reduce((sum,r)=>sum+r.debit,0),curOut=active.reduce((sum,r)=>sum+r.credit,0);
  $('finance-in-month').textContent=money(curIn);$('finance-out-month').textContent=money(curOut);
  $('finance-in-total').textContent='Kumulatif: '+money(totalIn);
  $('finance-out-total').textContent='Kumulatif: '+money(totalOut);
  $('finance-balance').textContent=money(totalIn-totalOut);
  $('finance-period').textContent='Berdasarkan transaksi aktif s.d. '+entries[0].rawDate;
  months.forEach(m=>{
   const option=document.createElement('option');option.value=m;
   option.textContent=new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric'}).format(new Date(m+'-01T12:00:00'));
   select.append(option);
  });
  note.textContent='Sumber: Pembukuan aktif versi lama (baca saja). Nilai di atas adalah hasil perhitungan transaksi, bukan saldo final D1.';
 }catch(err){
  ['finance-in-month','finance-out-month','finance-balance'].forEach(id=>$(id).textContent='Belum tersedia');
  note.textContent='Ringkasan keuangan belum dapat dimuat dari Pembukuan aktif: '+err.message+'. Silakan lihat laporan di portal warga yang aktif.';
  open.disabled=true;
 }
}
