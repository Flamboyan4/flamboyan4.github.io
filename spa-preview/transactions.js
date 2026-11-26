/* Adapter migration generated from the original three bridges at commit ea6d08e6cdbda73b8841cdd2295aba36492b6e84.
   Transport and storage are injected. No global window hooks, no automatic writes.
   Production UI continues using original bridges until parity is verified.
   SPA preview uses a rejecting transport by default; tests use an isolated fake. */
export function createTransactionService({role,accountKey,transport,storage,crypto=globalThis.crypto,allowWrites=false}){
 if(!transport||typeof transport!=='function')throw Error('Transport transaksi wajib tersedia.');
 if(!accountKey||!['admin','superadmin','warga'].includes(role))throw Error('Sesi terverifikasi diperlukan.');
 const baseStorage=storage||{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
 const prefix='f4-spa-transactions:'+encodeURIComponent(String(accountKey))+':';
 storage={getItem:key=>baseStorage.getItem(prefix+key),setItem:(key,v)=>baseStorage.setItem(prefix+key,v),removeItem:key=>baseStorage.removeItem(prefix+key)};
 let busy=false;
 const call=async(path,payload)=>{
  if(typeof path!=='string'||!path.startsWith('/api/'))throw Error('Endpoint tidak valid.');
  if(payload!==undefined&&!allowWrites)throw Error('Mode uji: penulisan dinonaktifkan.');
  const d=await transport(path,payload);
  if(!d||d.ok===false)throw Error(d?.error||'Respons transaksi tidak lengkap.');
  return d;
 };
 const api=call,fetchApi=call;
 function makeBank(){
const rows=x=>Array.isArray(x?.data)?x.data:Array.isArray(x?.rows)?x.rows:[];
const n=x=>Number.isFinite(Number(x))?Number(x):0;
const memberId=x=>String(x||'').startsWith('member:')?String(x):'member:'+String(x||'');
const today=()=>{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const byType=Object.fromEntries(parts.filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,p.value]));
 return byType.year+'-'+byType.month+'-'+byType.day;
};
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


let bankMediaNonce='';
async function saveMediaLink(_token,p){
 const type=String(p.jenis||'').trim().toLowerCase();
 if(!['foto','video'].includes(type))throw Error('Jenis media harus Foto atau Video.');
 if(!bankMediaNonce)bankMediaNonce='MED'+crypto.randomUUID().replace(/-/g,'');
 const req={requestKey:bankMediaNonce,albumId:String(p.albumId||''),
  mediaType:type,url:String(p.url||'').trim(),caption:String(p.caption||'')};
 const r=await api('/api/v2/admin/bank/media-link',req);
 bankMediaNonce='';
 return {id:r.id,duplicate:!!r.duplicate};
}

let inventoryNonce='';
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
 if(!inventoryNonce)inventoryNonce='INV'+crypto.randomUUID().replace(/-/g,'');
 const payload={requestKey:inventoryNonce,name:String(p.nama||'').trim(),quantity,
  unit:String(match[2]||'unit').trim()||'unit',subcategory:String(p.kategori||'').trim(),
  location:String(p.lokasi||'').trim(),photoUrl:String(p.foto||'').trim()};
 const r=await api('/api/v2/admin/bank/inventory',payload);
 inventoryNonce='';
 return {id:r.id,duplicate:!!r.duplicate};
}

