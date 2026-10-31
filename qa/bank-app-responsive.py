"""Admin Bank Sampah layout regression. Offline fixtures only; never writes live D1."""
import asyncio
from playwright.async_api import async_playwright

ROOT="http://127.0.0.1:8765"
HTML="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://127.0.0.1:8765/">
<link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
<style>.hidden{display:none}.section{padding:20px;max-width:100%;box-sizing:border-box}
@media(min-width:1024px){.section{margin-left:244px}}</style></head>
<body data-f4-bank-role="admin">
<div id="dashboardView"><div class="mobile-nav"><button id="v18PrivateMenuButton">☰</button></div>
<div class="section">
<div id="pageDashboard" class="v14-home">
<div class="v14-head"><h2 id="v14Title">Ringkasan</h2></div><div class="v14-hero">Program</div>
<div id="v14Primary"><div class="v14-kpi"><small class="v14-kpi-label">Hasil diterima lapak</small><strong>Rp 6.000</strong></div></div>
<div id="v14Extra"></div><div id="v14Status"></div>
<div class="v14-panels">
<section class="v14-panel"><div class="v14-panel-head"><h3>Setoran terbaru</h3></div>
<div id="v14Recent">Heri — 1 kg</div></section>
<section class="v14-panel"><div class="v14-panel-head"><h3>Perkembangan</h3></div><div id="v14Activities">Pembuatan drop point</div></section>
</div>
</div>
<div id="pageTabungan" class="hidden"><div class="f4-savings-utility"></div>
<section class="f4-savings-payout"><form id="v9Form"><input id="v9Member"><input id="v9Amount"></form></section>
<section class="f4-savings-history"><div id="v9History">Riwayat</div></section></div>
<div id="pageProfile" class="hidden"><div id="pName">Pengurus</div><div id="pHome">A5/41</div><div id="pId">W017</div></div>
</div></div>
<script>window.goPage=(name)=>{
document.querySelectorAll('#pageDashboard,#pageTabungan,#pageProfile').forEach(n=>n.classList.add('hidden'));
const target=document.getElementById('page'+name[0].toUpperCase()+name.slice(1));
if(target)target.classList.remove('hidden');
};</script>
</body></html>"""

# Keep the member dashboard layout and white card palette under browser checks too.
MEMBER_HTML = """<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<base href="http://127.0.0.1:8765/">
<link rel="stylesheet" href="/portal-live/bank-member-polish.css">
<link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
<style>body{margin:0;font-family:system-ui;background:#fff}.grid{display:grid;grid-template-columns:242px minmax(0,1fr)}
.section{min-width:0;padding:0}#pageDashboard{padding:0}
@media(max-width:760px){.grid{display:block}}</style></head>
<body class="f4-bank-app-private f4-bank-app-member" data-f4-bank-role="warga">
<div id="dashboardView"><div class="grid"><aside id="sideNav">Navigasi</aside><main class="section">
<section id="pageDashboard" class="v14-home f4-member-dashboard">
<div id="f4BankAppHome" data-bank-role="member">
<div class="f4-bank-app-personal-greeting"><strong>Halo, Anggota!</strong></div>
<button class="f4-bank-member-card"><span>BANK SAMPAH</span><span>W017</span></button>
<button class="f4-bank-app-member-balance"><small>Saldo sah</small><strong>Rp 3.000</strong></button>
<section class="f4-bank-weigh-schedule"><span>Jadwal timbang</span></section>
<details id="f4MemberFlow" class="f4-member-flow" open><summary class="f4-member-flow-head">
<span class="f4-member-flow-icon">✦</span><span class="f4-member-flow-copy"><strong>Cara setor sampah</strong><small>Pilah → Antar → Timbang → Saldo</small></span>
<span class="f4-member-flow-toggle">Lihat alur</span></summary><div class="f4-member-flow-body">
<ol class="f4-member-flow-steps">
<li><span class="f4-member-flow-number">1</span><div><strong>Pilah di rumah</strong><p>Pisahkan sesuai jenis</p></div></li>
<li><span class="f4-member-flow-number">2</span><div><strong>Antar ke gudang</strong><p>Datang saat ada petugas</p></div></li>
<li><span class="f4-member-flow-number">3</span><div><strong>Timbang dan catat</strong><p>Petugas mencatat</p></div></li>
<li><span class="f4-member-flow-number">4</span><div><strong>Saldo sah</strong><p>Setelah hasil jual disahkan</p></div></li>
</ol></div></details>
<section class="v14-panel"><h3>Setoran pribadi terbaru</h3><div class="f4-member-recent">27 Okt 2026 — Rp 2.250</div></section>
</div></section></main></div></div></body></html>"""

async def member_layout(browser):
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":850})
        await page.set_content(MEMBER_HTML,wait_until="load")
        result=await page.evaluate("""() => {
            const rect=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
            const steps=[...document.querySelectorAll('#f4MemberFlow .f4-member-flow-steps>li')];
            return {
                recent:rect('#f4BankAppHome>.v14-panel'),
                guide:rect('#f4MemberFlow'),
                steps:steps.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})),
                guideColor:getComputedStyle(document.querySelector('#f4MemberFlow')).backgroundColor,
                stepColors:steps.map(el=>getComputedStyle(el).backgroundColor),
                balanceColor:getComputedStyle(document.querySelector('#f4BankAppHome>.f4-bank-app-member-balance')).backgroundColor,
                overflow:document.documentElement.scrollWidth>window.innerWidth+3
            };
        }""")
        assert not result["overflow"],(device,result)
        assert result["guideColor"]=="rgb(255, 255, 255)",(device,result)
        assert result["balanceColor"]=="rgb(255, 255, 255)",(device,result)
        assert all(c=="rgb(255, 255, 255)" for c in result["stepColors"]),(device,result)
        if device=="pc":
            assert result["recent"]["x"]<result["guide"]["x"],result
            assert result["recent"]["w"]>result["guide"]["w"],result
            assert abs(result["steps"][0]["y"]-result["steps"][1]["y"])<3,result
        else:
            assert result["guide"]["y"]<result["recent"]["y"],result
            assert result["steps"][1]["y"]>result["steps"][0]["y"],result
        print("MEMBER_LAYOUT_OK",device,result,flush=True)
        await page.close()

async def savings_chart(browser):
    """Ensure monthly bars are aggregated, period bars show weighings, and scroll is available."""
    page=await browser.new_page(viewport={"width":390,"height":850})
    await page.set_content(MEMBER_HTML,wait_until="load")
    await page.evaluate("""() => {
      document.querySelector('#sideNav').innerHTML='<div id="v16NavList">'+
        ['home','saving','withdrawal','statement','memberreport','progress','public'].map(g=>
         '<button class="v16-item" data-group="'+g+'">'+g+'</button>').join('')+'</div>';
      const main=document.querySelector('.section');
      const wallet=document.createElement('section');
      wallet.id='pagePribadi';wallet.className='card';
      wallet.innerHTML='<h2>Tabungan saya</h2><div id="v12Private"></div>';
      main.append(wallet);
      const profile=document.createElement('div');
      profile.id='pageProfile';profile.innerHTML='<span id="pName">Heri</span><span id="pHome">A5/41</span><span id="pId">W017</span>';
      main.append(profile);
      window.goPage=()=>{};
    }""")
    await page.add_script_tag(url=ROOT+"/portal-live/bank-mobile-app.js")
    await page.evaluate("""() => {
      const setoran=[
       {id:'a',tanggal:'2026-10-18',status:'Terkonfirmasi',beratKg:0.9,nilaiSahRp:750},
       {id:'b',tanggal:'2026-10-27',status:'Terkonfirmasi',beratKg:1,nilaiSahRp:2250},
       {id:'c',tanggal:'2026-11-02',status:'Terkonfirmasi',beratKg:2,nilaiSahRp:3000},
       {id:'d',tanggal:'2026-11-10',status:'Estimasi',beratKg:1.5,estimasiRp:700}
      ];
      window.dispatchEvent(new CustomEvent('f4-bank-member-statement',{detail:{
       wargaId:'W017',saldo:6000,totalMasuk:6000,totalCair:0,mutasi:[],setoran
      }}));
    }""")
    await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").first.wait_for()
    # The member's central dock icon is a white Rp, not the savings/card image.
    money_icon=await page.evaluate("""() => {
      const center=document.querySelector('#f4BankAppDock .f4-bank-app-dock-action:nth-child(3)');
      const icon=center?.querySelector('.f4-bank-app-action-icon');
      const currency=icon?.querySelector('.f4-bank-currency-mark');
      return {
        route:center?.dataset.bankAppRoute,label:center?.querySelector('.f4-bank-app-action-name')?.textContent,
        text:currency?.textContent,images:icon?.querySelectorAll('img').length,
        color:currency?getComputedStyle(currency).color:'',
        size:currency?getComputedStyle(currency).fontSize:'',
        overflow:document.documentElement.scrollWidth>window.innerWidth+3
      };
    }""")
    assert money_icon["route"]=="bank-payout" and money_icon["label"]=="Pencairan",money_icon
    assert money_icon["text"]=="Rp" and money_icon["images"]==0,money_icon
    assert money_icon["color"]=="rgb(255, 255, 255)" and not money_icon["overflow"],money_icon
    print("MEMBER_PAYOUT_RP_DOCK_OK",money_icon,flush=True)
    state=await page.evaluate("""() => {
      const root=document.querySelector('#f4BankSavingsBars');
      return {
       groups:[...document.querySelectorAll('.f4-bank-chart-groups button')].map(x=>x.textContent),
       select:!!document.querySelector('#f4BankChartPeriod'),
       month:[...root.querySelectorAll('.f4-bank-savings-bar')].map(x=>({
        label:x.querySelector('small').textContent,value:x.querySelector('strong').textContent
       })),
       visibleNav:[...document.querySelectorAll('#v16NavList .v16-item')].filter(x=>getComputedStyle(x).display!=='none').map(x=>x.dataset.group)
      };
    }""")
    assert state["groups"]==["Per bulan","Periode"],state
    assert not state["select"],state
    assert [x["value"] for x in state["month"]]==["0,9 kg","1 kg","2 kg","1,5 kg"],state
    assert state["visibleNav"]==["progress","public"],state
    assert await page.locator('.f4-bank-chart-groups button[data-group="period"]').get_attribute("aria-pressed")=="true"
    await page.locator('.f4-bank-chart-groups button[data-group="month"]').click()
    monthly_kg=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.querySelector('strong').textContent)")
    assert monthly_kg==["1,9 kg","3,5 kg"],monthly_kg
    await page.locator('.f4-bank-chart-groups button[data-group="period"]').click()
    period=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.querySelector('small').textContent)")
    assert period==["18/10","27/10","02/11","10/11"],period
    await page.locator('.f4-bank-chart-switch button[data-mode="rp"]').click()
    money=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.querySelector('strong').textContent)")
    assert money==["Rp 750","Rp 2.250","Rp 3.000","Rp 700"],money
    await page.locator('.f4-bank-chart-groups button[data-group="month"]').click()
    monthly_money=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.querySelector('strong').textContent)")
    assert monthly_money==["Rp 3.000","Rp 3.700"],monthly_money
    print("SAVINGS_CHART_OK",state,period,money,monthly_money,flush=True)
    await page.close()

async def admin_mobile_shell(browser):
    """Fixed unified header and bottom dock must remain stationary on Android-sized viewports."""
    page=await browser.new_page(viewport={"width":390,"height":820},device_scale_factor=1)
    html="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/portal-live/direct-shell.css">
    <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
    </head><body class="f4-direct-bank f4-bank-app-private f4-bank-app-admin v17-dashboard">
    <div id="f4-direct-bar">Header tetap</div>
    <div id="dashboardView">
     <div class="mobile-nav">Header lama</div>
     <div class="grid">
      <aside id="sideNav" class="side"><div id="v16NavList">
       <button class="v16-item" data-group="home">Beranda</button>
       <button class="v16-item" data-group="entry">Pencatatan</button>
       <button class="v16-item" data-group="money">Keuangan</button>
       <button class="v16-item" data-group="payout">Pencairan</button>
       <button class="v16-item" data-group="program">Kegiatan</button>
       <button class="v16-item" data-group="settings">Data & anggota</button>
       <button class="v16-item" data-group="public">Portal publik</button>
       <button class="v16-item f4-back-account">Profil pengurus</button>
      </div></aside>
      <main class="section" style="min-height:2400px">Halaman panjang</main>
     </div>
    </div>
    <nav id="f4BankAppDock" class="f4-bank-app-dock">
    <button class="f4-bank-app-dock-action is-active" aria-current="page" data-bank-app-route="dashboard"><span class="f4-bank-app-action-icon"><img src="/assets/icons/home.svg"></span><span class="f4-bank-app-action-name">Beranda</span></button>
    <button class="f4-bank-app-dock-action" data-bank-app-route="setoran"><span class="f4-bank-app-action-icon"><img src="/assets/icons/bank.svg"></span><span class="f4-bank-app-action-name">Setoran</span></button>
    <button class="f4-bank-app-dock-action" data-bank-app-route="laporan"><span class="f4-bank-app-action-icon"><img src="/assets/icons/book.svg"></span><span class="f4-bank-app-action-name">Laporan</span></button>
    <button class="f4-bank-app-dock-action" data-bank-app-route="penjualan"><span class="f4-bank-app-action-icon"><img src="/assets/icons/cash.svg"></span><span class="f4-bank-app-action-name">Penjualan</span></button>
    <button class="f4-bank-app-dock-action" data-bank-app-route="tabungan"><span class="f4-bank-app-action-icon"><img src="/assets/icons/pay.svg"></span><span class="f4-bank-app-action-name">Saldo</span></button>
    </nav>
    </body></html>"""
    await page.goto(ROOT,wait_until="domcontentloaded")
    await page.set_content(html,wait_until="load")
    await page.evaluate("window.scrollTo(0, 750)")
    await page.wait_for_timeout(100)
    state=await page.evaluate("""() => {
      const top=document.querySelector('#f4-direct-bar').getBoundingClientRect();
      const bottom=document.querySelector('#f4BankAppDock').getBoundingClientRect();
      const nav=document.querySelector('#v16NavList');
      const dock=document.querySelector('#f4BankAppDock');
      const actions=[...dock.querySelectorAll('.f4-bank-app-dock-action')];
      const positions=actions.map(b=>{const r=b.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right}});
      const center=actions[2].querySelector('.f4-bank-app-action-icon').getBoundingClientRect();
      const names=actions.map(b=>b.querySelector('.f4-bank-app-action-name').textContent);
      return {
        scroll:scrollY,positions,center:{w:center.width,h:center.height,y:center.y},
        dockY:bottom.y,dockCount:document.querySelectorAll(".f4-bank-app-dock").length,
        centerLabelGap:+(actions[2].querySelector(".f4-bank-app-action-name").getBoundingClientRect().top-
          center.bottom).toFixed(2),
        gapIconLabel:actions.map(b=>+(b.querySelector(".f4-bank-app-action-name").getBoundingClientRect().top-
          b.querySelector(".f4-bank-app-action-icon img").getBoundingClientRect().bottom).toFixed(2)),
        textBottomGap:+(bottom.bottom-actions[0].querySelector(".f4-bank-app-action-name").getBoundingClientRect().bottom).toFixed(2),
        dockPadding:getComputedStyle(document.querySelector("#dashboardView")).paddingBottom,
        activeBackground:getComputedStyle(actions[0]).backgroundColor,
        centerBackground:getComputedStyle(actions[2].querySelector(".f4-bank-app-action-icon")).backgroundColor,
        names,navHeight:dock.getBoundingClientRect().height,
        headerY:top.y,
        headerPosition:getComputedStyle(document.querySelector('#f4-direct-bar')).position,
        legacyDisplay:getComputedStyle(document.querySelector('#dashboardView .mobile-nav')).display,
        dockBottom:bottom.bottom,
        visible:[...nav.querySelectorAll('button')].filter(b=>getComputedStyle(b).display!=='none').map(b=>b.textContent),
        horizontalOverflow:document.documentElement.scrollWidth>innerWidth+3
      };
    }""")
    assert state["scroll"]>500,state
    assert abs(state["headerY"])<1 and state["headerPosition"]=="fixed",state
    assert abs(state["dockBottom"]-820)<2,state
    assert state["names"]==["Beranda","Setoran","Laporan","Penjualan","Saldo"],state
    assert abs(state["navHeight"]-64)<1,state
    assert all(0<=state["gapIconLabel"][i]<=7 for i in (0,1,3,4)),state
    assert 5<=state["textBottomGap"]<=17,state
    assert state["dockPadding"]=="72px",state
    assert all(x["w"]>50 and x["right"]<=391 for x in state["positions"]),state
    assert all(state["positions"][i]["x"]<state["positions"][i+1]["x"] for i in range(4)),state
    assert state["center"]["w"]>=45 and state["center"]["h"]>=45,state
    assert 2<=state["centerLabelGap"]<=10,state
    assert state["center"]["y"]<state["dockY"]-4,state
    assert state["dockCount"]==1,state
    assert state["activeBackground"]=="rgb(216, 237, 223)",state
    assert state["centerBackground"]=="rgb(255, 192, 38)",state
    assert state["legacyDisplay"]=="none",state
    assert state["visible"]==["Pencairan","Kegiatan","Data & anggota","Portal publik","Profil pengurus"],state
    assert not state["horizontalOverflow"],state
    # The admin hamburger restores the left slide drawer; no bottom dock routes appear twice.
    # Wait for any entrance/visibility transition before checking its closed state.
    await page.wait_for_timeout(260)
    drawer_before=await page.evaluate("""() => {
      const side=document.querySelector("#sideNav");
      return {visible:getComputedStyle(side).visibility,
        x:side.getBoundingClientRect().x,
        column:getComputedStyle(document.querySelector("#v16NavList")).flexDirection};
    }""")
    assert drawer_before["visible"]=="hidden" and drawer_before["x"]<0,drawer_before
    await page.evaluate('document.querySelector("#sideNav").classList.add("open")')
    await page.wait_for_timeout(260)
    drawer=await page.evaluate("""() => {
      const side=document.querySelector("#sideNav");
      const nav=document.querySelector("#v16NavList"),box=side.getBoundingClientRect();
      const buttons=[...nav.querySelectorAll("button")];
      return {visibility:getComputedStyle(side).visibility,
        transform:getComputedStyle(side).transform,top:box.top,left:box.left,
        width:box.width,height:box.height,display:getComputedStyle(nav).display,
        direction:getComputedStyle(nav).flexDirection,
        visible:buttons.filter(x=>getComputedStyle(x).display!=="none").map(x=>x.textContent),
        hiddenGroups:buttons.filter(x=>["home","entry","money"].includes(x.dataset.group)).every(x=>getComputedStyle(x).display==="none"),
        scrollOverflow:document.documentElement.scrollWidth>innerWidth+3};
    }""")
    assert drawer["visibility"]=="visible" and abs(drawer["top"]-56)<2,drawer
    assert abs(drawer["left"])<2 and 275<=drawer["width"]<=301,drawer
    assert drawer["display"]=="flex" and drawer["direction"]=="column",drawer
    assert drawer["hiddenGroups"],drawer
    assert len(drawer["visible"])==5 and all(name not in drawer["visible"] for name in
        ["Riwayat setoran","Riwayat penjualan","Cek selisih","Sahkan hasil","Pengeluaran"]),drawer
    assert drawer["visible"]==["Pencairan","Kegiatan","Data & anggota","Portal publik","Profil pengurus"],drawer
    assert not drawer["scrollOverflow"],drawer
    await page.evaluate('document.querySelector("#sideNav").classList.remove("open")')
    await page.wait_for_timeout(260)
    drawer_closed=await page.evaluate("""() => {
      const side=document.querySelector("#sideNav");
      return {x:side.getBoundingClientRect().x,visibility:getComputedStyle(side).visibility};
    }""")
    assert drawer_closed["x"]<0 and drawer_closed["visibility"]=="hidden",drawer_closed
    print("ADMIN_SLIDE_CATEGORIES_ONLY_OK",drawer,flush=True)
    # Tablet has no dock: primary admin groups must remain accessible in sidebar.
    await page.set_viewport_size({"width":820,"height":820})
    tablet=await page.evaluate("""() => ({
      dock:getComputedStyle(document.querySelector("#f4BankAppDock")).display,
      groups:[...document.querySelectorAll("#v16NavList .v16-item[data-group]")]
        .filter(x=>getComputedStyle(x).display!=="none").map(x=>x.dataset.group)
    })""")
    assert tablet["dock"]=="none" and all(g in tablet["groups"] for g in ["home","entry","money"]),tablet
    await page.set_viewport_size({"width":390,"height":820})
    # The exact same dock dimensions must apply when the role switches to member.
    member=await page.evaluate("""() => {
      document.body.classList.replace("f4-bank-app-admin","f4-bank-app-member");
      const dock=document.getElementById("f4BankAppDock");
      const first=dock.querySelector(".f4-bank-app-dock-action");
      const icon=first.querySelector(".f4-bank-app-action-icon img").getBoundingClientRect();
      const label=first.querySelector(".f4-bank-app-action-name").getBoundingClientRect();
      return {
        height:dock.getBoundingClientRect().height,
        bottom:dock.getBoundingClientRect().bottom,
        iconLabelGap:+(label.top-icon.bottom).toFixed(2),
        textBottomGap:+(dock.getBoundingClientRect().bottom-label.bottom).toFixed(2),
        padding:getComputedStyle(document.querySelector("#dashboardView")).paddingBottom
      };
    }""")
    assert abs(member["height"]-state["navHeight"])<1,(state,member)
    assert abs(member["bottom"]-state["dockBottom"])<1,(state,member)
    assert abs(member["iconLabelGap"]-state["gapIconLabel"][0])<1,(state,member)
    assert abs(member["textBottomGap"]-state["textBottomGap"])<1,(state,member)
    assert member["padding"]==state["dockPadding"],(state,member)
    print("ADMIN_AND_MEMBER_DOCK_PARITY_OK",state,member,flush=True)
    await page.close()

