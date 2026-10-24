/* Portal Utama: elemen pembayaran/obrolan/saran dipindahkan dari implementasi lama.
   Komentar masih membaca/menulis Firebase Realtime Database lama; fitur lainnya di Cloudflare D1. */
const FB_CONFIG = {
  "apiKey": "AIzaSyAZ8gg6e0oTJ7xGoFudQxyCdzObRipWk_4",
  "authDomain": "flamboyan4-chat.firebaseapp.com",
  "databaseURL": "https://flamboyan4-chat-default-rtdb.firebaseio.com",
  "projectId": "flamboyan4-chat",
  "storageBucket": "flamboyan4-chat.firebasestorage.app",
  "messagingSenderId": "28700002867",
  "appId": "1:28700002867:web:047bb6930d4436ed837146",
  "measurementId": "G-DB8E547HKY"
};
const byId=id=>document.getElementById(id);
const sdkURL=['https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js','https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js'];
function loadScript(src){
 return new Promise((resolve,reject)=>{
  const tag=document.createElement('script');tag.src=src;tag.async=false;
  tag.onload=resolve;tag.onerror=()=>reject(new Error('Layanan obrolan tidak dapat dijangkau'));
  document.head.append(tag);
 });
}
async function initComments(){
 const state=byId('portal-comment-status'),list=byId('portal-comment-list'),count=byId('portal-chat-counter');
 try{
  for(const url of sdkURL)await loadScript(url);
  const firebase=window.firebase;
  if(!firebase)throw new Error('Firebase tidak tersedia');
  if(!firebase.apps.length)firebase.initializeApp(FB_CONFIG);
  const ref=firebase.database().ref('komentar_warga');
  ref.limitToLast(50).on('value',snapshot=>{
   const raw=snapshot.val()||{};
   const entries=Object.entries(raw).reverse().map(([id,item])=>item||{});
   if(count)count.textContent=entries.length+' Komentar terbaru';
   list.replaceChildren();
   if(!entries.length){const p=document.createElement('p');p.className='muted';p.textContent='Belum ada obrolan warga.';list.append(p)}
   entries.forEach(item=>{
    const card=document.createElement('article');card.className='portal-comment';
    const top=document.createElement('div');top.className='portal-comment-meta';
    const name=document.createElement('strong');name.textContent=String(item.nama||'Warga').slice(0,70);
    const stamp=document.createElement('small');stamp.textContent=String(item.waktu||'').slice(0,50);
    const msg=document.createElement('p');msg.textContent=String(item.pesan||'').slice(0,2000);
    top.append(name,stamp);card.append(top,msg);list.append(card);
   });
   state.textContent='Terhubung ke obrolan portal warga lama.';
  },err=>{
   state.textContent='Komentar belum bisa dimuat: '+err.message;
   if(count)count.textContent='Tidak tersambung';
  });
  const form=byId('portal-comment-form'),submit=byId('portal-comment-submit');
  form.addEventListener('submit',async e=>{
   e.preventDefault();
   const nama=byId('portal-comment-name').value.trim(),pesan=byId('portal-comment-message').value.trim();
   if(!nama||!pesan||submit.disabled)return;
   submit.disabled=true;state.textContent='Mengirim komentar…';
   try{
    const now=new Date();
    await ref.push({nama:nama.slice(0,70),pesan:pesan.slice(0,1000),waktu:now.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})+', '+now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),timestamp:firebase.database.ServerValue.TIMESTAMP});
    byId('portal-comment-message').value='';
    state.textContent='Komentar berhasil dikirim.';
   }catch(err){state.textContent='Gagal mengirim komentar: '+err.message}
   finally{submit.disabled=false}
  });
 }catch(err){
  state.textContent='Obrolan belum tersedia: '+err.message;
  if(count)count.textContent='Tidak tersambung';
 }
}
function initSuggestions(){
 const dlg=byId('portal-suggestion-dialog'),form=byId('portal-suggestion-form'),status=byId('portal-suggestion-status');
 byId('portal-suggestion-open').onclick=()=>{status.textContent='';dlg.showModal()};
 byId('portal-suggestion-close').innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19"/></svg>';byId('portal-suggestion-close').onclick=()=>dlg.close();
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
 form.addEventListener('submit',async e=>{
  e.preventDefault();const btn=byId('portal-suggestion-submit');
  if(btn.disabled)return;btn.disabled=true;status.textContent='Mengirim saran…';
  try{
   const resp=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
   if(!resp.ok)throw new Error('Layanan kotak saran menolak pengiriman');
   form.reset();status.textContent='Terima kasih, saran berhasil dikirim ke pengurus.';
  }catch(err){status.textContent='Saran gagal dikirim: '+err.message}
  finally{btn.disabled=false}
 });
}
function initPayments(){
 document.querySelectorAll('.copy-account').forEach(btn=>{
  btn.addEventListener('click',async()=>{
   const num=btn.dataset.account;const before=btn.textContent;
   try{await navigator.clipboard.writeText(num);btn.textContent='Tersalin!'}
   catch{btn.textContent='Gagal menyalin';}
   setTimeout(()=>{btn.textContent=before},2000);
  });
 });
}
function initScrollTop(){
 const btn=byId('portal-scroll-top');
 const update=()=>{btn.hidden=window.scrollY<250};
 window.addEventListener('scroll',update,{passive:true});update();
 btn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
}

