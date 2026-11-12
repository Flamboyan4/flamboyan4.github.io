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
 trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6M10 10v7m4-7v7"/>',
 folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z"/>',
 flag:'<path d="M5 22V4m0 1q5-4 9 0t7 0v12q-4 4-9 0t-7 0"/>',
 camera:'<path d="M14 4h-4L8 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="14" r="3.5"/>',
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
function popup(title,wide=false){
 const shade=elem('div','f4g-overlay');shade.setAttribute('role','presentation');
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
async function share(target){
 const url=photoLink(target);
 if(navigator.share){try{await navigator.share({title:target.title||'Dokumentasi Flamboyan 4',url});return}catch(e){if(e.name==='AbortError')return}}
 try{await navigator.clipboard.writeText(url);toast('Tautan berhasil disalin.')}catch{manualCopy(url)}
}
function socialButtons(host,target,isPhoto){
 host.replaceChildren();
 if(!target?.id)return;
 const like=button('0','heart',async()=>{
  try{await signedIn();const result=await post('/react',{type:target.type,id:target.id});updateSocial(result)}
  catch(e){if(user)notice(e.message)}
 });
 const comments=button('Komentar','comment',()=>openComments(target));
 const shareBtn=button(isPhoto?'Bagikan':null,'share',()=>share(target));
 shareBtn.setAttribute('aria-label',isPhoto?'Bagikan foto':'Bagikan album');
 host.append(like,comments,shareBtn);
 if(isPhoto)host.append(button(null,'flag',()=>report(target)));
 const updateSocial=data=>{
  like.querySelector('span:last-child').textContent=String(data.likes||0);
  like.classList.toggle('f4g-liked',!!data.liked);
  comments.querySelector('span:last-child').textContent=(data.comments?.length||0)+' komentar';
 };
 get('/social?type='+encodeURIComponent(target.type)+'&id='+encodeURIComponent(target.id))
 .then(data=>{if(host.isConnected)updateSocial(data)}).catch(()=>{like.disabled=true;comments.disabled=true});
}
async function openComments(target){
 const dlg=popup('Komentar '+(target.type==='album'?'Album':'Foto'));
 const comments=elem('div');dlg.body.append(comments);
 const form=elem('form','f4g-comment-form'),text=elem('textarea');
 text.placeholder='Tulis komentar untuk warga…';text.maxLength=500;
 const send=button('Kirim','arrow',null,'primary');send.type='submit';
 form.append(text,send);dlg.body.append(form);
 const hint=elem('p','f4g-note','Komentar akan terlihat oleh pengunjung galeri. Gunakan bahasa yang sopan.');
 dlg.body.append(hint);
 const load=async()=>{
  comments.replaceChildren(elem('p','f4g-note','Memuat komentar…'));
  try{
   const data=await get('/social?type='+encodeURIComponent(target.type)+'&id='+encodeURIComponent(target.id));
   comments.replaceChildren();
   if(!data.comments.length)comments.append(elem('p','f4g-note','Belum ada komentar.'));
   for(const c of data.comments){
    const row=elem('div','f4g-comment'),avatar=elem('div','f4g-comment-avatar',String(c.author||'W').slice(0,1).toUpperCase());
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
  dlg.body.append(elem('p','f4g-admin-note','Upload Google Drive belum tersambung. Pengelola perlu menyiapkan izin Google Drive terlebih dahulu. Galeri dan foto lama tetap dapat dilihat.'));
  return;
 }
 dlg.body.append(elem('p','f4g-note','Pilih satu atau beberapa foto. Foto langsung tampil tanpa persetujuan, dan superadmin dapat merapikannya kemudian.'));
 const drop=elem('div','f4g-drop');
 const icon=elem('span');icon.innerHTML=svg('upload');drop.append(icon,elem('strong','','Pilih foto dari perangkat'));
 const picker=elem('input');picker.type='file';picker.accept='image/jpeg,image/png,image/webp';picker.multiple=true;drop.append(picker);
 drop.append(elem('p','f4g-note','Maksimal 12 foto sekali unggah. Foto dikompresi agar lebih hemat kuota.'));
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
 const status=elem('p','f4g-status');status.hidden=true;dlg.body.append(status);
 const send=button('Unggah Foto','upload',null,'primary');send.disabled=true;dlg.body.append(send);
 let files=[],urls=[];
 const update=()=>{
  urls.forEach(x=>URL.revokeObjectURL(x));urls=[];
  preview.replaceChildren();files=Array.from(picker.files||[]).slice(0,12);
  if(picker.files.length>12)message(dlg.body,'Maksimal 12 foto diproses dalam satu kiriman.',true);
  files.forEach(file=>{
   const fig=elem('figure'),img=elem('img'),link=URL.createObjectURL(file);urls.push(link);img.src=link;
   const label=elem('figcaption','',file.name.slice(0,24));
   fig.append(img,label);preview.append(fig);
  });
  send.disabled=files.length===0;send.querySelector('span:last-child').textContent='Unggah '+files.length+' Foto';
 };
 picker.addEventListener('change',update);
 send.addEventListener('click',async()=>{
  if(!files.length)return;
  if(!album.value){message(dlg.body,'Silakan pilih album tujuan.',true);return}
  send.disabled=true;picker.disabled=true;album.disabled=true;
  let albumId=album.value,done=0,errors=[];
  try{
   await signedIn();
   if(albumId==='__new'){
    const created=await post('/album',{title:newTitle.value.trim()});
    albumId=created.id;
   }
   for(let i=0;i<files.length;i++){
    const file=files[i];
    message(dlg.body,'Mengunggah foto '+(i+1)+' dari '+files.length+'…');
    try{
     const blob=await imageBlob(file);
     const params=new URLSearchParams({album:albumId,name:file.name.replace(/\.[^.]+$/,'')+'.jpg',caption:caption.value.trim()});
     const response=await fetch(endpoint('/upload?'+params),{
      method:'POST',body:blob,headers:{'content-type':'image/jpeg'},credentials:'include',cache:'no-store'
     });
     const data=await response.json().catch(()=>({}));
     if(!response.ok||data.ok===false)throw Error(data.error||'HTTP '+response.status);
     done++;
    }catch(e){errors.push(file.name+': '+e.message)}
   }
   if(done){
    message(dlg.body,done+' foto berhasil disimpan.'+(errors.length?' '+errors.length+' foto gagal.':''));
    dlg.body.append(button('Lihat di Galeri','arrow',refreshGallery,'primary'));
   }
   if(errors.length)message(dlg.body,errors.slice(0,3).join(' | '),true);
  }catch(e){if(user)message(dlg.body,e.message,true)}
  finally{send.disabled=false;picker.disabled=false;album.disabled=false}
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
function mount(){
 const albums=document.getElementById('media-albums-section');
 if(!albums)return;
 const head=albums.querySelector('.panel-head');
 if(!head)return;
 // Aksi adalah saudara .panel-head, bukan anaknya. Pertahankan tepat satu set.
 let actions=albums.querySelector(':scope > .f4g-top-actions');
 if(!actions){actions=elem('div','f4g-top-actions');head.after(actions);}
 actions.replaceChildren();
 const upload=button('Unggah Foto','upload',uploadDialog,'primary');
 upload.title='Unggah satu atau beberapa foto sekaligus';
 actions.append(upload);
 if(user?.role==='superadmin')actions.append(button('Kelola Unggahan','shield',adminDialog));
 if(user?.role==='superadmin'&&ready&&new URLSearchParams(location.search).get('kelola')==='1'&&!window.f4gAdminAutoOpened){
  window.f4gAdminAutoOpened=true;adminDialog();
 }
}
document.addEventListener('f4:gallery:ready',()=>{ready=true;collection=window.f4GalleryCommunity;mount()});
document.addEventListener('f4:gallery:album',e=>{
 const target={type:'album',id:e.detail.id,albumId:e.detail.id,title:e.detail.title};
 albumTarget=target;
 const head=document.querySelector('.f4p-album-overlay:not([hidden]) .f4p-album-head');
 if(!head)return;
 let actions=head.querySelector('.f4g-album-actions');
 if(!actions){actions=elem('div','f4g-album-actions');head.querySelector('.f4p-close')?.before(actions)}
 socialButtons(actions,target,false);
 if(!target.id)actions.append(button(null,'share',()=>share(target)));
});
document.addEventListener('f4:gallery:photo',e=>{
 const target={type:'photo',id:e.detail.id,albumId:e.detail.albumId,title:e.detail.title};
 photoTarget=target;
 const overlay=document.querySelector('.f4p-photo-overlay');
 if(!overlay)return;
 let actions=overlay.querySelector('.f4g-photo-actions');
 if(!actions){actions=elem('div','f4g-photo-actions');overlay.append(actions)}
 socialButtons(actions,target,true);
 if(!target.id)actions.append(button('Bagikan','share',()=>share(target)));
});
document.addEventListener('f4:auth-changed',()=>activeSession().then(()=>{document.querySelector('.f4g-top-actions')?.remove();mount()}));
activeSession().then(mount);
})();