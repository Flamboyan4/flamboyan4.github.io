'use strict';
// Static CSS ownership guard. Public/finance data are never accessed.
const fs=require('node:fs');
const cp=require('node:child_process');
const assert=require('node:assert/strict');
const tracked=cp.execFileSync('git',['ls-files','-z','--','*.css','*.html'],{encoding:'utf8'}).split('\0').filter(Boolean);
let scanned=0;
for(const path of tracked){
 const source=fs.readFileSync(path,'utf8');
 const blocks=path.endsWith('.css')?[source]:
  [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]);
 for(const block of blocks){
  assert(!/!\s*important\b/i.test(block),'CSS priority declaration detected: '+path);
  scanned++;
 }
 if(path.endsWith('.html')){
  for(const m of source.matchAll(/\bstyle\s*=\s*(["'])(.*?)\1/gi))
   assert(!/!\s*important\b/i.test(m[2]),'Inline CSS priority declaration detected: '+path);
 }
}
function duplicates(css){
 const seen=new Map(),collisions=new Map();
 function token(src,p,end,chars){
  let quote='',comment=false,paren=0,square=0;
  for(let i=p;i<end;i++){
   const c=src[i],next=src[i+1];
   if(comment){if(c==='*'&&next==='/'){comment=false;i++;}continue;}
   if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote='';continue;}
   if(c==='/'&&next==='*'){comment=true;i++;continue;}
   if(c==="'"||c==='"'){quote=c;continue;}
   if(c==='(')paren++;else if(c===')')paren--;
   else if(c==='[')square++;else if(c===']')square--;
   else if(paren<=0&&square<=0&&chars.includes(c))return {i,c};
  }
  return null;
 }
 function close(src,open,end){
  let depth=1,pos=open+1;
  while(pos<end){
   const t=token(src,pos,end,['{','}']);if(!t)return null;
   if(t.c==='{')depth++;else if(--depth===0)return t.i;
   pos=t.i+1;
  }
  return null;
 }
 function walk(src,start,end,scope){
  let p=start;
  while(p<end){
   while(p<end&&/\s/.test(src[p]))p++;
   if(src.slice(p,p+2)==='/*'){
    const stop=src.indexOf('*/',p+2);p=stop<0?end:stop+2;continue;
   }
   const t=token(src,p,end,['{',';','}']);
   if(!t||t.c==='}')return;
   if(t.c===';'){p=t.i+1;continue;}
   const head=src.slice(p,t.i).replace(/\/\*[\s\S]*?\*\//g,'').trim();
   const last=close(src,t.i,end);
   assert(last!==null,'Malformed stylesheet before: '+head.slice(0,80));
   if(head.startsWith('@'))walk(src,t.i+1,last,[...scope,head.replace(/\s+/g,' ')]);
   else if(head){
    const key=scope.join('|')+'|'+head.replace(/\s+/g,' ');
    if(seen.has(key))collisions.set(key,(collisions.get(key)||1)+1);
    else seen.set(key,true);
   }
   p=last+1;
  }
 }
 walk(css,0,css.length,[]);
 return [...collisions].map(([selector,n])=>({selector,n}));
}
for(const path of ['portal-live/bank-eco-pages.css','portal-live/bank-member-navigation.css','portal-live/bank-mobile-dock.css','bank-sampah/index.html']){
 const source=fs.readFileSync(path,'utf8');
 const css=path.endsWith('.html')?[...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n'):source;
 const dup=duplicates(css);
 assert.equal(dup.length,0,'Duplicate CSS selectors in '+path+': '+JSON.stringify(dup.slice(0,7)));
}
const dock=fs.readFileSync('portal-live/bank-mobile-dock.css','utf8');
const page=fs.readFileSync('portal-live/bank-eco-pages.css','utf8');
const html=fs.readFileSync('bank-sampah/index.html','utf8');
assert(html.includes('/portal-live/bank-mobile-dock.css?v='),'Shared dock must load on published page');
assert(!page.includes('.f4-bank-app-dock:not([hidden])'),'Dock styling must not be duplicated in page stylesheet');
assert(!dock.includes('body.f4-bank-app-admin .f4-bank-app-dock-action'),'Admin must reuse the member dock');
assert(!dock.includes('body.f4-bank-app-member .f4-bank-app-dock-action'),'Warga must reuse the same dock');
console.log('F4_CSS_CASCADE_SINGLE_OWNER_OK',tracked.length,'files',scanned,'style blocks');
