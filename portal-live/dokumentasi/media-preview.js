/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/dokumentasi/media-preview.js",function(__f4){

__f4.expose("openMediaGallery",()=>openMediaGallery,null);
__f4.expose("openMediaViewer",()=>openMediaViewer,null);
__f4.expose("docs",()=>docs,value=>docs=value);
__f4.expose("inventory",()=>inventory,value=>inventory=value);
__f4.expose("PORTAL_API",()=>PORTAL_API,null);
__f4.expose("PORTAL_CSV",()=>PORTAL_CSV,null);
__f4.expose("parseDate",()=>parseDate,null);
__f4.expose("asPortal",()=>asPortal,null);
__f4.expose("portalOnly",()=>portalOnly,null);
__f4.expose("folderId",()=>folderId,null);
__f4.expose("recentMedia",()=>recentMedia,value=>recentMedia=value);
__f4.expose("mediaId",()=>mediaId,null);
__f4.expose("publishRecentMedia",()=>publishRecentMedia,value=>publishRecentMedia=value);
__f4.expose("combineCommunityMedia",()=>combineCommunityMedia,value=>combineCommunityMedia=value);
__f4.expose("photoIndexPromise",()=>photoIndexPromise,value=>photoIndexPromise=value);
__f4.expose("publicPhotoIndex",()=>publicPhotoIndex,value=>publicPhotoIndex=value);
__f4.expose("listMedia",()=>listMedia,value=>listMedia=value);
__f4.expose("hydrateArchiveCovers",()=>hydrateArchiveCovers,value=>hydrateArchiveCovers=value);
__f4.expose("loadPortalArchive",()=>loadPortalArchive,value=>loadPortalArchive=value);
__f4.expose("$",()=>$,null);
__f4.expose("el",()=>el,null);
__f4.expose("photoPlaceholder",()=>photoPlaceholder,null);
__f4.expose("safe",()=>safe,null);
__f4.expose("driveImage",()=>driveImage,null);
__f4.expose("category",()=>category,null);
__f4.expose("active",()=>active,value=>active=value);
__f4.expose("types",()=>types,null);
__f4.expose("status",()=>status,null);
__f4.expose("openAlbum",()=>openAlbum,value=>openAlbum=value);
__f4.expose("drawAlbums",()=>drawAlbums,value=>drawAlbums=value);
__f4.expose("drawFilters",()=>drawFilters,value=>drawFilters=value);
__f4.expose("drawInventory",()=>drawInventory,value=>drawInventory=value);
__f4.expose("tab",()=>tab,value=>tab=value);
__f4.expose("navType",()=>navType,null);
__f4.expose("deepLinkURL",()=>deepLinkURL,null);
__f4.expose("firstPageDeepLink",()=>firstPageDeepLink,null);
__f4.expose("legacyInventory",()=>legacyInventory,null);

