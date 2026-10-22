/* Hasil Rapat staging reads D1 while preserving original HTML and legacy preview images. */
(()=>{
'use strict';
if(!window.Papa?.parse)return;
const native=window.Papa.parse.bind(window.Papa);
const csvURLFragment='gid=449852491';
const csvEscape=v=>{
 let s=String(v??'');return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;
};
const textDate=d=>{
 const m=String(d||'').match(/^(\d{4})-(\d\d)-(\d\d)/);
 return m?m[3]+'/'+m[2]+'/'+m[1]:String(d||'');
};
const normalized=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const legacyPhotos=url=>new Promise(resolve=>{
 try{
  native(url,{download:true,header:true,complete:r=>{
   const byTitle=new Map(),byDate=new Map();
   for(const item of r.data||[]){
    const a=Object.values(item),date=String(a[0]||''),title=String(a[1]||''),photo=String(a[3]||'');
    if(photo){byTitle.set(normalized(title),photo);if(!byDate.has(date))byDate.set(date,photo)}
   }
   resolve({byTitle,byDate});
  },error:()=>resolve({byTitle:new Map(),byDate:new Map()})});
 }catch{resolve({byTitle:new Map(),byDate:new Map()})}
});
window.Papa.parse=(input,config,...args)=>{
 if(typeof input!=='string'||!input.includes(csvURLFragment)||!config?.download)return native(input,config,...args);
 Promise.all([
  fetch('https://api.flamboyan4.web.id/api/v2/public/portal',{mode:'cors',cache:'no-store'}).then(r=>{if(!r.ok)throw Error('API HTTP '+r.status);return r.json()}),
  legacyPhotos(input)
 ]).then(([d,photos])=>{
  if(d.ok===false||!Array.isArray(d.meetings))throw Error(d.error||'Data rapat D1 tidak siap');
  const header=['Tanggal','Judul','Deskripsi','Foto','Link Dokumen'];
  const rows=d.meetings.slice().reverse().map(x=>{
   const date=textDate(x.meeting_on);
   const photo=photos.byTitle.get(normalized(x.title))||photos.byDate.get(date)||'';
   return [date,x.title,x.summary,photo,x.document_ref];
  });
  const source=[header,...rows].map(a=>a.map(csvEscape).join(',')).join('\r\n');
  native(source,{...config,download:false},...args);
 }).catch(e=>{
  console.warn('Rapat D1 belum tersedia, kembali ke CSV asli:',e.message);
  native(input,config,...args);
 });
 return undefined;
};
})();