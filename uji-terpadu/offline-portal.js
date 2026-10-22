(()=>{'use strict';
 // Shim Firebase untuk mencegah sambungan database saat menampilkan struktur.
 const emptyRef={limitToLast(){return this},on(event,cb){if(event==='value')queueMicrotask(()=>cb({val:()=>null}))},push(){window.__f4DemoNotify('Komentar tidak disimpan di mode struktur.');return Promise.reject(Error('Mode demo'))}};
 window.firebase={apps:[],initializeApp(){this.apps.push({});},database(){return {ref(){return emptyRef}}}};
 window.firebase.database.ServerValue={TIMESTAMP:0};

 // Snapshot lengkap 26 baris dari sumber asli tab Arisan (Data Untuk WEB), dibekukan untuk uji offline.
 const arisan=[
   {
     "BULAN": "Desember 2025",
     "NAMA & BLOK": "Pak Wawan A5/26",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "Januari 2026",
     "NAMA & BLOK": "Pak Riadu A5/35",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "Februari 2026",
     "NAMA & BLOK": "Pak Heri (Hasbi) A6/09",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "Maret 2026",
     "NAMA & BLOK": "Pak Umar A5/25",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "April 2026",
     "NAMA & BLOK": "Pak Nizar A6/22",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "Mei 2026",
     "NAMA & BLOK": "Pak Samdoni A5/31",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "Juni 2026",
     "NAMA & BLOK": "Pak Eko (Ghifa) A6/14",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "Juli 2026",
     "NAMA & BLOK": "Pak Nafri A6/18",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "Agustus 2026",
     "NAMA & BLOK": "Pak Saepul A5/34",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "September 2026",
     "NAMA & BLOK": "Pak Ipan A5/28",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "Oktober 2026",
     "NAMA & BLOK": "Pak Cahyo A6/02",
     "STATUS": "Sudah"
   },
   {
     "BULAN": "November 2026",
     "NAMA & BLOK": "Pak Heri (Zul) A5/30",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Desember 2026",
     "NAMA & BLOK": "Pak Wahyu A5/24",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Januari 2027",
     "NAMA & BLOK": "Pak Abdul A6/04",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Februari 2027",
     "NAMA & BLOK": "Pak Aksi A6/01",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Maret 2027",
     "NAMA & BLOK": "Pak Adit A5/39",
     "STATUS": "Belum"
   },
   {
     "BULAN": "April 2027",
     "NAMA & BLOK": "Pak Eko (Hana) A6/07",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Mei 2027",
     "NAMA & BLOK": "Pak Heri (Raisa) A5/38",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Juni 2027",
     "NAMA & BLOK": "Pak Amir A6/15",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Juli 2027",
     "NAMA & BLOK": "Pak Agus A6/17",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Agustus 2027",
     "NAMA & BLOK": "Pak Kasmali A5/44",
     "STATUS": "Belum"
   },
   {
     "BULAN": "September 2027",
     "NAMA & BLOK": "Pak Moyo A5/27",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Oktober 2027",
     "NAMA & BLOK": "Pak Heri (Ali) A5/41",
     "STATUS": "Belum"
   },
   {
     "BULAN": "November 2027",
     "NAMA & BLOK": "Pak Riyan A5/40",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Desember 2027",
     "NAMA & BLOK": "Pak Roni A6/05",
     "STATUS": "Belum"
   },
   {
     "BULAN": "Januari 2028",
     "NAMA & BLOK": "Pak Sutarji A5/36",
     "STATUS": "Belum"
   }
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

 const bannerSvg=(title,subtitle,start,end)=>'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="500" viewBox="0 0 1600 500">'
  +'<defs><linearGradient id="g"><stop stop-color="'+start+'"/><stop offset="1" stop-color="'+end+'"/></linearGradient></defs>'
  +'<rect width="1600" height="500" fill="url(#g)"/><circle cx="1360" cy="125" r="285" fill="#fff" opacity=".09"/>'
  +'<circle cx="1540" cy="435" r="230" fill="#fff" opacity=".10"/>'
  +'<path d="M940 420 Q1200 200 1640 360" fill="none" stroke="#fff" stroke-width="22" opacity=".10"/>'
  +'<text x="105" y="116" font-family="Arial,sans-serif" font-size="23" fill="#efe9ff" font-weight="700">FLAMBOYAN 4 · BANNER CONTOH</text>'
  +'<text x="105" y="237" font-family="Arial,sans-serif" font-size="61" fill="#ffffff" font-weight="800">'+title+'</text>'
  +'<text x="107" y="295" font-family="Arial,sans-serif" font-size="29" fill="#f0ecff">'+subtitle+'</text>'
  +'<rect x="107" y="357" rx="18" width="255" height="50" fill="#ffffff" opacity=".18"/>'
  +'<text x="134" y="391" font-family="Arial,sans-serif" font-size="21" fill="#fff" font-weight="700">PRATINJAU OFFLINE</text>'
  +'</svg>');
 const bannerRows=[
   {'Urutan':'1','Link Foto':bannerSvg('Portal Warga Flamboyan 4','Informasi, kegiatan dan transparansi warga','#4d45b3','#8871d6'),'Link Tujuan':'#projek'},
   {'Urutan':'2','Link Foto':bannerSvg('Kegiatan dan Gotong Royong','Bersama membangun lingkungan Flamboyan 4','#225c83','#55aabb'),'Link Tujuan':'#kegiatan'}
 ];
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
   if(typeof data==='string'&&data.includes('gid=780113187')){queueMicrotask(()=>opt.complete?.({data:bannerRows,errors:[],meta:{fields:Object.keys(bannerRows[0])}}));return {abort(){}};}
   if(typeof data==='string'&&data.includes('gid=53284271')){ queueMicrotask(()=>opt.complete?.({data:arisan,errors:[],meta:{fields:Object.keys(arisan[0])}}));return {abort(){}}; }
   if(typeof data==='string'&&/docs\.google\.com|output=csv/.test(data)){
     queueMicrotask(()=>opt.complete?.({data:[],errors:[],meta:{fields:[]}}));return {abort(){}};
   }
   return original(data,opt);
  };
 }
})();