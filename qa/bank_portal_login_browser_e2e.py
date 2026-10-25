"""End-to-end Bank Sampah actual login FORM through deployed portal HTML.

PC and HP drive real frontend login and Cloudflare Worker session flow.
ALL API traffic intercepted by local Wrangler and disposable D1 clone.
No production app API receives transactions, and no real user password is used.
"""
import urllib.parse,urllib.request,urllib.error
from playwright.sync_api import sync_playwright

WEB="https://flamboyan4.web.id/portal-live/#bank-sampah"
HOST="https://api.flamboyan4.web.id"
LOCAL="http://127.0.0.1:8787"
ORIGIN="https://flamboyan4.web.id"

def verify_portal_login(credentials):
    out=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
        for label,viewport in (("PC",{"width":1440,"height":900}),("HP",{"width":390,"height":844})):
            for scope in ("admin","member"):
                ctx=browser.new_context(viewport=viewport,is_mobile=label=="HP",
                    has_touch=label=="HP",accept_downloads=True)
                page=ctx.new_page()
                errors=[]
                page.on("pageerror",lambda e:errors.append(str(e)[:120]))
                def proxy(route):
                    req=route.request
                    headers_base={"access-control-allow-origin":ORIGIN,
                          "access-control-allow-credentials":"true",
                          "access-control-allow-methods":"GET, POST, OPTIONS",
                          "access-control-allow-headers":"Authorization, Content-Type"}
                    if req.method=="OPTIONS":
                        route.fulfill(status=204,headers=headers_base,body="")
                        return
                    url=urllib.parse.urlsplit(req.url)
                    assert url.hostname=="api.flamboyan4.web.id"
                    uri=LOCAL+url.path+("?" + url.query if url.query else "")
                    payload=req.post_data_buffer if req.method!="GET" else None
                    headers={"Accept":"application/json","Origin":ORIGIN}
                    if payload is not None:headers["Content-Type"]=req.headers.get("content-type","application/json")
                    cookies=req.all_headers().get("cookie")
                    if cookies:headers["Cookie"]=cookies
                    if req.headers.get("authorization"):headers["Authorization"]=req.headers["authorization"]
                    localreq=urllib.request.Request(uri,data=payload,headers=headers,method=req.method)
                    set_cookie=""
                    try:
                        with urllib.request.urlopen(localreq,timeout=12) as response:
                            status=response.status
                            body=response.read(2000000)
                            set_cookie=response.headers.get("Set-Cookie","")
                    except urllib.error.HTTPError as e:
                        status=e.code;body=e.read(2000000);set_cookie=e.headers.get("Set-Cookie","")
                    cors={**headers_base,"content-type":"application/json","cache-control":"no-store"}
                    if set_cookie:cors["set-cookie"]=set_cookie
                    route.fulfill(status=status,headers=cors,body=body)
                page.route(HOST+"/**",proxy)
                resp=page.goto(WEB,wait_until="domcontentloaded",timeout=35000)
                if not resp or resp.status!=200:raise AssertionError("Portal unavailable")
                page.locator("#login-button").click(timeout=15000)
                page.locator("#login-username").fill(credentials[scope]["username"])
                page.locator("#login-password").fill(credentials[scope]["password"])
                page.locator("#login-confirm").click()
                try:
                    page.wait_for_function("""() => {
                        const a=document.querySelector('#avatar-button');
                        return !!a && !a.hidden && document.querySelector('#login-shade')?.hidden;
                    }""",timeout=20000)
                except:
                    raise AssertionError("Portal login/session cookie exchange failed on "+label+"/"+scope)
                frame=page.frame_locator("#appframe")
                frame.locator("#dashboardView:not(.hidden)").wait_for(timeout=20000)
                if scope=="member":
                    # Signed-in member starts on Dashboard; open the actual
                    # "Tabungan saya" sidebar item to request private data.
                    frame.locator('#v16NavList [data-group="saving"]').evaluate("(el)=>el.click()")
                    frame.locator("#v12Private:not(.hidden)").wait_for(timeout=18000)
                    frame.locator("#v12Balance").wait_for(timeout=13000)
                else:
                    frame.locator('#v16NavList [data-group="money"]').wait_for(state="attached",timeout=16000)
                if scope=="admin" and label=="PC":
                    # The real Pembukuan form, authenticated through the real
                    # GitHub Pages shell. Every API request routes to LOCAL D1.
                    page.locator('[data-target="pembukuan"]').first.evaluate("(el)=>el.click()")
                    book=page.frame_locator("#appframe")
                    book.locator("#inp-warga option").first.wait_for(timeout=20000)
                    page.wait_for_function("""() => {
                        const doc=document.querySelector('#appframe')?.contentDocument;
                        return doc && doc.querySelectorAll('#inp-warga option').length>1;
                    }""",timeout=18000)
                    book.locator("#inp-warga").select_option(index=1)
                    book.locator("#inp-tanggal").fill("2026-10-25")
                    book.locator("#inp-bulan").select_option("11")
                    book.locator("#inp-tahun").fill("2026")
                    book.locator("#inp-jumlah").select_option("1")
                    book.locator("#inp-metode").select_option("Cash")
                    amount=book.locator("#inp-nominal-dibayar").input_value()
                    if not amount or int(amount)<=0:raise AssertionError("Pembukuan Iuran preview failed: "+repr(amount))
                    book.locator("#btn-simpan").click()
                    try:
                        page.wait_for_function("""() => {
                          const doc=document.querySelector('#appframe')?.contentDocument;
                          return (doc?.querySelector('#save-status')?.textContent||'').includes('Pembayaran berhasil disimpan');
                        }""",timeout=18000)
                    except:
                        message=page.evaluate("""() => document.querySelector('#appframe')?.contentDocument
                          ?.querySelector('#save-status')?.textContent||'(no status)'""")
                        raise AssertionError("Actual Pembukuan Iuran submit failed: "+message[:240])
                page.locator("#avatar-button").click()
                page.locator('[data-account-action="logout"]').click()
                page.wait_for_function("""() => {
                    const button=document.querySelector('#login-button');
                    return !!button && !button.hidden;
                }""",timeout=12000)
                if errors:raise AssertionError("Uncaught JS error in "+label+"/"+scope+": "+repr(errors[:2]))
                out.append({"viewport":label,"role":scope,"login_form":True,
                    "session_cookie":True,"member_area_or_admin_nav":True,
                    "logout":True,"production_api_requests":0})
                page.close();ctx.close()
        browser.close()
    return out
