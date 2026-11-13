'use strict';
/* Pure static validation: all Bank Sampah portal modes, desktop/mobile, no DB access. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const memberBannerBytes=fs.readFileSync('assets/bank-sampah-alur-penimbangan-1600x500.png');
assert(memberBannerBytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')) &&
       memberBannerBytes.readUInt32BE(16)===1600 && memberBannerBytes.readUInt32BE(20)===500,
 'Use the original real 1600 x 500 Bank Sampah image, not a compressed placeholder');
const h=fs.readFileSync('bank-sampah/index.html','utf8');
const css=fs.readFileSync('portal-live/bank-eco-pages.css','utf8');
const dashboard=fs.readFileSync('portal-live/bank-eco-dashboard.css','utf8');
const publicTheme=fs.readFileSync('portal-live/bank-impact-summary.css','utf8');
const mobile=fs.readFileSync('portal-live/bank-mobile-app.js','utf8');
const priceModule=fs.readFileSync('portal-live/bank-member-prices.js','utf8');
const memberNav=fs.readFileSync('portal-live/bank-member-navigation.css','utf8');
const memberPolish=fs.readFileSync('portal-live/bank-member-polish.css','utf8');
const memberLegacyTheme=fs.readFileSync('portal-live/modern-portals.css','utf8');
const memberDirectShell=fs.readFileSync('portal-live/direct-shell.css','utf8');
new vm.Script(mobile,{filename:'portal-live/bank-mobile-app.js'});
const source=[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(x=>x[1].includes('function v14Setup()'))?.[1];
assert(source,'Bank app inline JavaScript missing');
new vm.Script(source,{filename:'bank-sampah/index.html:inline'});
/* Compact Tabungan history is the only member deposit list; all details live in its receipt. */
const receiptScope=h.split("const deposits=$('v12Deposits');deposits.replaceChildren();")[1]?.split("if(!deposits.querySelector('.f4-member-tx'))")[0]||'';
assert(receiptScope.includes("const row=document.createElement('div');row.className='f4-member-tx';") &&
       receiptScope.includes('summary.append(receipt)') &&
       receiptScope.includes('f4BankReceiptIcon(s,()=>') &&
       receiptScope.includes("receipt.setAttribute('aria-label','Lihat resi setoran '+dateText)") &&
       !receiptScope.includes("document.createElement('details')") &&
       !receiptScope.includes("document.createElement('summary')") &&
       !receiptScope.includes('f4-member-tx-chevron') &&
       !receiptScope.includes('f4-member-tx-detail'),
 'Tabungan history must be flat, without an expanding row; the receipt icon opens the real details');
assert(css.includes('#dashboardView #pagePribadi #v12Deposits .f4-member-deposit-receipt{') &&
       css.includes('grid-template-columns:38px minmax(0,1fr) auto 38px') &&
       !css.includes('#dashboardView #pagePribadi #v12Deposits .f4-member-tx-chevron{'),
 'Savings history receipt button must sit beside the amount, with no dead chevrons');
assert(css.includes('linear-gradient(112deg,#009688,#008e80 56%,#43a047)') &&
       css.includes('.f4-bank-savings-stat:nth-child(2){background:#e7f9fc;border-color:#b9e9f0}') &&
       css.includes('background:#8bc34a') && css.includes('background:#ffc411'),
 'Savings page palette should use new teal, green, lime, yellow and cyan only');


assert(/\/portal-live\/bank-eco-pages\.css\?v=[0-9]{8}-/.test(h),'Versioned theme stylesheet missing');
for(const name of ["pageProfile","pageSetoran","pageRiwayat","pageRiwayatJual","pagePenjualan","pageRekonsiliasi","pageMaster","pageProgress","pagePassword","pageAdmin","pagePengesahan","pageTabungan","pageBiaya","pageLaporan","pageKegiatan","pageDokumentasi","pageInventaris","pagePribadi"].concat(['pageDashboard','v11Public'])){
 assert(h.includes(name),'Missing portal view '+name);
}
for(const phrase of ['#v18PublicSide',
 '#sideNav','#v16Tabs.v16-tabs','.v16-item','#v17Finance','#pagePribadi',
 '#v12Private>.stats','#pageProgress','.f4-member-progress-section',
 '#pageSetoran','#pagePenjualan','#pageRekonsiliasi','#pagePengesahan','#pageTabungan',
 '#pageBiaya','#pageDokumentasi','#pageInventaris','#pageMaster','#pageAdmin',
 '.f4-member-progress-modal-panel','width:min(226px,75vw)',
 'max-width:1023px','max-width:760px','--eco-leaf:#318651',
 '#f4BankAppHome[data-bank-role="member"]>#f4BankMemberCard']){
 assert(css.includes(phrase),'Missing themed component '+phrase);
}
assert(!css.includes('#a0dcb3'),'Old mint gradient present');
assert(css.includes('background:#e4f6d5;color:#196e40;'),'Soft lime navigation missing');
assert(!css.includes('border-left:4px solid #d7a517'),'Hard schedule rail returned');
assert(!css.includes('background:linear-gradient(120deg,#ffdc78,#ffc12b)'),'Muddy yellow price gradient returned');
assert(!css.includes('#f4MemberHero'), 'No green wrapper should surround the ATM card');
assert(css.includes('grid-area:card') && css.includes('grid-area:balance'), 'ATM and member savings balance must be separate grid items');
assert(!css.includes('bottom:-48px;width:min(80%,380px);height:260px'), 'Old drifting leaf offset returned');
assert(css.includes('#f4MemberQuickActions.f4-member-shortcuts') &&
       css.includes('grid-area:quick') && mobile.includes('quick.replaceChildren(...[weighing,price].filter(Boolean))'),
 'Schedule and price must remain two live actions in one integrated shortcut row');
assert(priceModule.includes('priceTag.setAttribute("viewBox"') &&
       priceModule.includes('priceTag.innerHTML=\'<path d="m3 12 9-9') &&
       !priceModule.includes('f4-bank-price-shortcut-icon","♻'),
 'Price shortcut must use a clear SVG price-tag icon');
