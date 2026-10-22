
import {initShell,elem,fmtNum} from './ui.js';
import {apiURL} from './config.js';
import {endpoints} from './api.js';
import {openMediaGallery,openMediaViewer} from './media-viewer.js';
const $=id=>document.getElementById(id);
const isBank=document.body.dataset.page==='bank';
const docCsv="https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=0&single=true&output=csv";
const inventoryCsv="https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=492423764&single=true&output=csv";
initShell(isBank?'bank':'portal');
let albumItems=[],inventoryItems=[],activeCategory='Semua';
const allowedCategories=isBank?['Semua','Kerja Bakti','Penimbangan','Acara','Lainnya']:['Semua','Kerja Bakti','Arisan','Acara','Lainnya'];
const limit=(s,max=300)=>String(s??'').slice(0,max);
const publicFolderAPI="https://script.google.com/macros/s/AKfycbyes6A9_9EQ8vIYtf75cGgC9sKAZBvMewxEhYRSThjMAlBYqnkmKpa3yoPOtN0FEG92Zg/exec";
async function readLegacyFolder(raw){
 const id=String(raw||'').match(/\/folders\/([A-Za-z0-9_-]{12,})/)?.[1];
 if(!id)return [];
 try{
  const response=await fetch(publicFolderAPI+'?folderId='+encodeURIComponent(id));if(!response.ok)return [];
  const d=await response.json();const files=Array.isArray(d.files)?d.files:Array.isArray(d.images)?d.images:[];
  return files.map(f=>{
   if(typeof f==='string')return {url:driveImage(f),type:'foto'};
   const type=/video/i.test(f.type||f.mimeType||'')?'video':'foto';
   const raw=f.url||f.link||f.src||'';
   const id=String(raw).match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,})/)?.[1];
   return {url:type==='video'&&id?'https://drive.google.com/file/d/'+id+'/view':driveImage(raw),type,caption:String(f.name||f.title||'').slice(0,90)};
  }).filter(x=>x.url);
 }catch{return []}
}

function safeHttp(raw){try{const u=new URL(String(raw||'').trim());return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
function externalMedia(url){const x=String(url||'');if(x.startsWith('/'))return apiURL(x);return safeHttp(x)}
function driveImage(raw){const s=String(raw||'').trim();const m=s.match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,})/);return m?'https://lh3.googleusercontent.com/d/'+m[1]:safeHttp(s)}
function normalizeCategory(x){
 const v=limit(x,70).toLowerCase();if(/kerja bakti|gorol|pembersihan/.test(v))return 'Kerja Bakti';
 if(/penimbangan|timbang/.test(v))return isBank?'Penimbangan':'Lainnya';
 if(/arisan/.test(v))return isBank?'Acara':'Arisan';
 if(/acara|maulid|17 agustus|kemerdekaan/.test(v))return 'Acara';
 return 'Lainnya';
}
const status=(txt,isError=false)=>{const p=$('feedback');p.textContent=txt;p.dataset.kind=isError?'error':'success'};
function parseCsv(url){
 return new Promise((resolve,reject)=>{
  const run=()=>window.Papa.parse(url,{download:true,header:true,skipEmptyLines:true,
   complete:x=>resolve((x.data||[]).filter(r=>Object.values(r||{}).some(v=>String(v||'').trim()))),error:reject});
  if(window.Papa)return run();
  const script=document.createElement('script');script.src='https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
  script.onload=run;script.onerror=()=>reject(new Error('Pustaka pembaca CSV tidak tersedia'));document.head.append(script);
 });
}
function makeImage(src,label){
 if(!src)return elem('div','▧','media-photo-placeholder');
 const img=document.createElement('img');img.src=src;img.alt=label;img.loading='lazy';img.referrerPolicy='no-referrer';
 img.onerror=()=>img.replaceWith(elem('div','▧','media-photo-placeholder'));return img;
}

function viewAlbum(item){
 if(isBank){
  const feedback=$('feedback');feedback.hidden=false;feedback.textContent='Memuat album '+item.title+'…';
  endpoints.bankAlbum(item.id).then(data=>{
   const records=(data.media||[]).map(x=>({type:x.media_type||x.type||x.mime_type,url:externalMedia(x.mediaUrl||x.external_url||x.url),caption:x.caption||''})).filter(x=>x.url);
   feedback.hidden=true;openMediaGallery(item.title,records);
  }).catch(e=>status('Album tidak dapat dibuka: '+e.message,true));
  return;
 }
 const all=String(item.raw||'').split(',').map(x=>x.trim()).filter(Boolean);
 const direct=all.filter(x=>!x.includes('/folders/')).map(x=>({url:driveImage(x),type:'foto',caption:item.title}));
 const folder=all.find(x=>x.includes('/folders/'));if(!folder){openMediaGallery(item.title,direct);return}
 const feedback=$('feedback');feedback.hidden=false;feedback.textContent='Memuat media album…';
 readLegacyFolder(folder).then(media=>{
  feedback.hidden=true;
  openMediaGallery(item.title,[...direct,...media],{folderURL:safeHttp(folder)});
 }).catch(()=>{feedback.hidden=true;openMediaGallery(item.title,direct,{folderURL:safeHttp(folder)})});
}

