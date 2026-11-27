/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/live-book-readonly.js",function(__f4){


/* Original Pembukuan UI -> existing D1 Worker READ endpoints. Financial writes remain blocked. */
(()=>{'use strict';
 const API='https://api.flamboyan4.web.id';
 const old=__f4.window.__f4BookDemoCall;
 async function read(path){
  const response=await (0,__f4.globals.fetch)(API+path,{credentials:'include',cache:'no-store',mode:'cors'});
  const json=await response.json().catch(()=>{throw (0,__f4.globals.Error)('API tidak mengembalikan JSON.')});
  if(!response.ok||json.ok===false)throw (0,__f4.globals.Error)(json.error||'Akses data ditolak (HTTP '+response.status+').');
  return json;
 }
 const rows=x=>__f4.globals.Array.isArray(x)?x:__f4.globals.Array.isArray(x?.rows)?x.rows:__f4.globals.Array.isArray(x?.data)?x.data:__f4.globals.Array.isArray(x?.data?.rows)?x.data.rows:__f4.globals.Array.isArray(x?.data?.items)?x.data.items:__f4.globals.Array.isArray(x?.items)?x.items:__f4.globals.Array.isArray(x?.transaksi)?x.transaksi:[];
 const n=x=>__f4.globals.Number.isFinite((0,__f4.globals.Number)(x))?(0,__f4.globals.Number)(x):0;
 const successful=data=>({status:'success',...data});
 async function bootstrap(){
  // Master bersama Cloudflare D1: semua rumah, termasuk rumah kosong.
  const [p,t,directory,settings]=await __f4.globals.Promise.all([
    read('/api/v2/admin/content/obligations'),
    read('/api/bookkeeping/iuran/tariffs'),
    read('/api/v2/admin/residents'),
    read('/api/v2/admin/content/settings').catch(()=>({data:[]}))
  ]);
  const payerRows=rows(p);
  const residents=__f4.globals.Array.isArray(directory.rows)?directory.rows:[];
  const obligations=new __f4.globals.Map(payerRows.map(x=>[(0,__f4.globals.String)(x.payer_id||x.payerId||x.id||''),x]));
  const orderedHouses=[...new __f4.globals.Map(residents.filter(x=>x.household_id).map(x=>[x.household_id,x])).entries()]
    .sort(([,x],[,y])=>(0,__f4.globals.String)(x.rumah||'').localeCompare((0,__f4.globals.String)(y.rumah||''),'id',{numeric:true}));
  const houses=orderedHouses.map(([id,r],i)=>{
    const part=(0,__f4.globals.String)(r.rumah||'').split('/');
    return {idRumah:id,noUrut:i+1,blok:part[0]||'',noRumah:part.slice(1).join('/')||'',
      statusRumah:r.status_rumah||'Kosong',tipeUnit:r.tipe_unit||'',
      namaPemilik:r.nama_pemilik||'',kontakPemilik:r.kontak_pemilik||'',keterangan:r.keterangan_rumah||r.deskripsi_rumah||''};
  });
  const lookup=new __f4.globals.Map(houses.map(x=>[x.idRumah,x]));
  const warga=residents.filter(x=>x.payer_id).map(r=>{
    const house=lookup.get(r.household_id)||{};
    const quantity=obligations.get((0,__f4.globals.String)(r.payer_id))||{};
    return {idWarga:(0,__f4.globals.String)(r.payer_id),idRumah:r.household_id,noUrutRumah:house.noUrut||0,
      nama:r.nama||'',memberId:r.member_id||'',blok:house.blok||'',noRumah:house.noRumah||'',
      statusTinggal:r.status_tinggal||'',statusAktif:r.active?'Ya':'Tidak',
      qtyIuranBulanan:n(quantity.qty_iuran_bulanan??r.qty_iuran_bulanan),
      qtyKebersihan:n(quantity.qty_kebersihan??r.qty_kebersihan),
      qtyKasLorong:n(quantity.qty_kas_lorong??r.qty_kas_lorong),
      qtyArisan:n(quantity.qty_arisan??r.qty_arisan),
      noHP:r.nomor_hp||'',keterangan:r.keterangan_warga||''};
  });
  const config={...(t.config||{})};
  for(const setting of (settings.data||[]))if(['TANGGAL_SETOR_RT','BATAS_PERIODE_KAS'].includes(setting.setting_key))
    config[setting.setting_key]=n(setting.setting_value);
  return successful({version:'Data Acuan Terpadu',config,rumah:houses,warga});
 }
 async function history(){
  const r=await read('/api/bookkeeping/iuran/history?limit=1000');
  return successful({data:rows(r).map((x,i)=>({
   tanggal:x.tanggal||x.paid_on||'',tanggalIso:x.tanggal||x.paid_on||'',nama:x.nama||'',idWarga:x.idWarga||x.payerId||'',
   blok:x.blok||'',noRumah:x.noRumah||'',idRumah:x.household_id||'',
   idPembayaran:x.idPembayaran||x.id||'D1-'+(i+1),
   totalDiterima:n(x.totalDiterima??x.amount_rp),metode:x.metode||x.payment_method||'',
   catatan:x.catatan||'',status:(0,__f4.globals.String)(x.status||'').toUpperCase()==='BATAL'?'BATAL':'AKTIF',
   periode:__f4.globals.Array.isArray(x.periode)?x.periode:[],
   alokasi:__f4.globals.Array.isArray(x.alokasi)?x.alokasi:[],
   locked:!x.canCancel,canEdit:!!x.canCancel&&/^pay-[a-f0-9-]{36}$/i.test((0,__f4.globals.String)(x.idPembayaran||x.id||'')),canCancel:!!x.canCancel,
   canCorrectMigrationDate:!!x.canCorrectMigrationDate,
   kekuranganKasLorong:n(x.kekuranganKasLorong)
  }))});
 }
 async function cash(p={}){
  // Riwayat Kas uses TRANSACTION DATE, not the iuran obligation period.
  // Fetch the selected range from D1 so older records are not hidden by the 500-row cap.
  const b=p?.allPeriods?{from:'',to:''}:dateBounds(p);
  const q=new __f4.globals.URLSearchParams({limit:'500'});
  if(b.from)q.set('from',b.from);
  if(b.to)q.set('to',b.to);
  const r=await read('/api/bookkeeping/cash?'+q);
  return successful({data:rows(r).map((x,i)=>({
   idTransaksi:x.id||'D1-'+i,
   tanggal:x.occurred_on||x.tanggal||'',
   jenis:n(x.debit_rp)>0?'Pemasukan':n(x.credit_rp)>0?'Pengeluaran':'',
   kategori:x.category||'',keterangan:x.note||x.description||'',namaWarga:x.payer_name||'',
   debit:n(x.debit_rp),kredit:n(x.credit_rp),
   status:['batal','dibatalkan'].includes((0,__f4.globals.String)(x.status||'').toLowerCase())?'BATAL':'AKTIF',
   // Only new manual entries can be edited/cancelled; never expose legacy journal actions.
   sumber:x.transaction_type==='manual'&&/^cash-[0-9a-f-]{36}$/i.test((0,__f4.globals.String)(x.id||''))?'INPUT_WEB':'D1_HISTORIS',
   periode:x.period||'',metode:x.payment_method||'',catatan:x.extra_note||''
  }))});
 }
 const houseParts=house=>{const x=(0,__f4.globals.String)(house||'').split('/');return {blok:x[0]||'',noRumah:x.slice(1).join('/')||''}};
 const statusOf=x=>{const s=(0,__f4.globals.String)(x||'aktif').toUpperCase();return s==='DIBATALKAN'?'BATAL':s};
 const cleanFineNote=value=>{const s=(0,__f4.globals.String)(value||'').trim();return /^20[0-9]{2}-[0-9]{2}-[0-9]{2}(?:[ T][0-9]{2}:[0-9]{2}:[0-9]{2}(?:[.][0-9]+)?)?$/.test(s)?'':s};
 async function fines(){
  const r=await read('/api/bookkeeping/denda?limit=200');
  const records=rows(r).map(x=>({
    idDenda:x.id,idWarga:x.payerId,nama:x.nama||'',...houseParts(x.rumah),
    tanggalKegiatan:x.tanggal,namaKegiatan:x.jenis==='gorol'?'Gorol':x.jenis||'Denda',
    nominal:n(x.nominalRp),nominalTerbayar:n(x.terbayarRp),
    tanggalBayar:x.tanggalBayar||'',status:statusOf(x.status),
    keterangan:cleanFineNote(x.catatan),metode:'',idTransaksiKas:''
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

 // Both Riwayat and Laporan Talangan use the SAME transaction/date mapper.
 // Do not silently assign migrated records with missing dates to this month.
 const advanceDate=x=>{
  const raw=(0,__f4.globals.String)(x.tanggalTalangan||x.tanggal||x.advanced_on||x.advance_on||
    x.occurred_on||x.transaction_date||x.event_on||x.date||'').trim();
  if(/^\d{4}-\d{2}-\d{2}/.test(raw))return raw.slice(0,10);
  const m=raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  return m?m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'):'';
 };
 const advancePeriod=x=>{
  const date=advanceDate(x),raw=(0,__f4.globals.String)(x.periode||x.period||x.period_month||x.periodMonth||'');
  const m=raw.match(/^(\d{4})[-/](\d{1,2})/);
  const year=(0,__f4.globals.Number)(x.tahun||x.year||m?.[1]||date.slice(0,4))||0;
  const month=(0,__f4.globals.Number)(x.bulan||x.month||m?.[2]||date.slice(5,7))||0;
  return {date,year,month,key:year>=2000&&month>=1&&month<=12?year+'-'+(0,__f4.globals.String)(month).padStart(2,'0'):''};
 };
 const advanceNames=['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

 async function advances(){
  const r=await read('/api/bookkeeping/talangan?limit=200');
  const records=rows(r).map(x=>{
    const period=advancePeriod(x);
    return {idTalangan:x.id,nama:x.nama||x.payerName||'',...houseParts(x.rumah),
      tanggalTalangan:period.date,tahun:period.year,bulan:advanceNames[period.month]||'',
      tanggalJatuhTempo:x.tanggalJatuhTempo||x.due_on||'',nominalTalangan:n(x.pokokRp??x.amount_rp),
      nominalDiganti:n(x.pelunasanRingkasanRp??x.reimbursed_rp),sisaTalangan:n(x.sisaMenurutRingkasanRp??x.sisaRp),
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
   let from=(0,__f4.globals.String)(q.periodFrom||''),to=(0,__f4.globals.String)(q.periodTo||'');
   if(level==='month'){
     from=/^\d{4}-\d{2}$/.test(from)?from+'-01':'';
     if(/^\d{4}-\d{2}$/.test(to)){const [y,m]=to.split('-').map(__f4.globals.Number);to=y+'-'+(0,__f4.globals.String)(m).padStart(2,'0')+'-'+(0,__f4.globals.String)(new __f4.globals.Date(y,m,0).getDate()).padStart(2,'0')}else to='';
   }else if(level==='year'){
     from=/^\d{4}$/.test(from)?from+'-01-01':'';
     to=/^\d{4}$/.test(to)?to+'-12-31':'';
   }
   if(q.bulan&&q.tahun){const y=(0,__f4.globals.Number)(q.tahun),m=(0,__f4.globals.Number)(q.bulan);if(y>=2000&&m>=1&&m<=12){from=y+'-'+(0,__f4.globals.String)(m).padStart(2,'0')+'-01';to=y+'-'+(0,__f4.globals.String)(m).padStart(2,'0')+'-'+(0,__f4.globals.String)(new __f4.globals.Date(y,m,0).getDate()).padStart(2,'0')}}
   return {from:/^\d{4}-\d{2}-\d{2}$/.test(from)?from:'',to:/^\d{4}-\d{2}-\d{2}$/.test(to)?to:''};
 };
 async function correctMigratedDate(p){
  const id=(0,__f4.globals.String)(p.idPembayaran||''),tanggal=(0,__f4.globals.String)(p.tanggalBaru||'');
  if(!id||!/^\d{4}-\d{2}-\d{2}$/.test(tanggal))throw (0,__f4.globals.Error)('ID atau tanggal tidak valid.');
  const response=await (0,__f4.globals.fetch)(API+'/api/bookkeeping/iuran/correct-date',{method:'POST',credentials:'include',
    headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify({idPembayaran:id,tanggalBaru:tanggal,alasan:'Koreksi tanggal pembayaran migrasi oleh Superadmin'})});
  const result=await response.json().catch(()=>({error:'Respons tidak valid'}));
  if(!response.ok||result.ok===false)throw (0,__f4.globals.Error)(result.error||'HTTP '+response.status);
  return successful({message:result.message||'Tanggal pembayaran dikoreksi, audit tersimpan.'});
 }
 async function quickSummary(p){
   const b=dateBounds(p),q=new __f4.globals.URLSearchParams({level:p?.periodLevel||'month'});if(b.from)q.set('from',b.from);if(b.to)q.set('to',b.to);
   const r=await read('/api/bookkeeping/iuran/quick-summary?'+q);
   return successful({data:r.data});
 }
 async function contributionReport(kind,p){
   const b=dateBounds(p),q=new __f4.globals.URLSearchParams({kind,level:p?.periodLevel||'month'});
   if(b.from)q.set('from',b.from);if(b.to)q.set('to',b.to);
   const r=await read('/api/bookkeeping/reports/contributions?'+q);
   return successful({data:r.data});
 }
 const cashReportBounds=p=>{
  // Kalender terpadu memakai {periodLevel, periodFrom, periodTo}; format lama tetap didukung.
  if(p?.periodLevel){
   const level=(0,__f4.globals.String)(p.periodLevel),a=(0,__f4.globals.String)(p.periodFrom||''),b=(0,__f4.globals.String)(p.periodTo||'');
   const parseYear=y=>/^\d{4}$/.test(y)&&(0,__f4.globals.Number)(y)>=2020&&(0,__f4.globals.Number)(y)<=2100;
   const monthLast=(y,m)=>(0,__f4.globals.String)(new __f4.globals.Date(__f4.globals.Date.UTC((0,__f4.globals.Number)(y),(0,__f4.globals.Number)(m),0)).getUTCDate()).padStart(2,'0');
   const checkMonth=v=>/^\d{4}-(0[1-9]|1[0-2])$/.test(v)&&parseYear(v.slice(0,4));
   const checkDay=v=>{
    if(!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(v)||!checkMonth(v.slice(0,7)))return false;
    const [y,m,d]=v.split('-').map(__f4.globals.Number);
    return d>=1&&d<=(0,__f4.globals.Number)(monthLast(y,m));
   };
   let from,to;
   if(level==='date'){
    if(!checkDay(a)||!checkDay(b))throw (0,__f4.globals.Error)('Pilih tanggal awal dan akhir laporan kas yang valid.');
    from=a;to=b;
   }else if(level==='month'){
    if(!checkMonth(a)||!checkMonth(b))throw (0,__f4.globals.Error)('Pilih bulan awal dan akhir laporan kas yang valid.');
    from=a+'-01';to=b+'-'+monthLast(b.slice(0,4),b.slice(5,7));
   }else if(level==='year'){
    if(!parseYear(a)||!parseYear(b))throw (0,__f4.globals.Error)('Tahun laporan kas harus antara 2020 sampai 2100.');
    from=a+'-01-01';to=b+'-12-31';
   }else throw (0,__f4.globals.Error)('Jenis periode laporan kas tidak dikenal.');
   if(from>to)throw (0,__f4.globals.Error)('Periode awal laporan kas melebihi periode akhir.');
   return {from,to,level};
  }

  const mode=(0,__f4.globals.String)(p?.mode||'bulan');
  const year=value=>{
    const y=(0,__f4.globals.Number)(value);
    if(!__f4.globals.Number.isInteger(y)||y<2020||y>2100)throw (0,__f4.globals.Error)('Tahun laporan kas harus antara 2020 sampai 2100.');
    return y;
  };
  const month=value=>{
    const m=(0,__f4.globals.Number)(value);
    if(!__f4.globals.Number.isInteger(m)||m<1||m>12)throw (0,__f4.globals.Error)('Bulan laporan kas harus antara 1 sampai 12.');
    return m;
  };
  const iso=(y,m)=>(0,__f4.globals.String)(y).padStart(4,'0')+'-'+(0,__f4.globals.String)(m).padStart(2,'0');
  const fromMonth=(y,m)=>iso(y,m)+'-01';
  const untilMonth=(y,m)=>iso(y,m)+'-'+(0,__f4.globals.String)(new __f4.globals.Date(__f4.globals.Date.UTC(y,m,0)).getUTCDate()).padStart(2,'0');
  let from,to;
  if(mode==='bulan'){
    const y=year(p?.tahun),m=month(p?.bulan);from=fromMonth(y,m);to=untilMonth(y,m);
  }else if(mode==='rentang_bulan'){
    const a=year(p?.mulaiTahun),am=month(p?.mulaiBulan),b=year(p?.sampaiTahun),bm=month(p?.sampaiBulan);
    from=fromMonth(a,am);to=untilMonth(b,bm);
  }else if(mode==='tahun'){
    const y=year(p?.tahun);from=fromMonth(y,1);to=untilMonth(y,12);
  }else if(mode==='rentang_tahun'){
    const a=year(p?.mulaiTahun),b=year(p?.sampaiTahun);from=fromMonth(a,1);to=untilMonth(b,12);
  }else throw (0,__f4.globals.Error)('Mode laporan kas tidak dikenal; pilih ulang periode.');
  if(from>to)throw (0,__f4.globals.Error)('Periode awal laporan kas melebihi periode akhir.');
  return {from,to,level:mode.includes('tahun')?'year':'month'};
 };
 async function cashReport(p){
   const b=cashReportBounds(p),q=new __f4.globals.URLSearchParams({level:b.level,from:b.from,to:b.to});
   const r=await read('/api/bookkeeping/reports/cash?'+q);
   return successful({data:r.data});
 }
 const periodLabel=p=>{
   const value=(0,__f4.globals.String)(p?.periodFrom||'');const match=value.match(/^(\d{4})-(\d{2})/);
   return {tahun:match?(0,__f4.globals.Number)(match[1]):new __f4.globals.Date().getFullYear(),namaBulan:match?['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][(0,__f4.globals.Number)(match[2])]||'':''};
 };
 const filtered= (items,p,key)=>{const b=dateBounds(p),st=(0,__f4.globals.String)(p?.status||'SEMUA').toUpperCase();
  return items.filter(x=>(!b.from||(0,__f4.globals.String)(x[key]||'')>=b.from)&&(!b.to||(0,__f4.globals.String)(x[key]||'')<=b.to)&&(st==='SEMUA'||x.status===st));
 };
 async function yearlyReport(p){
  const year=(0,__f4.globals.Number)(p?.tahun||new __f4.globals.Date().getFullYear());
  if(!__f4.globals.Number.isInteger(year)||year<1900||year>2199)throw (0,__f4.globals.Error)('Pilih tahun yang benar.');
  const result=await read('/api/bookkeeping/reports/yearly?year='+year);
  return successful({data:result.data});
 }
 async function finesReport(p){
  const d=await read('/api/bookkeeping/denda?limit=200');
  const all=rows(d).map(x=>({id:x.id,nama:x.nama||'',payerId:x.payerId,
   tanggalKegiatan:x.tanggal,namaKegiatan:x.jenis||'Gorol',...houseParts(x.rumah),
   nominal:n(x.nominalRp),status:(0,__f4.globals.String)(x.status||'').toUpperCase(),
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
   status:(0,__f4.globals.String)(x.status||'').toUpperCase(),keterangan:x.catatan||''}));
  const status=(0,__f4.globals.String)(p?.status||'SEMUA').toUpperCase();
  const selected=all.filter(x=>status==='SEMUA'||x.status===status);
  const sum=key=>selected.reduce((a,x)=>a+n(x[key]),0);
  return successful({data:{statusFilter:status,rows:selected,
   ringkasan:{jumlahAktif:selected.filter(x=>x.status==='AKTIF').length,
    totalPinjaman:sum('nominalPinjaman'),totalDibayar:sum('totalDibayar'),totalSisa:sum('sisaPinjaman')}}});
 }
 async function advancesReport(p){
  const d=await read('/api/bookkeeping/talangan?limit=200');
  const all=rows(d).map(x=>{
   const period=advancePeriod(x);
   return {idTalangan:x.id,nama:x.nama||x.payerName||'',...houseParts(x.rumah),
    tanggal:period.date,tanggalTalangan:period.date,periodKey:period.key,
    nominalTalangan:n(x.pokokRp??x.amount_rp),
    nominalDiganti:n(x.pelunasanRingkasanRp??x.reimbursed_rp),
    sisaTalangan:n(x.sisaMenurutRingkasanRp??x.sisaRp),
    status:statusOf(x.status),statusPembukuan:'DITAHAN',
    tanggalJatuhTempo:x.tanggalJatuhTempo||x.due_on||''};
  });
  const bounds=dateBounds(p),status=(0,__f4.globals.String)(p?.status||'SEMUA').toUpperCase();
  const inPeriod=x=>{
   if(x.tanggal)return (!bounds.from||x.tanggal>=bounds.from)&&(!bounds.to||x.tanggal<=bounds.to);
   // A month/year tag can be used if the transaction day was not migrated,
   // without falsely inventing an exact date.
   if(x.periodKey)return (!bounds.from||x.periodKey>=bounds.from.slice(0,7))&&
     (!bounds.to||x.periodKey<=bounds.to.slice(0,7));
   return false;
  };
  const selected=all.filter(x=>inPeriod(x)&&(status==='SEMUA'||x.status===status));
  const missingPeriod=all.filter(x=>!x.tanggal&&!x.periodKey);
  const sum=key=>selected.reduce((a,x)=>a+n(x[key]),0);
  // Laporan cetak Talangan sengaja anonim; tetap hitung status dari baris terfilter.
  const grouped=new __f4.globals.Map();
  for(const row of selected){
   const st=(0,__f4.globals.String)(row.status||'TIDAK DIKETAHUI').toUpperCase();
   const item=grouped.get(st)||{status:st,jumlah:0,nominal:0,sisa:0};
   item.jumlah++;item.nominal+=n(row.nominalTalangan);item.sisa+=n(row.sisaTalangan);
   grouped.set(st,item);
  }
  return successful({data:{...periodLabel(p),statusFilter:status,rows:selected,
   missingPeriodCount:missingPeriod.length,
   ringkasan:{jumlah:selected.length,totalTalangan:sum('nominalTalangan'),
    totalDiganti:sum('nominalDiganti'),totalSisa:sum('sisaTalangan')},
   rekapStatus:[...grouped.values()]}});
 }
 async function yearStatus(p){
  const year=(0,__f4.globals.Number)(p?.tahun||p?.year);
  if(!__f4.globals.Number.isInteger(year)||year<1900||year>2099)throw (0,__f4.globals.Error)('Tahun buku tidak valid.');
  const r=await read('/api/bookkeeping/year-status?year='+year);
  if(!r?.data||r.data.tahun!==year)throw (0,__f4.globals.Error)('Status tahun belum dapat diverifikasi.');
  return successful({data:r.data});
 }
 async function archiveList(){
  const r=await read('/api/bookkeeping/year-archives');
  if(!__f4.globals.Array.isArray(r?.data))throw (0,__f4.globals.Error)('Daftar arsip tidak sesuai.');
  return successful({data:r.data});
 }
 async function archiveDetail(p){
  const year=(0,__f4.globals.Number)(p?.tahun||p?.year);
  if(!__f4.globals.Number.isInteger(year)||year<1900||year>2099)throw (0,__f4.globals.Error)('Tahun arsip tidak valid.');
  const r=await read('/api/bookkeeping/year-archive?year='+year);
  if(!r?.data?.record||r.data.record.tahun!==year)throw (0,__f4.globals.Error)('Detail arsip tidak sesuai.');
  return successful({data:r.data});
 }
 async function kasBatchData(p){
  const query=new __f4.globals.URLSearchParams({category:(0,__f4.globals.String)(p.category||'kas_lorong'),
    month:(0,__f4.globals.String)(p.bulan||''),year:(0,__f4.globals.String)(p.tahun||'')});
  const result=await read('/api/bookkeeping/kas-batches?'+query);
  return successful({data:result.data});
 }
 const exact={
  bootstrap,riwayatpembayaran:history,datatransaksikas:cash,datapembukuankas:kasBatchData,
  iuranquicksummary:quickSummary,laporankas:cashReport,
  koreksitanggalmigrasi:correctMigratedDate,
  laporanrt:p=>contributionReport('rt',p),
  laporanarisan:p=>contributionReport('arisan',p),
  laporandenda:finesReport,laporanpinjaman:loansReport,laporantalangan:advancesReport,
  laporantahunan:yearlyReport,
  statustahun:yearStatus,arsiptahunan:archiveList,detailarsip:archiveDetail,
  datadenda:fines,datapinjaman:loans,datatalangan:advances
 };
 __f4.window.__f4BookDemoCall=async params=>{
  const action=(0,__f4.globals.String)(params?.action||'').toLowerCase();
  if(__f4.globals.Object.hasOwn(exact,action))return exact[action](params);
  // Don't fake success for writes or for a feature with no corresponding D1 endpoint yet.
  if(action&&/simpan|bayar|buat|batalkan|hapus|edit|update|koreksi|tutup|import|sinkron|pulihkan|setor/.test(action))
   throw (0,__f4.globals.Error)('Penulisan Pembukuan belum diaktifkan di Worker staging. Tidak ada data yang berubah.');
  if(action==='datapembukuankas'||action.startsWith('laporan'))
   throw (0,__f4.globals.Error)('Modul '+action+' belum dapat memuat data. Data asli tidak diubah.');
  throw (0,__f4.globals.Error)('Aksi '+(action||'(tanpa nama)')+' belum tersedia. Data contoh tidak digunakan.');
 };
})();
});
