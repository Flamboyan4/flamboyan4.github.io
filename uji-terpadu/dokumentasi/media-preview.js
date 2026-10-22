
import {openMediaGallery,openMediaViewer} from '../../uji-integrasi/assets/media-viewer.js';
const docs=[{"date":"15-Mar-2026","title":"Pemasangan CCTV Lorong","description":"Sebagai bentuk pengawasan dan perlindungan dari potensi gangguan keamanan, CCTV dipasang pada 7 titik di Lorong Flamboyan 4.","folder":"https://drive.google.com/drive/folders/1azMUqjso0ZTVb87ZfO07cGd2beZ5WjWL?usp=sharing"},{"date":"2-Agu-2026","title":"Menghias Lorong","description":"Menyambut Hari Kemerdekaan, warga Lorong Flamboyan 4 kompak mempercantik lorong dengan umbul-umbul, rumbai, dan lukisan mural.","folder":"https://drive.google.com/drive/folders/1hzTnOA8D1NQTwyIaodyEAyNc6-BEbvah?usp=sharing"},{"date":"16-Agu-2026","title":"Perlombaan Hari Kemerdekaan RI","description":"Kemeriahan 17 Agustus disambut dengan serangkaian lomba yang diikuti oleh seluruh warga Lorong Flamboyan 4, dari balita hingga orang tua.","folder":"https://drive.google.com/drive/folders/1QU5ty5W_K6j2JRjaZGpRlGHyBoXyfHuN?usp=sharing"},{"date":"29-Agu-2026","title":"Penutupan Acara Hari Kemerdekaan RI","description":"Rangkaian kegiatan 17-an tahun ini akhirnya resmi ditutup dengan acara makan bersama sekaligus pembagian hadiah lomba.","folder":"https://drive.google.com/drive/folders/16b6TV8BzH1PaUpa93O1WQo-ahWsDasBb?usp=sharing"},{"date":"29-Agu-2026","title":"Serah Terima Humas","description":"Momen pengunduran diri Pak Riadu sekaligus pemilihan langsung Pak Heri (Ali) sebagai Humas baru. Terima kasih Pak Riadu atas pengabdiannya, dan selamat untuk Pak Heri!","folder":"https://drive.google.com/drive/folders/1nqVWaxe8uHqMkTrAYjpIziSNQqxFnF4E?usp=sharing"},{"date":"3-Okt-2026","title":"Arisan & Musyawarah Warga","description":"Kegiatan malam ini bertempat di rumah Pak Cahyo A6/02, membahas sosialisasi vendor sampah dan Program Flamboyan 4 melalui presentasi proyektor.","folder":"https://drive.google.com/drive/folders/1X3dpY5muogRxcO6ky7Ntg4JAmCrmjr7k?usp=sharing"},{"date":"5-Okt-2026","title":"NOBAR Indonesia Vs Thailand","description":"Berkumpul bersama mendukung Indonesia, sebuah kebersamaan warga flamboyan 4","folder":"https://drive.google.com/drive/folders/1vdFbmk-GtKvMgbFII0ZWyX-Z43FQXN2K?usp=sharing"},{"date":"11-Okt-2026","title":"Gorol dan Pembuatan Bank Sampah","description":"Kegiatan warga flamboyan 4 membersihkan lingkungan bersama-sama","folder":"https://drive.google.com/drive/folders/1ywp2v8rUH-oAGcM91PQyVrO7Wx9iLdCA?usp=sharing"}];
const inventory=[{"name":"Terpal","quantity":"1","condition":"Baik","photo":""},{"name":"Cangkul","quantity":"2","condition":"Baik","photo":""},{"name":"Garpu","quantity":"1","condition":"Baik","photo":""},{"name":"Pengki Bangunan","quantity":"3","condition":"Baik","photo":""},{"name":"Dispenser Es","quantity":"1","condition":"Baik","photo":"https://drive.google.com/file/d/15arUzGCcx0CZI4R8Gof51KdQoshygHj0/view?usp=sharing"}];
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
const safe=value=>{try{const u=new URL(String(value||''));return /https?:/.test(u.protocol)?u.href:''}catch{return ''}};
const driveImage=value=>{
 const text=String(value||'');const m=text.match(new RegExp('(?:/d/|[?&]id=)([A-Za-z0-9_-]{12,})'));
 return m?'https://lh3.googleusercontent.com/d/'+m[1]:safe(text);
};
const category=a=>/gorol|pembersihan|menghias/i.test(a.title)?'Kerja Bakti':/arisan/i.test(a.title)?'Arisan':/lomba|kemerdekaan|nobar/i.test(a.title)?'Acara':'Lainnya';
let active='Semua';
const types=['Semua','Kerja Bakti','Arisan','Acara','Lainnya'];
const status=t=>{$('feedback').textContent=t;$('feedback').hidden=!t};
function openAlbum(a){
 openMediaGallery(a.title,[],{folderURL:safe(a.folder),empty:'Isi foto dan video tersimpan di folder asli. Daftar file belum tersedia sebagai snapshot offline. Gunakan Buka sumber folder; tidak ada media rekaan.'});
}
function drawAlbums(){
 const q=$('media-search').value.toLowerCase().trim();
 const rows=docs.filter(d=>(active==='Semua'||category(d)===active)&&(!q||(d.title+' '+d.description).toLowerCase().includes(q)));
 $('media-count').textContent=rows.length+' album';
 const list=$('media-albums');list.replaceChildren();
 if(!rows.length)list.append(el('p','muted','Album tidak ditemukan.'));
 for(const a of rows){
  const btn=el('button','media-album-card');btn.type='button';
  const cover=el('div','media-album-cover');cover.append(el('div','media-photo-placeholder','▧'));
  const content=el('div','media-album-info');
  content.append(el('small','media-category-tag',category(a)),el('strong','',a.title),el('small','muted',a.date),el('p','muted',a.description));
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
  if(src){const img=document.createElement('img');img.src=src;img.alt=r.name;img.loading='lazy';img.onerror=()=>{if(img.isConnected)img.replaceWith(el('div','media-photo-placeholder','▧'))};btn.append(img)}
  else btn.append(el('div','media-photo-placeholder','▧'));
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
}
$('media-tab-albums').onclick=()=>tab('dokumentasi',true);
$('media-tab-inventory').onclick=()=>tab('inventaris',true);
$('media-search').oninput=drawAlbums;
addEventListener('hashchange',()=>tab(location.hash==='#inventaris'?'inventaris':'dokumentasi',false));
drawFilters();drawAlbums();drawInventory();tab(location.hash==='#inventaris'?'inventaris':'dokumentasi',false);
status('Salinan offline: 8 album dan 5 inventaris dari arsip asli Portal Utama.');
