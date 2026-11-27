/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/bank-sale-sheet.js",function(__f4){


/* Penjualan kolektif Bank Sampah: rekap otomatis dari D1, tanpa input ulang per warga. */
(()=>{
"use strict";
const API="https://api.flamboyan4.web.id/api/admin/bank/sale-sheet";
const $=id=>__f4.globals.document.getElementById(id);
let current=null,seq=0,installed=false;
const esc=v=>(0,__f4.globals.String)(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const kg=g=>((0,__f4.globals.Number)(g||0)/1000).toLocaleString("id-ID",{maximumFractionDigits:3});
const now=()=>new __f4.globals.Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Jakarta"});
function status(message,error=false){
 const node=$("f4SaleSheetStatus");if(node){node.textContent=message||"";node.dataset.error=error?"1":"0";}
}
async function fetchSheet(batchId,body){
 const response=await (0,__f4.globals.fetch)(API+(body?"":"?batchId="+(0,__f4.globals.encodeURIComponent)(batchId)),{
  method:body?"POST":"GET",credentials:"include",cache:"no-store",
  ...(body?{headers:{"Content-Type":"application/json"},body:__f4.globals.JSON.stringify({batchId,...body})}:{})
 });
 const result=await response.json().catch(()=>({}));
 if(!response.ok||result.ok===false)throw (0,__f4.globals.Error)(result.error||"Layanan penjualan belum tersedia.");
 return result;
}
function fill(data){
 const host=$("saleItems")?.querySelector(".f4-compact-sale-rows");
 if(!host||typeof __f4.window.addSaleItemRow!=="function")return;
 host.replaceChildren();
 for(const line of data.lines||[]){
  __f4.window.addSaleItemRow();
  const row=host.lastElementChild;
  const choice=row?.querySelector("select");
  const inputs=row?.querySelectorAll("input");
  if(!row||!choice||!inputs?.length)continue;
  const code=(0,__f4.globals.String)(line.itemId||"").replace(/^waste:/,"");
  choice.value=[...choice.options].some(o=>o.value===code)?code:line.itemId;
  if(!choice.value){
   row.remove();continue;
  }
  const original=(0,__f4.globals.Number)(line.grams)/1000;
  // Beri referensi, tetapi JANGAN prefill hasil lapak: berat nyata wajib diinput dari lembar bertanda tangan.
  inputs[0].value="";
  inputs[0].placeholder=kg(line.grams)+" kg awal";
  inputs[0].required=true;
  inputs[1].value="";
  if((0,__f4.globals.Number)(line.lastPrice)>0)inputs[1].placeholder="Acuan "+(0,__f4.globals.Number)(line.lastPrice).toLocaleString("id-ID");
  inputs[1].required=true;
  // Harga historis hanya petunjuk, bukan nilai transaksi yang dianggap benar otomatis.
  inputs[1].setAttribute("aria-label","Harga jual lapak aktual untuk "+(0,__f4.globals.String)(line.name||"barang")+" per kg");
  inputs[0].setAttribute("aria-label","Hasil timbang lapak aktual "+(0,__f4.globals.String)(line.name||"barang")+" dalam kilogram");
  row.dataset.initialGrams=(0,__f4.globals.String)((0,__f4.globals.Number)(line.grams));
  const diff=__f4.globals.document.createElement("small");diff.className="f4-bank-sale-diff";
  // Sisa stok adalah pengecualian, bukan isian wajib pada setiap jenis.
  // Tetap berada di baris yang sama untuk menjaga alur penjualan 3 tahap.
  const unsoldWrap=__f4.globals.document.createElement("details");unsoldWrap.className="f4-bank-unsold-wrap";
  const unsoldSummary=__f4.globals.document.createElement("summary");unsoldSummary.textContent="Ada sisa belum dijual?";
  const unsoldLabel=__f4.globals.document.createElement("label");unsoldLabel.textContent="Sisa (kg)";
  const unsoldInput=__f4.globals.document.createElement("input");unsoldInput.type="number";
  unsoldInput.min="0";unsoldInput.step="0.001";unsoldInput.max=(0,__f4.globals.String)(original);
  unsoldInput.placeholder="0";unsoldInput.value="0";unsoldInput.dataset.bankUnsold="1";
  unsoldInput.setAttribute("aria-label","Berat barang yang sengaja tidak dijual "+(0,__f4.globals.String)(line.name||""));
  unsoldLabel.append(unsoldInput);
  unsoldWrap.append(unsoldSummary,unsoldLabel);
  row.append(diff,unsoldWrap);
  const check=()=>{
   const raw=(0,__f4.globals.String)(inputs[0].value).trim();
   if(!raw){
    diff.textContent="Awal "+kg(line.grams)+" kg · isi hasil lapak";
    diff.dataset.state="unentered";
   }else{
    const grams=__f4.globals.Math.round((0,__f4.globals.Number)(raw)*1000),remaining=__f4.globals.Math.round((0,__f4.globals.Number)(unsoldInput.value||0)*1000);
    const delta=(0,__f4.globals.Number)(line.grams)-grams-remaining;
    unsoldSummary.textContent=remaining>0?"Sisa tersimpan "+kg(remaining)+" kg":"Ada sisa belum dijual?";
    diff.textContent="Awal "+kg(line.grams)+" kg · "+
      (delta===0?"Sesuai":delta>0?"Selisih timbang "+kg(delta)+" kg":"Melebihi stok "+kg(-delta)+" kg");
    diff.dataset.state=delta<0?"excess":delta>0?"difference":"equal";
   }
   __f4.window.updateSaleTotals?.();
  };
  inputs[0].addEventListener("input",check);
  unsoldInput.addEventListener("input",check);
  check();
 }
 if(!host.children.length)__f4.window.addSaleItemRow();
 __f4.window.updateSaleTotals?.();
}
function install(){
 if(installed||!$("saleBatch"))return;
 const picker=$("saleBatch"),topFields=picker.closest(".f4-sale-top-fields");
 if(!topFields)return;
 installed=true;
 const tools=__f4.globals.document.createElement("div");tools.className="f4-bank-sheet-tools";
 const label=__f4.globals.document.createElement("div");label.className="f4-bank-sheet-summary";
 const number=__f4.globals.document.createElement("strong");number.id="f4SaleSheetNumber";number.textContent="Nota timbang";
 const statusNode=__f4.globals.document.createElement("small");statusNode.id="f4SaleSheetStatus";statusNode.setAttribute("role","status");
 label.append(number,statusNode);
 const actions=__f4.globals.document.createElement("div");actions.className="f4-bank-sheet-actions";
 const print=__f4.globals.document.createElement("button");print.type="button";print.className="f4-bank-gold-action";print.id="f4SaleSheetPrint";print.textContent="Cetak nota";
 print.setAttribute("aria-describedby","f4SaleSheetStatus");
 print.onclick=prepareAndPrint;
 const reopen=__f4.globals.document.createElement("button");reopen.type="button";reopen.className="secondary";reopen.id="f4SaleSheetReopen";reopen.textContent="Buka kembali setoran";reopen.hidden=true;reopen.onclick=reopenBatch;
 actions.append(print,reopen);tools.append(label,actions);
 // Letakkan tepat setelah pemilihan kelompok: tahap cetak selalu terlihat,
 // termasuk saat belum ada kelompok atau data masih dimuat.
 const groupField=picker.closest(".field");
 if(groupField&&groupField.parentElement===topFields)groupField.after(tools);
 else topFields.append(tools);
 status("Pilih kelompok dan cetak nota.");
 picker.addEventListener("change",refresh);
}
async function refresh(){
 install();
 const picker=$("saleBatch");if(!picker)return;
 const batchId=picker.value,version=++seq;
 const print=$("f4SaleSheetPrint"),reopen=$("f4SaleSheetReopen");
 const tools=$("f4SaleSheetNumber")?.closest(".f4-bank-sheet-tools");
 // Jangan sembunyikan tombol tahap pertama: pengguna perlu tahu alurnya.
 if(tools)tools.hidden=false;
 current=null;
 if(print){print.disabled=false;print.textContent="Cetak nota";}
 if(reopen)reopen.hidden=true;
 $("f4SaleSheetNumber").textContent=batchId?"Memuat rekap...":"Nota timbang";
 status(batchId?"Memuat nota...":picker.disabled
  ?"Belum ada setoran siap dijual."
  :"Pilih kelompok dan cetak nota.");
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
  if(print){
   print.disabled=!(__f4.globals.Array.isArray(data.lines)&&data.lines.length>0);
   print.textContent=data.status==="siap"?"Unduh ulang nota":"Unduh nota";
  }
  if(reopen)reopen.hidden=data.status!=="siap";
  fill(data);
 }catch(e){if(version===seq){$("f4SaleSheetNumber").textContent="Rekap belum tersedia";status(e.message||(0,__f4.globals.String)(e),true)}}
}
function sheetHtml(data){
 const rows=data.lines.map((x,i)=>"<tr><td>"+(i+1)+"</td><td>"+esc(x.name)+"</td><td class='num'>"+kg(x.grams)+"</td><td></td><td></td><td></td></tr>").join("");
 return '<!doctype html><html lang="id"><head><meta charset="utf-8"><title>'+esc(data.saleNumber)+'</title>'+
 '<style>@page{size:A5 landscape;margin:9mm}*{box-sizing:border-box}body{margin:0;color:#213b2b;font:10pt Arial,sans-serif}.head{display:flex;align-items:center;gap:9px;border-bottom:2px solid #1c6844;padding-bottom:9px}.head img{width:38px;height:38px}.head strong{display:block;color:#175c3b;font-size:13pt}.title{text-align:right;margin-left:auto;font-weight:800}.meta{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:10px;margin:12px 0;border:1px solid #bbb;padding:8px}.meta small{display:block;color:#637469}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #000;padding:6px;text-align:left;font-size:9pt;height:24px}th{background:#e8f4ec}td.num{text-align:right}.sign{display:grid;grid-template-columns:1fr 1fr;gap:20px;text-align:center;margin:20px 20px 0}.sign span{display:block;margin-top:33px}.foot{font-size:8pt;margin-top:12px;color:#5a6c61}.bar{margin:12px 0;text-align:right}.bar button{padding:9px 15px;background:#17643e;color:#fff;border:0;border-radius:7px;font-weight:bold}@media print{.bar{display:none}}</style></head><body>'+
 '<header class="head"><img src="/assets/logo-flamboyan.svg" alt=""><div><strong>BANK SAMPAH FLAMBOYAN 4</strong><small>flamboyan4.web.id</small></div><div class="title">LEMBAR TIMBANG & JUAL<br><small>Bukti transaksi setelah ditandatangani</small></div></header>'+
 '<section class="meta"><div><small>No. Penjualan</small><b>'+esc(data.saleNumber)+'</b></div><div><small>Tanggal disiapkan</small><b>'+now()+'</b></div><div><small>Lapak / pengepul</small>_________________</div></section>'+
 '<table><colgroup><col width="7%"><col width="29%"><col width="16%"><col width="16%"><col width="16%"><col width="16%"></colgroup><thead><tr><th>No.</th><th>Jenis sampah</th><th>Stok awal (kg)</th><th>Hasil lapak (kg)</th><th>Harga/kg</th><th>Jumlah</th></tr></thead><tbody>'+rows+'</tbody></table>'+
 '<p><b>Total jual: Rp __________________ &nbsp; &nbsp; Uang diterima: Rp __________________</b></p>'+
 '<div class="sign"><div>Pengurus Bank Sampah<span>(________________________)</span></div><div>Pemilik Lapak<span>(________________________)</span></div></div>'+
 '<p class="foot">Isi berat, harga, total dan pembayaran di lapak, lalu tanda tangani bersama. Lembar ini menjadi bukti transaksi; input hasilnya ke nomor penjualan yang sama di website.</p></body></html>';
}
async function prepareAndPrint(){
 const picker=$("saleBatch");
 if(!picker?.value){
  status(picker?.disabled?"Belum ada setoran siap dijual.":"Pilih kelompok setoran terlebih dahulu.",true);
  picker?.focus();return;
 }
 if(!current){
  status("Rekap belum siap. Pilih kembali kelompok setoran.",true);
  picker.focus();return;
 }
 const print=$("f4SaleSheetPrint");print.disabled=true;
 try{
  // Cetak ulang kelompok yang sudah dikunci cukup membaca data, tanpa
  // mempersiapkan stok atau menggandakan transaksi lagi.
  const data=await fetchSheet(current.batchId,current.status==="siap"?__f4.globals.undefined:{action:"prepare"});
  current=data;
  $("f4SaleSheetNumber").textContent=data.saleNumber;
  $("f4SaleSheetReopen").hidden=false;
  status("Nota siap. Isi hasil dari lapak setelah ditandatangani.");
  await __f4.globals.F4Pdf.openHTML(sheetHtml(data));
 }catch(e){status(e.message||(0,__f4.globals.String)(e),true)}
 finally{
  print.disabled=false;
  print.textContent=current?.status==="siap"?"Cetak ulang nota":"Cetak nota";
 }
}
async function reopenBatch(){
 if(!current||current.status!=="siap")return;
 if(!await __f4.window.f4UiDialog.confirm("Buka kembali kelompok setoran? Lembar timbang yang sudah dicetak harus diganti."))return;
 try{await fetchSheet(current.batchId,{action:"reopen"});await refresh();status("Setoran dibuka kembali. Cetak ulang lembar setelah selesai mengubah data.")}
 catch(e){status(e.message||(0,__f4.globals.String)(e),true)}
}
__f4.window.F4SaleSheet={refresh,number:()=>current?.saleNumber||'',ready:()=>current?.status==="siap"};
if(__f4.globals.document.readyState==="loading")__f4.globals.document.addEventListener("DOMContentLoaded",install,{once:true});else install();
})();
});