async def public_chart_and_flat_roster(browser):
    """Actual Bank Sampah styles: 33 saldo rows follow page scroll; public chart switches units."""
    import re
    from pathlib import Path
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    roster_css=re.search(r'<style id="f4-bank-savings-compact-20261028">(.*?)</style>',source,re.S)
    if not roster_css: raise AssertionError("Roster stylesheet unavailable")
    rows="".join(
        '<div class="f4-saldo-row" role="listitem"><div class="f4-saldo-person">'
        f'<strong class="f4-saldo-name">Warga {i}</strong><small class="f4-saldo-house">A5/{i}</small>'
        f'</div><strong class="f4-saldo-amount">Rp {i*1000:,}</strong></div>'
        for i in range(1,34))
    for label,width in [("hp",390),("pc",1366)]:
        page=await browser.new_page(viewport={"width":width,"height":820})
        markup=f"""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
        <base href="http://127.0.0.1:8765/">
        <link rel="stylesheet" href="/portal-live/modern-portals.css">
        <style>body{{margin:0;font-family:system-ui}} #dashboardView{{max-width:100%;padding:12px}}
        #pageTabungan{{padding:10px}} .f4-savings-main{{display:block}}</style>
        <style>{roster_css.group(1)}</style></head>
        <body class="f4-direct-bank f4-bank-app-private f4-bank-app-admin">
        <div id="dashboardView"><section id="pageTabungan">
        <div class="f4-savings-main"><section class="f4-savings-roster f4-savings-members">
        <div class="f4-savings-panel-title"><h3>Saldo anggota</h3></div>
        <div class="f4-bs-saldo-finder"><input placeholder="Cari anggota"></div>
        <div id="v9List"><div class="f4-saldo-list" role="list">{rows}</div></div>
        </section></div></section></div></body></html>"""
        await page.set_content(markup,wait_until="load")
        values=await page.evaluate("""() => {
          const area=document.querySelector("#v9List"),frame=document.querySelector(".f4-savings-roster");
          const last=document.querySelector(".f4-saldo-row:last-child");
          return {count:document.querySelectorAll(".f4-saldo-row").length,
            overflow:getComputedStyle(area).overflowY,maxHeight:getComputedStyle(area).maxHeight,
            paneBorder:getComputedStyle(frame).borderTopWidth,areaBorder:getComputedStyle(area).borderTopWidth,
            scrollHeight:document.documentElement.scrollHeight,viewport:innerHeight,
            lastBottom:last.getBoundingClientRect().bottom,overflowX:document.documentElement.scrollWidth>innerWidth+2};
        }""")
        assert values["count"]==33,(label,values)
        assert values["overflow"]=="visible" and values["maxHeight"]=="none",(label,values)
        assert values["paneBorder"]=="0px" and values["areaBorder"]=="0px",(label,values)
        assert values["scrollHeight"]>values["viewport"]+300 and not values["overflowX"],(label,values)
        await page.evaluate("window.scrollTo(0,document.documentElement.scrollHeight)")
        assert await page.evaluate("scrollY>300"),(label,values)
        print("FLAT_MANAGER_ROSTER_OK",label,values,flush=True)
        await page.close()

    def between(start,end):
        begin=source.index(start);finish=source.index(end,begin)
        return source[begin:finish]
    chart_js=between("  function v17Chart(root,rows,keys,colorNames){","  async function v17LoadFinance(){")
    public_js=between("  let v17PublicChartMode='berat';","  async function v17LoadPublic(){")
    page=await browser.new_page(viewport={"width":390,"height":820})
    await page.set_content("""<!doctype html><html><body><section id="v17Perkembangan">
    <div class="f4-public-chart-tabs"><button data-public-chart-mode="berat">Berat (kg)</button>
    <button data-public-chart-mode="nilai">Nilai (Rp)</button></div>
    <div id="v17PublicChartLegend"></div><div id="v17WeightBars"></div>
    <p id="v17WeightNote"></p></section></body></html>""")
    helpers="""const $=id=>document.getElementById(id);
    const kg=n=>Number(n).toLocaleString('id-ID')+' kg';
    const rupiah=n=>'Rp '+Number(n).toLocaleString('id-ID');
    const v17Label=value=>String(value||'').slice(5)||'—';"""
    await page.add_script_tag(content=helpers+chart_js+public_js+"""
    v17PublicChartRows=[
      {periode:'2026-09',beratKg:1.2,pendingWeightKg:0.3,hakWarga:750,pendingEstimateRp:1000},
      {periode:'2026-10',beratKg:1.9,pendingWeightKg:0,hakWarga:2250,pendingEstimateRp:0}
    ];
    v17PublicReportReady=true;v17BindPublicChart();v17RenderPublicChart();""")
    weight=await page.evaluate("""() => ({
      bars:document.querySelectorAll("#v17WeightBars .v17-bar-group").length,
      note:document.querySelector("#v17WeightNote").textContent,
      legend:document.querySelector("#v17PublicChartLegend").textContent,
      firstBar:document.querySelector("#v17WeightBars .v17-bar")?.title
    })""")
    assert weight["bars"]==2 and "3,1 kg" in weight["note"],weight
    assert "Timbang belum sah" in weight["legend"] and "kg" in weight["firstBar"],weight
    await page.locator('[data-public-chart-mode="nilai"]').click()
    money=await page.evaluate("""() => ({
      bars:document.querySelectorAll("#v17WeightBars .v17-bar-group").length,
      note:document.querySelector("#v17WeightNote").textContent,
      legend:document.querySelector("#v17PublicChartLegend").textContent,
      firstBar:document.querySelector("#v17WeightBars .v17-bar")?.title,
      active:document.querySelector('[data-public-chart-mode="nilai"]').getAttribute("aria-pressed")
    })""")
    assert money["bars"]==2 and "Rp 3.000" in money["note"],money
    assert money["active"]=="true" and "Hak warga sah" in money["legend"],money
    assert "Rp" in money["firstBar"] and "kg" not in money["firstBar"],money
    print("ONE_PUBLIC_CHART_TWO_UNITS_OK",weight,money,flush=True)
    await page.close()


