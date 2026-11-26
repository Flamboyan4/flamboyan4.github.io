import {createPortalRouter} from './router.js';
const API='https://api.flamboyan4.web.id',outlet=document.getElementById('outlet'),dock=document.getElementById('app-dock'),status=document.getElementById('route-status');
const paths={home:'/',bank:'/bank-sampah/',book:'/pembukuan/',superadmin:'/superadmin/'},labels={home:'Beranda',bank:'Bank Sampah',book:'Pembukuan',superadmin:'Superadmin'};
let role='public',session=null,active='home',menu=null;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=String(text);if(cls)n.className=cls;return n};
async function get(path,signal,privateRead=false){
 const r=await fetch(API+path,{credentials:privateRead?'include':'omit',mode:'cors',cache:'no-store',signal});const d=await r.json();if(!r.ok||d?.ok===false)throw Error('Layanan belum tersedia ('+r.status+')');return d;
}
const count=v=>v!=null&&Number.isFinite(Number(v))?new Intl.NumberFormat('id-ID').format(Number(v)):'—';
const rows=d=>Array.isArray(d)?d:Array.isArray(d?.rows)?d.rows:Array.isArray(d?.data)?d.data:Array.isArray(d?.items)?d.items:null;
function title(s){const n=el('section');n.append(el('h1',s));return n}
function panel(root,s){const n=el('section',null,'panel');n.append(el('h2',s));root.append(n);return n}
function row(root,a,b){const n=el('div',null,'row');n.append(el('strong',a),el('small',b||''));root.append(n)}
function metric(root,a,b){const n=el('div',null,'metric');n.append(el('small',a),el('strong',b));root.append(n)}
function links(root,items){const n=el('div',null,'links');for(const [label,url] of items){const a=el('a',label);a.href=url;n.append(a)}root.append(n)}
const modules={
 home:{async mount({signal}){
  const root=title('Portal Utama'),p=panel(root,'Agenda warga'),data=await get('/api/v2/public/portal',signal);
  const list=Array.isArray(data.agenda)?data.agenda.slice().sort((a,b)=>String(b.starts_on).localeCompare(String(a.starts_on))).slice(0,8):[];
  for(const x of list)row(p,x.title||'Agenda',x.starts_on);if(!list.length)row(p,'Belum ada agenda');links(root,[['Portal Utama lengkap','/']]);return {node:root};
 }},
 bank:{async mount({signal}){
  const root=title('Bank Sampah'),p=panel(root,'Ringkasan setoran'),m=el('div',null,'metrics');p.append(m);
  const data=await get('/api/v2/public/bank',signal),o=data.overview||{};
  metric(m,'Anggota aktif',count(o.activeMembers??o.memberCount??o.members??data.membersCount));
  metric(m,'Setoran tercatat',count(o.recordedDeposits));metric(m,'Berat tercatat',count(o.recordedWeightKg)+' kg');metric(m,'Jenis barang',count(o.activeItems??data.catalog?.length));
  const q=panel(root,'Tahap Bank Sampah');for(const x of (Array.isArray(data.progress)?data.progress:[]))row(q,x.title||x.judul||x.stage||'Tahap',x.status);
  if(!data.progress?.length)row(q,'Belum ada tahap');links(root,[['Bank Sampah lengkap',paths.bank]]);return {node:root};
 }},
 book:{async mount({signal}){
  if(role!=='superadmin')throw Error('Akses tidak diizinkan');
  const root=title('Pembukuan'),p=panel(root,'Riwayat iuran'),data=await get('/api/bookkeeping/iuran/history?limit=1000',signal,true),list=rows(data);
  row(p,'Catatan yang dimuat',list?count(list.length):'Format respons perlu diperiksa');links(root,[['Input iuran',paths.book+'?halaman=input'],['Pembukuan lengkap',paths.book]]);return {node:root};
 }},
 superadmin:{async mount({signal}){
  if(role!=='superadmin')throw Error('Akses tidak diizinkan');
  const root=title('Superadmin'),p=panel(root,'Data acuan'),data=await get('/api/v2/admin/residents',signal,true),list=rows(data);
  row(p,'Data warga yang dimuat',list?count(list.length):'Format respons perlu diperiksa');links(root,[['Superadmin lengkap',paths.superadmin]]);return {node:root};
 }}
};
const allowed=k=>k==='home'||k==='bank'||(role==='superadmin'&&(k==='book'||k==='superadmin'));
const read=()=>new URL(location.href).searchParams.get('portal')||'home';
function write(key,mode){const u=new URL(location.href);u.searchParams.set('portal',key);history[mode==='replace'?'replaceState':'pushState']({f4Spa:key},'',u);}
const router=createPortalRouter({outlet,routes:Object.fromEntries(Object.entries(modules).map(([k,v])=>[k,async()=>v])),allowed,read,write,onState(s){
 if(s.active)active=s.active;
 status.textContent=s.error?'Gagal memuat: '+s.error.message:s.pending?'Memuat '+labels[s.pending]+'…':'';
 if(s.error){const retry=el('button','Coba lagi');retry.onclick=()=>router.go(s.failed);status.append(' ',retry)}
 for(const b of dock.querySelectorAll('[data-route]')){if(b.dataset.route===s.active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}
}});
const icons={home:'<path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z"/>',bank:'<path d="m9 3 3 4-5 1m5-5a3 3 0 0 1 3 2l2 4m3 1-2 5-3-4m5 3a3 3 0 0 1-2 5h-5m-1 2-4-3 4-3m-5 3H5a3 3 0 0 1-2-5l3-4"/>',add:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',book:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',superadmin:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m8 12 3 3 5-6"/>',sale:'<path d="M2 3h2l3 12h12l3-8H5"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',payout:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 7V2m-3 3 3-3 3 3"/><circle cx="12" cy="15" r="2"/>',history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>'};
const roles={superadmin:[['home','Beranda','home'],['bank','Bank Sampah','bank'],['input','Input','add'],['book','Pembukuan','book'],['superadmin','Superadmin','superadmin']],admin:[['home','Beranda','home'],['bank','Bank Sampah','bank'],['input','Input','add'],['sale','Penjualan','sale'],['report','Laporan','book']],warga:[['home','Beranda','home'],['bank','Bank Sampah','bank'],['payout','Pencairan','payout'],['history','Riwayat','history'],['report','Laporan','book']],public:[['home','Beranda','home'],['bank','Bank Sampah','bank']]};
function action(key){
 if(key==='input'&&role==='superadmin'){if(active==='bank')location.assign(paths.bank+'?halaman=setoran');else if(active==='book')location.assign(paths.book+'?halaman=input');else menu.hidden=!menu.hidden;return}
 if(menu)menu.hidden=true;if(allowed(key)){void router.go(key);return}
 const route={input:'setoran',sale:'penjualan',report:role==='warga'?'bank-report':'laporan',payout:'bank-payout',history:'bank-history'}[key];if(route)location.assign(paths.bank+'?halaman='+route);
}
function mountDock(){
 const items=roles[role]||roles.public;dock.style.setProperty('--columns',items.length);
 for(const [key,label,icon] of items){
  const b=el('button');b.type='button';b.dataset.route=key;if(key==='input'||key==='payout')b.className='primary';
  const symbol=el('span',null,'symbol');symbol.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[icon]+'</svg>';b.append(symbol,el('span',label));b.onclick=()=>action(key);dock.append(b);
 }
 if(role==='superadmin'){menu=el('div',null,'choices');menu.hidden=true;for(const [name,url] of [['Catat setoran',paths.bank+'?halaman=setoran'],['Input iuran',paths.book+'?halaman=input']]){const b=el('button',name);b.type='button';b.onclick=()=>location.assign(url);menu.append(b)}dock.append(menu)}
 dock.hidden=false;
}
window.addEventListener('popstate',()=>router.restore());window.addEventListener('pagehide',()=>router.reset());window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('f4-session'):null;if(channel)channel.onmessage=e=>{if(['login','logout'].includes(e.data?.type)){router.reset();location.reload()}};
try{session=await get('/api/v2/auth/session',undefined,true);const r=String(session?.account?.role||'public').toLowerCase();role=r==='anggota'?'warga':Object.prototype.hasOwnProperty.call(roles,r)?r:'public';}catch{role='public';session=null}
document.getElementById('greeting').textContent=session?.account?'Halo, '+String(session.account.displayName||session.account.username||'Pengguna'):'Flamboyan 4';document.getElementById('identity').textContent=role==='public'?'Publik':role==='warga'?'Anggota':role==='admin'?'Pengelola':'Superadmin';mountDock();void router.go(read(),{history:'replace'});
