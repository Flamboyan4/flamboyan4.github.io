#!/usr/bin/env python3
"""Read-only layout audit of the actual Portal Utama payment footer.

Renders committed footer HTML+CSS in Chromium without contacting production or changing data.
"""
import asyncio
import pathlib
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
html=(ROOT/"index.html").read_text()
css=(ROOT/"portal-live/home-base.css").read_text()
head='<footer id="pembayaran"'
assert head in html, "Payment footer missing"
fragment=head+html.split(head,1)[1].split("</footer>",1)[0]+"</footer>"
assert fragment.count('class="f4-payment-row"')==3
assert "salinNorekEx('1330022606479'" in fragment
assert "salinNorekEx('901493321399'" in fragment
assert "/assets/qris-flamboyan4.jpg" in fragment
# No independent payment cards may surround the rows.
assert "bg-slate-900 p-3 rounded-xl" not in fragment
page_source='<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;font-family:system-ui}'+css+'</style></head><body>'+fragment+'</body></html>'

async def main():
    async with async_playwright() as driver:
        browser=await driver.chromium.launch(args=['--no-sandbox'])
        try:
            for width,height in ((1365,768),(390,844),(360,780)):
                page=await browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
                await page.set_content(page_source,wait_until='domcontentloaded')
                result=await page.evaluate("""() => {
                  const footer=document.querySelector('#pembayaran'),panel=footer.querySelector('.f4-payment-panel'),
                    title=footer.querySelector('.f4-payment-heading'),rows=[...footer.querySelectorAll('.f4-payment-row')],
                    copyright=footer.querySelector('.f4-payment-copyright'),actions=[...footer.querySelectorAll('.f4-payment-action')];
                  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,height:r.height,width:r.width}};
                  return {footer:rect(footer),panel:rect(panel),title:rect(title),
                    rows:rows.map(rect),copyright:rect(copyright),actions:actions.map(rect),
                    outerWidth:document.documentElement.scrollWidth,viewport:innerWidth}
                }""")
                limit=88 if width>720 else 126
                assert result['footer']['height']<=limit,(width,'Footer too tall',result)
                assert result['outerWidth']<=width+1,(width,'Horizontal overflow',result)
                ys=[row['y'] for row in result['rows']]
                if width>720:
                    assert max(ys)-min(ys)<=3,(width,'Rows not on one line',result)
                    assert abs(result['title']['y']-ys[0])<=15,(width,'Title is not inline',result)
                else:
                    assert abs(ys[0]-ys[1])<=3,(width,'Bank accounts should share one row',result)
                    assert abs(result['title']['y']-ys[2])<=5,(width,'QR and title should share one row',result)
                    assert ys[0]>ys[2],(width,'Mobile row layout is wrong',result)
                assert all(a['right']<=width+1 for a in result['actions']),(width,'Action clipped',result)
                assert result['copyright']['y']>=result['panel']['y']+result['panel']['height']-1
                print(f"PAYMENT_FOOTER_LAYOUT_PASS width={width} height={result['footer']['height']:.1f}px "
                      f"rows={ys}")
                await page.close()
        finally:
            await browser.close()

if __name__=='__main__':
    asyncio.run(main())
