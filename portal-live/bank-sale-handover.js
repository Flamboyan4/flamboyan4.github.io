/* Cetak serah terima penjualan dari transaksi D1; tidak mengubah data ataupun status. */
(()=>{
'use strict';
const ENDPOINT='https://api.flamboyan4.web.id/api/v2/admin/bank/sale-detail?id=';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const kg=n=>(Number(n||0)/1000).toLocaleString('id-ID',{maximumFractionDigits:3})+' kg';
const tanggal=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})/);if(!m)return '—';return new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(new Date(+m[1],+m[2]-1,+m[3]))};
const css='@page{size:A4 portrait;margin:12mm 12mm 11mm}*{box-sizing:border-box}body{font:12px/1.4 Arial,sans-serif;color:#1e392a;background:#fff;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
'.sheet{max-width:186mm;margin:14px auto}.head{display:flex;align-items:center;gap:12px;border-bottom:2px solid #2f6848;padding-bottom:10px;margin-bottom:12px}'+
'.head img{width:48px;height:48px;object-fit:contain}.head strong{display:block;font-size:17px;color:#19452b}.head small{display:block;color:#627968;font-size:10px}'+
'h1{text-align:center;font-size:17px;margin:12px 0 4px}.sub{text-align:center;margin:0 0 14px;color:#57705d;font-size:11px}'+
'.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;padding:11px 12px;background:#f7fbf8;border:1px solid #d9e8dd;border-radius:9px}'+
'.meta div{min-width:0;overflow-wrap:anywhere}.meta small{display:block;color:#647e6b;font-weight:700;font-size:10px}.meta b{font-size:11px}'+
'table{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:12px}th,td{border:1px solid #cad9cf;padding:6px 5px;font-size:11px;vertical-align:top;overflow-wrap:anywhere}'+
'th{background:#e5f1e8!important;color:#254b33;text-align:center}td.right{text-align:right;white-space:nowrap}tfoot td{font-weight:750;background:#f8fbf8}'+
'.figures{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:11px 0}.figure{border:1px solid #d3e4d8;padding:9px;border-radius:8px}'+
'.figure span{display:block;color:#58725e;font-size:10px}.figure strong{display:block;font-size:14px}.note{font-size:11px;margin:11px 0;line-height:1.55}'+
'.sign{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:18px 0 0;break-inside:avoid}.sign div{text-align:center}.sign strong{display:block}.sign small{display:block;color:#627968}'+
'.signature-line{border-bottom:1px solid #496651;margin:72px auto 5px;max-width:210px}.foot{border-top:1px solid #d7e3d9;margin-top:15px;padding-top:7px;font-size:9px;color:#607a67}'+
'.toolbar{max-width:186mm;margin:14px auto 0;display:flex;justify-content:flex-end;gap:8px}.toolbar button{border:0;border-radius:8px;background:#17714b;color:white;padding:10px 15px;font:700 13px Arial;cursor:pointer}.toolbar button:first-child{background:#e8f1eb;color:#285b3f}'+
'@media print{.toolbar{display:none!important}.sheet{margin:0 auto;max-width:none}thead{display:table-header-group}tr,.meta,.figures,.sign{break-inside:avoid}}';
function page(body,tools){
 return '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>Form Serah Terima Penjualan - Flamboyan 4</title><style>'+css+'</style></head><body>'+
 (tools?'<div class="toolbar"><button onclick="window.close()">Tutup</button><button onclick="window.print()">Cetak / Simpan PDF</button></div>':'')+body+'</body></html>';
}
function build(sale,lines){
 const bruto=Number(sale.amount_gross_rp||0),diterima=Number(sale.amount_received_rp||0);
 const check=lines.reduce((n,x)=>n+Number(x.total_rp||0),0);
 if(!lines.length||!Number.isSafeInteger(check)||bruto!==check)throw Error('Total detail penjualan berbeda dari D1. Periksa transaksi sebelum mencetak.');
 if(sale.status==='dibatalkan')throw Error('Penjualan dibatalkan. Form tidak diterbitkan.');
 const totalBerat=lines.reduce((n,x)=>n+Number(x.grams||0),0);
 const tr=lines.map((x,i)=>'<tr><td class="right">'+(i+1)+'</td><td>'+esc(x.name||'Barang')+'</td><td class="right">'+kg(x.grams)+'</td><td class="right">'+rp(x.priceRpPerKg)+'</td><td class="right">'+rp(x.total_rp)+'</td></tr>').join('');
 const signature=(label,role)=>'<div><strong>'+label+'</strong><small>'+role+'</small><div class="signature-line"></div><small>(Nama terang dan tanda tangan)</small></div>';
 return page('<main class="sheet">'+
 '<div class="head"><img src="/assets/logo-flamboyan.svg" alt="Flamboyan 4"><div><strong>BANK SAMPAH FLAMBOYAN 4</strong><small>Administrasi penjualan sampah warga</small><small>flamboyan4.web.id</small></div></div>'+
 '<h1>BERITA ACARA SERAH TERIMA PENJUALAN SAMPAH</h1><p class="sub">Dokumen untuk tanda tangan dan arsip fisik</p>'+
 '<div class="meta"><div><small>Kode transaksi D1</small><b>'+esc(sale.id)+'</b></div><div><small>Kode batch setoran</small><b>'+esc(sale.batch_id||'—')+'</b></div>'+
 '<div><small>Tanggal penjualan</small><b>'+esc(tanggal(sale.sold_on))+'</b></div><div><small>Nama lapak / pengepul</small><b>'+esc(sale.buyer_name||'—')+'</b></div></div>'+
 '<table><colgroup><col style="width:7%"><col style="width:33%"><col style="width:16%"><col style="width:22%"><col style="width:22%"></colgroup><thead><tr><th>No</th><th>Jenis barang</th><th>Berat</th><th>Harga/kg</th><th>Jumlah</th></tr></thead><tbody>'+tr+
 '</tbody><tfoot><tr><td colspan="2">TOTAL</td><td class="right">'+kg(totalBerat)+'</td><td></td><td class="right">'+rp(bruto)+'</td></tr></tfoot></table>'+
 '<div class="figures"><div class="figure"><span>Nilai penjualan bruto</span><strong>'+rp(bruto)+'</strong></div><div class="figure"><span>Dana diterima dari lapak</span><strong>'+rp(diterima)+'</strong></div></div>'+
 '<p class="note">Status sistem: <b>'+esc(sale.status==='terkonfirmasi'?'Terkonfirmasi':'Draft / belum direkonsiliasi')+'</b>. Selisih bruto dan penerimaan: <b>'+rp(bruto-diterima)+'</b>.</p>'+
 '<p class="note">Dengan menandatangani dokumen ini, kedua pihak menyatakan telah memeriksa dan menyepakati jenis barang, berat, harga, dan nominal penjualan sebagaimana tercantum di atas.</p>'+
 '<div class="sign">'+signature('Diserahkan oleh,','Humas Flamboyan 4')+signature('Diterima oleh,','Pemilik / wakil lapak')+'</div>'+
 '<p class="foot">Dibuat otomatis dari transaksi Cloudflare D1. Tanda tangan dilakukan manual. Dokumen ini bukan pengesahan otomatis pembagian tabungan ataupun rekonsiliasi.</p></main>',true);
}
window.F4SaleHandover=function(record){
 const id=String(record?.id||'').trim();if(!id)return;
 const win=window.open('','_blank');if(!win){window.f4UiDialog?.alert?.('Izinkan popup browser agar form cetak dapat dibuka.');return}
 win.document.open();win.document.write(page('<main class="sheet"><p>Memuat rincian transaksi dari D1…</p></main>',false));win.document.close();
 (async()=>{
  const res=await fetch(ENDPOINT+encodeURIComponent(id),{credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.ok===false)throw Error(data.error||'HTTP '+res.status);
  if(String(data.sale?.id||'')!==id||!Array.isArray(data.lines))throw Error('Rincian transaksi tidak sesuai.');
  const html=build(data.sale,data.lines);
  if(win.closed)return;
  win.document.open();win.document.write(html);win.document.close();
  win.focus();
  // Coba buka dialog cetak; jika ditolak browser, tersedia tombol cetak di pratinjau.
  win.addEventListener('load',()=>setTimeout(()=>{if(!win.closed)try{win.print()}catch{}},250),{once:true});
 })().catch(error=>{
  if(win.closed)return;
  win.document.open();win.document.write(page('<main class="sheet"><h2>Gagal memuat form</h2><p>'+esc(error.message)+'</p><p>Tidak ada data yang berubah.</p></main>',true));win.document.close();
 });
};
})();