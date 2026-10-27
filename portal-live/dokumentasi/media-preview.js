
const {openMediaGallery,openMediaViewer}=window.f4MediaGallery;
// Native Dokumentasi is a first-level page; do not redirect to the old iframe router.
let docs=[{"date":"15-Mar-2026","title":"Pemasangan CCTV Lorong","description":"Sebagai bentuk pengawasan dan perlindungan dari potensi gangguan keamanan, CCTV dipasang pada 7 titik di Lorong Flamboyan 4.","folder":"https://drive.google.com/drive/folders/1azMUqjso0ZTVb87ZfO07cGd2beZ5WjWL?usp=sharing"},{"date":"2-Agu-2026","title":"Menghias Lorong","description":"Menyambut Hari Kemerdekaan, warga Lorong Flamboyan 4 kompak mempercantik lorong dengan umbul-umbul, rumbai, dan lukisan mural.","folder":"https://drive.google.com/drive/folders/1hzTnOA8D1NQTwyIaodyEAyNc6-BEbvah?usp=sharing"},{"date":"16-Agu-2026","title":"Perlombaan Hari Kemerdekaan RI","description":"Kemeriahan 17 Agustus disambut dengan serangkaian lomba yang diikuti oleh seluruh warga Lorong Flamboyan 4, dari balita hingga orang tua.","folder":"https://drive.google.com/drive/folders/1QU5ty5W_K6j2JRjaZGpRlGHyBoXyfHuN?usp=sharing"},{"date":"29-Agu-2026","title":"Penutupan Acara Hari Kemerdekaan RI","description":"Rangkaian kegiatan 17-an tahun ini akhirnya resmi ditutup dengan acara makan bersama sekaligus pembagian hadiah lomba.","folder":"https://drive.google.com/drive/folders/16b6TV8BzH1PaUpa93O1WQo-ahWsDasBb?usp=sharing"},{"date":"29-Agu-2026","title":"Serah Terima Humas","description":"Momen pengunduran diri Pak Riadu sekaligus pemilihan langsung Pak Heri (Ali) sebagai Humas baru. Terima kasih Pak Riadu atas pengabdiannya, dan selamat untuk Pak Heri!","folder":"https://drive.google.com/drive/folders/1nqVWaxe8uHqMkTrAYjpIziSNQqxFnF4E?usp=sharing"},{"date":"3-Okt-2026","title":"Arisan & Musyawarah Warga","description":"Kegiatan malam ini bertempat di rumah Pak Cahyo A6/02, membahas sosialisasi vendor sampah dan Program Flamboyan 4 melalui presentasi proyektor.","folder":"https://drive.google.com/drive/folders/1X3dpY5muogRxcO6ky7Ntg4JAmCrmjr7k?usp=sharing"},{"date":"5-Okt-2026","title":"NOBAR Indonesia Vs Thailand","description":"Berkumpul bersama mendukung Indonesia, sebuah kebersamaan warga flamboyan 4","folder":"https://drive.google.com/drive/folders/1vdFbmk-GtKvMgbFII0ZWyX-Z43FQXN2K?usp=sharing"},{"date":"11-Okt-2026","title":"Gorol dan Pembuatan Bank Sampah","description":"Kegiatan warga flamboyan 4 membersihkan lingkungan bersama-sama","folder":"https://drive.google.com/drive/folders/1ywp2v8rUH-oAGcM91PQyVrO7Wx9iLdCA?usp=sharing","cover":"https://drive.google.com/file/d/1DcqPvQpQx_nQEPsCXlbJz-YETZ0iypep/view?usp=sharing"}];
let inventory=[{"name":"Terpal","quantity":"1","condition":"Baik","photo":""},{"name":"Cangkul","quantity":"2","condition":"Baik","photo":""},{"name":"Garpu","quantity":"1","condition":"Baik","photo":""},{"name":"Pengki Bangunan","quantity":"3","condition":"Baik","photo":""},{"name":"Dispenser Es","quantity":"1","condition":"Baik","photo":"https://drive.google.com/file/d/15arUzGCcx0CZI4R8Gof51KdQoshygHj0/view?usp=sharing"}];

/* Same Portal Utama documentation source as its landing-page preview.
   Bank Sampah albums are a separate API collection and MUST NOT be merged. */
