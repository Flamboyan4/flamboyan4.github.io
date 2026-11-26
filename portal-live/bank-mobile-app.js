/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/bank-mobile-app.js",function(__f4){


/* Bank Sampah Flamboyan 4 — canonical mobile banking UI.
   Real sources: existing D1-backed dashboard, member statement, print and manager APIs.
   One member page per purpose. No duplicate balance cards or pretend transactions. */
(()=>{
"use strict";
const $=id=>__f4.globals.document.getElementById(id);
// One bright waste-type palette shared with the manager's chart.
const F4_BANK_WASTE_PALETTE=__f4.globals.Object.freeze(["#009788","#43A047","#FDC010","#09BCD3","#5969DA","#EB6A48","#8BC24A","#277FC6","#B452BA","#CA8B22","#22A97F","#D94880","#426CB8","#CE6B43","#799126","#368EAA","#C44256","#7B62B8"]);
const el=(tag,cls,text)=>{
  const node=__f4.globals.document.createElement(tag);if(cls)node.className=cls;
  if(text!==__f4.globals.undefined)node.textContent=text;return node;
};
function bankUiSvg(name){
 const paths={'chevron-right':'m9 18 6-6-6-6','check':'m20 6-11 11-5-5','x':'M18 6 6 18M6 6l12 12','plus':'M12 5v14M5 12h14'};
 if(!paths[name])throw (0,__f4.globals.Error)('Unknown Bank SVG icon');
 const svg=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','18');svg.setAttribute('height','18');
 svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
 svg.setAttribute('stroke-width','2');svg.setAttribute('stroke-linecap','round');
 svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
 const path=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[name]);svg.append(path);
 return svg;
}
function bankIconSpan(cls,name){const span=el('span',cls);span.append(bankUiSvg(name));span.setAttribute('aria-hidden','true');return span;}
const rupiah=n=>"Rp "+(0,__f4.globals.Number)(n||0).toLocaleString("id-ID");
const displayWargaName=value=>__f4.window.f4BankDisplayWargaName?.(value)||(0,__f4.globals.String)(value||"Anggota");
const money=s=>(0,__f4.globals.Number)((0,__f4.globals.String)(s||"").replace(/[^\d-]/g,""))||0;
const today=()=>{
  const pieces=new __f4.globals.Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new __f4.globals.Date());
  const obj=__f4.globals.Object.fromEntries(pieces.filter(p=>["year","month","day"].includes(p.type)).map(x=>[x.type,x.value]));
  return obj.year+"-"+obj.month+"-"+obj.day;
};
const apiRoot="https://api.flamboyan4.web.id";
async function api(path,payload){
  const response=await (0,__f4.globals.fetch)(apiRoot+path,{method:payload?"POST":"GET",credentials:"include",mode:"cors",cache:"no-store",
    ...(payload?{headers:{"Content-Type":"application/json"},body:__f4.globals.JSON.stringify(payload)}:{})});
  const body=await response.json().catch(()=>({ok:false,error:"Respons layanan tidak terbaca."}));
  if(!response.ok||body.ok===false)throw (0,__f4.globals.Error)(body.error||"Layanan belum tersedia ("+response.status+").");
  return body;
}
let role=null,screen="dashboard",historyMonth="latest",reportMonth="",reportRange=null,activePage=null;
const routeHistory=[];let returningFromBack=false;
let homeSource=null,summaryExtra=null,memberSource=null,managerQueue=null;
let primaryNode=null,extraNode=null;
let ready=false,requestNonce="",requestEnabled=false;
let memberStatement=null,memberChartMode="kg",memberChartGroup="period";
let memberAward={badge:null,memberId:"",loadedAt:0,pending:null,generation:0};
let memberHomeChartGroup="month";
let memberBalancePrivacy={hidden:true};
let memberPublicMini={data:null,pending:null,loadedAt:0,version:0};
let adminOverview=null,adminOverviewError='';
let refreshing=false;
const custom=["bank-history","bank-payout","bank-report","bank-prices","bank-payout-admin","bank-admin-history","bank-admin-docs","bank-admin-cash","bank-admin-progress"];
const featureRoutes=["bank-member-info","bank-member-docs"];
let moved=[],memberSnapshotsLoaded=false,snapshotBusy=false;
const text=(id,val)=>{if($(id)&&$(id).textContent!==(0,__f4.globals.String)(val))$(id).textContent=(0,__f4.globals.String)(val)};
const image=file=>{const img=el("img");img.src="/assets/icons/"+file;img.alt="";img.setAttribute("aria-hidden","true");return img;};
function roleType(){
 const r=(0,__f4.globals.String)(__f4.globals.document.body.dataset.f4BankRole||"").toLowerCase();
 return ["admin","superadmin"].includes(r)?"admin":["warga","anggota"].includes(r)?"member":null;
}
// Reuse the exact SVG component in the manager dock and PC action card.
function bankSaleCartIcon(){
 const svg=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");
 svg.classList.add("f4-bank-cart-icon");
 svg.innerHTML='<circle cx="9" cy="20" r="1.25"/><circle cx="18" cy="20" r="1.25"/><path d="M2 3h2l2.5 11.1A2 2 0 0 0 8.5 16h9.4a2 2 0 0 0 2-1.6L22 7H5"/>';
 return svg;
}
// One native fixed dock; no JS writes to its position during browser scroll.
function markDock(){
 __f4.window.dispatchEvent(new __f4.globals.CustomEvent("f4-shared-bank-route",{detail:screen}));
 for(const b of __f4.globals.document.querySelectorAll("#v16NavList .f4-bank-desktop-nav-link")){
  const selected=b.dataset.bankAppRoute===screen;
  b.classList.toggle("active",selected);
  if(selected)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
 }
 if(roleType()==="member")syncMemberBack();
 if(roleType()==="admin")syncAdminBack();

}
function previousBankPage(){
 let destination=routeHistory.pop()||"dashboard";
 if(destination===screen)destination="dashboard";
 returningFromBack=true;
 try{navigate(destination);}finally{returningFromBack=false;}
}
function syncAdminBack(){
 const root=$("dashboardView");
 const section=root?.querySelector(".grid > .section")||root?.querySelector(".section");
 if(!section)return;
 let back=$("f4BankAdminBack");
 if(!back){
  back=el("button","f4-bank-admin-back");
  back.id="f4BankAdminBack";back.type="button";
  back.setAttribute("aria-label","Kembali ke halaman sebelumnya");
  const arrow=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
  arrow.setAttribute("viewBox","0 0 24 24");arrow.setAttribute("aria-hidden","true");
  arrow.innerHTML='<path d="M19 12H5m7-7-7 7 7 7"/>';
  back.append(arrow);
  back.onclick=previousBankPage;
  section.prepend(back);
 }
 // Tempel panah pada judul halaman aktif: jangan membuat baris kosong di atasnya.
 const show=roleType()==="admin"&&screen!=="dashboard";
 const routeId=screen==="bank-admin-sale-history"?"bank-admin-history":
  screen.startsWith("bank-")?screen:"page"+screen.charAt(0).toUpperCase()+screen.slice(1);
 const active=show?$(routeId):null;
 // A shared nested documentation heading must be reused, not replaced with "docs".
 if(active?.id==="bank-admin-docs"){
  const nested=active.querySelector(":scope > .f4-member-feature-header h2");
  if(nested){
   active.querySelectorAll(":scope > h2").forEach(heading=>{
    if(heading.textContent.trim().toLowerCase()==="docs")heading.remove();
   });
  }
 }
 let title=active?.querySelector(":scope > .f4-member-feature-header h2, :scope > h2, :scope > .f4-savings-head > h2, :scope > .toolbar h2, :scope > .f4-profile-header h2");
 if(show&&active&&!title){
  // Fallback untuk halaman lama tanpa heading: tetap satu baris, tanpa Back terpisah.
  title=el("h2","",screen==="profile"?"Profil Pengurus":
   screen==="tabungan"?"Saldo Warga":active.id.replace(/^page|^bank-admin-/,"").replace(/-/g," "));
  active.prepend(title);
 }
 if(title){
  title.classList.add("f4-bank-admin-inline-title");
  if(back.parentElement!==title)title.prepend(back);
 }else if(back.parentElement!==section)section.prepend(back);
 back.hidden=!show||!title;
}
function syncMemberBack(){
 __f4.globals.document.body.classList.toggle("f4-bank-member-secondary",screen!=="dashboard");
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
// Private activity badge, based on all recorded weighing periods.
function bankAwardNode(rank,active){
 const badge=el("span","f4-bank-activity-crown is-rank-"+rank);
 badge.setAttribute("aria-label","Peringkat "+rank+" warga teraktif");
 badge.title="Peringkat "+rank+" warga teraktif · "+active+" periode penimbangan";
 const icon=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
 icon.setAttribute("viewBox","0 0 24 24");icon.setAttribute("aria-hidden","true");
 icon.setAttribute("fill","none");icon.setAttribute("stroke","currentColor");
 icon.setAttribute("stroke-width","1.9");icon.setAttribute("stroke-linecap","round");
 icon.setAttribute("stroke-linejoin","round");
 icon.innerHTML='<path d="M2.5 7.5 6.5 11l5.5-7 5.5 7 4-3.5-2.4 11h-14z"/><path d="M6 21h12"/>';
 badge.append(icon,el("strong","",(0,__f4.globals.String)(rank)));return badge;
}
function renderMemberAward(){
 for(const host of [$("f4BankMemberCard"),$("pageProfile")?.querySelector(".f4-bank-profile-card")]){
  if(!host)continue;
  host.querySelector(".f4-bank-activity-crown")?.remove();
  host.classList.remove("has-activity-crown");
  const badge=memberAward.memberId===memberID()?memberAward.badge:null;
  if(!badge||badge.rank<1||badge.rank>3)continue;
  host.classList.add("has-activity-crown");
  const head=host.querySelector(".f4-bank-member-card-head");
  if(!head)continue;
  const symbol=bankAwardNode(badge.rank,badge.active);
  const contactless=head.querySelector(".f4-bank-atm-contactless");
  if(contactless)contactless.before(symbol);else head.append(symbol);
 }
}
async function loadMemberAward(force=false){
 if(roleType()!=="member"||$("dashboardView")?.classList.contains("hidden"))return;
 const id=memberID();
 if(!id||id==="Administrator"||id==="—")return;
 if(memberAward.memberId!==id){
  memberAward.generation++;memberAward.memberId=id;memberAward.badge=null;
  memberAward.loadedAt=0;memberAward.pending=null;renderMemberAward();
 }
 if(memberAward.pending)return memberAward.pending;
 if(!force&&__f4.globals.Date.now()-memberAward.loadedAt<60000){renderMemberAward();return;}
 const generation=memberAward.generation;
 const task=api("/api/v2/bank/activity-ranking").then(result=>{
  if(generation!==memberAward.generation||roleType()!=="member"||memberID()!==id)return;
  const found=result.badge;
  memberAward.badge=found&&(0,__f4.globals.String)(found.memberId||"")===id&&
   __f4.globals.Number.isInteger(found.rank)&&found.rank>=1&&found.rank<=3?found:null;
  renderMemberAward();
 }).catch(error=>{
  if(generation!==memberAward.generation)return;
  memberAward.badge=null;renderMemberAward();
  __f4.globals.console.warn("Peringkat anggota belum tersedia:",error.message);
 }).finally(()=>{
  if(generation===memberAward.generation){memberAward.pending=null;memberAward.loadedAt=__f4.globals.Date.now();}
 });
 memberAward.pending=task;return task;
}
function resetMemberAward(){
 memberAward.generation++;memberAward.badge=null;memberAward.memberId="";
 memberAward.loadedAt=0;memberAward.pending=null;
 __f4.globals.document.querySelectorAll(".f4-bank-activity-crown").forEach(node=>node.remove());
}
function ensureHome(){
 const page=$("pageDashboard");
 if(!page)return;
 // v14-home is only a class, not proof that the live DOM was initialized.
 // Recover the original data anchors before composing a single modern screen.
 const anchors=["v14Primary","v14Extra","v14Recent","v14Activities"];
 if(!page.classList.contains("v14-home")||!anchors.every(id=>page.querySelector("#"+id)))
  __f4.window.f4BankEnsureLegacyDashboard?.();
 if(!page.classList.contains("v14-home")||!anchors.every(id=>page.querySelector("#"+id)))return;
 let hub=$("f4BankAppHome");
 if(hub&&(!page.contains(hub)||!hub.querySelector("#f4BankAppAdminHero"))){
  hub.remove();hub=null;
 }
 if(!hub){
  hub=el("section","f4-bank-app-home");hub.id="f4BankAppHome";

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
  const savings=el("div","f4-bank-app-member-balance");savings.id="f4BankAppMemberBalance";
  savings.setAttribute("role","group");savings.setAttribute("aria-label","Total saldo Bank Sampah: saldo sah dan estimasi");
  const balanceHead=el("div","f4-bank-balance-head");
  const balanceEye=el("button","f4-bank-balance-eye");balanceEye.type="button";
  balanceEye.setAttribute("aria-label","Tampilkan saldo");
  balanceEye.setAttribute("aria-pressed","true");
  balanceEye.title="Tampilkan saldo";
  const balanceEyeSvg=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
  balanceEyeSvg.setAttribute("viewBox","0 0 24 24");
  balanceEyeSvg.setAttribute("aria-hidden","true");
  balanceEyeSvg.setAttribute("fill","none");
  balanceEyeSvg.setAttribute("stroke","currentColor");
  balanceEyeSvg.setAttribute("stroke-width","1.9");
  balanceEyeSvg.setAttribute("stroke-linecap","round");
  balanceEyeSvg.setAttribute("stroke-linejoin","round");
  balanceEyeSvg.innerHTML='<path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c5.4 0 9.2 5.5 9.2 7a15 15 0 0 1-3 3.6"/><path d="M6.6 6.6C4.4 8 2.8 10.5 2.8 12c0 1.6 3.8 7 9.2 7 1.5 0 2.9-.4 4.1-1"/><path d="M10 10a2.8 2.8 0 0 0 4 4"/>';
  balanceEye.append(balanceEyeSvg);
  balanceEye.onclick=event=>{
   event.preventDefault();event.stopPropagation();
   memberBalancePrivacy.hidden=!memberBalancePrivacy.hidden;updateDashboard();
  };
  balanceHead.append(el("span","f4-bank-member-balance-label","Total Saldo"),balanceEye);
  const balanceLink=el("button","f4-bank-balance-cta","Buka Tabungan");balanceLink.type="button";
  balanceLink.onclick=()=>navigate("pribadi");
  savings.append(balanceHead,el("strong","f4-bank-member-balance-value","••••••"),balanceLink);
  // Only Cek Tabungan navigates; toggling the eye never selects the entire card.
  const hero=el("div","f4-bank-app-hero");hero.id="f4BankAppAdminHero";
  const heading=el("small","","BANK SAMPAH FLAMBOYAN 4"),label=el("strong","f4-bank-app-balance-title","Hasil diterima lapak"),
    amount=el("strong","f4-bank-app-balance","—"),secondary=el("span","f4-bank-app-secondary","Memuat...");
  amount.id="f4BankAppBalance";secondary.id="f4BankAppSecondary";
  const breakdown=el("div","f4-bank-admin-hero-breakdown");breakdown.id="f4BankAdminHeroBreakdown";
  for(const [id,caption] of [["f4BankAdminHeroWarga","Hak warga"],["f4BankAdminHeroLingkungan","Kas lingkungan"]]){
   const item=el("span","f4-bank-admin-hero-item");
   item.append(el("small","",caption),__f4.globals.Object.assign(el("strong","", "—"),{id}));
   breakdown.append(item);
  }
  hero.append(heading,label,amount,secondary,breakdown);
  const minis=el("div","f4-bank-app-minis");minis.id="f4BankAppMinis";
  hub.append(card,savings,hero,minis);
  page.prepend(hub);
 }
 hub.dataset.bankRole=role;
 if(role!=="member")restoreMemberHomeLayout(hub);
 const house=$("pHome")?.textContent?.trim()||"—";

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
  ensureWeighingSchedule(hub);__f4.window.F4MemberPrices?.shortcut(hub);
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
 // Satu kartu anggota aktif terpasang di kartu saldo pengelola.
 const minis=$("f4BankAppMinis"),adminHero=$("f4BankAppAdminHero");
 const minisHost=role==="admin"?adminHero:hub;
 if(minis&&minisHost&&minis.parentElement!==minisHost)minisHost.append(minis);
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
 quick.replaceChildren(...[weighing,price].filter(__f4.globals.Boolean));
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
 const map=new __f4.globals.Map();
 for(const node of $("v14Primary")?.querySelectorAll(".v14-kpi")||[]){
  const label=node.querySelector(".v14-kpi-label")?.textContent?.trim();
  const value=node.querySelector("strong")?.dataset.f4FullValue||node.querySelector("strong")?.textContent?.trim();
  if(label)map.set(label,value||"—");
 }
 return map;
}
/* Visual estimate is never included in withdrawable savings; cancelled deposits excluded. */
function memberBalancePreview(){
 if(!memberStatement)return null;
 const confirmed=__f4.globals.Math.max(0,(0,__f4.globals.Number)(memberStatement.saldo)||0);
 const deposits=__f4.globals.Array.isArray(memberStatement.setoran)?memberStatement.setoran:[];
 const pending=deposits.filter(row=>{
  const status=(0,__f4.globals.String)(row.status||"").trim().toLowerCase();
  return !/batal/.test(status)&&!/^(terkonfirmasi|confirmed|sah|sudah sah|disahkan)$/.test(status);
 }).reduce((sum,row)=>sum+__f4.globals.Math.max(0,(0,__f4.globals.Number)(row.estimasiRp)||0),0);
 return {confirmed,pending,total:confirmed+pending};
}
function updateDashboard(){
 if(!role||!$("f4BankAppHome"))return;
 const map=dashboardMetrics();
 if(role==="member"){
  const button=$("f4BankAppMemberBalance");
  // Keep the balance card and independent buttons intact on every refresh.
  const amount=button?.querySelector(".f4-bank-member-balance-value");
  // Beranda menampilkan saldo gabungan yang belum dicairkan; rincian hanya di Tabungan.
  const balance=memberBalancePreview();
  if(amount)amount.textContent=balance?(memberBalancePrivacy.hidden?"••••••":rupiah(balance.total)):"—";
  const balanceCard=$("f4BankAppMemberBalance");
  const heading=balanceCard?.querySelector(".f4-bank-member-balance-label");
  if(heading)heading.textContent="Total Saldo";
  let hint=balanceCard?.querySelector(".f4-bank-member-balance-hint");
  if(balanceCard&&!hint){
   hint=el("small","f4-bank-member-balance-hint");
   balanceCard.querySelector(".f4-bank-balance-cta")?.before(hint);
  }
  if(hint)hint.textContent=balance?
   "Gabungan saldo sah dan estimasi setoran":
   "Memuat saldo tabungan…";
  const eye=button?.querySelector(".f4-bank-balance-eye");
  if(eye){
   const label=memberBalancePrivacy.hidden?"Tampilkan saldo":"Sembunyikan saldo";
   eye.setAttribute("aria-label",label);
   eye.setAttribute("aria-pressed",(0,__f4.globals.String)(memberBalancePrivacy.hidden));
   eye.title=label;
   const glyph=eye.querySelector("svg");
   if(glyph)glyph.innerHTML=memberBalancePrivacy.hidden
    ?'<path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c5.4 0 9.2 5.5 9.2 7a15 15 0 0 1-3 3.6"/><path d="M6.6 6.6C4.4 8 2.8 10.5 2.8 12c0 1.6 3.8 7 9.2 7 1.5 0 2.9-.4 4.1-1"/><path d="M10 10a2.8 2.8 0 0 0 4 4"/>'
    :'<path d="M2.8 12S6.6 5 12 5s9.2 7 9.2 7-3.8 7-9.2 7-9.2-7-9.2-7Z"/><circle cx="12" cy="12" r="3"/>';
  }
  $("f4BankAppMinis")?.replaceChildren();
 }else{
  const current=adminOverview;
  const owned=current?.kasMilikBankRp;
  const headline=$("f4BankAppAdminHero")?.querySelector(".f4-bank-app-balance-title");if(headline)headline.textContent="Kas milik Bank Sampah";
  text("f4BankAppBalance",__f4.globals.Number.isFinite(owned)?rupiah(owned):"—");
  text("f4BankAppSecondary",current?"Hasil diterima lapak: "+rupiah(current.diterimaLapakRp):adminOverviewError?"Posisi kas belum dapat dimuat.":"Memuat posisi kas...");
  text("f4BankAdminHeroWarga",current?rupiah(current.hakWargaBelumCairRp):"—");
  text("f4BankAdminHeroLingkungan",current?rupiah(current.kasLingkunganRp):"—");
  // Pos hak warga dan kas lingkungan sudah ditampilkan di kartu saldo utama.
  const opts=[["Anggota aktif",current?.wargaAktif??map.get("Anggota aktif")??"—"]];
  $("f4BankAppMinis")?.replaceChildren(...opts.map(([label,value])=>{
   const members=label==="Anggota aktif";
   const node=el(members?"button":"div","f4-bank-app-mini"+(members?" f4-bank-admin-members-link":""));
   if(members){
    node.type="button";node.dataset.bankAppRoute="tabungan";
    node.setAttribute("aria-label","Lihat saldo dan daftar warga");
    const icon=el("span","f4-bank-admin-members-icon");
    const svg=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");
    svg.innerHTML='<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M17 5a3 3 0 0 1 0 6m1 5c2 0 3 2 3 4"/>';
    icon.append(svg);node.append(icon);
    node.onclick=()=>navigate("tabungan");
   }
   const copy=el("span","f4-bank-admin-mini-copy");
   copy.append(el("small","",label),el("strong","",(0,__f4.globals.String)(value??"—")));node.append(copy);
   if(members)node.append(f4BankChevronIcon());
   return node;
  }));
 }
}
function updateAdminOverview(event){
 if(roleType()!=="admin"||!event.detail)return;
 adminOverview=event.detail;adminOverviewError='';updateDashboard();
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
function savingsStatIcon(kind){
 const svg=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");
 svg.setAttribute("width","19");svg.setAttribute("height","19");
 svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
 svg.setAttribute("stroke-width","1.9");svg.setAttribute("stroke-linecap","round");
 svg.setAttribute("stroke-linejoin","round");svg.setAttribute("aria-hidden","true");
 const paths={
  incoming:'M12 3v12m-4-4 4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  payout:'M12 21V9m-4 4 4-4 4 4M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2',
  deposit:'M3 7h18l-2 13H5L3 7Zm3 0 2-4h8l2 4M9 12h6m-3-3v6',
  pending:'M12 7v5l3 2M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z'
 };
 const path=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","path");
 path.setAttribute("d",paths[kind]||paths.deposit);svg.append(path);
 const wrap=el("span","f4-bank-savings-stat-icon is-"+kind);wrap.setAttribute("aria-hidden","true");
 wrap.append(svg);return wrap;
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
  hero.append(el("h2","f4-bank-savings-title","Tabungan saya"),
   el("small","","SALDO BISA DICAIRKAN"),el("strong","","—"),
   el("span","","Saldo yang sudah masuk tabungan bisa dicairkan. Setoran yang belum terjual masih berupa perkiraan."));
  priv.insertBefore(hero,priv.firstChild);hero.querySelector("strong").id="f4BankSavingsBalance";
  const pending=el("div","f4-bank-savings-pending");
  pending.append(el("small","","Estimasi menunggu penjualan"),
   __f4.globals.Object.assign(el("b","","—"),{id:"f4BankSavingsPending"}));
  hero.append(pending);
  const payout=el("button","f4-bank-gold-action f4-bank-savings-payout");
  payout.type="button";payout.setAttribute("aria-label","Ajukan Pencairan");
  payout.append(
   savingsStatIcon("payout").querySelector("svg"),
   el("span","f4-bank-savings-payout-short","Cairkan"),
   el("span","f4-bank-savings-payout-long","Ajukan Pencairan")
  );
  payout.onclick=()=>navigate("bank-payout");hero.append(payout);
 }
 if(!$("f4BankSavingsStats")){
  const mini=el("div","f4-bank-savings-stats");mini.id="f4BankSavingsStats";
  for(const [title,key] of [["Masuk","f4BankSavingsCredit"],["Dicairkan","f4BankSavingsDebit"],
    ["Setoran","f4BankSavingsDepositCount"],["Belum terjual","f4BankSavingsPendingWeight"]]){
   const tile=el("div","f4-bank-savings-stat"+(["f4BankSavingsDepositCount","f4BankSavingsPendingWeight"].includes(key)?" is-mobile-extra":""));
   const iconType=key==="f4BankSavingsCredit"?"incoming":key==="f4BankSavingsDebit"?"payout":
    key==="f4BankSavingsDepositCount"?"deposit":"pending";
   tile.append(savingsStatIcon(iconType),el("small","",title));
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
 if(!$("f4BankLatestComposition")){
  const latest=el("section","f4-bank-latest-composition");latest.id="f4BankLatestComposition";
  $("f4BankSavingsChart")?.before(latest);
 }
 if(!$("f4BankCategoryTotals")){
  const totals=el("section","f4-bank-category-totals");totals.id="f4BankCategoryTotals";
  // HP: setoran terakhir -> total per jenis -> perkembangan; PC keeps its grid areas.
  $("f4BankLatestComposition")?.after(totals);
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
 const match=(0,__f4.globals.String)(raw||"").match(/(\d{1,2})\s+([A-Za-z.]+)\s+(\d{4})/);
 if(!match)return "";
 const names=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
 const m=names.indexOf(match[2].replace(".",""));
 return m<0?"":match[3]+"-"+(0,__f4.globals.String)(m+1).padStart(2,"0");
}
function isBankCorrection(row){
 return /(?:koreksi|pembatalan|dibatalkan|reversal|pembalik)/i.test((0,__f4.globals.String)(row?.jenis||row?.type||""));
}
function ledger(){
 if(!memberStatement||!__f4.globals.Array.isArray(memberStatement.mutasi))return [];
 return memberStatement.mutasi.map(x=>{
  const iso=(0,__f4.globals.String)(x.tanggal||""),credit=(0,__f4.globals.Number)(x.kredit)||0,debit=(0,__f4.globals.Number)(x.debit)||0;
  const date=/^\d{4}-\d{2}-\d{2}$/.test(iso)?
   new __f4.globals.Date(iso+"T12:00:00Z").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}):iso;
  return {date,iso,type:(0,__f4.globals.String)(x.jenis||"Transaksi"),correction:isBankCorrection(x),credit,debit,
   balance:rupiah((0,__f4.globals.Number)(x.saldo)||0),month:iso.slice(0,7)};
 }).sort((a,b)=>b.iso.localeCompare(a.iso));
}
function historyLines(){
 const sales=ledger().map(item=>({...item,kind:item.correction?"correction":item.debit>0?"out":"in",sortId:"m"}));
 const deposits=__f4.globals.Array.isArray(memberStatement?.setoran)?memberStatement.setoran:[];
 const weights=deposits.filter(x=>!/batal/i.test((0,__f4.globals.String)(x.status||""))).map(x=>{
  const iso=(0,__f4.globals.String)(x.tanggal||"");const isFinal=/terkonfirmasi/i.test((0,__f4.globals.String)(x.status||""));
  const kg=x.beratKg==null?"—":(0,__f4.globals.Number)(x.beratKg).toLocaleString("id-ID",{maximumFractionDigits:3})+" kg";
  const moneyNote=isFinal?(x.nilaiSahRp==null?"Nilai belum tersedia":"Hasil jual "+rupiah(x.nilaiSahRp)):
    "Perkiraan "+rupiah(x.estimasiRp);
  const date=/^\d{4}-\d{2}-\d{2}$/.test(iso)?
   new __f4.globals.Date(iso+"T12:00:00Z").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}):iso;
  return {iso,date,month:iso.slice(0,7),type:"Setoran Sampah",kind:"deposit",amountText:kg,
   note:moneyNote+" • "+(isFinal?"Sudah sah":"Belum terjual"),sortId:"d"};
 });
 return [...sales,...weights].sort((a,b)=>b.iso.localeCompare(a.iso)||a.sortId.localeCompare(b.sortId));
}

