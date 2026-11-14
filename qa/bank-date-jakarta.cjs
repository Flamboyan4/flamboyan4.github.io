'use strict';
/* Read-only date regression: four Bank forms must use Asia/Jakarta,
   especially just after midnight when UTC is still on the prior day. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('bank-sampah/index.html','utf8');
const fn=html.match(/  const bankLocalToday=\(\)=>\{[\s\S]*?\n  \};/);
assert(fn,'Bank date-only helper is missing');
assert.equal((html.match(/bankLocalToday\(\)/g)||[]).length,4,
 'Setoran, Penjualan, Pengeluaran and Album must all use local dates');
assert(!/new Date\(\)\.toISOString\(\)\.slice\(0,10\)/.test(html),
 'UTC default transaction dates must not return');
const when=iso=>vm.runInNewContext(fn[0]+'\n bankLocalToday();',{
 Date:class extends Date{constructor(){super(iso)}},
 Intl
});
assert.equal(when('2026-11-14T17:30:00Z'),'2026-11-15');
assert.equal(when('2026-11-14T03:30:00Z'),'2026-11-14');
assert.equal(when('2026-12-31T18:00:00Z'),'2027-01-01');
console.log('BANK_JAKARTA_TRANSACTION_DATES_OK');
