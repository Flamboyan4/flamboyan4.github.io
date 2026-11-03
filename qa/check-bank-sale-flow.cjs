/* Regression checks for the Bank Sampah simple sale and member-price workflow.
   Static checks only: NEVER create transactions against production. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=path=>fs.readFileSync(path,'utf8');
const worker=read('cloudflare/worker-terpadu-operasional-teruji.js');
const page=read('bank-sampah/index.html');
const sheet=read('portal-live/bank-sale-sheet.js');
const member=read('portal-live/bank-member-prices.js');
const report=read('portal-live/bank-sale-report.js');
new (require('node:vm').Script)(report,{filename:'bank-sale-report.js'});
const mobile=read('portal-live/bank-mobile-app.js');
const bridge=read('portal-live/f4-bank-write-bridge.js');
const css=read('portal-live/bank-eco-pages.css');
for(const path of ['portal-live/bank-sale-sheet.js','portal-live/bank-member-prices.js','portal-live/bank-mobile-app.js','portal-live/f4-bank-write-bridge.js']){
 assert(page.includes('/'+path+'?v='),'Cache-busted active load missing: '+path);
}
assert(worker.includes('bankSaleSheet(request,env,who,url)'),'Sale sheet endpoint missing');
assert(worker.includes("SET status='siap'"),'Sale-sheet lock missing');
assert(worker.includes('saleNumber="BSF4-J-"'),'Sale number prefix missing');
assert(sheet.includes('POST')&&sheet.includes('action:"prepare"'),'Worksheet preparation missing');
assert(sheet.includes('ready:()=>current?.status==="siap"') &&
       page.includes("window.F4SaleSheet?.ready?.()"),
       'A sale must use the prepared and locked worksheet');
assert(sheet.includes('inputs[0].value=""')&&sheet.includes('inputs[1].value=""'),
       'Actual lapak weight/price must be entered by the manager, never prefilled from deposits');
assert(sheet.includes('Cetak Nota Penimbangan'),'Visible print action for the signed weighing note is missing');
assert(sheet.includes('print.className="f4-bank-gold-action"'),'Weighing-note print must be a focal action');
assert(page.includes('1. Cetak nota penimbangan → 2. Catat hasil lapak → 3. Cek & sahkan'),
 'The agreed three-stage sale must be visible to managers');
assert(sheet.includes('lastPrice'),'Last lapak price should be editable suggestion only');
assert(sheet.includes('groupField.after(tools)'),'Note action must appear immediately after sale group selector');
assert(!sheet.includes('parent.after(tools)'),'Sale-sheet must not be inserted as a tiny grid column');
assert(!sheet.includes('tools.hidden=true')&&!sheet.includes('tools.hidden=!batchId'),
 'First-stage print action must never be hidden before sale group selection');
assert(sheet.includes('if(tools)tools.hidden=false'),'Print action must remain visible while changing batches');
assert(sheet.includes('Pilih kelompok setoran terlebih dahulu.')&&sheet.includes('picker?.focus()'),
 'Print action must explain and focus a missing group instead of doing nothing');
assert(sheet.includes('current.status==="siap"?undefined:{action:"prepare"}'),
 'Reprinting the same signed note must not re-prepare stock or create transactions');
assert(css.includes('#pagePenjualan .f4-sale-top-fields>.f4-bank-sheet-tools{'),'Sale-sheet CSS owner must be scoped to form grid');
assert(css.includes('grid-column:1/-1;min-width:0;width:100%'),'Sale-sheet must span the complete grid row');
assert(css.includes('.f4-bank-sheet-tools[hidden]{display:none}'),
 'Shared hidden attribute semantics must remain available elsewhere');
assert(sheet.includes('<div class="sign">'),'The printed field worksheet must include signatures of manager and lapak');
assert(sheet.includes('LEMBAR TIMBANG & JUAL'),'Only the signed weighing and sale worksheet is the paper proof');
assert(!page.includes('F4SaleHandover?.(')&&!page.includes('Cetak Nota Penjualan'),'No secondary sales note or duplicated receipt after weighing');
assert(!page.includes('/portal-live/bank-sale-handover.js?'),'Do not load the redundant second receipt script');
assert(page.includes('/portal-live/bank-sale-report.js?v=') &&
       page.includes('F4SaleReport?.(id)') &&
       report.includes('Arsip laporan digital.') &&
       !report.includes('Diserahkan oleh,'),
       'Printable per-sale detail must be an internal report, never another signed note');
assert(page.includes("v8PendingBatch=batch;goPage('pengesahan')"),'Saved sale must link to approval without new navigation menu');
assert((page.match(/async function submitSale\(e\)/g)||[]).length===1,'There must be exactly one sale-submit handler');
assert(page.includes('statusBayar===\'Belum Bayar\'?\'Belum dibayar oleh lapak\''),'Unpaid sale needs automatic meaningful audit reason');
assert(page.includes('<option value="Belum Bayar">Belum Bayar</option><option value="Lunas">Lunas</option>'),'Unpaid must be the safe initial payment choice');
assert(worker.includes('bankMemberPriceList(db,who)'),'Private citizen price endpoint missing');
assert(worker.includes('citizen_rate_rp_per_kg AS priceRpPerKg'),'Member list should use citizen rates');
assert(!member.includes('reference_price_rp'),'Never show lapak reference price in member catalog');
assert(member.includes('sort((a,b)=>'),'Member price order missing');
assert(mobile.includes('F4MemberPrices?.shortcut(hub)'),'Prices shortcut missing');
assert(worker.includes('bankSalePayment(request,env,who)'),'Draft lapak payment endpoint missing');
assert(page.includes('v7SettleSale(r)'),'Lapak payment from history missing');
assert(worker.includes('Penjualan belum lunas. Catat pelunasan lapak'),'Do not approve unpaid sale');
assert(worker.includes('hasWeightDifference'),'Automatic weighing check missing');
assert(bridge.includes('hasWeightDifference'),'Approval status bridge missing');
assert(page.includes("v8Reason').required=!!p.hasWeightDifference"),'Weighing note should only be required if difference exists');
assert(mobile.includes('f4BankReportRange'),'Custom statement range filter missing');
assert(page.includes("window.f4BankReportRange"),'Printable and CSV statements must respect range');
assert(page.includes("v33ReportCombine"),'Admin combined-month reports must be available in the existing Laporan screen');
const newCss=css.slice(css.indexOf('/* Penjualan kolektif dan katalog harga anggota'));
assert(newCss && !newCss.includes('!important'),'New Bank components must avoid priority overrides');
console.log('BANK_SIMPLE_SALE_AND_MEMBER_STATEMENTS_CHECK_OK');
