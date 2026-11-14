"""Audit the real Bank Sampah HTML and complete ordered CSS, not a reduced fixture.
Read-only: external scripts and all production API calls are disabled.
"""
import asyncio
import json
import pathlib
import re
from playwright.async_api import async_playwright

ROOT="http://127.0.0.1:8765"
DEST=pathlib.Path("ops-audit/bank-eco-theme")
DEST.mkdir(parents=True,exist_ok=True)
SOURCE=pathlib.Path("bank-sampah/index.html").read_text(encoding="utf-8")
SOURCE=re.sub(r'<script\\b[^>]*>.*?</script\\s*>','',SOURCE,flags=re.I|re.S)
SOURCE=SOURCE.replace('<head>','<head><base href="'+ROOT+'/">',1)
SCREENS=["pageSetoran","pagePenjualan","pageRekonsiliasi","pageTabungan",
         "pageRiwayat","pageRiwayatJual","pageLaporan","pageMaster","pageAdmin"]

async def probe(page,width,screen):
    return await page.evaluate("""(arg)=>{
      const w=arg.width,id=arg.id;
      document.documentElement.classList.remove('f4-bank-auth-pending');
      document.body.className='v17-dashboard f4-direct-bank f4-bank-app-private f4-bank-app-admin';
      document.body.dataset.f4BankRole='admin';
      document.getElementById('dashboardView')?.classList.remove('hidden');
      document.getElementById('v11Public')?.classList.add('hidden');
      document.getElementById('authView')?.classList.add('hidden');
      for(const n of document.querySelectorAll('#dashboardView [id^="page"]'))n.classList.add('hidden');
      const target=document.getElementById(id);if(!target)return {screen:id,missing:true};
      target.classList.remove('hidden');
      document.getElementById('sideNav')?.classList.remove('open');
      if(!document.getElementById('f4BankAppDock')){
        const dock=document.createElement('nav');
        dock.id='f4BankAppDock';dock.className='f4-bank-app-dock';
        for(const label of ['Beranda','Penjualan','Setoran','Saldo','Laporan']){
          const b=document.createElement('button');
          b.className='f4-bank-app-dock-action'+(label==='Setoran'?' is-primary':'');
          const ic=document.createElement('span');ic.className='f4-bank-app-action-icon';
          const img=document.createElement('img');img.src='/assets/icons/bank.svg';
          ic.append(img);b.append(ic);
          if(label!=='Setoran'){
            const t=document.createElement('span');t.className='f4-bank-app-action-name';t.textContent=label;b.append(t);
          }dock.append(b);
        }
        document.body.append(dock);
      }
      window.scrollTo(0,0);
      const rect=n=>{const r=n?.getBoundingClientRect();return r?{x:r.x,right:r.right,w:r.width,top:r.top,bottom:r.bottom}:null};
      const dock=document.getElementById('f4BankAppDock');
      const top=[target,...target.querySelectorAll('form')].map(n=>({id:n.id,rect:rect(n)}));
      const overflow=[...document.querySelectorAll('#dashboardView .section *')].filter(n=>{
        const r=n.getBoundingClientRect(),s=getComputedStyle(n);
        return r.width>0&&r.height>0&&s.display!=='none'&&
          !n.closest('.tablewrap')&&r.right>w+3&&r.left<w&&
          !n.closest('#sideNav');
      }).slice(0,12).map(n=>({tag:n.tagName,id:n.id,cls:String(n.className).slice(0,65),rect:rect(n)}));
      return {screen:id,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        page:rect(target),forms:top,dock:rect(dock),dockPosition:getComputedStyle(dock).position,
        overflow,cssLoaded:getComputedStyle(target).fontSize};
    }""", {"width":width,"id":screen})

async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(args=["--no-sandbox"])
    failures=[]
    summaries=[]
    for width in [320,360,390,412,768,1366]:
      page=await browser.new_page(viewport={"width":width,"height":850},device_scale_factor=1)
      await page.goto(ROOT+"/bank-sampah/",wait_until="domcontentloaded")
      await page.set_content(SOURCE,wait_until="domcontentloaded")
      await page.wait_for_timeout(360)
      for name in SCREENS:
        result=await probe(page,width,name)
        summaries.append(result)
        if result.get("missing"):
          failures.append({"width":width,"screen":name,"reason":"missing"});continue
        b=result["page"]
        if width<=1023 and (b["x"]< -3 or b["right"]>width+4 or
                            result["scrollWidth"]>width+3 or result["overflow"]):
          failures.append({"width":width,"screen":name,"reason":"horizontal overflow","details":result})
        if width<=1023:
          d=result["dock"]
          if result["dockPosition"]!="fixed" or d["w"]>width+3 or d["x"]< -2:
            failures.append({"width":width,"screen":name,"reason":"dock geometry","details":result})
        if width==390 and name in ("pageSetoran","pagePenjualan","pageTabungan","pageLaporan"):
          await page.screenshot(path=str(DEST/f"real-{name}-{width}.png"),full_page=True)
      await page.close()
    (DEST/"real-mobile-allpages.json").write_text(json.dumps(
      {"failures":failures,"results":summaries},ensure_ascii=False,indent=2),encoding="utf-8")
    print("REAL_BANK_PAGES",json.dumps({
      "screens":len(summaries),"failures":failures[:8]},ensure_ascii=False),flush=True)
    await browser.close()
    assert not failures, f"{len(failures)} full CSS responsive regressions; see artifact"

if __name__=="__main__":
  asyncio.run(main())