const {openMediaGallery,openMediaViewer}=__f4.window.f4MediaGallery;
// Native Dokumentasi is a first-level page; do not redirect to the old iframe router.
let docs=[{"date":"15-Mar-2026","title":"Pemasangan CCTV Lorong","description":"Sebagai bentuk pengawasan dan perlindungan dari potensi gangguan keamanan, CCTV dipasang pada 7 titik di Lorong Flamboyan 4.","folder":"https://drive.google.com/drive/folders/1azMUqjso0ZTVb87ZfO07cGd2beZ5WjWL?usp=sharing"},{"date":"2-Agu-2026","title":"Menghias Lorong","description":"Menyambut Hari Kemerdekaan, warga Lorong Flamboyan 4 kompak mempercantik lorong dengan umbul-umbul, rumbai, dan lukisan mural.","folder":"https://drive.google.com/drive/folders/1hzTnOA8D1NQTwyIaodyEAyNc6-BEbvah?usp=sharing"},{"date":"16-Agu-2026","title":"Perlombaan Hari Kemerdekaan RI","description":"Kemeriahan 17 Agustus disambut dengan serangkaian lomba yang diikuti oleh seluruh warga Lorong Flamboyan 4, dari balita hingga orang tua.","folder":"https://drive.google.com/drive/folders/1QU5ty5W_K6j2JRjaZGpRlGHyBoXyfHuN?usp=sharing"},{"date":"29-Agu-2026","title":"Penutupan Acara Hari Kemerdekaan RI","description":"Rangkaian kegiatan 17-an tahun ini akhirnya resmi ditutup dengan acara makan bersama sekaligus pembagian hadiah lomba.","folder":"https://drive.google.com/drive/folders/16b6TV8BzH1PaUpa93O1WQo-ahWsDasBb?usp=sharing"},{"date":"29-Agu-2026","title":"Serah Terima Humas","description":"Momen pengunduran diri Pak Riadu sekaligus pemilihan langsung Pak Heri (Ali) sebagai Humas baru. Terima kasih Pak Riadu atas pengabdiannya, dan selamat untuk Pak Heri!","folder":"https://drive.google.com/drive/folders/1nqVWaxe8uHqMkTrAYjpIziSNQqxFnF4E?usp=sharing"},{"date":"3-Okt-2026","title":"Arisan & Musyawarah Warga","description":"Kegiatan malam ini bertempat di rumah Pak Cahyo A6/02, membahas sosialisasi vendor sampah dan Program Flamboyan 4 melalui presentasi proyektor.","folder":"https://drive.google.com/drive/folders/1X3dpY5muogRxcO6ky7Ntg4JAmCrmjr7k?usp=sharing"},{"date":"5-Okt-2026","title":"NOBAR Indonesia Vs Thailand","description":"Berkumpul bersama mendukung Indonesia, sebuah kebersamaan warga flamboyan 4","folder":"https://drive.google.com/drive/folders/1vdFbmk-GtKvMgbFII0ZWyX-Z43FQXN2K?usp=sharing"},{"date":"11-Okt-2026","title":"Gorol dan Pembuatan Bank Sampah","description":"Kegiatan warga flamboyan 4 membersihkan lingkungan bersama-sama","folder":"https://drive.google.com/drive/folders/1ywp2v8rUH-oAGcM91PQyVrO7Wx9iLdCA?usp=sharing","cover":"https://drive.google.com/file/d/1DcqPvQpQx_nQEPsCXlbJz-YETZ0iypep/view?usp=sharing"}];
let inventory=[{"name":"Terpal","quantity":"1","condition":"Baik","photo":""},{"name":"Cangkul","quantity":"2","condition":"Baik","photo":""},{"name":"Garpu","quantity":"1","condition":"Baik","photo":""},{"name":"Pengki Bangunan","quantity":"3","condition":"Baik","photo":""},{"name":"Dispenser Es","quantity":"1","condition":"Baik","photo":"https://drive.google.com/file/d/15arUzGCcx0CZI4R8Gof51KdQoshygHj0/view?usp=sharing"}];

/* Same Portal Utama documentation source as its landing-page preview.
   Bank Sampah albums are a separate API collection and MUST NOT be merged. */
const PORTAL_API='https://api.flamboyan4.web.id/api/v2/public/portal';
const PORTAL_CSV='https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=0&single=true&output=csv';
const parseDate=text=>{
 const str=(0,__f4.globals.String)(text||'').trim();
 let iso=str.match(/(\d{4})-(\d\d)-(\d\d)/);
 if(iso)return (0,__f4.globals.Number)(iso[1])*10000+(0,__f4.globals.Number)(iso[2])*100+(0,__f4.globals.Number)(iso[3]);
 let numeric=str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
 if(numeric)return (0,__f4.globals.Number)(numeric[3])*10000+(0,__f4.globals.Number)(numeric[2])*100+(0,__f4.globals.Number)(numeric[1]);
 const m=str.match(/^(\d{1,2})[\/\s-]([A-Za-z]+)[\/\s-](\d{4})/);
 if(m){
  const names=['jan','feb','mar','apr','mei','jun','jul','agu','sep','okt','nov','des'];
  let mon=names.indexOf(m[2].slice(0,3).toLowerCase())+1;
  if(mon)return (0,__f4.globals.Number)(m[3])*10000+mon*100+(0,__f4.globals.Number)(m[1]);
 }
 return 0;
};
const asPortal=(source)=>({
 id:(0,__f4.globals.String)(source.id||''),
 date:(0,__f4.globals.String)(source.date||source.event_on||source.tanggal||''),
 title:(0,__f4.globals.String)(source.title||source.judul||'').trim(),
 description:(0,__f4.globals.String)(source.description||source.deskripsi||''),
 folder:(0,__f4.globals.String)(source.drive_url||source.folder||source.foto||source.photo_ref||source.url||''),
 cover:(0,__f4.globals.String)(source.cover||source.image_ref||''),
 category:(0,__f4.globals.String)(source.category||source.kategori||''),
 portal:(0,__f4.globals.String)(source.portal||source.portal_scope||source.source_portal||source.scope||'').toLowerCase()
});
const portalOnly=record=>(!record.portal||['portal','utama','portal-utama','flamboyan4','warga','community'].includes(record.portal))&&
 !/^Bank Sampah\s*[:/]/i.test(record.category||'');
