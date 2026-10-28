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
console.log('FRONTEND_MAINTENANCE_STATIC_CHECK_OK');