async def public_report_compact(browser):
    """PC cards have a width ceiling; mobile cards remain two columns without overflow."""
    import re
    from pathlib import Path
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    core=re.search(r'<style>(.*?)</style>',source,re.S)
    if not core: raise AssertionError("Canonical report style missing")
    rows=[
      ("Berat sah","1,9 kg"),("Belum sah","0 kg"),
      ("Penjualan","Rp 6.000"),("Hak warga","Rp 3.000"),
      ("Dana lingkungan","Rp 3.000"),("Perkiraan","Rp 0")
    ]
    cards="".join('<div class="v17-public-metric"><small>'+label+'</small><strong>'+val+'</strong></div>' for label,val in rows)
    for width in (1366,1024,768,390,320):
        page=await browser.new_page(viewport={"width":width,"height":820},device_scale_factor=1)
        markup="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
        <base href="http://127.0.0.1:8765/">
        <style>"""+core.group(1)+"""</style>
        <link rel="stylesheet" href="/portal-live/modern-portals.css">
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
        </head><body><section id="v11Public" style="width:calc(100% - 22px);margin:0 11px">
        <div id="v25ReportRoot"><div id="v25ReportMetrics" class="v25-public-metrics v26-compact">"""+cards+"""</div></div></section></body></html>"""
        await page.goto(ROOT,wait_until="domcontentloaded")
        await page.set_content(markup,wait_until="load")
        metrics=await page.evaluate("""() => {
          const grid=document.querySelector("#v25ReportMetrics");
          const items=[...grid.querySelectorAll(".v17-public-metric")];
          return {
            heights:items.map(n=>Math.round(n.getBoundingClientRect().height)),
            widths:items.map(n=>Math.round(n.getBoundingClientRect().width)),
            positions:items.map(n=>Math.round(n.getBoundingClientRect().top)),
            valueFonts:items.map(n=>parseFloat(getComputedStyle(n.querySelector("strong")).fontSize)),
            padding:getComputedStyle(items[0]).padding,
            columns:getComputedStyle(grid).gridTemplateColumns.split(" ").length,
            overflow:document.documentElement.scrollWidth>innerWidth+3
          };
        }""")
        assert len(metrics["heights"])==6,metrics
        assert max(metrics["heights"])<=105 and min(metrics["heights"])>=60,metrics
        assert all(15.5<=font<=19 for font in metrics["valueFonts"]),metrics
        if width<=640:
            assert metrics["columns"]==2,metrics
            assert all(w<=190 for w in metrics["widths"]),metrics
        else:
            assert metrics["columns"]>=3,metrics
            assert max(metrics["widths"])<=190,metrics
        assert not metrics["overflow"],metrics
        print("PUBLIC_REPORT_COMPACT_OK",width,metrics,flush=True)
        await page.close()


async def member_profile_inline_name(browser):
    """The member edits only their display alias directly beside the existing name."""
    from pathlib import Path
    source=Path('portal-live/bank-mobile-app.js').read_text(encoding='utf-8')
    start=source.index('function inlineMemberDisplayName(){')
    end=source.index('function updateProfileCard(){',start)
    script=source[start:end]
    page=await browser.new_page(viewport={"width":390,"height":820})
    markup="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <base href="http://127.0.0.1:8765/">
    <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
    </head><body><div id="dashboardView"><section id="pageProfile">
    <div class="f4-profile-identity"><small>Nama anggota</small><strong id="pName">Heri Awal</strong></div>
    </section><span id="greeting"></span><span id="welcomeName"></span>
    <span id="v15AccountName"></span><div id="f4BankAppHome"><div class="f4-bank-app-personal-greeting"><strong>Halo, Heri Awal!</strong></div></div>
    </div></body></html>"""
    await page.goto(ROOT,wait_until='domcontentloaded')
    await page.set_content(markup,wait_until='load')
    helpers="""const role="member";const $=id=>document.getElementById(id);
    const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
    const roleType=()=>role;
    window.__saved=[];
    const api=async(path,payload)=>{
      window.__saved.push({path,payload});
      return {ok:true,profile:{nama:payload.nama}};
    };
    window.__updatedName=null;
    window.addEventListener('f4-account-profile-updated',e=>{window.__updatedName=e.detail.nama});"""
    await page.add_script_tag(content=helpers+script+"inlineMemberDisplayName();inlineMemberDisplayName();")
    assert await page.locator('.f4-member-name-edit').count()==1
    assert await page.locator('.f4-member-name-row').count()==1
    await page.locator('.f4-member-name-edit').click()
    input=page.locator('.f4-member-name-input')
    assert await input.is_visible()
    await input.fill('Heri Tampilan')
    await input.press('Enter')
    await page.wait_for_function("document.getElementById('pName').textContent==='Heri Tampilan'")
    values=await page.evaluate("""() => ({
      name:document.getElementById('pName').textContent,
      account:document.getElementById('v15AccountName').textContent,
      greeting:document.getElementById('greeting').textContent,
      alias:window.__updatedName,
      saved:window.__saved,
      inputHidden:document.querySelector('.f4-member-name-input').hidden,
      overflow:document.documentElement.scrollWidth>innerWidth+3
    })""")
    assert values['name']==values['account']==values['alias']=='Heri Tampilan',values
    assert values['greeting']=='Halo, Heri Tampilan' and values['inputHidden'],values
    assert values['saved']==[{"path":"/api/member/profile","payload":{"nama":"Heri Tampilan"}}],values
    assert not values['overflow'],values
    await page.locator('.f4-member-name-edit').click()
    await input.fill('Nama Batal')
    await input.press('Escape')
    assert await page.locator('#pName').inner_text()=='Heri Tampilan'
    assert len(await page.evaluate('window.__saved'))==1
    print("MEMBER_INLINE_ALIAS_OK",values,flush=True)
    await page.close()


