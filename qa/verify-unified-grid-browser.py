#!/usr/bin/env python3
"""Read-only browser fixture for shared grid across all native portals."""
import asyncio, json, pathlib, subprocess, os, time
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
PAGES=['/','/bank-sampah/','/pembukuan/','/superadmin/','/rapat/','/dokumentasi/']
SIZES=[('pc',1440,900,3,4),('tablet',900,900,2,2),('hp',390,844,1,2)]
async def main():
    proc=subprocess.Popen(['python3','-m','http.server','8765','--bind','127.0.0.1'],
        cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    results=[]
    try:
        await asyncio.sleep(1)
        async with async_playwright() as p:
            browser=await p.chromium.launch(args=['--no-sandbox'])
            for path in PAGES:
                for name,width,height,expected3,expected4 in SIZES:
                    context=await browser.new_context(viewport={'width':width,'height':height})
                    await context.route('https://api.flamboyan4.web.id/**',
                        lambda route: route.fulfill(status=401,content_type='application/json',
                            body='{"ok":false,"error":"QA tanpa sesi"}'))
                    page=await context.new_page()
                    try:
                        response=await page.goto('http://127.0.0.1:8765'+path,
                            wait_until='domcontentloaded',timeout=30000)
                        state=await page.evaluate("""() => {
                            const sample=(cols,n)=>{
                                const root=document.createElement('section');
                                root.className='f4-grid';root.dataset.cols=String(cols);
                                root.style.width='min(100%,960px)';
                                for(let i=0;i<n;i++){
                                  const x=document.createElement('div');
                                  x.textContent='Kartu '+(i+1);x.style.minHeight='40px';
                                  root.append(x);
                                }
                                document.body.append(root);
                                const computed=getComputedStyle(root);
                                const r=root.getBoundingClientRect();
                                const children=[...root.children].map(x=>x.getBoundingClientRect());
                                const result={columns:computed.gridTemplateColumns.split(' ').filter(Boolean).length,
                                  fits:children.every(x=>x.left>=r.left-2&&x.right<=r.right+2),
                                  width:r.width};
                                root.remove();return result;
                            };
                            return {grid3:sample(3,3),grid4:sample(4,4),
                              stylesheet:[...document.styleSheets].some(x=>
                                String(x.href||'').includes('direct-shell.css'))};
                        }""")
                        good=(response is not None and response.status==200 and
                            state['stylesheet'] and state['grid3']['columns']==expected3 and
                            state['grid4']['columns']==expected4 and
                            state['grid3']['fits'] and state['grid4']['fits'])
                        results.append({'page':path,'size':name,'passed':good,
                            'grid3':state['grid3']['columns'],'grid4':state['grid4']['columns']})
                    except Exception as e:
                        results.append({'page':path,'size':name,'passed':False,
                                        'error':str(e)[:250]})
                    finally:
                        await context.close()
            await browser.close()
    finally:
        proc.terminate()
        try:proc.wait(timeout=5)
        except subprocess.TimeoutExpired:proc.kill()
    target=ROOT/'ops-audit/unified-grid-smoke.json'
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(results,indent=2))
    for x in results:print(x)
    count=sum(x['passed'] for x in results)
    print('UNIFIED_GRID_BROWSER_PASS='+str(count)+'/'+str(len(results)))
    if count!=len(results):raise SystemExit(1)
asyncio.run(main())