let papaPromise=null;
function ensurePapa(){
 if(window.Papa)return Promise.resolve(window.Papa);
 if(!papaPromise)papaPromise=loadScript('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js').then(()=>window.Papa).catch(e=>{papaPromise=null;throw e});
 return papaPromise;
}

const DOC_CSV="https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=0&single=true&output=csv";
function docUrl(v){
 try{const u=new URL(String(v||'').trim());return u.protocol==='https:'?u.href:null}catch{return null}
}
function photoUrl(raw){
 const source=String(raw||'').trim();
 const file=source.match(/(?:\/d\/|[?&]id=)([a-zA-Z0-9_-]{12,})/);
 if(file&&!source.includes('/folders/'))return 'https://lh3.googleusercontent.com/d/'+file[1];
 return docUrl(source);
}

const LEGACY_PUBLIC_FOLDER_API="https://script.google.com/macros/s/AKfycbyes6A9_9EQ8vIYtf75cGgC9sKAZBvMewxEhYRSThjMAlBYqnkmKpa3yoPOtN0FEG92Zg/exec";
async function listLegacyFolder(raw){
 const id=String(raw||'').match(/\/folders\/([A-Za-z0-9_-]{12,})/)?.[1];
 if(!id)return [];
 try{
  const res=await fetch(LEGACY_PUBLIC_FOLDER_API+'?folderId='+encodeURIComponent(id));
  if(!res.ok)throw new Error('Folder unavailable');
  const json=await res.json();
  const rows=Array.isArray(json.files)?json.files:Array.isArray(json.images)?json.images:[];
  return rows.map(it=>{
   const url=typeof it==='string'?it:(it.url||it.link||it.src||'');
   const type=typeof it==='string'?'foto':String(it.type||'foto');
   return {url:photoUrl(url),type,caption:String(it.name||'').slice(0,120)};
  }).filter(it=>it.url);
 }catch{return []}
}