const bankingCss=css.split('/* Bank Sampah member dashboard: premium eco-banking composition.')[1]
 ?.split('/* Responsive Bank Sampah:')[0]||'';
assert(bankingCss.includes('background:linear-gradient(120deg,#079e8f 0%,#05896e 55%,#087448 100%)') &&
       !bankingCss.includes('background:linear-gradient(135deg,#09BCD3 0%,#009788 100%)'),
 'Premium member ATM should use the selected deep-leaf gradient without changing other portal pages');
assert(bankingCss.includes('grid-area:balance') &&
       bankingCss.includes('padding:23px 24px;border:1px solid #dfeae3;border-radius:22px;text-align:left;\n background:#fff;') &&
       bankingCss.includes('background:linear-gradient(105deg,#067747,#075030)'),
 'Member balance requires white background and working green CTA');
assert(publicTheme.includes('background:#43a047;color:#fff'),'Public hero stays solid green');
assert(css.includes('"card balance"') && css.includes('"quick quick"') &&
       css.includes('"progress recent"') && css.includes('"guide info"'),
 'Premium desktop hierarchy must have personal progress beside mutasi and compact steps beside information');
assert(css.includes('grid-area:quick') && css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),
 'Schedule and price must share the full width banking shortcut strip');
assert(css.includes('"quick quick info"') && css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),
 'Mobile shortcuts must show three matched actions in one row');
assert(!css.includes('"card card card card card card card card schedule schedule price price"'), 'Broken 12-track grid must not return');
assert(mobile.includes('function arrangeMemberHomeLayout(hub)') && mobile.includes('function restoreMemberHomeLayout(hub)'), 'Member layout must mount and unmount across role changes');
assert(mobile.includes('function ensureMemberHowtoBanner(){') &&
       mobile.includes('ensureMemberHowtoBanner();bindMemberDocumentation();') &&
       mobile.includes('picture.src="/assets/bank-sampah-alur-penimbangan-1600x500.png"') &&
       mobile.includes('picture.loading="lazy";picture.decoding="async";'),
 'Member-specific bottom banner must load its own permanent asset');
assert(css.includes('"banner banner"') &&
       css.includes('"banner banner banner"') &&
       css.includes('grid-area:banner;display:block') &&
       css.includes('aspect-ratio:16/5;object-fit:contain'),
 'Full-width banner is the final card on both desktop and phone without cropping');

assert(mobile.includes('quick.replaceChildren(...[weighing,price].filter(Boolean))'), 'Schedule and tariff must remain real functional nodes');
assert(css.includes('grid-area:progress') && css.includes('grid-area:guide') &&
       css.includes('grid-area:recent') && css.includes('grid-area:info') &&
       css.includes('height:100%;align-self:stretch'),
 'Desktop grid must place mutasi beside progress, guide beside information');
assert(css.includes('"quick quick info"') &&
       css.includes('"progress progress progress"') &&
       css.includes('"recent recent recent"') &&
       css.includes('"guide guide guide"'),
 'Member mobile card order must remain unchanged');
assert(memberPolish.includes('@media(min-width:1024px){') &&
       memberPolish.includes('min-height:86px') &&
       memberPolish.includes('padding:11px 16px'),
 'Instruction card must be shortened exclusively for desktop');
assert(mobile.includes('flow.hidden=false;flow.open=true;') &&
       memberPolish.includes('grid-template-columns:repeat(4,minmax(0,1fr))') &&
       memberPolish.includes('.f4-member-flow-steps p,'),
 'Deposit guide stays expanded, with four compact side-by-side SVG steps');
assert(mobile.includes('function openWeighingSchedule()') &&
       mobile.includes('card.setAttribute("aria-label","Lihat jadwal penimbangan")') &&
       mobile.includes('dialog.showModal()'),
 'Schedule card must open an accessible native dialog');
assert(priceModule.includes('page=el("dialog","f4-bank-prices-screen f4-bank-sheet-modal")') &&
       priceModule.includes('if(!page.open)page.showModal();') &&
       priceModule.includes('/api/member/bank/prices'),
 'Price card must open a clean dialog and preserve the real member price API');
assert(memberNav.includes('#f4MemberInfoShortcut.f4-member-info-shortcut') &&
       memberNav.includes('.f4-member-info-copy strong') &&
       mobile.includes('link.onclick=()=>navigate("bank-member-info")'),
 'Informasi dan Laporan needs its own functional shortcut in the right column');
assert(mobile.includes('identity.replaceChildren(el("strong","","Halo, "+name)') &&
       !mobile.includes('brand.id="f4BankMemberTopBrand"') &&
       bankingCss.includes('>.f4-bank-app-personal-greeting{display:none}'),
 'Member greeting must be the only mobile header identity, without a redundant logo/title');
const personalPreview=mobile.split('function progressPreview(){')[1]?.split('function infoShortcut(){')[0];
assert(personalPreview &&
       personalPreview.includes('Perkembangan Saya') &&
       personalPreview.includes('function drawMemberHomeChart(){') &&
       personalPreview.includes('const deposits=memberBuckets().filter') &&
       personalPreview.includes('chart.setAttribute("role","img")') &&
       memberNav.includes('.f4-member-progress-fill{'),
 'Member home must show an accessible deposit-weight chart using the private account statement');
assert(css.includes('grid-area:recent;box-sizing:border-box;min-width:0;width:100%;height:100%') &&
       css.includes('"progress recent"') && css.includes('"guide info"'),
 'Mutations and progress must share the desktop upper row; instruction and report share the lower row');
for(const step of [2,3,4]){
 assert(memberPolish.includes('.f4-member-flow-steps>li:nth-child('+step+')'),
 'Missing distinct pastel styling for instruction '+step);
}
assert(memberPolish.includes('background:var(--step-bg)') &&
       memberPolish.includes('background:var(--step-icon);color:var(--step-ink)'),
 'Pastel instruction tiles and SVG symbols must use the same scoped color variables');
