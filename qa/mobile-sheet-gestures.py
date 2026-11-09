"""Isolated mobile bottom-sheet gesture regression. No API requests or data writes."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
STYLE = ROOT / "portal-live/mobile-bottom-sheets.css"
SCRIPT = ROOT / "portal-live/mobile-bottom-sheets.js"

FIXTURE = """<!doctype html><html lang="id"><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html,body{margin:0;height:100%}
#modal-arisan{position:fixed;inset:0;display:flex;align-items:center;
justify-content:center;background:rgba(0,0,0,.5)}
#modal-arisan.hidden{display:none}
#modal-arisan>div{height:420px;display:flex;flex-direction:column;
overflow-y:auto;background:white}
#modal-edit{position:fixed;inset:0;display:flex;align-items:flex-end;background:#0008}
#modal-edit>.f4-book-edit-center{width:100%;height:420px}
#modal-edit .f4-book-edit-card{height:100%;background:white;overflow:auto}
</style></head><body>
<div id="modal-arisan" onclick="if(event.target===this)this.classList.add('hidden')">
<div><header style="height:60px;flex:none">Daftar Arisan</header>
<article style="height:1100px;flex:none">Isi yang bisa digulir</article></div>
</div>
<div class="v21-modal v21-lightbox" hidden><div class="v21-modal-card">
<img alt="Penampil foto layar penuh"></div></div>
</body></html>"""

async def swipe(page, grip, distance):
    box = await grip.bounding_box()
    assert box, "Pegangan tidak muncul"
    x = box["x"] + box["width"] / 2
    y = box["y"] + box["height"] / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x, y + distance, steps=12)
    await page.mouse.up()
    await page.wait_for_timeout(210)

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox"])
        mobile = await browser.new_page(viewport={"width":390,"height":844},
                                        is_mobile=True,has_touch=True)
        await mobile.set_content(FIXTURE)
        await mobile.add_style_tag(path=str(STYLE))
        await mobile.add_script_tag(path=str(SCRIPT))
        await mobile.wait_for_selector("#modal-arisan .f4-sheet-handle")
        await mobile.wait_for_timeout(310)
        grip = mobile.locator("#modal-arisan .f4-sheet-handle")
        visible = await grip.evaluate("(el)=>getComputedStyle(el).display")
        assert visible != "none", "Pegangan tidak tampil di HP"
        assert await mobile.locator(".v21-lightbox .f4-sheet-handle").count()==0, (
            "Penampil foto tidak boleh menjadi bottom sheet")
        await swipe(mobile,grip,-160)
        panel=mobile.locator("#modal-arisan > div")
        assert await panel.evaluate("(el)=>el.classList.contains('f4-sheet-expanded')"), (
            "Geser ke atas tidak memperluas popup")
        top=await panel.evaluate("(el)=>el.getBoundingClientRect().top")
        assert top<=25, f"Popup belum sampai bagian atas layar: {top}"
        await mobile.mouse.move(180,300)
        await mobile.mouse.wheel(0,250)
        assert not await mobile.locator("#modal-arisan").evaluate(
            "(el)=>el.classList.contains('hidden')"), "Scroll isi menutup popup"
        print("DEBUG before downward swipe:", await panel.evaluate("(el)=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom,height:el.getBoundingClientRect().height,expanded:el.classList.contains('f4-sheet-expanded')})"), await grip.bounding_box(), flush=True)
        await swipe(mobile,grip,115)
        print("DEBUG after downward swipe:", await panel.evaluate("(el)=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom,height:el.getBoundingClientRect().height,expanded:el.classList.contains('f4-sheet-expanded')})"), flush=True)
        assert not await panel.evaluate("(el)=>el.classList.contains('f4-sheet-expanded')"), (
            "Geser turun ringan tidak mengembalikan popup")
        await swipe(mobile,grip,150)
        assert await mobile.locator("#modal-arisan").evaluate(
            "(el)=>el.classList.contains('hidden')"), "Geser turun tidak menutup popup"

        editor = await browser.new_page(viewport={"width":390,"height":844},
                                        is_mobile=True,has_touch=True)
        await editor.set_content("""<meta name="viewport" content="width=device-width,initial-scale=1">
        <style>html,body{margin:0}#modal-edit{position:fixed;inset:0;display:flex;
        align-items:flex-end;background:#0008}.f4-book-edit-center{height:420px;
        width:100%;max-height:90dvh}.f4-book-edit-card{height:100%;background:white}</style>
        <div id="modal-edit"><div class="f4-book-edit-center">
        <div class="f4-book-edit-card"><h2>Editor Pembukuan</h2></div></div></div>""")
        await editor.add_style_tag(path=str(STYLE))
        await editor.add_script_tag(path=str(SCRIPT))
        await editor.wait_for_selector("#modal-edit .f4-sheet-handle")
        await swipe(editor,editor.locator("#modal-edit .f4-sheet-handle"),-145)
        top=await editor.locator("#modal-edit .f4-book-edit-card").evaluate(
            "(el)=>el.getBoundingClientRect().top")
        assert top<=25, f"Wrapper editor Pembukuan menghalangi geser atas: {top}"

        pc = await browser.new_page(viewport={"width":1440,"height":900})
        await pc.set_content(FIXTURE)
        await pc.add_style_tag(path=str(STYLE))
        await pc.add_script_tag(path=str(SCRIPT))
        await pc.wait_for_selector("#modal-arisan .f4-sheet-handle", state="attached")
        display = await pc.locator("#modal-arisan .f4-sheet-handle").evaluate(
            "(el)=>getComputedStyle(el).display")
        assert display=="none", "Pegangan tidak boleh terlihat di PC"
        await browser.close()
        print("PASS: swipe up, swipe down, scroll, editor Pembukuan, lightbox and desktop")

if __name__=="__main__":
    asyncio.run(verify())