let previewRotation=null,previewRows=[],previewPos=0;
const cachedCover=new Map();
function extractPreview(row){
 const keys=Object.keys(row||{});
 return {title:String(row[keys[1]]||'Album kegiatan warga').slice(0,150),
 date:String(row[keys[0]]||'').slice(0,70),
 summary:String(row[keys[2]]||'').slice(0,220),
 media:String(row[keys[3]]||'').split(',').map(v=>v.trim()).filter(Boolean)};
}
async function previewCover(album){
 const direct=album.media.find(url=>!url.includes('/folders/'));
 if(direct)return photoUrl(direct);
 const folder=album.media.find(url=>url.includes('/folders/'));
 if(!folder)return null;
 if(!cachedCover.has(folder)){
  cachedCover.set(folder,listLegacyFolder(folder).then(items=>items.find(x=>x.type!=='video')?.url||null).catch(()=>null));
 }
 return cachedCover.get(folder);
}
function displayPreview(index){
 const dest=byId('portal-documentation');if(!dest||!previewRows.length)return;
 previewPos=(index+previewRows.length)%previewRows.length;
 const data=previewRows[previewPos];
 const card=document.createElement('a');card.href='dokumentasi/';card.className='portal-album-feature';
 card.setAttribute('aria-label','Lihat album '+data.title);
 const visual=document.createElement('div');visual.className='portal-preview-visual';card.append(visual);
 const content=document.createElement('div');content.className='portal-album-feature-text';
 const small=document.createElement('small');small.textContent=data.date;
 const heading=document.createElement('strong');heading.textContent=data.title;
 const caption=document.createElement('small');caption.textContent=data.summary;
 content.append(small,heading,caption);card.append(content);
 if(previewRows.length>1){
  const dots=document.createElement('div');dots.className='portal-preview-dots';
  previewRows.slice(0,9).forEach((v,i)=>{const dot=document.createElement('span');dot.className=i===previewPos?'selected':'';dots.append(dot)});
  card.append(dots);
 }
 dest.replaceChildren(card);
 previewCover(data).then(url=>{
  if(!url||!card.isConnected)return;
  const img=document.createElement('img');img.alt='Pratinjau '+data.title;img.src=url;img.loading='lazy';
  img.onerror=()=>img.remove();
  visual.append(img);
 });
}
function renderDocuments(items){
 const dest=byId('portal-documentation');if(!dest)return;
 previewRows=items.map(extractPreview).filter(x=>x.title).slice(0,9);previewPos=0;
 if(previewRotation){clearInterval(previewRotation);previewRotation=null}
 if(!previewRows.length){dest.textContent='Belum ada album dokumentasi yang dipublikasikan.';return}
 displayPreview(0);
 if(previewRows.length>1){
  previewRotation=setInterval(()=>{
   if(document.hidden||dest.matches(':hover')||dest.matches(':focus-within'))return;
   displayPreview(previewPos+1);
  },6500);
 }
}
async function initDocumentation(){
 const dest=byId('portal-documentation');if(!dest)return;
 try{
  await ensurePapa();
  const rows=await new Promise((resolve,reject)=>{
   window.Papa.parse(DOC_CSV,{download:true,header:true,skipEmptyLines:true,
    complete:r=>resolve((r.data||[]).filter(x=>{const vals=Object.values(x||{});return vals.length>=2&&String(vals[0]||'').trim()})),
    error:reject});
  });
  renderDocuments(rows.reverse());
 }catch(e){
  const p=document.createElement('p');p.className='muted';p.textContent='Arsip dokumentasi belum dapat dimuat: '+(e?.message||'koneksi tidak tersedia');
  dest.replaceChildren(p);
 }
}


const LEGACY_BANNER_CSV='https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=780113187&single=true&output=csv';
const LEGACY_PROJECT_CSV='https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=40982005&single=true&output=csv';
const LEGACY_INVENTORY_CSV='https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=492423764&single=true&output=csv';
async function readOldCsv(source){
 const Papa=await ensurePapa();
 return new Promise((resolve,reject)=>Papa.parse(source,{download:true,header:true,skipEmptyLines:true,complete:r=>resolve(r.data||[]),error:reject}))
}
export async function legacyBanners(){
 const rows=await readOldCsv(LEGACY_BANNER_CSV);
 return rows.map(row=>{const values=Object.values(row);const raw=String(values[1]||'').trim();
 return {imageUrl:photoUrl(raw),linkUrl:docUrl(values[2]),imageOnly:true}}).filter(row=>row.imageUrl);
}
export async function legacyInventory(){
 const rows=await readOldCsv(LEGACY_INVENTORY_CSV);
 return rows.map(row=>{const a=Object.values(row);return {name:String(a[0]||'').trim(),quantity:a[1]||0,unit:'Unit',condition:String(a[2]||'').trim(),imageUrl:photoUrl(a[3])||''}})
 .filter(row=>row.name&&!/nama barang/i.test(row.name));
}
export async function legacyProjects(){
 const rows=await readOldCsv(LEGACY_PROJECT_CSV);
 return rows.map(row=>({
  title:String(row['Nama Projek']||row['Nama project']||row['nama projek']||'').trim(),
  kind:String(row['Jenis']||row['jenis']||'').trim(),
  status:String(row['Status']||row['status']||'').trim(),
  show:String(row['Tampil']||row['tampil']||'').trim().toUpperCase(),
  target_url:docUrl(row['Link']||row['link']),
  sort:Number(row['Urutan']||row['urutan']||999)
 })).filter(x=>x.title&&['YA','YES','Y','TRUE','1','TAMPIL'].includes(x.show)).sort((a,b)=>a.sort-b.sort)
}
export async function legacyPublicFolder(source){return listLegacyFolder(source)}

