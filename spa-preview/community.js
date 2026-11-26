/* Native route surfaces for Portal Utama and Superadmin. Read-only migration. */
export const communityRoutes={home:'Portal Utama','home-agenda':'Kalender','home-docs':'Dokumentasi','home-inventory':'Inventaris','home-meetings':'Hasil Rapat','home-arisan':'Arisan'};
export const adminRoutes={superadmin:'Superadmin','superadmin-residents':'Data Warga & Rumah','superadmin-accounts':'Akun & Hak Akses','superadmin-projects':'Projek','superadmin-schedule':'Jadwal Penimbangan'};
const has=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const rows=d=>Array.isArray(d)?d:Array.isArray(d?.rows)?d.rows:Array.isArray(d?.data)?d.data:Array.isArray(d?.akun)?d.akun:Array.isArray(d?.accounts)?d.accounts:null;
function requireRows(d){const r=rows(d);if(!r)throw Error('Format daftar belum tersedia.');return r}
const safe=v=>v==null?'':String(v);
export function createCommunityModule({role,get,go,el,panel,row,links}){
 function title(name){const n=el('section');n.append(el('h1',name));return n}
 function nav(root,items){const n=el('div',null,'bank-route-links');for(const [k,label] of items){const b=el('button',label);b.type='button';b.onclick=()=>go(k);n.append(b)}root.append(n)}
 function list(root,items,map){for(const item of items){const [name,detail]=map(item);row(root,name||'Tanpa judul',detail||'')}if(!items.length)row(root,'Belum ada data','')}
 const byDate=(items,k)=>items.slice().sort((a,b)=>safe(b[k]).localeCompare(safe(a[k])));
 async function mount({key,signal}){
  if(has(adminRoutes,key)){
   if(role!=='superadmin')throw Error('Akses Superadmin ditolak.');
   const root=title(adminRoutes[key]),read=p=>get(p,signal,true);
   if(key==='superadmin'){
    nav(root,Object.entries(adminRoutes).filter(([k])=>k!=='superadmin'));
    row(root,'Mode uji','CRUD dan Pusat Keuangan masih menggunakan portal asli.');
   }else if(key==='superadmin-residents'){
    const p=panel(root,'Warga dan rumah'),items=requireRows(await read('/api/v2/admin/residents'));
    list(p,items,x=>[x.nama||'Rumah '+safe(x.rumah),[x.rumah,x.status_tinggal||x.status_rumah].filter(Boolean).join(' · ')]);
   }else if(key==='superadmin-accounts'){
    const p=panel(root,'Akun terdaftar'),items=requireRows(await read('/api/superadmin/accounts/preview'));
    list(p,items,x=>[x.nama||x.displayName||'Akun',[x.rumah,x.role,x.perluAktivasi===true?'Perlu aktivasi':x.status].filter(Boolean).join(' · ')]);
   }else if(key==='superadmin-projects'){
    const p=panel(root,'Data projek'),items=requireRows(await read('/api/v2/admin/content/projects'));
    list(p,items,x=>[x.title||x.name||x.nama,[x.status,x.description].filter(Boolean).join(' · ')]);
   }else{
    const p=panel(root,'Jadwal penimbangan');await get('/api/public/bank/weighing-schedule',signal,false);
    row(p,'Layanan jadwal tersedia','Detail, pengulangan dan penyuntingan tetap melalui portal asli.');
   }
   links(root,[['Buka Superadmin lengkap','/superadmin/']]);return {node:root};
  }
  if(!has(communityRoutes,key))throw Error('Rute tidak dikenal.');
  const root=title(communityRoutes[key]),d=await get('/api/v2/public/portal',signal,false);
  if(key==='home'||key==='home-agenda'){
   if(key==='home')nav(root,Object.entries(communityRoutes).filter(([k])=>k!=='home'));
   const p=panel(root,key==='home'?'Agenda warga':'Agenda terpublikasi'),items=requireRows(d.agenda);
   list(p,byDate(items,'starts_on').slice(0,key==='home'?8:items.length),x=>[x.title,[x.starts_on,x.status,x.description].filter(Boolean).join(' · ')]);
  }else if(key==='home-docs'){
   const p=panel(root,'Album kegiatan'),items=requireRows(d.documentation).filter(x=>(!x.visibility||x.visibility==='publik')&&(x.active==null||x.active===true||String(x.active)==='1')&&!/^Bank Sampah\s*[:/]/i.test(safe(x.category)));
   list(p,byDate(items,'event_on'),x=>[x.title,[x.event_on,x.description].filter(Boolean).join(' · ')]);links(root,[['Buka foto dan video lengkap','/dokumentasi/']]);
  }else if(key==='home-inventory'){
   list(panel(root,'Barang inventaris'),requireRows(d.inventory),x=>[x.name,[x.quantity,x.unit,x.condition||x.description].filter(v=>v!=null&&v!=='').join(' · ')]);
  }else if(key==='home-meetings'){
   list(panel(root,'Rapat warga'),byDate(requireRows(d.meetings),'meeting_on'),x=>[x.title,[x.meeting_on,x.summary].filter(Boolean).join(' · ')]);links(root,[['Buka dokumen rapat','/rapat/']]);
  }else if(key==='home-arisan'){
   list(panel(root,'Periode arisan'),requireRows(d.arisan),x=>[x.host_name,[safe(x.period_on).slice(0,7),x.status].filter(Boolean).join(' · ')]);
  }
  links(root,[['Portal Utama lengkap','/']]);return {node:root};
 }
 return {mount};
}
