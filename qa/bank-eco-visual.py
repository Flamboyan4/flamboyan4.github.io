"""Visual regression of real Bank Sampah CSS in Chromium; fixture data, zero writes."""
import asyncio, json, pathlib, re
from playwright.async_api import async_playwright

ROOT = "http://127.0.0.1:8765/bank-sampah/"
DEST = pathlib.Path("ops-audit/bank-eco-theme")
DEST.mkdir(parents=True, exist_ok=True)

FIXTURE = """
<div id="v11Public" class="v18-public-shell">
  <aside id="v18PublicSide" class="open"><button class="active">Beranda</button><button>Program</button></aside>
  <div id="v18PublicContent"><main class="v17-public-main">
    <section class="v17-public-banner">
      <div><span class="v14-eyebrow">DARI RUMAH, UNTUK BUMI</span>
        <h2>Sampah terpilah. Manfaat bertambah.</h2>
        <p>Informasi lingkungan dan sampah warga.</p>
        <button id="f4-public-manage-bank">Kelola Bank Sampah</button>
        <button id="f4-public-my-savings">Lihat Tabungan Saya</button>
      </div>
    </section>
    <section id="v17Program" class="f4-bank-program"><div class="f4-bank-program-heading"><h2>Dari sampah jadi manfaat</h2></div>
      <ol class="f4-bank-program-flow"><li class="f4-bank-program-step"><strong>Pilah & setor</strong><p>Warga timbang sampah</p></li>
      <li class="f4-bank-program-step"><strong>Jual & sahkan</strong><p>Pengurus menyahkan</p></li>
      <li class="f4-bank-program-step"><strong>Tabungan & lingkungan</strong><p>Bagi hasil</p></li></ol></section>
    <section id="v17Transparansi"><div id="v25ReportRoot">
      <div id="v25ReportMetrics" class="v25-public-metrics v26-compact">
        <div class="v17-public-metric"><small>Berat</small><strong>2 kg</strong></div>
        <div class="v17-public-metric"><small>Penjualan</small><strong>Rp 6.000</strong></div>
        <div class="v17-public-metric"><small>Hak warga</small><strong>Rp 3.000</strong></div>
        <div class="v17-public-metric"><small>Lingkungan</small><strong>Rp 3.000</strong></div>
      </div></div></section>
  </main></div>
</div>
<div id="dashboardView">
  <div id="v16Tabs" class="v16-tabs"><button class="active">Setoran</button><button>Penjualan</button></div>
  <div id="pagePribadi" class="card">
    <h2>Tabungan Saya</h2><div id="v12Private">
      <div class="stats">
        <div class="stat"><small>Saldo tersedia</small><strong>Rp 3.000</strong></div>
        <div class="stat"><small>Tabungan masuk</small><strong>Rp 3.000</strong></div>
        <div class="stat"><small>Sudah dicairkan</small><strong>Rp 0</strong></div>
      </div>
    </div>
  </div>
  <div id="pageProgress" class="card">
    <h2>Perkembangan</h2><div class="f4-member-progress-summary">
      <div class="f4-member-progress-stat"><strong>2 kg</strong><small>Berat</small></div>
      <div class="f4-member-progress-stat"><strong>2</strong><small>Setoran</small></div>
      <div class="f4-member-progress-stat"><strong>3</strong><small>Kegiatan</small></div>
    </div>
    <section class="f4-member-progress-section"><h3>Perkembangan kegiatan</h3></section>
  </div>
</div>
"""

