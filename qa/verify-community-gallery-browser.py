#!/usr/bin/env python3
"""Read-only browser regression of Galeri Warga and Portal Utama with mock API responses.
No production writes: all API and Google Drive requests are intercepted.
"""
import asyncio
import json
import os
import pathlib
import subprocess
import re
import base64
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
HOST = "http://127.0.0.1:8766"
FOLDER_ID = "1AbcDefGhijkLMnOPQrSTuvw"
FILE_ID = "1XyZAudItPhotoBcdEfGhIJKL"
FILE_ID_SECOND = "1XyZSecondPhotoBcdEfGhIJ"
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
    "popular": [PHOTO], "categories": [], "suppressedDriveIds": [], "uploadEnabled": False, "maxFiles": 12, "maxFileMb": 5
}
SOCIAL = {"ok": True, "likes": 2, "liked": False,
          "comments": [{"id": "c1", "author": "Warga A5", "message": "Terima kasih semuanya"}]}
MOCK_POSTS = []
TINY_PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEElEQVR4nGM44VYBRwzEcQB/EhhhaUt3dAAAAABJRU5ErkJggg==")

async def make_context(browser, width, height, suppressed=False, upload_enabled=False, no_new_photos=False, admin_sample=False):
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
        elif "/api/v2/gallery/tags?" in url:
            data = {"ok": True, "tags": [], "canEdit": True}
        elif "/api/v2/gallery/people" in url:
            data = {"ok": True, "members": [
                {"id": "member-audit-01", "name": "Pak Moyo", "house": "A6/08"},
                {"id": "member-audit-02", "name": "Pak Riadi", "house": "A5/02"}
            ]}
        elif "/api/v2/gallery/category?" in url:
            data = {"ok": True, "category": ""}
        elif "/api/v2/gallery/social?" in url:
            data = SOCIAL
        elif "/api/v2/gallery/drive-status" in url:
            data = {"ok": True, "connected": True, "writable": True, "detail": "Google Drive siap"}
        elif "/api/v2/gallery/admin" in url:
            if admin_sample:
                data = {"ok": True,
                        "photos": [{"id":"f4photo:audit","albumId":ALBUM_ID,
                                    "filename":"Foto Perbaikan Fasilitas.jpg",
                                    "url":"https://lh3.googleusercontent.com/d/"+FILE_ID,
                                    "uploader":"Warga A5","status":"baru"}],
                        "albums": [{"id":ALBUM_ID,"title":"Arisan Audit Browser","status":"aktif"}],
                        "comments": [], "reports": [{"type":"foto","targetId":"f4photo:audit","reason":"Uji laporan warga"}]}
            else:
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
        files = [{"id": FILE_ID, "name": "Foto Audit.jpg", "type": "image/jpeg",
                   "url": "https://drive.google.com/file/d/" + FILE_ID + "/view"}]
        if width < 721:  # HP test needs two media to validate a real swipe.
            files.append({"id": FILE_ID_SECOND, "name": "Foto Audit Kedua.jpg",
                          "type": "image/jpeg",
                          "url": "https://drive.google.com/file/d/" + FILE_ID_SECOND + "/view"})
        data = {"files": files}
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
        assert await page.locator(".f4g-hero-title").inner_text() == "Cerita Warga"
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
        assert await page.locator(".f4p-album-overlay .f4p-album-count svg").count() == 1, "Album counter must use SVG"
        assert await page.locator(".f4p-album-overlay .f4p-close svg").count() == 1, "Close icon not SVG"
        if name == "hp":
            sheet = await page.locator(".f4p-album-overlay .f4p-album-card").evaluate("""e=>({
              width:e.getBoundingClientRect().width,
              height:e.getBoundingClientRect().height,
              windowWidth:innerWidth,windowHeight:innerHeight
            })""")
            assert sheet["width"] >= sheet["windowWidth"]-3, "Album sheet is narrower than HP viewport"
            assert sheet["height"] < sheet["windowHeight"]*.80, "Small album leaves excessive empty white space"
        if name == "hp":
            # Pinching a thumbnail must zoom the PHOTO in the viewer, never the document.
            await page.evaluate("""() => {
                const tile=document.querySelector('.f4p-album-overlay .f4p-album-tile');
                const a=new Touch({identifier:1,target:tile,clientX:110,clientY:300});
                const b=new Touch({identifier:2,target:tile,clientX:210,clientY:300});
                tile.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,
                    touches:[a,b],targetTouches:[a,b],changedTouches:[a,b]}));
            }""")
            await page.wait_for_function("!!document.querySelector('.f4p-photo-overlay:not([hidden])')")
            assert await page.locator(".f4p-photo-zoom").get_attribute("aria-pressed") == "true", "Pinching album thumbnail did not zoom photo"
            await page.locator(".f4p-photo-zoom").click()  # Reset for standard viewer tests.
        else:
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
        nav_geometry = await page.locator(".f4p-photo-stage").evaluate("""e => {
          const stage=e.getBoundingClientRect(),content=e.querySelector('.f4p-photo-content').getBoundingClientRect();
          const prev=e.querySelector('.f4p-photo-arrow').getBoundingClientRect();
          return {stage:stage.width,content:content.width,stageLeft:stage.left,
                  buttonLeft:prev.left,buttonRight:prev.right,position:getComputedStyle(e.querySelector('.f4p-photo-arrow')).position};
        }""")
        assert nav_geometry["content"] >= nav_geometry["stage"]-3, "Arrows still steal media width"
        assert nav_geometry["position"] == "absolute", "Arrows must float over media"
        assert nav_geometry["buttonLeft"] >= nav_geometry["stageLeft"]-2, "Navigation arrow outside media area"
        if name == "hp":
            assert abs(viewer["width"]-viewer["clientWidth"]) <= 2, "Photo viewer is not mobile full viewport width"
            assert geometry["sideTop"] >= geometry["stageBottom"]-3, "Mobile details obscures the photo instead of sitting below"
            assert geometry["sideHeight"] < viewer["clientHeight"]*.30, "Mobile detail panel takes too much photo space"
        else:
            assert geometry["sideLeft"] >= geometry["stageRight"]-4, "PC comments must appear beside photo"
            assert geometry["sideWidth"] >= 280, "PC comment panel too narrow"
            assert abs(geometry["sideTop"]-geometry["headTop"]) <= 3, "PC comments must reach the top of the viewer"
            assert geometry["headRight"] <= geometry["sideLeft"]+4, "PC close button must remain over photo"
            # The send icon stays BESIDE the input while text wraps and grows upward.
            form = page.locator(".f4p-photo-overlay .f4g-photo-quick-form")
            initial = await form.evaluate("""e => {
                const text=e.querySelector('textarea').getBoundingClientRect();
                const send=e.querySelector('button[type=submit]').getBoundingClientRect();
                return {height:text.height,sideBySide:send.left>=text.right-2,aligned:Math.abs(send.bottom-text.bottom)<=2};
            }""")
            assert initial["sideBySide"] and initial["aligned"], "Send icon not beside the comment form"
            await form.locator("textarea").fill("Kegiatan warga Flamboyan 4 " * 20)
            expanded = await form.evaluate("""e => {
                const text=e.querySelector('textarea').getBoundingClientRect();
                const send=e.querySelector('button[type=submit]').getBoundingClientRect();
                return {height:text.height,sideBySide:send.left>=text.right-2,aligned:Math.abs(send.bottom-text.bottom)<=2};
            }""")
            assert expanded["height"]>initial["height"], "Long comment did not grow the input"
            assert expanded["sideBySide"] and expanded["aligned"], "Send icon moved below growing input"
            await form.locator("textarea").fill("")
        if name == "hp":
            await page.evaluate("""() => {
                const stage = document.querySelector('.f4p-photo-overlay .f4p-photo-stage');
                const start = new Touch({identifier:1,target:stage,clientX:300,clientY:325});
                const end = new Touch({identifier:1,target:stage,clientX:70,clientY:329});
                stage.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[start],targetTouches:[start],changedTouches:[start]}));
                stage.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],targetTouches:[],changedTouches:[end]}));
            }""")
            assert "2 /" in await page.locator(".f4p-photo-count").inner_text(), "Mobile swipe did not advance to next photo"
        zoom = page.locator(".f4p-photo-overlay .f4p-photo-zoom")
        assert await zoom.count() == 1 and await zoom.get_attribute("aria-pressed") == "false", "SVG photo zoom control missing"
        assert await page.locator(".f4p-photo-overlay .f4p-close svg").count() == 1, "Photo close button not SVG"
        assert await page.locator(".f4p-photo-overlay .f4p-close").evaluate("e=>getComputedStyle(e).borderRadius") == "0px", "Photo close icon still enclosed in a circle"
        await zoom.click()
        assert await zoom.get_attribute("aria-pressed") == "true", "Zoom did not enlarge image"
        assert await page.locator(".f4p-media-photo").evaluate("e=>e.style.transform.includes('scale(2.5)')"), "Photo itself was not scaled"
        if name == "hp":
            await page.evaluate("""() => {
                const img=document.querySelector('.f4p-media-photo');
                const a=new Touch({identifier:1,target:img,clientX:140,clientY:310});
                const b=new Touch({identifier:2,target:img,clientX:240,clientY:310});
                const c=new Touch({identifier:1,target:img,clientX:105,clientY:310});
                const d=new Touch({identifier:2,target:img,clientX:275,clientY:310});
                img.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[a,b],targetTouches:[a,b],changedTouches:[a,b]}));
                img.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[c,d],targetTouches:[c,d],changedTouches:[c,d]}));
                img.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],targetTouches:[],changedTouches:[c,d]}));
            }""")
            assert await zoom.get_attribute("aria-pressed") == "true", "Pinch should zoom image only"
            assert await page.locator(".f4p-media-photo").evaluate("e => parseFloat(e.style.transform.match(/scale\\(([^)]+)\\)/)[1])>2.5"), "Pinch did not enlarge photo further"
        await zoom.click()
        assert await zoom.get_attribute("aria-pressed") == "false", "Zoom did not reset"
        assert await page.locator(".f4p-media-photo").evaluate("e => e.style.transform.includes('scale(1)')"), "Photo remained enlarged after reset"
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
        await panel.get_by_text("Koneksi Drive aktif: folder Upload Warga dapat ditulis.").wait_for(timeout=12000)
        await panel.locator('input[type="file"]').set_input_files([
            {"name": "audit-a.png", "mimeType": "image/png", "buffer": TINY_PNG},
            {"name": "audit-b.png", "mimeType": "image/png", "buffer": TINY_PNG}
        ])
        assert await panel.locator(".f4g-previews figure").count() == 2, "Multi-file preview broken"
        await panel.locator("select").select_option(ALBUM_ID)
        await panel.get_by_role("button", name="Unggah 2 Foto").click()
        await panel.get_by_text("2 foto berhasil disimpan.", exact=False).wait_for(timeout=20000)
        assert await panel.get_by_role("button", name="Lihat di Galeri").count() == 1, "Gallery result action duplicated"
        assert await panel.get_by_role("button", name="Unggah 2 Foto").count() == 0, "Upload button remains after success"
        assert await panel.locator('input[type="file"]').is_disabled(), "Picker remains active after completed upload"
        upload_requests = [p for p in MOCK_POSTS if "/api/v2/gallery/upload?" in p["url"]]
        assert len(upload_requests) == 2, "Expected exactly two mocked upload requests"
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelectorAll('.f4g-overlay').length===0")
        assert page.url.endswith("/dokumentasi/"), "Upload close navigated away"
        return {"uploadMock": True, "multiSelect": 2, "uploadCalls": len(upload_requests)}
    finally:
        await context.close()

