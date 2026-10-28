/* Live data bridge for ORIGINAL Bank Sampah UI. Reads only existing Cloudflare endpoints. */
(()=>{'use strict';
 const API='https://api.flamboyan4.web.id';
 const original=window.__f4BankDemoCall;
 const onlyArray=(data)=>Array.isArray(data)?data:Array.isArray(data?.rows)?data.rows:Array.isArray(data?.items)?data.items:Array.isArray(data?.data)?data.data:Array.isArray(data?.data?.rows)?data.data.rows:Array.isArray(data?.data?.items)?data.data.items:[];
 const number=(value)=>Number.isFinite(Number(value))?Number(value):0;
 async function get(path){
  const response=await fetch(API+path,{credentials:'include',mode:'cors',cache:'no-store'});
  const result=await response.json().catch(()=>{throw Error('API Cloudflare tidak mengirim JSON.')});
  if(!response.ok||result?.ok===false)throw Error(result?.error||'Gagal membaca data (HTTP '+response.status+').');
  return result;
 }
 let cache,loadedAt=0;
 const publicData=async()=>{
  if(cache&&Date.now()-loadedAt<15000)return cache;
  const result=await get('/api/v2/public/bank');
  cache=result;loadedAt=Date.now();return result;
 };
 const progress=items=>onlyArray(items).map(item=>({
  tanggal:item.tanggal||item.happened_on||item.date||'',
  langkah:item.langkah||item.stage||'',
  judul:item.judul||item.title||item.name||'Perkembangan',
  deskripsi:item.deskripsi||item.description||'',
  status:item.status||'',
  agenda:item.agenda||item.nextAgenda||'',
  foto:item.foto||item.photoUrl||item.photo_url||item.imageUrl||''
 }));
 const inventories=items=>onlyArray(items).map(item=>({
  nama:item.nama||item.name||'',jumlah:String(item.jumlah??item.quantity??'0')+' '+(item.unit||''),
  kondisi:item.kondisi||item.condition||'',foto:item.foto||item.photoUrl||item.imageUrl||''
 }));
 // Portal Utama and Bank Sampah have separate publication scopes in D1.
 const isBankAlbum=item=>{
   const scope=String(item.portal_scope||item.source_portal||item.portal||item.scope||'')
     .toLowerCase().replace(/[\s_-]+/g,'');
   const category=String(item.kategori||item.category||'').toLowerCase().replace(/[\s_-]+/g,'');
   return item.bank_sampah===true||item.is_bank_sampah===true||
     ['banksampah','wastebank','bank'].includes(scope)||
     ['banksampah','wastebank'].includes(category)||/^banksampah[:/]/.test(category);
 };
 const gorolFolder='https://drive.google.com/drive/folders/1ywp2v8rUH-oAGcM91PQyVrO7Wx9iLdCA';
 const gorolCover='https://drive.google.com/file/d/1kLKiFhwf6meUluLhdu4hlkjpXo_w7W6T/view';
 const albums=items=>onlyArray(items).filter(isBankAlbum).map(item=>{
  const judul=item.judul||item.title||'Album',tanggal=item.tanggal||item.event_on||'';
  const description=String(item.deskripsi||item.description||'');
  const folder=String(item.sourceFolder||item.folderUrl||item.driveUrl||item.drive_url||
    description.match(/Tautan folder:\s*(https:\/\/drive\.google\.com\/drive\/folders\/[^\s]+)/i)?.[1]||'');
  const isGorol=/gorol|drop point/i.test(judul)&&String(tanggal).slice(0,10)==='2026-10-11';
  const cover=String(item.sampul||item.coverUrl||item.imageUrl||'');
  return {
   id:item.id||item.albumId,judul,tanggal,
   deskripsi:description.replace(/\n?Tautan folder:\s*https:\/\/[^\s]+/ig,'').trim(),
   sampul:/drive\.google\.com\/drive\/folders\//i.test(cover)?'':(cover||(isGorol?gorolCover:'')),
   kategori:String(item.kategori||item.category||'').replace(/^Bank Sampah\s*[:/]\s*/i,''),
   sourceFolder:folder||(isGorol?gorolFolder:''),media:[]
  };
 });
 async function home(){
  const r=await publicData();
  const o=r.overview||{};
  const p=progress(r.progress);
  return {
   anggotaAktif:number(o.activeMembers??o.memberCount??o.members??r.membersCount??0),
   jenisBarang:number(o.activeItems??r.catalog?.length??0),
   beratTerkonfirmasi:number(o.confirmedWeightKg??o.confirmedKg??0),
   kegiatan:p.length,
   progres:p,
   inventaris:inventories(r.inventory)
  };
 }
 async function albumList(){
  const r=await publicData();
  const list=albums(r.albums);
  await Promise.all(list.slice(0,30).map(async item=>{
   if(!item.id)return;
   try{
    const d=await get('/api/v2/public/bank/album/'+encodeURIComponent(item.id));
    item.media=onlyArray(d.media).map(x=>({
     caption:x.caption||x.title||'',jenis:x.media_type||x.type||'foto',
     url:x.mediaUrl?(x.mediaUrl.startsWith('/')?API+x.mediaUrl:x.mediaUrl):(x.external_url||x.url||'')
    }));
    if(!item.sampul)item.sampul=item.media.find(x=>x.jenis==='foto'||x.jenis==='Foto')?.url||'';
   }catch(error){console.warn('Album media tidak dapat dimuat:',item.id,error)}
  }));
  // Manifest arsip Gorol asli dari Google Drive tetap dapat dibaca sebelum
  // seluruh metadata album diberi scope Bank Sampah pada D1.
  if(!list.some(x=>/gorol|drop point/i.test(x.judul)&&String(x.tanggal).startsWith('2026-10-11'))){
   list.push({id:'legacy-bank-20261011',judul:'Gorol dan Pembuatan Bank Sampah',
    tanggal:'2026-10-11',deskripsi:'Kegiatan warga Flamboyan 4 menyiapkan Bank Sampah',
    sampul:gorolCover,kategori:'Kerja Bakti',sourceFolder:gorolFolder,media:[]});
  }
  return list.sort((a,b)=>String(b.tanggal||'').localeCompare(String(a.tanggal||'')));
 }
 async function report(period){
  const q=period&&period!=='semua'?'?month='+encodeURIComponent(period):'';
  const r=await get('/api/v2/public/bank/report'+q);
  const sum=r.summary||r.ringkasan||{};
  const sale=r.sales||{},cash=r.cash||{},expense=r.expenses||{};
  if(!('sales'in r||'summary'in r||'ringkasan'in r))
   throw Error('Ringkasan laporan belum lengkap. Tidak menampilkan angka perkiraan.');
  const monthly=onlyArray(r.bulanan||r.monthly||r.periods).map(row=>({
   periode:row.periode||row.month||row.period||'',
   beratKg:number(row.beratKg??row.confirmedKg),
   hasilPenjualan:number(row.hasilPenjualan??row.salesRp),
   hakWarga:number(row.hakWarga??row.savingsRp),
   cadangan:number(row.cadangan??row.reserveRp),
   kasLorong:number(row.kasLorong??row.neighborhoodRp),
   operasional:number(row.operasional??row.operationalRp),
   pengeluaran:number(row.pengeluaran??row.expensesRp),
   pendingCount:number(row.pendingCount),pendingEstimateRp:number(row.pendingEstimateRp),
   pendingWeightKg:number(row.pendingWeightKg)
  }));
  return {
   ringkasan:{
    beratKg:number(sum.beratKg??sum.confirmedKg??r.confirmedKg),
    hasilPenjualan:number(sum.hasilPenjualan??sale.diterimaRp),
    hakWarga:number(sum.hakWarga??sale.savingsRp),
    cadangan:number(sum.cadangan??cash.reserveRp),
    kasLorong:number(sum.kasLorong??cash.neighborhoodRp),
    operasional:number(sum.operasional??cash.operationalRp),
    pengeluaran:number(sum.pengeluaran??expense.pengeluaranRp),
    pendingCount:number(sum.pendingCount),pendingEstimateRp:number(sum.pendingEstimateRp),
    pendingWeightKg:number(sum.pendingWeightKg),
    batch:number(sum.batch??r.batches?.length??0)
   },
   bulanan:monthly,periodeTersedia:onlyArray(r.periodeTersedia||[]),
   catatan:String(r.notice||'Laporan dihitung dari transaksi yang telah disahkan.')
  };
 }
 async function memberSavings(){
  const r=await get('/api/member/savings');
  // Never generate an incomplete statement as an apparently complete CSV/PDF.
  if(r.riwayatLengkap===false)throw Error('Riwayat tabungan melebihi batas halaman API. Laporan lengkap ditahan agar tidak ada transaksi hilang.');
  const mutasi=onlyArray(r.mutasi);
  let running=number(r.saldoTersediaRp);
  const history=mutasi.map(x=>{
   const amount=number(x.jumlahRp),isCredit=['kredit','koreksi_kredit'].includes(x.jenis);
   const balance=running;
   if(!Number.isSafeInteger(amount)||amount<0)throw Error('Nominal mutasi tabungan tidak valid.');
   running+=isCredit?-amount:amount;
   return {id:x.id||'',tanggal:x.tanggal||'',jenis:x.jenis==='kredit'?'Tabungan masuk dari hasil penjualan':
      x.jenis==='pencairan'?'Pencairan tabungan':
      x.jenis==='koreksi_debit'?'Koreksi pembatalan pengesahan':x.jenis||'Mutasi',
    kredit:isCredit?amount:0,debit:isCredit?0:amount,saldo:balance,keterangan:x.keterangan||''};
  });
  const deposits=onlyArray(r.setoran).map(x=>({
   id:x.id||'',tanggal:x.tanggal||'',tanggalJual:x.tanggalJual||null,
   beratTimbangKg:number(x.beratGram)/1000,
   beratSahKg:x.beratSahGram==null?null:number(x.beratSahGram)/1000,
   beratKg:x.status==='terkonfirmasi'?(x.beratSahGram==null?null:number(x.beratSahGram)/1000):number(x.beratGram)/1000,
   estimasiRp:number(x.estimasiRp),nilaiSahRp:x.nilaiSahRp==null?null:number(x.nilaiSahRp),
   status:x.status==='dibatalkan'?'Dibatalkan':x.status==='terkonfirmasi'?'Terkonfirmasi':'Estimasi',
   rincian:onlyArray(x.rincian).map(d=>({barang:d.barang||'',
     beratKg:number(d.beratGram)/1000,tarif:number(d.tarifWargaRpPerKg),nilai:number(d.estimasiRp)}))
  }));
  if(deposits.some(x=>!x.id||!Array.isArray(x.rincian)||!x.rincian.length))
   throw Error('Rincian setoran warga belum lengkap. Laporan ditahan agar tidak keliru.');
  const person=r.anggota||{};
  return {wargaId:String(person.id||''),nama:person.nama||'',rumah:person.rumah||'',
   dibuatPada:new Date().toLocaleDateString('id-ID'),
   saldo:number(r.saldoTersediaRp),totalMasuk:number(r.totalMasukRp),totalCair:number(r.totalCairRp),
   mutasi:history,setoran:deposits};
 }
 // Kegiatan yang telah dipublikasikan aman diakses anggota; endpoint admin tidak boleh dipanggil dari akun warga.
 async function memberPublicProgress(){
  const r=await publicData();
  return progress(r.progress).slice(0,30);
 }
 async function publicChart(){
  const r=await publicData();
  const last=Array.isArray(r.monthlyWeights)?r.monthlyWeights.slice(-6):[];
  return {bulan:last.map(x=>({bulan:x.month,beratKg:number(x.beratKg)})),
   catatan:'Berat akhir penjualan sah menurut bulan penjualan'};
 }
 async function publicAlbumDetail(id){
  const r=await get('/api/v2/public/bank/album/'+encodeURIComponent(id));
  const media=onlyArray(r.media).map(x=>{
    const url=x.mediaUrl?(x.mediaUrl.startsWith('/')?API+x.mediaUrl:x.mediaUrl):(x.external_url||'');
    const jenis=x.media_type==='video'?'Video':'Foto';
    return {id:x.id,nama:x.caption||'',jenis,url,src:url,thumb:jenis==='Foto'?url:''};
  });
  return {id,judul:r.album?.title||'',tanggal:r.album?.event_on||'',
    deskripsi:r.album?.description||'',media,catatan:media.length?'':'Album belum memiliki media aktif.'};
 }
 async function accessStatement(){
  await get('/api/member/savings');
  return {siap:true,pesan:'Laporan pribadi tersedia'};
 }
 const adminRows=async name=>onlyArray(await get('/api/v2/admin/bank/'+name+'?limit=300'));
 // Query 300 rows and explicitly reject incomplete admin reports before presenting them as final.
 const adminDeposits=async()=> (await adminRows('deposits')).map(x=>({
  id:x.id,wargaId:x.member_id,namaWarga:x.memberName||'',rumahWarga:'',tanggal:x.deposited_on,
  tanggalJual:x.sold_on||null,
  beratTimbang:number(x.total_grams)/1000,
  beratSah:x.beratSahGram==null?null:number(x.beratSahGram)/1000,
  berat:x.status==='terkonfirmasi'?(x.beratSahGram==null?null:number(x.beratSahGram)/1000):number(x.total_grams)/1000,
  estimasi:number(x.estimated_total_rp),
  nilaiSahRp:x.nilaiSahRp==null?null:number(x.nilaiSahRp),
  status:x.status==='dibatalkan'?'Dibatalkan':x.status==='terkonfirmasi'?'Terkonfirmasi':'Estimasi',
  batchId:x.batch_id
 }));
 const adminSales=async()=> (await adminRows('sales')).map(x=>({
  id:x.id,batchId:x.batch_id,tanggal:x.sold_on,lapak:x.buyer_name||'',
  nomorNota:x.receipt_no||'',linkBukti:x.evidence_url||'',
  bruto:number(x.amount_gross_rp),diterima:number(x.amount_received_rp),
  status:x.status==='dibatalkan'?'Dibatalkan':x.status==='terkonfirmasi'?'Terkonfirmasi':'Draft'
 }));
 const adminBatches=async()=> (await adminRows('batches')).map(x=>({
  id:x.id,berat:number(x.grams)/1000,jumlahSetoran:number(x.deposits),
  estimasi:number(x.estimatedRp),status:x.status||'draft'
 }));
 const adminMembers=async()=> (await adminRows('members')).map(x=>({
  wargaId:String(x.id||'').replace(/^member:/,''),nama:x.nama||'',rumah:x.rumah||'',
  status:x.status==='aktif'?'Aktif':'Nonaktif'
 }));
 const adminOverview=async()=>{
  const [members,items,deposits,sales,ledger,cash,publicInfo]=await Promise.all([
    adminMembers(),adminRows('catalog'),adminDeposits(),adminSales(),
    adminRows('ledger'),adminRows('cash'),publicData()]);
  if([members,items,deposits,sales,ledger,cash].some(x=>x.length>=300))
   throw Error('Dashboard mencapai 300 baris data; ringkasan dihentikan agar jumlah tidak terpotong.');
  const validDeposits=deposits.filter(x=>x.status!=='Dibatalkan');
  const confirmedSales=sales.filter(x=>x.status==='Terkonfirmasi');
  const netSavings=ledger.reduce((sum,x)=>sum+(['kredit','koreksi_kredit'].includes(x.kind)?1:-1)*number(x.amount_rp),0);
  const weightPending=validDeposits.some(x=>x.status==='Terkonfirmasi'&&x.beratSah===null);
  const activeCash=cash.filter(x=>x.status==='aktif');
  return {wargaAktif:members.filter(x=>x.status==='Aktif').length,
   jenisBarangAktif:items.filter(x=>x.active!==0).length,
   beratSetoranKg:weightPending?null:validDeposits.reduce((n,x)=>n+x.berat,0),
   beratAwalKg:validDeposits.reduce((n,x)=>n+x.beratTimbang,0),
   beratBelumLengkap:weightPending,
   jumlahSetoran:validDeposits.length,
   estimasiSetoranRp:validDeposits.filter(x=>x.status==='Estimasi').reduce((n,x)=>n+x.estimasi,0),
   hakWargaSahRp:validDeposits.filter(x=>x.status==='Terkonfirmasi'&&x.nilaiSahRp!==null).reduce((n,x)=>n+x.nilaiSahRp,0),
   jumlahPenjualan:confirmedSales.length,
   beratPenjualanKg:number(publicInfo.overview?.confirmedSalesWeightKg),
   diterimaLapakRp:confirmedSales.reduce((n,x)=>n+x.diterima,0),
   netMutasiTabunganRp:netSavings,
   netKasRp:activeCash.reduce((n,x)=>n+number(x.cash_in_rp)-number(x.cash_out_rp),0),
   tarifBelumDitetapkan:items.filter(x=>!x.priceRpPerKg).length};
 };
 const adminProgress=async()=> (await adminRows('progress')).map(x=>({
   id:x.id,progressId:x.id,tanggal:x.happened_on,judul:x.title,langkah:x.stage,
   deskripsi:x.description||'',status:x.status,agenda:x.next_step||'',foto:x.photoUrl||'',publik:!!x.public_visible
 }));
 const adminExpenses=async()=> (await adminRows('expenses')).map(x=>({
   id:x.id,tanggal:x.incurred_on,jenis:x.kind,kategori:x.kind,pos:x.budget_post,
   uraian:x.description||'',keterangan:x.description||'',jumlah:number(x.amount_rp),
   nominal:number(x.amount_rp),status:x.status,vendor:x.vendor||''
 }));
 const adminSavings=async()=>{
   const [members,balances]=await Promise.all([adminMembers(),adminRows('savings')]);
   const byId=new Map(balances.map(x=>[String(x.member_id||'').replace(/^member:/,''),number(x.balanceRp)]));
   return members.map(m=>({...m,saldo:byId.get(m.wargaId)||0,saldoRp:byId.get(m.wargaId)||0}));
 };
 const adminCash=async()=> (await adminRows('cash')).map(x=>({
   id:x.id,tanggal:x.occurred_on,jenis:x.transaction_type,pos:x.fund_position,
   masuk:number(x.cash_in_rp),keluar:number(x.cash_out_rp),status:x.status,keterangan:x.note||''
 }));
 const adminAlbums=async()=> (await adminRows('albums')).map(x=>({
   id:x.id,albumId:x.id,judul:x.title,tanggal:x.event_on,deskripsi:x.description||'',
   kategori:x.category,publik:x.visibility==='publik',status:x.status
 }));
 const adminCashOverview=async(_token,period='')=>{
  const all=await adminCash();
  if(all.length>=300)throw Error('Kas mencapai batas 300 transaksi. Ringkasan dihentikan agar tidak parsial.');
  const month=String(period||'').match(/^\\d{4}-\\d{2}$/)?.[0]||'';
  const eligible=all.filter(x=>x.status==='aktif');
  const rows=eligible.filter(x=>!month||String(x.tanggal).startsWith(month));
  const grouped=new Map();
  for(const x of rows){
   const key=String(x.tanggal||'').slice(0,7);
   const item=grouped.get(key)||{periode:key,masuk:0,keluar:0};
   item.masuk+=x.masuk;item.keluar+=x.keluar;grouped.set(key,item);
  }
  return {kasTercatat:eligible.reduce((n,x)=>n+x.masuk-x.keluar,0),
   masukPeriode:rows.reduce((n,x)=>n+x.masuk,0),keluarPeriode:rows.reduce((n,x)=>n+x.keluar,0),
   selisihPeriode:rows.reduce((n,x)=>n+x.masuk-x.keluar,0),
   bulanan:[...grouped.values()].sort((a,b)=>a.periode.localeCompare(b.periode)),
   rincian:rows.map(x=>({...x,jenis:x.keterangan||x.jenis})),
   transaksi:rows.length,periode:month||'semua',catatan:'Riwayat arus kas, bukan saldo akhir'};
 };
 // Nama dan rumah berasal dari data anggota, bukan kode internal ledger.
 const memberIdKey=id=>String(id??'').trim().replace(/^member:/i,'');
 const cleanMemberName=value=>String(value??'').replace(/\s*\(\s*member:[^)]+\)\s*/gi,' ').trim();
 const adminReport=async(_token,period='',includeCanceled=false)=>{
  const [deposits,sales,expenses,cash,ledger,members]=await Promise.all([
    adminDeposits(),adminSales(),adminExpenses(),adminCash(),adminRows('ledger'),adminMembers()]);
  if([deposits,sales,expenses,cash,ledger,members].some(x=>x.length>=300))
   throw Error('Laporan melebihi batas 300 baris per buku. Unduh dihentikan agar tidak ada nilai terpotong.');
  const byMember=new Map(members.map(m=>[memberIdKey(m.wargaId),m]));
  const wargaLabel=(rawId,fallbackName='',fallbackHouse='')=>{
   const found=byMember.get(memberIdKey(rawId));
   const candidate=cleanMemberName(found?.nama||fallbackName);
   const name=candidate&&!/^(?:member:)?[a-z]*\d+$/i.test(candidate)?candidate:'Nama warga belum tersedia';
   const house=String(found?.rumah||fallbackHouse||'').trim();
   return name+(house?' • '+house:'');
  };
  const month=String(period||'').match(/^\d{4}-\d{2}$/)?.[0]||'';
  const scope=records=>records.filter(x=>!month||String(x.tanggal||'').startsWith(month));
  const depositRows=scope(deposits).filter(x=>includeCanceled||x.status!=='Dibatalkan');
  const saleRows=scope(sales).filter(x=>includeCanceled||x.status!=='Dibatalkan');
  const confirmedDeposits=depositRows.filter(x=>x.status==='Terkonfirmasi');
  const waitingDeposits=depositRows.filter(x=>x.status==='Estimasi');
  const confirmedSales=saleRows.filter(x=>x.status==='Terkonfirmasi');
  const expenseRows=scope(expenses).filter(x=>includeCanceled||x.status!=='dibatalkan');
  const paidExpenses=expenseRows.filter(x=>x.status==='lunas');
  const activeCash=cash.filter(x=>x.status==='aktif');
  const transactions=scope(ledger.map(x=>({
   id:x.id,tanggal:x.transaction_on,warga:wargaLabel(x.member_id),jenis:x.kind||'',
   nominal:number(x.amount_rp),status:'Aktif'})));
  const credits=transactions.filter(x=>['kredit','koreksi_kredit'].includes(x.jenis));
  const reversals=transactions.filter(x=>x.jenis==='koreksi_debit');
  const withdrawals=transactions.filter(x=>x.jenis==='pencairan');
  const hakWargaDikredit=credits.reduce((n,x)=>n+x.nominal,0)-reversals.reduce((n,x)=>n+x.nominal,0);
  return {
   periode:month||'semua',
   ringkasan:{jumlahSetoran:confirmedDeposits.length,jumlahPenjualan:confirmedSales.length,
    estimasi:waitingDeposits.reduce((n,x)=>n+x.estimasi,0),
    belumSah:waitingDeposits.length,
    hasilSahSetoran:confirmedDeposits.filter(x=>x.nilaiSahRp!==null).reduce((n,x)=>n+x.nilaiSahRp,0),
    nilaiSahBelumTersedia:confirmedDeposits.some(x=>x.nilaiSahRp===null),
    diterima:confirmedSales.reduce((n,x)=>n+x.diterima,0),
    hakWargaDikredit,
    tabunganDicairkan:withdrawals.reduce((n,x)=>n+x.nominal,0),
    biaya:paidExpenses.reduce((n,x)=>n+x.nominal,0),
    saldoKasKini:activeCash.reduce((n,x)=>n+x.masuk-x.keluar,0)},
   setoran:depositRows.map(x=>({id:x.id,tanggal:x.tanggal,
    warga:wargaLabel(x.wargaId,x.namaWarga,x.rumahWarga),berat:x.berat==null?'—':x.berat,
    beratTimbang:x.beratTimbang,
    nilai:x.status==='Terkonfirmasi'?(x.nilaiSahRp===null?'—':x.nilaiSahRp):x.status==='Estimasi'?x.estimasi:'—',
    status:x.status==='Terkonfirmasi'?'Hasil jual sah'+(x.nilaiSahRp===null?' (belum tersedia)':''):
      x.status==='Estimasi'?'Perkiraan · belum sah':'Dibatalkan'})),
   penjualan:saleRows.map(x=>({id:x.id,tanggal:x.tanggal,batch:x.batchId,lapak:x.lapak,bruto:x.bruto,
    diterima:x.diterima,disahkan:x.status==='Terkonfirmasi',status:x.status})),
   pengeluaran:expenseRows.map(x=>({id:x.id,tanggal:x.tanggal,jenis:x.jenis,keterangan:x.keterangan,
    pos:x.pos,nominal:x.nominal,status:x.status})),
   mutasi:transactions.map(x=>({id:x.id,tanggal:x.tanggal,warga:x.warga,
    jenis:x.jenis==='kredit'?'Hak warga disahkan':x.jenis==='pencairan'?'Pencairan':
      x.jenis==='koreksi_debit'?'Pembatalan pengesahan':x.jenis,
    kredit:['kredit','koreksi_kredit'].includes(x.jenis)?x.nominal:0,
    debit:['kredit','koreksi_kredit'].includes(x.jenis)?0:x.nominal}))
  };
 };
 const bankAdminAccounts=async()=>{
   // Admin can read members for operational forms. Superadmin uses centralized accounts.
   let list;
   try {
     const response=await get('/api/superadmin/accounts/preview');
     list=Array.isArray(response.akun)?response.akun:Array.isArray(response.accounts)?response.accounts:onlyArray(response);
   } catch(error) {
     // Only the account manager needs central credentials; general setoran dropdown can use bank members.
     return adminMembers().then(members=>members.map(x=>({...x,akunId:'',username:'',status:x.status})));
   }
   return list.filter(x=>!['superadmin','admin'].includes(String(x.role||'').toLowerCase())).map(x=>{
     const status=String(x.status||(!x.perluAktivasi?'Aktif':'Belum Aktif'));
     return {
       akunId:String(x.id||x.accountId||x.akunId||''),
       wargaId:String(x.wargaId||x.member_id||x.payerId||''),
       nama:String(x.nama||x.name||x.username||''),
       rumah:String(x.rumah||x.house||''),
       username:String(x.username||''),
       status:/^(aktif|active)$/i.test(status)?'Aktif':status,
       aktif:/^(aktif|active)$/i.test(status)
     };
   });
 };
 const memberAvatar=async()=>{
   const r=await fetch(API+'/api/member/avatar',{credentials:'include',cache:'no-store'});
   if(r.status===404)return {ada:false,data:''};
   if(!r.ok)throw Error('Foto profil tidak dapat dibaca (HTTP '+r.status+').');
   const blob=await r.blob();
   const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(Error('Foto gagal diproses'));reader.readAsDataURL(blob)});
   return {ada:true,data};
 };
 const saveMemberAvatar=async(_token,encoded)=>{
   if(!/^[A-Za-z0-9+/=]+$/.test(String(encoded||'')))throw Error('Format gambar tidak valid.');
   const bytes=Uint8Array.from(atob(encoded),x=>x.charCodeAt(0));
   if(bytes.length>2*1024*1024)throw Error('Foto melebihi 2 MB.');
   const response=await fetch(API+'/api/member/avatar',{method:'POST',credentials:'include',headers:{'content-type':'image/jpeg'},body:bytes});
   const result=await response.json().catch(()=>({}));
   if(!response.ok||result.ok===false)throw Error(result.error||'Upload foto ditolak (HTTP '+response.status+').');
   return {ok:true};
 };
 const changePassword=async(_token,currentPassword,newPassword)=>{
   if(!currentPassword||String(newPassword||'').length<4)throw Error('Isi password sekarang dan password baru minimal 4 karakter.');
   const r=await fetch(API+'/api/auth/change-password',{method:'POST',credentials:'include',
     headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword,newPassword})});
   const data=await r.json().catch(()=>({}));
   if(!r.ok||data.ok===false)throw Error(data.error||'Gagal mengganti password (HTTP '+r.status+').');
   window.parent.postMessage({type:'f4:auth-changed'},location.origin);
   return {berhasil:true,pesan:'Password berhasil diganti. Silakan login kembali.'};
 };
 const detailsBank=async(_token,id,kind)=>{
  if(!String(id||'').trim())throw Error('Pilih transaksi yang ingin dilihat.');
  const url=kind==='deposit'?'/api/v2/admin/bank/deposit-detail?id=':'/api/v2/admin/bank/sale-detail?id=';
  const result=await get(url+encodeURIComponent(id));
  return onlyArray(result.lines).map(x=>({
   barang:x.name||x.item_name||'',berat:number(x.grams)/1000,
   tarif:number(x.priceRpPerKg),harga:number(x.priceRpPerKg),
   nilai:number(x.estimated_rp??x.total_rp??0)
  }));
 };
 const finalBatches=async()=>{
  const [alloc,batches]=await Promise.all([adminRows('allocations'),adminBatches()]);
  const byId=new Map(batches.map(x=>[x.id,x]));
  return alloc.filter(x=>x.batchStatus==='disahkan').map(x=>({
   batch:x.batch_id,beratWarga:number(byId.get(x.batch_id)?.berat),
   hakWarga:number(x.citizenRightsRp),diterima:number(x.receivedRp)
  }));
 };
 const read={
  bsV7RincianSetoran:(_token,id)=>detailsBank(_token,id,'deposit'),
  bsV7RincianPenjualan:(_token,id)=>detailsBank(_token,id,'sale'),
  bsV24DaftarProgressAdmin:adminProgress,
  bsV27FinalAdmin:finalBatches,
  authChangePassword:changePassword,
  bsV15FotoSaya:memberAvatar,
  bsV15SimpanFoto:saveMemberAvatar,
  authAdminAccounts:bankAdminAccounts,
  bsV12AksesLaporan:accessStatement,
  bsV17GrafikPublik:publicChart,
  bsV22AlbumIndexPublik:albumList,
  bsV21IsiAlbumPublik:publicAlbumDetail,
  bsDashboardProgressPublik:adminProgress,
  bsV14ProgressPublik:memberPublicProgress,
  bsV10PengeluaranAdmin:adminExpenses,
  bsV9SaldoAdmin:adminSavings,
  bsV22AlbumAdmin:adminAlbums,
  bsDashboardAdmin:adminOverview,
  bsV17RingkasanKasAdmin:adminCashOverview,
  bsV10LaporanAdmin:adminReport,
  bsV9StatusKasAdmin:async()=>{
   const [cash,sales,allocations]=await Promise.all([adminRows('cash'),adminRows('sales'),adminRows('allocations')]);
   if([cash,sales,allocations].some(r=>r.length>=300))throw Error('Riwayat mencapai batas 300 baris. Ringkasan dihentikan agar saldo tidak salah.');
   const active=cash.filter(r=>r.status==='aktif');
   const balance=active.reduce((v,r)=>v+number(r.cash_in_rp)-number(r.cash_out_rp),0);
   const allocated=new Set(allocations.map(r=>String(r.batch_id)));
   const pending=sales.filter(r=>r.status==='terkonfirmasi'&&!allocated.has(String(r.batch_id))).map(r=>({batch:String(r.batch_id),penjualan:String(r.id)}));
   return {saldoKasTercatat:balance,batchBelumDiposting:pending,kasGabungan:balance};
  },
  bsV10KasPosAdmin:async()=>{
   const cash=await adminRows('cash');
   if(cash.length>=300)throw Error('Buku kas mencapai 300 baris. Tidak aman menghitung saldo dari daftar terpotong.');
   const active=cash.filter(r=>r.status==='aktif'),byFund=new Map();
   for(const r of active){const key=String(r.fund_position||'').trim();if(!key)throw Error('Ada transaksi aktif tanpa pos dana; periksa buku kas.');byFund.set(key,(byFund.get(key)||0)+number(r.cash_in_rp)-number(r.cash_out_rp));}
   const titles={operasional:'Operasional',kas_lorong:'Kas Lorong',cadangan:'Cadangan',tabungan_warga:'Tabungan Warga'};
   const keys=[...new Set([...Object.keys(titles),...byFund.keys()])];
   return {kasGabungan:[...byFund.values()].reduce((sum,v)=>sum+v,0),pos:keys.map(key=>({kode:key,nama:titles[key]||key,tersedia:byFund.get(key)||0}))};
  },
  bsV6SetoranAdmin:adminDeposits,
  bsV18RiwayatSetoranAdmin:adminDeposits,
  bsV7PenjualanAdmin:adminSales,
  bsV6BatchAdmin:adminBatches,
  bsV11PublicHome:home,
  bsV11PublicAlbums:albumList,
  bsV25LaporanPublik:report,
  bsV12Statement:memberSavings,
  bsDashboardMasterBarang:async()=>{
   const r=await get('/api/v2/admin/bank/catalog');
   return onlyArray(r).map(item=>({kode:item.code||item.kode||String(item.id||'').replace(/^waste:/,''),
    nama:item.name||item.nama,kelompok:item.category||item.kelompok||'',
    acuan:number(item.reference_price_rp??item.acuan??number(item.priceRpPerKg)*2),
    tarif:number(item.priceRpPerKg??item.tarif),
    status:item.active===false?'Nonaktif':'Aktif'}));
  }
 };
 window.__f4BankDemoCall=(name,args=[])=>{
  if(Object.hasOwn(read,name))return read[name](...args);
  // Other legacy read flows are not yet mapped. Do not silently fake balances or writes.
  if(name.startsWith('bs')&&/Tambah|Simpan|Hapus|Batalkan|Update|Bayar|Posting|Setujui|Ubah|Tutup/i.test(name))
   return Promise.reject(Error('Penyimpanan belum diaktifkan. Perlu endpoint Worker yang tervalidasi.'));
  // Jangan pernah menggunakan fallback data simulasi dari versi prototipe sebagai transaksi resmi.
  return Promise.reject(Error('Fungsi '+name+' dari Bank Sampah asli belum memiliki endpoint Cloudflare yang terhubung. Tidak ada data yang diubah.'));
 };
})();