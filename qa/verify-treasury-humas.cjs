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
assert.match(html,/treasury-center\.js\?v=20261030-print-popup5/);
assert.match(html,/treasury-center\.css\?v=20261030-print-popup5/);
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
// Print: saldo awal final only, every transfer displayed as one logical event.
const css=fs.readFileSync('portal-live/treasury-center.css','utf8');
assert.doesNotMatch(css,/!important|@media print/i,'Stylesheet must not stack print overrides');
assert.match(ui,/function tidyHistory\(data\)/);
assert.match(ui,/if\(line.kind==="opening"\)continue/);
assert.match(ui,/function openingSummary\(data\)/);
assert.match(ui,/function printTreasury\(data\)/);
assert.match(ui,/print-color-adjust:exact/);
assert.match(ui,/border:1px solid #000/);
assert.match(ui,/LAPORAN PUSAT KEUANGAN FLAMBOYAN 4/);
assert.match(ui,/logo-flamboyan\.svg/);
assert.match(ui,/const printWindow=window\.open\("","_blank"\)/);
assert.match(ui,/printWindow\.document\.write\(html\)/);
assert.match(ui,/printWindow\.print\(\)/);
assert.match(ui,/printWindow\.document\.fonts\?\.ready/);
assert.doesNotMatch(ui,/frame\.srcdoc=html|width:"0",height:"0"/,'Zero-size printable iframe must never return');
assert.doesNotMatch(ui,/Saldo awal dikunci \+/,'Permanent confirmation banner must be absent');
assert.match(ui,/showTreasuryNotice\("Saldo awal berhasil disahkan\."\)/);
assert.match(ui,/setTimeout\(\(\)=>notice\.remove\(\),3500\)/);
assert.doesNotMatch(ui,/print\.onclick=\(\)=>window\.print\(\)/);
assert.match(worker,/openingBalances/);
assert.match(ui,/const shell=el\("details",undefined,"tc-panel tc-mutation-panel/);
assert.match(ui,/if\(!book\.length&&!bank\.length&&!data\.sourceWarnings\?\.length\)return/);
const a=ui.indexOf('function tidyHistory(data){'),b=ui.indexOf('function printTreasury(data){');
const run=new vm.Script(ui.slice(a,b)+'\n({tidyHistory,openingSummary})');
const tools=run.runInNewContext({
 kindLabels:{opening:'Saldo awal',move:'Pindah tempat',incoming:'Dana masuk'},
 amount:(rows,fund,location)=>Number(rows.find(x=>x.fund_id===fund&&x.location_id===location)?.amount_rp||0),
 Map,Date,Number,String
});
const sample={catalog:{funds:[{id:'jersey',name:'Jersey',cash:'cash:jersey'}],
 locations:[{id:'qris',name:'QRIS'},{id:'cash:jersey',name:'Cash Jersey'}]},
 openingDate:'2026-10-30',openingBalances:[
 {fund_id:'jersey',location_id:'qris',amount_rp:865000},
 {fund_id:'jersey',location_id:'cash:jersey',amount_rp:415000}],
 history:[
 {id:'o1',kind:'opening',occurred_on:'2026-10-30',fund_id:'jersey',location_id:'qris',amount_rp:-90000},
 {id:'o2',kind:'opening',occurred_on:'2026-10-30',fund_id:'jersey',location_id:'cash:jersey',amount_rp:90000},
 {id:'mv',kind:'move',occurred_on:'2026-10-30',fund_id:'jersey',location_id:'qris',amount_rp:-50000},
 {id:'mv',kind:'move',occurred_on:'2026-10-30',fund_id:'jersey',location_id:'cash:jersey',amount_rp:50000}
 ]};
assert.equal(tools.openingSummary(sample).grand,1280000);
const movements=tools.tidyHistory(sample);
assert.equal(movements.length,1,'Correction records must be excluded, both transfer legs grouped');
assert.equal(movements[0].amount,50000);
assert.equal(movements[0].kindName,'Pindah tempat');
console.log('TREASURY_HUMAS_CLASSIFICATION_AND_CALENDAR_OK=1');
