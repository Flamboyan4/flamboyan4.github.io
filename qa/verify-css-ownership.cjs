
'use strict';
/* Read-only CSS ownership audit. Count repeated selectors at the same at-rule scope. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
function matchClosing(s,open,end){
 let depth=1,quote='',comment=false;
 for(let i=open+1;i<end;i++){
  const c=s[i],n=s[i+1];
  if(comment){if(c==='*'&&n==='/'){i++;comment=false}continue}
  if(quote){if(c==='\\'){i++;continue}if(c===quote)quote='';continue}
  if(c==='/'&&n==='*'){i++;comment=true;continue}
  if(c==='"'||c==="'"){quote=c;continue}
  if(c==='{')depth++;
  if(c==='}'&&!--depth)return i;
 }
 return -1;
}
function nextDelimiter(s,start,end){
 let quote='',comment=false,paren=0;
 for(let i=start;i<end;i++){
  const c=s[i],n=s[i+1];
  if(comment){if(c==='*'&&n==='/'){i++;comment=false}continue}
  if(quote){if(c==='\\'){i++;continue}if(c===quote)quote='';continue}
  if(c==='/'&&n==='*'){i++;comment=true;continue}
  if(c==='"'||c==="'"){quote=c;continue}
  if(c==='(')paren++;
  if(c===')')paren=Math.max(0,paren-1);
  if(paren===0&&(c==='{'||c===';'||c==='}'))return i;
 }
 return -1;
}
function selectors(css){
 const found=[];
 function walk(a,b,scope){
  let pos=a;
  while(pos<b){
   const i=nextDelimiter(css,pos,b);
   if(i<0)break;
   if(css[i]!=='{'){pos=i+1;continue}
   const end=matchClosing(css,i,b);
   if(end<0)break;
   const head=css.slice(pos,i).replace(/\/\*[\s\S]*?\*\//g,'').trim().replace(/\s+/g,' ');
   if(/^@(media|supports|container|layer|document)\b/i.test(head)){
    walk(i+1,end,scope+' | '+head);
   }else if(head&&!head.startsWith('@')){
    found.push(scope+' || '+head);
   }
   pos=end+1;
  }
 }
 walk(0,css.length,'');
 return found;
}
function cssText(path){
 const src=fs.readFileSync(path,'utf8');
 if(!path.endsWith('.html'))return src;
 return [...src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
   .map(m=>m[1]).join('\n');
}
function duplicateCount(path){
 const counts=new Map();
 for(const sel of selectors(cssText(path)))counts.set(sel,(counts.get(sel)||0)+1);
 return [...counts.values()].reduce((sum,n)=>sum+Math.max(0,n-1),0);
}

const limits={
  "pembukuan/index.html": 164,
  "bank-sampah/index.html": 82,
  "portal-live/modern-portals.css": 11,
  "portal-live/direct-shell.css": 7,
  "portal-live/portal-polish.css": 7,
  "portal-live/bank-eco-pages.css": 2,
  "portal-live/bank-eco-dashboard.css": 2,
  "portal-live/unified-account.css": 14,
  "portal-live/dokumentasi/site.css": 29,
  "portal-live/home-base.css": 5,
  "portal-live/home-overrides.css": 0,
  "portal-live/treasury-center.css": 1,
  "portal-live/dokumentasi/media-theme.css": 2,
  "portal-live/bank-member-polish.css": 0,
  "portal-live/loading-state.css": 0
};
for(const [path,budget] of Object.entries(limits)){
 const actual=duplicateCount(path);
 assert(actual<=budget,'Repeated CSS selector (same scope) increased in '+path+': '+actual+' > '+budget);
}
console.log('CSS_OWNERSHIP_AUDIT_OK='+Object.keys(limits).length);
console.log('CSS_REPEATED_SELECTOR_BUDGETS='+JSON.stringify(limits));
