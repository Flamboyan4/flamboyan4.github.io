/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/f4-book-operations-bridge.js",function(__f4){


/* Flamboyan 4 — D1 operational adapter (staging-safe).
   No Apps Script fallback; all writes remain guarded by Worker flags/roles.
   Every POST uses idempotency keys. Never create financial entries on load. */
(()=>{
'use strict';
const previous=__f4.window.__f4BookDemoCall;
if(typeof previous!=='function')throw (0,__f4.globals.Error)('D1 read adapter must load before operations adapter.');
const API='https://api.flamboyan4.web.id';
const asText=(v,max=500)=>(0,__f4.globals.String)(v??'').trim().slice(0,max);
const positive=v=>__f4.globals.Number.isSafeInteger((0,__f4.globals.Number)(v))&&(0,__f4.globals.Number)(v)>0?(0,__f4.globals.Number)(v):null;
function dateOK(v){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec((0,__f4.globals.String)(v||''));
 if(!m)return false;
 const y=(0,__f4.globals.Number)(m[1]),mo=(0,__f4.globals.Number)(m[2]),d=(0,__f4.globals.Number)(m[3]);
 const x=new __f4.globals.Date(__f4.globals.Date.UTC(y,mo-1,d));
 return y>=2020&&y<=2100&&x.getUTCFullYear()===y&&x.getUTCMonth()+1===mo&&x.getUTCDate()===d;
}
function requireMethod(raw){
 const value=(0,__f4.globals.String)(raw||'Cash');
 if(!['Cash','QRIS','Transfer Mandiri'].includes(value))throw (0,__f4.globals.Error)('Metode pembayaran tidak didukung.');
 return value;
}
async function api(path,payload){
 const res=await (0,__f4.globals.fetch)(API+path,{method:payload?'POST':'GET',credentials:'include',cache:'no-store',mode:'cors',...(payload?{headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify(payload)}:{})});
 const data=await res.json().catch(()=>{throw (0,__f4.globals.Error)('Respons Worker tidak valid (bukan JSON).')});
 if(!res.ok||data?.ok===false)throw (0,__f4.globals.Error)(data?.error||'Worker menolak permintaan ('+res.status+').');
 if(payload)__f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-bookkeeping-updated'));
 return data;
}
const pendingMem=new __f4.globals.Map();
function slot(op){return 'f4-d1-write-pending-v2-'+op}
function getPending(op){try{const s=__f4.globals.sessionStorage.getItem(slot(op));return s?__f4.globals.JSON.parse(s):pendingMem.get(op)}catch{return pendingMem.get(op)}}
function putPending(op,p){pendingMem.set(op,p);try{__f4.globals.sessionStorage.setItem(slot(op),__f4.globals.JSON.stringify(p))}catch{}}
function clearPending(op){pendingMem.delete(op);try{__f4.globals.sessionStorage.removeItem(slot(op))}catch{}}
async function postOnce(op,path,body){
 if(!dateOK(body.tanggal)&&op!=='cash-cancel')throw (0,__f4.globals.Error)('Tanggal transaksi tidak valid.');
 const fingerprint=__f4.globals.JSON.stringify({path,body});
 let pending=getPending(op);
 if(!pending||pending.fingerprint!==fingerprint){
  pending={fingerprint,payload:{...body,requestKey:__f4.globals.crypto.randomUUID()}};
  putPending(op,pending);
 }
 const result=await api(path,pending.payload);
 clearPending(op);
 return result;
}
function cashBody(p){
 const jenis=(0,__f4.globals.String)(p.jenis||'').toLowerCase();
 const kind=jenis==='pemasukan'||jenis==='debit'?'debit':jenis==='pengeluaran'||jenis==='kredit'?'kredit':'';
 const amount=positive(p.nominal),date=(0,__f4.globals.String)(p.tanggal||''),metode=requireMethod(p.metode);
 const kategori=asText(p.kategori,120),keterangan=asText(p.keterangan,500),catatan=asText(p.catatan,500);
 if(!kind||!amount||!dateOK(date)||!kategori||!keterangan)throw (0,__f4.globals.Error)('Isi tanggal, jenis, kategori, keterangan, dan nominal Kas dengan benar.');
 if(kind==='kredit'&&metode!=='Cash')throw (0,__f4.globals.Error)('Worker Kas belum mendukung pengeluaran QRIS/Transfer. Pilih Cash atau tunda pencatatan.');
 return {tanggal:date,jenis:kind,jumlahRp:amount,kategori,keterangan,metode,catatan};
}
async function createCash(p){
 const amount=positive(p.nominal),r=await postOnce('cash-create','/api/bookkeeping/cash',cashBody(p));
 return {status:'success',idTransaksi:r.id,nominal:amount,duplikat:!!r.duplikat};
}
async function editCash(p){
 const body=cashBody(p);
 const id=asText(p.idTransaksi,150);
 if(!/^cash-[0-9a-f-]{36}$/.test(id))throw (0,__f4.globals.Error)('Hanya transaksi Kas manual baru yang dapat diedit. Catatan migrasi tidak boleh diubah.');
 const r=await api('/api/bookkeeping/cash/edit',{id,...body});
 return {status:'success',idTransaksi:r.id,message:'Transaksi Kas diperbarui.'};
}
async function cancelCash(p){
 const id=asText(p.idTransaksi,150);
 if(!/^cash-[0-9a-f-]{36}$/.test(id))throw (0,__f4.globals.Error)('Hanya transaksi Kas manual baru yang dapat dibatalkan.');
 const r=await api('/api/bookkeeping/cash/cancel',{id});
 return {status:'success',idTransaksi:r.id,message:'Transaksi Kas dibatalkan tanpa menghapus riwayat.'};
}
async function createFine(p){
 const payerId=asText(p.idWarga,150),tanggal=(0,__f4.globals.String)(p.tanggalKegiatan||'');
 const amount=positive(p.nominal),event=asText(p.namaKegiatan,100),notes=asText(p.keterangan,350);
 if(!payerId||!amount||!dateOK(tanggal))throw (0,__f4.globals.Error)('Pilih warga, tanggal, dan nominal Denda.');
 if(!/\bgorol\b/i.test(event))throw (0,__f4.globals.Error)('Endpoint Denda saat ini hanya menerima kegiatan Gorol.');
 const r=await postOnce('fine-create','/api/bookkeeping/denda',{
  payerId,tanggal,jumlahRp:amount,catatan:notes?event+': '+notes:event
 });
 return {status:'success',idDenda:r.id,nominal:amount,duplikat:!!r.replayed};
}
async function payFine(p){
 const id=asText(p.idDenda,150),tanggal=(0,__f4.globals.String)(p.tanggalBayar||'');
 const metode=requireMethod(p.metode);
 if(!id||!dateOK(tanggal))throw (0,__f4.globals.Error)('Pilih Denda dan tanggal pembayaran.');
 const res=await api('/api/bookkeeping/denda?limit=200');
 const data=__f4.globals.Array.isArray(res.data)?res.data:[];
 if(data.length>=200)throw (0,__f4.globals.Error)('Daftar Denda terpotong, tidak boleh menebak nominal.');
 const row=data.find(x=>x.id===id);
 if(!row||row.perluRekonsiliasi||['batal','dibatalkan','lunas'].includes((0,__f4.globals.String)(row.status||'').toLowerCase()))throw (0,__f4.globals.Error)('Denda tidak tersedia untuk dibayar.');
 const amount=positive(row.sisaRp);
 if(!amount)throw (0,__f4.globals.Error)('Denda tidak memiliki sisa valid.');
 const r=await postOnce('fine-pay','/api/bookkeeping/denda/bayar',{
  referenceId:id,tanggal,jumlahRp:amount,metode,catatan:'Pelunasan denda '+id
 });
 return {status:'success',idPembayaranDenda:r.id,nominal:amount,idTransaksiKas:r.kasId,duplikat:!!r.replayed};
}
async function createLoan(p){
 const payerId=asText(p.idWarga,150),tanggal=(0,__f4.globals.String)(p.tanggal||''),amount=positive(p.nominal);
 const metode=requireMethod(p.metode);
 if(!payerId||!dateOK(tanggal)||!amount)throw (0,__f4.globals.Error)('Pilih warga, tanggal, dan nominal Pinjaman.');
 const r=await postOnce('loan-create','/api/bookkeeping/pinjaman',{
  payerId,tanggal,jumlahRp:amount,metode,catatan:asText(p.keterangan)
 });
 return {status:'success',idPinjaman:r.id,nominal:amount,idTransaksiKas:r.kasId,duplikat:!!r.replayed};
}
async function repayLoan(p){
 const id=asText(p.idPinjaman,150),tanggal=(0,__f4.globals.String)(p.tanggal||''),amount=positive(p.nominal),metode=requireMethod(p.metode);
 if(!id||!dateOK(tanggal)||!amount)throw (0,__f4.globals.Error)('Isi Pinjaman, tanggal dan jumlah angsuran.');
 const detail=await api('/api/bookkeeping/pinjaman/detail?id='+(0,__f4.globals.encodeURIComponent)(id));
 if(detail.perluRekonsiliasi||(0,__f4.globals.String)(detail.pinjaman?.status||'').toLowerCase()!=='aktif')throw (0,__f4.globals.Error)('Pinjaman belum siap dicicil atau perlu audit.');
 const due=(0,__f4.globals.Number)(detail.sisaRp);
 if(!__f4.globals.Number.isSafeInteger(due)||due<amount)throw (0,__f4.globals.Error)('Angsuran melebihi sisa Pinjaman.');
 const r=await postOnce('loan-pay','/api/bookkeeping/pinjaman/bayar',{
  referenceId:id,tanggal,jumlahRp:amount,metode,catatan:asText(p.keterangan)
 });
 return {status:'success',idPembayaranPinjaman:r.id,nominal:amount,sisaPinjaman:due-amount,idTransaksiKas:r.kasId,duplikat:!!r.replayed};
}
async function createAdvance(p){
 const payerId=asText(p.idWarga,150),tanggal=(0,__f4.globals.String)(p.tanggal||''),tahun=(0,__f4.globals.Number)(p.tahun),bulan=(0,__f4.globals.Number)(p.bulan);
 if(!payerId||!dateOK(tanggal)||!__f4.globals.Number.isInteger(tahun)||tahun<2020||tahun>2100||!__f4.globals.Number.isInteger(bulan)||bulan<1||bulan>12)
  throw (0,__f4.globals.Error)('Pilih warga, tanggal dan periode Talangan.');
 const list=await api('/api/bookkeeping/talangan?limit=200');
 const rows=__f4.globals.Array.isArray(list.data)?list.data:[];
 if(rows.length>=200)throw (0,__f4.globals.Error)('Daftar Talangan terpotong; cek secara manual dahulu.');
 if(rows.some(x=>(0,__f4.globals.String)(x.payerId||'')===payerId&&(0,__f4.globals.String)(x.status||'').toLowerCase()==='aktif'&&(0,__f4.globals.Number)(x.sisaMenurutRingkasanRp)>0))
  throw (0,__f4.globals.Error)('Warga masih memiliki Talangan aktif. Periksa dan selesaikan terlebih dahulu.');
 const outstanding=await api('/api/bookkeeping/iuran/outstanding?'+new __f4.globals.URLSearchParams({payerId,year:(0,__f4.globals.String)(tahun),month:(0,__f4.globals.String)(bulan)}));
 const parts=__f4.globals.Array.isArray(outstanding.komponen)?outstanding.komponen:[];
 const get=kind=>{const row=parts.find(x=>x.jenis===kind);return row&&__f4.globals.Number.isSafeInteger((0,__f4.globals.Number)(row.sisaRp))?(0,__f4.globals.Number)(row.sisaRp):__f4.globals.NaN};
 const amount=get('IURAN_BULANAN')+get('KEBERSIHAN');
 if(!__f4.globals.Number.isSafeInteger(amount)||amount<=0)throw (0,__f4.globals.Error)('Sisa Iuran Bulanan/Kebersihan tidak valid atau sudah lunas.');
 const month=(0,__f4.globals.String)(bulan).padStart(2,'0'),keterangan='[Periode '+tahun+'-'+month+'] '+asText(p.keterangan,420);
 const r=await postOnce('advance-create','/api/bookkeeping/talangan',{
  tanggal,payerId,ditanggungOleh:'Kas Warga Flamboyan 4',jumlahRp:amount,keterangan
 });
 return {status:'success',idTalangan:r.id,nominal:amount,tanggalJatuhTempo:r.jatuhTempo,duplikat:!!r.duplikat};
}

async function createKasGroup(p){
 const category=(0,__f4.globals.String)(p.category||'kas_lorong'),stage=(0,__f4.globals.String)(p.stage||'susulan');
 const month=(0,__f4.globals.Number)(p.bulanSumber||p.bulanPembukuan),year=(0,__f4.globals.Number)(p.tahunSumber||p.tahunPembukuan);
 const ids=(0,__f4.globals.String)(p.idAlokasi||'').split(',').map(x=>x.trim()).filter(__f4.globals.Boolean);
 const date=(0,__f4.globals.String)(p.tanggalPembukuan||''),desc=(0,__f4.globals.String)(p.keterangan||'').trim();
 if(!['kas_lorong','denda_gorol'].includes(category)||!['setoran_rt','arisan','susulan'].includes(stage)||
    !__f4.globals.Number.isInteger(month)||month<1||month>12||!__f4.globals.Number.isInteger(year)||year<2020||year>2100||
    !ids.length||!dateOK(date)||desc.length<4)throw (0,__f4.globals.Error)('Pilih transaksi, tahapan, tanggal, dan keterangan pembukuan.');
 const r=await postOnce('kas-group-'+category,'/api/bookkeeping/kas-batches',{
  tanggal:date,category,stage,year,month,bookedOn:date,description:desc,sourceIds:ids
 });
 return {status:'success',idBatch:r.idBatch,nominal:(0,__f4.globals.Number)(r.nominal||0),
  message:'Batch gabungan berhasil disimpan tanpa menggandakan uang kas.',duplikat:!!r.duplikat};
}
async function cancelKasGroup(p){
 const id=(0,__f4.globals.String)(p.idBatch||'').trim();
 if(!/^kasbatch:[0-9a-f-]{36}$/i.test(id))throw (0,__f4.globals.Error)('Nomor batch tidak valid.');
 const r=await api('/api/bookkeeping/kas-batches/cancel',{idBatch:id,alasan:(0,__f4.globals.String)(p.alasan||'').trim()});
 return {status:'success',idBatch:r.idBatch,message:'Batch dibatalkan, perincian sumber tetap tersimpan.'};
}

const actions={
 buatbatchkas:createKasGroup,batalkanbatchkas:cancelKasGroup,
 inputtransaksikas:createCash,edittransaksikas:editCash,batalkantransaksikas:cancelCash,
 buatdenda:createFine,bayardenda:payFine,buatpinjaman:createLoan,bayarpinjaman:repayLoan,
 buattalangan:createAdvance
};
__f4.window.__f4BookDemoCall=(p={})=>{
 const action=(0,__f4.globals.String)(p.action||'').toLowerCase();
 return __f4.globals.Object.hasOwn(actions,action)?actions[action](p):previous(p);
};
})();
});
