/* Staging adapter: Denda/Pinjaman writes mapped to guarded D1 Worker endpoints.
   Worker: FINANCE_WRITE_ENABLED and DENDA_PINJAMAN_WRITE_ENABLED must explicitly be true.
   Frontend refuses non-Cash methods because current Worker journals always hardcode Cash.
   Never fall back to Apps Script. */
(()=>{
'use strict';
const previous=window.__f4BookDemoCall;
if(typeof previous!=='function')throw Error('Bridge Pembukuan D1 belum tersedia.');
const API='https://api.flamboyan4.web.id',storageKey='f4-pending-denda-pinjaman-v1';
const isDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||''));
const money=v=>Number.isSafeInteger(Number(v))&&Number(v)>0?Number(v):null;
const text=(v,max=400)=>String(v||'').trim().slice(0,max);
async function api(path,data){
 const r=await fetch(API+path,{method:data?'POST':'GET',credentials:'include',cache:'no-store',mode:'cors',...(data?{headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{})});
 const j=await r.json().catch(()=>{throw Error('Respons D1 bukan JSON.')});
 if(!r.ok||j?.ok===false)throw Error(j?.error||'API menolak transaksi ('+r.status+').');
 return j;
}
let memoryPending=null;
function loadPending(){try{return JSON.parse(sessionStorage.getItem(storageKey)||'null')}catch{return memoryPending}}
function keep(v){memoryPending=v;try{sessionStorage.setItem(storageKey,JSON.stringify(v))}catch{}}
function clear(){memoryPending=null;try{sessionStorage.removeItem(storageKey)}catch{}}
function verifyMethod(value){
 const m=String(value||'Cash');
 if(m!=='Cash')throw Error('Worker Denda/Pinjaman belum mencatat metode '+m+'. Gunakan Cash atau tunda transaksi sampai Worker mendukung metode tersebut.');
 return m;
}
async function guardedPost(kind,path,data){
 if(!isDate(data.tanggal)||!money(data.jumlahRp)||text(data.catatan,501).length>500)
  throw Error('Tanggal, nominal, atau catatan transaksi tidak valid.');
 const fingerprint=JSON.stringify({kind,path,data});
 let pending=loadPending();
 if(!pending||pending.fingerprint!==fingerprint){
  pending={fingerprint,payload:{...data,requestKey:crypto.randomUUID()}};
  keep(pending);
 }
 const r=await api(path,pending.payload);
 clear();
 return r;
}
async function createFine(p){
 const payerId=text(p.idWarga,140),date=String(p.tanggalKegiatan||''),amount=money(p.nominal),
  title=text(p.namaKegiatan,90),description=text(p.keterangan,350);
 if(!payerId||!isDate(date)||!amount)throw Error('Isi warga, tanggal kegiatan, dan nominal denda terlebih dahulu.');
 if(!/^gorol$/i.test(title))throw Error('Worker saat ini hanya mendukung denda kegiatan Gorol; kategori kegiatan lain belum boleh disimpan.');
 const r=await guardedPost('fine-create','/api/bookkeeping/denda',{
  payerId,tanggal:date,jumlahRp:amount,catatan:description?title+': '+description:title
 });
 return {status:'success',idDenda:r.id,nominal:amount,duplikat:!!r.replayed};
}
async function payFine(p){
 const id=text(p.idDenda,150),date=String(p.tanggalBayar||'');
 if(!id||!isDate(date))throw Error('Pilih denda dan tanggal bayar.');
 verifyMethod(p.metode);
 const r=await api('/api/bookkeeping/denda?limit=200'),data=Array.isArray(r.data)?r.data:[];
 if(data.length>=200)throw Error('Daftar denda mencapai batas API; nilai pembayaran tidak boleh ditebak.');
 const d=data.find(x=>x.id===id);
 if(!d||d.perluRekonsiliasi||d.status==='dibatalkan')throw Error('Denda tidak ditemukan atau membutuhkan rekonsiliasi.');
 const amount=money(d.sisaRp);
 if(!amount)throw Error('Denda sudah lunas atau tidak mempunyai saldo yang valid.');
 const ans=await guardedPost('fine-pay','/api/bookkeeping/denda/bayar',{
  referenceId:id,tanggal:date,jumlahRp:amount,catatan:'Pelunasan denda '+id
 });
 return {status:'success',idPembayaranDenda:ans.id,nominal:amount,idTransaksiKas:ans.kasId,duplikat:!!ans.replayed};
}
async function createLoan(p){
 verifyMethod(p.metode);
 const payerId=text(p.idWarga,140),date=String(p.tanggal||''),amount=money(p.nominal);
 if(!payerId||!isDate(date)||!amount)throw Error('Pilih warga, tanggal, dan nominal pinjaman.');
 const r=await guardedPost('loan-create','/api/bookkeeping/pinjaman',{
  payerId,tanggal:date,jumlahRp:amount,catatan:text(p.keterangan,500)
 });
 return {status:'success',idPinjaman:r.id,nominal:amount,idTransaksiKas:r.kasId,duplikat:!!r.replayed};
}
async function repayLoan(p){
 verifyMethod(p.metode);
 const id=text(p.idPinjaman,150),date=String(p.tanggal||''),amount=money(p.nominal);
 if(!id||!isDate(date)||!amount)throw Error('Isi pinjaman, tanggal, dan nominal angsuran.');
 const detail=await api('/api/bookkeeping/pinjaman/detail?id='+encodeURIComponent(id));
 if(detail.perluRekonsiliasi||detail.pinjaman?.status!=='aktif')
  throw Error('Pinjaman perlu rekonsiliasi atau sudah tidak aktif.');
 const due=Number(detail.sisaRp);
 if(!Number.isSafeInteger(due)||amount>due)
  throw Error('Nominal angsuran melebihi saldo pinjaman atau datanya belum valid.');
 const ans=await guardedPost('loan-pay','/api/bookkeeping/pinjaman/bayar',{
  referenceId:id,tanggal:date,jumlahRp:amount,catatan:text(p.keterangan,500)
 });
 return {status:'success',idPembayaranPinjaman:ans.id,nominal:amount,sisaPinjaman:due-amount,
  idTransaksiKas:ans.kasId,duplikat:!!ans.replayed};
}
const handlers={buatdenda:createFine,bayardenda:payFine,buatpinjaman:createLoan,bayarpinjaman:repayLoan};
window.__f4BookDemoCall=p=>{
 const action=String(p?.action||'').toLowerCase();
 return Object.hasOwn(handlers,action)?handlers[action](p):previous(p);
};
})();