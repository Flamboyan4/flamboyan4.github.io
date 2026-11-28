/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/rapat-d1-bridge.js",function(__f4){


/* Hasil Rapat staging reads D1 while preserving original HTML and legacy preview images. */
(()=>{
'use strict';
if(!__f4.window.Papa?.parse)return;
const native=__f4.window.Papa.parse.bind(__f4.window.Papa);
const csvURLFragment='gid=449852491';
const csvEscape=v=>{
 let s=(0,__f4.globals.String)(v??'');return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;
};
const textDate=d=>{
 const m=(0,__f4.globals.String)(d||'').match(/^(\d{4})-(\d\d)-(\d\d)/);
 return m?m[3]+'/'+m[2]+'/'+m[1]:(0,__f4.globals.String)(d||'');
};
const normalized=s=>(0,__f4.globals.String)(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const legacyPhotos=url=>new __f4.globals.Promise(resolve=>{
 try{
  native(url,{download:true,header:true,complete:r=>{
   const byTitle=new __f4.globals.Map(),byDate=new __f4.globals.Map();
   for(const item of r.data||[]){
    const a=__f4.globals.Object.values(item),date=(0,__f4.globals.String)(a[0]||''),title=(0,__f4.globals.String)(a[1]||''),photo=(0,__f4.globals.String)(a[3]||'');
    if(photo){byTitle.set(normalized(title),photo);if(!byDate.has(date))byDate.set(date,photo)}
   }
   resolve({byTitle,byDate});
  },error:()=>resolve({byTitle:new __f4.globals.Map(),byDate:new __f4.globals.Map()})});
 }catch{resolve({byTitle:new __f4.globals.Map(),byDate:new __f4.globals.Map()})}
});
__f4.window.Papa.parse=(input,config,...args)=>{
 if(typeof input!=='string'||!input.includes(csvURLFragment)||!config?.download)return native(input,config,...args);
 __f4.globals.Promise.all([
  (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/v2/public/portal',{mode:'cors',cache:'no-store'}).then(r=>{if(!r.ok)throw (0,__f4.globals.Error)('API HTTP '+r.status);return r.json()}),
  __f4.globals.Promise.race([legacyPhotos(input),new __f4.globals.Promise(resolve=>(0,__f4.globals.setTimeout)(()=>resolve({byTitle:new __f4.globals.Map(),byDate:new __f4.globals.Map()}),3500))])
 ]).then(([d,photos])=>{
  if(d.ok===false||!__f4.globals.Array.isArray(d.meetings))throw (0,__f4.globals.Error)(d.error||'Data rapat D1 tidak siap');
  const header=['Tanggal','Judul','Deskripsi','Foto','Link Dokumen','Record ID'];
  const rows=d.meetings.slice().reverse().map(x=>{
   const date=textDate(x.meeting_on);
   const photo=photos.byTitle.get(normalized(x.title))||photos.byDate.get(date)||'';
   return [date,x.title,x.summary,photo,x.document_ref,x.id];
  });
  const source=[header,...rows].map(a=>a.map(csvEscape).join(',')).join('\r\n');
  native(source,{...config,download:false},...args);
 }).catch(e=>{
  __f4.globals.console.warn('Rapat D1 belum tersedia, kembali ke CSV asli:',e.message);
  native(input,config,...args);
 });
 return __f4.globals.undefined;
};
})();
});
