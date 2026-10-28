'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const worker=fs.readFileSync('cloudflare/worker-terpadu-operasional-teruji.js','utf8');
const shell=fs.readFileSync('portal-live/direct-shell.js','utf8');
const account=fs.readFileSync('portal-live/unified-account.js','utf8');
// Worker is an ES module; it is already validated with node --check by deployment workflow.
for(const [path,js] of [['shell',shell],['account',account]])new vm.Script(js,{filename:path});
assert(worker.includes('const min = 4;'),'All password changes must accept four characters');
assert(!worker.includes('password.length < 12')&&!worker.includes('minlength="12"'),'Activation password rules inconsistent');
assert(worker.includes('displayName: accountProfile.profile.nama'),'Account session alias missing');
assert(worker.includes('nama: who.display_name, rumah: who.house_code'),'Member ledger identity must remain unchanged');
assert(shell.includes("window.addEventListener('f4-account-profile-updated'"),'Shell must react to profile changes');
assert(shell.includes('session?.account?.displayName||session?.member?.nama'),'Account menu missing alias');
assert(account.includes("window.dispatchEvent(new CustomEvent('f4-account-profile-updated'"),'Profile save not propagated');
console.log('F4_ACCOUNT_PROFILE_PASSWORD_OK');
