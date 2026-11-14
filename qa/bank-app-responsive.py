"""Admin Bank Sampah layout regression. Offline fixtures only; never writes live D1."""
import asyncio
from playwright.async_api import async_playwright

ROOT="http://127.0.0.1:8765"
HTML="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://127.0.0.1:8765/">
<link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
<style>*,*::before,*::after{box-sizing:border-box}.hidden{display:none}.section{padding:20px;max-width:100%;box-sizing:border-box}
@media(min-width:1024px){.section{margin-left:244px}}</style></head>
<body data-f4-bank-role="admin">
<div id="dashboardView"><div class="mobile-nav"><button id="v18PrivateMenuButton">☰</button></div>
<div class="section">
<div id="pageDashboard" class="v14-home">
<div class="v14-head"><h2 id="v14Title">Ringkasan</h2></div><div class="v14-hero">Program</div>
<div id="v14Primary"><div class="v14-kpi"><small class="v14-kpi-label">Hasil diterima lapak</small><strong>Rp 6.000</strong></div></div>
<div id="v14Extra"></div><div id="v14Status"></div>
<div class="v14-panels">
<section class="v14-panel"><div class="v14-panel-head"><h3>Setoran terbaru</h3></div>
<div id="v14Recent">Heri — 1 kg</div></section>
<section class="v14-panel"><div class="v14-panel-head"><h3>Perkembangan</h3></div><div id="v14Activities">Pembuatan drop point</div></section>
</div>
</div>
<div id="pageTabungan" class="hidden"><div class="f4-savings-utility"></div>
<section class="f4-savings-payout"><form id="v9Form"><input id="v9Member"><input id="v9Amount"></form></section>
<section class="f4-savings-history"><div id="v9History">Riwayat</div></section></div>
<div id="pageProfile" class="hidden"><div id="pName">Pengurus</div><div id="pHome">A5/41</div><div id="pId">W017</div></div>
</div></div>
<script>window.goPage=(name)=>{
document.querySelectorAll('#pageDashboard,#pageTabungan,#pageProfile').forEach(n=>n.classList.add('hidden'));
const target=document.getElementById('page'+name[0].toUpperCase()+name.slice(1));
if(target)target.classList.remove('hidden');
};</script>
</body></html>"""

# Keep the member dashboard layout and the new fresh eco palette under browser checks too.
MEMBER_HTML = """<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<base href="http://127.0.0.1:8765/">
<link rel="stylesheet" href="/portal-live/modern-portals.css">
<link rel="stylesheet" href="/portal-live/bank-member-polish.css">
<link rel="stylesheet" href="/portal-live/bank-eco-dashboard.css">
<link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
<link rel="stylesheet" href="/portal-live/bank-development-app.css">
<link rel="stylesheet" href="/portal-live/bank-member-navigation.css">
<style>body{margin:0;font-family:system-ui;background:#f7fafb}.grid{display:block}
.section{min-width:0;padding:20px}#pageDashboard{padding:0}
@media(max-width:1023px){.grid{display:block}.section{padding:14px}}</style></head>
<body class="f4-bank-app-private f4-bank-app-member" data-f4-bank-role="warga">
<div id="dashboardView"><div class="grid"><aside id="sideNav">Navigasi</aside><main class="section">
<section id="pageDashboard" class="card v14-home f4-member-dashboard">
<div id="f4BankAppHome" data-bank-role="member" class="f4-bank-app-home">
<div class="f4-bank-app-personal-greeting"><strong>Halo, Anggota!</strong><small>Rumah A5/41</small></div>
<button id="f4BankMemberCard" class="f4-bank-member-card"><span class="f4-bank-member-card-head"><span class="f4-bank-atm-brand"><img src="/assets/logo-flamboyan.svg"><span class="f4-bank-atm-brand-label">BANK SAMPAH FLAMBOYAN 4</span></span><span class="f4-bank-atm-contactless"><svg viewBox="0 0 32 32"><path d="M8 11a8 8 0 0 1 0 10M13 7a13 13 0 0 1 0 18M18 3a19 19 0 0 1 0 26"/></svg></span></span><span class="f4-bank-atm-center"><span class="f4-bank-member-card-chip"></span><strong id="f4BankCardNumber" class="f4-bank-atm-number">W017</strong></span><span class="f4-bank-member-card-foot"><span class="f4-bank-atm-person"><small>NAMA ANGGOTA</small><strong id="f4BankCardName" class="f4-bank-atm-person-name">Heri Juwandi</strong></span><span class="f4-bank-atm-house"><small>RUMAH</small><strong class="f4-bank-card-house">A5/41</strong></span></span></button>
<div id="f4BankAppMemberBalance" class="f4-bank-app-member-balance" role="group">
 <div class="f4-bank-balance-head"><span class="f4-bank-member-balance-label">Saldo Tersedia</span><button type="button" class="f4-bank-balance-eye" aria-label="Tampilkan saldo" aria-pressed="true"><svg viewBox="0 0 24 24"></svg></button></div>
 <strong class="f4-bank-member-balance-value">••••••</strong><button type="button" class="f4-bank-balance-cta">Cek Tabungan</button></div>
<section id="f4MemberQuickActions" class="f4-member-shortcuts" aria-label="Jadwal dan daftar harga">
 <section id="f4BankWeighingSchedule" class="f4-bank-weigh-schedule"><span class="f4-bank-weigh-icon"><img src="/assets/icons/calendar.svg"></span><span class="f4-bank-weigh-copy"><small>JADWAL BERIKUTNYA</small><strong>Minggu, 15 November 2026</strong><span>Setiap 2 minggu</span></span></section>
 <button id="f4MemberPriceShortcut" class="f4-bank-price-shortcut"><span class="f4-bank-price-shortcut-icon"><svg viewBox="0 0 24 24"><path d="M7 19l-3-3"/></svg></span><span class="f4-bank-price-shortcut-copy"><strong class="f4-bank-price-shortcut-label">Daftar Harga</strong><small>Tarif warga per kg</small></span></button>
</section>
<div id="f4MemberContent" class="f4-member-content">
 <section class="v14-panel"><div class="v14-panel-head"><h3>Mutasi Setoran</h3></div><div id="v14Recent">
 <div class="f4-member-recent"><span class="f4-member-recent-icon"><svg viewBox="0 0 24 24"><path d="M17 7 7 17M7 9v8h8"/></svg></span><div class="f4-member-recent-copy"><strong>Setoran Sampah</strong><small>27 Okt 2026 • 1 kg • Sah</small></div><div class="f4-member-recent-value"><b>+ Rp 2.250</b><small>Hasil jual</small></div></div>
 <div class="f4-member-recent"><span class="f4-member-recent-icon"><svg viewBox="0 0 24 24"><path d="M17 7 7 17M7 9v8h8"/></svg></span><div class="f4-member-recent-copy"><strong>Setoran Sampah</strong><small>18 Okt 2026 • 0,9 kg • Sah</small></div><div class="f4-member-recent-value"><b>+ Rp 750</b><small>Hasil jual</small></div></div>
 </div></section>
 <aside id="f4MemberAside" class="f4-member-aside">
  <details id="f4MemberFlow" class="f4-member-flow" open><summary class="f4-member-flow-head">
   <span class="f4-member-flow-icon"><img src="/assets/icons/bank.svg"></span><span class="f4-member-flow-copy"><strong>Cara setor sampah</strong><small>Pilah → Antar → Timbang → Saldo</small></span>
   <span class="f4-member-flow-toggle">Lihat alur</span></summary><div class="f4-member-flow-body">
   <ol class="f4-member-flow-steps">
   <li><span class="f4-member-flow-number">1</span><div><strong>Pilah di rumah</strong><p>Pisahkan sesuai jenis</p></div></li>
   <li><span class="f4-member-flow-number">2</span><div><strong>Antar ke gudang</strong><p>Datang saat ada petugas</p></div></li>
   <li><span class="f4-member-flow-number">3</span><div><strong>Timbang dan catat</strong><p>Petugas mencatat</p></div></li>
   <li><span class="f4-member-flow-number">4</span><div><strong>Saldo sah</strong><p>Setelah hasil jual disahkan</p></div></li>
   </ol></div></details>
 </aside>
</div>
<section id="f4MemberEnvironmentPreview">Perkembangan</section>
<section id="f4MemberInfoShortcut">Informasi</section>
<figure id="f4MemberHowtoBanner" class="f4-member-howto-banner"><img src="/assets/bank-sampah-alur-penimbangan-1600x500.png" width="1600" height="500" alt="Alur Bank Sampah"></figure>
</div></section></main></div></div></body></html>"""

# Savings/chart regression intentionally uses its original focused fixture. The full
# dashboard cascade is audited independently by member_layout().
MEMBER_SAVINGS_HTML = MEMBER_HTML.replace(
    '<link rel="stylesheet" href="/portal-live/modern-portals.css">\n', ''
).replace(
    '<link rel="stylesheet" href="/portal-live/bank-eco-dashboard.css">\n', ''
).replace(
    '<link rel="stylesheet" href="/portal-live/bank-development-app.css">\n', ''
).replace(
    '<link rel="stylesheet" href="/portal-live/bank-member-navigation.css">\n', ''
).replace('class="card v14-home f4-member-dashboard"', 'class="v14-home f4-member-dashboard"')

async def member_layout(browser):
    """Selected eco-fintech layout with no outer frame and true banking hierarchy."""
    # Also exercise the embedded-mode CSS that previously forced 64px above the first member card.
    from pathlib import Path
    live_html=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    clearance="body.f4-embedded-bank:not(.f4-bank-app-member) #dashboardView .section{padding-top:64px}"
    assert clearance in live_html, "Embedded CSS must exclude member accounts"
    for device,width in [("pc",1366),("tablet",820),("hp",390),("smallhp",360)]:
        page=await browser.new_page(viewport={"width":width,"height":850})
        await page.set_content(MEMBER_HTML,wait_until="load")
        if device=="pc":
            await page.evaluate("document.body.classList.add('f4-embedded-bank')")
            await page.add_style_tag(content=clearance)
        result=await page.evaluate("""() => {
          const rect=sel=>{const e=document.querySelector(sel),r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
          const card=document.querySelector('#f4BankMemberCard');
          const bal=document.querySelector('#f4BankAppMemberBalance');
          const rows=[...document.querySelectorAll('#v14Recent .f4-member-recent')];
          const root=document.querySelector('#pageDashboard');
          const priority=[];
          const walk=rules=>{for(const rule of rules){
            if(rule.cssRules){walk(rule.cssRules);continue;}
            if(!rule.selectorText||!rule.style)continue;
            if(![...rule.style].some(p=>rule.style.getPropertyPriority(p)==='important'))continue;
            try{if(root.matches(rule.selectorText)||root.querySelector(rule.selectorText))priority.push(rule.selectorText.slice(0,120));}catch(e){}
          }};
          for(const sheet of document.styleSheets){try{walk(sheet.cssRules)}catch(e){}}
          return {
            card:rect('#f4BankMemberCard'),balance:rect('#f4BankAppMemberBalance'),
            quick:rect('#f4MemberQuickActions'),
            schedule:rect('#f4BankWeighingSchedule'),price:rect('#f4MemberPriceShortcut'),
            recent:rect('#f4MemberContent>.v14-panel'),guide:rect('#f4MemberFlow'),
            progress:rect('#f4MemberEnvironmentPreview'),info:rect('#f4MemberInfoShortcut'),
            banner:rect('#f4MemberHowtoBanner'),
            outerBorder:getComputedStyle(root).borderTopWidth,
            sectionTopPadding:getComputedStyle(document.querySelector('#dashboardView>.grid>.section')).paddingTop,
            sectionBottomPadding:getComputedStyle(document.querySelector('#dashboardView>.grid>.section')).paddingBottom,
            parent:card.parentElement.id,cardBackground:getComputedStyle(card).backgroundImage,
            walletGradient:getComputedStyle(bal).backgroundImage,
            walletBackground:getComputedStyle(bal).backgroundColor,
            walletAmountColor:getComputedStyle(bal.querySelector('strong')).color,
            walletButton:bal.querySelector('.f4-bank-balance-cta')?.textContent,
            contactless:!!card.querySelector('.f4-bank-atm-contactless svg'),
            chipWidth:card.querySelector('.f4-bank-member-card-chip').getBoundingClientRect().width,
            memberNumber:document.querySelector('#f4BankCardNumber')?.textContent.trim(),
            memberName:document.querySelector('#f4BankCardName')?.textContent.trim(),
            memberHouse:card.querySelector('.f4-bank-card-house')?.textContent.trim(),
            scheduleTitle:document.querySelector('#f4BankWeighingSchedule strong')?.textContent.trim(),
            mutationRows:rows.map(e=>{const s=getComputedStyle(e);return {radius:s.borderRadius,left:s.borderLeftWidth,right:s.borderRightWidth,svg:!!e.querySelector('svg')}}),
            importantMatches:priority.slice(0,15),
            overflow:document.documentElement.scrollWidth>innerWidth+3,
            pageRight:rect('.section').right
          };
        }""")
        assert not result["overflow"] and result["pageRight"]<=width+3,(device,result)
        assert result["parent"]=="f4BankAppHome",(device,result)
        assert "linear-gradient(" in result["cardBackground"],(device,result)
        assert result["walletGradient"]=="none" and result["walletBackground"]=="rgb(255, 255, 255)",(device,result)
        assert result["walletAmountColor"]=="rgb(7, 70, 46)",(device,result)
        assert result["walletButton"]=="Cek Tabungan",(device,result)
        assert result["contactless"] and result["chipWidth"]>=35,(device,result)
        assert (result["memberNumber"],result["memberName"],result["memberHouse"])==("W017","Heri Juwandi","A5/41"),(device,result)
        assert result["scheduleTitle"]=="Minggu, 15 November 2026",(device,result)
        assert len(result["mutationRows"])==2 and all(x["svg"] and x["radius"]=="0px" and x["left"]=="0px" and x["right"]=="0px" for x in result["mutationRows"]),(device,result)
        assert not result["importantMatches"],(device,result["importantMatches"])
        assert result["outerBorder"]=="0px",(device,result)
        assert abs(result["schedule"]["y"]-result["price"]["y"])<3,(device,result)
        assert result["schedule"]["right"]<=result["price"]["x"]+3,(device,result)
        if width>=1024:
            assert abs(result["card"]["y"]-result["balance"]["y"])<3,(device,result)
            assert result["card"]["right"]<=result["balance"]["x"]+3,(device,result)
            assert result["quick"]["y"]>=result["card"]["bottom"]-3,(device,result)
            assert result["progress"]["y"]>=result["quick"]["bottom"]-3,(device,result)
            assert abs(result["progress"]["y"]-result["recent"]["y"])<3,(device,result)
            assert result["progress"]["right"]<=result["recent"]["x"]+3,(device,result)
            assert result["guide"]["y"]>=result["progress"]["bottom"]-3,(device,result)
            assert abs(result["guide"]["y"]-result["info"]["y"])<3,(device,result)
            assert result["guide"]["right"]<=result["info"]["x"]+3,(device,result)
            assert result["guide"]["h"]<225 and result["info"]["h"]<225,(device,result)
            assert float(result["sectionTopPadding"].replace("px",""))<=12,(device,result)
            assert result["banner"]["y"]>=result["info"]["bottom"]-3,(device,result)
            assert abs(result["banner"]["w"]/result["banner"]["h"]-3.2)<0.05,(device,result)
        else:
            assert result["balance"]["y"]>=result["card"]["bottom"]-3,(device,result)
            assert result["quick"]["y"]>=result["balance"]["bottom"]-3,(device,result)
            assert abs(result["quick"]["y"]-result["info"]["y"])<3,(device,result)
            assert result["progress"]["y"]>=result["quick"]["bottom"]-3,(device,result)
            assert result["recent"]["y"]>=result["progress"]["bottom"]-3,(device,result)
            assert result["guide"]["y"]>=result["recent"]["bottom"]-3,(device,result)
            assert result["banner"]["y"]>=result["guide"]["bottom"]-3,(device,result)
            assert float(result["sectionBottomPadding"].replace("px",""))<=12,(device,result)
            assert abs(result["banner"]["w"]/result["banner"]["h"]-3.2)<0.05,(device,result)
        print("MEMBER_PREMIUM_BANKING_LAYOUT_OK",device,result,flush=True)
        await page.close()

async def member_balance_refresh_preserves_design(browser):
    """Exercise production saldo updates twice; preserve font classes and CTA button."""
    from pathlib import Path
    js=Path("portal-live/bank-mobile-app.js").read_text(encoding="utf-8")
    start=js.index("function updateDashboard(){")
    end=js.index("function updateAdminOverview(",start)
    fn=js[start:end]
    assert "button.replaceChildren" not in fn
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":850})
        await page.set_content(MEMBER_HTML,wait_until="load")
        result=await page.evaluate("""({fn})=>{
          const card=document.querySelector('#f4BankAppMemberBalance');
          const statement={saldo:3000},privacy={hidden:true};
          const update=new Function('role','memberStatement','$','rupiah','dashboardMetrics','memberBalancePrivacy',
              fn+'return updateDashboard;')(
             'member',statement,id=>document.getElementById(id),
             n=>'Rp '+new Intl.NumberFormat('id-ID').format(n),
             ()=>new Map(),privacy);
          const cta=card.querySelector('.f4-bank-balance-cta');
          update();
          const first=card.querySelector('.f4-bank-member-balance-value')?.textContent;
          statement.saldo=15000;update();
          const amount=card.querySelector('.f4-bank-member-balance-value');
          const updated=amount?.textContent;
          const eye=card.querySelector('.f4-bank-balance-eye');
          privacy.hidden=false;update();
          const revealed=amount?.textContent;
          privacy.hidden=true;update();
          const hidden=amount?.textContent;
          const hiddenPressed=eye?.getAttribute('aria-pressed');
          const hiddenLabel=eye?.getAttribute('aria-label');
          statement.saldo=25000;update();
          const remainsHidden=amount?.textContent;
          privacy.hidden=false;update();
          const shownAgain=amount?.textContent;
          const label=card.querySelector('.f4-bank-member-balance-label');
          const after=card.querySelector('.f4-bank-balance-cta');
          const a=amount.getBoundingClientRect(),b=after.getBoundingClientRect(),
              cardBox=card.getBoundingClientRect();
          return {first,updated,revealed,hidden,hiddenPressed,hiddenLabel,remainsHidden,shownAgain,
           eyeTag:eye?.tagName,ctaTag:after?.tagName,eyePressed:eye?.getAttribute('aria-pressed'),
           label:label?.textContent,
           cta:after?.textContent,retained:cta===after,childCount:card.children.length,
           amountFont:parseFloat(getComputedStyle(amount).fontSize),
           ctaFont:parseFloat(getComputedStyle(after).fontSize),
           amountColor:getComputedStyle(amount).color,
           ctaGradient:getComputedStyle(after).backgroundImage,
           ctaRatio:b.width/cardBox.width,overflow:document.documentElement.scrollWidth>innerWidth+3};
        }""",{"fn":fn})
        assert result["first"]=="••••••" and result["updated"]=="••••••" and result["revealed"]=="Rp 15.000",(device,result)
        assert result["label"]=="Saldo Tersedia" and result["cta"]=="Cek Tabungan",(device,result)
        assert result["hidden"]=="••••••" and result["remainsHidden"]=="••••••",(device,result)
        assert result["hiddenPressed"]=="true" and result["hiddenLabel"]=="Tampilkan saldo",(device,result)
        assert result["shownAgain"]=="Rp 25.000" and result["eyePressed"]=="false",(device,result)
        assert result["eyeTag"]=="BUTTON" and result["ctaTag"]=="BUTTON",(device,result)
        assert result["retained"] and result["childCount"]==3,(device,result)
        assert result["amountFont"]>=(28 if width<1024 else 30) and result["ctaFont"]>=12,(device,result)
        assert result["amountColor"]=="rgb(7, 70, 46)" and "linear-gradient(" in result["ctaGradient"],(device,result)
        assert result["ctaRatio"]>.70 and not result["overflow"],(device,result)
        print("BALANCE_UPDATE_PRESERVES_DESIGN_OK",device,result,flush=True)
        await page.close()

async def member_mutation_ledger(browser):
    """Check production member ledger rendering using synthetic data only."""
    from pathlib import Path
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    a=source.index("const recent=(Array.isArray(d.mutasi)?d.mutasi:[])")
    b=source.index("       $('v14Status').textContent='';",a)
    snippet=source[a:b]
    data={"mutasi":[
      {"tanggal":"2026-11-10","jenis":"pencairan","debit":10000,"kredit":0},
      {"tanggal":"2026-10-27","jenis":"kredit","kredit":2250,"debit":0},
      {"tanggal":"2026-10-18","jenis":"kredit","kredit":750,"debit":0},
      {"tanggal":"2026-10-10","jenis":"koreksi_kredit","kredit":500,"debit":0}],
      "setoran":[{"tanggal":"2026-11-14","status":"Estimasi","estimasiRp":90000}]}
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":850})
        await page.set_content(MEMBER_HTML,wait_until="load")
        result=await page.evaluate("""({snippet,data})=>{
          new Function('d','$','rupiah','f4MemberDateID',snippet)(
            data,id=>document.getElementById(id),
            n=>'Rp '+new Intl.NumberFormat('id-ID').format(n),
            x=>x);
          const rows=[...document.querySelectorAll('#v14Recent .f4-member-recent')];
          return {names:rows.map(r=>r.querySelector('strong')?.textContent),
            amounts:rows.map(r=>r.querySelector('.f4-member-recent-value b')?.textContent),
            withdrawal:rows[0]?.classList.contains('is-debit'),
            svgs:rows.every(r=>!!r.querySelector('svg')),
            unboxed:rows.every(r=>getComputedStyle(r).borderRadius==='0px'),
            overflow:document.documentElement.scrollWidth>innerWidth+3};
        }""",{"snippet":snippet,"data":data})
        assert result["names"]==["Pencairan Tabungan","Hasil Penjualan Sampah","Hasil Penjualan Sampah"],(device,result)
        assert result["amounts"]==["− Rp 10.000","+ Rp 2.250","+ Rp 750"],(device,result)
        assert result["withdrawal"] and result["svgs"] and result["unboxed"] and not result["overflow"],(device,result)
        print("MEMBER_MUTATION_LEDGER_OK",device,result,flush=True)
        await page.close()

async def savings_chart(browser):
    """Ensure monthly bars are aggregated, period bars show weighings, and scroll is available."""
    page=await browser.new_page(viewport={"width":390,"height":850})
    await page.set_content(MEMBER_SAVINGS_HTML,wait_until="load")
    await page.evaluate("""() => {
      document.querySelector('#sideNav').innerHTML='<div id="v16NavList">'+
        ['home','saving','withdrawal','statement','memberreport','progress','public'].map(g=>
         '<button class="v16-item" data-group="'+g+'">'+g+'</button>').join('')+'</div>';
      const main=document.querySelector('.section');
      const wallet=document.createElement('section');
      wallet.id='pagePribadi';wallet.className='card';
      wallet.innerHTML='<h2>Tabungan saya</h2><div id="v12Private"></div>';
      main.append(wallet);
      const profile=document.createElement('div');
      profile.id='pageProfile';profile.innerHTML='<span id="pName">Heri</span><span id="pHome">A5/41</span><span id="pId">W017</span>';
      main.append(profile);
      window.goPage=()=>{};
    }""")
    await page.add_script_tag(url=ROOT+"/portal-live/bank-mobile-app.js")
    await page.evaluate("""() => {
      const setoran=[
       {id:'a',tanggal:'2026-10-18',status:'Terkonfirmasi',beratKg:0.9,nilaiSahRp:750},
       {id:'b',tanggal:'2026-10-27',status:'Terkonfirmasi',beratKg:1,nilaiSahRp:2250},
       {id:'c',tanggal:'2026-11-02',status:'Terkonfirmasi',beratKg:2,nilaiSahRp:3000},
       {id:'d',tanggal:'2026-11-10',status:'Estimasi',beratKg:1.5,estimasiRp:700}
      ];
      window.dispatchEvent(new CustomEvent('f4-bank-member-statement',{detail:{
       wargaId:'W017',saldo:6000,totalMasuk:6000,totalCair:0,mutasi:[],setoran
      }}));
    }""")
    await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").first.wait_for()
    # The original design has a small raised yellow badge, a white Rp wordmark,
    # and a caption aligned with the other tabs (only the badge protrudes).
    money_icon=await page.evaluate("""() => {
      const nav=document.querySelector('#f4BankAppDock');
      const center=nav?.querySelector('.f4-bank-app-dock-action:nth-child(3)');
      const icon=center?.querySelector('.f4-bank-app-action-icon');
      const svg=icon?.querySelector('svg.f4-bank-payout-rp-icon');
      const word=svg?.querySelector('text');
      const label=center?.querySelector('.f4-bank-app-action-name');
      const first=nav?.querySelector('.f4-bank-app-dock-action:first-child .f4-bank-app-action-name');
      const tile=icon?getComputedStyle(icon):null;
      return {
        route:center?.dataset.bankAppRoute,label:label?.textContent,
        accessibleLabel:center?.getAttribute('aria-label'),
        buttonCenterX:center?.getBoundingClientRect().x+(center?.getBoundingClientRect().width||0)/2,
        iconCenterX:icon?.getBoundingClientRect().x+(icon?.getBoundingClientRect().width||0)/2,
        primary:center?.classList.contains('is-primary'),
        svg:!!svg,word:word?.textContent||null,
        wordFill:word?getComputedStyle(word).fill:null,
        iconBackground:tile?.backgroundColor,
        iconTop:icon?.getBoundingClientRect().top,
        iconBottom:icon?.getBoundingClientRect().bottom,
        navTop:nav?.getBoundingClientRect().top,
        labelTop:label?.getBoundingClientRect().top,
        firstLabelTop:first?.getBoundingClientRect().top,
        iconWidth:icon?.getBoundingClientRect().width,
        iconHeight:icon?.getBoundingClientRect().height,
        iconRadius:tile?.borderRadius,iconBorder:tile?.borderTopWidth,
        iconBorderColor:tile?.borderTopColor,
        overflow:document.documentElement.scrollWidth>window.innerWidth+3
      };
    }""")
    assert money_icon["route"]=="bank-payout" and money_icon["accessibleLabel"]=="Pencairan" and money_icon["label"] is None,money_icon
    assert money_icon["primary"] and money_icon["svg"] and money_icon["word"]=="Rp",money_icon
    assert money_icon["wordFill"]=="rgb(255, 255, 255)" and money_icon["iconBackground"]=="rgb(255, 199, 25)",money_icon
    assert money_icon["iconTop"]<money_icon["navTop"] and money_icon["iconBottom"]>money_icon["navTop"],money_icon
    assert abs(money_icon["buttonCenterX"]-money_icon["iconCenterX"])<2,money_icon
    assert 58<=money_icon["iconWidth"]<=68 and 58<=money_icon["iconHeight"]<=68,money_icon
    assert money_icon["iconRadius"]=="50%" and money_icon["iconBorder"]=="3px" and money_icon["iconBorderColor"]=="rgb(255, 255, 255)",money_icon
    assert not money_icon["overflow"],money_icon
    print("MEMBER_PAYOUT_ORIGINAL_RP_DOCK_OK",money_icon,flush=True)
    state=await page.evaluate("""() => {
      const root=document.querySelector('#f4BankSavingsBars');
      return {
       groups:[...document.querySelectorAll('.f4-bank-chart-groups button')].map(x=>x.textContent),
       select:!!document.querySelector('#f4BankChartPeriod'),
       month:[...root.querySelectorAll('.f4-bank-savings-bar')].map(x=>({
        label:x.querySelector('small').textContent,value:x.querySelector('strong').textContent
       })),
       visibleNav:[...document.querySelectorAll('#v16NavList .v16-item')].filter(x=>getComputedStyle(x).display!=='none').map(x=>x.dataset.group)
      };
    }""")
    assert state["groups"]==["Periode","30 hari","Per bulan"],state
    assert not state["select"],state
    assert [x["value"] for x in state["month"]]==["0,9 kg","1 kg","2 kg","1,5 kg"],state
    assert state["visibleNav"]==["progress","public"],state
    assert await page.locator('.f4-bank-chart-groups button[data-group="period"]').get_attribute("aria-pressed")=="true"
    await page.locator('.f4-bank-chart-groups button[data-group="month"]').click()
    monthly_kg=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.querySelector('strong').textContent)")
    assert monthly_kg==["1,9 kg","3,5 kg"],monthly_kg
    await page.locator('.f4-bank-chart-groups button[data-group="period"]').click()
    period=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.querySelector('small').textContent)")
    assert period==["18/10","27/10","02/11","10/11"],period
    await page.locator('.f4-bank-chart-switch button[data-mode="rp"]').click()
    money=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.querySelector('strong').textContent)")
    assert money==["750","2,3 rb","3 rb","700"],money
    exact=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.getAttribute('aria-label'))")
    assert "Rp 2.250" in exact[1] and "Rp 3.000" in exact[2],exact
    await page.locator('.f4-bank-chart-groups button[data-group="month"]').click()
    monthly_money=await page.locator("#f4BankSavingsBars .f4-bank-savings-bar").evaluate_all(
      "(nodes)=>nodes.map(x=>x.querySelector('strong').textContent)")
    assert monthly_money==["3 rb","3,7 rb"],monthly_money
    print("SAVINGS_CHART_OK",state,period,money,monthly_money,flush=True)
    await page.close()

async def admin_mobile_shell(browser):
    """No manager hamburger or slide drawer; the scrollable page stays beneath the fixed dock."""
    from pathlib import Path
    import re
    page=await browser.new_page(viewport={"width":390,"height":820},device_scale_factor=1)
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    inline=re.search(r"<style>(.*?)</style>",source,re.S|re.I)
    assert inline,"Source Bank Sampah styles are required"
    html="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/portal-live/direct-shell.css">
    <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
    </head><body class="f4-direct-bank f4-bank-app-private f4-bank-app-admin v17-dashboard">
    <div id="f4-direct-bar"><button id="f4-mobile-menu">Menu</button>Pengelola</div>
    <div id="dashboardView"><div class="mobile-nav">Legacy</div>
    <div class="grid"><aside id="sideNav" class="side">
      <div id="v16Navigation"><div id="v16NavList">
      <button class="v16-item" data-group="home">Beranda</button>
      <button class="v16-item" data-group="deposit">Setoran</button>
      <button class="v16-item" data-group="sale">Penjualan</button>
      <button class="v16-item" data-group="finance">Keuangan</button>
      <button class="v16-item" data-group="management">Pengelolaan</button>
      <button class="v16-item" data-group="report">Laporan</button>
      </div></div></aside>
      <main class="section" style="min-height:2400px">Halaman panjang</main>
    </div></div>
    <nav id="f4BankAppDock" class="f4-bank-app-dock" hidden></nav>
    </body></html>"""
    await page.goto(ROOT,wait_until="domcontentloaded")
    await page.set_content(html,wait_until="load")
    await page.add_style_tag(content=inline.group(1))
    await page.evaluate("window.scrollTo(0,750)")
    await page.wait_for_timeout(80)
    before=await page.evaluate("""() => {
      const side=document.querySelector("#sideNav"),header=document.querySelector("#f4-direct-bar");
      const hamburger=document.querySelector("#f4-mobile-menu");
      return {scroll:scrollY,headerTop:header.getBoundingClientRect().top,
        headerPosition:getComputedStyle(header).position,
        drawer:getComputedStyle(side).display,
        hamburger:getComputedStyle(hamburger).display,
        dock:getComputedStyle(document.querySelector("#f4BankAppDock")).display,
        padding:getComputedStyle(document.querySelector("#dashboardView")).paddingBottom,
        overflow:document.documentElement.scrollWidth>innerWidth+3
      };
    }""")
    assert before["scroll"]>500,before
    assert before["headerPosition"]=="fixed" and abs(before["headerTop"])<1,before
    assert before["dock"]=="none" and float(before["padding"].replace("px",""))>=72,before
    assert before["drawer"]=="none" and before["hamburger"]=="none",before
    assert not before["overflow"],before
    await page.evaluate('document.querySelector("#sideNav").classList.add("open")')
    assert await page.evaluate('getComputedStyle(document.querySelector("#sideNav")).display')=="none"
    print("ADMIN_NO_HAMBURGER_DRAWER_OK",before,flush=True)
    await page.close()


async def bank_real_mobile_dock_bidirectional_scroll(browser):
    """Compare admin and member navigation on a Chromium mobile visual viewport.

    Load the same CSS owners and the actual legacy root rule from index.html.
    Check bottom alignment after scrolling down, back up, and changing viewport height.
    """
    from pathlib import Path
    import re
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    root_rule=re.search(r"html,body,body>\.shell,body>\.shell>\.content\{[^{}]+\}",source)
    assert root_rule and "overflow-x:clip" in root_rule.group(0),root_rule
    for role in ("admin","member"):
        context=await browser.new_context(
            viewport={"width":390,"height":844},device_scale_factor=2,
            is_mobile=True,has_touch=True
        )
        page=await context.new_page()
        await page.goto(ROOT,wait_until="domcontentloaded")
        fixture=f"""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="/portal-live/direct-shell.css">
        <link rel="stylesheet" href="/portal-live/modern-portals.css">
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
        <link rel="stylesheet" href="/portal-live/bank-member-navigation.css">
        <style>@media(max-width:720px){{{root_rule.group(0)}}}</style></head>
        <body class="f4-direct-bank f4-bank-app-private f4-bank-app-{role} v17-dashboard">
          <div id="f4-direct-bar">Bank Sampah</div>
          <div class="shell"><div class="content"><div id="dashboardView">
            <div class="grid"><main class="section">
              <div style="height:3900px">Konten panjang</div>
            </main></div>
          </div></div></div>
          <nav id="f4BankAppDock" class="f4-bank-app-dock" aria-label="Menu bawah">
            <button class="f4-bank-app-dock-action" type="button">Beranda</button>
            <button class="f4-bank-app-dock-action" type="button">Setoran</button>
            <button class="f4-bank-app-dock-action is-primary" type="button">Utama</button>
            <button class="f4-bank-app-dock-action" type="button">Riwayat</button>
            <button class="f4-bank-app-dock-action" type="button">Laporan</button>
          </nav></body></html>"""
        await page.set_content(fixture,wait_until="load")
        snapshots=[]
        for height,scroll in [(844,0),(844,700),(844,1800),(844,500),
                              (844,1350),(844,0),(750,900),(750,300),(844,1000)]:
            await page.set_viewport_size({"width":390,"height":height})
            await page.evaluate("(y)=>window.scrollTo(0,y)",scroll)
            await page.wait_for_timeout(80)
            value=await page.evaluate("""() => {
              const nav=document.querySelector('#f4BankAppDock'),r=nav.getBoundingClientRect();
              const html=getComputedStyle(document.documentElement),body=getComputedStyle(document.body);
              return {scroll:scrollY,viewport:innerHeight,
                fixed:getComputedStyle(nav).position,top:r.top,bottom:r.bottom,
                transform:getComputedStyle(nav).transform,
                overflowHTML:html.overflowX,overflowBody:body.overflowX,
                scrollRoot:document.scrollingElement.tagName,
                overflows:document.documentElement.scrollWidth>innerWidth+3};
            }""")
            assert value["fixed"]=="fixed",(role,height,scroll,value)
            assert value["scrollRoot"]=="HTML",(role,height,scroll,value)
            assert value["overflowHTML"]=="clip",(role,height,scroll,value)
            assert value["overflowBody"]=="clip",(role,height,scroll,value)
            assert not value["overflows"],(role,height,scroll,value)
            assert abs(value["bottom"]-value["viewport"])<=1,(role,height,scroll,value)
            assert abs(value["scroll"]-scroll)<2,(role,height,scroll,value)
            snapshots.append({"at":scroll,"height":height,"bottom":value["bottom"]})
        print("BANK_NATIVE_MOBILE_DOCK_STABLE_UP_DOWN_OK",role,snapshots,flush=True)
        await context.close()


async def public_chart_and_flat_roster(browser):
    """Actual Bank Sampah styles: 33 saldo rows follow page scroll; public chart switches units."""
    import re
    from pathlib import Path
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    # The former standalone roster styles were consolidated into the admin report style owner.
    roster_css=re.search(r'<style id="f4-bank-admin-report-compact-20261027">(.*?)</style>',source,re.S)
    if not roster_css or 'CSS owner consolidated from #f4-bank-savings-compact-20261028' not in roster_css.group(1):
        raise AssertionError("Consolidated roster stylesheet unavailable")
    rows="".join(
        '<div class="f4-saldo-row" role="listitem"><div class="f4-saldo-person">'
        f'<strong class="f4-saldo-name">Warga {i}</strong><small class="f4-saldo-house">A5/{i}</small>'
        f'</div><strong class="f4-saldo-amount">Rp {i*1000:,}</strong></div>'
        for i in range(1,34))
    for label,width in [("hp",390),("pc",1366)]:
        page=await browser.new_page(viewport={"width":width,"height":820})
        markup=f"""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
        <base href="http://127.0.0.1:8765/">
        <link rel="stylesheet" href="/portal-live/modern-portals.css">
        <style>body{{margin:0;font-family:system-ui}} #dashboardView{{max-width:100%;padding:12px}}
        #pageTabungan{{padding:10px}} .f4-savings-main{{display:block}}</style>
        <style>{roster_css.group(1)}</style></head>
        <body class="f4-direct-bank f4-bank-app-private f4-bank-app-admin">
        <div id="dashboardView"><section id="pageTabungan">
        <div class="f4-savings-main"><section class="f4-savings-roster f4-savings-members">
        <div class="f4-savings-panel-title"><h3>Saldo anggota</h3></div>
        <div class="f4-bs-saldo-finder"><input placeholder="Cari anggota"></div>
        <div id="v9List"><div class="f4-saldo-list" role="list">{rows}</div></div>
        </section></div></section></div></body></html>"""
        await page.set_content(markup,wait_until="load")
        values=await page.evaluate("""() => {
          const area=document.querySelector("#v9List"),frame=document.querySelector(".f4-savings-roster");
          const last=document.querySelector(".f4-saldo-row:last-child");
          return {count:document.querySelectorAll(".f4-saldo-row").length,
            overflow:getComputedStyle(area).overflowY,maxHeight:getComputedStyle(area).maxHeight,
            paneBorder:getComputedStyle(frame).borderTopWidth,areaBorder:getComputedStyle(area).borderTopWidth,
            scrollHeight:document.documentElement.scrollHeight,viewport:innerHeight,
            lastBottom:last.getBoundingClientRect().bottom,overflowX:document.documentElement.scrollWidth>innerWidth+2};
        }""")
        assert values["count"]==33,(label,values)
        assert values["overflow"]=="visible" and values["maxHeight"]=="none",(label,values)
        assert values["paneBorder"]=="0px" and values["areaBorder"]=="0px",(label,values)
        assert values["scrollHeight"]>values["viewport"]+300 and not values["overflowX"],(label,values)
        await page.evaluate("window.scrollTo(0,document.documentElement.scrollHeight)")
        assert await page.evaluate("scrollY>300"),(label,values)
        print("FLAT_MANAGER_ROSTER_OK",label,values,flush=True)
        await page.close()

    def between(start,end):
        begin=source.index(start);finish=source.index(end,begin)
        return source[begin:finish]
    # Verify the current public graph: weight only until authenticated.
    # The public Rp toggle and detailed date modes stay hidden.
    chart_js=between("  let v17PublicChartMode='berat',v17PublicChartRange='bulan';","  async function v17LoadPublic(){")
    page=await browser.new_page(viewport={"width":390,"height":820})
    await page.set_content("""<!doctype html><html><body><section id="v17Perkembangan">
    <button data-dev-range="bulan" aria-pressed="true">Per bulan</button>
    <button data-dev-range="30" hidden>30 hari</button>
    <button data-dev-mode="berat" aria-pressed="true">Kg</button>
    <button data-dev-mode="nilai" hidden>Rp</button>
    <div id="f4DevStats"></div><small id="f4DevChartPeriod"></small>
    <div id="f4DevChartSummary"></div><div id="f4DevChart"></div>
    <div id="f4DevLegend"></div><p id="f4DevChartNote"></p></section></body></html>""")
    helpers="""const $=id=>document.getElementById(id);
    const kg=n=>Number(n).toLocaleString('id-ID')+' kg';
    const rupiah=n=>'Rp '+Number(n).toLocaleString('id-ID');
    const v17Label=value=>String(value||'').slice(5)||'—';"""
    await page.add_script_tag(content=helpers+chart_js+"""
    v17PublicChartRows=[
      {periode:'2026-09',beratKg:1.2,pendingWeightKg:0.3,hasilPenjualan:1500},
      {periode:'2026-10',beratKg:1.9,pendingWeightKg:0,hasilPenjualan:4500}
    ];
    v17PublicReportReady=false;v17BindPublicChart();v17RenderPublicChart();""")
    weight=await page.evaluate("""() => ({
      bars:document.querySelectorAll("#f4DevChart .f4-dev-column").length,
      summary:document.querySelector("#f4DevChartSummary").textContent,
      legend:document.querySelector("#f4DevLegend").textContent,
      firstBar:document.querySelector("#f4DevChart .f4-dev-column-bar")?.title,
      privacy:document.querySelector('[data-dev-mode="nilai"]').hidden,
      privateDate:document.querySelector('[data-dev-range="30"]').hidden,
      chartText:document.querySelector("#f4DevChart").textContent
    })""")
    assert weight["bars"]==2 and "3,1 kg" in weight["summary"],weight
    assert "Berat sah" in weight["legend"] and "kg" in weight["firstBar"],weight
    assert weight["privacy"] and weight["privateDate"] and "Rp" not in weight["chartText"],weight
    print("PUBLIC_WEIGHT_CHART_PRIVACY_OK",weight,flush=True)
    await page.close()


async def public_report_compact(browser):
    """PC cards have a width ceiling; mobile cards remain two columns without overflow."""
    import re
    from pathlib import Path
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    core=re.search(r'<style>(.*?)</style>',source,re.S)
    if not core: raise AssertionError("Canonical report style missing")
    rows=[
      ("Berat sah","1,9 kg"),("Belum sah","0 kg"),
      ("Penjualan","Rp 6.000"),("Hak warga","Rp 3.000"),
      ("Dana lingkungan","Rp 3.000"),("Perkiraan","Rp 0")
    ]
    cards="".join('<div class="v17-public-metric"><small>'+label+'</small><strong>'+val+'</strong></div>' for label,val in rows)
    for width in (1366,1024,768,390,320):
        page=await browser.new_page(viewport={"width":width,"height":820},device_scale_factor=1)
        markup="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
        <base href="http://127.0.0.1:8765/">
        <style>"""+core.group(1)+"""</style>
        <link rel="stylesheet" href="/portal-live/modern-portals.css">
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
        </head><body><section id="v11Public" style="width:calc(100% - 22px);margin:0 11px">
        <div id="v25ReportRoot"><div id="v25ReportMetrics" class="v25-public-metrics v26-compact">"""+cards+"""</div></div></section></body></html>"""
        await page.goto(ROOT,wait_until="domcontentloaded")
        await page.set_content(markup,wait_until="load")
        metrics=await page.evaluate("""() => {
          const grid=document.querySelector("#v25ReportMetrics");
          const items=[...grid.querySelectorAll(".v17-public-metric")];
          return {
            heights:items.map(n=>Math.round(n.getBoundingClientRect().height)),
            widths:items.map(n=>Math.round(n.getBoundingClientRect().width)),
            positions:items.map(n=>Math.round(n.getBoundingClientRect().top)),
            valueFonts:items.map(n=>parseFloat(getComputedStyle(n.querySelector("strong")).fontSize)),
            padding:getComputedStyle(items[0]).padding,
            columns:getComputedStyle(grid).gridTemplateColumns.split(" ").length,
            overflow:document.documentElement.scrollWidth>innerWidth+3
          };
        }""")
        assert len(metrics["heights"])==6,metrics
        # The current compact report cards intentionally use 49px rows / 15px values.
        assert max(metrics["heights"])<=80 and min(metrics["heights"])>=45,metrics
        assert all(13.5<=font<=19 for font in metrics["valueFonts"]),metrics
        if width<=640:
            assert metrics["columns"]==(2 if width<=360 else 3),metrics
            assert all(70<=w<=190 for w in metrics["widths"]),metrics
        else:
            assert metrics["columns"]>=3,metrics
            assert max(metrics["widths"])<=190,metrics
        assert not metrics["overflow"],metrics
        print("PUBLIC_REPORT_COMPACT_OK",width,metrics,flush=True)
        await page.close()


async def member_profile_inline_name(browser):
    """The member edits only their display alias directly beside the existing name."""
    from pathlib import Path
    source=Path('portal-live/bank-mobile-app.js').read_text(encoding='utf-8')
    start=source.index('function inlineMemberDisplayName(){')
    end=source.index('function updateProfileCard(){',start)
    script=source[start:end]
    icon_start=source.index("function bankUiSvg(name){")
    icon_end=source.index("function bankIconSpan(",icon_start)
    assert icon_start>=0 and icon_end>icon_start,"Canonical SVG helper is required"
    icon_helper=source[icon_start:icon_end]
    sync_start=source.index("function memberID(){")
    sync_end=source.index("/* Nama tampilan diedit",sync_start)
    card_sync=source[sync_start:sync_end]
    page=await browser.new_page(viewport={"width":390,"height":820})
    markup="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <base href="http://127.0.0.1:8765/">
    <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
    </head><body><div id="dashboardView"><section id="pageProfile">
    <div class="f4-profile-identity"><small>Nama anggota</small><strong id="pName">Heri Awal</strong></div>
    </section><span id="greeting"></span><span id="welcomeName"></span>
    <span id="pId">W017</span><span id="pHome">A5/41</span>
    <span id="f4BankProfileName">Heri Awal</span><span id="f4BankProfileNumber"></span><span id="f4BankProfileHouse"></span>
    <span id="v15AccountName"></span><div id="f4BankAppHome"><div class="f4-bank-app-personal-greeting"><strong>Halo, Heri Awal!</strong></div><span id="f4BankCardName">Heri Awal</span><span id="f4BankCardNumber"></span><span class="f4-bank-card-house"></span></div>
    </div></body></html>"""
    await page.goto(ROOT,wait_until='domcontentloaded')
    await page.set_content(markup,wait_until='load')
    helpers="""const role="member";const $=id=>document.getElementById(id);
    const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
    const roleType=()=>role;
    const text=(id,value)=>{const e=$(id);if(e)e.textContent=String(value);};
    const memberStatement=null;
    window.__saved=[];
    const api=async(path,payload)=>{
      window.__saved.push({path,payload});
      return {ok:true,profile:{nama:payload.nama}};
    };
    window.__updatedName=null;
    window.addEventListener('f4-account-profile-updated',e=>{window.__updatedName=e.detail.nama});"""
    await page.add_script_tag(content=helpers+icon_helper+card_sync+script+"inlineMemberDisplayName();inlineMemberDisplayName();")
    assert await page.locator(".f4-member-name-save svg, .f4-member-name-cancel svg").count()==2
    assert await page.locator('.f4-member-name-edit').count()==1
    assert await page.locator('.f4-member-name-row').count()==1
    await page.locator('.f4-member-name-edit').click()
    input=page.locator('.f4-member-name-input')
    assert await input.is_visible()
    await input.fill('Heri Tampilan')
    await input.press('Enter')
    await page.wait_for_function("document.getElementById('pName').textContent==='Heri Tampilan'")
    values=await page.evaluate("""() => ({
      name:document.getElementById('pName').textContent,
      account:document.getElementById('v15AccountName').textContent,
      greeting:document.getElementById('greeting').textContent,
      alias:window.__updatedName,
      cardName:document.getElementById('f4BankCardName').textContent,
      profileCardName:document.getElementById('f4BankProfileName').textContent,
      saved:window.__saved,
      inputHidden:document.querySelector('.f4-member-name-input').hidden,
      overflow:document.documentElement.scrollWidth>innerWidth+3
    })""")
    assert values['name']==values['account']==values['alias']==values['cardName']==values['profileCardName']=='Heri Tampilan',values
    assert values['greeting']=='Halo, Heri Tampilan' and values['inputHidden'],values
    assert values['saved']==[{"path":"/api/member/profile","payload":{"nama":"Heri Tampilan"}}],values
    assert not values['overflow'],values
    await page.locator('.f4-member-name-edit').click()
    await input.fill('Nama Batal')
    await input.press('Escape')
    assert await page.locator('#pName').inner_text()=='Heri Tampilan'
    assert len(await page.evaluate('window.__saved'))==1
    print("MEMBER_INLINE_ALIAS_OK",values,flush=True)
    await page.close()


async def member_profile_dropdown_chevrons(browser):
    """Foto profil/password accordion must render identical right-side chevrons on HP/PC."""
    from pathlib import Path
    import re
    source=Path("bank-sampah/index.html").read_text(encoding="utf-8")
    main_style=re.search(r'<style>(.*?)</style>',source,re.S)
    if not main_style: raise AssertionError("Base Bank Sampah CSS missing")
    for size in (390,768,1366):
        page=await browser.new_page(viewport={"width":size,"height":820})
        markup="""<!doctype html><html lang="id"><head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <base href="http://127.0.0.1:8765/">
        <style>"""+main_style.group(1)+"""</style>
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css"></head>
        <body class="f4-direct-bank"><main id="dashboardView">
        <section id="pageProfile" class="card f4-profile-card" style="max-width:750px">
          <details id="v15PhotoPanel" class="f4-profile-edit">
            <summary>Ubah foto profil</summary><p>Form foto</p>
          </details>
          <details id="v15PasswordBox">
            <summary>Ganti password</summary><form><input type="password"></form>
          </details>
        </section></main></body></html>"""
        await page.goto(ROOT,wait_until="domcontentloaded")
        await page.set_content(markup,wait_until="load")
        def probe():
            return """() => {
              const ids=['v15PhotoPanel','v15PasswordBox'];
              return ids.map(id=>{
                const section=document.getElementById(id),summary=section.querySelector('summary');
                const block=summary.getBoundingClientRect(),after=getComputedStyle(summary,'::after');
                const own=getComputedStyle(summary),marker=getComputedStyle(summary,'::marker');
                return {id,open:section.open,display:own.display,listStyle:own.listStyleType,
                  paddingRight:own.paddingRight,paddingLeft:own.paddingLeft,
                  afterContent:after.content,afterRight:after.right,afterTransform:after.transform,
                  markerContent:marker.content,summaryRight:block.right,
                  text:summary.textContent.trim()};
              });
            }"""
        closed=await page.evaluate(probe())
        assert all(x["display"]=="block" and x["listStyle"]=="none" for x in closed),(size,closed)
        assert all(x["afterContent"] not in ("none","normal") for x in closed),(size,closed)
        assert all(x["afterRight"]=="16px" for x in closed),(size,closed)
        assert all(x["paddingRight"]==closed[0]["paddingRight"] and
                   x["paddingLeft"]==closed[0]["paddingLeft"] for x in closed),(size,closed)
        assert all(x["markerContent"] in ('""',"none") for x in closed),(size,closed)
        assert closed[0]["afterTransform"]==closed[1]["afterTransform"],(size,closed)
        assert closed[0]["text"]=="Ubah foto profil" and closed[1]["text"]=="Ganti password",(size,closed)
        await page.locator("#v15PhotoPanel summary").click()
        await page.locator("#v15PasswordBox summary").click()
        # CSS transitions start at slightly different times; inspect the settled final state.
        await page.wait_for_timeout(230)
        opened=await page.evaluate(probe())
        assert all(x["open"] for x in opened),(size,opened)
        assert opened[0]["afterTransform"]==opened[1]["afterTransform"],(size,opened)
        assert opened[0]["afterTransform"]!=closed[0]["afterTransform"],(size,closed,opened)
        await page.locator("#v15PasswordBox summary").focus()
        await page.keyboard.press("Enter")
        assert not await page.locator("#v15PasswordBox").evaluate("(node)=>node.open"),size
        overflow=await page.evaluate("document.documentElement.scrollWidth>innerWidth+3")
        assert not overflow,(size,closed,opened)
        print("MEMBER_PROFILE_ACCORDION_PARITY_OK",size,closed,opened,flush=True)
        await page.close()



async def note_print_is_visible(browser):
    """Three-stage sale: note printing must be discoverable and reprint idempotent.

    Browser fixture intercepts every note API request. It never writes to D1.
    """
    import json
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":820})
        await page.goto(ROOT,wait_until="domcontentloaded")
        fixture="""<!doctype html><html><head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
        <style>body{margin:0;font-family:system-ui}
        #dashboardView{max-width:980px;margin:auto;padding:16px}
        #pagePenjualan{background:#fff}</style></head>
        <body class="f4-bank-app-private f4-bank-app-admin">
        <div id="dashboardView"><main class="section"><section id="pagePenjualan">
        <h2>Penjualan</h2>
        <form id="saleForm"><div class="f4-entry-top-fields f4-sale-top-fields">
        <div class="field"><label for="saleBatch">Nomor penjualan</label>
        <select id="saleBatch"><option value="">Pilih kelompok</option>
        <option value="batch-qa">Batch contoh</option></select></div>
        <div class="field"><label for="saleDate">Tanggal</label><input id="saleDate" type="date"></div>
        </div><div id="saleItems"></div></form></section></main></div></body></html>"""
        await page.set_content(fixture,wait_until="load")
        prepared={"yes":False,"post":0,"get":0}
        async def mock_note(route):
            req=route.request
            headers={
                "access-control-allow-origin":ROOT,
                "access-control-allow-credentials":"true",
                "access-control-allow-methods":"GET,POST,OPTIONS",
                "access-control-allow-headers":"Content-Type",
                "content-type":"application/json"}
            if req.method=="OPTIONS":
                await route.fulfill(status=204,headers=headers,body="")
                return
            if req.method=="POST":
                payload=json.loads(req.post_data or "{}")
                assert payload.get("batchId")=="batch-qa" and payload.get("action")=="prepare"
                prepared["post"]+=1
                prepared["yes"]=True
            else:
                prepared["get"]+=1
            data={"ok":True,"batchId":"batch-qa","saleNumber":"BSF4-J-QA",
                  "depositCount":2,"totalGrams":3000,"status":"siap" if prepared["yes"] else "draft",
                  "lines":[{"itemId":"waste:kardus","name":"Kardus","grams":3000,"lastPrice":2500}]}
            await route.fulfill(status=200,headers=headers,body=json.dumps(data))
        await page.route("https://api.flamboyan4.web.id/api/admin/bank/sale-sheet**",mock_note)
        await page.evaluate("""() => {
          window.__printed=0;
          window.__noteHtml='';
          window.open=()=>({
            closed:false,
            document:{
              readyState:'complete',
              open(){window.__noteHtml=''},
              write(s){window.__noteHtml+=s},
              close(){}
            },
            focus(){},close(){},addEventListener(){},
            print(){window.__printed++}
          });
        }""")
        await page.add_script_tag(url=ROOT+"/portal-live/bank-sale-sheet.js")
        button=page.locator("#f4SaleSheetPrint")
        assert await button.is_visible(),(device,"Note button hidden before selection")
        assert await button.is_enabled(),(device,"Note button disabled before selection")
        adjacent=await page.evaluate("""() => {
          const field=document.querySelector('#saleBatch').closest('.field');
          const tools=document.querySelector('.f4-bank-sheet-tools');
          return field?.nextElementSibling===tools
            && getComputedStyle(tools).display!=='none';
        }""")
        assert adjacent,(device,"Note action must follow the sale group")
        await button.click()
        assert await page.locator("#f4SaleSheetStatus").text_content()=="Pilih kelompok setoran terlebih dahulu."
        assert await page.evaluate("document.activeElement.id")=="saleBatch"
        await page.locator("#saleBatch").select_option("batch-qa")
        await page.wait_for_function(
            "() => document.querySelector('#f4SaleSheetNumber')?.textContent==='BSF4-J-QA'")
        assert await button.is_visible() and await button.is_enabled(),device
        await button.click()
        await page.wait_for_function("() => window.__printed>=1")
        assert prepared["post"]==1,(device,prepared)
        assert "LEMBAR TIMBANG & JUAL" in await page.evaluate("window.__noteHtml"),device
        assert "Pemilik Lapak" in await page.evaluate("window.__noteHtml"),device
        assert "cetak ulang" in (await button.text_content()).lower(),device
        await button.click()
        await page.wait_for_function("() => window.__printed>=2")
        assert prepared["post"]==1,(device,"Reprint must never prepare a second time",prepared)
        assert prepared["get"]>=2,(device,prepared)
        print("BANK_WEIGH_NOTE_VISIBLE_AND_SAFE_REPRINT_OK",device,prepared,flush=True)
        await page.close()


async def compact_sale_form(browser):
    """Use the actual sale markup and live CSS; never submit to the API."""
    import pathlib,re
    html=pathlib.Path("bank-sampah/index.html").read_text()
    match=re.search(r'<div id="pagePenjualan" class="card hidden">[^\n]*',html)
    assert match,"Live sale form markup not found"
    sale=match.group(0).replace('class="card hidden"','class="card f4-bank-admin-unframed"',1)
    sale=sale.replace('id="saleItems" class="tablewrap">Memuat...',
      'id="saleItems" class="tablewrap"><div class="f4-compact-rows">'
      '<div class="f4-compact-row f4-compact-sale-row"><select><option>Kardus</option></select>'
      '<input placeholder="Kg"><div class="f4-compact-entry-group">'
      '<input placeholder="Rp/kg"><button class="f4-compact-remove">x</button></div></div></div>',1)
    for label,width in [("hp",390),("pc",1366)]:
        page=await browser.new_page(viewport={"width":width,"height":850},device_scale_factor=2)
        fixture=(
          '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">'
          '<base href="'+ROOT+'/"><link rel="stylesheet" href="/portal-live/bank-eco-pages.css">'
          '<style>*,*::before,*::after{box-sizing:border-box}body{margin:0}'
          '.section{padding:16px;max-width:100%}</style></head>'
          '<body class="f4-bank-app-private f4-bank-app-admin"><div id="dashboardView">'
          '<main class="section">'+sale+'</main></div></body></html>')
        await page.set_content(fixture,wait_until="load")
        await page.add_script_tag(url=ROOT+"/portal-live/bank-sale-sheet.js")
        state=await page.evaluate("""() => {
          const rect=s=>{const r=document.querySelector(s)?.getBoundingClientRect();
            return r?{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right}:null};
          const details=document.getElementById('f4SaleExtras');
          return {
            scrollWidth:document.documentElement.scrollWidth,
            batch:rect('#saleBatch'),date:rect('#saleDate'),lapak:rect('#saleLapak'),
            money:rect('#saleReceived'),status:rect('#saleStatus'),
            sheet:rect('.f4-bank-sheet-tools'),print:rect('#f4SaleSheetPrint'),
            form:rect('#saleForm'),detailsOpen:details.open,
            referenceHidden:document.getElementById('saleProof').getClientRects().length===0
          };
        }""")
        assert state["scrollWidth"]<=width+2,(label,state)
        assert not state["detailsOpen"] and state["referenceHidden"],(label,state)
        assert state["sheet"] and state["print"] and state["print"]["w"]>80,(label,state)
        if label=="hp":
            assert abs(state["date"]["y"]-state["lapak"]["y"])<4,(label,state)
            assert abs(state["money"]["y"]-state["status"]["y"])<4,(label,state)
            assert state["form"]["w"]<=width,(label,state)
        else:
            assert abs(state["batch"]["y"]-state["date"]["y"])<4,(label,state)
            assert abs(state["date"]["y"]-state["lapak"]["y"])<4,(label,state)
        await page.locator("#f4SaleExtras > summary").click()
        assert await page.locator("#saleProof").is_visible(),(label,"Reference hidden after expansion")
        assert await page.locator("#saleProofUrl").is_visible(),(label,"Proof URL hidden after expansion")
        assert await page.locator("#f4SaleSheetPrint").is_visible(),(label,"Nota action lost")
        print("BANK_SALE_COMPACT_OPTIONAL_DETAILS_OK",label,state,flush=True)
        await page.close()


async def sale_price_field_proportions(browser):
    """Price field must be wider than the weight field on PC and phones."""
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":820})
        await page.goto(ROOT,wait_until="domcontentloaded")
        fixture="""<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
        <style>body{margin:0;font-family:system-ui}#dashboardView{padding:16px;max-width:1060px;margin:auto}
        #pagePenjualan{width:100%;max-width:600px;box-sizing:border-box}</style></head>
        <body class="f4-bank-app-private f4-bank-app-admin">
        <div id="dashboardView"><main class="section"><div id="pagePenjualan">
        <form id="saleForm"><div id="saleItems"><div class="f4-compact-rows">
        <div class="f4-compact-row f4-compact-sale-row">
        <select aria-label="Jenis sampah"><option>Kardus</option></select>
        <input type="number" aria-label="Berat terjual (kg)" placeholder="Kg">
        <div class="f4-compact-entry-group">
        <input type="number" aria-label="Harga per kg" placeholder="Rp/kg">
        <button class="f4-compact-remove" type="button">×</button>
        </div></div></div></div></form></div></main></div></body></html>"""
        await page.set_content(fixture,wait_until="load")
        sizes=await page.evaluate("""() => {
          const width=(sel)=>document.querySelector(sel)?.getBoundingClientRect().width || 0;
          return {kind:width('#saleItems select'),weight:width('#saleItems .f4-compact-sale-row>input'),
            price:width('#saleItems .f4-compact-entry-group>input'),
            remove:width('#saleItems .f4-compact-remove'),
            overflow:document.documentElement.scrollWidth>innerWidth+2};
        }""")
        assert sizes["kind"]>sizes["price"]>sizes["weight"]>0,(device,sizes)
        assert sizes["remove"]>=30 and not sizes["overflow"],(device,sizes)
        print("BANK_PRICE_FIELD_WIDER_THAN_WEIGHT_OK",device,sizes,flush=True)
        await page.close()



async def bank_unified_goods_forms(browser):
    """Setoran Warga, Stok Bank, Penjualan: identical clean mobile goods rows and add controls."""
    for width in (360,390):
        page=await browser.new_page(viewport={"width":width,"height":850})
        fixture="""<!doctype html><html><head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
        <style>body{margin:0;font-family:system-ui;background:#f7fafb}
        #dashboardView>.section{padding:14px}</style></head>
        <body class="f4-bank-app-private f4-bank-app-admin"><div id="dashboardView"><main class="section">
        <section id="pageSetoran">
          <form id="setoranForm"><div class="f4-setoran-main">
            <div class="f4-entry-goods-heading"><div><h3>Rincian sampah</h3></div>
              <button type="button" class="f4-compact-add" id="f4SetAddKind">Tambah jenis</button></div>
            <div id="setBarang"><div class="f4-compact-rows"><div class="f4-compact-row">
             <select><option>Plastik</option></select><div class="f4-compact-entry-group">
              <input type="number" placeholder="Berat (kg)"><button type="button" class="f4-compact-remove">X</button>
             </div></div></div></div>
          </div><div class="f4-entry-right"><div class="f4-setoran-side">
           <button id="saveSetoranBtn" type="submit">Simpan setoran</button>
          </div></div></form>
          <form id="f4BankOwnDepositForm">
           <div class="f4-bank-own-main"><div class="f4-bank-own-detail">
             <div class="f4-bank-own-detail-head"><strong>Rincian sampah</strong></div>
             <div id="f4BankOwnLines" class="f4-bank-own-lines f4-compact-rows">
              <div class="f4-bank-own-line f4-compact-row">
               <select><option>Logam</option></select><div class="f4-compact-entry-group">
                <input data-own-weight="1" type="number" placeholder="Berat (kg)">
                <button type="button" class="f4-compact-remove">X</button>
               </div>
              </div>
             </div>
             <button type="button" class="f4-compact-add">Tambah jenis</button>
           </div></div>
           <div class="f4-bank-own-side">
             <div class="f4-bank-own-fields"><label class="f4-bank-own-field">
              <span>Tanggal</span><input id="f4BankOwnDate" type="date">
             </label></div>
             <label class="f4-bank-own-field"><span>Catatan</span><input></label>
             <button type="submit" class="f4-bank-gold-action">Simpan Setoran Bank</button>
           </div>
          </form>
        </section>
        <section id="pagePenjualan">
          <form id="saleForm"><div class="f4-sale-main">
            <div class="f4-entry-goods-heading"><div><h3>Hasil timbang</h3></div>
              <button type="button" class="f4-compact-add" id="f4SaleAddKind">Tambah jenis</button></div>
            <div id="saleItems"><div class="f4-compact-rows">
              <div class="f4-compact-row f4-compact-sale-row">
               <select><option>Kardus</option></select>
               <input type="number" placeholder="Kg">
               <div class="f4-compact-entry-group"><input type="number" placeholder="Rp/kg">
                 <button type="button" class="f4-compact-remove">X</button>
               </div>
              </div>
            </div></div>
            <div class="summary-box">Total jual</div>
          </div></form>
        </section>
        </main></div></body></html>"""
        await page.goto(ROOT,wait_until="domcontentloaded")
        await page.set_content(fixture,wait_until="load")
        report=await page.evaluate("""() => {
          const contexts=[
            ['warga','#setoranForm .f4-setoran-main','#setBarang .f4-compact-row','#f4SetAddKind'],
            ['bank','#f4BankOwnDepositForm .f4-bank-own-detail','#f4BankOwnLines .f4-compact-row','#f4BankOwnDepositForm .f4-compact-add'],
            ['jual','#saleForm .f4-sale-main','#saleItems .f4-compact-row','#f4SaleAddKind']
          ];
          const box=node=>{const r=node.getBoundingClientRect();
            return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}};
          return {rows:contexts.map(([type,parent,row,add])=>{
            const c=document.querySelector(parent),r=document.querySelector(row),b=document.querySelector(add);
            return {type,card:box(c),row:box(r),add:box(b),
              border:getComputedStyle(b).borderTopStyle,
              inputHeight:r.querySelector('input').getBoundingClientRect().height,
              deleteColor:getComputedStyle(r.querySelector('.f4-compact-remove')).backgroundColor};
          }),
          saleFields:[...document.querySelectorAll('#saleItems .f4-compact-sale-row > select, #saleItems .f4-compact-sale-row > input, #saleItems .f4-compact-sale-row > .f4-compact-entry-group > input, #saleItems .f4-compact-sale-row > .f4-compact-entry-group > button')].map(box),
          saleGroupDisplay:getComputedStyle(document.querySelector('#saleItems .f4-compact-entry-group')).display,
          stockIntro:document.querySelector('#f4BankOwnDepositForm .f4-bank-own-intro')!==null,
          stockTotal:document.querySelector('#f4BankOwnDepositForm .f4-bank-own-weight')!==null,
          ownDate:box(document.querySelector('#f4BankOwnDate')),
          wargaSave:getComputedStyle(document.querySelector('#saveSetoranBtn')).position,
          bankSave:getComputedStyle(document.querySelector('#f4BankOwnDepositForm [type=submit]')).position,
          overflow:document.documentElement.scrollWidth>innerWidth+3};
        }""")
        assert not report["overflow"],(width,report)
        assert not report["stockIntro"] and not report["stockTotal"],(width,report)
        assert report["saleGroupDisplay"]=="contents",(width,report)
        assert len(report["saleFields"])==4,(width,report)
        fields=report["saleFields"]
        assert max(p["y"] for p in fields)-min(p["y"] for p in fields)<3,(width,fields)
        assert fields[0]["x"]<fields[1]["x"]<fields[2]["x"]<fields[3]["x"],(width,fields)
        assert fields[0]["w"]>fields[2]["w"]>fields[1]["w"]>=40,(width,fields)
        assert abs(fields[3]["w"]-40)<2,(width,fields)
        for row in report["rows"]:
            assert row["inputHeight"]>=44,(width,row)
            assert row["add"]["w"]>=row["card"]["w"]-55,(width,row)
            assert row["add"]["y"]>=row["row"]["bottom"]-3,(width,row)
            assert row["border"]=="dashed",(width,row)
            assert row["deleteColor"]=="rgb(255, 240, 239)",(width,row)
        assert report["ownDate"]["bottom"]<report["rows"][1]["row"]["y"],(width,report)
        assert report["wargaSave"]!="fixed" and report["bankSave"]!="fixed",(width,report)
        print("BANK_THREE_GOODS_FORMS_UNIFIED_OK",width,report,flush=True)
        await page.close()


async def bank_policy_permission_ui(browser):
    """Admin must never see Superadmin editor, including during API loading."""
    import json
    for role,can_edit in [("admin",False),("superadmin",True)]:
        page=await browser.new_page(viewport={"width":390,"height":780})
        await page.goto(ROOT,wait_until="domcontentloaded")
        await page.set_content("""<!doctype html><html><head>
        <link rel="stylesheet" href="/portal-live/bank-eco-pages.css">\n<link rel="stylesheet" href="/portal-live/bank-mobile-dock.css">
        </head><body><section id="pageMaster" class="hidden"></section></body></html>""",wait_until="load")
        async def policy(route):
            await route.fulfill(status=200,headers={
              "access-control-allow-origin":ROOT,"access-control-allow-credentials":"true",
              "content-type":"application/json"},
              body=json.dumps({"ok":True,"canEdit":can_edit,"current":{
                "method":"percentage","wargaPercent":50}}))
        await page.route("https://api.flamboyan4.web.id/api/admin/bank/policy",policy)
        await page.add_script_tag(url=ROOT+"/portal-live/bank-policy-admin.js")
        assert await page.locator("#f4BankPolicyCard").count()==0,(role,"Editor loaded before login")
        await page.locator("#pageMaster").evaluate("(el)=>el.classList.remove('hidden')")
        if can_edit:
            await page.locator("#f4BankPolicyCard:not([hidden])").wait_for(timeout=8000)
            await page.locator("#f4BankPolicyCard summary").click()
            assert await page.locator("#f4BankPolicyCard form").is_visible(),role
        else:
            await page.wait_for_function("() => document.querySelector('#f4BankPolicyCard')===null",timeout=8000)
            assert await page.locator("#pageMaster input").count()==0,role
        print("BANK_POLICY_PERMISSION_UI_OK",role,flush=True)
        await page.close()


async def bank_cash_and_history_tabs(browser):
    """Real manager JS: Pengeluaran contains the form, Riwayat has two tabs."""
    import json
    page=await browser.new_page(viewport={"width":390,"height":850})
    await page.goto(ROOT,wait_until="domcontentloaded")
    extra="""<section id="pageBiaya" class="hidden"><div id="v10Budget"></div><div id="v10History"></div>
    <form id="v10ExpenseForm" class="block-gap">
     <div class="field"><label for="v10Type">Jenis transaksi</label><select id="v10Type">
      <option value="Pengeluaran">Pengeluaran</option><option value="Pembelian">Pembelian barang</option></select></div>
     <div class="field"><label for="v10Date">Tanggal</label><input id="v10Date" type="date"></div>
     <div class="field"><label for="v10Position">Pos</label><select id="v10Position"><option>Operasional</option></select></div>
     <div class="field"><label for="v10Description">Keterangan</label><input id="v10Description"></div>
     <div class="field"><label for="v10Qty">Jumlah</label><input id="v10Qty" type="number" value="1"></div>
     <div class="field"><label for="v10Unit">Satuan</label><input id="v10Unit" value="unit"></div>
     <div class="field"><label for="v10Price">Harga</label><input id="v10Price" type="number"></div>
     <div class="summary-box"><strong id="v10Amount">Rp0</strong></div>
     <div class="field"><label for="v10Vendor">Toko</label><input id="v10Vendor"></div>
     <div id="v10InventoryBox" class="field hidden"><input id="v10Inventory" type="checkbox"></div>
     <div class="field"><label for="v10Proof">Bukti</label><input id="v10Proof"></div>
     <div class="field"><label for="v10Notes">Catatan</label><input id="v10Notes"></div>
     <button type="submit">Simpan</button></form><div id="v10ExpenseNotice"></div></section>
     <section id="pageRiwayat" class="hidden">Setoran warga</section>
     <section id="pageRiwayatJual" class="hidden">Penjualan lapak</section>"""
    await page.set_content(HTML.replace("</body></html>",extra+"</body></html>"),wait_until="load")
    await page.evaluate("""() => {
      window.__expenseLoads=0;
      window.v10LoadBiaya=()=>{window.__expenseLoads++};
      window.loadRiwayatV7=()=>{};
      window.loadRiwayatJual=()=>{};
    }""")
    async def cash(route):
        await route.fulfill(status=200,headers={
          "access-control-allow-origin":ROOT,"access-control-allow-credentials":"true",
          "content-type":"application/json"},
          body=json.dumps({"ok":True,"data":[{
            "id":"qa","occurred_on":"2026-11-03","status":"aktif",
            "transaction_type":"Pengeluaran","note":"Beli kantong sampah",
            "fund_position":"Operasional","cash_in_rp":0,"cash_out_rp":5000}]}))
    await page.route("https://api.flamboyan4.web.id/api/v2/admin/bank/cash**",cash)
    await page.add_script_tag(url=ROOT+"/portal-live/bank-mobile-app.js")
    await page.evaluate("() => window.goPage('bank-admin-cash')")
    await page.locator("#f4BankCashTabs button").first.wait_for(timeout=8000)
    assert await page.locator("#f4BankCashTabs button").all_text_contents()==["Pemasukan","Pengeluaran"]
    await page.locator("#f4BankCashTabs button[data-cash-tab=out]").click()
    await page.locator("#f4BankCashExpense").wait_for(state="visible",timeout=8000)
    fields=await page.evaluate("""() => {
      const form=document.querySelector('#v10ExpenseForm');
      return {
        parent:form?.parentElement?.id,
        amountLabel:document.querySelector('#v10Price')?.closest('.field')?.querySelector('label')?.textContent,
        qty:document.querySelector('#v10Qty')?.value,
        qtyHidden:document.querySelector('#v10Qty')?.closest('.field')?.hidden,
        optionalClosed:!document.querySelector('.f4-bank-expense-extras')?.open,
        loads:window.__expenseLoads,
        overflow:document.documentElement.scrollWidth>innerWidth+3
      };
    }""")
    assert fields["parent"]=="f4BankCashExpense" and fields["amountLabel"]=="Nominal (Rp)",fields
    assert fields["qty"]=="1" and fields["qtyHidden"] and fields["optionalClosed"],fields
    assert fields["loads"]>=1 and not fields["overflow"],fields
    assert await page.locator("#f4BankCashExpense button[type=submit]").inner_text()=="Simpan Pengeluaran"
    await page.evaluate("() => window.goPage('bank-admin-history')")
    await page.locator("#f4BankAdminHistoryTabs button").first.wait_for(timeout=8000)
    assert await page.locator("#f4BankAdminHistoryTabs button").all_text_contents()==["Setoran","Penjualan"]
    assert await page.locator("#f4BankAdminHistoryTabs").is_visible()
    assert await page.locator("#pageRiwayat").is_visible()
    assert not await page.locator("#pageRiwayatJual").is_visible()
    await page.locator("#f4BankAdminHistoryTabs button").nth(1).click()
    assert await page.locator("#pageRiwayatJual").is_visible()
    assert not await page.locator("#pageRiwayat").is_visible()
    print("BANK_CASH_EXPENSE_HISTORY_TABS_OK",fields,flush=True)
    await page.close()


async def member_price_card_position(browser):
    """The real schedule and tariff share one row and have no enclosing green frame."""
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":850})
        await page.set_content(MEMBER_HTML,wait_until="load")
        result=await page.evaluate("""() => {
          const s=document.querySelector('#f4BankWeighingSchedule'),p=document.querySelector('#f4MemberPriceShortcut'),
          a=s.getBoundingClientRect(),b=p.getBoundingClientRect();
          return {parent:s.parentElement.id,priceParent:p.parentElement.id,
            y1:a.y,y2:b.y,right1:a.right,left2:b.left,
            icon:!!p.querySelector('svg'),count:s.parentElement.children.length,
            overflow:document.documentElement.scrollWidth>innerWidth+3};
        }""")
        assert result["parent"]==result["priceParent"]=="f4MemberQuickActions",(device,result)
        assert result["count"]==2 and result["icon"],(device,result)
        assert abs(result["y1"]-result["y2"])<3 and result["right1"]<=result["left2"]+3,(device,result)
        assert not result["overflow"],(device,result)
        print("MEMBER_SCHEDULE_PRICE_REFERENCE_OK",device,result,flush=True)
        await page.close()


async def admin_docs_back_and_cross_account(browser):
    """Regression for Admin→public→member without refresh and true prior-page back."""
    import json
    page=await browser.new_page(viewport={"width":390,"height":850})
    await page.goto(ROOT,wait_until="domcontentloaded")
    await page.set_content(HTML,wait_until="load")
    await page.evaluate("""() => {
      const section=document.querySelector('.section');
      const heading=document.createElement('div');heading.id='f4BankPageGreeting';
      heading.textContent='Halo, Admin';section.prepend(heading);
      const docs=document.createElement('section');docs.id='v22DocsPage';
      docs.innerHTML='<header class="v22-doc-heading"><h1>Dokumentasi</h1></header>'+
        '<div id="v22DocCount">0 album</div><div id="v22DocFilters"></div><div class="v22-doc-list"></div>';
      section.append(docs);
      const inventory=document.createElement('section');inventory.id='v17Inventaris';
      inventory.innerHTML='<h2>Inventaris</h2><div id="v17Inventory">Inventaris</div>';
      section.append(inventory);
      window.f4BankRenderDocumentation=()=>{};
    }""")
    async def mock_schedule(route):
        await route.fulfill(status=200,headers={
           "access-control-allow-origin":ROOT,
           "access-control-allow-credentials":"true","content-type":"application/json"},
           body=json.dumps({"ok":True,"weekday":3,"dayName":"Rabu"}))
    await page.route("https://api.flamboyan4.web.id/api/public/bank/weighing-schedule",mock_schedule)
    await page.add_script_tag(url=ROOT+"/portal-live/bank-mobile-app.js")
    await page.locator("#f4BankAdminOperations").wait_for(state="attached",timeout=8000)
    await page.evaluate("() => window.goPage('profile')")
    await page.evaluate("() => window.goPage('bank-admin-docs')")
    await page.locator("#f4BankAdminDocsTabs button").first.wait_for(timeout=8000)
    assert await page.locator("#bank-admin-docs .f4-bank-screen-title").inner_text()=="Dokumentasi"
    assert await page.locator("#bank-admin-docs .f4-bank-screen-title > #f4BankAdminBack").is_visible(), "Back must be beside the active title"
    aligned=await page.evaluate("""() => {
      const title=document.querySelector('#bank-admin-docs .f4-bank-screen-title').getBoundingClientRect();
      const back=document.querySelector('#f4BankAdminBack').getBoundingClientRect();
      return Math.abs(title.y+title.height/2-back.y-back.height/2)<3;
    }""")
    assert aligned,"Back and title must occupy the same row"
    assert not await page.locator("#bank-admin-docs #v22DocsPage .v22-doc-heading").is_visible()
    assert await page.locator("#bank-admin-docs #v22DocsPage").is_visible()
    await page.locator("#f4BankAdminDocsTabs button").nth(1).click()
    assert await page.locator("#bank-admin-docs #v17Inventaris").is_visible()
    assert not await page.locator("#bank-admin-docs #v17Inventaris>h2").is_visible()
    await page.locator("#f4BankAdminBack").click()
    assert await page.locator("#pageProfile").is_visible(), "Back must return to previous profile screen"
    back_status=await page.evaluate("""() => {
      const b=document.querySelector('#f4BankAdminBack'),h=document.querySelector('#pageProfile .f4-profile-header h2');
      return {backHidden:b?.hidden,backParent:b?.parentElement?.outerHTML?.slice(0,400),
        backStyle:b?getComputedStyle(b).display:null,backRect:b?.getBoundingClientRect().toJSON(),
        profileVisible:!document.querySelector('#pageProfile')?.classList.contains('hidden'),
        dashboardHidden:document.querySelector('#pageDashboard')?.classList.contains('hidden'),
        heading:h?.outerHTML?.slice(0,400),bodyClass:document.body.className};
    }""")
    assert await page.locator("#f4BankAdminBack").is_visible(),back_status
    await page.locator("#f4BankAdminBack").click()
    assert await page.locator("#pageDashboard").is_visible()
    assert not await page.locator("#f4BankAdminBack").is_visible()
    print("BANK_ADMIN_PREVIOUS_BACK_AND_DOCS_OK",flush=True)
    # Simulate actual shared login role transitions. No navigation/reload.
    await page.evaluate("""() => {
      document.body.dataset.f4BankRole='public';
      document.querySelector('#dashboardView').classList.add('hidden');
    }""")
    await page.wait_for_function("""() =>
      !document.body.classList.contains('f4-bank-app-admin')
      && !document.querySelector('#f4BankAdminOperations')
      && !document.querySelector('#f4BankAdminShortcuts')""")
    await page.evaluate("""() => {
      document.body.dataset.f4BankRole='warga';
      document.querySelector('#dashboardView').classList.remove('hidden');
      document.querySelector('#pageDashboard').classList.remove('hidden');
    }""")
    await page.wait_for_function("() => document.body.classList.contains('f4-bank-app-member')")
    assert await page.locator("#f4BankMemberCard").is_visible()
    assert await page.locator("#f4BankAdminOperations").count()==0
    assert await page.locator("#f4BankAdminShortcuts").count()==0
    assert not await page.locator("#f4BankAdminBack").is_visible()
    await page.wait_for_function("""() => document.querySelector('#f4BankWeighingSchedule')
      ?.textContent?.includes('Setiap Rabu')""",timeout=9000)
    assert await page.locator("#pageDashboard").is_visible()
    print("BANK_ACCOUNT_SWITCH_NO_REFRESH_AND_WEDNESDAY_SCHEDULE_OK",flush=True)
    # Check both reverse directions and Superadmin without a page reload.
    await page.evaluate("""() => {
      window.f4BankResetForAccountSwitch();
      document.body.dataset.f4BankRole='admin';
      window.f4BankReconcileAccount();
    }""")
    await page.locator("#f4BankAdminOperations").wait_for(state="attached",timeout=8000)
    assert not await page.locator("#f4BankWeighingSchedule").is_visible()
    assert not await page.locator("#f4MemberPriceShortcut").is_visible()
    assert not await page.locator("#f4BankMemberCard").is_visible()
    assert await page.locator("#f4BankAdminShortcuts").is_visible()
    await page.evaluate("""() => {
      window.f4BankResetForAccountSwitch();
      document.body.dataset.f4BankRole='superadmin';
      window.f4BankReconcileAccount();
    }""")
    await page.locator("#f4BankAdminOperations").wait_for(state="attached",timeout=8000)
    assert await page.locator("#f4BankAdminShortcuts").is_visible()
    await page.evaluate("""() => {
      window.f4BankResetForAccountSwitch();
      document.body.dataset.f4BankRole='public';
      document.querySelector('#dashboardView').classList.add('hidden');
      window.f4BankReconcileAccount();
    }""")
    assert await page.locator("#f4BankAdminOperations").count()==0
    assert await page.locator("#f4BankAdminShortcuts").count()==0
    assert not await page.locator("#f4BankAdminBack").is_visible()
    print("BANK_MEMBER_ADMIN_SUPERADMIN_PUBLIC_REUSE_NO_LEAK_OK",flush=True)
    await page.close()


async def public_portal_real_entry_smoke(browser):
    """Open the real guest page with the auth API unavailable; it must not stay on a spinner."""
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":850})
        exceptions=[]
        failed_assets=[]
        page.on("pageerror",lambda exc:exceptions.append(str(exc)))
        page.on("response",lambda res:failed_assets.append({"status":res.status,"url":res.url})
                if res.status>=400 and res.url.startswith(ROOT+"/") and
                ("/portal-live/" in res.url or "/assets/" in res.url) else None)
        # Deterministically simulate the first auth request failing.
        await page.route("**/api/v2/auth/session",lambda route:route.abort("failed"))
        await page.goto(ROOT+"/bank-sampah/?halaman=dashboard",wait_until="load",timeout=30000)
        await page.wait_for_function("!document.documentElement.classList.contains('f4-bank-auth-pending')",timeout=7000)
        state=await page.evaluate("""() => {
          const pub=document.querySelector('#v11Public');
          const priv=document.querySelector('#dashboardView');
          return {
            title:document.title,
            publicRoot:!!pub,privateRoot:!!priv,
            publicContent:!!document.querySelector('#v18PublicContent'),
            publicVisible:!!pub&&!pub.classList.contains('hidden')&&getComputedStyle(pub).display!=='none',
            privateHidden:!!priv&&priv.classList.contains('hidden'),
            startupGone:!document.documentElement.classList.contains('f4-bank-auth-pending'),
            loginAvailable:!document.querySelector('#f4-direct-login')?.hidden,
            textLength:document.body.innerText.length,
            overflow:document.documentElement.scrollWidth>innerWidth+3,
            cssLoaded:[...document.styleSheets].length,
            scripts:[...document.scripts].filter(x=>x.src&&x.src.includes('/portal-live/')).length
          };
        }""")
        print("BANK_REAL_PUBLIC_BOOT",device,state,"JS_EXCEPTIONS",exceptions,"FAILED_ASSETS",failed_assets,flush=True)
        assert state["title"]=="Bank Sampah Flamboyan 4",(device,state)
        assert state["publicRoot"] and state["privateRoot"] and state["publicContent"],(device,state)
        assert state["publicVisible"] and state["privateHidden"] and state["startupGone"],(device,state)
        assert state["loginAvailable"],(device,state)
        assert state["textLength"]>180 and state["cssLoaded"]>5 and state["scripts"]>10,(device,state)
        assert not state["overflow"],(device,state)
        assert not exceptions,(device,exceptions)
        assert not failed_assets,(device,failed_assets)
        await page.close()


async def member_profile_palette_and_tap(browser):
    """Same member ATM art on both routes; palette and tap selection stay scoped to controls."""
    for device,width in [("pc",1366),("hp",390)]:
        page=await browser.new_page(viewport={"width":width,"height":850})
        await page.set_content(MEMBER_HTML,wait_until="load")
        value=await page.evaluate("""() => {
          const home=document.querySelector('#f4BankMemberCard');
          const host=document.querySelector('#dashboardView .section');
          const profile=document.createElement('section');
          profile.id='pageProfile';
          profile.className='card f4-profile-card';
          profile.innerHTML='<section id="f4BankProfileDetail" class="f4-bank-profile-detail"><h3>Detail Kartu Anggota</h3></section>'+
            '<div class="f4-profile-header"><h2>Profil saya</h2></div>'+
            '<div class="f4-profile-overview"><div class="f4-profile-avatar">HJ</div><div class="f4-profile-identity"><small>Nama anggota</small><strong id="pName">Anggota</strong></div></div>'+
            '<details id="v15PhotoPanel" class="f4-profile-edit"><summary>Ubah foto profil</summary><div class="f4-profile-photo-form"><button id="v15PhotoSave" class="secondary">Simpan</button></div></details>'+
            '<input id="f4TestEditable" type="text" value="Bisa diseleksi">'+
            '<a id="f4TestLink" href="#profil">Profil</a>';
          host.append(profile);
          const panel=profile.querySelector('#f4BankProfileDetail');
          const clone=document.createElement('div');
          clone.className='f4-bank-member-card f4-bank-profile-card';
          for(const node of home.childNodes)clone.append(node.cloneNode(true));
          panel.append(clone);
          const box=el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height}};
          const computed=el=>getComputedStyle(el);
          return {
           homeBackground:computed(home).backgroundImage,
           cloneBackground:computed(clone).backgroundImage,
           homeBefore:getComputedStyle(home,'::before').backgroundImage,
           cloneBefore:getComputedStyle(clone,'::before').backgroundImage,
           homeAfter:getComputedStyle(home,'::after').backgroundImage,
           cloneAfter:getComputedStyle(clone,'::after').backgroundImage,
           homeBox:box(home),cloneBox:box(clone),
           columns:computed(profile).gridTemplateColumns.trim().split(/\\s+/).length,
           cyan:computed(profile).getPropertyValue('--profile-cyan').trim(),
           lime:computed(profile).getPropertyValue('--profile-lime').trim(),
           gold:computed(profile).getPropertyValue('--profile-yellow').trim(),
           selectedTap:computed(profile.querySelector('#f4TestLink')).userSelect,
           selectedButton:computed(profile.querySelector('#v15PhotoSave')).userSelect,
           editable:computed(profile.querySelector('#f4TestEditable')).userSelect,
           photoSave:computed(profile.querySelector('#v15PhotoSave')).backgroundColor,
           overflow:document.documentElement.scrollWidth>innerWidth+3
          };
        }""")
        assert value["homeBackground"]==value["cloneBackground"],(device,value)
        assert value["homeBefore"]==value["cloneBefore"] and value["homeAfter"]==value["cloneAfter"],(device,value)
        if device=="pc":
            assert abs(value["homeBox"]["height"]-value["cloneBox"]["height"])<3,value
            assert value["columns"]==2,value
        else:
            assert value["columns"]==1,value
            assert abs(value["cloneBox"]["width"]/value["cloneBox"]["height"]-1.83)<.05,value
        assert value["cyan"]=="#00bcd4" and value["lime"]=="#8bc34a" and value["gold"]=="#ffc411",value
        assert value["selectedTap"]=="none" and value["selectedButton"]=="none",value
        assert value["editable"]!="none" and value["photoSave"]=="rgb(0, 150, 136)",value
        assert not value["overflow"],(device,value)
        print("MEMBER_PROFILE_ATM_PALETTE_TAP_OK",device,value,flush=True)
        await page.close()

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(args=["--no-sandbox"])
        for device,width in [("pc",1366),("hp",390)]:
            page=await browser.new_page(viewport={"width":width,"height":850},device_scale_factor=1)
            await page.set_content(HTML,wait_until="load")
            await page.add_script_tag(url=ROOT+"/portal-live/bank-mobile-app.js")
            await page.evaluate("""() => window.dispatchEvent(new CustomEvent('f4-bank-admin-overview',{
                detail:{kasMilikBankRp:1500,kasGabunganRp:6000,hakWargaBelumCairRp:3000,
                kasLingkunganRp:1500,diterimaLapakRp:6000,wargaAktif:33}
            }))""")
            await page.locator("#f4BankAppHome").wait_for()
            state=await page.evaluate("""() => {
                const box=(selector)=>{
                  const r=document.querySelector(selector).getBoundingClientRect();
                  return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right};
                };
                return {
                    hero:box('#f4BankAppAdminHero'),
                    metrics:box('#f4BankAppMinis'),
                    tiles:[...document.querySelectorAll('#f4BankAppMinis .f4-bank-app-mini')].map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}),
                    home:box('#f4BankAppHome'),
                    dock:getComputedStyle(document.querySelector('#f4BankAppDock')).display,
                    labels:[...document.querySelectorAll('#f4BankAppDock .f4-bank-app-action-name')].map(n=>n.textContent),
                    cartIcon:!!document.querySelector('#f4BankAppDock [data-bank-app-route="penjualan"] svg.f4-bank-cart-icon'),
                    routes:[...document.querySelectorAll('#f4BankAppDock .f4-bank-app-dock-action')].map(n=>n.dataset.bankAppRoute),
                    center:(()=>{
                      const nav=document.querySelector('#f4BankAppDock');
                      const action=nav?.querySelector('.f4-bank-app-dock-action:nth-child(3)');
                      const icon=action?.querySelector('.f4-bank-app-action-icon');
                      const rect=icon?.getBoundingClientRect();
                      return {primary:action?.classList.contains('is-primary'),
                        label:action?.getAttribute('aria-label'),
                        visibleLabel:!!action?.querySelector('.f4-bank-app-action-name'),
                        background:icon?getComputedStyle(icon).backgroundColor:null,
                        radius:icon?getComputedStyle(icon).borderRadius:null,
                        size:rect?.width||0,top:rect?.top||0,
                        navTop:nav?.getBoundingClientRect().top||0};
                    })(),
                    account:document.querySelector('#f4BankAppBalance').textContent,
                    quick:[...document.querySelectorAll('#f4BankAppHome button')].map(n=>n.textContent.trim()),
                    heroBreakdown:{
                      display:getComputedStyle(document.querySelector('#f4BankAdminHeroBreakdown')).display,
                      values:[document.querySelector('#f4BankAdminHeroWarga')?.textContent,
                        document.querySelector('#f4BankAdminHeroLingkungan')?.textContent]
                    },
                    actions:[...document.querySelectorAll('#f4BankAdminOperations .f4-bank-admin-operation')].map(n=>{
                      const r=n.getBoundingClientRect();
                      return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom};
                    }),
                    actionsDisplay:getComputedStyle(document.querySelector('#f4BankAdminOperations')).display,
                    membersTile:(()=>{
                      const node=document.querySelector('#f4BankAppAdminHero #f4BankAppMinis .f4-bank-admin-members-link');
                      const r=node?.getBoundingClientRect();
                      return {tag:node?.tagName,route:node?.dataset.bankAppRoute,
                        background:node?getComputedStyle(node).backgroundColor:null,
                        text:node?.textContent?.trim(),insideHero:document.querySelector('#f4BankAppAdminHero')?.contains(node),
                        x:r?.x,y:r?.y,w:r?.width,h:r?.height,bottom:r?.bottom};
                    })(),
                    overflowing:[...document.querySelectorAll('body *')].filter(e=>{
                      const r=e.getBoundingClientRect(),c=getComputedStyle(e);
                      return r.width>0&&r.right>innerWidth+3&&c.position!=='fixed';
                    }).slice(0,12).map(e=>({tag:e.tagName,id:e.id,cls:String(e.className).slice(0,80),
                      left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),
                    overflow:document.documentElement.scrollWidth>window.innerWidth+3
                };
            }""")
            assert state["account"]=="Rp 1.500",(device,state)
            assert state["cartIcon"],state
            assert state["labels"]==["Beranda","Penjualan","Saldo","Laporan"],state
            assert state["routes"]==["dashboard","penjualan","setoran","tabungan","laporan"],state
            assert state["center"]["primary"] and state["center"]["label"]=="Setoran",state
            assert not state["center"]["visibleLabel"],state
            assert not state["overflow"],state
            # One true members badge INSIDE the saldo hero, not a standalone card.
            assert len(state["tiles"])==1,state
            assert state["membersTile"]["tag"]=="BUTTON" and state["membersTile"]["route"]=="tabungan",state
            assert state["membersTile"]["insideHero"] and "33" in state["membersTile"]["text"],state
            assert state["membersTile"]["x"]>=state["hero"]["x"] and state["membersTile"]["y"]>=state["hero"]["y"],state
            assert state["membersTile"]["bottom"]<=state["hero"]["y"]+state["hero"]["h"]+2,state
            if device=="pc":
                assert state["home"]["w"]>850,state
                assert state["dock"]=="none" and state["actionsDisplay"]=="grid",state
                assert state["heroBreakdown"]["display"]=="grid",state
                assert len(state["actions"])==2,state
                assert abs(state["actions"][0]["y"]-state["hero"]["y"])<3,state
                assert state["actions"][0]["x"]>=state["hero"]["right"]+8,state
                assert state["actions"][1]["y"]>=state["actions"][0]["bottom"]+7,state
                assert abs(state["actions"][1]["bottom"]-(state["hero"]["y"]+state["hero"]["h"]))<4,state
            else:
                assert state["heroBreakdown"]["display"]=="grid",state
                assert state["heroBreakdown"]["values"]==["Rp 3.000","Rp 1.500"],state
                assert state["actionsDisplay"]=="none",state
                assert all(action["w"]==0 for action in state["actions"]),state
                assert state["metrics"]["y"]>=state["hero"]["y"]-2,state
                assert state["dock"]=="grid",state
                assert state["center"]["background"]=="rgb(255, 199, 25)",state
                assert state["center"]["radius"]=="50%",state
                assert 58<=state["center"]["size"]<=68,state
                assert state["center"]["top"]<state["center"]["navTop"],state
            assert any("Catat Setoran" in x for x in state["quick"]),state
            assert await page.locator("#f4BankManualPayout").count()==1
            assert not await page.locator("#f4BankManualPayout").get_attribute("open")
            assert await page.locator("#f4BankManualPayout #v9Form").count()==1
            await page.screenshot(path=f"ops-audit/bank-eco-theme/manager-{device}.png",full_page=True)
            print("MANAGER_RESPONSIVE_OK",device,state,flush=True)
            if device=="hp":
                quick=page.locator('#f4BankAdminShortcuts .f4-bank-admin-shortcut')
                assert await quick.count()==8
                assert await page.locator('#f4BankAdminShortcuts [data-bank-app-route="laporan"]').count()==0
                assert await page.locator('#f4BankAdminShortcuts [data-bank-app-route="bank-admin-docs"]').count()==0
                more=page.locator('#f4BankAdminMore')
                assert await more.is_visible()
                await more.click()
                sheet=page.locator('#f4BankAdminMenuSheet')
                assert await sheet.evaluate("(n)=>n.open")
                assert await sheet.locator('.f4-bank-admin-menu-grid .f4-bank-admin-shortcut').count()==9
                assert await sheet.locator('[data-bank-app-route="laporan"]').count()==1
                assert await sheet.locator('[data-bank-app-route="bank-admin-docs"]').count()==1
                await page.go_back(wait_until="domcontentloaded")
                await page.wait_for_timeout(80)
                assert not await sheet.evaluate("(n)=>n.open"),"Hardware/browser Back must close Lainnya only"
                await more.click()
                await sheet.locator('.f4-bank-modal-close').click()
                await page.wait_for_timeout(80)
                assert not await sheet.evaluate("(n)=>n.open"),"Close icon must dismiss Lainnya"
                print("ADMIN_LAINNYA_SHEET_BACK_OK",flush=True)
                await page.evaluate("""() => {
                  document.body.style.minHeight='2400px';
                  window.scrollTo(0,650);
                }""")
                dock_state=await page.evaluate("""() => {
                  const n=document.querySelector('#f4BankAppDock'),r=n.getBoundingClientRect();
                  return {scroll:scrollY,position:getComputedStyle(n).position,bottom:r.bottom,
                    viewport:innerHeight,background:getComputedStyle(n).backgroundColor};
                }""")
                assert dock_state["scroll"]>400 and dock_state["position"]=="fixed",dock_state
                assert abs(dock_state["viewport"]-dock_state["bottom"])<2,dock_state
                assert dock_state["background"]=="rgb(255, 255, 255)",dock_state
                await page.evaluate("window.scrollTo(0,0)")
                print("ADMIN_DOCK_STABLE_ON_SCROLL_OK",dock_state,flush=True)
                direct=page.locator('#f4BankAdminShortcuts [data-bank-app-route="tabungan"]')
                assert await direct.is_visible() and await direct.inner_text()=="Saldo Warga"
                assert await page.locator('#f4BankAdminShortcuts [data-bank-app-route="profile"]').count()==0
                await direct.click()
                assert await page.locator("#pageTabungan").is_visible()
                print("BANK_SALDO_WARGA_DIRECT_NAV_OK",flush=True)
            await page.close()
        await admin_docs_back_and_cross_account(browser)
        await bank_policy_permission_ui(browser)
        await bank_cash_and_history_tabs(browser)
        await member_price_card_position(browser)
        await sale_price_field_proportions(browser)
        await bank_unified_goods_forms(browser)
        await note_print_is_visible(browser)
        await compact_sale_form(browser)
        await member_layout(browser)
        await member_balance_refresh_preserves_design(browser)
        await member_mutation_ledger(browser)
        await savings_chart(browser)
        await admin_mobile_shell(browser)
        await bank_real_mobile_dock_bidirectional_scroll(browser)
        await public_chart_and_flat_roster(browser)
        await public_report_compact(browser)
        await member_profile_inline_name(browser)
        await member_profile_dropdown_chevrons(browser)
        await member_profile_palette_and_tap(browser)
        await public_portal_real_entry_smoke(browser)
        await browser.close()
if __name__=="__main__":
    asyncio.run(main())
