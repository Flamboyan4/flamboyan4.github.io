/* Guard pemisahan nama dan nomor punggung Jersey tanpa mengubah data operasional. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const paths={
  admin:'portal-live/superadmin-editor.js',
  home:'portal-live/home-legacy.js',
  worker:'cloudflare/worker-terpadu-operasional-teruji.js',
  migration:'cloudflare/migrations/20261105_jersey_back_fields.sql'
};
const source=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(p,'utf8')]));
for(const k of ['admin','home'])new vm.Script(source[k],{filename:paths[k]}); // Worker is an ESM module, checked by node --check.
const backFunc=source.admin.match(/function jerseyBackParts\(row\)\{[\s\S]*?\n\}/);
const publicFunc=source.home.match(/function jerseyPublicBackParts\(x\)\{[\s\S]*?\n    \}/);
assert.ok(backFunc,'Parser nama punggung Superadmin hilang');
assert.ok(publicFunc,'Parser nama punggung Portal hilang');
const adminParse=vm.runInNewContext('('+backFunc[0]+')');
const publicParse=vm.runInNewContext('('+publicFunc[0]+')');
const cases=[
  [{printed_name:'H.J. 29'},'H.J.','29'],
  [{printed_name:'Kasmali 72'},'Kasmali','72'],
  [{printed_name:'R@ISA'},'R@ISA',''],
  [{printed_name:'6 (Tanpa Nama)'},'','6'],
  [{printed_name:'(Tanpa Nama/No)'},'',''],
  [{printed_name:'FIKAR 22',back_name:'Baru',back_number:'007'},'Baru','007']
];
for(const parse of [adminParse,publicParse])for(const [row,name,number] of cases){
  const result=parse(row);
  assert.equal(result.name,name);
  assert.equal(result.number,number);
}
for(const key of ['back_name','back_number']){
  assert.match(source.worker,new RegExp(key+':"text"'),'Worker field '+key+' tidak tersedia');
  assert.match(source.admin,new RegExp("'"+key+"'"),'Form field '+key+' tidak tersedia');
}
assert.ok(source.worker.includes('back_name,back_number,payment_status'),'Portal API belum mengembalikan kolom punggung');
assert.ok(source.home.includes('Nama Punggung')&&source.home.includes('Nomor Punggung'),'Kolom publik belum dipisahkan');
assert.ok(source.admin.includes('<th>Nama Punggung</th><th>No. Punggung</th>'),'Kolom laporan cetak belum dipisahkan');
const statements=source.migration.split(';').map(v=>v.trim()).filter(Boolean);
assert.deepEqual(statements,[
  'ALTER TABLE portal_jersey_orders ADD COLUMN back_name TEXT',
  'ALTER TABLE portal_jersey_orders ADD COLUMN back_number TEXT'
]);
console.log('JERSEY_BACK_FIELDS_QA_OK=1');
