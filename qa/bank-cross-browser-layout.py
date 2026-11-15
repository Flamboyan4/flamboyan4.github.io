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
         "pageMaster", "pageAdmin", "pageProfile", "pageLaporan")

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
                # D1-shaped, read-only fixtures for the public aggregate
                # endpoints. Never mock the production DOM or transaction POSTs.
                async def read_fixture(route,body):
                    await route.fulfill(status=200,content_type="application/json",
                        headers={"access-control-allow-origin":"http://127.0.0.1:8765",
                                 "access-control-allow-credentials":"true"},
                        body=json.dumps(body))
                await page.route("**/api/v2/public/bank/report",lambda route:
                    read_fixture(route,{"ok":True,"ringkasan":{},
                      "bulanan":[{"periode":"2026-10","beratKg":1.9,
                        "pendingWeightKg":0.8,"hasilPenjualan":6000,
                        "pendingEstimateRp":1400}],"harian":[]}))
                await page.route("**/api/v2/public/bank",lambda route:
                    read_fixture(route,{"ok":True,"progress":[
                      {"id":"a","title":"Persiapan lokasi","status":"Selesai","happened_on":"2026-10-12"},
                      {"id":"b","title":"Penimbangan awal","status":"Berjalan","happened_on":"2026-11-15"}],
                      "monthlyWeights":[],"overview":{"activeMembers":33}}))
                await page.route("**/api/public/bank/weighing-schedule",lambda route:
                    read_fixture(route,{"ok":True,"weekday":0,"frequency":"weekly",
                      "nextOccurrence":"2026-11-22"}))
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
                    # Dashboard manager: new features must use LIVE aggregate
                    # labels rendered by production code, not hardcoded screenshots.
                    if width in (390,1366):
                        await page.evaluate(MEASURE,"pageDashboard")
                        try:
                            await page.locator("#f4BankAdminDepositBars .f4-bank-admin-insight-column").first.wait_for(timeout=4000)
                        except Exception:
                            pass
                        panel=await page.evaluate("""() => {
                          const box=id=>{
                            const e=document.getElementById(id);
                            if(!e)return null;
                            const r=e.getBoundingClientRect();
                            return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
                              width:r.width,height:r.height};
                          };
                          const wrap=document.getElementById('f4BankAdminInsights');
                          return {exists:!!wrap,chart:box('f4BankAdminDepositChart'),
                            schedule:box('f4BankAdminScheduleCard'),
                            stages:box('f4BankAdminStages'),wrap:box('f4BankAdminInsights'),
                            columns:document.querySelectorAll('#f4BankAdminDepositBars .f4-bank-admin-insight-column').length,
                            date:document.getElementById('f4BankAdminNextDate')?.textContent,
                            progress:document.getElementById('f4BankAdminStageOverview')?.textContent,
                            bar:document.querySelector('#f4BankAdminDepositBars .f4-bank-admin-insight-rail i')
                              ?getComputedStyle(document.querySelector('#f4BankAdminDepositBars .f4-bank-admin-insight-rail i')).height:null};
                        }""")
                        fail=[]
                        if not all(panel.get(k) for k in ("chart","schedule","stages","wrap")):
                            fail.append("new admin graph/schedule/stages not mounted")
                        else:
                            graph,schedule,stages=panel["chart"],panel["schedule"],panel["stages"]
                            if panel["columns"]!=6 or not panel.get("bar"):
                                fail.append("real admin monthly chart not rendered from aggregate")
                            if "22" not in (panel.get("date") or ""):
                                fail.append("weighing date not from configured public schedule")
                            if "1 dari 2" not in (panel.get("progress") or ""):
                                fail.append("published development status not summarized")
                            if width>=1024:
                                if (abs(graph["top"]-schedule["top"])>3 or
                                    schedule["left"]<graph["right"]+5 or
                                    stages["top"]<schedule["bottom"]+5 or
                                    abs(stages["left"]-schedule["left"])>3):
                                    fail.append("desktop chart left and schedule/stages stacked right")
                            elif schedule["top"]<graph["bottom"]+5 or stages["top"]<schedule["bottom"]+5:
                                fail.append("mobile chart/schedule/stages not stacked")
                        if fail:results.append({"engine":engine_name,"width":width,
                            "adminInsights":panel,"failures":fail})
                        await page.screenshot(path=str(OUT/f"{engine_name}-{width}-admin-insights.png"))

                        if width>=1024:
                            recent_scroll=await page.evaluate("""() => {
                              const home=document.querySelector('#f4BankAppHome[data-bank-role="admin"]');
                              const panel=home?.querySelector(':scope > .v14-panel');
                              const list=panel?.querySelector('#v14Recent');
                              const hero=document.getElementById('f4BankAppAdminHero');
                              const actions=document.getElementById('f4BankAdminOperations');
                              if(!panel||!list||!hero||!actions)return {exists:false};
                              const before={panel:panel.getBoundingClientRect().height,
                                hero:hero.getBoundingClientRect().height,
                                actions:actions.getBoundingClientRect().height};
                              const temporary=[];
                              for(let i=0;i<14;i++){
                                const row=document.createElement('div');
                                row.textContent='Riwayat setoran tambahan '+i;
                                row.style.minHeight='78px';row.style.padding='10px';
                                list.append(row);temporary.push(row);
                              }
                              const after={panel:panel.getBoundingClientRect().height,
                                hero:hero.getBoundingClientRect().height,
                                actions:actions.getBoundingClientRect().height,
                                scrollHeight:list.scrollHeight,clientHeight:list.clientHeight,
                                overflow:getComputedStyle(list).overflowY};
                              temporary.forEach(row=>row.remove());
                              return {exists:true,before,after};
                            }""")
                            if (not recent_scroll.get("exists") or
                                abs(recent_scroll["after"]["panel"]-recent_scroll["before"]["panel"])>2 or
                                abs(recent_scroll["after"]["hero"]-recent_scroll["before"]["hero"])>2 or
                                recent_scroll["after"]["scrollHeight"]<=recent_scroll["after"]["clientHeight"] or
                                recent_scroll["after"]["overflow"] not in ("auto","scroll")):
                                results.append({"engine":engine_name,"width":width,
                                    "recentScroll":recent_scroll,
                                    "failures":["Growing recent history must scroll inside a fixed card without stretching hero"]})

                        # Real report controls + finance are MOVED, never cloned.
                        await page.evaluate(MEASURE,"pageLaporan")
                        layout=await page.evaluate("""() => {
                          const r=id=>{
                            const e=document.getElementById(id);if(!e)return null;
                            const b=e.getBoundingClientRect();
                            return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,
                              width:b.width,height:b.height};
                          };
                          const box=document.getElementById('f4BankAdminReportOverview');
                          return {exists:!!box,grid:box?getComputedStyle(box).gridTemplateColumns:null,
                            controls:r('v33ReportControls'),finance:r('v17Finance'),overview:r('f4BankAdminReportOverview'),
                            controlsParent:document.getElementById('v33ReportControls')?.parentElement?.id,
                            financeParent:document.getElementById('v17Finance')?.parentElement?.id,
                            monthChoices:document.getElementById('v33YearSelect')?.options?.length||0,
                            exportButtons:document.querySelectorAll('#v33ReportControls .v33-report-actions button').length};
                        }""")
                        fail=[]
                        if (not layout["exists"] or not all(layout.get(k) for k in ("controls","finance","overview"))
                            or layout["controlsParent"]!="f4BankAdminReportOverview"
                            or layout["financeParent"]!="f4BankAdminReportOverview"):
                            fail.append("real report input and finance not shared in a single grid")
                        else:
                            controls,finance=layout["controls"],layout["finance"]
                            if width>=1024:
                                if abs(controls["top"]-finance["top"])>3 or finance["left"]<controls["right"]+5:
                                    fail.append("PC Laporan input and finance not side by side")
                            elif finance["top"]<controls["bottom"]+5:
                                fail.append("mobile report controls/finance not stacked")
                            if layout["monthChoices"]!=21 or layout["exportButtons"]<3:
                                fail.append("year select or PDF/CSV buttons lost")
                        if fail:results.append({"engine":engine_name,"width":width,
                            "reportLayout":layout,"failures":fail})
                        await page.screenshot(path=str(OUT/f"{engine_name}-{width}-admin-report-grid.png"))
                    # Render actual legacy-v18 Setoran history component on
                    # the real Bank Sampah page (no login and no D1 mutation).
                    if width in (390,1366):
                        await page.evaluate(MEASURE,"pageRiwayat")
                        history_layout=await page.evaluate("""() => {
                          const host=document.getElementById('riwayatList');
                          const sample={id:'qa-estimasi',namaWarga:'Heri Juwandi',
                            rumahWarga:'A5/08',tanggal:'2026-11-15',berat:1.25,
                            beratTimbang:1.25,estimasi:2500,status:'Estimasi'};
                          const fn=typeof v7HistoryCard==='function'?v7HistoryCard:null;
                          if(!host||!fn)return {exists:false,reason:'renderer or host missing'};
                          const confirmed={...sample,id:'qa-sah',status:'Terkonfirmasi',nilaiSahRp:2750};
                          const canceled={...sample,id:'qa-batal',status:'Dibatalkan'};
                          host.replaceChildren(fn(sample,'setoran'),fn(confirmed,'setoran'),fn(canceled,'setoran'));
                          return {
                            exists:true, cards:[...host.querySelectorAll('.f4-admin-deposit-card')].map(card=>{
                              const r=card.getBoundingClientRect();
                              const buttons=[...card.querySelectorAll('button')];
                              return {width:r.width,right:r.right,
                                position:getComputedStyle(card).display,
                                actions:buttons.map(b=>({text:b.textContent.trim(),disabled:b.disabled})),
                                hasExpand:!!card.querySelector('.f4-bs-detail-button,details,.details-panel,[aria-expanded]'),
                                meta:card.querySelector('.f4-admin-deposit-meta')?.textContent,
                                receiptItems:card.querySelectorAll('.f4-admin-deposit-receipt').length
                              };
                            })
                          };
                        }""")
                        failures=[]
                        if not history_layout['exists'] or len(history_layout.get('cards',[]))!=3:
                            failures.append('real Setoran history renderer did not produce 3 cards')
                        else:
                            for index,card in enumerate(history_layout['cards']):
                                if (card['width']<160 or card['right']>width+2
                                    or card['position']!='grid' or card['hasExpand']
                                    or card['receiptItems']!=1
                                    or len(card['actions'])!=3
                                    or [a['text'] for a in card['actions']]!=['Resi','Edit','Batalkan']):
                                    failures.append('Setoran row still has expand/details or malformed actions')
                                if card['actions'][1]['disabled']!=(index!=0):
                                    failures.append('Setoran edit rights changed')
                                if card['actions'][2]['disabled']!=(index!=0):
                                    failures.append('Setoran cancellation rights changed')
                                if '2026-11-15' not in (card.get('meta') or ''):
                                    failures.append('Setoran date not visible')
                        if failures:
                            results.append({'engine':engine_name,'width':width,
                                'historyLayout':history_layout,'failures':failures})
                        await page.screenshot(path=str(OUT/f"{engine_name}-{width}-admin-deposit-history.png"))
                    # Penjualan uses the same compact history component and
                    # colors as Setoran. The fixture renders real production
                    # functions/DOM, without a login or D1 writes.
                    if width in (390,1366):
                        await page.evaluate(MEASURE,"pageRiwayatJual")
                        sale_layout=await page.evaluate("""() => {
                          const host=document.getElementById('riwayatJualList');
                          const sample={id:'qa-sale-draft',lapak:'Bang Jul',
                            tanggal:'2026-11-15',bruto:4500,diterima:2500,
                            nota:'BJ-01',status:'Draft'};
                          const fn=typeof v7HistoryCard==='function'?v7HistoryCard:null;
                          if(!host||!fn)return {exists:false};
                          const confirmed={...sample,id:'qa-sale-confirmed',status:'Terkonfirmasi',
                            bruto:4500,diterima:4500};
                          const canceled={...sample,id:'qa-sale-canceled',status:'Dibatalkan'};
                          host.replaceChildren(fn(sample,'penjualan'),fn(confirmed,'penjualan'),
                            fn(canceled,'penjualan'));
                          host.classList.add('f4-bs-history-list');
                          return {exists:true,cards:[...host.querySelectorAll('.f4-admin-sale-card')].map(card=>{
                            const r=card.getBoundingClientRect();
                            const buttons=[...card.querySelectorAll('button')];
                            return {display:getComputedStyle(card).display,width:r.width,right:r.right,
                              buttons:buttons.map(b=>({text:b.textContent.trim(),disabled:b.disabled})),
                              hasExpand:!!card.querySelector('.f4-bs-detail-button,details,.details-panel,[aria-expanded]'),
                              receiptColor:getComputedStyle(card.querySelector('.f4-admin-deposit-receipt')).backgroundColor,
                              amount:card.querySelector('.f4-admin-deposit-amount')?.textContent};
                          })};
                        }""")
                        errs=[]
                        if not sale_layout['exists'] or len(sale_layout.get('cards',[]))!=3:
                            errs.append('sale history renderer did not create three modern cards')
                        else:
                            for i,card in enumerate(sale_layout['cards']):
                                if (card['display']!='grid' or card['width']<150 or
                                    card['right']>width+2 or card['hasExpand'] or
                                    len(card['buttons'])!=2 or
                                    [b['text'] for b in card['buttons']]!=['Resi','Batalkan']):
                                    errs.append('sale history has legacy expand/misaligned controls')
                                if card['buttons'][1]['disabled']!=(i==2):
                                    errs.append('sale cancellation button changed its eligibility')
                                if card['receiptColor']!='rgb(253, 192, 16)':
                                    errs.append('sale receipt color is not dashboard gold')
                                if '4.500' not in (card['amount'] or ''):
                                    errs.append('sale gross amount missing from summary')
                        if errs:
                            results.append({'engine':engine_name,'width':width,
                                'saleHistory':sale_layout,'failures':errs})
                        await page.screenshot(path=str(OUT/f"{engine_name}-{width}-admin-sale-history.png"))
                        if width==390:
                            # The shared receipt preview exposes optional nota
                            # and pelunasan tools without placing them in JPG.
                            receipt_test=await page.evaluate("""async() => {
                              const tx=window.F4TransactionReceipt;
                              if(!tx)return {exists:false};
                              let acted=0;
                              const record={scope:'bank',id:'qa-sale-receipt',title:'Bukti Penjualan Sampah',
                                party:'Bang Jul',house:'Bank Sampah Flamboyan 4',
                                date:'2026-11-15',method:'Penjualan ke lapak',
                                amount:2500,status:'BAYAR SEBAGIAN',
                                adminActions:[{label:'Ubah No. Bukti',onClick:()=>{acted++;}},
                                  {label:'Catat Pelunasan',onClick:()=>{acted++;}}]};
                              await tx.open(record);
                              const dialog=document.querySelector('#f4-tx-receipt-dialog');
                              const tools=[...dialog.querySelectorAll('.f4-tx-admin-actions button')];
                              const labels=tools.map(x=>x.textContent);
                              tools[0]?.click();
                              await Promise.resolve();
                              await Promise.resolve();
                              const closed=dialog.hidden;
                              await tx.open({...record,id:'qa-no-tools',adminActions:[]});
                              const cleared=!dialog.querySelector('.f4-tx-admin-actions');
                              tx.close();
                              return {exists:true,labels,closed,cleared,acted};
                            }""")
                            if (not receipt_test.get('exists') or
                                receipt_test.get('labels')!=['Ubah No. Bukti','Catat Pelunasan']
                                or not receipt_test.get('closed') or not receipt_test.get('cleared')
                                or receipt_test.get('acted')!=1):
                                results.append({'engine':engine_name,'width':width,
                                    'receiptActions':receipt_test,'failures':['receipt management tools missing or not cleared']})
                    # Setoran Warga: the action must follow actual item fields,
                    # never float alongside the heading (desktop and mobile).
                    if width in (320,390,412,768,1024,1366,1920):
                        await page.evaluate(MEASURE,"pageSetoran")
                        add_layout=await page.evaluate("""() => {
                          // The logged-out test fixture has no D1 item catalog.
                          // Render a single real-classes field row into the
                          // actual production form; no API writes or mock pages.
                          const goods=document.querySelector('#setBarang');
                          if(goods&&!goods.querySelector('.f4-compact-rows')){
                            const list=document.createElement('div');
                            list.className='f4-compact-rows';
                            const row=document.createElement('div');
                            row.className='f4-compact-row';
                            row.innerHTML='<select aria-label="Jenis sampah"><option value="kardus">Kardus</option></select><div class="f4-compact-entry-group"><input aria-label="Berat (kg)" type="number" placeholder="Berat (kg)"><button class="f4-compact-remove" type="button" aria-label="Hapus jenis"></button></div>';
                            list.append(row);goods.replaceChildren(list);
                          }
                          const rect=s=>{
                            const e=document.querySelector(s);
                            if(!e)return null;
                            const r=e.getBoundingClientRect();
                            return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,width:r.width};
                          };
                          const main=document.querySelector('#setoranForm .f4-setoran-main');
                          const button=document.querySelector('#f4SetAddKind');
                          const dateInput=document.querySelector('#setDate');
                          const candidate=dateInput?.nextElementSibling;
                          const dateVisual=candidate?.matches?.('.f4-bs-date-trigger,.f4-control-trigger') &&
                            getComputedStyle(candidate).display!=='none' ? candidate : dateInput;
                          const rdate=dateVisual?.getBoundingClientRect();
                          return {head:rect('#setoranForm .f4-entry-goods-heading h3'),
                            goods:rect('#setBarang .f4-compact-rows'),
                            button:rect('#f4SetAddKind'),
                            main:rect('#setoranForm .f4-setoran-main'),
                            nameControl:rect('#setoranForm .f4-warga-picker-open'),
                            dateControl:rdate?{top:rdate.top,bottom:rdate.bottom,height:rdate.height}:null,
                            order:button&&main?[...main.children].indexOf(button):null};
                        }""")
                        errors=[]
                        head,goods,button,main=(add_layout.get(k) for k in ('head','goods','button','main'))
                        if not all((head,goods,button,main)):
                            errors.append("Setoran Warga goods, title or add action missing")
                        else:
                            if (button['top']<goods['bottom']-1 or
                                button['width']<goods['width']-2 or
                                abs(button['left']-goods['left'])>2):
                                errors.append("Setoran Warga add button not full-width below the goods")
                            if goods['top']-head['bottom']>20:
                                errors.append("Setoran Warga goods row too far below the title")
                            if add_layout['order']!=2:
                                errors.append("Setoran Warga add action is not the third direct item")
                        member,date=add_layout.get('nameControl'),add_layout.get('dateControl')
                        if not member or not date:
                            errors.append('member name or date visual control not available')
                        elif (abs(member['height']-date['height'])>1 or
                              (width>=1024 and abs(member['top']-date['top'])>1)):
                            errors.append('member select and date inputs have different heights or desktop baselines')
                        if errors:
                            results.append({'engine':engine_name,'width':width,
                                'setoranAdd':add_layout,'failures':errors})
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
                            name:r('#setoranForm .f4-warga-picker')||r('#setoranForm #setWarga'),
                            date:r('#setoranForm .f4-bs-date-trigger')||r('#setoranForm .f4-control-trigger')||r('#setoranForm #setDate'),
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
                    # The real custom warga picker shortens display only.
                    # Its underlying member ID and full registered name are
                    # deliberately untouched for D1 form submission.
                    if width in (390,1366):
                        await page.evaluate(MEASURE,"pageSetoran")
                        await page.evaluate("""() => {
                          const input=document.getElementById('setWarga');
                          input.add(new Option(
                            'Heri Juwandi — A5/08 (member:qa-only)','qa-only'
                          ));
                          input.value='qa-only';
                          input.dispatchEvent(new Event('change',{bubbles:true}));
                        }""")
                        await page.wait_for_timeout(40)
                        picked=await page.evaluate("""() => ({
                          label:document.querySelector('#setWarga')?.closest('.f4-warga-picker')
                            ?.querySelector('.f4-warga-picker-open')?.textContent?.trim(),
                          full:document.querySelector('#setWarga')?.selectedOptions[0]?.textContent,
                          id:document.querySelector('#setWarga')?.value
                        })""")
                        if (picked['label']!='Pak Heri' or picked['id']!='qa-only'
                            or not picked['full'].startswith('Heri Juwandi')):
                            results.append({'engine':engine_name,'width':width,
                                'picker':picked,'failures':['short first-name display altered original data']})
                        await page.locator("#setWarga").locator("xpath=..").locator(".f4-warga-picker-open").click()
                        await page.locator(".f4-warga-picker-pop:not([hidden]) input").fill("Juwandi")
                        names=await page.locator(".f4-warga-picker-pop:not([hidden]) .f4-warga-picker-row").all_text_contents()
                        if not any("Pak Heri" in name for name in names):
                            results.append({'engine':engine_name,'width':width,'matches':names,
                                'failures':['search by full name no longer finds shortened label']})
                        await page.keyboard.press("Escape")

                    # Exercise the original own-stock UI via the actual Setoran
                    # route. Only the catalog GET gets a synthetic test fixture;
                    # the form is NEVER submitted and D1 is not modified.
                    if width==1366:
                        async def catalog_fixture(route):
                            await route.fulfill(status=200,content_type='application/json',
                                body='{"ok":true,"data":[{"id":"qa-kardus","name":"Kardus","active":1,"priceRpPerKg":500}]}')
                        await page.route("**/api/v2/admin/bank/catalog",catalog_fixture)
                        await page.evaluate("window.goPage('setoran')")
                        await page.locator('#f4BankOwnModeTabs button[data-mode="bank"]').click()
                        await page.wait_for_selector('#f4BankOwnLines input[data-own-weight="1"]',timeout=10000)
                        await page.locator('#f4BankOwnLines input[data-own-weight="1"]').fill('1.25')
                        own=await page.evaluate("""() => {
                          const rect=sel=>{
                            const e=document.querySelector(sel);
                            if(!e)return null;
                            const r=e.getBoundingClientRect();
                            return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};
                          };
                          return {
                            date:rect('#f4BankOwnDate'),
                            fields:rect('#f4BankOwnDepositForm .f4-bank-own-fields'),
                            main:rect('#f4BankOwnDepositForm .f4-bank-own-main'),
                            total:rect('#f4BankOwnDepositForm .f4-bank-own-weight-summary'),
                            add:rect('#f4BankOwnDepositForm .f4-bank-own-detail>.f4-compact-add'),
                            goods:rect('#f4BankOwnLines'),
                            head:rect('#f4BankOwnDepositForm .f4-bank-own-detail-head'),
                            value:document.querySelector('#f4BankOwnWeightTotal')?.textContent
                          };
                        }""")
                        err=[]
                        if not all(own.get(k) for k in ('date','fields','main','total')):
                            err.append('Bank Sampah own-deposit date/total card missing')
                        else:
                            if (own['fields']['left']<own['main']['right']+5 or
                                abs(own['fields']['left']-own['total']['left'])>3 or
                                own['fields']['bottom']>own['total']['top']+2):
                                err.append('Bank Sampah own-deposit date is not above total in right column')
                        if own['value']!='1,25 kg':
                            err.append('real Bank stock weight input did not update total kg')
                        if not all(own.get(k) for k in ('add','goods','head')):
                            err.append('Bank Sampah add-action structure is missing')
                        else:
                            if (own['add']['top']<own['goods']['bottom']-1 or
                                abs(own['add']['left']-own['goods']['left'])>2 or
                                own['add']['right']<own['goods']['right']-2 or
                                own['goods']['top']-own['head']['bottom']>20):
                                err.append('Bank Sampah add-action not aligned below item rows')
                            warga_title_gap=add_layout['goods']['top']-add_layout['head']['bottom']
                            bank_title_gap=own['goods']['top']-own['head']['bottom']
                            warga_button_gap=add_layout['button']['top']-add_layout['goods']['bottom']
                            bank_button_gap=own['add']['top']-own['goods']['bottom']
                            if (abs(warga_title_gap-bank_title_gap)>1.5 or
                                abs(warga_button_gap-bank_button_gap)>1.5):
                                err.append('Setoran Warga and Bank Sampah goods gaps are inconsistent')
                            own['gapComparison']={'titleWarga':warga_title_gap,'titleBank':bank_title_gap,
                                'buttonWarga':warga_button_gap,'buttonBank':bank_button_gap}
                        if err:results.append({'engine':engine_name,'width':width,'own':own,'failures':err})
                        await page.screenshot(path=str(OUT/f"{engine_name}-1366-bank-stock.png"))
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
