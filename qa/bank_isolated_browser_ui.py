"""Bank Sampah PC/HP admin and member UI acceptance against an ISOLATED local D1 clone.

The visited HTML/CSS/JS comes from the real GitHub Pages URL. ALL Cloudflare API
requests are intercepted and fulfilled with localhost:8787, never production.
No real credentials are used; role is simulated in the existing page functions.
"""
import json,urllib.parse,urllib.request,urllib.error
from playwright.sync_api import sync_playwright

LIVE_URL="https://flamboyan4.web.id/portal-live/bank-sampah/"
API_PREFIX="https://api.flamboyan4.web.id/"
LOCAL_URL="http://127.0.0.1:8787"

def test_ui(admin_token,member_id):
  reports=[]
  with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True,args=["--no-sandbox"])
    for device,viewport in [("PC",{"width":1440,"height":900}),("HP",{"width":390,"height":844})]:
      ctx=browser.new_context(viewport=viewport,is_mobile=device=="HP",has_touch=device=="HP",
        accept_downloads=True)
      page=ctx.new_page()
      errors=[]
      page.on("pageerror",lambda error:errors.append(str(error)[:150]))
      def proxy(route):
        req=route.request
        origin="https://flamboyan4.web.id"
        cors={"access-control-allow-origin":origin,"access-control-allow-credentials":"true",
          "access-control-allow-methods":"GET, POST, OPTIONS",
          "access-control-allow-headers":"Authorization, Content-Type","vary":"Origin"}
        if req.method=="OPTIONS":
          route.fulfill(status=204,headers=cors,body="")
          return
        original=urllib.parse.urlsplit(req.url)
        target=LOCAL_URL+original.path+("?" + original.query if original.query else "")
        body=req.post_data_buffer if req.method!="GET" else None
        headers={"Authorization":"Bearer "+admin_token,"Accept":"application/json",
          "Origin":origin}
        if body is not None:headers["Content-Type"]="application/json"
        ureq=urllib.request.Request(target,method=req.method,data=body,headers=headers)
        try:
          with urllib.request.urlopen(ureq,timeout=8) as response:
            code=response.status
            raw=response.read(2000000)
        except urllib.error.HTTPError as ex:
          code=ex.code;raw=ex.read(2000000)
        route.fulfill(status=code,body=raw,headers={**cors,"content-type":"application/json"})
      page.route("https://api.flamboyan4.web.id/**",proxy)
      r=page.goto(LIVE_URL,wait_until="domcontentloaded",timeout=30000)
      if not r or r.status!=200:raise AssertionError("Bank webpage does not load")
      page.wait_for_function("typeof showDashboard === 'function' && typeof goPage === 'function'",timeout=15000)
      page.evaluate("""() => {
        window.__f4TestPrints=0; window.print=()=>{window.__f4TestPrints++;};
        showDashboard({nama:'Admin uji lokal',peran:'Admin',rumah:'',wargaId:''});
        goPage('laporan');
      }""")
      try:
        page.wait_for_function("""() => document.querySelector('#pageLaporan:not(.hidden)') &&
          document.querySelector('#v10ReportTable table') !== null &&
          !!document.querySelector('#v10ReportSummary')?.innerText""",timeout=17000)
      except:
        report=page.evaluate("""() => ({
          note:document.querySelector('#v10ReportNotice')?.innerText.slice(0,120),
          text:document.querySelector('#v10ReportTable')?.innerText.slice(0,120)
        })""")
        raise AssertionError("Admin Bank report did not render: "+repr(report))
      before=page.evaluate("window.__f4TestPrints")
      page.evaluate("v10PrintReport()")
      if page.evaluate("window.__f4TestPrints")<=before:raise AssertionError("Admin print not invoked")
      admin=page.evaluate("""() => ({tables:document.querySelectorAll('#v10ReportTable table').length,
        summary:document.querySelector('#v10ReportSummary')?.innerText.length||0,
        printable:!!document.querySelector('#v10Print h1')})""")
      if not admin["tables"] or not admin["summary"] or not admin["printable"]:
        raise AssertionError("Admin report or printable incomplete")
      page.evaluate("""() => {
        showDashboard({nama:'Warga uji lokal',peran:'Warga',rumah:'A6/QA',wargaId:'test'});
        goPage('pribadi');
      }""")
      try:
        page.wait_for_function("""() => document.querySelector('#v12Private:not(.hidden)') &&
          (document.querySelector('#v12Balance')?.innerText||'').includes('Rp')""",timeout=17000)
      except:
        report=page.evaluate("""() => document.querySelector('#v12Gate')?.innerText.slice(0,150)""")
        raise AssertionError("Member Bank report did not render: "+repr(report))
      member=page.evaluate("""() => ({
        rows:document.querySelectorAll('#v12History tbody tr').length,
        statement:!!document.querySelector('#v12Private:not(.hidden)'),
        deposits:document.querySelectorAll('#v12Deposits details').length
      })""")
      if not member["rows"] or not member["statement"]:
        raise AssertionError("Member private statement not rendered")
      before=page.evaluate("window.__f4TestPrints")
      page.evaluate("v12Print()")
      if page.evaluate("window.__f4TestPrints")<=before:
        raise AssertionError("Member print button not invoked")
      with page.expect_download(timeout=9000) as info:
        page.evaluate("v12CSV()")
      filename=info.value.suggested_filename
      info.value.cancel()
      if not(filename.startswith("Tabungan_") and filename.endswith(".csv")):
        raise AssertionError("Member CSV download missing")
      await_state=page.evaluate("""() => ({overflow:Math.max(0,document.documentElement.scrollWidth-window.innerWidth),
        media:window.matchMedia('print').matches})""")
      if await_state["overflow"]>5:raise AssertionError("Horizontal UI overflow")
      if errors:raise AssertionError("Uncaught JS error: "+repr(errors[:2]))
      reports.append({"viewport":device,"admin_tables":admin["tables"],
        "admin_print":True,"member_history_rows":member["rows"],
        "member_csv":True,"member_print":True,"overflow_px":await_state["overflow"],
        "page_js_errors":len(errors),"network":"local cloned D1 via Playwright proxy"})
      page.close();ctx.close()
    browser.close()
  return reports
