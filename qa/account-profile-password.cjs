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
// Members of Bank Sampah edit the alias inside their existing card/profile.
// This must not reopen the global multi-tab account overlay.
assert(shell.includes("settings.textContent=portal==='bank'&&role==='warga'?'Kartu & Profil':'Pengaturan Akun'"),
 'Member Bank Sampah setting label must point at existing card');
assert(shell.includes("if(portal==='bank'&&role==='warga')"),'Member Bank Sampah must bypass duplicate settings');
assert(shell.includes('window.f4OpenBankProfile?.();'),'Member profile redirect missing');
assert(account.includes("document.body.classList.contains('f4-direct-bank')"),'Global account overlay must guard Bank Sampah members');
const memberApp=fs.readFileSync('portal-live/bank-mobile-app.js','utf8');
new vm.Script(memberApp,{filename:'bank-mobile-app'});
assert(memberApp.includes('function inlineMemberDisplayName()'),'Inline member name editing missing');
assert(memberApp.includes('const result=await api("/api/member/profile",{nama:value});'),
 'Member alias must be saved via authenticated profile endpoint');
assert(memberApp.includes('window.dispatchEvent(new CustomEvent("f4-account-profile-updated"'),
 'Member name must synchronize with the shared account menu');
assert(worker.includes('INSERT INTO member_account_profiles(account_id,display_name,updated_at)'),
 'Display name must be account-scoped, not rewrite member transaction identity');
assert(memberApp.includes('inlineMemberDisplayName();'),'Edit pencil must be activated on member profile');
assert(!memberApp.includes('Kartu identitas anggota, bukan alat pembayaran.'),
 'Duplicate card disclaimer returned');

