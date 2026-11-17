#!/usr/bin/env python3
"""Bank Sampah member mobile dock/overflow regression without login or data writes.
Uses the REAL application HTML and styles; reveals read-only local fixture pages.
"""
import asyncio
import json
import pathlib
from playwright.async_api import async_playwright

URL="http://127.0.0.1:8766/bank-sampah/"
ROOT=pathlib.Path("ops-audit/bank-member-dock")
ROOT.mkdir(parents=True, exist_ok=True)
SIZES=(320,360,390,412,540)
PAGES=("pagePribadi","bank-history","bank-report","bank-payout")

PREPARE="""() => {
 const body=document.body, doc=document.documentElement;
 doc.classList.remove('f4-bank-auth-pending');
 body.classList.add('f4-direct-bank','f4-bank-app-private','f4-bank-app-member','v17-dashboard');
 body.classList.remove('f4-bank-app-admin','f4-bank-embedded','f4-bank-app-public');
 body.dataset.f4BankRole='warga';
 document.getElementById('authView')?.classList.add('hidden');
 document.getElementById('dashboardView')?.classList.remove('hidden');
 const content=document.querySelector('#dashboardView>.grid>.section');
 if (!content) throw Error('Bank Sampah member section missing');
 let nav=document.getElementById('f4BankAppDock');
 if(!nav){nav=document.createElement('nav');nav.id='f4BankAppDock';document.body.append(nav);}
 nav.className='f4-bank-app-dock';nav.hidden=false;nav.replaceChildren();
 for(const [name,route] of [['Beranda','dashboard'],['Tabungan','pribadi'],['Pencairan','bank-payout'],['Riwayat','bank-history'],['Laporan','bank-report']]){
  const button=document.createElement('button');
  button.type='button';button.className='f4-bank-app-dock-action';
  if(route==='bank-payout')button.classList.add('is-primary');
  button.dataset.bankAppRoute=route;button.setAttribute('aria-label',name);
  const symbol=document.createElement('span');symbol.className='f4-bank-app-action-icon';
  symbol.textContent=route==='bank-payout'?'Rp':'◯';button.append(symbol);
  if(route!=='bank-payout'){
   const label=document.createElement('span');label.className='f4-bank-app-action-name';
   label.textContent=name;button.append(label);
  }
  nav.append(button);
 }
 const header=document.getElementById('f4-direct-bar');
 if(header){
  header.hidden=false;
  const greeting=header.querySelector('.f4-bank-member-top-identity');
  if(greeting){greeting.textContent='';greeting.append('Halo, Pak Test');}
 }
 for(const id of ['pagePribadi','bank-history','bank-report','bank-payout']){
  let page=document.getElementById(id);
  if(!page){
   page=document.createElement('section');page.id=id;page.className='f4-bank-screen hidden';
   page.innerHTML='<h2 class="f4-bank-screen-title">Fixture</h2><div class="f4-bank-report-panel">Konten uji tampilan tanpa data pribadi</div>';
   content.append(page);
  }
 }
}"""

MEASURE="""() => {
 const nav=document.getElementById('f4BankAppDock');
 const box=element=>{
  if(!element)return null;
  const r=element.getBoundingClientRect();
  return {left:r.left,right:r.right,width:r.width,top:r.top,bottom:r.bottom};
 };
 const buttons=[...nav.querySelectorAll('.f4-bank-app-dock-action')].map(x=>({label:x.getAttribute('aria-label'),...box(x)}));
 const offending=[...document.querySelectorAll('body *')]
  .filter(e=>e.getClientRects().length && getComputedStyle(e).position!=='fixed')
  .map(e=>({e,r:e.getBoundingClientRect()})).filter(x=>x.r.width>0 && x.r.right>innerWidth+3)
  .sort((a,b)=>b.r.right-a.r.right).slice(0,12)
  .map(({e,r})=>({tag:e.tagName,id:e.id,cls:typeof e.className==='string'?e.className.slice(0,90):'',
   right:Math.round(r.right),left:Math.round(r.left),width:Math.round(r.width),
   position:getComputedStyle(e).position,overflow:getComputedStyle(e).overflowX}));
 return {offending, vw:innerWidth,visual:visualViewport?.width||innerWidth,
  doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,
  scrollX,nav:box(nav),header:box(document.getElementById('f4-direct-bar')),
  position:getComputedStyle(nav).position,display:getComputedStyle(nav).display,
  buttons};
}"""

async def main():
 results=[]
 async with async_playwright() as pw:
  for engine in ("chromium","firefox"):
   browser=await getattr(pw,engine).launch(args=['--no-sandbox'] if engine=='chromium' else [])
   for width in SIZES:
    context=await browser.new_context(
     viewport={'width':width,'height':844},device_scale_factor=1,
     is_mobile=engine=='chromium',has_touch=True)
    page=await context.new_page()
    try:
     await page.goto(URL,wait_until='domcontentloaded',timeout=20000)
     await page.evaluate(PREPARE)
     for id in PAGES:
      await page.evaluate(PREPARE)
      await page.evaluate("""id=>{
       const pages=['pagePribadi','bank-history','bank-report','bank-payout'];
       for(const node of document.querySelectorAll('#dashboardView>.grid>.section>*')){
        if(node.id?.startsWith('page')||node.classList.contains('f4-bank-screen')){
         node.classList.add('hidden');node.hidden=true;
        }
       }
       for(const x of pages){const e=document.getElementById(x);e.classList.toggle('hidden',x!==id);e.hidden=x!==id;}
       document.querySelectorAll('#f4BankAppDock button').forEach(b=>b.classList.toggle('is-active',b.dataset.bankAppRoute===(id==='pagePribadi'?'pribadi':id)));
      }""",id)
      for mode in ('top','bottom'):
       await page.evaluate("window.scrollTo(0,document.body.scrollHeight)" if mode=='bottom' else "window.scrollTo(0,0)")
       state=await page.evaluate(MEASURE)
       failures=[]
       if state['position']!='fixed' or state['display']!='grid':failures.append('Dock not fixed grid')
       if len(state['buttons'])!=5:failures.append('Not five navigation actions')
       if state['nav'] and (state['nav']['left'] < -2 or state['nav']['right'] > width+2 or abs(state['nav']['width']-width)>2):
        failures.append('Dock shifted outside viewport')
       if any(b['left']<-2 or b['right']>width+2 or b['width']<20 for b in state['buttons']):failures.append('Button clipped')
       if state['scrollX']>1:failures.append('Unexpected horizontal scroll')
       if state['header'] and (state['header']['left']<-2 or state['header']['right']>width+2):failures.append('Header exceeds viewport')
       if state['doc']>width+3 or state['body']>width+3:failures.append('Document overflows horizontally')
       results.append({'engine':engine,'width':width,'page':id,'scroll':mode,**state,'failures':failures})
       if id=='bank-report' and width in (320,390):
        await page.screenshot(path=str(ROOT/f'{engine}-{width}-{mode}.png'))
    except Exception as exc:
     results.append({'engine':engine,'width':width,'failures':[str(exc)]})
    finally: await context.close()
   await browser.close()
 (ROOT/'results.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
 failures=[r for r in results if r['failures']]
 print('Bank member dock:',len(results),'checks,',len(failures),'failures')
 for row in failures[:20]:print(json.dumps(row,ensure_ascii=False)[:1600])
 assert not failures,'Bank Sampah member mobile dock regression failed'

if __name__=='__main__':asyncio.run(main())
