window.F4PortalRuntime.define("/portal-live/resident-profile.js",function(__f4){

'use strict';
const doc=__f4.globals.document,win=__f4.window,root=doc.getElementById('f4-resident-content');
if(!root)return;
const API='https://api.flamboyan4.web.id';
const el=(tag,cls='',value)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
const btn=(label,fn,cls='rp-button')=>{const b=el('button',cls,label);b.type='button';b.onclick=fn;return b};
const link=(label,href,cls='rp-button')=>{const a=el('a',cls,label);a.href=href;return a};
const read=async path=>{const r=await __f4.globals.fetch(API+path,{credentials:'include',cache:'no-store'});const data=await r.json();if(!r.ok||data.ok===false)throw Error(data.error||'Data tidak tersedia');return data};
const money=value=>'Rp'+Number(value).toLocaleString('id-ID',{maximumFractionDigits:0});
const today=()=>new Date(Date.now()+7*3600000).toISOString().slice(0,10);
const dateLabel=s=>/^\d{4}-\d{2}-\d{2}/.test(String(s||''))?new Date(s.slice(0,10)+'T00:00:00Z').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'—';
let serial=0,identity=null,account='',busy=false;
const message=(value)=>{root.replaceChildren(el('p','rp-empty',value))};
function roleChanged(e){
 if(e.origin!==__f4.globals.location.origin||e.source!==window||e.data?.type!=='f4:demo-role')return;
 const valid=e.data.role==='warga'&&e.data.identity?.accountId;
 if(!valid){serial++;account='';identity=null;busy=false;message('Masuk sebagai warga untuk membuka halaman ini.');root.append(btn('Masuk',()=>win.f4ShowLogin?.()));return}
 identity=e.data.identity;
 if(account===identity.accountId)return;
 account=identity.accountId;void load();
}
win.addEventListener('message',roleChanged);
let pullRefresh=null;
win.f4RefreshResidentPage=()=>{
 if(!identity||!account)return Promise.resolve();
 if(!pullRefresh)pullRefresh=Promise.resolve().then(()=>load()).finally(()=>{pullRefresh=null});
 return pullRefresh;
};
__f4.cleanup(()=>{serial++;identity=null;account='';});

let profileTab='uploads';
async function load(){
 const seq=++serial;message('Memuat profil…');
 try{const data=await read('/api/v2/gallery/my-profile');if(seq!==serial)return;
 const uploads=Array.isArray(data.uploads)?data.uploads:[],tagged=Array.isArray(data.tagged)?data.tagged:[];
 root.replaceChildren();const heading=el('div','rp-heading');heading.append(el('h1','','Profil'),btn('Muat ulang',()=>void load(),'rp-small'));root.append(heading);
 const head=el('section','rp-profile-head'),avatar=el('img','rp-avatar');avatar.alt='Foto profil';avatar.width=76;avatar.height=76;avatar.src=API+'/api/member/avatar?v='+Date.now();avatar.onerror=()=>{const fallback=el('span','rp-avatar rp-avatar-fallback');fallback.innerHTML='<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';avatar.replaceWith(fallback)};
 const who=el('div','rp-who');who.append(el('h2','',identity.nama||'Warga'),el('p','',identity.rumah?'Rumah '+identity.rumah:'Flamboyan 4'));const counts=el('div','rp-counts');for(const [n,label] of [[uploads.length,'Unggahan'],[tagged.length,'Ditandai']]){const cell=el('div');cell.append(el('b','',n),el('small','',label));counts.append(cell)}who.append(counts);head.append(avatar,who);root.append(head);
 const actions=el('div','rp-actions');actions.append(btn('Edit profil',()=>win.f4OpenUnifiedAccount?.()),link('Unggah foto','/dokumentasi/'));root.append(actions);
 const tabs=el('div','rp-tabs'),photos=el('div','rp-photos');root.append(tabs,photos);
 for(const [key,label] of [['uploads','Unggahan saya'],['tagged','Ditandai']]){const b=btn(label,()=>{profileTab=key;paint()},'rp-tab');b.dataset.kind=key;tabs.append(b)}
 function paint(){for(const b of tabs.children)b.setAttribute('aria-pressed',String(b.dataset.kind===profileTab));photos.replaceChildren();const rows=profileTab==='uploads'?uploads:tagged;if(!rows.length){photos.append(el('p','rp-empty',profileTab==='uploads'?'Belum ada unggahan.':'Belum ada foto yang menandai Anda.'));return}
 for(const item of rows){if(!item.url)continue;const tile=btn('',()=>{const viewer=win.f4MediaGallery;viewer?.openMediaGallery(item.title||'Dokumentasi',[{...item,type:'foto'}],{albumId:item.albumId||''});viewer?.openPhotoById(item.id)},'rp-photo');tile.setAttribute('aria-label',item.caption||item.title||'Buka foto');const img=el('img');img.src=item.url;img.alt=item.caption||item.title||'Foto warga';img.loading='lazy';img.onerror=()=>{img.replaceWith(el('span','rp-empty','Foto tidak tersedia'))};tile.append(img);photos.append(tile)}}
 paint();
 }catch(e){if(seq===serial){message('Profil belum dapat dimuat.');root.append(btn('Coba lagi',()=>void load()))}}
}
win.addEventListener('f4-account-profile-updated',e=>{if(!identity)return;if(e.detail?.nama)identity={...identity,nama:e.detail.nama};void load()});

});