const folderId=link=>(0,__f4.globals.String)(link||'').match(/(?:\/folders\/|[?&]folderId=)([A-Za-z0-9_-]{12,})/)?.[1]||'';
let recentMedia=[];
const mediaId=media=>{
 const raw=(0,__f4.globals.String)(media?.url||'');
 const driveId=raw.match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,})/)?.[1]||'';
 return (0,__f4.globals.String)(media?.id||(driveId?'gdrive:'+driveId:''));
};
function publishRecentMedia(){
 const seen=new __f4.globals.Set(),rows=[];
 for(const doc of docs){
  const media=[...(doc.communityPhotos||[]),...(doc._recentMedia||[])];
  if(!media.length&&doc.cover)media.push({url:driveImage(doc.cover),type:'foto',caption:doc.title});
  let count=0;
  for(const item of media){
   if(count>=3)break;
   if(item.type==='video'||!item.url)continue;
   const id=mediaId(item),key=id||item.url;
   if(seen.has(key))continue;
   seen.add(key);count++;
   rows.push({id,albumId:doc.id,title:doc.title,url:item.url,
    caption:item.caption||doc.title,date:doc.date});
  }
 }
 recentMedia=rows.slice(0,30);
 __f4.window.f4GalleryRecentMedia=()=>recentMedia.slice();
 __f4.globals.document.dispatchEvent(new __f4.globals.CustomEvent('f4:gallery:recent',{detail:{photos:recentMedia}}));
}
function combineCommunityMedia(legacy,extra){
 const additions=__f4.globals.Array.isArray(extra)?extra:[];
 const idOf=x=>(0,__f4.globals.String)(x?.url||'').match(/\/d\/([A-Za-z0-9_-]{12,})/)?.[1]||'';
 const uploadedIds=new __f4.globals.Set(additions.map(idOf).filter(__f4.globals.Boolean));
 const suppressed=new __f4.globals.Set(__f4.window.f4GalleryCommunity?.suppressedDriveIds||[]);
 return [...(legacy||[]).filter(item=>{
  const id=idOf(item);
  return !id||(!uploadedIds.has(id)&&!suppressed.has(id));
 }),...additions.filter(item=>!suppressed.has(idOf(item)))];
}
// Indeks hanya berisi ID foto dari folder dokumentasi yang telah dipublikasikan.
// Ini cadangan baca-saja apabila OAuth Google Drive pada Worker sedang gagal.
let photoIndexPromise=null;
function publicPhotoIndex(){
 if(!photoIndexPromise){
  photoIndexPromise=(0,__f4.globals.fetch)('/assets/data/portal-photo-index.json?v=20261123-nine-public-albums-101-v2',{cache:'force-cache'})
   .then(r=>r.ok?r.json():{folders:{}}).catch(()=>({folders:{}}));
 }
 return photoIndexPromise;
}
async function listMedia(doc){
 if(doc.media)return doc.media;
 const folder=folderId(doc.folder);
 let archive=[];
 if(folder){
  // The verified public archive is the primary source for legacy albums.
  // It is complete for the eight folders in the existing Dokumentasi workbook.
  const snapshot=await publicPhotoIndex();
  archive=(snapshot.folders?.[folder]||[]).filter(x=>
   x&&/^[A-Za-z0-9_-]{12,110}$/.test(x.id||'')&&['foto','video'].includes(x.type)).map(x=>({
    id:'gdrive:'+x.id,
    type:x.type,
    url:x.type==='video'
     ?'https://drive.google.com/file/d/'+(0,__f4.globals.encodeURIComponent)(x.id)+'/view'
     :'https://lh3.googleusercontent.com/d/'+(0,__f4.globals.encodeURIComponent)(x.id),
    thumb:'https://drive.google.com/thumbnail?id='+(0,__f4.globals.encodeURIComponent)(x.id)+'&sz=w1000',
    caption:''
   }));
  // Only unindexed folders require the Worker. If Drive OAuth is unavailable,
  // the existing indexed archive must remain complete and immediately visible.
  if(!archive.length){
   const albumRef=doc.id||'gfolder:'+folder;
   try{
    const controller=new __f4.globals.AbortController(),timeout=(0,__f4.globals.setTimeout)(()=>controller.abort(),3500);
    let response;
    try{response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/v2/gallery/folder?album='+
      (0,__f4.globals.encodeURIComponent)(albumRef),{cache:'no-store',signal:controller.signal})}
    finally{(0,__f4.globals.clearTimeout)(timeout)}
    if(!response.ok)throw (0,__f4.globals.Error)('HTTP '+response.status);
    const payload=await response.json();
    archive=__f4.globals.Array.isArray(payload.media)?payload.media.filter(x=>
      x&&['foto','video'].includes(x.type)&&safe(x.url)).map(x=>{
       const id=(0,__f4.globals.String)(x.id||'').match(/^gdrive:([A-Za-z0-9_-]{12,110})$/)?.[1]||'';
       return {...x,caption:'',
        url:x.type==='video'&&id?'https://drive.google.com/file/d/'+(0,__f4.globals.encodeURIComponent)(id)+'/view':x.url,
        thumb:id?'https://drive.google.com/thumbnail?id='+(0,__f4.globals.encodeURIComponent)(id)+'&sz=w1000':x.thumb};
      }):[];
   }catch(error){__f4.globals.console.warn('Folder belum terindeks atau Drive Worker tidak tersedia:',doc.title,error.message||error)}
  }
 }else{
  archive=(0,__f4.globals.String)(doc.folder||'').split(',').map(x=>x.trim()).filter(__f4.globals.Boolean)
   .map(url=>({url:driveImage(url),type:/\\.(mp4|webm|mov)(?:\\?|$)/i.test(url)?'video':'foto',caption:doc.title}));
 }
 const combined=combineCommunityMedia(archive,doc.communityPhotos);
 if(!combined.length&&doc.cover){
  const cover=driveImage(doc.cover);
  if(cover)combined.push({url:cover,type:'foto',caption:doc.title});
 }
 doc.media=combined;
 return doc.media;
}

