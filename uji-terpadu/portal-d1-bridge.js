/* Bridge Portal Utama: render HTML lama dari D1 tanpa mengubah desain.
 * Hanya URL CSV publik tertentu yang dialihkan. Arisan/Jersey tetap pada sumber lama
 * hingga migrasi historis dan aturan aksesnya selesai.
 */
(()=>{
 'use strict';
 const ORIGIN='https://api.flamboyan4.web.id';
 const fetchNative=window.fetch.bind(window);
 const papaNative=window.Papa?.parse?.bind(window.Papa);
 const list={
  'gid=0':'documentation',
  'gid=492423764':'inventory',
  'gid=781301604':'agenda',
  'gid=780113187':'banners',
  'gid=40982005':'projects'
 };
 let stored=null,until=0,pending=null;
 const esc=v=>{
  let s=String(v??'');
  if(/[",\n\r]/.test(s))s='"'+s.replaceAll('"','""')+'"';
  return s;
 };
 const dmy=s=>{
  const match=String(s||'').match(/^(\d{4})-(\d\d)-(\d\d)/);
  return match?match[3]+'/'+match[2]+'/'+match[1]:String(s||'');
 };
 const csv=rows=>rows.map(row=>row.map(esc).join(',')).join('\r\n')+'\r\n';
 async function portalData(){
  if(stored&&Date.now()<until)return stored;
  if(!pending)pending=(async()=>{
   const r=await fetchNative(ORIGIN+'/api/v2/public/portal',{mode:'cors',cache:'no-store'});
   if(!r.ok)throw Error('Portal D1 HTTP '+r.status);
   const d=await r.json();
   if(d.ok===false)throw Error(d.error||'Data D1 belum siap');
   stored=d;until=Date.now()+10000;return d;
  })().finally(()=>pending=null);
  return pending;
 }
 function asCsv(kind,data){
  switch(kind){
   case 'documentation':
    if(!Array.isArray(data.documentation))throw Error('Tabel dokumentasi D1 belum tersedia');
    return csv([['Tanggal','Judul','Deskripsi','Foto'],
      ...data.documentation.map(x=>[dmy(x.event_on),x.title,x.description,x.drive_url])]);
   case 'inventory':
    return csv([['Nama Barang','Jumlah / Satuan','Kondisi','URL Gambar'],
      ...(data.inventory||[]).map(x=>[x.name,[x.quantity,x.unit].filter(v=>v!==null&&v!==undefined&&v!=='').join(' '),x.condition||x.description,x.photo_ref])]);
   case 'agenda':
    return csv([['Tanggal','Judul','Deskripsi','Status','Foto'],
      ...(data.agenda||[]).map(x=>[dmy(x.starts_on),x.title,x.description,x.status||'Direncanakan',x.image_ref])]);
   case 'banners':
    return csv([['Judul Banner','Link Foto / Drive','Link Tujuan (Target)'],
      ...(data.banners||[]).map(x=>[x.title,x.image_ref,x.target_url])]);
   case 'projects':
    return csv([['Urutan','Nama Projek','Jenis','Status','Tampil','Link'],
      ...(data.projects||[]).map(x=>[x.sort_order,x.title,x.title,'Aktif','YA',x.target_url])]);
   default:throw Error('Jenis CSV tidak terdaftar');
  }
 }
 function kindFromUrl(input){
  if(typeof input!=='string'||!input.includes('docs.google.com/spreadsheets'))return null;
  for(const [fragment,kind] of Object.entries(list))if(input.includes(fragment))return kind;
  return null;
 }
 if(papaNative){
  window.Papa.parse=function(input,config,...more){
   const kind=kindFromUrl(input);
   if(!kind||!config?.download)return papaNative(input,config,...more);
   portalData().then(data=>{
    const contents=asCsv(kind,data);
    return papaNative(contents,{...config,download:false},...more);
   }).catch(err=>{
    console.warn('D1 '+kind+' belum siap, kembali ke CSV lama:',err.message);
    papaNative(input,config,...more);
   });
   return undefined;
  };
 }
 window.fetch=function(input,opts){
  const kind=kindFromUrl(typeof input==='string'?input:input?.url);
  if(kind!=='projects')return fetchNative(input,opts);
  return portalData().then(d=>new Response(asCsv('projects',d),{
    status:200,headers:{'Content-Type':'text/csv; charset=utf-8','Cache-Control':'no-store'}
  })).catch(e=>{console.warn('Project D1 belum tersedia:',e.message);return fetchNative(input,opts)});
 };
})();