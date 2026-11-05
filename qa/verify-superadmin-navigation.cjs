'use strict';
// Regression guard for Superadmin navigation. Read-only, no login or database calls.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const read=file=>fs.readFileSync(file,'utf8');
const html=read('superadmin/index.html');
const editor=read('portal-live/superadmin-editor.js');
const treasury=read('portal-live/treasury-center.js');
const treasuryCSS=read('portal-live/treasury-center.css');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
 .map(m=>m[1]).filter(Boolean);
for(const script of scripts)new vm.Script(script);
new vm.Script(editor);
new vm.Script(treasury);

const menus=html.split('const groups=')[1]?.split(';')[0]||'';
const main=[...menus.matchAll(/\['([^']+)','([^']+)'\]/g)].map(m=>m[1]);
assert.deepEqual(main,['overview','treasury','accounts','content','bank','masters','audit'],
 'Seven stable Superadmin sections are required');

const submenu=html.split('const submenu=')[1]?.split(';')[0]||'';
const modules=[...submenu.matchAll(/\['([^']+)','[^']+'\]/g)].map(m=>m[1]);
const expected=[
 'projects','agenda','documentation','inventory','banners','meetings','arisan','jersey',
 'bank_progress','bank_albums','bank_inventory','bankcatalog','bank_weighing',
 'residents','obligations','tariffs','settings'
];
assert.deepEqual(modules.sort(),expected.sort(),'Keep all legacy modules accessible');

const grouping=html.slice(html.indexOf('const moduleGroups='),html.indexOf('let role='));
const itemLists=[...grouping.matchAll(/items:\[([^\]]+)\]/g)].map(m=>
 [...m[1].matchAll(/'([^']+)'/g)].map(v=>v[1]));
const flat=itemLists.flat();
assert.equal(itemLists.length,5,'Expected 3 Portal groups and 2 Bank groups');
assert.equal(flat.length,13);
assert.equal(new Set(flat).size,13,'No module may appear in two groups');
assert(flat.every(key=>modules.includes(key)),'Group targets must exist');

assert(!html.includes("section('Akses cepat')"),'No duplicated quick links on overview');
assert(!html.includes('Koneksi dan publikasi'),'No placeholder dashboard section');
assert(html.includes("main.querySelector('.sa-module-nav')?.remove()"),
 'Navigating must remove the previous child menu');
assert(html.includes('window.f4SuperadminSwitchModule=openEditor;'),
 'Retain deep-linking to legacy editors');
assert(html.includes('Data & Aturan'),'Use user-facing naming');
assert(html.includes('20261105-superadmin-simple-v1'),'Updated script/style cache keys');

assert.equal((treasury.match(/id:"(?:saldo|transaksi|laporan)",name:/g)||[]).length,3,
 'Finance has exactly 3 main views');
assert(!treasury.includes('id:"pos",name:'),'Fund settings must not become another main tab');
assert(treasury.includes('buildDynamicFund(fundManage,data,refresh)'));
assert(treasury.includes('fundManage.open=true'),'Fund edit must remain reachable');
assert(treasuryCSS.includes('grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:6px'));
assert(editor.includes("sub.append(node('h3',label))"),'Avoid repeated editor titles');

console.log('F4_SUPERADMIN_NAVIGATION_OK: 7 menu, 17 modules, 5 groups, 3 finance views');
