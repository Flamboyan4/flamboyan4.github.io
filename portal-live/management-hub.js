// Menu pengelolaan tunggal: empat kelompok khusus Superadmin.
(()=>{
'use strict';
const page=document.getElementById('f4-account-page');
if(!page)return;
const side=page.querySelector('aside'),main=page.querySelector('main'),resident=document.getElementById('f4-warga-panel');
const $=id=>document.getElementById(id);
const superadmin=()=>document.body.classList.contains('role-superadmin');
const make=(tag,value,cls)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;if(cls)n.className=cls;return n};
const btn=(label,click,cls)=>{const b=make('button',label,cls||'f4-manage-item');b.type='button';b.onclick=click;return b};
function resetTheme(){document.body.classList.remove('f4-manage-book','f4-manage-portal','f4-manage-bank')}
function setTheme(name){resetTheme();document.body.classList.add('f4-manage-'+name)}
function header(title,desc=''){
 const h=make('header',undefined,'f4-work-heading');h.append(make('h2',title));
 if(desc)h.append(make('p',desc));main.append(h);return h;
}
const items=[
 ['Pengaturan Akun Warga',()=>window.f4OpenAccountManager?.()],
 ['Kelola Portal Utama',()=>window.openSuperadminEditor?.('projects')],
 ['Kelola Bank Sampah',()=>window.f4OpenBankAdmin?.('dashboard')],
 ['Kelola Pembukuan',()=>window.openSuperadminEditor?.('obligations')]
];
function managementSidebar(active=''){
 // Identitas dan 4 menu Superadmin tetap muncul pada ringkasan dan setiap form.
 side.replaceChildren();
 const brand=make('div',undefined,'f4-management-brand');
 const logo=make('img');logo.src='https://flamboyan4.web.id/assets/logo-flamboyan.svg?v=official-20261027-v2';
 logo.alt='Logo Flamboyan 4';
 const identity=make('span',undefined,'f4-management-identity');
 identity.append(make('strong','Flamboyan 4'),make('small','Pengelolaan terpusat'));
 brand.append(logo,identity);side.append(brand);
 side.append(make('strong','Pengelolaan Superadmin','f4-work-brand'));
 items.forEach(([label,fn],i)=>{
   const section=['accounts','portal','bank','book'][i];
   const button=btn(label,fn,'f4-manage-item'+(active===section?' active':''));
   side.append(button);
 });
}
window.f4RenderManagementSidebar=managementSidebar;
window.openManagementHub=()=>{
 if(!superadmin())return;
 resetTheme();page.hidden=false;resident.hidden=true;
 managementSidebar();
 main.replaceChildren();header('Pengelolaan Flamboyan 4','Pilih salah satu menu pengelolaan pada bagian kiri. Setiap menu mengelola data yang tampil di portal terkait.');
 const intro=make('section',undefined,'f4-work-section');
 intro.append(make('p','Pengelolaan hanya tersedia untuk Superadmin. Foto dan video dokumentasi tetap tersimpan di Google Drive.'));
 main.append(intro);
};
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==$('appframe')?.contentWindow||event.data?.type!=='f4:manage-home')return;
 if(superadmin())window.openManagementHub();
});
window.openAccountPage=()=>{
 // A single canonical account entry: original Bank Sampah profile.
 // Management is separate and only offered to Superadmin.
 document.querySelector('[data-account-action="settings"]')?.click();
};
// Pengelolaan akun memakai tabel/form asli Bank Sampah, bukan daftar buatan ulang.
window.f4OpenAccountManager=()=>{
 if(!superadmin())return;
 window.f4OpenBankAdmin?.('admin');
};
// Konsisten: saat berada pada halaman Data Warga, submenu Pembukuan tetap ada.
// Jadi tidak muncul menu Bank Sampah atau Ringkasan Akun yang tidak relevan.
const wargaSide=resident.querySelector('.f4-warga-sidebar');
function wargaNavigation(){
 if(!superadmin())return;
 setTheme('book');
 wargaSide.replaceChildren();
 const identity=make('div',undefined,'f4-management-brand');
 const logo=make('img');logo.src='https://flamboyan4.web.id/assets/logo-flamboyan.svg?v=official-20261027-v2';logo.alt='Logo Flamboyan 4';
 const label=make('span',undefined,'f4-management-identity');
 label.append(make('strong','Flamboyan 4'),make('small','Pengelolaan terpusat'));
 identity.append(logo,label);wargaSide.append(identity);
 wargaSide.append(make('strong','Pengelolaan Superadmin','f4-work-brand'));
 for(const [rootLabel,fn,i] of items.map(([name,handler],index)=>[name,handler,index]))
   wargaSide.append(btn(rootLabel,fn,i===3?'f4-manage-item active':'f4-manage-item'));
 wargaSide.append(make('strong','Kelola Pembukuan','f4-work-brand f4-submenu-heading'));
 for(const [label,fn] of [
  ['Data Warga & Rumah',()=>window.openWarga?.()],
  ['Kewajiban Iuran',()=>window.openSuperadminEditor?.('obligations')],
  ['Tarif Iuran',()=>window.openSuperadminEditor?.('tariffs')],
  ['Aturan Tanggal',()=>window.openSuperadminEditor?.('settings')],
  ['← Menu Pengelolaan',window.openManagementHub]
 ])wargaSide.append(btn(label,fn,label==='Data Warga & Rumah'?'active':''));
}
const oldWarga=window.openWarga;
window.openWarga=async()=>{
 if(!superadmin())return;
 page.hidden=true;wargaNavigation();
 return oldWarga?.();
};
$('f4-warga-close').onclick=window.openManagementHub;
// Pengaturan profil mengikuti menu asli Bank Sampah: nama, avatar, password.
const profile=$('profile-shade')?.querySelector('.login-modal');
if(profile&&!$('f4-password-form')){
 const section=make('section',undefined,'f4-password-section');
 const title=make('h3','Ganti Password');
 section.append(title);
 const form=make('form');form.id='f4-password-form';
 const fields=[['currentPassword','Password sekarang','current-password'],['newPassword','Password baru','new-password'],['confirmPassword','Ulangi password baru','new-password']];
 for(const [name,label,autofill] of fields){
  const wrap=make('label',label);
  const input=make('input');input.type='password';input.name=name;input.autocomplete=autofill;input.required=true;
  wrap.append(input);form.append(wrap);
 }
 const note=make('p','','f4-password-feedback');note.setAttribute('role','status');form.append(note);
 const save=btn('Simpan Password Baru',()=>form.requestSubmit(),'login-confirm');form.append(save);
 form.onsubmit=async e=>{
  e.preventDefault();
  const v=new FormData(form),now=String(v.get('currentPassword')||''),next=String(v.get('newPassword')||''),confirm=String(v.get('confirmPassword')||'');
  if(next!==confirm){note.textContent='Konfirmasi password tidak cocok.';return}
  if(next.length<(superadmin()?12:4)){note.textContent='Password terlalu pendek.';return}
  save.disabled=true;note.textContent='Menyimpan password…';
  try{
   const r=await fetch('https://api.flamboyan4.web.id/api/auth/change-password',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:now,newPassword:next})});
   const x=await r.json();if(!r.ok||x.ok===false)throw Error(x.error||'HTTP '+r.status);
   form.reset();note.textContent='Password diperbarui. Sesi diakhiri; silakan login ulang.';
   setTimeout(()=>location.reload(),1600);
  }catch(e){note.textContent=e.message;save.disabled=false}
 };
 section.append(form);profile.append(section);
}
})();
