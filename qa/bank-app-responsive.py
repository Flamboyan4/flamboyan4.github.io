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
        await browser.close()
if __name__=="__main__":
    asyncio.run(main())
