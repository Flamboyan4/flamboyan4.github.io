(()=>{'use strict';if(!window.Papa?.parse)return;const old=Papa.parse.bind(Papa);
 Papa.parse=(source,options={})=>{
  if(typeof source==='string'&&source.includes('gid=449852491')){
   const rows=[{'Tanggal':'11 Oktober 2026','Judul':'Contoh Notulensi Rapat Warga','Deskripsi':'Data ilustrasi untuk memeriksa struktur kartu dan navigasi.','Foto':'','Dokumen':''}];
   queueMicrotask(()=>options.complete?.({data:rows,errors:[],meta:{fields:Object.keys(rows[0])}}));return {abort(){}};
  }
  return old(source,options);
 };
})();