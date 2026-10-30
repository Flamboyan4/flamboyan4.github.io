// Kas Lorong classification regression. No production data or API calls.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const worker=fs.readFileSync('cloudflare/worker-terpadu-operasional-teruji.js','utf8');
const ui=fs.readFileSync('portal-live/treasury-center.js','utf8');
const html=fs.readFileSync('superadmin/index.html','utf8');
const start=worker.indexOf('function treasuryBookCashEligible(row){');
const end=worker.indexOf('__name(treasuryBookCashEligible',start);
assert.ok(start>0&&end>start,'Treasury classification not found');
const eligible=vm.runInNewContext(worker.slice(start,end)+'; treasuryBookCashEligible;');
for(const [category,transaction_type,expected] of [
 ['Kas Lorong','batch_kas_lorong',true],
 ['Denda Gorol','batch_denda_gorol',true],
 ['Pemasukan Lain','manual',true],
 ['Biaya Operasional','manual',true],
 ['Setoran RT','manual',false],
 ['Iuran RT','manual',false],
 ['Kebersihan','manual',false],
 ['Arisan','manual',false],
 ['Saldo Awal','manual',false],
 ['Kas Lorong','arisan',false]
]){
 assert.equal(eligible({category,transaction_type}),expected,category+' / '+transaction_type);
}
assert.match(worker,/name:"Kas Lorong",cash:"cash:kas_rt"/,'Kas Lorong label must preserve historical fund key');
assert.doesNotMatch(worker.slice(worker.indexOf('async function treasuryCatalog'),worker.indexOf('__name(treasuryCatalog')),/Kas RT/,'No RT label in treasury catalog');
assert.match(ui,/function treasuryDateControl\(\)/);
assert.doesNotMatch(ui,/type="date"/);
assert.match(html,/treasury-center\.js\?v=20261030-kas-lorong/);
assert.match(html,/treasury-center\.css\?v=20261030-kas-lorong/);
// Opening balance grid must use one date, immutable adjustment entries and atomic D1 batch.
assert.match(worker,/if\(p\.action==="opening-grid"\)/);
assert.match(worker,/source:book:/);
assert.match(worker,/confirmed_at IS NULL/);
assert.match(worker,/openingDateConsistent/);
assert.match(ui,/function buildOpeningGrid\(/);
assert.match(ui,/action:"opening-grid"/);
assert.match(ui,/function treasuryDateControl\(/);
assert.match(ui,/const days=\["Min","Sen","Sel","Rab","Kam","Jum","Sab"\]/);
assert.match(ui,/const offset=new Date\(year,month,1\)\.getDay\(\);/);
assert.doesNotMatch(ui,/function buildConfirm\(/,'No separate duplicate date for opening approval');
assert.match(ui,/dateCtl\.trigger\.disabled=true/,'Opening date must not change once saved');
assert.match(ui,/changed\)\{status\.textContent/,'Unsaved changes must block confirmation');
assert.match(ui,/return;\s*}\s*const cards=el\("div"/,'Pre-confirmation layout should skip duplicate 0-value overview cards');
console.log('TREASURY_HUMAS_CLASSIFICATION_AND_CALENDAR_OK=1');