# Real, linked Bank Sampah CSS is applied to a synthetic authenticated-member
# DOM. No user account, cookies or live monetary data are required for layout QA.
MEMBER_FIXTURE = """
<div id="f4-direct-bar">
  <span id="f4BankMemberTopBrand" class="f4-bank-member-top-brand">
    <img alt="" src="/assets/logo-flamboyan.svg"><strong>BANK SAMPAH FLAMBOYAN 4</strong></span>
  <span id="f4BankMemberTopIdentity" class="f4-bank-member-top-identity">
    <strong>Halo, Anggota</strong><small>Rumah A5/41</small></span>
  <nav class="f4-nav-links"><a href="#" aria-label="Portal">◉</a></nav>
  <button id="f4-direct-avatar">◉</button>
</div>
<section id="dashboardView">
  <div class="grid">
   <nav id="sideNav" class="side">
    <div class="v16-brand"><img src="/assets/logo-flamboyan.svg"><strong>Bank Sampah Flamboyan 4</strong></div>
    <div id="v16NavList" class="v16-nav-list">
     <button class="v16-item active" aria-current="page">Beranda</button><button class="v16-item">Tabungan</button>
    </div>
   </nav>
   <div class="section">
    <div id="pageDashboard" class="card v14-home">
     <section id="f4BankAppHome" data-bank-role="member">
      <button id="f4BankMemberCard" class="f4-bank-member-card">
       <span class="f4-bank-member-card-head"><span class="f4-bank-atm-brand">
        <img src="/assets/logo-flamboyan.svg"><span class="f4-bank-atm-brand-label">BANK SAMPAH FLAMBOYAN 4</span>
       </span><span class="f4-bank-atm-contactless"><svg viewBox="0 0 32 32"><path d="M8 11a8 8 0 0 1 0 10"/></svg></span></span>
       <span class="f4-bank-atm-center"><span class="f4-bank-member-card-chip"></span><strong class="f4-bank-atm-number">W017</strong></span>
       <span class="f4-bank-member-card-foot"><span class="f4-bank-atm-person">
        <small>NAMA ANGGOTA</small><strong>ANGGOTA</strong></span>
        <span class="f4-bank-atm-house"><small>RUMAH</small><strong>A5/41</strong></span></span>
      </button>
      <div id="f4BankAppMemberBalance" class="f4-bank-app-member-balance" role="group">
       <div class="f4-bank-balance-head"><span class="f4-bank-member-balance-label">Saldo Tersedia</span>
        <button type="button" class="f4-bank-balance-eye" aria-label="Tampilkan saldo" aria-pressed="true">
         <svg viewBox="0 0 24 24"><path d="M2.8 12S6.6 5 12 5s9.2 7 9.2 7-3.8 7-9.2 7-9.2-7-9.2-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
       </div>
       <strong class="f4-bank-member-balance-value">••••••</strong>
       <button type="button" class="f4-bank-balance-cta">Cek Tabungan</button>
      </div>
      <section id="f4MemberQuickActions" class="f4-member-shortcuts">
       <button id="f4BankWeighingSchedule" class="f4-bank-weigh-schedule">
        <span class="f4-bank-weigh-icon"><svg viewBox="0 0 24 24"><path d="M4 6h16"/></svg></span>
        <span class="f4-bank-weigh-copy"><small>Jadwal Berikutnya</small>
         <strong>Minggu, 15 Nov 2026</strong><span>Setiap 2 minggu</span></span>
       </button>
       <button id="f4MemberPriceShortcut">
        <span class="f4-bank-price-shortcut-icon"><svg viewBox="0 0 24 24"><path d="M4 6h16"/></svg></span>
        <span class="f4-bank-price-shortcut-copy"><span class="f4-bank-price-shortcut-label">Daftar Harga</span>
        <small>Tarif per kg</small></span>
       </button>
      </section>
      <div id="f4MemberContent" class="f4-member-content">
       <section class="v14-panel">
        <header class="v14-panel-head"><h3>Mutasi Setoran Terbaru</h3></header>
        <div id="v14Recent"><div class="f4-member-recent">
          <span class="f4-member-recent-icon">↓</span>
          <span class="f4-member-recent-copy"><strong>Hasil Penjualan Sampah</strong><small>Saldo masuk</small></span>
          <span class="f4-member-recent-value"><b>+ Rp 750</b></span>
        </div></div>
       </section>
       <aside id="f4MemberAside" class="f4-member-aside">
        <details open id="f4MemberFlow" class="f4-member-flow">
         <summary class="f4-member-flow-head">
          <span class="f4-member-flow-icon">♻</span><span class="f4-member-flow-copy"><strong>Cara setor sampah</strong></span>
         </summary>
         <div class="f4-member-flow-body"><ol class="f4-member-flow-steps">
          <li><span class="f4-member-flow-number">◉</span><div><strong>Pilah di rumah</strong></div></li>
          <li><span class="f4-member-flow-number">◉</span><div><strong>Antar ke gudang</strong></div></li>
          <li><span class="f4-member-flow-number">◉</span><div><strong>Timbang & catat</strong></div></li>
          <li><span class="f4-member-flow-number">◉</span><div><strong>Saldo sah</strong></div></li>
         </ol></div>
        </details>
       </aside>
      </div>
      <section id="f4MemberEnvironmentPreview" class="f4-member-environment-preview">
       <div class="f4-member-environment-head">
        <h3>Perkembangan Saya</h3>
        <div id="f4MemberProgressPeriod" class="f4-member-progress-period" role="group" aria-label="Periode grafik setoran pribadi">
         <button class="is-active" aria-pressed="true">Per bulan</button><button aria-pressed="false">Per tahun</button>
        </div>
       </div>
       <div id="f4MemberProgressChart" class="f4-member-progress-chart" role="img" aria-label="Berat sampah pribadi per bulan">
        <div class="f4-member-progress-bars" style="grid-template-columns:repeat(6,minmax(0,1fr))">
         <div class="f4-member-progress-column"><strong>—</strong><span class="f4-member-progress-rail"><i class="f4-member-progress-fill" style="height:0%"></i></span><small>Jun</small></div>
         <div class="f4-member-progress-column"><strong>—</strong><span class="f4-member-progress-rail"><i class="f4-member-progress-fill" style="height:0%"></i></span><small>Jul</small></div>
         <div class="f4-member-progress-column"><strong>—</strong><span class="f4-member-progress-rail"><i class="f4-member-progress-fill" style="height:0%"></i></span><small>Agu</small></div>
         <div class="f4-member-progress-column"><strong>—</strong><span class="f4-member-progress-rail"><i class="f4-member-progress-fill" style="height:0%"></i></span><small>Sep</small></div>
         <div class="f4-member-progress-column"><strong>1,9 kg</strong><span class="f4-member-progress-rail"><i class="f4-member-progress-fill" style="height:100%"></i></span><small>Okt</small></div>
         <div class="f4-member-progress-column"><strong>—</strong><span class="f4-member-progress-rail"><i class="f4-member-progress-fill" style="height:0%"></i></span><small>Nov</small></div>
        </div>
       </div>
      </section>
      <button id="f4MemberInfoShortcut" class="f4-member-info-shortcut">
       <span class="f4-member-info-icon"><svg viewBox="0 0 24 24"><path d="M4 8h16"/></svg></span>
       <span class="f4-member-info-copy"><strong>Informasi &amp; Laporan</strong>
        <small>Laporan dan transparansi kegiatan</small></span>
       <span id="f4MemberPublicMini" class="f4-member-public-mini">
        <span class="f4-member-public-mini-item"><small>Berat terjual</small><strong>1,9 kg</strong></span>
        <span class="f4-member-public-mini-item"><small>Hasil jual</small><strong>Rp 6.000</strong></span>
        <span class="f4-member-public-mini-item"><small>Hak warga</small><strong>Rp 3.000</strong></span>
       </span>
      </button>
      <figure id="f4MemberHowtoBanner" class="f4-member-howto-banner"><img src="/assets/bank-sampah-alur-penimbangan-1600x500.png" width="1600" height="500" alt="Alur setor sampah"></figure>
     </section>
    </div>
   </div>
  </div>
</section>
"""

