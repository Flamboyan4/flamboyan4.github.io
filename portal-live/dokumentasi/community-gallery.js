/* Galeri Warga: satu unggahan bisa satu atau banyak foto. Semua interaksi disimpan di D1. */
(()=>{'use strict';
const API='https://api.flamboyan4.web.id/api/v2/gallery';
const icons={
 upload:'<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
 comment:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.8-5.2a8.5 8.5 0 1 1 16.2-4.3z"/>',
 share:'<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/>',
 close:'<path d="M18 6 6 18M6 6l12 12"/>',
 shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6M10 10v7m4-7v7"/>',
 folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z"/>',
 flag:'<path d="M5 22V4m0 1q5-4 9 0t7 0v12q-4 4-9 0t-7 0"/>',
 camera:'<path d="M14 4h-4L8 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="14" r="3.5"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 images:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/><circle cx="13" cy="12" r="1.5"/><path d="m9 19 4-4 3 3 2-2 3 3"/>',
 sparkle:'<path d="m12 2 2.3 6.7L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3L12 2z"/>'
};
const svg=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
const elem=(tag,cls='',content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e};
const button=(label,icon,fn,cls='')=>{
 const b=elem('button','f4g-btn '+cls);b.type='button';
 if(icon){const i=elem('span');i.innerHTML=svg(icon);b.append(i)}
 if(label!==null)b.append(elem('span','',label));
 if(fn)b.addEventListener('click',fn);return b;
};
const endpoint=path=>API+path;
const get=async path=>{
 const r=await fetch(endpoint(path),{credentials:'include',cache:'no-store'});
 const data=await r.json().catch(()=>({}));
 if(!r.ok||data.ok===false)throw Error(data.error||'HTTP '+r.status);
 return data;
};
const post=async(path,payload)=>{
 const r=await fetch(endpoint(path),{method:'POST',credentials:'include',cache:'no-store',
  headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
 const data=await r.json().catch(()=>({}));
 if(!r.ok||data.ok===false)throw Error(data.error||'HTTP '+r.status);
 return data;
};
let user=null,ready=false,collection=null,photoTarget=null,albumTarget=null,sessionChecked=false;
const activeSession=async()=>{
 try{const r=await fetch('https://api.flamboyan4.web.id/api/v2/auth/session',{credentials:'include',cache:'no-store'});const data=await r.json();user=r.ok?data.account:null;}
 catch{user=null}
 sessionChecked=true;return user;
};
const signedIn=async()=>{
 const who=await activeSession();
 if(!who){window.f4ShowLogin?.();throw Error('Silakan login sebagai warga terlebih dahulu.')}
 return who;
};
let popupSequence=0;
function popup(title,wide=false,commentSheet=false){
 const shade=elem('div','f4g-overlay'+(commentSheet?' f4g-comment-overlay':''));shade.setAttribute('role','presentation');
 const panel=elem('section','f4g-panel'+(wide?' wide':''));panel.setAttribute('role','dialog');
 panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',title);
 const head=elem('header','f4g-head'),strong=elem('strong','',title);
 const closeBtn=button(null,'close',()=>close());closeBtn.setAttribute('aria-label','Tutup');
 const body=elem('div','f4g-body');
 const token='gallery-dialog-'+(++popupSequence);
 const cleanups=[];let closed=false;
 history.pushState({...history.state,f4gDialog:token},'',location.href);
 const close=(fromHistory=false)=>{
  if(closed)return;
  closed=true;
  for(const cleanup of cleanups)try{cleanup()}catch{}
  shade.remove();document.removeEventListener('keydown',escapeKey);
  window.removeEventListener('popstate',onBack);
  if(!fromHistory&&history.state?.f4gDialog===token)history.back();
 };
 const onBack=()=>{if(history.state?.f4gDialog!==token)close(true)};
 const escapeKey=e=>{
  if(e.key!=='Escape'||shade!==[...document.querySelectorAll('.f4g-overlay')].at(-1))return;
  e.preventDefault();e.stopPropagation();close();
 };
 head.append(strong,closeBtn);panel.append(head,body);shade.append(panel);
 shade.addEventListener('click',e=>{if(e.target===shade)close()});
 document.addEventListener('keydown',escapeKey);window.addEventListener('popstate',onBack);document.body.append(shade);
 if(commentSheet){
  let startY=null;
  head.addEventListener('touchstart',e=>{startY=e.touches[0]?.clientY??null},{passive:true});
  head.addEventListener('touchend',e=>{
   const finish=e.changedTouches[0]?.clientY;
   if(startY!==null&&finish!==undefined&&finish-startY>85)close();
   startY=null;
  },{passive:true});
 }
 return {body,close,panel,head,onClose:fn=>cleanups.push(fn)};
}

function toast(note){
 document.querySelector('.f4g-toast')?.remove();
 const n=elem('div','f4g-toast',note);n.setAttribute('role','status');document.body.append(n);
 setTimeout(()=>n.remove(),2600);
}
function notice(note){
 const dlg=popup('Informasi');
 dlg.body.append(elem('p','f4g-note',note),button('Tutup','close',dlg.close));
}
function confirmAction(question,action){
 const dlg=popup('Konfirmasi');
 dlg.body.append(elem('p','f4g-note',question));
 const row=elem('div','f4g-row end');
 row.append(button('Batal','close',dlg.close),button('Lanjutkan','arrow',async()=>{
  dlg.close();await action();
 },'primary'));dlg.body.append(row);
}
function renameAction(current,action){
 const dlg=popup('Ubah Nama Album');
 const control=field(dlg.body,'Nama album','input','Nama album baru');
 control.value=current;control.maxLength=100;
 const row=elem('div','f4g-row end');
 row.append(button('Batal','close',dlg.close),button('Simpan','arrow',async()=>{
  const name=control.value.trim();if(name.length<3){message(dlg.body,'Nama album minimal 3 karakter.',true);return}
  try{await action(name);dlg.close()}catch(e){message(dlg.body,e.message,true)}
 },'primary'));
 dlg.body.append(row);control.focus();
}
function manualCopy(url){
 const dlg=popup('Salin Tautan');
 const input=field(dlg.body,'Tautan langsung ke galeri','input');input.value=url;input.readOnly=true;input.select();
 dlg.body.append(button('Salin Tautan','share',async()=>{
  try{await navigator.clipboard.writeText(url);dlg.close();toast('Tautan berhasil disalin.')}
  catch{input.select()}
 },'primary'));
}

const message=(container,text,bad=false)=>{
 let p=container.querySelector('.f4g-status');
 if(!p){p=elem('p','f4g-status');container.append(p)}
 p.textContent=text||'';p.hidden=!text;p.classList.toggle('error',bad);return p;
};
function field(parent,label,tag='input',placeholder=''){
 const wrap=elem('div','f4g-field'),lab=elem('label','',label),control=elem(tag);
 control.placeholder=placeholder;lab.append();wrap.append(lab,control);parent.append(wrap);return control;
}
function photoLink(target){
 const u=new URL('/dokumentasi/',location.origin);
 if(target.albumId)u.searchParams.set('album',target.albumId);
 if(target.type==='photo'&&target.id)u.searchParams.set('foto',target.id);
 return u.href;
}
// Siapkan link saat album/foto dibuka agar browser HP tetap bisa memakai native share.
const shareLinks=new Map();
function prepareShare(target){
 const original=photoLink(target);
 if(!target?.id||!target.albumId)return Promise.resolve(original);
 const key=target.type+':'+target.albumId+':'+(target.type==='photo'?target.id:'');
 if(!shareLinks.has(key)){
  const ready=post('/share',{type:target.type,id:target.id,albumId:target.albumId})
   .then(data=>data.url||original).catch(()=>original);
  shareLinks.set(key,ready);
 }
 return shareLinks.get(key);
}
async function share(target){
 const url=await prepareShare(target);
 if(navigator.share){try{await navigator.share({title:target.title||'Dokumentasi Flamboyan 4',url});return}catch(e){if(e.name==='AbortError')return}}
 try{await navigator.clipboard.writeText(url);toast('Tautan berhasil disalin.')}catch{manualCopy(url)}
}
function socialButtons(host,target,isPhoto,onLoaded){
 host.replaceChildren();
 if(!target?.id)return;
 const like=button('0','heart',async()=>{
  try{await signedIn();const result=await post('/react',{type:target.type,id:target.id});updateSocial(result);onLoaded?.(result)}
  catch(e){if(user)notice(e.message)}
 });
 const comments=button('0','comment',()=>openComments(target));
 comments.setAttribute('aria-label','Buka komentar '+(target.type==='album'?'album':'foto'));
 const shareBtn=button(isPhoto?'Bagikan':null,'share',()=>share(target));
 shareBtn.setAttribute('aria-label',isPhoto?'Bagikan foto':'Bagikan album');
 host.append(like,comments,shareBtn);
 if(isPhoto)host.append(button(null,'flag',()=>report(target)));
 const updateSocial=data=>{
  like.querySelector('span:last-child').textContent=String(data.likes||0);
  like.classList.toggle('f4g-liked',!!data.liked);
  comments.querySelector('span:last-child').textContent=String(data.comments?.length||0);
 };
 get('/social?type='+encodeURIComponent(target.type)+'&id='+encodeURIComponent(target.id))
 .then(data=>{if(host.isConnected){updateSocial(data);onLoaded?.(data)}}).catch(()=>{like.disabled=true;comments.disabled=true});
}
async function openComments(target){
 const dlg=popup('Komentar '+(target.type==='album'?'Album':'Foto'),false,true);
 const comments=elem('div','f4g-comment-list');dlg.body.append(comments);
 const form=elem('form','f4g-comment-form'),text=elem('textarea');
 text.placeholder='Tulis komentar untuk warga…';text.maxLength=500;text.rows=1;
 text.setAttribute('aria-label','Tulis komentar untuk warga');
 text.addEventListener('input',()=>{text.style.height='46px';text.style.height=Math.min(100,Math.max(46,text.scrollHeight))+'px'});
 const send=button(null,'send',null,'primary f4g-comment-send');send.type='submit';send.setAttribute('aria-label','Kirim komentar');send.title='Kirim komentar';
 form.append(text,send);dlg.body.append(form);
 const load=async()=>{
  comments.replaceChildren(elem('p','f4g-note','Memuat komentar…'));
  try{
   const data=await get('/social?type='+encodeURIComponent(target.type)+'&id='+encodeURIComponent(target.id));
   comments.replaceChildren();
   if(!data.comments.length)comments.append(elem('p','f4g-note','Belum ada komentar.'));
   for(const c of data.comments){
    const row=elem('div','f4g-comment'),avatar=elem('div','f4g-comment-avatar');
    avatar.innerHTML=svg('user');
    const content=elem('div','f4g-comment-main'),name=elem('b','',c.author||'Warga'),body=elem('p','',c.message||'');
    content.append(name,body);row.append(avatar,content);
    if(user?.role==='superadmin')row.append(button(null,'trash',async()=>{
     confirmAction('Sembunyikan komentar ini?',async()=>{try{await post('/admin',{action:'hide_comment',id:c.id});await load()}catch(e){notice(e.message)}})
    }));
    comments.append(row);
   }
  }catch(e){comments.replaceChildren(elem('p','f4g-status error',e.message))}
 };
 form.addEventListener('submit',async e=>{
  e.preventDefault();const value=text.value.trim();if(!value)return;
  try{await signedIn();send.disabled=true;await post('/comment',{type:target.type,id:target.id,message:value});text.value='';await load()}
  catch(err){if(user)message(dlg.body,err.message,true)}
  finally{send.disabled=false}
 });
 await load();
}
async function report(target){
 const dlg=popup('Laporkan Konten');
 dlg.body.append(elem('p','f4g-note','Laporkan foto atau album yang perlu ditinjau oleh superadmin.'));
 const reason=field(dlg.body,'Alasan','textarea','Contoh: Foto pribadi atau tidak sesuai kegiatan');
 const submit=button('Kirim Laporan','flag',async()=>{
  try{await signedIn();await post('/report',{type:target.type,id:target.id,reason:reason.value.trim()||'Perlu ditinjau'});dlg.close();toast('Laporan diterima pengurus.')}
  catch(e){if(user)message(dlg.body,e.message,true)}
 },'primary');
 dlg.body.append(submit);
}
function refreshGallery(){
 location.assign('/dokumentasi/');
}
async function imageBlob(file){
 if(file.size>20*1024*1024)throw Error('Foto '+file.name+' melebihi 20 MB.');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error(file.name+' bukan JPG, PNG, atau WebP.');
 const bitmap=await createImageBitmap(file);
 try{
  const scale=Math.min(1,2560/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.84));
  if(!blob||blob.size>5*1024*1024)throw Error('Foto terlalu besar setelah dikompresi.');
  return blob;
 }finally{bitmap.close()}
}
async function uploadDialog(){
 if(!window.f4GalleryCommunity){
  try{window.f4GalleryCommunity=await get('')}
  catch(e){notice('Koneksi galeri belum siap: '+e.message);return}
 }
 const enabled=Boolean(window.f4GalleryCommunity.uploadEnabled);
 const dlg=popup('Unggah Foto Warga');
 if(!enabled){
  const note=elem('div','f4g-upload-offline');
  const mark=elem('span','f4g-upload-offline-icon');mark.innerHTML=svg('shield');
  const copy=elem('div');
  copy.append(elem('strong','','Penyimpanan Google Drive belum terhubung'),
   elem('p','','Kamu tetap bisa memilih dan melihat pratinjau foto. Pengiriman belum tersedia sampai superadmin menghubungkan penyimpanan. Tidak ada foto yang dikirim sebelum itu.'));
  note.append(mark,copy);dlg.body.append(note);
  if(user?.role==='superadmin'){
   const setup=elem('a','f4g-upload-help','Panduan menghubungkan Google Drive');
   setup.href='https://github.com/Flamboyan4/flamboyan4.github.io/blob/main/docs/galeri-warga-google-drive.md';
   setup.target='_blank';setup.rel='noopener noreferrer';dlg.body.append(setup);
  }
 }
 dlg.body.append(elem('p','f4g-note','Pilih foto dan album.'));
 if(enabled&&user?.role==='superadmin'){
  const check=elem('div','f4g-drive-check');
  check.setAttribute('role','status');
  check.append(elem('span','', 'Memeriksa izin Google Drive dan folder Upload Warga…'));
  dlg.body.append(check);
  get('/drive-status').then(data=>{
   if(!check.isConnected)return;
   check.classList.toggle('error',!data.writable);
   check.textContent=data.writable?'Koneksi Drive aktif: folder Upload Warga dapat ditulis.':(data.detail||'Koneksi Google Drive belum siap.');
  }).catch(e=>{if(check.isConnected){check.classList.add('error');check.textContent='Gagal mengecek izin Google Drive: '+e.message;}});
 }
 const drop=elem('div','f4g-drop');
 const icon=elem('span');icon.innerHTML=svg('upload');drop.append(icon,elem('strong','','Pilih foto dari perangkat'));
 const picker=elem('input');picker.type='file';picker.accept='image/jpeg,image/png,image/webp';picker.multiple=true;drop.append(picker);
 drop.append(elem('p','f4g-note','Maks. 12 foto · JPG, PNG, WebP'));
 dlg.body.append(drop);
 const preview=elem('div','f4g-previews');dlg.body.append(preview);
 const album=field(dlg.body,'Tujuan album','select');
 const makeOption=(value,label)=>{const o=elem('option','',label);o.value=value;return o};
 const options=window.f4GalleryAlbums?.()||[];
 album.append(makeOption('','Pilih album…'));
 for(const a of options)album.append(makeOption(a.id,a.title));
 album.append(makeOption('__new','+ Buat album baru'));
 const newWrap=elem('div','f4g-field');newWrap.hidden=true;newWrap.append(elem('label','','Nama album baru'));
 const newTitle=elem('input');newTitle.placeholder='Contoh: Arisan November 2026';newTitle.maxLength=100;newWrap.append(newTitle);
 dlg.body.append(newWrap);album.addEventListener('change',()=>newWrap.hidden=album.value!=='__new');
 const caption=field(dlg.body,'Keterangan foto (opsional)','textarea','Ceritakan momen kegiatan…');
 caption.maxLength=350;
 const composer=elem('div','f4g-upload-layout');
 const media=elem('div','f4g-upload-media'),settings=elem('div','f4g-upload-settings');
 const section=elem('strong','f4g-upload-section-title','Foto yang dipilih');
 media.append(section,drop,preview);
 settings.append(elem('strong','f4g-upload-section-title','Detail unggahan'),album.parentElement,newWrap,caption.parentElement);
 composer.append(media,settings);dlg.body.append(composer);
 const status=elem('p','f4g-status');status.hidden=true;dlg.body.append(status);
 const send=button(enabled?'Unggah Foto':'Menunggu Koneksi Drive','upload',null,'primary');send.disabled=true;dlg.body.append(send);
 if(!enabled)send.title='Unggah belum tersedia sampai Google Drive dihubungkan pengelola.';
 const viewGallery=button('Lihat di Galeri','arrow',refreshGallery,'primary');
 let files=[],urls=[],completedFiles=new Set();
 const update=()=>{
  urls.forEach(x=>URL.revokeObjectURL(x));urls=[];
  preview.replaceChildren();files=Array.from(picker.files||[]).slice(0,12);
  completedFiles.clear();viewGallery.remove();
  if(picker.files.length>12)message(dlg.body,'Maksimal 12 foto diproses dalam satu kiriman.',true);
  files.forEach(file=>{
   const fig=elem('figure'),img=elem('img'),link=URL.createObjectURL(file);urls.push(link);img.src=link;
   const label=elem('figcaption','',file.name.slice(0,24));
   fig.append(img,label);preview.append(fig);
  });
  send.disabled=!enabled||files.length===0;send.querySelector('span:last-child').textContent=enabled?'Unggah '+files.length+' Foto':'Menunggu Koneksi Drive';
 };
 picker.addEventListener('change',update);
 send.addEventListener('click',async()=>{
  if(!enabled){message(dlg.body,'Google Drive belum terhubung. Foto belum dikirim.',true);return}
  if(!files.length||completedFiles.size===files.length)return;
  if(!album.value){message(dlg.body,'Silakan pilih album tujuan.',true);return}
  send.disabled=true;picker.disabled=true;album.disabled=true;
  let albumId=album.value,done=0,errors=[];
  try{
   await signedIn();
   if(albumId==='__new'){
    const created=await post('/album',{title:newTitle.value.trim()});
    albumId=created.id;
    // Jangan membuat album duplikat jika foto pertama gagal diunggah.
    const saved=makeOption(created.id,created.title||newTitle.value.trim());
    album.insertBefore(saved,album.querySelector('option[value="__new"]'));
    album.value=created.id;newWrap.hidden=true;
   }
   for(let i=0;i<files.length;i++){
    const file=files[i];
    if(completedFiles.has(file))continue;
    message(dlg.body,'Mengunggah foto '+(completedFiles.size+1)+' dari '+files.length+'…');
    try{
     const blob=await imageBlob(file);
     const params=new URLSearchParams({album:albumId,name:file.name.replace(/\.[^.]+$/,'')+'.jpg',caption:caption.value.trim()});
     const response=await fetch(endpoint('/upload?'+params),{
      method:'POST',body:blob,headers:{'content-type':'image/jpeg'},credentials:'include',cache:'no-store'
     });
     const data=await response.json().catch(()=>({}));
     if(!response.ok||data.ok===false)throw Error(data.error||'HTTP '+response.status);
     done++;completedFiles.add(file);
    }catch(e){errors.push(file.name+': '+e.message)}
   }
   if(done&&!viewGallery.isConnected)dlg.body.append(viewGallery);
   if(errors.length)message(dlg.body,completedFiles.size+' dari '+files.length+' foto berhasil. '+errors.slice(0,3).join(' | '),true);
   else if(done)message(dlg.body,completedFiles.size+' foto berhasil disimpan.');
  }catch(e){if(user)message(dlg.body,e.message,true)}
  finally{
   const remaining=files.length-completedFiles.size;
   if(remaining===0&&files.length){
    // Setelah semua berhasil, hanya tombol Lihat di Galeri yang ditampilkan.
    send.remove();picker.disabled=true;album.disabled=true;
   }else{
    send.disabled=!enabled||remaining===0;
    send.querySelector('span:last-child').textContent=completedFiles.size?'Coba lagi '+remaining+' Foto':'Unggah '+remaining+' Foto';
    picker.disabled=false;album.disabled=false;
   }
  }
 });
 // URL pratinjau dibersihkan juga saat menutup dengan Back, Escape, atau backdrop.
 dlg.onClose(()=>urls.forEach(x=>URL.revokeObjectURL(x)));
}
async function adminDialog(){
 try{await signedIn();if(user.role!=='superadmin'){notice('Fitur ini khusus superadmin.');return}}
 catch{return}
 const dlg=popup('Kelola Unggahan Warga',true),listBox=elem('div');
 let changed=false;
 dlg.onClose(()=>{if(changed)location.reload()});
 dlg.body.append(elem('p','f4g-admin-note','Unggahan langsung tampil. Anda dapat meninjau, memindahkan ke folder album lain, menyembunyikan, atau menghapus. Foto yang dihapus dipindahkan ke Sampah Google Drive.'));
 dlg.body.append(listBox);
 const load=async()=>{
  listBox.replaceChildren(elem('p','f4g-note','Memuat unggahan…'));
  try{
   const data=await get('/admin');
   listBox.replaceChildren();
   const allAlbums=window.f4GalleryAlbums?.()||[];
   const photos=data.photos||[];
   const pending=photos.filter(p=>p.status==='baru').length;
   listBox.append(elem('h3','','Foto warga · '+pending+' baru'));
   if(!photos.length)listBox.append(elem('p','f4g-note','Belum ada unggahan warga.'));
   for(const p of photos){
    const row=elem('div','f4g-admin-row'),img=elem('img');img.src=p.url;img.alt=p.filename;img.loading='lazy';
    const content=elem('div'),name=elem('b','',p.filename);
    const info=elem('small','',p.uploader+' · '+p.status);
    content.append(name,info);
    const actions=elem('div','f4g-row'),select=elem('select');select.setAttribute('aria-label','Album tujuan');
    for(const a of allAlbums){const o=elem('option','',a.title);o.value=a.id;select.append(o)}
    select.value=p.albumId;
    const run=async(action,rest={})=>{
     try{await post('/admin',{action,photoId:p.id,...rest});changed=true;await load()}
     catch(e){notice(e.message)}
    };
    const move=button('Pindah','folder',()=>run('move_photo',{albumId:select.value}));
    const hide=button(p.status==='disembunyikan'?'Tampilkan':'Sembunyikan','shield',()=>run(p.status==='disembunyikan'?'review_photo':'hide_photo'));
    const trash=button('Hapus','trash',()=>confirmAction('Pindahkan foto ini ke Sampah Google Drive?',()=>run('delete_photo')));
    actions.append(select,move,hide,trash);row.append(img,content,actions);listBox.append(row);
   }
   listBox.append(elem('h3','','Album yang dibuat warga'));
   for(const a of data.albums||[]){
    const row=elem('div','f4g-admin-row');
    const icon=elem('div');icon.innerHTML=svg('folder');
    const content=elem('div');content.append(elem('b','',a.title),elem('small','',a.status));
    const actions=elem('div','f4g-row');
    actions.append(button('Ubah Nama','folder',()=>renameAction(a.title,async renamed=>{
     await post('/admin',{action:'rename_album',albumId:a.id,title:renamed});changed=true;await load();
    })),button('Arsipkan','trash',()=>confirmAction('Sembunyikan album ini beserta fotonya dari publik?',async()=>{
     try{await post('/admin',{action:'delete_album',albumId:a.id});changed=true;await load()}catch(e){notice(e.message)}
    })));
    row.append(icon,content,actions);listBox.append(row);
   }
   listBox.append(elem('h3','','Laporan dari Warga'));
   for(const item of (data.reports||[]).slice(0,15)){
    listBox.append(elem('p','f4g-admin-note',item.type+' · '+item.targetId+' — '+item.reason));
   }
  }catch(e){listBox.replaceChildren(elem('p','f4g-status error',e.message))}
 };
 await load();
}

let galleryView='feed';
function setGalleryView(value){
 galleryView=value==='albums'?'albums':'feed';
 const root=document.getElementById('media-albums-section');
 if(!root)return;
 const feed=root.querySelector('.f4g-feed-pane'),albums=root.querySelector('.f4g-album-pane');
 if(feed)feed.hidden=galleryView!=='feed';
 if(albums)albums.hidden=galleryView!=='albums';
 root.querySelectorAll('[data-gallery-view]').forEach(b=>{
  const selected=b.dataset.galleryView===galleryView;
  b.setAttribute('aria-selected',String(selected));
  b.classList.toggle('selected',selected);
 });
 if(galleryView==='feed')renderRecent();
}
function renderRecent(){
 const grid=document.getElementById('f4g-feed-grid');if(!grid)return;
 const photos=window.f4GalleryRecentMedia?.()||[];grid.replaceChildren();
 if(!photos.length){
  const empty=elem('div','f4g-feed-empty');
  const icon=elem('span','f4g-feed-empty-icon');icon.innerHTML=svg('images');
  empty.append(icon,elem('strong','','Sedang memuat foto kegiatan…'),
    elem('p','','Foto dari album dokumentasi akan muncul di sini.'),
    button('Jelajahi album','images',()=>setGalleryView('albums')));
  grid.append(empty);return;
 }
 for(const item of photos){
  const card=elem('button','f4g-feed-card');card.type='button';card.setAttribute('aria-label','Buka foto dari '+item.title);
  const image=elem('img');image.src=item.url;image.loading='lazy';image.alt=item.caption||item.title;
  const info=elem('span','f4g-feed-card-caption');
  info.append(elem('strong','',item.title),elem('small','',item.caption&&item.caption!==item.title?item.caption:item.date||'Dokumentasi'));
  const badge=elem('span','f4g-feed-card-icon');badge.innerHTML=svg('images');
  card.append(image,info,badge);
  image.onerror=()=>{if(card.isConnected)card.remove()};
  card.onclick=async()=>{
   try{await window.f4GalleryOpenRecent?.(item.albumId,item.id)}
   catch(e){notice('Foto belum dapat dibuka: '+e.message)}
  };
  grid.append(card);
 }
}
function buildGalleryLayout(albums){
 let hero=albums.querySelector(':scope > .f4g-hero');if(hero)return hero;
 const head=albums.querySelector('.panel-head');if(!head)return null;
 hero=elem('header','f4g-hero');const copy=elem('div','f4g-hero-copy');
 copy.append(elem('h2','f4g-hero-title','Cerita Warga'));
 hero.append(copy,elem('div','f4g-top-actions'));albums.insertBefore(hero,head);
 const tabs=elem('nav','f4g-view-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Tampilan galeri');
 for(const [value,name,icon] of [['feed','Foto Terbaru','grid'],['albums','Album Kegiatan','images']]){
  const btn=button(name,icon,()=>setGalleryView(value),'f4g-view-button');
  btn.dataset.galleryView=value;btn.setAttribute('role','tab');tabs.append(btn);
 }
 hero.after(tabs);
 const albumPane=elem('div','f4g-album-pane');head.before(albumPane);
 for(const id of ['media-category-filters','media-search','media-albums']){
  const node=document.getElementById(id);if(node)albumPane.append(node);
 }
 albumPane.prepend(head);
 const tools=elem('div','f4g-album-tools'),filter=albumPane.querySelector('#media-category-filters'),search=albumPane.querySelector('#media-search');
 albumPane.insertBefore(tools,filter);tools.append(filter,search);
 const feed=elem('section','f4g-feed-pane');feed.setAttribute('aria-label','Foto terbaru warga');
 const tiles=elem('div','f4g-feed-grid');tiles.id='f4g-feed-grid';
 feed.append(tiles);tabs.after(feed);
 setGalleryView(galleryView);return hero;
}
function mount(){
 const albums=document.getElementById('media-albums-section');if(!albums)return;
 const hero=buildGalleryLayout(albums);if(!hero)return;
 const actions=hero.querySelector('.f4g-top-actions');actions.replaceChildren();
 const upload=button('Unggah Foto','upload',uploadDialog,'primary');
 upload.title='Unggah satu atau beberapa foto sekaligus';actions.append(upload);
 if(user?.role==='superadmin')actions.append(button('Kelola Unggahan','shield',adminDialog));
 if(user?.role==='superadmin'&&ready&&new URLSearchParams(location.search).get('kelola')==='1'&&!window.f4gAdminAutoOpened){
  window.f4gAdminAutoOpened=true;adminDialog();
 }
}
document.addEventListener('f4:gallery:recent',renderRecent);
document.addEventListener('f4:gallery:ready',()=>{ready=true;collection=window.f4GalleryCommunity;mount();renderRecent()});
document.addEventListener('f4:gallery:album',e=>{
 const target={type:'album',id:e.detail.id,albumId:e.detail.id,title:e.detail.title};
 albumTarget=target;
 void prepareShare(target);
 const head=document.querySelector('.f4p-album-overlay:not([hidden]) .f4p-album-head');
 if(!head)return;
 let actions=head.querySelector('.f4g-album-actions');
 if(!actions){actions=elem('div','f4g-album-actions');head.querySelector('.f4p-close')?.before(actions)}
 socialButtons(actions,target,false);
 if(!target.id)actions.append(button(null,'share',()=>share(target)));
});
document.addEventListener('f4:gallery:photo',e=>{
 const target={type:'photo',id:e.detail.id,albumId:e.detail.albumId,title:e.detail.title,caption:e.detail.caption};
 photoTarget=target;
 void prepareShare(target);
 const viewer=document.querySelector('.f4p-photo-overlay');
 if(!viewer)return;
 // Foto tampil penuh, tidak pernah dijadikan bottom sheet.
 // Di PC komentar tetap disajikan di panel sebelah foto seperti Facebook;
 // di HP panel ringkas menyatu dengan lightbox dan "Komentar" membuka sheet.
 viewer.classList.add('f4g-social-enabled');
 viewer.querySelector(':scope > .f4g-photo-actions')?.remove();
 let side=viewer.querySelector(':scope > .f4g-photo-side');
 if(!side){
  side=elem('aside','f4g-photo-side');
  side.setAttribute('aria-label','Detail foto dan interaksi warga');
  const head=elem('div','f4g-photo-side-head');
  const avatar=elem('span','f4g-photo-side-avatar');avatar.innerHTML=svg('images');
  const names=elem('div','f4g-photo-side-titles');
  names.append(elem('small','','DOKUMENTASI WARGA'),elem('strong','','Album'));
  head.append(avatar,names);
  const caption=elem('p','f4g-photo-side-caption');
  const actions=elem('div','f4g-photo-actions');
  const commentsSection=elem('div','f4g-photo-side-comments');
  const title=elem('strong','f4g-photo-comment-title','Komentar Warga');
  const list=elem('div','f4g-photo-comment-preview');
  const all=button('Lihat semua komentar','comment',()=>openComments(photoTarget),'f4g-photo-all');
  commentsSection.append(title,list,all);
  const form=elem('form','f4g-photo-quick-form');
  const input=elem('textarea');input.placeholder='Tulis komentar…';input.maxLength=500;input.rows=2;
  const submit=button(null,'send',null,'primary f4g-comment-send');submit.type='submit';submit.setAttribute('aria-label','Kirim komentar');
  form.append(input,submit);
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   const value=input.value.trim(),current=photoTarget;
   if(!value||!current?.id)return;
   try{
    await signedIn();submit.disabled=true;
    await post('/comment',{type:'photo',id:current.id,message:value});
    input.value='';
    if(photoTarget?.id===current.id){
     document.dispatchEvent(new CustomEvent('f4:gallery:photo',{detail:current}));
    }
   }catch(error){if(user)notice(error.message)}
   finally{submit.disabled=false}
  });
  side.append(head,caption,actions,commentsSection,form);
  viewer.append(side);
 }
 side.querySelector('.f4g-photo-side-titles strong').textContent=target.title||'Dokumentasi';
 const caption=String(target.caption||'').trim();
 const fileLabel=/^(WhatsApp (?:Image|Video)|IMG[_-]|DSC[_-]|PXL[_-]|VID[_-])/i.test(caption)||/\.(?:jpe?g|png|webp|mp4|mov|webm)$/i.test(caption);
 const captionNode=side.querySelector('.f4g-photo-side-caption');
 captionNode.textContent=caption&&!fileLabel?caption:'';
 captionNode.hidden=!captionNode.textContent;
 const preview=side.querySelector('.f4g-photo-comment-preview');
 const renderPreview=data=>{
  if(photoTarget?.id!==target.id||!preview.isConnected)return;
  preview.replaceChildren();
  const rows=data.comments||[];
  side.querySelector('.f4g-photo-side-comments')?.classList.toggle('f4g-no-comments',!rows.length);
  if(!rows.length){
   preview.append(elem('p','f4g-photo-no-comments','Belum ada komentar.'));
  }else for(const item of rows.slice(0,2)){
   const line=elem('p','f4g-photo-comment');
   line.append(elem('b','',(item.author||item.nama||'Warga')+': '),document.createTextNode(item.message||''));
   preview.append(line);
  }
 };
 const actions=side.querySelector('.f4g-photo-actions');
 if(target.id)socialButtons(actions,target,true,renderPreview);
 else{
  actions.replaceChildren(button('Bagikan','share',()=>share(target)));
  renderPreview({comments:[]});
 }
});
document.addEventListener('f4:auth-changed',()=>activeSession().then(mount));
mount();
activeSession().then(mount);
})();