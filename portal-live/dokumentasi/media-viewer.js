/* Galeri dokumentasi: pola 2 overlay seperti Bank Sampah, bukan <dialog>
   yang bertabrakan dengan shell iframe. API publik tetap sama. */
(()=>{'use strict';
const node=(tag,cls='',label)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(label!==undefined)el.textContent=String(label);return el;};
const svg=(name)=>{
 const paths={
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  prev:'<path d="m15 18-6-6 6-6"/>',
  next:'<path d="m9 18 6-6-6-6"/>',
  play:'<path d="m8 5 11 7-11 7V5z"/>',
  images:'<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M8 21h11a2 2 0 0 0 2-2V8"/>',
  zoomIn:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="M16 16l5 5M7.5 10.5h6m-3-3v6"/>',
  zoomOut:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="M16 16l5 5M7.5 10.5h6"/>',
  pause:'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  volume:'<path d="M11 5 6 9H3v6h3l5 4zM15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/>',
  volumeOff:'<path d="M11 5 6 9H3v6h3l5 4zM16 9l5 6m0-6-5 6"/>',
  maximize:'<path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m13-5v4a1 1 0 0 1-1 1h-4"/>'
 };
 return '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
};
const safe=value=>{try{const u=new URL(String(value||''),location.href);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}};
const normalize=item=>{
 if(typeof item==='string')item={url:item};
 if(!item||typeof item!=='object')return null;
 const raw=String(item.url||item.src||'');
 const type=/video|mp4|webm/i.test(String(item.type||item.mimeType||'')+' '+raw)?'video':'foto';
 const id=raw.match(/(?:\/d\/|[?&]id=|\/d\/)([A-Za-z0-9_-]{12,})/)?.[1];
 const yt=raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/i)?.[1];
 return {url:safe(raw),type,id:String(item.id|| (id?'gdrive:'+id:'')).slice(0,190),albumId:String(item.albumId||'').slice(0,180),caption:String(item.caption||item.nama||'').slice(0,140),
  embed:type==='video'&&id&&/drive\.google\.com/.test(raw)?'https://drive.google.com/file/d/'+id+'/preview':
   type==='video'&&yt?'https://www.youtube-nocookie.com/embed/'+yt:null};
};
let album=null,photo=null,items=[],at=0,albumTitle='Dokumentasi',currentAlbumId='',mediaContext='gallery',lastTile=null,closing=false;
let photoZoom={scale:1,x:0,y:0};
function applyPhotoZoom(scale=photoZoom.scale,x=photoZoom.x,y=photoZoom.y){
 const content=photo?.querySelector('.f4p-photo-content');
 const image=content?.querySelector('img.f4p-media-photo');
 if(!image)return;
 const next=Math.min(4,Math.max(1,Number(scale)||1));
 const limitX=(next-1)*content.clientWidth/2,limitY=(next-1)*content.clientHeight/2;
 photoZoom={scale:next,x:next===1?0:Math.min(limitX,Math.max(-limitX,x)),y:next===1?0:Math.min(limitY,Math.max(-limitY,y))};
 image.style.transform='translate3d('+photoZoom.x+'px,'+photoZoom.y+'px,0) scale('+photoZoom.scale+')';
 image.classList.toggle('f4p-zoomed',photoZoom.scale>1);
 const zoom=photo.querySelector('.f4p-photo-zoom');
 if(zoom){
  zoom.innerHTML=svg(photoZoom.scale>1?'zoomOut':'zoomIn');
  zoom.setAttribute('aria-label',photoZoom.scale>1?'Kembalikan ukuran foto':'Perbesar foto');
  zoom.setAttribute('aria-pressed',String(photoZoom.scale>1));
  zoom.title=photoZoom.scale>1?'Ukuran asli':'Zoom foto';
 }
}
function resetPhotoZoom(){
 photoZoom={scale:1,x:0,y:0};
 const zoom=photo?.querySelector('.f4p-photo-zoom');
 if(zoom){zoom.innerHTML=svg('zoomIn');zoom.setAttribute('aria-pressed','false');zoom.setAttribute('aria-label','Perbesar foto');zoom.title='Zoom foto';}
}
const isOpen=el=>!!el&&!el.hidden;
const timeLabel=value=>Number.isFinite(value)&&value>=0?Math.floor(value/60)+':'+String(Math.floor(value%60)).padStart(2,'0'):'0:00';
function makeVideoPlayer(item){
 const shell=node('div','f4p-video-shell'),video=node('video','f4p-media-video');
 video.src=item.url;video.preload='metadata';video.playsInline=true;video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
 video.controls=false;video.setAttribute('aria-label',item.caption||'Video kegiatan');
 const center=node('button','f4p-video-big-play');center.type='button';center.setAttribute('aria-label','Putar video');
 center.innerHTML=svg('play');
 const controls=node('div','f4p-video-controls');
 const toggle=node('button','f4p-v-btn f4p-v-toggle'),progress=node('input','f4p-v-progress');
 const time=node('output','f4p-v-time','0:00 / 0:00');
 const mute=node('button','f4p-v-btn f4p-v-mute'),full=node('button','f4p-v-btn f4p-v-fullscreen');
 [toggle,mute,full].forEach(b=>b.type='button');
 toggle.innerHTML=svg('play');toggle.setAttribute('aria-label','Putar video');
 mute.innerHTML=svg('volume');mute.setAttribute('aria-label','Bisukan suara');
 full.innerHTML=svg('maximize');full.setAttribute('aria-label','Layar penuh');
 progress.type='range';progress.min='0';progress.max='1000';progress.step='1';progress.value='0';
 progress.setAttribute('aria-label','Posisi pemutaran video');
 controls.append(toggle,progress,time,mute,full);shell.append(video,center,controls);
 let timer=0;
 const showControls=()=>{
  shell.classList.add('f4p-video-controls-visible');
  clearTimeout(timer);
  if(!video.paused)timer=setTimeout(()=>shell.classList.remove('f4p-video-controls-visible'),3200);
 };
 const update=()=>{
  const duration=Number.isFinite(video.duration)?video.duration:0;
  progress.value=duration?String(Math.round(video.currentTime/duration*1000)):'0';
  progress.disabled=!duration;
  time.textContent=timeLabel(video.currentTime)+' / '+timeLabel(duration);
  const playing=!video.paused&&!video.ended;
  toggle.innerHTML=svg(playing?'pause':'play');
  toggle.setAttribute('aria-label',playing?'Jeda video':'Putar video');
  center.hidden=playing;
  center.setAttribute('aria-label',playing?'Jeda video':'Putar video');
  mute.innerHTML=svg(video.muted?'volumeOff':'volume');
  mute.setAttribute('aria-label',video.muted?'Aktifkan suara':'Bisukan suara');
  shell.classList.toggle('f4p-video-playing',playing);
  if(!playing)showControls();
 };
 const togglePlay=()=>{
  if(video.paused||video.ended){
   if(video.ended)video.currentTime=0;
   const pending=video.play();if(pending?.catch)pending.catch(()=>showControls());
  }else video.pause();
  showControls();
 };
 center.addEventListener('click',togglePlay);
 toggle.addEventListener('click',togglePlay);
 video.addEventListener('click',()=>{if(!shell.classList.contains('f4p-video-controls-visible'))showControls();else togglePlay()});
 progress.addEventListener('input',()=>{if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=video.duration*Number(progress.value)/1000;showControls()});
 mute.addEventListener('click',()=>{video.muted=!video.muted;update();showControls()});
 full.addEventListener('click',()=>{
  if(document.fullscreenElement){document.exitFullscreen?.();return}
  if(shell.requestFullscreen)shell.requestFullscreen().catch(()=>{});
  else video.webkitEnterFullscreen?.();
 });
 shell.addEventListener('pointermove',showControls);
 shell.addEventListener('touchstart',showControls,{passive:true});
 for(const type of ['timeupdate','durationchange','loadedmetadata','play','pause','ended','volumechange'])video.addEventListener(type,update);
 video.addEventListener('error',()=>{
  if(!shell.isConnected)return;
  const fail=node('p','f4p-media-error','Video belum bisa diputar.');
  // Hindari tautan unduh/asli Google di penampil warga.
  shell.replaceChildren(fail);
 });
 update();return shell;
}
function stopVideo(){
 const view=photo?.querySelector('.f4p-photo-content');
 view?.querySelector('video.f4p-media-video')?.pause();
}
const show=(el,on)=>{
 if(!el)return;
 el.hidden=!on;el.setAttribute('aria-hidden',String(!on));
 // Album tetap menyimpan posisi foto, tetapi tidak tampak/terbaca di belakang lightbox.
 // Saat foto ditutup, album kembali ke posisi semula.
 if(album){
  const behindPhoto=isOpen(photo);
  album.classList.toggle('f4p-under-photo',behindPhoto);
  album.setAttribute('aria-hidden',String(behindPhoto||!isOpen(album)));
 }
 const active=isOpen(album)||isOpen(photo);
 document.documentElement.classList.toggle('f4p-overlay-active',active);
 document.body.classList.toggle('f4p-overlay-active',active);
 if(window.parent!==window)window.parent.postMessage({type:'f4:overlay-state',portal:'dokumentasi',open:active},location.origin);
};
function ensure(){
 if(album)return;
 album=node('div','f4p-overlay f4p-album-overlay');album.hidden=true;album.setAttribute('role','dialog');album.setAttribute('aria-label','Album dokumentasi');album.setAttribute('aria-modal','true');
 const card=node('div','f4p-album-card'),head=node('header','f4p-album-head'),labels=node('div','f4p-album-labels');
 const title=node('h2','f4p-album-title'),count=node('small','f4p-album-count');labels.append(title,count);
 const x=node('button','f4p-close');x.type='button';x.innerHTML=svg('close');x.title='Tutup album';x.setAttribute('aria-label','Tutup album');x.onclick=closeTop;
 head.append(labels,x);
 const grid=node('div','f4p-album-grid');card.append(head,grid);album.append(card);document.body.append(album);
 album.addEventListener('click',e=>{if(e.target===album)closeTop()});
 photo=node('div','f4p-overlay f4p-photo-overlay');photo.hidden=true;photo.setAttribute('role','dialog');photo.setAttribute('aria-label','Penampil foto dan video');photo.setAttribute('aria-modal','true');
 const bar=node('div','f4p-photo-head'),name=node('strong','f4p-photo-name'),cx=node('button','f4p-close');cx.type='button';cx.innerHTML=svg('close');cx.setAttribute('aria-label','Tutup foto');cx.title='Tutup foto';cx.onclick=closeTop;
 const photoControls=node('div','f4p-photo-controls'),zoom=node('button','f4p-photo-zoom');
 zoom.type='button';zoom.innerHTML=svg('zoomIn');zoom.setAttribute('aria-label','Perbesar foto');zoom.setAttribute('aria-pressed','false');zoom.title='Zoom foto';zoom.onclick=()=>applyPhotoZoom(photoZoom.scale>1?1:2.5);
 photoControls.append(zoom,cx);bar.append(name,photoControls);
 const stage=node('div','f4p-photo-stage'),prev=node('button','f4p-photo-arrow'),next=node('button','f4p-photo-arrow');
 prev.innerHTML=svg('prev');next.innerHTML=svg('next');prev.type=next.type='button';prev.title='Sebelumnya';next.title='Berikutnya';
 prev.setAttribute('aria-label','Media sebelumnya');next.setAttribute('aria-label','Media berikutnya');
 prev.onclick=()=>shift(-1);next.onclick=()=>shift(1);
 const view=node('div','f4p-photo-content');stage.append(prev,view,next);
 let navTimer=0;
 const revealNavigation=()=>{
  if(items.length<2)return;
  stage.classList.add('f4p-nav-visible');
  clearTimeout(navTimer);
  navTimer=setTimeout(()=>stage.classList.remove('f4p-nav-visible'),2300);
 };
 stage.addEventListener('pointerdown',revealNavigation,{passive:true});
 stage.addEventListener('pointermove',event=>{if(event.pointerType==='mouse')revealNavigation()},{passive:true});
 stage.addEventListener('touchstart',revealNavigation,{passive:true});
 // Zoom is isolated to the picture. The browser's document viewport remains unchanged.
 let gesture=null,lastTap=null;
 const distance=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
 view.addEventListener('touchstart',e=>{
  if(!view.querySelector('img.f4p-media-photo'))return;
  if(e.touches.length===2){
   const [a,b]=e.touches;
   gesture={kind:'pinch',distance:distance(a,b),scale:photoZoom.scale,x:photoZoom.x,y:photoZoom.y,
    cx:(a.clientX+b.clientX)/2,cy:(a.clientY+b.clientY)/2};
  }else if(e.touches.length===1&&photoZoom.scale>1){
   gesture={kind:'pan',clientX:e.touches[0].clientX,clientY:e.touches[0].clientY,x:photoZoom.x,y:photoZoom.y};
  }else gesture=null;
 },{passive:true});
 view.addEventListener('touchmove',e=>{
  if(!view.querySelector('img.f4p-media-photo'))return;
  if(e.touches.length===2&&gesture?.kind==='pinch'){
   e.preventDefault();
   const [a,b]=e.touches;
   const next=gesture.scale*(distance(a,b)/Math.max(1,gesture.distance));
   applyPhotoZoom(next,gesture.x+((a.clientX+b.clientX)/2-gesture.cx),gesture.y+((a.clientY+b.clientY)/2-gesture.cy));
  }else if(e.touches.length===1&&gesture?.kind==='pan'){
   e.preventDefault();
   applyPhotoZoom(photoZoom.scale,gesture.x+e.touches[0].clientX-gesture.clientX,gesture.y+e.touches[0].clientY-gesture.clientY);
  }
 },{passive:false});
 view.addEventListener('touchend',e=>{
  if(e.touches.length===1&&photoZoom.scale>1){
   gesture={kind:'pan',clientX:e.touches[0].clientX,clientY:e.touches[0].clientY,x:photoZoom.x,y:photoZoom.y};
   lastTap=null;return;
  }
  if(e.touches.length!==0){gesture=null;return}
  if(e.changedTouches.length===1&&gesture?.kind!=='pan'&&gesture?.kind!=='pinch'&&view.querySelector('img.f4p-media-photo')){
   const t=e.changedTouches[0],now=Date.now();
   if(lastTap&&now-lastTap.time<320&&Math.hypot(t.clientX-lastTap.x,t.clientY-lastTap.y)<36){
    applyPhotoZoom(photoZoom.scale>1?1:2.5);
    lastTap=null;
   }else lastTap={time:now,x:t.clientX,y:t.clientY};
  }else lastTap=null;
  gesture=null;
 },{passive:true});
 view.addEventListener('touchcancel',()=>{gesture=null;lastTap=null},{passive:true});
 view.addEventListener('dblclick',e=>{if(view.querySelector('img.f4p-media-photo')){e.preventDefault();applyPhotoZoom(photoZoom.scale>1?1:2.5)}});
 view.addEventListener('wheel',e=>{
  if(!isOpen(photo)||!view.querySelector('img.f4p-media-photo'))return;
  e.preventDefault();applyPhotoZoom(photoZoom.scale*Math.exp(-e.deltaY*.002));
 },{passive:false});
 // Gesture horizontal hanya untuk mengganti foto, bukan menutup penampil atau album.
 // Pasang pada stage (bukan tombol) agar foto dan video tetap bisa dikontrol.
 let touchOrigin=null;
 stage.addEventListener('touchstart',event=>{
  if(!isOpen(photo)||items.length<2||photoZoom.scale>1||event.touches.length!==1||event.target.closest('button,video,iframe,a,input,textarea')){touchOrigin=null;return;}
  const t=event.touches[0];
  touchOrigin={x:t.clientX,y:t.clientY,time:Date.now()};
 },{passive:true});
 stage.addEventListener('touchcancel',()=>{touchOrigin=null},{passive:true});
 stage.addEventListener('touchend',event=>{
  const start=touchOrigin;touchOrigin=null;
  if(!start||!isOpen(photo)||items.length<2||photoZoom.scale>1||event.changedTouches.length!==1)return;
  const end=event.changedTouches[0],dx=end.clientX-start.x,dy=end.clientY-start.y;
  if(Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.35&&Date.now()-start.time<1300){
   shift(dx<0?1:-1);
  }
 },{passive:true});
 const countPhoto=node('div','f4p-photo-count');photo.append(bar,stage,countPhoto);document.body.append(photo);
 photo.addEventListener('click',e=>{if(e.target===photo)closeTop()});
 document.addEventListener('keydown',e=>{
  if(!isOpen(photo)&&!isOpen(album))return;
  // Dialog komentar, unggah, dan konfirmasi berada di atas penampil media.
  if(document.querySelector('.f4g-overlay'))return;
  if(e.key==='Escape'||e.key==='Backspace'&&e.target===document.body){e.preventDefault();closeTop();return}
  if(isOpen(photo)&&e.key==='ArrowLeft'){e.preventDefault();shift(-1)}
  if(isOpen(photo)&&e.key==='ArrowRight'){e.preventDefault();shift(1)}
 });
 window.addEventListener('popstate',()=>{
  closing=false;
  const layer=history.state?.f4DocOverlay;
  if(isOpen(photo)&&layer!=='photo'){
   stopVideo();show(photo,false);view.replaceChildren();
   clearClosedLink('foto');
   if(isOpen(album))lastTile?.focus({preventScroll:true});
  }
  if(isOpen(album)&&layer!=='photo'&&layer!=='album'){
   show(album,false);
   clearClosedLink('album');
  }
 });
}
// Hanya URL aktif yang dibersihkan saat penampil DITUTUP.
// Link yang baru dibagikan tetap membuka foto saat pertama kali dikunjungi.
function clearClosedLink(level){
 const url=new URL(location.href);
 if(level==='foto')url.searchParams.delete('foto');
 else if(level==='album'){
  url.searchParams.delete('foto');
  url.searchParams.delete('album');
 }
 if(url.href!==location.href)history.replaceState(history.state,'',url.pathname+url.search+url.hash);
}
function closeTop(){
 if(closing)return;
 const layer=history.state?.f4DocOverlay;
 if((isOpen(photo)&&layer==='photo')||(isOpen(album)&&layer==='album')){
  closing=true;history.back();return;
 }
 if(isOpen(photo)){
  stopVideo();show(photo,false);photo.querySelector('.f4p-photo-content').replaceChildren();
  clearClosedLink('foto');return;
 }
 if(isOpen(album)){
  show(album,false);
  clearClosedLink('album');
 }
}
function pushLayer(layer){
 // Independent history entry for each level. Browser Back returns to previous level.
 history.pushState({...history.state,f4DocOverlay:layer},'',location.href);
 closing=false;
}
function renderPhoto(){
 if(!photo||!items.length)return;
 const item=items[at];
 photo.querySelector('.f4p-photo-name').textContent=albumTitle;
 const view=photo.querySelector('.f4p-photo-content');stopVideo();resetPhotoZoom();view.replaceChildren();
 if(item.type==='video'){
  const driveVideo=item.embed&&item.id&&item.embed.startsWith('https://drive.google.com/file/d/');
  if(driveVideo&&mediaContext==='gallery'){
   // Video publik tetap disimpan di Drive, tetapi kontrol milik portal sendiri.
   // URL proxy tidak memuat link asli dan OAuth hanya tersimpan di Worker.
   view.append(makeVideoPlayer({...item,url:'https://api.flamboyan4.web.id/api/v2/gallery/video/'+encodeURIComponent(item.id.replace(/^gdrive:/,''))}));
  }else if(item.embed){
   // Viewer inventaris/YouTube di luar galeri tetap seperti sebelumnya.
   const frame=node('iframe','f4p-media-frame');frame.src=item.embed;frame.title=item.caption||albumTitle;
   frame.allowFullscreen=true;frame.allow='autoplay; fullscreen';view.append(frame);
  }else view.append(makeVideoPlayer(item));
 }else{
  const img=node('img','f4p-media-photo');img.src=item.url;img.alt=item.caption||albumTitle;img.loading='eager';img.decoding='async';
  img.onerror=()=>{if(img.isConnected)img.replaceWith(node('p','f4p-media-error','Foto tidak dapat dimuat.'))};
  view.append(img);
 }
 photo.querySelector('.f4p-photo-zoom').hidden=item.type==='video';
 photo.querySelector('.f4p-photo-count').textContent=(at+1)+' / '+items.length;
 for(const b of photo.querySelectorAll('.f4p-photo-arrow'))b.hidden=items.length<2;
 if(mediaContext==='gallery')document.dispatchEvent(new CustomEvent('f4:gallery:photo',{detail:{id:item.id,albumId:currentAlbumId||item.albumId,title:albumTitle,caption:item.caption,url:item.url}}));
 else{photo.classList.remove('f4g-social-enabled');photo.querySelector('.f4g-photo-side')?.remove();photo.querySelector('.f4g-photo-actions')?.remove();}
}
function shift(n){if(!items.length)return;at=(at+n+items.length)%items.length;renderPhoto();
 photo?.querySelector('.f4p-photo-stage')?.classList.add('f4p-nav-visible');
}
function openPhoto(index=0){ensure();if(!items.length)return;at=Math.max(0,Math.min(index,items.length-1));renderPhoto();
 if(!isOpen(photo)){pushLayer('photo');show(photo,true)}
 photo.querySelector('.f4p-close')?.focus({preventScroll:true});
}
function openMediaViewer(title,records,index=0){
 ensure();items=(records||[]).map(normalize).filter(x=>x?.url);if(!items.length)return;
 albumTitle=title||'Dokumentasi';currentAlbumId='';mediaContext='inventory';openPhoto(index);
}
function openMediaGallery(title,records,opts={}){
 ensure();
 if(isOpen(photo))return;
 items=(records||[]).map(normalize).filter(x=>x?.url);
 albumTitle=title||'Dokumentasi';currentAlbumId=String(opts.albumId||'');mediaContext='gallery';
 album.querySelector('.f4p-album-title').textContent=albumTitle;
 const count=album.querySelector('.f4p-album-count');
 count.replaceChildren();
 const countIcon=node('span','f4p-count-icon');countIcon.innerHTML=svg('images');
 count.append(countIcon,node('span','',String(items.length)));
 count.setAttribute('aria-label',items.length+' media');
 const grid=album.querySelector('.f4p-album-grid');grid.replaceChildren();
 if(!items.length)grid.append(node('p','f4p-media-empty',opts.empty||'Belum ada foto/video.'));
 items.forEach((item,index)=>{
  const button=node('button','f4p-album-tile');button.type='button';button.title=item.caption||albumTitle;
  if(item.type==='video'){
   if(item.embed){const marker=node('div','f4p-video-thumb');marker.innerHTML='<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><path d="m9 7 7 5-7 5z"/></svg>';button.append(marker)}
   else {const video=node('video','f4p-tile-video');video.muted=true;video.preload='metadata';video.src=item.url;
    const play=node('span','f4p-tile-play');play.innerHTML=svg('play');button.append(video,play)}
  }else{const img=node('img','f4p-tile-image');img.src=item.url;img.alt=item.caption||albumTitle;img.loading='lazy';img.onerror=()=>{if(img.isConnected)img.replaceWith(node('div','f4p-video-thumb','Foto'))};button.append(img)}
  button.onclick=()=>{lastTile=button;openPhoto(index)};
  // Bila warga mencoba mencubit thumbnail, buka foto lalu zoom gambar,
  // bukan memperbesar keseluruhan halaman/album.
  if(item.type!=='video')button.addEventListener('touchstart',event=>{
   if(event.touches.length!==2)return;
   event.preventDefault();lastTile=button;openPhoto(index);applyPhotoZoom(2.2);
  },{passive:false});
  grid.append(button);
 });
 if(!isOpen(album)){pushLayer('album');show(album,true)}
 document.dispatchEvent(new CustomEvent('f4:gallery:album',{detail:{id:currentAlbumId,title:albumTitle}}));
 album.querySelector('.f4p-close')?.focus({preventScroll:true});
}
window.f4MediaGallery={openMediaViewer,openMediaGallery,openPhotoById:(id)=>{const n=items.findIndex(x=>x.id===id);if(n>=0)openPhoto(n);return n>=0;}};
})();