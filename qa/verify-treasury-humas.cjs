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
console.log('TREASURY_HUMAS_CLASSIFICATION_AND_CALENDAR_OK=1');
