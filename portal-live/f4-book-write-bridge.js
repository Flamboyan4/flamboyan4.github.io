/* Flamboyan 4 — staged D1 Iuran write bridge.
   No direct Apps Script. Server enforces role, flags, year locks and idempotency.
   Keep Finance/Iuran write flags OFF until isolated data tests pass. */
(()=>{
'use strict';
const previous=window.__f4BookDemoCall;
if(typeof previous!=='function')throw Error('Layanan pembukuan belum siap.');
const API='https://api.flamboyan4.web.id',pendingKey='f4_pending_iuran_d1_v1';
const kinds=['IURAN_BULANAN','KEBERSIHAN','KAS_LORONG','ARISAN'];
const i=x=>Number.isSafeInteger(Number(x))?Number(x):NaN;
async function fetchApi(path,post){
 const response=await fetch(API+path,{method:post?'POST':'GET',credentials:'include',cache:'no-store',mode:'cors',...(post?{headers:{'Content-Type':'application/json'},body:JSON.stringify(post)}:{})});
 const body=await response.json().catch(()=>{throw Error('Respons layanan tidak dapat dibaca.')});
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
async function checkAdvances(payerId,periods){
 const r=await fetchApi('/api/bookkeeping/talangan?limit=200');
 const all=Array.isArray(r.data)?r.data:Array.isArray(r.rows)?r.rows:[];
 if(all.length>=200)throw Error('Daftar Talangan mencapai batas API; verifikasi Talangan sebelum mencatat iuran baru.');
 const relevant=all.filter(x=>String(x.payerId||'')===payerId&&String(x.status||'').toLowerCase()==='aktif'&&Number(x.sisaMenurutRingkasanRp)>0);
 if(!relevant.length)return null;
 if(relevant.length!==1)throw Error('Ada lebih dari satu Talangan aktif; selesaikan rekonsiliasi manual sebelum Iuran.');
 const a=relevant[0];
 if(a.perluRekonsiliasi)throw Error('Jurnal Talangan tidak konsisten; penggantian otomatis diblokir.');
 const matched=String(a.keterangan||'').match(/^\[Periode (20\d\d)-(0[1-9]|1[0-2])\]/);
 if(!matched)throw Error('Talangan tidak memiliki penanda bulan yang valid; periksa melalui pengelolaan Talangan.');
 const key=matched[1]+'-'+matched[2];
 if(!periods.some(p=>p.year+'-'+String(p.month).padStart(2,'0')===key))
  throw Error('Talangan aktif untuk '+key+'. Sertakan bulan tersebut dalam pembayaran iuran.');
 const selected=periods.find(p=>p.year+'-'+String(p.month).padStart(2,'0')===key);
 const rt=Number(selected.items.get('IURAN_BULANAN')||0)+Number(selected.items.get('KEBERSIHAN')||0);
 if(rt!==Number(a.sisaMenurutRingkasanRp)||Number(a.pokokRp)!==rt)
  throw Error('Nominal Talangan tidak cocok dengan kewajiban Iuran bulan '+key+'. Perlu pemeriksaan sebelum pembayaran.');
 return String(a.id);
}
async function buildPayment(p){
 const periods=[];
 for(let offset=0;offset<p.jumlahBulan;offset++){
  const date=new Date(Date.UTC(p.tahun,p.bulan-1+offset,1));
  const year=date.getUTCFullYear(),month=date.getUTCMonth()+1;
  const r=await fetchApi('/api/bookkeeping/iuran/outstanding?'+new URLSearchParams({payerId:p.payerId,year:String(year),month:String(month)}));
  const items=new Map((r.komponen||[]).map(x=>[x.jenis,i(x.sisaRp)]));
  if(kinds.some(kind=>!Number.isSafeInteger(items.get(kind))||items.get(kind)<0))
   throw Error('Sisa kewajiban tidak lengkap atau tidak valid untuk '+month+'/'+year);
  periods.push({year,month,items});
 }
 const settleAdvanceId=await checkAdvances(p.payerId,periods);
 const fixed=periods.reduce((sum,row)=>sum+kinds.filter(x=>x!=='KAS_LORONG').reduce((s,k)=>s+row.items.get(k),0),0);
 const total=periods.reduce((sum,row)=>sum+kinds.reduce((s,k)=>s+row.items.get(k),0),0);
 if(!Number.isSafeInteger(total)||p.jumlahRp<fixed||p.jumlahRp>total)
  throw Error('Nominal Rp '+p.jumlahRp.toLocaleString('id-ID')+' tidak sesuai sisa kewajiban. Komponen selain Kas Lorong harus lunas, sedangkan Kas Lorong boleh parsial.');
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
 return {payerId:p.payerId,tanggal:p.tanggal,metode:p.metode,catatan:p.catatan,jumlahRp:p.jumlahRp,alokasi,...(settleAdvanceId?{settleAdvanceId}:{})};
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
async function cancelIuran(params){
 const id=String(params.idPembayaran||'');
 if(!/^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))
   throw Error('Hanya pembayaran Iuran baru yang bisa dibatalkan dari portal.');
 const result=await fetchApi('/api/bookkeeping/iuran/cancel',{idPembayaran:id,alasan:String(params.alasan||'Dibatalkan dari portal').slice(0,300)});
 return {status:'success',idPembayaran:id,message:result.duplikat?'Pembayaran sebelumnya sudah dibatalkan.':'Pembayaran dan jurnal Kas terkait berhasil dibatalkan.',duplikat:!!result.duplikat};
}
async function editIuran(p){
 const id=String(p.idPembayaran||'');
 if(!/^pay-[a-f0-9-]{36}$/i.test(id))throw Error('Hanya Iuran baru yang belum diposting dapat diedit.');
 const r=await fetchApi('/api/bookkeeping/iuran/edit',{idPembayaran:id,
  tanggal:String(p.tanggal||''),metode:String(p.metode||''),catatan:String(p.catatan||'')});
 return {status:'success',message:r.message||'Perubahan berhasil disimpan.'};
}
async function bookCashBatch(p){
 const ids=String(p.idAlokasi||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(!ids.length)throw Error('Pilih pembayaran yang akan dibukukan.');
 const requestKey=crypto.randomUUID().replace(/-/g,'');
 const saved=await fetchApi('/api/bookkeeping/kas-batches',{
  requestKey,category:String(p.category||'kas_lorong'),stage:String(p.stage||'susulan'),
  year:Number(p.tahunSumber||p.tahunPembukuan),month:Number(p.bulanSumber||p.bulanPembukuan),
  bookedOn:String(p.tanggalPembukuan||''),description:String(p.keterangan||''),sourceIds:ids});
 return {status:'success',idBatch:saved.idBatch,nominal:saved.nominal,duplikat:!!saved.duplikat};
}
async function cancelCashBatch(p){
 const reason=String(p.alasan||'Pembatalan batch dari portal').trim();
 const saved=await fetchApi('/api/bookkeeping/kas-batches/cancel',{
  idBatch:String(p.idBatch||''),alasan:reason.length>=5?reason:'Pembatalan batch dari portal'});
 return {status:'success',message:saved.duplikat?'Batch sebelumnya telah dibatalkan.':'Pembukuan batch berhasil dibatalkan.',duplikat:!!saved.duplikat};
}
window.__f4BookDemoCall=(params={})=>{
 const action=String(params.action||'').toLowerCase();
 if(action==='buatbatchkas')return bookCashBatch(params);
 if(action==='batalkanbatchkas')return cancelCashBatch(params);
 if(action==='simpaniuran')return saveIuran(params);
 if(action==='batalkanpembayaran')return cancelIuran(params);
 if(action==='updatepembayaran')return editIuran(params);
 return previous(params);
};
})();