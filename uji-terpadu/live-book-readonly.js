/* Original Pembukuan UI -> existing D1 Worker READ endpoints. Financial writes remain blocked. */
(()=>{'use strict';
 const API='https://api.flamboyan4.web.id';
 const old=window.__f4BookDemoCall;
 async function read(path){
  const response=await fetch(API+path,{credentials:'include',cache:'no-store',mode:'cors'});
  const json=await response.json().catch(()=>{throw Error('API tidak mengembalikan JSON.')});
  if(!response.ok||json.ok===false)throw Error(json.error||'Akses D1 ditolak (HTTP '+response.status+').');
  return json;
 }
 const rows=x=>Array.isArray(x)?x:Array.isArray(x?.data)?x.data:Array.isArray(x?.transaksi)?x.transaksi:[];
 const n=x=>Number.isFinite(Number(x))?Number(x):0;
 const successful=data=>({status:'success',...data});
 async function bootstrap(){
  // This is the D1 payer registry, not a fabricated list of 44 occupied homes.
  const [p,t]=await Promise.all([
   read('/api/bookkeeping/iuran/payers'),read('/api/bookkeeping/iuran/tariffs')
  ]);
  const payers=rows(p);
  const homes=new Map();
  const warga=payers.map((x,i)=>{
   const block=String(x.blok||'').trim(),no=String(x.noRumah||'').trim();
   const house=String(x.houseCode||x.rumah||[block,no].filter(Boolean).join('/'));
   const houseID=house||'D1-'+i;
   if(!homes.has(houseID))homes.set(houseID,{idRumah:houseID,noUrut:homes.size+1,blok:block,
     noRumah:no,statusRumah:'Dihuni',tipeUnit:'Terdaftar',namaPemilik:x.nama||'',keterangan:'Rumah pembayar D1 — bukan daftar seluruh rumah'});
   return {idWarga:String(x.payerId||x.id||''),idRumah:houseID,
    noUrutRumah:homes.get(houseID).noUrut,nama:x.nama||'',
    blok:block,noRumah:no,statusTinggal:'Tetap',statusAktif:'Aktif',
    qtyIuranBulanan:n(x.qtyIuranBulanan),qtyKebersihan:n(x.qtyKebersihan),
    qtyKasLorong:n(x.qtyKasLorong),qtyArisan:n(x.qtyArisan),
    keterangan:'Pembayar terdaftar D1 — kewajiban per bulan perlu dicek'}
  });
  return successful({version:'D1 / Worker — baca saja',config:t.config||{},rumah:[...homes.values()],warga});
 }
 async function history(){
  const r=await read('/api/bookkeeping/iuran/history?limit=200');
  return successful({data:rows(r).map((x,i)=>({
   tanggal:x.tanggal||x.paid_on||'',nama:x.nama||'',idWarga:x.payerId||'',
   idPembayaran:x.idPembayaran||x.id||'D1-'+(i+1),
   totalDiterima:n(x.totalDiterima??x.amount_rp),metode:x.metode||x.payment_method||'',
   status:x.status==='BATAL'?'BATAL':'AKTIF',periode:Array.isArray(x.periode)?x.periode:[],
   locked:true,canEdit:false,canCancel:false,canCorrectMigrationDate:false,
   kekuranganKasLorong:0
  }))});
 }
 async function cash(){
  const r=await read('/api/bookkeeping/cash?limit=300');
  return successful({data:rows(r).map((x,i)=>({
   idTransaksi:x.id||'D1-'+i,
   tanggal:x.occurred_on||x.tanggal||'',jenis:x.transaction_type||'',
   kategori:x.category||'',keterangan:x.description||'',
   debit:n(x.debit_rp),kredit:n(x.credit_rp),status:x.status==='BATAL'?'BATAL':'AKTIF',
   sumber:'D1_HISTORIS',periode:x.period||'',metode:x.payment_method||''
  }))});
 }
 async function fines(){
  const r=await read('/api/bookkeeping/denda?limit=200');
  return successful({data:rows(r)});
 }
 async function loans(){
  const r=await read('/api/bookkeeping/pinjaman?limit=200');
  return successful({data:rows(r),rows:rows(r),aktif:rows(r).filter(x=>x.status==='AKTIF'),ringkasan:{}});
 }
 async function advances(){
  const r=await read('/api/bookkeeping/talangan?limit=200');
  return successful({data:rows(r)});
 }
 const exact={
  bootstrap,riwayatpembayaran:history,datatransaksikas:cash,
  datadenda:fines,datapinjaman:loans,datatalangan:advances
 };
 window.__f4BookDemoCall=async params=>{
  const action=String(params?.action||'').toLowerCase();
  if(Object.hasOwn(exact,action))return exact[action](params);
  // Don't fake success for writes or for a feature with no corresponding D1 endpoint yet.
  if(action&&/simpan|bayar|buat|batalkan|hapus|edit|update|koreksi|tutup|import|sinkron|pulihkan|setor/.test(action))
   throw Error('Penulisan Pembukuan belum diaktifkan di Worker staging. Tidak ada data yang berubah.');
  if(action==='datapembukuankas'||action==='iuranquicksummary'||action.startsWith('laporan'))
   throw Error('Modul '+action+' belum memiliki pemetaan lengkap ke D1. Data lama tidak diganti angka nol.');
  return old(params);
 };
})();