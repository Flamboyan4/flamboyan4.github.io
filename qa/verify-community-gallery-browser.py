#!/usr/bin/env python3
"""Read-only browser regression of Galeri Warga and Portal Utama with mock API responses.
No production writes: all API and Google Drive requests are intercepted.
"""
import asyncio
import json
import pathlib
import subprocess
import re
import base64
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
HOST = "http://127.0.0.1:8766"
FOLDER_ID = "1AbcDefGhijkLMnOPQrSTuvw"
FILE_ID = "1XyZAudItPhotoBcdEfGhIJKL"
ALBUM_ID = "doc-audit-01"
GALLERY_API = "https://api.flamboyan4.web.id"
AUDIT = ROOT / "ops-audit"
AUDIT.mkdir(exist_ok=True)

DOCUMENTATION = [{
    "id": ALBUM_ID, "title": "Arisan Audit Browser", "event_on": "2026-11-12",
    "drive_url": "https://drive.google.com/drive/folders/" + FOLDER_ID,
    "category": "Arisan", "description": ""
}]
PORTAL = {"ok": True, "documentation": DOCUMENTATION, "inventory": [], "agenda": [],
          "meetings": [], "projects": [], "banners": [], "arisan": [], "jerseyBapak": [], "jerseyIbu": []}
PHOTO = {"id": "f4photo:audit", "albumId": ALBUM_ID, "driveId": FILE_ID,
         "url": "https://lh3.googleusercontent.com/d/" + FILE_ID,
         "caption": "Foto warga audit", "date": "2026-11-12 22:00:00", "uploader": "Warga A5",
         "likes": 2, "commentCount": 2,
         "comments": [{"nama": "Warga A5", "message": "Terima kasih semuanya"},
                      {"nama": "Warga B2", "message": "Semoga makin kompak"}]}
GALLERY = {
    "ok": True, "albums": [], "photos": [], "highlights": [PHOTO],
    "popular": [PHOTO], "suppressedDriveIds": [], "uploadEnabled": False, "maxFiles": 12, "maxFileMb": 5
}
SOCIAL = {"ok": True, "likes": 2, "liked": False,
          "comments": [{"id": "c1", "author": "Warga A5", "message": "Terima kasih semuanya"}]}
MOCK_POSTS = []
TINY_PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEElEQVR4nGM44VYBRwzEcQB/EhhhaUt3dAAAAABJRU5ErkJggg==")

async def make_context(browser, width, height, suppressed=False, upload_enabled=False, no_new_photos=False):
    ctx = await browser.new_context(viewport={"width": width, "height": height},
                                    has_touch=width<721,
                                    permissions=["clipboard-read", "clipboard-write"])
    async def api(route):
        url = route.request.url
        if route.request.method == "OPTIONS":
            await route.fulfill(status=204, headers={
                "access-control-allow-origin": HOST,
                "access-control-allow-credentials": "true",
                "access-control-allow-methods": "GET,POST,OPTIONS",
                "access-control-allow-headers": "Authorization,Content-Type"})
            return
        if route.request.method == "POST":
            MOCK_POSTS.append({"url": url, "body": route.request.post_data or ""})
            if "/api/v2/gallery/upload" in url:
                data = {"ok": True, "id": "f4photo:mock", "created": True}
            elif "/api/v2/gallery/react" in url:
                data = {**SOCIAL, "liked": True, "likes": 3}
            else:
                data = {"ok": True, "created": True}
        elif "/api/v2/gallery/social?" in url:
            data = SOCIAL
        elif "/api/v2/gallery/admin" in url:
            data = {"ok": True, "photos": [], "albums": [], "comments": [], "reports": []}
        elif re.search(r"/api/v2/gallery(?:\?|$)", url):
            data = dict(GALLERY)
            data["uploadEnabled"] = upload_enabled
            if no_new_photos:
                data["highlights"] = []
                data["popular"] = []
                data["photos"] = []
            if suppressed: data["suppressedDriveIds"] = [FILE_ID]
        elif "/api/v2/public/portal" in url:
            data = PORTAL
        elif "/api/v2/auth/session" in url:
            data = {"ok": True, "account": {"id": "qa-account", "role": "superadmin", "username": "qa-admin"}}
        else:
            data = {"ok": True, "data": [], "account": {"role": "superadmin"}}
        await route.fulfill(status=200, body=json.dumps(data), content_type="application/json",
                            headers={"access-control-allow-origin": HOST,
                                     "access-control-allow-credentials": "true"})
    async def drive(route):
        data = {"files": [{"id": FILE_ID, "name": "Foto Audit.jpg", "type": "image/jpeg",
                           "url": "https://drive.google.com/file/d/" + FILE_ID + "/view"}]}
        await route.fulfill(status=200, content_type="application/json",
                            body=json.dumps(data), headers={"access-control-allow-origin": "*"})
    await ctx.route("https://lh3.googleusercontent.com/**", lambda route: route.fulfill(status=200, content_type="image/png", body=TINY_PNG))
    await ctx.route(GALLERY_API + "/**", api)
    await ctx.route("https://script.google.com/macros/s/**", drive)
    return ctx

