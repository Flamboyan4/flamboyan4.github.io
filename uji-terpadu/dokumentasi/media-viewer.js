/* Galeri dokumentasi: pola 2 overlay seperti Bank Sampah, bukan <dialog>
   yang bertabrakan dengan shell iframe. API publik tetap sama. */
(()=>{'use strict';
const node=(tag,cls='',label)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(label!==undefined)el.textContent=String(label);return el;};
const svg=(name)=>{
 const paths={close:'<path d="M18 6 6 18M6 6 18 18"/>',prev:'<path d="m15 18-6-6 6-6"/>',next:'<path d="m9 18 6-6-6-6"/>'};
 return '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
};
const safe=value=>{try{const u=new URL(String(value||''),location.href);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}};
const normalize=item=>{
 if(typeof item==='string')item={url:item};
 if(!item||typeof item!=='object')return null;
 const raw=String(item.url||item.src||'');
 const type=/video|mp4|webm/i.test(String(item.type||item.mimeType||'')+' '+raw)?'video':'foto';
 const id=raw.match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,})/)?.[1];
 return {url:safe(raw),type,caption:String(item.caption||item.nama||'').slice(0,140),
  embed:type==='video'&&id&&/drive\.google\.com/.test(raw)?'https://drive.google.com/file/d/'+id+'/preview':null};
};
let album=null,photo=null,items=[],at=0,albumTitle='Dokumentasi',lastTile=null,closing=false;
const isOpen=el=>!!el&&!el.hidden;
const show=(el,on)=>{if(!el)return;el.hidden=!on;el.setAttribute('aria-hidden',String(!on));};
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
 const bar=node('div','f4p-photo-head'),name=node('strong','f4p-photo-name'),cx=node('button','f4p-close');cx.type='button';cx.innerHTML=svg('close');cx.setAttribute('aria-label','Tutup foto');cx.title='Tutup foto';cx.onclick=closeTop;bar.append(name,cx);
 const stage=node('div','f4p-photo-stage'),prev=node('button','f4p-photo-arrow'),next=node('button','f4p-photo-arrow');
 prev.innerHTML=svg('prev');next.innerHTML=svg('next');prev.type=next.type='button';prev.title='Sebelumnya';next.title='Berikutnya';
 prev.setAttribute('aria-label','Media sebelumnya');next.setAttribute('aria-label','Media berikutnya');
 prev.onclick=()=>shift(-1);next.onclick=()=>shift(1);
 const view=node('div','f4p-photo-content');stage.append(prev,view,next);
 const countPhoto=node('div','f4p-photo-count');photo.append(bar,stage,countPhoto);document.body.append(photo);
 photo.addEventListener('click',e=>{if(e.target===photo||e.target===stage||e.target===view)closeTop()});
 document.addEventListener('keydown',e=>{
  if(!isOpen(photo)&&!isOpen(album))return;
  if(e.key==='Escape'||e.key==='Backspace'&&e.target===document.body){e.preventDefault();closeTop();return}
  if(isOpen(photo)&&e.key==='ArrowLeft'){e.preventDefault();shift(-1)}
  if(isOpen(photo)&&e.key==='ArrowRight'){e.preventDefault();shift(1)}
 });
 window.addEventListener('popstate',()=>{
  closing=false;
  const layer=history.state?.f4DocOverlay;
  if(isOpen(photo)&&layer!=='photo'){show(photo,false);view.replaceChildren();if(isOpen(album))lastTile?.focus({preventScroll:true});}
  if(isOpen(album)&&layer!=='photo'&&layer!=='album')show(album,false);
 });
}
function closeTop(){
 if(closing)return;
 const layer=history.state?.f4DocOverlay;
 if((isOpen(photo)&&layer==='photo')||(isOpen(album)&&layer==='album')){
  closing=true;history.back();return;
 }
 if(isOpen(photo)){show(photo,false);photo.querySelector('.f4p-photo-content').replaceChildren();return;}
 if(isOpen(album))show(album,false);
}
function pushLayer(layer){
 // Independent history entry for each level. Browser Back returns to previous level.
 history.pushState({...history.state,f4DocOverlay:layer},'',location.href);
 closing=false;
}
function renderPhoto(){
 if(!photo||!items.length)return;
 const item=items[at];photo.querySelector('.f4p-photo-name').textContent=item.caption||albumTitle;
 const view=photo.querySelector('.f4p-photo-content');view.replaceChildren();
 if(item.type==='video'){
  if(item.embed){const frame=node('iframe','f4p-media-frame');frame.src=item.embed;frame.title=item.caption||albumTitle;frame.allowFullscreen=true;frame.allow='autoplay; fullscreen';view.append(frame)}
  else{const video=node('video','f4p-media-video');video.controls=true;video.playsInline=true;video.preload='metadata';video.src=item.url;view.append(video)}
 }else{
  const img=node('img','f4p-media-photo');img.src=item.url;img.alt=item.caption||albumTitle;img.loading='eager';img.decoding='async';
  img.onerror=()=>{if(img.isConnected)img.replaceWith(node('p','f4p-media-error','Foto tidak dapat dimuat.'))};
  view.append(img);
 }
 photo.querySelector('.f4p-photo-count').textContent=(at+1)+' dari '+items.length;
 for(const b of photo.querySelectorAll('.f4p-photo-arrow'))b.hidden=items.length<2;
}
function shift(n){if(!items.length)return;at=(at+n+items.length)%items.length;renderPhoto()}
function openPhoto(index=0){ensure();if(!items.length)return;at=Math.max(0,Math.min(index,items.length-1));renderPhoto();
 if(!isOpen(photo)){pushLayer('photo');show(photo,true)}
 photo.querySelector('.f4p-close')?.focus({preventScroll:true});
}
function openMediaViewer(title,records,index=0){
 ensure();items=(records||[]).map(normalize).filter(x=>x?.url);if(!items.length)return;
 albumTitle=title||'Dokumentasi';openPhoto(index);
}
function openMediaGallery(title,records,opts={}){
 ensure();
 if(isOpen(photo))return;
 items=(records||[]).map(normalize).filter(x=>x?.url);
 albumTitle=title||'Dokumentasi';
 album.querySelector('.f4p-album-title').textContent=albumTitle;
 album.querySelector('.f4p-album-count').textContent=items.length+' media';
 const grid=album.querySelector('.f4p-album-grid');grid.replaceChildren();
 if(!items.length)grid.append(node('p','f4p-media-empty',opts.empty||'Belum ada foto/video.'));
 items.forEach((item,index)=>{
  const button=node('button','f4p-album-tile');button.type='button';button.title=item.caption||albumTitle;
  if(item.type==='video'){
   if(item.embed){const marker=node('div','f4p-video-thumb');marker.innerHTML='<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><path d="m9 7 7 5-7 5z"/></svg>';button.append(marker)}
   else {const video=node('video','f4p-tile-video');video.muted=true;video.preload='metadata';video.src=item.url;button.append(video,node('span','f4p-tile-play','▶'))}
  }else{const img=node('img','f4p-tile-image');img.src=item.url;img.alt=item.caption||albumTitle;img.loading='lazy';img.onerror=()=>{if(img.isConnected)img.replaceWith(node('div','f4p-video-thumb','Foto'))};button.append(img)}
  button.onclick=()=>{lastTile=button;openPhoto(index)};
  grid.append(button);
 });
 if(!isOpen(album)){pushLayer('album');show(album,true)}
 album.querySelector('.f4p-close')?.focus({preventScroll:true});
}
window.f4MediaGallery={openMediaViewer,openMediaGallery};
})();