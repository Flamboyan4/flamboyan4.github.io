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
 const grid=document.createElement('div');grid.className='grid-cards';
 items.slice(0,60).forEach(row=>{
  const keys=Object.keys(row||{});
  const tanggal=String(row[keys[0]]||''),judul=String(row[keys[1]]||'Album Warga');
  const desc=String(row[keys[2]]||'Lihat dokumentasi kegiatan warga');
  const raw=String(row[keys[3]]||'');
  const first=raw.split(',').map(v=>v.trim()).find(Boolean)||'';
  const folder=first.match(/\/folders\/([a-zA-Z0-9_-]+)/)||first.match(/(?<!\w)[?&]id=([a-zA-Z0-9_-]{12,})/);
  const link=folder?'https://drive.google.com/drive/folders/'+folder[1]:docUrl(first)||photoUrl(first);
  const card=document.createElement('article');card.className='info-card portal-album-card';
  const imageUrl=folder?null:photoUrl(first);
  if(imageUrl){const img=document.createElement('img');img.src=imageUrl;img.alt='Dokumentasi: '+judul;img.loading='lazy';img.referrerPolicy='no-referrer';img.className='portal-album-image';img.onerror=()=>img.remove();card.append(img)}
  const h=document.createElement('h3');h.textContent=judul.slice(0,140);card.append(h);
  const d=document.createElement('small');d.className='muted';d.textContent=tanggal.slice(0,70);card.append(d);
  const p=document.createElement('p');p.textContent=desc.slice(0,350);card.append(p);
  if(link){const a=document.createElement('a');a.className='text-link';a.href=link;a.textContent='Buka album / foto ↗';a.target='_blank';a.rel='noopener noreferrer';card.append(a)}
  grid.append(card);
 });
 if(items.length){dest.append(grid)}
 else{const p=document.createElement('p');p.className='muted';p.textContent='Belum ada album dokumentasi.';dest.append(p)}
 const note=document.createElement('p');note.className='muted small';note.textContent='Album mengikuti arsip dokumentasi portal lama. Integrasi galeri penuh ke Cloudflare masih berlangsung.';dest.append(note);
 const a=document.createElement('a');a.href='https://flamboyan4.web.id/#dokumentasi-preview-img';a.className='text-link';a.textContent='Buka galeri lengkap di website lama ↗';dest.append(a);
}
async function initDocumentation(){
 const dest=byId('portal-documentation');if(!dest)return;
 try{
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js');
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

export function initPortalExtras(){
 initPayments();initScrollTop();initSuggestions();initComments();initDocumentation();
 byId('portal-comment-form')?.querySelectorAll('.portal-emoji button').forEach(btn=>btn.addEventListener('click',()=>{
  const field=byId('portal-comment-message');field.value+=btn.textContent;field.focus();
 }));
}