async def validate_documentation(browser, name, width, height):
    context = await make_context(browser, width, height)
    page = await context.new_page()
    try:
        response = await page.goto(HOST + "/dokumentasi/", wait_until="domcontentloaded", timeout=30000)
        assert response and response.status == 200, "Dokumentasi HTTP error"
        await page.locator("#media-albums-section .f4g-hero .f4g-top-actions").wait_for(timeout=25000)
        await page.wait_for_function("!!window.f4GalleryAlbums && window.f4GalleryAlbums().length>0", timeout=25000)
        await page.wait_for_timeout(350)
        assert await page.locator(".f4g-hero-title").inner_text() == "Cerita & Momen Warga"
        assert await page.evaluate("getComputedStyle(document.getElementById('media-albums-section')).borderTopWidth") == "0px", "Outer album frame still present"
        cols = await page.locator("#f4g-feed-grid").evaluate("(e)=>getComputedStyle(e).gridTemplateColumns.split(' ').length")
        assert cols == 3, "Photo grid must show 3 columns"
        assert await page.locator("[data-gallery-view=feed]").get_attribute("aria-selected") == "true"
        await page.locator("#f4g-feed-grid .f4g-feed-card").first.wait_for(timeout=25000)
        # Re-render due to gallery data and repeated auth events must never duplicate controls.
        await page.evaluate("""() => {
          document.dispatchEvent(new Event('f4:gallery:ready'));
          document.dispatchEvent(new Event('f4:gallery:ready'));
          document.dispatchEvent(new Event('f4:auth-changed'));
        }""")
        await page.wait_for_timeout(400)
        assert await page.locator("#media-albums-section .f4g-hero .f4g-top-actions").count() == 1, "Duplicate action bars"
        assert await page.get_by_role("button", name="Unggah Foto", exact=True).count() == 1, "Duplicate Upload buttons"
        assert await page.get_by_role("button", name="Kelola Unggahan", exact=True).count() == 1, "Duplicate Admin buttons"
        # Upload disabled until real Drive credentials exist; UI must explain instead of falsely saving.
        await page.get_by_role("button", name="Unggah Foto", exact=True).click()
        await page.locator(".f4g-overlay").wait_for()
        assert "belum terhubung" in (await page.locator(".f4g-overlay").inner_text()).lower()
        assert await page.locator(".f4g-overlay .f4g-upload-layout").count() == 1
        assert await page.locator(".f4g-overlay .f4g-upload-layout").locator('input[type="file"]').count() == 1
        assert await page.locator(".f4g-overlay").get_by_role("button", name="Menunggu Koneksi Drive").is_disabled()
        assert await page.locator(".f4g-overlay").count() == 1
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelectorAll('.f4g-overlay').length===0")
        assert page.url.endswith("/dokumentasi/"), "Escape navigated away from documentation"
        # Browser Back must dismiss a sheet without leaving Documentation.
        await page.get_by_role("button", name="Unggah Foto", exact=True).click()
        await page.go_back()
        await page.wait_for_function("document.querySelectorAll('.f4g-overlay').length===0")
        assert page.url.endswith("/dokumentasi/"), "Browser Back navigated out of Documentation"
        # Album and photo must remain accessible and show social actions once.
        await page.locator("[data-gallery-view=albums]").click()
        await page.locator(".media-album-card", has_text="Arisan Audit Browser").click()
        await page.wait_for_function("!!document.querySelector('.f4p-album-overlay:not([hidden])')")
        assert await page.locator(".f4p-album-overlay .f4g-album-actions").count() == 1
        await page.locator(".f4p-album-overlay .f4p-album-tile").first.click()
        await page.wait_for_function("!!document.querySelector('.f4p-photo-overlay:not([hidden]) .f4g-photo-actions')")
        assert await page.locator(".f4p-photo-overlay .f4g-photo-actions").count() == 1
        assert await page.locator(".f4p-photo-overlay .f4g-photo-side").count() == 1, "Desktop/mobile photo detail component missing"
        viewer = await page.locator(".f4p-photo-overlay").evaluate("""e => {
          const cs=getComputedStyle(e), r=e.getBoundingClientRect();
          return {background:cs.backgroundColor,width:r.width,height:r.height,
                  clientWidth:innerWidth,clientHeight:innerHeight,
                  albumHidden:getComputedStyle(document.querySelector('.f4p-album-overlay')).visibility}
        }""")
        assert viewer["background"] == "rgb(11, 11, 16)", "Photo background is not solid; album bleeds through"
        assert viewer["albumHidden"] == "hidden", "Album behind photo still visible"
        assert abs(viewer["height"]-viewer["clientHeight"]) <= 2, "Photo viewer is not full viewport height"
        geometry = await page.locator(".f4p-photo-overlay").evaluate("""e => {
          const stage=e.querySelector('.f4p-photo-stage').getBoundingClientRect();
          const side=e.querySelector('.f4g-photo-side').getBoundingClientRect();
          const head=e.querySelector('.f4p-photo-head').getBoundingClientRect();
          return {stageLeft:stage.left,stageRight:stage.right,stageBottom:stage.bottom,
                  headLeft:head.left,headRight:head.right,headTop:head.top,
                  sideLeft:side.left,sideTop:side.top,sideWidth:side.width,
                  sideBottom:side.bottom,sideHeight:side.height}
        }""")
        if name == "hp":
            assert abs(viewer["width"]-viewer["clientWidth"]) <= 2, "Photo viewer is not mobile full viewport width"
            assert geometry["sideTop"] >= geometry["stageBottom"]-3, "Mobile details obscures the photo instead of sitting below"
            assert geometry["sideHeight"] < viewer["clientHeight"]*.30, "Mobile detail panel takes too much photo space"
        else:
            assert geometry["sideLeft"] >= geometry["stageRight"]-4, "PC comments must appear beside photo"
            assert geometry["sideWidth"] >= 280, "PC comment panel too narrow"
            assert abs(geometry["sideTop"]-geometry["headTop"]) <= 3, "PC comments must reach the top of the viewer"
            assert geometry["headRight"] <= geometry["sideLeft"]+4, "PC close button must remain over photo"
        if name == "hp":
            await page.evaluate("""() => {
                const stage = document.querySelector('.f4p-photo-overlay .f4p-photo-stage');
                const start = new Touch({identifier:1,target:stage,clientX:300,clientY:325});
                const end = new Touch({identifier:1,target:stage,clientX:70,clientY:329});
                stage.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[start],targetTouches:[start],changedTouches:[start]}));
                stage.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],targetTouches:[],changedTouches:[end]}));
            }""")
            assert "2 dari" in await page.locator(".f4p-photo-count").inner_text(), "Mobile swipe did not advance to next photo"
        await page.screenshot(path=str(AUDIT / ("photo-viewer-" + name + ".png")), full_page=False)
        # Album and photo share must produce direct links that survive a fresh browser page.
        await page.locator(".f4p-photo-overlay .f4g-photo-actions").get_by_role("button", name="Bagikan foto").click()
        await page.wait_for_timeout(180)
        direct_link = await page.evaluate("navigator.clipboard.readText()")
        assert "album=" + ALBUM_ID in direct_link and "foto=" in direct_link, "Photo share URL incomplete"
        shared = await context.new_page()
        await shared.goto(direct_link, wait_until="domcontentloaded", timeout=30000)
        await shared.wait_for_function("!!document.querySelector('.f4p-photo-overlay:not([hidden])')", timeout=25000)
        await shared.close()
        debug = await page.evaluate("""() => ({
            url:location.href,
            albumOpen:!!document.querySelector('.f4p-album-overlay:not([hidden])'),
            photoOpen:!!document.querySelector('.f4p-photo-overlay:not([hidden])'),
            actions:[...document.querySelectorAll('.f4p-photo-overlay .f4g-photo-actions button')].map(x=>({text:x.textContent,aria:x.getAttribute('aria-label'),hidden:x.hidden})),
            overlays:document.querySelectorAll('.f4g-overlay').length
        })""")
        print("POST_SHARE_STATE", name, json.dumps(debug))
        assert debug["photoOpen"], "Sharing a photo unexpectedly closed the viewer"
        await page.locator(".f4p-photo-overlay .f4g-photo-actions").get_by_role("button", name=re.compile("komentar", re.I)).click()
        await page.locator(".f4g-overlay.f4g-comment-overlay").wait_for()
        assert await page.locator(".f4g-comment-overlay .f4g-comment-list").count() == 1, "Comment sheet content missing"
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelectorAll('.f4g-overlay').length===0")
        assert await page.locator(".f4p-photo-overlay:not([hidden])").count() == 1, "Closing comments also closed photo"
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelectorAll('.f4p-photo-overlay:not([hidden])').length===0")
        assert await page.locator(".f4p-album-overlay").evaluate("e => getComputedStyle(e).visibility") == "visible", "Album not restored after closing photo"
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelectorAll('.f4p-album-overlay:not([hidden])').length===0")
        # Inventory photo should not inherit gallery reactions.
        await page.locator("#media-tab-inventory").click()
        await page.locator(".media-inventory-item", has_text="Dispenser Es").click()
        await page.wait_for_function("!!document.querySelector('.f4p-photo-overlay:not([hidden])')")
        assert await page.locator(".f4p-photo-overlay .f4g-photo-actions").count() == 0, "Inventory has gallery reactions"
        assert await page.locator(".f4p-photo-overlay .f4g-photo-side").count() == 0, "Inventory retained gallery sidebar"
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(150)
        await page.screenshot(path=str(AUDIT / ("gallery-" + name + ".png")), full_page=False)
        return {"viewport": name, "docs": True, "actionBar": 1, "uploadGuard": True,
                "albumViewer": True, "photoViewer": True, "inventoryIsolation": True}
    finally:
        await context.close()

