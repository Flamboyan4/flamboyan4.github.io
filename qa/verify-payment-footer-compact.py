#!/usr/bin/env python3
"""Read-only responsive regression for Portal Utama's compact mobile wallet footer."""
import asyncio
import pathlib
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
html=(ROOT/"index.html").read_text()
css=(ROOT/"portal-live/home-base.css").read_text()
marker='<footer id="pembayaran"'
assert marker in html
footer=marker+html.split(marker,1)[1].split("</footer>",1)[0]+"</footer>"
assert 'f4-payment-heading' not in footer, "Redundant payment heading"
assert 'f4-payment-copyright' not in footer, "Copyright must be removed"
assert '© 2026 Humas Flamboyan 4' not in footer, "Old copyright text not removed"
assert footer.count('class="f4-payment-row"')==2
assert "salinNorekEx('1330022606479'" in footer
assert "salinNorekEx('901493321399'" in footer
assert "/assets/qris-flamboyan4.jpg" in footer
assert "Unduh QRIS" in footer
assert 'f4-payment-bank-stack' in footer

async def main():
    async with async_playwright() as driver:
        browser=await driver.chromium.launch(args=["--no-sandbox"])
        try:
            for width,height,sidebar in ((1365,768,225),(800,768,225),
                                         (390,844,0),(360,780,0),(320,700,0)):
                prefix=f'<main style="margin-left:{sidebar}px;width:calc(100% - {sidebar}px)">'
                source=('<html><head><meta name="viewport" content="width=device-width,initial-scale=1">'
                        '<style>*{box-sizing:border-box}body{margin:0;font-family:system-ui}'
                        +css+'</style></head><body>'+prefix+footer+'</main></body></html>')
                page=await browser.new_page(viewport={"width":width,"height":height})
                await page.set_content(source,wait_until="domcontentloaded")
                result=await page.evaluate("""() => {
                  const foot=document.querySelector("#pembayaran"),qr=foot.querySelector(".f4-payment-qris"),
                    stack=foot.querySelector(".f4-payment-bank-stack"),
                    rows=[...foot.querySelectorAll(".f4-payment-row")],
                    acts=[...foot.querySelectorAll(".f4-payment-action")],
                    glyph=qr.querySelector("svg,i[data-lucide]");
                  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
                  return {foot:rect(foot),qr:rect(qr),stack:rect(stack),rows:rows.map(rect),
                    actions:acts.map(rect),bg:getComputedStyle(foot).backgroundColor,
                    qrBg:getComputedStyle(qr).backgroundColor,qrIconBg:getComputedStyle(glyph).backgroundColor,
                    bankBg:getComputedStyle(stack).backgroundColor,
                    qrDir:getComputedStyle(qr).flexDirection,
                    qrHref:qr.getAttribute("href"),qrDownload:qr.getAttribute("download"),
                    overflow:document.documentElement.scrollWidth,viewport:innerWidth}
                }""")
                assert result["bg"]=="rgb(255, 255, 255)",(width,"Footer is not white",result)
                assert result["qrIconBg"]=="rgb(48, 152, 77)",(width,"Leaf green QRIS icon missing",result)
                assert result["qrHref"]=="/assets/qris-flamboyan4.jpg" and result["qrDownload"],result
                assert result["overflow"]<=width+1,(width,"Horizontal overflow",result)
                assert all(a["right"]<=width+1 for a in result["actions"]),(width,"Copy control clipped",result)
                qr=result["qr"];stack=result["stack"];rows=result["rows"]
                if width<=760:
                    assert result["qrDir"]=="column",(width,"Mobile QRIS icon not above label",result)
                    assert result["bankBg"]=="rgb(248, 250, 249)",(width,"Bank surface not unified",result)
                    assert rows[0]["x"]>=qr["right"]-1,(width,"Bank methods not right of QRIS",result)
                    assert abs(rows[0]["x"]-rows[1]["x"])<=2,(width,"Banks not stacked",result)
                    assert rows[1]["y"]>rows[0]["y"],(width,"Bank order reversed",result)
                    assert abs(qr["height"]-64)<=1 and abs(stack["height"]-qr["height"])<=1,(
                        width,"Uneven heights between QRIS and bank card",result)
                    assert result["foot"]["height"]<=85,(width,"Footer too tall on mobile",result)
                else:
                    assert qr["x"]<rows[0]["x"]<rows[1]["x"],(width,"Desktop order incorrect",result)
                    assert abs(qr["y"]-rows[0]["y"])<=5 and abs(rows[0]["y"]-rows[1]["y"])<=5,(
                        width,"Desktop row misalignment",result)
                    assert result["foot"]["height"]<=70,(width,"Desktop footer too tall",result)
                print(f"PAYMENT_FOOTER_LAYOUT_PASS width={width} footer={result['foot']['height']:.1f}px "
                      f"qris={qr['height']:.1f}px bank={stack['height']:.1f}px")
                await page.close()
        finally:
            await browser.close()

if __name__=="__main__":
    asyncio.run(main())
