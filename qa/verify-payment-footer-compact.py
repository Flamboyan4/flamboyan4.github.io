#!/usr/bin/env python3
"""Playwright: desktop inline accounts; mobile two-button footer and rekening bottom sheet.
Read-only: all pages/resources are served from repository files; production is never contacted.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / 'index.html').read_text()
css = (ROOT / 'portal-live/home-base.css').read_text()
sheet_css = (ROOT / 'portal-live/mobile-bottom-sheets.css').read_text()
sheet_js = (ROOT / 'portal-live/mobile-bottom-sheets.js').read_text()
copy_js = (ROOT / 'portal-live/payment-footer.js').read_text()
legacy = (ROOT / 'portal-live/home-legacy.js').read_text()
qris_file = ROOT / 'assets/qris-flamboyan4.jpg'
assert qris_file.is_file(), 'QRIS download file missing'
assert 'f4-payment-copyright' not in html, 'Old copyright must be removed'
assert '© 2026 Humas Flamboyan 4' not in html
footer_start = html.index('<footer id="pembayaran"')
footer_end = html.index('</footer>', footer_start) + len('</footer>')
modal_start = html.index('<div id="modal-rekening"')
modal_end = html.index('  <!-- Firebase App', modal_start)
fragment = html[footer_start:footer_end] + html[modal_start:modal_end]
assert fragment.count('class="f4-payment-desktop-account"') == 2, 'Desktop must show both bank accounts inline'
assert fragment.count('class="f4-account-item"') == 2
assert 'onclick="openModal(\'modal-rekening\')"' in fragment
assert "1330022606479" in fragment and "901493321399" in fragment
assert 'a.n. ROSALINDA' in fragment and 'a.n. HERI JUWANDI' in fragment
assert '/assets/qris-flamboyan4.jpg' in fragment
assert 'download="QRIS_Flamboyan4.jpg"' in fragment

# Reuse the actual modal stack functions (not a test mock): this includes
# browser Back, Escape, backdrop and focus/scroll management.
runtime_start = legacy.index('    let activeModalsStack = [];')
runtime_end = legacy.index('    function disableInspect(e)', runtime_start)
modal_runtime = legacy[runtime_start:runtime_end]
page_html = ('<!doctype html><html lang="id"><head><meta charset="utf-8">'
             '<meta name="viewport" content="width=device-width, initial-scale=1">'
             '<style>*{box-sizing:border-box}body{margin:0;font-family:system-ui}'
             + css + '\n' + sheet_css + '</style></head><body>'
             + fragment + '</body></html>')
BASE = 'https://flamboyan4.web.id/payment-footer-audit'

async def run():
    async with async_playwright() as tool:
        browser = await tool.chromium.launch(args=['--no-sandbox'])
        try:
            for width, height, mobile in [(1365,768,False),(800,768,False),
                                          (390,844,True),(360,780,True),(320,700,True)]:
                ctx = await browser.new_context(
                    viewport={'width':width, 'height':height},
                    permissions=['clipboard-read','clipboard-write'],
                    accept_downloads=True, has_touch=mobile)
                page = await ctx.new_page()
                async def local_page(route):
                    await route.fulfill(status=200, content_type='text/html', body=page_html)
                async def local_qris(route):
                    await route.fulfill(status=200, content_type='image/jpeg',
                                        body=qris_file.read_bytes(),
                                        headers={'Content-Disposition':'attachment; filename="QRIS_Flamboyan4.jpg"'})
                await page.route(BASE, local_page)
                await page.route('https://flamboyan4.web.id/assets/qris-flamboyan4.jpg',local_qris)
                await page.goto(BASE,wait_until='domcontentloaded')
                await page.add_script_tag(content=modal_runtime)
                await page.add_script_tag(content=copy_js)
                await page.add_script_tag(content=sheet_js)
                result = await page.evaluate("""() => {
                    const footer=document.querySelector('#pembayaran');
                    const qr=footer.querySelector('.f4-payment-qris');
                    const bank=footer.querySelector('.f4-payment-rekening');
                    const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height}};
                    const accounts=[...footer.querySelectorAll('.f4-payment-desktop-account')];
                    const visible=e=>e.getClientRects().length>0 && getComputedStyle(e).display!=='none';
                    return {footer:r(footer),qr:r(qr),bank:r(bank),accounts:accounts.map(r),
                       visibleCount:[...footer.querySelectorAll('a,button')].filter(visible).length,
                       bankVisible:visible(bank),accountVisible:accounts.map(visible),
                       isWhite:getComputedStyle(footer).backgroundColor,
                       qrBg:getComputedStyle(qr).backgroundColor,
                       bankBg:getComputedStyle(bank).backgroundColor,
                       overflow:document.documentElement.scrollWidth,viewport:innerWidth}
                }""")
                assert result['isWhite']=='rgb(255, 255, 255)',(width,'Footer background changed',result)
                assert result['qrBg']=='rgb(102, 85, 179)',(width,'Portal Utama primary action must be purple',result)
                assert result['bankBg']=='rgb(247, 245, 252)',(width,'Rekening secondary action must be muted lilac',result)
                assert result['overflow']<=width+1,(width,'Horizontal overflow',result)
                if mobile:
                    assert result['visibleCount']==2,(width,'Mobile must show only QRIS + Rekening',result)
                    assert result['bankVisible'] and not any(result['accountVisible']),(width,'Mobile accounts must be in sheet',result)
                    assert abs(result['qr']['height']-result['bank']['height'])<1,(width,'Unequal mobile buttons',result)
                    assert result['qr']['x']<result['bank']['x'],(width,'Mobile button order changed',result)
                else:
                    assert result['visibleCount']==3,(width,'Desktop must show QRIS and 2 copy actions',result)
                    assert not result['bankVisible'] and all(result['accountVisible']),(width,'Desktop must show inline banks without Rekening popup button',result)
                    assert result['qr']['x']<result['accounts'][0]['x']<result['accounts'][1]['x'],(width,'Desktop QRIS and bank order',result)
                assert result['footer']['height']<=72,(width,'Footer too tall',result)

                # Download must start directly, without opening a modal.
                async with page.expect_download(timeout=10000) as info:
                    await page.locator('.f4-payment-qris').click()
                file = await info.value
                assert file.suggested_filename=='QRIS_Flamboyan4.jpg',(width,file.suggested_filename)
                assert await page.locator('#modal-rekening').evaluate('(e)=>e.classList.contains("hidden")')

                if not mobile:
                    # Desktop must copy directly without opening a popup.
                    for number in ['1330022606479','901493321399']:
                        button=page.locator('.f4-payment-desktop-account [data-account-copy="'+number+'"]')
                        await button.click()
                        await page.wait_for_function(
                            "(n) => [...document.querySelectorAll('.f4-payment-desktop-copy')].some(b => b.getAttribute('data-account-copy')===n && b.dataset.copied==='true')",
                            arg=number)
                        copied=await page.evaluate('navigator.clipboard.readText()')
                        assert copied==number,(width,'Wrong desktop bank number',copied,number)
                    assert await page.locator('#modal-rekening').evaluate('(e)=>e.classList.contains("hidden")'), (width,'Desktop copy should not open sheet')
                    print(f"PAYMENT_FOOTER_LAYOUT_PASS width={width} footer={result['footer']['height']:.1f}px desktop=inline copies=ok download=ok")
                    await ctx.close()
                    continue

                await page.locator('.f4-payment-rekening').click()
                await page.locator('#modal-rekening:not(.hidden)').wait_for()
                dialog = page.locator('#modal-rekening .f4-account-dialog')
                assert await dialog.get_attribute('aria-modal')=='true'
                assert await dialog.get_attribute('aria-labelledby')=='f4-account-title'
                assert await page.locator('.f4-account-item').count()==2
                if mobile:
                    # Entrance animation briefly positions the sheet ~16px lower.
                    await page.wait_for_timeout(260)
                    geom=await dialog.bounding_box()
                    assert geom and abs((geom['y']+geom['height'])-height)<2,(width,'Not bottom aligned',geom)
                    await page.wait_for_function(
                        "document.querySelector('.f4-account-dialog').classList.contains('f4-sheet-draggable')",
                        timeout=3500)
                else:
                    geom=await dialog.bounding_box()
                    assert geom and geom['y']>50,(width,'Desktop dialog should be centered',geom)

                for number in ['1330022606479','901493321399']:
                    await page.locator('#modal-rekening [data-account-copy="'+number+'"]').click()
                    await page.wait_for_function(
                        "document.querySelector('#f4-account-copy-status').textContent.includes('berhasil')")
                    copied=await page.evaluate('navigator.clipboard.readText()')
                    assert copied==number,(width,'Wrong account number on clipboard',copied,number)
                assert await page.locator('#modal-rekening').evaluate('(e)=>!e.classList.contains("hidden")'),                    (width,'Copy should not close sheet')

                # Escape closes while keeping page available.
                await page.keyboard.press('Escape')
                await page.wait_for_function("document.querySelector('#modal-rekening').classList.contains('hidden')")
                await page.locator('.f4-payment-rekening').click()
                await page.locator('#modal-rekening:not(.hidden)').wait_for()

                # Backdrop click closes via the same global modal stack.
                await page.locator('#modal-rekening').click(position={'x':5,'y':5})
                await page.wait_for_function("document.querySelector('#modal-rekening').classList.contains('hidden')")
                await page.locator('.f4-payment-rekening').click()
                await page.locator('#modal-rekening:not(.hidden)').wait_for()

                # A real browser Back event must dismiss the modal, not leave the page.
                await page.evaluate('history.back()')
                await page.wait_for_function("document.querySelector('#modal-rekening').classList.contains('hidden')")
                if mobile:
                    await page.locator('.f4-payment-rekening').click()
                    await page.locator('#modal-rekening:not(.hidden)').wait_for()
                    await page.wait_for_function(
                        "() => {const g=document.querySelector('body>.f4-sheet-handle');"
                        "return g && !g.hidden && getComputedStyle(g).display!=='none'}")
                    # Swipe down on the shared grip to dismiss.
                    grip=await page.locator('body>.f4-sheet-handle').bounding_box()
                    assert grip,(width,'Shared sheet handle not shown')
                    x=grip['x']+grip['width']/2
                    y=grip['y']+grip['height']/2
                    await page.mouse.move(x,y)
                    await page.mouse.down()
                    await page.mouse.move(x,y+180,steps=10)
                    await page.mouse.up()
                    await page.wait_for_function(
                        "document.querySelector('#modal-rekening').classList.contains('hidden')",
                        timeout=4500)
                print(f"PAYMENT_FOOTER_LAYOUT_PASS width={width} footer={result['footer']['height']:.1f}px "
                      f"qris={result['qr']['height']:.1f}px sheet=ok copies=ok download=ok close=ok")
                await ctx.close()
        finally:
            await browser.close()

if __name__=='__main__':
    asyncio.run(run())
