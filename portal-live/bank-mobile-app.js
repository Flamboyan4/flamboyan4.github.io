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
function bankUiSvg(name){
 const paths={'chevron-right':'m9 18 6-6-6-6','check':'m20 6-11 11-5-5','x':'M18 6 6 18M6 6l12 12'};
 if(!paths[name])throw Error('Unknown Bank SVG icon');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','18');svg.setAttribute('height','18');
 svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
 svg.setAttribute('stroke-width','2');svg.setAttribute('stroke-linecap','round');
 svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
 const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[name]);svg.append(path);
 return svg;
}
function bankIconSpan(cls,name){const span=el('span',cls);span.append(bankUiSvg(name));span.setAttribute('aria-hidden','true');return span;}
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
const memberDock=[
 ["Beranda","dashboard","home.svg"],["Tabungan","pribadi","cash.svg"],
 ["Pencairan","bank-payout","pay.svg"],["Riwayat","bank-history","clock.svg"],
 ["Laporan","bank-report","book.svg"]
];
let role=null,screen="dashboard",historyMonth="latest",reportMonth="",reportRange=null,activePage=null;
const routeHistory=[];let returningFromBack=false;
let homeSource=null,summaryExtra=null,memberSource=null,managerQueue=null;
let primaryNode=null,extraNode=null;
let ready=false,requestNonce="",requestEnabled=false;
let memberStatement=null,memberChartMode="kg",memberChartGroup="period";
let memberHomeChartGroup="month";
let memberPublicMini={data:null,pending:null,loadedAt:0,version:0};
let adminOverview=null;
let refreshing=false;
const custom=["bank-history","bank-payout","bank-report","bank-prices","bank-payout-admin","bank-admin-history","bank-admin-docs","bank-admin-cash","bank-admin-progress"];
const featureRoutes=["bank-member-progress","bank-member-info","bank-member-docs"];
let moved=[],memberSnapshotsLoaded=false,snapshotBusy=false;
const text=(id,val)=>{if($(id)&&$(id).textContent!==String(val))$(id).textContent=String(val)};
const image=file=>{const img=el("img");img.src="/assets/icons/"+file;img.alt="";img.setAttribute("aria-hidden","true");return img;};
function roleType(){
 const r=String(document.body.dataset.f4BankRole||"").toLowerCase();
 return ["admin","superadmin"].includes(r)?"admin":["warga","anggota"].includes(r)?"member":null;
}
function action([title,route,asset],dock=false){
 const b=el("button",dock?"f4-bank-app-dock-action":"f4-bank-app-action");
 b.type="button";b.dataset.bankAppRoute=route;b.setAttribute("aria-label",title);
 const isMemberPayout=dock&&route==="bank-payout";
 if(isMemberPayout)b.classList.add("is-primary");
 const symbol=el("span","f4-bank-app-action-icon");
 if(isMemberPayout){
  // Match the original yellow payout badge: the white "Rp" is a crisp SVG wordmark.
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 72 72");
  svg.setAttribute("aria-hidden","true");
  svg.classList.add("f4-bank-payout-rp-icon");
  svg.innerHTML='<text x="36" y="45" text-anchor="middle">Rp</text>';
  symbol.append(svg);
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
  const selected=b.dataset.bankAppRoute===screen;
  b.classList.toggle("is-active",selected);
  if(selected)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
 }
 for(const b of document.querySelectorAll("#v16NavList .f4-bank-desktop-nav-link")){
  const selected=b.dataset.bankAppRoute===screen;
  b.classList.toggle("active",selected);
  if(selected)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
 }
 if(roleType()==="member")syncMemberBack();
 if(roleType()==="admin")syncAdminBack();
 syncAdminGreeting();
}
function syncAdminGreeting(){
 const greeting=$("f4BankPageGreeting");
 if(greeting)greeting.hidden=roleType()!=="admin"||screen!=="dashboard";
}
function previousBankPage(){
 let destination=routeHistory.pop()||"dashboard";
 if(destination===screen)destination="dashboard";
 returningFromBack=true;
 try{navigate(destination);}finally{returningFromBack=false;}
}
function syncAdminBack(){
 const section=$("dashboardView")?.querySelector(".section");
 if(!section)return;
 let back=$("f4BankAdminBack");
 if(!back){
  back=el("button","f4-bank-admin-back");
  back.id="f4BankAdminBack";back.type="button";
  back.setAttribute("aria-label","Kembali ke halaman sebelumnya");
  const arrow=document.createElementNS("http://www.w3.org/2000/svg","svg");
  arrow.setAttribute("viewBox","0 0 24 24");arrow.setAttribute("aria-hidden","true");
  arrow.innerHTML='<path d="M19 12H5m7-7-7 7 7 7"/>';
  back.append(arrow); // Ikon panah saja, nama aksi tetap tersedia via aria-label.
  back.onclick=previousBankPage;
  section.prepend(back);
 }
 back.hidden=screen==="dashboard"||!$("pageDashboard")?.classList.contains("hidden")||roleType()!=="admin";
}
// Compact member identity replaces the oversized greeting on the member dashboard.
function memberTopIdentity(){
 const bar=$("f4-direct-bar"),links=bar?.querySelector(".f4-nav-links");
 let identity=$("f4BankMemberTopIdentity");
 // Member mobile header is intentionally only a greeting and global utilities.
 // Remove any extra brand from earlier versions, without duplicating it.
 $("f4BankMemberTopBrand")?.remove();
 if(roleType()!=="member"||!bar||!links){identity?.remove();return;}
 if(!identity){
  identity=el("span","f4-bank-member-top-identity");identity.id="f4BankMemberTopIdentity";
  bar.insertBefore(identity,links);
 }
 const name=$("pName")?.textContent?.trim()||"Anggota";
 const home=$("pHome")?.textContent?.trim()||"—";
 identity.replaceChildren(el("strong","","Halo, "+name),el("small","","Rumah "+home));
}
function adminTopIdentity(){
 const bar=$("f4-direct-bar"),links=bar?.querySelector(".f4-nav-links");
 let badge=$("f4BankAdminTopIdentity");
 if(roleType()!=="admin"||!bar||!links){badge?.remove();return;}
 if(!badge){
  badge=el("strong","f4-bank-admin-top-identity","Pengelola");
  badge.id="f4BankAdminTopIdentity";
  bar.insertBefore(badge,links);
 }
 badge.textContent="Pengelola";
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
 const items=[$("f4MemberPriceShortcut"),$("f4BankWeighingSchedule"),feed,$("f4MemberFlow"),$("f4MemberEnvironmentPreview"),$("f4MemberInfoShortcut")];
 // Member prices are the first action after their card/balance, directly above the weighing schedule.
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
  // ATM identity card: only real member fields are shown (no invented account digits).
  const cardHead=el("span","f4-bank-member-card-head");
  const brand=el("span","f4-bank-atm-brand"),logo=el("img");
  logo.src="/assets/logo-flamboyan.svg";logo.alt="";
  brand.append(logo,el("span","f4-bank-atm-brand-label","BANK SAMPAH FLAMBOYAN 4"));
  const contactless=el("span","f4-bank-atm-contactless");
  contactless.setAttribute("aria-hidden","true");
  contactless.innerHTML='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M8 11a8 8 0 0 1 0 10M13 7a13 13 0 0 1 0 18M18 3a19 19 0 0 1 0 26"/></svg>';
  cardHead.append(brand,contactless);
  const center=el("span","f4-bank-atm-center");
  const chip=el("span","f4-bank-member-card-chip");chip.setAttribute("aria-hidden","true");
  const number=el("strong","f4-bank-atm-number","—");number.id="f4BankCardNumber";
  center.append(chip,number);
  const identity=el("span","f4-bank-member-card-foot");
  const person=el("span","f4-bank-atm-person");
  person.append(el("small","","NAMA ANGGOTA"),el("strong","f4-bank-atm-person-name","—"));
  person.querySelector("strong").id="f4BankCardName";
  const house=el("span","f4-bank-atm-house");
  house.append(el("small","","RUMAH"),el("strong","f4-bank-card-house","—"));
  identity.append(person,house);card.append(cardHead,center,identity);
  const savings=el("button","f4-bank-app-member-balance");savings.id="f4BankAppMemberBalance";savings.type="button";
  savings.append(el("span","f4-bank-member-balance-label","Saldo Tersedia"),
    el("strong","f4-bank-member-balance-value","—"),
    el("span","f4-bank-balance-cta","Cek Tabungan"));
  savings.onclick=()=>navigate("pribadi");
  const hero=el("div","f4-bank-app-hero");hero.id="f4BankAppAdminHero";
  const heading=el("small","","BANK SAMPAH FLAMBOYAN 4"),label=el("strong","f4-bank-app-balance-title","Hasil diterima lapak"),
    amount=el("strong","f4-bank-app-balance","—"),secondary=el("span","f4-bank-app-secondary","Memuat...");
  amount.id="f4BankAppBalance";secondary.id="f4BankAppSecondary";
  hero.append(heading,label,amount,secondary);
  const minis=el("div","f4-bank-app-minis");minis.id="f4BankAppMinis";
  hub.append(welcome,card,savings,hero,minis);
  page.prepend(hub);
 }
 hub.dataset.bankRole=role;
 if(role!=="member")restoreMemberHomeLayout(hub);
 const name=$("pName")?.textContent?.trim()||"Anggota";
 const house=$("pHome")?.textContent?.trim()||"—";
 const welcome=$("f4BankAppWelcome");if(welcome){
   welcome.replaceChildren(el("strong","",name));
   welcome.append(el("small","","Rumah "+house));
 }
 memberTopIdentity();adminTopIdentity();
 updateCardNumber();
 const houseNode=hub.querySelector(".f4-bank-card-house");if(houseNode)houseNode.textContent=house;
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
  const flow=$("f4MemberFlow");if(flow){
   flow.hidden=false;flow.open=true;
   const summary=flow.querySelector("summary");
   if(summary&&!summary.dataset.f4Static){summary.dataset.f4Static="1";summary.tabIndex=-1;summary.addEventListener("click",event=>event.preventDefault());}
   if(!hub.contains(flow))hub.append(flow);
  }
  const panels=page.querySelector(".v14-panels");
  const link=$("v14AllDeposits");if(link){link.textContent="Lihat semua";link.onclick=()=>navigate("bank-history");}
  const recent=$("v14Recent")?.closest(".v14-panel");
  const recentHeading=recent?.querySelector(".v14-panel-head h3");
  if(recentHeading)recentHeading.textContent="Mutasi Setoran Terbaru";
  if(recent&&!hub.contains(recent))hub.append(recent);
  const remaining=panels?.querySelector(".v14-panel");
  if(remaining&&remaining.parentElement!==reservoir)reservoir.append(remaining);
  ensureWeighingSchedule(hub);window.F4MemberPrices?.shortcut(hub);
  arrangeMemberHomeLayout(hub);
 }else{
  const recent=$("v14Recent")?.closest(".v14-panel");
  if(recent&&recent.parentElement!==hub)hub.append(recent);
  // The full public development chart/timeline replaces the old duplicate activity preview.
  const activity=$("v14Activities")?.closest(".v14-panel");
  if(activity&&activity.parentElement!==reservoir)reservoir.append(activity);
  const flow=$("f4MemberFlow");if(flow)flow.hidden=true;
 }
 const legacyPanels=page.querySelector(".v14-panels");
 if(legacyPanels&&legacyPanels.parentElement!==reservoir)reservoir.append(legacyPanels);
 updateDashboard();
 if(role==="admin")ensureAdminHome();
}
/* Dashboard member composition, modelled on the supplied banking references.
   These are real, reused application nodes: no hard-coded transactions or balances.
   Keep the layout idempotent when navigating between pages or switching accounts. */
