#!/usr/bin/env python3
"""Bank Sampah real member-route layout regression, no account access or database writes."""
import asyncio,json,pathlib
from playwright.async_api import async_playwright
ROOT=pathlib.Path("ops-audit/bank-member-runtime");ROOT.mkdir(parents=True,exist_ok=True)
URL="http://127.0.0.1:8766/bank-sampah/"
PREPARE="""() => {
 document.documentElement.classList.remove('f4-bank-auth-pending');
 const b=document.body;
 b.dataset.f4BankRole='warga';
 b.classList.add('f4-direct-bank','f4-bank-app-private','f4-bank-app-member','v17-dashboard');
 b.classList.remove('f4-bank-app-admin');
 document.getElementById('authView')?.classList.add('hidden');
 document.getElementById('dashboardView')?.classList.remove('hidden');
 window.f4BankReconcileAccount?.();
}"""
MEASURE="""() => {
 const dock=document.getElementById('f4BankAppDock');
 const box=x=>{if(!x)return null;const r=x.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,top:r.top,bottom:r.bottom};};
 const buttons=[...(dock?.querySelectorAll('.f4-bank-app-dock-action')||[])].map(e=>({name:e.getAttribute('aria-label'),...box(e)}));
 const overflow=[document.documentElement,document.body,...document.querySelectorAll('#dashboardView *')].map(e=>({e,d:e.scrollWidth-e.clientWidth}))
  .filter(x=>x.d>4).sort((a,b)=>b.d-a.d).slice(0,10)
  .map(x=>({id:x.e.id,tag:x.e.tagName,cls:typeof x.e.className==='string'?x.e.className.slice(0,70):'',extra:x.d,scroll:x.e.scrollWidth,client:x.e.clientWidth}));
 return {viewport:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,
  visual:visualViewport?.width,scrollX,role:document.body.dataset.f4BankRole,dock:box(dock),buttons,
  header:box(document.getElementById('f4-direct-bar')),position:dock?getComputedStyle(dock).position:null,overflow};
}"""
async def main():
 rows=[]
 async with async_playwright() as p:
  for engine in ('chromium','firefox'):
   browser=await getattr(p,engine).launch(args=['--no-sandbox'] if engine=='chromium' else [])
   for width in (360,390,412):
    context=await browser.new_context(viewport={'width':width,'height':844},
     is_mobile=engine=='chromium',has_touch=True)
    page=await context.new_page()
    await page.route('**/api.flamboyan4.web.id/**',lambda route:route.abort())
    try:
     await page.goto(URL,wait_until='domcontentloaded',timeout=20000)
     await page.wait_for_function("typeof window.f4BankReconcileAccount==='function'",timeout=12000)
     await page.evaluate(PREPARE)
     await page.wait_for_timeout(200)
     for route in ('dashboard','pribadi','bank-history','bank-report','bank-member-info'):
      await page.evaluate(PREPARE)
      await page.evaluate("(route)=>window.goPage(route)",route)
      await page.wait_for_timeout(120)
      for where in ('top','bottom'):
       await page.evaluate('window.scrollTo(0,0)' if where=='top' else 'window.scrollTo(0,document.body.scrollHeight)')
       data=await page.evaluate(MEASURE)
       errors=[]
       if len(data['buttons'])!=5:errors.append('Dock has missing buttons')
       if not data['dock'] or data['position']!='fixed':errors.append('Dock not fixed')
       elif data['dock']['left']<-2 or data['dock']['right']>width+2:errors.append('Dock exceeds screen')
       if any(x['left']<-2 or x['right']>width+2 for x in data['buttons']):errors.append('Tab clipped')
       if data['doc']>width+4:errors.append('Document horizontal overflow')
       if data['header'] and (data['header']['left']<-2 or data['header']['right']>width+2):errors.append('Header clipped')
       if data['scrollX']>1:errors.append('Page shifted horizontally')
       row={'engine':engine,'width':width,'route':route,'scroll':where,**data,'failures':errors}
       rows.append(row)
       if engine=='chromium' and width==390 and where=='bottom':
        await page.screenshot(path=str(ROOT/f'{route}.png'))
    except Exception as e:rows.append({'engine':engine,'width':width,'failures':[str(e)]})
    finally:await context.close()
   await browser.close()
 (ROOT/'results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
 fails=[x for x in rows if x['failures']]
 print('Real member routes:',len(rows),'checks;',len(fails),'failures')
 for x in fails[:24]:print(json.dumps(x,ensure_ascii=False)[:2000])
 assert not fails,'Member real route/dock layout drift'
if __name__=='__main__':asyncio.run(main())
