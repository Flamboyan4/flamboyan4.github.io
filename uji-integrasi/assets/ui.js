import {CONFIG,apiURL,sameSiteAuthAvailable} from './config.js';
import {endpoints} from './api.js';
export const $=(id)=>document.getElementById(id);
export const fmtRp=(v)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)||0);
export const fmtNum=(v)=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(Number(v)||0);
export const url=(path)=>CONFIG.siteBase.replace(/\/+$/,'')+'/'+path.replace(/^\/+/, '');
export function elem(tag,txt='',className=''){const e=document.createElement(tag);if(txt!==undefined)e.textContent=String(txt??'');if(className)e.className=className;return e}
export function put(id,v){const e=$(id);if(e)e.textContent=String(v??'—')}
export function boxStatus(message,kind='info',target='feedback'){const el=$(target);if(!el)return;el.textContent=message;el.dataset.kind=kind;el.hidden=false}
export function setRows(id,heads,items){const parent=$(id);if(!parent)return;parent.replaceChildren();const table=elem('table');table.className='data-table';const thead=elem('thead'),tr=elem('tr');heads.forEach(h=>tr.append(elem('th',h)));thead.append(tr);table.append(thead);const tbody=elem('tbody');items.forEach(row=>{const tr=elem('tr');row.forEach(v=>tr.append(elem('td',v)));tbody.append(tr)});if(!items.length){const tr=elem('tr'),td=elem('td','Belum ada data pada database staging.');td.colSpan=heads.length;tr.append(td);tbody.append(tr)}table.append(tbody);parent.append(table)}
export function setCards(id,items,empty='Belum ada informasi publik.'){const target=$(id);if(!target)return;target.replaceChildren();if(!items.length){target.append(elem('p',empty,'muted'));return}items.forEach(x=>{const card=elem('article',undefined,'info-card');if(x.title)card.append(elem('h3',x.title));if(x.note)card.append(elem('p',x.note,'muted'));if(x.text)card.append(elem('p',x.text));if(x.url){try{const u=new URL(x.url,location.origin);if(['http:','https:'].includes(u.protocol)){const a=elem('a','Lihat detail ↗','text-link');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';card.append(a)}}catch{}}target.append(card)})}
export function requireAuthMessage(){return sameSiteAuthAvailable()?'Masuk melalui Akun Saya untuk membuka data ini.':'Login lintas GitHub–Cloudflare belum diaktifkan. Hubungkan Custom Domain Worker api.flamboyan4.web.id agar cookie sesi dapat digunakan dengan aman.'}
function renderNavigation(role){
  const nav=$('site-nav');if(!nav)return;
  const active=document.body.dataset.page;
  const links=[['','Portal Utama','portal'],['bank-sampah/','Bank Sampah','bank'],['pembukuan/','Pembukuan','book'],['akun/','Akun Saya','akun']];
  nav.replaceChildren();
  links.forEach(([href,label,key])=>{
    if(key==='book'&&role!=='superadmin')return;
    const a=elem('a',label);a.href=url(href);
    if(key===active){a.className='current';a.setAttribute('aria-current','page')}
    nav.append(a);
  });
  // Jangan tampilkan pintasan keuangan sebelum sesi superadmin terverifikasi.
  const bookEntry=$('portal-book-entry');
  if(bookEntry)bookEntry.hidden=role!=='superadmin';
}
export async function updateHeader(){
  const node=$('account-status');
  if(!node)return null;
  let session=null;
  if(!sameSiteAuthAvailable()){
    node.textContent='Login: butuh domain API';
    node.title=requireAuthMessage();
  }else{
    try{
      session=await endpoints.session();
      node.textContent=session.member?.nama||session.account?.username||'Akun';
      node.title='Sesi login aktif';
    }catch{
      node.textContent='Masuk';
      node.title='Belum login';
    }
  }
  renderNavigation(session?.account?.role||null);
  return session;
}
export function initShell(active){
  const nav=$('site-nav');if(!nav)return;
  renderNavigation(null);
  const brand=$('brand');if(brand)brand.href=url('');
  const link=$('account-link');if(link)link.href=url('akun/');
  updateHeader();
}
export function renderAlbum(container,album,media){container.replaceChildren();container.append(elem('h3',album.title));if(album.description)container.append(elem('p',album.description,'muted'));const grid=elem('div',undefined,'album-grid');media.forEach(m=>{const a=elem('a');let dest=m.mediaUrl?apiURL(m.mediaUrl):m.external_url;try{const safe=new URL(dest);if(!['https:','http:'].includes(safe.protocol))return;a.href=safe.href;a.target='_blank';a.rel='noopener noreferrer';if(m.media_type==='foto'||m.mediaUrl){const img=document.createElement('img');img.src=safe.href;img.loading='lazy';img.alt=m.caption||'Foto dokumentasi';a.append(img)}a.append(elem('span',m.caption||'Buka dokumentasi'));grid.append(a)}catch{}});container.append(grid);if(!media.length)container.append(elem('p','Album ini belum memiliki media.','muted'))}
