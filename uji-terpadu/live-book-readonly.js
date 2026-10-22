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
  const [p,t,directory,settings]=await Promise.all([
    read('/api/bookkeeping/iuran/payers'),
    read('/api/bookkeeping/iuran/tariffs'),
    read('/api/v2/admin/residents'),
    read('/api/v2/admin/content/settings').catch(()=>({data:[]}))
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
  const config={...(t.config||{})};
  for(const setting of (settings.data||[]))if(['TANGGAL_SETOR_RT','BATAS_PERIODE_KAS'].includes(setting.setting_key))
    config[setting.setting_key]=n(setting.setting_value);
  return successful({version:'Cloudflare D1 — Data Acuan Terpadu',config,rumah:houses,warga});
 }
 async function history(){
  const r=await read('/api/bookkeeping/iuran/history?limit=1000');
  return successful({data:rows(r).map((x,i)=>({
   tanggal:x.tanggal||x.paid_on||'',tanggalIso:x.tanggal||x.paid_on||'',nama:x.nama||'',idWarga:x.idWarga||x.payerId||'',
   blok:x.blok||'',noRumah:x.noRumah||'',idRumah:x.household_id||'',
   idPembayaran:x.idPembayaran||x.id||'D1-'+(i+1),
   totalDiterima:n(x.totalDiterima??x.amount_rp),metode:x.metode||x.payment_method||'',
   catatan:x.catatan||'',status:String(x.status||'').toUpperCase()==='BATAL'?'BATAL':'AKTIF',
   periode:Array.isArray(x.periode)?x.periode:[],
   alokasi:Array.isArray(x.alokasi)?x.alokasi:[],
   locked:true,canEdit:false,canCancel:false,
   canCorrectMigrationDate:!!x.canCorrectMigrationDate,
   kekuranganKasLorong:n(x.kekuranganKasLorong)
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
 const dateBounds=p=>{
   const q=p||{},level=q.periodLevel||'';
   let from=String(q.periodFrom||''),to=String(q.periodTo||'');
   if(level==='month'){
     from=/^\d{4}-\d{2}$/.test(from)?from+'-01':'';
     if(/^\d{4}-\d{2}$/.test(to)){const [y,m]=to.split('-').map(Number);to=y+'-'+String(m).padStart(2,'0')+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0')}else to='';
   }else if(level==='year'){
     from=/^\d{4}$/.test(from)?from+'-01-01':'';
     to=/^\d{4}$/.test(to)?to+'-12-31':'';
   }
   if(q.bulan&&q.tahun){const y=Number(q.tahun),m=Number(q.bulan);if(y>=2000&&m>=1&&m<=12){from=y+'-'+String(m).padStart(2,'0')+'-01';to=y+'-'+String(m).padStart(2,'0')+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0')}}
   return {from:/^\d{4}-\d{2}-\d{2}$/.test(from)?from:'',to:/^\d{4}-\d{2}-\d{2}$/.test(to)?to:''};
 };
 async function correctMigratedDate(p){
  const id=String(p.idPembayaran||''),tanggal=String(p.tanggalBaru||'');
  if(!id||!/^\d{4}-\d{2}-\d{2}$/.test(tanggal))throw Error('ID atau tanggal tidak valid.');
  const response=await fetch(API+'/api/bookkeeping/iuran/correct-date',{method:'POST',credentials:'include',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({idPembayaran:id,tanggalBaru:tanggal,alasan:'Koreksi tanggal pembayaran migrasi oleh Superadmin'})});
  const result=await response.json().catch(()=>({error:'Respons tidak valid'}));
  if(!response.ok||result.ok===false)throw Error(result.error||'HTTP '+response.status);
  return successful({message:result.message||'Tanggal pembayaran dikoreksi, audit tersimpan.'});
 }
 async function quickSummary(p){
   const b=dateBounds(p),q=new URLSearchParams();if(b.from)q.set('from',b.from);if(b.to)q.set('to',b.to);
   const r=await read('/api/bookkeeping/iuran/quick-summary?'+q);
   return successful({data:r.data});
 }
 async function contributionReport(kind,p){
   const b=dateBounds(p),q=new URLSearchParams({kind});
   if(b.from)q.set('from',b.from);if(b.to)q.set('to',b.to);
   const r=await read('/api/bookkeeping/reports/contributions?'+q);
   return successful({data:r.data});
 }
 async function cashReport(p){
   const b=dateBounds(p),q=new URLSearchParams();if(b.from)q.set('from',b.from);if(b.to)q.set('to',b.to);
   const r=await read('/api/bookkeeping/reports/cash?'+q);
   return successful({data:r.data});
 }
 const exact={
  bootstrap,riwayatpembayaran:history,datatransaksikas:cash,
  iuranquicksummary:quickSummary,laporankas:cashReport,
  koreksitanggalmigrasi:correctMigratedDate,
  laporanrt:p=>contributionReport('rt',p),
  laporanarisan:p=>contributionReport('arisan',p),
  datadenda:fines,datapinjaman:loans,datatalangan:advances
 };
 window.__f4BookDemoCall=async params=>{
  const action=String(params?.action||'').toLowerCase();
  if(Object.hasOwn(exact,action))return exact[action](params);
  // Don't fake success for writes or for a feature with no corresponding D1 endpoint yet.
  if(action&&/simpan|bayar|buat|batalkan|hapus|edit|update|koreksi|tutup|import|sinkron|pulihkan|setor/.test(action))
   throw Error('Penulisan Pembukuan belum diaktifkan di Worker staging. Tidak ada data yang berubah.');
  if(action==='datapembukuankas'||action.startsWith('laporan'))
   throw Error('Modul '+action+' belum memiliki pemetaan lengkap ke D1. Data lama tidak diganti angka nol.');
  return old(params);
 };
})();