async function editDeposit(_token,p){
 const id=String(p?.id||""),date=String(p?.tanggal||""),member=memberId(p?.wargaId);
 if(!id||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!p?.items?.length)
  throw Error("Lengkapi data setoran sebelum menyimpan koreksi.");
 const result=await api('/api/v2/admin/bank/deposits/edit',{
  id,memberId:member,depositedOn:date,
  reason:String(p?.alasan||"Koreksi salah input setoran").trim(),
  items:p.items.map(line=>({itemId:wasteId(line.kode),grams:gramsFromKg(line.berat)}))
 });
 return {id:result.id,beratKg:Number(result.totalGrams||0)/1000,
  estimasiRp:Number(result.estimatedRp||0),edited:!!result.edited};
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
 const [batches,sale]=await Promise.all([
   api('/api/v2/admin/bank/batches'),
   api('/api/v2/admin/bank/sale-detail?id='+encodeURIComponent(p.saleId))
 ]);
 const b=rows(batches).find(x=>x.id===batchId);
 const beratSetoran=p.v3?(Number(p.weightDifferenceGrams||0)+Number(p.remainingStockGrams||0)+(sale.lines||[]).reduce((sum,x)=>sum+n(x.grams),0))/1000:n(b?.grams)/1000;
 const beratLapak=(sale.lines||[]).reduce((sum,x)=>sum+n(x.grams),0)/1000;
 const gross=Number(p.grossRp??sale.sale?.amount_gross_rp);
 const received=Number(p.receivedRp??sale.sale?.amount_received_rp);
 if(!Number.isSafeInteger(gross)||!Number.isSafeInteger(received)||gross<=0||received<0)
   throw Error('Nominal penjualan tidak valid. Periksa transaksi sebelum mengesahkan.');
 const unpaid=Math.max(0,gross-received);
 const warnings=[];
 if(unpaid)warnings.push('Pembayaran lapak belum lunas ('+unpaid.toLocaleString('id-ID')+' rupiah).');
 if(p.ready===false||p.siap===false||p.canConfirm===false)warnings.push('Pemeriksaan server belum mengizinkan pengesahan.');
 if(received>gross)warnings.push('Uang diterima melebihi nilai penjualan. Periksa nota lapak.');
 const ready=warnings.length===0;
 return {batch:batchId,saleId:p.saleId,siap:ready,siapDiperiksa:ready,peringatan:warnings,
   setoran:p.depositIds?.length||0,penjualan:1,beratSetoran,beratLapak,
   selisihKg:p.v3?Number(p.weightDifferenceGrams||0)/1000:beratSetoran-beratLapak,stokSisaKg:Number(p.remainingStockGrams||0)/1000,metode:p.method||"percentage",hasWeightDifference:!!p.hasWeightDifference,
   weightDifferenceGrams:Number(p.weightDifferenceGrams||0),
   estimasiWarga:p.citizenRightsRp,diterima:received,bruto:gross,
   selisihPenerimaan:gross-received,marginBank:p.environmentRp,marginSementara:p.environmentRp,
   wargaPercent:p.wargaPercent,lingkunganPercent:p.lingkunganPercent,belumLunas:unpaid>0?1:0};
}
async function confirm(_token,p){
 const batchId=String(p?.batch||'');
 if(!batchId||p.konfirmasi!==batchId||p.semuaTerjual!==true)throw Error('ID batch dan persetujuan tidak cocok.');
 const v=await recon(_token,batchId);
 if(!v.siap)throw Error(v.peringatan.join(' ')||'Penjualan belum siap disahkan.');
 if(v.hasWeightDifference&&String(p.alasanSelisihBerat||'').trim().length<5)throw Error('Jelaskan selisih timbang minimal 5 karakter sebelum mengesahkan.');
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
 lines:(p.items||[]).map(x=>({itemId:String(x.kode||'').startsWith('waste:')?String(x.kode):'waste:'+String(x.kode||''),grams:Math.round(n(x.berat)*1000),priceRpPerKg:n(x.harga),unsoldGrams:Math.round(n(x.sisa)*1000)}))};
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

async function cancelConfirmedBatch(_token,p){
 const batch=String(p?.batch||''),confirmed=String(p?.konfirmasi||''),reason=String(p?.alasan||'').trim();
 if(!batch||batch!==confirmed||reason.length<10||reason.length>300)
  throw Error('Pilih batch yang disahkan, ketik ulang ID, dan tulis alasan minimal 10 karakter.');
 const result=await api('/api/admin/reconciliation/cancel',{batch,konfirmasi:confirmed,alasan:reason});
 return {batch:result.batch,status:result.status,duplicate:!!result.duplicate,
  rightsReversedRp:result.rightsReversedRp??0,cashReversedRp:result.cashReversedRp??0};
}

