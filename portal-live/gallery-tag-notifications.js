/* Personal photo tag inbox, shared by Portal Utama and Dokumentasi. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id/api/v2/gallery';
const bar=document.getElementById('f4-direct-bar'),avatar=document.getElementById('f4-direct-avatar');
if(!bar||!avatar||document.getElementById('f4-tag-bell'))return;
const eligible=()=>!avatar.hidden&&Boolean(avatar.dataset.f4TagAccount);
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
const bell=el('button');bell.id='f4-tag-bell';bell.type='button';bell.hidden=true;
bell.setAttribute('aria-label','Notifikasi foto');bell.setAttribute('aria-haspopup','dialog');bell.setAttribute('aria-expanded','false');
bell.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/></svg>';
const count=el('span','f4-tag-bell-count');count.hidden=true;bell.append(count);bar.insertBefore(bell,avatar);
const dialog=el('dialog','f4-tag-inbox');dialog.setAttribute('aria-label','Notifikasi foto');
const head=el('header','f4-tag-inbox-head'),title=el('h2','','Notifikasi'),close=el('button','f4-tag-inbox-close');close.type='button';close.setAttribute('aria-label','Tutup notifikasi');close.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';head.append(title,close);
const list=el('div','f4-tag-inbox-list');dialog.append(head,list);document.body.append(dialog);
let items=[],busy=false,generation=0,archiveIndex=null,failed=false,lastCheck=0,accountKey='';
const request=async(path,options={})=>{
 const response=await fetch(API+path,{credentials:'include',cache:'no-store',...options});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||data.ok===false){const e=new Error(data.error||'HTTP '+response.status);e.status=response.status;throw e}return data;
};
function paint(){
 const unread=items.filter(x=>!x.read).length;
 count.hidden=!unread;count.textContent=unread>99?'99+':String(unread);
 bell.setAttribute('aria-label','Notifikasi foto'+(unread?', '+unread+' belum dibaca':''));
 if(!dialog.open)return;
 list.replaceChildren();
 if(busy&&!items.length){list.append(el('p','f4-tag-inbox-empty','Memuat notifikasi…'));return;}
 if(failed){const p=el('p','f4-tag-inbox-empty','Notifikasi belum dapat dimuat.');const retry=el('button','f4-tag-inbox-retry','Coba lagi');retry.type='button';retry.onclick=()=>refresh(true);list.append(p,retry);}
 if(!items.length&&!failed){list.append(el('p','f4-tag-inbox-empty','Belum ada foto yang menandai Anda.'));return;}
 for(const item of items){
  const button=el('button','f4-tag-inbox-item'+(item.read?'':' is-unread'));button.type='button';
  const img=el('img','f4-tag-inbox-photo');img.src=item.photoUrl;img.alt='';img.loading='lazy';
  const copy=el('span','f4-tag-inbox-copy');copy.append(el('strong','','Anda ditandai dalam sebuah foto'),el('small','',item.title||'Dokumentasi Warga'));
  button.append(img,copy);
  if(!item.read)button.append(el('span','f4-tag-inbox-dot'));
  button.onclick=async()=>{
   if(!eligible())return;
   const stamp=generation;button.disabled=true;
   try{
    let album=item.albumId;
    if(!album&&item.id.startsWith('gdrive:')){
     archiveIndex=archiveIndex||await fetch('/assets/data/portal-photo-index.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Indeks foto tidak tersedia.');return r.json()});
     const folder=Object.entries(archiveIndex.folders||{}).find(([,media])=>media.some(x=>x.id===item.id.slice(7)))?.[0];
     if(folder)album='gfolder:'+folder;
    }
    if(!album)throw Error('Album foto ini belum ditemukan.');
    if(stamp!==generation||!eligible())return;
    await request('/tag-notifications/read',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:item.id})});
    if(stamp!==generation||!eligible())return;
    item.read=true;const url=new URL('/dokumentasi/',location.origin);url.searchParams.set('album',album);url.searchParams.set('foto',item.id);location.assign(url.href);
   }catch(e){if(stamp!==generation)return;button.disabled=false;copy.append(el('small','f4-tag-inbox-error',e.message||'Foto belum dapat dibuka.'));}
  };list.append(button);
 }
}
function reset(){generation++;items=[];busy=false;failed=false;lastCheck=0;accountKey='';bell.hidden=true;if(dialog.open)dialog.close();paint();}
async function refresh(force=false){
 if(!eligible()){if(accountKey||!bell.hidden)reset();return;}
 const key=avatar.dataset.f4TagAccount;
 if(accountKey!==key){reset();accountKey=key;}
 bell.hidden=false;
 if(busy||(!force&&Date.now()-lastCheck<30000))return;
 busy=true;failed=false;const stamp=generation;paint();
 try{
  const data=await request('/tag-notifications');
  if(stamp!==generation||!eligible())return;
  items=Array.isArray(data.items)?data.items:[];lastCheck=Date.now();
 }catch(e){
  if(stamp!==generation)return;
  if(e.status===401||e.status===403){reset();return;}
  failed=true;lastCheck=Date.now();
 }finally{if(stamp===generation){busy=false;paint();}}
}
bell.onclick=()=>{if(!eligible())return;dialog.showModal();bell.setAttribute('aria-expanded','true');paint();refresh(true);};
close.onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{bell.setAttribute('aria-expanded','false');if(!bell.hidden)bell.focus({preventScroll:true});});
new MutationObserver(()=>{if(!eligible()){if(accountKey||!bell.hidden)reset();}else refresh(true);}).observe(avatar,{attributes:true,attributeFilter:['hidden','data-f4-tag-account']});
window.addEventListener('focus',()=>refresh());document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
window.addEventListener('pageshow',()=>refresh(true));
setInterval(()=>{if(!document.hidden&&eligible())refresh();},60000);
refresh(true);
})();
