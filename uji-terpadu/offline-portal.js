(()=>{'use strict';
 // Shim Firebase untuk mencegah sambungan database saat menampilkan struktur.
 const emptyRef={limitToLast(){return this},on(event,cb){if(event==='value')queueMicrotask(()=>cb({val:()=>null}))},push(){window.__f4DemoNotify('Komentar tidak disimpan di mode struktur.');return Promise.reject(Error('Mode demo'))}};
 window.firebase={apps:[],initializeApp(){this.apps.push({});},database(){return {ref(){return emptyRef}}}};
 window.firebase.database.ServerValue={TIMESTAMP:0};
 // Data ilustrasi hanya untuk membuktikan struktur asli tanpa Google Sheets.
 const arisan=[
   {'Bulan':'Oktober 2026','Tuan Rumah':'Pak Cahyo A6/02','Status':'Sudah'},
   {'Bulan':'November 2026','Tuan Rumah':'Pak Heri (Zul) A5/30','Status':'Belum'},
   {'Bulan':'Desember 2026','Tuan Rumah':'Contoh Tuan Rumah','Status':'Belum'}
 ];
 const projectCSV=[
  'Urutan,Nama Projek,Jenis,Status,Tampil,Link',
  '1,Bank Sampah Lorong,Bank Sampah,Aktif,YA,',
  '2,Gapura,Gapura,Penggalangan Dana,YA,',
  '3,Pemesanan Jersey,Jersey,Tahap DP,YA,'
 ].join('\n');
 const progresCSV=[
  'Tanggal,Langkah,Judul,Deskripsi,Status,Tahap Detail,Agenda Berikut,Foto',
  '11 Oktober 2026,Langkah 1,Pembersihan & Persiapan Drop Point,Pengelolaan sampah anorganik terpilah untuk kas tambahan warga.,Selesai,Pembersihan lokasi,Pembuatan wadah,',
  '21 Oktober 2026,Langkah 2,Pembuatan Wadah Drop Point,Membuat tempat untuk menampung sampah sebelum ditimbang.,Proses,Pembuatan wadah,Membuat mekanisme dan administrasi,'
 ].join('\n');
 const baseFetch=window.fetch.bind(window);
 window.fetch=(input,init)=>{
  const u=String(typeof input==='string'?input:input?.url||'');
  const sample=u.includes('gid=40982005')?projectCSV:u.includes('gid=315371679')?progresCSV:null;
  if(sample!==null)return Promise.resolve(new Response(sample,{status:200,headers:{'content-type':'text/csv; charset=utf-8'}}));
  return baseFetch(input,init);
 };
 if(window.Papa?.parse){
  const original=window.Papa.parse.bind(window.Papa);
  window.Papa.parse=(data,opt={})=>{
   if(typeof data==='string'&&data.includes('gid=53284271')){ queueMicrotask(()=>opt.complete?.({data:arisan,errors:[],meta:{fields:Object.keys(arisan[0])}}));return {abort(){}}; }
   if(typeof data==='string'&&/docs\.google\.com|output=csv/.test(data)){
     queueMicrotask(()=>opt.complete?.({data:[],errors:[],meta:{fields:[]}}));return {abort(){}};
   }
   return original(data,opt);
  };
 }
})();