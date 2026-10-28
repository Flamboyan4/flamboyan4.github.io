/* Finalisasi Bank Sampah. Adapter untuk form asli; tidak mengubah UI.
   Aktifkan setelah Worker lulus preflight. Flag penulisan D1 tetap ditentukan di SERVER. */
(()=>{
'use strict';
const previous=window.__f4BankDemoCall;if(typeof previous!=='function')return;
const API='https://api.flamboyan4.web.id';
const rows=x=>Array.isArray(x?.data)?x.data:Array.isArray(x?.rows)?x.rows:[];
const n=x=>Number.isFinite(Number(x))?Number(x):0;
const memberId=x=>String(x||'').startsWith('member:')?String(x):'member:'+String(x||'');
const today=()=>{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const byType=Object.fromEntries(parts.filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,p.value]));
 return byType.year+'-'+byType.month+'-'+byType.day;
};
async function api(path,payload){
 const res=await fetch(API+path,{credentials:'include',mode:'cors',cache:'no-store',method:payload?'POST':'GET',...(payload?{headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}:{})});
 const data=await res.json().catch(()=>{throw Error('Respons layanan tidak dapat dibaca.')});
 if(!res.ok||data?.ok===false)throw Error(data?.error||'API error '+res.status);
 return data;
}

const wasteId=value=>String(value||'').startsWith('waste:')?String(value):'waste:'+String(value||'');
const gramsFromKg=kg=>{
 const w=Number(kg),grams=Math.round(w*1000);
 if(!Number.isFinite(w)||!Number.isSafeInteger(grams)||grams<=0||grams>10000000||Math.abs(grams/1000-w)>0.000001)
   throw Error('Berat barang wajib positif dan menggunakan ketelitian 0,001 kg.');
 return grams;
};
async function depositDraft(_token,p){
 const date=String(p?.tanggal||''), member=memberId(p?.wargaId);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!p?.nonce||!p?.items?.length||!String(p.wargaId||''))throw Error('Isi tanggal, warga, dan berat setoran terlebih dahulu.');
 const batch=await api('/api/v2/admin/bank/batches',{month:date.slice(0,7),openForDeposits:true});
 const result=await api('/api/v2/admin/bank/deposits',{
   requestKey:String(p.nonce),batchId:batch.id,memberId:member,depositedOn:date,
   items:p.items.map(line=>({itemId:wasteId(line.kode),grams:gramsFromKg(line.berat)}))
 });
 return {id:result.id,beratKg:result.totalGrams===undefined?p.items.reduce((sum,line)=>sum+gramsFromKg(line.berat)/1000,0):result.totalGrams/1000,
   estimasiRp:result.estimatedRp??0,duplicate:!!result.duplicate};
}
async function savePrice(_token,code,rate){
 const rp=Number(rate);
 if(!Number.isSafeInteger(rp)||rp<1)throw Error('Tarif warga harus rupiah bulat dan lebih dari nol.');
 return api('/api/v2/admin/bank/prices',{itemId:wasteId(code),effectiveFrom:today(),priceRpPerKg:rp});
}
async function saveProgress(_token,p){
 return api('/api/v2/admin/bank/progress',{
   date:String(p.tanggal||''),title:String(p.judul||''),stage:String(p.langkah||''),description:String(p.deskripsi||''),
   status:String(p.status||''),nextStep:String(p.agenda||''),publicVisible:p.publik!==false,
   photoUrl:String(p.foto||'').trim()});
}


let bankMediaNonce='MED'+crypto.randomUUID().replace(/-/g,'');
async function saveMediaLink(_token,p){
 const type=String(p.jenis||'').trim().toLowerCase();
 if(!['foto','video'].includes(type))throw Error('Jenis media harus Foto atau Video.');
 const req={requestKey:bankMediaNonce,albumId:String(p.albumId||''),
  mediaType:type,url:String(p.url||'').trim(),caption:String(p.caption||'')};
 const r=await api('/api/v2/admin/bank/media-link',req);
 bankMediaNonce='MED'+crypto.randomUUID().replace(/-/g,'');
 return {id:r.id,duplicate:!!r.duplicate};
}