function months(items){
 return [...new __f4.globals.Set(items.map(x=>x.month).filter(__f4.globals.Boolean))].sort().reverse();
}
function monthName(id){
 const [year,m]=(0,__f4.globals.String)(id).split("-").map(__f4.globals.Number);
 return new __f4.globals.Intl.DateTimeFormat("id-ID",{month:"short",year:"numeric"}).format(new __f4.globals.Date(year,m-1,1));
}
function populateMonths(host,values,current,onChange){
 if(!host)return;
 host.replaceChildren();
 for(const [key,label] of [["all","Semua"],...values.map(x=>[x,monthName(x)])]){
  if(host.tagName==="SELECT"){const opt=new __f4.globals.Option(label,key);opt.selected=key===current;host.append(opt);}
  else {const b=el("button","f4-bank-month-chip"+(current===key?" is-active":""),label);
   b.type="button";b.setAttribute("aria-pressed",(0,__f4.globals.String)(current===key));b.onclick=()=>onChange(key);host.append(b);}
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
  const rangeButton=el("button","f4-bank-secondary-action");rangeButton.type="button";
  rangeButton.id="f4BankReportRangeToggle";
  rangeButton.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h6"/></svg>';
  rangeButton.setAttribute("aria-label","Atur periode tanggal");rangeButton.title="Atur periode tanggal";
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
   if(typeof __f4.window.f4BankMemberPrintReady==="function"&&!__f4.window.f4BankMemberPrintReady())return;
   if(typeof __f4.window.v12Print==="function")__f4.window.v12Print();
  };
  const csv=el("button","f4-bank-secondary-action","Unduh CSV");csv.type="button";
  csv.onclick=()=>typeof __f4.window.v12CSV==="function"&&__f4.window.v12CSV();
  actions.append(pdf,csv);
  const title=el("h3","f4-bank-screen-subhead","Transaksi Periode");
  const transactions=el("div","f4-bank-report-list");transactions.id="f4BankReportList";
  const controls=el("section","f4-bank-report-panel");
  const log=el("section","f4-bank-report-transactions");
  controls.append(period,summary,actions);log.append(title,transactions);
  page.append(el("p","f4-bank-screen-status","Memuat laporan..."),controls,log);
 }
 const all=historyLines();
 const periods=[...new __f4.globals.Set(all.map(x=>x.month).filter(x=>/^\d{4}-\d{2}$/.test(x)))].sort().reverse();
 if(!reportMonth||reportMonth==="all")reportMonth=periods[0]||today().slice(0,7);
 const [yearValue,monthValue]=reportMonth.split("-").map(__f4.globals.Number);
 const year=$("f4BankReportYear"),month=$("f4BankReportMonth");
 const years=[...new __f4.globals.Set([yearValue,...periods.map(x=>(0,__f4.globals.Number)(x.slice(0,4))),...__f4.globals.Array.from({length:21},(_,i)=>2026+i)])]
  .filter(__f4.globals.Number.isFinite).sort((a,b)=>b-a);
 year.replaceChildren(...years.map(y=>{const op=new __f4.globals.Option((0,__f4.globals.String)(y),(0,__f4.globals.String)(y));op.selected=y===yearValue;return op;}));
 const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
 month.replaceChildren(...names.map((name,i)=>{const op=new __f4.globals.Option(name,(0,__f4.globals.String)(i+1).padStart(2,"0"));op.selected=i+1===monthValue;return op;}));
 year.onchange=()=>{reportMonth=year.value+"-"+month.value;showReport();};
 month.onchange=()=>{reportMonth=year.value+"-"+month.value;showReport();};
 __f4.window.f4BankReportPeriod=()=>reportRange?"":reportMonth;
 __f4.window.f4BankReportRange=()=>reportRange;
 const rangeInputs=$("f4BankReportRangeFields");
 rangeInputs.hidden=!reportRange;
 const periodToggle=$("f4BankReportRangeToggle");
 periodToggle.setAttribute("aria-label",reportRange?"Kembali ke periode bulanan":"Atur periode tanggal");
 periodToggle.title=reportRange?"Kembali ke periode bulanan":"Atur periode tanggal";
 periodToggle.setAttribute("aria-pressed",(0,__f4.globals.String)(!!reportRange));
 periodToggle.classList.toggle("is-range-active",!!reportRange);
 $("f4BankReportMonth").closest("label").hidden=!!reportRange;
 $("f4BankReportYear").closest("label").hidden=!!reportRange;
 if(reportRange){$("f4BankReportFrom").value=reportRange.from;$("f4BankReportTo").value=reportRange.to;}
 const inPeriod=date=>reportRange?date>=reportRange.from&&date<=reportRange.to:(0,__f4.globals.String)(date||"").startsWith(reportMonth);

 const selected=ledger().filter(x=>inPeriod(x.iso));
 const transactions=all.filter(x=>inPeriod(x.iso));
 const deposits=(memberStatement?.setoran||[]).filter(x=>inPeriod((0,__f4.globals.String)(x.tanggal||""))&&!/batal/i.test((0,__f4.globals.String)(x.status)));
 const missingWeight=deposits.some(x=>x.beratKg==null);
 const weight=deposits.reduce((n,x)=>n+(0,__f4.globals.Number)(x.beratKg||0),0);
 const active=selected.filter(x=>!x.correction);
 const credit=active.reduce((n,x)=>n+x.credit,0),debit=active.reduce((n,x)=>n+x.debit,0);
 const tiles=[["Setoran",missingWeight?"—":weight.toLocaleString("id-ID",{maximumFractionDigits:3})+" kg"],
  ["Hasil jual sah",rupiah(credit)],["Pencairan / keluar",rupiah(debit)],["Transaksi",(0,__f4.globals.String)(transactions.filter(x=>x.kind!=="correction").length)]];
 const summary=$("f4BankReportSummary");summary.replaceChildren();
 for(const [label,value] of tiles){const box=el("div","f4-bank-report-tile");
  box.append(el("small","",label),el("strong","",value));summary.append(box);}
 const list=$("f4BankReportList");list.replaceChildren();
 for(const entry of transactions){
  const node=el("article","f4-bank-report-transaction"),deposit=entry.kind==="deposit",out=entry.debit>0;
  const left=el("span");left.append(el("strong","",entry.type),el("small","",entry.date));
  const right=el("span","",deposit?entry.amountText:entry.kind==="correction"?"Koreksi "+rupiah(__f4.globals.Math.abs(entry.debit||entry.credit)):(out?"− ":"+ ")+rupiah(out?entry.debit:entry.credit));
  if(deposit)right.title=entry.note;
  right.className=entry.kind==="correction"?"is-correction":out?"is-out":"is-in";
  node.append(left,right);list.append(node);
 }
 if(!transactions.length)list.append(el("p","f4-bank-empty","Belum ada transaksi di periode ini."));
 const printAction=$("f4BankMemberPrintAction");
 if(printAction)printAction.disabled=typeof __f4.window.f4BankMemberPrintReady==="function"&&!__f4.window.f4BankMemberPrintReady();
 statusFor(page);
}
function memberBuckets(){
 // Each point is ONE genuine deposit. Never combine transactions in a bar.
 const deposits=__f4.globals.Array.isArray(memberStatement?.setoran)?memberStatement.setoran:[];
 return deposits.filter(row=>!/batal/i.test((0,__f4.globals.String)(row.status||""))).map((row,index)=>{
  const final=/terkonfirmasi|confirmed/i.test((0,__f4.globals.String)(row.status||""));
  const period=(0,__f4.globals.String)(row.tanggal||"").slice(0,7);
  const date=(0,__f4.globals.String)(row.tanggal||"").slice(0,10);
  const confirmedAt=(0,__f4.globals.String)(row.tanggalPengesahan||row.tanggalJual||"").slice(0,10);
  return {
   id:(0,__f4.globals.String)(row.id||"tx-"+index),date,month:period,
   batch:(0,__f4.globals.String)(row.batchId||""),confirmedAt,final,
   weight:row.beratKg==null?0:(0,__f4.globals.Number)(row.beratKg)||0,
   confirmed:final?(row.nilaiSahRp==null?0:(0,__f4.globals.Number)(row.nilaiSahRp)||0):0,
   estimated:final?0:(0,__f4.globals.Number)(row.estimasiRp)||0,
   missingWeight:row.beratKg==null,
   missingValue:final&&row.nilaiSahRp==null
  };
 }).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
const weighingDayNames=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
let weighingWeekday=0,weighingLastFetched=0,weighingRequest=null,weighingRequestId=0,weighingReady=false;
let weighingRule={frequency:"weekly",nextOccurrence:"",anchorDate:"",dayOfMonth:null};
function weighingNextDate(){
 if(!weighingReady)return {days:null,label:"Jadwal belum tersedia"};
 const now=new __f4.globals.Date(today()+"T00:00:00Z");
 const current=new __f4.globals.Date(now);
 const day=(0,__f4.globals.Number)(weighingWeekday);
 const frequency=weighingRule.frequency||"weekly";
 if(frequency!=="weekly"){
  const supplied=weighingRule.nextOccurrence;
  if(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(supplied||"")){
   const date=new __f4.globals.Date(supplied+"T00:00:00Z");
   if(__f4.globals.Number.isFinite(date.getTime())&&date>=now)
    return {days:__f4.globals.Math.round((date-now)/86400000),label:new __f4.globals.Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(date)};
  }
  return {days:null,label:"Jadwal berikutnya belum tersedia"};
 }
 const days=(day-current.getUTCDay()+7)%7;
 current.setUTCDate(current.getUTCDate()+days);
 return {days,label:new __f4.globals.Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(current)};
}
function weighingCountdown(days){
 return days==null?"—":days===0?"Hari ini":days===1?"Besok":days+" hari lagi";
}
function updateWeighingCard(){
 const card=$("f4BankWeighingSchedule");if(!card)return;
 const next=weighingNextDate(),name=weighingDayNames[weighingWeekday];
 const title=card.querySelector(".f4-bank-weigh-copy > strong");
 if(title){
  const label=(0,__f4.globals.String)(next.label||"—");
  title.replaceChildren(
   el("span","f4-bank-weigh-desktop-date",label),
   el("span","f4-bank-weigh-countdown",next.days==null?"Belum tersedia":weighingCountdown(next.days))
  );
 }
 const detail=card.querySelector(".f4-bank-weigh-copy > span:last-child");
 if(detail)detail.textContent=!weighingReady?"":weighingRule.frequency==="biweekly"?"Setiap 2 minggu":
  weighingRule.frequency==="monthly"?"Setiap bulan":"Setiap "+name;
 card.setAttribute("aria-label","Lihat jadwal penimbangan. "+(next.days==null?next.label:weighingCountdown(next.days)+", "+next.label));
 const modal=$("f4BankWeighingDialog");
 if(modal?.open){modal.querySelector(".f4-bank-schedule-date").textContent=next.days===0?"Hari ini • "+name:next.label;
  modal.querySelector(".f4-bank-schedule-cycle").textContent=detail?.textContent||"";}
}
function loadWeighingDay(){
 if(role!=="member")return;
 if(weighingRequest)return;
 if(weighingLastFetched&&__f4.globals.Date.now()-weighingLastFetched<90000)return;
 const seq=++weighingRequestId;
 weighingLastFetched=__f4.globals.Date.now(); // Throttle errors as well as successful reads.
 weighingRequest=(0,__f4.globals.fetch)(apiRoot+"/api/public/bank/weighing-schedule",{
  method:"GET",credentials:"include",cache:"no-store"
 }).then(async response=>{
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result.ok===false||!__f4.globals.Number.isInteger(result.weekday)||result.weekday<0||result.weekday>6)
   throw (0,__f4.globals.Error)("Jadwal belum tersedia");
  if(seq!==weighingRequestId||role!=="member")return;
  weighingWeekday=result.weekday;weighingReady=true;
  weighingRule={frequency:result.frequency||"weekly",nextOccurrence:result.nextOccurrence||result.next_occurrence||"",anchorDate:result.anchorDate||"",dayOfMonth:result.dayOfMonth||null};
  weighingLastFetched=__f4.globals.Date.now();updateWeighingCard();
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
  __f4.globals.document.body.append(dialog);
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
  content.append(el("small","","Jadwal berikutnya"),el("strong","","—"),el("span","","Memuat jadwal…"));
  card.append(icon,content);home.append(card);
 }
 updateWeighingCard();loadWeighingDay();
}
function f4PrivateShort(n,mode){
 const value=__f4.globals.Math.max(0,(0,__f4.globals.Number)(n)||0);
 const fmt=x=>x.toLocaleString("id-ID",{maximumFractionDigits:1});
 if(mode==="rp"){
  if(value>=1000000)return fmt(value/1000000)+" jt";
  if(value>=1000)return fmt(value/1000)+" rb";
  return fmt(value);
 }
 return fmt(value);
}
function f4PrivateKg(n){
 return ((0,__f4.globals.Number)(n)||0).toLocaleString("id-ID",{maximumFractionDigits:3})+" kg";
}
function f4PrivateChartEntries(points){
 // Existing default stays "Periode": one real deposit per group, not one month.
 const origin=memberChartGroup;
 const utc=date=>__f4.globals.Date.parse(date+"T00:00:00Z");
 const now=utc(today());
 let list=points;
 if(origin==="30"){
  const days=30;
  const earliest=now-(days-1)*86400000;
  list=points.filter(p=>utc(p.date)>=earliest&&utc(p.date)<=now);
 }
 const groups=new __f4.globals.Map();
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
   const start=new __f4.globals.Date(now-(days-1-index)*86400000).toISOString().slice(0,10);
   const finish=new __f4.globals.Date(now-(days-1-__f4.globals.Math.min(index+bin-1,days-1))*86400000).toISOString().slice(0,10);
   const key=(0,__f4.globals.String)(index);
   groups.set(key,{key,label:labelDate(start),
    full:start===finish?start:start+" – "+finish,count:0,finalCount:0,
    confirmedWeight:0,pendingWeight:0,confirmedRp:0,estimatedRp:0,
    missingWeight:false,missingValue:false});
  }
  for(const point of list){
   const offset=__f4.globals.Math.floor((utc(point.date)-(now-(days-1)*86400000))/86400000);
   const groupKey=(0,__f4.globals.String)(__f4.globals.Math.floor(offset/bin)*bin);
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
  (waitingWeight>0?" · "+f4PrivateKg(waitingWeight)+" belum terjual":""));
 summary.replaceChildren(title,value,caption);
 let legend=$("f4BankSavingsLegend");
 if(!legend){
  legend=el("div","f4-bank-private-chart-legend");legend.id="f4BankSavingsLegend";host.after(legend);
 }
 legend.replaceChildren();
 for(const [name,kind] of [[mode==="kg"?"Berat sah":"Hasil jual sah","confirmed"],
   [mode==="kg"?"Belum terjual":"Perkiraan belum terjual","estimate"]]){
  const item=el("span",""),dot=el("i","is-"+kind);
  dot.setAttribute("aria-hidden","true");item.append(dot,__f4.globals.document.createTextNode(name));legend.append(item);
 }
 let foot=$("f4BankSavingsChartNote");
 if(!foot){
  foot=el("p","f4-bank-private-chart-note");foot.id="f4BankSavingsChartNote";legend.after(foot);
 }
 foot.textContent=entries.some(x=>x.missingValue||x.missingWeight)?
  "Sebagian hasil sah belum tersedia.":"";
 foot.hidden=!foot.textContent;
}
/* Latest-deposit composition is a read-only visual of the member's actual item rows.
   It never estimates category weights or modifies the settlement / payout ledger. */
