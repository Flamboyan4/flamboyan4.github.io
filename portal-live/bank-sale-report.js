/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/bank-sale-report.js",function(__f4){


/* Laporan internal per nomor penjualan. BUKAN nota/bukti serah terima kedua.
   Bukti fisik utama adalah lembar timbang yang ditandatangani di lapak. */
(()=>{"use strict";
const URL="https://api.flamboyan4.web.id/api/v2/admin/bank/sale-detail?id=";
const esc=v=>(0,__f4.globals.String)(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rp=v=>"Rp "+(0,__f4.globals.Number)(v||0).toLocaleString("id-ID");
const kg=v=>((0,__f4.globals.Number)(v||0)/1000).toLocaleString("id-ID",{maximumFractionDigits:3})+" kg";
const tanggal=value=>{
 const match=(0,__f4.globals.String)(value||"").match(/^(\d{4})-(\d{2})-(\d{2})/);
 return match?new __f4.globals.Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(new __f4.globals.Date(+match[1],+match[2]-1,+match[3])):"—";
};
function documentHtml(sale,lines){
 if(!__f4.globals.Array.isArray(lines)||!lines.length)throw (0,__f4.globals.Error)("Rincian penjualan tidak tersedia.");
 const gross=(0,__f4.globals.Number)(sale.amount_gross_rp),received=(0,__f4.globals.Number)(sale.amount_received_rp);
 const total=lines.reduce((n,x)=>n+(0,__f4.globals.Number)(x.total_rp||0),0);
 if(!__f4.globals.Number.isSafeInteger(gross)||gross<0||gross!==total||!__f4.globals.Number.isSafeInteger(received)||received<0||received>gross)
  throw (0,__f4.globals.Error)("Jumlah rincian tidak cocok dengan data penjualan D1.");
 const number="BSF4-J-"+(0,__f4.globals.String)(sale.batch_id||"").replace(/^batch:/,"").replace(/[^A-Za-z0-9-]/g,"").slice(0,48).toUpperCase();
 const rows=lines.map((line,i)=>"<tr><td>"+(i+1)+"</td><td>"+esc(line.name||"Barang")+
  "</td><td class='num'>"+kg(line.grams)+"</td><td class='num'>"+rp(line.priceRpPerKg)+
  "</td><td class='num'>"+rp(line.total_rp)+"</td></tr>").join("");
 const unpaid=__f4.globals.Math.max(0,gross-received);
 return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(number)} — Laporan Transaksi</title>
 <style>
 @page{size:A5 landscape;margin:9mm}
 *{box-sizing:border-box}body{margin:0;color:#22372c;background:#fff;font:9pt/1.4 Arial,sans-serif}
 header{display:flex;gap:10px;align-items:center;border-bottom:2px solid #18704a;padding-bottom:9px}
 header img{width:36px;height:36px}header strong{display:block;font-size:14pt;color:#176542}h1{font-size:13pt;margin-left:auto;text-align:right;line-height:1.25}
 .meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}
 .meta div,.totals div{border:1px solid #d6e4da;border-radius:5px;padding:7px;min-width:0}
 small{display:block;font-size:8pt;color:#52665b}b{overflow-wrap:anywhere}
 table{width:100%;border-collapse:collapse;table-layout:fixed}
 th,td{border:1px solid #333;padding:5px 6px;vertical-align:top}th{background:#e8f3ec}
 .num{text-align:right}.totals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}
 .foot{font-size:8pt;color:#4d6156;margin-top:10px}
 .bar{text-align:right;margin-bottom:12px}.bar button{padding:8px 12px;color:#fff;background:#176542;border:0;border-radius:7px;cursor:pointer}
 @media print{.bar{display:none}thead{display:table-header-group}tr{break-inside:avoid}}
 </style></head><body><div class="bar"><button onclick="window.print()">Cetak / Simpan PDF</button></div>
 <header><img src="/assets/logo-flamboyan.svg" alt=""><div><strong>Bank Sampah Flamboyan 4</strong><small>flamboyan4.web.id</small></div>
 <h1>LAPORAN<br>TRANSAKSI PENJUALAN</h1></header>
 <div class="meta"><div><small>Nomor transaksi</small><b>${esc(number)}</b></div>
 <div><small>Tanggal</small><b>${esc(tanggal(sale.sold_on))}</b></div>
 <div><small>Lapak</small><b>${esc(sale.buyer_name||"—")}</b></div>
 <div><small>Status</small><b>${esc(sale.status||"Tercatat")}</b></div></div>
 <table><colgroup><col style="width:6%"><col style="width:38%"><col style="width:16%"><col style="width:20%"><col style="width:20%"></colgroup>
 <thead><tr><th>No.</th><th>Jenis barang</th><th>Hasil timbang</th><th>Harga/kg</th><th>Jumlah</th></tr></thead>
 <tbody>${rows}</tbody><tfoot><tr><th colspan="4">TOTAL</th><th class="num">${rp(gross)}</th></tr></tfoot></table>
 <div class="totals"><div><small>Total jual</small><b>${rp(gross)}</b></div>
 <div><small>Diterima dari lapak</small><b>${rp(received)}</b></div>
 <div><small>Belum dibayar</small><b>${rp(unpaid)}</b></div></div>
 <p class="foot"><strong>Arsip laporan digital.</strong> Dokumen ini bukan nota atau bukti serah terima baru.
 Bukti fisik penimbangan dan penjualan adalah lembar timbang asli yang ditandatangani bersama pihak lapak.</p>
 </body></html>`;
}
__f4.window.F4SaleReport=function(id){
 id=(0,__f4.globals.String)(id||"").trim();if(!id)return;
 const popup=__f4.window.open("","_blank");
 if(!popup){__f4.window.f4UiDialog?.alert?.("Izinkan popup browser untuk mencetak laporan transaksi.");return;}
 popup.document.write("<title>Memuat laporan transaksi...</title><p>Mengambil data penjualan...</p>");
 (async()=>{
  const response=await (0,__f4.globals.fetch)(URL+(0,__f4.globals.encodeURIComponent)(id),{credentials:"include",cache:"no-store",headers:{Accept:"application/json"}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.ok===false||(0,__f4.globals.String)(data.sale?.id)!==id)throw (0,__f4.globals.Error)(data.error||"Gagal memuat transaksi yang sesuai.");
  const html=documentHtml(data.sale,data.lines);
  if(popup.closed)return;
  popup.document.open();popup.document.write(html);popup.document.close();
  popup.focus();
  let printed=false;
  const printOnce=()=>{if(printed||popup.closed)return;printed=true;popup.focus();popup.print();};
  popup.addEventListener("load",printOnce,{once:true});
  if(popup.document.readyState==="complete")printOnce();
 })().catch(error=>{
  if(popup.closed)return;
  popup.document.open();popup.document.write("<title>Laporan gagal</title><p>"+esc(error.message)+"</p><p>Data tidak diubah.</p>");popup.document.close();
 });
};
})();

});
