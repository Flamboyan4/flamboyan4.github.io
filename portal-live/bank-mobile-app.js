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
    {title:"Kegiatan",route:"progress",icon:"calendar.svg"},
    {title:"Profil",route:"profile",icon:"user.svg"},
    {title:"Portal",route:"public",icon:"home.svg"}
  ];
  const adminDock=[
    {title:"Beranda",route:"dashboard",icon:"home.svg"},
    {title:"Setoran",route:"setoran",icon:"bank.svg"},
    {title:"Penjualan",route:"penjualan",icon:"cash.svg"},
    {title:"Menu",route:"menu",icon:"menu.svg"}
  ];
  const memberDock=[
    {title:"Beranda",route:"dashboard",icon:"home.svg"},
    {title:"Tabungan",route:"pribadi",icon:"cash.svg"},
    {title:"Kegiatan",route:"progress",icon:"calendar.svg"},
    {title:"Profil",route:"profile",icon:"user.svg"}
  ];
  let role=null, currentPage="dashboard", primaryObserver=null, started=false;
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
  }
  function syncRole(){
    const next=roleType();
    const privateView=!!next&&!byId("dashboardView")?.classList.contains("hidden");
    document.body.classList.toggle("f4-bank-app-private",privateView);
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
    updateHero();
    updateDock();
  }
  function init(){
    if(started)return;started=true;
    ensureHome();ensureDock();
    const primary=byId("v14Primary");
    if(primary){
      primaryObserver=new MutationObserver(updateHero);
      primaryObserver.observe(primary,{childList:true,characterData:true,subtree:true});
    }
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
