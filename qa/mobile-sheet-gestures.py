"""Bottom-sheet regression: bank taps, gesture snap/dismiss, scroll grip and desktop."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
STYLE = ROOT / "portal-live/mobile-bottom-sheets.css"
SCRIPT = ROOT / "portal-live/mobile-bottom-sheets.js"
BANK_HISTORY = ROOT / "portal-live/bank-modal-history.js"

MAIN = """<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;height:100%;font:16px Arial}
.hidden{display:none}
#modal-arisan{position:fixed;inset:0;display:flex;align-items:center;
justify-content:center;background:#0008}
#modal-arisan.hidden{display:none}
#modal-arisan>div{height:420px;display:flex;flex-direction:column;
overflow-y:auto;background:white}
#modal-edit{position:fixed;inset:0;display:flex;align-items:flex-end;background:#0008}
#modal-edit>.f4-book-edit-center{width:100%;height:420px;max-height:90dvh}
#modal-edit .f4-book-edit-card{height:100%;background:white;overflow:auto}
</style></head><body>
<div id="modal-arisan" onclick="if(event.target===this)this.classList.add('hidden')">
 <div><header style="height:60px;flex:none">Daftar Arisan</header>
 <article style="height:1100px;flex:none">Konten panjang bisa digulir</article></div>
</div>
<div class="v21-modal v21-lightbox hidden"><div class="v21-modal-card">
 <img alt="Viewer foto tidak boleh diseret"></div></div>
