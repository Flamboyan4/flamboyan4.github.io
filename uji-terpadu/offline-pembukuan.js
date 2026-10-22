(()=>{'use strict';
  const now='2026-10-22',sampleHomes=Array.from({length:44},(_,i)=>{
    const a=i<22,number=a?23+i:i-21,block=a?'A5':'A6';
    return {idRumah:'demo-r'+(i+1),noUrut:i+1,blok:block,noRumah:String(number).padStart(2,'0'),statusRumah:i%12===0?'Kosong':'Dihuni',tipeUnit:'Rumah Tinggal',namaPemilik:'Contoh pemilik',keterangan:'DATA CONTOH'}});
  const sampleResidents=sampleHomes.slice(0,34).map((r,i)=>({
    idWarga:'DEMO-W'+String(i+1).padStart(3,'0'),idRumah:r.idRumah,noUrutRumah:r.noUrut,
    nama:'Contoh Warga '+(i+1),blok:r.blok,noRumah:r.noRumah,statusTinggal:'Tetap',statusAktif:'Aktif',
    qtyIuranBulanan:i===0?0:1,qtyKebersihan:i<2?0:1,qtyKasLorong:i===0?0:1,qtyArisan:i<8?0:1,keterangan:'DATA CONTOH'
  }));
  const config={TARIF_BULANAN:25000,TARIF_KEBERSIHAN:20000,TARIF_KAS_LORONG:10000,TARIF_ARISAN:60000,TANGGAL_SETOR_RT:10,BATAS_PERIODE_KAS:25};
  window.__f4BookDemoCall=async(p)=>{
    const a=String(p.action||'');
    const forbidden=['simpan','bayar','buat','batalkan','hapus','edit','update','koreksi','tutup','import','sinkron','pulihkan'];
    if(forbidden.some(x=>a.startsWith(x))){
      window.__f4DemoNotify('Aksi '+a+' tidak dijalankan dalam pratinjau.');
      return {status:'error',message:'Mode demo: transaksi tidak disimpan.'};
    }
    if(a==='bootstrap')return {status:'success',version:'PRATINJAU TANPA BACKEND',config,rumah:sampleHomes,warga:sampleResidents};
    if(a==='datapembukuankas')return {status:'success',data:{belum:[],sudah:[],batches:[],ringkasan:{qtyBelum:0,nominalBelum:0,qtySudah:0,nominalSudah:0}},namaBulan:'Oktober',tahun:2026};
    if(a==='riwayatpembayaran')return {status:'success',data:[]};
    if(a==='datatransaksikas')return {status:'success',data:[]};
    if(a==='datapinjaman')return {status:'success',data:{rows:[],aktif:[],ringkasan:{}}};
    if(a==='datatalangan')return {status:'success',data:[]};
    if(a==='datadenda')return {status:'success',data:[]};
    if(a==='kekurangankas')return {status:'success',data:[]};
    if(a==='iuranquicksummary')return {status:'success',data:[],ringkasan:{}};
    if(a==='statustahun')return {status:'success',data:[],locked:false};
    if(a==='arsiptahunan'||a==='detailarsip')return {status:'success',data:[]};
    if(a.startsWith('laporan'))return {status:'success',data:{tahun:2026,rows:[],ringkasan:{},bisaDitutup:false},rows:[],ringkasan:{},tahun:2026,bisaDitutup:false};
    return {status:'success',data:[],rows:[],ringkasan:{}};
  };
})();