function renderAlbums(){
 const list=$('media-albums');list.replaceChildren();
 const search=$('media-search').value.trim().toLowerCase();
 const filtered=albumItems.filter(a=>(activeCategory==='Semua'||a.category===activeCategory)&&(!search||(a.title+' '+a.description).toLowerCase().includes(search)));
 if($('media-count'))$('media-count').textContent=filtered.length+' album';
 if(!filtered.length){list.append(elem('p','Tidak ada album untuk filter ini.','muted'));return}
 filtered.forEach(a=>{
  const card=elem('button',undefined,'media-album-card');card.type='button';
  const photo=elem('div',undefined,'media-album-cover');photo.append(makeImage(a.cover,'Foto '+a.title));
  const info=elem('div',undefined,'media-album-info');
  info.append(elem('small',a.category,'media-category-tag'));info.append(elem('strong',a.title));
  info.append(elem('small',a.date||'', 'muted'));
  if(a.description)info.append(elem('p',a.description,'muted'));
  card.append(photo,info);card.onclick=()=>viewAlbum(a);list.append(card);
 });
}
function renderFilters(){
 const div=$('media-category-filters');div.replaceChildren();
 allowedCategories.forEach(cat=>{
  const b=elem('button',cat,'btn'+(activeCategory===cat?'':' outline'));b.type='button';
  b.setAttribute('aria-pressed',String(activeCategory===cat));
  b.onclick=()=>{activeCategory=cat;renderFilters();renderAlbums()};div.append(b);
 });
}
function renderInventories(){
 const node=$('media-inventory-list');node.replaceChildren();
 if($('inventory-total'))$('inventory-total').textContent=inventoryItems.length+' item';
 if(!inventoryItems.length){node.append(elem('p','Belum ada inventaris publik yang tercatat.','muted'));return}
 inventoryItems.forEach(x=>{
  const b=elem('button',undefined,'media-inventory-item');b.type='button';
  b.append(makeImage(x.photo,'Foto '+x.name));
  const copy=elem('span',undefined,'media-item-copy');copy.append(elem('strong',x.name));
  copy.append(elem('small',x.condition||x.category||'Tercatat','muted'));b.append(copy);
  b.append(elem('span',limit(x.qty,25)+' '+limit(x.unit||'Unit',14),'portal-inventory-qty'));
  b.onclick=()=>{if(x.photo)openMediaViewer('Inventaris: '+x.name,[{url:x.photo,type:'foto'}]);};
  node.append(b);
 });
}
function selectTab(view){
 const isInv=view==='inventaris';
 $('media-albums-section').hidden=isInv;$('media-inventory-section').hidden=!isInv;
 [['media-tab-albums',!isInv],['media-tab-inventory',isInv]].forEach(([id,active])=>{
  const b=$(id);b.className='btn'+(active?'':' outline');b.setAttribute('aria-selected',String(active))
 });
}
$('media-tab-albums').onclick=()=>{history.replaceState(null,'',location.pathname);selectTab('album')};
$('media-tab-inventory').onclick=()=>{history.replaceState(null,'',location.pathname+'#inventaris');selectTab('inventaris')};
window.addEventListener('hashchange',()=>selectTab(location.hash==='#inventaris'?'inventaris':'album'));
selectTab(location.hash==='#inventaris'?'inventaris':'album');
$('media-search').oninput=renderAlbums;
async function load(){
 try{
  if(isBank){
   const res=await endpoints.bank();
   albumItems=(res.albums||[]).map(a=>({
    id:a.id,title:limit(a.title||'Album Warga',130),description:limit(a.description||'',260),
    category:normalizeCategory(a.category||a.title),cover:externalMedia(a.coverUrl||a.cover_url||''),
    date:limit(a.event_on||'',30)
   }));
   inventoryItems=(res.inventory||[]).map(x=>({name:limit(x.name,140),qty:String(x.quantity||0),unit:x.unit,condition:x.condition,category:x.category,photo:externalMedia(x.imageUrl||x.photoUrl||x.photo_url||'')}));
   status('Album dan inventaris publik dibaca dari API Bank Sampah D1.');
  }else{
   const [docs,inventory]=await Promise.all([parseCsv(docCsv),parseCsv(inventoryCsv)]);
   albumItems=docs.map(row=>{
    const k=Object.keys(row);const raw=limit(row[k[3]]||'',5000);
    const first=raw.split(',').map(x=>x.trim()).find(x=>x&&!x.includes('/folders/'));
    return {title:limit(row[k[1]]||'Album Kegiatan',140),date:limit(row[k[0]]||'',30),
     description:limit(row[k[2]]||'',260),raw,
     cover:first?driveImage(first):null,
     category:normalizeCategory(k[4]?row[k[4]]||row[k[1]]:row[k[1]])}
   }).filter(x=>x.title).reverse();
   for(const item of albumItems.slice(0,16)){
    if(!item.cover&&item.raw.includes('/folders/')){
     const rows=await readLegacyFolder(item.raw);
     const img=rows.find(x=>x.type!=='video');
     if(img)item.cover=img.url;
    }
   }
   inventoryItems=inventory.map(row=>{const k=Object.keys(row);return {
    name:limit(row[k[0]],140),qty:limit(row[k[1]]||'0',25),unit:'Unit',condition:limit(row[k[2]]||'',120),
    photo:driveImage(row[k[3]]||'')
   }}).filter(x=>x.name);
   status('Dokumentasi dan inventaris menggunakan arsip publik Portal Utama lama. Kategori lama dikelompokkan berdasarkan judul.');
  }
  renderFilters();renderAlbums();renderInventories();
 }catch(e){status('Tidak dapat memuat daftar: '+e.message,true)}
}
load();