async def member_profile_dropdown_chevrons(browser):
    """Foto profil/password accordion must render identical right-side chevrons on HP/PC."""
    from pathlib import Path
    import re
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    main_style=re.search(r'<style>(.*?)</style>',source,re.S)
    if not main_style: raise AssertionError("Base Bank Sampah CSS missing")
    for size in (390,768,1366):
        page=await browser.new_page(viewport={"width":size,"height":820})
        markup="""<!doctype html><html lang="id"><head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <base href="http://127.0.0.1:8765/">
        <style>"""+main_style.group(1)+"""</style>
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css"></head>
        <body class="f4-direct-bank"><main id="dashboardView">
        <section id="pageProfile" class="card f4-profile-card" style="max-width:750px">
          <details id="v15PhotoPanel" class="f4-profile-edit">
            <summary>Ubah foto profil</summary><p>Form foto</p>
          </details>
          <details id="v15PasswordBox">
            <summary>Ganti password</summary><form><input type="password"></form>
          </details>
        </section></main></body></html>"""
        await page.goto(ROOT,wait_until="domcontentloaded")
        await page.set_content(markup,wait_until="load")
        def probe():
            return """() => {
              const ids=['v15PhotoPanel','v15PasswordBox'];
              return ids.map(id=>{
                const section=document.getElementById(id),summary=section.querySelector('summary');
                const block=summary.getBoundingClientRect(),after=getComputedStyle(summary,'::after');
                const own=getComputedStyle(summary),marker=getComputedStyle(summary,'::marker');
                return {id,open:section.open,display:own.display,listStyle:own.listStyleType,
                  paddingRight:own.paddingRight,paddingLeft:own.paddingLeft,
                  afterContent:after.content,afterRight:after.right,afterTransform:after.transform,
                  markerContent:marker.content,summaryRight:block.right,
                  text:summary.textContent.trim()};
              });
            }"""
        closed=await page.evaluate(probe())
        assert all(x["display"]=="block" and x["listStyle"]=="none" for x in closed),(size,closed)
        assert all(x["afterContent"] not in ("none","normal") for x in closed),(size,closed)
        assert all(x["afterRight"]=="16px" for x in closed),(size,closed)
        assert all(x["paddingRight"]==closed[0]["paddingRight"] and
                   x["paddingLeft"]==closed[0]["paddingLeft"] for x in closed),(size,closed)
        assert all(x["markerContent"] in ('""',"none") for x in closed),(size,closed)
        assert closed[0]["afterTransform"]==closed[1]["afterTransform"],(size,closed)
        assert closed[0]["text"]=="Ubah foto profil" and closed[1]["text"]=="Ganti password",(size,closed)
        await page.locator("#v15PhotoPanel summary").click()
        await page.locator("#v15PasswordBox summary").click()
        # CSS transitions start at slightly different times; inspect the settled final state.
        await page.wait_for_timeout(230)
        opened=await page.evaluate(probe())
        assert all(x["open"] for x in opened),(size,opened)
        assert opened[0]["afterTransform"]==opened[1]["afterTransform"],(size,opened)
        assert opened[0]["afterTransform"]!=closed[0]["afterTransform"],(size,closed,opened)
        await page.locator("#v15PasswordBox summary").focus()
        await page.keyboard.press("Enter")
        assert not await page.locator("#v15PasswordBox").evaluate("(node)=>node.open"),size
        overflow=await page.evaluate("document.documentElement.scrollWidth>innerWidth+3")
        assert not overflow,(size,closed,opened)
        print("MEMBER_PROFILE_ACCORDION_PARITY_OK",size,closed,opened,flush=True)
        await page.close()