const PORTAL_API='https://api.flamboyan4.web.id/api/v2/public/portal';
const PORTAL_CSV='https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=0&single=true&output=csv';
const FOLDER_API='https://script.google.com/macros/s/AKfycbyes6A9_9EQ8vIYtf75cGgC9sKAZBvMewxEhYRSThjMAlBYqnkmKpa3yoPOtN0FEG92Zg/exec';
const parseDate=text=>{
 const str=String(text||'').trim();
 let iso=str.match(/(\d{4})-(\d\d)-(\d\d)/);
 if(iso)return Number(iso[1])*10000+Number(iso[2])*100+Number(iso[3]);
 let numeric=str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
 if(numeric)return Number(numeric[3])*10000+Number(numeric[2])*100+Number(numeric[1]);
 const m=str.match(/^(\d{1,2})[\/\s-]([A-Za-z]+)[\/\s-](\d{4})/);
 if(m){
  const names=['jan','feb','mar','apr','mei','jun','jul','agu','sep','okt','nov','des'];
  let mon=names.indexOf(m[2].slice(0,3).toLowerCase())+1;
  if(mon)return Number(m[3])*10000+mon*100+Number(m[1]);
 }
 return 0;
};
const asPortal=(source)=>({
 date:String(source.date||source.event_on||source.tanggal||''),
 title:String(source.title||source.judul||'').trim(),
 description:String(source.description||source.deskripsi||''),
 folder:String(source.drive_url||source.folder||source.foto||source.photo_ref||source.url||''),
 cover:String(source.cover||source.image_ref||''),
 category:String(source.category||source.kategori||''),
 portal:String(source.portal||source.portal_scope||source.source_portal||source.scope||'').toLowerCase()
});
const portalOnly=record=>(!record.portal||['portal','utama','portal-utama','flamboyan4','warga','community'].includes(record.portal))&&
 !/^Bank Sampah\s*[:/]/i.test(record.category||'');
