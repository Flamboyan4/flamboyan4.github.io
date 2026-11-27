/* Flamboyan 4: local PDF export. HTML templates remain the source of truth.
   One page at a time, no printer dialog, no financial data sent to a PDF service. */
(()=>{
'use strict';
const LIB='/portal-live/vendor/html2pdf-0.12.1.bundle.min.js';
const px=96/25.4,pt=72/25.4;
let active=null;
const el=(d,t,c)=>{const n=d.createElement(t);if(c)n.className=c;return n};
const safeName=s=>String(s||'Laporan Flamboyan 4').replace(/\.pdf$/i,'').replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').trim().slice(0,150)+'.pdf';
const check=s=>{if(s!==active||s.closed)throw new Error('Dibatalkan')};
function close(){
 const s=active;if(!s)return;active=null;s.closed=true;
 s.frame?.remove();for(const u of s.urls)URL.revokeObjectURL(u);
 if(s.dialog.open)s.dialog.close();s.dialog.remove();
 if(s.trigger?.isConnected)s.trigger.focus({preventScroll:true});
}
function session(title){
 close();const dialog=el(document,'dialog','f4-pdf-dialog');dialog.setAttribute('aria-label','Pratinjau PDF');
 dialog.innerHTML='<header class="f4-pdf-head"><div><strong>Pratinjau PDF</strong><small class="f4-pdf-title"></small></div><button type="button" class="f4-pdf-close" aria-label="Tutup"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><div class="f4-pdf-pages" aria-live="polite"><p>Menyiapkan PDF…</p></div><footer class="f4-pdf-foot"><span class="f4-pdf-info" role="status">Memuat…</span><button type="button" class="f4-pdf-download" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/></svg>Unduh PDF</button></footer>';
 const s={dialog,trigger:document.activeElement,urls:[],pages:[],closed:false,blob:null,name:safeName(title)};
 active=s;dialog.querySelector('.f4-pdf-title').textContent=title||'Laporan Flamboyan 4';
 s.viewer=dialog.querySelector('.f4-pdf-pages');s.info=dialog.querySelector('.f4-pdf-info');s.download=dialog.querySelector('.f4-pdf-download');
 dialog.querySelector('.f4-pdf-close').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
 s.download.onclick=()=>{if(!s.blob||s!==active)return;const u=URL.createObjectURL(s.blob);const a=el(document,'a');a.href=u;a.download=s.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)};
 document.body.append(dialog);dialog.showModal();return s;
}
function fail(s,e){if(s!==active)return;s.frame?.remove();s.viewer.replaceChildren();const p=el(document,'p','f4-pdf-error');p.textContent='PDF belum dapat dibuat: '+(e?.message||String(e));s.viewer.append(p);s.info.textContent='Gagal';}
function ready(s,blob,label){check(s);s.blob=blob;s.info.textContent=s.pages.length+' halaman · '+label;s.download.disabled=false;s.frame?.remove();s.frame=null;}
function imagePage(s,blob,w,h){check(s);const url=URL.createObjectURL(blob);s.urls.push(url);const img=el(document,'img','f4-pdf-page');img.src=url;img.alt='Halaman '+(s.pages.length+1);img.width=w;img.height=h;if(!s.pages.length)s.viewer.replaceChildren();s.viewer.append(img);s.pages.push({blob,w,h});}
function paperSpec(css,options={}){
 const rules=[...css.matchAll(/@page\s*(?:[^{]*)\{([^{}]*)\}/gi)].map(x=>x[1]);const last=rules.at(-1)||'';
 const size=options.size||(/\bA5\b/i.test(last)?'A5':'A4');const landscape=options.orientation?options.orientation==='landscape':/\blandscape\b/i.test(last);
 const wh=size==='A5'?[148,210]:[210,297];const [w,h]=landscape?wh.reverse():wh;
 const raw=options.margins||last.match(/(?:^|;)\s*margin\s*:\s*([^;}]+)/i)?.[1]||'12mm';
 const m=String(raw).trim().split(/\s+/).map(v=>/^\d+(?:\.\d+)?mm$/.test(v)?parseFloat(v):12);
 const [t,r,b,l]=m.length===1?[m[0],m[0],m[0],m[0]]:m.length===2?[m[0],m[1],m[0],m[1]]:m.length===3?[m[0],m[1],m[2],m[1]]:m;
 return {w,h,t,r,b,l,label:size+(landscape?' landscape':' portrait')};
}
function printRules(d,raw){
 // Browser CSS parser, not regex: unwrap @media print and discard screen layout.
 const node=el(d,'style');node.textContent=raw;d.head.append(node);
 const base=[],print=[];
 function scan(rules,out){for(const r of rules){if(r.type===4){if(/\bprint\b/i.test(r.conditionText))scan(r.cssRules,print);continue}if(r.type===6||r.type===3||r.selectorText?.replace(/\s+/g,'').includes('f4-bank-single-print>*:not')||r.selectorText==='body *'&&r.style?.visibility==='hidden')continue;out.push(r.cssText)}}
 try{scan(node.sheet.cssRules,base)}finally{node.remove()}
 return base.join('\n')+'\n'+print.join('\n');
}
function clean(root){
 root.querySelectorAll('script,iframe,object,embed,form,button,input,select,textarea,.no-print,.bar,[hidden],.hidden').forEach(n=>n.remove());
 for(const n of [root,...root.querySelectorAll('*')])for(const a of [...n.attributes])if(/^on/i.test(a.name))n.removeAttribute(a.name);
}
async function assets(s,d){
 const imgs=[...d.images];
 await Promise.all(imgs.map(async img=>{img.loading='eager';if(!img.complete)await new Promise((ok,bad)=>{const timer=setTimeout(()=>bad(Error('Gambar laporan belum selesai dimuat.')),12000);img.addEventListener('load',()=>{clearTimeout(timer);ok()},{once:true});img.addEventListener('error',()=>{clearTimeout(timer);bad(Error('Gambar laporan tidak dapat dimuat.'))},{once:true})});if(!img.naturalWidth)throw Error('Gambar laporan tidak dapat dibaca.');if(img.decode)await img.decode().catch(()=>{});}));
 await d.fonts?.ready;check(s);
}
async function makeFrame(s,html,options){
 const parsed=new DOMParser().parseFromString(html,'text/html');
 const raw=[...parsed.querySelectorAll('style')].map(n=>n.textContent).join('\n');
 const spec=paperSpec(raw,options);
 const frame=el(document,'iframe','f4-pdf-render-frame');frame.title='Pengolah PDF';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
 frame.style.width=spec.w*px+'px';frame.style.height=spec.h*px+'px';document.body.append(frame);s.frame=frame;
 const d=frame.contentDocument;d.open();d.write('<!doctype html><html lang="id"><head><meta charset="utf-8"></head><body></body></html>');d.close();
 const base=el(d,'base');base.href=location.origin+'/';d.head.append(base);
 const style=el(d,'style');style.textContent=printRules(d,raw)+
 '\nhtml,body{width:auto;height:auto;min-height:0;max-width:none;max-height:none;margin:0;padding:0;overflow:visible;background:white}body{visibility:visible}'+
 '\n.f4-pdf-paper{display:block;position:relative;box-sizing:border-box;width:'+spec.w*px+'px;height:'+spec.h*px+'px;padding:'+([spec.t,spec.r,spec.b,spec.l].map(v=>v*px+'px').join(' '))+';margin:0;overflow:hidden;background:#fff;visibility:visible}'+
 '\n.f4-pdf-flow{display:flow-root;position:relative;box-sizing:border-box;height:100%;width:100%;overflow:visible;visibility:visible}'+
 '\n.f4-pdf-flow #report-print-area,.f4-pdf-flow #v10Print,.f4-pdf-flow #v27PrintReport{display:block;position:static;inset:auto;transform:none;width:100%;max-width:none;min-width:0;margin:0;padding:0;overflow:visible;visibility:visible}'+
 '\n.f4-pdf-flow table{max-width:100%;min-width:0}.f4-pdf-flow .report-table-wrap{overflow:visible;max-width:100%}.f4-pdf-flow .no-print,.f4-pdf-flow .bar{display:none}';
 d.head.append(style);d.body.className=parsed.body.className;
 clean(parsed.body);parsed.body.querySelectorAll('style,link,base').forEach(n=>n.remove());
 const source=el(d,'div');for(const n of [...parsed.body.childNodes])source.append(d.importNode(n,true));
 // Source is laid out at the exact paper content width, with images decoded.
 source.style.width=(spec.w-spec.l-spec.r)*px+'px';d.body.append(source);
 await assets(s,d);
 const script=el(d,'script');script.src=LIB;
 await new Promise((ok,bad)=>{const timer=setTimeout(()=>bad(Error('Pustaka PDF belum siap.')),20000);script.onload=()=>{clearTimeout(timer);ok()};script.onerror=()=>{clearTimeout(timer);bad(Error('Pustaka PDF tidak dapat dimuat.'))};d.head.append(script)});
 check(s);if(typeof frame.contentWindow.html2pdf!=='function')throw Error('Pustaka PDF tidak siap.');
 source.remove();return {d,source,spec,worker:frame.contentWindow.html2pdf};
}
function paginate(d,source,spec){
 const pages=[];let page,flow,wrappers;
 const contentH=(spec.h-spec.t-spec.b)*px;
 function next(){page=el(d,'section','f4-pdf-paper');flow=el(d,'div','f4-pdf-flow');page.append(flow);d.body.append(page);pages.push(page);wrappers=new Map()}
 function host(path){let h=flow;for(const n of path){let c=wrappers.get(n);if(!c){c=n.cloneNode(false);h.append(c);wrappers.set(n,c)}h=c}return h}
 const hasContent=()=>!!flow.textContent.trim()||!!flow.querySelector('img,table,svg');
 function fit(){return flow.getClientRects().length>0&&flow.scrollHeight<=Math.ceil(contentH)+1&&flow.scrollWidth<=Math.ceil((spec.w-spec.l-spec.r)*px)+2}
 function prune(path){for(let i=path.length-1;i>=0;i--){const n=path[i],c=wrappers.get(n);if(c&&!c.childNodes.length){c.remove();wrappers.delete(n)}else break}}
 function attempt(n,path){const c=n.cloneNode(true);host(path).append(c);if(fit())return true;c.remove();prune(path);return false}
 function newIfContent(){if(hasContent())next()}
 function table(n,path){
  const bodyRows=[...n.tBodies].flatMap(t=>[...t.rows]);const foot=[...n.tFoot?.rows||[]];const groups=[];
  for(let i=0;i<bodyRows.length;){let end=i+1;for(let k=i;k<end&&k<bodyRows.length;k++)for(const cell of bodyRows[k].cells)end=Math.max(end,k+Math.max(1,cell.rowSpan));groups.push({rows:bodyRows.slice(i,end),foot:false});i=end}
  if(foot.length)groups.push({rows:foot,foot:true});
  if(!groups.length){newIfContent();if(!attempt(n,path))throw Error('Tabel terlalu besar untuk ukuran kertas.');return}
  let t=null,count=0;
  const start=()=>{t=n.cloneNode(false);for(const child of [...n.children])if(['CAPTION','COLGROUP','THEAD'].includes(child.tagName))t.append(child.cloneNode(true));host(path).append(t);count=0};
  const put=g=>{if(!t)start();const section=el(d,g.foot?'tfoot':'tbody');for(const row of g.rows)section.append(row.cloneNode(true));t.append(section);if(fit()){count++;return true}section.remove();return false};
  for(const g of groups){if(put(g))continue;if(!count){t.remove();prune(path)}newIfContent();t=null;if(!put(g))throw Error('Satu baris tabel melebihi tinggi kertas.')}
 }
 function place(n,path=[]){
  if(n.nodeType===3){if(n.textContent.trim()&&!attempt(n,path)){newIfContent();if(!attempt(n,path))throw Error('Teks melebihi halaman.')}return}
  if(n.nodeType!==1)return;
  if(n.matches('.f4-jersey-appendix,[style*="break-before:page"],[style*="page-break-before:always"]'))newIfContent();
  if(attempt(n,path))return;
  if(n.tagName==='TABLE'){table(n,path);return}
  if(n.children.length&&n.querySelector('table')&&!n.matches('.f4-jersey-appendix')){
   for(const child of [...n.childNodes])place(child,[...path,n]);return;
  }
  newIfContent();if(attempt(n,path))return;
  if(n.children.length&&!n.matches('img,svg,.f4-jersey-appendix')){
   for(const child of [...n.childNodes])place(child,[...path,n]);return;
  }
  throw Error('Ada bagian laporan yang melebihi ukuran kertas. Data tidak dipotong.');
 }
 next();for(const n of [...source.childNodes])place(n);
 if(!hasContent()&&pages.length>1){pages.pop().remove()}
 if(!pages.length||!pages[0].textContent.trim()&&!pages[0].querySelector('img,svg,table'))throw Error('Laporan kosong.');
 return pages;
}
function pdfBlob(pages,wmm,hmm){
 // Standard PDF 1.4, JPEG XObjects and explicit byte offsets.
 const enc=new TextEncoder(),chunks=[],offsets=[0];let len=0;
 function put(v){const b=typeof v==='string'?enc.encode(v):v;chunks.push(b);len+=b.byteLength??b.size}
 function obj(id,v){offsets[id]=len;put(id+' 0 obj\n');put(v);put('\nendobj\n')}
 put('%PDF-1.4\n%F4PDF\n');
 const ids=pages.map((_,i)=>3+i*3);
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Count '+pages.length+' /Kids ['+ids.map(id=>id+' 0 R').join(' ')+'] >>');
 const w=(wmm*pt).toFixed(3),h=(hmm*pt).toFixed(3);
 for(let i=0;i<pages.length;i++){const p=pages[i],id=ids[i];obj(id,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+w+' '+h+'] /Resources << /XObject << /Im0 '+(id+1)+' 0 R >> >> /Contents '+(id+2)+' 0 R >>');
 offsets[id+1]=len;put((id+1)+' 0 obj\n<< /Type /XObject /Subtype /Image /Width '+p.w+' /Height '+p.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+p.blob.size+' >>\nstream\n');put(p.blob);put('\nendstream\nendobj\n');
 const content='q\n'+w+' 0 0 '+h+' 0 0 cm\n/Im0 Do\nQ\n';obj(id+2,'<< /Length '+enc.encode(content).length+' >>\nstream\n'+content+'endstream');}
 const xref=len;put('xref\n0 '+offsets.length+'\n0000000000 65535 f \n');for(let i=1;i<offsets.length;i++)put(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
 put('trailer\n<< /Size '+offsets.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');return new Blob(chunks,{type:'application/pdf'});
}
async function openHTML(html,options={}){
 const parsed=new DOMParser().parseFromString(html,'text/html');const s=session(options.title||parsed.title||'Laporan Flamboyan 4');
 try{
  const {d,source,spec,worker}=await makeFrame(s,html,options);check(s);
  const pages=paginate(d,source,spec);await assets(s,d);
  for(let i=0;i<pages.length;i++){
   check(s);s.info.textContent='Membuat halaman '+(i+1)+' dari '+pages.length+'…';
   const canvas=await worker().set({margin:0,jsPDF:{unit:'mm',format:[spec.w,spec.h],orientation:spec.w>spec.h?'landscape':'portrait'},pagebreak:{mode:[]},html2canvas:{scale:3,backgroundColor:'#fff',useCORS:true,logging:false,windowWidth:Math.ceil(spec.w*px),windowHeight:Math.ceil(spec.h*px)}}).from(pages[i]).toCanvas().get('canvas');
   check(s);if(Math.abs(canvas.width/canvas.height-spec.w/spec.h)>.015)throw Error('Ukuran hasil render tidak sesuai kertas.');const blob=await new Promise((ok,bad)=>canvas.toBlob(b=>b?ok(b):bad(Error('Halaman PDF tidak terbentuk.')),'image/jpeg',.98));
   imagePage(s,blob,canvas.width,canvas.height);canvas.width=canvas.height=1;pages[i].remove();
  }
  ready(s,pdfBlob(s.pages,spec.w,spec.h),spec.label);
 }catch(e){fail(s,e)}
}
async function openImage(blob,filename){
 const s=session(String(filename||'Resi Flamboyan 4').replace(/\.[a-z]+$/i,''));
 try{const u=URL.createObjectURL(blob);s.urls.push(u);const img=new Image();img.src=u;await img.decode();check(s);imagePage(s,blob,img.naturalWidth,img.naturalHeight);const w=105,h=w*img.naturalHeight/img.naturalWidth;ready(s,pdfBlob(s.pages,w,h),'Resi')}catch(e){fail(s,e)}
}
const style=el(document,'style');style.dataset.f4Persistent='shell';style.textContent=
'.f4-pdf-dialog{box-sizing:border-box;width:min(94vw,900px);height:min(94dvh,1100px);max-width:none;max-height:none;margin:auto;padding:0;border:0;border-radius:16px;background:#fff;color:#26344f;font:14px/1.4 system-ui,sans-serif;overflow:hidden;box-shadow:0 12px 48px #17223842}.f4-pdf-dialog[open]{display:flex;flex-direction:column}.f4-pdf-dialog::backdrop{background:#16203780}.f4-pdf-head,.f4-pdf-foot{display:flex;flex:none;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#fff}.f4-pdf-head{border-bottom:1px solid #e5e7eb}.f4-pdf-foot{border-top:1px solid #e5e7eb}.f4-pdf-head strong,.f4-pdf-title{display:block}.f4-pdf-title{font-size:12px;color:#64748b;overflow-wrap:anywhere}.f4-pdf-close,.f4-pdf-download{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border:0;border-radius:10px;padding:0 14px;font:650 14px system-ui;cursor:pointer}.f4-pdf-close{color:#334155;background:#f1f5f9;width:44px;padding:0}.f4-pdf-download{background:var(--f4-nav,#5145cd);color:white}.f4-pdf-download:disabled{opacity:.5;cursor:default}.f4-pdf-dialog svg{width:20px;height:20px}.f4-pdf-pages{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:16px;background:#e7eaf0;text-align:center}.f4-pdf-page{display:block;width:min(100%,720px);height:auto;margin:0 auto 16px;background:#fff;box-shadow:0 2px 8px #17223826}.f4-pdf-info{color:#64748b;font-size:12px}.f4-pdf-error{color:#a61f31}.f4-pdf-render-frame{position:fixed;left:-20000px;top:0;border:0;pointer-events:none}@media(max-width:767px){.f4-pdf-dialog{width:100%;height:100dvh;max-height:100dvh;border-radius:0}.f4-pdf-pages{padding:10px}.f4-pdf-foot{padding-bottom:calc(12px + env(safe-area-inset-bottom,0px))}}';
document.head.append(style);window.F4PdfEngine={openHTML,openImage,close};
document.addEventListener('f4:portal-changed',close);window.addEventListener('pagehide',close);
})();