function memberQuickAction(id,label,detail,asset,route){
 let b=$(id);
 if(b)return b;
 b=el("button","f4-member-shortcut");
 b.id=id;b.type="button";
 const glyph=el("span","f4-member-shortcut-icon");glyph.append(image(asset));
 const copy=el("span","f4-member-shortcut-copy");
 copy.append(el("strong","",label),el("small","",detail));
 b.append(glyph,copy);
 b.onclick=()=>{
  if(route==="schedule"){
   const widget=$("f4BankWeighingSchedule");
   widget?.scrollIntoView({behavior:"smooth",block:"center"});
  }else navigate(route);
 };
 return b;
}
function restoreMemberHomeLayout(hub){
 if(!hub)return;
 const card=$("f4BankMemberCard"),balance=$("f4BankAppMemberBalance");
 const recent=$("v14Recent")?.closest(".v14-panel");
 const flow=$("f4MemberFlow");
 for(const node of [card,balance,recent,flow])if(node&&hub.contains(node))hub.append(node);
 for(const id of ["f4MemberHero","f4MemberQuickActions","f4MemberContent"]){
  $(id)?.remove();
 }
 $("f4BankWeighingSchedule")?.remove();
 $("f4MemberPriceShortcut")?.remove();
}
function ensureMemberHowtoBanner(){
 const home=$("f4BankAppHome");if(roleType()!=="member"||!home)return;
 let banner=$("f4MemberHowtoBanner");
 if(!banner){
  banner=el("figure","f4-member-howto-banner");banner.id="f4MemberHowtoBanner";
  const picture=el("img");
  picture.src="/assets/bank-sampah-alur-penimbangan-1600x500.png";
  picture.width=1600;picture.height=500;
  picture.loading="lazy";picture.decoding="async";
  picture.alt="Alur Bank Sampah: kumpulkan plastik, logam, dan kertas di rumah, antar ke Bank Sampah, timbang dan catat, kemudian cek setoran lewat akun web.";
  banner.append(picture);
 }
 if(banner.parentElement!==home||banner!==home.lastElementChild)home.append(banner);
}

