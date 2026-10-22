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
  // Master bersama Cloudflare D1: semua rumah, termasuk rumah kosong.
  const [p,t,directory]=await Promise.all([
    read('/api/bookkeeping/iuran/payers'),
    read('/api/bookkeeping/iuran/tariffs'),
    read('/api/v2/admin/residents')
  ]);
  const payerRows=rows(p);
  const residents=Array.isArray(directory.rows)?directory.rows:[];
  const obligations=new Map(payerRows.map(x=>[String(x.payerId||x.id||''),x]));
  const orderedHouses=[...new Map(residents.filter(x=>x.household_id).map(x=>[x.household_id,x])).entries()]
    .sort(([,x],[,y])=>String(x.rumah||'').localeCompare(String(y.rumah||''),'id',{numeric:true}));
  const houses=orderedHouses.map(([id,r],i)=>{
    const part=String(r.rumah||'').split('/');
    return {idRumah:id,noUrut:i+1,blok:part[0]||'',noRumah:part.slice(1).join('/')||'',
      statusRumah:r.status_rumah||'Kosong',tipeUnit:r.tipe_unit||'',
      namaPemilik:r.nama_pemilik||'',kontakPemilik:r.kontak_pemilik||'',keterangan:r.keterangan_rumah||r.deskripsi_rumah||''};
  });
  const lookup=new Map(houses.map(x=>[x.idRumah,x]));
  const warga=residents.filter(x=>x.payer_id).map(r=>{
    const house=lookup.get(r.household_id)||{};
    const quantity=obligations.get(String(r.payer_id))||{};
    return {idWarga:String(r.payer_id),idRumah:r.household_id,noUrutRumah:house.noUrut||0,
      nama:r.nama||'',blok:house.blok||'',noRumah:house.noRumah||'',
      statusTinggal:r.status_tinggal||'',statusAktif:r.active?'Ya':'Tidak',
      qtyIuranBulanan:n(quantity.qtyIuranBulanan??r.qty_iuran_bulanan),
      qtyKebersihan:n(quantity.qtyKebersihan??r.qty_kebersihan),
      qtyKasLorong:n(quantity.qtyKasLorong??r.qty_kas_lorong),
      qtyArisan:n(quantity.qtyArisan??r.qty_arisan),
      noHP:r.nomor_hp||'',keterangan:r.keterangan_warga||''};
  });
  return successful({version:'Cloudflare D1 — Data Acuan Terpadu',config:t.config||{},rumah:houses,warga});
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