function renderLatestComposition(){
 const host=$("f4BankLatestComposition");if(!host)return;
 host.replaceChildren();
 const all=(__f4.globals.Array.isArray(memberStatement?.setoran)?memberStatement.setoran:[])
  .filter(row=>!/batal/i.test((0,__f4.globals.String)(row?.status||"")))
  .slice().sort((a,b)=>(0,__f4.globals.String)(b.tanggal||"").localeCompare((0,__f4.globals.String)(a.tanggal||""))||
   (0,__f4.globals.String)(b.id||"").localeCompare((0,__f4.globals.String)(a.id||"")));
 const latest=all[0];
 const heading=el("div","f4-bank-latest-heading");
 heading.append(el("h3","","Setoran Terakhir"));
 host.append(heading);
 if(!memberStatement){
  host.append(el("p","f4-bank-latest-empty","Memuat setoran terakhir..."));return;
 }
 if(!latest){
  host.append(el("p","f4-bank-latest-empty","Belum ada setoran tercatat."));return;
 }
 const isFinal=/terkonfirmasi|confirmed|^sah$|^sudah sah$/i.test((0,__f4.globals.String)(latest.status||"").trim());
 heading.append(el("span","f4-bank-latest-status"+(isFinal?" is-final":""),isFinal?"Sudah sah":"Belum terjual"));
 const iso=(0,__f4.globals.String)(latest.tanggal||"").slice(0,10);
 if(/^\d{4}-\d{2}-\d{2}$/.test(iso)){
  const date=new __f4.globals.Date(iso+"T12:00:00Z");
  host.append(el("small","f4-bank-latest-date",
   new __f4.globals.Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(date)));
 }
 const itemWeights=new __f4.globals.Map();
 for(const part of __f4.globals.Array.isArray(latest.rincian)?latest.rincian:[]){
  const name=(0,__f4.globals.String)(part?.barang||part?.namaBarang||part?.jenis||"").trim();
  const weight=part?.beratKg==null?__f4.globals.NaN:(0,__f4.globals.Number)(part.beratKg);
  if(!name||!__f4.globals.Number.isFinite(weight)||weight<=0)continue;
  itemWeights.set(name,(itemWeights.get(name)||0)+weight);
 }
 const items=[...itemWeights].sort((a,b)=>b[1]-a[1]);
 const knownTotal=items.reduce((sum,entry)=>sum+entry[1],0);
 const total=latest.beratKg==null?__f4.globals.NaN:(0,__f4.globals.Number)(latest.beratKg);
 const validBreakdown=items.length>0&&__f4.globals.Number.isFinite(total)&&total>0&&__f4.globals.Math.abs(knownTotal-total)<.011;
 const main=el("div","f4-bank-latest-main");
 const donut=el("div","f4-bank-latest-donut"+(validBreakdown?"":" is-unavailable"));
 const center=el("div","f4-bank-latest-donut-center");
 center.append(el("strong","",__f4.globals.Number.isFinite(total)?f4PrivateKg(total):"—"),
  el("small","","Total timbang"));
 donut.append(center);
 const detail=el("div","f4-bank-latest-categories");
 if(validBreakdown){
  const palette=F4_BANK_WASTE_PALETTE;
  let start=0;
  const stops=[];
  for(const [index,[name,weight]] of items.entries()){
   const end=start+weight/knownTotal*100;
   const color=palette[index%palette.length];
   stops.push(color+" "+start.toFixed(3)+"% "+end.toFixed(3)+"%");
   start=end;
   const row=el("div","f4-bank-latest-category");
   const label=el("span","f4-bank-latest-category-label");
   const swatch=el("i");swatch.style.backgroundColor=color;swatch.setAttribute("aria-hidden","true");
   label.append(swatch,__f4.globals.document.createTextNode(name));
   row.append(label,el("strong","",f4PrivateKg(weight)));detail.append(row);
  }
  donut.style.background="conic-gradient("+stops.join(",")+")";
  donut.setAttribute("role","img");
  donut.setAttribute("aria-label",items.map(([name,weight])=>name+" "+f4PrivateKg(weight)).join(", "));
 }else{
  detail.append(el("p","f4-bank-latest-unavailable",
   "Rincian jenis atau berat belum tersedia untuk diagram."));
 }
 main.append(donut,detail);host.append(main);
 const footer=el("div","f4-bank-latest-footer");
 const money=isFinal?latest.nilaiSahRp:latest.estimasiRp;
 footer.append(el("span","",isFinal?"Hasil penjualan sah":"Perkiraan nilai"),
  el("strong","",money==null?"—":rupiah((0,__f4.globals.Number)(money)||0)));
 host.append(footer);
}
/* Aggregate the member's recorded, non-cancelled deposits by exact waste type.
   Weight comes only from item rows, never from sales, estimates or ledger corrections. */