const folderId=link=>String(link||'').match(/(?:\/folders\/|[?&]folderId=)([A-Za-z0-9_-]{12,})/)?.[1]||'';
const photoFiles=new Map();
async function listMedia(doc){
 if(doc.media)return doc.media;
 const id=folderId(doc.folder);
 if(!id){
  doc.media=String(doc.folder||'').split(',').map(s=>s.trim()).filter(Boolean)
    .map(url=>({url:driveImage(url),type:/\.(mp4|webm|mov)(?:\?|$)/i.test(url)?'video':'foto',caption:doc.title}));
  return doc.media;
 }
 if(photoFiles.has(id))return photoFiles.get(id);
 const request=(async()=>{
  const response=await fetch(FOLDER_API+'?folderId='+encodeURIComponent(id),{cache:'no-store'});
  if(!response.ok)throw Error('Folder HTTP '+response.status);
  const obj=await response.json();
  const items=Array.isArray(obj)?obj:Array.isArray(obj.files)?obj.files:Array.isArray(obj.images)?obj.images:[];
  return items.map((entry,i)=>{
   const raw=typeof entry==='string'?entry:entry.url||entry.link||entry.src||entry.downloadUrl||'';
   const entryId=typeof entry==='object'?String(entry.id||entry.fileId||''):'';
   const label=typeof entry==='string'?String(i+1):String(entry.name||entry.title||i+1);
   const video=(typeof entry==='object'&&(/video/i.test(entry.type||entry.mimeType||'')))||/\.(mp4|mov|webm|avi)$/i.test(label);
   const videoUrl=video&&/^[A-Za-z0-9_-]{15,}$/.test(entryId)&&(!raw||/googleusercontent|drive\.google\.com/.test(raw))
     ?'https://drive.google.com/file/d/'+entryId+'/preview':safe(raw);
   return {url:video?videoUrl:driveImage(raw),type:video?'video':'foto',caption:label};
  }).filter(item=>item.url);
 })();
 photoFiles.set(id,request);
 try{return await request}catch(err){photoFiles.delete(id);throw err}
}
async function loadPortalArchive(){
 const indicator=window.F4Loading?.begin('feedback','Memeriksa pembaruan dokumentasi…');
 // Try the public D1 read model first, just like the Portal Utama bridge.
 // Fall back to its own original published Sheets source, never Bank Sampah.
 let rows;
 try{
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),6500);
  let data;
  try{
   const response=await fetch(PORTAL_API,{cache:'no-store',signal:controller.signal});
   if(!response.ok)throw Error('API HTTP '+response.status);
   data=await response.json();
  }finally{clearTimeout(timeout)}
  if(data.ok===false||!Array.isArray(data.documentation)||!data.documentation.length)
   throw Error('Dokumentasi D1 belum lengkap');
  rows=data.documentation.map(asPortal).filter(a=>a.title&&portalOnly(a));
 }catch(err){
  const parsed=await Promise.race([new Promise((resolve,reject)=>{
   if(!window.Papa?.parse)return reject(Error('Pembaca CSV tidak tersedia'));
   Papa.parse(PORTAL_CSV,{download:true,header:true,complete:out=>{
    if(out.errors?.length&&!out.data?.length)return reject(Error(out.errors[0].message));
    resolve((out.data||[]).filter(v=>Object.values(v).some(x=>String(x||'').trim())).map(row=>{
     const cells=Object.values(row);
     return asPortal({tanggal:cells[0],judul:cells[1],deskripsi:cells[2],foto:cells[3]});
    }));
   },error:reject});
  }),new Promise((_,reject)=>setTimeout(()=>reject(Error('CSV Sheets tidak merespons')),7000))]);
  rows=parsed.filter(a=>a.title&&portalOnly(a));
 }
 // Keep original historical albums until every D1 record is migrated.
 // Merge by real Drive folder or normalized title/date; D1 may only have a subset.
 const archive=[...docs].filter(portalOnly);
 const key=x=>folderId(x.folder)||String(x.title||'').toLocaleLowerCase('id-ID').replace(/[^a-z0-9]/g,'')+'|'+parseDate(x.date);
 const byKey=new Map(archive.map(x=>[key(x),x]));
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
 docs=[...byKey.values()].sort((a,b)=>parseDate(b.date)-parseDate(a.date));
 drawAlbums();
 // Covers are read from original Drive folder listing, identical to landing.
 await Promise.allSettled(docs.slice(0,40).map(async doc=>{
   try{
    const media=await listMedia(doc);
    const image=media.find(x=>x.type==='foto')||media[0];
    if(image?.url){doc.cover=image.url;drawAlbums();}
   }catch{} // Source folder remains openable even when thumbnails cannot be read.
 }));
 window.F4Loading?.success('feedback',indicator);
}
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
const photoPlaceholder=()=>{const p=el('div','media-photo-placeholder');p.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"29\" height=\"29\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" />\n  <circle cx=\"9\" cy=\"9\" r=\"2\" />\n  <path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" /></svg>";return p};
const safe=value=>{try{const u=new URL(String(value||''));return /https?:/.test(u.protocol)?u.href:''}catch{return ''}};
const driveImage=value=>{
 const text=String(value||'');const m=text.match(new RegExp('(?:/d/|[?&]id=)([A-Za-z0-9_-]{12,})'));
 return m?'https://lh3.googleusercontent.com/d/'+m[1]:safe(text);
};
const category=a=>/gorol|pembersihan|menghias/i.test(a.title)?'Kerja Bakti':/arisan/i.test(a.title)?'Arisan':/lomba|kemerdekaan|nobar/i.test(a.title)?'Acara':'Lainnya';
let active='Semua';
const types=['Semua','Kerja Bakti','Arisan','Acara','Lainnya'];
const status=(message,type='loading',token)=>{
 const loading=window.F4Loading;
 if(!loading){const n=$('feedback');n.textContent=message||'';n.hidden=!message;return}
 if(type==='error')return loading.error('feedback',message,token);
 if(type==='empty')return loading.empty('feedback',message,token);
 if(!message)return loading.success('feedback',token);
 return loading.begin('feedback',message);
};
async function openAlbum(a){
 const token=status('Memuat foto dan video dari folder dokumentasi…');
 let media=[],failure=null;
 try{media=await listMedia(a)}catch(e){failure=e;status('Folder media belum dapat dibaca: '+(e.message||e),'error',token);}
 openMediaGallery(a.title,media,{folderURL:safe(a.folder),
  empty:'Media album ini belum dapat dibaca. Periksa izin akses dokumentasi atau sinkronisasi sumber media.'});
 if(!failure){if(media.length)status('', 'success',token);else status('Belum ada foto/video yang dapat dibaca untuk album ini.','empty',token);}
}
function drawAlbums(){
 const q=$('media-search').value.toLowerCase().trim();
 const rows=docs.filter(d=>(active==='Semua'||category(d)===active)&&(!q||(d.title+' '+d.description).toLowerCase().includes(q))).sort((a,b)=>parseDate(b.date)-parseDate(a.date));
 $('media-count').textContent=rows.length+' album';
 const list=$('media-albums');list.replaceChildren();
 if(!rows.length)list.append(el('p','muted','Album tidak ditemukan.'));
 for(const a of rows){
  const btn=el('button','media-album-card');btn.type='button';
  const cover=el('div','media-album-cover');if(a.cover){const img=document.createElement('img');img.src=driveImage(a.cover);img.alt='Sampul '+a.title;img.loading='lazy';img.onerror=()=>{if(img.isConnected)img.replaceWith(photoPlaceholder())};cover.append(img)}else cover.append(photoPlaceholder());
  const content=el('div','media-album-info');
  // The album index is a compact cover/title/date list. Descriptions are intentionally not displayed.
  content.append(el('small','media-category-tag',category(a)),el('strong','',a.title),el('small','muted',a.date));
  btn.append(cover,content);btn.onclick=()=>openAlbum(a);list.append(btn);
 }
}
function drawFilters(){
 const box=$('media-category-filters');box.replaceChildren();
 for(const kind of types){
  const btn=el('button','btn'+(active===kind?'':' outline'),kind);
  btn.type='button';btn.setAttribute('aria-pressed',String(active===kind));
  btn.onclick=()=>{active=kind;drawFilters();drawAlbums()};box.append(btn);
 }
}
function drawInventory(){
 const box=$('media-inventory-list');box.replaceChildren();
 $('inventory-total').textContent=inventory.length+' item';
 for(const r of inventory){
  const btn=el('button','media-inventory-item');btn.type='button';
  const src=driveImage(r.photo);
  if(src){const img=document.createElement('img');img.src=src;img.alt=r.name;img.loading='lazy';img.onerror=()=>{if(img.isConnected)img.replaceWith(photoPlaceholder())};btn.append(img)}
  else btn.append(photoPlaceholder());
  const copy=el('span','media-item-copy');copy.append(el('strong','',r.name),el('small','muted',r.condition));btn.append(copy);
  btn.append(el('span','portal-inventory-qty',r.quantity+' unit'));
  btn.onclick=()=>{if(src)openMediaViewer('Inventaris: '+r.name,[{url:src,type:'foto',caption:r.name}]);else status('Foto '+r.name+' memang belum tercantum dalam inventaris asli.')};
  box.append(btn);
 }
}
function tab(value,writeHash){
 const inv=value==='inventaris';
 $('media-albums-section').hidden=inv;$('media-inventory-section').hidden=!inv;
 for(const [name,is] of [['albums',!inv],['inventory',inv]]){
  const btn=$('media-tab-'+name);
  btn.className='btn'+(is?'':' outline');btn.setAttribute('aria-selected',String(is));
 }
 if(writeHash)history.replaceState(null,'',location.pathname+(inv?'#inventaris':''));
 if(window!==window.top)window.parent.postMessage({type:'f4:section',target:inv?'inventaris':'dokumentasi'},location.origin);
}
$('media-tab-albums').onclick=()=>tab('dokumentasi',true);
$('media-tab-inventory').onclick=()=>tab('inventaris',true);
$('media-search').oninput=drawAlbums;
addEventListener('hashchange',()=>tab(location.hash==='#inventaris'?'inventaris':'dokumentasi',false));
drawFilters();drawAlbums();drawInventory();tab(location.hash==='#inventaris'?'inventaris':'dokumentasi',false);
loadPortalArchive().catch(error=>{docs.sort((a,b)=>parseDate(b.date)-parseDate(a.date));drawAlbums();status('Arsip online belum dapat diperbarui ('+(error.message||error)+'). Menampilkan arsip kegiatan asli yang sudah tersedia.','error');});
