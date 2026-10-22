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
window.openManagementHub=()=>{
 if(!superadmin())return;
 resetTheme();page.hidden=false;resident.hidden=true;
 side.replaceChildren(make('strong','Pengelolaan Superadmin','f4-work-brand'));
 items.forEach(([label,fn])=>side.append(btn(label,fn,'f4-manage-item')));
 main.replaceChildren();header('Pengelolaan Flamboyan 4','Pilih salah satu menu pengelolaan pada bagian kiri. Setiap menu mengelola data yang tampil di portal terkait.');
 const intro=make('section',undefined,'f4-work-section');
 intro.append(make('p','Semua pengelolaan memakai akun Superadmin dan sumber data Cloudflare D1. Konten foto/video tetap tersimpan di Google Drive.'));
 main.append(intro);
};
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==$('appframe')?.contentWindow||event.data?.type!=='f4:manage-home')return;
 if(superadmin())window.openManagementHub();
});
window.openAccountPage=()=>{
 if(superadmin())window.openManagementHub();
 else if(document.body.classList.contains('role-admin'))window.f4OpenBankAdmin?.('dashboard');
 else if(document.body.classList.contains('role-warga')){
   // Anggota memakai menu akun pribadi Bank Sampah asli, bukan dashboard superadmin.
   page.hidden=true;document.querySelector('nav [data-target="bank-sampah"]')?.click();
 }
};
window.f4OpenAccountManager=async()=>{
 if(!superadmin())return;
 setTheme('portal');page.hidden=false;resident.hidden=true;
 side.replaceChildren(make('strong','Pengaturan Akun Warga','f4-work-brand'));
 side.append(btn('Daftar Akun',()=>window.f4OpenAccountManager(),'active'));
 side.append(btn('← Menu Pengelolaan',window.openManagementHub));
 main.replaceChildren();header('Pengaturan Akun Warga','Daftar akun terpusat Cloudflare. Password tidak pernah ditampilkan.');
 const info=make('p','Memuat akun dari D1…','f4-admin-note');main.append(info);
 const tools=make('div',undefined,'f4-admin-controls');
 const search=make('input');search.type='search';search.placeholder='Cari nama, rumah, username';
 tools.append(search);main.append(tools);
 const host=make('div',undefined,'f4-admin-list');main.append(host);
 try{
  const r=await fetch('https://api.flamboyan4.web.id/api/superadmin/accounts/preview',{credentials:'include',cache:'no-store'});
  const data=await r.json();if(!r.ok||data.ok===false)throw Error(data.error||'HTTP '+r.status);
  const accounts=Array.isArray(data.akun)?data.akun:[];
  const draw=()=>{
   host.replaceChildren();
   const term=search.value.trim().toLowerCase();
   const list=accounts.filter(x=>JSON.stringify([x.username,x.nama,x.rumah,x.status,x.role]).toLowerCase().includes(term));
   info.textContent=list.length+' akun ditampilkan dari '+accounts.length+' akun terdaftar.';
   for(const x of list){
    const row=make('article',undefined,'f4-admin-item');
    const left=make('div');
    left.append(make('strong',(x.nama||x.username||'Akun')+' — '+(x.rumah||'Tanpa rumah')));
    left.append(make('small',[x.username,x.role,x.status].filter(Boolean).join(' • ')));
    row.append(left);
    if(x.role==='anggota'&&x.perluAktivasi){
     const act=btn('Aktifkan',async()=>{
      if(!confirm('Aktifkan akun '+x.username+' dengan password awal standar? Berikan password secara pribadi kepada warga.'))return;
      act.disabled=true;
      try{
       const q=await fetch('https://api.flamboyan4.web.id/api/superadmin/accounts/activate-member',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({accountId:x.id,confirmation:'AKTIFKAN AKUN WARGA'})});
       const d=await q.json();if(!q.ok||d.ok===false)throw Error(d.error||'HTTP '+q.status);
       window.f4OpenAccountManager();
      }catch(e){info.textContent='Gagal mengaktifkan: '+e.message;act.disabled=false}
     });
     row.append(act);
    }
    host.append(row);
   }
   if(!list.length)host.append(make('p','Tidak ada akun yang cocok.','f4-admin-note'));
  };
  search.oninput=draw;draw();
 }catch(e){info.textContent='Tidak bisa membaca akun: '+e.message}
};
// Konsisten: saat berada pada halaman Data Warga, submenu Pembukuan tetap ada.
// Jadi tidak muncul menu Bank Sampah atau Ringkasan Akun yang tidak relevan.
const wargaSide=resident.querySelector('.f4-warga-sidebar');
function wargaNavigation(){
 if(!superadmin())return;
 setTheme('book');
 wargaSide.replaceChildren(make('strong','Kelola Pembukuan','f4-work-brand'));
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
