"""Bottom-sheet regression: bank taps, gesture snap/dismiss, scroll grip and desktop."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
STYLE = ROOT / "portal-live/mobile-bottom-sheets.css"
SCRIPT = ROOT / "portal-live/mobile-bottom-sheets.js"

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
        await browser.close()
        print("PASS: bank taps, hidden overlays, swipe expand/collapse/dismiss, "
              "scroll anchoring, Pembukuan wrapper, lightbox, PC, JS errors")

if __name__=="__main__":
    asyncio.run(verify())
