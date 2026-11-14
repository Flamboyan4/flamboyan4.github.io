"""Mobile Bank Sampah dock must remain fully usable after Android pinch zoom.

Runs against local HTTP fixtures. No real account, API token, or D1 writes.
"""
import asyncio
import importlib.util
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = "http://127.0.0.1:8765"
spec = importlib.util.spec_from_file_location("bank_responsive_fixture", "qa/bank-app-responsive.py")
fixture = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fixture)

async def geometry(page):
    return await page.evaluate("""() => {
        const n=document.getElementById('f4BankAppDock');
        const r=n.getBoundingClientRect(),v=visualViewport;
        const style=getComputedStyle(n);
        return {left:r.left,right:r.right,bottom:r.bottom,width:r.width,
            expectedLeft:v.offsetLeft,expectedRight:v.offsetLeft+v.width,
            expectedBottom:v.offsetTop+v.height,
            scale:v.scale,transform:style.transform,
            position:style.position,actions:n.querySelectorAll('button').length};
    }""")

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(args=["--no-sandbox"])
        context=await browser.new_context(viewport={"width":390,"height":844},
            device_scale_factor=2,is_mobile=True,has_touch=True)
        page=await context.new_page()
        async def serve(route):
            await route.fulfill(status=200,content_type="text/html",body=fixture.HTML)
        await page.route(ROOT+"/bank-test-fixture",serve)
        await page.goto(ROOT+"/bank-test-fixture",wait_until="load")
        await page.add_script_tag(url=ROOT+"/portal-live/bank-modal-history.js")
        await page.add_script_tag(url=ROOT+"/portal-live/bank-mobile-app.js")
        await page.locator('#f4BankAppDock button').first.wait_for()
        await page.evaluate("document.body.style.minHeight='2500px'")
        await page.evaluate("window.scrollTo(0,550)")
        regular=await geometry(page)
        assert regular["position"]=="fixed" and regular["actions"]==5,regular
        assert regular["transform"]=="none",regular

        cdp=await context.new_cdp_session(page)
        await cdp.send("Emulation.setPageScaleFactor",{"pageScaleFactor":1.5})
        await page.wait_for_function("visualViewport.scale > 1.4")
        await page.wait_for_timeout(180)
        zoomed=await geometry(page)
        assert zoomed["actions"]==5 and zoomed["position"]=="fixed",zoomed
        assert zoomed["width"] <= zoomed["expectedRight"]-zoomed["expectedLeft"]+3,zoomed
        assert zoomed["left"] >= zoomed["expectedLeft"]-3,zoomed
        assert zoomed["right"] <= zoomed["expectedRight"]+3,zoomed
        assert abs(zoomed["bottom"]-zoomed["expectedBottom"])<=4,zoomed
        Path("ops-audit/bank-eco-theme").mkdir(parents=True,exist_ok=True)
        await page.screenshot(path="ops-audit/bank-eco-theme/manager-pinch-zoom.png")

        await cdp.send("Emulation.setPageScaleFactor",{"pageScaleFactor":1})
        await page.wait_for_function("visualViewport.scale < 1.02")
        await page.wait_for_timeout(180)
        restored=await geometry(page)
        assert restored["transform"]=="none",restored
        assert abs(restored["left"])<2,restored
        print("BANK_MOBILE_VISUAL_VIEWPORT_OK",regular,zoomed,restored,flush=True)
        await browser.close()

if __name__=="__main__":
    asyncio.run(main())