async def validate_upload_with_mock_drive(browser):
    """Test UI binary upload orchestration only. Never send bytes to production Drive."""
    MOCK_POSTS.clear()
    context = await make_context(browser, 1000, 800, upload_enabled=True)
    page = await context.new_page()
    try:
        await page.goto(HOST + "/dokumentasi/", wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_function("!!window.f4GalleryCommunity && window.f4GalleryCommunity.uploadEnabled", timeout=25000)
        await page.get_by_role("button", name="Unggah Foto", exact=True).click()
        panel = page.locator(".f4g-overlay")
        await panel.locator('input[type="file"]').set_input_files([
            {"name": "audit-a.png", "mimeType": "image/png", "buffer": TINY_PNG},
            {"name": "audit-b.png", "mimeType": "image/png", "buffer": TINY_PNG}
        ])
        assert await panel.locator(".f4g-previews figure").count() == 2, "Multi-file preview broken"
        await panel.locator("select").select_option(ALBUM_ID)
        await panel.get_by_role("button", name="Unggah 2 Foto").click()
        await panel.get_by_text("2 foto berhasil disimpan.", exact=False).wait_for(timeout=20000)
        upload_requests = [p for p in MOCK_POSTS if "/api/v2/gallery/upload?" in p["url"]]
        assert len(upload_requests) == 2, "Expected exactly two mocked upload requests"
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelectorAll('.f4g-overlay').length===0")
        assert page.url.endswith("/dokumentasi/"), "Upload close navigated away"
        return {"uploadMock": True, "multiSelect": 2, "uploadCalls": len(upload_requests)}
    finally:
        await context.close()

async def validate_home(browser):
    context = await make_context(browser, 1365, 850)
    page = await context.new_page()
    try:
        await page.goto(HOST + "/", wait_until="domcontentloaded", timeout=30000)
        await page.locator("#cerita-warga:not([hidden]) .f4g-home-card").wait_for(timeout=25000)
        assert await page.locator("#f4g-home-grid .f4g-home-card").count() == 1
        assert await page.locator("#f4g-home-grid .f4g-home-comment").count() == 2
        await page.locator("#f4g-home-popular").click()
        assert await page.locator("#f4g-home-grid .f4g-home-card").count() == 1
        assert await page.locator("#f4g-home-popular").get_attribute("aria-selected") == "true"
        return {"home": True, "latest": True, "popular": True, "commentPreview": 2}
    finally:
        await context.close()

async def validate_legacy_home(browser):
    """Read-only: existing Drive album appears even with zero new community uploads."""
    context = await make_context(browser, 1365, 850, no_new_photos=True)
    page = await context.new_page()
    try:
        await page.goto(HOST + "/", wait_until="domcontentloaded", timeout=30000)
        await page.locator("#cerita-warga:not([hidden]) .f4g-home-card").first.wait_for(timeout=25000)
        assert await page.locator("#f4g-home-grid .f4g-home-card").count() == 1, "Existing album not used on home"
        card = page.locator("#f4g-home-grid .f4g-home-card").first
        assert "Arisan Audit Browser" in await card.inner_text(), "Legacy album title missing"
        href = await card.locator("a.f4g-home-photo").get_attribute("href")
        assert "album=" + ALBUM_ID in href and "foto=gdrive" in href, "Legacy photo deep link invalid"
        await page.locator("#f4g-home-popular").click()
        assert await page.locator("#f4g-home-grid .f4g-home-card").count() == 1, "Popular tab hid older photos"
        return {"legacyHome": True, "legacyDeepLink": True, "newUploadCount": 0}
    finally:
        await context.close()

async def validate_suppression(browser):
    context = await make_context(browser, 1100, 830, suppressed=True)
    page = await context.new_page()
    try:
        await page.goto(HOST + "/dokumentasi/", wait_until="domcontentloaded", timeout=30000)
        await page.locator("[data-gallery-view=albums]").click()
        await page.locator(".media-album-card", has_text="Arisan Audit Browser").wait_for(timeout=25000)
        await page.locator(".media-album-card", has_text="Arisan Audit Browser").click()
        await page.wait_for_function("!!document.querySelector('.f4p-album-overlay:not([hidden])')")
        assert await page.locator(".f4p-album-overlay .f4p-album-tile").count() == 0, "Hidden Drive photo leaked into gallery"
        return {"hiddenPhoto": True}
    finally:
        await context.close()

async def main():
    server = subprocess.Popen(["python3", "-m", "http.server", "8766", "--bind", "127.0.0.1"],
                              cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    results = []
    try:
        await asyncio.sleep(1)
        async with async_playwright() as p:
            browser = await p.chromium.launch(args=["--no-sandbox"])
            try:
                results.append(await validate_documentation(browser, "pc", 1365, 820))
                results.append(await validate_documentation(browser, "hp", 390, 844))
                results.append(await validate_home(browser))
                results.append(await validate_legacy_home(browser))
                results.append(await validate_suppression(browser))
                results.append(await validate_upload_with_mock_drive(browser))
            finally:
                await browser.close()
    finally:
        server.terminate()
        try: server.wait(timeout=4)
        except subprocess.TimeoutExpired: server.kill()
        (AUDIT / "community-gallery-browser.json").write_text(
            json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"result": "PASS", "checks": results}, ensure_ascii=False))
if __name__ == "__main__":
    asyncio.run(main())
