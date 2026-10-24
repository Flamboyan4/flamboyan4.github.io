/* Flamboyan 4 — D1 operational adapter (staging-safe).
   No Apps Script fallback; all writes remain guarded by Worker flags/roles.
   Every POST uses idempotency keys. Never create financial entries on load. */
(()=>{
'use strict';
const previous=window.__f4BookDemoCall;
if(typeof previous!=='function')throw Error('D1 read adapter must load before operations adapter.');
const API='https://api.flamboyan4.web.id';
const asText=(v,max=500)=>String(v??'').trim().slice(0,max);
const positive=v=>Number.isSafeInteger(Number(v))&&Number(v)>0?Number(v):null;
function dateOK(v){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v||''));
 if(!m)return false;
 const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]);
 const x=new Date(Date.UTC(y,mo-1,d));
 return y>=2020&&y<=2100&&x.getUTCFullYear()===y&&x.getUTCMonth()+1===mo&&x.getUTCDate()===d;
}
function requireMethod(raw){
 const value=String(raw||'Cash');
 if(!['Cash','QRIS','Transfer Mandiri'].includes(value))throw Error('Metode pembayaran tidak didukung.');
 return value;
}
async function api(path,payload){
 const res=await fetch(API+path,{method:payload?'POST':'GET',credentials:'include',cache:'no-store',mode:'cors',...(payload?{headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}:{})});
 const data=await res.json().catch(()=>{throw Error('Respons Worker tidak valid (bukan JSON).')});
 if(!res.ok||data?.ok===false)throw Error(data?.error||'Worker menolak permintaan ('+res.status+').');
 return data;
}
const pendingMem=new Map();
function slot(op){return 'f4-d1-write-pending-v2-'+op}
function getPending(op){try{const s=sessionStorage.getItem(slot(op));return s?JSON.parse(s):pendingMem.get(op)}catch{return pendingMem.get(op)}}
function putPending(op,p){pendingMem.set(op,p);try{sessionStorage.setItem(slot(op),JSON.stringify(p))}catch{}}
function clearPending(op){pendingMem.delete(op);try{sessionStorage.removeItem(slot(op))}catch{}}
async function postOnce(op,path,body){
 if(!dateOK(body.tanggal)&&op!=='cash-cancel')throw Error('Tanggal transaksi tidak valid.');
 const fingerprint=JSON.stringify({path,body});
 let pending=getPending(op);
 if(!pending||pending.fingerprint!==fingerprint){
  pending={fingerprint,payload:{...body,requestKey:crypto.randomUUID()}};
  putPending(op,pending);
 }
 const result=await api(path,pending.payload);
 clearPending(op);
 return result;
}
function cashBody(p){
 const jenis=String(p.jenis||'').toLowerCase();
 const kind=jenis==='pemasukan'||jenis==='debit'?'debit':jenis==='pengeluaran'||jenis==='kredit'?'kredit':'';
 const amount=positive(p.nominal),date=String(p.tanggal||''),metode=requireMethod(p.metode);
 const kategori=asText(p.kategori,120),keterangan=asText(p.keterangan,500),catatan=asText(p.catatan,500);
 if(!kind||!amount||!dateOK(date)||!kategori||!keterangan)throw Error('Isi tanggal, jenis, kategori, keterangan, dan nominal Kas dengan benar.');
 if(kind==='kredit'&&metode!=='Cash')throw Error('Worker Kas belum mendukung pengeluaran QRIS/Transfer. Pilih Cash atau tunda pencatatan.');
 return {tanggal:date,jenis:kind,jumlahRp:amount,kategori,keterangan,metode,catatan};
}
async function createCash(p){
 const amount=positive(p.nominal),r=await postOnce('cash-create','/api/bookkeeping/cash',cashBody(p));
 return {status:'success',idTransaksi:r.id,nominal:amount,duplikat:!!r.duplikat};
}
async function editCash(p){
 const body=cashBody(p);
 const id=asText(p.idTransaksi,150);
 if(!/^cash-[0-9a-f-]{36}$/.test(id))throw Error('Hanya transaksi Kas manual baru yang dapat diedit. Catatan migrasi tidak boleh diubah.');
 const r=await api('/api/bookkeeping/cash/edit',{id,...body});
 return {status:'success',idTransaksi:r.id,message:'Transaksi Kas diperbarui.'};
}
async function cancelCash(p){
 const id=asText(p.idTransaksi,150);
 if(!/^cash-[0-9a-f-]{36}$/.test(id))throw Error('Hanya transaksi Kas manual baru yang dapat dibatalkan.');
 const r=await api('/api/bookkeeping/cash/cancel',{id});
 return {status:'success',idTransaksi:r.id,message:'Transaksi Kas dibatalkan tanpa menghapus riwayat.'};
}
async function createFine(p){
 const payerId=asText(p.idWarga,150),tanggal=String(p.tanggalKegiatan||'');
 const amount=positive(p.nominal),event=asText(p.namaKegiatan,100),notes=asText(p.keterangan,350);
 if(!payerId||!amount||!dateOK(tanggal))throw Error('Pilih warga, tanggal, dan nominal Denda.');
 if(!/\bgorol\b/i.test(event))throw Error('Endpoint Denda saat ini hanya menerima kegiatan Gorol.');
 const r=await postOnce('fine-create','/api/bookkeeping/denda',{
  payerId,tanggal,jumlahRp:amount,catatan:notes?event+': '+notes:event
 });
 return {status:'success',idDenda:r.id,nominal:amount,duplikat:!!r.replayed};
}
async function payFine(p){
 const id=asText(p.idDenda,150),tanggal=String(p.tanggalBayar||'');
 const metode=requireMethod(p.metode);
 if(!id||!dateOK(tanggal))throw Error('Pilih Denda dan tanggal pembayaran.');
 const res=await api('/api/bookkeeping/denda?limit=200');
 const data=Array.isArray(res.data)?res.data:[];
 if(data.length>=200)throw Error('Daftar Denda terpotong, tidak boleh menebak nominal.');
 const row=data.find(x=>x.id===id);
 if(!row||row.perluRekonsiliasi||['batal','dibatalkan','lunas'].includes(String(row.status||'').toLowerCase()))throw Error('Denda tidak tersedia untuk dibayar.');
 const amount=positive(row.sisaRp);
 if(!amount)throw Error('Denda tidak memiliki sisa valid.');
 const r=await postOnce('fine-pay','/api/bookkeeping/denda/bayar',{
  referenceId:id,tanggal,jumlahRp:amount,metode,catatan:'Pelunasan denda '+id
 });
 return {status:'success',idPembayaranDenda:r.id,nominal:amount,idTransaksiKas:r.kasId,duplikat:!!r.replayed};
}
async function createLoan(p){
 const payerId=asText(p.idWarga,150),tanggal=String(p.tanggal||''),amount=positive(p.nominal);
 const metode=requireMethod(p.metode);
 if(!payerId||!dateOK(tanggal)||!amount)throw Error('Pilih warga, tanggal, dan nominal Pinjaman.');
 const r=await postOnce('loan-create','/api/bookkeeping/pinjaman',{
  payerId,tanggal,jumlahRp:amount,metode,catatan:asText(p.keterangan)
 });
 return {status:'success',idPinjaman:r.id,nominal:amount,idTransaksiKas:r.kasId,duplikat:!!r.replayed};
}
async function repayLoan(p){
 const id=asText(p.idPinjaman,150),tanggal=String(p.tanggal||''),amount=positive(p.nominal),metode=requireMethod(p.metode);
 if(!id||!dateOK(tanggal)||!amount)throw Error('Isi Pinjaman, tanggal dan jumlah angsuran.');
 const detail=await api('/api/bookkeeping/pinjaman/detail?id='+encodeURIComponent(id));
 if(detail.perluRekonsiliasi||String(detail.pinjaman?.status||'').toLowerCase()!=='aktif')throw Error('Pinjaman belum siap dicicil atau perlu audit.');
 const due=Number(detail.sisaRp);
 if(!Number.isSafeInteger(due)||due<amount)throw Error('Angsuran melebihi sisa Pinjaman.');
 const r=await postOnce('loan-pay','/api/bookkeeping/pinjaman/bayar',{
  referenceId:id,tanggal,jumlahRp:amount,metode,catatan:asText(p.keterangan)
 });
 return {status:'success',idPembayaranPinjaman:r.id,nominal:amount,sisaPinjaman:due-amount,idTransaksiKas:r.kasId,duplikat:!!r.replayed};
}
async function createAdvance(p){
 const payerId=asText(p.idWarga,150),tanggal=String(p.tanggal||''),tahun=Number(p.tahun),bulan=Number(p.bulan);
 if(!payerId||!dateOK(tanggal)||!Number.isInteger(tahun)||tahun<2020||tahun>2100||!Number.isInteger(bulan)||bulan<1||bulan>12)
  throw Error('Pilih warga, tanggal dan periode Talangan.');
 const list=await api('/api/bookkeeping/talangan?limit=200');
 const rows=Array.isArray(list.data)?list.data:[];
 if(rows.length>=200)throw Error('Daftar Talangan terpotong; cek secara manual dahulu.');
 if(rows.some(x=>String(x.payerId||'')===payerId&&String(x.status||'').toLowerCase()==='aktif'&&Number(x.sisaMenurutRingkasanRp)>0))
  throw Error('Warga masih memiliki Talangan aktif. Periksa dan selesaikan terlebih dahulu.');
 const outstanding=await api('/api/bookkeeping/iuran/outstanding?'+new URLSearchParams({payerId,year:String(tahun),month:String(bulan)}));
 const parts=Array.isArray(outstanding.komponen)?outstanding.komponen:[];
 const get=kind=>{const row=parts.find(x=>x.jenis===kind);return row&&Number.isSafeInteger(Number(row.sisaRp))?Number(row.sisaRp):NaN};
 const amount=get('IURAN_BULANAN')+get('KEBERSIHAN');
 if(!Number.isSafeInteger(amount)||amount<=0)throw Error('Sisa Iuran Bulanan/Kebersihan tidak valid atau sudah lunas.');
 const month=String(bulan).padStart(2,'0'),keterangan='[Periode '+tahun+'-'+month+'] '+asText(p.keterangan,420);
 const r=await postOnce('advance-create','/api/bookkeeping/talangan',{
  tanggal,payerId,ditanggungOleh:'Kas Warga Flamboyan 4',jumlahRp:amount,keterangan
 });
 return {status:'success',idTalangan:r.id,nominal:amount,tanggalJatuhTempo:r.jatuhTempo,duplikat:!!r.duplikat};
}
const actions={
 inputtransaksikas:createCash,edittransaksikas:editCash,batalkantransaksikas:cancelCash,
 buatdenda:createFine,bayardenda:payFine,buatpinjaman:createLoan,bayarpinjaman:repayLoan,
 buattalangan:createAdvance
};
window.__f4BookDemoCall=(p={})=>{
 const action=String(p.action||'').toLowerCase();
 return Object.hasOwn(actions,action)?actions[action](p):previous(p);
};
})();