async def check_member_banking_layout(browser, mode, width):
    page = await browser.new_page(viewport={"width": width, "height": 850}, device_scale_factor=1)
    await page.set_content(MEMBER_FIXTURE, wait_until="load")
    await page.evaluate("""() => {
      document.body.className = "f4-direct-bank f4-bank-app-member f4-bank-app-private v17-dashboard";
    }""")
    await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/direct-shell.css")
    await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/modern-portals.css")
    await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/bank-member-polish.css")
    await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/bank-eco-pages.css")
    await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/bank-member-navigation.css")
    await page.wait_for_timeout(250)
    state = await page.evaluate("""() => {
      const rect = s => {
        const n=document.querySelector(s);const r=n.getBoundingClientRect();
        return {x:r.x,y:r.y,w:r.width,h:r.height};
      };
      const css=s=>getComputedStyle(document.querySelector(s));
      return {
        areas:css('#f4BankAppHome').gridTemplateAreas,
        atm:rect('#f4BankMemberCard'),balance:rect('#f4BankAppMemberBalance'),
        quick:rect('#f4MemberQuickActions'),price:rect('#f4MemberPriceShortcut'),
        schedule:rect('#f4BankWeighingSchedule'),info:rect('#f4MemberInfoShortcut'),
        banner:rect('#f4MemberHowtoBanner'),
        publicMini:rect('#f4MemberPublicMini'),
        publicMiniDisplay:css('#f4MemberPublicMini').display,
        progress:rect('#f4MemberEnvironmentPreview'),flow:rect('#f4MemberFlow'),
        recent:rect('#f4MemberContent .v14-panel'),
        page:rect('#pageDashboard'),
        cardBg:css('#f4BankMemberCard').backgroundImage,
        outerBorder:css('#pageDashboard').borderTopWidth,
        outerRadius:css('#pageDashboard').borderTopLeftRadius,
        outerPadding:css('#pageDashboard').paddingLeft,
        sectionBackground:css('.section').backgroundColor,
        walletBackground:css('#f4BankAppMemberBalance').backgroundColor,
        sidebar:rect('#sideNav'),
        sidebarBackground:css('#sideNav').backgroundColor,
        brandLogoWidth:rect('.v16-brand img').w,
        brandInk:css('.v16-brand strong').color,
        navFontSize:css('#v16NavList .v16-item').fontSize,
        name:rect('#f4BankMemberTopIdentity'),
        header:rect('#f4-direct-bar'),
        headerHeight:rect('#f4-direct-bar').h,
        extraBrand:css('#f4BankMemberTopBrand').display,
        nfcTransform:css('#f4BankMemberCard .f4-bank-atm-contactless').transform,
        overflow:document.documentElement.scrollWidth>window.innerWidth+4
      };
    }""")
    await page.screenshot(path=str(DEST / (mode+"-member-banking.png")), full_page=True)
    print("BANK_MEMBER_BANKING_VISUAL",mode,json.dumps(state,ensure_ascii=False),flush=True)
    assert "linear-gradient" in state["cardBg"] and "7, 158, 143" in state["cardBg"], state
    assert state["outerBorder"]=="0px" and state["outerRadius"]=="0px" and state["outerPadding"]=="0px", state
    assert state["sectionBackground"]=="rgb(255, 255, 255)", state
    assert state["walletBackground"]=="rgb(255, 255, 255)", state
    assert state["nfcTransform"]=="none", state
    assert not state["overflow"], mode + ": unexpected horizontal scroll"
    assert abs(state["atm"]["y"]-state["balance"]["y"]) < 3 if mode=="pc" else state["atm"]["y"]<state["balance"]["y"], state
    if mode=="pc":
        assert abs(state["sidebar"]["w"]-226)<2 and state["sidebarBackground"]=="rgb(255, 255, 255)", state
        assert 40<=state["brandLogoWidth"]<=46 and state["brandInk"]!="rgb(255, 255, 255)", state
        assert 13<=float(state["navFontSize"].replace("px",""))<=15, state
        assert state["name"]["x"]>=state["sidebar"]["x"]+state["sidebar"]["w"]-2, state
        assert state["name"]["x"]<=state["sidebar"]["x"]+state["sidebar"]["w"]+65, state
        assert abs(state["progress"]["y"]-state["recent"]["y"])<3, state
        assert abs(state["flow"]["y"]-state["info"]["y"])<3, state
        assert state["flow"]["y"]>=state["progress"]["y"]+state["progress"]["h"]-2, state
        assert state["flow"]["h"]<state["progress"]["h"] and state["info"]["h"]<state["progress"]["h"], state
        assert state["publicMiniDisplay"]=="grid" and 0<state["publicMini"]["h"]<=65, state
        assert state["info"]["h"]<=190, state
        assert state["banner"]["y"]>=state["info"]["y"]+state["info"]["h"]-3, state
        assert abs(state["banner"]["w"]-state["quick"]["w"])<3, state
        assert abs(state["banner"]["w"]/state["banner"]["h"]-3.2)<0.05, state
        assert state["quick"]["w"]>=state["atm"]["w"]*1.7, state
    else:
        assert abs(state["schedule"]["y"]-state["price"]["y"])<3, state
        assert abs(state["price"]["y"]-state["info"]["y"])<3, state
        assert state["atm"]["h"]<260 and state["balance"]["h"]<205, state
        assert state["progress"]["y"]>state["quick"]["y"], state
        assert state["publicMiniDisplay"]=="none" and state["publicMini"]["h"]==0, state
        assert state["banner"]["y"]>=state["flow"]["y"]+state["flow"]["h"]-3, state
        assert abs(state["banner"]["w"]/state["banner"]["h"]-3.2)<0.05, state
        assert state["progress"]["y"]<state["recent"]["y"]<state["flow"]["y"], state
        assert 65<=state["headerHeight"]<=72 and state["extraBrand"]=="none", state
    await page.close()


