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
                    # Role-surface observer composes the actual admin home after
                    # the auth-only source DOM is revealed in this test.
                    await page.wait_for_timeout(250)
                    if width >= 1024:
                        await page.evaluate(MEASURE,"pageDashboard")
                        desktop=await page.evaluate("""() => {
                          const root=document.getElementById('f4BankAppHome');
                          const hero=document.getElementById('f4BankAppAdminHero');
                          const actions=document.getElementById('f4BankAdminOperations');
                          const recent=document.getElementById('v14Recent')?.closest('.v14-panel');
                          const buttons=[...actions?.querySelectorAll('.f4-bank-admin-operation')||[]];
                          const rect=node=>{
                            if(!node)return null;
                            const r=node.getBoundingClientRect();
                            return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height};
                          };
                          // Visual fixture only when no real data is available;
                          // never submit any test record to the D1 API.
                          const content=document.getElementById('v14Recent');
                          if(content&&!content.querySelector('.f4-recent-item')){
                            const list=document.createElement('div');list.className='f4-recent-list';
                            const item=document.createElement('article');item.className='f4-recent-item';
                            item.innerHTML='<span class="f4-recent-avatar">U</span><div><strong>Uji layout</strong><small>15 Nov 2026 • 1 kg</small></div><div class="f4-recent-value"><b>Rp 1.000</b><span>Hasil jual</span></div>';
                            list.append(item);content.replaceChildren(list);
                          }
                          const row=content?.querySelector('.f4-recent-item');
                          const avatar=row?.querySelector('.f4-recent-avatar');
                          return {exists:!!root,grid:root?getComputedStyle(root).gridTemplateAreas:null,
                            hero:rect(hero),actions:rect(actions),recent:rect(recent),
                            buttons:buttons.map(rect),recentRowDisplay:row?getComputedStyle(row).display:null,
                            avatarDisplay:avatar?getComputedStyle(avatar).display:null};
                        }""")
                        problems=[]
                        if not desktop["exists"] or not all(desktop.get(k) for k in ("hero","actions","recent")):
                            problems.append("real desktop manager dashboard is not composed")
                        else:
                            hero,actions,recent=desktop["hero"],desktop["actions"],desktop["recent"]
                            if abs(hero["top"]-recent["top"])>3 or abs(actions["bottom"]-recent["bottom"])>3:
                                problems.append("recent panel is not aligned with hero top and button bottom")
                            if recent["left"] < hero["right"]+4 or actions["top"] < hero["bottom"]-3:
                                problems.append("desktop dashboard columns overlap or buttons not below balance")
                            if abs(hero["left"]-actions["left"])>2:
                                problems.append("actions do not line up under balance")
                            if (len(desktop["buttons"])!=2
                                or desktop["buttons"][0]["right"] > desktop["buttons"][1]["left"]+2
                                or abs(desktop["buttons"][0]["top"]-desktop["buttons"][1]["top"])>2):
                                problems.append("Catat Setoran and Penjualan are not side by side")
                            if desktop["recentRowDisplay"]!="grid" or desktop["avatarDisplay"]!="grid":
                                problems.append("desktop recent deposits do not use the mobile card style")
                        if problems:
                            results.append({"engine":engine_name,"width":width,"desktop":desktop,"failures":problems})
                        if width in (1024,1366):
                            await page.screenshot(path=str(OUT/f"{engine_name}-{width}-admin-home.png"))
                    # Check the user's actual desktop Setoran screen: the
                    # live member/date controls belong right of goods and above kg.
                    if width >= 1024:
                        await page.evaluate(MEASURE,"pageSetoran")
                        setoran=await page.evaluate("""() => {
                          const r=(selector)=>{
                            const e=document.querySelector(selector);
                            if(!e)return null;
                            const x=e.getBoundingClientRect();
                            return {left:x.left,right:x.right,top:x.top,bottom:x.bottom};
                          };
                          const color=selector=>{
                            const e=document.querySelector(selector);
                            return e?getComputedStyle(e).backgroundColor:null;
                          };
                          const entry=document.querySelector('#sideNav #v16NavList>.v16-item');
                          return {
                            name:r('#setoranForm #setWarga')||r('#setoranForm .f4-warga-picker'),
                            date:r('#setoranForm #setDate'),
                            meta:r('#setoranForm .f4-entry-top-fields'),
                            main:r('#setoranForm .f4-setoran-main'),
                            summary:r('#setoranForm .f4-setoran-side>.summary-box'),
                            sidebarHeight:entry?.getBoundingClientRect().height||0,
                            colors:{
                              body:color('body'),shell:color('.shell'),content:color('.content'),
                              section:color('#dashboardView>.grid>.section'),footer:color('.footer')
                            }};
                        }""")
                        setoran_fail=[]
                        name,date,meta,main,summary=(setoran.get(k) for k in
                            ('name','date','meta','main','summary'))
                        if not all((name,date,meta,main,summary)):
                            setoran_fail.append('real Setoran form input/grid is missing')
                        else:
                            if meta['left'] < main['right']+5 or abs(meta['left']-summary['left'])>3:
                                setoran_fail.append('member/date card not above total in the right column')
                            if name['right']>date['left']+5 or abs(name['top']-date['top'])>3:
                                setoran_fail.append('member/date fields no longer side by side')
                            if meta['bottom']>summary['top']+2:
                                setoran_fail.append('total weight appears above member/date card')
                        if setoran['sidebarHeight']>41:
                            setoran_fail.append('desktop sidebar menu remains too tall')
                        colors=setoran['colors']
                        if len(set(colors.values()))!=1:
                            setoran_fail.append('background remains striped between body, content and footer')
                        if setoran_fail:
                            results.append({'engine':engine_name,'width':width,
                                'setoran':setoran,'failures':setoran_fail})
                        if width==1366:
                            await page.screenshot(path=str(OUT/f"{engine_name}-1366-setoran-right.png"))
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
                        # Search the real form's select with enough choices
                        # to exercise the same component used by jenis barang.
                        await page.evaluate("""() => {
                          const select=document.getElementById('saleBatch');
                          for(let i=0;i<12;i++)select.append(new Option('Jenis uji '+(i+1),'test-'+i));
                        }""")
                        await page.locator("#saleBatch + .f4-control-trigger").click()
                        search=await page.evaluate("""() => {
                          const panel=document.querySelector('.f4-bank-select-popover');
                          const header=panel?.querySelector('.f4-bank-picker-search-row');
                          const field=header?.querySelector('.f4-control-search');
                          const list=panel?.querySelector('.f4-control-list');
                          const h=header?.getBoundingClientRect();
                          const f=field?.getBoundingClientRect();
                          const l=list?.getBoundingClientRect();
                          return {exists:!!field,left:f?.left,right:f?.right,
                            headerBottom:h?.bottom,listTop:l?.top,
                            fieldPosition:field?getComputedStyle(field).position:null,
                            listScrollable:list?getComputedStyle(list).overflowY:null};
                        }""")
                        if (not search["exists"] or search["left"] < -1 or search["right"] > width+1
                            or search["fieldPosition"]!="static"
                            or search["listTop"] < search["headerBottom"]-1
                            or search["listScrollable"]!="auto"):
                            results.append({"engine":engine_name,"width":width,
                              "failures":["item picker search floats over choices"],"search":search})
                        await page.go_back(wait_until="domcontentloaded")
                        picker=page.locator("#saleDate + .f4-control-trigger")
                        if await picker.count():
                            await picker.click()
                            calendar=await page.evaluate("""() => {
                              const root=document.querySelector('.f4-bank-calendar-dropdown');
                              const panel=root?.querySelector('.f4-bank-calendar-popover');
                              const r=panel?.getBoundingClientRect();
                              return {exists:!!root&&!!panel,position:panel?getComputedStyle(panel).position:null,
                                left:r?.left,right:r?.right,width:r?.width,
                                isSheet:!!root?.querySelector('.f4-sheet-draggable'),
                                days:panel?.querySelectorAll('.f4-control-day').length||0};
                            }""")
                            if (not calendar["exists"] or calendar["position"]!="fixed"
                                or calendar["left"] < -1 or calendar["right"] > width+1
                                or calendar["width"] < min(286,width-24)
                                or calendar["isSheet"] or calendar["days"]<28):
                                results.append({"engine":engine_name,"width":width,
                                  "failures":["calendar dropdown is cropped, narrow or rendered as sheet"],"calendar":calendar})
                            await page.go_back(wait_until="domcontentloaded")
                            if await page.locator(".f4-control-overlay").count():
                                results.append({"engine":engine_name,"width":width,
                                  "failures":["Back did not close date calendar"]})
                            # The original native input continues receiving the real
                            # change event when a calendar day is picked.
                            await picker.click()
                            await page.locator(".f4-bank-calendar-popover .f4-control-day:not([disabled])").first.click()
                            date_state=await page.evaluate("""() => ({
                              value:document.getElementById('saleDate').value,
                              open:!!document.querySelector('.f4-bank-calendar-dropdown')
                            })""")
                            if not date_state["value"] or date_state["open"]:
                                results.append({"engine":engine_name,"width":width,
                                    "failures":["calendar day did not update original input"],"date":date_state})
                    # Open the portal's existing credential modal, not a
                    # mock overlay, and verify its real bottom sheet and Back.
                    if width == 390:
                        modal=page.locator("#credentialModal")
                        if await modal.count():
                            await page.evaluate("""() => {
                              const modal=document.getElementById('credentialModal');
                              modal.classList.remove('hidden');
                              window.F4BankModalHistory?.refresh?.();
                              window.F4MobileSheets?.refresh?.();
                            }""")
                            await page.wait_for_timeout(190)
                            sheet=await page.evaluate("""() => {
                              const modal=document.getElementById('credentialModal');
                              const grip=document.querySelector('.f4-sheet-handle');
                              const panel=modal?.querySelector('.f4-bank-credential-panel');
                              return {open:modal&&!modal.classList.contains('hidden'),
                                handleVisible:grip&&getComputedStyle(grip).display!=='none'
                                  && !grip.hidden,attached:!!panel?.classList.contains('f4-sheet-draggable'),
                                guardCount:window.F4BankModalHistory?.getOpenCount?.()||0};
                            }""")
                            if not sheet["open"] or not sheet["handleVisible"] or not sheet["attached"] or sheet["guardCount"]<1:
                                results.append({"engine":engine_name,"width":width,
                                    "failures":["real modal missing bottom-sheet/back guard"],"sheet":sheet})
                            await page.go_back(wait_until="domcontentloaded")
                            if await page.locator("#credentialModal:not(.hidden)").count():
                                results.append({"engine":engine_name,"width":width,
                                    "failures":["Back did not close existing credential modal"]})
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
