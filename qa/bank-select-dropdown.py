"""Browser regression: real mobile Bank selects stay anchored dropdowns.
Only fixture options are used, no production login or API calls.
"""
import asyncio
from playwright.async_api import async_playwright

ROOT='http://127.0.0.1:8765'
HTML="""<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<base href="http://127.0.0.1:8765/">
<link rel="stylesheet" href="/portal-live/modern-portals.css">
<link rel="stylesheet" href="/portal-live/mobile-bottom-sheets.css">
<link rel="stylesheet" href="/portal-live/bank-eco-pages.css">
</head><body class="f4-direct-bank v17-dashboard f4-bank-app-admin f4-bank-app-private"
data-f4-bank-role="admin">
<div id="dashboardView"><main class="section"><section id="pageSetoran">
  <form id="setoranForm">
  <div class="f4-entry-top-fields">
   <div class="field f4-field-stack"><label for="setWarga">Nama anggota</label>
   <select id="setWarga"><option value="">Pilih warga</option></select></div>
   <div class="field f4-field-stack"><label for="setDate">Tanggal setoran</label>
   <input type="date" id="setDate"></div>
  </div></form></section></main></div>
<script>
for(let i=1;i<=34;i++)document.getElementById('setWarga')
 .add(new Option('Warga '+String(i).padStart(2,'0'),String(i)));
window.changes=0;document.getElementById('setWarga').addEventListener('change',()=>window.changes++);
</script>
<script src="/portal-live/mobile-bottom-sheets.js"></script>
<script src="/portal-live/native-controls.js"></script>
</body></html>"""

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(args=["--no-sandbox"])
  page=await browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
  async def page_fixture(route):
   await route.fulfill(status=200,content_type='text/html',body=HTML)
  await page.route(ROOT+'/bank-dropdown-test',page_fixture)
  await page.goto(ROOT+'/bank-dropdown-test',wait_until='load')
  trigger=page.locator('#setWarga + .f4-control-trigger')
  await trigger.wait_for()
  await trigger.click()
  menu=page.locator('.f4-bank-select-dropdown .f4-bank-select-popover')
  await menu.wait_for()
  info=await page.evaluate("""()=>{
   const trigger=document.querySelector('#setWarga + .f4-control-trigger').getBoundingClientRect();
   const menu=document.querySelector('.f4-bank-select-popover').getBoundingClientRect();
   return {menu:{x:menu.x,right:menu.right,top:menu.top,bottom:menu.bottom,width:menu.width},
    trigger:{x:trigger.x,right:trigger.right,top:trigger.top,bottom:trigger.bottom},
    draggable:!!document.querySelector('.f4-bank-select-popover.f4-sheet-draggable'),
    overlay:getComputedStyle(document.querySelector('.f4-bank-select-dropdown')).backgroundColor,
    options:document.querySelectorAll('.f4-bank-select-popover [role=option]').length,
    vw:innerWidth};
  }""")
  assert info['options']==35,info
  assert not info['draggable'],info
  assert info['menu']['x']>=0 and info['menu']['right']<=info['vw']+2,info
  assert abs(info['menu']['x']-info['trigger']['x'])<5,info
  await page.locator('.f4-bank-select-popover .f4-control-search').fill('Warga 17')
  await page.locator('.f4-bank-select-popover').get_by_role('option',name='Warga 17').click()
  state=await page.evaluate("""()=>({selected:document.querySelector('#setWarga').value,
     changes:window.changes,open:!!document.querySelector('.f4-bank-select-dropdown')})""")
  assert state=={"selected":"17","changes":1,"open":False},state

  await trigger.click()
  assert await menu.count()==1
  await page.go_back(wait_until="domcontentloaded")
  await page.wait_for_timeout(80)
  assert await menu.count()==0,'Back must dismiss dropdown before page navigation'

  date=page.locator('#setDate + .f4-control-trigger')
  await date.click()
  assert await page.locator('.f4-control-overlay:not(.f4-bank-select-dropdown)').count()==1
  assert await page.locator('.f4-control-panel.f4-bank-select-popover').count()==0
  print('BANK_SELECT_ANCHORED_AND_CALENDAR_SHEET_OK',info,state,flush=True)
  await browser.close()

if __name__=='__main__':
 asyncio.run(main())
