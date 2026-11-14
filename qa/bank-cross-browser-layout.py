#!/usr/bin/env python3
"""Real Bank Sampah production HTML/CSS regression in Chromium and Firefox.
No test page or database writes. Auth-only DOM is revealed for visual layout checks.
"""
import asyncio
import json
import pathlib
from playwright.async_api import async_playwright

URL = "http://127.0.0.1:8765/bank-sampah/"
OUT = pathlib.Path("ops-audit/bank-cross-browser")
OUT.mkdir(parents=True, exist_ok=True)
SIZES = (320, 360, 390, 412, 768, 1024, 1366, 1920)
PAGES = ("pageDashboard", "pageSetoran", "pagePenjualan",
         "pageMaster", "pageAdmin", "pageProfile")

PREPARE = r"""() => {
  document.documentElement.classList.remove('f4-bank-auth-pending');
  const b = document.body;
  b.classList.add('f4-direct-bank', 'f4-bank-app-admin',
                  'f4-bank-app-private', 'v17-dashboard');
  b.classList.remove('f4-bank-app-member', 'f4-bank-app-public', 'f4-embedded-bank');
  b.dataset.f4BankRole = 'admin';
  document.getElementById('authView')?.classList.add('hidden');
  document.getElementById('dashboardView')?.classList.remove('hidden');
  let nav=document.getElementById('f4BankAppDock');
  if(!nav) {
    nav=document.createElement('nav');
    nav.id='f4BankAppDock';
    nav.className='f4-bank-app-dock';
    document.body.append(nav);
  }
  nav.removeAttribute('hidden');
  nav.replaceChildren();
  for (const name of ['Beranda','Penjualan','Setoran','Saldo','Laporan']) {
    const button=document.createElement('button');
    button.className='f4-bank-app-dock-action';
    button.textContent=name;
    nav.append(button);
  }
}"""

MEASURE = r"""(pageId) => {
  for(const item of document.querySelectorAll(
       '#dashboardView > .grid > .section > [id^="page"]')) {
    item.classList.toggle('hidden',item.id!==pageId);
  }
  const vp=innerWidth;
  const box=sel=>{
    const e=document.querySelector(sel);
    if(!e)return null;
    const r=e.getBoundingClientRect();
    return {left:Math.round(r.left),right:Math.round(r.right),
      width:Math.round(r.width),bottom:Math.round(r.bottom)};
  };
  const overflowing=[];
  for(const e of document.querySelectorAll('#dashboardView *')){
    if(e.getClientRects().length===0)continue;
    const rect=e.getBoundingClientRect();
    if(rect.width>0 && rect.right>vp+3 && getComputedStyle(e).position!=='fixed'){
      overflowing.push({tag:e.tagName.toLowerCase(),id:e.id,
        className:typeof e.className==='string'?e.className.slice(0,85):'',
        right:Math.round(rect.right),width:Math.round(rect.width)});
      if(overflowing.length>=8)break;
    }
  }
  return {page:pageId,viewport:vp,scrollWidth:document.documentElement.scrollWidth,
    bodyScrollWidth:document.body.scrollWidth,scrollX:scrollX,
    screen:box('#dashboardView > .grid > .section'),pageBox:box('#'+pageId),
    dock:box('#f4BankAppDock'),dockPosition:
    getComputedStyle(document.getElementById('f4BankAppDock')).position,
    overflowing};
}"""

