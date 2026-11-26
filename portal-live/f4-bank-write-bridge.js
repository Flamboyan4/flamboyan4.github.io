/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/f4-bank-write-bridge.js",function(__f4){


/* Finalisasi Bank Sampah. Adapter untuk form asli; tidak mengubah UI.
   Aktifkan setelah Worker lulus preflight. Flag penulisan D1 tetap ditentukan di SERVER. */
(()=>{
'use strict';
const previous=__f4.window.__f4BankDemoCall;if(typeof previous!=='function')return;
const API='https://api.flamboyan4.web.id';
const rows=x=>__f4.globals.Array.isArray(x?.data)?x.data:__f4.globals.Array.isArray(x?.rows)?x.rows:[];
const n=x=>__f4.globals.Number.isFinite((0,__f4.globals.Number)(x))?(0,__f4.globals.Number)(x):0;
const memberId=x=>(0,__f4.globals.String)(x||'').startsWith('member:')?(0,__f4.globals.String)(x):'member:'+(0,__f4.globals.String)(x||'');
const today=()=>{
 const parts=new __f4.globals.Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new __f4.globals.Date());
 const byType=__f4.globals.Object.fromEntries(parts.filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,p.value]));
 return byType.year+'-'+byType.month+'-'+byType.day;
};
async function api(path,payload){
 const res=await (0,__f4.globals.fetch)(API+path,{credentials:'include',mode:'cors',cache:'no-store',method:payload?'POST':'GET',...(payload?{headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify(payload)}:{})});
 const data=await res.json().catch(()=>{throw (0,__f4.globals.Error)('Respons layanan tidak dapat dibaca.')});
 if(!res.ok||data?.ok===false)throw (0,__f4.globals.Error)(data?.error||'API error '+res.status);
 return data;
}

const wasteId=value=>(0,__f4.globals.String)(value||'').startsWith('waste:')?(0,__f4.globals.String)(value):'waste:'+(0,__f4.globals.String)(value||'');
const gramsFromKg=kg=>{
 const w=(0,__f4.globals.Number)(kg),grams=__f4.globals.Math.round(w*1000);
 if(!__f4.globals.Number.isFinite(w)||!__f4.globals.Number.isSafeInteger(grams)||grams<=0||grams>10000000||__f4.globals.Math.abs(grams/1000-w)>0.000001)
   throw (0,__f4.globals.Error)('Berat barang wajib positif dan menggunakan ketelitian 0,001 kg.');
 return grams;
};
async function depositDraft(_token,p){
 const date=(0,__f4.globals.String)(p?.tanggal||''), member=memberId(p?.wargaId);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!p?.nonce||!p?.items?.length||!(0,__f4.globals.String)(p.wargaId||''))throw (0,__f4.globals.Error)('Isi tanggal, warga, dan berat setoran terlebih dahulu.');
 const batch=await api('/api/v2/admin/bank/batches',{month:date.slice(0,7),openForDeposits:true});
 const result=await api('/api/v2/admin/bank/deposits',{
   requestKey:(0,__f4.globals.String)(p.nonce),batchId:batch.id,memberId:member,depositedOn:date,
   items:p.items.map(line=>({itemId:wasteId(line.kode),grams:gramsFromKg(line.berat)}))
 });
 return {id:result.id,beratKg:result.totalGrams===__f4.globals.undefined?p.items.reduce((sum,line)=>sum+gramsFromKg(line.berat)/1000,0):result.totalGrams/1000,
   estimasiRp:result.estimatedRp??0,duplicate:!!result.duplicate};
}
async function savePrice(_token,code,rate){
 const rp=(0,__f4.globals.Number)(rate);
 if(!__f4.globals.Number.isSafeInteger(rp)||rp<1)throw (0,__f4.globals.Error)('Tarif warga harus rupiah bulat dan lebih dari nol.');
 return api('/api/v2/admin/bank/prices',{itemId:wasteId(code),effectiveFrom:today(),priceRpPerKg:rp});
}
async function saveProgress(_token,p){
 return api('/api/v2/admin/bank/progress',{
   date:(0,__f4.globals.String)(p.tanggal||''),title:(0,__f4.globals.String)(p.judul||''),stage:(0,__f4.globals.String)(p.langkah||''),description:(0,__f4.globals.String)(p.deskripsi||''),
   status:(0,__f4.globals.String)(p.status||''),nextStep:(0,__f4.globals.String)(p.agenda||''),publicVisible:p.publik!==false,
   photoUrl:(0,__f4.globals.String)(p.foto||'').trim()});
}


