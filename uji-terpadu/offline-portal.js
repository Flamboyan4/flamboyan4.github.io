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
 // Urutan/status projek yang benar dari tab Project Card.
 const projectCSV="Urutan,Nama Projek,Jenis,Status,Tampil,Link\n1,Bank Sampah Lorong,banksampah,Aktif,YA,/banksampah/\n2,Gapura,gapura,Penggalangan Dana,YA,\n3,Pemesanan Jersey,jersey,Tahap DP,YA,";
 const progresCSV="Tanggal,Langkah,Judul,Deskripsi,Status,Tahap Detail,Agenda Berikut,Foto\n11/10/2026,Pembersihan area pemilahan,Pembersihan & Persiapan Drop Point,Pengelolaan sampah anorganik terpilah untuk kas tambahan warga.,Selesai,,Pembuatan tong/wadah drop point,https://drive.google.com/file/d/1AR1iArLy2iN5cPv5AyPtGwHmyWpWBMTw/view?usp=sharing\n11/10/2026,Pembuatan wadah,Pembuatan Wadah Drop Point,Membuat tempat untuk menampung sampah sebelum nantinya akan dijual,Selesai,,Pembuatan alur dan administrasi,https://drive.google.com/file/d/1jtKd09dMftq1FovXHLs9GOe97a7H4LSF/view?usp=sharing";

 // Snapshot judul/foto/link dari 3 banner asli (bukan ilustrasi), tanpa query database runtime.
 const bannerRows=[
   {
     "Judul Banner": "Iklan Gapura",
     "Link Foto / Drive": "https://drive.google.com/file/d/1B6TIRYqGoNFN7tr78e-yhssvDK71cRRZ/view?usp=sharing",
     "Link Tujuan (Target)": "#gapura"
   },
   {
     "Judul Banner": "Iklan Jersey",
     "Link Foto / Drive": "https://drive.google.com/file/d/1nOxXTLBEFCCYFD_t29ldzIDxpeJFWlZm/view?usp=sharing",
     "Link Tujuan (Target)": "#jersey"
   },
   {
     "Judul Banner": "Iklan Bank Sampah",
     "Link Foto / Drive": "https://drive.google.com/file/d/1DoYOS0C1Evu43mwJEnpohcos-Kj0a0-L/view?usp=sharing",
     "Link Tujuan (Target)": "https://flamboyan4.web.id/banksampah.html"
   }
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