async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(args=["--no-sandbox"])
        for device,width in [("pc",1366),("hp",390)]:
            page=await browser.new_page(viewport={"width":width,"height":850},device_scale_factor=1)
            await page.set_content(HTML,wait_until="load")
            await page.add_script_tag(url=ROOT+"/portal-live/bank-mobile-app.js")
            await page.evaluate("""() => window.dispatchEvent(new CustomEvent('f4-bank-admin-overview',{
                detail:{kasMilikBankRp:1500,kasGabunganRp:6000,hakWargaBelumCairRp:3000,
                kasLingkunganRp:1500,diterimaLapakRp:6000,wargaAktif:33}
            }))""")
            await page.locator("#f4BankAppHome").wait_for()
            state=await page.evaluate("""() => {
                const box=(selector)=>{
                  const r=document.querySelector(selector).getBoundingClientRect();
                  return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right};
                };
                return {
                    hero:box('#f4BankAppAdminHero'),
                    metrics:box('#f4BankAppMinis'),
                    tiles:[...document.querySelectorAll('#f4BankAppMinis .f4-bank-app-mini')].map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}),
                    home:box('#f4BankAppHome'),
                    dock:getComputedStyle(document.querySelector('#f4BankAppDock')).display,
                    labels:[...document.querySelectorAll('#f4BankAppDock .f4-bank-app-action-name')].map(n=>n.textContent),
                    account:document.querySelector('#f4BankAppBalance').textContent,
                    quick:[...document.querySelectorAll('#f4BankAppHome button')].map(n=>n.textContent.trim()),
                    overflow:document.documentElement.scrollWidth>window.innerWidth+3
                };
            }""")
            assert state["account"]=="Rp 1.500",(device,state)
            assert state["labels"][2]=="Laporan" and "Menu" not in state["labels"],state
            assert not state["overflow"],state
            if device=="pc":
                assert state["home"]["w"]>850,state
                assert state["metrics"]["y"]>=state["hero"]["y"]+state["hero"]["h"]-3,state
                assert len(state["tiles"])==4 and abs(state["tiles"][0]["y"]-state["tiles"][3]["y"])<3,state
                assert state["dock"]=="none",state
            else:
                assert state["metrics"]["y"]>=state["hero"]["y"]+state["hero"]["h"]-2,state
                assert len(state["tiles"])==4 and state["tiles"][2]["y"]>state["tiles"][0]["y"],state
                assert state["dock"]!="none",state
            assert "+ Catat setoran" in state["quick"],state
            assert await page.locator("#f4BankManualPayout").count()==1
            assert not await page.locator("#f4BankManualPayout").get_attribute("open")
            assert await page.locator("#f4BankManualPayout #v9Form").count()==1
            await page.screenshot(path=f"ops-audit/bank-eco-theme/manager-{device}.png",full_page=True)
            print("MANAGER_RESPONSIVE_OK",device,state,flush=True)
            await page.close()
        await member_layout(browser)
        await savings_chart(browser)
        await admin_mobile_shell(browser)
        await public_chart_and_flat_roster(browser)
        await public_report_compact(browser)
        await member_profile_inline_name(browser)
        await member_profile_dropdown_chevrons(browser)
        await browser.close()
if __name__=="__main__":
    asyncio.run(main())