assert(memberPolish.includes('.f4-member-flow-share>span:nth-child(2)'),
 'Savings and environment split badges must have differentiated color');
assert(!mobile.includes('brand.id="f4BankMemberTopBrand"') &&
       mobile.includes('$("f4BankMemberTopBrand")?.remove();') &&
       memberNav.includes('height:68px;min-height:68px') &&
       memberNav.includes('width:226px;height:100dvh') &&
       memberNav.includes('background:#e8f4ea;color:#145d3b'),
 'Mobile header must remove duplicate branding, keep one line, and preserve portal-style desktop sidebar');
assert(!mobile.includes('f4MemberImpactShare') &&
       !memberNav.includes('.f4-member-impact-share>span:nth-child(2)') &&
       memberPolish.includes('.f4-member-flow-foot{display:none'),
 'Home progress must not duplicate profit-share badges or activity content');
assert(memberLegacyTheme.includes('body.f4-direct-bank #dashboardView .section>.card:not(#pageDashboard){') &&
       memberLegacyTheme.includes('body.f4-direct-bank:not(.f4-bank-app-member) #dashboardView .section{'),
 'The legacy forced frame and padding must not apply to the member dashboard');
assert(memberDirectShell.includes('body.f4-direct-bank.f4-bank-app-member #f4-direct-bar{left:226px}') &&
       memberNav.includes('padding:0 clamp(15px,2vw,29px);gap:10px'),
 'Navbar must not add a second 244px sidebar offset');
assert(memberNav.includes('border-right:1px solid #e6eae8') &&
       memberNav.includes('border-radius:0;background:#fff;box-shadow:none;transform:none;visibility:visible') &&
       memberNav.includes('font:700 13.5px/1.3'),
 'White sidebar should use readable portal-sized dark text');
assert(bankingCss.includes('background:#fff;\n min-height:calc(100dvh - 56px)') &&
       memberNav.includes('body.f4-bank-app-member{background:#fff}') &&
       memberNav.includes('background:#fff;color:#1b5138;box-shadow:0 5px 16px'),
 'Member dashboard and its report surface need a pure white canvas');
assert(h.includes('body.f4-bank-app-member #dashboardView #pageDashboard:not(:has(#f4BankAppHome[data-bank-role="member"]))'),
 'Legacy dashboard must not flash before member widgets are mounted');
assert(css.includes('color:#fff;opacity:.95;transform:none') &&
       !css.includes('color:#fff;opacity:.93;transform:rotate(90deg)'),
 'ATM NFC/contactless must face to the right, not downward');
assert(css.includes('body.f4-bank-app-member #dashboardView #pageDashboard{') &&
       css.includes('margin:0;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none'),
 'Remove the enclosing dashboard frame entirely');
assert(!mobile.includes('f4MemberEnvironmentStats') &&
       !mobile.includes('source.get("berat sah")') &&
       !(mobile.split('/* Mini ringkasan PC')[0]||'').includes('api("/api/v2/public/bank/report")'),
 'Private progress chart must not reuse report-wide weights or sale totals; public mini is separate');
assert(personalPreview.includes('["month","Per bulan"]') &&
       personalPreview.includes('["year","Per tahun"]') &&
       personalPreview.includes('Array.from({length:monthly?6:5}') &&
       personalPreview.includes('!item.missingWeight')===false &&
       personalPreview.includes('if(item.missingWeight){unmeasured++;continue;}'),
 'Home progress must group actual authenticated deposits by month or year and handle unknown weights');
assert(mobile.includes('if(!received||!expected||expected==="Administrator"||received!==expected)return;') &&
       mobile.includes('updateCardNumber();updateDashboard();syncSavings();progressPreview();') &&
       mobile.includes('memberStatement=null;adminOverview=null;'),
 'Member progress must reject stale account statements and reset during account changes');
assert(css.includes('background:#e2f4df;color:#167244') &&
       css.includes('.f4-bank-weigh-icon svg,.f4-bank-price-shortcut-icon svg'),
 'Schedule and price should use matched green icon tokens and true SVGs');
assert(!css.includes('background:linear-gradient(135deg,#09BCD3 0%,#009788 100%)') &&
       css.includes('#dashboardView #pageProfile .f4-bank-profile-detail>.f4-bank-profile-card{') &&
       css.includes('#dashboardView #pageProfile .f4-bank-profile-detail>.f4-bank-profile-card::before') &&
       css.includes('#dashboardView #pageProfile .f4-bank-profile-detail>.f4-bank-profile-card::after'),
 'Profile ATM must inherit the single dashboard gradient, size and both decorative layers');
assert(mobile.includes('const contactless=el("span","f4-bank-atm-contactless")'), 'ATM contactless graphic must use SVG');
assert(mobile.includes('const copy=el("div","f4-bank-member-card f4-bank-profile-card")') &&
       mobile.includes('for(const node of card.childNodes)copy.append(node.cloneNode(true))'),
 'Profile card should clone member ATM content without being a second clickable button');
assert(memberNav.includes('--member-nav-accent:#43a047') &&
       memberNav.includes('--member-nav-accent:#009688') &&
       memberNav.includes('--member-nav-accent:#b98b00') &&
       memberNav.includes('--member-nav-accent:#00a9bf') &&
       memberNav.includes('--member-nav-accent:#7aa938'),
 'Member SVG navigation icon colors must use the selected palette while maintaining dark readable labels');
assert(css.includes('--profile-yellow:#ffc411;--profile-lime:#8bc34a;--profile-leaf:#43a047;') &&
       css.includes('--profile-teal:#009688;--profile-cyan:#00bcd4;') &&
       css.includes('grid-template-columns:minmax(0,1fr) minmax(0,1fr)'),
 'Profile uses the supplied five-color palette and responsive financial-app composition');
assert(css.includes('body :is(button,a,summary,[role="button"],[role="tab"],label[for]){') &&
       css.includes('-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;') &&
       !css.includes('body *{user-select:none'),
 'Interactive controls suppress selection flash while ordinary reports remain selectable');
