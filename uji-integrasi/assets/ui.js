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

const ICON={
 house:'<path d="m3 10 9-7 9 7v10h-6v-7H9v7H3z"/>',
 bank:'<path d="m7 3 2 3-3 3-3-2 2-3m12 2 4-1-1 4-3 1-1-3M8 20l-4 1 1-5 3-1 2 3m-2-7 5 1-1 5"/><circle cx="12" cy="12" r="8"/>',
 book:'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 4v17m4-12h5m-5 4h5"/>',
 leaf:'<path d="M20 4C8 4 4 9 4 16a4 4 0 0 0 4 4c7 0 12-4 12-16ZM4 20c4-7 8-8 12-10"/>',
 data:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 18 6-6 4 4 3-3 5 5"/>',
 wallet:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18m-5 5h3M6 6V3h12"/>',
 files:'<path d="M6 3h8l5 5v13H6zM14 3v6h5M9 14h7m-7 4h7"/>',
 login:'<path d="m10 17 5-5-5-5m5 5H3M12 3h8v18h-8"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'
};
const pict=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICON[name]||ICON.files)+'</svg>';
const SITEMAP={
 portal:[['Beranda','page-start','house'],['Kalender','agenda','calendar'],['Proyek','projects','files'],['Rapat','meetings','files'],['Inventaris','inventory','data'],['Layanan','portal-services','wallet']],
 book:[['Ringkasan','page-start','house'],['Input Data','book-info','wallet'],['Iuran','book-ledger-nav','calendar','iuran'],['Denda','book-ledger-nav','files','denda'],['Pinjaman','book-ledger-nav','wallet','pinjaman'],['Talangan','book-ledger-nav','files','talangan'],['Kas','book-ledger-nav','data','kas']],
 akun:[['Profil','auth-profile','files'],['Foto Profil','avatar-form','image'],['Tabungan Saya','member-summary','wallet']]
};
const BANKNAV={
 public:[['Beranda','page-start','house'],['Program','bank-program','leaf'],['Perkembangan','progress','calendar'],['Dokumentasi','albums','image'],['Inventaris','bank-inventory','data'],['Laporan Publik','cash-detail','files']],
 anggota:[['Ringkasan','bank-member-section','house'],['Tabungan Saya','bank-member-savings','wallet'],['Perkembangan','progress','calendar'],['Portal Publik','bank-program','bank']],
 admin:[['Ringkasan','page-start','house'],['Pencatatan','bank-admin-section','files','deposits'],['Keuangan','bank-admin-section','wallet','cash'],['Kegiatan','progress','calendar'],['Data & Anggota','bank-admin-section','data','members'],['Portal Publik','bank-program','bank']]
};
const pageRole=s=>!s?'public':s.account?.role==='superadmin'?'superadmin':s.account?.role==='admin'?'admin':'anggota';
function shellLink(label,href,icon,cls){
 const a=elem('a',undefined,cls);a.href=href;a.title=label;a.setAttribute('aria-label',label);a.innerHTML=pict(icon);return a;
}
function roleNav(s){
 const p=document.body.dataset.page,r=pageRole(s);
 const nav=$('app-sidebar-menu');if(nav){
  nav.replaceChildren();const list=p==='bank'?BANKNAV[r==='superadmin'?'admin':r]:(p==='akun'&&r==='public'?[]:SITEMAP[p]||[]);
  list.forEach(([name,target,icon,view],index)=>{
   
   const a=shellLink(name,'#'+target,icon,'shell-side-link'+(index===0?' current':''));a.append(elem('span',name));
   a.addEventListener('click',()=>{
    nav.querySelectorAll('.shell-side-link').forEach(item=>item.classList.remove('current'));a.classList.add('current');
    if(view){const b=document.querySelector('#'+(p==='bank'?'bank-admin-nav':'book-ledger-nav')+' [data-kind="'+view+'"]');b?.click()}
    document.body.classList.remove('sidebar-open');
   });nav.append(a);
  });
 }
 const bookCard=$('portal-book-entry');if(bookCard)bookCard.hidden=r!=='superadmin';
 const switcher=$('app-switcher');if(switcher){
  switcher.replaceChildren();
  [['portal','Portal Utama','','house'],['bank','Bank Sampah','bank-sampah/','bank'],['book','Pembukuan','pembukuan/','book']].forEach(([k,label,path,ic])=>{
   if(k==='book'&&r!=='superadmin')return;
   const a=shellLink(label,url(path),ic,'shell-switch'+(k===p?' selected':''));if(k===p)a.setAttribute('aria-current','page');switcher.append(a);
  });
 }
}
async function topAvatar(session){
 const area=$('app-account');if(!area)return;area.replaceChildren();
 if(!session){const a=shellLink('Login',url('akun/'),'login','shell-login');a.append(elem('span','Login'));area.append(a);return}
 const display=session.member?.nama||session.account?.username||'Warga';
 const holder=elem('div',undefined,'shell-profile');
 const button=elem('button',undefined,'shell-avatar');button.type='button';button.setAttribute('aria-label','Menu akun '+display);button.setAttribute('aria-expanded','false');
 const words=display.trim().split(/\s+/);const short=((words.length>1?words[0][0]+words[1][0]:words[0].slice(0,2))||'WG').toUpperCase();
 button.append(elem('span',short,'shell-initial'));
 const menu=elem('div',undefined,'shell-account-menu');menu.hidden=true;
 const heading=elem('div',undefined,'shell-account-heading');heading.append(elem('strong',display));heading.append(elem('small',pageRole(session)));menu.append(heading);
 [['Akun Saya','akun/'],['Pengaturan Profil','akun/']].forEach(([name,path])=>{const link=elem('a',name);link.href=url(path);menu.append(link)});
 const logout=elem('button','Keluar');logout.type='button';logout.onclick=async()=>{logout.disabled=true;try{await endpoints.logout();location.href=url('')}catch{logout.disabled=false;logout.textContent='Ulangi Keluar'}};menu.append(logout);
 button.onclick=()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden))};
 holder.append(button,menu);area.append(holder);
 try{
  const p=await endpoints.profile();
  if(p.profile?.hasPhoto){const img=document.createElement('img');img.className='shell-photo';img.alt='Foto profil';img.src=apiURL('/api/member/avatar')+'?t='+Date.now();img.onerror=()=>img.remove();button.prepend(img)}
 }catch{}
}
export async function updateHeader(){
 if(!$('app-switcher'))return null;
 let s=null;if(sameSiteAuthAvailable()){try{s=await endpoints.session()}catch{}}
 document.body.dataset.role=pageRole(s);roleNav(s);await topAvatar(s);
 return s;
}
export function initShell(page){
 if($('app-sidebar'))return;
 document.querySelector('.topbar')?.remove();
 const side=elem('aside',undefined,'app-sidebar');side.id='app-sidebar';side.setAttribute('aria-label','Navigasi modul');
 const title={portal:'Portal Utama',bank:'Bank Sampah',book:'Pembukuan',akun:'Akun Saya'}[page]||'Flamboyan 4';
 const brand=elem('div',undefined,'shell-brand'),badge=elem('span','✿','shell-mark'),heading=elem('div',undefined,'shell-brand-copy');
 heading.append(elem('strong',title));heading.append(elem('small','Flamboyan 4'));brand.append(badge,heading);
 const nav=elem('nav',undefined,'shell-menu');nav.id='app-sidebar-menu';side.append(brand,nav);
 const layout=elem('div',undefined,'app-workspace'),bar=elem('header',undefined,'app-utility');
 const toggle=elem('button',undefined,'shell-toggle');toggle.type='button';toggle.setAttribute('aria-label','Buka atau tutup menu');toggle.innerHTML=pict('menu');toggle.onclick=()=>document.body.classList.toggle('sidebar-open');
 const space=elem('span',undefined,'shell-space'),sw=elem('nav',undefined,'shell-switcher'),acct=elem('div',undefined,'shell-account');
 sw.id='app-switcher';sw.setAttribute('aria-label','Pindah portal');acct.id='app-account';bar.append(toggle,space,sw,acct);
 const content=elem('div',undefined,'app-body');document.querySelectorAll('body > .hero,body > main,body > footer').forEach(x=>content.append(x));
 layout.append(bar,content);document.body.prepend(side,layout);
 document.addEventListener('click',e=>{
  const menu=$('app-account')?.querySelector('.shell-account-menu');
  if(menu&&!e.target.closest('.shell-profile'))menu.hidden=true;
  if(document.body.classList.contains('sidebar-open')&&!e.target.closest('.app-sidebar,.shell-toggle'))document.body.classList.remove('sidebar-open');
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('sidebar-open');const m=$('app-account')?.querySelector('.shell-account-menu');if(m)m.hidden=true}});
 roleNav(null);updateHeader();
}

export function renderAlbum(container,album,media){container.replaceChildren();container.append(elem('h3',album.title));if(album.description)container.append(elem('p',album.description,'muted'));const grid=elem('div',undefined,'album-grid');media.forEach(m=>{const a=elem('a');let dest=m.mediaUrl?apiURL(m.mediaUrl):m.external_url;try{const safe=new URL(dest);if(!['https:','http:'].includes(safe.protocol))return;a.href=safe.href;a.target='_blank';a.rel='noopener noreferrer';if(m.media_type==='foto'||m.mediaUrl){const img=document.createElement('img');img.src=safe.href;img.loading='lazy';img.alt=m.caption||'Foto dokumentasi';a.append(img)}a.append(elem('span',m.caption||'Buka dokumentasi'));grid.append(a)}catch{}});container.append(grid);if(!media.length)container.append(elem('p','Album ini belum memiliki media.','muted'))}
