import {initShell,elem,boxStatus} from './ui.js';
import {endpoints} from './api.js';
import {renderMeetingArchive} from './portal-extras.js';
const section=document.body.dataset.sectionPage;
initShell('portal');
function safeLink(raw){
 try{const u=new URL(raw,location.origin);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}
}
function renderProjects(records){
 const target=document.getElementById('project-list');if(!target)return;
 target.replaceChildren();
 if(!records.length){target.append(elem('p','Belum ada proyek yang dipublikasikan.','muted'));return}
 records.forEach(record=>{
  const card=elem('article',undefined,'project-record');
  const status=String(record.status||'').trim();
  if(status)card.append(elem('span',status,'chip'));
  const title=elem('h3',record.title||'Proyek Warga');card.append(title);
  card.append(elem('p',record.description||'Informasi proyek akan diperbarui oleh pengelola.'));
  const name=String(record.title||'').toLowerCase();
  let link=safeLink(record.target_url),label='Lihat detail proyek ↗';
  if(name.includes('bank sampah')){link=location.pathname.startsWith('/uji-integrasi/')?'/uji-integrasi/bank-sampah/':'/bank-sampah/';label='Buka Bank Sampah →'}
  if(link){const a=elem('a',label,'btn outline');a.href=link;if(/^https?:\/\//.test(link)&&new URL(link).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}card.append(a)}
  else{card.append(elem('p','Rincian proyek dan tautan data belum disambungkan.','muted small'))}
  target.append(card);
 });
}
async function load(){
 try{
  if(section==='rapat'){
   const loaded=await renderMeetingArchive([]);
   boxStatus(loaded?'Arsip rapat berhasil dibaca dari data lama.':'Arsip rapat belum dapat dimuat. Silakan coba lagi.',loaded?'success':'error');
  }else if(section==='project'){
   const res=await endpoints.portal();renderProjects(res.projects||[]);
   boxStatus('Daftar proyek dibaca dari API publik D1. Data pendanaan per proyek belum terhubung.','success');
  }
 }catch(e){boxStatus('Data belum dapat dimuat: '+(e?.message||'Kesalahan koneksi'),'error')}
}
load();
