/* Bridge Portal Utama: render HTML lama dari D1 tanpa mengubah desain.
 * Seluruh delapan sheet publik dimuat dari Cloudflare D1; foto/video boleh tetap
 * memakai tautan Google Drive sebagai penyimpanan media, bukan database utama.
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
  'gid=53284271':'arisan',
  'gid=878370178':'jerseyBapak',
  'gid=1755921986':'jerseyIbu'
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
   if(!r.ok)throw Error('Layanan portal HTTP '+r.status);
   const d=await r.json();
   if(d.ok===false)throw Error(d.error||'Data belum siap');
   stored=d;until=Date.now()+10000;return d;
  })().finally(()=>pending=null);
  return pending;
 }
 function asCsv(kind,data){
  switch(kind){
   case 'arisan':
    return csv([['BULAN','NAMA & BLOK','STATUS'],
      ...(data.arisan||[]).map(x=>[new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(x.period_on+'T00:00:00Z')),x.host_name,x.status])]);
   case 'jerseyBapak':
   case 'jerseyIbu':
    return csv([['No','Nama & Blok','Lengan','Ukuran','Nama & No. Punggung','Status Pembayaran','Pembayaran','Keterangan'],
      ...(data[kind]||[]).map(x=>[x.sort_order,x.resident,x.sleeves,x.size,x.printed_name,x.payment_status,x.nominal_rp,x.method])]);
   case 'documentation':
    if(!Array.isArray(data.documentation))throw Error('Daftar dokumentasi belum tersedia');
    return csv([['Tanggal','Judul','Deskripsi','Foto'],
      ...data.documentation.filter(x=>!/^bank\s*sampah\s*[:/]/i.test(String(x.category||''))).map(x=>[dmy(x.event_on),x.title,x.description,x.drive_url])]);
   case 'inventory':
    return csv([['Nama Barang','Jumlah / Satuan','Kondisi','URL Gambar'],
      ...(data.inventory||[]).map(x=>[x.name,[x.quantity,x.unit].filter(v=>v!==null&&v!==undefined&&v!=='').join(' '),x.condition||x.description,x.photo_ref])]);
   case 'agenda': {
    // Jadwal Arisan adalah acuan tanggal untuk kalender publik.
    // Rencana Kegiatan bertema arisan yang sudah dibuat manual digabung,
    // sehingga tidak muncul dua acara atau tanggal lama dalam bulan yang sama.
    const agenda=Array.isArray(data.agenda)?data.agenda:[];
    const arisan=(Array.isArray(data.arisan)?data.arisan:[])
      .filter(x=>/^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(String(x.period_on||'')));
    const months=new Set(arisan.map(x=>x.period_on.slice(0,7)));
    const isArisanEvent=x=>/\barisan\b/i.test(String(x.title||'')+' '+String(x.description||''));
    const matching=x=>months.has(String(x.starts_on||'').slice(0,7))&&isArisanEvent(x);
    const others=agenda.filter(x=>!matching(x));
    const scheduled=arisan
      .filter(x=>!/(?:^|\s)(?:batal|dibatalkan)(?:\s|$)/i.test(String(x.status||'')))
      .map(x=>{
        const month=x.period_on.slice(0,7);
        const manual=agenda.find(a=>String(a.starts_on||'').slice(0,7)===month&&isArisanEvent(a));
        const host=String(x.host_name||'').trim();
        const desc=[host?'Tuan rumah: '+host:'',String(manual?.description||'').trim()].filter(Boolean).join(' • ');
        const status=/sudah|selesai|terlaksana/i.test(String(x.status||''))?'Selesai':String(manual?.status||'Direncanakan');
        return [dmy(x.period_on),manual?.title||'Arisan Warga',desc,status,manual?.image_ref||''];
      });
    return csv([['Tanggal','Judul','Deskripsi','Status','Foto'],
      ...others.map(x=>[dmy(x.starts_on),x.title,x.description,x.status||'Direncanakan',x.image_ref]),
      ...scheduled]);
   }
   case 'banners':
    return csv([['Judul Banner','Link Foto / Drive','Link Tujuan (Target)'],
      ...(data.banners||[]).map(x=>[x.title,x.image_ref,x.target_url])]);
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
    console.error('Data Portal D1 '+kind+' tidak dapat dimuat:',err.message);
    if(typeof config?.error==='function')config.error(err);
   });
   return undefined;
  };
 }
 // Project Card now fetches D1 directly; do not override global fetch.
})();