const receiptRoute='if (path === "/api/v2/admin/bank/sale-receipt" && request.method === "POST")';
const fallbackRoute='if (path.startsWith("/api/v2/")) return handleUnifiedApi';
assert(worker.includes(receiptRoute) && worker.indexOf(receiptRoute)<worker.indexOf(fallbackRoute),'Sale-receipt route must precede generic v2 handler');
assert(account.includes("location.replace('/');"),'After password change session must return to public home');
assert(!account.includes('b.click();'),'Password change must not invoke logout with revoked session');
const handover=fs.readFileSync('portal-live/bank-sale-handover.js','utf8');
new vm.Script(handover,{filename:'bank-sale-handover'});
assert(handover.includes('border-collapse:separate;border-spacing:0') && handover.includes('border-right:1px solid #000'),'Black PDF table grid must stay visible');
assert(handover.includes("win.addEventListener('load',autoPrint,{once:true})") && handover.includes("win.print()"),'Automatic handover print must run after document load');
assert(!handover.includes('await win.document.fonts.ready') && !handover.includes('await Promise.all(Array.from(win.document.images'),'Auto-print must not wait asynchronously for assets');
const bankPage=fs.readFileSync('bank-sampah/index.html','utf8');
assert(bankPage.includes("const verified=String(detail.sale?.receipt_no||'').trim()"),'Receipt must be verified against D1 sale-detail');
assert(bankPage.includes("refreshed.find(x=>String(x.id)===String(record.id))"),'Receipt must be verified in refreshed sales history');
assert(bankPage.includes("Nomor nota tersimpan dan terverifikasi"),'Do not signal successful receipt write before verification');
const editor=fs.readFileSync('portal-live/superadmin-editor.js','utf8');
new vm.Script(editor,{filename:'superadmin-editor'});
assert(worker.includes('!(kind === "obligations" && ["add_payer","update_note"].includes(action))'),'Only obligations payer creation and note edits may bypass the generic action allowlist');
assert(worker.indexOf('const denied = superadmin(who);',worker.indexOf('async function handleAdminContent(')) < worker.indexOf('if (action === "add_payer")'),'Payer creation must remain behind superadmin validation');
assert(worker.includes('if (action === "add_payer")'),'Missing authenticated create-payer route');
assert(worker.includes("VALUES(?,?,NULL,?,'warga',1)"),'Special payer must never create Bank Sampah member/account');
assert(worker.includes('"tambah_pembayar_iuran"'),'New iuran payer must be audit logged');
assert(editor.includes("'+ Tambah Warga/TPQ'")||editor.includes("'+ Tambah Warga/TPQ',"),'Missing iuran payer creation control');
assert(editor.includes('async function removeObligation(record)'),'Missing safe obligation removal control');
assert(editor.includes('qty_iuran_bulanan:0,qty_kebersihan:0,qty_kas_lorong:0,qty_arisan:0'),'Removal must only zero obligations');
assert(editor.includes('showZeroObligations'),'Removed payers need a restore path');
const book=fs.readFileSync('pembukuan/index.html','utf8');
assert(book.includes('some(n=>Number(n||0)>0)'),'Zero-obligation payers should not appear on new payments');
const historicalMigration=fs.readFileSync('cloudflare/migrations/20261030_iuran_period_obligations.sql','utf8');
const deploy=fs.readFileSync('.github/workflows/f4-finance-guarded-deploy.yml','utf8');
assert(historicalMigration.includes('CREATE TABLE IF NOT EXISTS bookkeeping_payer_obligation_periods'),'Missing history table');
assert(historicalMigration.includes('WHERE NOT EXISTS(SELECT 1 FROM bookkeeping_payer_obligation_periods'),'Missing one-time historical baseline');
assert(deploy.includes('D1_ADDITIVE_IURAN_HISTORY_SCHEMA_OK=1'),'Historical schema must deploy before Worker');
assert(worker.includes('async function f4PeriodObligation'),'Period-specific obligation reader missing');
assert(worker.includes('const requiredByPeriod=new Map()'),'Payment must validate selected period, not current obligation');
assert(worker.includes('const targetMonth=f4IuranMonth(year,month)'),'Arisan reports must use period-specific obligation');
assert(worker.includes('const effectiveFrom=/^20'),'New obligation changes need validated effective period');
assert(worker.includes('effectiveFrom<nextMonth'),'Existing obligations must not change in current or past month');
assert(worker.includes('jadwalkan_kewajiban'),'Future changes must be audited');
assert(editor.includes('f4-obligation-identity')&&editor.includes('f4-obligation-amounts'),'Compact iuran form missing');
assert(editor.includes("obj.effective_from=String(form.elements.namedItem('effective_from')"),'Edit form missing effective period');
assert(book.includes('F4_IURAN_PREVIEW_SEQUENCE')&&book.includes('/api/bookkeeping/iuran/outstanding?'),'Payment preview must use period-specific outstanding');
assert(worker.includes('if(action==="update_note")'),'Missing independent payer note endpoint');
assert(worker.includes('COALESCE(pro.keterangan'),'Payer notes must be readable back from D1');
assert(worker.includes('remark||null'),'Empty optional payer notes must persist without default text');
assert(!worker.includes('Pembayar iuran tanpa akun anggota'),'Never inject a canned note for TPQ');
assert(editor.includes('Keterangan (opsional)')&&editor.includes('Simpan Keterangan'),'Payer notes must be editable without scheduling iuran');
assert(editor.includes("action:'update_note'"),'Existing payer notes need their own save path');
assert(book.includes('function pilihWargaIuran()')&&book.includes('/api/bookkeeping/iuran/suggested-period?'),'Selection must suggest the next unpaid month');
assert(book.includes("function f4IuranManualPeriod()"),'Manual month override must stay possible');
assert(worker.includes('async function getIuranSuggestedPeriod'),'Missing authenticated suggestion read');
assert(worker.includes('a.status=\'aktif\' AND p.status=\'aktif\''),'Suggested month must ignore canceled allocations and payments');
console.log('F4_ACCOUNT_PROFILE_PASSWORD_OK');