let bankMediaNonce='MED'+__f4.globals.crypto.randomUUID().replace(/-/g,'');
async function saveMediaLink(_token,p){
 const type=(0,__f4.globals.String)(p.jenis||'').trim().toLowerCase();
 if(!['foto','video'].includes(type))throw (0,__f4.globals.Error)('Jenis media harus Foto atau Video.');
 const req={requestKey:bankMediaNonce,albumId:(0,__f4.globals.String)(p.albumId||''),
  mediaType:type,url:(0,__f4.globals.String)(p.url||'').trim(),caption:(0,__f4.globals.String)(p.caption||'')};
 const r=await api('/api/v2/admin/bank/media-link',req);
 bankMediaNonce='MED'+__f4.globals.crypto.randomUUID().replace(/-/g,'');
 return {id:r.id,duplicate:!!r.duplicate};
}

let inventoryNonce='INV'+__f4.globals.crypto.randomUUID().replace(/-/g,'');
async function saveExpense(_token,p) {
 const positions={'operasional':'operasional','kas lorong':'kas_lorong','cadangan':'cadangan'};
 const kind=(0,__f4.globals.String)(p.jenis||'').toLowerCase();
 const pos=positions[(0,__f4.globals.String)(p.pos||'').trim().toLowerCase()];
 const qty=(0,__f4.globals.Number)(p.jumlah),price=(0,__f4.globals.Number)(p.hargaSatuan);
 if(!pos||!['pembelian','pengeluaran'].includes(kind))throw (0,__f4.globals.Error)('Jenis transaksi atau pos dana tidak dikenal.');
 if(p.bukti&&!/^https:\/\//i.test((0,__f4.globals.String)(p.bukti)))throw (0,__f4.globals.Error)('Bukti harus menggunakan URL HTTPS.');
 const data={
  requestKey:(0,__f4.globals.String)(p.nonce||''),incurredOn:(0,__f4.globals.String)(p.tanggal||''),kind,budgetPost:pos,
  description:(0,__f4.globals.String)(p.keterangan||''),quantity:qty,unit:(0,__f4.globals.String)(p.satuan||'unit'),
  unitPriceRp:price,vendor:(0,__f4.globals.String)(p.toko||''),note:(0,__f4.globals.String)(p.catatan||''),toInventory:p.inventaris===true,
  evidenceUrl:(0,__f4.globals.String)(p.bukti||'').trim()
 };
 if(data.toInventory&&kind!=='pembelian')throw (0,__f4.globals.Error)('Inventaris baru hanya dapat berasal dari transaksi Pembelian.');
 const r=await api('/api/v2/admin/bank/expenses',data);
 return {id:r.id,nominal:r.nominal,inventarisId:r.inventarisId||'',duplicate:!!r.duplicate};
}
async function saveInventory(_token,p){
 const text=(0,__f4.globals.String)(p.jumlah||'').trim();
 const match=text.match(/^(\d+(?:[.,]\d{1,3})?)\s*(.{0,40})$/);
 if(!match)throw (0,__f4.globals.Error)('Jumlah inventaris harus seperti "2 unit" atau "1,5 kg".');
 const quantity=(0,__f4.globals.Number)(match[1].replace(',','.'));
 const payload={requestKey:inventoryNonce,name:(0,__f4.globals.String)(p.nama||'').trim(),quantity,
  unit:(0,__f4.globals.String)(match[2]||'unit').trim()||'unit',subcategory:(0,__f4.globals.String)(p.kategori||'').trim(),
  location:(0,__f4.globals.String)(p.lokasi||'').trim(),photoUrl:(0,__f4.globals.String)(p.foto||'').trim()};
 const r=await api('/api/v2/admin/bank/inventory',payload);
 inventoryNonce='INV'+__f4.globals.crypto.randomUUID().replace(/-/g,'');
 return {id:r.id,duplicate:!!r.duplicate};
}

async function editDeposit(_token,p){
 const id=(0,__f4.globals.String)(p?.id||""),date=(0,__f4.globals.String)(p?.tanggal||""),member=memberId(p?.wargaId);
 if(!id||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!p?.items?.length)
  throw (0,__f4.globals.Error)("Lengkapi data setoran sebelum menyimpan koreksi.");
 const result=await api('/api/v2/admin/bank/deposits/edit',{
  id,memberId:member,depositedOn:date,
  reason:(0,__f4.globals.String)(p?.alasan||"Koreksi salah input setoran").trim(),
  items:p.items.map(line=>({itemId:wasteId(line.kode),grams:gramsFromKg(line.berat)}))
 });
 return {id:result.id,beratKg:(0,__f4.globals.Number)(result.totalGrams||0)/1000,
  estimasiRp:(0,__f4.globals.Number)(result.estimatedRp||0),edited:!!result.edited};
}
async function cancelDeposit(_token,id,reason){
 const result=await api('/api/v2/admin/bank/deposits/cancel',{id:(0,__f4.globals.String)(id||''),reason:(0,__f4.globals.String)(reason||'')});
 return {id:result.id,status:'Dibatalkan',duplicate:!!result.duplicate};
}
async function cancelSale(_token,id,reason){
 const result=await api('/api/v2/admin/bank/sales/cancel',{id:(0,__f4.globals.String)(id||''),reason:(0,__f4.globals.String)(reason||'')});
 return {id:result.id,status:'Dibatalkan',duplicate:!!result.duplicate};
}
async function saveAlbum(_token,p){
 return api('/api/v2/admin/bank/albums',{
   title:(0,__f4.globals.String)(p.judul||''),category:(0,__f4.globals.String)(p.kategori||'Lainnya'),eventOn:(0,__f4.globals.String)(p.tanggal||''),
   description:(0,__f4.globals.String)(p.deskripsi||''),visibility:p.publik===false?'privat':'publik',
   coverUrl:(0,__f4.globals.String)(p.sampul||'').trim()});
}

async function recon(_token,batchId){
 const p=await api('/api/admin/reconciliation/preview',{batchId});
 const [batches,sale]=await __f4.globals.Promise.all([
   api('/api/v2/admin/bank/batches'),
   api('/api/v2/admin/bank/sale-detail?id='+(0,__f4.globals.encodeURIComponent)(p.saleId))
 ]);
 const b=rows(batches).find(x=>x.id===batchId);
 const beratSetoran=p.v3?((0,__f4.globals.Number)(p.weightDifferenceGrams||0)+(0,__f4.globals.Number)(p.remainingStockGrams||0)+(sale.lines||[]).reduce((sum,x)=>sum+n(x.grams),0))/1000:n(b?.grams)/1000;
 const beratLapak=(sale.lines||[]).reduce((sum,x)=>sum+n(x.grams),0)/1000;
 const gross=(0,__f4.globals.Number)(p.grossRp??sale.sale?.amount_gross_rp);
 const received=(0,__f4.globals.Number)(p.receivedRp??sale.sale?.amount_received_rp);
 if(!__f4.globals.Number.isSafeInteger(gross)||!__f4.globals.Number.isSafeInteger(received)||gross<=0||received<0)
   throw (0,__f4.globals.Error)('Nominal penjualan tidak valid. Periksa transaksi sebelum mengesahkan.');
 const unpaid=__f4.globals.Math.max(0,gross-received);
 const warnings=[];
 if(unpaid)warnings.push('Pembayaran lapak belum lunas ('+unpaid.toLocaleString('id-ID')+' rupiah).');
 if(p.ready===false||p.siap===false||p.canConfirm===false)warnings.push('Pemeriksaan server belum mengizinkan pengesahan.');
 if(received>gross)warnings.push('Uang diterima melebihi nilai penjualan. Periksa nota lapak.');
 const ready=warnings.length===0;
 return {batch:batchId,saleId:p.saleId,siap:ready,siapDiperiksa:ready,peringatan:warnings,
   setoran:p.depositIds?.length||0,penjualan:1,beratSetoran,beratLapak,
   selisihKg:p.v3?(0,__f4.globals.Number)(p.weightDifferenceGrams||0)/1000:beratSetoran-beratLapak,stokSisaKg:(0,__f4.globals.Number)(p.remainingStockGrams||0)/1000,metode:p.method||"percentage",hasWeightDifference:!!p.hasWeightDifference,
   weightDifferenceGrams:(0,__f4.globals.Number)(p.weightDifferenceGrams||0),
   estimasiWarga:p.citizenRightsRp,diterima:received,bruto:gross,
   selisihPenerimaan:gross-received,marginBank:p.environmentRp,marginSementara:p.environmentRp,
   wargaPercent:p.wargaPercent,lingkunganPercent:p.lingkunganPercent,belumLunas:unpaid>0?1:0};
}
async function confirm(_token,p){
 const batchId=(0,__f4.globals.String)(p?.batch||'');
 if(!batchId||p.konfirmasi!==batchId||p.semuaTerjual!==true)throw (0,__f4.globals.Error)('ID batch dan persetujuan tidak cocok.');
 const v=await recon(_token,batchId);
 if(!v.siap)throw (0,__f4.globals.Error)(v.peringatan.join(' ')||'Penjualan belum siap disahkan.');
 if(v.hasWeightDifference&&(0,__f4.globals.String)(p.alasanSelisihBerat||'').trim().length<5)throw (0,__f4.globals.Error)('Jelaskan selisih timbang minimal 5 karakter sebelum mengesahkan.');
 const reserveRp=(0,__f4.globals.Number)(p.cadangan),neighborhoodRp=(0,__f4.globals.Number)(p.kasLorong),operationRp=(0,__f4.globals.Number)(p.operasional);
 if(![reserveRp,neighborhoodRp,operationRp].every(x=>__f4.globals.Number.isSafeInteger(x)&&x>=0)||reserveRp+neighborhoodRp+operationRp!==v.marginBank)throw (0,__f4.globals.Error)('Alokasi hasil lingkungan belum sesuai.');
 const r=await api('/api/admin/reconciliation/confirm',{batchId,saleId:v.saleId,reserveRp,neighborhoodRp,operationRp,expectedWargaPercent:v.wargaPercent,note:(0,__f4.globals.String)(p.alasanSelisihBerat||'').slice(0,300)});
 return {batch:batchId,hakWarga:r.citizenRightsRp,marginBank:v.marginBank,status:r.status,duplicate:!!r.duplicate};
}
async function stableUuid(nonce){
 if(typeof nonce!=='string'||!nonce)throw (0,__f4.globals.Error)('Kode transaksi belum tersedia.');
 const bytes=new __f4.globals.Uint8Array(await __f4.globals.crypto.subtle.digest('SHA-256',new __f4.globals.TextEncoder().encode('f4-bank-sale:'+nonce)));
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=[...bytes.slice(0,16)].map(v=>v.toString(16).padStart(2,'0')).join('');
 return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
}
async function saleDraft(_token,p){
 const rawProof=(0,__f4.globals.String)(p.bukti||'').trim();
 const payload={requestId:await stableUuid(p?.nonce),batchId:(0,__f4.globals.String)(p.batch),soldOn:(0,__f4.globals.String)(p.tanggal||''),buyerName:(0,__f4.globals.String)(p.lapak||''),receivedRp:n(p.diterima),adjustmentNote:(0,__f4.globals.String)(p.alasanSelisih||'').trim(),
 receiptNo:/^https:\/\//i.test(rawProof)?'':rawProof,
 evidenceUrl:(0,__f4.globals.String)(p.buktiUrl||(/^https:\/\//i.test(rawProof)?rawProof:'' )).trim(),
 lines:(p.items||[]).map(x=>({itemId:(0,__f4.globals.String)(x.kode||'').startsWith('waste:')?(0,__f4.globals.String)(x.kode):'waste:'+(0,__f4.globals.String)(x.kode||''),grams:__f4.globals.Math.round(n(x.berat)*1000),priceRpPerKg:n(x.harga),unsoldGrams:__f4.globals.Math.round(n(x.sisa)*1000)}))};
 const r=await api('/api/admin/sales/draft',payload);
 return {id:r.id,brutoRp:r.grossRp,diterimaRp:r.receivedRp,status:'Draft'};
}
async function payout(_token,p){
 const m=memberId(p.wargaId);
 const note=['Penerima: '+(0,__f4.globals.String)(p.penerima||''),(0,__f4.globals.String)(p.catatan||'')].filter(__f4.globals.Boolean).join(' • ').slice(0,250);
 const r=await api('/api/v2/admin/bank/withdrawals',{requestKey:(0,__f4.globals.String)(p.nonce||''),memberId:m,withdrawnOn:today(),amountRp:(0,__f4.globals.Number)(p.nominal),note});
 const b=rows(await api('/api/v2/admin/bank/savings')).find(x=>x.member_id===m);
 if(!b)throw (0,__f4.globals.Error)('Transaksi berhasil, saldo belum bisa dimuat. Periksa riwayat, jangan mengulang.');
 return {id:r.id,saldoAkhir:n(b.balanceRp),duplicate:!!r.duplicate};
}
async function payoutHistory(){
 return rows(await api('/api/v2/admin/bank/ledger?limit=300')).filter(x=>x.kind==='pencairan').map(x=>({
 id:x.id,wargaId:(0,__f4.globals.String)(x.member_id||'').replace(/^member:/,''),nominal:n(x.amount_rp),status:'Aktif',tanggal:x.transaction_on,catatan:x.note||''}));
}
async function postingStatus(){
 const [a,s,c]=await __f4.globals.Promise.all([api('/api/v2/admin/bank/allocations?limit=300'),api('/api/v2/admin/bank/sales?limit=300'),api('/api/v2/admin/bank/cash?limit=300')]);
 const sales=rows(s),cash=rows(c);
 for(const alloc of rows(a)){
  const sale=sales.find(x=>x.batch_id===alloc.batch_id&&x.status==='terkonfirmasi');
  if(!sale)throw (0,__f4.globals.Error)('Alokasi belum sinkron dengan penjualan.');
  const credited=cash.filter(x=>x.status==='aktif' && (x.source_transaction_id===sale.id || (0,__f4.globals.String)(x.id||'').startsWith('bank-sale-cash:'+sale.id+':'))).reduce((sum,x)=>sum+n(x.cash_in_rp),0);
  if(credited!==n(alloc.receivedRp))throw (0,__f4.globals.Error)('Buku kas belum sinkron; hentikan posting manual dan audit dahulu.');
 }
 return {diposting:rows(a).length,kas:cash.filter(x=>x.status==='aktif').reduce((sum,x)=>sum+n(x.cash_in_rp)-n(x.cash_out_rp),0)};
}
async function updateAlbumCategory(_token,id,category){
 const albumId=(0,__f4.globals.String)(id||'').trim(),value=(0,__f4.globals.String)(category||'').trim();
 if(!albumId||!value)throw (0,__f4.globals.Error)('Pilih album dan kategori.');
 const r=await api('/api/v2/admin/bank/albums/category',{id:albumId,category:value});
 return {berhasil:true,id:r.id,kategori:r.category};
}
async function updateBankProgress(_token,p){
 const r=await api('/api/v2/admin/bank/progress/edit',{
  id:(0,__f4.globals.String)(p?.id||''),date:(0,__f4.globals.String)(p?.tanggal||''),
  title:(0,__f4.globals.String)(p?.judul||''),stage:(0,__f4.globals.String)(p?.langkah||''),
  description:(0,__f4.globals.String)(p?.deskripsi||''),status:(0,__f4.globals.String)(p?.status||''),
  nextStep:(0,__f4.globals.String)(p?.agenda||''),publicVisible:p?.publik!==false,photoUrl:(0,__f4.globals.String)(p?.foto||'').trim()
 });
 return {berhasil:true,id:r.id};
}

async function provisionMemberBatch(){
 const preview=await api('/api/superadmin/accounts/preview');
 if(!__f4.globals.Array.isArray(preview.akun))throw (0,__f4.globals.Error)('Daftar akun tidak dapat dibaca.');
 const pending=preview.akun.filter(a=>a.role==='anggota'&&a.perluAktivasi===true);
 let made=0;
 for(const member of pending.slice(0,3)){
  await api('/api/superadmin/accounts/activate-member',{accountId:member.id,confirmation:'AKTIFKAN AKUN WARGA'});
  made++;
 }
 return {dibuat:made,tersisa:pending.length-made};
}
async function provisionSingleMember(_token,id){
 const preview=await api('/api/superadmin/accounts/preview');
 const member=__f4.globals.Array.isArray(preview.akun)?preview.akun.find(a=>(0,__f4.globals.String)(a.id)===(0,__f4.globals.String)(id)):null;
 if(!member||member.role!=='anggota')throw (0,__f4.globals.Error)('Akun anggota tidak ditemukan pada daftar akun.');
 const activating=member.perluAktivasi===true;
 const result=activating?
   await api('/api/superadmin/accounts/activate-member',{accountId:member.id,confirmation:'AKTIFKAN AKUN WARGA'}):
   await api('/api/superadmin/accounts/reset-member',{accountId:member.id,confirmation:'RESET PASSWORD WARGA'});
 return {username:result.username||member.username,passwordAwal:result.passwordAwal||'1234'};
}
async function cancelConfirmedBatch(_token,p){
 const batch=(0,__f4.globals.String)(p?.batch||''),confirmed=(0,__f4.globals.String)(p?.konfirmasi||''),reason=(0,__f4.globals.String)(p?.alasan||'').trim();
 if(!batch||batch!==confirmed||reason.length<10||reason.length>300)
  throw (0,__f4.globals.Error)('Pilih batch yang disahkan, ketik ulang ID, dan tulis alasan minimal 10 karakter.');
 const result=await api('/api/admin/reconciliation/cancel',{batch,konfirmasi:confirmed,alasan:reason});
 return {batch:result.batch,status:result.status,duplicate:!!result.duplicate,
  rightsReversedRp:result.rightsReversedRp??0,cashReversedRp:result.cashReversedRp??0};
}

const methods={authAdminProvisionBatch:provisionMemberBatch,authAdminResetDefault:provisionSingleMember,bsV27BatalkanPengesahan:cancelConfirmedBatch,bsV22SetKategoriAlbum:updateAlbumCategory,bsV24UbahProgress:updateBankProgress,bsV20TambahMedia:saveMediaLink,bsV10CatatBiaya:saveExpense,bsV11TambahInventaris:saveInventory,bsV32EditSetoran:editDeposit,bsV6BatalkanSetoran:cancelDeposit,bsV7BatalkanPenjualan:cancelSale,bsV5BuatSetoran:depositDraft,bsV5SimpanTarif:savePrice,bsV11TambahProgress:saveProgress,bsV22TambahAlbum:saveAlbum,bsV6SimpanPenjualan:saleDraft,bsV6PratinjauRekonsiliasi:recon,bsV8BatchSiap:recon,bsV8SahkanBatch:confirm,bsV9RiwayatPencairan:payoutHistory,bsV9CairkanTabungan:payout,bsV9PostingKasPenjualan:postingStatus};
__f4.window.__f4BankDemoCall=(name,args=[])=>__f4.globals.Object.hasOwn(methods,name)?methods[name](...args):previous(name,args);
})();
});
