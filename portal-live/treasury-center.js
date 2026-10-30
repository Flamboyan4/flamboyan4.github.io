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
// Standalone themed calendar for Treasury forms (desktop and phone).
// The submitted value stays ISO YYYY-MM-DD; no native date dialog is shown.
function treasuryDateControl(){
 const input=el("input");input.type="hidden";input.value=today();
 const wrap=el("div",undefined,"tc-date-control");
 const trigger=el("button",undefined,"tc-date-trigger");trigger.type="button";
 trigger.setAttribute("aria-label","Pilih tanggal");
 const text=el("span"),icon=el("img",undefined,"tc-date-icon");icon.src="/assets/icons/calendar.svg";icon.alt="";icon.setAttribute("aria-hidden","true");
 trigger.append(text,icon);wrap.append(input,trigger);
 const months=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
 const days=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
 const format=iso=>{
  const m=String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?Number(m[3])+" "+months[Number(m[2])-1]+" "+m[1]:"Pilih tanggal";
 };
 const two=n=>String(n).padStart(2,"0");
 function update(){text.textContent=format(input.value)}
 update();
 trigger.onclick=()=>{
  const parts=input.value.split("-").map(Number);
  let year=parts[0]||new Date().getFullYear(),month=(parts[1]||1)-1;
  const overlay=el("div",undefined,"tc-date-overlay");
  const dialog=el("section",undefined,"tc-date-dialog");
  dialog.setAttribute("role","dialog");dialog.setAttribute("aria-modal","true");
  dialog.setAttribute("aria-label","Kalender Pusat Keuangan");
  overlay.append(dialog);document.body.append(overlay);
  const oldFocus=document.activeElement;
  const close=()=>{
   document.removeEventListener("keydown",keyHandler);
   overlay.remove();oldFocus?.focus?.({preventScroll:true});
  };
  const keyHandler=e=>{if(e.key==="Escape"){e.preventDefault();close()}};
  document.addEventListener("keydown",keyHandler);
  overlay.addEventListener("click",e=>{if(e.target===overlay)close()});
  function render(){
   dialog.replaceChildren();
   const nav=el("div",undefined,"tc-date-nav");
   const prev=el("button","‹"),heading=el("strong",months[month]+" "+year);
   const next=el("button","›");
   prev.type=next.type="button";
   prev.setAttribute("aria-label","Bulan sebelumnya");
   next.setAttribute("aria-label","Bulan berikutnya");
   prev.onclick=()=>{month--;if(month<0){month=11;year--}render()};
   next.onclick=()=>{month++;if(month>11){month=0;year++}render()};
   nav.append(prev,heading,next);
   const grid=el("div",undefined,"tc-date-grid");
   days.forEach(day=>grid.append(el("span",day,"tc-date-week")));
   const offset=new Date(year,month,1).getDay();
   for(let j=0;j<offset;j++)grid.append(el("span"));
   const max=new Date(year,month+1,0).getDate();
   for(let day=1;day<=max;day++){
    const iso=year+"-"+two(month+1)+"-"+two(day);
    const b=el("button",String(day),"tc-date-day"+(input.value===iso?" selected":""));
    b.type="button";b.setAttribute("aria-label",format(iso));
    b.onclick=()=>{input.value=iso;input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));update();close()};
    grid.append(b);
   }
   const footer=el("div",undefined,"tc-date-footer");
   const current=el("button","Hari ini"),cancel=el("button","Tutup");
   current.type=cancel.type="button";
   current.onclick=()=>{input.value=today();input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));update();close()};
   cancel.onclick=close;footer.append(current,cancel);
   dialog.append(nav,grid,footer);
   prev.focus({preventScroll:true});
  }
  render();
 };
 return {input,element:wrap,trigger,refresh:update};
}
function buildOpeningGrid(target,data,refresh){
 const shell=el("section",undefined,"tc-panel tc-opening-panel tc-no-print");
 const head=el("div",undefined,"tc-opening-heading");
 head.append(el("h3","Saldo Awal"),el("small","Isi posisi uang sebenarnya, bukan seluruh pembayaran iuran."));
 shell.append(head);
 const form=el("form",undefined,"tc-opening-form");
 const controls=el("div",undefined,"tc-opening-controls");
 const dateCtl=treasuryDateControl(),date=dateCtl.input;
 date.value=data.openingDate||today();dateCtl.refresh();
 if(data.openingCount){dateCtl.trigger.disabled=true;dateCtl.trigger.title="Tanggal saldo awal sudah tercatat";}
 controls.append(field("Tanggal saldo awal",dateCtl.element));
 if(!data.openingDateConsistent)controls.append(el("p","Tanggal pembuka lama tidak seragam. Periksa sebelum menyimpan.","tc-source-warning"));
 shell.append(controls);
 const grid=el("div",undefined,"tc-opening-table");
 const header=el("div",undefined,"tc-opening-row tc-opening-header");
 ["Program","Cash","QRIS","Mandiri"].forEach(x=>header.append(el("strong",x)));
 grid.append(header);
 const entries=[];
 const use=["cash","qris","mandiri"];
 for(const f of data.catalog.funds){
  const line=el("div",undefined,"tc-opening-row");
  line.append(el("strong",f.name,"tc-opening-name"));
  for(const type of use){
   const location=type==="cash"?f.cash:type;
   const cell=el("label",undefined,"tc-opening-cell");
   cell.append(el("span",type==="cash"?"Cash":type==="qris"?"QRIS":"Mandiri"));
   const amountInput=el("input");
   amountInput.type="number";amountInput.inputMode="numeric";amountInput.min="0";amountInput.max="10000000000";
   amountInput.step="1";amountInput.placeholder="0";
   amountInput.setAttribute("aria-label",f.name+" — "+(type==="cash"?"Cash":type==="qris"?"QRIS":"Mandiri"));
   const existing=amount(data.balances,f.id,location);
   amountInput.value=existing?String(existing):"";
   cell.append(amountInput);line.append(cell);
   entries.push({fundId:f.id,locationId:location,input:amountInput});
  }
  grid.append(line);
 }
 form.append(grid);
 const footer=el("div",undefined,"tc-opening-footer");
 const total=el("strong","Total: Rp0","tc-opening-total");
 const actions=el("div",undefined,"tc-opening-actions");
 const save=el("button","Simpan Saldo Awal","tc-primary");save.type="submit";
 const approve=el("button","Sahkan Saldo","tc-secondary");approve.type="button";
 approve.disabled=!data.openingCount||!data.openingDateConsistent;
 if(!data.openingCount)approve.title="Simpan saldo awal terlebih dahulu";
 actions.append(save,approve);footer.append(total,actions);form.append(footer);
 const status=el("p","","tc-status");status.setAttribute("role","status");form.append(status);
 shell.append(form);
 const hint=el("p","Cash dipisah per program. QRIS hanya yang belum cair; Mandiri hanya yang sudah masuk rekening.","tc-helper");
 shell.append(hint);target.append(shell);
 let requestKey="";
 const positions=()=>entries.map(e=>({fundId:e.fundId,locationId:e.locationId,amountRp:Number(e.input.value||0)}));
 const updateTotal=()=>{
  const values=positions(),sum=values.reduce((n,x)=>n+x.amountRp,0);
  total.textContent="Total: "+rp(sum);
  save.disabled=values.some(x=>!Number.isSafeInteger(x.amountRp)||x.amountRp<0||x.amountRp>10000000000)
   ||sum<=0||!data.openingDateConsistent;
 };
 form.addEventListener("input",()=>{requestKey="";updateTotal()});
 updateTotal();
 form.onsubmit=async e=>{
  e.preventDefault();
  if(!form.reportValidity()||save.disabled)return;
  requestKey||=crypto.randomUUID();
  save.disabled=true;approve.disabled=true;status.textContent="Menyimpan saldo awal…";
  try{
   const result=await post({action:"opening-grid",date:date.value,positions:positions(),requestKey});
   status.textContent=result.unchanged?"Saldo tidak berubah.":"Saldo awal tersimpan.";
   await refresh();
  }catch(err){status.textContent=err.message;updateTotal();approve.disabled=!data.openingCount}
 };
 approve.onclick=async()=>{
  if(!data.openingCount)return;
  const currentValues=positions();
  const changed=currentValues.some(x=>x.amountRp!==amount(data.balances,x.fundId,x.locationId));
  if(changed){status.textContent="Simpan perubahan nominal dahulu, baru sahkan.";return}
  if(!confirm("Sudah cocok dengan uang Cash, QRIS yang belum cair, dan Mandiri? Saldo awal akan dikunci dan tidak dapat diubah."))return;
  approve.disabled=true;save.disabled=true;status.textContent="Mengesahkan saldo awal…";
  try{await post({action:"confirm",date:date.value,confirmation:"SALDO COCOK"});await refresh()}
  catch(err){status.textContent=err.message;approve.disabled=false;updateTotal()}
 };
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
 const dateCtl=treasuryDateControl(),date=dateCtl.input;
 const value=el("input");value.type="number";value.min="1";value.max="10000000000";value.step="1";value.placeholder="0";value.required=true;
 const note=el("input");note.maxLength=240;note.minLength=4;note.required=true;note.placeholder="Keterangan singkat";
 const originFund=field("Pos asal",fromFund),destinationFund=field("Pos tujuan",toFund);
 const originLoc=field("Tempat asal",fromLoc),destinationLoc=field("Tempat tujuan",toLoc);
 const actionField=field("Jenis",action);
 const grid=el("div",undefined,"tc-form-grid");
 append(grid,actionField,field("Tanggal",dateCtl.element),originFund,originLoc,destinationFund,destinationLoc,field("Nominal (Rp)",value),field("Keterangan",note,"tc-wide"));
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
 const sync=el("button","Sinkronkan Kas Lorong ("+book.length+")","tc-secondary");
 sync.type="button";sync.disabled=!book.length;
 sync.onclick=async()=>{
  if(!confirm("Cocokkan jurnal Kas Lorong yang telah dibukukan sebagai Cash Kas Lorong? Pastikan dana belum termasuk saldo awal."))return;
  sync.disabled=true;status.textContent="Mencocokkan Kas Lorong…";
  try{
   const v=await post({action:"sync-book"});
   status.textContent=(v.imported||0)+" transaksi dihubungkan.";
   await refresh();
  }catch(e){status.textContent=e.message;sync.disabled=false}
 };
 quick.append(sync,el("span","Hanya jurnal Kas Lorong yang sudah dibukukan; Setoran RT dan Arisan tidak ikut.","tc-muted"));
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
 panel.append(heading("Pusat Keuangan","Kas Lorong & program lain • QRIS/Mandiri bersama"));
 const banner=el("div",data.confirmed?
  "Saldo awal dikunci "+data.confirmedOn+". Perubahan setelahnya mengikuti jurnal Pusat Keuangan.":
  "Saldo belum final. Isi saldo awal per pos dan tempat dana, lalu sahkan.","tc-notice "+(data.confirmed?"tc-ok":"tc-warn"));
 panel.append(banner);
 if(!data.confirmed){
   const refresh=()=>fetchData().then(render);
   buildOpeningGrid(panel,data,refresh);
   const history=el("section",undefined,"tc-panel tc-opening-history");
   const rows=data.history.slice(0,30).map(x=>[x.occurred_on,
     data.catalog.funds.find(f=>f.id===x.fund_id)?.name||"Pos tersimpan",
     data.catalog.locations.find(l=>l.id===x.location_id)?.name||"Tempat",
     (Number(x.amount_rp)>0?"+":"−")+rp(Math.abs(Number(x.amount_rp)))]);
   if(rows.length){
    const details=el("details");details.append(el("summary","Riwayat pengisian saldo awal ("+rows.length+")"));
    simpleTable(details,["Tanggal","Program","Tempat","Perubahan"],rows);history.append(details);
    panel.append(history);
   }
   return;
 }
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
 panel.append(el("p","Kas Lorong hanya menghitung jurnal kas Humas yang telah dibukukan; Setoran RT dan Arisan bukan saldo Humas. Dana Jersey dan projek lain perlu dicocokkan terpisah.","tc-footer tc-no-print"));
}
async function open(){
 main.replaceChildren(heading("Pusat Keuangan","Memuat saldo…"));
 try{render(await fetchData())}
 catch(e){main.append(el("p",e.message,"tc-status"))}
}
window.f4OpenTreasuryCenter=open;
})();