async function hydrateArchiveCovers(){
 const pending=docs.slice(0,75);
 let cursor=0;
 await __f4.globals.Promise.allSettled(__f4.globals.Array.from({length:__f4.globals.Math.min(4,pending.length)},async()=>{
  while(cursor<pending.length){
   const doc=pending[cursor++];
   try{
    const media=await listMedia(doc);
    const image=media.find(x=>x.type==='foto')||media[0];
    if(image?.url){doc.cover=image.url;doc._recentMedia=media.slice(0,4);}
   }catch(error){__f4.globals.console.warn('Sampul dokumentasi belum tersedia:',doc.title,error.message||error)}
  }
 }));
 // Redraw once so the cards do not reload the same images repeatedly.
 drawAlbums();
 publishRecentMedia();
}

async function loadPortalArchive(){
 const indicator=__f4.window.F4Loading?.begin('feedback','Memeriksa pembaruan dokumentasi…');
 // Try the public D1 read model first, just like the Portal Utama bridge.
 // Fall back to its own original published Sheets source, never Bank Sampah.
 let rows;
 try{
  const controller=new __f4.globals.AbortController();
  const timeout=(0,__f4.globals.setTimeout)(()=>controller.abort(),6500);
  let data;
  try{
   const response=await (0,__f4.globals.fetch)(PORTAL_API,{cache:'no-store',signal:controller.signal});
   if(!response.ok)throw (0,__f4.globals.Error)('API HTTP '+response.status);
   data=await response.json();
  }finally{(0,__f4.globals.clearTimeout)(timeout)}
  if(data.ok===false||!__f4.globals.Array.isArray(data.documentation)||!data.documentation.length)
   throw (0,__f4.globals.Error)('Dokumentasi D1 belum lengkap');
  rows=data.documentation.map(asPortal).filter(a=>a.title&&portalOnly(a));
 }catch(err){
  const parsed=await __f4.globals.Promise.race([new __f4.globals.Promise((resolve,reject)=>{
   if(!__f4.window.Papa?.parse)return reject((0,__f4.globals.Error)('Pembaca CSV tidak tersedia'));
   __f4.globals.Papa.parse(PORTAL_CSV,{download:true,header:true,complete:out=>{
    if(out.errors?.length&&!out.data?.length)return reject((0,__f4.globals.Error)(out.errors[0].message));
    resolve((out.data||[]).filter(v=>__f4.globals.Object.values(v).some(x=>(0,__f4.globals.String)(x||'').trim())).map(row=>{
     const cells=__f4.globals.Object.values(row);
     return asPortal({tanggal:cells[0],judul:cells[1],deskripsi:cells[2],foto:cells[3]});
    }));
   },error:reject});
  }),new __f4.globals.Promise((_,reject)=>(0,__f4.globals.setTimeout)(()=>reject((0,__f4.globals.Error)('CSV Sheets tidak merespons')),7000))]);
  rows=parsed.filter(a=>a.title&&portalOnly(a));
 }
 // Keep original historical albums until every D1 record is migrated.
 // Merge by real Drive folder or normalized title/date; D1 may only have a subset.
 const archive=[...docs].filter(portalOnly);
 const key=x=>folderId(x.folder)||(0,__f4.globals.String)(x.title||'').toLocaleLowerCase('id-ID').replace(/[^a-z0-9]/g,'')+'|'+parseDate(x.date);
 const byKey=new __f4.globals.Map(archive.map(x=>[key(x),x]));
 for(const x of rows){
  const id=key(x),previous=byKey.get(id);
  byKey.set(id,previous?{
   ...previous,...x,
   folder:x.folder||previous.folder,
   cover:x.cover||previous.cover,
   description:x.description, // Empty D1 descriptions must stay empty; never restore old archive text.
   date:x.date||previous.date
  }:x);
 }
 docs=[...byKey.values()].map(a=>({
  ...a,id:a.id||(folderId(a.folder)?'gfolder:'+folderId(a.folder):'')
 })).sort((a,b)=>parseDate(b.date)-parseDate(a.date));
 // Lapisan unggahan baru dipisahkan dari arsip Google Drive lama; tidak membuat album ganda.
 try{
  const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/v2/gallery',{cache:'no-store'});
  if(response.ok){
   const collection=await response.json();
   if(collection.ok!==false){
    __f4.window.f4GalleryCommunity=collection;
    const docById=new __f4.globals.Map(docs.filter(d=>d.id).map(d=>[d.id,d]));
    for(const a of collection.albums||[]){
     if(docById.has(a.id))continue;
     const album={id:a.id,date:a.date,title:a.title,description:a.description||'',folder:a.folder?('https://drive.google.com/drive/folders/'+a.folder):'',cover:'',category:'Lainnya',communityPhotos:[]};
     docs.push(album);docById.set(a.id,album);
    }
    for(const p of collection.photos||[]){
     const a=docById.get(p.albumId);if(!a)continue;
     if(!a.communityPhotos)a.communityPhotos=[];
     a.communityPhotos.push({id:p.id,albumId:p.albumId,url:p.url,type:'foto',caption:p.caption||p.uploader||'Foto warga'});
     if(!a.cover)a.cover=p.url;
    }
   }
  }
 }catch(e){__f4.globals.console.warn('Galeri interaktif belum tersedia:',e.message)}
 docs.sort((a,b)=>parseDate(b.date)-parseDate(a.date));
 __f4.window.f4GalleryAlbums=()=>docs.filter(d=>d.id&&!d.id.startsWith('gfolder:')).map(d=>({id:d.id,title:d.title}));
 publishRecentMedia();
 drawAlbums();
 __f4.globals.document.dispatchEvent(new __f4.globals.Event('f4:gallery:ready'));
 // Shared links are one-shot; refresh must not reopen an old media overlay.
 const targetAlbum=firstPageDeepLink?.album||'';
 if(targetAlbum){
  const selected=docs.find(d=>d.id===targetAlbum||(targetAlbum.startsWith('gfolder:')&&folderId(d.folder)===targetAlbum.slice(8)));
  if(selected)await openAlbum(selected,firstPageDeepLink.photo);
 }
 await hydrateArchiveCovers();
 __f4.window.F4Loading?.success('feedback',indicator);
}
const $=id=>__f4.globals.document.getElementById(id);
const el=(tag,cls,text)=>{const x=__f4.globals.document.createElement(tag);if(cls)x.className=cls;if(text!==__f4.globals.undefined)x.textContent=(0,__f4.globals.String)(text);return x};
const photoPlaceholder=()=>{const p=el('div','media-photo-placeholder');p.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"29\" height=\"29\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" />\n  <circle cx=\"9\" cy=\"9\" r=\"2\" />\n  <path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" /></svg>";return p};
const safe=value=>{try{const u=new __f4.globals.URL((0,__f4.globals.String)(value||''));return /https?:/.test(u.protocol)?u.href:''}catch{return ''}};
const driveImage=value=>{
 const text=(0,__f4.globals.String)(value||'');const m=text.match(new __f4.globals.RegExp('(?:/d/|[?&]id=)([A-Za-z0-9_-]{12,})'));
 return m?'https://lh3.googleusercontent.com/d/'+m[1]:safe(text);
};
const category=a=>/gorol|pembersihan|menghias/i.test(a.title)?'Kerja Bakti':/arisan/i.test(a.title)?'Arisan':/lomba|kemerdekaan|nobar/i.test(a.title)?'Acara':'Lainnya';
let active='Semua';
const types=['Semua','Kerja Bakti','Arisan','Acara','Lainnya'];
const status=(message,type='loading',token)=>{
 const loading=__f4.window.F4Loading;
 if(!loading){const n=$('feedback');n.textContent=message||'';n.hidden=!message;return}
 if(type==='error')return loading.error('feedback',message,token);
 if(type==='empty')return loading.empty('feedback',message,token);
 if(!message)return loading.success('feedback',token);
 return loading.begin('feedback',message);
};
async function openAlbum(a,sharedPhoto=''){
 const token=status('Memuat foto dan video dari folder dokumentasi…');
 let media=[],failure=null;
 try{media=await listMedia(a)}catch(e){failure=e;status('Folder media belum dapat dibaca: '+(e.message||e),'error',token);}
 openMediaGallery(a.title,media,{albumId:a.id,folderURL:safe(a.folder),
  empty:'Media album ini belum dapat dibaca. Periksa izin akses dokumentasi atau sinkronisasi sumber media.'});
 if(!failure){if(media.length)status('', 'success',token);else status('Belum ada foto/video yang dapat dibaca untuk album ini.','empty',token);}
 if(sharedPhoto&&__f4.window.f4MediaGallery?.openPhotoById(sharedPhoto))__f4.window.f4GallerySharedOpened=true;
}
function drawAlbums(){
 const q=$('media-search').value.toLowerCase().trim();
 const rows=docs.filter(d=>(active==='Semua'||category(d)===active)&&(!q||(d.title+' '+d.description).toLowerCase().includes(q))).sort((a,b)=>parseDate(b.date)-parseDate(a.date));
 $('media-count').textContent=rows.length+' album';
 const list=$('media-albums');list.replaceChildren();
 if(!rows.length)list.append(el('p','muted','Album tidak ditemukan.'));
 for(const a of rows){
  const btn=el('button','media-album-card f4g-album-card');btn.type='button';
  const cover=el('div','media-album-cover');
  if(a.cover){
   const img=__f4.globals.document.createElement('img');img.src=driveImage(a.cover);
   img.alt='Sampul '+a.title;img.loading='lazy';
   const id=(0,__f4.globals.String)(a.cover).match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,110})/)?.[1]||'';
   const candidates=id?[
    'https://drive.google.com/thumbnail?id='+(0,__f4.globals.encodeURIComponent)(id)+'&sz=w1200',
    'https://lh3.googleusercontent.com/d/'+(0,__f4.globals.encodeURIComponent)(id)
   ].filter(url=>url!==img.src):[];
   let next=0;
   img.onerror=()=>{
    if(!img.isConnected)return;
    if(next<candidates.length){img.src=candidates[next++];return}
    img.replaceWith(photoPlaceholder());
   };
   cover.append(img);
  }else cover.append(photoPlaceholder());
  const content=el('div','media-album-info');
  // The album index is a compact cover/title/date list. Descriptions are intentionally not displayed.
  content.append(el('small','media-category-tag',category(a)),el('strong','',a.title),el('small','muted',a.date));
  const linkText=el('span','f4g-album-open','Lihat album');
  const arrow=el('span','f4g-album-open-icon');
  arrow.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  linkText.append(arrow);content.append(linkText);
  btn.append(cover,content);btn.onclick=()=>openAlbum(a);list.append(btn);
 }
}
function drawFilters(){
 const box=$('media-category-filters');box.replaceChildren();
 // PC retains filter buttons; mobile uses a custom panel rather than Android's native picker.
 for(const kind of types){
  const btn=el('button','btn'+(active===kind?'':' outline'),kind);
  btn.type='button';btn.setAttribute('aria-pressed',(0,__f4.globals.String)(active===kind));
  btn.onclick=()=>{active=kind;drawFilters();drawAlbums()};box.append(btn);
 }
 const wrap=el('div','f4g-category-dropdown');
 const trigger=el('button','f4g-category-trigger');
 trigger.type='button';trigger.setAttribute('aria-label','Filter kategori album');
 trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
 const name=el('span','f4g-category-current',active);
 const arrow=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
 arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('aria-hidden','true');
 arrow.innerHTML='<path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
 trigger.append(name,arrow);
 const panel=el('div','f4g-category-menu');
 panel.setAttribute('role','listbox');panel.setAttribute('aria-label','Kategori album');
 panel.hidden=true;
 const close=()=>{panel.hidden=true;trigger.setAttribute('aria-expanded','false')};
 const choose=kind=>{active=kind;close();drawFilters();drawAlbums()};
 for(const kind of types){
  const option=el('button','f4g-category-option'+(active===kind?' selected':''),kind);
  option.type='button';option.setAttribute('role','option');
  option.setAttribute('aria-selected',(0,__f4.globals.String)(kind===active));
  option.onclick=()=>choose(kind);
  panel.append(option);
 }
 trigger.onclick=()=>{
  const opening=panel.hidden;
  panel.hidden=!opening;trigger.setAttribute('aria-expanded',(0,__f4.globals.String)(opening));
 };
 wrap.append(trigger,panel);box.append(wrap);
 // One delegated listener for all filter renders. No stale listeners per update.
 if(!__f4.globals.document.documentElement.dataset.f4gCategoryListener){
  __f4.globals.document.documentElement.dataset.f4gCategoryListener='1';
  __f4.globals.document.addEventListener('pointerdown',event=>{
   const current=__f4.globals.document.querySelector('#media-category-filters .f4g-category-dropdown');
   if(current&&!current.contains(event.target)){
    const menu=current.querySelector('.f4g-category-menu');
    const button=current.querySelector('.f4g-category-trigger');
    if(menu)menu.hidden=true;
    if(button)button.setAttribute('aria-expanded','false');
   }
  },true);
  __f4.globals.document.addEventListener('keydown',event=>{
   const current=__f4.globals.document.querySelector('#media-category-filters .f4g-category-dropdown');
   if(!current)return;
   const menu=current.querySelector('.f4g-category-menu');
   const button=current.querySelector('.f4g-category-trigger');
   if(!menu||menu.hidden)return;
   if(event.key==='Escape'){event.preventDefault();menu.hidden=true;button.setAttribute('aria-expanded','false');button.focus()}
  });
 }
}
__f4.window.f4GalleryOpenRecent=async(albumId,photoId)=>{
 const album=docs.find(row=>row.id===albumId);
 if(!album)return false;
 await openAlbum(album);
 if(photoId)return __f4.window.f4MediaGallery?.openPhotoById(photoId)||false;
 return true;
};
function drawInventory(){
 const box=$('media-inventory-list');box.replaceChildren();
 $('inventory-total').textContent=inventory.length+' item';
 for(const r of inventory){
  const src=driveImage(r.photo);
  // Barang tanpa foto adalah informasi statis: tanpa ikon placeholder, popup, atau peringatan.
  const card=el(src?'button':'div','media-inventory-item'+(src?'':' is-photo-free'));
  if(src){
   card.type='button';
   const img=__f4.globals.document.createElement('img');
   img.src=src;img.alt=r.name;img.loading='lazy';
   img.onerror=()=>{
    if(!img.isConnected)return;
    // Apabila sumber foto tidak valid, tampilkan data barang saja.
    const staticCard=el('div','media-inventory-item is-photo-free');
    for(const child of [...card.children])if(child!==img)staticCard.append(child);
    card.replaceWith(staticCard);
   };
   card.append(img);
   card.onclick=()=>openMediaViewer('Inventaris: '+r.name,[{url:src,type:'foto',caption:r.name}]);
  }
  const copy=el('span','media-item-copy');
  copy.append(el('strong','',r.name),el('small','muted',r.condition));
  card.append(copy,el('span','portal-inventory-qty',r.quantity+' unit'));
  box.append(card);
 }
}
function tab(value,writeHash){
 const inv=value==='inventaris';
 $('media-albums-section').hidden=inv;$('media-inventory-section').hidden=!inv;
 for(const [name,is] of [['albums',!inv],['inventory',inv]]){
  const btn=$('media-tab-'+name);
  btn.className='btn'+(is?'':' outline');btn.setAttribute('aria-selected',(0,__f4.globals.String)(is));
 }
 if(writeHash){const url=new __f4.globals.URL(__f4.globals.location.href);if(inv)url.searchParams.set('halaman','inventaris');else url.searchParams.delete('halaman');url.hash='';__f4.globals.history.replaceState(__f4.globals.history.state,'',url.pathname+url.search)}
 if(window!==__f4.window.top)__f4.window.parent.postMessage({type:'f4:section',target:inv?'inventaris':'dokumentasi'},__f4.globals.location.origin);
}
$('media-tab-albums').onclick=()=>tab('dokumentasi',true);
$('media-tab-inventory').onclick=()=>tab('inventaris',true);
$('media-search').oninput=drawAlbums;
(0,__f4.globals.addEventListener)('popstate',()=>tab(new __f4.globals.URLSearchParams(__f4.globals.location.search).get('halaman')==='inventaris'?'inventaris':'dokumentasi',false));
// Links from Beranda/share are handled once; remove photo and album query
// parameters immediately so reload and browser restore don't resurrect an overlay.
const navType=__f4.globals.performance.getEntriesByType?.('navigation')?.[0]?.type||'';
const deepLinkURL=new __f4.globals.URL(__f4.globals.location.href);
const firstPageDeepLink=navType==='reload'?null:{
 album:deepLinkURL.searchParams.get('album')||'',
 photo:deepLinkURL.searchParams.get('foto')||''
};
if(deepLinkURL.searchParams.has('album')||deepLinkURL.searchParams.has('foto')){
 deepLinkURL.searchParams.delete('album');
 deepLinkURL.searchParams.delete('foto');
 __f4.globals.history.replaceState({...__f4.globals.history.state,f4DocOverlay:null,f4DocSession:null},'',
  deepLinkURL.pathname+deepLinkURL.search+deepLinkURL.hash);
}
drawFilters();drawAlbums();drawInventory();const legacyInventory=__f4.globals.location.hash==='#inventaris';
if(legacyInventory){const url=new __f4.globals.URL(__f4.globals.location.href);url.hash='';url.searchParams.set('halaman','inventaris');__f4.globals.history.replaceState(__f4.globals.history.state,'',url.pathname+url.search)}
tab(new __f4.globals.URLSearchParams(__f4.globals.location.search).get('halaman')==='inventaris'?'inventaris':'dokumentasi',false);
loadPortalArchive().catch(async error=>{
 docs.sort((a,b)=>parseDate(b.date)-parseDate(a.date));
 __f4.window.f4GalleryAlbums=()=>docs.filter(d=>d.id&&!d.id.startsWith('gfolder:')).map(d=>({id:d.id,title:d.title}));
 await hydrateArchiveCovers();
 __f4.globals.document.dispatchEvent(new __f4.globals.Event('f4:gallery:ready'));
 status('Arsip online belum dapat diperbarui ('+(error.message||error)+'). Menampilkan arsip kegiatan asli yang sudah tersedia.','error');
});

});