async def check_mobile_dock_scroll(browser, role):
    """Test the canonical production dock after scroll and viewport changes."""
    page = await browser.new_page(
        viewport={"width": 390, "height": 844}, device_scale_factor=2,
        is_mobile=True, has_touch=True)
    await page.set_content(
        '<!doctype html><html><head><meta name="viewport" '
        'content="width=device-width, initial-scale=1"></head>'
        '<body class="f4-bank-app-private f4-bank-app-' + role + '" '
        'style="margin:0"><main style="height:2800px"></main></body></html>')
    await page.evaluate("""(role) => {
      const nav=document.createElement('nav');
      nav.id='f4BankAppDock';
      nav.className='f4-bank-app-dock';
      nav.setAttribute('aria-label','Menu bawah Bank Sampah');
      for(let i=0;i<5;i++){
        const b=document.createElement('button');
        b.className='f4-bank-app-dock-action'+(i===2?' is-primary':'');
        const icon=document.createElement('span');
        icon.className='f4-bank-app-action-icon';
        icon.textContent='◎';
        b.append(icon);
        if(i!==2){
          const label=document.createElement('span');
          label.className='f4-bank-app-action-name';
          label.textContent='Menu '+i;
          b.append(label);
        }
        nav.append(b);
      }
      if(role==='admin'){
        document.documentElement.classList.add('f4-bank-admin-dock-root');
        document.documentElement.append(nav);
      }else document.body.append(nav);
    }""", role)
    await page.add_style_tag(content=pathlib.Path("portal-live/bank-mobile-dock.css").read_text())
    measurements=[]
    for scroll_y, height in [(0,844),(500,844),(1500,844),(1000,710),(300,710)]:
        await page.set_viewport_size({"width":390,"height":height})
        await page.evaluate("(y) => window.scrollTo(0,y)", scroll_y)
        await page.wait_for_timeout(90)
        state=await page.evaluate("""() => {
          const nav=document.getElementById('f4BankAppDock');
          const rect=nav.getBoundingClientRect();
          const style=getComputedStyle(nav);
          return {
            visible:style.display!=='none',
            fixed:style.position==='fixed',
            scroll:window.scrollY,
            height:rect.height,
            bottom:rect.bottom,
            expected:window.innerHeight-parseFloat(style.bottom||'0'),
            width:rect.width,
            viewport:window.innerHeight
          };
        }""")
        measurements.append(state)
        assert state["visible"] and state["fixed"], (role,state)
        assert abs(state["bottom"]-state["expected"])<2, (role,state)
        assert abs(state["height"]-64)<2, (role,state)
        assert abs(state["width"]-390)<2, (role,state)
    await page.screenshot(path=str(DEST/(role+"-dock-scroll.png")),full_page=False)
    print("MOBILE_DOCK_SCROLL_OK",role,json.dumps(measurements),flush=True)
    await page.close()

