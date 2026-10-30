/* Flamboyan 4 Bank Sampah — private mobile-banking experience.
   Presentation only: reuses existing authorised bank routes and live summaries.
   No API writes, no mock balances, no changes to the public landing page. */
(() => {
  "use strict";
  const byId=id=>document.getElementById(id);
  const element=(tag,cls,text)=>{
    const item=document.createElement(tag);
    if(cls)item.className=cls;
    if(text!==undefined)item.textContent=text;
    return item;
  };
  const adminActions=[
    {title:"Setoran",route:"setoran",icon:"bank.svg"},
    {title:"Penjualan",route:"penjualan",icon:"cash.svg"},
    {title:"Saldo",route:"tabungan",icon:"pay.svg"},
    {title:"Laporan",route:"laporan",icon:"book.svg"}
  ];
  const memberActions=[
    {title:"Tabungan",route:"pribadi",icon:"cash.svg"},
    {title:"Riwayat",route:"history",icon:"book.svg"},
    {title:"Laporan",route:"report",icon:"pay.svg"},
    {title:"Kegiatan",route:"progress",icon:"calendar.svg"}
  ];
  const adminDock=[
    {title:"Beranda",route:"dashboard",icon:"home.svg"},
    {title:"Setoran",route:"setoran",icon:"bank.svg"},
    {title:"Penjualan",route:"penjualan",icon:"cash.svg"},
    {title:"Saldo",route:"tabungan",icon:"pay.svg"},
    {title:"Menu",route:"menu",icon:"menu.svg"}
  ];
  const memberDock=[
    {title:"Beranda",route:"dashboard",icon:"home.svg"},
    {title:"Tabungan",route:"pribadi",icon:"cash.svg"},
    {title:"Riwayat",route:"history",icon:"book.svg"},
    {title:"Laporan",route:"report",icon:"pay.svg"},
    {title:"Profil",route:"profile",icon:"user.svg"}
  ];
  let role=null, currentPage="dashboard", primaryObserver=null, started=false;
  let monthFilter="latest", pendingAnchor="", savingsObserver=null, depositsObserver=null;
  const roleType=()=>{
    const r=String(document.body.dataset.f4BankRole||"").toLowerCase();
    return ["admin","superadmin"].includes(r)?"admin":["warga","anggota"].includes(r)?"member":null;
  };
  const icon=(file)=>{
    const img=element("img");img.src="/assets/icons/"+file;img.alt="";
    img.setAttribute("aria-hidden","true");img.loading="lazy";return img;
  };
  function navigate(route){
    if(route==="menu"){
      if(typeof window.f4ToggleBankMenu==="function")window.f4ToggleBankMenu();
      else byId("v18PrivateMenuButton")?.click();
      return;
    }
    if(route==="public"){
      if(typeof window.v11ShowPublic==="function")window.v11ShowPublic();
      syncRole();
      return;
    }
    if(route==="history"||route==="report"){
      pendingAnchor=route;
      if(typeof window.goPage==="function")window.goPage("pribadi");
      currentPage=route;
      updateDock();
      scrollToSavingAnchor();
      return;
    }
    if(typeof window.goPage==="function")window.goPage(route);
    currentPage=route;
    updateDock();
  }
  function makeAction(action,kind){
    const button=element("button","f4-bank-app-action");
    button.type="button";
    button.setAttribute("aria-label",action.title);
    if(kind==="dock")button.classList.add("f4-bank-app-dock-action");
    button.dataset.bankAppRoute=action.route;
    const symbol=element("span","f4-bank-app-action-icon");symbol.append(icon(action.icon));
    button.append(symbol,element("span","f4-bank-app-action-name",action.title));
    button.onclick=()=>navigate(action.route);
    return button;
  }
  function ensureHome(){
    const page=byId("pageDashboard");
    if(!page)return null;
    let hub=byId("f4BankAppHome");
    if(hub)return hub;
    page.classList.add("f4-bank-app-dashboard");
    hub=element("section","f4-bank-app-home");
    hub.id="f4BankAppHome";
    const balance=element("div","f4-bank-app-hero");
    const header=element("div","f4-bank-app-hero-header");
    const heading=element("div","f4-bank-app-hero-copy");
    heading.append(element("span","f4-bank-app-eyebrow","BANK SAMPAH FLAMBOYAN 4"));
    const subtitle=element("strong","f4-bank-app-balance-title");subtitle.id="f4BankAppBalanceTitle";
    heading.append(subtitle);
    const symbol=element("span","f4-bank-app-hero-symbol");symbol.append(icon("bank.svg"));
    header.append(heading,symbol);
    const amount=element("div","f4-bank-app-balance","—");amount.id="f4BankAppBalance";
    amount.setAttribute("aria-live","polite");
    const foot=element("div","f4-bank-app-hero-foot");
    const secondary=element("span","f4-bank-app-secondary");secondary.id="f4BankAppSecondary";
    const open=element("button","f4-bank-app-detail","Lihat rincian");
    open.type="button";open.id="f4BankAppDetail";
    open.onclick=()=>navigate(role==="admin"?"tabungan":"pribadi");
    foot.append(secondary,open);
    balance.append(header,amount,foot);
    const title=element("h3","f4-bank-app-shortcuts-title","Akses Cepat");
    const shortcuts=element("div","f4-bank-app-shortcuts");shortcuts.id="f4BankAppShortcuts";
    hub.append(balance,title,shortcuts);
    page.insertBefore(hub,page.firstChild);
    // The old decorative banner duplicates the new account-specific banking header.
    // Keep its DOM content for the legacy data binding, but remove its visual space.
    const oldHero=page.querySelector(".v14-hero");
    if(oldHero)oldHero.hidden=true;
    return hub;
  }
  function ensureDock(){
    let dock=byId("f4BankAppDock");
    if(dock)return dock;
    dock=element("nav","f4-bank-app-dock");
    dock.id="f4BankAppDock";
    dock.setAttribute("aria-label","Navigasi cepat Bank Sampah");
    document.body.append(dock);
    return dock;
  }
  function updateDock(){
    const dock=byId("f4BankAppDock");
    if(!dock)return;
    for(const button of dock.querySelectorAll("button[data-bank-app-route]")){
      const route=button.dataset.bankAppRoute;
      const selected=route===currentPage ||
        (role==="admin"&&route==="menu"&&!["dashboard","setoran","penjualan"].includes(currentPage));
      button.classList.toggle("is-active",selected);
      if(selected)button.setAttribute("aria-current","page");
      else button.removeAttribute("aria-current");
    }
  }
  function updateHero(){
    if(!role)return;
    const primary=byId("v14Primary");
    if(!primary)return;
    const values=new Map();
    for(const item of primary.querySelectorAll(".v14-kpi")){
      const label=item.querySelector(".v14-kpi-label")?.textContent?.trim();
      const value=item.querySelector("strong")?.textContent?.trim();
      if(label&&value)values.set(label,value);
    }
    const mainKey=role==="admin"?"Hasil diterima lapak":"Saldo sah";
    const secondaryKey=role==="admin"?"Berat tercatat":"Perkiraan setoran";
    const balance=byId("f4BankAppBalance"),other=byId("f4BankAppSecondary");
    if(balance)balance.textContent=values.get(mainKey)||"—";
    if(other)other.textContent=secondaryKey+": "+(values.get(secondaryKey)||"—");
    const cardBalance=byId("f4BankCardBalance");
    if(cardBalance)cardBalance.textContent=role==="member"?(values.get("Saldo sah")||"—"):"—";
    updateDashboardMinis(values);
  }
  function syncRole(){
    const next=roleType();
    const privateView=!!next&&!byId("dashboardView")?.classList.contains("hidden");
    document.body.classList.toggle("f4-bank-app-private",privateView);
    document.body.classList.toggle("f4-bank-app-member",privateView&&next==="member");
    document.body.classList.toggle("f4-bank-app-admin",privateView&&next==="admin");
    const dock=ensureDock();
    dock.hidden=!privateView;
    if(!privateView)return;
    const hub=ensureHome();
    if(!hub)return;
    if(role!==next){
      role=next;
      const admin=role==="admin";
      byId("f4BankAppBalanceTitle").textContent=admin?"Hasil diterima lapak":"Saldo terkonfirmasi";
      byId("f4BankAppBalance").textContent="—";
      byId("f4BankAppSecondary").textContent=admin?"Berat tercatat: —":"Perkiraan setoran: —";
      const shortcuts=byId("f4BankAppShortcuts");
      shortcuts.replaceChildren(...(admin?adminActions:memberActions).map(a=>makeAction(a,"shortcut")));
      dock.replaceChildren(...(admin?adminDock:memberDock).map(a=>makeAction(a,"dock")));
      currentPage="dashboard";
    }
    ensureMemberCard();
    ensureSavings();
    updateIdentity();
    updateHero();
    updateDock();
  }

  // Card is a membership identity, not a payment instrument. No synthetic card number.
  function ensureMemberCard(){
    const hub=byId("f4BankAppHome");
    if(!hub)return;
    let card=byId("f4BankMemberCard");
    if(!card){
      card=element("button","f4-bank-member-card");
      card.id="f4BankMemberCard";
      card.type="button";
      card.setAttribute("aria-label","Buka tabungan anggota");
      card.innerHTML='<span class="f4-bank-member-card-head"><span class="f4-bank-member-card-leaf" aria-hidden="true">◈</span><span><b>BANK SAMPAH</b><small>FLAMBOYAN 4</small></span><span class="f4-bank-member-card-chip" aria-hidden="true"></span></span>'+
      '<span class="f4-bank-member-card-foot"><span><small>KARTU ANGGOTA DIGITAL</small><strong id="f4BankCardName">—</strong><span id="f4BankCardHouse">Rumah —</span></span><span class="f4-bank-member-card-mark" aria-hidden="true">✦</span></span>';
      card.onclick=()=>navigate("pribadi");
      hub.insertBefore(card,hub.querySelector(".f4-bank-app-shortcuts-title"));
    }
    card.hidden=role!=="member";
    const hero=byId("f4BankAppHome")?.querySelector(".f4-bank-app-hero");
    if(hero)hero.hidden=role==="member";
    let label=byId("f4BankAppHome")?.querySelector(".f4-bank-app-personal-greeting");
    if(!label){
      label=element("div","f4-bank-app-personal-greeting");
      label.innerHTML='<span>Selamat datang,</span><strong id="f4BankAppGreeting">Anggota</strong><small>Tabungan lingkungan kita 🌱</small>';
      hub.insertBefore(label,hub.firstChild);
    }
    label.hidden=role!=="member";
    let quickBalance=byId("f4BankAppMemberBalance");
    if(!quickBalance){
      quickBalance=element("button","f4-bank-app-member-balance");
      quickBalance.id="f4BankAppMemberBalance";
      quickBalance.type="button";
      quickBalance.innerHTML='<span><small>Saldo terkonfirmasi</small><strong id="f4BankCardBalance">—</strong></span><span aria-hidden="true">›</span>';
      quickBalance.onclick=()=>navigate("pribadi");
      card.after(quickBalance);
    }
    quickBalance.hidden=role!=="member";
    let minis=byId("f4BankAppMinis");
    if(!minis){
      minis=element("div","f4-bank-app-minis");
      minis.id="f4BankAppMinis";
      hub.append(minis);
    }
  }
  function updateIdentity(){
    const name=byId("pName")?.textContent?.trim()||"Anggota";
    const home=byId("pHome")?.textContent?.trim()||"—";
    if(byId("f4BankCardName"))byId("f4BankCardName").textContent=name;
    if(byId("f4BankCardHouse"))byId("f4BankCardHouse").textContent="Rumah "+home;
    if(byId("f4BankAppGreeting"))byId("f4BankAppGreeting").textContent="Halo, "+name+"!";
    if(byId("f4BankSavingsName"))byId("f4BankSavingsName").textContent=name+" • Rumah "+home;
  }
  function updateDashboardMinis(primaryValues){
    const mini=byId("f4BankAppMinis");
    if(!mini)return;
    const more=new Map();
    for(const item of byId("v14Extra")?.children||[]){
      const label=item.querySelector("small,.v14-extra-label,.v14-kpi-label")?.textContent?.trim();
      const value=item.querySelector("strong,b")?.textContent?.trim();
      if(label&&value)more.set(label,value);
    }
    const options=role==="admin"?
      [["Anggota",primaryValues.get("Anggota aktif")],["Berat setoran",primaryValues.get("Berat tercatat")],["Menunggu sah",more.get("Menunggu sah")],["Kas tercatat",more.get("Kas tercatat")]]:
      [["Berat",primaryValues.get("Berat")],["Setoran",primaryValues.get("Setoran")],["Belum sah",primaryValues.get("Perkiraan setoran")]];
    mini.replaceChildren(...options.map(([label,value])=>{
      const item=element("div","f4-bank-app-mini");
      item.append(element("small","",label),element("strong","",value||"—"));
      return item;
    }));
  }
  function formatMonth(dateText){
    const m=String(dateText||"").match(/(\d{1,2})\s+([A-Za-z.]+)\s+(\d{4})/);
    if(!m)return "";
    const names=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const month=names.findIndex(x=>x===m[2].replace(".",""));
    return month<0?"":m[3]+"-"+String(month+1).padStart(2,"0");
  }
  const moneyAmount=text=>{
    const value=String(text||"").replace(/[^\d-]/g,"");
    return Number(value)||0;
  };
  function scrollToSavingAnchor(){
    if(!pendingAnchor)return;
    const target=byId(pendingAnchor==="history"?"f4BankAppMobileHistory":"f4BankAppStatementTools");
    if(!target||target.closest(".hidden"))return;
    const anchor=pendingAnchor;pendingAnchor="";
    requestAnimationFrame(()=>target.scrollIntoView({behavior:"smooth",block:anchor==="report"?"center":"start"}));
  }
  function ensureSavings(){
    if(role!=="member")return;
    const page=byId("pagePribadi"),privateData=byId("v12Private");
    if(!page||!privateData)return;
    if(!byId("f4BankSavingsHero")){
      const hero=element("section","f4-bank-savings-hero");
      hero.id="f4BankSavingsHero";
      hero.innerHTML='<span class="f4-bank-savings-hero-label">SALDO TABUNGAN</span><strong id="f4BankSavingsBalance">—</strong><span id="f4BankSavingsName">—</span><span class="f4-bank-savings-hero-note">Saldo dari penjualan yang sudah sah</span>';
      privateData.insertBefore(hero,privateData.firstChild);
      const sourceBalance=byId("v12Balance");
      if(sourceBalance){
        const update=()=>{const value=sourceBalance.textContent.trim();byId("f4BankSavingsBalance").textContent=value||"—";};
        new MutationObserver(update).observe(sourceBalance,{childList:true,characterData:true,subtree:true});
        update();
      }
    }
    if(!byId("f4BankSavingsChart")){
      const chart=element("section","f4-bank-savings-chart");
      chart.id="f4BankSavingsChart";
      chart.innerHTML='<div class="f4-bank-mobile-section-head"><h3>Perkembangan Setoran</h3><span>Berat (kg)</span></div><div id="f4BankSavingsBars" class="f4-bank-savings-bars">Memuat data...</div>';
      privateData.querySelector(".stats")?.after(chart);
    }
    if(!byId("f4BankAppMobileHistory")){
      const table=byId("v12History");
      if(table){
        const ledger=element("section","f4-bank-app-mobile-history");
        ledger.id="f4BankAppMobileHistory";
        ledger.innerHTML='<div class="f4-bank-mobile-section-head"><h3>Mutasi Tabungan</h3><span>Masuk / Keluar</span></div><div id="f4BankMonthFilter" class="f4-bank-month-filter" aria-label="Pilih periode transaksi"></div><div id="f4BankMobileHistoryList" class="f4-bank-mobile-history-list"></div>';
        table.after(ledger);
        if(!savingsObserver){
          savingsObserver=new MutationObserver(renderMobileHistory);
          savingsObserver.observe(table,{childList:true,subtree:true,characterData:true});
        }
      }
    }
    if(!byId("f4BankAppStatementTools")){
      const toolbar=privateData.querySelector(".f4-member-tools");
      if(toolbar){toolbar.id="f4BankAppStatementTools";toolbar.setAttribute("aria-label","Cetak atau unduh laporan tabungan");}
    }
    if(!depositsObserver){
      const deposits=byId("v12Deposits");
      if(deposits){depositsObserver=new MutationObserver(renderSavingsChart);depositsObserver.observe(deposits,{childList:true,subtree:true,characterData:true});}
    }
    renderMobileHistory();
    renderSavingsChart();
    updateIdentity();
  }
  function renderMobileHistory(){
    const host=byId("f4BankMobileHistoryList"),months=byId("f4BankMonthFilter"),table=byId("v12History");
    if(!host||!months||!table)return;
    const records=[...table.querySelectorAll("tbody tr")].map(tr=>{
      const cells=[...tr.cells].map(c=>c.textContent.trim());
      return {date:cells[0]||"",name:cells[1]||"Transaksi",credit:moneyAmount(cells[2]),debit:moneyAmount(cells[3]),balance:cells[4]||"",month:formatMonth(cells[0])};
    });
    months.replaceChildren();
    if(!records.length){host.textContent="Belum ada transaksi.";scrollToSavingAnchor();return;}
    const choices=[...new Set(records.map(r=>r.month).filter(Boolean))].sort().reverse();
    if(monthFilter==="latest")monthFilter=choices[0]||"all";
    if(monthFilter!=="all"&&!choices.includes(monthFilter))monthFilter=choices[0]||"all";
    const selection=[["all","Semua"],...choices.map(v=>{
      const [year,m]=v.split("-").map(Number);
      const month=new Intl.DateTimeFormat("id-ID",{month:"short"}).format(new Date(year,m-1,1));
      return [v,month+" "+year];
    })];
    for(const [value,label] of selection){
      const btn=element("button","f4-bank-month-chip"+(monthFilter===value?" is-active":""),label);
      btn.type="button";btn.setAttribute("aria-pressed",String(monthFilter===value));
      btn.onclick=()=>{monthFilter=value;renderMobileHistory();};
      months.append(btn);
    }
    const rows=records.filter(r=>monthFilter==="all"||r.month===monthFilter);
    host.replaceChildren();
    for(const item of rows){
      const incoming=item.credit>0&&item.debit<=0;
      const amount=item.debit>0?item.debit:item.credit;
      const line=element("article","f4-bank-history-line");
      const symbol=element("span","f4-bank-history-icon "+(incoming?"is-in":"is-out"),incoming?"↓":"↑");
      symbol.setAttribute("aria-hidden","true");
      const copy=element("span","f4-bank-history-copy");
      copy.append(element("strong","",item.name),element("small","",item.date));
      const right=element("span","f4-bank-history-amount "+(incoming?"is-in":"is-out"));
      right.append(element("b","",(incoming?"+ ":"− ")+"Rp "+amount.toLocaleString("id-ID")),element("small","","Saldo "+item.balance));
      line.append(symbol,copy,right);
      host.append(line);
    }
    if(!rows.length)host.textContent="Tidak ada transaksi pada periode ini.";
    scrollToSavingAnchor();
  }
  function renderSavingsChart(){
    const host=byId("f4BankSavingsBars"),deposits=byId("v12Deposits");
    if(!host||!deposits)return;
    const totals=new Map();
    for(const details of deposits.querySelectorAll("details")){
      const summary=details.querySelector("summary")?.textContent||"";
      const dateKey=formatMonth(summary);
      const weight=summary.match(/([\d.,]+)\s*kg\b/i);
      if(!dateKey||!weight)continue;
      const raw=weight[1].replace(/\./g,"").replace(",",".");
      const kg=Number(raw);
      if(!Number.isFinite(kg)||kg<0)continue;
      totals.set(dateKey,(totals.get(dateKey)||0)+kg);
    }
    host.replaceChildren();
    if(!totals.size){host.textContent="Belum ada data berat setoran.";return;}
    const data=[...totals].sort((a,b)=>a[0].localeCompare(b[0])).slice(-6);
    const max=Math.max(0.001,...data.map(x=>x[1]));
    for(const [key,value] of data){
      const [year,m]=key.split("-").map(Number);
      const month=new Intl.DateTimeFormat("id-ID",{month:"short"}).format(new Date(year,m-1,1));
      const bar=element("div","f4-bank-savings-bar");
      const amount=element("b","",value.toLocaleString("id-ID",{maximumFractionDigits:2}));
      const rail=element("span","f4-bank-savings-bar-rail");
      const fill=element("i","");fill.style.height=Math.max(5,Math.round(value/max*100))+"%";
      rail.append(fill);
      bar.append(amount,rail,element("small","",month));
      bar.setAttribute("aria-label",month+" "+year+": "+value.toLocaleString("id-ID")+" kilogram");
      host.append(bar);
    }
  }
  function init(){
    if(started)return;started=true;
    ensureHome();ensureDock();
    const primary=byId("v14Primary");
    if(primary){
      primaryObserver=new MutationObserver(updateHero);
      primaryObserver.observe(primary,{childList:true,characterData:true,subtree:true});
    }
    const extra=byId("v14Extra");
    if(extra)new MutationObserver(updateHero).observe(extra,{childList:true,characterData:true,subtree:true});
    for(const id of ["pName","pHome"])if(byId(id))new MutationObserver(updateIdentity).observe(byId(id),{childList:true,characterData:true,subtree:true});
    // Keep the legacy navigation and permission checks as the only routing authority.
    const original=window.goPage;
    if(typeof original==="function"){
      window.goPage=function(page,...args){
        const result=original.call(this,page,...args);
        currentPage=page;
        syncRole();
        return result;
      };
    }
    const bodyObserver=new MutationObserver(syncRole);
    bodyObserver.observe(document.body,{attributes:true,attributeFilter:["data-f4-bank-role"]});
    const dashboard=byId("dashboardView");
    if(dashboard){
      const viewObserver=new MutationObserver(syncRole);
      viewObserver.observe(dashboard,{attributes:true,attributeFilter:["class"]});
    }
    const publicView=byId("v11Public");
    if(publicView){
      const publicObserver=new MutationObserver(syncRole);
      publicObserver.observe(publicView,{attributes:true,attributeFilter:["class"]});
    }
    syncRole();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
