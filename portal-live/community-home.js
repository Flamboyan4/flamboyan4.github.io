/* Cerita Warga · foto komunitas baru + dokumentasi Drive yang sudah ada.
   Mempublikasikan hanya album dokumentasi portal yang memang aktif/publik. */
(()=>{'use strict';
const section=document.getElementById('cerita-warga'),grid=document.getElementById('f4g-home-grid');
if(!section||!grid)return;
const latest=document.getElementById('f4g-home-latest'),popular=document.getElementById('f4g-home-popular');
const API='https://api.flamboyan4.web.id';
const icon=name=>{
 const paths={heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  comment:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.8-5.2a8.5 8.5 0 1 1 16.2-4.3z"/>'};
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
 const file=fileId(item.url),sources=file?[
   'https://drive.google.com/thumbnail?id='+encodeURIComponent(file)+'&sz=w1200',
   'https://drive.google.com/uc?export=view&id='+encodeURIComponent(file)
  ]:[];
 let fallbackIndex=0;
 img.addEventListener('error',()=>{
  if(fallbackIndex<sources.length){img.src=sources[fallbackIndex++];return}
  img.replaceWith(el('div','f4g-home-photo-unavailable','Foto belum dapat dimuat'));
 });
 photo.append(img);
 const body=el('div','f4g-home-card-content'),title=el('a','f4g-home-title',item.title||item.caption||'Dokumentasi Warga');title.href=href;
 const info=el('div','f4g-home-info');
 info.append(el('span','',item.uploader||'Dokumentasi Flamboyan 4'),el('span','',textDate(item)));
 const stats=el('div','f4g-home-stats'),likes=el('span','f4g-home-stat'),comments=el('a','f4g-home-stat f4g-home-comment-link');
 likes.innerHTML=icon('heart');likes.append(el('span','',String(item.likes||0)));
 comments.href=href;comments.setAttribute('aria-label','Buka komentar pada '+(item.title||'album'));
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
  // Terbaru: satu per album. Populer: foto dari album sama boleh bersaing.
  const key=mode==='populer'?photo?.id:photo?.albumId;
  if(!photo?.url||!photo?.albumId||!key||seen.has(key))continue;
  seen.add(key);unique.push(photo);if(unique.length>=3)break;
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
// Sumber yang sama dengan halaman Dokumentasi; hanya album publik yang terdaftar.
async function publicPhotoIndex(){
 try{
  const response=await fetch('/assets/data/portal-photo-index.json?v=20261123-album-meta-v2');
  if(!response.ok)throw Error('HTTP '+response.status);
  return await response.json();
 }catch(error){
  console.warn('Indeks foto publik belum terbaca:',error.message||error);
  return {folders:{},albums:[]};
 }
}
async function fromLegacy(doc,index){
 const id=docId(doc);
 if(!id)return null;
 const title=String(doc.title||'').trim();
 const folder=folderId(doc.drive_url||doc.folder);
 const available=(index.folders?.[folder]||[]).filter(x=>x.type==='foto'&&/^[A-Za-z0-9_-]{12,110}$/.test(x.id||''));
 const direct=driveImg(doc.cover||doc.image_ref||'');
 const fid=fileId(direct)||available[0]?.id||'';
 const url=direct|| (fid?'https://lh3.googleusercontent.com/d/'+encodeURIComponent(fid):'');
 if(!url)return null;
 const item={id:fid?'gdrive:'+fid:'',albumId:id,url,title,caption:title,date:textDate(doc),
  uploader:'Dokumentasi Flamboyan 4',likes:0,commentCount:0,comments:[]};
 if(!item.id)return null;
 try{
  const reactions=await json(API+'/api/v2/gallery/social?type=photo&id='+encodeURIComponent(item.id),2500);
  if(reactions.ok!==false){
   item.likes=Number(reactions.likes||0);
   item.commentCount=Number(reactions.commentCount??reactions.comments?.length??0);
   item.comments=(reactions.comments||[]).slice(0,2);
   item.commenterCount=Number(reactions.commenterCount||0);
  }
 }catch{}
 return item;
}
(async()=>{
 let gallery={highlights:[],photos:[],popular:[],albums:[]},portal={documentation:[]},ranking={popular:[]};
 try{
  const [g,p,r,archived]=await Promise.allSettled([
   json(API+'/api/v2/gallery',6500),
   json(API+'/api/v2/public/portal',6500),
   json(API+'/api/v2/gallery/popular',8500),
   publicPhotoIndex()
  ]);
  if(g.status==='fulfilled')gallery=g.value;
  if(p.status==='fulfilled')portal=p.value;
  if(r.status==='fulfilled'&&Array.isArray(r.value.popular))ranking=r.value;
  const index=archived.status==='fulfilled'?archived.value:{folders:{},albums:[]};
  const titles=new Map((gallery.albums||[]).map(x=>[x.id,x.title]));
  const docs=(portal.documentation||[]).filter(x=>String(x.title||'').trim())
   .filter(x=>x.active===undefined||x.active===null||x.active===true||x.active===1||String(x.active)==='1')
   .filter(x=>!x.visibility||x.visibility==='publik')
   .filter(x=>!/^Bank Sampah\s*[:/]/i.test(x.category||''));
  const knownFolders=new Set(docs.map(x=>folderId(x.drive_url||x.folder)).filter(Boolean));
  // Arsip terverifikasi tetap ditampilkan jika belum seluruhnya termigrasi ke D1.
  for(const album of index.albums||[]){
   const folder=album.folderId;
   if(!/^[A-Za-z0-9_-]{12,110}$/.test(folder||'')||!index.folders?.[folder]?.length||knownFolders.has(folder))continue;
   docs.push({title:album.title,date:album.date,event_on:album.date,
    drive_url:'https://drive.google.com/drive/folders/'+folder});
   knownFolders.add(folder);
  }
  docs.sort((a,b)=>String(b.event_on||b.date||'').localeCompare(String(a.event_on||a.date||'')));
  for(const d of docs)titles.set(docId(d),d.title);
  const byId=new Map();
  for(const p of [...(gallery.highlights||[]),...(gallery.photos||[])]){
   const item=fromNew(p,titles);
   if(item.id&&!byId.has(item.id))byId.set(item.id,item);
  }
  const newPhotos=[...byId.values()];
  const rankedPhotos=(ranking.popular||[]).map(x=>fromNew(x,titles));
  const popPhotos=(gallery.popular||[]).map(x=>fromNew(x,titles));
  // Maksimal satu unggulan per album lama, tetapi semua album publik
  // dapat menyumbang satu kartu saat unggahan baru masih sedikit.
  const legacy=await Promise.allSettled(docs.slice(0,35).map(x=>fromLegacy(x,index)));
  const past=legacy.filter(x=>x.status==='fulfilled'&&x.value).map(x=>x.value);
  const all=new Map();
  for(const item of [...newPhotos,...past,...popPhotos,...rankedPhotos]){
   if(!item.id||!item.url||!item.albumId)continue;
   const existing=all.get(item.id);
   if(!existing){all.set(item.id,item);continue}
   all.set(item.id,{...existing,...item,
    likes:Math.max(Number(existing.likes||0),Number(item.likes||0)),
    commentCount:Math.max(Number(existing.commentCount||0),Number(item.commentCount||0)),
    commenterCount:Math.max(Number(existing.commenterCount||0),Number(item.commenterCount||0)),
    date:item.date||existing.date});
  }
  const candidates=[...all.values()];
  newest=candidates.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  // Populer tidak boleh berhenti pada satu foto dari API ranking.
  // Lengkapi dengan foto publik lain; urutkan berdasarkan interaksi asli.
  popularRows=candidates.slice().sort((a,b)=>Number(b.likes||0)-Number(a.likes||0)||
   Number(b.commenterCount||0)-Number(a.commenterCount||0)||
   Number(b.commentCount||0)-Number(a.commentCount||0)||
   String(b.date||'').localeCompare(String(a.date||'')));
  render();
 }catch(e){console.warn('Cerita Warga:',e.message);render()}
})();
})();