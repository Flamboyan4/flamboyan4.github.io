/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/live-bank-readonly.js",function(__f4){


/* Live data bridge for ORIGINAL Bank Sampah UI. Reads only existing Cloudflare endpoints. */
(()=>{'use strict';
 const API='https://api.flamboyan4.web.id';
 const original=__f4.window.__f4BankDemoCall;
 const onlyArray=(data)=>__f4.globals.Array.isArray(data)?data:__f4.globals.Array.isArray(data?.rows)?data.rows:__f4.globals.Array.isArray(data?.items)?data.items:__f4.globals.Array.isArray(data?.data)?data.data:__f4.globals.Array.isArray(data?.data?.rows)?data.data.rows:__f4.globals.Array.isArray(data?.data?.items)?data.data.items:[];
 const number=(value)=>__f4.globals.Number.isFinite((0,__f4.globals.Number)(value))?(0,__f4.globals.Number)(value):0;
 // Identitas kategori barang digunakan lintas beranda, tarif, dan laporan.
 const itemCategory=(name,category)=>/duplex|dupleks?/i.test((0,__f4.globals.String)(name||''))?'Kertas':(0,__f4.globals.String)(category||'Lainnya');
 __f4.window.f4BankItemCategory=itemCategory;
 const bankWasteCodes=catalog=>{
  const codeBase=name=>{
    const value=(0,__f4.globals.String)(name||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
    if(/botol.*(?:aqua.*)?bodong/.test(value))return 'BD';
    if(/botol.*gelas.*plastik.*kotor/.test(value))return 'BPK';
    if(/botol.*aqua/.test(value))return 'BA';
    if(/kardus/.test(value))return 'KD';
    // Aluminium kaleng termasuk jenis aluminium (AL); kaleng biasa tetap KL.
    if(/alum(?:inium|unium)?/.test(value)&&/kaleng/.test(value))return 'AL';
    if(/kaleng/.test(value))return 'KL';
    if(/galon/.test(value))return 'GL';
    const words=value.split(' ').filter(word=>!['dan','atau','bekas','plastik','sampah','kering'].includes(word));
    return words.length>1?words.slice(0,3).map(word=>word[0]).join('').toUpperCase():
      (words[0]||'X').slice(0,2).toUpperCase();
  };
  const usedCodes=new __f4.globals.Set(),codeByItem=new __f4.globals.Map();
  const kodeBarang=[...catalog]
    .sort((a,b)=>(0,__f4.globals.String)(a.name||'').localeCompare((0,__f4.globals.String)(b.name||''),'id'))
    .map(item=>{
      const base=codeBase(item.name);
      let code=base,suffix=2;
      while(usedCodes.has(code))code=base+suffix++;
      usedCodes.add(code);codeByItem.set((0,__f4.globals.String)(item.id||''),code);
      const original=(0,__f4.globals.String)(item.name||'');
      return {kode:code,nama:code==='AL'&&/alum(?:inium|unium)?.*kaleng/i.test(original)?'Alumunium':original,
        namaAsli:original,id:(0,__f4.globals.String)(item.id||'')};
    });
  return {kodeBarang,codeByItem};
 };

 async function get(path){
  const response=await (0,__f4.globals.fetch)(API+path,{credentials:'include',mode:'cors',cache:'no-store'});
  const result=await response.json().catch(()=>{throw (0,__f4.globals.Error)('API Cloudflare tidak mengirim JSON.')});
  if(!response.ok||result?.ok===false)throw (0,__f4.globals.Error)(result?.error||'Gagal membaca data (HTTP '+response.status+').');
  return result;
 }
 let cache,loadedAt=0;
 const publicData=async()=>{
  if(cache&&__f4.globals.Date.now()-loadedAt<15000)return cache;
  const result=await get('/api/v2/public/bank');
  if(__f4.globals.Array.isArray(result.catalog))result.catalog=result.catalog.map(item=>({
   ...item,category:itemCategory(item.name,item.category)
  }));
  cache=result;loadedAt=__f4.globals.Date.now();return result;
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
  nama:item.nama||item.name||'',jumlah:(0,__f4.globals.String)(item.jumlah??item.quantity??'0')+' '+(item.unit||''),
  kondisi:item.kondisi||item.condition||'',foto:item.foto||item.photoUrl||item.imageUrl||''
 }));
 // Portal Utama and Bank Sampah have separate publication scopes in D1.
 const isBankAlbum=item=>{
   const scope=(0,__f4.globals.String)(item.portal_scope||item.source_portal||item.portal||item.scope||'')
     .toLowerCase().replace(/[\s_-]+/g,'');
   const category=(0,__f4.globals.String)(item.kategori||item.category||'').toLowerCase().replace(/[\s_-]+/g,'');
   return item.bank_sampah===true||item.is_bank_sampah===true||
     ['banksampah','wastebank','bank'].includes(scope)||
     ['banksampah','wastebank'].includes(category)||/^banksampah[:/]/.test(category);
 };
 const gorolFolder='https://drive.google.com/drive/folders/1ywp2v8rUH-oAGcM91PQyVrO7Wx9iLdCA';
 const gorolCover='https://drive.google.com/file/d/1kLKiFhwf6meUluLhdu4hlkjpXo_w7W6T/view';
 const albums=items=>onlyArray(items).filter(isBankAlbum).map(item=>{
  const judul=item.judul||item.title||'Album',tanggal=item.tanggal||item.event_on||'';
  const description=(0,__f4.globals.String)(item.deskripsi||item.description||'');
  const folder=(0,__f4.globals.String)(item.sourceFolder||item.folderUrl||item.driveUrl||item.drive_url||
    description.match(/Tautan folder:\s*(https:\/\/drive\.google\.com\/drive\/folders\/[^\s]+)/i)?.[1]||'');
  const isGorol=/gorol|drop point/i.test(judul)&&(0,__f4.globals.String)(tanggal).slice(0,10)==='2026-10-11';
  const cover=(0,__f4.globals.String)(item.sampul||item.coverUrl||item.imageUrl||'');
  return {
   id:item.id||item.albumId,judul,tanggal,
   deskripsi:description.replace(/\n?Tautan folder:\s*https:\/\/[^\s]+/ig,'').trim(),
   sampul:/drive\.google\.com\/drive\/folders\//i.test(cover)?'':(cover||(isGorol?gorolCover:'')),
   kategori:(0,__f4.globals.String)(item.kategori||item.category||'').replace(/^Bank Sampah\s*[:/]\s*/i,''),
   sourceFolder:folder||(isGorol?gorolFolder:''),media:[]
  };
 });
 async function home(){
  const r=await publicData();
  const o=r.overview||{};
  const p=progress(r.progress);
  return {
   anggotaAktif:number(o.activeMembers??o.memberCount??o.members??r.membersCount??0),
   jumlahSetoranTerkonfirmasi:number(o.confirmedDeposits??0),
   jumlahSetoranTercatat:o.recordedDeposits==null?null:number(o.recordedDeposits),
   jenisBarang:number(o.activeItems??r.catalog?.length??0),
   barangDiterima:(__f4.globals.Array.isArray(r.catalog)?r.catalog:[])
     .filter(item=>item&&(0,__f4.globals.String)(item.name||'').trim())
     .map(item=>({nama:(0,__f4.globals.String)(item.name),kelompok:(0,__f4.globals.String)(item.category||'Lainnya'),
       hargaAcuan:item.priceRpPerKg==null?null:number(item.priceRpPerKg)})),
   beratTerkonfirmasi:number(o.weighedConfirmedKg??o.confirmedWeightKg??o.confirmedKg??0),
   beratSetoranTercatat:o.recordedWeightKg==null?null:number(o.recordedWeightKg),
   kegiatan:p.length,
   progres:p,
   depositPeriods:__f4.globals.Array.isArray(r.depositPeriods)?r.depositPeriods.map(row=>({
     tanggal:(0,__f4.globals.String)(row.tanggal||''),beratKg:number(row.beratKg)})):null,
   itemWeights:__f4.globals.Array.isArray(r.itemWeights)?r.itemWeights.map(row=>({
     id:(0,__f4.globals.String)(row.id||''),nama:(0,__f4.globals.String)(row.name||''),kelompok:(0,__f4.globals.String)(row.category||'Lainnya'),
     beratKg:number(row.beratKg)})):null,
   inventaris:inventories(r.inventory)
  };
 }
 async function albumList(){
  const r=await publicData();
  const list=albums(r.albums);
  await __f4.globals.Promise.all(list.slice(0,30).map(async item=>{
   if(!item.id)return;
   try{
    const d=await get('/api/v2/public/bank/album/'+(0,__f4.globals.encodeURIComponent)(item.id));
    item.media=onlyArray(d.media).map(x=>({
     id:(0,__f4.globals.String)(x.id||''),caption:x.caption||x.title||'',jenis:x.media_type||x.type||'foto',
     url:x.mediaUrl?(x.mediaUrl.startsWith('/')?API+x.mediaUrl:x.mediaUrl):(x.external_url||x.url||'')
    }));
    if(!item.sampul)item.sampul=item.media.find(x=>x.jenis==='foto'||x.jenis==='Foto')?.url||'';
   }catch(error){__f4.globals.console.warn('Album media tidak dapat dimuat:',item.id,error)}
  }));
  // Only published D1 albums are returned; never add synthetic IDs that cannot be opened.
  return list.sort((a,b)=>(0,__f4.globals.String)(b.tanggal||'').localeCompare((0,__f4.globals.String)(a.tanggal||'')));
 }
 async function report(period){
  const q=period&&period!=='semua'?'?month='+(0,__f4.globals.encodeURIComponent)(period):'';
  const r=await get('/api/v2/public/bank/report'+q);
  const sum=r.summary||r.ringkasan||{};
  const sale=r.sales||{},cash=r.cash||{},expense=r.expenses||{};
  if(!('sales'in r||'summary'in r||'ringkasan'in r))
   throw (0,__f4.globals.Error)('Ringkasan laporan belum lengkap. Tidak menampilkan angka perkiraan.');
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
   bulanan:monthly,
   // Null berarti Worker belum menyediakan rekap harian; jangan menebak dari bulanan.
   harian:__f4.globals.Array.isArray(r.harian)?r.harian.map(row=>({
    tanggal:(0,__f4.globals.String)(row.tanggal||''),beratKg:number(row.beratKg),
    hasilPenjualan:number(row.hasilPenjualan),
    pendingWeightKg:number(row.pendingWeightKg),
    pendingEstimateRp:number(row.pendingEstimateRp)
   })):null,
   periodeTersedia:onlyArray(r.periodeTersedia||[]),
   catatan:(0,__f4.globals.String)(r.notice||'Laporan dihitung dari transaksi yang telah disahkan.')
  };
 }
 async function memberSavings(){
  const [r,publicInfo]=await __f4.globals.Promise.all([
    get('/api/member/savings'),publicData().catch(()=>({catalog:[]}))
  ]);
  // Never generate an incomplete statement as an apparently complete CSV/PDF.
  if(r.riwayatLengkap===false)throw (0,__f4.globals.Error)('Riwayat tabungan melebihi batas halaman API. Laporan lengkap ditahan agar tidak ada transaksi hilang.');
  const mutasi=onlyArray(r.mutasi);
  let running=number(r.saldoTersediaRp);
  const history=mutasi.map(x=>{
   const amount=number(x.jumlahRp),isCredit=['kredit','koreksi_kredit'].includes(x.jenis);
   const balance=running;
   if(!__f4.globals.Number.isSafeInteger(amount)||amount<0)throw (0,__f4.globals.Error)('Nominal mutasi tabungan tidak valid.');
   running+=isCredit?-amount:amount;
   const correction=x.jenis==='koreksi_debit'||x.jenis==='koreksi_kredit';
   return {id:x.id||'',tanggal:x.tanggal||'',jenis:x.jenis==='kredit'?'Tabungan masuk dari hasil penjualan':
      x.jenis==='pencairan'?'Pencairan tabungan':
      x.jenis==='koreksi_debit'?'Koreksi batal':
      x.jenis==='koreksi_kredit'?'Koreksi penambahan tabungan':x.jenis||'Mutasi',
    kind:x.jenis||'',batchId:(0,__f4.globals.String)(x.batchId||x.batch_id||''),
    kredit:isCredit&&!correction?amount:0,
    debit:!isCredit&&!correction?amount:0,
    koreksi:correction?(isCredit?amount:-amount):0,
    saldo:balance,keterangan:x.keterangan||''};
  });
  const deposits=onlyArray(r.setoran).map(x=>({
   id:x.id||'',batchId:(0,__f4.globals.String)(x.batchId||''),tanggalPengesahan:x.tanggalPengesahan||null,
   tanggal:x.tanggal||'',tanggalJual:x.tanggalJual||null,
   beratTimbangKg:number(x.beratGram)/1000,
   beratSahKg:x.beratSahGram==null?null:number(x.beratSahGram)/1000,
   beratKg:x.status==='terkonfirmasi'?(x.beratSahGram==null?null:number(x.beratSahGram)/1000):number(x.beratGram)/1000,
   estimasiRp:number(x.estimasiRp),nilaiSahRp:x.nilaiSahRp==null?null:number(x.nilaiSahRp),
   status:x.status==='dibatalkan'?'Dibatalkan':x.status==='terkonfirmasi'?'Terkonfirmasi':'Estimasi',
   rincian:onlyArray(x.rincian).map(d=>({barang:d.barang||'',
     beratKg:number(d.beratGram)/1000,tarif:number(d.tarifWargaRpPerKg),nilai:number(d.estimasiRp)}))
  }));
  if(deposits.some(x=>!x.id||!__f4.globals.Array.isArray(x.rincian)||!x.rincian.length))
   throw (0,__f4.globals.Error)('Rincian setoran warga belum lengkap. Laporan ditahan agar tidak keliru.');
  const person=r.anggota||{};
  // "Masuk" harus NETO: kredit sah yang masih berlaku setelah jurnal koreksi
  // pembatalan pengesahan. API lama mengirim totalMasukRp sebagai kredit bruto
  // sebelum koreksi_debit, padahal saldoTersediaRp sudah memperhitungkannya.
  // Saldo neto + pencairan = total masuk aktif; jangan hitung ulang dari
  // 100 baris mutasi terakhir karena riwayat bisa terpotong.
  const saldo=(0,__f4.globals.Number)(r.saldoTersediaRp),totalCair=(0,__f4.globals.Number)(r.totalCairRp);
  const totalMasuk=saldo+totalCair;
  if(![saldo,totalCair,totalMasuk].every(__f4.globals.Number.isSafeInteger) ||
     saldo<0||totalCair<0||totalMasuk<0)
   throw (0,__f4.globals.Error)('Ringkasan tabungan tidak seimbang. Muat ulang atau hubungi pengurus.');
  // Katalog publik menyediakan judul kolom lengkap; jenis historis yang sudah
  // tak aktif tetap dimunculkan agar berat di laporan warga tidak hilang.
  const catalog=onlyArray(publicInfo.catalog).map(item=>({id:(0,__f4.globals.String)(item.id||''),name:(0,__f4.globals.String)(item.name||'')}));
  const known=new __f4.globals.Set(catalog.map(item=>item.name.trim().toLowerCase()));
  for(const name of new __f4.globals.Set(deposits.flatMap(s=>s.rincian.map(item=>(0,__f4.globals.String)(item.barang||'').trim())).filter(__f4.globals.Boolean))){
    if(!known.has(name.toLowerCase())){
      catalog.push({id:'historical:'+catalog.length,name});
      known.add(name.toLowerCase());
    }
  }
  const {kodeBarang}=bankWasteCodes(catalog);
  return {wargaId:(0,__f4.globals.String)(person.id||''),nama:person.nama||'',rumah:person.rumah||'',
   dibuatPada:new __f4.globals.Date().toLocaleDateString('id-ID'),
   saldo,totalMasuk,totalCair,
   mutasi:history,setoran:deposits,kodeBarang};
 }
 // Kegiatan yang telah dipublikasikan aman diakses anggota; endpoint admin tidak boleh dipanggil dari akun warga.
 async function memberPublicProgress(){
  const r=await publicData();
  return progress(r.progress).slice(0,30);
 }
 async function publicChart(){
  const r=await publicData();
  const recorded=__f4.globals.Array.isArray(r.monthlyDeposits);
  const last=(recorded?r.monthlyDeposits:__f4.globals.Array.isArray(r.monthlyWeights)?r.monthlyWeights:[]).slice(-6);
  return {bulan:last.map(x=>({bulan:x.month,beratKg:number(x.beratKg)})),
   source:recorded?'setoran':'penjualan',
   catatan:recorded?'Berat seluruh setoran yang tidak dibatalkan menurut tanggal setor':
    'Data setoran belum tersedia; grafik sementara memakai transaksi penjualan sah'};
 }
 async function publicAlbumDetail(id){
  const r=await get('/api/v2/public/bank/album/'+(0,__f4.globals.encodeURIComponent)(id));
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
 const editDepositDetail=async(_token,id)=>{
  const depositId=(0,__f4.globals.String)(id||'').trim();
  if(!depositId||depositId.length>128)throw (0,__f4.globals.Error)('ID setoran tidak valid.');
  const result=await get('/api/v2/admin/bank/deposit-detail?id='+(0,__f4.globals.encodeURIComponent)(depositId));
  if(!result.deposit||!__f4.globals.Array.isArray(result.lines))throw (0,__f4.globals.Error)('Rincian setoran belum tersedia dari database.');
  return {deposit:result.deposit,lines:result.lines};
 };
 const adminDeposits=async()=> (await adminRows('deposits')).map(x=>({
  id:x.id,wargaId:(0,__f4.globals.String)(x.member_id||'').replace(/^member:/,''),namaWarga:x.memberName||'',
  rumahWarga:(0,__f4.globals.String)(x.houseCode||x.house_code||x.rumah||'').trim(),tanggal:x.deposited_on,
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
  nota:(0,__f4.globals.String)(x.receipt_no||''),bukti:(0,__f4.globals.String)(x.evidence_url||''),
  nomorNota:x.receipt_no||'',linkBukti:x.evidence_url||'',
  bruto:number(x.amount_gross_rp),diterima:number(x.amount_received_rp),
  status:x.status==='dibatalkan'?'Dibatalkan':x.status==='terkonfirmasi'?'Terkonfirmasi':'Draft'
 }));
 const adminBatches=async()=> (await adminRows('batches')).map(x=>({
  id:x.id,berat:number(x.grams)/1000,jumlahSetoran:number(x.deposits),
  estimasi:number(x.estimatedRp),status:x.status||'draft'
 }));
 const adminMembers=async()=> (await adminRows('members')).map(x=>({
  wargaId:(0,__f4.globals.String)(x.id||'').replace(/^member:/i,''),nama:x.nama||'',rumah:x.rumah||'',
  status:x.status==='aktif'?'Aktif':'Nonaktif',hasAvatar:(0,__f4.globals.Number)(x.hasAvatar||0)===1
 }));
 // Provide avatar status for dashboard latest-deposit cards as well as history.
 // The data is joined only by the canonical member ID, never by display name.
 const adminDepositsWithAvatars=async()=>{
   const [deposits,members]=await __f4.globals.Promise.all([adminDeposits(),adminMembers()]);
   const byId=new __f4.globals.Map(members.map(m=>[(0,__f4.globals.String)(m.wargaId),m]));
   return deposits.map(d=>{
     const member=byId.get((0,__f4.globals.String)(d.wargaId));
     return {...d,rumahWarga:d.rumahWarga||member?.rumah||'',
       hasAvatar:member?.hasAvatar===true};
   });
 };
 const adminOverview=async()=>{
  // Public aggregates must not gate private ledger totals.
  const [members,items,deposits,sales,ledger,cash]=await __f4.globals.Promise.all([
    adminMembers(),adminRows('catalog'),adminDeposits(),adminSales(),
    adminRows('ledger'),adminRows('cash')]);
  const publicInfo=cache&&__f4.globals.Date.now()-loadedAt<15000?cache:null;
  if([members,items,deposits,sales,ledger,cash].some(x=>x.length>=300))
   throw (0,__f4.globals.Error)('Dashboard mencapai 300 baris data; ringkasan dihentikan agar jumlah tidak terpotong.');
  const validDeposits=deposits.filter(x=>x.status!=='Dibatalkan');
  const confirmedSales=sales.filter(x=>x.status==='Terkonfirmasi');
  const netSavings=ledger.reduce((sum,x)=>sum+(['kredit','koreksi_kredit'].includes(x.kind)?1:-1)*number(x.amount_rp),0);
  const weightPending=validDeposits.some(x=>x.status==='Terkonfirmasi'&&x.beratSah===null);
  const activeCash=cash.filter(x=>x.status==='aktif');
  const cashFund=new __f4.globals.Map();
  for(const row of activeCash){
    const pos=(0,__f4.globals.String)(row.fund_position||"").trim().toLowerCase();
    cashFund.set(pos,(cashFund.get(pos)||0)+number(row.cash_in_rp)-number(row.cash_out_rp));
  }
  const totalCash=[...cashFund.values()].reduce((n,x)=>n+x,0);
  const bankOwnedCash=(cashFund.get("operasional")||0)+(cashFund.get("cadangan")||0);
  const neighborhoodCash=cashFund.get("kas_lorong")||0;
  const wargaHeld=cashFund.get("tabungan_warga")||0;
  const otherCash=totalCash-bankOwnedCash-neighborhoodCash-wargaHeld;
  return {wargaAktif:members.filter(x=>x.status==='Aktif').length,
   jenisBarangAktif:items.filter(x=>x.active!==0).length,
   beratSetoranKg:weightPending?null:validDeposits.reduce((n,x)=>n+x.berat,0),
   beratAwalKg:validDeposits.reduce((n,x)=>n+x.beratTimbang,0),
   beratBelumLengkap:weightPending,
   jumlahSetoran:validDeposits.length,
   estimasiSetoranRp:validDeposits.filter(x=>x.status==='Estimasi').reduce((n,x)=>n+x.estimasi,0),
   hakWargaSahRp:validDeposits.filter(x=>x.status==='Terkonfirmasi'&&x.nilaiSahRp!==null).reduce((n,x)=>n+x.nilaiSahRp,0),
   jumlahPenjualan:confirmedSales.length,
   beratPenjualanKg:publicInfo?.overview?.confirmedSalesWeightKg==null?null:number(publicInfo.overview.confirmedSalesWeightKg),
   diterimaLapakRp:confirmedSales.reduce((n,x)=>n+x.diterima,0),
   netMutasiTabunganRp:netSavings,
   netKasRp:totalCash,
   kasGabunganRp:totalCash,
   hakWargaBelumCairRp:netSavings,
   kasMilikBankRp:bankOwnedCash,
   kasLingkunganRp:neighborhoodCash,
   kasHakWargaDitampungRp:wargaHeld,
   kasPosLainRp:otherCash,
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
   const [members,balances]=await __f4.globals.Promise.all([adminMembers(),adminRows('savings')]);
   const byId=new __f4.globals.Map(balances.map(x=>[(0,__f4.globals.String)(x.member_id||'').replace(/^member:/,''),number(x.balanceRp)]));
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
  if(all.length>=300)throw (0,__f4.globals.Error)('Kas mencapai batas 300 transaksi. Ringkasan dihentikan agar tidak parsial.');
  const month=(0,__f4.globals.String)(period||'').match(/^\\d{4}-\\d{2}$/)?.[0]||'';
  const eligible=all.filter(x=>x.status==='aktif');
  const rows=eligible.filter(x=>!month||(0,__f4.globals.String)(x.tanggal).startsWith(month));
  const grouped=new __f4.globals.Map();
  for(const x of rows){
   const key=(0,__f4.globals.String)(x.tanggal||'').slice(0,7);
   const item=grouped.get(key)||{periode:key,masuk:0,keluar:0};
   item.masuk+=x.masuk;item.keluar+=x.keluar;grouped.set(key,item);
  }
  return {kasTercatat:eligible.reduce((n,x)=>n+x.masuk-x.keluar,0),
   masukPeriode:rows.reduce((n,x)=>n+x.masuk,0),keluarPeriode:rows.reduce((n,x)=>n+x.keluar,0),
   selisihPeriode:rows.reduce((n,x)=>n+x.masuk-x.keluar,0),
   bulanan:[...grouped.values()].sort((a,b)=>a.periode.localeCompare(b.periode)),
   rincian:rows.map(x=>({...x,jenis:x.keterangan||x.jenis})),
   kasMilikBankRp:eligible.filter(x=>['operasional','cadangan'].includes((0,__f4.globals.String)(x.pos||'').toLowerCase())).reduce((n,x)=>n+x.masuk-x.keluar,0),
   kasLingkunganRp:eligible.filter(x=>(0,__f4.globals.String)(x.pos||'').toLowerCase()==='kas_lorong').reduce((n,x)=>n+x.masuk-x.keluar,0),
   transaksi:rows.length,periode:month||'semua',catatan:'Riwayat arus kas, bukan saldo akhir'};
 };
 // Nama dan rumah berasal dari data anggota, bukan kode internal ledger.
 const memberIdKey=id=>(0,__f4.globals.String)(id??'').trim().replace(/^member:/i,'');
 const cleanMemberName=value=>(0,__f4.globals.String)(value??'').replace(/\s*\(\s*member:[^)]+\)\s*/gi,' ').trim();
 const adminReport=async(_token,period='',includeCanceled=false)=>{
  const [deposits,sales,expenses,cash,ledger,members,catalog]=await __f4.globals.Promise.all([
    adminDeposits(),adminSales(),adminExpenses(),adminCash(),adminRows('ledger'),adminMembers(),adminRows('catalog')]);
  if([deposits,sales,expenses,cash,ledger,members,catalog].some(x=>x.length>=300))
   throw (0,__f4.globals.Error)('Laporan melebihi batas 300 baris per buku. Unduh dihentikan agar tidak ada nilai terpotong.');
  const byMember=new __f4.globals.Map(members.map(m=>[memberIdKey(m.wargaId),m]));
  const wargaLabel=(rawId,fallbackName='',fallbackHouse='')=>{
   const found=byMember.get(memberIdKey(rawId));
   const candidate=cleanMemberName(found?.nama||fallbackName);
   const name=candidate&&!/^(?:member:)?[a-z]*\d+$/i.test(candidate)?candidate:'Nama warga belum tersedia';
   const house=(0,__f4.globals.String)(found?.rumah||fallbackHouse||'').trim();
   return name+(house?' • '+house:'');
  };
  const month=(0,__f4.globals.String)(period||'').match(/^\d{4}-\d{2}$/)?.[0]||'';
  const scope=records=>records.filter(x=>!month||(0,__f4.globals.String)(x.tanggal||'').startsWith(month));
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
  const withdrawals=transactions.filter(x=>x.jenis==='pencairan');
  // Hak warga periode mengikuti penjualan yang MASIH aktif, bukan tanggal
  // pembatalan. Koreksi lintas bulan tidak boleh membuat hak warga minus.
  const liveBatches=new __f4.globals.Set(confirmedSales.map(x=>(0,__f4.globals.String)(x.batchId||'')));
  const liveCredits=ledger.filter(x=>liveBatches.has((0,__f4.globals.String)(x.batch_id||''))&&
    ['kredit','koreksi_kredit'].includes(x.kind));
  const liveReversals=ledger.filter(x=>liveBatches.has((0,__f4.globals.String)(x.batch_id||''))&&x.kind==='koreksi_debit');
  const hakWargaDikredit=liveCredits.reduce((n,x)=>n+number(x.amount_rp),0)-
    liveReversals.reduce((n,x)=>n+number(x.amount_rp),0);
  // Kolom setoran berasal dari SETIAP jenis barang pada katalog D1,
  // bukan empat kategori. Setiap kolom hanya menyimpan berat timbang (kg).
  const byItemId=new __f4.globals.Map(catalog.map(item=>[(0,__f4.globals.String)(item.id||''),item]));
  const byItemName=new __f4.globals.Map(catalog.map(item=>[(0,__f4.globals.String)(item.name||'').trim().toLowerCase(),item]));
  const {kodeBarang,codeByItem}=bankWasteCodes(catalog);
  const details=[];
  for(let start=0;start<depositRows.length;start+=12){
    details.push(...await __f4.globals.Promise.all(depositRows.slice(start,start+12).map(async x=>{
      const r=await get('/api/v2/admin/bank/deposit-detail?id='+(0,__f4.globals.encodeURIComponent)(x.id));
      if(!__f4.globals.Array.isArray(r.lines)||!r.lines.length)
        throw (0,__f4.globals.Error)('Rincian jenis sampah untuk setoran '+x.id+' belum lengkap.');
      const weight=r.lines.reduce((n,item)=>n+number(item.grams),0)/1000;
      if(__f4.globals.Math.abs(weight-number(x.beratTimbang))>0.002)
        throw (0,__f4.globals.Error)('Berat barang setoran '+x.id+' tidak sesuai hasil timbang.');
      const itemWeights={};
      for(const line of r.lines){
        const id=(0,__f4.globals.String)(line.waste_item_id||''),name=(0,__f4.globals.String)(line.name||'').trim();
        const item=byItemId.get(id)||byItemName.get(name.toLowerCase());
        if(!item)throw (0,__f4.globals.Error)('Jenis sampah "'+name+'" belum terhubung ke katalog. Periksa data sebelum mencetak.');
        const code=codeByItem.get((0,__f4.globals.String)(item.id||''));
        if(!code)throw (0,__f4.globals.Error)('Kode barang '+name+' tidak tersedia.');
        const kg=number(line.grams)/1000;
        if(!__f4.globals.Number.isFinite(kg)||kg<=0)throw (0,__f4.globals.Error)('Berat barang setoran '+x.id+' tidak valid.');
        const field='item_'+code;
        itemWeights[field]=(itemWeights[field]||0)+kg;
      }
      return {id:x.id,tanggal:x.tanggal,warga:wargaLabel(x.wargaId,x.namaWarga,x.rumahWarga),
        ...itemWeights,total:weight};
    })));
  }
  details.forEach((row,index)=>{row.no=index+1;});
  return {
   periode:month||'semua',
   ringkasan:{jumlahSetoran:depositRows.filter(x=>x.status!=='Dibatalkan').length,jumlahSetoranTerjual:confirmedDeposits.length,jumlahSetoranTersedia:waitingDeposits.length,jumlahPenjualan:confirmedSales.length,
    estimasi:waitingDeposits.reduce((n,x)=>n+x.estimasi,0),
    belumSah:waitingDeposits.length,
    hasilSahSetoran:confirmedDeposits.filter(x=>x.nilaiSahRp!==null).reduce((n,x)=>n+x.nilaiSahRp,0),
    nilaiSahBelumTersedia:confirmedDeposits.some(x=>x.nilaiSahRp===null),
    diterima:confirmedSales.reduce((n,x)=>n+x.diterima,0),
    hakWargaDikredit,
    tabunganDicairkan:withdrawals.reduce((n,x)=>n+x.nominal,0),
    biaya:paidExpenses.reduce((n,x)=>n+x.nominal,0),
    saldoKasKini:activeCash.reduce((n,x)=>n+x.masuk-x.keluar,0)},
   setoran:details,kodeBarang,
   penjualan:saleRows.map(x=>({id:x.id,tanggal:x.tanggal,batch:x.batchId,lapak:x.lapak,bruto:x.bruto,
    diterima:x.diterima,disahkan:x.status==='Terkonfirmasi',status:x.status,
    hakWarga:x.status==='Terkonfirmasi'?
      liveCredits.filter(j=>(0,__f4.globals.String)(j.batch_id)===(0,__f4.globals.String)(x.batchId)).reduce((n,j)=>n+number(j.amount_rp),0)-
      liveReversals.filter(j=>(0,__f4.globals.String)(j.batch_id)===(0,__f4.globals.String)(x.batchId)).reduce((n,j)=>n+number(j.amount_rp),0):0})),
   pengeluaran:expenseRows.map(x=>({id:x.id,tanggal:x.tanggal,jenis:x.jenis,keterangan:x.keterangan,
    pos:x.pos,nominal:x.nominal,status:x.status})),
   mutasi:transactions.map(x=>({id:x.id,tanggal:x.tanggal,warga:x.warga,
    jenis:x.jenis==='kredit'?'Hak warga dari penjualan':x.jenis==='pencairan'?'Pencairan':
      x.jenis==='koreksi_debit'?'Koreksi batal':
      x.jenis==='koreksi_kredit'?'Koreksi penambahan hak':x.jenis,
    kredit:x.jenis==='kredit'?x.nominal:0,
    debit:x.jenis==='pencairan'?x.nominal:0,
    koreksi:x.jenis==='koreksi_debit'?-x.nominal:x.jenis==='koreksi_kredit'?x.nominal:0}))
  };
 };
 // Standalone admin print: one member, all weighing sessions from D1.
 // Does not read unrelated cash, sales or ledger information.
 const adminMemberDepositReport=async(_token,requestedId)=>{
  const memberId=memberIdKey(requestedId);
  if(!memberId)throw (0,__f4.globals.Error)('Pilih warga terlebih dahulu.');
  const [members,deposits,catalog]=await __f4.globals.Promise.all([
    adminMembers(),adminDeposits(),adminRows('catalog')
  ]);
  if([members,deposits,catalog].some(rows=>rows.length>=300))
    throw (0,__f4.globals.Error)('Data lebih dari 300 baris; laporan per warga dihentikan agar tidak terpotong.');
  const member=members.find(row=>memberIdKey(row.wargaId)===memberId);
  if(!member)throw (0,__f4.globals.Error)('Anggota tidak ditemukan atau tidak dapat diakses.');
  const selected=deposits.filter(row=>
    memberIdKey(row.wargaId)===memberId&&row.status!=='Dibatalkan'
  ).sort((a,b)=>(0,__f4.globals.String)(a.tanggal||'').localeCompare((0,__f4.globals.String)(b.tanggal||'')));
  const byId=new __f4.globals.Map(catalog.map(x=>[(0,__f4.globals.String)(x.id||''),x]));
  const byName=new __f4.globals.Map(catalog.map(x=>[(0,__f4.globals.String)(x.name||'').trim().toLowerCase(),x]));
  const {kodeBarang,codeByItem}=bankWasteCodes(catalog);
  const setoran=[];
  for(let start=0;start<selected.length;start+=12){
    setoran.push(...await __f4.globals.Promise.all(selected.slice(start,start+12).map(async deposit=>{
      const result=await get('/api/v2/admin/bank/deposit-detail?id='+(0,__f4.globals.encodeURIComponent)(deposit.id));
      if(!__f4.globals.Array.isArray(result.lines)||!result.lines.length)
        throw (0,__f4.globals.Error)('Rincian barang setoran '+deposit.id+' belum tersedia.');
      const weights={};
      const total=result.lines.reduce((sum,line)=>sum+number(line.grams),0)/1000;
      if(__f4.globals.Math.abs(total-number(deposit.beratTimbang))>0.002)
        throw (0,__f4.globals.Error)('Berat rincian setoran '+deposit.id+' tidak sesuai catatan timbang.');
      for(const line of result.lines){
        const item=byId.get((0,__f4.globals.String)(line.waste_item_id||''))||
          byName.get((0,__f4.globals.String)(line.name||'').trim().toLowerCase());
        const code=codeByItem.get((0,__f4.globals.String)(item?.id||''));
        if(!code)throw (0,__f4.globals.Error)('Kode barang '+(0,__f4.globals.String)(line.name||'')+' tidak tersedia.');
        const kg=number(line.grams)/1000;
        if(kg<=0)throw (0,__f4.globals.Error)('Berat jenis barang pada setoran '+deposit.id+' tidak valid.');
        const key='item_'+code;weights[key]=(weights[key]||0)+kg;
      }
      return {id:deposit.id,wargaId:memberId,tanggal:(0,__f4.globals.String)(deposit.tanggal||''),
        ...weights,total};
    })));
  }
  return {wargaId:memberId,nama:cleanMemberName(member.nama),rumah:(0,__f4.globals.String)(member.rumah||''),
    setoran,kodeBarang,jumlahSetoran:setoran.length,
    totalBeratKg:setoran.reduce((sum,row)=>sum+row.total,0)};
 };
 const bankAdminAccounts=async()=>{
   // The accounts preview does not include a photo flag. Join its member IDs
   // to the bank member register, which derives hasAvatar from saved R2 photos.
   let list;
   try {
     const response=await get('/api/superadmin/accounts/preview');
     list=__f4.globals.Array.isArray(response.akun)?response.akun:__f4.globals.Array.isArray(response.accounts)?response.accounts:onlyArray(response);
   } catch(error) {
     // Preserve the original fallback; bank members already carry hasAvatar.
     return adminMembers().then(members=>members.map(x=>({...x,akunId:'',username:'',status:x.status})));
   }
   const avatarById=new __f4.globals.Map(),rankById=new __f4.globals.Map();
   // Neither optional avatar nor rank services may block access to account management.
   const [memberResult,rankResult]=await __f4.globals.Promise.allSettled([
     adminMembers(),get('/api/v2/bank/activity-ranking')
   ]);
   if(memberResult.status==='fulfilled'){
     for(const member of memberResult.value){
       const id=(0,__f4.globals.String)(member.wargaId||'').trim().replace(/^member:/i,'');
       if(id)avatarById.set(id,member.hasAvatar===true);
     }
   }else __f4.globals.console.warn('Status foto anggota belum dapat dibaca:',memberResult.reason);
   if(rankResult.status==='fulfilled'){
     for(const entry of __f4.globals.Array.isArray(rankResult.value.top)?rankResult.value.top:[]){
       const id=(0,__f4.globals.String)(entry.memberId||'').trim().replace(/^member:/i,'');
       if(id&&[1,2,3].includes((0,__f4.globals.Number)(entry.rank)))
         rankById.set(id,(0,__f4.globals.Number)(entry.rank));
     }
   }
   return list.filter(x=>!['superadmin','admin'].includes((0,__f4.globals.String)(x.role||'').toLowerCase())).map(x=>{
     const status=(0,__f4.globals.String)(x.status||(!x.perluAktivasi?'Aktif':'Belum Aktif'));
     const id=(0,__f4.globals.String)(x.wargaId||x.member_id||x.payerId||'').trim().replace(/^member:/i,'');
     return {
       akunId:(0,__f4.globals.String)(x.id||x.accountId||x.akunId||''),
       wargaId:id,
       nama:(0,__f4.globals.String)(x.nama||x.name||x.username||''),
       rumah:(0,__f4.globals.String)(x.rumah||x.house||''),
       username:(0,__f4.globals.String)(x.username||''),
       status:/^(aktif|active)$/i.test(status)?'Aktif':status,
       aktif:/^(aktif|active)$/i.test(status),
       hasAvatar:avatarById.get(id)===true,
       activityRank:rankById.get(id)||null
     };
   });
 };
 const memberAvatar=async()=>{
   const r=await (0,__f4.globals.fetch)(API+'/api/member/avatar',{credentials:'include',cache:'no-store'});
   if(r.status===404)return {ada:false,data:''};
   if(!r.ok)throw (0,__f4.globals.Error)('Foto profil tidak dapat dibaca (HTTP '+r.status+').');
   const blob=await r.blob();
   const data=await new __f4.globals.Promise((resolve,reject)=>{const reader=new __f4.globals.FileReader();reader.onload=()=>resolve((0,__f4.globals.String)(reader.result||''));reader.onerror=()=>reject((0,__f4.globals.Error)('Foto gagal diproses'));reader.readAsDataURL(blob)});
   return {ada:true,data};
 };
 const saveMemberAvatar=async(_token,encoded)=>{
   if(!/^[A-Za-z0-9+/=]+$/.test((0,__f4.globals.String)(encoded||'')))throw (0,__f4.globals.Error)('Format gambar tidak valid.');
   const bytes=__f4.globals.Uint8Array.from((0,__f4.globals.atob)(encoded),x=>x.charCodeAt(0));
   if(bytes.length>2*1024*1024)throw (0,__f4.globals.Error)('Foto melebihi 2 MB.');
   const response=await (0,__f4.globals.fetch)(API+'/api/member/avatar',{method:'POST',credentials:'include',headers:{'content-type':'image/jpeg'},body:bytes});
   const result=await response.json().catch(()=>({}));
   if(!response.ok||result.ok===false)throw (0,__f4.globals.Error)(result.error||'Upload foto ditolak (HTTP '+response.status+').');
   return {ok:true};
 };
 const changePassword=async(_token,currentPassword,newPassword)=>{
   if(!currentPassword||(0,__f4.globals.String)(newPassword||'').length<4)throw (0,__f4.globals.Error)('Isi password sekarang dan password baru minimal 4 karakter.');
   const r=await (0,__f4.globals.fetch)(API+'/api/auth/change-password',{method:'POST',credentials:'include',
     headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify({currentPassword,newPassword})});
   const data=await r.json().catch(()=>({}));
   if(!r.ok||data.ok===false)throw (0,__f4.globals.Error)(data.error||'Gagal mengganti password (HTTP '+r.status+').');
   __f4.window.parent.postMessage({type:'f4:auth-changed'},__f4.globals.location.origin);
   return {berhasil:true,pesan:'Password berhasil diganti. Silakan login kembali.'};
 };
 const detailsBank=async(_token,id,kind)=>{
  if(!(0,__f4.globals.String)(id||'').trim())throw (0,__f4.globals.Error)('Pilih transaksi yang ingin dilihat.');
  const url=kind==='deposit'?'/api/v2/admin/bank/deposit-detail?id=':'/api/v2/admin/bank/sale-detail?id=';
  const result=await get(url+(0,__f4.globals.encodeURIComponent)(id));
  return onlyArray(result.lines).map(x=>({
   barang:x.name||x.item_name||'',berat:number(x.grams)/1000,
   tarif:number(x.priceRpPerKg),harga:number(x.priceRpPerKg),
   nilai:number(x.estimated_rp??x.total_rp??0)
  }));
 };
 const finalBatches=async()=>{
  const [alloc,batches]=await __f4.globals.Promise.all([adminRows('allocations'),adminBatches()]);
  const byId=new __f4.globals.Map(batches.map(x=>[x.id,x]));
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
  bsV37DaftarAnggotaLaporan:adminMembers,
  bsV37LaporanSetoranPerWarga:adminMemberDepositReport,
  bsV9StatusKasAdmin:async()=>{
   const [cash,sales,allocations]=await __f4.globals.Promise.all([adminRows('cash'),adminRows('sales'),adminRows('allocations')]);
   if([cash,sales,allocations].some(r=>r.length>=300))throw (0,__f4.globals.Error)('Riwayat mencapai batas 300 baris. Ringkasan dihentikan agar saldo tidak salah.');
   const active=cash.filter(r=>r.status==='aktif');
   const balance=active.reduce((v,r)=>v+number(r.cash_in_rp)-number(r.cash_out_rp),0);
   const allocated=new __f4.globals.Set(allocations.map(r=>(0,__f4.globals.String)(r.batch_id)));
   const pending=sales.filter(r=>r.status==='terkonfirmasi'&&!allocated.has((0,__f4.globals.String)(r.batch_id))).map(r=>({batch:(0,__f4.globals.String)(r.batch_id),penjualan:(0,__f4.globals.String)(r.id)}));
   const byFund=new __f4.globals.Map();
   for(const row of active){
     const pos=(0,__f4.globals.String)(row.fund_position||"").trim().toLowerCase();
     byFund.set(pos,(byFund.get(pos)||0)+number(row.cash_in_rp)-number(row.cash_out_rp));
   }
   return {saldoKasTercatat:balance,batchBelumDiposting:pending,kasGabungan:balance,
     kasMilikBankRp:(byFund.get("operasional")||0)+(byFund.get("cadangan")||0),
     kasLingkunganRp:byFund.get("kas_lorong")||0,
     kasHakWargaDitampungRp:byFund.get("tabungan_warga")||0};
  },
  bsV10KasPosAdmin:async()=>{
   const cash=await adminRows('cash');
   if(cash.length>=300)throw (0,__f4.globals.Error)('Buku kas mencapai 300 baris. Tidak aman menghitung saldo dari daftar terpotong.');
   const active=cash.filter(r=>r.status==='aktif'),byFund=new __f4.globals.Map();
   for(const r of active){const key=(0,__f4.globals.String)(r.fund_position||'').trim();if(!key)throw (0,__f4.globals.Error)('Ada transaksi aktif tanpa pos dana; periksa buku kas.');byFund.set(key,(byFund.get(key)||0)+number(r.cash_in_rp)-number(r.cash_out_rp));}
   const titles={operasional:'Operasional',kas_lorong:'Kas Lorong',cadangan:'Cadangan',tabungan_warga:'Tabungan Warga'};
   const keys=[...new __f4.globals.Set([...__f4.globals.Object.keys(titles),...byFund.keys()])];
   return {kasGabungan:[...byFund.values()].reduce((sum,v)=>sum+v,0),pos:keys.map(key=>({kode:key,nama:titles[key]||key,tersedia:byFund.get(key)||0}))};
  },
  bsV32DetailSetoran:editDepositDetail,
  bsV6SetoranAdmin:adminDepositsWithAvatars,
  bsV18RiwayatSetoranAdmin:adminDepositsWithAvatars,
  bsV7PenjualanAdmin:adminSales,
  bsV6BatchAdmin:adminBatches,
  bsV11PublicHome:home,
  bsV11PublicAlbums:albumList,
  bsV25LaporanPublik:report,
  bsV12Statement:memberSavings,
  bsDashboardMasterBarang:async()=>{
   const r=await get('/api/v2/admin/bank/catalog');
   return onlyArray(r).map(item=>({kode:item.code||item.kode||(0,__f4.globals.String)(item.id||'').replace(/^waste:/,''),
    nama:item.name||item.nama,kelompok:itemCategory(item.name||item.nama,item.category||item.kelompok),
    acuan:number(item.reference_price_rp??item.acuan??number(item.priceRpPerKg)*2),
    tarif:number(item.priceRpPerKg??item.tarif),
    status:item.active===false?'Nonaktif':'Aktif'}));
  }
 };
 __f4.window.__f4BankDemoCall=(name,args=[])=>{
  if(__f4.globals.Object.hasOwn(read,name))return read[name](...args);
  // Other legacy read flows are not yet mapped. Do not silently fake balances or writes.
  if(name.startsWith('bs')&&/Tambah|Simpan|Hapus|Batalkan|Update|Bayar|Posting|Setujui|Ubah|Tutup/i.test(name))
   return __f4.globals.Promise.reject((0,__f4.globals.Error)('Penyimpanan belum diaktifkan. Perlu endpoint Worker yang tervalidasi.'));
  // Jangan pernah menggunakan fallback data simulasi dari versi prototipe sebagai transaksi resmi.
  return __f4.globals.Promise.reject((0,__f4.globals.Error)('Fungsi '+name+' dari Bank Sampah asli belum memiliki endpoint Cloudflare yang terhubung. Tidak ada data yang diubah.'));
 };
})();
});