const methods={bsV27BatalkanPengesahan:cancelConfirmedBatch,bsV22SetKategoriAlbum:updateAlbumCategory,bsV24UbahProgress:updateBankProgress,bsV20TambahMedia:saveMediaLink,bsV10CatatBiaya:saveExpense,bsV11TambahInventaris:saveInventory,bsV32EditSetoran:editDeposit,bsV6BatalkanSetoran:cancelDeposit,bsV7BatalkanPenjualan:cancelSale,bsV5BuatSetoran:depositDraft,bsV5SimpanTarif:savePrice,bsV11TambahProgress:saveProgress,bsV22TambahAlbum:saveAlbum,bsV6SimpanPenjualan:saleDraft,bsV6PratinjauRekonsiliasi:recon,bsV8BatchSiap:recon,bsV8SahkanBatch:confirm,bsV9RiwayatPencairan:payoutHistory,bsV9CairkanTabungan:payout,bsV9PostingKasPenjualan:postingStatus};

 return methods;
 }
 function makeBook(){
const pendingKey='iuran';
const kinds=['IURAN_BULANAN','KEBERSIHAN','KAS_LORONG','ARISAN'];
const i=x=>Number.isSafeInteger(Number(x))?Number(x):NaN;
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
 try{const s=storage.getItem(pendingKey);return s?JSON.parse(s):null}catch{return null}
}
function setPending(value){
 try{storage.setItem(pendingKey,JSON.stringify(value))}catch{ /* In-memory retry below remains active. */ }
}
function clearPending(){
 try{storage.removeItem(pendingKey)}catch{}
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
 const finesResponse=await fetchApi('/api/bookkeeping/iuran/fines?'+new URLSearchParams({payerId:p.payerId,tanggal:p.tanggal}));
 const dueFines=Array.isArray(finesResponse.data)?finesResponse.data:[];
 if(dueFines.some(x=>!x||!Number.isSafeInteger(Number(x.sisaRp))||Number(x.sisaRp)<0))
  throw Error('Rincian Denda tidak valid. Periksa daftar Denda dahulu.');
 const cleanTotal=periods.reduce((s,row)=>s+row.items.get('KEBERSIHAN'),0);
 const fineTarget=Math.min(cleanTotal,dueFines.reduce((s,x)=>s+Number(x.sisaRp),0));
 const denda=[];
 let fineRemaining=fineTarget;
 for(const fine of dueFines){
  if(!fineRemaining)break;
  const nominal=Math.min(Number(fine.sisaRp),fineRemaining);
  if(nominal>0)denda.push({id:String(fine.id),nominal});
  fineRemaining-=nominal;
 }
 const settleAdvanceId=await checkAdvances(p.payerId,periods);
 const fixed=periods.reduce((sum,row)=>sum+kinds.filter(x=>x!=='KAS_LORONG').reduce((s,k)=>s+row.items.get(k),0),0);
 const total=periods.reduce((sum,row)=>sum+kinds.reduce((s,k)=>s+row.items.get(k),0),0);
 if(!Number.isSafeInteger(total)||p.jumlahRp<fixed||p.jumlahRp>total)
  throw Error('Nominal Rp '+p.jumlahRp.toLocaleString('id-ID')+' tidak sesuai sisa kewajiban. Komponen selain Kas Lorong harus lunas, sedangkan Kas Lorong boleh parsial.');
 let remainingKas=p.jumlahRp-fixed,remainingCleanRedirect=fineTarget;
 const alokasi=[];
 for(const row of periods){
  for(const jenis of kinds){
   const outstanding=row.items.get(jenis);
   let amount=outstanding;
   if(jenis==='KAS_LORONG'){amount=Math.min(outstanding,remainingKas);remainingKas-=amount}
   if(jenis==='KEBERSIHAN'){
    const redirect=Math.min(outstanding,remainingCleanRedirect);
    amount=outstanding-redirect;remainingCleanRedirect-=redirect;
   }
   if(amount>0)alokasi.push({tahun:row.year,bulan:row.month,jenis,nominal:amount});
  }
 }
 if(remainingKas!==0||remainingCleanRedirect!==0||
    alokasi.reduce((sum,a)=>sum+a.nominal,0)+denda.reduce((sum,x)=>sum+x.nominal,0)!==p.jumlahRp)
  throw Error('Alokasi Iuran dan Denda tidak seimbang; transaksi tidak disimpan.');
 return {payerId:p.payerId,tanggal:p.tanggal,metode:p.metode,catatan:p.catatan,jumlahRp:p.jumlahRp,alokasi,denda,...(settleAdvanceId?{settleAdvanceId}:{})};
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
  dendaDibayarRp:pending.payload.denda.reduce((s,x)=>s+x.nominal,0),
  iuranRp:pending.payload.alokasi.reduce((s,x)=>s+x.nominal,0),
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

 return {simpaniuran:saveIuran,batalkanpembayaran:cancelIuran,updatepembayaran:editIuran,buatbatchkas:bookCashBatch,batalkanbatchkas:cancelCashBatch,previewiuran:params=>buildPayment(requireInput(params))};
 }
 function makeOps(){
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
const pendingMem=new Map();
function slot(op){return 'f4-d1-write-pending-v2-'+op}
function getPending(op){try{const s=storage.getItem(slot(op));return s?JSON.parse(s):pendingMem.get(op)}catch{return pendingMem.get(op)}}
function putPending(op,p){pendingMem.set(op,p);try{storage.setItem(slot(op),JSON.stringify(p))}catch{}}
function clearPending(op){pendingMem.delete(op);try{storage.removeItem(slot(op))}catch{}}
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

async function createKasGroup(p){
 const category=String(p.category||'kas_lorong'),stage=String(p.stage||'susulan');
 const month=Number(p.bulanSumber||p.bulanPembukuan),year=Number(p.tahunSumber||p.tahunPembukuan);
 const ids=String(p.idAlokasi||'').split(',').map(x=>x.trim()).filter(Boolean);
 const date=String(p.tanggalPembukuan||''),desc=String(p.keterangan||'').trim();
 if(!['kas_lorong','denda_gorol'].includes(category)||!['setoran_rt','arisan','susulan'].includes(stage)||
    !Number.isInteger(month)||month<1||month>12||!Number.isInteger(year)||year<2020||year>2100||
    !ids.length||!dateOK(date)||desc.length<4)throw Error('Pilih transaksi, tahapan, tanggal, dan keterangan pembukuan.');
 const r=await postOnce('kas-group-'+category,'/api/bookkeeping/kas-batches',{
  tanggal:date,category,stage,year,month,bookedOn:date,description:desc,sourceIds:ids
 });
 return {status:'success',idBatch:r.idBatch,nominal:Number(r.nominal||0),
  message:'Batch gabungan berhasil disimpan tanpa menggandakan uang kas.',duplikat:!!r.duplikat};
}
async function cancelKasGroup(p){
 const id=String(p.idBatch||'').trim();
 if(!/^kasbatch:[0-9a-f-]{36}$/i.test(id))throw Error('Nomor batch tidak valid.');
 const r=await api('/api/bookkeeping/kas-batches/cancel',{idBatch:id,alasan:String(p.alasan||'').trim()});
 return {status:'success',idBatch:r.idBatch,message:'Batch dibatalkan, perincian sumber tetap tersimpan.'};
}

const actions={
 buatbatchkas:createKasGroup,batalkanbatchkas:cancelKasGroup,
 inputtransaksikas:createCash,edittransaksikas:editCash,batalkantransaksikas:cancelCash,
 buatdenda:createFine,bayardenda:payFine,buatpinjaman:createLoan,bayarpinjaman:repayLoan,
 buattalangan:createAdvance
};

 return actions;
 }
 const bankMethods=makeBank(),bookMethods={...makeBook(),...makeOps()};
 // One lock per service, no automatic retry of POST. Original request keys are preserved.
 async function exclusive(run){if(busy)throw Error('Transaksi lain sedang diproses.');busy=true;try{return await run()}finally{busy=false}}
 const lookup=(map,key)=>{if(!Object.prototype.hasOwnProperty.call(map,key))throw Error('Operasi belum tersedia.');return map[key]};
 return {
  bank:(name,...args)=>{if(!['admin','superadmin'].includes(role))throw Error('Akses Bank Sampah ditolak.');return exclusive(()=>lookup(bankMethods,name)(...args));},
  book:(action,params={})=>{if(role!=='superadmin')throw Error('Akses Pembukuan ditolak.');return exclusive(()=>lookup(bookMethods,String(action).toLowerCase())(params));},
  payoutRequest:({requestKey,amountRp,balanceRp,note=''})=>{
   if(role!=='warga')throw Error('Akses pengajuan ditolak.');
   if(!requestKey||!Number.isSafeInteger(amountRp)||!Number.isSafeInteger(balanceRp)||amountRp<1||amountRp>balanceRp||String(note).length>180)throw Error('Nominal atau catatan pengajuan tidak valid.');
   return exclusive(()=>api('/api/member/bank/payout-requests',{requestKey,amountRp,method:'tunai',note:String(note).trim()}));
  },
  payoutReview:({id,action,note=''})=>{
   if(!['admin','superadmin'].includes(role))throw Error('Akses pengelola ditolak.');
   if(!id||!['setujui','tolak'].includes(action)||(action==='tolak'&&String(note).trim().length<5))throw Error('Keputusan pengajuan tidak valid.');
   return exclusive(()=>api('/api/admin/bank/payout-requests/review',{id,action,note:String(note).trim()}));
  },
  payoutPaid:({id,paidOn})=>{
   if(!['admin','superadmin'].includes(role))throw Error('Akses pengelola ditolak.');
   if(!id||!/^\d{4}-\d{2}-\d{2}$/.test(paidOn))throw Error('Tanggal pembayaran tidak valid.');
   return exclusive(()=>api('/api/admin/bank/payout-requests/paid',{id,paidOn}));
  }
 };
}