function renderCategoryTotals(){
 const host=$("f4BankCategoryTotals");if(!host)return;
 const expanded=host.dataset.expanded==="true";
 host.replaceChildren();
 const head=el("div","f4-bank-category-head");
 const nameBox=el("div","f4-bank-category-heading");
 nameBox.append(el("h3","","Total Setoran per Jenis"),
  el("small","","Akumulasi semua setoran tercatat"));
 head.append(nameBox);
 host.append(head);
 if(!memberStatement){
  host.append(el("p","f4-bank-category-empty","Memuat rekap jenis sampah..."));return;
 }
 const deposits=__f4.globals.Array.isArray(memberStatement.setoran)?memberStatement.setoran.filter(row=>
  !/batal/i.test((0,__f4.globals.String)(row?.status||""))):[];
 const totals=new __f4.globals.Map();
 let declaredWeight=0,missingWeights=0,usedCount=0;
 for(const deposit of deposits){
  const declared=deposit?.beratKg==null?__f4.globals.NaN:(0,__f4.globals.Number)(deposit.beratKg);
  if(__f4.globals.Number.isFinite(declared)&&declared>=0)declaredWeight+=declared;
  else missingWeights++;
  let itemWeight=0;
  for(const part of __f4.globals.Array.isArray(deposit?.rincian)?deposit.rincian:[]){
   const label=(0,__f4.globals.String)(part?.barang||part?.namaBarang||part?.jenis||"").trim().replace(/\s+/g," ");
   const weight=part?.beratKg==null?__f4.globals.NaN:(0,__f4.globals.Number)(part.beratKg);
   if(!label||!__f4.globals.Number.isFinite(weight)||weight<=0)continue;
   const key=label.toLocaleLowerCase("id-ID");
   const entry=totals.get(key)||{name:label,weight:0};
   entry.weight+=weight;itemWeight+=weight;totals.set(key,entry);
  }
  if(itemWeight>0)usedCount++;
 }
 const categories=[...totals.values()].sort((a,b)=>b.weight-a.weight||a.name.localeCompare(b.name,"id"));
 const totalWeight=categories.reduce((sum,row)=>sum+row.weight,0);
 const verified=deposits.length>0&&!missingWeights&&__f4.globals.Math.abs(totalWeight-declaredWeight)<.011;
 const total=el("strong","f4-bank-category-total",categories.length?f4PrivateKg(totalWeight):"—");
 head.append(total);
 if(!categories.length){
  host.append(el("p","f4-bank-category-empty",deposits.length?
   "Rincian jenis sampah belum tersedia.":"Belum ada setoran tercatat."));return;
 }
 const panel=el("div","f4-bank-category-rows");
 const colors=F4_BANK_WASTE_PALETTE;
 const max=categories[0].weight||1;
 const limit=expanded?categories.length:4;
 for(const [index,item] of categories.slice(0,limit).entries()){
  const color=colors[index%colors.length];
  const row=el("div","f4-bank-category-row");
  const top=el("div","f4-bank-category-row-top");
  const label=el("span","f4-bank-category-label");
  const swatch=el("i");swatch.style.backgroundColor=color;swatch.setAttribute("aria-hidden","true");
  label.append(swatch,__f4.globals.document.createTextNode(item.name));
  const amount=el("strong","",f4PrivateKg(item.weight));
  top.append(label,amount);
  const track=el("div","f4-bank-category-track");
  const fill=el("span","f4-bank-category-fill");
  fill.style.width=__f4.globals.Math.max(1,item.weight/max*100).toFixed(2)+"%";
  fill.style.backgroundColor=color;
  track.append(fill);track.setAttribute("aria-hidden","true");
  row.append(top,track);panel.append(row);
 }
 host.append(panel);
 if(categories.length>4){
  const button=el("button","f4-bank-category-expand",expanded?
   "Tampilkan lebih sedikit":"Lihat semua "+categories.length+" jenis");
  button.type="button";button.setAttribute("aria-expanded",(0,__f4.globals.String)(expanded));
  button.onclick=()=>{host.dataset.expanded=expanded?"false":"true";renderCategoryTotals();};
  host.append(button);
 }
 const caption=el("p","f4-bank-category-note",
  deposits.length+" setoran · "+categories.length+" jenis sampah");
 if(!verified)caption.append(__f4.globals.document.createTextNode(
  " · Hanya berat dengan rincian jenis yang tersedia"+(missingWeights?" (sebagian berat setoran belum tercatat)":"")));
 host.append(caption);
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
  // HP uses one compact period picker; desktop keeps the original three tabs.
  const picker=el("div","f4-bank-chart-period-picker");
  const trigger=el("button","f4-bank-chart-period-trigger");
  trigger.type="button";trigger.id="f4BankChartPeriodTrigger";
  trigger.setAttribute("aria-label","Pilih periode grafik setoran");
  trigger.setAttribute("aria-haspopup","menu");trigger.setAttribute("aria-expanded","false");
  const chosen=el("span","f4-bank-chart-period-label","Periode");
  const arrow=bankUiSvg("chevron-right");arrow.classList.add("f4-bank-chart-period-chevron");
  trigger.append(chosen,arrow);
  const menu=el("div","f4-bank-chart-period-menu");menu.id="f4BankChartPeriodMenu";
  menu.hidden=true;menu.setAttribute("role","menu");menu.setAttribute("aria-label","Periode grafik setoran");
  for(const [id,label] of [["period","Periode"],["30","30 hari"],["month","Per bulan"]]){
   const option=el("button","",label);option.type="button";
   option.dataset.chartPeriod=id;option.setAttribute("role","menuitemradio");
   option.onclick=()=>{
    memberChartGroup=id;menu.hidden=true;trigger.setAttribute("aria-expanded","false");chartSavings();
   };
   menu.append(option);
  }
  trigger.onclick=()=>{
   menu.hidden=!menu.hidden;trigger.setAttribute("aria-expanded",(0,__f4.globals.String)(!menu.hidden));
  };
  picker.addEventListener("keydown",event=>{
   if(event.key==="Escape"&&!menu.hidden){
    event.preventDefault();menu.hidden=true;trigger.setAttribute("aria-expanded","false");trigger.focus();
   }
  });
  __f4.globals.document.addEventListener("pointerdown",event=>{
   if(!picker.contains(event.target)&&!menu.hidden){
    menu.hidden=true;trigger.setAttribute("aria-expanded","false");
   }
  });
  picker.append(trigger,menu);
  filters.append(tabs,picker,units);
  root.querySelector("h3")?.after(filters);
 }
 $("f4BankChartPeriod")?.remove();
 const periodLabels={period:"Periode","30":"30 hari",month:"Per bulan"};
 const pickerLabel=$("f4BankChartPeriodTrigger")?.querySelector(".f4-bank-chart-period-label");
 if(pickerLabel)pickerLabel.textContent=periodLabels[memberChartGroup]||"Periode";
 filters.querySelectorAll("[data-chart-period]").forEach(button=>{
  const active=button.dataset.chartPeriod===memberChartGroup;
  button.classList.toggle("is-active",active);button.setAttribute("aria-checked",(0,__f4.globals.String)(active));
 });
 filters.querySelectorAll("[data-group]").forEach(button=>{
  const active=button.dataset.group===memberChartGroup;
  button.classList.toggle("is-active",active);button.setAttribute("aria-pressed",(0,__f4.globals.String)(active));
 });
 filters.querySelectorAll("[data-mode]").forEach(button=>{
  const active=button.dataset.mode===memberChartMode;
  button.classList.toggle("is-active",active);button.setAttribute("aria-pressed",(0,__f4.globals.String)(active));
 });
 const points=memberBuckets().filter(p=>/^\d{4}-\d{2}-\d{2}$/.test(p.date));
 const entries=f4PrivateChartEntries(points);
 const useKg=memberChartMode==="kg";
 const fields=useKg?["confirmedWeight","pendingWeight"]:["confirmedRp","estimatedRp"];
 f4PrivateChartSummary(host,entries,memberChartMode);
 const max=__f4.globals.Math.max(.001,...entries.flatMap(row=>fields.map(key=>row[key])));
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
   const val=amounts.reduce((sum,value)=>sum+((0,__f4.globals.Number)(value)||0),0);
   const amountLabel=useKg?f4PrivateShort(val,"kg")+" kg":f4PrivateShort(val,"rp");
   const noFinal=useKg?item.missingWeight:item.missingValue;
   column.append(el("strong","",noFinal?"—":amountLabel));
   const rail=el("span","f4-bank-savings-bar-rail");
   for(const [index,key] of fields.entries()){
    const bar=el("i",index?"is-estimate":"is-confirmed");
    bar.style.height=item[key]>0?__f4.globals.Math.max(4,item[key]/max*100)+"%":"0%";
    bar.title=(index?"Belum terjual / perkiraan":"Sudah sah")+": "+(useKg?f4PrivateKg(item[key]):rupiah(item[key]));
    rail.append(bar);
   }
   column.append(rail,el("small","",item.label));
   column.title=item.full+" • "+fields.map((key,i)=>(i?"Belum terjual / perkiraan ":"Sah ")+
    (useKg?f4PrivateKg(item[key]):rupiah(item[key]))).join(" • ");
   column.setAttribute("aria-label",column.title);
   host.append(column);
  }
 }
 if(previousView===currentView)host.scrollLeft=oldScroll;
 else host.scrollLeft=memberChartGroup==="period"?host.scrollWidth:0;
}
function syncSavings(){
 const preview=memberBalancePreview();
 text("f4BankSavingsBalance",preview?rupiah(preview.confirmed):"—");
 text("f4BankSavingsPending",preview?rupiah(preview.pending):"—");
 const hero=$("f4BankSavingsHero");
 const title=hero?.querySelector(":scope > small");
 if(title)title.textContent="SALDO BISA DICAIRKAN";
 const description=hero?.querySelector(":scope > span");
 if(description)description.textContent="Saldo yang sudah masuk tabungan bisa dicairkan. Setoran yang belum terjual masih berupa perkiraan."
 text("f4BankSavingsCredit",memberStatement?rupiah(memberStatement.totalMasuk):"—");
 text("f4BankSavingsDebit",memberStatement?rupiah(memberStatement.totalCair):"—");
 const activeDeposits=(__f4.globals.Array.isArray(memberStatement?.setoran)?memberStatement.setoran:[])
  .filter(row=>!/batal/i.test((0,__f4.globals.String)(row?.status||"")));
 const pendingWeight=activeDeposits.filter(row=>!/terkonfirmasi|confirmed|^sah$|^sudah sah$/i.test((0,__f4.globals.String)(row.status||"").trim()))
  .reduce((sum,row)=>sum+__f4.globals.Math.max(0,(0,__f4.globals.Number)(row.beratKg)||0),0);
 text("f4BankSavingsDepositCount",memberStatement?(0,__f4.globals.String)(activeDeposits.length):"—");
 text("f4BankSavingsPendingWeight",memberStatement?f4PrivateKg(pendingWeight):"—");
 renderLatestComposition();
 renderCategoryTotals();
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
  b.onclick=()=>{const n=(0,__f4.globals.Number)(memberStatement?.saldo||0);$("f4BankPayoutAmount").value=(0,__f4.globals.String)(__f4.globals.Math.floor(n*value));};
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
   const left=el("span");left.append(el("strong","",rupiah(item.amount_rp)),el("small","",(0,__f4.globals.String)(item.requested_at||"").slice(0,10)));
   const state=el("span","f4-bank-request-state is-"+item.status,item.status==="dibayar"?"Dibayar":item.status==="disetujui"?"Disetujui":item.status==="ditolak"?"Ditolak":item.status==="diajukan"?"Diajukan":item.status);
   row.append(left,state);return row;
  }));
  if(!response.items.length)list.append(el("p","f4-bank-empty","Belum ada pengajuan."));
 }catch(error){status.textContent=error.message+" Pengajuan belum dapat dikirim.";list.append(el("p","f4-bank-empty","Layanan pengajuan belum tersedia."));}
}
async function submitRequest(event){
 event.preventDefault();if(!requestEnabled)return;
 const button=$("f4BankRequestSubmit"),amount=(0,__f4.globals.Number)($("f4BankPayoutAmount").value);
 const balance=(0,__f4.globals.Number)(memberStatement?.saldo||0);
 if(!__f4.globals.Number.isSafeInteger(amount)||amount<=0||amount>balance){$("f4BankRequestStatus").textContent="Nominal harus sesuai saldo terkonfirmasi.";return;}
 if(!requestNonce)requestNonce="PR"+__f4.globals.crypto.randomUUID().replace(/-/g,"");
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
 let main=$("f4BankPayoutMain");
 if(!main){
  main=el("div","f4-bank-payout-main");
  main.id="f4BankPayoutMain";
  const heading=page.querySelector(":scope > .f4-bank-screen-title");
  if(heading)heading.after(main);else page.prepend(main);
 }
 if(!$("f4BankManagerRequests")){
  const section=el("section","f4-bank-manager-requests");section.id="f4BankManagerRequests";
  const head=el("div","f4-bank-mobile-section-head");
  head.append(el("h3","","Pengajuan Anggota"));
  const refresh=el("button","f4-bank-refresh-button","Muat ulang");refresh.type="button";refresh.onclick=loadManagerRequests;
  head.append(refresh);
  const content=el("div","f4-bank-manager-request-list","Buka menu Pencairan untuk memuat pengajuan.");content.id="f4BankManagerRequestList";
  section.append(head,content);main.append(section);
 }
 if(!$("f4BankManualPayout")){
  const detail=el("details","f4-bank-manual-payout");detail.id="f4BankManualPayout";
  const summary=el("summary","f4-bank-manual-heading");
  const heading=el("span","f4-bank-manual-heading-main");
  heading.append(el("strong","","Pencairan manual"),el("small","","Tanpa pengajuan anggota"));
  summary.append(heading,bankUiSvg("chevron-right"));
  detail.append(summary);
  detail.append(el("p","f4-bank-manual-help","Untuk pembayaran yang sudah diserahkan. Pastikan belum tercatat sebelumnya."));
  const form=$("v9Form")?.closest(".f4-savings-payout");
  if(form)detail.append(form);
  detail.open=true;
  main.append(detail);
 }
 // Kedua kartu kiri mempunyai alur grid sendiri, tidak memengaruhi tinggi riwayat.
 for(const id of ["f4BankManagerRequests","f4BankManualPayout"]){
  const panel=$(id);
  if(panel&&panel.parentElement!==main)main.append(panel);
 }
 // Riwayat tetap terlihat walaupun formulir manual ditutup.
 const history=$("v9History")?.closest(".f4-savings-history");
 if(history&&history.parentNode!==page){
  history.classList.add("f4-bank-payout-ledger");
  page.append(history);
 }
 const savings=$("pageTabungan");
 if(savings&&!$("f4BankPayoutLink")){
  const go=el("button","f4-bank-secondary-action f4-bank-payout-link","Pengajuan pencairan");
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
  __f4.window.dispatchEvent(new __f4.globals.Event("f4-bank-data-changed"));
  for(const item of items){
   const card=el("article","f4-bank-manager-request");
   const top=el("div","f4-bank-manager-request-head");
   top.append(el("strong","",displayWargaName(item.nama)+" • "+(item.rumah||"—")),el("span","f4-bank-request-state is-"+item.status,item.status));
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
  note=__f4.window.prompt("Alasan penolakan (minimal 5 karakter):","")||"";
  if(note.length<5)return;
 }else if(!__f4.window.confirm("Setujui pengajuan "+item.nama+" sebesar "+rupiah(item.amount_rp)+"? Belum mengurangi saldo."))return;
 try{await api("/api/admin/bank/payout-requests/review",{id:item.id,action,note});await loadManagerRequests();}
 catch(error){__f4.window.alert(error.message);}
}
async function paidRequest(item){
 if(!__f4.window.confirm("Pastikan uang "+rupiah(item.amount_rp)+" sudah diserahkan ke "+item.nama+". Catat sebagai SUDAH DIBAYAR?"))return;
 try{
  await api("/api/admin/bank/payout-requests/paid",{id:item.id,paidOn:today()});
  await loadManagerRequests();
  if(typeof __f4.window.v9Load==="function")__f4.window.v9Load();
 }catch(error){__f4.window.alert("Belum berhasil mencatat pembayaran: "+error.message);}
}

/* Reuse existing public graph/report nodes, never duplicate their data or listeners. */
function restoreFeature(){
 for(const item of moved){
  if(item.node.id==="v22DocsPage")item.node.classList.add("hidden");
  if(item.anchor.parentNode)item.anchor.replaceWith(item.node);
 }
 moved=[];
 // The public homepage must not retain the album-only mode after member navigation.
 __f4.globals.document.querySelector("#v11Public .v17-public-main")?.classList.remove("v22-show-docs");
 __f4.globals.document.body.classList.remove("f4-member-feature");
}
function moveFeature(ids,target){
 restoreFeature();
 for(const id of ids){
  const node=$(id);if(!node?.parentNode)continue;
  const anchor=__f4.globals.document.createComment("Restore "+id);node.before(anchor);
  moved.push({node,anchor});target.append(node);
 }
}
const alertRows=result=>__f4.globals.Array.isArray(result?.data)?result.data:__f4.globals.Array.isArray(result?.items)?result.items:[];
/* Pengurus: Akses Cepat tetap di beranda HP; PC menggunakan rute yang sama pada sidebar. */
const adminShortcuts=[
 ["Cek & Sahkan","rekonsiliasi","shield-check"],
 ["Riwayat","bank-admin-history","history"],
 ["Debit/Kredit","bank-admin-cash","wallet"],
 ["Pencairan","bank-payout-admin","cash-out"],
 ["Harga Barang","master","tags"],
 ["Data Anggota","admin","users"],
 ["Saldo Warga","tabungan","coins"],
 ["Laporan","laporan","file-text"],
 ["Dokumentasi","bank-admin-docs","images"]
];
const adminShortcutPaths={
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/>',
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 "shield-check":'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m8 12 3 3 5-5"/>',
 history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
 wallet:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M16 15h2M7 3h12"/>',
 "cash-out":'<rect x="2.5" y="9" width="19" height="12" rx="2"/><circle cx="12" cy="15" r="2.5"/><path d="M12 7V2m-3 3 3-3 3 3"/>',
 tags:'<path d="m3 12 9-9h8v8l-9 9-8-8Z"/><circle cx="16" cy="7" r="1"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M17 5a3 3 0 0 1 0 6m1 5c2 0 3 2 3 4"/>',
 images:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
 "user-round":'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 coins:'<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 11v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5"/><path d="M4.5 16v2c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-2"/>' ,
 "file-text":'<path d="M6 2h8l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h5M8 12h8M8 16h8"/>'
};
function adminShortcut([name,route,iconName]){
 const button=el("button","f4-bank-admin-shortcut");
 button.type="button";button.dataset.bankAppRoute=route;button.setAttribute("aria-label",name);
 const circle=el("span","f4-bank-admin-shortcut-icon");
 const svg=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");
 svg.innerHTML=adminShortcutPaths[iconName]||adminShortcutPaths.wallet;
 circle.append(svg);button.append(circle,el("span","",name));
 button.onclick=()=>navigate(route);return button;
}
/* Four operational shortcuts; remaining routes share the existing admin drawer and desktop sidebar. */
const adminQuickRoutes=["rekonsiliasi","bank-admin-cash","master","tabungan"];
const adminDrawerRoutes=["dashboard","bank-admin-history","bank-payout-admin","admin","laporan","bank-admin-docs"];
const memberDrawerItems=[
 ["Beranda","dashboard","home"],["Tabungan","pribadi","wallet"],["Pencairan","bank-payout","cash-out"],
 ["Riwayat","bank-history","history"],["Laporan","bank-report","file-text"],
 ["Info Bank Sampah","bank-member-info","info"],["Dokumentasi","bank-member-docs","images"]
];
const adminRoutesInOrder=routes=>routes.map(route=>route==="dashboard"?["Beranda","dashboard","home"]:adminShortcuts.find(item=>item[1]===route)).filter(Boolean);
let bankDrawerFocus=null;
function getBankDrawer(){return __f4.globals.document.querySelector("#f4-direct-sidebar[data-bank-drawer]");}
function isBankDrawerOpen(){return !!getBankDrawer()?.classList.contains("f4-open");}
function ensureBankDrawer(){
 if(role!=="admin"&&role!=="member")return null;
 let side=getBankDrawer();if(side)return side;
 side=el("aside");side.id="f4-direct-sidebar";side.dataset.bankDrawer=role;
 side.setAttribute("aria-label","Navigasi Bank Sampah");side.setAttribute("aria-hidden","true");side.inert=true;
 const brand=el("div","f4-direct-brand"),logo=el("img"),brandName=el("div");
 logo.src="/assets/logo-flamboyan.svg?v=official-20261027-v2";logo.alt="Logo Flamboyan 4";
 brandName.append(el("h2","","Bank Sampah"),el("small","","Flamboyan 4"));
 brand.append(logo,brandName);side.append(brand,el("div","f4-direct-group-label","MENU"));
 for(const [name,route,iconName] of (role==="member"?memberDrawerItems:adminRoutesInOrder(adminDrawerRoutes))){
  const button=el("button");button.type="button";button.dataset.bankAppRoute=route;button.setAttribute("aria-label",name);
  const svg=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");
  svg.innerHTML=adminShortcutPaths[iconName]||adminShortcutPaths.wallet;
  button.append(svg,el("span","f4-direct-menu-label",name));button.onclick=()=>closeBankDrawer(route);side.append(button);
 }
 const backdrop=el("button");backdrop.id="f4-direct-sideback";backdrop.type="button";backdrop.hidden=true;backdrop.setAttribute("aria-label","Tutup menu");backdrop.onclick=()=>closeBankDrawer();
 side.f4Close=()=>{
  side.classList.remove("f4-open");side.inert=true;side.setAttribute("aria-hidden","true");backdrop.hidden=true;
  $("f4-mobile-menu")?.setAttribute("aria-expanded","false");
  const focus=bankDrawerFocus;bankDrawerFocus=null;if(focus?.isConnected)focus.focus({preventScroll:true});
 };
 __f4.globals.document.body.append(side,backdrop);
 return side;
}
function openBankDrawer(){
 if(!["admin","member"].includes(role)||roleType()!==role||__f4.window.matchMedia("(min-width:1024px)").matches)return;
 const side=ensureBankDrawer();if(!side)return;
 if(isBankDrawerOpen()){closeBankDrawer();return;}
 bankDrawerFocus=__f4.globals.document.activeElement;
 for(const button of side.querySelectorAll("[data-bank-app-route]"))button.setAttribute("aria-current",button.dataset.bankAppRoute===screen?"page":"false");
 side.inert=false;side.setAttribute("aria-hidden","false");side.classList.add("f4-open");$("f4-direct-sideback").hidden=false;
 const menu=$("f4-mobile-menu");menu?.setAttribute("aria-controls",side.id);menu?.setAttribute("aria-expanded","true");
 __f4.window.F4BankModalHistory?.registerOpen?.(side);
}
function closeBankDrawer(destination=null){
 const side=getBankDrawer();
 const requestedRole=role;
 const after=()=>{if(destination&&roleType()===requestedRole&&["admin","member"].includes(requestedRole))navigate(destination);};
 if(!isBankDrawerOpen()){after();return;}
 if(__f4.window.F4BankModalHistory?.closeAndThen)__f4.window.F4BankModalHistory.closeAndThen(side,after);
 else{side.f4Close();after();}
}
/* The legacy v16BuildNav() recreates nav children during page transitions.
   Observe only that list, and restore secondary routes idempotently. */
let adminNavList=null,adminNavObserver=null;
function ensureDesktopAdminSidebar(){
 if(role!=="admin")return;
 const list=$("v16NavList");if(!list)return;
 if(adminNavList!==list){
  adminNavObserver?.disconnect();
  adminNavList=list;
  adminNavObserver=new __f4.globals.MutationObserver(()=>{
   if(role==="admin")ensureDesktopAdminSidebar();
  });
  adminNavObserver.observe(list,{childList:true});
 }
 const anchor=list.querySelector('[data-group="home"]');
 if(!anchor)return;
 const oldLinks=[...list.querySelectorAll(".f4-bank-desktop-nav-link")];
 const dividers=[...list.querySelectorAll(".f4-bank-nav-divider")];
 if(oldLinks.length===adminShortcuts.length&&dividers.length===1)return;
 oldLinks.forEach(link=>link.remove());
 dividers.forEach(divider=>divider.remove());
 const items=__f4.globals.document.createDocumentFragment();
 for(const [name,route,iconName] of adminShortcuts){
  if(route==="master"){
   const divider=el("div","f4-bank-nav-divider","LAINNYA");
   divider.setAttribute("role","presentation");items.append(divider);
  }
  const button=el("button","v16-item f4-bank-desktop-nav-link");
  button.type="button";button.dataset.bankAppRoute=route;
  button.setAttribute("aria-label",name);
  const svg=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 24 24");
  svg.setAttribute("aria-hidden","true");
  svg.innerHTML=adminShortcutPaths[iconName]||adminShortcutPaths.wallet;
  button.append(svg,el("span","f4-bank-nav-label",name));
  button.onclick=()=>navigate(route);
  const selected=route===screen;
  button.classList.toggle("active",selected);
  button.setAttribute("aria-current",selected?"page":"false");
  items.append(button);
 }
 anchor.after(items);
}
let adminProgressAnchor=null,adminProgressNode=null;
function f4BankChevronIcon(){
 const svg=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");
 svg.setAttribute("aria-hidden","true");
 svg.innerHTML='<path d="m9 18 6-6-6-6"/>';
 return svg;
}
function adminOperation(label,detail,route,primary){
 const button=el("button","f4-bank-admin-operation"+(primary?" is-primary":""));
 button.type="button";button.dataset.bankAppRoute=route;
 const icon=el("span","f4-bank-admin-operation-icon");
 // Sama persis dengan Setoran (daur ulang) dan Penjualan (keranjang) di menu bawah.
 icon.append(route==="setoran"?image("bank.svg"):route==="rekonsiliasi"?image("book.svg"):bankSaleCartIcon());
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
/* Pengelola home: three real D1/public read sources; never recalculate a
   bank-wide total from the last 300 personal/transaction history rows. */
let adminInsightVersion=0,adminInsightLoadedAt=0,adminInsightPending=null;
let adminInsightReport=null,adminInsightPublic=null,adminInsightSchedule=null;
let adminInsightUnit="kg",adminInsightRange="month";
const f4AdminNumeric=value=>__f4.globals.Math.max(0,__f4.globals.Number.isFinite((0,__f4.globals.Number)(value))?(0,__f4.globals.Number)(value):0);
function adminInsightMount(home){
 if(roleType()!=="admin"||!home)return;
 let wrap=$("f4BankAdminInsights");
 if(!wrap){
  wrap=el("section","f4-bank-admin-insights");wrap.id="f4BankAdminInsights";
  const row=el("div","f4-bank-admin-insight-row");
  const chart=el("section","f4-bank-admin-insight-panel f4-bank-admin-insight-chart");
  chart.id="f4BankAdminDepositChart";
  const head=el("div","f4-bank-admin-insight-head");
  head.append(el("h3","","Perkembangan Setoran Warga"));
  const units=el("div","f4-bank-admin-insight-switch");
  for(const [key,label] of [["kg","Kg"],["rp","Rp"]]){
   const btn=el("button","",label);btn.type="button";btn.dataset.unit=key;
   btn.onclick=()=>{adminInsightUnit=key;adminInsightDraw();};
   units.append(btn);
  }
  head.append(units);
  const bars=el("div","f4-bank-admin-insight-bars");
  bars.id="f4BankAdminDepositBars";bars.setAttribute("role","img");
  bars.setAttribute("aria-label","Grafik setoran Bank Sampah");
  const chartFoot=el("div","f4-bank-admin-chart-foot");
  chartFoot.append(el("small","f4-bank-admin-chart-note","Data setoran sah dan estimasi tercatat terpisah."));
  chart.append(head,bars,chartFoot);
  const schedule=el("section","f4-bank-admin-insight-panel f4-bank-admin-insight-schedule");
  schedule.id="f4BankAdminScheduleCard";
  const scheduleHead=el("div","f4-bank-admin-insight-head");
  scheduleHead.append(el("h3","","Jadwal Setor Sampah"));
  const action=el("button","f4-bank-admin-mini-action","Atur jadwal");
  action.type="button";action.onclick=()=>navigate("master");scheduleHead.append(action);
  const scheduleMain=el("div","f4-bank-admin-schedule-main");
  const dateBox=el("div","f4-bank-admin-schedule-databox");
  dateBox.setAttribute("aria-hidden","true");
  const dateNum=el("strong","f4-bank-admin-schedule-num","–");
  dateNum.id="f4BankAdminScheduleNum";
  const monthNum=el("span","f4-bank-admin-schedule-month","");
  monthNum.id="f4BankAdminScheduleMonth";
  dateBox.append(dateNum,monthNum);
  const scheduleCopy=el("div","f4-bank-admin-schedule-copy");
  const date=el("strong","f4-bank-admin-next-date","Memuat jadwal…");
  date.id="f4BankAdminNextDate";
  const scheduleMeta=el("div","f4-bank-admin-schedule-meta");
  const cycle=el("span","f4-bank-admin-schedule-cycle","Jadwal aktif");
  cycle.id="f4BankAdminScheduleCycle";
  const countdown=el("span","f4-bank-admin-schedule-countdown","");
  countdown.id="f4BankAdminScheduleCountdown";
  countdown.hidden=true;
  scheduleMeta.append(cycle,countdown);
  scheduleCopy.append(date,scheduleMeta);
  scheduleMain.append(dateBox,scheduleCopy);
  schedule.append(scheduleHead,scheduleMain);
  const right=el("div","f4-bank-admin-insight-right");
  right.append(schedule);
  const stages=el("section","f4-bank-admin-insight-panel f4-bank-admin-insight-stages");
  stages.id="f4BankAdminStages";
  const stagesHead=el("div","f4-bank-admin-insight-head");
  stagesHead.append(el("h3","","Tahap Bank Sampah"));
  const view=el("button","f4-bank-admin-mini-action","Lihat semua");
  view.type="button";view.onclick=()=>navigate("bank-admin-progress");stagesHead.append(view);
  const overview=el("div","f4-bank-admin-stage-overview","Memuat perkembangan…");
  overview.id="f4BankAdminStageOverview";
  stages.append(stagesHead,overview);
  right.append(stages);row.append(chart,right);
  wrap.append(row);home.append(wrap);
 }
 if(adminInsightLoadedAt&&__f4.globals.Date.now()-adminInsightLoadedAt<90000)return;
 adminInsightFetch();
}
function adminInsightDraw(){
 const host=$("f4BankAdminDepositBars");if(!host)return;
 const group=$("f4BankAdminDepositChart");
 group?.querySelectorAll("[data-unit]").forEach(b=>{
  const active=b.dataset.unit===adminInsightUnit;
  b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",(0,__f4.globals.String)(active));
 });
 if(!adminInsightReport){
  host.replaceChildren(el("p","f4-bank-admin-insight-empty","Belum ada data grafik yang dapat ditampilkan."));
  return;
 }
 const keys=adminInsightUnit==="kg"?["beratKg","pendingWeightKg"]:["hasilPenjualan","pendingEstimateRp"];
 const map=new __f4.globals.Map((__f4.globals.Array.isArray(adminInsightReport.bulanan)?adminInsightReport.bulanan:[])
  .filter(r=>/^\d{4}-\d{2}$/.test((0,__f4.globals.String)(r.periode||"")))
  .map(r=>[r.periode,r]));
 const current=today().slice(0,7),year=+current.slice(0,4),month=+current.slice(5,7);
 const months=[];
 for(let index=5;index>=0;index--){
  const d=new __f4.globals.Date(__f4.globals.Date.UTC(year,month-index-1,15));
  months.push(d.toISOString().slice(0,7));
 }
 const rows=months.map(key=>({
  key,label:new __f4.globals.Intl.DateTimeFormat("id-ID",{timeZone:"UTC",month:"short"})
   .format(new __f4.globals.Date(key+"-15T12:00:00Z")),
  vals:keys.map(k=>f4AdminNumeric(map.get(key)?.[k]))
 }));
 const max=__f4.globals.Math.max(.001,...rows.map(x=>x.vals[0]+x.vals[1]));
 host.replaceChildren();let total=0;
 for(const item of rows){
  const n=item.vals[0]+item.vals[1];total+=n;
  const column=el("div","f4-bank-admin-insight-column");
  const label=adminInsightUnit==="kg"?f4PrivateShort(n,"kg")+" kg":f4PrivateShort(n,"rp");
  column.append(el("strong","",n>0?label:"—"));
  const rail=el("span","f4-bank-admin-insight-rail");
  for(const [i,val] of item.vals.entries()){
   const piece=el("i",i?"is-estimate":"is-confirmed");
   piece.style.height=n&&val?__f4.globals.Math.max(3,val/max*100)+"%":"0%";rail.append(piece);
  }
  column.append(rail,el("small","",item.label));
  column.title=item.key+" • Sah "+item.vals[0]+", estimasi "+item.vals[1];
  host.append(column);
 }
 host.setAttribute("aria-label","Perkembangan setoran warga 6 bulan terakhir, "+
  (adminInsightUnit==="kg"?"berat":"rupiah")+"; sah dan estimasi ditampilkan terpisah.");
 const note=group?.querySelector(".f4-bank-admin-chart-note");
 if(note)note.textContent=total>0?
  "Hijau: sudah terjual · Kuning: belum terjual / menunggu pengesahan":
  "Belum ada setoran pada enam bulan terakhir.";
}
function adminInsightScheduleDraw(){
 const d=adminInsightSchedule,day=$("f4BankAdminNextDate"),cycle=$("f4BankAdminScheduleCycle");
 const dateNum=$("f4BankAdminScheduleNum"),monthNum=$("f4BankAdminScheduleMonth");
 const countdown=$("f4BankAdminScheduleCountdown");
 if(!day||!cycle||!dateNum||!monthNum||!countdown)return;
 const setDate=(date)=>{
  if(!date||!__f4.globals.Number.isFinite(date.getTime())){
   dateNum.textContent="–";monthNum.textContent="";
   countdown.hidden=true;countdown.textContent="";return;
  }
  dateNum.textContent=(0,__f4.globals.String)(date.getUTCDate());
  monthNum.textContent=new __f4.globals.Intl.DateTimeFormat("id-ID",{timeZone:"UTC",month:"short"}).format(date);
  const present=new __f4.globals.Date(today()+"T12:00:00Z");
  const diff=__f4.globals.Math.round((date.getTime()-present.getTime())/86400000);
  if(!__f4.globals.Number.isFinite(diff)){countdown.hidden=true;countdown.textContent="";return;}
  countdown.hidden=false;
  countdown.textContent=diff===0?"Hari ini":diff===1?"Besok":diff>1?diff+" hari lagi":"Jadwal terlewat";
 };
 if(!d||!__f4.globals.Number.isInteger((0,__f4.globals.Number)(d.weekday))||(0,__f4.globals.Number)(d.weekday)<0||(0,__f4.globals.Number)(d.weekday)>6){
  day.textContent="Jadwal belum tersedia";cycle.textContent="Periksa pengaturan jadwal";
  setDate(null);return;
 }
 const days=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
 const freq=(0,__f4.globals.String)(d.frequency||"weekly");
 const next=(0,__f4.globals.String)(d.nextOccurrence||d.next_occurrence||"");
 const label=days[(0,__f4.globals.Number)(d.weekday)];
 const valid=/^\d{4}-\d{2}-\d{2}$/.test(next);
 const observed=valid?new __f4.globals.Date(next+"T12:00:00Z"):null;
 let target=observed&&__f4.globals.Number.isFinite(observed.getTime())?observed:null;
 if(!target&&freq==="weekly"){
  const t=new __f4.globals.Date(today()+"T12:00:00Z");
  t.setUTCDate(t.getUTCDate()+((0,__f4.globals.Number)(d.weekday)-t.getUTCDay()+7)%7);
  target=t;
 }
 if(target){
  day.textContent=new __f4.globals.Intl.DateTimeFormat("id-ID",{timeZone:"UTC",weekday:"long",
   day:"numeric",month:"short",year:"numeric"}).format(target);
 }else day.textContent="Tanggal berikutnya belum tersedia";
 setDate(target);
 cycle.textContent=freq==="weekly"?"Setiap "+label:
  freq==="biweekly"?"Setiap 2 minggu":freq==="monthly"?"Setiap bulan":"Jadwal: "+label;
}
function adminInsightStagesDraw(){
 const host=$("f4BankAdminStageOverview");if(!host)return;
 const rows=__f4.globals.Array.isArray(adminInsightPublic?.progress)?adminInsightPublic.progress:[];
 const finished=entry=>/selesai|tuntas|rampung/i.test((0,__f4.globals.String)(entry.status||""));
 const ongoing=entry=>!finished(entry)&&/berjalan|proses|aktif|dikerjakan/i.test((0,__f4.globals.String)(entry.status||""));
 const done=rows.filter(finished).length;
 const active=rows.filter(ongoing).length;
 // Labels stay concise on the home screen; full titles remain accessible by hover and on Lihat semua.
 const shortTitle=(raw)=>{
  const title=(0,__f4.globals.String)(raw||"").trim();
  if(/sosialisasi/i.test(title))return "Sosialisasi";
  if(/perancangan|alur kerja|administrasi/i.test(title))return "Alur kerja";
  if(/wadah|pembuatan/i.test(title))return "Wadah";
  if(/persiapan|pembersihan/i.test(title))return "Persiapan";
  return title.length>20?title.slice(0,18).trimEnd()+"…":title;
 };
 const compact=el("div","f4-bank-admin-stage-compact");
 const progressText=el("div","f4-bank-admin-stage-overline");
 const amount=el("strong","",rows.length?done+"/"+rows.length+" tahap selesai":"Belum ada tahap");
 const state=el("span","",rows.length?
  (active?active+" sedang berjalan":done===rows.length?"Progres tuntas":"Progres kegiatan"):
  "Menunggu data");
 progressText.append(amount,state);
 const steps=el("ol","f4-bank-admin-stage-flow");
 steps.setAttribute("aria-label","Urutan tahapan Bank Sampah");
 for(const [index,item] of rows.slice(0,4).entries()){
  const status=(0,__f4.globals.String)(item.status||"Tercatat");
  const isDone=finished(item),isActive=ongoing(item);
  const full=(0,__f4.globals.String)(item.title||item.stage||"Tahap "+(index+1));
  const step=el("li","f4-bank-admin-stage-flow-item "+(isDone?"is-done":isActive?"is-active":"is-waiting"));
  step.title=full+" — "+status;
  step.setAttribute("aria-label","Tahap "+(index+1)+": "+full+" — "+status);
  const dot=el("span","f4-bank-admin-stage-flow-dot");
  dot.setAttribute("aria-hidden","true");
  if(isDone){
   const icon=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
   icon.setAttribute("viewBox","0 0 24 24");
   const path=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","path");
   path.setAttribute("d","m5 12 4 4L19 6");
   path.setAttribute("stroke","currentColor");path.setAttribute("stroke-width","2.7");
   path.setAttribute("fill","none");path.setAttribute("stroke-linecap","round");
   path.setAttribute("stroke-linejoin","round");icon.append(path);dot.append(icon);
  }else dot.textContent=(0,__f4.globals.String)(index+1);
  const name=el("span","f4-bank-admin-stage-flow-label",shortTitle(full));
  step.append(dot,name);steps.append(step);
 }
 if(!rows.length)steps.append(el("li","f4-bank-admin-stage-empty","Belum ada tahapan untuk ditampilkan."));
 if(rows.length>4){
  const more=el("small","f4-bank-admin-stage-extra","+"+(rows.length-4)+" tahap lain di Lihat semua");
  compact.append(progressText,steps,more);
 }else compact.append(progressText,steps);
 host.replaceChildren(compact);
}
function adminInsightFetch(force=false){
 if(roleType()!=="admin")return;
 if(adminInsightPending&&!force)return;
 const version=++adminInsightVersion;
 const tasks=__f4.globals.Promise.allSettled([
  api("/api/v2/public/bank/report"),
  api("/api/v2/public/bank"),
  api("/api/public/bank/weighing-schedule")
 ]).then(results=>{
  if(version!==adminInsightVersion||roleType()!=="admin")return;
  adminInsightReport=results[0].status==="fulfilled"?results[0].value:null;
  adminInsightPublic=results[1].status==="fulfilled"?results[1].value:null;
  adminInsightSchedule=results[2].status==="fulfilled"?results[2].value:null;
  adminInsightLoadedAt=__f4.globals.Date.now();
  adminInsightDraw();adminInsightScheduleDraw();adminInsightStagesDraw();
 }).finally(()=>{if(version===adminInsightVersion)adminInsightPending=null;});
 adminInsightPending=tasks;
}
function ensureAdminHome(){
 if(role!=="admin")return;
 ensureDesktopAdminSidebar();
 const home=$("f4BankAppHome");if(!home)return;
 // The shared navbar owns the account greeting.
 $("f4BankAdminIntro")?.remove();
 if(!$("f4BankAdminOperations")){
  const actions=el("div","f4-bank-admin-operations");actions.id="f4BankAdminOperations";
  actions.append(
   adminOperation("Catat setoran","Berat per jenis","setoran",true),
   adminOperation("Penjualan","Hasil dari lapak","penjualan",false)
  );
  $("f4BankAppAdminHero")?.after(actions);
 }
 $("f4BankAdminNext")?.remove();
 // Akses cepat sama untuk PC dan HP, dengan grid responsif masing-masing.
 let shortcuts=$("f4BankAdminShortcuts");
 if(!shortcuts){
  shortcuts=el("section","f4-bank-admin-shortcuts");shortcuts.id="f4BankAdminShortcuts";
  shortcuts.append(el("h2","","Akses Cepat"));
  const grid=el("div","f4-bank-admin-shortcut-grid");
  grid.append(...adminRoutesInOrder(adminQuickRoutes).map(adminShortcut));
  shortcuts.append(grid);
  $("f4BankAdminOperations")?.after(shortcuts);
 }
 ensureBankDrawer();
 adminInsightMount(home);
 
 
}
function showAdminProgress(){
 const page=ensureScreen("bank-admin-progress","Perkembangan Bank Sampah");
 const progress=$("v17Perkembangan");
 if(progress&&progress.parentElement!==page){
  if(!adminProgressAnchor||!adminProgressAnchor.isConnected){
   adminProgressAnchor=__f4.globals.document.createComment("Restore public Bank Sampah progress");
   progress.before(adminProgressAnchor);
  }
  adminProgressNode=progress;page.append(progress);
 }
 page.classList.remove("hidden");
 if(typeof __f4.window.v17LoadPublic==="function")__f4.window.v17LoadPublic();
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
  b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",(0,__f4.globals.String)(active));
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
  const dateField=el("label","f4-bank-own-field");
  dateField.append(el("span","","Tanggal"),__f4.globals.Object.assign(el("input"),{type:"date",required:true,value:today()}));
  dateField.querySelector("input").id="f4BankOwnDate";
  const fields=el("div","f4-bank-own-fields");fields.append(dateField);
  const detail=el("div","f4-bank-own-detail");
  const head=el("div","f4-bank-own-detail-head");
  head.append(el("strong","","Rincian sampah"));
  const add=el("button","f4-compact-add","Tambah jenis");add.type="button";
  add.onclick=()=>addOwnItemRow();
  detail.append(head);
  const rows=el("div","f4-bank-own-lines f4-compact-rows");rows.id="f4BankOwnLines";detail.append(rows,add);
  const note=el("label","f4-bank-own-field");note.append(el("span","","Catatan (opsional)"));
  const noteInput=el("input");noteInput.id="f4BankOwnNote";noteInput.maxLength=200;noteInput.placeholder="Asal sampah / keterangan stok";
  note.append(noteInput);
  const save=el("button","f4-bank-gold-action","Simpan Setoran Bank");save.type="submit";
  const status=el("p","f4-bank-own-status");status.id="f4BankOwnStatus";status.setAttribute("role","status");
  const weightTotal=el("div","f4-bank-own-weight-summary");
  const weightValue=el("strong","","0 kg");weightValue.id="f4BankOwnWeightTotal";
  weightTotal.append(el("small","","Total berat"),weightValue);
  const main=el("div","f4-bank-own-main"),side=el("div","f4-bank-own-side");
  main.append(detail);side.append(fields,weightTotal,note,save,status);
  form.append(main,side);
  form.onsubmit=submitOwnDeposit;tabs.after(form);
 }
 chooseOwnMode(ownFormMode);
}

function refreshOwnWeightTotal(){
 const host=$("f4BankOwnLines"),value=$("f4BankOwnWeightTotal");
 if(!host||!value)return;
 const sum=[...host.querySelectorAll('input[data-own-weight="1"]')]
  .reduce((total,input)=>total+__f4.globals.Math.max(0,(0,__f4.globals.Number)(input.value)||0),0);
 // Keep decimal precision stable without changing the stored gram calculation.
 value.textContent=(0,__f4.globals.Number)(sum.toFixed(3)).toLocaleString("id-ID",{maximumFractionDigits:3})+" kg";
}
function addOwnItemRow(){
 const lines=$("f4BankOwnLines");if(!lines)return;
 if(lines.childElementCount>=30)return;
 const row=el("div","f4-bank-own-line f4-compact-row");
 const select=el("select");select.required=true;select.setAttribute("aria-label","Jenis sampah");
 select.add(new __f4.globals.Option("Pilih jenis",""));
 for(const item of ownCatalog||[])select.add(new __f4.globals.Option(item.name,item.id));
  const weight=el("input");weight.type="number";weight.step="0.001";weight.min="0.001";
 weight.max="10000";weight.required=true;weight.dataset.ownWeight="1";weight.placeholder="Berat (kg)";
 weight.setAttribute("aria-label","Berat sampah kilogram");
 weight.addEventListener("input",refreshOwnWeightTotal);
 const del=el("button","f4-compact-remove");del.type="button";
 del.title="Hapus jenis";del.setAttribute("aria-label","Hapus jenis");
 del.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';del.onclick=()=>{row.remove();if(!lines.childElementCount)addOwnItemRow();refreshOwnWeightTotal();};
 const amountGroup=el("div","f4-compact-entry-group");
 amountGroup.append(weight,del);
 row.append(select,amountGroup);lines.append(row);refreshOwnWeightTotal();
}
async function loadOwnCatalog(){
 if(!$("f4BankOwnDepositForm")||ownFormMode!=="bank")return;
 if(!ownCatalog){
  const status=$("f4BankOwnStatus");if(status)status.textContent="Memuat jenis barang...";
  try{
   const result=await api("/api/v2/admin/bank/catalog");
   ownCatalog=(result.data||[]).filter(x=>(0,__f4.globals.Number)(x.active)===1)
    .map(x=>({id:(0,__f4.globals.String)(x.id),name:x.name,priceRpPerKg:(0,__f4.globals.Number)(x.priceRpPerKg)||0}));if(status)status.textContent="";
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
  const kg=(0,__f4.globals.Number)(row.querySelector("input")?.value);
  return {itemId:row.querySelector("select")?.value,grams:__f4.globals.Math.round(kg*1000),kg};
 });
 const status=$("f4BankOwnStatus");
 if(!items.length||items.some(x=>!x.itemId||!__f4.globals.Number.isFinite(x.kg)||x.kg<=0||!__f4.globals.Number.isSafeInteger(x.grams)||x.grams<1)){
  status.textContent="Lengkapi jenis dan berat barang.";return;
 }
 if(new __f4.globals.Set(items.map(x=>x.itemId)).size!==items.length){status.textContent="Jenis sampah yang sama cukup satu baris.";return;}
 if(!__f4.window.confirm("Catat setoran milik Bank sebagai stok? Belum menambah kas sebelum penjualan sah."))return;
 if(!ownRequestKey)ownRequestKey="own"+__f4.globals.crypto.randomUUID().replace(/-/g,"");
 button.disabled=true;status.textContent="Menyimpan stok...";
 try{
  const res=await api("/api/v2/admin/bank/own-deposits",{
   requestKey:ownRequestKey,depositedOn:date,
   items:items.map(({itemId,grams})=>({itemId,grams})),
   note:$("f4BankOwnNote")?.value.trim()||""
  });
  status.textContent=res.duplicate?"Setoran sudah tercatat.":"Setoran Bank tercatat sebagai stok, belum menambah kas.";
  ownRequestKey="";form.reset();$("f4BankOwnDate").value=today();
  $("f4BankOwnLines")?.replaceChildren();addOwnItemRow();
  adminOverview=null;updateDashboard();
 }catch(error){status.textContent=error.message||"Setoran gagal disimpan.";}
 finally{button.disabled=false;}
}
let adminCashTab="in";
function ensureCashExpenseForm(){
 const host=$("f4BankCashExpense"),form=$("v10ExpenseForm");
 if(!host||!form)return;
 if(form.parentElement!==host){
  host.append(form);
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
 if(submit){
  submit.textContent="Simpan Pengeluaran";
  submit.before(extras);
  const actions=el("div","f4-bank-expense-actions");
  const cancel=el("button","f4-bank-expense-cancel","Batal");
  cancel.type="button";
  cancel.onclick=closeCashExpenseDialog;
  actions.append(cancel,submit);
  form.append(actions);
 }else form.append(extras);
}
function closeCashExpenseDialog(){
 const dialog=$("f4BankCashExpenseDialog");
 if(dialog?.open)dialog.close();
}
function openCashExpenseDialog(){
 const dialog=$("f4BankCashExpenseDialog");
 if(!dialog)return;
 ensureCashExpenseForm();
 if(!dialog.open)dialog.showModal();
 __f4.window.v10LoadBiaya?.();
 $("v10Type")?.focus({preventScroll:true});
}
function showAdminCash(){
 const page=ensureScreen("bank-admin-cash","Debit/Kredit");
 let body=$("f4BankAdminCashBody");
 if(!body){
  body=el("div","f4-bank-admin-cash-body");body.id="f4BankAdminCashBody";
  const tabs=el("div","f4-bank-admin-history-tabs f4-bank-admin-cash-tabs");tabs.id="f4BankCashTabs";
  for(const [key,label] of [["in","Pemasukan"],["out","Pengeluaran"]]){
   const button=el("button","f4-bank-admin-history-tab",label);
   button.type="button";button.dataset.cashTab=key;
   button.onclick=()=>{adminCashTab=key;loadAdminCash();};
   tabs.append(button);
  }
  const toolbar=el("div","f4-bank-cash-toolbar");toolbar.append(tabs);
  const stats=el("div","f4-bank-admin-cash-stats");
  const panels=el("div","f4-bank-admin-cash-panels");
  for(const [key,label] of [["in","Pemasukan"],["out","Pengeluaran"]]){
   const panel=el("section","f4-bank-admin-cash-panel");
   panel.dataset.cashPanel=key;
   const heading=el("div","f4-bank-cash-panel-heading");
   heading.append(el("h3","f4-bank-admin-cash-panel-title",label));
   if(key==="out"){
    const trigger=el("button","f4-bank-cash-add-button");
    trigger.id="f4BankCashExpenseOpen";
    trigger.type="button";
    trigger.append(bankUiSvg("plus"),__f4.globals.document.createTextNode("Catat"));
    trigger.setAttribute("aria-label","Catat pengeluaran");
    trigger.title="Catat pengeluaran";
    trigger.onclick=openCashExpenseDialog;
    heading.append(trigger);
   }
   panel.append(heading);
   const ledger=el("div","f4-bank-admin-cash-table","Memuat mutasi kas...");
   ledger.dataset.cashList=key;
   panel.append(ledger);panels.append(panel);
  }
  const dialog=el("dialog","f4-bank-cash-expense-modal");
  dialog.id="f4BankCashExpenseDialog";
  dialog.setAttribute("aria-labelledby","f4BankCashExpenseTitle");
  const header=el("div","f4-bank-expense-modal-header");
  const title=el("h2","","Catat Pengeluaran");title.id="f4BankCashExpenseTitle";
  const close=el("button","f4-bank-expense-close");close.type="button";
  close.setAttribute("aria-label","Tutup formulir");
  close.append(bankUiSvg("x"));close.onclick=closeCashExpenseDialog;
  header.append(title,close);
  const expense=el("section","f4-bank-cash-expense-section");
  expense.id="f4BankCashExpense";
  dialog.append(header,expense);
  dialog.addEventListener("click",event=>{
   if(event.target!==dialog)return;
   const rect=dialog.getBoundingClientRect();
   if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom){
    closeCashExpenseDialog();
   }
  });
  dialog.addEventListener("close",()=>{$("f4BankCashExpenseOpen")?.focus({preventScroll:true});});
  body.append(toolbar,stats,panels);
  page.append(body,dialog);
 }
 ensureCashExpenseForm();
 page.classList.remove("hidden");loadAdminCash();
}
async function loadAdminCash(){
 const page=$("f4BankAdminCashBody");if(!page)return;
 const targets=[...page.querySelectorAll("[data-cash-list]")];
 targets.forEach(target=>{target.textContent="Memuat mutasi kas...";});
 page.querySelectorAll("[data-cash-tab]").forEach(button=>{
  const active=button.dataset.cashTab===adminCashTab;
  button.classList.toggle("is-active",active);button.setAttribute("aria-pressed",(0,__f4.globals.String)(active));
 });
 page.querySelectorAll("[data-cash-panel]").forEach(panel=>{
  panel.classList.toggle("is-active",panel.dataset.cashPanel===adminCashTab);
 });
 try{
  const res=await api("/api/v2/admin/bank/cash?limit=300");
  const all=(res.data||[]).filter(x=>x.status==="aktif").sort((a,b)=>
   (0,__f4.globals.String)(b.occurred_on||"").localeCompare((0,__f4.globals.String)(a.occurred_on||"")));
  const incoming=all.reduce((n,x)=>n+(0,__f4.globals.Number)(x.cash_in_rp||0),0);
  const outgoing=all.reduce((n,x)=>n+(0,__f4.globals.Number)(x.cash_out_rp||0),0);
  page.querySelector(".f4-bank-admin-cash-stats").replaceChildren(...[
   ["Pemasukan",incoming],["Pengeluaran",outgoing],["Selisih mutasi",incoming-outgoing]
  ].map(([name,value])=>{
   const node=el("div","f4-bank-admin-cash-stat");
   node.append(el("small","",name),el("strong","",rupiah(value)));return node;
  }));
  for(const key of ["in","out"]){
   const target=page.querySelector('[data-cash-list="'+key+'"]');
   if(!target)continue;
   const rows=all.filter(x=>(0,__f4.globals.Number)(key==="in"?x.cash_in_rp:x.cash_out_rp)>0);
   if(!rows.length){
    target.textContent=key==="in"?"Belum ada pemasukan.":"Belum ada pengeluaran.";
    continue;
   }
   const table=el("table","f4-bank-admin-cash-ledger");
   const thead=el("thead"),heading=el("tr");
   for(const label of ["Tanggal","Keterangan","Pos","Nominal"])heading.append(el("th","",label));
   thead.append(heading);table.append(thead);
   const tbody=el("tbody");
   for(const item of rows){
    const tr=el("tr");
    for(const value of [
     item.occurred_on||"—",item.note||item.transaction_type||"—",
     item.fund_position||"—",rupiah(key==="in"?item.cash_in_rp:item.cash_out_rp)
    ])tr.append(el("td","",value));
    tbody.append(tr);
   }
   table.append(tbody);target.replaceChildren(table);
  }
 }catch(error){
  targets.forEach(target=>{target.textContent="Mutasi kas belum dapat dibuka: "+error.message;});
 }
}
__f4.window.addEventListener("f4-bank-expense-saved",()=>{
 closeCashExpenseDialog();
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
  const anchor=__f4.globals.document.createComment("Kembalikan "+id);
  node.before(anchor);adminMediaRestore.push({node,anchor});
 }
 container.append(node);node.classList.remove("hidden");
}
let bankAdminDocsLastRefresh=0;
let bankAdminDocsRefreshPromise=null;
function showAdminDocumentation(which="albums"){
 const page=ensureScreen("bank-admin-docs","Dokumentasi");
 // Same heading markup as the member Dokumentasi screen.
 page.querySelector(":scope > .f4-bank-screen-title")?.remove();
 if(!page.querySelector(":scope > .f4-member-feature-header")){
  const header=el("header","f4-member-feature-header");
  const title=el("div","");
  title.append(el("h2","","Dokumentasi"));
  header.append(title);page.prepend(header);
 }
 let tabs=$("f4BankAdminDocsTabs");
 if(!tabs){
  tabs=el("div","f4-bank-admin-history-tabs");tabs.id="f4BankAdminDocsTabs";
  page.append(tabs);
 }
 let content=$("f4BankAdminDocsContent");
 if(!content){content=el("div","f4-bank-admin-doc-content");content.id="f4BankAdminDocsContent";page.append(content);}
 __f4.window.f4BankRenderDocumentation?.();
 adminMediaMove("v22DocsPage",content);
 adminMediaMove("v17Inventaris",content);
 const album=$("v22DocsPage"),inventory=$("v17Inventaris");
 tabs.replaceChildren(...[["albums","Album"],["inventory","Inventaris"]].map(([key,label])=>{
  const button=el("button","f4-bank-admin-history-tab"+(which===key?" is-active":""),label);
  button.type="button";button.setAttribute("aria-pressed",(0,__f4.globals.String)(which===key));
  button.onclick=()=>showAdminDocumentation(key);return button;
 }));
 tabs.hidden=false;
 if(album)album.hidden=which!=="albums";
 if(inventory)inventory.hidden=which!=="inventory";
 page.classList.remove("hidden");
 // This screen reuses the public album/inventory nodes. Refresh their D1-backed
 // source when entering the manager screen; otherwise a fresh login can show
 // empty albums or an indefinitely pending inventory until the public page opens.
 if(!bankAdminDocsRefreshPromise&&__f4.globals.Date.now()-bankAdminDocsLastRefresh>10000){
  const refresh=__f4.window.v17LoadPublic;
  if(typeof refresh==="function"){
   bankAdminDocsRefreshPromise=__f4.globals.Promise.resolve().then(()=>refresh()).then(()=>{
    bankAdminDocsLastRefresh=__f4.globals.Date.now();
    __f4.window.f4BankRenderDocumentation?.();
   }).catch(error=>{
    const target=which==="inventory"?$("v17Inventory"):$("v22DocList");
    if(target&&!target.children.length)target.textContent="Gagal memuat data. Coba buka kembali halaman ini.";
    __f4.globals.console.error("Gagal memperbarui dokumentasi Bank Sampah",error);
   }).finally(()=>{bankAdminDocsRefreshPromise=null;});
  }
 }
}
function showAdminHistory(selected="setoran"){
 const page=ensureScreen("bank-admin-history","Riwayat");
 const title=page.querySelector(":scope > h2");
 if(title)title.hidden=true;
 page.dataset.mobileActive=selected;
 // Desktop: two equally tall history panels. Phone: a single selected panel.
 let controls=$("f4BankAdminHistoryControls");
 if(!controls){
  controls=el("div","f4-bank-admin-history-controls");
  controls.id="f4BankAdminHistoryControls";
  page.append(controls);
 }
 let tabs=$("f4BankAdminHistoryTabs");
 if(!tabs){
  tabs=el("div","f4-bank-admin-history-tabs");tabs.id="f4BankAdminHistoryTabs";
  tabs.setAttribute("role","tablist");
  tabs.setAttribute("aria-label","Jenis riwayat");
  for(const [key,label,route] of [
   ["setoran","Setoran","bank-admin-history"],
   ["penjualan","Penjualan","bank-admin-sale-history"]
  ]){
   const button=el("button","f4-bank-admin-history-tab",label);
   button.id="f4BankAdminHistoryTab-"+key;
   button.type="button";button.dataset.historyTab=key;
   button.setAttribute("role","tab");
   button.setAttribute("aria-controls","f4BankHistoryColumn-"+key);
   button.onclick=()=>navigate(route);
   tabs.append(button);
  }
  controls.append(tabs);
 }
 tabs.querySelectorAll("[data-history-tab]").forEach(button=>{
  const active=button.dataset.historyTab===selected;
  button.classList.toggle("is-active",active);
  button.setAttribute("aria-selected",(0,__f4.globals.String)(active));
  button.tabIndex=active?0:-1;
 });
 let refresh=$("f4BankAdminHistoryRefresh");
 if(!refresh){
  refresh=el("button","f4-bank-admin-history-refresh");
  refresh.id="f4BankAdminHistoryRefresh";refresh.type="button";
  refresh.setAttribute("aria-label","Muat ulang riwayat setoran dan penjualan");
  refresh.title="Muat ulang kedua riwayat";
  refresh.innerHTML='<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.35 5.65"/><path d="M20 4v7h-7"/></svg>';
  refresh.onclick=()=>{
   __f4.window.loadRiwayatV7?.();
   __f4.window.loadRiwayatJual?.();
  };
 }
 if(refresh.parentElement!==controls)controls.append(refresh);
 let grid=$("f4BankAdminHistoryGrid");
 if(!grid){
  grid=el("div","f4-bank-admin-history-grid");
  grid.id="f4BankAdminHistoryGrid";page.append(grid);
 }
 for(const [key,label,id] of [
  ["setoran","Setoran","pageRiwayat"],
  ["penjualan","Penjualan","pageRiwayatJual"]
 ]){
  const panel=$(id);
  if(!panel)continue;
  let frame=$("f4BankHistoryColumn-"+key);
  if(!frame){
   frame=el("section","f4-bank-admin-history-column");
   frame.id="f4BankHistoryColumn-"+key;
   const heading=el("h3","f4-bank-admin-history-column-title",label);
   heading.id="f4BankHistoryTitle-"+key;
   frame.setAttribute("aria-labelledby",heading.id);
   frame.append(heading);grid.append(frame);
  }
  frame.setAttribute("role","tabpanel");
  frame.setAttribute("aria-labelledby","f4BankHistoryTitle-"+key);
  if(panel.parentElement!==frame)frame.append(panel);
  panel.classList.remove("hidden");
 }
 syncAdminPageFrames();
 page.classList.remove("hidden");
 // The legacy route already loaded the selected list. Load the other one.
 if(selected==="penjualan")__f4.window.loadRiwayatV7?.();
 else __f4.window.loadRiwayatJual?.();
}
function ensureAdminReportLink(){
 if(role!=="admin")return;
 const page=$("pageLaporan");
 if(!page||$("f4BankAdminProgressLink"))return;
 const link=el("button","f4-bank-secondary-action f4-bank-report-progress-link","Perkembangan");
 link.id="f4BankAdminProgressLink";link.type="button";
 link.setAttribute("aria-label","Lihat perkembangan Bank Sampah");
 link.insertAdjacentHTML("afterbegin",'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>');
 link.onclick=()=>navigate("bank-admin-progress");
 const head=page.querySelector(":scope > h2");
 if(head)head.append(link);else page.prepend(link);
}
function combineAdminApproval(){
 const root=$("pageRekonsiliasi"),approval=$("pagePengesahan");
 if(!root||!approval)return;
 const heading=root.querySelector(":scope > h2");
 if(heading)heading.textContent="Sahkan Hasil";
 if(approval.parentNode!==root)root.append(approval);
 approval.classList.remove("hidden");
 approval.classList.add("f4-bank-admin-approval");
 // Keep the financial cross-check accessible without duplicating the primary
 // confirmation flow or exposing the result before a batch is selected.
 let reconDetails=$("f4BankReconDetails");
 if(!reconDetails){
  reconDetails=__f4.globals.document.createElement("details");
  reconDetails.id="f4BankReconDetails";
  reconDetails.className="f4-bank-recon-details";
  const summary=__f4.globals.document.createElement("summary");
  summary.innerHTML='<span>Cek selisih penimbangan</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  reconDetails.append(summary);
  const note=root.querySelector(":scope > .pill-note");
  const reconPicker=$("reconBatch")?.closest(".field");
  const preview=$("reconResult");
  if(note)reconDetails.append(note);
  if(reconPicker){reconPicker.hidden=true;reconDetails.append(reconPicker);}
  if(preview)reconDetails.append(preview);
  // Pada PC panel cek selisih langsung terbuka; pada HP tetap opsional.
  if(__f4.window.matchMedia("(min-width:1180px)").matches)reconDetails.open=true;
  root.append(reconDetails);
 }
 const selection=$("v8Batch");
 if(selection&&!selection.dataset.f4ReconBound){
  selection.dataset.f4ReconBound="1";
  selection.addEventListener("change",()=>{
   const other=$("reconBatch");
   if(!other)return;
   if(selection.value&&![...other.options].some(o=>o.value===selection.value))
    other.add(new __f4.globals.Option(selection.options[selection.selectedIndex]?.text||selection.value,selection.value));
   other.value=selection.value;
   __f4.window.loadRekonsiliasi?.();
  });
 }
 if(typeof __f4.window.v8LoadBatches==="function")__f4.window.v8LoadBatches();
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
    const saved=(0,__f4.globals.String)(result.profile?.nama||value);
    name.textContent=saved;
    const greeting=$("greeting");if(greeting)greeting.textContent="Halo, "+saved;
    const welcome=$("f4BankAppWelcome")?.querySelector("strong");if(welcome)welcome.textContent=saved;
    __f4.window.dispatchEvent(new __f4.globals.CustomEvent("f4-account-profile-updated",{detail:{nama:saved}}));
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
 const desktop=__f4.window.matchMedia("(min-width:1024px)").matches;
 const visible=enabled&&desktop;
 side.classList.toggle("hidden",enabled&&!desktop);
 side.classList.remove("open");
 if(enabled&&!desktop){side.setAttribute("aria-hidden","true");side.inert=true;}
 else{side.removeAttribute("aria-hidden");side.inert=false;}
 $("v16Backdrop")?.classList.remove("open");
 __f4.globals.document.body.classList.remove("f4-bank-drawer-open");
 __f4.globals.document.body.classList.toggle("f4-bank-member-desktop",visible);
}
function memberMetricIcon(type){
 const paths={
  weight:'<path d="M12 3v18M5 7h14M3 13l3-6 3 6H3Zm12 0 3-6 3 6h-6ZM8 21h8"/>',
  sales:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 15h3M15 15h3"/>',
  stage:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5 3 3 5-5"/>',
  report:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'
 };
 const svg=__f4.globals.document.createElementNS("http://www.w3.org/2000/svg","svg");
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
  button.setAttribute("aria-pressed",(0,__f4.globals.String)(active));
 });
 chart.replaceChildren();
 if(!memberStatement){
  chart.removeAttribute("role");
  chart.removeAttribute("aria-label");
  chart.append(el("p","f4-member-progress-empty","Memuat setoran pribadi…"));
  return;
 }
 const now=new __f4.globals.Date(today()+"T00:00:00Z");
 const monthly=memberHomeChartGroup==="month";
 const entries=__f4.globals.Array.from({length:monthly?6:5},(_,index)=>{
  if(monthly){
   const date=new __f4.globals.Date(__f4.globals.Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-5+index,1));
   return {key:date.toISOString().slice(0,7),
    label:new __f4.globals.Intl.DateTimeFormat("id-ID",{month:"short",timeZone:"UTC"}).format(date),
    weight:0,count:0};
  }
  const year=(0,__f4.globals.String)(now.getUTCFullYear()-4+index);
  return {key:year,label:year,weight:0,count:0};
 });
 const groups=new __f4.globals.Map(entries.map(item=>[item.key,item]));
 const deposits=memberBuckets().filter(item=>/^\d{4}-\d{2}-\d{2}$/.test(item.date));
 let unmeasured=0;
 for(const item of deposits){
  const key=monthly?item.month:item.date.slice(0,4);
  const entry=groups.get(key);
  if(!entry)continue;
  if(item.missingWeight){unmeasured++;continue;}
  entry.weight+=__f4.globals.Math.max(0,(0,__f4.globals.Number)(item.weight)||0);
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
 const max=__f4.globals.Math.max(0,...entries.map(item=>item.weight));
 const bars=el("div","f4-member-progress-bars");
 bars.style.gridTemplateColumns="repeat("+entries.length+",minmax(0,1fr))";
 for(const item of entries){
  const column=el("div","f4-member-progress-column");
  const amount=el("strong","",item.count?f4PrivateShort(item.weight,"kg")+" kg":"—");
  const rail=el("span","f4-member-progress-rail");
  const fill=el("i","f4-member-progress-fill");
  fill.style.height=max>0&&item.weight>0?__f4.globals.Math.max(4,item.weight/max*100)+"%":"0%";
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
/* Shared operational overview from the public Bank Sampah endpoint, never private ledger totals. */
function renderMemberPublicMini(){
 const host=$("f4MemberPublicMini");if(!host)return;
 const summary=memberPublicMini.data;
 for(const key of ["setoran","anggota","jenis"]){
  const n=summary?.[key],valid=n!==null&&n!==__f4.globals.undefined&&n!==""&&
   __f4.globals.Number.isFinite((0,__f4.globals.Number)(n))&&(0,__f4.globals.Number)(n)>=0;
  const display=valid?(0,__f4.globals.Number)(n).toLocaleString("id-ID"):"—";
  const field=host.querySelector('[data-public-field="'+key+'"] strong');
  if(field){field.textContent=display;field.title=valid?display:"Data belum tersedia";}
 }
 const label=host.querySelector('[data-public-field="setoran"] small');
 if(label)label.textContent=summary?.recorded?"Setoran tercatat":"Setoran sah";
}
function resetMemberPublicMini(){
 memberPublicMini.version++;memberPublicMini.data=null;
 memberPublicMini.pending=null;memberPublicMini.loadedAt=0;
}
function loadMemberPublicMini(force=false){
 if(roleType()!=="member")return;
 const s=memberPublicMini;
 renderMemberPublicMini();
 if(s.pending||(!force&&s.loadedAt&&__f4.globals.Date.now()-s.loadedAt<90000))return;
 const version=++s.version;
 s.loadedAt=__f4.globals.Date.now();
 s.pending=api("/api/v2/public/bank").then(response=>{
  if(version!==s.version||roleType()!=="member")return;
  const overview=response?.overview;
  if(!overview||typeof overview!=="object"||
   !["confirmedDeposits","activeMembers","activeItems"].every(key=>
    overview[key]!=null&&__f4.globals.Number.isFinite((0,__f4.globals.Number)(overview[key]))))
    throw (0,__f4.globals.Error)("Ringkasan publik Bank Sampah belum lengkap.");
  const recorded=overview.recordedDeposits!=null&&__f4.globals.Number.isFinite((0,__f4.globals.Number)(overview.recordedDeposits));
  s.data={setoran:(0,__f4.globals.Number)(recorded?overview.recordedDeposits:overview.confirmedDeposits),
   anggota:(0,__f4.globals.Number)(overview.activeMembers),jenis:(0,__f4.globals.Number)(overview.activeItems),recorded};
  renderMemberPublicMini();
 }).catch(error=>{
  if(version!==s.version)return;
  s.data=null;renderMemberPublicMini();
  __f4.globals.console.warn("Bank Sampah: ringkasan publik belum tersedia.",error);
 }).finally(()=>{if(version===s.version)s.pending=null;});
}
function infoShortcut(){
 const home=$("f4BankAppHome");if(roleType()!=="member"||!home)return;
 let link=$("f4MemberInfoShortcut");
 if(!link){
  link=el("button","f4-member-info-shortcut");link.id="f4MemberInfoShortcut";link.type="button";
  const symbol=el("span","f4-member-info-icon");symbol.append(memberMetricIcon("report"));
  const copy=el("span","f4-member-info-copy");
  copy.append(el("strong","","Info Bank Sampah"),el("small","","Setoran, anggota, dan kegiatan"));
  const mini=el("span","f4-member-public-mini");mini.id="f4MemberPublicMini";
  for(const [key,label] of [["setoran","Setoran sah"],["anggota","Anggota aktif"],["jenis","Jenis sampah"]]){
   const item=el("span","f4-member-public-mini-item");item.dataset.publicField=key;
   item.append(el("small","",label),el("strong","","—"));mini.append(item);
  }
  link.append(symbol,copy,mini,bankIconSpan("f4-member-next","chevron-right"));
  link.onclick=()=>navigate("bank-member-info");
 }
 home.append(link);loadMemberPublicMini();
}
function publicSnapshot(){
 if(roleType()!=="member"||memberSnapshotsLoaded||snapshotBusy||typeof __f4.window.v17LoadPublic!=="function")return;
 snapshotBusy=true;
 __f4.globals.Promise.resolve().then(()=>__f4.window.v17LoadPublic()).then(()=>{
  memberSnapshotsLoaded=true;
 }).catch(()=>{}).finally(()=>{snapshotBusy=false});
}
function memberFeature(route){
 const docs=route==="bank-member-docs";
 const name=docs?"Dokumentasi":"Info Bank Sampah";
 const page=ensureScreen(route,name);
 page.querySelector(":scope > .f4-bank-screen-title")?.remove();
 // The report already has its own "Laporan Publik" heading; avoid repeating it.
 if(!docs)page.querySelector(".f4-member-feature-header")?.remove();
 else if(!page.querySelector(".f4-member-feature-header")){
  const header=el("header","f4-member-feature-header");
  const title=el("div");
  title.append(el("h2","",name));
  header.append(title);page.prepend(header);
 }
 let content=page.querySelector(".f4-member-feature-content");
 if(!content){content=el("div","f4-member-feature-content");page.append(content);}
 if(docs){
  moveFeature(["v22DocsPage"],content);
  const albumPage=$("v22DocsPage");
  albumPage?.classList.remove("hidden");
  __f4.window.f4BankRenderDocumentation?.();
  // Original public-page back action remains untouched. Member uses its top navigation.
 }else{
  moveFeature(["v17PublicMetrics","v17Transparansi","v17Dokumentasi","v17Perkembangan","v17Inventaris"],content);
  const finance=content.querySelector("#v17Transparansi");
  if(finance){finance.hidden=false;finance.classList.remove("hidden");}
  if(typeof __f4.window.v25LoadReport==="function")__f4.window.v25LoadReport();
 }
 __f4.globals.document.body.classList.add("f4-member-feature");
 if(!memberSnapshotsLoaded)publicSnapshot();
 __f4.window.scrollTo(0,0);
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
 __f4.window.F4MemberPrices?.close?.();
 for(const id of [...custom,...featureRoutes])$(id)?.classList.add("hidden");
}
function navigate(route){
 if(route==="menu"){if(roleType())openBankDrawer();return;}
 if(route==="bank-deposit"){
  __f4.window.goPage("dashboard");
  const flow=$("f4MemberFlow");if(flow){flow.open=true;flow.scrollIntoView({behavior:"smooth",block:"start"});}
  return;
 }
 if(route==="bank-history"||route==="bank-report"||route==="bank-payout"){
  __f4.window.goPage(route);return;
 }
 if(typeof __f4.window.goPage==="function")__f4.window.goPage(route);
}
function handleRoute(route,old,args){
 if(route==='profile'&&roleType()){__f4.window.f4OpenAccountProfile?.();return;}
 // Legacy bookmarks resolve to the consolidated member information page.
 if(roleType()==="member"&&route==="bank-member-progress")route="bank-member-info";
 if(roleType()==="member"&&route==="bank-prices"){
  __f4.window.F4MemberPrices?.show();return;
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
   __f4.window.v16Sync?.(route);markDock();__f4.window.scrollTo(0,0);return;
  }
  if(route==="bank-admin-docs"){
   hideCustom();old.call(window,"dashboard",...args);
   $("pageDashboard")?.classList.add("hidden");
   showAdminDocumentation();screen=route;
   __f4.window.v16Sync?.(route);markDock();__f4.window.scrollTo(0,0);return;
  }
  if(route==="bank-admin-history"||route==="bank-admin-sale-history"){
   const saleHistory=route==="bank-admin-sale-history";
   hideCustom();old.call(window,saleHistory?"riwayatJual":"riwayat",...args);
   showAdminHistory(saleHistory?"penjualan":"setoran");screen=route;
   __f4.window.v16Sync?.(route);markDock();__f4.window.scrollTo(0,0);return;
  }
  if(route==="bank-admin-progress"){
   hideCustom();old.call(window,"dashboard",...args);
   $("pageDashboard")?.classList.add("hidden");
   showAdminProgress();screen=route;
   __f4.window.v16Sync?.(route);markDock();__f4.window.scrollTo(0,0);return;
  }
  if(route==="rekonsiliasi"){
   hideCustom();old.call(window,route,...args);
   combineAdminApproval();screen=route;markDock();__f4.window.scrollTo(0,0);return;
  }
  if(route==="profile"){
   hideCustom();old.call(window,route,...args);
   ensureAdminProfile();screen=route;markDock();__f4.window.scrollTo(0,0);return;
  }
 }
 // Navigating between member pages always starts with a visible header and sidebar brand.
 if(roleType()==="member"){
  if(__f4.window.matchMedia("(min-width:1024px)").matches){
   const side=$("sideNav");if(side)side.scrollTop=0;
  }
  __f4.window.scrollTo(0,0);
 }
 if(roleType()==="member"&&featureRoutes.includes(route)){
  restoreFeature();hideCustom();
  old.call(window,"dashboard",...args);
  $("pageDashboard")?.classList.add("hidden");
  memberFeature(route);
  $(route)?.classList.remove("hidden");
  if(typeof __f4.window.v16Sync==="function")__f4.window.v16Sync(route);
  screen=route;markDock();return;
 }
 if(__f4.globals.document.body.classList.contains("f4-member-feature")){restoreFeature();hideCustom();}

 if(route==="bank-payout-admin"&&roleType()==="admin"){
  hideCustom();
  old.call(window,"tabungan",...args);
  managerRequestsPanel();
  $("pageTabungan")?.classList.add("hidden");
  $("bank-payout-admin")?.classList.remove("hidden");
  if(typeof __f4.window.v16Sync==="function")__f4.window.v16Sync("bank-payout-admin");
  screen="bank-payout-admin";markDock();
  loadManagerRequests();
  return;
 }
 if(["bank-history","bank-payout","bank-report"].includes(route)&&roleType()==="member"){
  old.call(window,"pribadi",...args);
  ensureMemberPages();
  hideCustom();
  $("pagePribadi")?.classList.add("hidden");
  $(route)?.classList.remove("hidden");screen=route;
  if(typeof __f4.window.v16Sync==="function")__f4.window.v16Sync(route);
  markDock();
  if(route==="bank-history")showHistory();
  if(route==="bank-report")showReport();
  if(route==="bank-payout")requestsMember();
  return;
 }
 hideCustom();
 const result=old.call(window,route,...args);
 if(route==="dashboard"&&role==="member"){
  __f4.window.scrollTo(0,0);
  const link=$("v14AllDeposits");if(link){link.textContent="Lihat semua";link.onclick=()=>navigate("bank-history");}
 }
 if(route==="dashboard"&&role==="admin"){ensureHome();ensureAdminHome();__f4.window.scrollTo(0,0);}
 if(route==="laporan"&&role==="admin")ensureAdminReportLink();
 if(route==="setoran"&&role==="admin")ensureOwnDepositForm();
 screen=route;markDock();
 if(route==="tabungan"&&roleType()==="admin")managerRequestsPanel();
 if(route==="pribadi")ensureMemberPages();
 if(role==="admin")syncAdminPageFrames();
 return result;
}
function resetRoleSurface(){
 resetMemberAward();
 adminNavObserver?.disconnect();adminNavObserver=null;adminNavList=null;
 if(isBankDrawerOpen())closeBankDrawer();
 getBankDrawer()?.remove();
 $("f4-direct-sideback")?.remove();
 resetMemberPublicMini();memberBalancePrivacy.hidden=true;
 adminInsightVersion++;adminInsightPending=null;adminInsightReport=null;
 adminInsightPublic=null;adminInsightSchedule=null;adminInsightLoadedAt=0;
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
 for(const node of __f4.globals.document.querySelectorAll("[data-f4-bank-observed]"))delete node.dataset.f4BankObserved;
 if(__f4.globals.document.body.classList.contains("f4-member-feature"))restoreFeature();
 hideCustom();restoreAdminProgress();restoreAdminMedia();
 const form=$("v10ExpenseForm"),notice=$("v10ExpenseNotice"),home=$("pageBiaya");
 if(form&&home&&form.parentElement!==home)home.append(form);
 if(notice&&home&&notice.parentElement!==home)home.append(notice);
 for(const id of ["f4BankAdminOperations","f4BankAdminShortcuts","f4BankAdminNext"]){$(id)?.remove();}
 $("f4BankAdminBack")?.setAttribute("hidden","");
 if($("f4BankPageGreeting"))$("f4BankPageGreeting").hidden=true;
 $("f4BankProfileDetail")?.remove();
 if($("f4BankWeighingDialog")?.open)$("f4BankWeighingDialog").close();
 __f4.window.F4MemberPrices?.close?.();
 const history=$("bank-admin-history"),section=$("dashboardView")?.querySelector(".grid > .section");
 for(const id of ["pageRiwayat","pageRiwayatJual"]){
  const page=$(id);if(page&&history?.contains(page)&&section)section.append(page);
 }
 __f4.globals.document.body.classList.remove("f4-bank-member-secondary");
 memberStatement=null;adminOverview=null;adminOverviewError='';memberSnapshotsLoaded=false;
 weighingRequestId++;weighingRequest=null;weighingWeekday=0;weighingLastFetched=0;weighingReady=false;
 requestNonce="";requestEnabled=false;memberSnapshotsLoaded=false;
}
__f4.window.f4BankResetForAccountSwitch=()=>{
 resetRoleSurface();
 role=null;memberStatement=null;adminOverview=null;adminOverviewError='';
 __f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-shared-bank-route',{detail:'dashboard'}));
 __f4.globals.document.body.classList.remove("f4-bank-app-private","f4-bank-app-admin","f4-bank-app-member","f4-bank-member-secondary");

 memberSide(false);syncAdminPageFrames();
};
__f4.window.f4BankReconcileAccount=()=>sync();
function sync(){
 const next=roleType(),isPrivate=!!next&&!$("dashboardView")?.classList.contains("hidden");
 __f4.globals.document.body.classList.toggle("f4-bank-app-private",isPrivate);
 __f4.globals.document.body.classList.toggle("f4-bank-app-member",isPrivate&&next==="member");
 __f4.globals.document.body.classList.toggle("f4-bank-app-admin",isPrivate&&next==="admin");
 
 if(!isPrivate){
  if(role!==null)resetRoleSurface();
  memberSide(false);
 
  $("f4BankAdminBack")?.setAttribute("hidden","");
  role=null;memberStatement=null;memberSnapshotsLoaded=false;
  syncAdminPageFrames();
  $("f4BankProfileDetail")?.remove();return;
 }
 if(next!==role){
  resetRoleSurface();
  role=next;screen="dashboard";
  
  if(role==="member")requestNonce="";
  memberStatement=null;adminOverview=null;adminOverviewError='';
  if(role==="admin")$("f4BankProfileDetail")?.remove();
 }
 memberSide(role==="member");
 syncAdminPageFrames();
 // If route restoration has hidden every page, show the selected home again.
 // Do not interfere with any currently open operational screen.
 const dashboard=$("pageDashboard");
 if(role==="admin"&&screen==="dashboard"&&dashboard?.classList.contains("hidden")&&
    new __f4.globals.URLSearchParams(__f4.globals.location.search).get("halaman")==="dashboard"){
  const section=dashboard.parentElement;
  const otherVisible=[...(section?.children||[])].some(node=>node!==dashboard&&
    (node.id.startsWith("page")||node.id.startsWith("bank-"))&&!node.classList.contains("hidden"));
  if(!otherVisible)dashboard.classList.remove("hidden");
 }
 ensureHome();
 if(role==="member"){
  ensureMemberPages();ensureBankDrawer();progressPreview();infoShortcut();orderMemberHome();ensureMemberHowtoBanner();publicSnapshot();
  loadMemberAward();
 }else{
  managerRequestsPanel();
  ensureAdminHome();
  ensureAdminProfile();
 }
 markDock();refreshSources();
 // Reset stale horizontal pan only when entering an authenticated surface.
 if(__f4.window.scrollX>0)__f4.window.scrollTo(0,__f4.window.scrollY);
}
function refreshSources(){
 const p=$("v14Primary"),q=$("v14Extra");
 if(p&&p!==primaryNode){
  homeSource?.disconnect();
  homeSource=new __f4.globals.MutationObserver(updateDashboard);
  homeSource.observe(p,{childList:true,characterData:true,subtree:true});primaryNode=p;
 }
 if(q&&q!==extraNode){
  summaryExtra?.disconnect();
  summaryExtra=new __f4.globals.MutationObserver(updateDashboard);
  summaryExtra.observe(q,{childList:true,characterData:true,subtree:true});extraNode=q;
 }
 const targets=["v12Balance","v12Credit","v12Debit","v12History","v12Deposits","v12Gate","v12Private"];
 const observer=memberSource||new __f4.globals.MutationObserver(syncSavings);
 if(!memberSource)memberSource=observer;
 for(const id of targets){
  const target=$(id);
  if(!target||target.dataset.f4BankObserved==="1")continue;
  target.dataset.f4BankObserved="1";
  observer.observe(target,id==="v12Private"?{attributes:true,attributeFilter:["class"]}:{childList:true,characterData:true,subtree:true});
 }
}

function memberID(){
 return (0,__f4.globals.String)(memberStatement?.wargaId||$("pId")?.textContent||"").trim().replace(/^member:/i,"");
}
function updateCardNumber(){
 const id=memberID();
 text("f4BankCardNumber",id&&id!=="Administrator"?id:"—");
 text("f4BankProfileNumber",id&&id!=="Administrator"?id:"—");
 const house=$("pHome")?.textContent?.trim()||"—";
 const name=roleType()==="member"?displayWargaName($("pName")?.textContent?.trim()||"—"):($("pName")?.textContent?.trim()||"—");
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
    const persisted=(0,__f4.globals.String)(result.profile?.nama||value).trim();
    name.textContent=persisted;
    const sidebar=$("v15AccountName");if(sidebar)sidebar.textContent=displayWargaName(persisted);
    const greeting=$("greeting");if(greeting)greeting.textContent="Halo, "+displayWargaName(persisted);
    const welcome=$("welcomeName");if(welcome)welcome.textContent=displayWargaName(persisted);

    updateCardNumber();
    mode(false);
    __f4.window.dispatchEvent(new __f4.globals.CustomEvent("f4-account-profile-updated",{detail:{nama:persisted}}));
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
  // Share exactly the dashboard's ATM content, without a second clickable card.
  const copy=el("div","f4-bank-member-card f4-bank-profile-card");
  for(const node of card.childNodes)copy.append(node.cloneNode(true));
  copy.setAttribute("aria-label","Identitas anggota Bank Sampah Flamboyan 4");
  const number=copy.querySelector("#f4BankCardNumber");if(number)number.id="f4BankProfileNumber";
  const personName=copy.querySelector("#f4BankCardName");if(personName)personName.id="f4BankProfileName";
  const room=copy.querySelector(".f4-bank-card-house");if(room)room.id="f4BankProfileHouse";
  const button=el("button","f4-bank-profile-copy","Salin nomor anggota");button.type="button";
  button.onclick=async()=>{
   const id=memberID();if(!id||id==="—")return;
   try{await __f4.globals.navigator.clipboard.writeText(id);button.textContent="Nomor tersalin";}
   catch{__f4.window.prompt("Nomor anggota:",id);}
  };
  wrapper.append(copy,button);
  target.prepend(wrapper);
  const head=target.querySelector(":scope > h2");if(head)head.textContent="Profil & Pengaturan";
 }
 updateCardNumber();
 renderMemberAward();loadMemberAward();
 inlineMemberDisplayName();
}
function acceptMemberStatement(event){
 if(roleType()!=="member"||$("dashboardView")?.classList.contains("hidden"))return;
 const data=event?.detail;
 if(!data||!__f4.globals.Array.isArray(data.mutasi)||!__f4.globals.Array.isArray(data.setoran))return;
 // Reject a delayed response from a different member after logout/login.
 const normalize=id=>(0,__f4.globals.String)(id||"").trim().replace(/^member:/i,"");
 const expected=normalize($("pId")?.textContent);
 const received=normalize(data.wargaId||data.memberId||data.member_id);
 if(!received||!expected||expected==="Administrator"||received!==expected)return;
 memberStatement=data;
 updateCardNumber();updateDashboard();syncSavings();progressPreview();
 loadMemberAward();
}

