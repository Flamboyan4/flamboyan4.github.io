/* Shared native documentation viewer. Archive and upload IDs are not rewritten.
   Public bank album endpoint applies photo-level program tags on the server. */
const API='https://api.flamboyan4.web.id';
const arr=v=>Array.isArray(v)?v:[];
const folder=v=>String(v||'').match(/(?:\/folders\/|[?&]folderId=)([A-Za-z0-9_-]{12,110})/)?.[1]||'';
const drive=v=>String(v||'').match(/(?:\/d\/|[?&]id=|\/gallery\/(?:image|video|public-video)\/)([A-Za-z0-9_-]{12,110})/)?.[1]||'';
const validDrive=v=>/^[A-Za-z0-9_-]{12,110}$/.test(v||'');
function safeUrl(value){
 const raw=String(value||'');
 if(raw.startsWith('/api/v2/public/bank/media/'))return API+raw;
 try{const u=new URL(raw);return u.protocol==='https:'?u.href:''}catch{return ''}
}
const publicDoc=d=>(!d.visibility||d.visibility==='publik')&&(d.active==null||d.active===true||String(d.active)==='1')&&!/^Bank Sampah\s*[:/]/i.test(d.category||'');
function imageUrl(id){return 'https://lh3.googleusercontent.com/d/'+encodeURIComponent(id)}
function videoUrl(id){return API+'/api/v2/gallery/public-video/'+encodeURIComponent(id)}
export function collectCommunityAlbums(data,docs,index){
 const suppressed=new Set(arr(data.suppressedDriveIds)),albums=new Map();
 for(const a of arr(data.albums))if(a.id)albums.set(a.id,{id:a.id,title:a.title||'Dokumentasi',date:a.date||'',media:[]});
 for(const d of arr(docs).filter(publicDoc)){
  const f=folder(d.drive_url||d.folder),id=d.id||('gfolder:'+f);if(!f||!id)continue;
  const existing=albums.get(id)||{id,title:d.title||'Dokumentasi',date:d.event_on||'',media:[]};
  for(const item of arr(index?.folders?.[f])){
   if(!validDrive(item.id)||suppressed.has(item.id)||!['foto','video'].includes(item.type))continue;
   existing.media.push({id:'gdrive:'+item.id,driveId:item.id,type:item.type,url:item.type==='video'?videoUrl(item.id):imageUrl(item.id),date:d.event_on||'',social:item.type==='foto'});
  }
  albums.set(id,existing);
 }
 for(const p of arr(data.photos)){
  const a=albums.get(p.albumId),fid=p.driveId||drive(p.url);if(!a||!p.id||suppressed.has(fid))continue;
  const url=safeUrl(p.url)||(validDrive(fid)?imageUrl(fid):'');if(!url)continue;
  a.media=a.media.filter(x=>!fid||x.driveId!==fid);
  a.media.push({id:p.id,driveId:fid,type:'foto',url,caption:p.caption,date:p.date,social:true});
 }
 return [...albums.values()].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
export function normalizeBankMedia(m){
 const kind=m.media_type||m.type;
 if(!['foto','video'].includes(kind))return null;
 const raw=m.mediaUrl||m.external_url||m.url,fid=drive(raw),id=String(m.id||'');
 const url=kind==='video'&&validDrive(fid)?videoUrl(fid):safeUrl(raw);
 if(!url||!id)return null;
 return {id,driveId:fid,type:kind,url,caption:m.caption,date:m.created_at,social:kind==='foto'&&/^(f4photo:|gdrive:)/.test(id)};
}
export async function mountGallery({root,role,get,getArchive,socialWrite,el,signal,bank=false,portalData,bankData}){
 const result=el('div',null,'gallery-results'),status=el('p'),tabs=el('div',null,'gallery-tabs');status.setAttribute('role','status');
 let generation=0,viewGeneration=0,activeAlbum=null,activeMedia=[],at=0,mode='terbaru',pending=false,dialog=null,photoStatus=null,readController=null;
 const btn=(label,fn,cls)=>{const b=el('button',label,cls);b.type='button';b.onclick=fn;return b};
 const gallery=bank?null:await get('/api/v2/gallery',signal,false);
 let archive={folders:{}},archiveError=false;
 if(!bank&&getArchive){try{archive=await getArchive(signal)}catch{archiveError=true}}
 const albums=bank?arr(bankData?.albums).map(a=>({id:a.id,title:a.title||'Dokumentasi Bank Sampah',date:a.event_on,cover:a.coverUrl,media:null})):collectCommunityAlbums(gallery,portalData?.documentation,archive);
 const map=new Map(albums.map(a=>[a.id,a]));
 function mediaImage(m,alt){const img=el('img');img.alt=alt||'Foto kegiatan';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.src=safeUrl(m.url)||'';let fallback=0;img.onerror=()=>{if(validDrive(m.driveId)&&fallback++===0){img.src='https://drive.google.com/thumbnail?id='+encodeURIComponent(m.driveId)+'&sz=w1200';return}img.replaceWith(el('span','Foto belum dapat dimuat','gallery-unavailable'))};return img}
 function stopMedia(){readController?.abort();readController=null;if(dialog)for(const v of dialog.querySelectorAll('video')){v.pause();v.removeAttribute('src');v.load()}}
 function close(){++viewGeneration;stopMedia();if(dialog?.open)dialog.close()}
 function ensureDialog(){
  if(dialog)return dialog;
  dialog=el('dialog',null,'gallery-viewer');dialog.setAttribute('aria-label','Foto dan video kegiatan');
  dialog.addEventListener('close',()=>{++viewGeneration;stopMedia()});
  root.append(dialog);return dialog;
 }
 async function show(){
  const v=++viewGeneration;stopMedia();const m=activeMedia[at];if(!m||signal.aborted)return;
  const host=ensureDialog();host.replaceChildren();
  const header=el('header',null,'gallery-viewer-head');header.append(el('strong',activeAlbum.title),btn('Tutup',close));
  const stage=el('div',null,'gallery-stage');if(m.type==='video'){const video=el('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.src=m.url;stage.append(video)}else stage.append(mediaImage(m,m.caption||activeAlbum.title));
  const nav=el('div',null,'gallery-tabs'),prev=btn('Sebelumnya',()=>{if(at>0){at--;void show()}}),next=btn('Berikutnya',()=>{if(at<activeMedia.length-1){at++;void show()}});prev.disabled=at===0;next.disabled=at===activeMedia.length-1;nav.append(prev,el('small',(at+1)+' / '+activeMedia.length),next);
  const social=el('section',null,'gallery-social');photoStatus=el('p');photoStatus.setAttribute('role','status');host.append(header,stage,nav,social,photoStatus);if(!host.open)host.showModal();
  if(!m.social)return;
  readController=new AbortController();const current=readController;
  const alive=()=>!signal.aborted&&!current.signal.aborted&&v===viewGeneration&&host.open;
  const socialPath='/api/v2/gallery/social?type=photo&id='+encodeURIComponent(m.id);
  async function load(){
   try{const state=await get(socialPath,current.signal,role!=='public');if(!alive())return;paintSocial(state)}
   catch(error){if(alive())photoStatus.textContent='Komentar belum dapat dimuat.'}
  }
  function paintSocial(state){
   social.replaceChildren();const like=btn((state.liked?'♥ ':'♡ ')+String(state.likes??0),async()=>{
    if(!socialWrite||pending||!alive())return;pending=true;like.disabled=true;
    try{const updated=await socialWrite('/api/v2/gallery/react',{type:'photo',id:m.id});if(alive())paintSocial(updated)}
    catch(error){if(alive())photoStatus.textContent='Reaksi belum terkonfirmasi. Muat ulang foto sebelum mencoba lagi.'}
    finally{pending=false;if(alive())like.disabled=false}
   },'gallery-like');
   like.setAttribute('aria-label',state.liked?'Batal suka':'Suka');like.setAttribute('aria-pressed',String(Boolean(state.liked)));like.disabled=role==='public'||!socialWrite;social.append(like);
   for(const c of arr(state.comments)){const line=el('div',null,'gallery-comment');line.append(el('strong',c.author||c.nama||'Warga'),el('p',c.message||''));social.append(line)}
   if(!arr(state.comments).length)social.append(el('small','Belum ada komentar'));
   if(role!=='public'&&socialWrite){
    const form=el('form',null,'gallery-comment-form'),input=el('input'),send=el('button','Kirim');input.required=true;input.maxLength=500;input.placeholder='Tulis komentar';input.setAttribute('aria-label','Tulis komentar');send.type='submit';
    form.addEventListener('submit',async e=>{e.preventDefault();const message=input.value.trim();if(!message||pending||!alive())return;pending=true;send.disabled=true;
     try{await socialWrite('/api/v2/gallery/comment',{type:'photo',id:m.id,message});if(alive()){input.value='';await load()}}
     catch(error){if(alive())photoStatus.textContent='Komentar belum terkonfirmasi. Muat ulang foto sebelum mencoba lagi.'}
     finally{pending=false;if(alive())send.disabled=false}
    });form.append(input,send);social.append(form);
   }
  }
  await load();
 }
 async function openAlbum(a,photoId){
  const token=++generation;status.textContent='Memuat album…';
  try{
   let media=a.media;
   if(bank&&!media){const d=await get('/api/v2/public/bank/album/'+encodeURIComponent(a.id),signal,false);media=arr(d.media).map(normalizeBankMedia).filter(Boolean);a.media=media;}
   if(signal.aborted||token!==generation)return;
   if(!media?.length){status.textContent='Belum ada foto atau video pada album ini.';return}
   activeAlbum=a;activeMedia=media;at=Math.max(0,media.findIndex(x=>x.id===photoId));status.textContent='';await show();
  }catch(error){if(!signal.aborted&&token===generation)status.textContent=error.message}
 }
 function card(a,m){
  const b=btn('',()=>void openAlbum(a,m?.id),'gallery-card');
  b.setAttribute('aria-label','Buka '+a.title);
  const cover=m?.type==='video'?null:m?.url||a.cover;
  if(cover)b.append(mediaImage({...m,url:cover},a.title));else b.append(el('span',m?.type==='video'?'Video':'Album','gallery-unavailable'));
  b.append(el('small',a.title));return b;
 }
 function render(){
  result.replaceChildren();const grid=el('div',null,'gallery-grid');
  if(mode==='populer'){
   for(const m of arr(gallery?.ranking)){const a=map.get(m.albumId);if(a){const match=a.media.find(x=>x.id===m.id);if(match)grid.append(card(a,match))}}
  }else for(const a of albums)grid.append(card(a,a.media?.find(m=>m.type==='foto')||a.media?.[0]));
  if(!grid.children.length)result.append(el('p','Belum ada dokumentasi yang dapat ditampilkan.'));else result.append(grid);
 }
 tabs.append(btn('Terbaru',()=>{mode='terbaru';render()}));
 if(!bank)tabs.append(btn('Populer',async()=>{const token=++generation;status.textContent='Memuat foto populer…';try{const d=await get('/api/v2/gallery/popular',signal,false);if(signal.aborted||token!==generation)return;gallery.ranking=arr(d.popular);mode='populer';render();status.textContent=''}catch(error){if(!signal.aborted)status.textContent=error.message}}));
 root.append(tabs,status,result);render();
 if(archiveError)status.textContent='Arsip foto lama belum dapat dimuat. Album baru tetap tersedia.';
 signal.addEventListener?.('abort',close,{once:true});
 return {node:root,dispose:close};
}
