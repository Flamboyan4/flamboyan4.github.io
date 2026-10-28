/* Cetak serah terima penjualan dari transaksi D1; tidak mengubah data ataupun status. */
(()=>{
'use strict';
const ENDPOINT='https://api.flamboyan4.web.id/api/v2/admin/bank/sale-detail?id=';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const kg=n=>(Number(n||0)/1000).toLocaleString('id-ID',{maximumFractionDigits:3})+' kg';
const tanggal=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})/);if(!m)return '—';return new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(new Date(+m[1],+m[2]-1,+m[3]))};
const css=[
'@page{size:A5 landscape;margin:7mm 9mm}',
'*{box-sizing:border-box}',
'html,body{margin:0;padding:0;background:#fff;color:#1b3427;font:9pt/1.23 Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
'.sheet{max-width:192mm;margin:8mm auto 5mm}',
'.head{display:flex;align-items:center;gap:2.5mm;padding-bottom:2.5mm;border-bottom:1.5px solid #2c6546;margin-bottom:2.5mm}',
'.head img{width:12mm;height:12mm;object-fit:contain;flex:none}',
'.brand{min-width:0;flex:1 1 auto}.brand strong{display:block;color:#155337;font-size:11pt;line-height:1.12}.brand small{display:block;color:#476c56;font-size:8pt;margin-top:1px}',
'.doc-title{text-align:right;max-width:82mm;flex:none;font-size:10pt;font-weight:800;line-height:1.18;color:#173e2b}',
'.doc-title small{display:block;font-size:8pt;font-weight:500;margin-top:1mm;color:#567363}',
'.meta{display:grid;grid-template-columns:1.2fr .95fr 1.3fr 1.1fr;gap:1.5mm;margin:0 0 2.5mm;padding:2mm 2.4mm;border:1px solid #d4e3d9;border-radius:1.5mm;background:#f8fbf8}',
'.meta>div{min-width:0;overflow-wrap:anywhere}.meta small{display:block;font-size:8pt;color:#597565;line-height:1.05;margin-bottom:.6mm}.meta b{font-size:9pt;line-height:1.15;display:block}',
'table{width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 2mm}',
'th,td{border:1px solid #ceded3;padding:1.3mm 1.6mm;font-size:8.5pt;line-height:1.15;overflow-wrap:anywhere;vertical-align:top}',
'th{background:#e5f1e8!important;color:#234d35;text-align:center;font-weight:700}',
'td.right{text-align:right;white-space:nowrap}',
'tfoot td{font-size:9pt;font-weight:750;background:#f8fbf9}',
'.totals{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2mm;border:1px solid #c9e0cf;border-radius:1.5mm;margin:2mm 0;padding:1.7mm 2.5mm;background:#f6faf7}',
'.totals div{display:flex;align-items:center;justify-content:space-between;gap:2mm;min-width:0}',
'.totals span{font-size:8pt;color:#526d59;white-space:nowrap}.totals b{font-size:9.5pt;white-space:nowrap}',
'.desc{font-size:8.2pt;line-height:1.22;margin:2.2mm 0 0;max-width:100%}',
'.status{font-size:8pt;color:#557160;margin:1.5mm 0 0}',
'.sign{display:grid;grid-template-columns:1fr 1fr;gap:13mm;margin:4mm 8mm 0;break-inside:avoid}',
'.sig{text-align:center;font-size:8.5pt}.sig strong{display:block;font-size:9pt}.sig small{display:block;font-size:8pt;color:#486753}',
'.sig .line{border-bottom:1px solid #456b52;margin:14mm 0 1mm}',
'.footer{border-top:1px solid #d5e3da;margin-top:2.5mm;padding-top:1mm;font-size:8pt;color:#64806e}',
'.toolbar{max-width:192mm;margin:12px auto;display:flex;justify-content:flex-end;gap:8px}',
'.toolbar button{background:#18764d;color:#fff;border:0;border-radius:7px;padding:10px 15px;font:700 10pt Arial;cursor:pointer}',
'.toolbar button:first-child{background:#e4f2e8;color:#21543a}',
'@media print{.sheet{max-width:none;margin:0 auto}.toolbar{display:none!important}thead{display:table-header-group}tr,.head,.meta,.totals,.sign{break-inside:avoid}}'
].join('');
function page(body,tools){
 return '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>Form Serah Terima Penjualan - Flamboyan 4</title><style>'+css+'</style></head><body>'+
 (tools?'<div class="toolbar"><button onclick="window.close()">Tutup</button><button onclick="window.print()">Cetak / Simpan PDF</button></div>':'')+body+'</body></html>';
}
function build(sale,lines){
 const bruto=Number(sale.amount_gross_rp||0),diterima=Number(sale.amount_received_rp||0);
 const check=lines.reduce((n,x)=>n+Number(x.total_rp||0),0);
 if(!lines.length||!Number.isSafeInteger(check)||bruto!==check)throw Error('Jumlah rincian barang tidak sama dengan transaksi D1. Periksa data sebelum mencetak.');
 if(sale.status==='dibatalkan')throw Error('Transaksi sudah dibatalkan. Form tidak dapat diterbitkan.');
 const grams=lines.reduce((n,x)=>n+Number(x.grams||0),0);
 const reference=String(sale.id||'').replace(/[^a-z0-9]/gi,'').slice(-8).toUpperCase();
 const docCode='BS-'+String(sale.sold_on||'').replace(/[^0-9]/g,'').slice(0,8)+'-'+reference;
 const receiptNo=String(sale.receipt_no||'').trim();
 const rows=lines.map((x,i)=>'<tr><td class="right">'+(i+1)+'</td><td>'+esc(x.name||'Barang')+'</td>'+
  '<td class="right">'+kg(x.grams)+'</td><td class="right">'+rp(x.priceRpPerKg)+'</td><td class="right">'+rp(x.total_rp)+'</td></tr>').join('');
 const signature=(heading,role)=>'<div class="sig"><strong>'+heading+'</strong><small>'+role+'</small><div class="line"></div><small>Nama terang & tanda tangan</small></div>';
 return page('<main class="sheet">'+
 '<header class="head"><img src="/assets/logo-flamboyan.svg" alt="Logo Flamboyan 4"><div class="brand"><strong>BANK SAMPAH FLAMBOYAN 4</strong><small>Bersama menjaga lingkungan · flamboyan4.web.id</small></div>'+
 '<div class="doc-title">BERITA ACARA SERAH TERIMA<br>PENJUALAN SAMPAH<small>Untuk arsip fisik kedua pihak</small></div></header>'+
 '<div class="meta"><div><small>No. nota lapak</small><b>'+esc(receiptNo||'Belum diisi')+'</b></div>'+
 '<div><small>Tanggal penjualan</small><b>'+esc(tanggal(sale.sold_on))+'</b></div>'+
 '<div><small>Lapak / pengepul</small><b>'+esc(sale.buyer_name||'—')+'</b></div>'+
 '<div><small>No. arsip otomatis</small><b>'+esc(docCode)+'</b></div></div>'+
 '<table><colgroup><col style="width:7%"><col style="width:37%"><col style="width:16%"><col style="width:20%"><col style="width:20%"></colgroup>'+
 '<thead><tr><th>No.</th><th>Jenis sampah</th><th>Berat</th><th>Harga/kg</th><th>Jumlah</th></tr></thead><tbody>'+rows+'</tbody>'+
 '<tfoot><tr><td colspan="2">TOTAL</td><td class="right">'+kg(grams)+'</td><td></td><td class="right">'+rp(bruto)+'</td></tr></tfoot></table>'+
 '<section class="totals"><div><span>Berat terjual</span><b>'+kg(grams)+'</b></div>'+
 '<div><span>Total jual</span><b>'+rp(bruto)+'</b></div><div><span>Diterima</span><b>'+rp(diterima)+'</b></div></section>'+
 (bruto!==diterima?'<p class="status">Selisih bayar: <strong>'+rp(bruto-diterima)+'</strong> · Periksa pembayaran.</p>':'')+
 '<p class="desc">Kedua pihak menyatakan telah memeriksa dan menyepakati jenis barang, berat, harga, serta jumlah penjualan seperti tercantum di atas.</p>'+
 '<div class="sign">'+signature('Diserahkan oleh,','Humas Flamboyan 4')+signature('Diterima oleh,','Pemilik / wakil lapak')+'</div>'+
 '<footer class="footer">Status pencatatan: '+esc(sale.status==='terkonfirmasi'?'Terkonfirmasi':'Draft')+'. Dokumen ditandatangani secara manual; pencetakan tidak mengubah transaksi atau saldo warga.</footer>'+
 '</main>',true);
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