async def validate_native_video(browser):
    """Drive gallery clips must use Flamboyan player; inventory embeds remain unchanged."""
    context = await make_context(browser, 390, 844)
    page = await context.new_page()
    try:
        await context.route("https://media.qa.example/**", lambda route: route.fulfill(
            status=200, content_type="video/mp4", body=b""))
        await page.goto(HOST + "/dokumentasi/", wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_function("!!window.f4MediaGallery", timeout=15000)
        direct = await page.evaluate("""() => {
          window.f4MediaGallery.openMediaViewer("Video Audit",[
            {url:"https://media.qa.example/video.mp4",type:"video",caption:"Contoh video"}
          ]);
          const root=document.querySelector('.f4p-photo-overlay');
          const shell=root.querySelector('.f4p-video-shell'),video=shell?.querySelector('video');
          const ctrls=shell?.querySelector('.f4p-video-controls');
          return {video:!!video,controls:!!ctrls, nativeControls:video?.controls,
            progress:!!ctrls?.querySelector('input[type="range"]'),
            play:!!ctrls?.querySelector('button[aria-label="Putar video"]'),
            volume:!!ctrls?.querySelector('button[aria-label="Bisukan suara"]'),
            fullscreen:!!ctrls?.querySelector('button[aria-label="Layar penuh"]'),
            width:shell?.getBoundingClientRect().width,
            stage:root.querySelector('.f4p-photo-stage').getBoundingClientRect().width}
        }""")
        assert direct["video"] and direct["controls"] and not direct["nativeControls"], "Direct video player not customized"
        assert direct["progress"] and direct["play"] and direct["volume"] and direct["fullscreen"], "Video controls incomplete"
        assert direct["width"] >= direct["stage"]-3, "Video wrapper does not use full media width"
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelector('.f4p-photo-overlay')?.hidden")
        drive = await page.evaluate("""() => {
          window.f4MediaGallery.openMediaGallery("Video Drive",[
            {url:"https://drive.google.com/file/d/1AbcDefGhijkLMnOPQrSTuvw/preview",type:"video"}
          ], {albumId:"doc-audit-01"});
          document.querySelector('.f4p-album-tile').click();
          const root=document.querySelector('.f4p-photo-overlay');
          const media=root.querySelector('.f4p-media-video');
          return {embed:!!root.querySelector('.f4p-media-frame'),
                  custom:!!root.querySelector('.f4p-video-controls'),
                  native:media?.controls,
                  proxied:media?.src.startsWith("https://api.flamboyan4.web.id/api/v2/gallery/video/"),
                  directGoogle:media?.src.includes('drive.google.com'),
                  originalLink:!!root.querySelector('a.f4p-media-open'),
                  videoId:media?.src.split('/').pop()}
        }""")
        assert drive["custom"] and not drive["embed"] and not drive["native"], "Drive gallery video must use custom UI"
        assert drive["proxied"] and not drive["directGoogle"], "Drive gallery video must stream through protected Worker"
        assert not drive["originalLink"], "Original Google Drive link still visible"
        assert drive["videoId"] == "1AbcDefGhijkLMnOPQrSTuvw"
        await page.keyboard.press("Escape")
        await page.wait_for_function("document.querySelector('.f4p-photo-overlay')?.hidden")
        return {"directVideoControls":True,"arrowsOverlay":True,"driveGalleryProxied":True}
    finally:
        await context.close()

async def validate_home(browser):
    context = await make_context(browser, 1365, 850)
    page = await context.new_page()
    try:
        await page.goto(HOST + "/", wait_until="domcontentloaded", timeout=30000)
        await page.locator("#cerita-warga:not([hidden]) .f4g-home-card").wait_for(timeout=25000)
        latest_count = await page.locator("#f4g-home-grid .f4g-home-card").count()
        assert 1 <= latest_count <= 3, "Home must show up to three newest photos"
        assert await page.locator("#f4g-home-grid .f4g-home-comment").count() >= 2
        await page.locator("#f4g-home-popular").click()
        popular_count = await page.locator("#f4g-home-grid .f4g-home-card").count()
        assert 1 <= popular_count <= 3, "Home must show up to three popular photos"
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
        assert "album=" + ALBUM_ID in href and "foto=gdrive%3A" in href, "Legacy photo deep link invalid"
        await page.locator("#f4g-home-popular").click()
        assert await page.locator("#f4g-home-grid .f4g-home-card").count() == 1, "Popular tab hid older photos"
        return {"legacyHome": True, "legacyDeepLink": True, "newUploadCount": 0}
    finally:
        await context.close()

async def validate_closed_photo_does_not_reopen(browser):
    """A shared deep link opens once; closing it removes stale URL params on refresh."""
    context = await make_context(browser, 1365, 820)
    page = await context.new_page()
    try:
        link = HOST + "/dokumentasi/?album=" + ALBUM_ID + "&foto=gdrive%3A" + FILE_ID
        await page.goto(link, wait_until="domcontentloaded", timeout=30000)
        await page.locator(".f4p-photo-overlay:not([hidden])").wait_for(timeout=25000)
        await page.locator(".f4p-photo-overlay .f4p-close").click()
        await page.wait_for_function("""() =>
            document.querySelector('.f4p-photo-overlay')?.hidden &&
            !new URLSearchParams(location.search).has('foto')""", timeout=12000)
        assert "album=" + ALBUM_ID in page.url, "Photo close should preserve the album"
        await page.reload(wait_until="domcontentloaded")
        await page.locator(".f4p-album-overlay:not([hidden])").wait_for(timeout=25000)
        assert await page.locator(".f4p-photo-overlay:not([hidden])").count() == 0, "Closed photo reopened after refresh"
        await page.locator(".f4p-album-overlay .f4p-close").click()
        await page.wait_for_function("""() =>
            document.querySelector('.f4p-album-overlay')?.hidden &&
            !new URLSearchParams(location.search).has('album')""", timeout=12000)
        await page.reload(wait_until="domcontentloaded")
        # Gallery starts in Foto Terbaru view; album cards remain attached but hidden.
        await page.locator(".media-album-card", has_text="Arisan Audit Browser").wait_for(state="attached", timeout=25000)
        assert await page.locator(".f4p-album-overlay:not([hidden])").count() == 0, "Closed album reopened after refresh"
        assert await page.locator(".f4p-photo-overlay:not([hidden])").count() == 0
        return {"deepLink":True,"closePhotoRefresh":True,"closeAlbumRefresh":True}
    finally:
        await context.close()

async def validate_like_single_request(browser):
    """Three rapid clicks on one heart send one account-scoped toggle request."""
    context = await make_context(browser, 1365, 820)
    page = await context.new_page()
    try:
        await page.goto(HOST + "/dokumentasi/", wait_until="domcontentloaded", timeout=30000)
        await page.locator("[data-gallery-view=albums]").click()
        await page.locator(".media-album-card", has_text="Arisan Audit Browser").click()
        await page.locator(".f4p-album-overlay .f4p-album-tile").first.click()
        await page.locator(".f4p-photo-overlay .f4g-photo-actions button").first.wait_for(timeout=25000)
        before = sum("/api/v2/gallery/react" in x["url"] for x in MOCK_POSTS)
        locked = await page.evaluate("""() => {
            const button = document.querySelector('.f4p-photo-overlay .f4g-photo-actions button');
            button.click();button.click();button.click();
            return button.disabled;
        }""")
        assert locked, "Like button must lock immediately during the first request"
        await page.wait_for_function("""() => {
            const btn=document.querySelector('.f4p-photo-overlay .f4g-photo-actions button');
            return btn&&!btn.disabled&&btn.getAttribute('aria-pressed')==='true';
        }""", timeout=12000)
        after = sum("/api/v2/gallery/react" in x["url"] for x in MOCK_POSTS)
        assert after-before == 1, "Rapid repeated taps triggered duplicate like requests"
        return {"likeAccount":True,"rapidTaps":3,"requestCount":1}
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

async def validate_compact_gallery_mobile(browser):
    """Visual hierarchy and category filtering on HP; all data remains mocked."""
    ctx=await make_context(browser,390,844)
    page=await ctx.new_page()
    try:
        await page.goto(HOST+"/dokumentasi/",wait_until="domcontentloaded",timeout=30000)
        await page.locator("[data-gallery-view=albums]").wait_for(timeout=25000)
        assert (await page.locator(".portal-section-heading").inner_text()).strip()=="Galeri"
        assert await page.locator(".f4g-hero-copy").evaluate("e=>getComputedStyle(e).display")=="none"
        await page.locator("[data-gallery-view=albums]").click()
        assert await page.locator(".f4g-album-pane .panel-head").evaluate("e=>getComputedStyle(e).display")=="none"
        dropdown=page.get_by_role("button",name="Filter kategori album")
        await dropdown.wait_for()
        assert await dropdown.is_visible(),"Mobile custom filter missing"
        assert await page.locator("#media-category-filters select").count()==0,"Native Android select remains"
        assert await page.locator("#media-category-filters .btn").first.evaluate("e=>getComputedStyle(e).display")=="none","Old category buttons still visible"
        await dropdown.click()
        menu=page.get_by_role("listbox",name="Kategori album")
        assert await menu.is_visible(),"Custom category listbox did not open"
        await menu.get_by_role("option",name="Arisan").click()
        assert await page.locator(".f4g-category-current").inner_text()=="Arisan","Selected category not shown"
        assert await dropdown.get_attribute("aria-expanded")=="false","Menu did not close after selection"
        await dropdown.click()
        await page.keyboard.press("Escape")
        assert await dropdown.get_attribute("aria-expanded")=="false","Escape should close custom menu"
        assert await page.locator(".media-search").is_visible(),"Album search missing"
        sizes=await page.locator(".f4g-top-actions .f4g-btn").evaluate_all("""els=>els.map(el=>({
          width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,
          accessible:el.getAttribute('aria-label')}))""")
        assert all(32<=b["width"]<=44 and b["accessible"] for b in sizes),sizes
        positions=await page.evaluate("""() => {
          const search=document.querySelector('.f4g-album-tools .media-search').getBoundingClientRect();
          const filter=document.querySelector('.f4g-category-trigger').getBoundingClientRect();
          return {difference:Math.abs(search.top-filter.top),right:filter.right,window:innerWidth}
        }""")
        assert positions["difference"]<=5 and positions["right"]<=positions["window"]+1,positions
        return {"compactGalleryMobile":True,"oneCategoryDropdown":True,
                "titleDeduplicated":True,"searchSameRow":True,"actionsIconOnly":True}
    finally:
        await ctx.close()

async def validate_upload_compact_mobile(browser):
    """New upload sheet and custom album/category picker; mock requests only."""
    ctx=await make_context(browser,390,844,upload_enabled=True)
    page=await ctx.new_page()
    try:
        await page.goto(HOST+"/dokumentasi/",wait_until="domcontentloaded",timeout=30000)
        await page.get_by_role("button",name="Unggah Foto",exact=True).click()
        modal=page.locator(".f4g-upload-modal")
        await modal.wait_for(timeout=15000)
        assert await modal.get_by_text("Pilih Foto",exact=True).is_visible()
        assert await modal.locator(".f4g-upload-native-file").count()==1
        assert await modal.locator(".f4g-upload-native-file").evaluate("e=>getComputedStyle(e).opacity")=="0","Native file input must be visually hidden"
        assert await modal.locator(".f4g-upload-source-select").count()==2,"Album/category should use custom pickers"
        assert not await modal.locator(".f4g-upload-optional").evaluate("e=>e.open"),"Optional fields should start collapsed"
        album=modal.get_by_role("button",name="Pilih album")
        await album.click()
        assert await modal.get_by_role("listbox",name="Pilih album").is_visible()
        await modal.get_by_role("listbox",name="Pilih album").get_by_role("option",name="+ Buat album baru").click()
        assert await modal.get_by_placeholder("Contoh: Arisan November 2026").is_visible()
        assert await modal.locator(".f4g-upload-optional").evaluate("e=>e.open"),"New album should reveal extra settings"
        cat=modal.get_by_role("button",name="Kategori album")
        await cat.click()
        assert await modal.get_by_role("listbox",name="Kategori album").is_visible()
        await modal.get_by_role("listbox",name="Kategori album").get_by_role("option",name="Bank Sampah").click()
        assert await modal.locator(".f4g-upload-optional .f4g-upload-choice-value").inner_text()=="Bank Sampah"
        footer=modal.locator(".f4g-upload-footer")
        assert await footer.is_visible()
        bounds=await footer.evaluate("""e=>{
          const r=e.getBoundingClientRect(),m=e.closest('.f4g-panel').getBoundingClientRect();
          return {bottom:r.bottom,modalBottom:m.bottom,screenHeight:innerHeight}
        }""")
        assert bounds["bottom"]<=bounds["screenHeight"]+1 and abs(bounds["bottom"]-bounds["modalBottom"])<=3,bounds
        assert await modal.get_by_role("button",name="Unggah Foto").is_disabled(),"Cannot upload without selected photo"
        return {"compactUploadMobile":True,"nativeFileButtonHidden":True,
                "customAlbumCategory":True,"optionalCollapsed":True,"footerVisible":True}
    finally:
        await ctx.close()

async def validate_manage_documentation(browser):
    """Photo/album management UI check with mocked API only (no live mutations)."""
    results=[]
    for width, name in ((1365,"pc"),(390,"hp")):
        ctx=await make_context(browser,width,820,admin_sample=True)
        page=await ctx.new_page()
        try:
            await page.goto(HOST+"/dokumentasi/",wait_until="domcontentloaded",timeout=30000)
            await page.get_by_role("button",name="Kelola Unggahan",exact=True).click()
            dialog=page.locator(".f4g-manage-modal")
            await dialog.wait_for(timeout=15000)
            tabs=dialog.locator(".f4g-manage-tab")
            assert await tabs.count()==3,"Expected Foto, Album, Laporan tabs"
            assert await dialog.locator(".f4g-manage-section:not([hidden]) .f4g-manage-item").count()==1
            assert await dialog.locator(".f4g-manage-menu:not([hidden])").count()==0
            menu=dialog.locator(".f4g-manage-more").first
            await menu.click()
            assert await dialog.locator(".f4g-manage-menu:not([hidden])").count()==1
            assert await dialog.get_by_role("button",name="Pindah album").count()==1
            assert await dialog.get_by_role("button",name="Sembunyikan").count()==1
            assert await dialog.get_by_role("button",name="Hapus foto").count()==1
            await dialog.get_by_role("button",name="Pindah album").click()
            assert await dialog.get_by_role("combobox",name="Album tujuan").is_visible()
            # Opening an action is read-only; do not submit any destructive operation.
            await tabs.nth(1).click()
            assert await dialog.locator(".f4g-manage-section:not([hidden]) .f4g-manage-item").count()==1
            await dialog.locator(".f4g-manage-section:not([hidden]) .f4g-manage-more").click()
            assert await dialog.get_by_role("button",name="Ubah nama").is_visible()
            assert await dialog.get_by_role("button",name="Arsipkan album").is_visible()
            await tabs.nth(2).click()
            assert await dialog.locator(".f4g-manage-report").count()==1
            bounds=await dialog.evaluate("""e=>{
                const r=e.getBoundingClientRect();
                return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
                        screenWidth:innerWidth,screenHeight:innerHeight}
            }""")
            assert bounds["left"]>=-1 and bounds["right"]<=bounds["screenWidth"]+1,bounds
            assert bounds["top"]>=-1 and bounds["bottom"]<=bounds["screenHeight"]+1,bounds
            assert await page.evaluate("getComputedStyle(document.documentElement).scrollbarWidth")=="none"
            results.append({"device":name,"tabs":3,"contextActions":True,"noStackedButtons":True,
                            "withinViewport":True,"scrollbarHidden":True})
        finally:
            await ctx.close()
    return {"manageDocumentation":results}

async def validate_member_tags(browser):
    """UI save test in desktop and mobile; API writes are mocked, never touch D1."""
    reports = []
    for width, name in ((1365,"pc"),(390,"hp")):
        context=await make_context(browser,width,820)
        page=await context.new_page()
        try:
            await page.goto(HOST+"/dokumentasi/",wait_until="domcontentloaded",timeout=30000)
            await page.locator("[data-gallery-view=albums]").wait_for(timeout=25000)
            await page.locator("[data-gallery-view=albums]").click()
            await page.locator(".media-album-card",has_text="Arisan Audit Browser").click()
            trigger=page.locator(".f4p-album-overlay .f4-tag-trigger")
            await trigger.wait_for(timeout=15000)
            await trigger.click()
            pop=page.locator("body > .f4-tag-floating")
            await pop.wait_for(timeout=10000)
            geometry=await pop.evaluate("""el=>{
                const r=el.getBoundingClientRect();
                return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
                        width:innerWidth,height:innerHeight,bodyParent:el.parentElement===document.body}
            }""")
            assert geometry["bodyParent"] and geometry["left"]>=0 and geometry["right"]<=geometry["width"]+1,geometry
            assert geometry["top"]>=0 and geometry["bottom"]<=geometry["height"]+1,"Album tags clipped or outside viewport: "+str(geometry)
            edit=pop.get_by_role("button",name="Kelola Tag")
            editSize=await edit.evaluate("e=>({width:e.getBoundingClientRect().width,label:e.innerText.trim()})")
            assert editSize["width"]<=32 and not editSize["label"],"Edit control should be a compact icon: "+str(editSize)
            assert await page.evaluate("getComputedStyle(document.documentElement).scrollbarWidth")=="none","Shared scrollbar-free CSS missing"
            await edit.click()
            await page.locator(".f4-tag-list .f4-tag-row").first.wait_for()
            assert await page.locator(".f4-tag-row").count()==2,"Member selector did not load"
            await page.get_by_role("checkbox",name="Tag Pak Moyo").check()
            selectedGeometry=await page.locator(".f4-tag-selected-chip").first.evaluate("""e=>{
              const a=e.getBoundingClientRect(),b=e.parentElement.getBoundingClientRect();
              return {height:a.height,top:a.top,bottom:a.bottom,parentTop:b.top,parentBottom:b.bottom}
            }""")
            assert selectedGeometry["height"]>=27 and selectedGeometry["top"]>=selectedGeometry["parentTop"]-1 and selectedGeometry["bottom"]<=selectedGeometry["parentBottom"]+1,"Selected tag chip clipped: "+str(selectedGeometry)
            await page.get_by_role("button",name="Simpan Tag").click()
            await page.wait_for_timeout(200)
            posts=[p for p in MOCK_POSTS if "/api/v2/gallery/tags" in p["url"]]
            assert posts,"Album tag save did not call POST"
            body=json.loads(posts[-1]["body"])
            assert body["type"]=="album" and body["id"]==ALBUM_ID and body["memberIds"]==["member-audit-01"],body
            # Dismiss album and open an individual photo.
            await page.locator(".f4p-album-overlay .f4p-album-tile").first.click()
            photo_trigger=page.locator(".f4p-photo-stage > .f4-tag-trigger")
            await photo_trigger.wait_for(timeout=15000)
            assert await page.locator("body > .f4-tag-floating").count()==0,"Photo tags should start hidden"
            await photo_trigger.click()
            await page.locator("body > .f4-tag-floating").wait_for()
            await page.locator("body > .f4-tag-floating").get_by_role("button",name="Kelola Tag").click()
            await page.get_by_role("checkbox",name="Tag Pak Riadi").check()
            await page.get_by_role("button",name="Simpan Tag").click()
            photo_posts=[p for p in MOCK_POSTS if "/api/v2/gallery/tags" in p["url"] and json.loads(p["body"]).get("type")=="photo"]
            assert photo_posts,"Photo tag save did not call POST"
            photo_body=json.loads(photo_posts[-1]["body"])
            assert photo_body["memberIds"]==["member-audit-02"],photo_body
            reports.append({"device":name,"albumTagSavedMock":True,"photoTagSavedMock":True,"hiddenUntilTap":True})
        finally:
            await context.close()
    return {"memberTags":reports}

async def main():
    server = subprocess.Popen(["python3", "-m", "http.server", "8766", "--bind", "127.0.0.1"],
                              cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    results = []
    try:
        await asyncio.sleep(1)
        async with async_playwright() as p:
            browser = await p.chromium.launch(args=["--no-sandbox"])
            try:
                results.append(await validate_compact_gallery_mobile(browser))
                results.append(await validate_upload_compact_mobile(browser))
                results.append(await validate_member_tags(browser))
                results.append(await validate_manage_documentation(browser))
                if os.environ.get("F4_GALLERY_TAG_ONLY")!="1":
                    results.append(await validate_documentation(browser, "pc", 1365, 820))
                    results.append(await validate_documentation(browser, "hp", 390, 844))
                    results.append(await validate_native_video(browser))
                    results.append(await validate_home(browser))
                    results.append(await validate_legacy_home(browser))
                    results.append(await validate_closed_photo_does_not_reopen(browser))
                    results.append(await validate_like_single_request(browser))
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