assert(mobile.includes('number.id="f4BankCardNumber"') && mobile.includes('person.querySelector("strong").id="f4BankCardName"'), 'ATM number and member name must remain bound to the real account');
assert(mobile.includes('if(personName)personName.id="f4BankProfileName"'), 'Profile clone must not duplicate member name DOM IDs');
assert(css.includes('f4-bank-atm-center') && css.includes('f4-bank-atm-contactless'), 'ATM must contain shared chip and contactless design');
assert(!mobile.includes('hero.append(card,balance)'), 'ATM and balance must not be put back inside a hero frame');
assert(mobile.includes('hub.append(card,balance)'), 'Real ATM and balance must be siblings in the dashboard');
assert(!css.includes('border-radius:14px;background:#09bcd3'),'Legacy cyan schedule icon must not return');
assert(!css.includes('border-left:3px solid #087850'),'Old hard corner stripe returned');
assert(!css.includes('background:linear-gradient(125deg,#328d45,#43a047 55%,#009788)'),'Member green-teal gradient returned');
assert(css.includes('--eco-gold:#fdc010'),'Current golden yellow theme token missing');
assert(publicTheme.includes('background:#43a047;color:#fff'),'Public hero must use saturated green with white text');
assert(h.includes('<section id="v17Program" class="f4-bank-program"'), 'Program must be a separate semantic section');
assert(h.includes('#v17Program .f4-bank-program-step{'), 'Canonical unboxed program steps missing');
assert(!h.includes('v27-banner-program'), 'Obsolete program banner layout must be removed');
assert(!h.includes('v27CompactProgram'), 'Obsolete program DOM reparenting must be removed');
assert(h.includes('border:0}').valueOf() || h.includes('background:transparent;border:0'), 'Public program must not use cards');
assert(publicTheme.includes('border:0;border-radius:12px;background:#fdc010;color:#25412d'),'Borderless golden hero action missing');
assert(!publicTheme.includes('!important'),'Public hero stylesheet may not use priority overrides');
assert(h.includes('#f4-public-my-savings{display:inline-flex') &&
       h.includes('@media(max-width:700px){#f4-public-my-savings{width:100%;max-width:none;min-height:44px') &&
       h.includes("getElementById('f4-public-my-savings')"),
 'Responsive member CTA missing');
assert(publicTheme.includes('#v11Public .v17-public-main>.v17-public-banner :is(h1,h2,h3){'),'Public hero must own its readable heading');
assert(publicTheme.includes('color:#fff'),'Public hero white foreground missing');
assert(!h.includes('.stats .stat:last-child{grid-column:1/-1}'),'Wide last savings card regression');
const reportRule=h.match(/#v11Public #v25ReportMetrics\.v26-compact>\.v17-public-metric\{([^}]+)\}/);
assert(reportRule,'Public mobile report source missing');
assert(css.includes('background:#fff!important;border:1px solid #d8e5dc!important'),'Public report cards must stay white');
assert(css.includes('#dashboardView #pagePribadi #v12Private>.stats>.stat:last-child'),'Last card sizing not fixed');
assert(h.includes('aria-label="Muat ulang data tabungan"'),'Icon-only reload changed');
assert(h.includes('function bankMenuClose()'),'Drawer logic changed');
assert(dashboard.includes('.f4-eco-kpi'),'Dashboard design missing');
assert(!dashboard.includes('!important'),'Dashboard legacy sheet must not contain any priority declarations');
assert(!dashboard.includes('f4-member-recent'),'Dashboard legacy sheet must not own member mutation rows');
assert(h.includes("const recent=(Array.isArray(d.mutasi)?d.mutasi:[])"),'Dashboard mutasi must read authoritative financial ledger, not deposits');
const memberRecentPreview=h.split("const recent=(Array.isArray(d.mutasi)?d.mutasi:[])")[1]?.split("const recentBox=$('v14Recent')")[0]||"";
assert(memberRecentPreview.includes('.sort(') && memberRecentPreview.includes('.slice(0,3)'),
 'Home mutasi must remain limited to the latest three true ledger movements');
assert(mobile.includes('let memberBalancePrivacy={hidden:true}') &&
       mobile.includes('memberBalancePrivacy.hidden=!memberBalancePrivacy.hidden;updateDashboard();') &&
       mobile.includes('memberBalancePrivacy.hidden?"••••••":realAmount') &&
       mobile.includes('balanceLink.onclick=()=>navigate("pribadi")') &&
       mobile.includes('resetMemberPublicMini();memberBalancePrivacy.hidden=true;'),
 'Saldo hide and unhide must not navigate or overwrite the actual live balance');
assert(css.includes('width:clamp(58px,17vw,68px);height:clamp(58px,17vw,68px)') &&
       css.includes('border:3px solid #fff;border-radius:50%') &&
       css.includes('.f4-bank-balance-head{'),
 'Payout must be round with a white outline and the balance has a separate eye');
assert(memberNav.includes('margin:0 0 0 226px;padding:10px clamp(20px,2.5vw,32px) 50px;') &&
       !mobile.includes('savings.onclick=event=>') &&
       css.includes('color:var(--member-ink);cursor:default') &&
       css.includes('border:0;border-radius:0;background:transparent;') &&
       css.includes('box-shadow:0 6px 15px #856b2433;'),
 'Desktop top gap must be compact; eye is plain and no whole-card click or gray badge ring');
assert(memberNav.includes('margin-inline:auto;padding:14px 15px 10px;background:#fff') &&
       css.includes('padding-bottom:calc(var(--f4-bank-dock-height) + 8px)'),
 'Only one bottom-dock clearance should remain on mobile');
assert(css.includes('max-height:184px;overflow-y:auto;overflow-x:hidden'),
 'PC member mutasi must not grow beyond its dashboard card');
assert(mobile.includes('function loadMemberPublicMini(force=false)') &&
       mobile.includes('api("/api/v2/public/bank/report")') &&
       mobile.includes('const report=response?.ringkasan||response?.summary;') &&
       mobile.includes('resetAdminAlerts();resetMemberPublicMini();'),
 'Mini summary must use authenticated D1 public report and reset on account change');
assert(memberNav.includes('#dashboardView #f4MemberPublicMini{display:none}') &&
       memberNav.includes('@media(min-width:1024px){') &&
       memberNav.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),
 'Public mini summary must be restricted to desktop without affecting HP');