</body></html>"""

BANK = """<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;min-height:100%}
.hidden{display:none}
#bank-action{margin:32px;font-size:20px;min-height:50px}
.v21-modal,.v24-edit-overlay{position:fixed;inset:0;display:grid}
</style></head><body>
<button id="bank-action" onclick="window.bankClicks=(window.bankClicks||0)+1">Bank Sampah navigasi</button>
<div id="credentialModal" class="hidden"><div class="f4-bank-credential-panel">Akun</div></div>
<div class="v21-modal hidden"><div class="v21-modal-card">Galeri</div></div>
<div class="v24-edit-overlay hidden"><div class="v24-edit-card">Editor</div></div>
</body></html>"""

async def install(page, html):
    await page.set_content(html)
    await page.add_style_tag(path=str(STYLE))
    await page.add_script_tag(path=str(SCRIPT))
    await page.wait_for_selector("body > .f4-sheet-handle", state="attached")
    await page.wait_for_timeout(120)

async def swipe(page, handle, distance, panel=None):
    box = await handle.bounding_box()
    assert box, "Pegangan harus ada ketika popup terbuka"
    x, y = box["x"]+box["width"]/2, box["y"]+box["height"]/2
    await page.mouse.move(x,y)
    await page.mouse.down()
    await page.mouse.move(x,y+distance,steps=14)
    await page.mouse.up()
    if panel is not None:
        # Height transitions repeatedly lay out the entire popup, causing jank.
        css = await panel.evaluate("(e)=>e.style.transition")
        assert "height" not in css, f"Sheet still animates height: {css}"
    await page.wait_for_timeout(290)


async def bank_popup_back_and_unified_sheets(browser):
    """Android/browser Back dismisses one modal layer; unchanged page and PC behavior."""
    page=await browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
    cases="""<!doctype html><html><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
    html,body{height:100%;margin:0}
    .hidden,[hidden]{display:none}
    .v21-modal{position:fixed;inset:0;display:flex;align-items:flex-end;background:#0008}
    .v21-modal-card{width:100%;height:280px;background:#fff}
    .v21-lightbox .v21-modal-card{height:100%;background:#111}
    #f4-tx-receipt-dialog{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0008}
    #f4-tx-receipt-dialog[hidden]{display:none}
    .f4-tx-card{width:320px;height:350px;background:#fff;display:flex;flex-direction:column}
    </style></head><body class="f4-direct-bank">
    <button id="page-action" type="button">Menu halaman</button>
    <div id="v21GalleryModal" class="v21-modal hidden">
      <div class="v21-modal-card"><button class="v21-close" onclick="document.getElementById('v21GalleryModal').classList.add('hidden')">Tutup album</button></div>
    </div>
    <div id="v21Lightbox" class="v21-modal v21-lightbox hidden">
      <div class="v21-modal-card"><button class="v21-close" onclick="document.getElementById('v21Lightbox').classList.add('hidden')">Tutup foto</button></div>
    </div>
    <div id="f4-tx-receipt-dialog" data-scope="bank" hidden>
      <div class="f4-tx-card"><button class="f4-tx-close" onclick="window.F4TransactionReceipt.close()">Tutup resi</button><p>Resi transaksi bank sampah</p></div>
    </div>
    <dialog id="bank-prices" class="f4-bank-sheet-modal">
      <button id="prices-close" onclick="document.getElementById('bank-prices').close()">Tutup harga</button>
      <p>Harga sampah</p>
    </dialog>
    <script>
    window.appBackCount=0;
    window.F4TransactionReceipt={close:()=>{document.getElementById('f4-tx-receipt-dialog').hidden=true}};
    </script></body></html>"""
    async def serve(route):
        await route.fulfill(status=200,content_type="text/html",body=cases)
    await page.route("http://flamboyan-bank.test/*",serve)
    await page.goto("http://flamboyan-bank.test/")
    await page.add_style_tag(path=str(STYLE))
    await page.add_script_tag(path=str(SCRIPT))
    await page.add_script_tag(path=str(BANK_HISTORY))
    # Legacy gallery/sidebar listener is registered after the early history guard in production.
    await page.evaluate("window.addEventListener('popstate',()=>window.appBackCount++)")
    await page.wait_for_function("!!window.F4BankModalHistory")
    errors=[]
    page.on("pageerror",lambda exc:errors.append(str(exc)))
    async def opens(n):
        await page.wait_for_function("(count)=>window.F4BankModalHistory.getOpenCount()===count",arg=n)
    await page.evaluate("document.getElementById('v21GalleryModal').classList.remove('hidden')")
    await opens(1)
    await page.evaluate("document.getElementById('v21Lightbox').classList.remove('hidden')")
    await opens(2)
    await page.evaluate("history.back()")
    await page.wait_for_function("document.getElementById('v21Lightbox').classList.contains('hidden')")
    assert await page.locator("#v21GalleryModal").is_visible(), "Back must close only photo, not album"
    await page.evaluate("history.back()")
    await page.wait_for_function("document.getElementById('v21GalleryModal').classList.contains('hidden')")
    assert await page.evaluate("window.appBackCount")==0,"Back leaked to page routing"

    await page.evaluate("document.getElementById('f4-tx-receipt-dialog').hidden=false")
    await opens(1)
    receipt=page.locator("#f4-tx-receipt-dialog .f4-tx-card")
    coords=await receipt.bounding_box()
    assert coords and coords["width"]>=380 and coords["y"]+coords["height"]>=842,coords
    await page.evaluate("history.back()")
    await page.wait_for_function("document.getElementById('f4-tx-receipt-dialog').hidden")
    assert await page.evaluate("window.appBackCount")==0,"Resi Back changed underlying page"

    await page.evaluate("document.getElementById('bank-prices').showModal()")
    await opens(1)
    price=page.locator("#bank-prices")
    coords=await price.bounding_box()
    assert coords and coords["y"]+coords["height"]>=842,coords
    await page.evaluate("history.back()")
    await page.wait_for_function("!document.getElementById('bank-prices').open")
    assert await page.evaluate("window.appBackCount")==0,"Price Back changed underlying page"

    # The ordinary close button also removes the synthetic browser history layer.
    await page.evaluate("document.getElementById('bank-prices').showModal()")
    await opens(1)
    await page.locator("#prices-close").click()
    await opens(0)
    await page.wait_for_function("!history.state?.f4BankModalGuard")
    assert await page.evaluate("window.appBackCount")==0,"Manual modal close leaked popstate"
    await page.locator("#page-action").click()
    assert not errors,errors
    await page.close()
    print("BANK_POPUP_BACK_BOTTOM_SHEETS_OK",flush=True)

async def verify():
    async with async_playwright() as p:
        browser=await p.chromium.launch(args=["--no-sandbox"])
        mobile=await browser.new_page(viewport={"width":390,"height":844},
                                      is_mobile=True,has_touch=True)
        errors=[]
        mobile.on("pageerror",lambda exc:errors.append(str(exc)))
        await install(mobile,MAIN)
        handle=mobile.locator("body > .f4-sheet-handle")
        panel=mobile.locator("#modal-arisan > div")
        assert await handle.is_visible(), "Pegangan harus terlihat"
        assert await mobile.locator(".v21-lightbox .f4-sheet-handle").count()==0
        before=await panel.evaluate("(e)=>e.getBoundingClientRect().top")
        grip_before=(await handle.bounding_box())["y"]
        assert abs(before-grip_before)<5, "Pegangan tidak sejajar tepi panel"
        await swipe(mobile,handle,-160,panel)
        assert await panel.evaluate("(e)=>e.classList.contains('f4-sheet-expanded')")
        top=await panel.evaluate("(e)=>e.getBoundingClientRect().top")
        assert top<=25, f"Sheet tidak mencapai bagian atas: {top}"
        await panel.evaluate("(e)=>e.scrollTop=280")
        await mobile.wait_for_timeout(90)
        box=await handle.bounding_box()
        assert abs(box["y"]-top)<6,"Pegangan berpindah sewaktu isi digulir"
        await swipe(mobile,handle,115,panel)
        assert not await panel.evaluate("(e)=>e.classList.contains('f4-sheet-expanded')")
        await swipe(mobile,handle,150,panel)
        assert await mobile.locator("#modal-arisan").evaluate(
            "(e)=>e.classList.contains('hidden')"), "Swipe ke bawah tidak menutup"
        assert not await handle.is_visible(), "Pegangan tetap menutup halaman"
        assert not errors, f"JavaScript exception(s): {errors}"

        editor=await browser.new_page(viewport={"width":390,"height":844},
                                      is_mobile=True,has_touch=True)
        await install(editor, """<meta name="viewport" content="width=device-width,initial-scale=1">
        <style>html,body{margin:0}#modal-edit{position:fixed;inset:0;
        display:flex;align-items:flex-end;background:#0008}
        .f4-book-edit-center{height:420px;width:100%;max-height:90dvh}
        .f4-book-edit-card{height:100%;background:white}</style>
        <div id="modal-edit"><div class="f4-book-edit-center">
        <div class="f4-book-edit-card"><h2>Pembukuan</h2></div></div></div>""")
        await swipe(editor,editor.locator("body > .f4-sheet-handle"),-145)
        top=await editor.locator("#modal-edit .f4-book-edit-card").evaluate(
            "(e)=>e.getBoundingClientRect().top")
        assert top<=25,f"Wrapper Pembukuan menghalangi perluasan: {top}"

        bank=await browser.new_page(viewport={"width":390,"height":844},
                                    is_mobile=True,has_touch=True)
        await install(bank,BANK)
        for selector in ("#credentialModal",".v21-modal",".v24-edit-overlay"):
            assert await bank.locator(selector).evaluate(
                "(e)=>getComputedStyle(e).display==='none'"), (
                f"Popup tertutup {selector} masih menutupi laman")
        await bank.locator("#bank-action").click(timeout=2000)
        assert await bank.evaluate("window.bankClicks") == 1, (
            "Navigasi Bank Sampah tertutup oleh overlay tersembunyi")
        assert not await bank.locator("body > .f4-sheet-handle").is_visible()

        pc=await browser.new_page(viewport={"width":1440,"height":900})
        await install(pc,MAIN)
        assert not await pc.locator("body > .f4-sheet-handle").is_visible(), (
            "Pegangan hanya untuk HP, bukan dialog PC")
        await bank_popup_back_and_unified_sheets(browser)
        await browser.close()
        print("PASS: bank taps, hidden overlays, swipe expand/collapse/dismiss, "
              "scroll anchoring, Pembukuan wrapper, lightbox, PC, JS errors")

if __name__=="__main__":
    asyncio.run(verify())