let inventoryNonce='INV'+crypto.randomUUID().replace(/-/g,'');
async function saveExpense(_token,p) {
 const positions={'operasional':'operasional','kas lorong':'kas_lorong','cadangan':'cadangan'};
 const kind=String(p.jenis||'').toLowerCase();
 const pos=positions[String(p.pos||'').trim().toLowerCase()];
 const qty=Number(p.jumlah),price=Number(p.hargaSatuan);
 if(!pos||!['pembelian','pengeluaran'].includes(kind))throw Error('Jenis transaksi atau pos dana tidak dikenal.');
 if(p.bukti&&!/^https:\/\//i.test(String(p.bukti)))throw Error('Bukti harus menggunakan URL HTTPS.');
 const data={
  requestKey:String(p.nonce||''),incurredOn:String(p.tanggal||''),kind,budgetPost:pos,
  description:String(p.keterangan||''),quantity:qty,unit:String(p.satuan||'unit'),
  unitPriceRp:price,vendor:String(p.toko||''),note:String(p.catatan||''),toInventory:p.inventaris===true,
  evidenceUrl:String(p.bukti||'').trim()
 };
 if(data.toInventory&&kind!=='pembelian')throw Error('Inventaris baru hanya dapat berasal dari transaksi Pembelian.');
 const r=await api('/api/v2/admin/bank/expenses',data);
 return {id:r.id,nominal:r.nominal,inventarisId:r.inventarisId||'',duplicate:!!r.duplicate};
}
async function saveInventory(_token,p){
 const text=String(p.jumlah||'').trim();
 const match=text.match(/^(\d+(?:[.,]\d{1,3})?)\s*(.{0,40})$/);
 if(!match)throw Error('Jumlah inventaris harus seperti "2 unit" atau "1,5 kg".');
 const quantity=Number(match[1].replace(',','.'));
 const payload={requestKey:inventoryNonce,name:String(p.nama||'').trim(),quantity,
  unit:String(match[2]||'unit').trim()||'unit',subcategory:String(p.kategori||'').trim(),
  location:String(p.lokasi||'').trim(),photoUrl:String(p.foto||'').trim()};
 const r=await api('/api/v2/admin/bank/inventory',payload);
 inventoryNonce='INV'+crypto.randomUUID().replace(/-/g,'');
 return {id:r.id,duplicate:!!r.duplicate};
}

async function cancelDeposit(_token,id,reason){
 const result=await api('/api/v2/admin/bank/deposits/cancel',{id:String(id||''),reason:String(reason||'')});
 return {id:result.id,status:'Dibatalkan',duplicate:!!result.duplicate};
}
async function cancelSale(_token,id,reason){
 const result=await api('/api/v2/admin/bank/sales/cancel',{id:String(id||''),reason:String(reason||'')});
 return {id:result.id,status:'Dibatalkan',duplicate:!!result.duplicate};
}
async function saveAlbum(_token,p){
 return api('/api/v2/admin/bank/albums',{
   title:String(p.judul||''),category:String(p.kategori||'Lainnya'),eventOn:String(p.tanggal||''),
   description:String(p.deskripsi||''),visibility:p.publik===false?'privat':'publik',
   coverUrl:String(p.sampul||'').trim()});
}

async function recon(_token,batchId){
 const p=await api('/api/admin/reconciliation/preview',{batchId});
 const [batch,sale]=await Promise.all([api('/api/v2/admin/bank/batches'),api('/api/v2/admin/bank/sale-detail?id='+encodeURIComponent(p.saleId))]);
 const b=rows(batch).find(x=>x.id===batchId);
 const beratSetoran=n(b?.grams)/1000,beratLapak=(sale.lines||[]).reduce((s,x)=>s+n(x.grams),0)/1000;
 return {batch:batchId,saleId:p.saleId,siap:true,siapDiperiksa:true,peringatan:[],
 setoran:p.depositIds?.length||0,penjualan:1,beratSetoran,beratLapak,selisihKg:beratSetoran-beratLapak,
 estimasiWarga:p.citizenRightsRp,diterima:p.receivedRp,bruto:p.grossRp,marginBank:p.environmentRp,marginSementara:p.environmentRp,wargaPercent:p.wargaPercent,lingkunganPercent:p.lingkunganPercent,belumLunas:0};
}
async function confirm(_token,p){
 const batchId=String(p?.batch||'');
 if(!batchId||p.konfirmasi!==batchId||p.semuaTerjual!==true)throw Error('ID batch dan persetujuan tidak cocok.');
 const v=await recon(_token,batchId);
 const reserveRp=Number(p.cadangan),neighborhoodRp=Number(p.kasLorong),operationRp=Number(p.operasional);
 if(![reserveRp,neighborhoodRp,operationRp].every(x=>Number.isSafeInteger(x)&&x>=0)||reserveRp+neighborhoodRp+operationRp!==v.marginBank)throw Error('Alokasi hasil lingkungan belum sesuai.');
 const r=await api('/api/admin/reconciliation/confirm',{batchId,saleId:v.saleId,reserveRp,neighborhoodRp,operationRp,expectedWargaPercent:v.wargaPercent,note:String(p.alasanSelisihBerat||'').slice(0,300)});
 return {batch:batchId,hakWarga:r.citizenRightsRp,marginBank:v.marginBank,status:r.status,duplicate:!!r.duplicate};
}
async function stableUuid(nonce){
 if(typeof nonce!=='string'||!nonce)throw Error('Kode transaksi belum tersedia.');
 const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('f4-bank-sale:'+nonce)));
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=[...bytes.slice(0,16)].map(v=>v.toString(16).padStart(2,'0')).join('');
 return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
}
async function saleDraft(_token,p){
 const rawProof=String(p.bukti||'').trim();
 const payload={requestId:await stableUuid(p?.nonce),batchId:String(p.batch),soldOn:String(p.tanggal||''),buyerName:String(p.lapak||''),receivedRp:n(p.diterima),adjustmentNote:String(p.alasanSelisih||'').trim(),
 receiptNo:/^https:\/\//i.test(rawProof)?'':rawProof,
 evidenceUrl:String(p.buktiUrl||(/^https:\/\//i.test(rawProof)?rawProof:'' )).trim(),
 lines:(p.items||[]).map(x=>({itemId:String(x.kode||'').startsWith('waste:')?String(x.kode):'waste:'+String(x.kode||''),grams:Math.round(n(x.berat)*1000),priceRpPerKg:n(x.harga)}))};
 const r=await api('/api/admin/sales/draft',payload);
 return {id:r.id,brutoRp:r.grossRp,diterimaRp:r.receivedRp,status:'Draft'};
}
async function payout(_token,p){
 const m=memberId(p.wargaId);
 const note=['Penerima: '+String(p.penerima||''),String(p.catatan||'')].filter(Boolean).join(' • ').slice(0,250);
 const r=await api('/api/v2/admin/bank/withdrawals',{requestKey:String(p.nonce||''),memberId:m,withdrawnOn:today(),amountRp:Number(p.nominal),note});
 const b=rows(await api('/api/v2/admin/bank/savings')).find(x=>x.member_id===m);
 if(!b)throw Error('Transaksi berhasil, saldo belum bisa dimuat. Periksa riwayat, jangan mengulang.');
 return {id:r.id,saldoAkhir:n(b.balanceRp),duplicate:!!r.duplicate};
}
async function payoutHistory(){
 return rows(await api('/api/v2/admin/bank/ledger?limit=300')).filter(x=>x.kind==='pencairan').map(x=>({
 id:x.id,wargaId:String(x.member_id||'').replace(/^member:/,''),nominal:n(x.amount_rp),status:'Aktif',tanggal:x.transaction_on,catatan:x.note||''}));
}
async function postingStatus(){
 const [a,s,c]=await Promise.all([api('/api/v2/admin/bank/allocations?limit=300'),api('/api/v2/admin/bank/sales?limit=300'),api('/api/v2/admin/bank/cash?limit=300')]);
 const sales=rows(s),cash=rows(c);
 for(const alloc of rows(a)){
  const sale=sales.find(x=>x.batch_id===alloc.batch_id&&x.status==='terkonfirmasi');
  if(!sale)throw Error('Alokasi belum sinkron dengan penjualan.');
  const credited=cash.filter(x=>x.status==='aktif' && (x.source_transaction_id===sale.id || String(x.id||'').startsWith('bank-sale-cash:'+sale.id+':'))).reduce((sum,x)=>sum+n(x.cash_in_rp),0);
  if(credited!==n(alloc.receivedRp))throw Error('Buku kas belum sinkron; hentikan posting manual dan audit dahulu.');
 }
 return {diposting:rows(a).length,kas:cash.filter(x=>x.status==='aktif').reduce((sum,x)=>sum+n(x.cash_in_rp)-n(x.cash_out_rp),0)};
}
async function updateAlbumCategory(_token,id,category){
 const albumId=String(id||'').trim(),value=String(category||'').trim();
 if(!albumId||!value)throw Error('Pilih album dan kategori.');
 const r=await api('/api/v2/admin/bank/albums/category',{id:albumId,category:value});
 return {berhasil:true,id:r.id,kategori:r.category};
}
async function updateBankProgress(_token,p){
 const r=await api('/api/v2/admin/bank/progress/edit',{
  id:String(p?.id||''),date:String(p?.tanggal||''),
  title:String(p?.judul||''),stage:String(p?.langkah||''),
  description:String(p?.deskripsi||''),status:String(p?.status||''),
  nextStep:String(p?.agenda||''),publicVisible:p?.publik!==false,photoUrl:String(p?.foto||'').trim()
 });
 return {berhasil:true,id:r.id};
}

async function provisionMemberBatch(){
 const preview=await api('/api/superadmin/accounts/preview');
 if(!Array.isArray(preview.akun))throw Error('Daftar akun tidak dapat dibaca.');
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
 const member=Array.isArray(preview.akun)?preview.akun.find(a=>String(a.id)===String(id)):null;
 if(!member||member.role!=='anggota')throw Error('Akun anggota tidak ditemukan pada daftar akun.');
 const activating=member.perluAktivasi===true;
 const result=activating?
   await api('/api/superadmin/accounts/activate-member',{accountId:member.id,confirmation:'AKTIFKAN AKUN WARGA'}):
   await api('/api/superadmin/accounts/reset-member',{accountId:member.id,confirmation:'RESET PASSWORD WARGA'});
 return {username:result.username||member.username,passwordAwal:result.passwordAwal||'1234'};
}
async function cancelConfirmedBatch(_token,p){
 const batch=String(p?.batch||''),confirmed=String(p?.konfirmasi||''),reason=String(p?.alasan||'').trim();
 if(!batch||batch!==confirmed||reason.length<10||reason.length>300)
  throw Error('Pilih batch yang disahkan, ketik ulang ID, dan tulis alasan minimal 10 karakter.');
 const result=await api('/api/admin/reconciliation/cancel',{batch,konfirmasi:confirmed,alasan:reason});
 return {batch:result.batch,status:result.status,duplicate:!!result.duplicate,
  rightsReversedRp:result.rightsReversedRp??0,cashReversedRp:result.cashReversedRp??0};
}

const methods={authAdminProvisionBatch:provisionMemberBatch,authAdminResetDefault:provisionSingleMember,bsV27BatalkanPengesahan:cancelConfirmedBatch,bsV22SetKategoriAlbum:updateAlbumCategory,bsV24UbahProgress:updateBankProgress,bsV20TambahMedia:saveMediaLink,bsV10CatatBiaya:saveExpense,bsV11TambahInventaris:saveInventory,bsV6BatalkanSetoran:cancelDeposit,bsV7BatalkanPenjualan:cancelSale,bsV5BuatSetoran:depositDraft,bsV5SimpanTarif:savePrice,bsV11TambahProgress:saveProgress,bsV22TambahAlbum:saveAlbum,bsV6SimpanPenjualan:saleDraft,bsV6PratinjauRekonsiliasi:recon,bsV8BatchSiap:recon,bsV8SahkanBatch:confirm,bsV9RiwayatPencairan:payoutHistory,bsV9CairkanTabungan:payout,bsV9PostingKasPenjualan:postingStatus};
window.__f4BankDemoCall=(name,args=[])=>Object.hasOwn(methods,name)?methods[name](...args):previous(name,args);
})();