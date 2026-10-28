"""Visual regression of real Bank Sampah CSS in Chromium; fixture data, zero writes."""
import asyncio, json, pathlib
from playwright.async_api import async_playwright

ROOT = "http://127.0.0.1:8765/bank-sampah/"
DEST = pathlib.Path("ops-audit/bank-eco-theme")
DEST.mkdir(parents=True, exist_ok=True)

FIXTURE = """
<div id="v11Public" class="v18-public-shell">
  <aside id="v18PublicSide" class="open"><button class="active">Beranda</button><button>Program</button></aside>
  <div id="v18PublicContent"><main class="v17-public-main">
    <section class="v17-public-banner v27-banner-program">
      <div><span class="v14-eyebrow">DARI RUMAH, UNTUK BUMI</span>
        <h2>Sampah terpilah. Manfaat bertambah.</h2>
        <p>Informasi lingkungan dan sampah warga.</p>
        <button id="f4-public-manage-bank">Kelola Bank Sampah</button>
        <button id="f4-public-my-savings">Lihat Tabungan Saya</button>
        <div id="v17Program"><div class="v17-feature"><strong>Pemilahan & setoran</strong></div></div>
      </div>
    </section>
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

async def main():
    result = {}
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(args=["--no-sandbox"])
        for mode, width in [("pc", 1366), ("hp", 390)]:
            page = await browser.new_page(viewport={"width": width, "height": 840}, device_scale_factor=1)
            await page.goto(ROOT, wait_until="domcontentloaded", timeout=45000)
            await page.wait_for_timeout(1100)
            await page.screenshot(path=str(DEST / (mode+"-public.png")), full_page=False)
            # Render a deterministic fixture in a new document: the live app
            # otherwise continues mutating the DOM after replacing body.innerHTML.
            # Load actual theme sheets (not duplicated CSS) for PC/HP assertions.
            await page.set_content(FIXTURE, wait_until="load")
            await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/bank-eco-pages.css")
            await page.add_style_tag(url="http://127.0.0.1:8765/portal-live/bank-eco-dashboard.css")
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
                feature:color('#v17Program .v17-feature','backgroundColor'),
                featureText:color('#v17Program .v17-feature strong','color'),
                submenu:color('#v16Tabs button.active','backgroundColor'),
                firstCard:color('#pagePribadi .stat:first-child','backgroundColor'),
                firstText:color('#pagePribadi .stat:first-child strong','color'),
                lastCard:color('#pagePribadi .stat:last-child','backgroundColor'),
                drawerWidth:r('#v18PublicSide').width,
                statRects:cs,
                progressBg:color('#pageProgress .f4-member-progress-stat:first-child','backgroundColor'),
                horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+3,
              }
            }""")
            await page.screenshot(path=str(DEST / (mode+"-fixture.png")), full_page=True)
            result[mode] = state
            print("VISUAL_STATE",mode,json.dumps(state,ensure_ascii=False),flush=True)
            assert state["banner"] == "rgb(17, 136, 102)", f"{mode}: hero not leaf green: {state['banner']}"
            assert state["title"] == "rgb(255, 255, 255)", f"{mode}: title not white"
            assert state["button"] == "rgb(163, 102, 0)", f"{mode}: CTA not gold"
            assert state["buttonText"] == "rgb(255, 255, 255)", f"{mode}: CTA text not white"
            assert state["savingsButton"] == state["button"], f"{mode}: savings CTA not same gold"
            assert state["savingsButtonText"] == "rgb(255, 255, 255)", f"{mode}: savings CTA text not white"
            assert state["feature"] == "rgb(255, 255, 255)", f"{mode}: program card not solid white"
            assert state["featureText"] == "rgb(18, 79, 56)", f"{mode}: program label not dark green"
            assert state["submenu"] == "rgb(17, 136, 102)", f"{mode}: submenu inactive color"
            assert state["firstCard"] == "rgb(17, 136, 102)", f"{mode}: member balance not leaf green"
            assert state["firstText"] == "rgb(255, 255, 255)", f"{mode}: member balance text not white"
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
        await browser.close()
    (DEST / "result.json").write_text(json.dumps(result,indent=2))
    print("F4_BANK_ECO_VISUAL_OK",json.dumps(result,ensure_ascii=False))

asyncio.run(main())
