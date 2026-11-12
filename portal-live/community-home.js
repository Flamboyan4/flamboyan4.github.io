/* Cerita Warga · foto komunitas baru + dokumentasi Drive yang sudah ada.
   Mempublikasikan hanya album dokumentasi portal yang memang aktif/publik. */
(()=>{'use strict';
const section=document.getElementById('cerita-warga'),grid=document.getElementById('f4g-home-grid');
if(!section||!grid)return;
const latest=document.getElementById('f4g-home-latest'),popular=document.getElementById('f4g-home-popular');
const API='https://api.flamboyan4.web.id';
const FOLDER_API='https://script.google.com/macros/s/AKfycbyes6A9_9EQ8vIYtf75cGgC9sKAZBvMewxEhYRSThjMAlBYqnkmKpa3yoPOtN0FEG92Zg/exec';
const icon=name=>{
 const paths={heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  comment:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.8-5.2a8.5 8.5 0 0 0 0-7.8z"/>'};
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'+paths[name]+'</svg>';
};
const el=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=String(content);return x};
const folderId=value=>String(value||'').match(/(?:\/folders\/|[?&]folderId=)([A-Za-z0-9_-]{12,})/)?.[1]||'';
const fileId=value=>String(value||'').match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,})/)?.[1]||'';
const driveImg=value=>{const id=fileId(value);if(id)return 'https://lh3.googleusercontent.com/d/'+encodeURIComponent(id);
 try{const u=new URL(value);return u.protocol==='https:'?u.href:''}catch{return ''}};
const textDate=x=>String(x?.date||x?.event_on||x?.tanggal||'').slice(0,10);
const docId=d=>String(d.id||'')||(folderId(d.drive_url||d.folder)?'gfolder:'+folderId(d.drive_url||d.folder):'');
const pathFor=x=>{const u=new URL('/dokumentasi/',location.origin);
 if(x.albumId)u.searchParams.set('album',x.albumId);
 if(x.id)u.searchParams.set('foto',x.id);
 return u.href};
