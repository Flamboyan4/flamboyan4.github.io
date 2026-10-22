/* Live data bridge for ORIGINAL Bank Sampah UI. Reads only existing Cloudflare endpoints. */
(()=>{'use strict';
 const API='https://api.flamboyan4.web.id';
 const original=window.__f4BankDemoCall;
 const onlyArray=(data)=>Array.isArray(data)?data:Array.isArray(data?.rows)?data.rows:Array.isArray(data?.items)?data.items:Array.isArray(data?.data)?data.data:[];
 const number=(value)=>Number.isFinite(Number(value))?Number(value):0;
 async function get(path){
  const response=await fetch(API+path,{credentials:'include',mode:'cors',cache:'no-store'});
  const result=await response.json().catch(()=>{throw Error('API Cloudflare tidak mengirim JSON.')});
  if(!response.ok||result?.ok===false)throw Error(result?.error||'Gagal membaca Cloudflare D1 (HTTP '+response.status+').');
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
 const albums=items=>onlyArray(items).map(item=>({
  id:item.id||item.albumId,
  judul:item.judul||item.title||'Album',
  tanggal:item.tanggal||item.event_on||'',
  deskripsi:item.deskripsi||item.description||'',
  sampul:item.sampul||item.coverUrl||item.imageUrl||'',
  kategori:item.kategori||item.category||'',
  media:[]
 }));
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
  await Promise.all(list.slice(0,12).map(async item=>{
   if(!item.id)return;
   try{
    const d=await get('/api/v2/public/bank/album/'+encodeURIComponent(item.id));
    item.media=onlyArray(d.media).map(x=>({
     caption:x.caption||x.title||'',jenis:x.media_type||x.type||'foto',
     url:x.mediaUrl||x.external_url||x.url||''
    }));
   }catch{}
  }));
  return list;
 }
 async function report(period){
  const q=period&&period!=='semua'?'?month='+encodeURIComponent(period):'';
  const r=await get('/api/v2/public/bank/report'+q);
  const sum=r.summary||r.ringkasan||{};
  const sale=r.sales||{},cash=r.cash||{},expense=r.expenses||{};
  if(!('sales'in r||'summary'in r||'ringkasan'in r))
   throw Error('Format laporan D1 belum memiliki ringkasan yang dibutuhkan tampilan lama. Data tidak akan direka.');
  const monthly=onlyArray(r.bulanan||r.monthly||r.periods).map(row=>({
   periode:row.periode||row.month||row.period||'',
   beratKg:number(row.beratKg??row.confirmedKg),
   hasilPenjualan:number(row.hasilPenjualan??row.salesRp),
   hakWarga:number(row.hakWarga??row.savingsRp),
   cadangan:number(row.cadangan??row.reserveRp),
   kasLorong:number(row.kasLorong??row.neighborhoodRp),
   operasional:number(row.operasional??row.operationalRp),
   pengeluaran:number(row.pengeluaran??row.expensesRp)
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
    batch:number(sum.batch??r.batches?.length??0)
   },
   bulanan:monthly,periodeTersedia:onlyArray(r.periodeTersedia||[]),
   catatan:'Data dibaca dari Cloudflare D1. Bagian yang belum termigrasi dapat kosong.'
  };
 }
 async function memberSavings(){
  const r=await get('/api/member/savings');
  const records=onlyArray(r.setoran).map(x=>({
   tanggal:x.tanggal||x.deposited_on||'',
   beratKg:number(x.beratKg??number(x.beratGram)/1000),
   nominal:number(x.estimasiRp),
   status:x.status||''
  }));
  return {saldo:number(r.saldoTersediaRp),totalMasuk:number(r.totalMasukRp),totalCair:number(r.totalCairRp),
   mutasi:records,setoran:records};
 }
 const read={
  bsV11PublicHome:home,
  bsV11PublicAlbums:albumList,
  bsV25LaporanPublik:report,
  bsV12Statement:memberSavings,
  bsDashboardMasterBarang:async()=>{
   const r=await get('/api/v2/admin/bank/catalog');
   return onlyArray(r).map(item=>({kode:item.code||item.kode||item.id,
    nama:item.name||item.nama,kelompok:item.category||item.kelompok||'',
    acuan:number(item.reference_price_rp??item.acuan),
    tarif:number(item.priceRpPerKg??item.tarif),
    status:item.active===false?'Nonaktif':'Aktif'}));
  }
 };
 window.__f4BankDemoCall=(name,args=[])=>{
  if(Object.hasOwn(read,name))return read[name](...args);
  // Other legacy read flows are not yet mapped. Do not silently fake balances or writes.
  if(name.startsWith('bs')&&/Tambah|Simpan|Hapus|Batalkan|Update|Bayar|Posting|Setujui|Ubah|Tutup/i.test(name))
   return Promise.reject(Error('Penyimpanan belum diaktifkan. Perlu endpoint Worker yang tervalidasi.'));
  return original(name,args);
 };
})();