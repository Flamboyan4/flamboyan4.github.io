/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/f4-book-write-bridge.js",function(__f4){


/* Flamboyan 4 — staged D1 Iuran write bridge.
   No direct Apps Script. Server enforces role, flags, year locks and idempotency.
   Keep Finance/Iuran write flags OFF until isolated data tests pass. */
(()=>{
'use strict';
const previous=__f4.window.__f4BookDemoCall;
if(typeof previous!=='function')throw (0,__f4.globals.Error)('Layanan pembukuan belum siap.');
const API='https://api.flamboyan4.web.id',pendingKey='f4_pending_iuran_d1_v1';
const kinds=['IURAN_BULANAN','KEBERSIHAN','KAS_LORONG','ARISAN'];
const i=x=>__f4.globals.Number.isSafeInteger((0,__f4.globals.Number)(x))?(0,__f4.globals.Number)(x):__f4.globals.NaN;
async function fetchApi(path,post){
 const response=await (0,__f4.globals.fetch)(API+path,{method:post?'POST':'GET',credentials:'include',cache:'no-store',mode:'cors',...(post?{headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify(post)}:{})});
 const body=await response.json().catch(()=>{throw (0,__f4.globals.Error)('Respons layanan tidak dapat dibaca.')});
 if(!response.ok||body?.ok===false)throw (0,__f4.globals.Error)(body?.error||'HTTP '+response.status);
 if(post)__f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-bookkeeping-updated'));
 return body;
}
function requireInput(p){
 const data={
  payerId:(0,__f4.globals.String)(p?.idWarga||''),tanggal:(0,__f4.globals.String)(p?.tanggal||''),
  tahun:i(p?.tahun),bulan:i(p?.bulan),jumlahBulan:i(p?.jumlahBulan),
  jumlahRp:i(p?.nominalDibayar),metode:(0,__f4.globals.String)(p?.metode||''),
  catatan:(0,__f4.globals.String)(p?.catatan||'').trim()
 };
 if(!data.payerId||data.payerId.length>150||!/^\d{4}-\d{2}-\d{2}$/.test(data.tanggal)||
 !__f4.globals.Number.isInteger(data.tahun)||data.tahun<2020||data.tahun>2100||!__f4.globals.Number.isInteger(data.bulan)||data.bulan<1||data.bulan>12||
 !__f4.globals.Number.isInteger(data.jumlahBulan)||data.jumlahBulan<1||data.jumlahBulan>3||
 !__f4.globals.Number.isSafeInteger(data.jumlahRp)||data.jumlahRp<1||!['Cash','QRIS','Transfer Mandiri'].includes(data.metode)||data.catatan.length>500)
  throw (0,__f4.globals.Error)('Periksa warga, tanggal, bulan, nominal, metode, dan catatan pembayaran.');
 return data;
}
function savedPending(){
 try{const s=__f4.globals.sessionStorage.getItem(pendingKey);return s?__f4.globals.JSON.parse(s):null}catch{return null}
}
function setPending(value){
 try{__f4.globals.sessionStorage.setItem(pendingKey,__f4.globals.JSON.stringify(value))}catch{ /* In-memory retry below remains active. */ }
}
function clearPending(){
 try{__f4.globals.sessionStorage.removeItem(pendingKey)}catch{}
}
let memoryPending=null;
async function checkAdvances(payerId,periods){
 const r=await fetchApi('/api/bookkeeping/talangan?limit=200');
 const all=__f4.globals.Array.isArray(r.data)?r.data:__f4.globals.Array.isArray(r.rows)?r.rows:[];
 if(all.length>=200)throw (0,__f4.globals.Error)('Daftar Talangan mencapai batas API; verifikasi Talangan sebelum mencatat iuran baru.');
 const relevant=all.filter(x=>(0,__f4.globals.String)(x.payerId||'')===payerId&&(0,__f4.globals.String)(x.status||'').toLowerCase()==='aktif'&&(0,__f4.globals.Number)(x.sisaMenurutRingkasanRp)>0);
 if(!relevant.length)return null;
 if(relevant.length!==1)throw (0,__f4.globals.Error)('Ada lebih dari satu Talangan aktif; selesaikan rekonsiliasi manual sebelum Iuran.');
 const a=relevant[0];
 if(a.perluRekonsiliasi)throw (0,__f4.globals.Error)('Jurnal Talangan tidak konsisten; penggantian otomatis diblokir.');
 const matched=(0,__f4.globals.String)(a.keterangan||'').match(/^\[Periode (20\d\d)-(0[1-9]|1[0-2])\]/);
 if(!matched)throw (0,__f4.globals.Error)('Talangan tidak memiliki penanda bulan yang valid; periksa melalui pengelolaan Talangan.');
 const key=matched[1]+'-'+matched[2];
 if(!periods.some(p=>p.year+'-'+(0,__f4.globals.String)(p.month).padStart(2,'0')===key))
  throw (0,__f4.globals.Error)('Talangan aktif untuk '+key+'. Sertakan bulan tersebut dalam pembayaran iuran.');
 const selected=periods.find(p=>p.year+'-'+(0,__f4.globals.String)(p.month).padStart(2,'0')===key);
 const rt=(0,__f4.globals.Number)(selected.items.get('IURAN_BULANAN')||0)+(0,__f4.globals.Number)(selected.items.get('KEBERSIHAN')||0);
 if(rt!==(0,__f4.globals.Number)(a.sisaMenurutRingkasanRp)||(0,__f4.globals.Number)(a.pokokRp)!==rt)
  throw (0,__f4.globals.Error)('Nominal Talangan tidak cocok dengan kewajiban Iuran bulan '+key+'. Perlu pemeriksaan sebelum pembayaran.');
 return (0,__f4.globals.String)(a.id);
}
async function buildPayment(p){
 const periods=[];
 for(let offset=0;offset<p.jumlahBulan;offset++){
  const date=new __f4.globals.Date(__f4.globals.Date.UTC(p.tahun,p.bulan-1+offset,1));
  const year=date.getUTCFullYear(),month=date.getUTCMonth()+1;
  const r=await fetchApi('/api/bookkeeping/iuran/outstanding?'+new __f4.globals.URLSearchParams({payerId:p.payerId,year:(0,__f4.globals.String)(year),month:(0,__f4.globals.String)(month)}));
  const items=new __f4.globals.Map((r.komponen||[]).map(x=>[x.jenis,i(x.sisaRp)]));
  if(kinds.some(kind=>!__f4.globals.Number.isSafeInteger(items.get(kind))||items.get(kind)<0))
   throw (0,__f4.globals.Error)('Sisa kewajiban tidak lengkap atau tidak valid untuk '+month+'/'+year);
  periods.push({year,month,items});
 }
 const finesResponse=await fetchApi('/api/bookkeeping/iuran/fines?'+new __f4.globals.URLSearchParams({payerId:p.payerId,tanggal:p.tanggal}));
 const dueFines=__f4.globals.Array.isArray(finesResponse.data)?finesResponse.data:[];
 if(dueFines.some(x=>!x||!__f4.globals.Number.isSafeInteger((0,__f4.globals.Number)(x.sisaRp))||(0,__f4.globals.Number)(x.sisaRp)<0))
  throw (0,__f4.globals.Error)('Rincian Denda tidak valid. Periksa daftar Denda dahulu.');
 const cleanTotal=periods.reduce((s,row)=>s+row.items.get('KEBERSIHAN'),0);
 const fineTarget=__f4.globals.Math.min(cleanTotal,dueFines.reduce((s,x)=>s+(0,__f4.globals.Number)(x.sisaRp),0));
 const denda=[];
 let fineRemaining=fineTarget;
 for(const fine of dueFines){
  if(!fineRemaining)break;
  const nominal=__f4.globals.Math.min((0,__f4.globals.Number)(fine.sisaRp),fineRemaining);
  if(nominal>0)denda.push({id:(0,__f4.globals.String)(fine.id),nominal});
  fineRemaining-=nominal;
 }
 const settleAdvanceId=await checkAdvances(p.payerId,periods);
 const fixed=periods.reduce((sum,row)=>sum+kinds.filter(x=>x!=='KAS_LORONG').reduce((s,k)=>s+row.items.get(k),0),0);
 const total=periods.reduce((sum,row)=>sum+kinds.reduce((s,k)=>s+row.items.get(k),0),0);
 if(!__f4.globals.Number.isSafeInteger(total)||p.jumlahRp<fixed||p.jumlahRp>total)
  throw (0,__f4.globals.Error)('Nominal Rp '+p.jumlahRp.toLocaleString('id-ID')+' tidak sesuai sisa kewajiban. Komponen selain Kas Lorong harus lunas, sedangkan Kas Lorong boleh parsial.');
 let remainingKas=p.jumlahRp-fixed,remainingCleanRedirect=fineTarget;
 const alokasi=[];
 for(const row of periods){
  for(const jenis of kinds){
   const outstanding=row.items.get(jenis);
   let amount=outstanding;
   if(jenis==='KAS_LORONG'){amount=__f4.globals.Math.min(outstanding,remainingKas);remainingKas-=amount}
   if(jenis==='KEBERSIHAN'){
    const redirect=__f4.globals.Math.min(outstanding,remainingCleanRedirect);
    amount=outstanding-redirect;remainingCleanRedirect-=redirect;
   }
   if(amount>0)alokasi.push({tahun:row.year,bulan:row.month,jenis,nominal:amount});
  }
 }
 if(remainingKas!==0||remainingCleanRedirect!==0||
    alokasi.reduce((sum,a)=>sum+a.nominal,0)+denda.reduce((sum,x)=>sum+x.nominal,0)!==p.jumlahRp)
  throw (0,__f4.globals.Error)('Alokasi Iuran dan Denda tidak seimbang; transaksi tidak disimpan.');
 return {payerId:p.payerId,tanggal:p.tanggal,metode:p.metode,catatan:p.catatan,jumlahRp:p.jumlahRp,alokasi,denda,...(settleAdvanceId?{settleAdvanceId}:{})};
}
async function saveIuran(params){
 const p=requireInput(params);
 const fingerprint=__f4.globals.JSON.stringify(p);
 let pending=memoryPending||savedPending();
 if(!pending||pending.fingerprint!==fingerprint){
  const payload=await buildPayment(p);
  payload.requestKey=__f4.globals.crypto.randomUUID();
  pending={fingerprint,payload};
  memoryPending=pending;setPending(pending);
 }
 const r=await fetchApi('/api/bookkeeping/iuran',pending.payload);
 clearPending();memoryPending=null;
 return {status:'success',idPembayaran:r.idPembayaran,totalDiterima:pending.payload.jumlahRp,
  dendaDibayarRp:pending.payload.denda.reduce((s,x)=>s+x.nominal,0),
  iuranRp:pending.payload.alokasi.reduce((s,x)=>s+x.nominal,0),
  periode:[...new __f4.globals.Set(pending.payload.alokasi.map(x=>x.tahun+'-'+(0,__f4.globals.String)(x.bulan).padStart(2,'0')))],duplikat:!!r.duplikat};
}
async function cancelIuran(params){
 const id=(0,__f4.globals.String)(params.idPembayaran||'');
 if(!/^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))
   throw (0,__f4.globals.Error)('Hanya pembayaran Iuran baru yang bisa dibatalkan dari portal.');
 const result=await fetchApi('/api/bookkeeping/iuran/cancel',{idPembayaran:id,alasan:(0,__f4.globals.String)(params.alasan||'Dibatalkan dari portal').slice(0,300)});
 return {status:'success',idPembayaran:id,message:result.duplikat?'Pembayaran sebelumnya sudah dibatalkan.':'Pembayaran dan jurnal Kas terkait berhasil dibatalkan.',duplikat:!!result.duplikat};
}
async function editIuran(p){
 const id=(0,__f4.globals.String)(p.idPembayaran||'');
 if(!/^pay-[a-f0-9-]{36}$/i.test(id))throw (0,__f4.globals.Error)('Hanya Iuran baru yang belum diposting dapat diedit.');
 const r=await fetchApi('/api/bookkeeping/iuran/edit',{idPembayaran:id,
  tanggal:(0,__f4.globals.String)(p.tanggal||''),metode:(0,__f4.globals.String)(p.metode||''),catatan:(0,__f4.globals.String)(p.catatan||'')});
 return {status:'success',message:r.message||'Perubahan berhasil disimpan.'};
}
async function bookCashBatch(p){
 const ids=(0,__f4.globals.String)(p.idAlokasi||'').split(',').map(x=>x.trim()).filter(__f4.globals.Boolean);
 if(!ids.length)throw (0,__f4.globals.Error)('Pilih pembayaran yang akan dibukukan.');
 const requestKey=__f4.globals.crypto.randomUUID().replace(/-/g,'');
 const saved=await fetchApi('/api/bookkeeping/kas-batches',{
  requestKey,category:(0,__f4.globals.String)(p.category||'kas_lorong'),stage:(0,__f4.globals.String)(p.stage||'susulan'),
  year:(0,__f4.globals.Number)(p.tahunSumber||p.tahunPembukuan),month:(0,__f4.globals.Number)(p.bulanSumber||p.bulanPembukuan),
  bookedOn:(0,__f4.globals.String)(p.tanggalPembukuan||''),description:(0,__f4.globals.String)(p.keterangan||''),sourceIds:ids});
 return {status:'success',idBatch:saved.idBatch,nominal:saved.nominal,duplikat:!!saved.duplikat};
}
async function cancelCashBatch(p){
 const reason=(0,__f4.globals.String)(p.alasan||'Pembatalan batch dari portal').trim();
 const saved=await fetchApi('/api/bookkeeping/kas-batches/cancel',{
  idBatch:(0,__f4.globals.String)(p.idBatch||''),alasan:reason.length>=5?reason:'Pembatalan batch dari portal'});
 return {status:'success',message:saved.duplikat?'Batch sebelumnya telah dibatalkan.':'Pembukuan batch berhasil dibatalkan.',duplikat:!!saved.duplikat};
}
__f4.window.__f4BookDemoCall=(params={})=>{
 const action=(0,__f4.globals.String)(params.action||'').toLowerCase();
 if(action==='buatbatchkas')return bookCashBatch(params);
 if(action==='batalkanbatchkas')return cancelCashBatch(params);
 if(action==='simpaniuran')return saveIuran(params);
 if(action==='batalkanpembayaran')return cancelIuran(params);
 if(action==='updatepembayaran')return editIuran(params);
 return previous(params);
};
})();
});
