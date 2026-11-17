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
 // Legacy goPage expects both its original buttons and pages after authenticated setup.
 // Fake their missing shells rather than invoking any login/API.
 const names=['dashboard','profile','setoran','riwayat','riwayatJual','penjualan','rekonsiliasi','pengesahan','tabungan','biaya','laporan','kegiatan','dokumentasi','inventaris','master','admin','progress','password'];
 const host=document.querySelector('#dashboardView>.grid>.section'),side=document.getElementById('sideNav');
 for(const name of names){
   const title=name.charAt(0).toUpperCase()+name.slice(1);
   if(!document.getElementById('page'+title)){
     const e=document.createElement('section');e.id='page'+title;e.className='hidden';host?.append(e);
   }
   if(!document.getElementById('nav'+title)){
     const e=document.createElement('button');e.id='nav'+title;e.className='hidden';side?.append(e);
   }
 }
 // The baseline member savings DOM is normally created by v12Setup after login.
 // Supply those source nodes to the read-only fixture; the actual mobile app then mounts them.
 const savingsPage=document.getElementById('pagePribadi');
 if(savingsPage&&!document.getElementById('v12Private')){
  const source=document.createElement('div');source.id='v12Private';
  const stats=document.createElement('div');stats.className='stats';
  stats.innerHTML='<div class="stat"><small>Saldo</small><strong>—</strong></div>';
  const title=document.createElement('h2');title.textContent='Rincian barang';
  const deposits=document.createElement('div');deposits.id='v12Deposits';
  source.append(stats,title,deposits);savingsPage.append(source);
 }
 window.f4BankReconcileAccount?.();
}"""
MEASURE="""() => {
 const dock=document.getElementById('f4BankAppDock');
 const box=x=>{if(!x)return null;const r=x.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,top:r.top,bottom:r.bottom};};
 const buttons=[...(dock?.querySelectorAll('.f4-bank-app-dock-action')||[])].map(e=>({name:e.getAttribute('aria-label'),...box(e)}));
 const overflow=[document.documentElement,document.body,...document.querySelectorAll('body *')].map(e=>({e,d:e.scrollWidth-e.clientWidth}))
  .filter(x=>x.d>4).sort((a,b)=>b.d-a.d).slice(0,12)
  .map(x=>({id:x.e.id,tag:x.e.tagName,cls:typeof x.e.className==='string'?x.e.className.slice(0,70):'',extra:x.d,scroll:x.e.scrollWidth,client:x.e.clientWidth}));
 const outside=[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length)
  .map(e=>({e,r:e.getBoundingClientRect()})).filter(x=>x.r.right>document.documentElement.clientWidth+3)
  .sort((a,b)=>b.r.right-a.r.right).slice(0,18)
  .map(x=>({id:x.e.id,tag:x.e.tagName,cls:typeof x.e.className==='string'?x.e.className.slice(0,70):'',
   left:Math.round(x.r.left),right:Math.round(x.r.right),width:Math.round(x.r.width),
   pos:getComputedStyle(x.e).position,display:getComputedStyle(x.e).display,
   transform:getComputedStyle(x.e).transform.slice(0,70)}));
 return {outside,viewport:innerWidth,htmlClient:document.documentElement.clientWidth,visualScale:visualViewport?.scale,meta:document.querySelector('meta[name=viewport]')?.content,
  bodyRect:box(document.body),htmlRect:box(document.documentElement),
  doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,
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
     for route in ('pribadi','bank-history','bank-report','bank-payout'):
      await page.evaluate(PREPARE)
      await page.evaluate("(route)=>window.goPage(route)",route)
      await page.wait_for_timeout(120)
      if route=='pribadi':
       # Real member app handles the same event sent by its read-only statement
       # bridge. Fixture never calls an API or changes stored account data.
       await page.evaluate("""() => {
        const id=document.getElementById('pId');if(id)id.textContent='QA-W017';
        document.getElementById('v12Private')?.classList.remove('hidden');
        window.dispatchEvent(new CustomEvent('f4-bank-member-statement',{detail:{
         wargaId:'QA-W017',saldo:0,totalMasuk:0,totalCair:0,mutasi:[],
         setoran:[{id:'qa-1',tanggal:'2026-11-15',status:'estimasi',
          beratKg:4,estimasiRp:6500,rincian:[
           {barang:'Kardus',beratKg:2},{barang:'Botol Aqua bodong',beratKg:2}
          ]}]
        }}));
       }""")
       await page.wait_for_timeout(80)
       savings=await page.evaluate("""() => {
        const hero=document.getElementById('f4BankSavingsHero');
        const latest=document.getElementById('f4BankLatestComposition');
        const details=latest?.querySelectorAll('.f4-bank-latest-category')||[];
        const stats=document.getElementById('f4BankSavingsStats');
        const chart=document.getElementById('f4BankSavingsChart');
        return {
         hero:!!hero,heroVisible:!!hero&&getComputedStyle(hero).display!=='none',
         heroRadius:hero&&getComputedStyle(hero).borderBottomLeftRadius,
         latest:!!latest,latestVisible:!!latest&&getComputedStyle(latest).display!=='none',
         donut:!!latest?.querySelector('.f4-bank-latest-donut'),
         donutBackground:latest?.querySelector('.f4-bank-latest-donut')?.style.background||'',
         latestText:latest?.textContent||'',details:details.length,
         stats:stats?.querySelectorAll('.f4-bank-savings-stat').length||0,
         chart:!!chart,chartButtons:chart?.querySelectorAll('[data-group],[data-mode]').length||0
        };
       }""")
       if not(savings['heroVisible'] and savings['latestVisible'] and savings['donut'] and
         savings['stats']==4 and savings['chart'] and savings['chartButtons']==5 and
         savings['details']==2 and 'Kardus' in savings['latestText'] and
         'Botol Aqua bodong' in savings['latestText'] and
         '4 kg' in savings['latestText'] and 'conic-gradient' in savings['donutBackground']):
        rows.append({'engine':engine,'width':width,'route':route,'savings':savings,
         'failures':['Member mobile redesign or genuine waste composition not rendered']})
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
