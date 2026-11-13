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

# Keep the member dashboard layout and the new fresh eco palette under browser checks too.
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
<button class="f4-bank-app-member-balance"><small>Saldo sah</small><strong>Rp 3.000</strong></button>\n<button id="f4MemberPriceShortcut" class="f4-bank-price-shortcut">Daftar Harga</button>
<section id="f4BankWeighingSchedule" class="f4-bank-weigh-schedule"><span>Jadwal timbang</span></section>
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
                price:rect('#f4MemberPriceShortcut'),
                schedule:rect('#f4BankWeighingSchedule'),
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
        assert result["balanceColor"]=="rgb(232, 247, 207)",(device,result)
        assert all(c=="rgb(247, 252, 245)" for c in result["stepColors"]),(device,result)
        if device=="pc":
            assert abs(result["price"]["y"]-result["schedule"]["y"])<2,(device,result)
            assert result["price"]["x"]+result["price"]["w"]<result["schedule"]["x"]+2,(device,result)
            assert result["recent"]["x"]<result["guide"]["x"],result
            assert abs(result["recent"]["w"]-result["guide"]["w"])<3,result
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
    # The member payout dock must display a dedicated SVG asset, never a text Rp glyph.
    money_icon=await page.evaluate("""() => {
      const center=document.querySelector('#f4BankAppDock .f4-bank-app-dock-action:nth-child(3)');
      const icon=center?.querySelector('.f4-bank-app-action-icon');
      const currency=icon?.querySelector('.f4-bank-currency-mark');
      return {
        route:center?.dataset.bankAppRoute,label:center?.querySelector('.f4-bank-app-action-name')?.textContent,
        text:currency?.textContent,images:icon?.querySelectorAll('img').length,
        asset:icon?.querySelector('img')?.getAttribute('src')||null,
        overflow:document.documentElement.scrollWidth>window.innerWidth+3
      };
    }""")
    assert money_icon["route"]=="bank-payout" and money_icon["label"]=="Pencairan",money_icon
    assert money_icon["text"] is None and money_icon["images"]==1,money_icon
    assert money_icon["asset"]=="/assets/icons/pay.svg" and not money_icon["overflow"],money_icon
    print("MEMBER_PAYOUT_SVG_DOCK_OK",money_icon,flush=True)
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
    assert state["groups"]==["Periode","30 hari","Per bulan"],state
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
    assert money==["750","2,3 rb","3 rb","700"],money
    exact=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.getAttribute('aria-label'))")
    assert "Rp 2.250" in exact[1] and "Rp 3.000" in exact[2],exact
    await page.locator('.f4-bank-chart-groups button[data-group="month"]').click()
    monthly_money=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.querySelector('strong').textContent)")
    assert monthly_money==["3 rb","3,7 rb"],monthly_money
    print("SAVINGS_CHART_OK",state,period,money,monthly_money,flush=True)
    await page.close()