async def main():
    results=[]
    async with async_playwright() as p:
        for engine_name in ("chromium", "firefox"):
            browser=await getattr(p,engine_name).launch(args=["--no-sandbox"] if engine_name=="chromium" else [])
            for width in SIZES:
                context=await browser.new_context(viewport={"width":width,"height":844},
                    device_scale_factor=1,is_mobile=width<1024 and engine_name=="chromium",
                    has_touch=width<1024)
                page=await context.new_page()
                errors=[]
                page.on("pageerror",lambda e:errors.append(str(e)[:250]))
                try:
                    await page.goto(URL,wait_until="domcontentloaded",timeout=30000)
                    await page.wait_for_timeout(900)
                    await page.evaluate(PREPARE)
                    for page_id in PAGES:
                        state=await page.evaluate(MEASURE,page_id)
                        failures=[]
                        if state["scrollWidth"]>width+2:
                            failures.append("document horizontal overflow")
                        if state["bodyScrollWidth"]>width+2:
                            failures.append("body horizontal overflow")
                        rect=state["pageBox"]
                        if not rect or rect["left"]<-2 or rect["right"]>width+2:
                            failures.append("page cropped or shifted")
                        if width<1024:
                            dock=state["dock"]
                            if not dock or state["dockPosition"]!="fixed" or dock["left"]<-1 or dock["right"]>width+1:
                                failures.append("mobile dock shifted")
                        if width>=1024 and rect and rect["width"]>1122:
                            failures.append("desktop page too wide")
                        if failures:
                            state["failures"]=failures
                        results.append({"engine":engine_name,"width":width,**state})

                    if width in (320, 390, 412):
                        # Exercise the original website's real enhanced controls,
                        # not a detached sample picker or a synthetic page.
                        await page.evaluate(MEASURE,"pagePenjualan")
                        picker=page.locator("#saleBatch + .f4-control-trigger")
                        if await picker.count():
                            await picker.click()
                            dropdown=await page.evaluate("""() => {
                              const root=document.querySelector('.f4-bank-select-dropdown');
                              const r=root?.querySelector('.f4-bank-select-popover')?.getBoundingClientRect();
                              return {exists:!!root,left:r?.left,right:r?.right,
                                isSheet:!!root?.querySelector('.f4-sheet-draggable')};
                            }""")
                            if not dropdown["exists"] or dropdown["left"] < -1 or dropdown["right"] > width+1 or dropdown["isSheet"]:
                                results.append({"engine":engine_name,"width":width,
                                  "failures":["dropdown not anchored within viewport"],"dropdown":dropdown})
                            await page.go_back(wait_until="domcontentloaded")
                            if await page.locator(".f4-bank-select-dropdown").count():
                                results.append({"engine":engine_name,"width":width,
                                  "failures":["Back did not close select dropdown"]})
                        picker=page.locator("#saleDate + .f4-control-trigger")
                        if await picker.count():
                            await picker.click()
                            has_calendar=await page.evaluate("""() =>
                              !!document.querySelector('.f4-control-calendar') &&
                              !!document.querySelector('.f4-control-overlay:not(.f4-bank-select-dropdown)')""")
                            if not has_calendar:
                                results.append({"engine":engine_name,"width":width,
                                    "failures":["date calendar did not open"]})
                            await page.go_back(wait_until="domcontentloaded")
                            if await page.locator(".f4-control-overlay").count():
                                results.append({"engine":engine_name,"width":width,
                                  "failures":["Back did not close date calendar"]})
                    if width in (360,390,1366):
                        await page.evaluate(MEASURE,"pagePenjualan")
                        await page.screenshot(path=str(OUT/f"{engine_name}-{width}-sale.png"))
                    await page.evaluate("window.scrollTo(0,document.body.scrollHeight)")
                    after=await page.evaluate(MEASURE,"pagePenjualan")
                    if after["scrollWidth"]>width+2 or (width<1024 and
                        (not after["dock"] or after["dock"]["left"]<-1 or after["dock"]["right"]>width+1)):
                        results.append({"engine":engine_name,"width":width,"after_scroll":after,"failures":["scroll drift"]})
                except Exception as e:
                    results.append({"engine":engine_name,"width":width,"failures":[str(e)]})
                finally:
                    await context.close()
            await browser.close()
    (OUT/"audit.json").write_text(json.dumps(results,ensure_ascii=False,indent=2))
    failures=[r for r in results if r.get("failures")]
    for row in failures[:32]:
        print(json.dumps(row,ensure_ascii=False))
    print(f"Checked {len(results)} page+browser+width conditions, failures: {len(failures)}")
    assert not failures, f"Bank Sampah actual-page layout failed: {len(failures)} cases"

if __name__=="__main__":
    asyncio.run(main())