/* Arsip Rapat publik: bentuk kartu, foto, dan modal baca, mengikuti rapat/index.html asli. */
const RAPAT_CSV="https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=449852491&single=true&output=csv";
function safePublicUrl(value){
 try{const u=new URL(String(value||'').trim());return u.protocol==='https:'?u.href:null}catch{return null}
}
function rapatPicture(raw){
 const str=String(raw||'').trim();
 const id=str.match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,})/);
 return id?'https://lh3.googleusercontent.com/d/'+id[1]:safePublicUrl(str);
}
function rapatEmbed(href){
 if(!href)return null;
 let m=href.match(/https:\/\/docs\.google\.com\/document\/d\/([A-Za-z0-9_-]+)/);
 if(m)return 'https://docs.google.com/document/d/'+m[1]+'/preview';
 m=href.match(/https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
 if(m)return 'https://drive.google.com/file/d/'+m[1]+'/preview';
 if(/^https:\/\/[^?#]+\.pdf(?:[?#]|$)/i.test(href))return href;
 return null;
}
function makeMeetingDialog(){
 let dlg=byId('portal-rapat-dialog');if(dlg)return dlg;
 dlg=document.createElement('dialog');dlg.id='portal-rapat-dialog';dlg.className='portal-rapat-dialog';
 dlg.innerHTML='<div class="portal-rapat-dialog-body"><header class="portal-rapat-dialog-head"><div><small id="portal-rapat-date">Rapat Warga</small><h2 id="portal-rapat-title">Hasil Rapat</h2></div><button id="portal-rapat-close" type="button" aria-label="Tutup notulensi">×</button></header><div class="portal-rapat-actions"><button id="portal-rapat-copy" type="button" class="btn outline">Salin link</button><a id="portal-rapat-external" class="btn" target="_blank" rel="noopener noreferrer">Buka Fullscreen ↗</a></div><div id="portal-rapat-viewer" class="portal-rapat-viewer"></div></div>';
 document.body.append(dlg);
 byId('portal-rapat-close').innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19"/></svg>';byId('portal-rapat-close').onclick=()=>dlg.close();
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
 return dlg;
}
function openRapat(item){
 const dlg=makeMeetingDialog();
 byId('portal-rapat-title').textContent=item.judul;
 byId('portal-rapat-date').textContent=item.tanggal;
 const safeLink=safePublicUrl(item.docUrl);
 const external=byId('portal-rapat-external');external.hidden=!safeLink;
 if(safeLink)external.href=safeLink;else external.removeAttribute('href');
 const area=byId('portal-rapat-viewer');area.replaceChildren();
 const embed=rapatEmbed(safeLink);
 if(embed){
  const iframe=document.createElement('iframe');iframe.title='Dokumen hasil rapat '+item.judul;
  iframe.src=embed;iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allow='fullscreen';
  area.append(iframe);
  const hint=document.createElement('p');hint.className='muted small';hint.textContent='Jika pratinjau Google Docs / PDF terhalang izin akses, gunakan Buka Fullscreen.';area.append(hint);
 }else{
  const notice=document.createElement('p');notice.className='muted';
  notice.textContent=safeLink?'Dokumen ini belum dapat ditampilkan dalam halaman. Buka melalui tautan dokumen.':'Tautan dokumen lengkap belum tersedia di data arsip ini.';
  area.append(notice);
 }
 const copy=byId('portal-rapat-copy');copy.textContent='Bagikan / Salin Link';
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(location.origin+'/rapat/#'+item.id);copy.textContent='Link Tersalin!'}catch{copy.textContent='Gagal menyalin'}};
 if(!dlg.open)dlg.showModal();
}
function drawMeetingCards(items,archive=false){
 const area=byId('meetings');if(!area)return;
 area.replaceChildren();area.className='grid-cards portal-meeting-grid';
 const status=byId('portal-meeting-status');
 if(status)status.textContent=archive?items.length+' Dokumen Rapat':'Ringkasan dari D1';
 if(!items.length){const p=document.createElement('p');p.className='muted';p.textContent='Belum ada hasil rapat yang dipublikasikan.';area.append(p);return}
 items.forEach(item=>{
  const card=document.createElement('article');card.className='portal-meeting-card';
  const cover=document.createElement('div');cover.className='portal-meeting-cover';
  const img=rapatPicture(item.fotoPreview);
  if(img){const el=document.createElement('img');el.src=img;el.loading='lazy';el.alt='Dokumentasi '+item.judul;el.referrerPolicy='no-referrer';el.onerror=()=>el.remove();cover.append(el)}
  const dateBadge=document.createElement('span');dateBadge.textContent=item.tanggal;dateBadge.className='portal-meeting-date';cover.append(dateBadge);
  const text=document.createElement('div');text.className='portal-meeting-text';
  const title=document.createElement('h3');title.textContent=item.judul;text.append(title);
  const info=document.createElement('p');info.textContent=item.deskripsi||'Klik untuk membaca notulensi lengkap dan lampiran dokumentasi.';text.append(info);
  const action=document.createElement('button');action.type='button';action.className='btn outline';action.textContent=archive?'Baca Hasil Rapat':'Lihat Ringkasan Rapat';
  action.onclick=()=>openRapat(item);
  if(archive){cover.style.cursor='pointer';cover.onclick=()=>openRapat(item);title.style.cursor='pointer';title.onclick=()=>openRapat(item)}
  card.append(cover,text,action);area.append(card);
 });
}
export async function renderMeetingArchive(fallback=[]){
 const backup=Array.isArray(fallback)?fallback.map((x,i)=>({
  id:'rapat-'+(fallback.length-i),tanggal:String(x.meeting_on||'').slice(0,10),
  judul:String(x.title||'Hasil Rapat Warga'),deskripsi:String(x.summary||''),
  fotoPreview:x.image_url||'',docUrl:x.document_url||x.doc_url||''
 })):[];
 drawMeetingCards(backup,false);
 try{
  const Papa=await ensurePapa();
  if(!Papa)throw new Error('Pembaca arsip tidak tersedia');
  const rows=await new Promise((resolve,reject)=>Papa.parse(RAPAT_CSV,{
   download:true,header:true,skipEmptyLines:true,
   complete:r=>resolve((r.data||[]).filter(row=>{const keys=Object.keys(row||{});return keys.length>=2&&String(row[keys[0]]||'').trim()})),
   error:reject
  }));
  const reversed=rows.reverse();
  const data=reversed.map((r,i)=>{
   const k=Object.keys(r);
   return{id:'rapat-'+(reversed.length-i),tanggal:String(r[k[0]]||'-'),judul:String(r[k[1]]||'Hasil Rapat Warga'),
    deskripsi:String(r[k[2]]||''),fotoPreview:String(r[k[3]]||''),docUrl:String(r[k[4]]||'')};
  });
  drawMeetingCards(data,true);
  const total=byId('count-meetings');if(total)total.textContent=String(data.length);
  return true;
 }catch(err){
  const status=byId('portal-meeting-status');
  if(status)status.textContent=backup.length?'Data D1 · arsip foto belum terhubung':'Arsip rapat belum dapat dimuat';
  if(!backup.length){const p=byId('meetings')?.querySelector('p');if(p)p.textContent='Arsip rapat tidak dapat dimuat saat ini. Coba lagi atau buka halaman Hasil Rapat lama.'}
  return false;
 }
}

export function initPortalExtras(){
 initPayments();initScrollTop();initSuggestions();initComments();initDocumentation();
 byId('portal-comment-form')?.querySelectorAll('.portal-emoji button').forEach(btn=>btn.addEventListener('click',()=>{
  const field=byId('portal-comment-message');field.value+=btn.textContent;field.focus();
 }));
}
