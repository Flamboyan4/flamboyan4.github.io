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
   count.textContent=entries.length+' Komentar terbaru';
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
   count.textContent='Tidak tersambung';
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
  count.textContent='Tidak tersambung';
 }
}
function initSuggestions(){
 const dlg=byId('portal-suggestion-dialog'),form=byId('portal-suggestion-form'),status=byId('portal-suggestion-status');
 byId('portal-suggestion-open').onclick=()=>{status.textContent='';dlg.showModal()};
 byId('portal-suggestion-close').onclick=()=>dlg.close();
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
function renderDocuments(items){
 const dest=byId('portal-documentation');if(!dest)return;
 dest.replaceChildren();
 const row=items[0];if(!row){dest.append(Object.assign(document.createElement('p'),{textContent:'Belum ada album yang dipublikasikan.'}));return}
 const keys=Object.keys(row||{});
 const title=String(row[keys[1]]||'Album kegiatan warga'),tgl=String(row[keys[0]]||'');
 const desc=String(row[keys[2]]||''),raw=String(row[keys[3]]||'');
 const first=raw.split(',').map(v=>v.trim()).find(Boolean)||'';
 const link=document.createElement('a');link.className='portal-album-feature';link.href='dokumentasi/';
 const bg=photoUrl(first);
 if(bg&&!first.includes('/folders/')){const img=document.createElement('img');img.src=bg;img.alt='Foto dokumentasi kegiatan';img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>img.remove();link.append(img)}
 const caption=document.createElement('div');caption.className='portal-album-feature-text';
 const date=document.createElement('small');date.textContent=tgl.slice(0,80);
 const heading=document.createElement('strong');heading.textContent=title.slice(0,140);
 const summary=document.createElement('small');summary.textContent=desc.slice(0,130);
 caption.append(date,heading,summary);link.append(caption);dest.append(link);
}
async function initDocumentation(){
 const dest=byId('portal-documentation');if(!dest)return;
 try{
  await ensurePapa();
  if(!window.Papa)throw new Error('Pembaca arsip tidak tersedia');
  const rows=await new Promise((resolve,reject)=>{
   window.Papa.parse(DOC_CSV,{
    download:true,header:true,skipEmptyLines:true,
    complete:res=>resolve((res.data||[]).filter(r=>{const k=Object.keys(r||{});return k.length>=2&&String(r[k[0]]||'').trim()})),
    error:err=>reject(err)
   });
  });
  renderDocuments(rows.reverse());
 }catch(e){
  const p=document.createElement('p');p.className='muted';p.textContent='Arsip dokumentasi belum dapat dimuat: '+(e?.message||'koneksi tidak tersedia');dest.prepend(p);
 }
}


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
 byId('portal-rapat-close').onclick=()=>dlg.close();
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
