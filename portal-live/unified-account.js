/* Unified account settings for all authenticated roles. It overlays the current iframe,
   so returning preserves the exact portal, panel and scroll position. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id';
const root=document.createElement('div');root.id='f4-unified-account';root.hidden=true;
root.innerHTML='<aside class="ua-side" id="f4-ua-side" aria-label="Menu Pengaturan Akun"></aside><button type="button" class="ua-backdrop" aria-label="Tutup menu Pengaturan Akun" hidden></button><main class="ua-content"></main>';
document.body.append(root);
const aside=root.querySelector('aside'),content=root.querySelector('main'),backdrop=root.querySelector('.ua-backdrop');
const mobileMenu=document.getElementById('f4-mobile-menu');
function mobileView(){return window.matchMedia('(max-width:760px)').matches}
function setAccountMenu(open){
 const active=!!open&&mobileView()&&!root.hidden;
 aside.classList.toggle('open',active);backdrop.hidden=!active;
 if(mobileMenu&&!root.hidden){mobileMenu.setAttribute('aria-controls','f4-ua-side');mobileMenu.setAttribute('aria-expanded',String(active));mobileMenu.setAttribute('aria-label',active?'Tutup menu Pengaturan Akun':'Buka menu Pengaturan Akun')}
}
backdrop.addEventListener('click',()=>setAccountMenu(false));
// Capture before the portal's hamburger handler so account navigation cannot open its sidebar.
mobileMenu?.addEventListener('click',event=>{
 if(root.hidden||!mobileView())return;
 event.preventDefault();event.stopImmediatePropagation();setAccountMenu(!aside.classList.contains('open'));
},true);
window.addEventListener('resize',()=>{if(!mobileView())setAccountMenu(false)});
const h=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e};
const btn=(label,fn,cls)=>{const e=h('button',label,cls);e.type='button';e.onclick=fn;return e};
let tab='identitas',session={},profile={},photoUrl='';
async function request(path,init={}){
 const response=await fetch(API+path,{credentials:'include',cache:'no-store',...init});
 const type=response.headers.get('content-type')||'';
 const result=type.includes('application/json')?await response.json().catch(()=>({})): {};
 if(!response.ok||result.ok===false)throw Error(result.error||('HTTP '+response.status));
 return result;
}
function report(target,message,bad=false){target.textContent=message;target.classList.toggle('ua-error',bad);}
function page(title,subtitle){
 content.replaceChildren();const head=h('header',undefined,'ua-heading');
 head.append(h('h1',title),h('p',subtitle));content.append(head);
}
function panel(title){const s=h('section',undefined,'ua-panel');s.append(h('h2',title));content.append(s);return s}
function field(label,value,readOnly=false){
 const box=h('label',undefined,'ua-field'),input=h('input');box.append(h('span',label));
 input.value=String(value??'');input.readOnly=readOnly;box.append(input);return {box,input};
}
function roleLabel(){return {warga:'Anggota',admin:'Admin Bank Sampah',superadmin:'Superadmin'}[session.account?.role]||'Anggota'}
function navigation(){
 aside.replaceChildren();const brand=h('div',undefined,'ua-brand');
 const img=h('img');img.src='https://flamboyan4.web.id/assets/logo-flamboyan.svg?v=official-20261027-v2';img.alt='Logo Flamboyan 4';
 const name=h('div');name.append(h('strong','Flamboyan 4'),h('small','Pengaturan Akun'));brand.append(img,name);aside.append(brand);
 for(const [key,label] of [['identitas','Identitas Saya'],['foto','Foto Profil'],['password','Ganti Password'],['rights','Hak Akses Saya']]){
  const b=btn(label,()=>show(key),'ua-menu'+(tab===key?' active':''));aside.append(b);
 }
 aside.append(btn('← Kembali ke Portal',close,'ua-menu ua-return'));
}
function show(next){
 tab=next;navigation();setAccountMenu(false);
 if(next==='identitas')identityPage();
 if(next==='foto')photoPage();
 if(next==='password')passwordPage();
 if(next==='rights')rightsPage();
}
function identityPage(){
 page('Identitas Saya','Data akun yang sedang login • Satu identitas untuk empat portal');
 const card=panel('Informasi anggota');
 const grid=h('div',undefined,'ua-grid');const name=field('Nama tampilan',profile.nama||session.member?.nama||'');
 const house=field('Rumah',session.member?.rumah||profile.rumah||'—',true);
 const username=field('Username',session.account?.username||'—',true);
 const member=field('ID Anggota',session.member?.id||profile.wargaId||'—',true);
 grid.append(name.box,house.box,username.box,member.box);card.append(grid);
 const note=h('p','','ua-status');card.append(note);
 card.append(btn('Simpan Nama',async()=>{
  const value=name.input.value.trim();if(!value){report(note,'Nama tidak boleh kosong.',true);return}
  try{await request('/api/member/profile',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({nama:value})});
   profile.nama=value;report(note,'Nama profil berhasil disimpan.');}
  catch(e){report(note,'Gagal menyimpan: '+e.message,true)}
 },'ua-primary'));
}
function photoPage(){
 page('Foto Profil','Foto disimpan pada Cloudflare R2 dan digunakan di utility bar');
 const card=panel('Foto profil saya'),line=h('div',undefined,'ua-photo-row'),avatar=h('img');avatar.alt='Foto profil saya';avatar.className='ua-preview';
 avatar.src=API+'/api/member/avatar?v='+Date.now();avatar.onerror=()=>{avatar.style.display='none';placeholder.hidden=false};
 const placeholder=h('div','Foto profil','ua-placeholder');placeholder.hidden=true;line.append(avatar,placeholder);
 const controls=h('div',undefined,'ua-photo-actions'),file=h('input');file.type='file';file.accept='image/jpeg,image/png,image/webp';file.setAttribute('aria-label','Pilih foto profil');
 file.onchange=()=>{if(photoUrl)URL.revokeObjectURL(photoUrl);if(file.files?.[0]){photoUrl=URL.createObjectURL(file.files[0]);avatar.src=photoUrl;avatar.style.display='block';placeholder.hidden=true}};
 const note=h('p','JPG, PNG, atau WebP; ukuran maksimal 2 MB.','ua-status');
 controls.append(file,note,btn('Simpan foto',async()=>{
  const chosen=file.files?.[0];if(!chosen){report(note,'Pilih foto lebih dahulu.',true);return}
  if(chosen.size>2*1024*1024){report(note,'Ukuran maksimal 2 MB.',true);return}
  if(!['image/jpeg','image/png','image/webp'].includes(chosen.type)){report(note,'Format harus JPG/PNG/WebP.',true);return}
  try{
   await request('/api/member/avatar',{method:'POST',headers:{'content-type':chosen.type},body:chosen});
   report(note,'Foto profil berhasil disimpan.');file.value='';
   window.f4RefreshDirectAvatar?.();
   const face=document.querySelector('#avatar-button .avatar-face');
   if(face){face.textContent='';face.style.background='center / cover no-repeat url("'+API+'/api/member/avatar?v='+Date.now()+'")'}
  }catch(e){report(note,'Upload gagal: '+e.message,true)}
 },'ua-primary'));
 line.append(controls);card.append(line);
}
function passwordPage(){
 page('Ganti Password','Keamanan akun terpusat • Password saat ini harus diketahui');
 const card=panel('Ganti password');
 const form=h('form',undefined,'ua-password-form');
 const controls=[['currentPassword','Password sekarang'],['newPassword','Password baru'],['confirmPassword','Ulangi password baru']];
 for(const [key,label] of controls){
  const wrap=h('label',undefined,'ua-field');wrap.append(h('span',label));
  const box=h('div',undefined,'ua-password-row'),input=h('input');input.name=key;input.type='password';input.autocomplete=key==='currentPassword'?'current-password':'new-password';input.required=true;
  const openEye='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const hiddenEye='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 3.8M6.5 6.5C3.5 8.4 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.2-1"/></svg>';
  const eye=btn('',()=>{const shown=input.type==='text';input.type=shown?'password':'text';eye.setAttribute('aria-label',shown?'Tampilkan password':'Sembunyikan password');eye.innerHTML=shown?openEye:hiddenEye;eye.classList.toggle('visible',!shown)},'ua-eye');
  eye.innerHTML=openEye;eye.setAttribute('aria-label','Tampilkan password');box.append(input,eye);wrap.append(box);form.append(wrap);
 }
 const msg=h('p','','ua-status'),submit=h('button','Simpan password baru','ua-primary');submit.type='submit';form.append(msg,submit);
 form.addEventListener('submit',async event=>{
  event.preventDefault();const fields=Object.fromEntries([...new FormData(form)]);
  if(fields.newPassword.length<4){report(msg,'Password baru minimal 4 karakter.',true);return}
  if(fields.newPassword!==fields.confirmPassword){report(msg,'Ulangan password tidak cocok.',true);return}
  submit.disabled=true;
  try{await request('/api/auth/change-password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({currentPassword:fields.currentPassword,newPassword:fields.newPassword})});
   form.reset();report(msg,'Password berhasil diganti. Sesi akan diperbarui.');
   window.dispatchEvent(new CustomEvent('f4-account-password-updated'));
  }catch(e){report(msg,'Gagal mengganti password: '+e.message,true)}
  finally{submit.disabled=false}
 });
 card.append(form);
}
function rightsPage(){
 page('Hak Akses Saya','Hak akses ditentukan di server dari role akun');
 const card=panel('Informasi hak akses'),list=h('div',undefined,'ua-privileges');
 const current=roleLabel(),items=['Informasi publik dan kegiatan warga'];
 if(session.account?.role!=='public')items.push('Laporan lingkungan yang diizinkan dan data pribadi sendiri');
 if(['admin','superadmin'].includes(session.account?.role))items.push('Operasional Bank Sampah');
 if(session.account?.role==='superadmin')items.push('Pembukuan dan Portal Superadmin');
 card.append(h('p','Role aktif: '+current,'ua-strong'));
 for(const item of items)list.append(h('div','✓ '+item));card.append(list);
 card.append(h('p','Mengubah role sendiri tidak tersedia. Penetapan role hanya dilakukan oleh Superadmin melalui pengelolaan akun.','ua-status'));
}
function close(){setAccountMenu(false);root.hidden=true;document.body.classList.remove('f4-account-open');
 if(mobileMenu){mobileMenu.setAttribute('aria-controls','portal-sidebar');mobileMenu.setAttribute('aria-label','Buka menu halaman');mobileMenu.setAttribute('aria-expanded','false')}if(location.hash==='#akun')history.replaceState(null,'',window.__f4AccountReturnHash||'#portal');if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=''}}
async function open(){
 if(root.hidden){window.__f4AccountReturnHash=location.hash==='#akun'?(window.__f4AccountReturnHash||'#portal'):(location.hash||'#portal');if(location.hash!=='#akun')history.pushState(null,'','#akun');}
 const accountPanel=document.getElementById('f4-account-page'),residents=document.getElementById('f4-warga-panel');
 if(accountPanel)accountPanel.hidden=true;if(residents)residents.hidden=true;
 root.hidden=false;document.body.classList.add('f4-account-open');setAccountMenu(false);tab='identitas';
 page('Pengaturan Akun','Identitas terpusat untuk semua portal');navigation();
 const loading=h('p','','ua-status');content.append(loading);
 const loader=window.F4Loading?.begin(loading,'Memuat profil akun…');
 try{session=await request('/api/v2/auth/session');if(!session.account)throw Error('Sesi belum aktif.');}
 catch(e){window.F4Loading?.error(loading,'Sesi tidak dapat dibaca: '+e.message,loader);content.append(btn('Kembali',close,'ua-primary'));return}
 let profileError=null;
 try{const data=await request('/api/member/profile');profile=data.profile||{}}
 catch(e){profile={};profileError=e}
 window.F4Loading?.success(loading,loader);
 show('identitas');
 if(profileError){const warning=h('p','Profil pribadi belum dapat dimuat: '+profileError.message,'ua-status ua-error');content.append(warning)}

}
window.f4OpenUnifiedAccount=open;
window.f4CloseUnifiedAccount=close;
window.addEventListener('f4-account-password-updated',()=>{
 const b=document.querySelector('[data-account-action="logout"]');
 if(b){close();b.click();}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden){if(aside.classList.contains('open'))setAccountMenu(false);else close()}});
window.addEventListener('popstate',()=>{if(!root.hidden&&location.hash!=='#akun')close()});
})();