/* Penjualan kolektif Bank Sampah: rekap otomatis dari D1, tanpa input ulang per warga. */
(()=>{
"use strict";
const API="https://api.flamboyan4.web.id/api/admin/bank/sale-sheet";
const $=id=>document.getElementById(id);
let current=null,seq=0,installed=false;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const kg=g=>(Number(g||0)/1000).toLocaleString("id-ID",{maximumFractionDigits:3});
const now=()=>new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Jakarta"});
function status(message,error=false){
 const node=$("f4SaleSheetStatus");if(node){node.textContent=message||"";node.dataset.error=error?"1":"0";}
}
async function fetchSheet(batchId,body){
 const response=await fetch(API+(body?"":"?batchId="+encodeURIComponent(batchId)),{
  method:body?"POST":"GET",credentials:"include",cache:"no-store",
  ...(body?{headers:{"Content-Type":"application/json"},body:JSON.stringify({batchId,...body})}:{})
 });
 const result=await response.json().catch(()=>({}));
 if(!response.ok||result.ok===false)throw Error(result.error||"Layanan penjualan belum tersedia.");
 return result;
}
function fill(data){
 const host=$("saleItems")?.querySelector(".f4-compact-sale-rows");
 if(!host||typeof window.addSaleItemRow!=="function")return;
 host.replaceChildren();
 for(const line of data.lines||[]){
  window.addSaleItemRow();
  const row=host.lastElementChild;
  const choice=row?.querySelector("select");
  const inputs=row?.querySelectorAll("input");
  if(!row||!choice||!inputs?.length)continue;
  const code=String(line.itemId||"").replace(/^waste:/,"");
  choice.value=[...choice.options].some(o=>o.value===code)?code:line.itemId;
  if(!choice.value){
   row.remove();continue;
  }
  const original=Number(line.grams)/1000;
  inputs[0].value=String(original);
  inputs[1].value=Number(line.lastPrice)>0?String(line.lastPrice):"";
  // Harga historis hanyalah saran: pengurus tetap mengisi hasil timbang dan tarif lapak nyata.
  inputs[1].setAttribute("aria-label","Harga jual lapak untuk "+String(line.name||"barang")+" per kg");
  inputs[0].setAttribute("aria-label","Hasil timbang lapak "+String(line.name||"barang")+" dalam kilogram");
  row.dataset.initialGrams=String(Number(line.grams));
  const diff=document.createElement("small");diff.className="f4-bank-sale-diff";
  row.append(diff);
  const check=()=>{
   const grams=Math.round(Number(inputs[0].value||0)*1000),delta=grams-Number(line.grams);
   diff.textContent="Awal "+kg(line.grams)+" kg · "+(delta===0?"Sesuai":delta<0?"Selisih −"+kg(-delta)+" kg":"Lebih +"+kg(delta)+" kg");
   diff.dataset.state=delta>0?"excess":delta<0?"difference":"equal";
   window.updateSaleTotals?.();
  };
  inputs[0].addEventListener("input",check);
  check();
 }
 if(!host.children.length)window.addSaleItemRow();
 window.updateSaleTotals?.();
}
function install(){
 if(installed||!$("saleBatch"))return;
 installed=true;
 const picker=$("saleBatch"),parent=picker.closest(".field");
 if(!parent)return;
 const tools=document.createElement("div");tools.className="f4-bank-sheet-tools";
 const label=document.createElement("div");label.className="f4-bank-sheet-summary";
 const number=document.createElement("strong");number.id="f4SaleSheetNumber";number.textContent="Pilih kelompok untuk melihat nomor penjualan";
 const statusNode=document.createElement("small");statusNode.id="f4SaleSheetStatus";statusNode.setAttribute("role","status");
 label.append(number,statusNode);
 const actions=document.createElement("div");actions.className="f4-bank-sheet-actions";
 const print=document.createElement("button");print.type="button";print.className="secondary";print.id="f4SaleSheetPrint";print.textContent="Siapkan & Cetak Lembar";
 print.disabled=true;print.onclick=prepareAndPrint;
 const reopen=document.createElement("button");reopen.type="button";reopen.className="secondary";reopen.id="f4SaleSheetReopen";reopen.textContent="Buka kembali setoran";reopen.hidden=true;reopen.onclick=reopenBatch;
 actions.append(print,reopen);tools.append(label,actions);parent.after(tools);
 picker.addEventListener("change",refresh);
}
async function refresh(){
 install();
 const picker=$("saleBatch");if(!picker)return;
 const batchId=picker.value,version=++seq;
 const print=$("f4SaleSheetPrint"),reopen=$("f4SaleSheetReopen");
 current=null;
 if(print)print.disabled=true;
 if(reopen)reopen.hidden=true;
 $("f4SaleSheetNumber").textContent=batchId?"Memuat rekap...":"Pilih kelompok untuk melihat nomor penjualan";
 status(batchId?"Mengambil total berat per jenis dari setoran warga.":"");
 if(!batchId)return;
 try{
  const data=await fetchSheet(batchId);
  if(version!==seq||picker.value!==batchId)return;
  current=data;
  $("f4SaleSheetNumber").textContent=data.saleNumber;
  // Tampilkan nomor jual yang konsisten tanpa mengubah nilai batch yang dipakai API lama.
  const selected=picker.selectedOptions?.[0];
  if(selected&&data.saleNumber){
   selected.textContent=data.saleNumber;
   selected.title="Nomor penjualan "+data.saleNumber;
  }
  status(data.depositCount+" setoran · "+kg(data.totalGrams)+" kg · "+(data.status==="siap"?"Siap dibawa ke lapak":"Belum disiapkan"));
  if(print)print.disabled=false;
  if(reopen)reopen.hidden=data.status!=="siap";
  fill(data);
 }catch(e){if(version===seq){$("f4SaleSheetNumber").textContent="Rekap belum tersedia";status(e.message||String(e),true)}}
}
function sheetHtml(data){
 const rows=data.lines.map((x,i)=>"<tr><td>"+(i+1)+"</td><td>"+esc(x.name)+"</td><td class='num'>"+kg(x.grams)+"</td><td></td><td></td><td></td></tr>").join("");
 return '<!doctype html><html lang="id"><head><meta charset="utf-8"><title>'+esc(data.saleNumber)+'</title>'+
 '<style>@page{size:A5 landscape;margin:9mm}*{box-sizing:border-box}body{margin:0;color:#213b2b;font:10pt Arial,sans-serif}.head{display:flex;align-items:center;gap:9px;border-bottom:2px solid #1c6844;padding-bottom:9px}.head img{width:38px;height:38px}.head strong{display:block;color:#175c3b;font-size:13pt}.title{text-align:right;margin-left:auto;font-weight:800}.meta{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:10px;margin:12px 0;border:1px solid #bbb;padding:8px}.meta small{display:block;color:#637469}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #000;padding:6px;text-align:left;font-size:9pt;height:24px}th{background:#e8f4ec}td.num{text-align:right}.sign{display:grid;grid-template-columns:1fr 1fr;gap:20px;text-align:center;margin:20px 20px 0}.sign span{display:block;margin-top:33px}.foot{font-size:8pt;margin-top:12px;color:#5a6c61}.bar{margin:12px 0;text-align:right}.bar button{padding:9px 15px;background:#17643e;color:#fff;border:0;border-radius:7px;font-weight:bold}@media print{.bar{display:none}}</style></head><body>'+
 '<div class="bar"><button onclick="window.print()">Cetak / Simpan PDF</button></div><header class="head"><img src="/assets/logo-flamboyan.svg" alt=""><div><strong>BANK SAMPAH FLAMBOYAN 4</strong><small>flamboyan4.web.id</small></div><div class="title">LEMBAR TIMBANG LAPAK<br><small>Bukan Nota Final</small></div></header>'+
 '<section class="meta"><div><small>No. Penjualan</small><b>'+esc(data.saleNumber)+'</b></div><div><small>Tanggal disiapkan</small><b>'+now()+'</b></div><div><small>Lapak / pengepul</small>_________________</div></section>'+
 '<table><colgroup><col width="7%"><col width="29%"><col width="16%"><col width="16%"><col width="16%"><col width="16%"></colgroup><thead><tr><th>No.</th><th>Jenis sampah</th><th>Stok awal (kg)</th><th>Hasil lapak (kg)</th><th>Harga/kg</th><th>Jumlah</th></tr></thead><tbody>'+rows+'</tbody></table>'+
 '<p><b>Total jual: Rp __________________ &nbsp; &nbsp; Uang diterima: Rp __________________</b></p>'+
 '<div class="sign"><div>Pengurus Bank Sampah<span>(________________________)</span></div><div>Pemilik Lapak<span>(________________________)</span></div></div>'+
 '<p class="foot">Isi kolom hasil timbang dan harga bersama pemilik lapak. Setelah kembali, pilih nomor penjualan yang sama pada website untuk mencatat hasilnya.</p></body></html>';
}
async function prepareAndPrint(){
 if(!current)return;
 // Jendela dibuka dalam klik pengguna supaya browser tidak memblokirnya.
 const popup=window.open("","_blank");
 if(!popup){status("Izinkan popup untuk mencetak lembar timbang.",true);return}
 const print=$("f4SaleSheetPrint");print.disabled=true;
 popup.document.write("<title>Menyiapkan lembar penjualan</title><p>Memeriksa rekap setoran...</p>");
 try{
  const data=await fetchSheet(current.batchId,{action:"prepare"});
  current=data;
  $("f4SaleSheetNumber").textContent=data.saleNumber;
  $("f4SaleSheetReopen").hidden=false;
  status("Rekap terkunci untuk penjualan. Lembar siap dicetak.");
  popup.document.open();popup.document.write(sheetHtml(data));popup.document.close();
  popup.focus();
  popup.addEventListener("load",()=>{if(!popup.closed)popup.print()},{once:true});
  if(popup.document.readyState==="complete")popup.print();
 }catch(e){popup.close();status(e.message||String(e),true)}
 finally{print.disabled=!current}
}
async function reopenBatch(){
 if(!current||current.status!=="siap")return;
 if(!confirm("Buka kembali kelompok setoran? Lembar timbang yang sudah dicetak harus diganti."))return;
 try{await fetchSheet(current.batchId,{action:"reopen"});await refresh();status("Setoran dibuka kembali. Cetak ulang lembar setelah selesai mengubah data.")}
 catch(e){status(e.message||String(e),true)}
}
window.F4SaleSheet={refresh,number:()=>current?.saleNumber||''};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
})();