window.F4PortalRuntime.define("/portal-live/resident-profile.js",function(__f4){

'use strict';
const doc=__f4.globals.document,win=__f4.window,root=doc.getElementById('f4-resident-content');
if(!root)return;
const API='https://api.flamboyan4.web.id';
const el=(tag,cls='',value)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
const btn=(label,fn,cls='rp-button')=>{const b=el('button',cls,label);b.type='button';b.onclick=fn;return b};
const link=(label,href,cls='rp-button')=>{const a=el('a',cls,label);a.href=href;return a};
const read=async path=>{const r=await __f4.globals.fetch(API+path,{credentials:'include',cache:'no-store'});const data=await r.json();if(!r.ok||data.ok===false)throw Error(data.error||'Data tidak tersedia');return data};
const money=value=>'Rp'+Number(value).toLocaleString('id-ID',{maximumFractionDigits:0});
const today=()=>new Date(Date.now()+7*3600000).toISOString().slice(0,10);
const dateLabel=s=>/^\d{4}-\d{2}-\d{2}/.test(String(s||''))?new Date(s.slice(0,10)+'T00:00:00Z').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'—';
let serial=0,identity=null,account='',busy=false,currentRole='public';
let pageMode=new URLSearchParams(__f4.globals.location.search).get('halaman')==='edit'?'edit':'social';
const message=(value)=>{root.replaceChildren(el('p','rp-empty',value))};
function roleChanged(e){
 if(e.origin!==__f4.globals.location.origin||e.source!==window||e.data?.type!=='f4:demo-role')return;
 currentRole=e.data.role;
 const valid=['warga','admin','superadmin'].includes(currentRole)&&e.data.identity?.accountId;
 if(!valid){serial++;account='';identity=null;busy=false;message('Masuk sebagai warga untuk membuka halaman ini.');root.append(btn('Masuk',()=>win.f4ShowLogin?.()));return}
 identity=e.data.identity;
 if(account===identity.accountId)return;
 account=identity.accountId;if(currentRole!=='warga')pageMode='edit';renderPage();
}
win.addEventListener('message',roleChanged);
__f4.cleanup(()=>{serial++;identity=null;account='';});

let profileTab='uploads';
function renderPage(){if(!identity)return;if(pageMode==='edit')renderSettings();else void load()}
win.f4ProfileSetMode=next=>{const mode=next==='edit'||currentRole!=='warga'&&currentRole!=='public'?'edit':'social';if(busy||mode===pageMode)return;pageMode=mode;renderPage()};
async function load(){
 const seq=++serial;message('Memuat profil…');
 try{const data=await read('/api/v2/gallery/my-profile');if(seq!==serial)return;
 const uploads=Array.isArray(data.uploads)?data.uploads:[],tagged=Array.isArray(data.tagged)?data.tagged:[];
 root.replaceChildren();const heading=el('div','rp-heading');heading.append(el('h1','','Profil'));root.append(heading);
 const head=el('section','rp-profile-head'),avatar=el('img','rp-avatar');avatar.alt='Foto profil';avatar.width=76;avatar.height=76;avatar.src=API+'/api/member/avatar?v='+Date.now();avatar.onerror=()=>{const fallback=el('span','rp-avatar rp-avatar-fallback');fallback.innerHTML='<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';avatar.replaceWith(fallback)};
 const who=el('div','rp-who');who.append(el('h2','',identity.nama||'Warga'),el('p','',identity.rumah?'Rumah '+identity.rumah:'Flamboyan 4'));const counts=el('div','rp-counts');for(const [n,label] of [[uploads.length,'Unggahan'],[tagged.length,'Ditandai']]){const cell=el('div');cell.append(el('b','',n),el('small','',label));counts.append(cell)}who.append(counts);head.append(avatar,who);root.append(head);
 const actions=el('div','rp-actions');actions.append(btn('Edit profil',()=>win.f4OpenAccountProfile?.()),btn('Unggah foto',()=>{if(win.f4OpenGalleryUpload)void win.f4OpenGalleryUpload(()=>{profileTab='uploads';if(pageMode==='social')void load()})}));root.append(actions);
 const tabs=el('div','rp-profile-tabs'),photos=el('div','rp-photos');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Foto profil warga');root.append(tabs,photos);
 const icons={uploads:'<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',tagged:'<path d="M7 4H5a2 2 0 0 0-2 2v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a2 2 0 0 0-2-2h-2l-3-2h-4L7 4Z"/><circle cx="12" cy="10" r="3"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/>'};
 for(const [key,label] of [['uploads','Unggahan saya'],['tagged','Ditandai']]){const b=btn('',()=>{profileTab=key;paint()},'rp-profile-tab');b.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'+icons[key]+'</svg>';b.title=label;b.setAttribute('aria-label',label);b.dataset.kind=key;tabs.append(b)}
 function paint(){for(const b of tabs.children)b.setAttribute('aria-pressed',String(b.dataset.kind===profileTab));photos.replaceChildren();const rows=profileTab==='uploads'?uploads:tagged;if(!rows.length){photos.append(el('p','rp-empty',profileTab==='uploads'?'Belum ada unggahan.':'Belum ada foto yang menandai Anda.'));return}
 for(const item of rows){if(!item.url)continue;const tile=btn('',()=>{win.f4MediaGallery?.openStandalonePhoto({...item,type:'foto'},tile)},'rp-photo');tile.setAttribute('aria-label',item.caption||item.title||'Buka foto');const img=el('img');img.src=item.url;img.alt=item.caption||item.title||'Foto warga';img.loading='lazy';img.onerror=()=>{img.replaceWith(el('span','rp-empty','Foto tidak tersedia'))};tile.append(img);photos.append(tile)}}
 paint();
 }catch(e){if(seq===serial){message('Profil belum dapat dimuat.');root.append(btn('Coba lagi',()=>void load()))}}
}
win.addEventListener('f4-account-profile-updated',e=>{if(!identity)return;if(e.detail?.nama)identity={...identity,nama:e.detail.nama};if(pageMode==='social')void load()});


/* Kartu & Profil: a single accessible editor for all portals, on the
   existing profile route. No Bank dashboard requests are needed. */
function renderSettings(){
 const seq=++serial;root.replaceChildren();const member=currentRole==='warga';
 const header=el('div','rp-heading rp-settings-heading');
 header.append(el('h1','',member?'Kartu & Profil':'Profil Pengurus'));
 if(member){const back=btn('',()=>win.F4PortalNavigation.go('/profil/'),'rp-back-profile');back.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span>Profil</span>';header.prepend(back)}
 root.append(header);
 const memberId=String(identity.wargaId||'').replace(/^member:/i,'');
 let cardName=null;
 function shortName(raw){const words=String(raw||'').trim().split(/\s+/);let title='Pak';while(words.length&&/^(pak|bapak|bpk|bp|bu|ibu)\.?$/i.test(words[0])){if(/^(bu|ibu)\.?$/i.test(words[0]))title='Bu';words.shift()}return words.length?title+' '+words[0]:'—'}
 if(member){
  const section=el('section','rp-card rp-member-card-section');section.append(el('h2','','Detail Kartu Anggota'));
  const card=el('div','rp-member-atm'),head=el('div','rp-atm-head'),brand=el('div','rp-atm-brand'),logo=el('img');
  logo.src='/assets/logo-flamboyan.svg';logo.alt='';brand.append(logo,el('strong','','BANK SAMPAH FLAMBOYAN 4'));
  const award=el('span','rp-atm-award');award.hidden=true;head.append(brand,award);
  const center=el('div','rp-atm-center'),chip=el('span','rp-atm-chip');chip.setAttribute('aria-hidden','true');center.append(chip,el('strong','rp-atm-number',memberId||'—'));
  const foot=el('div','rp-atm-foot'),person=el('div'),house=el('div');cardName=el('strong','',shortName(identity.nama));person.append(el('small','','NAMA ANGGOTA'),cardName);house.append(el('small','','RUMAH'),el('strong','',identity.rumah||'—'));foot.append(person,house);card.append(head,center,foot);section.append(card);
  const copy=btn('Salin nomor anggota',async()=>{if(!memberId)return;try{await __f4.globals.navigator.clipboard.writeText(memberId);copy.textContent='Nomor tersalin'}catch{win.prompt('Nomor anggota:',memberId)}},'rp-button rp-copy-id');copy.disabled=!memberId;section.append(copy);root.append(section);
  if(memberId)read('/api/v2/bank/activity-ranking').then(data=>{if(seq!==serial)return;const b=data.badge;if(String(b?.memberId||'')!==memberId||![1,2,3].includes(b.rank))return;award.classList.add('rank-'+b.rank);award.setAttribute('aria-label','Peringkat '+b.rank+' warga teraktif');award.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m2.5 7.5 4 3.5L12 4l5.5 7 4-3.5-2.4 11H5L2.5 7.5ZM6 21h12"/></svg>';award.append(el('strong','',b.rank));award.hidden=false}).catch(()=>{});
 }
 const settings=el('section','rp-card rp-account-settings');settings.append(el('h2','','Profil saya'));
 const overview=el('div','rp-settings-person'),avatar=el('img','rp-avatar');avatar.alt='Foto profil';avatar.width=64;avatar.height=64;
 const fallback=el('span','rp-avatar rp-avatar-fallback');fallback.innerHTML='<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';fallback.hidden=true;
 function refreshAvatar(){avatar.hidden=false;fallback.hidden=true;avatar.src=API+'/api/member/avatar?v='+Date.now()}
 avatar.onerror=()=>{avatar.hidden=true;fallback.hidden=false};refreshAvatar();
 const info=el('div','rp-settings-info');info.append(el('small','','Nama tampilan'));const line=el('div','rp-settings-name'),name=el('strong','',identity.nama||'—');
 const edit=btn('',()=>{nameForm.hidden=false;line.hidden=true;nameInput.value=identity.nama||'';nameInput.focus({preventScroll:true})},'rp-edit-icon');edit.setAttribute('aria-label','Edit nama tampilan');edit.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9M16 4a2 2 0 0 1 3 3L9 17l-4 1 1-4L16 4Z"/></svg>';line.append(name,edit);info.append(line);overview.append(avatar,fallback,info);
 const nameForm=el('form','rp-settings-form');nameForm.hidden=true;const nameInput=el('input','rp-settings-input');nameInput.type='text';nameInput.required=true;nameInput.minLength=2;nameInput.maxLength=100;nameInput.autocomplete='nickname';nameInput.setAttribute('aria-label','Nama tampilan');
 const nameActions=el('div','rp-settings-actions'),save=el('button','rp-primary-action','Simpan');save.type='submit';
 const cancel=btn('Batal',()=>{nameForm.hidden=true;line.hidden=false},'rp-button');const nameStatus=el('p','rp-settings-status');nameStatus.setAttribute('role','status');nameActions.append(cancel,save);nameForm.append(nameInput,nameActions,nameStatus);
 const write=async(path,body,type='application/json')=>{const r=await __f4.globals.fetch(API+path,{method:'POST',credentials:'include',headers:{'Content-Type':type},body:type==='application/json'?JSON.stringify(body):body});const data=await r.json().catch(()=>({}));if(!r.ok||data.ok===false)throw Error(data.error||'Perubahan belum tersimpan.');return data};
 nameForm.onsubmit=async e=>{e.preventDefault();if(busy)return;const value=nameInput.value.trim().replace(/\s+/g,' ');if(value.length<2||value.length>100||/[<>\x00-\x1f]/.test(value)){nameStatus.textContent='Nama harus 2–100 karakter.';return}busy=true;save.disabled=cancel.disabled=true;nameStatus.textContent='Menyimpan…';try{const result=await write('/api/member/profile',{nama:value});if(seq!==serial)return;identity.nama=String(result.profile?.nama||value);name.textContent=identity.nama;if(cardName)cardName.textContent=shortName(identity.nama);nameForm.hidden=true;line.hidden=false;nameStatus.textContent='';win.dispatchEvent(new CustomEvent('f4-account-profile-updated',{detail:{nama:identity.nama}}))}catch(e){nameStatus.textContent=e.message}finally{busy=false;save.disabled=cancel.disabled=false}};
 settings.append(overview,nameForm);
 const photo=el('details','rp-settings-detail');photo.append(el('summary','','Ubah foto profil'));const photoForm=el('form','rp-settings-form'),file=el('input','rp-settings-input');file.type='file';file.accept='image/jpeg,image/png,image/webp';file.required=true;file.setAttribute('aria-label','Pilih foto profil');
 const photoSave=el('button','rp-primary-action','Simpan foto');photoSave.type='submit';const photoStatus=el('p','rp-settings-status');photoStatus.setAttribute('role','status');photoForm.append(file,el('small','rp-muted','JPG, PNG, WebP · maks. 6 MB'),photoSave,photoStatus);photo.append(photoForm);settings.append(photo);
 photoForm.onsubmit=async e=>{e.preventDefault();if(busy)return;const selected=file.files?.[0];if(!selected||selected.size>6*1024*1024){photoStatus.textContent='Pilih foto maksimal 6 MB.';return}busy=true;photoSave.disabled=true;photoStatus.textContent='Menyiapkan foto…';let url='';try{url=__f4.globals.URL.createObjectURL(selected);const img=new __f4.globals.Image();img.src=url;await img.decode();const canvas=doc.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d'),scale=Math.max(256/img.width,256/img.height),w=img.width*scale,h=img.height*scale;ctx.fillStyle='#fff';ctx.fillRect(0,0,256,256);ctx.drawImage(img,(256-w)/2,(256-h)/2,w,h);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.76));if(!blob)throw Error('Foto gagal diproses.');await write('/api/member/avatar',blob,'image/jpeg');if(seq!==serial)return;refreshAvatar();win.f4RefreshDirectAvatar?.();file.value='';photoStatus.textContent='Foto profil berhasil disimpan.'}catch(e){photoStatus.textContent=e.message||'Foto belum tersimpan.'}finally{if(url)__f4.globals.URL.revokeObjectURL(url);busy=false;photoSave.disabled=false}};
 const pwd=el('details','rp-settings-detail');pwd.append(el('summary','','Ganti password'));const passForm=el('form','rp-settings-form');function passField(label,autocomplete){const wrap=el('label');wrap.append(el('span','',label));const field=el('input','rp-settings-input');field.type='password';field.required=true;field.autocomplete=autocomplete;field.maxLength=128;wrap.append(field);passForm.append(wrap);return field}
 const old=passField('Password sekarang','current-password'),next=passField('Password baru','new-password');next.minLength=4;const pwdSave=el('button','rp-primary-action','Simpan password baru');pwdSave.type='submit';const pwdStatus=el('p','rp-settings-status');pwdStatus.setAttribute('role','status');passForm.append(pwdSave,pwdStatus);pwd.append(passForm);settings.append(pwd);
 passForm.onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;pwdSave.disabled=true;pwdStatus.textContent='Menyimpan…';try{await write('/api/auth/change-password',{currentPassword:old.value,newPassword:next.value});passForm.reset();pwdStatus.textContent='Password diperbarui. Silakan masuk kembali.';busy=false;win.dispatchEvent(new CustomEvent('f4-account-password-updated'))}catch(e){pwdStatus.textContent=e.message}finally{busy=false;pwdSave.disabled=false}};
 root.append(settings);
}

});
