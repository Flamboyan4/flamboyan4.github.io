/**
 * Pembukuan Flamboyan 4: reports and discrepancy drilldown.
 * D1-only / read-only; no writes, cash corrections or automatic balance assumptions.
 */
import {api} from './api.js';
const rp=n=>'Rp '+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(n)||0);
const node=(tag,value)=>{const e=document.createElement(tag);if(value!==undefined)e.textContent=String(value);return e};
function note(host,message,clazz='info-note'){const e=node('p',message);e.className=clazz;host.append(e);return e}
function table(host,head,rows){
 const wrap=node('div');wrap.className='data-wrap';const t=node('table');t.className='data-table';
 const h=node('tr');head.forEach(x=>h.append(node('th',x)));t.append(h);
 for(const row of rows){const tr=node('tr');row.forEach(x=>tr.append(node('td',x===null||x===undefined?'—':x)));t.append(tr)}
 wrap.append(t);host.append(wrap);
}
const begin=(host,what)=>{host.replaceChildren();note(host,'Memuat '+what+' dari Cloudflare D1…','muted')};
const error=(host,e)=>{host.replaceChildren();note(host,'Gagal membaca D1: '+(e?.message||'Kesalahan API')+'. Data tidak diubah.')};
const sum=(items,key)=>items.reduce((n,x)=>n+Number(x[key]||0),0);
function summary(host,rows){
 const ul=node('div');ul.className='panel-actions';
 for(const [name,value] of rows){const e=node('p',name+': '+value);e.className='mini-pill';ul.append(e)}host.append(ul);
}
function fullWarning(host,list,limit){
 if(list.length>=limit)note(host,'Daftar mencapai batas '+limit+' record. Angka di halaman ini belum boleh dianggap lengkap untuk seluruh periode.');
}
export async function reportDenda(host){
 begin(host,'laporan denda');
 try{
  const d=await api('/api/bookkeeping/denda?limit=200'),list=d.data||[];
  host.replaceChildren();
  const total=sum(list,'nominalRp'),paid=sum(list,'terbayarRp');
  summary(host,[['Denda',list.length+' record'],['Tagihan',rp(total)],['Dibayar (rekap)',rp(paid)],['Sisa tagihan (rekap)',rp(total-paid)]]);
  fullWarning(host,list,200);
  note(host,'Dibayar berasal dari rekap historis D1. Belum menjadi bukti bahwa penerimaan kas terkait sudah terjurnal.');
  table(host,['Tanggal kegiatan','Warga','Jenis','Denda','Dibayar','Belum dibayar','Status','Periksa'],
    list.map(x=>[x.tanggal,x.nama||x.payerId||'—',x.jenis||'—',rp(x.nominalRp),rp(x.terbayarRp),
      rp(x.sisaRp),x.status,x.perluRekonsiliasi?'Ya':'—']));
  if(!list.length)note(host,'Belum ada denda dalam D1.','muted');
 }catch(e){error(host,e)}
}
export async function reportPinjaman(host){
 begin(host,'laporan pinjaman');
 try{
  const d=await api('/api/bookkeeping/pinjaman?limit=200'),list=d.data||[];
  host.replaceChildren();
  const total=sum(list,'pokokRp'),paid=sum(list,'angsuranAktifRp');
  summary(host,[['Pinjaman D1',list.length+' record'],['Pokok',rp(total)],['Angsuran aktif',rp(paid)],['Sisa menurut angsuran',rp(total-paid)]]);
  fullWarning(host,list,200);
  note(host,'Sisa dihitung dari angsuran aktif di D1, bukan hasil verifikasi jurnal kas atau saldo seluruh warga.');
  table(host,['Tanggal','Warga','Pokok','Angsuran aktif','Sisa','Status','Periksa'],
    list.map(x=>[x.tanggal,x.nama||x.payerId||'—',rp(x.pokokRp),rp(x.angsuranAktifRp),
      rp(x.sisaRp),x.status,x.perluRekonsiliasi?'Ya':'—']));
  if(!list.length)note(host,'Tidak ada pinjaman pada D1. Ini bukan jaminan semua kewajiban di luar D1 telah lunas.','muted');
 }catch(e){error(host,e)}
}
export async function reportTalangan(host){
 begin(host,'laporan talangan');
 try{
  const [listResponse,audit]=await Promise.all([
   api('/api/bookkeeping/talangan?limit=200'),api('/api/bookkeeping/talangan/audit')
  ]);
  const list=listResponse.data||[];host.replaceChildren();
  summary(host,[['Talangan D1',list.length+' record'],['Pokok',rp(sum(list,'pokokRp'))],
    ['Pelunasan menurut rekap lama',rp(sum(list,'pelunasanRingkasanRp'))],
    ['Angsuran tercatat terpisah',rp(sum(list,'angsuranTercatatRp'))]]);
  fullWarning(host,list,200);
  note(host,'Rekap pelunasan historis dan daftar angsuran sengaja ditampilkan terpisah agar tidak dihitung dua kali.');
  table(host,['ID Talangan','Pokok','Rekap pelunasan','Angsuran aktif','Sisa menurut rekap','Status','Periksa'],
    list.map(x=>[x.id,rp(x.pokokRp),rp(x.pelunasanRingkasanRp),rp(x.angsuranTercatatRp),
      rp(x.sisaMenurutRingkasanRp),x.status,x.perluRekonsiliasi?'Ya':'—']));
  const map=[['angsuranTanpaTalangan','Angsuran tanpa talangan'],
    ['jumlahTidakValid','Nilai negatif/lebih pokok'],
    ['angsuranMelebihiPokok','Angsuran melebihi pokok'],
    ['perbedaanRingkasan','Perbedaan rincian dengan rekap']];
  table(host,['Audit talangan','Temuan (maksimum 100)'],map.map(([key,label])=>[label,audit.jumlahTerlihat?.[key]??'—']));
  note(host,audit.catatan||'Status talangan historis perlu rekonsiliasi dengan sumber dan jurnal.','muted');
 }catch(e){error(host,e)}
}
export async function reportRekonsiliasi(host){
 begin(host,'audit keuangan');
 try{
  const results=await Promise.allSettled([
   api('/api/bookkeeping/iuran/audit'),
   api('/api/bookkeeping/denda-pinjaman/exceptions?limit=200'),
   api('/api/bookkeeping/denda-pinjaman/cash-candidates?jenis=denda&limit=200'),
   api('/api/bookkeeping/talangan/audit')
  ]);
  host.replaceChildren();
  note(host,'Pemeriksaan ini hanya menemukan potensi ketidaksesuaian. Catatan historis tidak diubah dan tidak ada jurnal yang dibuat otomatis.');
  const [iuran,dp,candidates,talangan]=results;
  if(iuran.status==='fulfilled'){
   const d=iuran.value;
   const fields=[['tanpaJurnal','Pembayaran iuran tanpa tautan jurnal individual'],
    ['jurnalGanda','Tautan jurnal ganda'],
    ['selisihJurnal','Nominal jurnal berbeda'],
    ['selisihAlokasi','Nominal alokasi berbeda']];
   const listing=fields.map(([k,title])=>[title,d.jumlahTerlihat?.[k]??0]);
   table(host,['Audit iuran','Jumlah (maksimum 100 per kategori)'],listing);
   note(host,'Pembayaran tanpa tautan bukan otomatis kas hilang. Buku Kas lama bisa memakai setoran gabungan.');
   const rows=(d.temuan?.tanpaJurnal||[]).slice(0,30);
   if(rows.length)table(host,['Contoh pembayaran tanpa tautan','Nominal'],rows.map(x=>[x.payment_id,rp(x.nilai)]));
  }else note(host,'Audit iuran tidak tersedia: '+(iuran.reason?.message||'API error'));
  if(dp.status==='fulfilled'){
   const d=dp.value;
   const lists=[['Denda',d.denda||[]],['Pinjaman',d.pinjaman||[]],
     ['Angsuran tanpa pinjaman induk',d.angsuranTanpaInduk||[]]];
   table(host,['Pengecualian Denda / Pinjaman','Jumlah terlihat'],lists.map(([name,arr])=>[name,arr.length]));
   for(const [name,list] of lists){
    if(list.length)table(host,[name+' — ID','Alasan'],list.slice(0,25).map(x=>[x.id,(x.alasan||[]).join(', ')||'Periksa']));
   }
   if(d.terpotong&&Object.values(d.terpotong).some(Boolean))note(host,'Hasil pengecualian terpotong; jangan simpulkan audit lengkap.');
  }else note(host,'Audit Denda/Pinjaman tidak tersedia: '+(dp.reason?.message||'API error'));
  if(candidates.status==='fulfilled'){
   const d=candidates.value,rows=d.data||[];
   summary(host,[['Denda dibayar yang perlu dicocokkan',rows.length+' kandidat sumber']]);
   if(rows.length)table(host,['ID denda','Tanggal bayar','Nominal','Kandidat jurnal','Kesimpulan'],
      rows.slice(0,40).map(x=>[x.id,x.tanggal,rp(x.nominalRp),x.kandidatJurnal,x.kesimpulan]));
   note(host,'Kecocokan nominal, tanggal dan pembayar hanya KANDIDAT; tidak membuktikan jurnal. Tidak ada tautan yang dibuat.');
  }else note(host,'Audit kandidat kas Denda tidak tersedia: '+(candidates.reason?.message||'API error'));
  if(talangan.status==='fulfilled'){
   const d=talangan.value;
   table(host,['Audit Talangan','Jumlah terlihat'],Object.entries(d.jumlahTerlihat||{}));
   note(host,d.catatan||'Angsuran historis tidak diposting ulang.','muted');
  }else note(host,'Audit Talangan tidak tersedia: '+(talangan.reason?.message||'API error'));
  note(host,'Laporan ini tidak mengesahkan saldo akhir dan belum mengizinkan pencatatan transaksi baru.');
 }catch(e){error(host,e)}
}
