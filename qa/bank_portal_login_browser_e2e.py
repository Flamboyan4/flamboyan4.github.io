"""End-to-end Bank Sampah actual login FORM through deployed portal HTML.

PC and HP drive real frontend login and Cloudflare Worker session flow.
ALL API traffic intercepted by local Wrangler and disposable D1 clone.
No production app API receives transactions, and no real user password is used.
"""
import urllib.parse,urllib.request,urllib.error
from playwright.sync_api import sync_playwright

WEB="https://flamboyan4.web.id/portal-live/?v=csp-submit-01489ea9#bank-sampah"
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
                errors=[];writes=[]
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
                    if req.method=="POST" and ("/api/bookkeeping/" in url.path or "/api/v2/admin/content/" in url.path or "/api/v2/admin/residents" in url.path):
                        writes.append({"path":url.path,"status":status,
                           "error":(body[:150].decode("utf8","ignore") if status>=400 else "")})
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
                    # Original Bank Sampah form (not a direct endpoint test).
                    page.evaluate("() => document.querySelector('#appframe').contentWindow.goPage('setoran')")
                    page.wait_for_function("""() => {
                      const d=document.querySelector('#appframe')?.contentDocument;
                      return (d?.querySelectorAll('#setWarga option').length||0)>1 &&
                        !!d?.querySelector('#setBarang input[data-kode]:not([disabled])');
                    }""",timeout=17000)
                    frame.locator("#setWarga").select_option(index=1)
                    frame.locator("#setDate").fill("2026-10-25")
                    frame.locator("#setBarang input[data-kode]:not([disabled])").first.fill("0.100")
                    frame.locator("#setNotes").fill("QA_UI_BANK_LOCAL_ONLY")
                    page.once("dialog",lambda dialog:dialog.accept())
                    frame.locator("#saveSetoranBtn").click()
                    try:
                        page.wait_for_function("""() => {
                          const d=document.querySelector('#appframe')?.contentDocument;
                          return (d?.querySelector('#setoranNotice')?.textContent||'').includes('berhasil disimpan');
                        }""",timeout=18000)
                    except:
                        message=page.evaluate("""() => document.querySelector('#appframe')?.contentDocument
                            ?.querySelector('#setoranNotice')?.textContent||'(no notice)'""")
                        raise AssertionError("Actual Bank Sampah setoran save failed: "+str({
                            "notice":message,"writes":writes[-6:],"js_errors":errors[-3:]})[:600])
                if scope=="admin" and label=="PC":
                    # The real Pembukuan form, authenticated through the real
                    # GitHub Pages shell. Every API request routes to LOCAL D1.
                    page.locator('[data-target="pembukuan"]').first.evaluate("(el)=>el.click()")
                    book=page.frame_locator("#appframe")
                    book.locator("#inp-warga option").first.wait_for(state="attached",timeout=20000)
                    page.wait_for_function("""() => {
                        const doc=document.querySelector('#appframe')?.contentDocument;
                        return doc && doc.querySelectorAll('#inp-warga option').length>1;
                    }""",timeout=18000)
                    book.locator("#inp-warga").select_option(index=1)
                    book.locator("#inp-tanggal").fill("2026-10-25")
                    book.locator("#inp-catatan").fill("QA_UI_IURAN_LOCAL_ONLY")
                    book.locator("#inp-bulan").select_option("11")
                    book.locator("#inp-tahun").fill("2026")
                    book.locator("#inp-jumlah").select_option("1")
                    book.locator("#inp-metode").select_option("Cash")
                    amount=book.locator("#inp-nominal-dibayar").input_value()
                    if not amount or int(amount)<=0:raise AssertionError("Pembukuan Iuran preview failed: "+repr(amount))
                    before=page.evaluate("""() => {let f=document.querySelector('#appframe')?.contentDocument;
                      let form=f?.querySelector('#form-iuran');
                      return {src:document.querySelector('#appframe')?.getAttribute('src'),
                       url:f?.URL,ready:!!form,valid:form?.checkValidity(),
                       invalid:[...(form?.elements||[])].filter(x=>!x.validity?.valid).map(x=>x.id),
                       due:f?.querySelector('#inp-nominal-dibayar')?.value,
                       buttonType:f?.querySelector('#btn-simpan')?.type,
                       buttonForm:f?.querySelector('#btn-simpan')?.form?.id,
                       formAction:form?.getAttribute('onsubmit'),
                       handler:typeof f?.defaultView?.simpanIuran,
                       csp:f?.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content}}
                    """)
                    book.locator("#btn-simpan").click()
                    try:
                        page.wait_for_function("""() => {
                          const doc=document.querySelector('#appframe')?.contentDocument;
                          return (doc?.querySelector('#save-status')?.textContent||'').includes('Pembayaran berhasil disimpan');
                        }""",timeout=18000)
                    except:
                        if not writes:
                            page.evaluate("""() => document.querySelector('#appframe')
                              ?.contentDocument?.querySelector('#form-iuran')?.requestSubmit()""")
                            page.wait_for_timeout(1800)
                        message=page.evaluate("""() => document.querySelector('#appframe')?.contentDocument
                          ?.querySelector('#save-status')?.textContent||'(no status)'""")
                        after=page.evaluate("""() => {const doc=document.querySelector('#appframe')?.contentDocument;
                          return {src:document.querySelector('#appframe')?.getAttribute('src'),
                            url:doc?.URL,form:!!doc?.querySelector('#form-iuran'),
                            status:doc?.querySelector('#save-status')?.textContent,
                            selected:doc?.querySelector('#inp-warga')?.value,
                            error:doc?.querySelector('#status-box')?.textContent}}
                        """)
                        raise AssertionError("Actual Pembukuan Iuran submit failed: "+str({
                            "before":before,"after":after,"writes":writes[-6:],"errors":errors[-3:]})[:950])
                if scope=="admin" and label=="PC":
                    # Existing Superadmin fourth portal: real Tambah Rumah button
                    # to local cloned D1, never live resident database.
                    page.locator('[data-target="superadmin"]').first.evaluate("(el)=>el.click()")
                    page.wait_for_function("""() => {
                      const f=document.querySelector('#appframe')?.contentWindow;
                      return typeof f?.openWarga==='function'
                         && !f.document.querySelector('#f4-superadmin-root')?.hidden;
                    }""",timeout=20000)
                    page.evaluate("() => document.querySelector('#appframe').contentWindow.openWarga()")
                    superframe=page.frame_locator("#appframe")
                    superframe.get_by_role("button",name="+ Tambah Rumah").click()
                    superframe.locator('form.f4-admin-editor [name="rumah"]').fill("QA/998")
                    superframe.locator('form.f4-admin-editor [name="nama_pemilik"]').fill("QA_LOCAL_ONLY")
                    superframe.locator('form.f4-admin-editor .f4-admin-primary').click()
                    try:
                        page.wait_for_function("""() => {
                          const doc=document.querySelector('#appframe')?.contentDocument;
                          return (doc?.querySelector('.sa-chip')?.textContent||'').includes('Data berhasil disimpan ke D1.');
                        }""",timeout=17000)
                    except:
                        message=page.evaluate("""() => document.querySelector('#appframe')?.contentDocument
                            ?.querySelector('form.f4-admin-editor .f4-admin-note')?.textContent||'(no notice)'""")
                        raise AssertionError("Actual Superadmin house form save failed: "+str({
                            "notice":message,"writes":writes[-6:],"js_errors":errors[-3:]})[:750])
                if scope=="admin" and label=="PC":
                    # Superadmin: click the original Tambah Rumah form, save,
                    # and verify it through the production UI against LOCAL D1.
                    page.locator('[data-target="superadmin"]').evaluate("(el)=>el.click()")
                    page.wait_for_function("""() => {
                       const f=document.querySelector('#appframe')?.contentDocument;
                       return typeof f?.defaultView?.openWarga==='function' &&
                         !!f?.querySelector('#f4-account-page');
                    }""",timeout=20000)
                    page.evaluate("() => document.querySelector('#appframe').contentWindow.openWarga()")
                    admin=page.frame_locator("#appframe")
                    admin.get_by_role("button",name="+ Tambah Rumah").click(timeout=12000)
                    admin.locator(".f4-admin-editor [name='rumah']").fill("QA/998")
                    admin.locator(".f4-admin-editor button.f4-admin-primary").click()
                    try:
                        page.wait_for_function("""() => {
                          const f=document.querySelector('#appframe')?.contentDocument;
                          return (f?.querySelector('.sa-chip')?.textContent||'')
                            .includes('Data berhasil disimpan ke D1.');
                        }""",timeout=20000)
                    except:
                        message=page.evaluate("""() => document.querySelector('#appframe')?.contentDocument
                          ?.querySelector('.f4-admin-note')?.textContent||'(no form notice)'""")
                        raise AssertionError("Actual Superadmin Tambah Rumah save failed: "+str({
                            "notice":message,"writes":writes[-6:],"errors":errors[-3:]})[:950])
                page.locator("#avatar-button").click()
                page.locator('[data-account-action="logout"]').click()
                page.wait_for_function("""() => {
                    const button=document.querySelector('#login-button');
                    return !!button && !button.hidden;
                }""",timeout=12000)
                if errors:raise AssertionError("Uncaught JS error in "+label+"/"+scope+": "+repr(errors[:2]))
                out.append({"viewport":label,"role":scope,"login_form":True,
                    "session_cookie":True,"member_area_or_admin_nav":True,
                    "logout":True,"production_api_requests":0,
                    "iuran_saved_through_ui":scope=="admin" and label=="PC",
                    "bank_setoran_saved_through_ui":scope=="admin" and label=="PC",
                    "superadmin_house_saved_through_ui":scope=="admin" and label=="PC"})
                page.close();ctx.close()
        browser.close()
    return out
