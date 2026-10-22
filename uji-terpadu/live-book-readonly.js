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
   kategori:x.category||'',keterangan:x.note||x.description||'',
   debit:n(x.debit_rp),kredit:n(x.credit_rp),status:x.status==='BATAL'?'BATAL':'AKTIF',
   sumber:'D1_HISTORIS',periode:x.period||'',metode:x.payment_method||''
  }))});
 }
 const houseParts=house=>{const x=String(house||'').split('/');return {blok:x[0]||'',noRumah:x.slice(1).join('/')||''}};
 const statusOf=x=>{const s=String(x||'aktif').toUpperCase();return s==='DIBATALKAN'?'BATAL':s};
 async function fines(){
  const r=await read('/api/bookkeeping/denda?limit=200');
  const records=rows(r).map(x=>({
    idDenda:x.id,idWarga:x.payerId,nama:x.nama||'',...houseParts(x.rumah),
    tanggalKegiatan:x.tanggal,namaKegiatan:x.jenis==='gorol'?'Gorol':x.jenis||'Denda',
    nominal:n(x.nominalRp),nominalTerbayar:n(x.terbayarRp),
    tanggalBayar:x.tanggalBayar||'',status:statusOf(x.status),
    keterangan:x.catatan||'',metode:'',idTransaksiKas:''
  }));
  const belum=records.filter(x=>x.status==='BELUM'),lunas=records.filter(x=>x.status==='LUNAS');
  const ringkasan={jumlahBelum:belum.length,nominalBelum:belum.reduce((z,x)=>z+x.nominal,0),
    jumlahLunas:lunas.length,nominalLunas:lunas.reduce((z,x)=>z+x.nominal,0)};
  return successful({data:{rows:records,aktif:belum,ringkasan}});
 }
 async function loans(){
  const r=await read('/api/bookkeeping/pinjaman?limit=200');
  const records=rows(r).map(x=>({
    idPinjaman:x.id,idWarga:x.payerId,nama:x.nama||'',...houseParts(x.rumah),
    tanggalPinjaman:x.tanggal,nominalPinjaman:n(x.pokokRp),totalDibayar:n(x.angsuranAktifRp),
    sisaPinjaman:n(x.sisaRp),status:statusOf(x.status),keterangan:x.catatan||'',
    pembayaran:[],readOnly:true
  }));
  const aktif=records.filter(x=>x.status==='AKTIF'),sum=key=>aktif.reduce((z,x)=>z+n(x[key]),0);
  return successful({data:{rows:records,aktif,
    ringkasan:{jumlahPinjamanAktif:aktif.length,totalPinjamanAktif:sum('nominalPinjaman'),
      totalTerbayarAktif:sum('totalDibayar'),totalSisa:sum('sisaPinjaman')}}});
 }
 async function advances(){
  const r=await read('/api/bookkeeping/talangan?limit=200');
  const records=rows(r).map(x=>{
    const date=String(x.tanggal||'');
    const [tahun,bulan]=date.split('-');
    return {idTalangan:x.id,nama:x.nama||'',...houseParts(x.rumah),
      tanggalTalangan:date,tahun:Number(tahun)||0,bulan:['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][Number(bulan)]||'',
      tanggalJatuhTempo:x.tanggalJatuhTempo||'',nominalTalangan:n(x.pokokRp),
      nominalDiganti:n(x.pelunasanRingkasanRp),sisaTalangan:n(x.sisaMenurutRingkasanRp),
      status:statusOf(x.status),statusPembukuan:'DITAHAN',keterangan:x.keterangan||'',
      readOnly:true,perluRekonsiliasi:!!x.perluRekonsiliasi};
  });
  const aktif=records.filter(x=>x.status==='AKTIF'),sum=k=>aktif.reduce((z,x)=>z+n(x[k]),0);
  return successful({data:{rows:records,aktif,
    ringkasan:{jumlahAktif:aktif.length,totalTalanganAktif:sum('nominalTalangan'),
      totalSudahDigantiAktif:sum('nominalDiganti'),totalSisa:sum('sisaTalangan')}}});
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
   const b=dateBounds(p),q=new URLSearchParams({level:p?.periodLevel||'month'});if(b.from)q.set('from',b.from);if(b.to)q.set('to',b.to);
   const r=await read('/api/bookkeeping/iuran/quick-summary?'+q);
   return successful({data:r.data});
 }
 async function contributionReport(kind,p){
   const b=dateBounds(p),q=new URLSearchParams({kind,level:p?.periodLevel||'month'});
   if(b.from)q.set('from',b.from);if(b.to)q.set('to',b.to);
   const r=await read('/api/bookkeeping/reports/contributions?'+q);
   return successful({data:r.data});
 }
 async function cashReport(p){
   const b=dateBounds(p),q=new URLSearchParams({level:p?.periodLevel||'month'});if(b.from)q.set('from',b.from);if(b.to)q.set('to',b.to);
   const r=await read('/api/bookkeeping/reports/cash?'+q);
   return successful({data:r.data});
 }
 const periodLabel=p=>{
   const value=String(p?.periodFrom||'');const match=value.match(/^(\d{4})-(\d{2})/);
   return {tahun:match?Number(match[1]):new Date().getFullYear(),namaBulan:match?['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][Number(match[2])]||'':''};
 };
 const filtered= (items,p,key)=>{const b=dateBounds(p),st=String(p?.status||'SEMUA').toUpperCase();
  return items.filter(x=>(!b.from||String(x[key]||'')>=b.from)&&(!b.to||String(x[key]||'')<=b.to)&&(st==='SEMUA'||x.status===st));
 };
 async function yearlyReport(p){
  const year=Number(p?.tahun||new Date().getFullYear());
  if(!Number.isInteger(year)||year<1900||year>2199)throw Error('Pilih tahun yang benar.');
  const result=await read('/api/bookkeeping/reports/yearly?year='+year);
  return successful({data:result.data});
 }
 async function finesReport(p){
  const d=await read('/api/bookkeeping/denda?limit=200');
  const all=rows(d).map(x=>({id:x.id,nama:x.nama||'',payerId:x.payerId,
   tanggalKegiatan:x.tanggal,namaKegiatan:x.jenis||'Gorol',...houseParts(x.rumah),
   nominal:n(x.nominalRp),status:String(x.status||'').toUpperCase(),
   tanggalBayar:x.tanggalBayar||'',metode:'',catatan:x.catatan||''}));
  const selected=filtered(all,p,'tanggalKegiatan');
  const lunas=selected.filter(x=>x.status==='LUNAS'),belum=selected.filter(x=>x.status==='BELUM');
  return successful({data:{...periodLabel(p),statusFilter:p?.status||'SEMUA',
   rows:selected,ringkasan:{jumlahLunas:lunas.length,jumlahBelum:belum.length,
    nominalLunas:lunas.reduce((s,x)=>s+x.nominal,0),nominalBelum:belum.reduce((s,x)=>s+x.nominal,0)}}});
 }
 async function loansReport(p){
  const d=await read('/api/bookkeeping/pinjaman?limit=200');
  const all=rows(d).map(x=>({idPinjaman:x.id,nama:x.nama||'',...houseParts(x.rumah),tanggalPinjaman:x.tanggal,
   nominalPinjaman:n(x.pokokRp),totalDibayar:n(x.angsuranAktifRp),sisaPinjaman:n(x.sisaRp),
   status:String(x.status||'').toUpperCase(),keterangan:x.catatan||''}));
  const status=String(p?.status||'SEMUA').toUpperCase();
  const selected=all.filter(x=>status==='SEMUA'||x.status===status);
  const sum=key=>selected.reduce((a,x)=>a+n(x[key]),0);
  return successful({data:{statusFilter:status,rows:selected,
   ringkasan:{jumlahAktif:selected.filter(x=>x.status==='AKTIF').length,
    totalPinjaman:sum('nominalPinjaman'),totalDibayar:sum('totalDibayar'),totalSisa:sum('sisaPinjaman')}}});
 }
 async function advancesReport(p){
  const d=await read('/api/bookkeeping/talangan?limit=200');
  const all=rows(d).map(x=>({idTalangan:x.id,nama:x.nama||x.payerName||'',...houseParts(x.rumah),
   tanggal:x.tanggal||x.advanced_on||'',nominalTalangan:n(x.pokokRp||x.amount_rp),
   nominalDiganti:n(x.pelunasanRingkasanRp||x.reimbursed_rp),
   sisaTalangan:n(x.sisaMenurutRingkasanRp||x.sisaRp),
   status:statusOf(x.status),statusPembukuan:'DITAHAN',tanggalJatuhTempo:x.tanggalJatuhTempo||''}));
  const selected=filtered(all,p,'tanggal');
  const sum=key=>selected.reduce((a,x)=>a+n(x[key]),0);
  return successful({data:{...periodLabel(p),statusFilter:p?.status||'SEMUA',rows:selected,
   ringkasan:{jumlah:selected.length,totalTalangan:sum('nominalTalangan'),
    totalDiganti:sum('nominalDiganti'),totalSisa:sum('sisaTalangan')},
   rekapStatus:[]}});
 }
 const exact={
  bootstrap,riwayatpembayaran:history,datatransaksikas:cash,
  iuranquicksummary:quickSummary,laporankas:cashReport,
  koreksitanggalmigrasi:correctMigratedDate,
  laporanrt:p=>contributionReport('rt',p),
  laporanarisan:p=>contributionReport('arisan',p),
  laporandenda:finesReport,laporanpinjaman:loansReport,laporantalangan:advancesReport,
  laporantahunan:yearlyReport,
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