'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const worker=fs.readFileSync('cloudflare/worker-terpadu-operasional-teruji.js','utf8');
const page=fs.readFileSync('bank-sampah/index.html','utf8');
const direct=fs.readFileSync('portal-live/direct-shell.js','utf8');
const ui=fs.readFileSync('portal-live/bank-mobile-app.js','utf8');
const bridge=fs.readFileSync('portal-live/f4-bank-write-bridge.js','utf8');
const sheet=fs.readFileSync('portal-live/bank-sale-sheet.js','utf8');
const policy=fs.readFileSync('portal-live/bank-policy-admin.js','utf8');
const superadmin=fs.readFileSync('superadmin/index.html','utf8');
const between=(a,b)=>{const i=worker.indexOf(a),j=worker.indexOf(b,i);assert(i>=0&&j>i,a+' missing');return worker.slice(i,j)};
const own=between('// BANK_V3_OWN_START','// BANK_V3_OWN_END');
assert(!own.includes("INSERT INTO waste_cash_ledger"),'Bank physical inventory must not create cash!');
assert(worker.includes("AS portal_scope") &&
       worker.includes("album:bank:%") && worker.includes("album:api:%"),
       'Bank albums must be scoped in D1 reads without joining Portal Utama albums');
assert(worker.includes("const id='album:bank:'"),
       'New Bank albums require an unambiguous origin ID');
assert(page.includes("const list=albums(r.albums)") &&
       !page.includes("id:'legacy-bank-20261011'"),
       'Album list must use real D1 records, not an unopenable fake album');
assert(direct.includes("accountId:session?.account?.id"),
       'Native login must pass a stable account ID for identity changes');
assert(page.includes("activeAccountKey===nextAccountKey") &&
       page.includes("window.f4BankResetForAccountSwitch?.()"),
       'Same-role account changes must reset Bank account state');
assert(ui.includes("window.f4BankResetForAccountSwitch=") &&
       ui.includes("hub?.remove()"),
       'Member/Admin card DOM must be torn down on every account switch');
for(const term of ['bank_v3_own_events','bank_v3_inventory_lots','status:"stok"',"amountRp:0"]){
 assert(own.includes(term),'Own-bank stock persistence missing '+term)
}
assert(ui.includes('Belum ada pemasukan kas')===false||ui.includes('Belum ada pemasukan kas'));
assert(!ui.includes('id="f4BankOwnAmount"'));
assert(!ui.includes('requestKey:ownRequestKey,depositedOn:date,amountRp'));
// One signed sheet, three stages, no permanent extra inputs for optional leftovers.
assert(sheet.includes('Cetak Nota Penimbangan'));
assert(sheet.includes('groupField.after(tools)'));
assert(!sheet.includes('tools.hidden=!batchId'));
assert(page.includes('1. Cetak nota penimbangan → 2. Catat hasil lapak → 3. Cek & sahkan'));
assert(sheet.includes('LEMBAR TIMBANG & JUAL'));
assert(!page.includes('Cetak Nota Penjualan'));
assert(sheet.includes('document.createElement("details")') && sheet.includes('unsoldWrap.append(unsoldSummary,unsoldLabel)'));
assert(sheet.includes('unsoldInput.dataset.bankUnsold="1"'));
assert(page.includes('data-bank-unsold'));
assert(ui.includes('["Debit/Kredit","bank-admin-cash","wallet"]'));
assert(ui.includes('["Saldo Warga","tabungan","coins"]'));
assert(!ui.includes('["Profil","profile","user-round"]'));
assert(ui.includes('$("f4BankAdminOperations")?.after(shortcuts)'));
assert(ui.includes('dock().hidden=!isPrivate||next==="admin"'));
assert(policy.includes('el("details","f4-bank-policy-card")'));
assert(policy.includes('card.append(head,desc,form,message)'));
const weighing=between('// BANK_WEEKLY_WEIGHING_START','// BANK_WEEKLY_WEIGHING_END');
assert(weighing.includes('requireRole(who,["superadmin"])'),'Only Superadmin may update weighing weekday');
assert(weighing.includes('BANK_WEIGHING_WEEKDAY')&&weighing.includes('INSERT INTO app_settings('));
assert(weighing.includes("'ubah_jadwal_penimbangan'"),'Audit log for weekday changes missing');
assert(!weighing.includes('waste_cash_ledger')&&!weighing.includes('bookkeeping_payments'),
 'Changing weighing day may not touch transactions');
assert(worker.includes('"/api/public/bank/weighing-schedule"')&&
       worker.includes('"/api/superadmin/bank/weighing-schedule"'));
assert(superadmin.includes("['bank_weighing','Jadwal Timbang']")&&
       superadmin.includes("else if(kind==='bank_weighing')bankWeighingPage()"));
assert(ui.includes('loadWeighingDay()')&&ui.includes('function weighingNextDate()')&&ui.includes('day-current.getUTCDay()')&&ui.includes('weighingRule.nextOccurrence'), 'Jadwal mingguan dan pola tambahan harus tetap menghitung penimbangan berikutnya');
assert(ui.includes('function resetRoleSurface()')&&
       ui.includes('for(const id of ["f4BankAdminOperations","f4BankAdminShortcuts","f4BankAdminNext"])'));
