/* Read-only guard for homepage extraction. Node 22, no external dependencies. */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const cctv=fs.readFileSync('cctv.html','utf8');
const js=fs.readFileSync('portal-live/home-legacy.js','utf8');
const a11y=fs.readFileSync('portal-live/home-accessibility.js','utf8');
for(const [file,source] of [['home-legacy.js',js],['home-accessibility.js',a11y]])
  new vm.Script(source,{filename:file});
for(const path of ['home-base.css','home-overrides.css','home-legacy.js','home-accessibility.js'])
  if(!html.includes('/portal-live/'+path+'?v='))throw Error('Missing homepage asset: '+path);
for(const path of ['home-base.css','home-overrides.css'])
  if(!fs.readFileSync('portal-live/'+path,'utf8').trim())throw Error('Empty CSS '+path);
if(!js.includes('// Projek Portal Utama langsung dari D1.'))throw Error('Project Card code lost');
if(!html.includes('cdn.tailwindcss.com'))throw Error('Tailwind remains in use until a compiled stylesheet is verified');
if(html.includes('lucide@latest')||cctv.includes('lucide@latest'))throw Error('Lucide must use a pinned version');
if(html.includes('oncontextmenu="return false;"'))throw Error('Context menu still blocked');
for(const id of ['modal-event-detail','modal-arisan','modal-cetak-kas','modal-keuangan','modal-dokumentasi']){
 const i=html.indexOf('id="'+id+'"');
 if(i<0||!html.slice(i,i+450).includes('role="dialog"'))throw Error('Missing dialog semantics: '+id);
}
// Kalender: rencana mendatang (termasuk arisan) paling dekat lebih dulu;
// rencana yang lewat di bawahnya, dan daftar selesai tetap terbaru dahulu.
const first=js.indexOf('const validAgendaDate=item=>{');
const last=js.indexOf('onProgressList.sort(latestFirst);',first);
if(first<0||last<first)throw Error('Calendar sort helpers missing');
const calendarSort=vm.runInNewContext(
  '(function(){'+js.slice(first,last)+'return {closestUpcoming,latestFirst,todayKey};})()',
  {Date,String}
);
const isoOffset=days=>{
 const d=new Date(calendarSort.todayKey+'T12:00:00Z');
 d.setUTCDate(d.getUTCDate()+days);
 return d.toISOString().slice(0,10);
};
const plans=[
 {judul:'Arisan jauh',parsedDate:isoOffset(400)},
 {judul:'Arisan dekat',parsedDate:isoOffset(15)},
 {judul:'Arisan bulan depan',parsedDate:isoOffset(45)},
 {judul:'Rencana sudah lewat',parsedDate:isoOffset(-3)}
];
plans.sort(calendarSort.closestUpcoming);
if(plans.map(x=>x.judul).join('|')!=='Arisan dekat|Arisan bulan depan|Arisan jauh|Rencana sudah lewat')
 throw Error('Upcoming plans are not sorted from closest to furthest');
if(!(calendarSort.latestFirst({parsedDate:isoOffset(1)},{parsedDate:isoOffset(-1)})<0))
 throw Error('Completed and in-progress events must retain latest-first ordering');
console.log('CALENDAR_UPCOMING_ORDER_OK');
console.log('FRONTEND_MAINTENANCE_STATIC_CHECK_OK');