async def admin_mobile_shell(browser):
    """Admin has no duplicated bottom dock; the slide has six complete categories."""
    from pathlib import Path
    import re
    page=await browser.new_page(viewport={"width":390,"height":820},device_scale_factor=1)
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    inline=re.search(r"<style>(.*?)</style>",source,re.S|re.I)
    assert inline,"Source Bank Sampah styles are required"
    html="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/portal-live/direct-shell.css">
    <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
    </head><body class="f4-direct-bank f4-bank-app-private f4-bank-app-admin v17-dashboard">
    <div id="f4-direct-bar">Pengelola</div>
    <div id="dashboardView"><div class="mobile-nav">Legacy</div>
    <div class="grid"><aside id="sideNav" class="side">
      <div id="v16Navigation"><div id="v16NavList">
      <button class="v16-item" data-group="home">Beranda</button>
      <button class="v16-item" data-group="deposit">Setoran</button>
      <button class="v16-item" data-group="sale">Penjualan</button>
      <button class="v16-item" data-group="finance">Keuangan</button>
      <button class="v16-item" data-group="management">Pengelolaan</button>
      <button class="v16-item" data-group="report">Laporan</button>
      </div></div></aside>
      <main class="section" style="min-height:2400px">
      <button class="f4-bank-admin-back" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5"/></svg>Kembali</button>
      Halaman panjang</main>
    </div></div>
    <nav id="f4BankAppDock" class="f4-bank-app-dock" hidden></nav>
    </body></html>"""
    await page.goto(ROOT,wait_until="domcontentloaded")
    await page.set_content(html,wait_until="load")
    await page.add_style_tag(content=inline.group(1))
    await page.evaluate("window.scrollTo(0,750)")
    await page.wait_for_timeout(260)
    before=await page.evaluate("""() => {
      const side=document.querySelector("#sideNav"),header=document.querySelector("#f4-direct-bar");
      return {scroll:scrollY,headerTop:header.getBoundingClientRect().top,
        headerPosition:getComputedStyle(header).position,
        dock:getComputedStyle(document.querySelector("#f4BankAppDock")).display,
        padding:getComputedStyle(document.querySelector("#dashboardView")).paddingBottom,
        drawerVisible:getComputedStyle(side).visibility,
        nav:[...document.querySelectorAll("#v16NavList .v16-item")]
          .filter(b=>getComputedStyle(b).display!=="none").map(b=>b.dataset.group),
        overflow:document.documentElement.scrollWidth>innerWidth+3
      };
    }""")
    assert before["scroll"]>500,before
    assert before["headerPosition"]=="fixed" and abs(before["headerTop"])<1,before
    assert before["dock"]=="none" and before["padding"]=="8px",before
    assert before["drawerVisible"]=="hidden",before
    assert before["nav"]==["home","deposit","sale","finance","management","report"],before
    assert not before["overflow"],before
    await page.evaluate('document.querySelector("#sideNav").classList.add("open")')
    await page.wait_for_timeout(260)
    opened=await page.evaluate("""() => {
      const side=document.querySelector("#sideNav"),b=side.getBoundingClientRect();
      return {visible:getComputedStyle(side).visibility,top:b.top,left:b.left,width:b.width,
        height:b.height,direction:getComputedStyle(document.querySelector("#v16NavList")).flexDirection,
        overflow:document.documentElement.scrollWidth>innerWidth+3};
    }""")
    assert opened["visible"]=="visible" and abs(opened["top"]-56)<2,opened
    assert abs(opened["left"])<2 and 275<=opened["width"]<=301,opened
    assert opened["direction"]=="column" and not opened["overflow"],opened
    await page.evaluate('document.querySelector("#sideNav").classList.remove("open")')
    await page.wait_for_timeout(260)
    assert await page.evaluate('getComputedStyle(document.querySelector("#sideNav")).visibility')=="hidden"
    print("ADMIN_NO_DOCK_FULL_SLIDE_OK",before,opened,flush=True)
    await page.close()

async def public_chart_and_flat_roster(browser):
    """Actual Bank Sampah styles: 33 saldo rows follow page scroll; public chart switches units."""
    import re
    from pathlib import Path
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    # The former standalone roster styles were consolidated into the admin report style owner.
    roster_css=re.search(r'<style id="f4-bank-admin-report-compact-20261027">(.*?)</style>',source,re.S)
    if not roster_css or 'CSS owner consolidated from #f4-bank-savings-compact-20261028' not in roster_css.group(1):
        raise AssertionError("Consolidated roster stylesheet unavailable")
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
    # Verify the current public graph: weight only until authenticated.
    # The public Rp toggle and detailed date modes stay hidden.
    chart_js=between("  let v17PublicChartMode='berat',v17PublicChartRange='bulan';","  async function v17LoadPublic(){")
    page=await browser.new_page(viewport={"width":390,"height":820})
    await page.set_content("""<!doctype html><html><body><section id="v17Perkembangan">
    <button data-dev-range="bulan" aria-pressed="true">Per bulan</button>
    <button data-dev-range="30" hidden>30 hari</button>
    <button data-dev-mode="berat" aria-pressed="true">Kg</button>
    <button data-dev-mode="nilai" hidden>Rp</button>
    <div id="f4DevStats"></div><small id="f4DevChartPeriod"></small>
    <div id="f4DevChartSummary"></div><div id="f4DevChart"></div>
    <div id="f4DevLegend"></div><p id="f4DevChartNote"></p></section></body></html>""")
    helpers="""const $=id=>document.getElementById(id);
    const kg=n=>Number(n).toLocaleString('id-ID')+' kg';
    const rupiah=n=>'Rp '+Number(n).toLocaleString('id-ID');
    const v17Label=value=>String(value||'').slice(5)||'—';"""
    await page.add_script_tag(content=helpers+chart_js+"""
    v17PublicChartRows=[
      {periode:'2026-09',beratKg:1.2,pendingWeightKg:0.3,hasilPenjualan:1500},
      {periode:'2026-10',beratKg:1.9,pendingWeightKg:0,hasilPenjualan:4500}
    ];
    v17PublicReportReady=false;v17BindPublicChart();v17RenderPublicChart();""")
    weight=await page.evaluate("""() => ({
      bars:document.querySelectorAll("#f4DevChart .f4-dev-column").length,
      summary:document.querySelector("#f4DevChartSummary").textContent,
      legend:document.querySelector("#f4DevLegend").textContent,
      firstBar:document.querySelector("#f4DevChart .f4-dev-column-bar")?.title,
      privacy:document.querySelector('[data-dev-mode="nilai"]').hidden,
      privateDate:document.querySelector('[data-dev-range="30"]').hidden,
      chartText:document.querySelector("#f4DevChart").textContent
    })""")
    assert weight["bars"]==2 and "3,1 kg" in weight["summary"],weight
    assert "Berat sah" in weight["legend"] and "kg" in weight["firstBar"],weight
    assert weight["privacy"] and weight["privateDate"] and "Rp" not in weight["chartText"],weight
    print("PUBLIC_WEIGHT_CHART_PRIVACY_OK",weight,flush=True)
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
        # The current compact report cards intentionally use 49px rows / 15px values.
        assert max(metrics["heights"])<=80 and min(metrics["heights"])>=45,metrics
        assert all(13.5<=font<=19 for font in metrics["valueFonts"]),metrics
        if width<=640:
            assert metrics["columns"]==(2 if width<=360 else 3),metrics
            assert all(70<=w<=190 for w in metrics["widths"]),metrics
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
    icon_start=source.index("function bankUiSvg(name){")
    icon_end=source.index("function bankIconSpan(",icon_start)
    assert icon_start>=0 and icon_end>icon_start,"Canonical SVG helper is required"
    icon_helper=source[icon_start:icon_end]
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
    await page.add_script_tag(content=helpers+icon_helper+script+"inlineMemberDisplayName();inlineMemberDisplayName();")
    assert await page.locator(".f4-member-name-save svg, .f4-member-name-cancel svg").count()==2
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



async def note_print_is_visible(browser):
    """Three-stage sale: note printing must be discoverable and reprint idempotent.

    Browser fixture intercepts every note API request. It never writes to D1.
    """
    import json
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":820})
        await page.goto(ROOT,wait_until="domcontentloaded")
        fixture="""<!doctype html><html><head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
        <style>body{margin:0;font-family:system-ui}
        #dashboardView{max-width:980px;margin:auto;padding:16px}
        #pagePenjualan{background:#fff}</style></head>
        <body class="f4-bank-app-private f4-bank-app-admin">
        <div id="dashboardView"><main class="section"><section id="pagePenjualan">
        <h2>Penjualan</h2>
        <form id="saleForm"><div class="f4-entry-top-fields f4-sale-top-fields">
        <div class="field"><label for="saleBatch">Nomor penjualan</label>
        <select id="saleBatch"><option value="">Pilih kelompok</option>
        <option value="batch-qa">Batch contoh</option></select></div>
        <div class="field"><label for="saleDate">Tanggal</label><input id="saleDate" type="date"></div>
        </div><div id="saleItems"></div></form></section></main></div></body></html>"""
        await page.set_content(fixture,wait_until="load")
        prepared={"yes":False,"post":0,"get":0}
        async def mock_note(route):
            req=route.request
            headers={
                "access-control-allow-origin":ROOT,
                "access-control-allow-credentials":"true",
                "access-control-allow-methods":"GET,POST,OPTIONS",
                "access-control-allow-headers":"Content-Type",
                "content-type":"application/json"}
            if req.method=="OPTIONS":
                await route.fulfill(status=204,headers=headers,body="")
                return
            if req.method=="POST":
                payload=json.loads(req.post_data or "{}")
                assert payload.get("batchId")=="batch-qa" and payload.get("action")=="prepare"
                prepared["post"]+=1
                prepared["yes"]=True
            else:
                prepared["get"]+=1
            data={"ok":True,"batchId":"batch-qa","saleNumber":"BSF4-J-QA",
                  "depositCount":2,"totalGrams":3000,"status":"siap" if prepared["yes"] else "draft",
                  "lines":[{"itemId":"waste:kardus","name":"Kardus","grams":3000,"lastPrice":2500}]}
            await route.fulfill(status=200,headers=headers,body=json.dumps(data))
        await page.route("https://api.flamboyan4.web.id/api/admin/bank/sale-sheet**",mock_note)
        await page.evaluate("""() => {
          window.__printed=0;
          window.__noteHtml='';
          window.open=()=>({
            closed:false,
            document:{
              readyState:'complete',
              open(){window.__noteHtml=''},
              write(s){window.__noteHtml+=s},
              close(){}
            },
            focus(){},close(){},addEventListener(){},
            print(){window.__printed++}
          });
        }""")
        await page.add_script_tag(url=ROOT+"/portal-live/bank-sale-sheet.js")
        button=page.locator("#f4SaleSheetPrint")
        assert await button.is_visible(),(device,"Note button hidden before selection")
        assert await button.is_enabled(),(device,"Note button disabled before selection")
        adjacent=await page.evaluate("""() => {
          const field=document.querySelector('#saleBatch').closest('.field');
          const tools=document.querySelector('.f4-bank-sheet-tools');
          return field?.nextElementSibling===tools
            && getComputedStyle(tools).display!=='none';
        }""")
        assert adjacent,(device,"Note action must follow the sale group")
        await button.click()
        assert await page.locator("#f4SaleSheetStatus").text_content()=="Pilih kelompok setoran terlebih dahulu."
        assert await page.evaluate("document.activeElement.id")=="saleBatch"
        await page.locator("#saleBatch").select_option("batch-qa")
        await page.wait_for_function(
            "() => document.querySelector('#f4SaleSheetNumber')?.textContent==='BSF4-J-QA'")
        assert await button.is_visible() and await button.is_enabled(),device
        await button.click()
        await page.wait_for_function("() => window.__printed>=1")
        assert prepared["post"]==1,(device,prepared)
        assert "LEMBAR TIMBANG & JUAL" in await page.evaluate("window.__noteHtml"),device
        assert "Pemilik Lapak" in await page.evaluate("window.__noteHtml"),device
        assert "Cetak Ulang" in (await button.text_content()),device
        await button.click()
        await page.wait_for_function("() => window.__printed>=2")
        assert prepared["post"]==1,(device,"Reprint must never prepare a second time",prepared)
        assert prepared["get"]>=2,(device,prepared)
        print("BANK_WEIGH_NOTE_VISIBLE_AND_SAFE_REPRINT_OK",device,prepared,flush=True)
        await page.close()


async def sale_price_field_proportions(browser):
    """Price field must be wider than the weight field on PC and phones."""
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":820})
        await page.goto(ROOT,wait_until="domcontentloaded")
        fixture="""<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
        <style>body{margin:0;font-family:system-ui}#dashboardView{padding:16px;max-width:1060px;margin:auto}
        #pagePenjualan{width:100%;max-width:600px;box-sizing:border-box}</style></head>
        <body class="f4-bank-app-private f4-bank-app-admin">
        <div id="dashboardView"><main class="section"><div id="pagePenjualan">
        <form id="saleForm"><div id="saleItems"><div class="f4-compact-rows">
        <div class="f4-compact-row f4-compact-sale-row">
        <select aria-label="Jenis sampah"><option>Kardus</option></select>
        <input type="number" aria-label="Berat terjual (kg)" placeholder="Berat (kg)">
        <div class="f4-compact-entry-group">
        <input type="number" aria-label="Harga per kg" placeholder="Harga/kg">
        <button class="f4-compact-remove" type="button">×</button>
        </div></div></div></div></form></div></main></div></body></html>"""
        await page.set_content(fixture,wait_until="load")
        sizes=await page.evaluate("""() => {
          const width=(sel)=>document.querySelector(sel)?.getBoundingClientRect().width || 0;
          return {kind:width('#saleItems select'),weight:width('#saleItems .f4-compact-sale-row>input'),
            price:width('#saleItems .f4-compact-entry-group>input'),
            remove:width('#saleItems .f4-compact-remove'),
            overflow:document.documentElement.scrollWidth>innerWidth+2};
        }""")
        assert sizes["kind"]>sizes["price"]>sizes["weight"]>0,(device,sizes)
        assert sizes["remove"]>=30 and not sizes["overflow"],(device,sizes)
        print("BANK_PRICE_FIELD_WIDER_THAN_WEIGHT_OK",device,sizes,flush=True)
        await page.close()



async def bank_policy_permission_ui(browser):
    """Admin must never see Superadmin editor, including during API loading."""
    import json
    for role,can_edit in [("admin",False),("superadmin",True)]:
        page=await browser.new_page(viewport={"width":390,"height":780})
        await page.goto(ROOT,wait_until="domcontentloaded")
        await page.set_content("""<!doctype html><html><head>
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
        </head><body><section id="pageMaster" class="hidden"></section></body></html>""",wait_until="load")
        async def policy(route):
            await route.fulfill(status=200,headers={
              "access-control-allow-origin":ROOT,"access-control-allow-credentials":"true",
              "content-type":"application/json"},
              body=json.dumps({"ok":True,"canEdit":can_edit,"current":{
                "method":"percentage","wargaPercent":50}}))
        await page.route("https://api.flamboyan4.web.id/api/admin/bank/policy",policy)
        await page.add_script_tag(url=ROOT+"/portal-live/bank-policy-admin.js")
        assert await page.locator("#f4BankPolicyCard").count()==0,(role,"Editor loaded before login")
        await page.locator("#pageMaster").evaluate("(el)=>el.classList.remove('hidden')")
        if can_edit:
            await page.locator("#f4BankPolicyCard:not([hidden])").wait_for(timeout=8000)
            await page.locator("#f4BankPolicyCard summary").click()
            assert await page.locator("#f4BankPolicyCard form").is_visible(),role
        else:
            await page.wait_for_function("() => document.querySelector('#f4BankPolicyCard')===null",timeout=8000)
            assert await page.locator("#pageMaster input").count()==0,role
        print("BANK_POLICY_PERMISSION_UI_OK",role,flush=True)
        await page.close()


async def bank_cash_and_history_tabs(browser):
    """Real manager JS: Pengeluaran contains the form, Riwayat has two tabs."""
    import json
    page=await browser.new_page(viewport={"width":390,"height":850})
    await page.goto(ROOT,wait_until="domcontentloaded")
    extra="""<section id="pageBiaya" class="hidden"><div id="v10Budget"></div><div id="v10History"></div>
    <form id="v10ExpenseForm" class="block-gap">
     <div class="field"><label for="v10Type">Jenis transaksi</label><select id="v10Type">
      <option value="Pengeluaran">Pengeluaran</option><option value="Pembelian">Pembelian barang</option></select></div>
     <div class="field"><label for="v10Date">Tanggal</label><input id="v10Date" type="date"></div>
     <div class="field"><label for="v10Position">Pos</label><select id="v10Position"><option>Operasional</option></select></div>
     <div class="field"><label for="v10Description">Keterangan</label><input id="v10Description"></div>
     <div class="field"><label for="v10Qty">Jumlah</label><input id="v10Qty" type="number" value="1"></div>
     <div class="field"><label for="v10Unit">Satuan</label><input id="v10Unit" value="unit"></div>
     <div class="field"><label for="v10Price">Harga</label><input id="v10Price" type="number"></div>
     <div class="summary-box"><strong id="v10Amount">Rp0</strong></div>
     <div class="field"><label for="v10Vendor">Toko</label><input id="v10Vendor"></div>
     <div id="v10InventoryBox" class="field hidden"><input id="v10Inventory" type="checkbox"></div>
     <div class="field"><label for="v10Proof">Bukti</label><input id="v10Proof"></div>
     <div class="field"><label for="v10Notes">Catatan</label><input id="v10Notes"></div>
     <button type="submit">Simpan</button></form><div id="v10ExpenseNotice"></div></section>
     <section id="pageRiwayat" class="hidden">Setoran warga</section>
     <section id="pageRiwayatJual" class="hidden">Penjualan lapak</section>"""
    await page.set_content(HTML.replace("</body></html>",extra+"</body></html>"),wait_until="load")
    await page.evaluate("""() => {
      window.__expenseLoads=0;
      window.v10LoadBiaya=()=>{window.__expenseLoads++};
      window.loadRiwayatV7=()=>{};
      window.loadRiwayatJual=()=>{};
    }""")
    async def cash(route):
        await route.fulfill(status=200,headers={
          "access-control-allow-origin":ROOT,"access-control-allow-credentials":"true",
          "content-type":"application/json"},
          body=json.dumps({"ok":True,"data":[{
            "id":"qa","occurred_on":"2026-11-03","status":"aktif",
            "transaction_type":"Pengeluaran","note":"Beli kantong sampah",
            "fund_position":"Operasional","cash_in_rp":0,"cash_out_rp":5000}]}))
    await page.route("https://api.flamboyan4.web.id/api/v2/admin/bank/cash**",cash)
    await page.add_script_tag(url=ROOT+"/portal-live/bank-mobile-app.js")
    await page.evaluate("() => window.goPage('bank-admin-cash')")
    await page.locator("#f4BankCashTabs button").first.wait_for(timeout=8000)
    assert await page.locator("#f4BankCashTabs button").all_text_contents()==["Pemasukan","Pengeluaran"]
    await page.locator("#f4BankCashTabs button[data-cash-tab=out]").click()
    await page.locator("#f4BankCashExpense").wait_for(state="visible",timeout=8000)
    fields=await page.evaluate("""() => {
      const form=document.querySelector('#v10ExpenseForm');
      return {
        parent:form?.parentElement?.id,
        amountLabel:document.querySelector('#v10Price')?.closest('.field')?.querySelector('label')?.textContent,
        qty:document.querySelector('#v10Qty')?.value,
        qtyHidden:document.querySelector('#v10Qty')?.closest('.field')?.hidden,
        optionalClosed:!document.querySelector('.f4-bank-expense-extras')?.open,
        loads:window.__expenseLoads,
        overflow:document.documentElement.scrollWidth>innerWidth+3
      };
    }""")
    assert fields["parent"]=="f4BankCashExpense" and fields["amountLabel"]=="Nominal (Rp)",fields
    assert fields["qty"]=="1" and fields["qtyHidden"] and fields["optionalClosed"],fields
    assert fields["loads"]>=1 and not fields["overflow"],fields
    assert await page.locator("#f4BankCashExpense button[type=submit]").inner_text()=="Simpan Pengeluaran"
    await page.evaluate("() => window.goPage('bank-admin-history')")
    await page.locator("#f4BankAdminHistoryTabs button").first.wait_for(timeout=8000)
    assert await page.locator("#f4BankAdminHistoryTabs button").all_text_contents()==["Setoran","Penjualan"]
    assert await page.locator("#f4BankAdminHistoryTabs").is_visible()
    assert await page.locator("#pageRiwayat").is_visible()
    assert not await page.locator("#pageRiwayatJual").is_visible()
    await page.locator("#f4BankAdminHistoryTabs button").nth(1).click()
    assert await page.locator("#pageRiwayatJual").is_visible()
    assert not await page.locator("#pageRiwayat").is_visible()
    print("BANK_CASH_EXPENSE_HISTORY_TABS_OK",fields,flush=True)
    await page.close()


async def member_price_card_position(browser):
    """The member price CTA is prominent and above the weighing schedule."""
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":850})
        await page.goto(ROOT,wait_until="domcontentloaded")
        fixture="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
         <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
         <style>body{margin:0;font-family:system-ui}
          #dashboardView{padding:18px;max-width:1150px;margin:auto}</style></head>
         <body class="f4-bank-app-private f4-bank-app-member">
         <div id="dashboardView"><main class="section">
         <div id="f4BankAppHome" data-bank-role="member" class="f4-bank-app-home">
          <div class="f4-bank-app-personal-greeting">Halo, Warga</div>
          <button class="f4-bank-member-card">Kartu Anggota</button>
          <button class="f4-bank-app-member-balance">Saldo</button>
          <button id="f4MemberPriceShortcut" class="f4-bank-price-shortcut">
           <span class="f4-bank-price-shortcut-icon">♻</span>
           <span class="f4-bank-price-shortcut-copy"><strong class="f4-bank-price-shortcut-label">Daftar Harga</strong>
           <small>Tarif warga per kg</small></span><span class="f4-bank-price-shortcut-arrow">›</span>
          </button>
          <section id="f4BankWeighingSchedule" class="f4-bank-weigh-schedule">Jadwal Penimbangan</section>
          <section class="v14-panel">Riwayat</section><section class="f4-member-flow">Panduan</section>
          <section id="f4MemberEnvironmentPreview">Perkembangan</section>
          <section id="f4MemberInfoShortcut">Informasi</section>
         </div></main></div></body></html>"""
        await page.set_content(fixture,wait_until="load")
        result=await page.evaluate("""() => {
          const p=document.querySelector('#f4MemberPriceShortcut'),s=document.querySelector('#f4BankWeighingSchedule');
          const a=p.getBoundingClientRect(),b=s.getBoundingClientRect();
          return {priceBottom:a.bottom,priceRight:a.right,priceY:a.top,scheduleX:b.left,scheduleY:b.top,priceH:a.height,
            border:getComputedStyle(p).borderColor,
            overflow:document.documentElement.scrollWidth>innerWidth+3};
        }""")
        if device=="pc":
            assert abs(result["priceY"]-result["scheduleY"])<2,(device,result)
            assert result["priceRight"]<=result["scheduleX"]+2,(device,result)
        else:
            assert result["priceBottom"]<=result["scheduleY"]+2,(device,result)
        assert result["priceH"]>=60 and not result["overflow"],(device,result)
        assert result["border"]!="rgb(215, 230, 218)",(device,result)
        print("MEMBER_PRICE_SCHEDULE_RESPONSIVE_OK",device,result,flush=True)
        await page.close()



