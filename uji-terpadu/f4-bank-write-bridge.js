/* Finalisasi Bank Sampah. Adapter untuk form asli; tidak mengubah UI.
   Aktifkan setelah Worker lulus preflight. Flag penulisan D1 tetap ditentukan di SERVER. */
(()=>{
'use strict';
const previous=window.__f4BankDemoCall;if(typeof previous!=='function')return;
const API='https://api.flamboyan4.web.id';
const rows=x=>Array.isArray(x?.data)?x.data:Array.isArray(x?.rows)?x.rows:[];
const n=x=>Number.isFinite(Number(x))?Number(x):0;
const memberId=x=>String(x||'').startsWith('member:')?String(x):'member:'+String(x||'');
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
async function api(path,payload){
 const res=await fetch(API+path,{credentials:'include',mode:'cors',cache:'no-store',method:payload?'POST':'GET',...(payload?{headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}:{})});
 const data=await res.json().catch(()=>{throw Error('Respons Cloudflare bukan JSON.')});
 if(!res.ok||data?.ok===false)throw Error(data?.error||'API error '+res.status);
 return data;
}
async function recon(_token,batchId){
 const p=await api('/api/admin/reconciliation/preview',{batchId});
 const [batch,sale]=await Promise.all([api('/api/v2/admin/bank/batches'),api('/api/v2/admin/bank/sale-detail?id='+encodeURIComponent(p.saleId))]);
 const b=rows(batch).find(x=>x.id===batchId);
 const beratSetoran=n(b?.grams)/1000,beratLapak=(sale.lines||[]).reduce((s,x)=>s+n(x.grams),0)/1000;
 return {batch:batchId,saleId:p.saleId,siap:true,siapDiperiksa:true,peringatan:[],
 setoran:p.depositIds?.length||0,penjualan:1,beratSetoran,beratLapak,selisihKg:beratSetoran-beratLapak,
 estimasiWarga:p.citizenRightsRp,diterima:p.receivedRp,bruto:p.grossRp,marginBank:p.environmentRp,marginSementara:p.environmentRp,belumLunas:0};
}
async function confirm(_token,p){
 const batchId=String(p?.batch||'');
 if(!batchId||p.konfirmasi!==batchId||p.semuaTerjual!==true)throw Error('ID batch dan persetujuan tidak cocok.');
 const v=await recon(_token,batchId);
 const reserveRp=Number(p.cadangan),neighborhoodRp=Number(p.kasLorong),operationRp=Number(p.operasional);
 if(![reserveRp,neighborhoodRp,operationRp].every(x=>Number.isSafeInteger(x)&&x>=0)||reserveRp+neighborhoodRp+operationRp!==v.marginBank)throw Error('Alokasi hasil lingkungan belum sesuai.');
 const r=await api('/api/admin/reconciliation/confirm',{batchId,saleId:v.saleId,reserveRp,neighborhoodRp,operationRp,note:String(p.alasanSelisihBerat||'').slice(0,300)});
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
 const payload={requestId:await stableUuid(p?.nonce),batchId:String(p.batch),soldOn:String(p.tanggal||''),buyerName:String(p.lapak||''),receivedRp:n(p.diterima),adjustmentNote:String(p.alasanSelisih||'').trim(),
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
 return {diposting:0,kas:cash.filter(x=>x.status==='aktif').reduce((sum,x)=>sum+n(x.cash_in_rp)-n(x.cash_out_rp),0)};
}
const methods={bsV6SimpanPenjualan:saleDraft,bsV6PratinjauRekonsiliasi:recon,bsV8BatchSiap:recon,bsV8SahkanBatch:confirm,bsV9RiwayatPencairan:payoutHistory,bsV9CairkanTabungan:payout,bsV9PostingKasPenjualan:postingStatus};
window.__f4BankDemoCall=(name,args=[])=>Object.hasOwn(methods,name)?methods[name](...args):previous(name,args);
})();