async def main():
    result = {}
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(args=["--no-sandbox"])
        for mode, width in [("pc", 1366), ("hp", 390)]:
            page = await browser.new_page(viewport={"width": width, "height": 840}, device_scale_factor=1)
            await page.goto(ROOT, wait_until="domcontentloaded", timeout=45000)
            # This module is an iframe in the integrated portal. When opened on its own
            # for visual QA, simulate the same role message sent by the parent shell.
            # Otherwise the page deliberately waits for the host and renders no public UI.
            await page.evaluate("""() => window.postMessage({type:"f4:demo-role",role:"public",identity:{}}, location.origin)""")
            await page.wait_for_selector("#v17Program.f4-bank-program .f4-bank-program-step", timeout=12000)
            live = await page.evaluate("""() => {
              const section=document.querySelector('#v17Program');
              const steps=[...section.querySelectorAll('.f4-bank-program-step')];
              const rect=section.getBoundingClientRect();
              return {
                parent:section.parentElement.className,
                count:steps.length,
                color:getComputedStyle(steps[0].querySelector('strong')).color,
                background:getComputedStyle(steps[0]).backgroundColor,
                width:rect.width,
                cropped:steps.some(el=>el.getBoundingClientRect().right>rect.right+2),
                columns:getComputedStyle(section.querySelector('.f4-bank-program-flow')).gridTemplateColumns.split(' ').length
              };
            }""")
            print("PUBLIC_PROGRAM_LIVE_OK",mode,live,flush=True)
            assert live["parent"]=="v17-public-main",live
            assert live["count"]==3 and not live["cropped"],live
            assert live["color"]=="rgb(18, 63, 43)",live
            assert live["background"]=="rgba(0, 0, 0, 0)",live
            assert live["columns"]==(1 if mode=="hp" else 3),live
            await page.screenshot(path=str(DEST / (mode+"-public.png")), full_page=False)
            # Render a deterministic fixture in a new document: the live app
            # otherwise continues mutating the DOM after replacing body.innerHTML.
            # Load actual theme sheets (not duplicated CSS) for PC/HP assertions.
            await page.set_content(FIXTURE, wait_until="load")
            source = pathlib.Path("bank-sampah/index.html").read_text()
            # Load the actual page-level stylesheet that owns the public Program component,
            # before the external canonical theme. A CSS-only fixture omitted it previously.
            base = re.search(r"<style[^>]*>(.*?)</style>", source, re.I | re.S)
            assert base, "Base Bank Sampah stylesheet missing"
            await page.add_style_tag(content=base.group(1))
            # Reproduce the actual mobile report rule before the canonical theme.
            pattern = r'(#v11Public #v25ReportMetrics\.v26-compact>\.v17-public-metric\{[^}]+\})'
            rule = re.search(pattern, source)
            assert rule, "Mobile report rule not found"
            await page.add_style_tag(content="@media(max-width:760px){" + rule.group(1) + "}")
            await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/bank-eco-pages.css")
            await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/bank-eco-dashboard.css")
            await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/bank-impact-summary.css")
            await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/bank-impact-summary.css")
            await page.wait_for_timeout(300)
            state = await page.evaluate("""() => {
              const e = (s) => document.querySelector(s);
              const color = (s,property) => getComputedStyle(e(s))[property];
              const r = (s) => e(s).getBoundingClientRect();
              const cs = [...document.querySelectorAll('#pagePribadi .stats>.stat')].map(n=>{
                const x=n.getBoundingClientRect();return {x:x.x,y:x.y,w:x.width,h:x.height}
              });
              return {
                banner:color('#v11Public .v17-public-banner','backgroundColor'),
                title:color('#v11Public .v17-public-banner h2','color'),
                button:color('#f4-public-manage-bank','backgroundColor'),
                buttonText:color('#f4-public-manage-bank','color'),
                savingsButton:color('#f4-public-my-savings','backgroundColor'),
                savingsButtonText:color('#f4-public-my-savings','color'),
                feature:color('#v17Program .f4-bank-program-step','backgroundColor'),
                featureText:color('#v17Program .f4-bank-program-step strong','color'),
                programParent:e('#v17Program').parentElement.className,
                programWidth:r('#v17Program').width,
                programColumns:getComputedStyle(e('#v17Program .f4-bank-program-flow')).gridTemplateColumns.split(' ').length,
                programNoOverflow:[...document.querySelectorAll('#v17Program .f4-bank-program-step')].every(n=>n.getBoundingClientRect().right <= r('#v17Program').right+1),
                submenu:color('#v16Tabs button.active','backgroundColor'),
                firstCard:color('#pagePribadi .stat:first-child','backgroundColor'),
                firstText:color('#pagePribadi .stat:first-child strong','color'),
                lastCard:color('#pagePribadi .stat:last-child','backgroundColor'),
                drawerWidth:r('#v18PublicSide').width,
                statRects:cs,
                progressBg:color('#pageProgress .f4-member-progress-stat:first-child','backgroundColor'),
                reportColors:[...document.querySelectorAll('#v25ReportMetrics>.v17-public-metric')].map(n=>getComputedStyle(n).backgroundColor),
                horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+3,
              }
            }""")
            await page.screenshot(path=str(DEST / (mode+"-fixture.png")), full_page=True)
            result[mode] = state
            print("VISUAL_STATE",mode,json.dumps(state,ensure_ascii=False),flush=True)
            assert state["banner"]=="rgb(67, 160, 71)", f"{mode}: hero should use flat green: {state['banner']}"
            assert state["title"] == "rgb(255, 255, 255)", f"{mode}: title not white"
            assert state["button"] == "rgb(253, 192, 16)", f"{mode}: CTA not palette yellow"
            assert state["buttonText"] == "rgb(37, 65, 45)", f"{mode}: CTA must have readable dark green text"
            assert state["savingsButton"] == state["button"], f"{mode}: savings CTA not same gold"
            assert state["savingsButtonText"] == state["buttonText"], f"{mode}: savings CTA text must match readable dark green"
            assert state["feature"] == "rgba(0, 0, 0, 0)", f"{mode}: program steps should be unboxed"
            # Palette varies; verify leaf-green ink keeps AAA contrast on white.
            rgb = tuple(int(x) for x in re.findall(r"\d+", state["featureText"])[:3])
            assert len(rgb)==3 and rgb[1]>rgb[0] and rgb[1]>rgb[2], f"{mode}: program text is not leaf green"
            channels=[v/255/12.92 if v/255<=0.04045 else ((v/255+0.055)/1.055)**2.4 for v in rgb]
            luminance=0.2126*channels[0]+0.7152*channels[1]+0.0722*channels[2]
            assert 1.05/(luminance+0.05)>=7.0, f"{mode}: program labels lack AAA contrast on white"
            assert state["programParent"] == "v17-public-main", f"{mode}: program was moved back inside hero"
            assert state["programWidth"] <= width and state["programNoOverflow"], f"{mode}: program overflows or clips"
            # Columns of the REAL page were verified above; this reduced fixture intentionally omits unrelated inline styles.
            assert state["programNoOverflow"], f"{mode}: program overflows in the fixture"
            assert state["submenu"] == "rgb(228, 246, 213)", f"{mode}: active tab should use soft lime"
            assert state["firstCard"] == "rgb(232, 247, 212)", f"{mode}: member summary not vivid lime pastel"
            assert state["firstText"] == "rgb(11, 87, 56)", f"{mode}: legacy member summary not deep green"
            assert state["reportColors"] == ["rgb(255, 255, 255)"]*4, f"{mode}: public report cards should be white: {state['reportColors']}"
            assert state["lastCard"] == "rgb(255, 242, 184)", f"{mode}: final member summary not yellow"
            assert state["progressBg"] == "rgb(232, 247, 212)", f"{mode}: progress should use new palette"
            assert not state["horizontalOverflow"], f"{mode}: horizontal overflow"
            if mode == "hp":
                rect = state["statRects"]
                assert abs(rect[1]["y"]-rect[2]["y"]) < 2, f"Mobile 2+3 are not on same row: {rect}"
                assert abs(rect[1]["w"]-rect[2]["w"]) < 2, f"Mobile 2+3 widths mismatch: {rect}"
                assert rect[0]["w"] > rect[1]["w"]*1.7, f"Mobile first card not spanning: {rect}"
                assert state["drawerWidth"] <= 228, f"Mobile sidebar too wide: {state['drawerWidth']}"
            else:
                rect = state["statRects"]
                assert abs(rect[0]["y"]-rect[1]["y"]) < 2 and abs(rect[1]["y"]-rect[2]["y"]) < 2, f"PC cards not aligned: {rect}"
            await page.close()
        await check_member_banking_layout(browser, "pc", 1366)
        await check_member_banking_layout(browser, "hp", 390)
        await check_mobile_dock_scroll(browser, "admin")
        await check_mobile_dock_scroll(browser, "member")
        await browser.close()
    (DEST / "result.json").write_text(json.dumps(result,indent=2))
    print("F4_BANK_ECO_VISUAL_OK",json.dumps(result,ensure_ascii=False))

asyncio.run(main())