assert(h.includes("const isDebit=amountOut>0"),'Ledger must include posted withdrawals and credits');
assert(h.includes("isDebit?'− ':'+ '"),'Ledger amounts must show correct debit and credit signs');
assert(!h.includes("const recent=active.slice().sort((a,b)=>String(b.tanggal"),'Deposit-only dashboard mutation logic must not return');
assert(h.includes("document.createElementNS('http://www.w3.org/2000/svg','svg')"),'Mutation icons must be SVG');
assert(css.includes('border:0;border-bottom:1px solid #edf3ed'), 'Mutation rows must not have separate cards');
assert(!css.includes('"card card card card card card card card schedule schedule price price"'),'Broken legacy member grid returned');
// Prevent the old compact/underlined dock from reappearing.
const dockSection=css.split('/* Navigasi bawah tunggal:')[1]?.split('body.f4-bank-drawer-open')[0];
assert(dockSection,'Canonical mobile dock section missing');
assert(!dockSection.includes('!important'),'Dock uses priority overrides');
assert(css.includes('body.f4-bank-app-private{--f4-bank-dock-height:64px}'),'Shared bank dock dimension missing');
assert(css.includes('height:var(--f4-bank-dock-height)'),'Dock must use shared height token');
assert(css.includes('padding-bottom:calc(var(--f4-bank-dock-height) + 8px)'),'Page must reserve same compact dock height');
assert(dockSection.includes('grid-template-rows:27px 15px'),'Icon-label spacing must stay compact');
assert(!dockSection.includes('safe-area-inset-bottom'),'Old double safe-area padding must not return');
assert((css.match(/\.f4-bank-app-dock-action\{/g)||[]).length===1,'Duplicated dock action rule');
assert((css.match(/\.f4-bank-app-dock:not\(\[hidden\]\)\{/g)||[]).length===1,'Duplicated dock container rule');
assert(!css.includes('tinggi 62px'),'Old compact dock returned');
assert(!css.includes('border-bottom:2px solid #087850'),'Underline-only tab returned');
assert(!css.includes('@media print'),'Theme must not alter PDFs');
// Public progress is weight-only until authentication; financial value stays private.
assert((h.match(/id="f4DevChart"/g)||[]).length===1,'Public progress chart must be unique');
assert(!h.includes('id="v17ValueBars"'),'Legacy value chart must not return');
assert(h.includes('body.f4-embedded-bank:not(.f4-bank-app-member) #dashboardView .section{padding-top:64px!important}'), 'The old 64px embedded clearance must explicitly exclude member dashboard cards');
assert(!h.includes('body.f4-embedded-bank #dashboardView .section{padding-top:64px!important}'), 'Member PC must never inherit the forced 64px top padding');
assert(h.includes('data-dev-mode="berat" aria-pressed="true"'),'Public weight mode missing');
assert(h.includes('data-dev-mode="nilai" aria-pressed="false" class="hidden" hidden'),
 'Financial value tab must stay hidden for guests');
assert(h.includes('id="v17Transparansi" class="v17-section hidden" hidden'),
 'Public financial transparency section must remain hidden');
assert(h.includes('f4-savings-roster f4-savings-members'),'Member roster must be frameless');
assert(h.includes("roster.className='f4-saldo-list'"),'Inline roster missing');
assert(h.includes("querySelectorAll('.f4-saldo-row')"),'Roster search must target row list');
assert(!h.includes('gulir daftar untuk melihat semuanya'),'Nested scroll instruction returned');
const modern=fs.readFileSync('portal-live/modern-portals.css','utf8');
assert(!modern.includes('#v9List{max-height:390px'),'Old capped roster in shared CSS returned');
assert(!h.includes('max-height:310px!important;overflow-y:auto!important'),'Old roster scrolling returned');
// Mobile Bank Sampah controls must not regress into the three bugs in the 31 Oct report.
assert(!dockSection.includes('transform:translateY(-8px)'),'Center caption must not overlap gold action');
assert(dockSection.includes('.f4-bank-app-dock-action.is-primary') &&
       dockSection.includes('position:absolute;left:50%;bottom:9px') &&
       dockSection.includes('border:3px solid #fff;border-radius:50%') &&
       dockSection.includes('background:#ffc719') &&
       !dockSection.includes('0 0 0 1px #d9e4d9') &&
       !dockSection.includes('.f4-bank-app-dock-action.is-primary .f4-bank-app-action-name{') &&
       mobile.includes('if(!isMemberPayout)b.append(el("span","f4-bank-app-action-name",title))') &&
       dockSection.includes('.f4-bank-payout-rp-icon text{'),
 'Only the centered yellow Rp badge rises; Pencairan remains accessible without a visible text label');
assert(mobile.includes('svg.innerHTML=\'<text x="36" y="45" text-anchor="middle">Rp</text>\''),
 'Original white Rp wordmark must be restored as SVG, not a stylized line icon');
// Admin HP retains shortcut actions; desktop manager uses a compact direct sidebar.
const adminMobile=css.split('/* Pengelola HP: menu slide untuk Keuangan dan Pengelolaan;')[1]
  ?.split('@media screen and (max-width:760px)')[0];
assert(adminMobile,'Admin mobile navigation owner missing');
assert(adminMobile.includes('html body.f4-bank-app-admin.v17-dashboard #sideNav.side.open') &&
       adminMobile.includes('transform:translateX(0);visibility:visible;pointer-events:auto'),
 'Admin mobile slide drawer must open, not remain forcibly hidden');
assert(adminMobile.includes('html body.f4-bank-app-admin #v16Backdrop.open'),
 'Admin slide backdrop must open with the drawer');
assert(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'Admin shortcuts must be four equal columns');
assert(mobile.includes('adminShortcuts.filter(([,route])=>route!=="bank-admin-docs").map(adminShortcut)'),
 'HP Akses Cepat must show eight buttons without Dokumentasi');
assert(mobile.includes('["Dokumentasi","bank-admin-docs","images"]') &&
       css.includes('>.f4-bank-desktop-nav-link:not([data-bank-app-route="bank-admin-docs"]){'),
 'Dokumentasi must remain accessible through hamburger HP and sidebar PC');
assert(mobile.includes('dock().hidden=!isPrivate;'),'Admin dock must be visible when authenticated');
assert(mobile.includes('function syncAdminBack()'),'Manager screens need a back control');
assert(mobile.includes('const adminDock=['),'Manager dock must have its own distinct five-item route list');
assert(mobile.includes('isAdminReport=dock&&route==="laporan"'),
 'Manager dock central gold action must open Laporan, not Setoran');
assert(h.includes("const v16AdminSidebar=new Set(['home','deposit','sale']);") &&
       mobile.includes('function ensureDesktopAdminSidebar()') &&
       mobile.includes('anchor.after(items);') &&
       css.includes('>.v16-item:is([data-group="deposit"],[data-group="sale"]){') &&
       css.includes('#f4BankAppHome[data-bank-role="admin"]>#f4BankAdminShortcuts{\n  display:none'),
 'Desktop manager sidebar must own quick routes, excluding Setoran and Penjualan');
assert(!css.includes('v16-mobile-extra')&&!h.includes('v16-mobile-extra'),
 'Duplicated tab submenus must not return to the admin sidebar');
assert(!h.includes('const extras=['),
 'Admin drawer must not dynamically inject tab links');
// Admin routes are checked against the new six-category map below.
assert(h.includes("window.f4OpenBankProfile=openOriginalProfile;"),
 'Profile must stay available from the account icon');
assert(h.includes('html.f4-bank-embedded body.v17-dashboard:not(.f4-bank-app-admin) #sideNav.side'),
 'Embedded old drawer must exclude the admin role');
const reportStyle=h.split('<style>')[1]?.split('</style>')[0];
const compactOwner=h.split('<style id="f4-bank-admin-report-compact-20261027">')[1]?.split('</style>')[0];
assert(reportStyle && reportStyle.includes('grid-template-columns:repeat(3,minmax(0,165px))'),
 'Private report KPI cards must keep equal compact columns');
assert(reportStyle.includes('min-height:49px') && reportStyle.includes('gap:6px;margin:8px 0 10px'),
 'Private report cards must stay compact across viewports');
assert(compactOwner && !compactOwner.includes('#v25ReportMetrics.v26-compact'),
 'Mobile report CSS duplicated instead of sharing the canonical report styling');
assert(!h.includes('<style id="f4-bank-mobile-3view-fix-20261028">'),
 'Old separate mobile override owner returned');
assert(!h.includes('min-height:95px!important'),'Old oversized report KPI rule returned');
assert(!h.includes("Ringkasan hasil penjualan dan manfaat untuk warga serta lingkungan, berdasarkan pembukuan yang sudah disahkan."),
 'Verbose report introduction returned');
assert(!h.includes("Nilai sah berasal dari penjualan yang disahkan. Perkiraan menunggu disajikan terpisah dan tidak menambah saldo."),
 'Verbose approval note returned');
assert(!h.includes("data.catatan+' Data pribadi warga tidak ditampilkan.'"),
 'Duplicated report footnote returned');
for(const label of ['Berat sampah terjual','Setoran terkonfirmasi','Anggota aktif','Jenis sampah diterima','Kegiatan terpublikasi']){
 assert(h.includes("v17PublicStat('"+label+"'"),'Public safe metric missing: '+label);
}
assert(h.includes('<svg xmlns="http://www.w3.org/2000/svg"') && h.includes('Saldo dan riwayat pribadi tersedia setelah login.'),
 'Guest message must explain private financial records');
assert(h.includes("const print=v21Node('button','secondary','PDF')"),'PDF button label not compact');
assert(h.includes("const csv=v21Node('button','secondary','CSV')"),'CSV button label not compact');
assert(!h.includes("const print=v21Node('button','secondary','Cetak / PDF')"),'Old public PDF label returned');
assert(!h.includes("const csv=v21Node('button','secondary','Unduh CSV')"),'Old public CSV label returned');

// Member account accordions must have one canonical right chevron, not a native
// triangle on the left for password and a custom icon on the right for photo.
const summarySelector='#dashboardView #pageProfile :is(#v15PhotoPanel,#v15PasswordBox)>summary';
assert(css.includes(summarySelector+'{'),'Both profile summaries must share one CSS rule');
assert(css.includes(summarySelector+'::-webkit-details-marker{display:none}'),'Native Safari triangle must be hidden');
assert(css.includes(summarySelector+'::marker{content:\'\'}'),'Native details marker must be removed');
assert(css.includes(summarySelector+'::after{'),'Right chevron must be shared');
assert(css.includes('#dashboardView #pageProfile :is(#v15PhotoPanel,#v15PasswordBox)[open]>summary::after'),
 'Both accordions must flip their chevron when open');
assert(!css.includes('#dashboardView #pageProfile #v15PasswordBox>summary{'),
 'Obsolete password-specific override returned');
assert(!h.includes('#v15PasswordBox>summary{cursor:pointer'),
 'Old left-side triangle style returned');
assert(h.includes("summary.textContent='Ganti password'"),'Password must have no emoji or separate triangle');
assert(/\/portal-live\/bank-eco-pages\.css\?v=\d{8}-[a-z0-9-]+/.test(h),
 'Bank Sampah profile/dock stylesheet must be versioned');
assert(/\/portal-live\/bank-mobile-app\.js\?v=\d{8}-[a-z0-9-]+/.test(h),
 'Bank Sampah mobile app script must be versioned');
assert(css.includes('.f4-bank-payout-rp-icon{') &&
       mobile.includes('svg.classList.add("f4-bank-payout-rp-icon")'),
 'Payout icon must be true Rp SVG, not a generic wallet or text glyph');
assert(h.includes('id="f4BankPageGreeting"'), 'Manager greeting must be scopeable to the home route');
assert(mobile.includes('greeting.hidden=roleType()!=="admin"||screen!=="dashboard"'),
 'Manager greeting may only display on Admin Beranda, not after an account switch');
assert(!mobile.includes('Beranda Pengelola') && !mobile.includes('Mulai pencatatan dan periksa pekerjaan Bank Sampah'),
 'Duplicate manager homepage title/intro returned');
assert(h.includes("if(/admin/i.test(String(profile?.peran||''))){") &&
       h.includes("tabs.classList.add('hidden');return;"),
 'Manager routes must not duplicate direct sidebar entries as category tabs');
assert(!h.includes('Album foto dan video kegiatan Bank Sampah Flamboyan 4'),
 'Redundant documentation subtitle returned');
assert(css.includes('.f4-compact-sale-row>input{grid-column:span 3}') &&
       css.includes('.f4-compact-sale-row>.f4-compact-entry-group{grid-column:span 4}'),
 'Sale price input must be allocated more width than the weight input');

// Bank Sampah: shared form grid is owned by bank-eco-pages.css, not desktop overrides.
assert(css.includes('grid-template-columns:repeat(12,minmax(0,1fr))'),
 'Shared twelve-track Bank Sampah entry grid missing');
assert(css.includes('#dashboardView .section :is(#saleForm,#setoranForm)>.f4-entry-right{') &&
       h.includes('class="f4-entry-right"') &&
       h.includes('class="f4-sale-side"') &&
       h.includes('class="f4-sale-payment-fields"'),
 'Sale payment must remain inside its independent desktop panel');
assert(css.includes('#saleForm .f4-sale-top-fields>.field{'),
 'Sale three-field row must keep its explicit column spans');
assert(!css.includes('body.f4-bank-app-private #dashboardView #pageSetoran .f4-entry-top-fields,'),
 'Legacy desktop grid override was reintroduced');
assert(/\/portal-live\/bank-eco-pages\.css\?v=\d{8}-[a-z0-9-]+/.test(h),
 'Bank entry stylesheet requires a current version key');
const modernCss=fs.readFileSync('portal-live/modern-portals.css','utf8');
assert(!modernCss.includes('max-width:850px!important') &&
       css.includes('#saleForm .f4-sale-note-fields{'),
 'Bank goods must fill the full grid and sale notes must have a single canonical owner');
assert(!h.includes('.f4-sale-note-fields{display:grid;'),
 'Retired inline sale notes grid returned to Bank HTML');
assert(!modernCss.includes('#setoranForm')&&!modernCss.includes('#saleForm'),
 'Legacy forced Setoran/Penjualan CSS must not return to modern-portals.css');
assert(h.includes("amountGroup.append(weight,remove)") &&
       h.includes("priceGroup.append(price,remove)"),
 'Deposit/sale row delete action must share its grid cell with the amount input');
assert(css.includes('.f4-compact-sale-row>select{grid-column:span 5}') &&
       css.includes('.f4-compact-sale-row>input{grid-column:span 3}') &&
       css.includes('.f4-compact-sale-row>.f4-compact-entry-group{grid-column:span 4}'),
 'Sale goods grid must use 5-3-4 tracks so price is wider than weight');
assert(css.includes('max-height:var(--bank-input-h);padding-block:0;align-self:start'),
 'Setoran and Penjualan native inputs must have a fixed, equal control height');
assert(css.includes('align-content:start;gap:6px;min-width:0;margin:0') &&
       css.includes('body.f4-bank-app-admin #dashboardView .section #saleForm .f4-sale-top-fields{\n column-gap:16px;row-gap:var(--bank-form-gap)'),
 'Sale field spacing must not inherit legacy bottom margins');
assert(css.includes('#saleForm .f4-sale-note-fields>.field>label{') &&
       css.includes('#saleForm .f4-sale-note-fields>.field>input{'),
 'Sale proof and reason labels/inputs must share one owner');
assert(h.includes("wrap.className='field f4-field-stack'"),
 'Dynamically created sale reason must use the same field structure');
// The Warga picker is an enhanced button, not the hidden #setWarga <select>.
const pickerOwner=h.match(/<style id="f4-bank-member-search-style">([\s\S]*?)<\/style>/)?.[1]||'';
assert(pickerOwner.includes('.f4-warga-picker-open{box-sizing:border-box;') &&
       pickerOwner.includes('height:42px;min-height:42px;max-height:42px;') &&
       pickerOwner.includes('padding:0 13px!important;'),
 'The visible warga picker must match the adjacent 42px date control');
assert(!pickerOwner.includes('min-height:47px'),'Old 47px warga picker returned');
assert(h.includes("trigger.className='f4-warga-picker-open'"),
 'Warga picker button must remain wired to searchable warga selection');
// Six operational menu categories; no orphaned finance, inventory, history, or approval routes.
const navSource=h.match(/const v16Groups=\[([\s\S]*?)\];/)?.[1]||'';
const adminGroups=[...navSource.matchAll(/\{id:'([^']+)',label:'([^']+)',icon:'[^']+',admin:true/g)]
 .map(x=>x[1]);
assert.deepEqual(adminGroups,['home','deposit','sale','finance','management','report'],
 'Admin sidebar must contain six operational categories');
for(const route of ['setoran','bank-admin-history','penjualan','bank-admin-sale-history',
 'rekonsiliasi','bank-admin-cash','tabungan','bank-payout-admin',
 'admin','master','bank-admin-docs','laporan','bank-admin-progress']){
 assert(navSource.includes("['"+route+"',"),
  'Operational route is inaccessible: '+route);
}
assert(h.includes('window.v16Sync=v16Sync;') &&
       h.includes('window.v17LoadPublic=v17LoadPublic;') &&
       !navSource.includes("['biaya','Pengeluaran']") &&
       !navSource.includes("['profile','Profil pengurus']"),
 'Expense must be within Debit/Kredit, and profile through the account icon');
assert(mobile.includes('function showAdminProgress()') &&
       mobile.includes('function restoreAdminProgress()') &&
       mobile.includes('showAdminHistory(saleHistory?"penjualan":"setoran")'),
 'Separate sale history or safe progress lifecycle is missing');
assert(mobile.includes('f4BankAdminOperations') &&
       mobile.includes('adminShortcuts.filter(([,route])=>route!=="bank-admin-docs").map(adminShortcut)') &&
       mobile.includes('Catat Setoran') &&
       mobile.includes('Catat Penjualan'),
 'Task-first entry and eight mobile shortcuts are missing');
assert(mobile.includes('["Saldo Warga","tabungan","coins"]') &&
       !mobile.includes('["Profil","profile","user-round"]'),
 'Saldo Warga must replace the redundant profile quick access');
assert(mobile.includes('ensureCashExpenseForm()') &&
       mobile.includes('adminCashTab==="out"') &&
       h.includes("new CustomEvent('f4-bank-expense-saved'"),
 'Expense form and ledger must share the Pengeluaran tab and refresh after saving');
assert(css.includes('.f4-bank-cash-expense-section[hidden]{display:none}') &&
       css.includes('.f4-bank-price-shortcut-copy{'),
 'Embedded expense and prominent member price action style owners missing');
assert(css.includes('grid-area:actions') &&
       !css.includes('grid-area:next') &&
       css.includes('grid-area:recent'),
 'Operational dashboard grid contains duplicate/empty follow-up card');
assert(css.includes('#v16Tabs.v16-tabs:not(.hidden)') &&
       mobile.includes('tabs.hidden=false') &&
       mobile.includes('for(const [key,,panel] of options)panel?.classList.toggle("hidden",key!==selected);'),
 'Useful tabs must remain for Riwayat and Debit/Kredit on mobile');
assert(mobile.includes('const unframed=admin&&page.parentElement===section;'),
 'Admin page outer frames must be removed on PC as well as HP');
assert(!mobile.includes('const unframed=mobile&&page.parentElement===section;'),
 'Mobile-only outer frame removal regressed');
assert(h.includes('class="f4-sale-payment-fields"') &&
       h.indexOf('id="saleReceived"') < h.indexOf('id="saleStatus"') &&
       css.includes('#saleForm .f4-sale-payment-fields{') &&
       css.includes('grid-template-columns:repeat(2,minmax(0,1fr));') &&
       css.includes('#dashboardView .section :is(#saleForm,#setoranForm){'),
 'Desktop Sale and Setoran must use equal columns with amount before payment status');
assert(!css.includes('#dashboardView .section>.card:not(#pageDashboard,#pageProfile)'),
 'Old desktop outside card owner returned');
assert(css.includes('grid-template-rows:18px 42px auto;align-content:start;') &&
       css.includes('.f4-bank-own-field input{'),
 'Own-deposit date and amount must share fixed label/control baselines');
// Primary work cards must carry real icons, labels and action affordances.
assert(mobile.includes('f4-bank-admin-operation-icon') &&
       mobile.includes('f4-bank-admin-operation-copy') &&
       mobile.includes('f4-bank-admin-operation-arrow'),
 'Admin primary task cards must include icon, copy and directional affordance');
assert(css.includes('#f4BankAdminOperations .f4-bank-admin-operation-copy strong{') &&
       css.includes('grid-template-columns:48px minmax(0,1fr) 28px;'),
 'Admin primary task cards no longer use the canonical focal layout');
assert(css.includes('#dashboardView .section :is(#saleForm,#setoranForm)>.f4-entry-right{') &&
       h.includes('class="f4-setoran-side"') &&
       h.includes('class="f4-sale-main"') &&
       h.includes('class="f4-sale-side"') &&
       css.includes('grid-column:1;grid-row:1;align-self:start') &&
       !css.includes('grid-row:1 / span 2;align-self:start'),
 'PC Sale and Setoran entry panels must remain independent of right-side controls');
/* Catch malformed inline CSS or JavaScript introduced by stylesheet consolidation.
   Inspect ALL styles and scripts actually referenced by the Bank Sampah entrypoint. */
function assertBalancedCss(text,label){
 let depth=0,quote='',comment=false;
 for(let i=0;i<text.length;i++){
  const c=text[i],next=text[i+1];
  if(comment){if(c==='*'&&next==='/'){comment=false;i++;}continue;}
  if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote='';continue;}
  if(c==='/'&&next==='*'){comment=true;i++;continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='{')depth++;
  if(c==='}'&&--depth<0)throw Error('Extra CSS closing brace: '+label);
 }
 if(depth!==0||quote||comment)throw Error('Unbalanced CSS source '+label+': depth='+depth);
}
const styles=[...h.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
styles.forEach((m,i)=>assertBalancedCss(m[1],'bank-sampah:inline-style-'+(i+1)));
const linkedCss=[...new Set([...h.matchAll(/href=["'](\/portal-live\/[^"'?]+\.css)(?:\?[^"']*)?["']/g)].map(m=>m[1]))];
for(const href of linkedCss){
 const file=href.slice(1);
 assert(fs.existsSync(file),'Bank CSS linked but file missing: '+href);
 assertBalancedCss(fs.readFileSync(file,'utf8'),file);
}
const scripts=[...h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let parsedScriptCount=0;
for(const match of scripts){
 const src=match[1].match(/\bsrc=["'](\/portal-live\/[^"'?]+\.js)(?:\?[^"']*)?["']/);
 if(src){
  const file=src[1].slice(1);
  assert(fs.existsSync(file),'Bank JS linked but file missing: '+file);
  new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
  parsedScriptCount++;
 }else if(!/\bsrc\s*=/.test(match[1])&&match[2].trim()){
  new vm.Script(match[2],{filename:'bank-sampah:inline-script-'+parsedScriptCount});
  parsedScriptCount++;
 }
}
console.log('F4_BANK_ASSET_SYNTAX_AUDIT_OK',styles.length,linkedCss.length,parsedScriptCount);
console.log('F4_BANK_CANONICAL_THEME_OK');
