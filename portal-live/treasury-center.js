// Pusat Keuangan Flamboyan 4 — hanya Superadmin, tidak memodifikasi modul sumber.
(()=>{
"use strict";
const API="https://api.flamboyan4.web.id/api/v2/admin/treasury";
const root=document.getElementById("f4-account-page");
if(!root)return;
const main=root.querySelector("main");
const rp=n=>"Rp"+Math.round(Number(n)||0).toLocaleString("id-ID");
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const el=(tag,content,cls)=>{const node=document.createElement(tag);if(content!==undefined)node.textContent=String(content);if(cls)node.className=cls;return node};
const append=(parent,...items)=>{parent.append(...items);return parent};
const amount=(balances,fund,location)=>Number(balances.find(x=>x.fund_id===fund&&x.location_id===location)?.amount_rp||0);
const kindLabels={opening:"Saldo awal",incoming:"Dana masuk",outgoing:"Dana keluar",move:"Pindah tempat",allocation:"Pindah pos"};
let current=null;
function heading(title,sub){
 const head=el("header",undefined,"f4-work-heading");
 head.append(el("h2",title),el("p",sub));return head;
}
async function fetchData(){
 const r=await fetch(API,{credentials:"include",cache:"no-store"});
 const v=await r.json().catch(()=>({}));
 if(!r.ok||v.ok===false)throw Error(v.error||"Gagal mengambil data.");
 return v;
}
async function post(payload){
 const r=await fetch(API,{method:"POST",credentials:"include",
 headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
 const v=await r.json().catch(()=>({}));
 if(!r.ok||v.ok===false)throw Error(v.error||"Penyimpanan ditolak.");
 return v;
}
function simpleTable(parent,head,rows,cls=""){
 const wrap=el("div",undefined,"tc-table-wrap "+cls);
 const table=el("table",undefined,"tc-table");
 const thead=el("thead"),tr=el("tr");
 head.forEach(t=>tr.append(el("th",t)));thead.append(tr);table.append(thead);
 const body=el("tbody");
 rows.forEach(cells=>{const row=el("tr");cells.forEach((cell,i)=>{
  const td=el("td",cell);if(i>0&&/^([+-]?Rp|—)/.test(String(cell)))td.classList.add("tc-num");row.append(td);
 });body.append(row)});
 table.append(body);wrap.append(table);parent.append(wrap);return table;
}
function card(name,value,caption){
 const d=el("div",undefined,"tc-stat");
 d.append(el("small",name),el("strong",value),el("span",caption));return d;
}
function fields(catalog,fundId){
 const fund=catalog.funds.find(x=>x.id===fundId)||catalog.funds[0];
 return catalog.locations.filter(l=>l.id==="qris"||l.id==="mandiri"||l.id===fund?.cash);
}
function select(options,cls=""){
 const s=el("select",undefined,cls);
 options.forEach(o=>{const opt=el("option",o.name);opt.value=o.id;s.append(opt)});
 return s;
}
function field(label,node,cls=""){
 const w=el("label",undefined,"tc-field "+cls);w.append(el("span",label),node);return w;
}
function buildForm(target,data,refresh){
 const {funds}=data.catalog;
 const shell=el("section",undefined,"tc-panel tc-no-print");
 shell.append(el("h3",data.confirmed?"Catat Mutasi Dana":"Isi Saldo Awal"));
 const form=el("form",undefined,"tc-form");
 const action=select((data.confirmed?["move","allocation","incoming","outgoing"]:["opening"])
   .map(k=>({id:k,name:kindLabels[k]})));
 const fromFund=select(funds),toFund=select(funds);
 const fromLoc=select([]),toLoc=select([]);
 const date=el("input");date.type="date";date.value=today();date.required=true;
 const value=el("input");value.type="number";value.min="1";value.max="10000000000";value.step="1";value.placeholder="0";value.required=true;
 const note=el("input");note.maxLength=240;note.minLength=4;note.required=true;note.placeholder="Keterangan singkat";
 const originFund=field("Pos asal",fromFund),destinationFund=field("Pos tujuan",toFund);
 const originLoc=field("Tempat asal",fromLoc),destinationLoc=field("Tempat tujuan",toLoc);
 const actionField=field("Jenis",action);
 const grid=el("div",undefined,"tc-form-grid");
 append(grid,actionField,field("Tanggal",date),originFund,originLoc,destinationFund,destinationLoc,field("Nominal (Rp)",value),field("Keterangan",note,"tc-wide"));
 form.append(grid);
 const noteText=el("p",data.confirmed?
   "Dana dari modul lain jangan dicatat ulang jika sudah tercatat di Pusat Keuangan.":
   "Masukkan uang yang benar-benar ada pada setiap tempat, tanpa menghitung QRIS yang sudah masuk Mandiri.","tc-helper");
 const status=el("p","","tc-status");status.setAttribute("role","status");
 const save=el("button",data.confirmed?"Simpan Mutasi":"Simpan Saldo Awal","tc-primary");save.type="submit";
 append(form,noteText,save,status);shell.append(form);target.append(shell);
 function locChoices(box,fund,prefer){
  const previous=prefer||box.value;
  box.replaceChildren();
  fields(data.catalog,fund).forEach(o=>{const opt=el("option",o.name);opt.value=o.id;box.append(opt)});
  if([...box.options].some(o=>o.value===previous))box.value=previous;
 }
 function refreshFields(){
  const kind=action.value;
  originFund.hidden=kind==="opening"||kind==="incoming";
  originLoc.hidden=kind==="opening"||kind==="incoming";
  destinationFund.hidden=kind==="outgoing"||kind==="move";
  destinationLoc.hidden=kind==="outgoing";
  // Dropdown tujuan perpindahan tempat mengikuti pos asal.
  locChoices(fromLoc,fromFund.value);
  locChoices(toLoc,kind==="move"?fromFund.value:toFund.value);
  if(kind==="move"&&toLoc.value===fromLoc.value){
   const alternate=[...toLoc.options].find(x=>x.value!==fromLoc.value);
   if(alternate)toLoc.value=alternate.value;
  }
 }
 action.onchange=refreshFields;
 fromFund.onchange=refreshFields;
 toFund.onchange=refreshFields;
 fromLoc.onchange=()=>{if(action.value==="move"&&toLoc.value===fromLoc.value)refreshFields()};
 refreshFields();
 let pendingKey="";
 form.addEventListener("input",()=>{pendingKey=""});
 form.onsubmit=async e=>{
  e.preventDefault();
  if(!form.reportValidity())return;
  pendingKey||=crypto.randomUUID();
  save.disabled=true;status.textContent="Menyimpan…";
  const payload={action:action.value,date:date.value,amountRp:Number(value.value),note:note.value.trim(),
   fromFund:fromFund.value,fromLocation:fromLoc.value,toFund:toFund.value,toLocation:toLoc.value,requestKey:pendingKey};
  try{await post(payload);status.textContent="Mutasi tersimpan.";await refresh()}
  catch(err){status.textContent=err.message;save.disabled=false}
 };
}
function buildConfirm(target,data,refresh){
 if(data.confirmed)return;
 const panel=el("section",undefined,"tc-panel tc-no-print");
 const head=el("h3","Sahkan Saldo Awal");
 const desc=el("p","Cocokkan Cash tiap program, saldo QRIS belum cair, dan rekening Mandiri. Pengesahan mengunci saldo awal.");
 const row=el("div",undefined,"tc-confirm-row");
 const date=el("input");date.type="date";date.value=today();
 const b=el("button","Saldo Sudah Cocok","tc-primary");b.type="button";b.disabled=!data.openingCount;
 const msg=el("p",data.openingCount?"":"Isi minimal satu saldo awal.","tc-status");
 b.onclick=async()=>{
   if(!confirm("Yakin seluruh saldo awal sudah dicocokkan? Setelah disahkan tidak bisa diubah."))return;
   b.disabled=true;msg.textContent="Mengesahkan…";
   try{await post({action:"confirm",date:date.value,confirmation:"SALDO COCOK"});await refresh()}
   catch(e){msg.textContent=e.message;b.disabled=false}
 };
 row.append(date,b);panel.append(head,desc,row,msg);target.append(panel);
}
function buildSources(target,data,refresh){
 if(!data.confirmed)return;
 const panel=el("section",undefined,"tc-panel tc-no-print");
 const head=el("div",undefined,"tc-section-head");
 head.append(el("h3","Cocokkan Transaksi Portal"));
 panel.append(head);
 const book=(data.sources||[]).filter(x=>x.type==="book");
 const bank=(data.sources||[]).filter(x=>x.type==="bank");
 const status=el("p","","tc-status");
 if(data.sourceWarnings?.length){
  panel.append(el("p",data.sourceWarnings.length+" transaksi yang sudah dihubungkan berubah atau dibatalkan di modul sumber. Periksa dan koreksi mutasi sebelum menggunakan total saldo.","tc-source-warning"));
 }
 const quick=el("div",undefined,"tc-sync");
 const sync=el("button","Sinkronkan Buku Kas ("+book.length+")","tc-secondary");
 sync.type="button";sync.disabled=!book.length;
 sync.onclick=async()=>{
  if(!confirm("Masukkan transaksi Buku Kas yang sudah dibukukan sebagai Cash Kas RT? Pastikan belum tercakup dalam saldo awal."))return;
  sync.disabled=true;status.textContent="Mencocokkan Buku Kas…";
  try{
   const v=await post({action:"sync-book"});
   status.textContent=(v.imported||0)+" transaksi dihubungkan.";
   await refresh();
  }catch(e){status.textContent=e.message;sync.disabled=false}
 };
 quick.append(sync,el("span","Dikerjakan per 25 transaksi; dana yang belum dibukukan tidak diikutkan.","tc-muted"));
 panel.append(quick);
 if(bank.length){
  panel.append(el("h4","Bank Sampah — pilih tempat uang sebenarnya"));
  const table=el("div",undefined,"tc-source-list");
  const fundById=new Map(data.catalog.funds.map(f=>[f.id,f]));
  bank.slice(0,30).forEach(src=>{
   const line=el("div",undefined,"tc-source-row");
   const details=el("div",undefined,"tc-source-details");
   details.append(el("strong",src.date+" · "+rp(src.amountRp)),
    el("span",(fundById.get(src.fund)?.name||"Bank Sampah")+" · "+src.note));
   const pick=select([{id:"",name:"Pilih tempat uang"},...fields(data.catalog,src.fund)]);
   pick.value="";pick.setAttribute("aria-label","Tempat penerimaan atau pengeluaran");
   const save=el("button","Catat","tc-secondary");save.type="button";
   save.onclick=async()=>{
    if(!pick.value){status.textContent="Pilih tempat uang untuk transaksi Bank Sampah.";pick.focus();return}
    save.disabled=true;status.textContent="Menghubungkan transaksi…";
    try{
     await post({action:"link",sourceType:src.type,sourceId:src.id,location:pick.value});
     await refresh();
    }catch(e){status.textContent=e.message;save.disabled=false}
   };
   line.append(details,pick,save);table.append(line);
  });
  panel.append(table);
 }
 if(!book.length&&!bank.length)panel.append(el("p","Tidak ada transaksi sumber baru yang menunggu dicocokkan.","tc-muted"));
 if(data.sourcePartial||bank.length>30)panel.append(el("p","Masih ada transaksi lain; selesaikan daftar ini, lalu muat ulang.","tc-muted"));
 panel.append(status);target.append(panel);
}
function render(data){
 current=data;
 main.replaceChildren();
 const panel=el("div",undefined,"tc-center");
 main.append(panel);
 panel.append(heading("Pusat Keuangan","Cash terpisah • QRIS dan Mandiri bersama"));
 const banner=el("div",data.confirmed?
  "Saldo awal dikunci "+data.confirmedOn+". Perubahan setelahnya mengikuti jurnal Pusat Keuangan.":
  "Saldo belum final. Isi saldo awal per pos dan tempat dana, lalu sahkan.","tc-notice "+(data.confirmed?"tc-ok":"tc-warn"));
 panel.append(banner);
 const cards=el("div",undefined,"tc-summary");
 const cash=data.balances.filter(x=>x.location_id.startsWith("cash:")).reduce((n,x)=>n+Number(x.amount_rp||0),0);
 const qris=data.balances.filter(x=>x.location_id==="qris").reduce((n,x)=>n+Number(x.amount_rp||0),0);
 const mandiri=data.balances.filter(x=>x.location_id==="mandiri").reduce((n,x)=>n+Number(x.amount_rp||0),0);
 append(cards,card("Total Tercatat",rp(data.totalRp),data.confirmed?"Sejak saldo awal":"Belum disahkan"),
  card("Cash",rp(cash),"Terpisah per program"),card("QRIS",rp(qris),"Hanya yang belum cair"),
  card("Mandiri",rp(mandiri),"Rekening bersama"));
 panel.append(cards);
 const ownership=el("section",undefined,"tc-panel");
 ownership.append(el("h3","Saldo per Pos"));
 const rows=data.catalog.funds.map(f=>{
  const ownCash=amount(data.balances,f.id,f.cash),ownQris=amount(data.balances,f.id,"qris"),ownBank=amount(data.balances,f.id,"mandiri");
  return [f.name,rp(ownCash),rp(ownQris),rp(ownBank),rp(ownCash+ownQris+ownBank)];
 });
 rows.push(["TOTAL",rp(cash),rp(qris),rp(mandiri),rp(data.totalRp)]);
 simpleTable(ownership,["Program","Cash","QRIS","Mandiri","Total"],rows);
 panel.append(ownership);
 const refresh=()=>fetchData().then(render);
 buildForm(panel,data,refresh);
 buildConfirm(panel,data,refresh);
 buildSources(panel,data,refresh);
 const history=el("section",undefined,"tc-panel");
 const h=el("div",undefined,"tc-section-head");
 h.append(el("h3","Riwayat Mutasi"));
 const print=el("button","Cetak","tc-secondary tc-no-print");print.type="button";
 print.disabled=!data.riwayatLengkap;print.onclick=()=>window.print();
 h.append(print);history.append(h);
 const funds=new Map(data.catalog.funds.map(x=>[x.id,x.name]));
 const locations=new Map(data.catalog.locations.map(x=>[x.id,x.name]));
 const historyRows=data.history.map(x=>[x.occurred_on,kindLabels[x.kind]||x.kind,
  funds.get(x.fund_id)||"Pos arsip",locations.get(x.location_id)||"Tempat arsip",
  (Number(x.amount_rp)>0?"+":"−")+rp(Math.abs(Number(x.amount_rp))),x.note]);
 simpleTable(history,["Tanggal","Jenis","Pos","Tempat","Mutasi","Keterangan"],historyRows);
 if(!historyRows.length)history.append(el("p","Belum ada mutasi.","tc-muted"));
 if(!data.riwayatLengkap)history.append(el("p","Riwayat panjang; cetak dinonaktifkan agar tidak terpotong.","tc-status"));
 panel.append(history);
 panel.append(el("p","Penting: laporan sumber dari Pembukuan, Bank Sampah, dan Jersey belum tersinkron otomatis ke jurnal ini. Saldo pusat hanya akurat setelah semua saldo awal dan mutasi lanjutan dicocokkan.","tc-footer tc-no-print"));
}
async function open(){
 main.replaceChildren(heading("Pusat Keuangan","Memuat saldo…"));
 try{render(await fetchData())}
 catch(e){main.append(el("p",e.message,"tc-status"))}
}
window.f4OpenTreasuryCenter=open;
})();
