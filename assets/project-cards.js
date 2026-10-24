
import {elem} from './ui.js';
import {legacyPublicFolder} from './portal-extras.js';
const FOLDERS={gapura:'https://drive.google.com/drive/folders/1Zs2RlbHTvNc9RDhbc1TlgcptXeNhnrQ5',jersey:'https://drive.google.com/drive/folders/1_VH_MHlOhA_tSXPsw1ztJEf3fVydU7gE'};
function key(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function projectType(o){
 const txt=(o.kind||o.title||'').toLowerCase();
 if(/bank\s*sampah/.test(txt))return 'bank';if(/gapura/.test(txt))return 'gapura';if(/jersey/.test(txt))return 'jersey';return 'other';
}
function safe(url){try{const u=new URL(url,location.origin);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function makeCard(o){
 const kind=projectType(o),card=elem('article',undefined,'portal-project-card');
 const top=elem('div',undefined,'portal-project-title-row');top.append(elem('strong',o.title||'Proyek Warga'));
 const status=String(o.status||'').trim();if(status)top.append(elem('span',status,'portal-project-status'));
 card.append(top);
 const visual=elem('div',undefined,'portal-project-cover '+('project-'+kind));
 visual.append(elem('span',kind==='bank'?'♻':kind==='gapura'?'⌂':kind==='jersey'?'♜':'▥','portal-project-symbol'));
 card.append(visual);
 if(kind==='gapura'||kind==='jersey'){
  legacyPublicFolder(FOLDERS[kind]).then(files=>{const img=files.find(f=>!/video/i.test(f.type));if(!img||!visual.isConnected)return;
   const photo=document.createElement('img');photo.src=img.url;photo.alt='Dokumentasi '+(o.title||'proyek');photo.loading='lazy';photo.onerror=()=>photo.remove();visual.prepend(photo);
  }).catch(()=>{});
 }
 if(o.description)card.append(elem('p',o.description,'portal-project-desc'));
 let url=safe(o.target_url);if(kind==='bank')url='/uji-integrasi/bank-sampah/';
 if(url){const action=elem('a',kind==='bank'?'Buka Bank Sampah':kind==='gapura'?'Detail Gapura':kind==='jersey'?'Rincian Jersey':'Lihat Proyek','portal-project-action');action.href=url;card.append(action)}
 else card.append(elem('small','Rincian proyek sedang dilengkapi','muted'));
 return card;
}
export function renderProjectCards(targetId,d1=[],master=[],max=Infinity){
 const node=document.getElementById(targetId);if(!node)return;
 const base=Array.isArray(d1)?d1:[],provided=Array.isArray(master)?master:[];
 const mapped=provided.length?provided.map(item=>({...base.find(x=>key(x.title)===key(item.title)),...item})):base;
 node.replaceChildren();
 if(!mapped.length){node.append(elem('p','Belum ada proyek yang dapat ditampilkan.','muted'));return}
 const order=o=>projectType(o)==='bank'?0:projectType(o)==='gapura'?1:projectType(o)==='jersey'?2:3;
 mapped.sort((a,b)=>order(a)-order(b)).slice(0,max).forEach(x=>node.append(makeCard(x)));
}