let newest=[],popularRows=[],mode='terbaru';
function card(item){
 const block=el('article','f4g-home-card');
 const href=pathFor(item),photo=el('a','f4g-home-photo');photo.href=href;photo.title='Buka foto di Dokumentasi Warga';
 const img=el('img');img.src=item.url;img.loading='lazy';img.alt=item.caption||item.title||'Foto kegiatan warga';
 img.addEventListener('error',()=>{block.remove()},{once:true});photo.append(img);
 const body=el('div','f4g-home-card-content'),title=el('a','f4g-home-title',item.title||item.caption||'Dokumentasi Warga');title.href=href;
 const info=el('div','f4g-home-info');
 info.append(el('span','',item.uploader||'Dokumentasi Flamboyan 4'),el('span','',textDate(item)));
 const stats=el('div','f4g-home-stats'),likes=el('span'),comments=el('span');
 likes.innerHTML=icon('heart');likes.append(el('span','',String(item.likes||0)));
 comments.innerHTML=icon('comment');comments.append(el('span','',String(item.commentCount??item.comments?.length??0)));
 stats.append(likes,comments);
 const preview=el('div','f4g-home-comments');
 for(const c of (item.comments||[]).slice(0,2)){
  const line=el('div','f4g-home-comment'),name=el('b','',(c.nama||c.author||'Warga')+': ');
  line.append(name,document.createTextNode(c.message||''));preview.append(line);
 }
 if(!preview.childNodes.length)preview.append(el('p','f4g-home-comment','Belum ada komentar'));
 body.append(title,info,stats,preview);block.append(photo,body);return block;
}
function empty(){
 const node=el('div','f4g-home-empty');
 node.append(el('strong','','Belum ada foto yang dapat ditampilkan.'),
  el('span','','Lihat album kegiatan yang sudah tersedia di Dokumentasi.'));
 const link=el('a','','Buka Dokumentasi');link.href='/dokumentasi/';node.append(link);
 return node;
}
function render(){
 const candidates=mode==='populer'?popularRows:newest;
 const unique=[],seen=new Set();
 for(const photo of candidates){
  if(!photo?.url||!photo?.albumId||seen.has(photo.albumId))continue;
  seen.add(photo.albumId);unique.push(photo);if(unique.length>=3)break;
 }
 grid.replaceChildren(...(unique.length?unique.map(card):[empty()]));
 section.hidden=false;
 latest.setAttribute('aria-selected',String(mode==='terbaru'));
 popular.setAttribute('aria-selected',String(mode==='populer'));
}
latest.addEventListener('click',()=>{mode='terbaru';render()});
popular.addEventListener('click',()=>{mode='populer';render()});
async function json(url,timeout=7000){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try{const response=await fetch(url,{cache:'no-store',signal:controller.signal});
  if(!response.ok)throw Error('HTTP '+response.status);
  return await response.json();
 }finally{clearTimeout(timer)}
}
function fromNew(photo,titles){
 return {...photo,title:titles.get(photo.albumId)||photo.caption||'Dokumentasi Warga',
  id:photo.id||'',
  comments:photo.comments||[],likes:Number(photo.likes||0),commentCount:Number(photo.commentCount??photo.comments?.length??0)}
}
async function fromLegacy(doc){
 const id=docId(doc);if(!id)return null;
 const title=String(doc.title||'').trim();
 const folder=folderId(doc.drive_url||doc.folder||doc.photo_ref||doc.url);
 let photo=null;
 if(folder){
  try{
   const data=await json(FOLDER_API+'?folderId='+encodeURIComponent(folder),6500);
   const files=Array.isArray(data)?data:Array.isArray(data.files)?data.files:Array.isArray(data.images)?data.images:[];
   const item=files.find(x=>typeof x==='string'||(!/video/i.test(String(x.mimeType||x.type||x.name||''))))||null;
   if(item){
    const raw=typeof item==='string'?item:(item.url||item.link||item.src||item.downloadUrl||'');
    const source=raw|| (item.id?'https://drive.google.com/file/d/'+item.id+'/view':'');
    const file=fileId(source)||String(item.id||item.fileId||'');
    const url=driveImg(source);
    if(file&&url)photo={id:'gdrive:'+file,albumId:id,url};
   }
  }catch(e){console.warn('Foto arsip: folder tidak tersedia',title,e.message)}
 }
 if(!photo){
  const cover=driveImg(doc.cover||doc.image_ref||'');
  const fid=fileId(cover);
  if(cover&&fid)photo={id:'gdrive:'+fid,albumId:id,url:cover};
 }
 if(!photo)return null;
 const item={...photo,title,caption:title,date:textDate(doc),uploader:'Dokumentasi Flamboyan 4',
  likes:0,commentCount:0,comments:[]};
 try{
  const reactions=await json(API+'/api/v2/gallery/social?type=photo&id='+encodeURIComponent(item.id),3500);
  if(reactions.ok!==false){
   item.likes=Number(reactions.likes||0);item.commentCount=Number(reactions.comments?.length||0);
   item.comments=(reactions.comments||[]).slice(0,2);
  }
 }catch{}
 return item;
}
(async()=>{
 let gallery={highlights:[],popular:[],albums:[]},portal={documentation:[]};
 try{
  const [g,p]=await Promise.allSettled([
   json(API+'/api/v2/gallery',6500),
   json(API+'/api/v2/public/portal',6500)
  ]);
  if(g.status==='fulfilled')gallery=g.value;
  if(p.status==='fulfilled')portal=p.value;
  const titles=new Map((gallery.albums||[]).map(x=>[x.id,x.title]));
  const docs=(portal.documentation||[]).filter(x=>String(x.title||'').trim())
    .filter(x=>!x.active||Number(x.active)!==0)
    .filter(x=>!x.visibility||x.visibility==='publik')
    .filter(x=>!/^Bank Sampah\s*[:/]/i.test(x.category||''));
  for(const d of docs)titles.set(docId(d),d.title);
  const newPhotos=(gallery.highlights||[]).map(x=>fromNew(x,titles));
  const popPhotos=(gallery.popular||[]).map(x=>fromNew(x,titles));
  // Batasi permintaan folder untuk mempercepat Beranda. Album tanpa unggahan baru
  // tetap terwakili agar website tidak terlihat kosong.
  const legacy=await Promise.all(docs.slice(0,8).map(fromLegacy));
  const past=legacy.filter(Boolean);
  newest=[...newPhotos,...past].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const all=new Map([...newest,...popPhotos].map(x=>[x.id,x]));
  popularRows=[...all.values()].sort((a,b)=>{
   const score=x=>Number(x.likes||0)*2+Number(x.commentCount||0)*3;
   return score(b)-score(a)||String(b.date||'').localeCompare(String(a.date||''));
  });
  render();
 }catch(e){console.warn('Cerita Warga:',e.message);render()}
})();
})();