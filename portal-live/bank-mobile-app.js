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
const adminDock=[
  ["Beranda","dashboard","home.svg"],["Setoran","setoran","bank.svg"],
  ["Laporan","laporan","book.svg"],["Penjualan","penjualan","cash.svg"],["Saldo","tabungan","pay.svg"]
];
const memberDock=[
 ["Beranda","dashboard","home.svg"],["Tabungan","pribadi","cash.svg"],
 ["Pencairan","bank-payout","rp"],["Riwayat","bank-history","clock.svg"],
 ["Laporan","bank-report","book.svg"]
];
let role=null,screen="dashboard",historyMonth="latest",reportMonth="",activePage=null;
let homeSource=null,summaryExtra=null,memberSource=null,managerQueue=null;
let primaryNode=null,extraNode=null;
let ready=false,requestNonce="",requestEnabled=false;
let memberStatement=null,memberChartMode="kg",memberChartGroup="period";
let adminOverview=null;
let refreshing=false;
const custom=["bank-history","bank-payout","bank-report","bank-payout-admin"];
const featureRoutes=["bank-member-progress","bank-member-info","bank-member-docs"];
let moved=[],memberSnapshotsLoaded=false,snapshotBusy=false,snapshotObserver=null;
const text=(id,val)=>{if($(id)&&$(id).textContent!==String(val))$(id).textContent=String(val)};
const image=file=>{const img=el("img");img.src="/assets/icons/"+file;img.alt="";img.setAttribute("aria-hidden","true");return img;};
function roleType(){
 const r=String(document.body.dataset.f4BankRole||"").toLowerCase();
 return ["admin","superadmin"].includes(r)?"admin":["warga","anggota"].includes(r)?"member":null;
}
function action([title,route,asset],dock=false){
 const b=el("button",dock?"f4-bank-app-dock-action":"f4-bank-app-action");
 b.type="button";b.dataset.bankAppRoute=route;b.setAttribute("aria-label",title);
 const symbol=el("span","f4-bank-app-action-icon");
 if(asset==="rp"){
  const currency=el("span","f4-bank-currency-mark","Rp");
  currency.setAttribute("aria-hidden","true");
  symbol.append(currency);
 }else symbol.append(image(asset));
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
 if(roleType()==="member")syncMemberBack();
}
// Compact member identity replaces the oversized greeting on the member dashboard.
function memberTopIdentity(){
 const bar=$("f4-direct-bar"),links=bar?.querySelector(".f4-nav-links");
 let identity=$("f4BankMemberTopIdentity");
 if(roleType()!=="member"||!bar||!links){identity?.remove();return;}
 if(!identity){
  identity=el("span","f4-bank-member-top-identity");identity.id="f4BankMemberTopIdentity";
  bar.insertBefore(identity,links);
 }
 const name=$("pName")?.textContent?.trim()||"Anggota";
 const home=$("pHome")?.textContent?.trim()||"—";
 identity.replaceChildren(el("strong","",name),el("small","","Rumah "+home));
}
function syncMemberBack(){
 const button=$("f4-mobile-menu"),secondary=screen!=="dashboard";
 document.body.classList.toggle("f4-bank-member-secondary",secondary);
 if(!button)return;
 if(secondary){
  // Consistent accessible back icon, not a text glyph that varies by device/font.
  const arrow=document.createElementNS("http://www.w3.org/2000/svg","svg");
  arrow.setAttribute("viewBox","0 0 24 24");
  arrow.setAttribute("aria-hidden","true");
  arrow.innerHTML='<path d="M19 12H5m7-7-7 7 7 7"/>';
  button.replaceChildren(arrow);
  button.setAttribute("aria-label","Kembali ke Beranda");
  button.title="Kembali ke Beranda";
 }else{
  button.replaceChildren(el("span","f4-svg-icon f4-svg-menu"));
  button.setAttribute("aria-label","Buka menu halaman");button.title="Buka menu halaman";
 }
}
function orderMemberHome(){
 const home=$("f4BankAppHome");if(!home||roleType()!=="member")return;
 const feed=$("v14Recent")?.closest(".v14-panel");
 const items=[$("f4MemberFlow"),feed,$("f4BankWeighingSchedule"),$("f4MemberEnvironmentPreview"),$("f4MemberInfoShortcut")];
 // Preserve member card and balance at the top, place private history and schedule before progress.
 for(const item of items)if(item&&item.parentNode===home)home.append(item);
}
function statusFor(page){
 const gate=$("v12Gate"),privateArea=$("v12Private");
 if(!page)return;
 const msg=page.querySelector(".f4-bank-screen-status");
 if(!msg)return;
 const loaded=!!memberStatement;
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
  welcome.append(el("strong","", "Halo!"));
  const card=el("button","f4-bank-member-card");card.id="f4BankMemberCard";card.type="button";card.onclick=()=>navigate("profile");
  const cardHead=el("span","f4-bank-member-card-head"),logo=el("img");logo.src="/assets/logo-flamboyan.svg";logo.alt="";
  cardHead.append(logo,el("span","","BANK SAMPAH · FLAMBOYAN 4"),el("span","f4-bank-member-card-chip"));
  const identity=el("span","f4-bank-member-card-foot");
  const box=el("span");box.append(el("small","","NOMOR ANGGOTA"),el("strong","","—"));
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
  const addDeposit=el("button","f4-bank-admin-deposit-action","+ Catat setoran");
  addDeposit.type="button";addDeposit.onclick=()=>navigate("setoran");hero.append(addDeposit);
  const minis=el("div","f4-bank-app-minis");minis.id="f4BankAppMinis";
  hub.append(welcome,card,savings,hero,minis);
  page.prepend(hub);
 }
 hub.dataset.bankRole=role;
 const name=$("pName")?.textContent?.trim()||"Anggota";
 const house=$("pHome")?.textContent?.trim()||"—";
 const welcome=$("f4BankAppWelcome");if(welcome){
   welcome.replaceChildren(el("strong","",name));
   welcome.append(el("small","","Rumah "+house));
 }
 memberTopIdentity();
 updateCardNumber();
 const houseNode=hub.querySelector(".f4-bank-card-house");if(houseNode)houseNode.textContent="Rumah "+house;
 updateProfileCard();
 // Keep the original live-data nodes in the DOM but out of the visual hierarchy.
 let reservoir=$("f4BankDashboardSource");
 if(!reservoir){reservoir=el("div","f4-bank-hidden-source");reservoir.id="f4BankDashboardSource";reservoir.hidden=true;page.append(reservoir);}
 for(const id of ["v14Primary","v14Extra"]){const node=$(id);if(node&&node.parentElement!==reservoir)reservoir.append(node);}
 const header=page.querySelector(".v14-head")||reservoir.querySelector(".v14-head"),banner=page.querySelector(".v14-hero")||reservoir.querySelector(".v14-hero"),status=$("v14Status");
 const legacyToolbar=page.parentElement?.querySelector(":scope > .toolbar")||reservoir.querySelector(":scope > .toolbar");
 if(role==="member"){
  for(const node of [header,banner,status,legacyToolbar]){
   if(node&&node.parentElement!==reservoir)reservoir.append(node);
  }
  page.querySelectorAll(".f4-member-finance-note").forEach(node=>node.remove());
 }else{
  if(legacyToolbar?.parentElement===reservoir)page.parentElement?.prepend(legacyToolbar);
  for(const node of [header,banner,status])if(node&&node.parentElement!==reservoir)reservoir.append(node);
  $("f4BankWeighingSchedule")?.remove();
 }
 if(role==="member"){
  const chart=$("f4-member-weight-chart");if(chart&&chart.parentElement!==reservoir)reservoir.append(chart);
  const flow=$("f4MemberFlow");if(flow){flow.hidden=false;if(flow.parentElement!==hub)hub.append(flow);}
  const panels=page.querySelector(".v14-panels");
  const link=$("v14AllDeposits");if(link){link.textContent="Lihat semua";link.onclick=()=>navigate("bank-history");}
  const recent=$("v14Recent")?.closest(".v14-panel");
  if(recent&&recent.parentElement!==hub){
   hub.append(recent);
  }
  const remaining=panels?.querySelector(".v14-panel");
  if(remaining&&remaining.parentElement!==reservoir)reservoir.append(remaining);
  ensureWeighingSchedule(hub);
 }else{
  const recent=$("v14Recent")?.closest(".v14-panel");
  if(recent&&recent.parentElement!==hub)hub.append(recent);
  const activity=$("v14Activities")?.closest(".v14-panel");
  if(activity&&activity.parentElement!==hub)hub.append(activity);
  const flow=$("f4MemberFlow");if(flow)flow.hidden=true;
 }
 const legacyPanels=page.querySelector(".v14-panels");
 if(legacyPanels&&legacyPanels.parentElement!==reservoir)reservoir.append(legacyPanels);
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
    el("strong","",memberStatement?rupiah(memberStatement.saldo):(map.get("Saldo sah")||"—")),el("span","f4-bank-member-chevron","›"));
  $("f4BankAppMinis")?.replaceChildren();
 }else{
  const current=adminOverview;
  const owned=current?.kasMilikBankRp;
  const headline=$("f4BankAppAdminHero")?.querySelector(".f4-bank-app-balance-title");if(headline)headline.textContent="Kas milik Bank Sampah";
  text("f4BankAppBalance",Number.isFinite(owned)?rupiah(owned):"—");
  text("f4BankAppSecondary",current?"Hasil diterima lapak: "+rupiah(current.diterimaLapakRp):"Memuat posisi kas...");
  const opts=current?[["Kas gabungan",rupiah(current.kasGabunganRp)],["Hak warga",rupiah(current.hakWargaBelumCairRp)],["Kas lingkungan",rupiah(current.kasLingkunganRp)],["Anggota",current.wargaAktif]]:
   [["Kas gabungan","—"],["Hak warga","—"],["Kas lingkungan","—"],["Anggota",map.get("Anggota aktif")]];
  $("f4BankAppMinis")?.replaceChildren(...opts.map(([label,value])=>{
   const node=el("div","f4-bank-app-mini");node.append(el("small","",label),el("strong","",value||"—"));return node;
  }));
 }
}
function updateAdminOverview(event){
 if(roleType()!=="admin"||!event.detail)return;
 adminOverview=event.detail;updateDashboard();
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
 page.classList.remove("card"); // outer frame removed; inner functional cards remain
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
 if(revised?.tagName==="H2")revised.textContent="Riwayat Setoran";
 if(!$("f4BankSavingsHero")){
  const hero=el("section","f4-bank-savings-hero");hero.id="f4BankSavingsHero";
  hero.append(el("small","","SALDO TABUNGAN"),el("strong","","—"),el("span","","Saldo dari hasil penjualan sah"));
  priv.insertBefore(hero,priv.firstChild);hero.querySelector("strong").id="f4BankSavingsBalance";
  const payout=el("button","f4-bank-gold-action f4-bank-savings-payout","Ajukan Pencairan");
  payout.type="button";payout.onclick=()=>navigate("bank-payout");hero.append(payout);
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
  const report=el("button","f4-bank-report-open","Lihat Laporan & Cetak PDF");
  report.type="button";report.onclick=()=>navigate("bank-report");chart.after(report);
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
function historyLines(){
 const sales=ledger().map(item=>({...item,kind:item.debit>0?"out":"in",sortId:"m"}));
 const deposits=Array.isArray(memberStatement?.setoran)?memberStatement.setoran:[];
 const weights=deposits.filter(x=>!/batal/i.test(String(x.status||""))).map(x=>{
  const iso=String(x.tanggal||"");const isFinal=/terkonfirmasi/i.test(String(x.status||""));
  const kg=x.beratKg==null?"—":Number(x.beratKg).toLocaleString("id-ID",{maximumFractionDigits:3})+" kg";
  const moneyNote=isFinal?(x.nilaiSahRp==null?"Nilai belum tersedia":"Hasil jual "+rupiah(x.nilaiSahRp)):
    "Perkiraan "+rupiah(x.estimasiRp);
  const date=/^\d{4}-\d{2}-\d{2}$/.test(iso)?
   new Date(iso+"T12:00:00Z").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}):iso;
  return {iso,date,month:iso.slice(0,7),type:"Setoran Sampah",kind:"deposit",amountText:kg,
   note:moneyNote+" • "+(isFinal?"Sudah sah":"Belum sah"),sortId:"d"};
 });
 return [...sales,...weights].sort((a,b)=>b.iso.localeCompare(a.iso)||a.sortId.localeCompare(b.sortId));
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
  const panel=el("section","f4-bank-history-panel");
  panel.append(filter,list);
  page.append(el("p","f4-bank-screen-status","Memuat transaksi..."),panel);
 }
 const rows=historyLines(),available=months(rows);
 if(historyMonth==="latest"||!available.includes(historyMonth)&&historyMonth!=="all")
  historyMonth=available[0]||"all";
 populateMonths($("f4BankHistoryMonths"),available,historyMonth,key=>{historyMonth=key;showHistory();});
 const host=$("f4BankHistoryList");host.replaceChildren();
 for(const line of rows.filter(x=>historyMonth==="all"||x.month===historyMonth)){
  const deposit=line.kind==="deposit",out=line.debit>0,amount=out?line.debit:line.credit;
  const item=el("article","f4-bank-history-line");
  item.append(el("span","f4-bank-history-icon "+(deposit?"is-deposit":out?"is-out":"is-in"),deposit?"♻":out?"↑":"↓"));
  const desc=el("span","f4-bank-history-copy");desc.append(el("strong","",line.type),el("small","",line.date));
  const total=el("span","f4-bank-history-amount "+(deposit?"is-deposit":out?"is-out":"is-in"));
  total.append(el("strong","",deposit?line.amountText:(out?"− ":"+ ")+rupiah(amount)),
   el("small","",deposit?line.note:"Saldo "+line.balance));
  item.append(desc,total);host.append(item);
 }
 if(!host.childElementCount)host.append(el("p","f4-bank-empty",rows.length?"Tidak ada transaksi pada bulan ini.":"Belum ada transaksi tercatat."));
 statusFor(page);
}
function showReport(){
 const page=ensureScreen("bank-report","Laporan Tabungan");
 if(!$("f4BankReportMonth")){
  const period=el("div","f4-bank-report-period");
  const monthCell=el("label","","Bulan"),month=el("select");month.id="f4BankReportMonth";monthCell.append(month);
  const yearCell=el("label","","Tahun"),year=el("select");year.id="f4BankReportYear";yearCell.append(year);
  period.append(monthCell,yearCell);
  const summary=el("div","f4-bank-report-summary");summary.id="f4BankReportSummary";
  const actions=el("div","f4-bank-report-actions");
  const pdf=el("button","f4-bank-gold-action","Cetak PDF");pdf.type="button";
  pdf.onclick=()=>typeof window.v12Print==="function"&&window.v12Print();
  const csv=el("button","f4-bank-secondary-action","Unduh CSV");csv.type="button";
  csv.onclick=()=>typeof window.v12CSV==="function"&&window.v12CSV();
  actions.append(pdf,csv);
  const title=el("h3","f4-bank-screen-subhead","Transaksi Bulan Ini");
  const transactions=el("div","f4-bank-report-list");transactions.id="f4BankReportList";
  const controls=el("section","f4-bank-report-panel");
  const log=el("section","f4-bank-report-transactions");
  controls.append(period,summary,actions);log.append(title,transactions);
  page.append(el("p","f4-bank-screen-status","Memuat laporan..."),controls,log);
 }
 const all=historyLines();
 const periods=[...new Set(all.map(x=>x.month).filter(x=>/^\d{4}-\d{2}$/.test(x)))].sort().reverse();
 if(!reportMonth||reportMonth==="all")reportMonth=periods[0]||today().slice(0,7);
 const [yearValue,monthValue]=reportMonth.split("-").map(Number);
 const year=$("f4BankReportYear"),month=$("f4BankReportMonth");
 const years=[...new Set([yearValue,...periods.map(x=>Number(x.slice(0,4))),...Array.from({length:21},(_,i)=>2026+i)])]
  .filter(Number.isFinite).sort((a,b)=>b-a);
 year.replaceChildren(...years.map(y=>{const op=new Option(String(y),String(y));op.selected=y===yearValue;return op;}));
 const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
 month.replaceChildren(...names.map((name,i)=>{const op=new Option(name,String(i+1).padStart(2,"0"));op.selected=i+1===monthValue;return op;}));
 year.onchange=()=>{reportMonth=year.value+"-"+month.value;showReport();};
 month.onchange=()=>{reportMonth=year.value+"-"+month.value;showReport();};
 window.f4BankReportPeriod=()=>reportMonth;
 const selected=ledger().filter(x=>x.month===reportMonth);
 const transactions=all.filter(x=>x.month===reportMonth);
 const deposits=(memberStatement?.setoran||[]).filter(x=>String(x.tanggal||"").startsWith(reportMonth)&&!/batal/i.test(String(x.status)));
 const missingWeight=deposits.some(x=>x.beratKg==null);
 const weight=deposits.reduce((n,x)=>n+Number(x.beratKg||0),0);
 const credit=selected.reduce((n,x)=>n+x.credit,0),debit=selected.reduce((n,x)=>n+x.debit,0);
 const tiles=[["Setoran",missingWeight?"—":weight.toLocaleString("id-ID",{maximumFractionDigits:3})+" kg"],
  ["Hasil jual sah",rupiah(credit)],["Pencairan / keluar",rupiah(debit)],["Transaksi",String(transactions.length)]];
 const summary=$("f4BankReportSummary");summary.replaceChildren();
 for(const [label,value] of tiles){const box=el("div","f4-bank-report-tile");
  box.append(el("small","",label),el("strong","",value));summary.append(box);}
 const list=$("f4BankReportList");list.replaceChildren();
 for(const entry of transactions){
  const node=el("article","f4-bank-report-transaction"),deposit=entry.kind==="deposit",out=entry.debit>0;
  const left=el("span");left.append(el("strong","",entry.type),el("small","",entry.date));
  const right=el("span","",deposit?entry.amountText:(out?"− ":"+ ")+rupiah(out?entry.debit:entry.credit));
  if(deposit)right.title=entry.note;
  right.className=out?"is-out":"is-in";
  node.append(left,right);list.append(node);
 }
 if(!transactions.length)list.append(el("p","f4-bank-empty","Belum ada transaksi di periode ini."));
 statusFor(page);
}
function memberBuckets(){
 // Each point is ONE genuine deposit. Never combine transactions in a bar.
 const deposits=Array.isArray(memberStatement?.setoran)?memberStatement.setoran:[];
 return deposits.filter(row=>!/batal/i.test(String(row.status||""))).map((row,index)=>{
  const final=/terkonfirmasi|confirmed/i.test(String(row.status||""));
  const period=String(row.tanggal||"").slice(0,7);
  const date=String(row.tanggal||"").slice(0,10);
  const confirmedAt=String(row.tanggalPengesahan||row.tanggalJual||"").slice(0,10);
  return {
   id:String(row.id||"tx-"+index),date,month:period,
   batch:String(row.batchId||""),confirmedAt,final,
   weight:row.beratKg==null?0:Number(row.beratKg)||0,
   confirmed:final?(row.nilaiSahRp==null?0:Number(row.nilaiSahRp)||0):0,
   estimated:final?0:Number(row.estimasiRp)||0,
   missingWeight:row.beratKg==null,
   missingValue:final&&row.nilaiSahRp==null
  };
 }).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
function weighingNextDate(){
 // The schedule is weekly, not an unverified appointment time.
 const [year,month,day]=today().split("-").map(Number);
 const current=new Date(Date.UTC(year,month-1,day));
 const days=(7-current.getUTCDay())%7;
 current.setUTCDate(current.getUTCDate()+days);
 return {days,label:new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(current)};
}
function ensureWeighingSchedule(home){
 if(role!=="member"||!home)return;
 let card=$("f4BankWeighingSchedule");
 if(!card){
  card=el("section","f4-bank-weigh-schedule");card.id="f4BankWeighingSchedule";
  const icon=el("span","f4-bank-weigh-icon");icon.append(image("calendar.svg"));
  const content=el("span","f4-bank-weigh-copy");
  content.append(el("small","","JADWAL BERIKUTNYA"),el("strong","","—"),el("span","","Penimbangan rutin setiap Minggu"));
  card.append(icon,content);
  home.append(card);
 }
 const next=weighingNextDate();
 const title=card.querySelector("strong");if(title)title.textContent=next.days===0?"Hari ini • Minggu":next.label;
}
function f4PrivateShort(n,mode){
 const value=Math.max(0,Number(n)||0);
 const fmt=x=>x.toLocaleString("id-ID",{maximumFractionDigits:1});
 if(mode==="rp"){
  if(value>=1000000)return fmt(value/1000000)+" jt";
  if(value>=1000)return fmt(value/1000)+" rb";
  return fmt(value);
 }
 return fmt(value);
}
function f4PrivateKg(n){
 return (Number(n)||0).toLocaleString("id-ID",{maximumFractionDigits:3})+" kg";
}
function f4PrivateChartEntries(points){
 // Existing default stays "Periode": one real deposit per group, not one month.
 const origin=memberChartGroup;
 const utc=date=>Date.parse(date+"T00:00:00Z");
 const now=utc(today());
 let list=points;
 if(origin==="30"){
  const days=30;
  const earliest=now-(days-1)*86400000;
  list=points.filter(p=>utc(p.date)>=earliest&&utc(p.date)<=now);
 }
 const groups=new Map();
 const add=(key,label,full,point)=>{
  let entry=groups.get(key);
  if(!entry){
   entry={key,label,full,count:0,finalCount:0,confirmedWeight:0,pendingWeight:0,
    confirmedRp:0,estimatedRp:0,missingWeight:false,missingValue:false};
   groups.set(key,entry);
  }
  entry.count++;
  if(point.final)entry.finalCount++;
  if(point.missingWeight)entry.missingWeight=true;
  if(point.missingValue)entry.missingValue=true;
  if(!point.missingWeight){
   if(point.final)entry.confirmedWeight+=point.weight;
   else entry.pendingWeight+=point.weight;
  }
  entry.confirmedRp+=point.confirmed;
  entry.estimatedRp+=point.estimated;
 };
 const labelDate=date=>date.slice(8,10)+"/"+date.slice(5,7);
 if(origin==="period"){
  for(const point of list)add(point.id,labelDate(point.date),point.date,point);
 }else if(origin==="month"){
  for(const point of list)add(point.month,monthName(point.month),point.month,point);
 }else{
  const days=30,bin=5;
  for(let index=0;index<days;index+=bin){
   const start=new Date(now-(days-1-index)*86400000).toISOString().slice(0,10);
   const finish=new Date(now-(days-1-Math.min(index+bin-1,days-1))*86400000).toISOString().slice(0,10);
   const key=String(index);
   groups.set(key,{key,label:labelDate(start),
    full:start===finish?start:start+" – "+finish,count:0,finalCount:0,
    confirmedWeight:0,pendingWeight:0,confirmedRp:0,estimatedRp:0,
    missingWeight:false,missingValue:false});
  }
  for(const point of list){
   const offset=Math.floor((utc(point.date)-(now-(days-1)*86400000))/86400000);
   const groupKey=String(Math.floor(offset/bin)*bin);
   if(groups.has(groupKey)){
    const entry=groups.get(groupKey);entry.count++;if(point.final)entry.finalCount++;
    if(point.missingWeight)entry.missingWeight=true;
    if(point.missingValue)entry.missingValue=true;
    if(!point.missingWeight){if(point.final)entry.confirmedWeight+=point.weight;else entry.pendingWeight+=point.weight;}
    entry.confirmedRp+=point.confirmed;entry.estimatedRp+=point.estimated;
   }
  }
 }
 const result=[...groups.values()];
 return origin==="month"?result.slice(-6):result;
}
function f4PrivateChartSummary(host,entries,mode){
 // Satu angka utama saja; tidak mengulangnya dalam empat kartu di bawahnya.
 let summary=$("f4BankSavingsChartSummary");
 if(!summary){
  summary=el("div","f4-bank-private-chart-summary");summary.id="f4BankSavingsChartSummary";
  host.parentElement.insertBefore(summary,host);
 }
 $("f4BankSavingsChartStats")?.remove();
 $("f4BankPrivateRecent")?.remove(); // Riwayat yang sama sekarang hanya berada di #v12Deposits.
 const total=key=>entries.reduce((sum,row)=>sum+row[key],0);
 const count=entries.reduce((sum,row)=>sum+row.count,0);
 const actualWeight=total("confirmedWeight"),waitingWeight=total("pendingWeight"),
  actualMoney=total("confirmedRp");
 const title=el("span","",mode==="kg"?"Berat sah":"Hasil jual sah");
 const value=el("strong","",mode==="kg"?f4PrivateKg(actualWeight):rupiah(actualMoney));
 const caption=el("small","",count+" setoran · "+(mode==="kg"?rupiah(actualMoney):f4PrivateKg(actualWeight))+
  (waitingWeight>0?" · "+f4PrivateKg(waitingWeight)+" belum sah":""));
 summary.replaceChildren(title,value,caption);
 let legend=$("f4BankSavingsLegend");
 if(!legend){
  legend=el("div","f4-bank-private-chart-legend");legend.id="f4BankSavingsLegend";host.after(legend);
 }
 legend.replaceChildren();
 for(const [name,kind] of [[mode==="kg"?"Berat sah":"Hasil jual sah","confirmed"],
   [mode==="kg"?"Belum sah":"Perkiraan belum sah","estimate"]]){
  const item=el("span",""),dot=el("i","is-"+kind);
  dot.setAttribute("aria-hidden","true");item.append(dot,document.createTextNode(name));legend.append(item);
 }
 let foot=$("f4BankSavingsChartNote");
 if(!foot){
  foot=el("p","f4-bank-private-chart-note");foot.id="f4BankSavingsChartNote";legend.after(foot);
 }
 foot.textContent=entries.some(x=>x.missingValue||x.missingWeight)?
  "Sebagian hasil sah belum tersedia.":"";
 foot.hidden=!foot.textContent;
}
function chartSavings(){
 const root=$("f4BankSavingsChart"),host=$("f4BankSavingsBars");
 if(!root||!host)return;
 let filters=$("f4BankSavingsFilters");
 if(!filters){
  filters=el("div","f4-bank-chart-filters");filters.id="f4BankSavingsFilters";
  const tabs=el("div","f4-bank-chart-groups");
  for(const [id,label] of [["period","Periode"],["30","30 hari"],["month","Per bulan"]]){
   const button=el("button","",label);button.type="button";button.dataset.group=id;
   button.onclick=()=>{memberChartGroup=id;chartSavings();};
   tabs.append(button);
  }
  const units=el("div","f4-bank-chart-switch");
  for(const [id,label] of [["kg","Kg"],["rp","Rp"]]){
   const button=el("button","",label);button.type="button";button.dataset.mode=id;
   button.onclick=()=>{memberChartMode=id;chartSavings();};units.append(button);
  }
  filters.append(tabs,units);
  root.querySelector("h3")?.after(filters);
 }
 $("f4BankChartPeriod")?.remove();
 filters.querySelectorAll("[data-group]").forEach(button=>{
  const active=button.dataset.group===memberChartGroup;
  button.classList.toggle("is-active",active);button.setAttribute("aria-pressed",String(active));
 });
 filters.querySelectorAll("[data-mode]").forEach(button=>{
  const active=button.dataset.mode===memberChartMode;
  button.classList.toggle("is-active",active);button.setAttribute("aria-pressed",String(active));
 });
 const points=memberBuckets().filter(p=>/^\d{4}-\d{2}-\d{2}$/.test(p.date));
 const entries=f4PrivateChartEntries(points);
 const useKg=memberChartMode==="kg";
 const fields=useKg?["confirmedWeight","pendingWeight"]:["confirmedRp","estimatedRp"];
 f4PrivateChartSummary(host,entries,memberChartMode);
 const max=Math.max(.001,...entries.flatMap(row=>fields.map(key=>row[key])));
 const previousView=host.dataset.bankChartView||"";
 const currentView=memberChartGroup+":"+memberChartMode;
 const oldScroll=host.scrollLeft;
 host.replaceChildren();
 host.dataset.bankChartView=currentView;
 host.dataset.chartGroup=memberChartGroup;
 host.setAttribute("role","img");
 host.setAttribute("aria-label","Perkembangan setoran pribadi. "+entries.map(e=>e.full+": "+
  fields.map((key,i)=>(i?"Perkiraan ":"Sah ")+(useKg?f4PrivateKg(e[key]):rupiah(e[key]))).join(", ")).join("; "));
 if(!memberStatement){host.append(el("p","f4-bank-empty","Memuat setoran..."));return;}
 if(!entries.some(e=>e.count)){
  host.append(el("p","f4-bank-empty","Belum ada setoran pada periode ini."));
 }else{
  for(const item of entries){
   const column=el("div","f4-bank-savings-bar");
   const amounts=fields.map(key=>item[key]);
   const val=amounts[0]>0?amounts[0]:amounts[1];
   const amountLabel=useKg?f4PrivateShort(val,"kg")+" kg":f4PrivateShort(val,"rp");
   const noFinal=useKg?item.missingWeight:item.missingValue;
   column.append(el("strong","",noFinal?"—":amountLabel));
   const rail=el("span","f4-bank-savings-bar-rail");
   for(const [index,key] of fields.entries()){
    const bar=el("i",index?"is-estimate":"is-confirmed");
    bar.style.height=item[key]>0?Math.max(4,item[key]/max*100)+"%":"0%";
    bar.title=(index?"Belum sah / perkiraan":"Sudah sah")+": "+(useKg?f4PrivateKg(item[key]):rupiah(item[key]));
    rail.append(bar);
   }
   column.append(rail,el("small","",item.label));
   column.title=item.full+" • "+fields.map((key,i)=>(i?"Belum sah / perkiraan ":"Sah ")+
    (useKg?f4PrivateKg(item[key]):rupiah(item[key]))).join(" • ");
   column.setAttribute("aria-label",column.title);
   host.append(column);
  }
 }
 if(previousView===currentView)host.scrollLeft=oldScroll;
 else host.scrollLeft=memberChartGroup==="period"?host.scrollWidth:0;
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
 const formPanel=el("section","f4-bank-form-panel");
 formPanel.append(el("h3","f4-bank-screen-subhead","Ajukan pencairan"),form,status);
 const historyPanel=el("section","f4-bank-request-history-panel");
 historyPanel.append(el("h3","f4-bank-screen-subhead","Riwayat Pengajuan"),list);
 page.append(el("p","f4-bank-screen-status","Memuat saldo..."),balance,formPanel,historyPanel);
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
 if(role!=="admin")return;
 const page=ensureScreen("bank-payout-admin","Pencairan Tabungan");
 if(!$("f4BankManagerRequests")){
  const section=el("section","f4-bank-manager-requests");section.id="f4BankManagerRequests";
  const head=el("div","f4-bank-mobile-section-head");
  head.append(el("h3","","Pengajuan Anggota"));
  const refresh=el("button","f4-bank-refresh-button","Muat ulang");refresh.type="button";refresh.onclick=loadManagerRequests;
  head.append(refresh);
  const content=el("div","f4-bank-manager-request-list","Buka menu Pencairan untuk memuat pengajuan.");content.id="f4BankManagerRequestList";
  section.append(head,content);page.append(section);
 }
 if(!$("f4BankManualPayout")){
  const detail=el("details","f4-bank-manual-payout");detail.id="f4BankManualPayout";
  detail.append(el("summary","","Pencairan manual (tanpa pengajuan)"));
  detail.append(el("p","f4-bank-screen-status","Hanya untuk warga tanpa pengajuan. Periksa status agar tidak dibayar dua kali."));
  const form=$("v9Form")?.closest(".f4-savings-payout");
  if(form)detail.append(form);
  const history=$("v9History")?.closest(".f4-savings-history");
  if(history)detail.append(history);
  page.append(detail);
 }
 const savings=$("pageTabungan");
 if(savings&&!$("f4BankPayoutLink")){
  const go=el("button","f4-bank-secondary-action f4-bank-payout-link","Lihat pengajuan pencairan");
  go.id="f4BankPayoutLink";go.type="button";go.onclick=()=>navigate("bank-payout-admin");
  savings.querySelector(".f4-savings-utility")?.prepend(go);
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

/* Reuse existing public graph/report nodes, never duplicate their data or listeners. */
function restoreFeature(){
 for(const item of moved){
  if(item.node.id==="v22DocsPage")item.node.classList.add("hidden");
  if(item.anchor.parentNode)item.anchor.replaceWith(item.node);
 }
 $("f4MemberDocsShortcut")?.remove();
 moved=[];
 // The public homepage must not retain the album-only mode after member navigation.
 document.querySelector("#v11Public .v17-public-main")?.classList.remove("v22-show-docs");
 document.body.classList.remove("f4-member-feature");
 const back=$("f4-mobile-menu");
 if(back){back.replaceChildren(el("span","f4-svg-icon f4-svg-menu"));back.title="Buka menu halaman";back.setAttribute("aria-label","Buka menu halaman");}
}
function moveFeature(ids,target){
 restoreFeature();
 for(const id of ids){
  const node=$(id);if(!node?.parentNode)continue;
  const anchor=document.createComment("Restore "+id);node.before(anchor);
  moved.push({node,anchor});target.append(node);
 }
}
function memberSide(enabled){
 // Mobile: bottom dock only. Desktop: full left sidebar, same route handlers.
 const side=$("sideNav");if(!side)return;
 const desktop=window.matchMedia("(min-width:1024px)").matches;
 const visible=enabled&&desktop;
 side.classList.toggle("hidden",enabled&&!desktop);
 side.classList.remove("open");
 if(enabled&&!desktop){side.setAttribute("aria-hidden","true");side.inert=true;}
 else{side.removeAttribute("aria-hidden");side.inert=false;}
 $("v16Backdrop")?.classList.remove("open");
 document.body.classList.remove("f4-bank-drawer-open");
 document.body.classList.toggle("f4-bank-member-desktop",visible);
}
function progressPreview(){
 if(roleType()!=="member")return;
 const home=$("f4BankAppHome");if(!home)return;
 let preview=$("f4MemberEnvironmentPreview");
 if(!preview){
  preview=el("section","f4-member-environment-preview");preview.id="f4MemberEnvironmentPreview";
  const heading=el("div","f4-member-environment-head");
  heading.append(el("h3","","Perkembangan"));
  const view=el("button","","Lihat semua");view.type="button";view.onclick=()=>navigate("bank-member-progress");
  heading.append(view);
  const stats=el("div","f4-member-environment-stats");stats.id="f4MemberEnvironmentStats";
  const recent=el("button","f4-member-environment-latest");recent.id="f4MemberEnvironmentLatest";recent.type="button";
  recent.onclick=()=>navigate("bank-member-progress");
  preview.append(heading,stats,recent);
  const history=$("v14Recent")?.closest(".v14-panel");
  if(history?.parentElement===home)history.before(preview);else home.append(preview);
 }
 const rows=[...($("f4DevStats")?.querySelectorAll(".f4-dev-stat")||[])];
 const values=rows.map(node=>node.querySelector(".f4-dev-stat-value")?.textContent?.trim()||"—");
 const stats=$("f4MemberEnvironmentStats");
 stats.replaceChildren(...[["Berat sah",values[0]||"—","bank.svg"],["Hasil jual",values[2]||"—","cash.svg"],["Tahap",values[3]||"—","calendar.svg"]].map(([label,value,asset])=>{
  const tile=el("div","f4-member-environment-stat");
  tile.append(image(asset));
  const data=el("span");data.append(el("small","",label),el("strong","",value));tile.append(data);return tile;
 }));
 const latest=$("f4MemberEnvironmentLatest"),activity=$("v17Timeline")?.querySelector(".f4-dev-activity");
 latest.replaceChildren();
 const thumb=activity?.querySelector("img");
 if(thumb){const img=el("img");img.src=thumb.src;img.alt="";latest.append(img);}else latest.append(image("calendar.svg"));
 const info=el("span");info.append(el("small","","Kegiatan terbaru"),el("strong","",activity?.querySelector(".f4-dev-activity-info strong")?.textContent||"Lihat linimasa"));
 latest.append(info,el("span","f4-member-next","›"));
}
function infoShortcut(){
 const home=$("f4BankAppHome");if(roleType()!=="member"||!home)return;
 let link=$("f4MemberInfoShortcut");
 if(!link){
  link=el("button","f4-member-info-shortcut");link.id="f4MemberInfoShortcut";link.type="button";
  link.append(image("book.svg"),el("span","","Informasi & Laporan"),el("span","f4-member-next","›"));
  link.onclick=()=>navigate("bank-member-info");
 }
 home.append(link);
}
function publicSnapshot(){
 if(roleType()!=="member"||memberSnapshotsLoaded||snapshotBusy||typeof window.v17LoadPublic!=="function")return;
 snapshotBusy=true;
 Promise.resolve().then(()=>window.v17LoadPublic()).then(()=>{
  memberSnapshotsLoaded=true;progressPreview();
  if(!snapshotObserver&&$("f4DevStats")){
   snapshotObserver=new MutationObserver(progressPreview);
   snapshotObserver.observe($("f4DevStats"),{subtree:true,childList:true,characterData:true});
  }
 }).catch(()=>{}).finally(()=>{snapshotBusy=false});
}
function memberFeature(route){
 const progress=route==="bank-member-progress",docs=route==="bank-member-docs";
 const name=progress?"Perkembangan":docs?"Dokumentasi":"Informasi & Laporan";
 const page=ensureScreen(route,name);
 page.querySelector(":scope > .f4-bank-screen-title")?.remove();
 // The report already has its own "Laporan Publik" heading; avoid repeating it.
 if(!progress&&!docs)page.querySelector(".f4-member-feature-header")?.remove();
 else if(!page.querySelector(".f4-member-feature-header")){
  const header=el("header","f4-member-feature-header");
  const title=el("div");
  title.append(el("h2","",name),el("small","",progress?"Bank Sampah Flamboyan 4":docs?"Daftar album kegiatan":"Laporan publik · Dokumentasi · Inventaris"));
  header.append(title);page.prepend(header);
 }
 let content=page.querySelector(".f4-member-feature-content");
 if(!content){content=el("div","f4-member-feature-content");page.append(content);}
 if(progress)moveFeature(["v17PublicMetrics","v17Perkembangan"],content);
 else if(docs){
  moveFeature(["v22DocsPage"],content);
  const albumPage=$("v22DocsPage");
  albumPage?.classList.remove("hidden");
  window.f4BankRenderDocumentation?.();
  // Original public-page back action remains untouched. Member uses its top navigation.
 }else{
  moveFeature(["v17Transparansi","v17Dokumentasi","v17Inventaris"],content);
  let shortcut=$("f4MemberDocsShortcut");
  if(!shortcut){
   const section=$("v17Dokumentasi");
   shortcut=el("button","f4-member-doc-shortcut","Lihat semua album");
   shortcut.id="f4MemberDocsShortcut";shortcut.type="button";
   shortcut.onclick=()=>navigate("bank-member-docs");
   section?.querySelector(".v21-section-bar")?.append(shortcut);
   if(!shortcut.isConnected)section?.prepend(shortcut);
  }
  if(typeof window.v25LoadReport==="function")window.v25LoadReport();
 }
 document.body.classList.add("f4-member-feature");
 if(!memberSnapshotsLoaded)publicSnapshot();
 window.scrollTo({top:0,behavior:"instant"});
}
function bindMemberDocumentation(){
 const section=$("v17Dokumentasi");if(!section||section.dataset.f4MemberDocsBound)return;
 section.dataset.f4MemberDocsBound="1";
 section.addEventListener("click",event=>{
  if(roleType()!=="member"||!section.closest("#bank-member-info"))return;
  if(!event.target.closest("#v17Albums button, .v22-section-title"))return;
  event.preventDefault();event.stopImmediatePropagation();
  navigate("bank-member-docs");
 },true);
 section.addEventListener("keydown",event=>{
  if(roleType()!=="member"||!section.closest("#bank-member-info"))return;
  if(!["Enter"," "].includes(event.key)||!event.target.closest(".v22-section-title"))return;
  event.preventDefault();event.stopImmediatePropagation();navigate("bank-member-docs");
 },true);
}
function visibleMemberRoute(){
 for(const id of [...featureRoutes,...custom,"pagePribadi","pageProfile","pageDashboard"]){
  if($(id)&&!$(id).classList.contains("hidden"))
   return id==="pagePribadi"?"pribadi":id==="pageProfile"?"profile":id==="pageDashboard"?"dashboard":id;
 }
 return "dashboard";
}

function hideCustom(){
 for(const id of [...custom,...featureRoutes])$(id)?.classList.add("hidden");
}
function navigate(route){
 if(route==="menu"){if(roleType()==="admin")$("v18PrivateMenuButton")?.click();return;}
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
 if(roleType()==="member"&&featureRoutes.includes(route)){
  restoreFeature();hideCustom();
  old.call(window,"dashboard",...args);
  $("pageDashboard")?.classList.add("hidden");
  memberFeature(route);
  $(route)?.classList.remove("hidden");
  if(typeof window.v16Sync==="function")window.v16Sync(route);
  screen=route;markDock();return;
 }
 if(document.body.classList.contains("f4-member-feature")){restoreFeature();hideCustom();}

 if(route==="bank-payout-admin"&&roleType()==="admin"){
  hideCustom();
  old.call(window,"tabungan",...args);
  managerRequestsPanel();
  $("pageTabungan")?.classList.add("hidden");
  $("bank-payout-admin")?.classList.remove("hidden");
  if(typeof window.v16Sync==="function")window.v16Sync("bank-payout-admin");
  screen="bank-payout-admin";markDock();
  loadManagerRequests();
  return;
 }
 if(custom.includes(route)&&roleType()==="member"){
  old.call(window,"pribadi",...args);
  ensureMemberPages();
  hideCustom();
  $("pagePribadi")?.classList.add("hidden");
  $(route)?.classList.remove("hidden");screen=route;
  if(typeof window.v16Sync==="function")window.v16Sync(route);
  markDock();
  if(route==="bank-history")showHistory();
  if(route==="bank-report")showReport();
  if(route==="bank-payout")requestsMember();
  return;
 }
 hideCustom();
 const result=old.call(window,route,...args);
 if(route==="dashboard"&&role==="member"){
  const link=$("v14AllDeposits");if(link){link.textContent="Lihat semua";link.onclick=()=>navigate("bank-history");}
 }
 screen=route;markDock();
 if(route==="tabungan"&&roleType()==="admin")managerRequestsPanel();
 if(route==="pribadi")ensureMemberPages();
 return result;
}
function sync(){
 const next=roleType(),isPrivate=!!next&&!$("dashboardView")?.classList.contains("hidden");
 document.body.classList.toggle("f4-bank-app-private",isPrivate);
 document.body.classList.toggle("f4-bank-app-member",isPrivate&&next==="member");
 document.body.classList.toggle("f4-bank-app-admin",isPrivate&&next==="admin");
 dock().hidden=!isPrivate;
 if(!isPrivate){
  if(document.body.classList.contains("f4-member-feature"))restoreFeature();
  hideCustom();memberSide(false);
  $("f4BankMemberTopIdentity")?.remove();document.body.classList.remove("f4-bank-member-secondary");
  role=null;memberStatement=null;memberSnapshotsLoaded=false;
  $("f4BankProfileDetail")?.remove();return;
 }
 if(next!==role){
  role=next;screen=next==="member"?visibleMemberRoute():"dashboard";dock().replaceChildren(...(role==="admin"?adminDock:memberDock).map(x=>action(x,true)));
  if(role==="member")requestNonce="";
  memberStatement=null;adminOverview=null;
  if(role==="admin")$("f4BankProfileDetail")?.remove();
 }
 memberSide(role==="member");
 ensureHome();
 if(role==="member"){
  ensureMemberPages();progressPreview();infoShortcut();orderMemberHome();bindMemberDocumentation();publicSnapshot();
 }else managerRequestsPanel();
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
/* Nama tampilan diedit langsung di Profil Saya, bukan lewat formulir/halaman akun lain.
   Endpoint ini hanya mengubah alias pemilik akun; identitas ledger warga tetap. */
function inlineMemberDisplayName(){
 if(role!=="member")return;
 const name=$("pName");if(!name||name.closest(".f4-member-name-row"))return;
 const row=el("div","f4-member-name-row");name.before(row);row.append(name);
 const edit=el("button","f4-member-name-edit");edit.type="button";
 edit.title="Edit nama tampilan";edit.setAttribute("aria-label","Edit nama tampilan");
 edit.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16 4a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4L16 4Z"/></svg>';
 const input=el("input","f4-member-name-input");input.type="text";input.maxLength=100;input.autocomplete="nickname";
 input.setAttribute("aria-label","Nama tampilan");
 const save=el("button","f4-member-name-save","✓");save.type="button";save.title="Simpan nama";save.setAttribute("aria-label","Simpan nama tampilan");
 const cancel=el("button","f4-member-name-cancel","×");cancel.type="button";cancel.title="Batal";cancel.setAttribute("aria-label","Batalkan edit nama");
 const status=el("span","f4-member-name-status");status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.hidden=true;
 row.append(edit,input,save,cancel);row.after(status);
 let saving=false;
 function mode(active){
  name.hidden=active;edit.hidden=active;
  input.hidden=!active;save.hidden=!active;cancel.hidden=!active;
  if(active){status.hidden=true;status.textContent="";}
 }
 mode(false);
 edit.onclick=()=>{
  input.value=name.textContent.trim();mode(true);input.focus();input.select();
 };
 cancel.onclick=()=>{if(saving)return;mode(false);edit.focus();};
 async function persist(){
  if(saving)return;
  const value=input.value.trim().replace(/\s+/g," ");
  if(value.length<2||value.length>100||/[<>\x00-\x1f]/.test(value)){
    status.textContent="Nama harus 2–100 karakter.";status.hidden=false;input.focus();return;
  }
  if(value===name.textContent.trim()){mode(false);return;}
  saving=true;save.disabled=true;cancel.disabled=true;
  status.textContent="Menyimpan...";status.hidden=false;
  try{
    const result=await api("/api/member/profile",{nama:value});
    if(roleType()!=="member"||!$("dashboardView")||$("dashboardView").classList.contains("hidden"))return;
    const persisted=String(result.profile?.nama||value).trim();
    name.textContent=persisted;
    const sidebar=$("v15AccountName");if(sidebar)sidebar.textContent=persisted;
    const greeting=$("greeting");if(greeting)greeting.textContent="Halo, "+persisted;
    const welcome=$("welcomeName");if(welcome)welcome.textContent=persisted;
    const mobile=$("f4BankAppHome")?.querySelector(".f4-bank-app-personal-greeting strong");
    if(mobile)mobile.textContent="Halo, "+persisted+"!";
    mode(false);
    window.dispatchEvent(new CustomEvent("f4-account-profile-updated",{detail:{nama:persisted}}));
  }catch(error){
    status.textContent=error.message||"Nama belum tersimpan.";status.hidden=false;input.focus();
  }finally{
    saving=false;save.disabled=false;cancel.disabled=false;
  }
 }
 save.onclick=persist;
 input.addEventListener("keydown",event=>{
  if(event.key==="Enter"){event.preventDefault();persist();}
  if(event.key==="Escape"){event.preventDefault();cancel.click();}
 });
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
  const button=el("button","f4-bank-profile-copy","Salin nomor anggota");button.type="button";
  button.onclick=async()=>{
   const id=memberID();if(!id||id==="—")return;
   try{await navigator.clipboard.writeText(id);button.textContent="Nomor tersalin";}
   catch{window.prompt("Nomor anggota:",id);}
  };
  wrapper.append(copy,button);
  target.prepend(wrapper);
  const head=target.querySelector(":scope > h2");if(head)head.textContent="Profil & Pengaturan";
 }
 updateCardNumber();
 inlineMemberDisplayName();
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
 // Resizing between phone and PC must restore/hide the real sidebar immediately.
 window.addEventListener("resize",()=>{
  if(role==="member")memberSide(true);
 });
 $("f4-mobile-menu")?.addEventListener("click",event=>{
  if(roleType()!=="member")return;
  event.preventDefault();event.stopImmediatePropagation();
  if(screen!=="dashboard")navigate("dashboard");
 },true);
 window.addEventListener("f4-account-profile-updated",memberTopIdentity);
 const openPublic=window.v11ShowPublic;
 if(typeof openPublic==="function")window.v11ShowPublic=function(...args){
  restoreFeature();hideCustom();return openPublic.apply(this,args);
 };
 window.addEventListener("f4-bank-member-statement",acceptMemberStatement);
 window.addEventListener("f4-bank-admin-overview",updateAdminOverview);
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
