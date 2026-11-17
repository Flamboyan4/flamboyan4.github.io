#!/usr/bin/env python3
"""Read-only viewport checks of the real white Portal Utama footer, no production writes."""
import asyncio
import pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text()
css = (ROOT / "portal-live/home-base.css").read_text()
marker = '<footer id="pembayaran"'
assert marker in html
fragment = marker + html.split(marker, 1)[1].split("</footer>", 1)[0] + "</footer>"
assert "f4-payment-heading" not in fragment, "Redundant Pembayaran title must be removed"
assert fragment.count('class="f4-payment-row"') == 2
assert "salinNorekEx('1330022606479'" in fragment
assert "salinNorekEx('901493321399'" in fragment
assert "/assets/qris-flamboyan4.jpg" in fragment
assert "Unduh QRIS" in fragment

async def main():
    async with async_playwright() as driver:
        browser = await driver.chromium.launch(args=["--no-sandbox"])
        try:
            for width, height, sidebar in ((1365, 768, 225), (800, 768, 225),
                                           (390, 844, 0), (360, 780, 0), (320, 700, 0)):
                wrapper = f'<main style="margin-left:{sidebar}px;width:calc(100% - {sidebar}px)">'
                source = ('<html><head><meta name="viewport" content="width=device-width,initial-scale=1">'
                          '<style>*{box-sizing:border-box}body{margin:0;font-family:system-ui}'
                          + css + '</style></head><body>' + wrapper + fragment + '</main></body></html>')
                page = await browser.new_page(viewport={"width": width, "height": height})
                await page.set_content(source, wait_until="domcontentloaded")
                result = await page.evaluate("""() => {
                  const footer=document.querySelector("#pembayaran"), qris=footer.querySelector(".f4-payment-qris"),
                    list=footer.querySelector(".f4-payment-list"), banks=[...footer.querySelectorAll(".f4-payment-row")],
                    copyright=footer.querySelector(".f4-payment-copyright"), actions=[...footer.querySelectorAll(".f4-payment-action")];
                  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height,width:r.width}};
                  return {footer:rect(footer),qris:rect(qris),banks:banks.map(rect),actions:actions.map(rect),
                    copyright:rect(copyright),bg:getComputedStyle(footer).backgroundColor,
                    qrisBg:getComputedStyle(qris).backgroundColor,copyBg:getComputedStyle(actions[0]).backgroundColor,
                    viewport:innerWidth,overflow:document.documentElement.scrollWidth,
                    qrisHref:qris.getAttribute("href"),qrisDownload:qris.getAttribute("download")}
                }""")
                assert result["bg"] == "rgb(255, 255, 255)", (width,"Footer not white",result)
                assert result["qrisHref"] == "/assets/qris-flamboyan4.jpg" and result["qrisDownload"], result
                assert result["qrisBg"] != result["copyBg"], (width,"QRIS lacks visual priority",result)
                assert result["overflow"] <= width+1, (width,"Horizontal overflow",result)
                assert all(a["right"] <= width+1 for a in result["actions"]), (width,"Copy action clipped",result)
                qr=result["qris"]
                rows=result["banks"]
                if width <= 760:
                    assert rows[0]["x"] > qr["right"]-1, (width,"Bank methods should be right of QRIS",result)
                    assert abs(rows[0]["x"]-rows[1]["x"]) <= 2, (width,"Banks not stacked",result)
                    assert rows[1]["y"] > rows[0]["y"], (width,"Bank order reversed",result)
                    assert qr["y"] <= rows[0]["y"]+1 and qr["bottom"] >= rows[1]["bottom"]-1, (
                        width,"QRIS should equal the stacked bank methods height",result)
                    assert abs(qr["height"] - (rows[1]["bottom"]-rows[0]["y"])) <= 2, (
                        width,"QRIS and bank column heights differ",result)
                    assert result["footer"]["height"] <= 120, (width,"Mobile footer too tall",result)
                else:
                    assert abs(qr["y"]-rows[0]["y"]) <= 5 and abs(rows[0]["y"]-rows[1]["y"]) <= 5, (
                        width,"Desktop footer should use one row",result)
                    assert qr["x"] < rows[0]["x"] < rows[1]["x"], (width,"Desktop column order wrong",result)
                    assert result["footer"]["height"] <= 95, (width,"Desktop footer too tall",result)
                assert result["copyright"]["y"] >= result["qris"]["bottom"]-1, result
                print(f"PAYMENT_FOOTER_LAYOUT_PASS width={width} height={result['footer']['height']:.1f}px "
                      f"QRIS={qr['height']:.1f}px bankRows={[r['height'] for r in rows]}")
                await page.close()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