async def admin_docs_back_and_cross_account(browser):
    """Regression for Admin→public→member without refresh and true prior-page back."""
    import json
    page=await browser.new_page(viewport={"width":390,"height":850})
    await page.goto(ROOT,wait_until="domcontentloaded")
    await page.set_content(HTML,wait_until="load")
    await page.evaluate("""() => {
      const section=document.querySelector('.section');
      const heading=document.createElement('div');heading.id='f4BankPageGreeting';
      heading.textContent='Halo, Admin';section.prepend(heading);
      const docs=document.createElement('section');docs.id='v22DocsPage';
      docs.innerHTML='<header class="v22-doc-heading"><h1>Dokumentasi</h1></header>'+
        '<div id="v22DocCount">0 album</div><div id="v22DocFilters"></div><div class="v22-doc-list"></div>';
      section.append(docs);
      const inventory=document.createElement('section');inventory.id='v17Inventaris';
      inventory.innerHTML='<h2>Inventaris</h2><div id="v17Inventory">Inventaris</div>';
      section.append(inventory);
      window.f4BankRenderDocumentation=()=>{};
    }""")
    async def mock_schedule(route):
        await route.fulfill(status=200,headers={
           "access-control-allow-origin":ROOT,
           "access-control-allow-credentials":"true","content-type":"application/json"},
           body=json.dumps({"ok":True,"weekday":3,"dayName":"Rabu"}))
    await page.route("https://api.flamboyan4.web.id/api/public/bank/weighing-schedule",mock_schedule)
    await page.add_script_tag(url=ROOT+"/portal-live/bank-mobile-app.js")
    await page.locator("#f4BankAdminOperations").wait_for(timeout=8000)
    await page.evaluate("() => window.goPage('profile')")
    await page.evaluate("() => window.goPage('bank-admin-docs')")
    await page.locator("#f4BankAdminDocsTabs button").first.wait_for(timeout=8000)
    assert await page.locator("#bank-admin-docs .f4-bank-screen-title").inner_text()=="Dokumentasi"
    assert not await page.locator("#bank-admin-docs #v22DocsPage .v22-doc-heading").is_visible()
    assert await page.locator("#bank-admin-docs #v22DocsPage").is_visible()
    await page.locator("#f4BankAdminDocsTabs button").nth(1).click()
    assert await page.locator("#bank-admin-docs #v17Inventaris").is_visible()
    assert not await page.locator("#bank-admin-docs #v17Inventaris>h2").is_visible()
    await page.locator("#f4BankAdminBack").click()
    assert await page.locator("#pageProfile").is_visible(), "Back must return to previous profile screen"
    assert await page.locator("#f4BankAdminBack").is_visible()
    await page.locator("#f4BankAdminBack").click()
    assert await page.locator("#pageDashboard").is_visible()
    assert not await page.locator("#f4BankAdminBack").is_visible()
    print("BANK_ADMIN_PREVIOUS_BACK_AND_DOCS_OK",flush=True)
    # Simulate actual shared login role transitions. No navigation/reload.
    await page.evaluate("""() => {
      document.body.dataset.f4BankRole='public';
      document.querySelector('#dashboardView').classList.add('hidden');
    }""")
    await page.wait_for_function("""() =>
      !document.body.classList.contains('f4-bank-app-admin')
      && !document.querySelector('#f4BankAdminOperations')
      && !document.querySelector('#f4BankAdminShortcuts')""")
    await page.evaluate("""() => {
      document.body.dataset.f4BankRole='warga';
      document.querySelector('#dashboardView').classList.remove('hidden');
      document.querySelector('#pageDashboard').classList.remove('hidden');
    }""")
    await page.wait_for_function("() => document.body.classList.contains('f4-bank-app-member')")
    assert await page.locator("#f4BankMemberCard").is_visible()
    assert await page.locator("#f4BankAdminOperations").count()==0
    assert await page.locator("#f4BankAdminShortcuts").count()==0
    assert not await page.locator("#f4BankAdminBack").is_visible()
    await page.wait_for_function("""() => document.querySelector('#f4BankWeighingSchedule')
      ?.textContent?.includes('Setiap Rabu')""",timeout=9000)
    assert await page.locator("#pageDashboard").is_visible()
    print("BANK_ACCOUNT_SWITCH_NO_REFRESH_AND_WEDNESDAY_SCHEDULE_OK",flush=True)
    # Check both reverse directions and Superadmin without a page reload.
    await page.evaluate("""() => {
      window.f4BankResetForAccountSwitch();
      document.body.dataset.f4BankRole='admin';
      window.f4BankReconcileAccount();
    }""")
    await page.locator("#f4BankAdminOperations").wait_for(state="visible",timeout=8000)
    assert not await page.locator("#f4BankWeighingSchedule").is_visible()
    assert not await page.locator("#f4MemberPriceShortcut").is_visible()
    assert not await page.locator("#f4BankMemberCard").is_visible()
    assert await page.locator("#f4BankAdminShortcuts").is_visible()
    await page.evaluate("""() => {
      window.f4BankResetForAccountSwitch();
      document.body.dataset.f4BankRole='superadmin';
      window.f4BankReconcileAccount();
    }""")
    await page.locator("#f4BankAdminOperations").wait_for(state="visible",timeout=8000)
    assert await page.locator("#f4BankAdminShortcuts").is_visible()
    await page.evaluate("""() => {
      window.f4BankResetForAccountSwitch();
      document.body.dataset.f4BankRole='public';
      document.querySelector('#dashboardView').classList.add('hidden');
      window.f4BankReconcileAccount();
    }""")
    assert await page.locator("#f4BankAdminOperations").count()==0
    assert await page.locator("#f4BankAdminShortcuts").count()==0
    assert not await page.locator("#f4BankAdminBack").is_visible()
    print("BANK_MEMBER_ADMIN_SUPERADMIN_PUBLIC_REUSE_NO_LEAK_OK",flush=True)
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
            assert state["labels"]==[],state
            assert not state["overflow"],state
            # Current manager dashboard: kas as the left hero and three useful KPI tiles,
            # not the obsolete four-tile dashboard stacked under the balance.
            assert len(state["tiles"])==3,state
            if device=="pc":
                assert state["home"]["w"]>850,state
                assert abs(state["metrics"]["y"]-state["hero"]["y"])<3,state
                assert state["metrics"]["x"]>=state["hero"]["right"]+8,state
                assert abs(state["tiles"][0]["y"]-state["tiles"][2]["y"])<3,state
                assert state["dock"]=="none",state
            else:
                assert state["metrics"]["y"]>=state["hero"]["y"]+state["hero"]["h"]-2,state
                assert state["tiles"][2]["y"]>=state["tiles"][0]["y"],state
                assert state["dock"]=="none",state
            assert any("Catat Setoran" in x for x in state["quick"]),state
            assert await page.locator("#f4BankManualPayout").count()==1
            assert not await page.locator("#f4BankManualPayout").get_attribute("open")
            assert await page.locator("#f4BankManualPayout #v9Form").count()==1
            await page.screenshot(path=f"ops-audit/bank-eco-theme/manager-{device}.png",full_page=True)
            print("MANAGER_RESPONSIVE_OK",device,state,flush=True)
            if device=="hp":
                direct=page.locator('#f4BankAdminShortcuts [data-bank-app-route="tabungan"]')
                assert await direct.is_visible() and await direct.inner_text()=="Saldo Warga"
                assert await page.locator('#f4BankAdminShortcuts [data-bank-app-route="profile"]').count()==0
                await direct.click()
                assert await page.locator("#pageTabungan").is_visible()
                print("BANK_SALDO_WARGA_DIRECT_NAV_OK",flush=True)
            await page.close()
        await admin_docs_back_and_cross_account(browser)
        await bank_policy_permission_ui(browser)
        await bank_cash_and_history_tabs(browser)
        await member_price_card_position(browser)
        await sale_price_field_proportions(browser)
        await note_print_is_visible(browser)
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