function init(){
 if(ready)return;ready=true;
 // A single CSS-fixed dock keeps the same size while Android bars collapse.
 // Resizing between phone and PC must restore/hide the real sidebar immediately.
 // Chrome Android mengirim resize saat address bar berubah tinggi pada scroll.
 // Jangan render ulang beranda/badge hanya karena tinggi viewport berubah.
 let desktopLayout=__f4.window.matchMedia("(min-width:1024px)").matches;
 __f4.window.addEventListener("resize",()=>{
  const nextDesktop=__f4.window.matchMedia("(min-width:1024px)").matches;
  if(nextDesktop===desktopLayout)return;
  desktopLayout=nextDesktop;
  if(nextDesktop&&isBankDrawerOpen())closeBankDrawer();
  syncAdminPageFrames();
  if(role==="admin"){ensureHome();ensureAdminHome();}
  if(role==="member"){memberSide(true);loadMemberPublicMini();}
 });
 // Export a mount-scoped action instead of attaching listeners to the persistent navbar.
 __f4.window.f4BankHandleNavbarMenu=()=>{
  const type=roleType();
  if(type!=="member"&&type!=="admin")return false;
  if(role!==type)sync();openBankDrawer();return true;
 };

 const openPublic=__f4.window.v11ShowPublic;
 if(typeof openPublic==="function")__f4.window.v11ShowPublic=function(...args){
  restoreFeature();hideCustom();restoreAdminProgress();return openPublic.apply(this,args);
 };
 __f4.window.addEventListener("f4-bank-member-statement",acceptMemberStatement);
 __f4.window.addEventListener("f4-bank-admin-overview",updateAdminOverview);
 __f4.window.addEventListener("f4-bank-admin-overview-error",event=>{if(roleType()!=="admin")return;adminOverview=null;adminOverviewError=(0,__f4.globals.String)(event.detail||"Data tidak tersedia");updateDashboard();});
 __f4.window.addEventListener("f4-bank-data-changed",()=>{
  
  if(roleType()==="admin"&&$("f4BankAdminInsights"))adminInsightFetch(true);
  if(roleType()==="member"){loadMemberPublicMini(true);loadMemberAward(true);}
 });
 __f4.window.addEventListener("focus",()=>{if(roleType()==="member"){loadMemberPublicMini();loadMemberAward();updateWeighingCard();loadWeighingDay();}});
 __f4.globals.document.addEventListener("visibilitychange",()=>{if(!__f4.globals.document.hidden){if(roleType()==="member"){updateWeighingCard();loadWeighingDay();}}});
 (0,__f4.globals.setInterval)(()=>{if(!__f4.globals.document.hidden){if(roleType()==="member"){updateWeighingCard();loadWeighingDay();}}},45000);
 const original=__f4.window.goPage;
 if(typeof original==="function")__f4.window.goPage=function(route,...args){
    const viewToken=route!==screen?__f4.globals.F4PortalNavigation?.beginView():null;
    __f4.window.f4BankPageHistory?.begin?.();
   try{return handleRoute(route,original,args)}
   finally{
    __f4.window.f4BankPageHistory?.end?.(screen);
     __f4.globals.F4PortalNavigation?.endView(viewToken??null);
     // The previous operational form can leave the document horizontally
    // panned on narrow phones. Navigation must always restore left origin,
    // never retain the previous tab's offset.
    if(__f4.window.scrollX>0||__f4.globals.document.documentElement.scrollLeft>0){
     __f4.window.scrollTo(0,__f4.window.scrollY);
    }
   }
  };
  __f4.window.f4BankAppCurrentRoute=()=>screen;
 const view=$("dashboardView");
 if(view)new __f4.globals.MutationObserver(sync).observe(view,{attributes:true,attributeFilter:["class"]});
 new __f4.globals.MutationObserver(sync).observe(__f4.globals.document.body,{attributes:true,attributeFilter:["data-f4-bank-role"]});
 const page=$("pageDashboard");
 // Reconcile after *actual* missing nodes, including a late class change.
 // Normal API updates must not recreate the dashboard or interrupt scrolling.
 let homeRepairQueued=false,homeRepairTime=0;
 function repairMissingHome(){
  if(!roleType()||$("dashboardView")?.classList.contains("hidden")||!page)return;
  const home=page.querySelector("#f4BankAppHome");
  const incomplete=!home||!home.querySelector("#f4BankAppAdminHero")||
   (roleType()==="admin"&&!page.querySelector("#f4BankAdminOperations"));
  if(!incomplete||homeRepairQueued||__f4.globals.Date.now()-homeRepairTime<1000)return;
  homeRepairQueued=true;
  (0,__f4.globals.queueMicrotask)(()=>{
   homeRepairQueued=false;
   if(!roleType()||$("dashboardView")?.classList.contains("hidden"))return;
   if(page.querySelector("#f4BankAppHome")?.querySelector("#f4BankAppAdminHero")&&
      (roleType()!=="admin"||page.querySelector("#f4BankAdminOperations")))return;
   homeRepairTime=__f4.globals.Date.now();
   sync();
  });
 }
 if(page)new __f4.globals.MutationObserver(()=>{
   repairMissingHome();
   const source=$("f4BankDashboardSource"),chart=$("f4-member-weight-chart");
   if(role==="member"&&source&&chart&&chart.parentElement!==source)source.append(chart);
  }).observe(page,{attributes:true,attributeFilter:["class"],childList:true,subtree:true});
 __f4.window.addEventListener("pageshow",()=>{
  if(roleType()&&!$("dashboardView")?.classList.contains("hidden")){
   ensureHome();
   if(roleType()==="admin")ensureAdminHome();
   if(roleType()==="member"){renderMemberAward();loadMemberAward();}
   markDock();
  }
 });
 sync();
}
if(__f4.globals.document.readyState==="loading")__f4.globals.document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

});
