(()=>{'use strict';
 const progress=[
  {tanggal:'11 Oktober 2026',judul:'Pembersihan & Persiapan Drop Point',langkah:'Pembersihan',status:'Selesai',deskripsi:'Contoh perkembangan program Bank Sampah',agenda:'Pembuatan wadah',foto:''},
  {tanggal:'11 Oktober 2026',judul:'Pembuatan Wadah Drop Point',langkah:'Pelaksanaan',status:'Selesai',deskripsi:'Contoh dokumentasi kegiatan',agenda:'Pendataan sampah',foto:''}
 ];
 const albums=[{id:'DEMO-A01',albumId:'DEMO-A01',judul:'Contoh Dokumentasi Bank Sampah',tanggal:'11 Oktober 2026',deskripsi:'Album contoh untuk pratinjau struktur',sampul:'',kategori:'Kegiatan',jumlahMedia:0,status:'Aktif',publik:true}];
 const items=[{kode:'BS003',nama:'Kardus',kelompok:'Kertas',hargaAcuan:1500,tarifWarga:1000,status:'Aktif'},{kode:'BS007',nama:'Kaleng',kelompok:'Logam',hargaAcuan:3000,tarifWarga:1500,status:'Aktif'},{kode:'BS008',nama:'Gelas plastik bersih',kelompok:'Plastik',hargaAcuan:2000,tarifWarga:1000,status:'Aktif'}];
 const readOnly={
  bsV11PublicHome:()=>({anggotaAktif:33,jenisBarang:11,beratTerkonfirmasi:0,kegiatan:2,progres:progress,inventaris:[{nama:'Tempat Drop Point',jumlah:'1 unit',kondisi:'Baik',foto:''}]}),
  bsV11PublicAlbums:()=>albums,bsV22AlbumIndexPublik:()=>albums,
  bsV17GrafikPublik:()=>({bulan:[],catatan:'Grafik kosong pada mode pratinjau.'}),
  bsV25LaporanPublik:()=>({bulan:'2026-10',periode:'Oktober 2026',ringkasan:{},setoran:[],penjualan:[],kas:[],grafik:[],catatan:'Data contoh tanpa database'}),
  bsDashboardAdmin:()=>({wargaAktif:33,jenisBarangAktif:11,beratSetoranKg:0,jumlahSetoran:0,estimasiSetoranRp:0,jumlahPenjualan:0,beratPenjualanKg:0,diterimaLapakRp:0,netMutasiTabunganRp:0,netKasRp:0,tarifBelumDitetapkan:0}),
  bsDashboardMasterBarang:()=>items,bsDashboardProgressPublik:()=>progress,
  authAdminAccounts:()=>[],bsV6BatchAdmin:()=>[],bsV8BatchSiap:()=>({setoran:0,penjualan:0,beratSetoran:0,beratLapak:0,hakWarga:0}),
  bsV6SetoranAdmin:()=>[],bsV18RiwayatSetoranAdmin:()=>[],bsV7PenjualanAdmin:()=>[],bsV27FinalAdmin:()=>[],
  bsV9SaldoAdmin:()=>[],bsV9StatusKasAdmin:()=>({kasGabungan:0,belumPosting:0}),bsV9RiwayatPencairan:()=>[],
  bsV10KasPosAdmin:()=>({kasGabungan:0,pos:[]}),bsV10PengeluaranAdmin:()=>[],
  bsV22AlbumAdmin:()=>albums,bsV15FotoSaya:()=>({ada:false}),
  bsV12AksesLaporan:()=>({siap:true}),bsV12Statement:()=>({saldo:0,totalMasuk:0,totalCair:0,mutasi:[],setoran:[]}),
  bsV17RingkasanKasAdmin:()=>({kasTercatat:0,masukPeriode:0,keluarPeriode:0,selisihPeriode:0,bulan:[],rincian:[]}),
  bsV10LaporanAdmin:()=>({periode:'Pratinjau',ringkasan:{jumlahSetoran:0,jumlahPenjualan:0,diterima:0,hakWargaDikredit:0,tabunganDicairkan:0,biaya:0},setoran:[],penjualan:[],pengeluaran:[]}),
  bsV21IsiAlbumPublik:()=>({id:'DEMO-A01',judul:'Contoh Dokumentasi',media:[]}),
  bsV6PratinjauRekonsiliasi:()=>({setoran:0,penjualan:0,beratSetoran:0,beratLapak:0,hakWarga:0,margin:0}),
 };
 window.__f4BankDemoCall=async(name,args)=>{
  if(readOnly[name])return readOnly[name](...args);
  if(name==='authLogout')return {ok:true};
  if(name==='authMe'||name==='authLogin'||name==='authChangePassword'){
   throw Error('Autentikasi pada laman asli digantikan oleh kontrol simulasi akun terpadu di atas.');
  }
  window.__f4DemoNotify('Fungsi '+name+' tidak dijalankan: struktur tanpa database.');
  throw Error('MODE PRATINJAU — penyimpanan, pembatalan, dan pengesahan tidak aktif.');
 };
})();