assert(ui.includes('function previousBankPage()')&&
       ui.includes('back.onclick=previousBankPage')&&
       !ui.includes('back.onclick=()=>navigate("dashboard")'));
assert(page.includes("v22Categories.filter(c=>c!=='Inventaris')"),
 'Inventory must not duplicate its own tab inside Album filters');
assert(policy.includes('card.hidden=true')&&policy.includes('if(data.canEdit!==true){card.remove();return;}'));
assert(ui.includes('tabs.hidden=false')&&ui.includes('panel?.classList.toggle("hidden",key!==selected)'));
assert(ui.includes('ensureCashExpenseForm()')&&ui.includes('if(route==="biaya"){adminCashTab="out";route="bank-admin-cash";}'));
assert(page.includes("new CustomEvent('f4-bank-expense-saved'"));
assert(bridge.includes('unsoldGrams:Math.round(n(x.sisa)*1000)'));
for(const term of ['BANK_V3_SHEET_START','BANK_V3_DRAFT_START','BANK_V3_CONFIRM_START','BANK_V3_POLICY_START']){
 assert(worker.includes(term),'V3 stage missing: '+term)
}
const code=between('// BANK_V3_RECONCILE_START','// BANK_V3_RECONCILE_END');
const ctx=vm.createContext({__name:x=>x,Map,BigInt,Number,String,Error,Math,Set,Array,console});
vm.runInContext(code,ctx,{timeout:2000});
const lots=[
 {id:'m1k',waste_item_id:'kardus',owner_kind:'member',member_id:'m1',remaining_grams:1000},
 {id:'m2k',waste_item_id:'kardus',owner_kind:'member',member_id:'m2',remaining_grams:500},
 {id:'bk',waste_item_id:'kardus',owner_kind:'bank',member_id:null,remaining_grams:500},
 {id:'m3c',waste_item_id:'kaleng',owner_kind:'member',member_id:'m3',remaining_grams:200},
 {id:'bc',waste_item_id:'kaleng',owner_kind:'bank',member_id:null,remaining_grams:200}
];
const sale={id:'sale1',batch_id:'batch1',status:'draft',sold_on:'2026-11-03',amount_received_rp:6200,amount_gross_rp:6200};
const saleLines=[
 {itemId:'kardus',grams:1600,unsold:300,total:3200,citizenRate:1000},
 {itemId:'kaleng',grams:300,unsold:100,total:3000,citizenRate:6000}
];
let paid=true,overstock=false;
ctx.bankV3EligibleLots=async()=>lots;
ctx.one=async(_db,sql)=>{if(sql.includes('fiscal_closings')||sql.includes('waste_allocations'))return null;throw Error('unexpected one '+sql)};
ctx.list=async(_db,sql)=>{
 if(sql.includes('FROM waste_sales WHERE batch_id='))return [{...sale,amount_received_rp:paid?6200:1000}];
 if(sql.includes('FROM waste_sale_lines sl LEFT JOIN'))return saleLines.map((x,i)=>i===0&&overstock?{...x,unsold:600}:x);
 if(sql.includes('FROM waste_deposits WHERE batch_id='))return [{id:'d1'},{id:'d2'},{id:'d3'}];
 throw Error('unexpected list '+sql)
};
(async()=>{
 const prep={sale_id:'sale1',method:'fixed_buy_price',citizen_percent:50,policy_id:'policy-fixed'};
 const fixed=await ctx.bankV3Preview({},'batch1',prep);
 assert.equal(fixed.citizenRightsRp,2100);
 assert.equal(fixed.bankRightsRp,4100);
 assert.equal(fixed.remainingStockGrams,400);
 assert.equal(fixed.weightDifferenceGrams,100);
 assert.equal(fixed.hasWeightDifference,true);
 assert.equal(fixed.movements.length,5);
 assert.equal(fixed.movements.reduce((n,x)=>n+x.soldGrams,0),1900);
 assert.equal(fixed.movements.reduce((n,x)=>n+x.stockGrams,0),400);
 assert.equal(fixed.movements.reduce((n,x)=>n+x.lossGrams,0),100);
 const byId=new Map(fixed.rights.map(r=>[r.memberId,r.amountRp]));
 assert.equal(byId.get('m1'),800);assert.equal(byId.get('m2'),400);assert.equal(byId.get('m3'),900);
 assert.equal(fixed.movements.filter(x=>x.ownerKind==='bank').reduce((n,x)=>n+x.rightRp,0),0);
 const percent=await ctx.bankV3Preview({},'batch1',{...prep,method:'percentage',citizen_percent:50});
 assert.equal(percent.citizenRightsRp,1950);
 assert.equal(percent.bankRightsRp,4250);
 assert.equal(percent.rights.reduce((n,r)=>n+r.amountRp,0),1950);
 paid=false;
 await assert.rejects(ctx.bankV3Preview({},'batch1',prep),/belum lunas/);
 paid=true;overstock=true;
 await assert.rejects(ctx.bankV3Preview({},'batch1',prep),/tidak cocok/);
 console.log('BANK_V3_MIXED_LOTS_FIXED_AND_PERCENT_RIGHTS_TEST_OK');
})().catch(e=>{console.error(e);process.exitCode=1});
