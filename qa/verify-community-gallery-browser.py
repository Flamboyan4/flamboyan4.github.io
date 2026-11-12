#!/usr/bin/env python3
"""Read-only browser regression of Galeri Warga and Portal Utama with mock API responses.
No production writes: all API and Google Drive requests are intercepted.
"""
import asyncio
import json
import pathlib
import subprocess
import re
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

async def make_context(browser, width, height, suppressed=False):
    ctx = await browser.new_context(viewport={"width": width, "height": height},
                                    permissions=["clipboard-read", "clipboard-write"])
    async def api(route):
        url = route.request.url
        if "/api/v2/gallery/social?" in url:
            data = SOCIAL
        elif "/api/v2/gallery/admin" in url:
            data = {"ok": True, "photos": [], "albums": [], "comments": [], "reports": []}
        elif re.search(r"/api/v2/gallery(?:\?|$)", url):
            data = dict(GALLERY)
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
    await ctx.route(GALLERY_API + "/**", api)
    await ctx.route("https://script.google.com/macros/s/**", drive)
    return ctx

async def validate_documentation(browser, name, width, height):
    context = await make_context(browser, width, height)
    page = await context.new_page()
    try:
        response = await page.goto(HOST + "/dokumentasi/", wait_until="domcontentloaded", timeout=30000)
        assert response and response.status == 200, "Dokumentasi HTTP error"
        await page.locator("#media-albums-section > .f4g-top-actions").wait_for(timeout=25000)
        await page.wait_for_function("!!window.f4GalleryAlbums && window.f4GalleryAlbums().length>0", timeout=25000)
        await page.wait_for_timeout(350)
        # Re-render due to gallery data and repeated auth events must never duplicate controls.
        await page.evaluate("""() => {
          document.dispatchEvent(new Event('f4:gallery:ready'));
          document.dispatchEvent(new Event('f4:gallery:ready'));
          document.dispatchEvent(new Event('f4:auth-changed'));
        }""")
        await page.wait_for_timeout(400)
        assert await page.locator("#media-albums-section > .f4g-top-actions").count() == 1, "Duplicate action bars"
        assert await page.get_by_role("button", name="Unggah Foto", exact=True).count() == 1, "Duplicate Upload buttons"
        assert await page.get_by_role("button", name="Kelola Unggahan", exact=True).count() == 1, "Duplicate Admin buttons"
        # Upload disabled until real Drive credentials exist; UI must explain instead of falsely saving.
        await page.get_by_role("button", name="Unggah Foto", exact=True).click()
        await page.locator(".f4g-overlay").wait_for()
        assert "belum tersambung" in (await page.locator(".f4g-overlay").inner_text()).lower()
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
        await page.locator(".media-album-card", has_text="Arisan Audit Browser").click()
        await page.wait_for_function("!!document.querySelector('.f4p-album-overlay:not([hidden])')")
        assert await page.locator(".f4p-album-overlay .f4g-album-actions").count() == 1
        await page.locator(".f4p-album-overlay .f4p-album-tile").first.click()
        await page.wait_for_function("!!document.querySelector('.f4p-photo-overlay:not([hidden]) .f4g-photo-actions')")
        assert await page.locator(".f4p-photo-overlay .f4g-photo-actions").count() == 1
        await page.locator(".f4p-photo-overlay .f4g-photo-actions").get_by_role("button", name=re.compile("Komentar")).click()
        await page.locator(".f4g-overlay").wait_for()
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelectorAll('.f4g-overlay').length===0")
        assert await page.locator(".f4p-photo-overlay:not([hidden])").count() == 1, "Closing comments also closed photo"
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelectorAll('.f4p-photo-overlay:not([hidden])').length===0")
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelectorAll('.f4p-album-overlay:not([hidden])').length===0")
        # Inventory photo should not inherit gallery reactions.
        await page.locator("#media-tab-inventory").click()
        await page.locator(".media-inventory-item", has_text="Dispenser Es").click()
        await page.wait_for_function("!!document.querySelector('.f4p-photo-overlay:not([hidden])')")
        assert await page.locator(".f4p-photo-overlay .f4g-photo-actions").count() == 0, "Inventory has gallery reactions"
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(150)
        await page.screenshot(path=str(AUDIT / ("gallery-" + name + ".png")), full_page=False)
        return {"viewport": name, "docs": True, "actionBar": 1, "uploadGuard": True,
                "albumViewer": True, "photoViewer": True, "inventoryIsolation": True}
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

async def validate_suppression(browser):
    context = await make_context(browser, 1100, 830, suppressed=True)
    page = await context.new_page()
    try:
        await page.goto(HOST + "/dokumentasi/", wait_until="domcontentloaded", timeout=30000)
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
                results.append(await validate_suppression(browser))
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
