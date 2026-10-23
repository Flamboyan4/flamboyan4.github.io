(()=>{'use strict';

const safe=value=>{try{let u=new URL(String(value||''),location.href);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}};
const node=(tag,cls='',txt)=>{const n=document.createElement(tag);n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
function normalize(item){
 if(typeof item==='string')item={url:item};
 const raw=String(item.url||''),type=/video|mp4|webm/i.test(String(item.type||item.mimeType||'')+' '+raw)?'video':'foto';
 const id=raw.match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,})/)?.[1];
 return {url:safe(raw),type,caption:String(item.caption||'').slice(0,120),
  embed:type==='video'&&id&&/drive.google.com/.test(raw)?'https://drive.google.com/file/d/'+id+'/preview':null};
}
let instance=null;
function viewer(){
 if(instance)return instance;
 const dlg=node('dialog','f4-lightbox');dlg.setAttribute('aria-label','Penampil media');
 const bar=node('div','f4-lightbox-bar'),heading=node('strong','f4-lightbox-title');
 const close=node('button','f4-lightbox-close');close.type='button';close.setAttribute('aria-label','Tutup');bar.append(heading,close);
 close.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\" />\n  <path d=\"m6 6 12 12\" /></svg>";
 const body=node('div','f4-lightbox-body'),prev=node('button','f4-lightbox-arrow'),next=node('button','f4-lightbox-arrow');
 prev.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m15 18-6-6 6-6\" /></svg>";next.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\" /></svg>";
 prev.type=next.type='button';prev.setAttribute('aria-label','Foto sebelumnya');next.setAttribute('aria-label','Foto berikutnya');
 const content=node('div','f4-lightbox-view'),footer=node('div','f4-lightbox-foot');
 body.append(prev,content,next);dlg.append(bar,body,footer);document.body.append(dlg);
 let records=[],active=0,title='';
 function render(){
  const it=records[active];if(!it)return;heading.textContent=title;content.replaceChildren();
  if(it.type==='video'){
   if(it.embed){const f=node('iframe','f4-media-frame');f.src=it.embed;f.allowFullscreen=true;f.allow='autoplay; fullscreen';f.title=it.caption||title;content.append(f)}
   else{const v=node('video','f4-media-video');v.controls=true;v.preload='metadata';v.playsInline=true;v.src=it.url;
    v.onerror=()=>{const a=node('a','btn','Buka video asli');a.href=it.url;a.target='_blank';a.rel='noopener noreferrer';if(v.isConnected)v.replaceWith(a)};content.append(v)}
  }else{const img=node('img','f4-media-photo');img.src=it.url;img.alt=it.caption||title;img.onerror=()=>{const a=node('a','btn','Buka foto asli');a.href=it.url;a.target='_blank';a.rel='noopener noreferrer';if(img.isConnected)img.replaceWith(a)};content.append(img)}
  footer.replaceChildren(node('span','',String(active+1)+' dari '+records.length));
  const a=node('a','f4-media-original','Buka file asli');a.href=it.url;a.target='_blank';a.rel='noopener noreferrer';footer.append(a);
  prev.hidden=next.hidden=records.length<2;
 }
 function shift(d){active=(active+d+records.length)%records.length;render()}
 prev.onclick=()=>shift(-1);next.onclick=()=>shift(1);close.onclick=()=>dlg.close();
 dlg.onclick=e=>{if(e.target===dlg)dlg.close()};
 dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();shift(-1)}if(e.key==='ArrowRight'){e.preventDefault();shift(1)}});
 instance={open:(items,index=0,caption='Dokumentasi')=>{records=items.map(normalize).filter(x=>x.url);if(!records.length)return;active=Math.max(0,Math.min(index,records.length-1));title=caption;render();if(!dlg.open)dlg.showModal()}};return instance;
}
function openMediaViewer(title,items,index=0){viewer().open(items,index,title)}
function openMediaGallery(title,items,opts={}){
 const list=items.map(normalize).filter(x=>x.url);
 let dlg=document.getElementById('f4-album-dialog');
 if(!dlg){dlg=node('dialog','f4-album-dialog');dlg.id='f4-album-dialog';dlg.onclick=e=>{if(e.target===dlg)dlg.close()};document.body.append(dlg)}
 dlg.replaceChildren();const head=node('header','f4-album-head'),label=node('div');label.append(node('h2','',title),node('small','',list.length+' media'));
 const close=node('button','f4-album-close');close.type='button';close.setAttribute('aria-label','Tutup album');close.onclick=()=>dlg.close();
 close.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\" />\n  <path d=\"m6 6 12 12\" /></svg>";head.append(label,close);dlg.append(head);const grid=node('div','f4-album-grid');
 if(!list.length)grid.append(node('p','muted',opts.empty||'Belum ada foto atau video yang dapat ditampilkan.'));
 list.forEach((it,index)=>{
  const b=node('button','f4-album-tile');b.type='button';b.title=it.caption||title;
  if(it.type==='video'){
   if(it.embed){const marker=node('div','f4-video-thumb');marker.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\" />\n  <rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\" /></svg>";b.append(marker)}
   else{const v=node('video','f4-album-video');v.src=it.url;v.preload='metadata';v.muted=true;const play=node('span','f4-play');play.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\" /></svg>";b.append(v,play)}
  }else{const img=node('img');img.src=it.url;img.alt=it.caption||title;img.loading='lazy';img.onerror=()=>{if(img.isConnected)img.replaceWith(node('div','f4-video-thumb','Foto'))};b.append(img)}
  b.onclick=()=>openMediaViewer(title,list,index);grid.append(b);
 });
 dlg.append(grid);
 const folder=safe(opts.folderURL);
 if(folder){const bar=node('footer','f4-album-footer'),a=node('a','btn outline','Buka sumber folder');a.href=folder;a.target='_blank';a.rel='noopener noreferrer';bar.append(a);dlg.append(bar)}
 if(!dlg.open)dlg.showModal();
}

window.f4MediaGallery={openMediaViewer,openMediaGallery};
})();
