/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/portal-d1-bridge.js",function(__f4){


/* Bridge Portal Utama: render HTML lama dari D1 tanpa mengubah desain.
 * Seluruh delapan sheet publik dimuat dari Cloudflare D1; foto/video boleh tetap
 * memakai tautan Google Drive sebagai penyimpanan media, bukan database utama.
 */
(()=>{
 'use strict';
 const ORIGIN='https://api.flamboyan4.web.id';
 const fetchNative=__f4.window.fetch.bind(window);
 const papaNative=__f4.window.Papa?.parse?.bind(__f4.window.Papa);
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
  let s=(0,__f4.globals.String)(v??'');
  if(/[",\n\r]/.test(s))s='"'+s.replaceAll('"','""')+'"';
  return s;
 };
 const dmy=s=>{
  const match=(0,__f4.globals.String)(s||'').match(/^(\d{4})-(\d\d)-(\d\d)/);
  return match?match[3]+'/'+match[2]+'/'+match[1]:(0,__f4.globals.String)(s||'');
 };
 // Day 01 is the monthly placeholder, not the date of the gathering.
 // A partial first week beginning on Thursday, Friday or Saturday does not count.
 function defaultArisanDate(month){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return '';
  const first=new __f4.globals.Date(month+'-01T00:00:00Z');
  const weekday=first.getUTCDay();
  const day=1+(6-weekday+7)%7+7+(weekday>=4?7:0);
  return month+'-'+(0,__f4.globals.String)(day).padStart(2,'0');
 }
 function resolveArisanDate(period,manual){
  const value=(0,__f4.globals.String)(period||'').slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return '';
  if(!value.endsWith('-01'))return value;
  const month=value.slice(0,7),explicit=(0,__f4.globals.String)(manual?.starts_on||'').slice(0,10);
  if(explicit.startsWith(month+'-')&&/^\d{4}-\d{2}-(0[2-9]|[12]\d|3[01])$/.test(explicit))return explicit;
  return defaultArisanDate(month);
 }
 const csv=rows=>rows.map(row=>row.map(esc).join(',')).join('\r\n')+'\r\n';
 async function portalData(){
  if(stored&&__f4.globals.Date.now()<until)return stored;
  if(!pending)pending=(async()=>{
   const r=await fetchNative(ORIGIN+'/api/v2/public/portal',{mode:'cors',cache:'no-store'});
   if(!r.ok)throw (0,__f4.globals.Error)('Layanan portal HTTP '+r.status);
   const d=await r.json();
   if(d.ok===false)throw (0,__f4.globals.Error)(d.error||'Data belum siap');
   stored=d;until=__f4.globals.Date.now()+10000;return d;
  })().finally(()=>pending=null);
  return pending;
 }
 function asCsv(kind,data){
  switch(kind){
   case 'arisan':
    return csv([['BULAN','NAMA & BLOK','STATUS'],
      ...(data.arisan||[]).map(x=>[new __f4.globals.Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric',timeZone:'UTC'}).format(new __f4.globals.Date(x.period_on+'T00:00:00Z')),x.host_name,x.status])]);
   case 'jerseyBapak':
   case 'jerseyIbu':
    return csv([['No','Nama & Blok','Lengan','Ukuran','Nama & No. Punggung','Status Pembayaran','Pembayaran','Keterangan'],
      ...(data[kind]||[]).map(x=>[x.sort_order,x.resident,x.sleeves,x.size,x.printed_name,x.payment_status,x.nominal_rp,x.method])]);
   case 'documentation':
    if(!__f4.globals.Array.isArray(data.documentation))throw (0,__f4.globals.Error)('Daftar dokumentasi belum tersedia');
    return csv([['Tanggal','Judul','Deskripsi','Foto'],
      ...data.documentation.filter(x=>!/^bank\s*sampah\s*[:/]/i.test((0,__f4.globals.String)(x.category||''))).map(x=>[dmy(x.event_on),x.title,x.description,x.drive_url])]);
   case 'inventory':
    return csv([['Nama Barang','Jumlah / Satuan','Kondisi','URL Gambar'],
      ...(data.inventory||[]).map(x=>[x.name,[x.quantity,x.unit].filter(v=>v!==null&&v!==__f4.globals.undefined&&v!=='').join(' '),x.condition||x.description,x.photo_ref])]);
   case 'agenda': {
    // Jadwal Arisan stores the month and any explicit confirmed date.
    // Resolve monthly placeholders with the agreed Saturday rule. Merge a
    // manually scheduled gathering for the same month rather than duplicate it.
    const agenda=__f4.globals.Array.isArray(data.agenda)?data.agenda:[];
    const arisan=(__f4.globals.Array.isArray(data.arisan)?data.arisan:[])
      .filter(x=>/^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test((0,__f4.globals.String)(x.period_on||'')));
    const months=new __f4.globals.Set(arisan.map(x=>x.period_on.slice(0,7)));
    const isArisanEvent=x=>/\barisan\b/i.test((0,__f4.globals.String)(x.title||'')+' '+(0,__f4.globals.String)(x.description||''));
    const matching=x=>months.has((0,__f4.globals.String)(x.starts_on||'').slice(0,7))&&isArisanEvent(x);
    const others=agenda.filter(x=>!matching(x));
    const scheduled=arisan
      .filter(x=>!/(?:^|\s)(?:batal|dibatalkan)(?:\s|$)/i.test((0,__f4.globals.String)(x.status||'')))
      .map(x=>{
        const month=x.period_on.slice(0,7);
        const manual=agenda.find(a=>(0,__f4.globals.String)(a.starts_on||'').slice(0,7)===month&&isArisanEvent(a));
        const host=(0,__f4.globals.String)(x.host_name||'').trim();
        const desc=[host?'Tuan rumah: '+host:'',(0,__f4.globals.String)(manual?.description||'').trim()].filter(__f4.globals.Boolean).join(' • ');
        const status=/sudah|selesai|terlaksana/i.test((0,__f4.globals.String)(x.status||''))?'Selesai':(0,__f4.globals.String)(manual?.status||'Direncanakan');
        return [dmy(resolveArisanDate(x.period_on,manual)),manual?.title||'Arisan Warga',desc,status,manual?.image_ref||''];
      });
    return csv([['Tanggal','Judul','Deskripsi','Status','Foto'],
      ...others.map(x=>[dmy(x.starts_on),x.title,x.description,x.status||'Direncanakan',x.image_ref]),
      ...scheduled]);
   }
   case 'banners':
    return csv([['Judul Banner','Link Foto / Drive','Link Tujuan (Target)'],
      ...(data.banners||[]).map(x=>[x.title,x.image_ref,x.target_url])]);
   default:throw (0,__f4.globals.Error)('Jenis CSV tidak terdaftar');
  }
 }
 function kindFromUrl(input){
  if(typeof input!=='string'||!input.includes('docs.google.com/spreadsheets'))return null;
  for(const [fragment,kind] of __f4.globals.Object.entries(list))if(input.includes(fragment))return kind;
  return null;
 }
 if(papaNative){
  __f4.window.Papa.parse=function(input,config,...more){
   const kind=kindFromUrl(input);
   if(!kind||!config?.download)return papaNative(input,config,...more);
   portalData().then(data=>{
    const contents=asCsv(kind,data);
    return papaNative(contents,{...config,download:false},...more);
   }).catch(err=>{
    __f4.globals.console.error('Data Portal D1 '+kind+' tidak dapat dimuat:',err.message);
    if(typeof config?.error==='function')config.error(err);
   });
   return __f4.globals.undefined;
  };
 }
 // Project Card now fetches D1 directly; do not override global fetch.
})();
});
