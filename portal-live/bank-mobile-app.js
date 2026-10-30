/* Bank Sampah Flamboyan 4 — canonical mobile banking UI.
   Real sources: existing D1-backed dashboard, member statement, print and manager APIs.
   One member page per purpose. No duplicate balance cards or pretend transactions. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{
  const node=document.createElement(tag);if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text;return node;
};
const rupiah=n=>"Rp "+Number(n||0).toLocaleString("id-ID");
const money=s=>Number(String(s||"").replace(/[^\d-]/g,""))||0;
const today=()=>{
  const pieces=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const obj=Object.fromEntries(pieces.filter(p=>["year","month","day"].includes(p.type)).map(x=>[x.type,x.value]));
  return obj.year+"-"+obj.month+"-"+obj.day;
};
const apiRoot="https://api.flamboyan4.web.id";
async function api(path,payload){
  const response=await fetch(apiRoot+path,{method:payload?"POST":"GET",credentials:"include",mode:"cors",cache:"no-store",
    ...(payload?{headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}:{})});
  const body=await response.json().catch(()=>({ok:false,error:"Respons layanan tidak terbaca."}));
  if(!response.ok||body.ok===false)throw Error(body.error||"Layanan belum tersedia ("+response.status+").");
  return body;
}
const adminActions=[
  ["Setoran","setoran","bank.svg"],["Penjualan","penjualan","cash.svg"],
  ["Saldo warga","tabungan","pay.svg"],["Laporan","laporan","book.svg"]
];
const memberActions=[
  ["Cara Setor","bank-deposit","bank.svg"],["Riwayat","bank-history","book.svg"],
  ["Pencairan","bank-payout","cash.svg"],["Laporan","bank-report","pay.svg"]
];
const adminDock=[
  ["Beranda","dashboard","home.svg"],["Setoran","setoran","bank.svg"],
  ["Penjualan","penjualan","cash.svg"],["Saldo","tabungan","pay.svg"],["Menu","menu","menu.svg"]
];
const memberDock=[
 ["Beranda","dashboard","home.svg"],["Tabungan","pribadi","cash.svg"],
 ["Pencairan","bank-payout","pay.svg"],["Riwayat","bank-history","book.svg"],
 ["Profil","profile","user.svg"]
];
let role=null,screen="dashboard",historyMonth="latest",reportMonth="",activePage=null;
let homeSource=null,summaryExtra=null,memberSource=null,managerQueue=null;
let primaryNode=null,extraNode=null;
let ready=false,requestNonce="",requestEnabled=false;
let memberStatement=null,memberChartMode="kg";
let refreshing=false;
const custom=["bank-history","bank-payout","bank-report"];
const text=(id,val)=>{if($(id)&&$(id).textContent!==String(val))$(id).textContent=String(val)};
const image=file=>{const img=el("img");img.src="/assets/icons/"+file;img.alt="";img.setAttribute("aria-hidden","true");return img;};
function roleType(){
 const r=String(document.body.dataset.f4BankRole||"").toLowerCase();
 return ["admin","superadmin"].includes(r)?"admin":["warga","anggota"].includes(r)?"member":null;
}
function action([title,route,asset],dock=false){
 const b=el("button",dock?"f4-bank-app-dock-action":"f4-bank-app-action");
 b.type="button";b.dataset.bankAppRoute=route;b.setAttribute("aria-label",title);
 const symbol=el("span","f4-bank-app-action-icon");symbol.append(image(asset));
 b.append(symbol,el("span","f4-bank-app-action-name",title));
 b.onclick=()=>navigate(route);return b;
}
function dock(){
 let nav=$("f4BankAppDock");
 if(!nav){nav=el("nav","f4-bank-app-dock");nav.id="f4BankAppDock";nav.setAttribute("aria-label","Menu bawah Bank Sampah");document.body.append(nav);}
 return nav;
}
function markDock(){
 const nav=dock();
 for(const b of nav.querySelectorAll("[data-bank-app-route]")){
  const selected=b.dataset.bankAppRoute===screen || (role==="admin"&&b.dataset.bankAppRoute==="menu"&&!["dashboard","setoran","penjualan","tabungan"].includes(screen));
  b.classList.toggle("is-active",selected);
  if(selected)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
 }
}
function statusFor(page){
 const gate=$("v12Gate"),privateArea=$("v12Private");
 if(!page)return;
 const msg=page.querySelector(".f4-bank-screen-status");
 if(!msg)return;
 const loaded=privateArea&&!privateArea.classList.contains("hidden");
 msg.hidden=!!loaded;
 if(!loaded)msg.textContent=gate?.textContent?.trim()||"Memuat tabungan...";
}
function ensureHome(){
 const page=$("pageDashboard");
 if(!page||!page.classList.contains("v14-home"))return;
 let hub=$("f4BankAppHome");
 if(!hub){
  hub=el("section","f4-bank-app-home");hub.id="f4BankAppHome";
  const welcome=el("div","f4-bank-app-personal-greeting");welcome.id="f4BankAppWelcome";
  welcome.append(el("small","","TABUNGAN LINGKUNGAN"),el("strong","", "Halo!"));
  const card=el("button","f4-bank-member-card");card.id="f4BankMemberCard";card.type="button";card.onclick=()=>navigate("profile");
  const cardHead=el("span","f4-bank-member-card-head"),logo=el("img");logo.src="/assets/logo-flamboyan.svg";logo.alt="";
  cardHead.append(logo,el("span","","BANK SAMPAH · FLAMBOYAN 4"),el("span","f4-bank-member-card-chip"));
  const identity=el("span","f4-bank-member-card-foot");
  const box=el("span");box.append(el("small","","KARTU ANGGOTA DIGITAL"),el("strong","","—"));
  box.querySelector("strong").id="f4BankCardNumber";box.append(el("small","f4-bank-card-house","Rumah —"));
  identity.append(box,el("span","f4-bank-card-leaf","✦"));card.append(cardHead,identity);
  const savings=el("button","f4-bank-app-member-balance");savings.id="f4BankAppMemberBalance";savings.type="button";
  savings.append(el("span","f4-bank-member-balance-label","Saldo terkonfirmasi"),
    el("strong","f4-bank-member-balance-value","—"),el("span","f4-bank-member-chevron","›"));
  savings.onclick=()=>navigate("pribadi");
  const hero=el("div","f4-bank-app-hero");hero.id="f4BankAppAdminHero";
  const heading=el("small","","BANK SAMPAH FLAMBOYAN 4"),label=el("strong","f4-bank-app-balance-title","Hasil diterima lapak"),
    amount=el("strong","f4-bank-app-balance","—"),secondary=el("span","f4-bank-app-secondary","Memuat...");
  amount.id="f4BankAppBalance";secondary.id="f4BankAppSecondary";
  hero.append(heading,label,amount,secondary);
  const shortcuts=el("section","f4-bank-app-shortcuts-wrap");
  shortcuts.append(el("h3","f4-bank-app-shortcuts-title","Akses Cepat"));
  const shortcutsGrid=el("div","f4-bank-app-shortcuts");shortcutsGrid.id="f4BankAppShortcuts";shortcuts.append(shortcutsGrid);
  const minis=el("div","f4-bank-app-minis");minis.id="f4BankAppMinis";
  hub.append(welcome,card,savings,hero,shortcuts,minis);
  page.prepend(hub);
 }
 hub.dataset.bankRole=role;
 $("f4BankAppShortcuts").replaceChildren(...(role==="admin"?adminActions:[]).map(x=>action(x)));
 $("f4BankAppShortcuts").parentElement.hidden=role==="member";
 const name=$("pName")?.textContent?.trim()||"Anggota";
 const house=$("pHome")?.textContent?.trim()||"—";
 updateCardNumber();
 const welcome=$("f4BankAppWelcome");if(welcome){
   welcome.replaceChildren(el("small","","Selamat datang"),el("strong","","Halo, "+name+"!"));
   welcome.append(el("small","","Rumah "+house));
 }
 updateCardNumber();
 const houseNode=hub.querySelector(".f4-bank-card-house");if(houseNode)houseNode.textContent="Rumah "+house;
 updateProfileCard();
 // Keep the original live-data nodes in the DOM but out of the visual hierarchy.
 let reservoir=$("f4BankDashboardSource");
 if(!reservoir){reservoir=el("div","f4-bank-hidden-source");reservoir.id="f4BankDashboardSource";reservoir.hidden=true;page.append(reservoir);}
 for(const id of ["v14Primary","v14Extra"]){const node=$(id);if(node&&node.parentElement!==reservoir)reservoir.append(node);}
 if(role==="member"){
  const chart=$("f4-member-weight-chart");if(chart&&chart.parentElement!==reservoir)reservoir.append(chart);
  const flow=$("f4MemberFlow");if(flow&&flow.parentElement!==hub)hub.append(flow);
  const panels=page.querySelector(".v14-panels");
  const recent=$("v14Recent")?.closest(".v14-panel");
  if(recent&&recent.parentElement!==hub){
   const link=$("v14AllDeposits");if(link)link.onclick=()=>navigate("bank-history");
   hub.append(recent);
  }
  const remaining=panels?.querySelector(".v14-panel");
  if(remaining&&remaining.parentElement!==hub){hub.append(remaining);remaining.hidden=false;}
  ensureHomeChart();
 }else{
  const recent=$("v14Recent")?.closest(".v14-panel");
  if(recent&&recent.parentElement!==page.querySelector(".v14-panels"))page.querySelector(".v14-panels")?.prepend(recent);
 }
 updateDashboard();
}
function dashboardMetrics(){
 const map=new Map();
 for(const node of $("v14Primary")?.querySelectorAll(".v14-kpi")||[]){
  const label=node.querySelector(".v14-kpi-label")?.textContent?.trim();
  const value=node.querySelector("strong")?.dataset.f4FullValue||node.querySelector("strong")?.textContent?.trim();
  if(label)map.set(label,value||"—");
 }
 return map;
}
function updateDashboard(){
 if(!role||!$("f4BankAppHome"))return;
 const map=dashboardMetrics();
 if(role==="member"){
  const button=$("f4BankAppMemberBalance");
  if(button)button.replaceChildren(el("small","","Saldo terkonfirmasi"),
    el("strong","",map.get("Saldo sah")||"—"),el("span","f4-bank-member-chevron","›"));
  $("f4BankAppMinis")?.replaceChildren();
 }else{
  text("f4BankAppBalance",map.get("Hasil diterima lapak")||"—");
  text("f4BankAppSecondary","Berat tercatat: "+(map.get("Berat tercatat")||"—"));
  const opts=[["Anggota",map.get("Anggota aktif")],["Setoran",map.get("Setoran")],["Berat",map.get("Berat tercatat")]];
  $("f4BankAppMinis")?.replaceChildren(...opts.map(([label,value])=>{
   const node=el("div","f4-bank-app-mini");node.append(el("small","",label),el("strong","",value||"—"));return node;
  }));
 }
}
function ensureScreen(id,title){
 let node=$(id);
 if(!node){
  node=el("section","f4-bank-screen hidden");node.id=id;
  node.append(el("h2","f4-bank-screen-title",title));
  const section=$("dashboardView")?.querySelector(".section");
  if(section)section.append(node);
 }
 return node;
}
function mountSavings(){
 const page=$("pagePribadi"),priv=$("v12Private");
 if(!page||!priv||role!=="member")return;
 page.classList.add("f4-bank-savings-page");
 const source=$("f4BankPrivateSource")||el("div","f4-bank-hidden-source");
 source.id="f4BankPrivateSource";source.hidden=true;if(!source.isConnected)priv.append(source);
 const originalStats=priv.querySelector(":scope > .stats");
 if(originalStats&&originalStats.parentElement!==source)source.append(originalStats);
 const toolbar=priv.querySelector(".f4-member-tools");
 if(toolbar&&toolbar.parentElement!==source)source.append(toolbar);
 const history=$("v12History");
 if(history&&history.parentElement!==source){
  const heading=history.previousElementSibling;
  if(heading?.tagName==="H2")heading.remove();
  source.append(history);
 }
 priv.querySelector(".f4-member-payout-help")?.remove();
 $("f4BankMemberPayout")?.remove();
 const detailsHead=$("v12Deposits")?.previousElementSibling;
 if(detailsHead?.tagName==="P"&&detailsHead.classList.contains("hint"))detailsHead.remove();
 const revised=$("v12Deposits")?.previousElementSibling;
 if(revised?.tagName==="H2")revised.textContent="Rincian Setoran";
 if(!$("f4BankSavingsHero")){
  const hero=el("section","f4-bank-savings-hero");hero.id="f4BankSavingsHero";
  hero.append(el("small","","SALDO TABUNGAN"),el("strong","","—"),el("span","","Saldo dari hasil penjualan sah"));
  priv.insertBefore(hero,priv.firstChild);hero.querySelector("strong").id="f4BankSavingsBalance";
 }
 if(!$("f4BankSavingsStats")){
  const mini=el("div","f4-bank-savings-stats");mini.id="f4BankSavingsStats";
  for(const [title,key] of [["Masuk","f4BankSavingsCredit"],["Dicairkan","f4BankSavingsDebit"]]){
   const tile=el("div","f4-bank-savings-stat");tile.append(el("small","",title));
   const value=el("strong","","—");value.id=key;tile.append(value);mini.append(tile);
  }
  $("f4BankSavingsHero")?.after(mini);
 }
 if(!$("f4BankSavingsChart")){
  const chart=el("section","f4-bank-savings-chart");chart.id="f4BankSavingsChart";
  chart.append(el("h3","","Perkembangan Setoran"));
  const bars=el("div","f4-bank-savings-bars","Memuat...");bars.id="f4BankSavingsBars";chart.append(bars);
  $("f4BankSavingsStats")?.after(chart);
 }
 // Source table remains untouched for full PDF and CSV and private API bookkeeping.
 syncSavings();
}
function dateMonth(raw){
 const match=String(raw||"").match(/(\d{1,2})\s+([A-Za-z.]+)\s+(\d{4})/);
 if(!match)return "";
 const names=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
 const m=names.indexOf(match[2].replace(".",""));
 return m<0?"":match[3]+"-"+String(m+1).padStart(2,"0");
}
function ledger(){
 if(!memberStatement||!Array.isArray(memberStatement.mutasi))return [];
 return memberStatement.mutasi.map(x=>{
  const iso=String(x.tanggal||""),credit=Number(x.kredit)||0,debit=Number(x.debit)||0;
  const date=/^\d{4}-\d{2}-\d{2}$/.test(iso)?
   new Date(iso+"T12:00:00Z").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}):iso;
  return {date,iso,type:String(x.jenis||"Transaksi"),credit,debit,
   balance:rupiah(Number(x.saldo)||0),month:iso.slice(0,7)};
 }).sort((a,b)=>b.iso.localeCompare(a.iso));
}
function months(items){
 return [...new Set(items.map(x=>x.month).filter(Boolean))].sort().reverse();
}
function monthName(id){
 const [year,m]=String(id).split("-").map(Number);
 return new Intl.DateTimeFormat("id-ID",{month:"short",year:"numeric"}).format(new Date(year,m-1,1));
}
function populateMonths(host,values,current,onChange){
 if(!host)return;
 host.replaceChildren();
 for(const [key,label] of [["all","Semua"],...values.map(x=>[x,monthName(x)])]){
  if(host.tagName==="SELECT"){const opt=new Option(label,key);opt.selected=key===current;host.append(opt);}
  else {const b=el("button","f4-bank-month-chip"+(current===key?" is-active":""),label);
   b.type="button";b.setAttribute("aria-pressed",String(current===key));b.onclick=()=>onChange(key);host.append(b);}
 }
 if(host.tagName==="SELECT")host.onchange=()=>onChange(host.value);
}
function showHistory(){
 const page=ensureScreen("bank-history","Riwayat Transaksi");
 if(!$("f4BankHistoryList")){
  const filter=el("div","f4-bank-month-filter");filter.id="f4BankHistoryMonths";
  const list=el("div","f4-bank-history-list");list.id="f4BankHistoryList";
  page.append(el("p","f4-bank-screen-status","Memuat transaksi..."),filter,list);
 }
 const rows=ledger(),available=months(rows);
 if(historyMonth==="latest"||!available.includes(historyMonth)&&historyMonth!=="all")
  historyMonth=available[0]||"all";
 populateMonths($("f4BankHistoryMonths"),available,historyMonth,key=>{historyMonth=key;showHistory();});
 const host=$("f4BankHistoryList");host.replaceChildren();
 for(const line of rows.filter(x=>historyMonth==="all"||x.month===historyMonth)){
  const out=line.debit>0,amount=out?line.debit:line.credit;
  const item=el("article","f4-bank-history-line");
  item.append(el("span","f4-bank-history-icon "+(out?"is-out":"is-in"),out?"↑":"↓"));
  const desc=el("span","f4-bank-history-copy");desc.append(el("strong","",line.type),el("small","",line.date));
  const total=el("span","f4-bank-history-amount "+(out?"is-out":"is-in"));
  total.append(el("strong","",(out?"− ":"+ ")+rupiah(amount)),el("small","","Saldo "+line.balance));
  item.append(desc,total);host.append(item);
 }
 if(!host.childElementCount)host.append(el("p","f4-bank-empty",rows.length?"Tidak ada transaksi pada bulan ini.":"Belum ada transaksi tercatat."));
 statusFor(page);
}
function showReport(){
 const page=ensureScreen("bank-report","Laporan Tabungan");
 if(!$("f4BankReportMonth")){
  const filter=el("div","f4-bank-report-period");
  filter.append(el("label","","Periode"));
  const select=el("select");select.id="f4BankReportMonth";filter.append(select);
  const summary=el("div","f4-bank-report-summary");summary.id="f4BankReportSummary";
  const actions=el("div","f4-bank-report-actions");
  const pdf=el("button","f4-bank-gold-action","Cetak / PDF");pdf.type="button";
  pdf.onclick=()=>typeof window.v12Print==="function"&&window.v12Print();
  const csv=el("button","f4-bank-secondary-action","Unduh CSV");csv.type="button";
  csv.onclick=()=>typeof window.v12CSV==="function"&&window.v12CSV();
  actions.append(pdf,csv);
  page.append(el("p","f4-bank-screen-status","Memuat laporan..."),filter,summary,actions);
 }
 const rows=ledger(),available=months(rows);
 if(!reportMonth||reportMonth!=="all"&&!available.includes(reportMonth))reportMonth="all";
 populateMonths($("f4BankReportMonth"),available,reportMonth,x=>{reportMonth=x;showReport();});
 window.f4BankReportPeriod=()=>reportMonth==="all"?"":reportMonth;
 const visible=rows.filter(x=>reportMonth==="all"||x.month===reportMonth);
 const credits=visible.reduce((n,x)=>n+x.credit,0),debits=visible.reduce((n,x)=>n+x.debit,0);
 const box=$("f4BankReportSummary");box.replaceChildren();
 for(const [key,val] of [["Saldo saat ini",$("v12Balance")?.textContent||"—"],
    ["Masuk periode",rupiah(credits)],["Keluar periode",rupiah(debits)],["Transaksi",String(visible.length)]]){
  const tile=el("div","f4-bank-report-tile");tile.append(el("small","",key),el("strong","",val));box.append(tile);
 }
 statusFor(page);
}
function memberBuckets(){
 const list=Array.isArray(memberStatement?.setoran)?memberStatement.setoran:[];
 const grouped=new Map();
 for(const row of list){
  if(/batal/i.test(String(row.status||"")))continue;
  const confirmed=/terkonfirmasi/i.test(String(row.status||""));
  const period=String(confirmed?(row.tanggalJual||row.tanggal):row.tanggal).slice(0,7);
  if(!/^\d{4}-\d{2}$/.test(period))continue;
  if(!grouped.has(period))grouped.set(period,{month:period,weight:0,confirmed:0,estimated:0,missingWeight:false,missingValue:false});
  const entry=grouped.get(period);
  if(row.beratKg==null)entry.missingWeight=true;
  else entry.weight+=Number(row.beratKg)||0;
  if(confirmed){
   if(row.nilaiSahRp==null)entry.missingValue=true;
   else entry.confirmed+=Number(row.nilaiSahRp)||0;
  }else entry.estimated+=Number(row.estimasiRp)||0;
 }
 return [...grouped.values()].sort((a,b)=>a.month.localeCompare(b.month)).slice(-6);
}
function ensureHomeChart(){
 if(role!=="member"||!$("f4BankAppHome"))return;
 if(!$("f4BankHomeChart")){
  const box=el("section","f4-bank-savings-chart");box.id="f4BankHomeChart";
  box.append(el("h3","","Perkembangan Setoran"));
  const bars=el("div","f4-bank-savings-bars");bars.id="f4BankHomeBars";box.append(bars);
  $("f4BankAppMemberBalance")?.after(box);
 }
 chartSavings();
}
function drawSavingsBars(id){
 const host=$(id);if(!host)return;
 host.replaceChildren();
 if(!memberStatement){host.append(el("p","f4-bank-empty","Memuat grafik..."));return;}
 const data=memberBuckets();
 if(!data.length){host.append(el("p","f4-bank-empty","Belum ada setoran."));return;}
 const kg=memberChartMode==="kg";
 const max=Math.max(0.001,...data.map(x=>kg?x.weight:x.confirmed+x.estimated));
 for(const item of data){
  const col=el("div","f4-bank-savings-bar"),track=el("span","f4-bank-savings-bar-rail"),fill=el("i");
  fill.style.height=Math.max(4,(kg?item.weight:item.confirmed+item.estimated)/max*100)+"%";
  fill.className=!kg&&item.estimated>0?"is-estimate":"is-confirmed";
  track.append(fill);
  const value=kg?(item.missingWeight?"—":item.weight.toLocaleString("id-ID",{maximumFractionDigits:2})):
    item.missingValue?"—":rupiah(item.confirmed+item.estimated);
  col.append(el("strong","",value),track,el("small","",monthName(item.month).split(" ")[0]));
  if(item.missingWeight||item.missingValue)col.title="Ada data hasil jual yang belum tersedia";
  host.append(col);
 }
}
function chartSavings(){
 for(const id of ["f4BankSavingsChart","f4BankHomeChart"]){
  const box=$(id);if(!box)continue;
  let switcher=box.querySelector(".f4-bank-chart-switch");
  if(!switcher){
   switcher=el("div","f4-bank-chart-switch");
   for(const [mode,label] of [["kg","Kg"],["rp","Rp"]]){
    const button=el("button","",label);button.type="button";button.dataset.mode=mode;
    button.onclick=()=>{memberChartMode=mode;chartSavings();};
    switcher.append(button);
   }
   box.querySelector(".f4-bank-savings-bars")?.before(switcher);
  }
  switcher.querySelectorAll("button").forEach(b=>{
   const chosen=b.dataset.mode===memberChartMode;b.classList.toggle("is-active",chosen);
   b.setAttribute("aria-pressed",String(chosen));
  });
 }
 drawSavingsBars("f4BankSavingsBars");drawSavingsBars("f4BankHomeBars");
}
function syncSavings(){
 text("f4BankSavingsBalance",memberStatement?rupiah(memberStatement.saldo):"—");
 text("f4BankSavingsCredit",memberStatement?rupiah(memberStatement.totalMasuk):"—");
 text("f4BankSavingsDebit",memberStatement?rupiah(memberStatement.totalCair):"—");
 text("f4BankPayoutBalance",memberStatement?rupiah(memberStatement.saldo):"—");
 const requestButton=$("f4BankRequestSubmit");
 if(requestButton)requestButton.disabled=!requestEnabled||!memberStatement;
 chartSavings();
 if($("bank-history"))showHistory();
 if($("bank-report"))showReport();
 for(const route of custom){statusFor($(route));}
}
function ensureMemberPages(){
 if(role!=="member")return;
 mountSavings();
 ensureScreen("bank-history","Riwayat Transaksi");
 ensureScreen("bank-payout","Pengajuan Pencairan");
 ensureScreen("bank-report","Laporan Tabungan");
 if(!$("f4BankMemberRequestForm"))buildRequestPage();
 syncSavings();
}
function buildRequestPage(){
 const page=ensureScreen("bank-payout","Pengajuan Pencairan");
 const amount=el("strong","f4-bank-payout-balance","—");amount.id="f4BankPayoutBalance";
 const balance=el("div","f4-bank-payout-hero");balance.append(el("small","","Saldo terkonfirmasi"),amount);
 const form=el("form","f4-bank-request-form");form.id="f4BankMemberRequestForm";
 form.innerHTML='<label for="f4BankPayoutAmount">Nominal pencairan (Rp)</label><input id="f4BankPayoutAmount" type="number" min="1" step="1" inputmode="numeric" required placeholder="Masukkan nominal"><div class="f4-bank-quick-amounts" id="f4BankQuickAmounts"></div><label for="f4BankPayoutMethod">Metode</label><select id="f4BankPayoutMethod"><option value="tunai">Tunai (melalui pengelola)</option></select><label for="f4BankPayoutNote">Catatan (opsional)</label><input id="f4BankPayoutNote" maxlength="180" placeholder="Contoh: keperluan sekolah"><button class="f4-bank-gold-action" id="f4BankRequestSubmit" type="submit" disabled>Ajukan Pencairan</button>';
 form.onsubmit=submitRequest;
 const status=el("p","f4-bank-request-status","Memeriksa layanan pengajuan...");status.id="f4BankRequestStatus";status.setAttribute("role","status");
 const list=el("div","f4-bank-request-history");list.id="f4BankMemberRequests";
 page.append(el("p","f4-bank-screen-status","Memuat saldo..."),balance,form,status,
  el("h3","f4-bank-screen-subhead","Riwayat Pengajuan"),list);
 for(const [label,value] of [["25% ",.25],["50% ",.5],["100% ",1]]){
  const b=el("button","f4-bank-quick-amount",label.trim());b.type="button";
  b.onclick=()=>{const n=Number(memberStatement?.saldo||0);$("f4BankPayoutAmount").value=String(Math.floor(n*value));};
  $("f4BankQuickAmounts").append(b);
 }
}
async function requestsMember(){
 const list=$("f4BankMemberRequests"),status=$("f4BankRequestStatus"),button=$("f4BankRequestSubmit");
 if(!list)return;
 requestEnabled=false;if(button)button.disabled=true;status.textContent="Memeriksa pengajuan...";list.textContent="";
 text("f4BankPayoutBalance",memberStatement?rupiah(memberStatement.saldo):"—");
 try{
  const response=await api("/api/member/bank/payout-requests");
  requestEnabled=true;if(button)button.disabled=!memberStatement;
  status.textContent="Pengajuan diperiksa pengelola. Saldo berkurang setelah uang dibayar.";
  list.replaceChildren(...response.items.map(item=>{
   const row=el("div","f4-bank-request-entry");
   const left=el("span");left.append(el("strong","",rupiah(item.amount_rp)),el("small","",String(item.requested_at||"").slice(0,10)));
   const state=el("span","f4-bank-request-state is-"+item.status,item.status==="dibayar"?"Dibayar":item.status==="disetujui"?"Disetujui":item.status==="ditolak"?"Ditolak":item.status==="diajukan"?"Diajukan":item.status);
   row.append(left,state);return row;
  }));
  if(!response.items.length)list.append(el("p","f4-bank-empty","Belum ada pengajuan."));
 }catch(error){status.textContent=error.message+" Pengajuan belum dapat dikirim.";list.append(el("p","f4-bank-empty","Layanan pengajuan belum tersedia."));}
}
async function submitRequest(event){
 event.preventDefault();if(!requestEnabled)return;
 const button=$("f4BankRequestSubmit"),amount=Number($("f4BankPayoutAmount").value);
 const balance=Number(memberStatement?.saldo||0);
 if(!Number.isSafeInteger(amount)||amount<=0||amount>balance){$("f4BankRequestStatus").textContent="Nominal harus sesuai saldo terkonfirmasi.";return;}
 if(!requestNonce)requestNonce="PR"+crypto.randomUUID().replace(/-/g,"");
 const original=button.textContent;button.disabled=true;button.textContent="Mengirim...";
 try{
  const result=await api("/api/member/bank/payout-requests",{requestKey:requestNonce,amountRp:amount,method:"tunai",note:$("f4BankPayoutNote").value.trim()});
  requestNonce="";event.target.reset();
  $("f4BankRequestStatus").textContent=result.duplicate?"Pengajuan sudah tercatat.":"Pengajuan berhasil dikirim.";
  await requestsMember();
 }catch(err){$("f4BankRequestStatus").textContent=err.message;}
 finally{button.textContent=original;button.disabled=!requestEnabled;}
}
function managerRequestsPanel(){
 const parent=$("pageTabungan");
 if(!parent||role!=="admin")return;
 if(!$("f4BankManagerRequests")){
  const section=el("section","f4-bank-manager-requests");section.id="f4BankManagerRequests";
  const head=el("div","f4-bank-mobile-section-head");head.append(el("h3","","Pengajuan Pencairan"));
  const refresh=el("button","f4-bank-refresh-button","Muat ulang");refresh.type="button";refresh.onclick=loadManagerRequests;
  head.append(refresh);
  const content=el("div","f4-bank-manager-request-list","Memuat...");content.id="f4BankManagerRequestList";
  section.append(head,content);parent.prepend(section);
 }
}
async function loadManagerRequests(){
 managerRequestsPanel();
 const host=$("f4BankManagerRequestList");if(!host)return;host.textContent="Memuat pengajuan...";
 try{
  const response=await api("/api/admin/bank/payout-requests");host.replaceChildren();
  for(const item of response.items){
   const card=el("article","f4-bank-manager-request");
   const top=el("div","f4-bank-manager-request-head");
   top.append(el("strong","",item.nama+" • "+(item.rumah||"—")),el("span","f4-bank-request-state is-"+item.status,item.status));
   const details=el("div","f4-bank-manager-request-details");
   details.append(el("b","",rupiah(item.amount_rp)),el("small","","Saldo: "+rupiah(item.balance_rp)));
   card.append(top,details);
   if(item.note)card.append(el("small","",item.note));
   if(item.status==="diajukan"){
    const buttons=el("div","f4-bank-manager-request-actions");
    for(const [caption,action] of [["Setujui","setujui"],["Tolak","tolak"]]){
     const b=el("button",action==="setujui"?"f4-bank-gold-action":"f4-bank-secondary-action",caption);
     b.type="button";b.onclick=()=>reviewRequest(item,action);buttons.append(b);
    }
    card.append(buttons);
   }else if(item.status==="disetujui"){
    const b=el("button","f4-bank-gold-action","Sudah Dibayar");b.type="button";
    b.onclick=()=>paidRequest(item);card.append(b);
   }
   host.append(card);
  }
  if(!host.childElementCount)host.append(el("p","f4-bank-empty","Belum ada pengajuan pencairan."));
 }catch(error){host.textContent="Pengajuan belum dapat dimuat: "+error.message;}
}
async function reviewRequest(item,action){
 let note="";
 if(action==="tolak"){
  note=window.prompt("Alasan penolakan (minimal 5 karakter):","")||"";
  if(note.length<5)return;
 }else if(!window.confirm("Setujui pengajuan "+item.nama+" sebesar "+rupiah(item.amount_rp)+"? Belum mengurangi saldo."))return;
 try{await api("/api/admin/bank/payout-requests/review",{id:item.id,action,note});await loadManagerRequests();}
 catch(error){window.alert(error.message);}
}
async function paidRequest(item){
 if(!window.confirm("Pastikan uang "+rupiah(item.amount_rp)+" sudah diserahkan ke "+item.nama+". Catat sebagai SUDAH DIBAYAR?"))return;
 try{
  await api("/api/admin/bank/payout-requests/paid",{id:item.id,paidOn:today()});
  await loadManagerRequests();
  if(typeof window.v9Load==="function")window.v9Load();
 }catch(error){window.alert("Belum berhasil mencatat pembayaran: "+error.message);}
}
function hideCustom(){
 for(const id of custom)$(id)?.classList.add("hidden");
}
function navigate(route){
 if(route==="menu"){$("v18PrivateMenuButton")?.click();return;}
 if(route==="bank-deposit"){
  window.goPage("dashboard");
  const flow=$("f4MemberFlow");if(flow){flow.open=true;flow.scrollIntoView({behavior:"smooth",block:"start"});}
  return;
 }
 if(route==="bank-history"||route==="bank-report"||route==="bank-payout"){
  window.goPage(route);return;
 }
 if(typeof window.goPage==="function")window.goPage(route);
}
function handleRoute(route,old,args){
 if(custom.includes(route)&&roleType()==="member"){
  old.call(window,"pribadi",...args);
  ensureMemberPages();
  hideCustom();
  $("pagePribadi")?.classList.add("hidden");
  $(route)?.classList.remove("hidden");screen=route;markDock();
  if(route==="bank-history")showHistory();
  if(route==="bank-report")showReport();
  if(route==="bank-payout")requestsMember();
  return;
 }
 hideCustom();
 const result=old.call(window,route,...args);
 screen=route;markDock();
 if(route==="tabungan"&&roleType()==="admin")loadManagerRequests();
 if(route==="pribadi")ensureMemberPages();
 return result;
}
function sync(){
 const next=roleType(),isPrivate=!!next&&!$("dashboardView")?.classList.contains("hidden");
 document.body.classList.toggle("f4-bank-app-private",isPrivate);
 document.body.classList.toggle("f4-bank-app-member",isPrivate&&next==="member");
 document.body.classList.toggle("f4-bank-app-admin",isPrivate&&next==="admin");
 dock().hidden=!isPrivate;
 if(!isPrivate){hideCustom();role=null;return;}
 if(next!==role){
  role=next;screen="dashboard";dock().replaceChildren(...(role==="admin"?adminDock:memberDock).map(x=>action(x,true)));
  if(role==="member")requestNonce="";
  memberStatement=null;
 }
 ensureHome();
 if(role==="member")ensureMemberPages();
 else managerRequestsPanel();
 markDock();refreshSources();
}
function refreshSources(){
 const p=$("v14Primary"),q=$("v14Extra");
 if(p&&p!==primaryNode){
  homeSource?.disconnect();
  homeSource=new MutationObserver(updateDashboard);
  homeSource.observe(p,{childList:true,characterData:true,subtree:true});primaryNode=p;
 }
 if(q&&q!==extraNode){
  summaryExtra?.disconnect();
  summaryExtra=new MutationObserver(updateDashboard);
  summaryExtra.observe(q,{childList:true,characterData:true,subtree:true});extraNode=q;
 }
 const targets=["v12Balance","v12Credit","v12Debit","v12History","v12Deposits","v12Gate","v12Private"];
 const observer=memberSource||new MutationObserver(syncSavings);
 if(!memberSource)memberSource=observer;
 for(const id of targets){
  const target=$(id);
  if(!target||target.dataset.f4BankObserved==="1")continue;
  target.dataset.f4BankObserved="1";
  observer.observe(target,id==="v12Private"?{attributes:true,attributeFilter:["class"]}:{childList:true,characterData:true,subtree:true});
 }
}

function memberID(){
 return String(memberStatement?.wargaId||$("pId")?.textContent||"").trim().replace(/^member:/i,"");
}
function updateCardNumber(){
 const id=memberID();
 text("f4BankCardNumber",id&&id!=="Administrator"?id:"—");
 text("f4BankProfileNumber",id&&id!=="Administrator"?id:"—");
 const house=$("pHome")?.textContent?.trim()||"—";
 if($("f4BankProfileHouse"))$("f4BankProfileHouse").textContent="Rumah "+house;
}
function updateProfileCard(){
 if(role!=="member")return;
 const target=$("pageProfile"),card=$("f4BankMemberCard");if(!target||!card)return;
 if(!$("f4BankProfileDetail")){
  const wrapper=el("section","f4-bank-profile-detail");wrapper.id="f4BankProfileDetail";
  wrapper.append(el("h3","","Detail Kartu Anggota"));
  const copy=card.cloneNode(true);
  copy.removeAttribute("id");copy.classList.add("f4-bank-profile-card");
  copy.type="button";copy.onclick=null;copy.tabIndex=-1;
  copy.setAttribute("aria-label","Identitas anggota Bank Sampah Flamboyan 4");
  const number=copy.querySelector("#f4BankCardNumber");if(number)number.id="f4BankProfileNumber";
  const room=copy.querySelector(".f4-bank-card-house");if(room)room.id="f4BankProfileHouse";
  const info=el("p","f4-bank-profile-card-note","Kartu identitas anggota, bukan alat pembayaran.");
  const button=el("button","f4-bank-profile-copy","Salin nomor anggota");button.type="button";
  button.onclick=async()=>{
   const id=memberID();if(!id||id==="—")return;
   try{await navigator.clipboard.writeText(id);button.textContent="Nomor tersalin";}
   catch{window.prompt("Nomor anggota:",id);}
  };
  wrapper.append(copy,info,button);
  target.prepend(wrapper);
  const head=target.querySelector(":scope > h2");if(head)head.textContent="Profil & Pengaturan";
 }
 updateCardNumber();
}
function acceptMemberStatement(event){
 if(roleType()!=="member")return;
 const data=event?.detail;
 if(!data||!Array.isArray(data.mutasi)||!Array.isArray(data.setoran))return;
 memberStatement=data;
 updateCardNumber();updateDashboard();syncSavings();
}

function init(){
 if(ready)return;ready=true;
 window.addEventListener("f4-bank-member-statement",acceptMemberStatement);
 const original=window.goPage;
 if(typeof original==="function")window.goPage=function(route,...args){return handleRoute(route,original,args);};
 const view=$("dashboardView");
 if(view)new MutationObserver(sync).observe(view,{attributes:true,attributeFilter:["class"]});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["data-f4-bank-role"]});
 const page=$("pageDashboard");
 if(page)new MutationObserver(()=>{
   if(page.classList.contains("v14-home")&&!$("f4BankAppHome"))sync();
   const source=$("f4BankDashboardSource"),chart=$("f4-member-weight-chart");
   if(role==="member"&&source&&chart&&chart.parentElement!==source)source.append(chart);
  }).observe(page,{childList:true,subtree:true});
 sync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