function arrangeMemberHomeLayout(hub){
 if(role!=="member"||!hub)return;
 const card=$("f4BankMemberCard"),balance=$("f4BankAppMemberBalance");
 if(!card||!balance)return;
 // The ATM and wallet are separate sibling cards. There is NO green hero wrapper.
 hub.append(card,balance);
 $("f4MemberHero")?.remove();
 let quick=$("f4MemberQuickActions");
 if(!quick){
  quick=el("section","f4-member-shortcuts");
  quick.id="f4MemberQuickActions";
  quick.setAttribute("aria-label","Jadwal penimbangan dan daftar harga");
  hub.append(quick);
 }
 // Keep the real schedule and price nodes, not duplicate demo cards.
 const weighing=$("f4BankWeighingSchedule"),price=$("f4MemberPriceShortcut");
 quick.replaceChildren(...[weighing,price].filter(Boolean));
 let content=$("f4MemberContent");
 if(!content){content=el("div","f4-member-content");content.id="f4MemberContent";hub.append(content);}
 let aside=$("f4MemberAside");
 if(!aside){aside=el("aside","f4-member-aside");aside.id="f4MemberAside";}
 const recent=$("v14Recent")?.closest(".v14-panel");
 if(recent)content.append(recent);
 content.append(aside);
 const flow=$("f4MemberFlow");
 if(flow)aside.append(flow);
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
  // Only update the amount: replacing the card contents destroyed its ATM-style layout,
  // stripped the balance typography classes and removed the "Cek Tabungan" CTA.
  const amount=button?.querySelector(".f4-bank-member-balance-value");
  if(amount)amount.textContent=memberStatement?rupiah(memberStatement.saldo):(map.get("Saldo sah")||"—");
  $("f4BankAppMinis")?.replaceChildren();
 }else{
  const current=adminOverview;
  const owned=current?.kasMilikBankRp;
  const headline=$("f4BankAppAdminHero")?.querySelector(".f4-bank-app-balance-title");if(headline)headline.textContent="Kas milik Bank Sampah";
  text("f4BankAppBalance",Number.isFinite(owned)?rupiah(owned):"—");
  text("f4BankAppSecondary",current?"Hasil diterima lapak: "+rupiah(current.diterimaLapakRp):"Memuat posisi kas...");
  const opts=current?[["Hak warga",rupiah(current.hakWargaBelumCairRp)],["Kas lingkungan",rupiah(current.kasLingkunganRp)],["Anggota aktif",current.wargaAktif]]:
   [["Hak warga","—"],["Kas lingkungan","—"],["Anggota aktif",map.get("Anggota aktif")]];
  $("f4BankAppMinis")?.replaceChildren(...opts.map(([label,value])=>{
   const node=el("div","f4-bank-app-mini");node.append(el("small","",label),el("strong","",value||"—"));return node;
  }));
 }
}
function updateAdminOverview(event){
 if(roleType()!=="admin"||!event.detail)return;
 adminOverview=event.detail;updateDashboard();
}
// Admin has an unframed page shell on PC and HP; inner information cards stay intact.
// Restore the original page class if a member account is opened in the same session.
function syncAdminPageFrames(){
 const section=$("dashboardView")?.querySelector(".grid > .section");
 if(!section)return;
 const admin=roleType()==="admin";
 for(const page of section.querySelectorAll("[id^='page']")){
  if(page.id==="pagePengesahan"||page.id==="pagePribadi")continue;
  if(!page.dataset.f4OriginalAdminCard&&page.classList.contains("card"))
   page.dataset.f4OriginalAdminCard="1";
  if(page.dataset.f4OriginalAdminCard!=="1")continue;
  const unframed=admin&&page.parentElement===section;
  page.classList.toggle("card",!unframed);
  page.classList.toggle("f4-bank-admin-unframed",unframed);
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
 }
 // Riwayat becomes the right-hand panel on PC, and remains below the chart on HP.
 const deposits=$("v12Deposits");
 if(deposits&&!$("f4BankSavingsHistoryPanel")){
  const panel=el("section","f4-bank-savings-history-panel");panel.id="f4BankSavingsHistoryPanel";
  const heading=deposits.previousElementSibling;
  if(heading?.tagName==="H2"){heading.textContent="Riwayat Setoran";panel.append(heading);}
  else panel.append(el("h2","","Riwayat Setoran"));
  panel.append(deposits);priv.append(panel);
 }
 priv.querySelector(".f4-bank-report-open")?.remove();
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
  const badge=el("span","f4-bank-history-icon "+(deposit?"is-deposit":out?"is-out":"is-in"));
  badge.setAttribute("aria-hidden","true");
  badge.innerHTML=deposit?'<img src="/assets/icons/bank.svg" alt="">':
   out?'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>':
   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m7-7-7 7-7-7"/></svg>';
  item.append(badge);
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
  const rangeButton=el("button","f4-bank-secondary-action","Atur periode");rangeButton.type="button";
  rangeButton.id="f4BankReportRangeToggle";
  rangeButton.onclick=()=>{
   reportRange=reportRange?null:{from:reportMonth+"-01",to:today()};
   if(reportRange&&reportRange.from>reportRange.to)reportRange.from=reportRange.to;
   showReport();
  };
  const dateFields=el("div","f4-bank-report-range-fields");dateFields.id="f4BankReportRangeFields";
  const from=el("input");from.type="date";from.id="f4BankReportFrom";from.setAttribute("aria-label","Dari tanggal");
  const to=el("input");to.type="date";to.id="f4BankReportTo";to.setAttribute("aria-label","Sampai tanggal");
  const changeRange=()=>{
   if(from.value>to.value)return;
   reportRange={from:from.value,to:to.value};showReport();
  };
  from.onchange=changeRange;to.onchange=changeRange;
  const first=el("label","","Dari");first.append(from);const last=el("label","","Sampai");last.append(to);
  dateFields.append(first,last);period.append(rangeButton,dateFields);

  const summary=el("div","f4-bank-report-summary");summary.id="f4BankReportSummary";
  const actions=el("div","f4-bank-report-actions");
  const pdf=el("button","f4-bank-gold-action","Cetak PDF");pdf.type="button";
  pdf.id="f4BankMemberPrintAction";
  pdf.onclick=()=>{
   if(typeof window.f4BankMemberPrintReady==="function"&&!window.f4BankMemberPrintReady())return;
   if(typeof window.v12Print==="function")window.v12Print();
  };
  const csv=el("button","f4-bank-secondary-action","Unduh CSV");csv.type="button";
  csv.onclick=()=>typeof window.v12CSV==="function"&&window.v12CSV();
  actions.append(pdf,csv);
  const title=el("h3","f4-bank-screen-subhead","Transaksi Periode");
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
 window.f4BankReportPeriod=()=>reportRange?"":reportMonth;
 window.f4BankReportRange=()=>reportRange;
 const rangeInputs=$("f4BankReportRangeFields");
 rangeInputs.hidden=!reportRange;
 $("f4BankReportRangeToggle").textContent=reportRange?"Per Bulan":"Atur Periode";
 $("f4BankReportMonth").closest("label").hidden=!!reportRange;
 $("f4BankReportYear").closest("label").hidden=!!reportRange;
 if(reportRange){$("f4BankReportFrom").value=reportRange.from;$("f4BankReportTo").value=reportRange.to;}
 const inPeriod=date=>reportRange?date>=reportRange.from&&date<=reportRange.to:String(date||"").startsWith(reportMonth);

 const selected=ledger().filter(x=>inPeriod(x.iso));
 const transactions=all.filter(x=>inPeriod(x.iso));
 const deposits=(memberStatement?.setoran||[]).filter(x=>inPeriod(String(x.tanggal||""))&&!/batal/i.test(String(x.status)));
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
 const printAction=$("f4BankMemberPrintAction");
 if(printAction)printAction.disabled=typeof window.f4BankMemberPrintReady==="function"&&!window.f4BankMemberPrintReady();
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
const weighingDayNames=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
let weighingWeekday=0,weighingLastFetched=0,weighingRequest=null,weighingRequestId=0;
let weighingRule={frequency:"weekly",nextOccurrence:"",anchorDate:"",dayOfMonth:null};
function weighingNextDate(){
 const now=new Date(today()+"T00:00:00Z");
 const current=new Date(now);
 const day=Number(weighingWeekday);
 const frequency=weighingRule.frequency||"weekly";
 if(frequency!=="weekly"){
  const supplied=weighingRule.nextOccurrence;
  if(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(supplied||"")){
   const date=new Date(supplied+"T00:00:00Z");
   if(Number.isFinite(date.getTime())&&date>=now)
    return {days:Math.round((date-now)/86400000),label:new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(date)};
  }
  return {days:null,label:"Jadwal berikutnya belum tersedia"};
 }
 const days=(day-current.getUTCDay()+7)%7;
 current.setUTCDate(current.getUTCDate()+days);
 return {days,label:new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(current)};
}
function updateWeighingCard(){
 const card=$("f4BankWeighingSchedule");if(!card)return;
 const next=weighingNextDate(),name=weighingDayNames[weighingWeekday];
 const title=card.querySelector("strong");
 if(title)title.textContent=next.days===0?"Hari ini • "+name:next.label;
 const detail=card.querySelector(".f4-bank-weigh-copy > span:last-child");
 if(detail)detail.textContent=weighingRule.frequency==="biweekly"?"Setiap 2 minggu":
  weighingRule.frequency==="monthly"?"Setiap bulan":"Setiap "+name;
 const modal=$("f4BankWeighingDialog");
 if(modal?.open){modal.querySelector(".f4-bank-schedule-date").textContent=next.days===0?"Hari ini • "+name:next.label;
  modal.querySelector(".f4-bank-schedule-cycle").textContent=detail?.textContent||"";}
}
function loadWeighingDay(){
 if(role!=="member")return;
 if(weighingRequest)return;
 if(weighingLastFetched&&Date.now()-weighingLastFetched<90000)return;
 const seq=++weighingRequestId;
 weighingLastFetched=Date.now(); // Throttle errors as well as successful reads.
 weighingRequest=fetch(apiRoot+"/api/public/bank/weighing-schedule",{
  method:"GET",credentials:"include",cache:"no-store"
 }).then(async response=>{
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result.ok===false||!Number.isInteger(result.weekday)||result.weekday<0||result.weekday>6)
   throw Error("Jadwal belum tersedia");
  if(seq!==weighingRequestId||role!=="member")return;
  weighingWeekday=result.weekday;
  weighingRule={frequency:result.frequency||"weekly",nextOccurrence:result.nextOccurrence||result.next_occurrence||"",anchorDate:result.anchorDate||"",dayOfMonth:result.dayOfMonth||null};
  weighingLastFetched=Date.now();updateWeighingCard();
 }).catch(()=>{}).finally(()=>{if(seq===weighingRequestId)weighingRequest=null;});
}
function openWeighingSchedule(){
 if(roleType()!=="member")return;
 let dialog=$("f4BankWeighingDialog");
 if(!dialog){
  dialog=el("dialog","f4-bank-sheet-modal f4-bank-schedule-dialog");dialog.id="f4BankWeighingDialog";
  const head=el("div","f4-bank-modal-heading");
  const title=el("h2","","Jadwal Penimbangan");
  const close=el("button","f4-bank-modal-close");close.type="button";close.setAttribute("aria-label","Tutup jadwal");
  close.append(bankUiSvg("x"));close.onclick=()=>dialog.close();
  head.append(title,close);
  const visual=el("div","f4-bank-schedule-highlight");
  const mark=el("span","f4-bank-schedule-symbol");mark.append(memberMetricIcon("stage"));
  const values=el("span","f4-bank-schedule-values");
  const date=el("strong","f4-bank-schedule-date","—");
  const cycle=el("small","f4-bank-schedule-cycle","—");
  values.append(date,cycle);visual.append(mark,values);
  const note=el("p","f4-bank-schedule-note","Bawa plastik, logam, atau kertas yang sudah dipilah.");
  dialog.append(head,visual,note);
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
  document.body.append(dialog);
 }
 const next=weighingNextDate();
 dialog.querySelector(".f4-bank-schedule-date").textContent=next.days===0?"Hari ini • "+weighingDayNames[weighingWeekday]:next.label;
 dialog.querySelector(".f4-bank-schedule-cycle").textContent=
  weighingRule.frequency==="biweekly"?"Setiap 2 minggu":weighingRule.frequency==="monthly"?"Setiap bulan":"Setiap "+weighingDayNames[weighingWeekday];
 if(!dialog.open)dialog.showModal();
 loadWeighingDay();
}
function ensureWeighingSchedule(home){
 if(role!=="member"||!home)return;
 let card=$("f4BankWeighingSchedule");
 if(!card){
  card=el("button","f4-bank-weigh-schedule");card.type="button";card.id="f4BankWeighingSchedule";
  card.setAttribute("aria-label","Lihat jadwal penimbangan");card.onclick=openWeighingSchedule;
  const icon=el("span","f4-bank-weigh-icon");icon.append(memberMetricIcon("stage"));
  const content=el("span","f4-bank-weigh-copy");
  content.append(el("small","","JADWAL BERIKUTNYA"),el("strong","","—"),el("span","","Memuat jadwal…"));
  card.append(icon,content);home.append(card);
 }
 updateWeighingCard();loadWeighingDay();
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
   // Tampilkan total satu periode/bulan; warna batang tetap memisahkan sah dan estimasi.
   const val=amounts.reduce((sum,value)=>sum+(Number(value)||0),0);
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
  detail.append(el("p","f4-bank-screen-status","Khusus tanpa pengajuan. Cegah bayar ganda."));
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
  const items=alertRows(response);
  adminAlerts.payout=items.filter(x=>["diajukan","disetujui"].includes(x.status)).length;
  paintAdminAlerts();
  for(const item of items){
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
/* Badge tugas pengurus: stok belum dijual dan pencairan aktif.
   API ringkas D1 lebih diutamakan; fallback menjaga kompatibilitas selama Worker diperbarui. */
const adminAlerts={unsold:null,payout:null};
let adminAlertBusy=false,adminAlertFetched=0,adminAlertGeneration=0,adminAlertRefreshAgain=false;
const alertRows=result=>Array.isArray(result?.data)?result.data:Array.isArray(result?.items)?result.items:[];
function paintAdminAlerts(){
 if(role!=="admin"||roleType()!=="admin")return;
 for(const [route,count,unit] of [
  ["penjualan",adminAlerts.unsold,"setoran atau stok menunggu penjualan"],
  ["bank-payout-admin",adminAlerts.payout,"pengajuan pencairan belum selesai"]
 ]){
  for(const button of document.querySelectorAll('[data-bank-app-route="'+route+'"]')){
   if(button.tagName!=="BUTTON")continue;
   let badge=button.querySelector(":scope > .f4-bank-alert-badge");
   if(!button.dataset.f4AlertBaseLabel){
    button.dataset.f4AlertBaseLabel=button.getAttribute("aria-label")||
     button.querySelector(".f4-bank-admin-operation-copy strong")?.textContent||
     button.querySelector("span:last-child")?.textContent||"Menu";
   }
   if(!Number.isFinite(count)||count<=0){
    badge?.remove();button.setAttribute("aria-label",button.dataset.f4AlertBaseLabel);
    continue;
   }
   if(!badge){
    badge=el("span","f4-bank-alert-badge");
    badge.setAttribute("aria-hidden","true");
    button.prepend(badge);
   }
   badge.textContent=count>99?"99+":String(count);
   badge.title=count+" "+unit;
   button.setAttribute("aria-label",button.dataset.f4AlertBaseLabel+" — "+count+" "+unit);
  }
 }
}
function resetAdminAlerts(){
 adminAlertGeneration++;adminAlertBusy=false;adminAlertRefreshAgain=false;adminAlertFetched=0;
 adminAlerts.unsold=null;adminAlerts.payout=null;
 document.querySelectorAll(".f4-bank-alert-badge").forEach(b=>b.remove());
 for(const button of document.querySelectorAll("[data-f4-alert-base-label]")){
  button.setAttribute("aria-label",button.dataset.f4AlertBaseLabel);
  delete button.dataset.f4AlertBaseLabel;
 }
}
async function fallbackAdminAlerts(){
 const [deposits,sales,stock,requests]=await Promise.all([
  api("/api/v2/admin/bank/deposits?limit=300"),
  api("/api/v2/admin/bank/sales?limit=300"),
  api("/api/v2/admin/bank/own-deposits"),
  api("/api/admin/bank/payout-requests")
 ]);
 const sold=new Set(alertRows(sales).filter(x=>String(x.status).toLowerCase()!=="dibatalkan")
  .map(x=>String(x.batch_id||"")).filter(Boolean));
 const member=alertRows(deposits).filter(x=>
  String(x.status).toLowerCase()==="estimasi"&&!sold.has(String(x.batch_id||""))).length;
 const bank=alertRows(stock).filter(x=>
  x.status==="stok_belum_terjual"&&Number(x.sisaGram||0)>0).length;
 const payout=alertRows(requests).filter(x=>["diajukan","disetujui"].includes(x.status)).length;
 return {unsoldDeposits:member+bank,pendingPayouts:payout};
}
async function refreshAdminAlerts(force=false){
 if(role!=="admin"||roleType()!=="admin"||document.hidden||
    $("dashboardView")?.classList.contains("hidden"))return;
 if(adminAlertBusy){if(force)adminAlertRefreshAgain=true;return;}
 if(!force&&Date.now()-adminAlertFetched<45000){paintAdminAlerts();return;}
 const generation=adminAlertGeneration;
 adminAlertBusy=true;adminAlertFetched=Date.now();
 try{
  let result;
  try{result=await api("/api/admin/bank/action-counts");}
  catch(error){
   // Saat endpoint baru belum terpasang, baca endpoint operasional yang sudah ada.
   if(/401|403|akses ditolak|sesi/i.test(String(error.message)))throw error;
   result=await fallbackAdminAlerts();
  }
  if(generation!==adminAlertGeneration||role!=="admin"||roleType()!=="admin")return;
  adminAlerts.unsold=Number(result.unsoldDeposits)||0;
  adminAlerts.payout=Number(result.pendingPayouts)||0;
  paintAdminAlerts();
 }catch(error){
  if(generation===adminAlertGeneration){
   adminAlertFetched=0;
   console.warn("Notifikasi pengurus belum dapat diperbarui:",error.message);
  }
 }finally{
  if(generation===adminAlertGeneration){
   adminAlertBusy=false;
   if(adminAlertRefreshAgain){
    adminAlertRefreshAgain=false;refreshAdminAlerts(true);
   }
  }
 }
}
/* Pengurus: Akses Cepat tetap di beranda HP; PC menggunakan rute yang sama pada sidebar. */
const adminShortcuts=[
 ["Cek & Sahkan","rekonsiliasi","shield-check"],
 ["Riwayat","bank-admin-history","history"],
 ["Debit/Kredit","bank-admin-cash","wallet"],
 ["Pencairan","bank-payout-admin","hand-coins"],
 ["Harga Barang","master","tags"],
 ["Data Anggota","admin","users"],
 ["Dokumentasi","bank-admin-docs","images"],
 ["Saldo Warga","tabungan","coins"],
 ["Laporan","laporan","file-text"]
];
const adminShortcutPaths={
 "shield-check":'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m8 12 3 3 5-5"/>',
 history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M4 4v5h5"/>',
 wallet:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M16 15h2M7 3h12"/>',
 "hand-coins":'<path d="M2 17h3l3 3h8l5-5-1.5-1.5-4 2H9"/><path d="M8 12h5a2 2 0 0 1 2 2"/><circle cx="16" cy="6" r="4"/><path d="M16 4v4m-1-3h2"/>',
 tags:'<path d="m3 12 9-9h8v8l-9 9-8-8Z"/><circle cx="16" cy="7" r="1"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M17 5a3 3 0 0 1 0 6m1 5c2 0 3 2 3 4"/>',
 images:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
 "user-round":'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 coins:'<ellipse cx="8" cy="17" rx="5" ry="3"/><path d="M3 17v3c0 1.7 2.2 3 5 3s5-1.3 5-3v-3"/><circle cx="16" cy="8" r="5"/><path d="M16 5v6m-2-5h4"/>' ,
 "file-text":'<path d="M6 2h8l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h5M8 12h8M8 16h8"/>'
};
function adminShortcut([name,route,iconName]){
 const button=el("button","f4-bank-admin-shortcut");
 button.type="button";button.dataset.bankAppRoute=route;button.setAttribute("aria-label",name);
 const circle=el("span","f4-bank-admin-shortcut-icon");
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");
 svg.innerHTML=adminShortcutPaths[iconName]||adminShortcutPaths.wallet;
 circle.append(svg);button.append(circle,el("span","",name));
 button.onclick=()=>navigate(route);return button;
}
/* Satu daftar rute melayani shortcut HP dan sidebar PC; jangan membuat menu duplikat. */
function ensureDesktopAdminSidebar(){
 if(role!=="admin")return;
 const list=$("v16NavList");if(!list)return;
 const anchor=list.querySelector('[data-group="home"]');
 if(!anchor)return;
 const oldLinks=[...list.querySelectorAll(".f4-bank-desktop-nav-link")];
 if(oldLinks.length===adminShortcuts.length)return;
 oldLinks.forEach(link=>link.remove());
 const items=document.createDocumentFragment();
 for(const [name,route,iconName] of adminShortcuts){
  const button=el("button","v16-item f4-bank-desktop-nav-link");
  button.type="button";button.dataset.bankAppRoute=route;
  button.setAttribute("aria-label",name);
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 24 24");
  svg.setAttribute("aria-hidden","true");
  svg.innerHTML=adminShortcutPaths[iconName]||adminShortcutPaths.wallet;
  button.append(svg,el("span","",name));
  button.onclick=()=>navigate(route);
  items.append(button);
 }
 anchor.after(items);
}
let adminProgressAnchor=null,adminProgressNode=null;
function f4BankChevronIcon(){
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");
 svg.setAttribute("aria-hidden","true");
 svg.innerHTML='<path d="m9 18 6-6-6-6"/>';
 return svg;
}
function adminOperation(label,detail,route,primary){
 const button=el("button","f4-bank-admin-operation"+(primary?" is-primary":""));
 button.type="button";button.dataset.bankAppRoute=route;
 const icon=el("span","f4-bank-admin-operation-icon");
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");
 svg.innerHTML=primary
  ?'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8m-4-4h8"/>'
  :adminShortcutPaths.wallet;
 icon.append(svg);
 const copy=el("span","f4-bank-admin-operation-copy");
 copy.append(el("strong","",label));
 if(detail)copy.append(el("small","",detail));
 const arrow=el("span","f4-bank-admin-operation-arrow");
 arrow.setAttribute("aria-hidden","true");
 arrow.append(f4BankChevronIcon());
 button.append(icon,copy,arrow);
 button.onclick=()=>navigate(route);return button;
}
function adminNextAction(label,detail,route){
 const button=el("button","f4-bank-admin-next-action");
 button.type="button";button.dataset.bankAppRoute=route;
 const copy=el("span");copy.append(el("strong","",label),el("small","",detail));
 const chevron=el("span","f4-bank-next-arrow");chevron.append(f4BankChevronIcon());
 button.append(copy,chevron);button.onclick=()=>navigate(route);
 return button;
}
function ensureAdminHome(){
 if(role!=="admin")return;
 ensureDesktopAdminSidebar();
 const home=$("f4BankAppHome");if(!home)return;
 // The page greeting already says "Halo, admin"; never repeat a home heading.
 $("f4BankAdminIntro")?.remove();
 if(!$("f4BankAdminOperations")){
  const actions=el("div","f4-bank-admin-operations");actions.id="f4BankAdminOperations";
  actions.append(
   adminOperation("Catat Setoran","","setoran",true),
   adminOperation("Catat Penjualan","","penjualan",false)
  );
  $("f4BankAppAdminHero")?.before(actions);
 }
 $("f4BankAdminNext")?.remove();
 // Akses cepat sama untuk PC dan HP, dengan grid responsif masing-masing.
 let shortcuts=$("f4BankAdminShortcuts");
 if(!shortcuts){
  shortcuts=el("section","f4-bank-admin-shortcuts");shortcuts.id="f4BankAdminShortcuts";
  shortcuts.append(el("h2","","Akses Cepat"));
  const grid=el("div","f4-bank-admin-shortcut-grid");
  // Dokumentasi tersedia lewat menu hamburger HP dan sidebar PC, bukan Akses Cepat.
  grid.append(...adminShortcuts.filter(([,route])=>route!=="bank-admin-docs").map(adminShortcut));
  shortcuts.append(grid);
  $("f4BankAdminOperations")?.after(shortcuts);
 }
 paintAdminAlerts();
 refreshAdminAlerts();
}
function showAdminProgress(){
 const page=ensureScreen("bank-admin-progress","Perkembangan Bank Sampah");
 const progress=$("v17Perkembangan");
 if(progress&&progress.parentElement!==page){
  if(!adminProgressAnchor||!adminProgressAnchor.isConnected){
   adminProgressAnchor=document.createComment("Restore public Bank Sampah progress");
   progress.before(adminProgressAnchor);
  }
  adminProgressNode=progress;page.append(progress);
 }
 page.classList.remove("hidden");
 if(typeof window.v17LoadPublic==="function")window.v17LoadPublic();
}
function restoreAdminProgress(){
 if(adminProgressNode&&adminProgressAnchor?.parentNode)
  adminProgressAnchor.replaceWith(adminProgressNode);
 adminProgressNode=null;adminProgressAnchor=null;
}
/* Bank Sampah sebagai penyetor milik pengelola, bukan akun warga fiktif.
   Nilai uang harus sudah diterima sebelum ditulis ke jurnal kas. */
let ownCatalog=null,ownRequestKey="",ownFormMode="warga";
function chooseOwnMode(value){
 ownFormMode=value==="bank"?"bank":"warga";
 const own=$("f4BankOwnDepositForm"),normal=$("setoranForm"),tabs=$("f4BankOwnModeTabs");
 if(normal)normal.hidden=ownFormMode==="bank";
 if(own)own.hidden=ownFormMode!=="bank";
 tabs?.querySelectorAll("button").forEach(b=>{
  const active=b.dataset.mode===ownFormMode;
  b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));
 });
 if(ownFormMode==="bank")loadOwnCatalog();
}
function ensureOwnDepositForm(){
 if(role!=="admin")return;
 const page=$("pageSetoran"),normal=$("setoranForm");if(!page||!normal)return;
 if(!$("f4BankOwnModeTabs")){
  const tabs=el("div","f4-bank-own-mode-tabs");tabs.id="f4BankOwnModeTabs";
  for(const [value,name] of [["warga","Setoran Warga"],["bank","Bank Sampah"]]){
   const b=el("button","",name);b.type="button";b.dataset.mode=value;b.onclick=()=>chooseOwnMode(value);
   tabs.append(b);
  }
  normal.before(tabs);
  const form=el("form","f4-bank-own-deposit-form");form.id="f4BankOwnDepositForm";form.hidden=true;
  const intro=el("p","f4-bank-own-intro","Stok milik Bank dicatat tanpa pembagian. Kas masuk setelah penjualan disahkan.");
  const dateField=el("label","f4-bank-own-field");
  dateField.append(el("span","","Tanggal"),Object.assign(el("input"),{type:"date",required:true,value:today()}));
  dateField.querySelector("input").id="f4BankOwnDate";
  const fields=el("div","f4-bank-own-fields");fields.append(dateField);
  const detail=el("div","f4-bank-own-detail");
  const head=el("div","f4-bank-own-detail-head");
  head.append(el("strong","","Rincian sampah"));
  const add=el("button","f4-bank-secondary-action","Tambah jenis");add.type="button";
  add.onclick=()=>addOwnItemRow();
  head.append(add);detail.append(head);
  const rows=el("div","f4-bank-own-lines");rows.id="f4BankOwnLines";detail.append(rows);
  const weight=el("small","f4-bank-own-weight","Total berat: 0 kg");weight.id="f4BankOwnWeight";detail.append(weight);
  const note=el("label","f4-bank-own-field");note.append(el("span","","Catatan (opsional)"));
  const noteInput=el("input");noteInput.id="f4BankOwnNote";noteInput.maxLength=200;noteInput.placeholder="Asal sampah / keterangan stok";
  note.append(noteInput);
  const save=el("button","f4-bank-gold-action","Simpan Setoran Bank");save.type="submit";
  const status=el("p","f4-bank-own-status");status.id="f4BankOwnStatus";status.setAttribute("role","status");
  const main=el("div","f4-bank-own-main"),side=el("div","f4-bank-own-side");
  main.append(detail);side.append(fields,note,save,status);
  form.append(intro,main,side);
  form.onsubmit=submitOwnDeposit;tabs.after(form);
 }
 chooseOwnMode(ownFormMode);
}
function updateOwnWeight(){
 let total=0;
 for(const row of document.querySelectorAll("#f4BankOwnLines .f4-bank-own-line"))
  total+=Math.max(0,Number(row.querySelector("[data-own-weight]")?.value)||0);
 text("f4BankOwnWeight","Total stok: "+new Intl.NumberFormat("id-ID",{maximumFractionDigits:3}).format(total)+" kg");
}
function addOwnItemRow(){
 const lines=$("f4BankOwnLines");if(!lines)return;
 if(lines.childElementCount>=30)return;
 const row=el("div","f4-bank-own-line");
 const select=el("select");select.required=true;select.setAttribute("aria-label","Jenis sampah");
 select.add(new Option("Pilih jenis",""));
 for(const item of ownCatalog||[])select.add(new Option(item.name,item.id));
 select.onchange=updateOwnWeight;
 const weight=el("input");weight.type="number";weight.step="0.001";weight.min="0.001";
 weight.max="10000";weight.required=true;weight.dataset.ownWeight="1";weight.placeholder="Berat (kg)";
 weight.setAttribute("aria-label","Berat sampah kilogram");weight.oninput=updateOwnWeight;
 const del=el("button","f4-bank-own-remove");del.type="button";
 del.title="Hapus jenis";del.setAttribute("aria-label","Hapus jenis");
 del.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';del.onclick=()=>{row.remove();updateOwnWeight();};
 row.append(select,weight,del);lines.append(row);
}
async function loadOwnCatalog(){
 if(!$("f4BankOwnDepositForm")||ownFormMode!=="bank")return;
 if(!ownCatalog){
  const status=$("f4BankOwnStatus");if(status)status.textContent="Memuat jenis barang...";
  try{
   const result=await api("/api/v2/admin/bank/catalog");
   ownCatalog=(result.data||[]).filter(x=>Number(x.active)===1)
    .map(x=>({id:String(x.id),name:x.name,priceRpPerKg:Number(x.priceRpPerKg)||0}));if(status)status.textContent="";
  }catch(error){if(status)status.textContent="Jenis barang belum tersedia: "+error.message;return;}
 }
 const rows=$("f4BankOwnLines");
 if(rows&&!rows.childElementCount)addOwnItemRow();
}
async function submitOwnDeposit(event){
 event.preventDefault();
 const form=event.currentTarget,button=form.querySelector('[type="submit"]');
 const date=$("f4BankOwnDate")?.value;
 const items=[...form.querySelectorAll(".f4-bank-own-line")].map(row=>{
  const kg=Number(row.querySelector("input")?.value);
  return {itemId:row.querySelector("select")?.value,grams:Math.round(kg*1000),kg};
 });
 const status=$("f4BankOwnStatus");
 if(!items.length||items.some(x=>!x.itemId||!Number.isFinite(x.kg)||x.kg<=0||!Number.isSafeInteger(x.grams)||x.grams<1)){
  status.textContent="Lengkapi jenis dan berat barang.";return;
 }
 if(new Set(items.map(x=>x.itemId)).size!==items.length){status.textContent="Jenis sampah yang sama cukup satu baris.";return;}
 if(!window.confirm("Catat setoran milik Bank sebagai stok? Belum menambah kas sebelum penjualan sah."))return;
 if(!ownRequestKey)ownRequestKey="own"+crypto.randomUUID().replace(/-/g,"");
 button.disabled=true;status.textContent="Menyimpan stok...";
 try{
  const res=await api("/api/v2/admin/bank/own-deposits",{
   requestKey:ownRequestKey,depositedOn:date,
   items:items.map(({itemId,grams})=>({itemId,grams})),
   note:$("f4BankOwnNote")?.value.trim()||""
  });
  status.textContent=res.duplicate?"Setoran sudah tercatat.":"Setoran Bank tercatat sebagai stok, belum menambah kas.";
  ownRequestKey="";form.reset();$("f4BankOwnDate").value=today();
  $("f4BankOwnLines")?.replaceChildren();addOwnItemRow();updateOwnWeight();
  adminOverview=null;updateDashboard();
 }catch(error){status.textContent=error.message||"Setoran gagal disimpan.";}
 finally{button.disabled=false;}
}
let adminCashTab="in";
function ensureCashExpenseForm(){
 const host=$("f4BankCashExpense"),form=$("v10ExpenseForm");
 if(!host||!form)return;
 if(form.parentElement!==host){
  const title=el("h3","","Catat pengeluaran");
  title.id="f4BankCashExpenseTitle";
  host.append(title,form);
  const notice=$("v10ExpenseNotice");if(notice)host.append(notice);
 }
 if(form.dataset.f4CompactExpense==="1")return;
 form.dataset.f4CompactExpense="1";
 form.classList.add("f4-bank-compact-expense-form");
 const amount=$("v10Price"),qty=$("v10Qty"),unit=$("v10Unit");
 const priceLabel=amount?.closest(".field")?.querySelector("label");
 if(priceLabel)priceLabel.textContent="Nominal (Rp)";
 amount?.setAttribute("placeholder","0");
 const descLabel=$("v10Description")?.closest(".field")?.querySelector("label");
 if(descLabel)descLabel.textContent="Keterangan";
 for(const id of ["v10Qty","v10Unit"]){
  const field=$(id)?.closest(".field");
  if(field)field.hidden=true;
 }
 if(qty){qty.value="1";qty.defaultValue="1";}
 if(unit){unit.value="unit";unit.defaultValue="unit";}
 const summary=form.querySelector(".summary-box");if(summary)summary.hidden=true;
 const extras=el("details","f4-bank-expense-extras");
 extras.append(el("summary","","Detail tambahan (opsional)"));
 for(const id of ["v10Vendor","v10Proof","v10Notes","v10InventoryBox"]){
  const node=$(id);
  const field=id==="v10InventoryBox"?node:node?.closest(".field");
  if(field)extras.append(field);
 }
 const submit=form.querySelector('button[type="submit"]');
 if(submit){submit.textContent="Simpan Pengeluaran";submit.before(extras);}
 else form.append(extras);
}
function showAdminCash(){
 const page=ensureScreen("bank-admin-cash","Debit/Kredit");
 let body=$("f4BankAdminCashBody");
 if(!body){
  body=el("div","f4-bank-admin-cash-body");body.id="f4BankAdminCashBody";
  const tabs=el("div","f4-bank-admin-history-tabs f4-bank-admin-cash-tabs");tabs.id="f4BankCashTabs";
  for(const [key,label] of [["in","Pemasukan"],["out","Pengeluaran"]]){
   const button=el("button","f4-bank-admin-history-tab",label);button.type="button";button.dataset.cashTab=key;
   button.onclick=()=>{adminCashTab=key;loadAdminCash();};tabs.append(button);
  }
  const toolbar=el("div","f4-bank-cash-toolbar");toolbar.append(tabs);
  const expense=el("section","f4-bank-cash-expense-section");expense.id="f4BankCashExpense";
  body.append(toolbar,expense,el("div","f4-bank-admin-cash-stats"),
   el("div","f4-bank-admin-cash-table","Memuat mutasi kas..."));
  page.append(body);
 }
 ensureCashExpenseForm();
 page.classList.remove("hidden");loadAdminCash();
}
async function loadAdminCash(){
 const page=$("f4BankAdminCashBody");if(!page)return;
 const target=page.querySelector(".f4-bank-admin-cash-table");
 target.textContent="Memuat mutasi kas...";
 page.querySelectorAll("[data-cash-tab]").forEach(button=>{
  const active=button.dataset.cashTab===adminCashTab;
  button.classList.toggle("is-active",active);button.setAttribute("aria-pressed",String(active));
 });
 const expense=$("f4BankCashExpense");
 if(expense)expense.hidden=adminCashTab!=="out";
 if(adminCashTab==="out")window.v10LoadBiaya?.();
 try{
  const res=await api("/api/v2/admin/bank/cash?limit=300");
  const all=(res.data||[]).filter(x=>x.status==="aktif").sort((a,b)=>
   String(b.occurred_on||"").localeCompare(String(a.occurred_on||"")));
  const incoming=all.reduce((n,x)=>n+Number(x.cash_in_rp||0),0);
  const outgoing=all.reduce((n,x)=>n+Number(x.cash_out_rp||0),0);
  const rows=all.filter(x=>adminCashTab==="in"?Number(x.cash_in_rp)>0:Number(x.cash_out_rp)>0);
  page.querySelector(".f4-bank-admin-cash-stats").replaceChildren(...[
   ["Pemasukan",incoming],["Pengeluaran",outgoing],["Selisih mutasi",incoming-outgoing]
  ].map(([name,value])=>{
   const node=el("div","f4-bank-admin-cash-stat");
   node.append(el("small","",name),el("strong","",rupiah(value)));return node;
  }));
  const table=el("table","f4-bank-admin-cash-ledger");
  const thead=el("thead"),heading=el("tr");
  for(const label of ["Tanggal","Keterangan","Pos","Nominal"])heading.append(el("th","",label));
  thead.append(heading);table.append(thead);
  const tbody=el("tbody");
  for(const item of rows){
   const tr=el("tr");
   for(const value of [item.occurred_on||"—",item.note||item.transaction_type||"—",
     item.fund_position||"—",rupiah(adminCashTab==="in"?item.cash_in_rp:item.cash_out_rp)])
    tr.append(el("td","",value));
   tbody.append(tr);
  }
  table.append(tbody);target.replaceChildren(table);
  if(!rows.length)target.textContent=adminCashTab==="in"?"Belum ada pemasukan.":"Belum ada pengeluaran.";
 }catch(error){target.textContent="Mutasi kas belum dapat dibuka: "+error.message;}
}
window.addEventListener("f4-bank-expense-saved",()=>{
 if(roleType()==="admin"&&$("f4BankAdminCashBody"))loadAdminCash();
});
let adminMediaRestore=[];
function restoreAdminMedia(){
 for(const item of adminMediaRestore){
  if(item.anchor.parentNode)item.anchor.replaceWith(item.node);
  if(item.node.id==="v22DocsPage")item.node.classList.add("hidden");
 }
 adminMediaRestore=[];
}
function adminMediaMove(id,container){
 const node=$(id);if(!node?.parentNode)return;
 if(!adminMediaRestore.some(item=>item.node===node)){
  const anchor=document.createComment("Kembalikan "+id);
  node.before(anchor);adminMediaRestore.push({node,anchor});
 }
 container.append(node);node.classList.remove("hidden");
}
let bankAdminDocsLastRefresh=0;
let bankAdminDocsRefreshPromise=null;
function showAdminDocumentation(which="albums"){
 const page=ensureScreen("bank-admin-docs","Dokumentasi");
 let tabs=$("f4BankAdminDocsTabs");
 if(!tabs){
  tabs=el("div","f4-bank-admin-history-tabs");tabs.id="f4BankAdminDocsTabs";
  page.append(tabs);
 }
 let content=$("f4BankAdminDocsContent");
 if(!content){content=el("div","f4-bank-admin-doc-content");content.id="f4BankAdminDocsContent";page.append(content);}
 window.f4BankRenderDocumentation?.();
 adminMediaMove("v22DocsPage",content);
 adminMediaMove("v17Inventaris",content);
 const album=$("v22DocsPage"),inventory=$("v17Inventaris");
 tabs.replaceChildren(...[["albums","Album"],["inventory","Inventaris"]].map(([key,label])=>{
  const button=el("button","f4-bank-admin-history-tab"+(which===key?" is-active":""),label);
  button.type="button";button.setAttribute("aria-pressed",String(which===key));
  button.onclick=()=>showAdminDocumentation(key);return button;
 }));
 tabs.hidden=false;
 if(album)album.hidden=which!=="albums";
 if(inventory)inventory.hidden=which!=="inventory";
 page.classList.remove("hidden");
 // This screen reuses the public album/inventory nodes. Refresh their D1-backed
 // source when entering the manager screen; otherwise a fresh login can show
 // empty albums or an indefinitely pending inventory until the public page opens.
 if(!bankAdminDocsRefreshPromise&&Date.now()-bankAdminDocsLastRefresh>10000){
  const refresh=window.v17LoadPublic;
  if(typeof refresh==="function"){
   bankAdminDocsRefreshPromise=Promise.resolve().then(()=>refresh()).then(()=>{
    bankAdminDocsLastRefresh=Date.now();
    window.f4BankRenderDocumentation?.();
   }).catch(error=>{
    const target=which==="inventory"?$("v17Inventory"):$("v22DocList");
    if(target&&!target.children.length)target.textContent="Gagal memuat data. Coba buka kembali halaman ini.";
    console.error("Gagal memperbarui dokumentasi Bank Sampah",error);
   }).finally(()=>{bankAdminDocsRefreshPromise=null;});
  }
 }
}
function showAdminHistory(selected="setoran"){
 const page=ensureScreen("bank-admin-history","Riwayat");
 let tabs=$("f4BankAdminHistoryTabs");
 if(!tabs){
  tabs=el("div","f4-bank-admin-history-tabs");tabs.id="f4BankAdminHistoryTabs";
  page.append(tabs);
 }
 const setoran=$("pageRiwayat"),penjualan=$("pageRiwayatJual");
 for(const panel of [setoran,penjualan])if(panel?.parentNode!==page)page.append(panel);
 syncAdminPageFrames();
 const options=[["setoran","Setoran",setoran],["penjualan","Penjualan",penjualan]];
 tabs.replaceChildren(...options.map(([key,label])=>{
  const button=el("button","f4-bank-admin-history-tab"+(selected===key?" is-active":""),label);
  button.type="button";button.setAttribute("aria-pressed",String(selected===key));
  button.onclick=()=>navigate(key==="penjualan"?"bank-admin-sale-history":"bank-admin-history");
  return button;
 }));
 tabs.hidden=false;
 for(const [key,,panel] of options)panel?.classList.toggle("hidden",key!==selected);
 page.classList.remove("hidden");
 if(selected==="setoran")window.loadRiwayatV7?.();
 else window.loadRiwayatJual?.();
}
function ensureAdminReportLink(){
 if(role!=="admin")return;
 const page=$("pageLaporan");
 if(!page||$("f4BankAdminProgressLink"))return;
 const link=el("button","f4-bank-secondary-action f4-bank-report-progress-link","Perkembangan");
 link.id="f4BankAdminProgressLink";link.type="button";
 link.onclick=()=>navigate("bank-admin-progress");
 const head=page.querySelector(":scope > h2");
 if(head)head.after(link);else page.prepend(link);
}
function combineAdminApproval(){
 const root=$("pageRekonsiliasi"),approval=$("pagePengesahan");
 if(!root||!approval)return;
 const heading=root.querySelector(":scope > h2");
 if(heading)heading.textContent="Cek Selisih & Sahkan Hasil";
 if(approval.parentNode!==root)root.append(approval);
 approval.classList.remove("hidden");
 approval.classList.add("f4-bank-admin-approval");
 const reconPicker=$("reconBatch")?.closest(".field");
 if(reconPicker)reconPicker.hidden=true;
 const selection=$("v8Batch");
 const preview=$("reconResult");
 if(selection&&preview&&preview.previousElementSibling!==selection.closest(".field"))
  selection.closest(".field")?.after(preview);
 if(selection&&!selection.dataset.f4ReconBound){
  selection.dataset.f4ReconBound="1";
  selection.addEventListener("change",()=>{
   const other=$("reconBatch");
   if(!other)return;
   if(selection.value&&![...other.options].some(o=>o.value===selection.value))
    other.add(new Option(selection.options[selection.selectedIndex]?.text||selection.value,selection.value));
   other.value=selection.value;
   window.loadRekonsiliasi?.();
  });
 }
 if(typeof window.v8LoadBatches==="function")window.v8LoadBatches();
}
function ensureAdminProfile(){
 if(role!=="admin")return;
 const page=$("pageProfile");if(!page)return;
 const heading=page.querySelector(".f4-profile-header h2");
 if(heading)heading.textContent="Profil Pengurus";
 const label=page.querySelector(".f4-profile-identity small");
 if(label)label.textContent="Nama tampilan";
 const name=$("pName");
 if(name&&!$("f4BankAdminNameEdit")){
  const row=el("div","f4-bank-admin-name-row");
  name.before(row);row.append(name);
  const edit=el("button","f4-bank-admin-name-edit");
  edit.id="f4BankAdminNameEdit";edit.type="button";
  edit.setAttribute("aria-label","Edit nama tampilan");edit.title="Edit nama";
  edit.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16 4a2 2 0 0 1 3 3L9 17l-4 1 1-4L16 4Z"/></svg>';
  row.append(edit);
  const form=el("form","f4-bank-admin-name-form");form.hidden=true;
  const input=el("input");input.type="text";input.maxLength=100;input.minLength=2;
  input.setAttribute("aria-label","Nama tampilan pengurus");input.required=true;
  const save=el("button","f4-bank-gold-action","Simpan");save.type="submit";
  const cancel=el("button","f4-bank-secondary-action","Batal");cancel.type="button";
  const status=el("small","f4-bank-admin-name-status");
  form.append(input,save,cancel,status);row.after(form);
  function editing(active){
   form.hidden=!active;row.hidden=active;
   if(active){input.value=name.textContent.trim();status.textContent="";input.focus();}
  }
  edit.onclick=()=>editing(true);
  cancel.onclick=()=>editing(false);
  form.onsubmit=async event=>{
   event.preventDefault();
   const value=input.value.trim().replace(/\s+/g," ");
   if(value.length<2||value.length>100||/[<>\x00-\x1f]/.test(value)){
    status.textContent="Nama harus 2–100 karakter.";return;
   }
   save.disabled=true;status.textContent="Menyimpan...";
   try{
    const result=await api("/api/member/profile",{nama:value});
    const saved=String(result.profile?.nama||value);
    name.textContent=saved;
    const greeting=$("greeting");if(greeting)greeting.textContent="Halo, "+saved;
    const welcome=$("f4BankAppWelcome")?.querySelector("strong");if(welcome)welcome.textContent=saved;
    window.dispatchEvent(new CustomEvent("f4-account-profile-updated",{detail:{nama:saved}}));
    editing(false);
   }catch(error){status.textContent=error.message||"Nama gagal disimpan.";}
   finally{save.disabled=false;}
  };
 }
 // The existing v15PasswordBox already owns the real password form.
 // Never create a second accordion or move its empty pagePassword wrapper.
 const passwordBox=$("v15PasswordBox"),passwordPage=$("pagePassword");
 if(passwordBox){
  const form=passwordPage?.querySelector("form");
  if(form&&form.parentNode!==passwordBox)passwordBox.append(form);
  const summary=passwordBox.querySelector("summary");
  if(summary)summary.textContent="Ganti password";
  $("f4BankAdminPassword")?.remove();
  passwordPage?.classList.add("hidden");
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
function memberMetricIcon(type){
 const paths={
  weight:'<path d="M12 3v18M5 7h14M3 13l3-6 3 6H3Zm12 0 3-6 3 6h-6ZM8 21h8"/>',
  sales:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 15h3M15 15h3"/>',
  stage:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5 3 3 5-5"/>',
  report:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'
 };
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("fill","none");
 svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.9");
 svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
 svg.setAttribute("aria-hidden","true");svg.innerHTML=paths[type]||paths.report;return svg;
}
/* The dashboard chart uses only the authenticated member statement.
   The public development metrics never belong to an individual account. */
function progressPreview(){
 if(roleType()!=="member")return;
 const home=$("f4BankAppHome");if(!home)return;
 let preview=$("f4MemberEnvironmentPreview");
 if(!preview){
  preview=el("section","f4-member-environment-preview");preview.id="f4MemberEnvironmentPreview";
  const heading=el("div","f4-member-environment-head");
  heading.append(el("h3","","Perkembangan Saya"));
  const periods=el("div","f4-member-progress-period");
  periods.id="f4MemberProgressPeriod";
  periods.setAttribute("role","group");
  periods.setAttribute("aria-label","Periode grafik setoran pribadi");
  for(const [key,label] of [["month","Per bulan"],["year","Per tahun"]]){
   const button=el("button","",label);button.type="button";button.dataset.period=key;
   button.onclick=()=>{memberHomeChartGroup=key;drawMemberHomeChart();};
   periods.append(button);
  }
  heading.append(periods);
  const chart=el("div","f4-member-progress-chart");
  chart.id="f4MemberProgressChart";
  preview.append(heading,chart);
  const history=$("v14Recent")?.closest(".v14-panel");
  if(history?.parentElement===home)history.before(preview);else home.append(preview);
 }
 drawMemberHomeChart();
}
function drawMemberHomeChart(){
 const chart=$("f4MemberProgressChart"),periods=$("f4MemberProgressPeriod");
 if(!chart||!periods||roleType()!=="member")return;
 periods.querySelectorAll("[data-period]").forEach(button=>{
  const active=button.dataset.period===memberHomeChartGroup;
  button.classList.toggle("is-active",active);
  button.setAttribute("aria-pressed",String(active));
 });
 chart.replaceChildren();
 if(!memberStatement){
  chart.removeAttribute("role");
  chart.removeAttribute("aria-label");
  chart.append(el("p","f4-member-progress-empty","Memuat setoran pribadi…"));
  return;
 }
 const now=new Date(today()+"T00:00:00Z");
 const monthly=memberHomeChartGroup==="month";
 const entries=Array.from({length:monthly?6:5},(_,index)=>{
  if(monthly){
   const date=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-5+index,1));
   return {key:date.toISOString().slice(0,7),
    label:new Intl.DateTimeFormat("id-ID",{month:"short",timeZone:"UTC"}).format(date),
    weight:0,count:0};
  }
  const year=String(now.getUTCFullYear()-4+index);
  return {key:year,label:year,weight:0,count:0};
 });
 const groups=new Map(entries.map(item=>[item.key,item]));
 const deposits=memberBuckets().filter(item=>/^\d{4}-\d{2}-\d{2}$/.test(item.date));
 let unmeasured=0;
 for(const item of deposits){
  const key=monthly?item.month:item.date.slice(0,4);
  const entry=groups.get(key);
  if(!entry)continue;
  if(item.missingWeight){unmeasured++;continue;}
  entry.weight+=Math.max(0,Number(item.weight)||0);
  entry.count++;
 }
 const valid=entries.some(item=>item.count>0);
 if(!valid){
  chart.removeAttribute("role");
  chart.removeAttribute("aria-label");
  chart.append(el("p","f4-member-progress-empty",unmeasured?
   "Berat setoran pada periode ini belum tersedia.":
   "Belum ada setoran pribadi pada periode ini."));
  return;
 }
 const max=Math.max(0,...entries.map(item=>item.weight));
 const bars=el("div","f4-member-progress-bars");
 bars.style.gridTemplateColumns="repeat("+entries.length+",minmax(0,1fr))";
 for(const item of entries){
  const column=el("div","f4-member-progress-column");
  const amount=el("strong","",item.count?f4PrivateShort(item.weight,"kg")+" kg":"—");
  const rail=el("span","f4-member-progress-rail");
  const fill=el("i","f4-member-progress-fill");
  fill.style.height=max>0&&item.weight>0?Math.max(4,item.weight/max*100)+"%":"0%";
  rail.append(fill);
  column.append(amount,rail,el("small","",item.label));
  column.title=item.key+" • "+f4PrivateKg(item.weight)+" • "+item.count+" setoran";
  bars.append(column);
 }
 chart.setAttribute("role","img");
 chart.setAttribute("aria-label","Berat sampah pribadi per "+(monthly?"bulan":"tahun")+". "+
  entries.map(item=>item.key+": "+f4PrivateKg(item.weight)).join("; "));
 chart.append(bars);
}
/* Mini ringkasan PC dari laporan publik transaksi sah D1. */
function renderMemberPublicMini(){
 const host=$("f4MemberPublicMini");if(!host)return;
 const summary=memberPublicMini.data;
 for(const [key,format] of [["beratKg",f4PrivateKg],["hasilPenjualan",rupiah],["hakWarga",rupiah]]){
  const n=summary?.[key],valid=n!==null&&n!==undefined&&n!==""&&
   Number.isFinite(Number(n))&&Number(n)>=0;
  const display=valid?format(Number(n)):"—";
  const field=host.querySelector('[data-public-field="'+key+'"] strong');
  if(field){field.textContent=display;field.title=valid?display:"Data belum tersedia";}
 }
}
function resetMemberPublicMini(){
 memberPublicMini.version++;memberPublicMini.data=null;
 memberPublicMini.pending=null;memberPublicMini.loadedAt=0;
}
function loadMemberPublicMini(force=false){
 if(roleType()!=="member"||!window.matchMedia("(min-width:1024px)").matches)return;
 const s=memberPublicMini;
 renderMemberPublicMini();
 if(s.pending||(!force&&s.loadedAt&&Date.now()-s.loadedAt<90000))return;
 const version=++s.version;
 s.loadedAt=Date.now();
 s.pending=api("/api/v2/public/bank/report").then(response=>{
  if(version!==s.version||roleType()!=="member")return;
  const report=response?.ringkasan||response?.summary;
  if(!report||typeof report!=="object"||
   !["beratKg","hasilPenjualan","hakWarga"].every(key=>
    report[key]!==null&&report[key]!==undefined&&report[key]!==""&&
    Number.isFinite(Number(report[key]))&&Number(report[key])>=0))
    throw Error("Data laporan sah belum lengkap.");
  s.data=report;renderMemberPublicMini();
 }).catch(error=>{
  if(version!==s.version)return;
  s.data=null;renderMemberPublicMini();
  console.warn("Bank Sampah: ringkasan publik belum tersedia.",error);
 }).finally(()=>{if(version===s.version)s.pending=null;});
}
function infoShortcut(){
 const home=$("f4BankAppHome");if(roleType()!=="member"||!home)return;
 let link=$("f4MemberInfoShortcut");
 if(!link){
  link=el("button","f4-member-info-shortcut");link.id="f4MemberInfoShortcut";link.type="button";
  const symbol=el("span","f4-member-info-icon");symbol.append(memberMetricIcon("report"));
  const copy=el("span","f4-member-info-copy");
  copy.append(el("strong","","Informasi & Laporan"),el("small","","Laporan dan transparansi kegiatan"));
  const mini=el("span","f4-member-public-mini");mini.id="f4MemberPublicMini";
  for(const [key,label] of [["beratKg","Berat terjual"],["hasilPenjualan","Hasil jual"],["hakWarga","Hak warga"]]){
   const item=el("span","f4-member-public-mini-item");item.dataset.publicField=key;
   item.append(el("small","",label),el("strong","","—"));mini.append(item);
  }
  link.append(symbol,copy,mini,bankIconSpan("f4-member-next","chevron-right"));
  link.onclick=()=>navigate("bank-member-info");
 }
 home.append(link);loadMemberPublicMini();
}
function publicSnapshot(){
 if(roleType()!=="member"||memberSnapshotsLoaded||snapshotBusy||typeof window.v17LoadPublic!=="function")return;
 snapshotBusy=true;
 Promise.resolve().then(()=>window.v17LoadPublic()).then(()=>{
  memberSnapshotsLoaded=true;
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
  title.append(el("h2","",name));
  header.append(title);page.prepend(header);
 }
 let content=page.querySelector(".f4-member-feature-content");
 if(!content){content=el("div","f4-member-feature-content");page.append(content);}
 if(progress){
  moveFeature(["v17PublicMetrics","v17Perkembangan"],content);
  for(const button of content.querySelectorAll('[data-dev-range="period"],[data-dev-range="30"],[data-dev-mode="nilai"]')){
   button.hidden=false;button.classList.remove("hidden");
  }
  window.f4BankLoadPrivateChart?.();
 }
 else if(docs){
  moveFeature(["v22DocsPage"],content);
  const albumPage=$("v22DocsPage");
  albumPage?.classList.remove("hidden");
  window.f4BankRenderDocumentation?.();
  // Original public-page back action remains untouched. Member uses its top navigation.
 }else{
  moveFeature(["v17Transparansi","v17Dokumentasi","v17Inventaris"],content);
  const finance=content.querySelector("#v17Transparansi");
  if(finance){finance.hidden=false;finance.classList.remove("hidden");}
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
 const schedule=$("f4BankWeighingDialog");
 if(schedule?.open)schedule.close();
 window.F4MemberPrices?.close?.();
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
 if(roleType()==="member"&&route==="bank-prices"){
  window.F4MemberPrices?.show();return;
 }
 if(roleType()&&route!==screen&&!returningFromBack){
  routeHistory.push(screen);
  if(routeHistory.length>24)routeHistory.shift();
 }
 if(route!=="bank-admin-progress"&&adminProgressNode)restoreAdminProgress();
 if(route!=="bank-admin-docs"&&adminMediaRestore.length)restoreAdminMedia();
 // Dedicated operational pages for admins; keep existing data and action handlers.
 if(roleType()==="admin"){
  if(["riwayat","riwayatJual"].includes(route))route="bank-admin-history";
  if(route==="biaya"){adminCashTab="out";route="bank-admin-cash";}
  if(route==="pengesahan")route="rekonsiliasi";
  if(["kegiatan","dokumentasi","inventaris","progress","public"].includes(route))route="dashboard";
  if(route==="bank-admin-cash"){
   hideCustom();old.call(window,"dashboard",...args);
   $("pageDashboard")?.classList.add("hidden");
   showAdminCash();screen=route;
   window.v16Sync?.(route);markDock();window.scrollTo(0,0);return;
  }
  if(route==="bank-admin-docs"){
   hideCustom();old.call(window,"dashboard",...args);
   $("pageDashboard")?.classList.add("hidden");
   showAdminDocumentation();screen=route;
   window.v16Sync?.(route);markDock();window.scrollTo(0,0);return;
  }
  if(route==="bank-admin-history"||route==="bank-admin-sale-history"){
   const saleHistory=route==="bank-admin-sale-history";
   hideCustom();old.call(window,saleHistory?"riwayatJual":"riwayat",...args);
   showAdminHistory(saleHistory?"penjualan":"setoran");screen=route;
   window.v16Sync?.(route);markDock();window.scrollTo(0,0);return;
  }
  if(route==="bank-admin-progress"){
   hideCustom();old.call(window,"dashboard",...args);
   $("pageDashboard")?.classList.add("hidden");
   showAdminProgress();screen=route;
   window.v16Sync?.(route);markDock();window.scrollTo(0,0);return;
  }
  if(route==="rekonsiliasi"){
   hideCustom();old.call(window,route,...args);
   combineAdminApproval();screen=route;markDock();window.scrollTo(0,0);return;
  }
  if(route==="profile"){
   hideCustom();old.call(window,route,...args);
   ensureAdminProfile();screen=route;markDock();window.scrollTo(0,0);return;
  }
 }
 // Navigating between member pages always starts with a visible header and sidebar brand.
 if(roleType()==="member"){
  if(window.matchMedia("(min-width:1024px)").matches){
   const side=$("sideNav");if(side)side.scrollTop=0;
  }
  window.scrollTo(0,0);
 }
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
   if(route==="bank-prices")window.F4MemberPrices?.show();
  if(route==="bank-payout")requestsMember();
  return;
 }
 hideCustom();
 const result=old.call(window,route,...args);
 if(route==="dashboard"&&role==="member"){
  const link=$("v14AllDeposits");if(link){link.textContent="Lihat semua";link.onclick=()=>navigate("bank-history");}
 }
 if(route==="dashboard"&&role==="admin"){ensureAdminHome();refreshAdminAlerts(true);}
 if(route==="laporan"&&role==="admin")ensureAdminReportLink();
 if(route==="setoran"&&role==="admin")ensureOwnDepositForm();
 screen=route;markDock();
 if(route==="tabungan"&&roleType()==="admin")managerRequestsPanel();
 if(route==="pribadi")ensureMemberPages();
 if(role==="admin")syncAdminPageFrames();
 return result;
}
function resetRoleSurface(){
 resetAdminAlerts();resetMemberPublicMini();
 routeHistory.length=0;returningFromBack=false;screen="dashboard";
 // Rebuild the role-specific home from source nodes, never from cached cards.
 // The old member/account must not inherit operations or cached balance widgets.
 const hub=$("f4BankAppHome"),reservoir=$("f4BankDashboardSource");
 const recent=$("v14Recent")?.closest(".v14-panel");
 if(hub&&recent&&hub.contains(recent)){
  const legacyPanels=reservoir?.querySelector(".v14-panels");
  (legacyPanels||reservoir||$("pageDashboard"))?.append(recent);
 }
 const guide=$("f4MemberFlow");
 if(hub&&guide&&hub.contains(guide))
  (reservoir||$("pageDashboard"))?.append(guide);
 hub?.remove();
 for(const id of ["f4MemberPriceShortcut","f4BankWeighingSchedule","f4MemberEnvironmentPreview","f4MemberInfoShortcut"]){
  $(id)?.remove();
 }
 homeSource?.disconnect();summaryExtra?.disconnect();memberSource?.disconnect();
 homeSource=null;summaryExtra=null;memberSource=null;primaryNode=null;extraNode=null;
 for(const node of document.querySelectorAll("[data-f4-bank-observed]"))delete node.dataset.f4BankObserved;
 if(document.body.classList.contains("f4-member-feature"))restoreFeature();
 hideCustom();restoreAdminProgress();restoreAdminMedia();
 const form=$("v10ExpenseForm"),notice=$("v10ExpenseNotice"),home=$("pageBiaya");
 if(form&&home&&form.parentElement!==home)home.append(form);
 if(notice&&home&&notice.parentElement!==home)home.append(notice);
 for(const id of ["f4BankAdminOperations","f4BankAdminShortcuts","f4BankAdminNext"]){$(id)?.remove();}
 $("f4BankAdminBack")?.setAttribute("hidden","");
 if($("f4BankPageGreeting"))$("f4BankPageGreeting").hidden=true;
 const menu=$("f4-mobile-menu");
 if(menu){
  menu.replaceChildren(el("span","f4-svg-icon f4-svg-menu"));
  menu.setAttribute("aria-label","Buka menu halaman");menu.title="Buka menu halaman";
 }
 $("f4BankProfileDetail")?.remove();
 if($("f4BankWeighingDialog")?.open)$("f4BankWeighingDialog").close();
 window.F4MemberPrices?.close?.();
 const history=$("bank-admin-history"),section=$("dashboardView")?.querySelector(".grid > .section");
 for(const id of ["pageRiwayat","pageRiwayatJual"]){
  const page=$(id);if(page&&history?.contains(page)&&section)section.append(page);
 }
 document.body.classList.remove("f4-bank-member-secondary");
 memberStatement=null;adminOverview=null;memberSnapshotsLoaded=false;
 weighingRequestId++;weighingRequest=null;weighingWeekday=0;weighingLastFetched=0;
 requestNonce="";requestEnabled=false;memberSnapshotsLoaded=false;
}
window.f4BankResetForAccountSwitch=()=>{
 resetRoleSurface();
 role=null;memberStatement=null;adminOverview=null;
 dock().replaceChildren();
 document.body.classList.remove("f4-bank-app-private","f4-bank-app-admin","f4-bank-app-member","f4-bank-member-secondary");
 $("f4BankMemberTopIdentity")?.remove();$("f4BankMemberTopBrand")?.remove();$("f4BankAdminTopIdentity")?.remove();
 memberSide(false);syncAdminPageFrames();
};
window.f4BankReconcileAccount=()=>sync();
function sync(){
 const next=roleType(),isPrivate=!!next&&!$("dashboardView")?.classList.contains("hidden");
 document.body.classList.toggle("f4-bank-app-private",isPrivate);
 document.body.classList.toggle("f4-bank-app-member",isPrivate&&next==="member");
 document.body.classList.toggle("f4-bank-app-admin",isPrivate&&next==="admin");
 dock().hidden=!isPrivate||next==="admin";
 if(!isPrivate){
  if(role!==null)resetRoleSurface();
  memberSide(false);
  $("f4BankMemberTopIdentity")?.remove();$("f4BankMemberTopBrand")?.remove();$("f4BankAdminTopIdentity")?.remove();
  $("f4BankAdminBack")?.setAttribute("hidden","");
  role=null;memberStatement=null;memberSnapshotsLoaded=false;
  syncAdminPageFrames();
  $("f4BankProfileDetail")?.remove();return;
 }
 if(next!==role){
  resetRoleSurface();
  role=next;screen="dashboard";
  dock().replaceChildren(...(role==="member"?memberDock:[]).map(x=>action(x,true)));
  if(role==="member")requestNonce="";
  memberStatement=null;adminOverview=null;
  if(role==="admin")$("f4BankProfileDetail")?.remove();
 }
 memberSide(role==="member");adminTopIdentity();
 syncAdminPageFrames();
 ensureHome();
 if(role==="member"){
  ensureMemberPages();progressPreview();infoShortcut();orderMemberHome();ensureMemberHowtoBanner();bindMemberDocumentation();publicSnapshot();
 }else{
  managerRequestsPanel();
  ensureAdminHome();
  ensureAdminProfile();
 }
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
 const name=$("pName")?.textContent?.trim()||"—";
 text("f4BankCardName",name);
 text("f4BankProfileName",name);
 const houseNode=$("f4BankAppHome")?.querySelector(".f4-bank-card-house");
 if(houseNode)houseNode.textContent=house;
 if($("f4BankProfileHouse"))$("f4BankProfileHouse").textContent=house;
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
 const save=el("button","f4-member-name-save");save.append(bankUiSvg('check'));save.type="button";save.title="Simpan nama";save.setAttribute("aria-label","Simpan nama tampilan");
 const cancel=el("button","f4-member-name-cancel");cancel.append(bankUiSvg('x'));cancel.type="button";cancel.title="Batal";cancel.setAttribute("aria-label","Batalkan edit nama");
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
    updateCardNumber();
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
  const personName=copy.querySelector("#f4BankCardName");if(personName)personName.id="f4BankProfileName";
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
 if(roleType()!=="member"||$("dashboardView")?.classList.contains("hidden"))return;
 const data=event?.detail;
 if(!data||!Array.isArray(data.mutasi)||!Array.isArray(data.setoran))return;
 // Reject a delayed response from a different member after logout/login.
 const normalize=id=>String(id||"").trim().replace(/^member:/i,"");
 const expected=normalize($("pId")?.textContent);
 const received=normalize(data.wargaId||data.memberId||data.member_id);
 if(!received||!expected||expected==="Administrator"||received!==expected)return;
 memberStatement=data;
 updateCardNumber();updateDashboard();syncSavings();progressPreview();
}

function init(){
 if(ready)return;ready=true;
 // Resizing between phone and PC must restore/hide the real sidebar immediately.
 window.addEventListener("resize",()=>{syncAdminPageFrames();
  if(role==="admin")ensureAdminHome();
  if(role==="member"){memberSide(true);loadMemberPublicMini();}
 });
 $("f4-mobile-menu")?.addEventListener("click",event=>{
  if(roleType()!=="member")return;
  event.preventDefault();event.stopImmediatePropagation();
  if(screen!=="dashboard")previousBankPage();
 },true);
 window.addEventListener("f4-account-profile-updated",memberTopIdentity);
 const openPublic=window.v11ShowPublic;
 if(typeof openPublic==="function")window.v11ShowPublic=function(...args){
  restoreFeature();hideCustom();restoreAdminProgress();return openPublic.apply(this,args);
 };
 window.addEventListener("f4-bank-member-statement",acceptMemberStatement);
 window.addEventListener("f4-bank-admin-overview",updateAdminOverview);
 window.addEventListener("f4-bank-data-changed",()=>{
  refreshAdminAlerts(true);
  if(roleType()==="member")loadMemberPublicMini(true);
 });
 window.addEventListener("focus",()=>{refreshAdminAlerts();if(roleType()==="member")loadMemberPublicMini();});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshAdminAlerts();});
 setInterval(()=>{if(!document.hidden)refreshAdminAlerts();},45000);
 const original=window.goPage;
 if(typeof original==="function")window.goPage=function(route,...args){
   window.f4BankPageHistory?.begin?.();
   try{return handleRoute(route,original,args)}
   finally{window.f4BankPageHistory?.end?.(screen)}
  };
  window.f4BankAppCurrentRoute=()=>screen;
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
