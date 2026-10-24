/* Flamboyan 4 — staged D1 Iuran write bridge.
   No direct Apps Script. Server enforces role, flags, year locks and idempotency.
   Keep Finance/Iuran write flags OFF until isolated data tests pass. */
(()=>{
'use strict';
const previous=window.__f4BookDemoCall;
if(typeof previous!=='function')throw Error('Bridge D1 Pembukuan baca belum tersedia.');
const API='https://api.flamboyan4.web.id',pendingKey='f4_pending_iuran_d1_v1';
const kinds=['IURAN_BULANAN','KEBERSIHAN','KAS_LORONG','ARISAN'];
const i=x=>Number.isSafeInteger(Number(x))?Number(x):NaN;
async function fetchApi(path,post){
 const response=await fetch(API+path,{method:post?'POST':'GET',credentials:'include',cache:'no-store',mode:'cors',...(post?{headers:{'Content-Type':'application/json'},body:JSON.stringify(post)}:{})});
 const body=await response.json().catch(()=>{throw Error('Respons API D1 bukan JSON.')});
 if(!response.ok||body?.ok===false)throw Error(body?.error||'HTTP '+response.status);
 return body;
}
function requireInput(p){
 const data={
  payerId:String(p?.idWarga||''),tanggal:String(p?.tanggal||''),
  tahun:i(p?.tahun),bulan:i(p?.bulan),jumlahBulan:i(p?.jumlahBulan),
  jumlahRp:i(p?.nominalDibayar),metode:String(p?.metode||''),
  catatan:String(p?.catatan||'').trim()
 };
 if(!data.payerId||data.payerId.length>150||!/^\d{4}-\d{2}-\d{2}$/.test(data.tanggal)||
 !Number.isInteger(data.tahun)||data.tahun<2020||data.tahun>2100||!Number.isInteger(data.bulan)||data.bulan<1||data.bulan>12||
 !Number.isInteger(data.jumlahBulan)||data.jumlahBulan<1||data.jumlahBulan>3||
 !Number.isSafeInteger(data.jumlahRp)||data.jumlahRp<1||!['Cash','QRIS','Transfer Mandiri'].includes(data.metode)||data.catatan.length>500)
  throw Error('Periksa warga, tanggal, bulan, nominal, metode, dan catatan pembayaran.');
 return data;
}
function savedPending(){
 try{const s=sessionStorage.getItem(pendingKey);return s?JSON.parse(s):null}catch{return null}
}
function setPending(value){
 try{sessionStorage.setItem(pendingKey,JSON.stringify(value))}catch{ /* In-memory retry below remains active. */ }
}
function clearPending(){
 try{sessionStorage.removeItem(pendingKey)}catch{}
}
let memoryPending=null;
async function checkAdvances(payerId){
 const r=await fetchApi('/api/bookkeeping/talangan?limit=200');
 const all=Array.isArray(r.data)?r.data:Array.isArray(r.rows)?r.rows:[];
 if(all.length>=200)throw Error('Daftar Talangan mencapai batas API; verifikasi Talangan sebelum mencatat iuran baru.');
 for(const x of all){
  const remain=i(x.sisaMenurutRingkasanRp??(i(x.pokokRp)-i(x.pelunasanRingkasanRp)));
  if(!(remain>0)||String(x.status||'').toLowerCase()==='dibatalkan')continue;
  const d=await fetchApi('/api/bookkeeping/talangan/detail?id='+encodeURIComponent(x.id));
  const advance=d.talangan||d.data?.talangan||{};
  if(String(advance.payerId||'')===payerId)
   throw Error('Warga memiliki Talangan aktif. Sinkronisasi Talangan belum aman melalui form Iuran ini; selesaikan lewat pengelolaan Talangan terlebih dahulu.');
 }
}
async function buildPayment(p){
 await checkAdvances(p.payerId);
 const periods=[];
 for(let offset=0;offset<p.jumlahBulan;offset++){
  const date=new Date(Date.UTC(p.tahun,p.bulan-1+offset,1));
  const year=date.getUTCFullYear(),month=date.getUTCMonth()+1;
  const r=await fetchApi('/api/bookkeeping/iuran/outstanding?'+new URLSearchParams({payerId:p.payerId,year:String(year),month:String(month)}));
  const items=new Map((r.komponen||[]).map(x=>[x.jenis,i(x.sisaRp)]));
  if(kinds.some(kind=>!Number.isSafeInteger(items.get(kind))||items.get(kind)<0))
   throw Error('Sisa kewajiban D1 tidak lengkap atau tidak valid untuk '+month+'/'+year);
  periods.push({year,month,items});
 }
 const fixed=periods.reduce((sum,row)=>sum+kinds.filter(x=>x!=='KAS_LORONG').reduce((s,k)=>s+row.items.get(k),0),0);
 const total=periods.reduce((sum,row)=>sum+kinds.reduce((s,k)=>s+row.items.get(k),0),0);
 if(!Number.isSafeInteger(total)||p.jumlahRp<fixed||p.jumlahRp>total)
  throw Error('Nominal Rp '+p.jumlahRp.toLocaleString('id-ID')+' tidak sesuai sisa kewajiban D1. Komponen selain Kas Lorong harus lunas, sedangkan Kas Lorong boleh parsial.');
 let remainingKas=p.jumlahRp-fixed;
 const alokasi=[];
 for(const row of periods){
  for(const jenis of kinds){
   const outstanding=row.items.get(jenis);
   const amount=jenis==='KAS_LORONG'?Math.min(outstanding,remainingKas):outstanding;
   if(jenis==='KAS_LORONG')remainingKas-=amount;
   if(amount>0)alokasi.push({tahun:row.year,bulan:row.month,jenis,nominal:amount});
  }
 }
 if(remainingKas!==0||alokasi.reduce((sum,a)=>sum+a.nominal,0)!==p.jumlahRp)
  throw Error('Alokasi otomatis tidak seimbang; transaksi dibatalkan sebelum tersimpan.');
 return {payerId:p.payerId,tanggal:p.tanggal,metode:p.metode,catatan:p.catatan,jumlahRp:p.jumlahRp,alokasi};
}
async function saveIuran(params){
 const p=requireInput(params);
 const fingerprint=JSON.stringify(p);
 let pending=memoryPending||savedPending();
 if(!pending||pending.fingerprint!==fingerprint){
  const payload=await buildPayment(p);
  payload.requestKey=crypto.randomUUID();
  pending={fingerprint,payload};
  memoryPending=pending;setPending(pending);
 }
 const r=await fetchApi('/api/bookkeeping/iuran',pending.payload);
 clearPending();memoryPending=null;
 return {status:'success',idPembayaran:r.idPembayaran,totalDiterima:pending.payload.jumlahRp,
  periode:[...new Set(pending.payload.alokasi.map(x=>x.tahun+'-'+String(x.bulan).padStart(2,'0')))],duplikat:!!r.duplikat};
}
window.__f4BookDemoCall=(params={})=>String(params.action||'').toLowerCase()==='simpaniuran'?saveIuran(params):previous(params);
})();