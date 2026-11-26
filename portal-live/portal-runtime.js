/* Flamboyan 4: mount and dispose the original portal sources in one document.
 * No iframe, no duplicate application and no evaluation of downloaded text.
 * Each portal script registers a factory at its original URL. */
(()=>{
'use strict';
if(window.F4PortalRuntime)return;
const factories=new Map(),loads=new Map();
const routes={'/':'portal','/bank-sampah/':'bank','/pembukuan/':'book','/superadmin/':'superadmin','/rapat/':'rapat','/dokumentasi/':'dokumentasi'};
const canonical=p=>p.replace(/index\.html$/i,'').replace(/\/?$/,'/');
const keyOf=p=>routes[canonical(p)]||'';
const release=document.documentElement.dataset.f4Release;
const permanentBody=n=>n.nodeType===1&&(n.hasAttribute('data-f4-persistent')||n.matches('#f4-direct-bar,#f4-direct-dock,#f4-direct-dialog,#f4-direct-gate,#f4-session-notice,#f4-unified-account,.f4-tag-inbox'));
const permanentStyle=n=>n.hasAttribute('data-f4-persistent')||n.matches('#f4-search-reload-layout')||/\/(?:direct-shell|unified-account|gallery-tag-notifications)\.css(?:\?|$)/.test(n.getAttribute('href')||'');
const abortError=()=>new DOMException('Konten portal telah ditutup.','AbortError');
window.addEventListener('unhandledrejection',e=>{if(e.reason?.name==='AbortError'&&e.reason?.message==='Konten portal telah ditutup.')e.preventDefault()});
let active=null,booted=false;
const nativeFetch=window.fetch.bind(window);
const sharedLibraries=new Map();
const nativeAdd=EventTarget.prototype.addEventListener,nativeRemove=EventTarget.prototype.removeEventListener;
function scopeFor(key){
 let alive=true,ready=false,leaving=false,writes=0;
 const names=new Map(),originals=new Map(),listeners=[],readyEvents=[],timers=new Map(),frames=new Set(),observers=new Set(),controllers=new Set(),cleanups=new Set();
 const own=new Map(),api={};
 const assert=()=>{if(!alive)throw abortError()};
 const track=(target,type,fn,options)=>{
  assert();if(!fn)return;
  if(!ready&&((target===document&&type==='DOMContentLoaded')||(target===window&&type==='load'))){readyEvents.push({target,type,fn,options});return;}
  const capture=typeof options==='boolean'?options:!!options?.capture;
  if(listeners.some(x=>x.target===target&&x.type===type&&x.fn===fn&&x.capture===capture))return;
  const wrapped=function(event){if(!alive)return;if(type==='popstate'&&keyOf(location.pathname)!==key)return;if(options?.once){const i=listeners.findIndex(x=>x.wrapped===wrapped);if(i>=0)listeners.splice(i,1)}if(typeof fn==='function')return fn.call(target,event);return fn.handleEvent?.(event);};
  listeners.push({target,type,fn,wrapped,capture});nativeAdd.call(target,type,wrapped,options);
 };
 const untrack=(target,type,fn,options)=>{
  const capture=typeof options==='boolean'?options:!!options?.capture;
  for(let i=listeners.length-1;i>=0;i--){const x=listeners[i];if(x.target===target&&x.type===type&&x.fn===fn&&x.capture===capture){nativeRemove.call(target,type,x.wrapped,capture);listeners.splice(i,1);}}
  for(let i=readyEvents.length-1;i>=0;i--){const x=readyEvents[i];if(x.target===target&&x.type===type&&x.fn===fn)readyEvents.splice(i,1);}
 };
 function timer(repeat,fn,delay,...args){assert();if(typeof fn!=='function')throw Error('Timer harus menggunakan fungsi.');let id;const cb=()=>{if(!repeat)timers.delete(id);if(alive)fn(...args)};id=(repeat?window.setInterval:window.setTimeout)(cb,delay);timers.set(id,repeat);return id}
 function clearTimer(id){(timers.get(id)?window.clearInterval:window.clearTimeout)(id);timers.delete(id)}
 function frame(fn){assert();const id=window.requestAnimationFrame(t=>{frames.delete(id);if(alive)fn(t)});frames.add(id);return id}
 function cancelFrame(id){window.cancelAnimationFrame(id);frames.delete(id)}
 const scopedFetch=async(input,init={})=>{
  assert();const method=String(init.method||(input instanceof Request?input.method:'GET')).toUpperCase(),write=!['GET','HEAD','OPTIONS'].includes(method);
  if(write&&leaving)throw Error('Perpindahan portal sedang berlangsung.');
  const c=new AbortController(),signal=init.signal||(input instanceof Request?input.signal:null),abort=()=>c.abort(signal?.reason);
  if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
  // Home's above-the-fold data must not wait on gallery rankings, per-photo reactions,
  // or other below-the-fold requests. Keep all requests scoped and cancellable.
  let viewCritical=true;
  if(key==='portal'&&!write){
   try{
    const url=new URL(input instanceof Request?input.url:String(input),location.href);
    viewCritical=url.origin==='https://api.flamboyan4.web.id'&&['/api/v2/public/portal','/api/v2/public/portal/cash','/api/v2/public/bank'].includes(url.pathname);
   }catch{viewCritical=false}
  }
  const entry={controller:c,write,viewCritical};controllers.add(entry);if(write)writes++;
  let finished=false,grace=null;
  const finish=()=>{if(finished)return;finished=true;if(grace)window.clearTimeout(grace);if(write)writes--;controllers.delete(entry);signal?.removeEventListener('abort',abort)};
  try{
   const response=await nativeFetch(input,{...init,signal:c.signal});
   grace=window.setTimeout(finish,write?30000:60000);
   return new Proxy(response,{get(t,p){const v=Reflect.get(t,p,t);if(typeof v!=='function')return v;if(['json','text','blob','arrayBuffer','formData','bytes'].includes(p))return async(...a)=>{try{return await v.apply(t,a)}finally{finish()}};return v.bind(t)}});
  }catch(e){finish();throw e}
 };
 const makeObserver=Native=>Native?class extends Native{constructor(fn){assert();super((...args)=>{if(alive)fn(...args)});observers.add(this)}}:undefined;
 const scopedLocation=new Proxy(Object.create(null),{get(_,p){const t=location;if(p==='assign'||p==='replace')return value=>{assert();const u=new URL(value,location.href);if(u.origin===location.origin&&keyOf(u.pathname)&&keyOf(u.pathname)!==key)return window.F4PortalNavigation.go(u.href,{replace:p==='replace'});return t[p](value)};if(p==='reload')return()=>{assert();t.reload()};const v=Reflect.get(t,p,t);return typeof v==='function'?v.bind(t):v},set(_,p,v){const t=location;assert();if(p==='href'){const u=new URL(v,location.href);if(u.origin===location.origin&&keyOf(u.pathname)&&keyOf(u.pathname)!==key){void window.F4PortalNavigation.go(u.href);return true}}return Reflect.set(t,p,v,t)}});
 const scopedHistory=new Proxy(Object.create(null),{get(_,p){const t=history;const v=Reflect.get(t,p,t);return typeof v==='function'?(...a)=>{assert();const result=v.apply(t,a);if(p==='pushState'||p==='replaceState')window.F4PortalNavigation?.recordUrl();return result}:v},set(_,p,v){assert();return Reflect.set(history,p,v,history)}});
 const guardedDocument=new Proxy(document,{get(t,p){
  if(p==='readyState')return ready?document.readyState:'loading';
  if(p==='addEventListener')return(...a)=>track(document,...a);
  if(p==='removeEventListener')return(...a)=>untrack(document,...a);
  assert();const v=Reflect.get(t,p,t);return typeof v==='function'?v.bind(t):v;
 },set(t,p,v){assert();return Reflect.set(t,p,v,t)}});
 const builtins={
  document:guardedDocument,location:scopedLocation,history:scopedHistory,fetch:scopedFetch,
  addEventListener:(...a)=>track(window,...a),removeEventListener:(...a)=>untrack(window,...a),
  setTimeout:(...a)=>timer(false,...a),setInterval:(...a)=>timer(true,...a),clearTimeout:clearTimer,clearInterval:clearTimer,
  requestAnimationFrame:frame,cancelAnimationFrame:cancelFrame,MutationObserver:makeObserver(window.MutationObserver),
  ResizeObserver:makeObserver(window.ResizeObserver),IntersectionObserver:makeObserver(window.IntersectionObserver)
 };
 builtins.matchMedia=query=>{assert();const m=window.matchMedia(query);return new Proxy(m,{get(t,p){if(p==='addEventListener')return(...a)=>track(t,...a);if(p==='removeEventListener')return(...a)=>untrack(t,...a);if(p==='addListener')return fn=>track(t,'change',fn);if(p==='removeListener')return fn=>untrack(t,'change',fn);const v=Reflect.get(t,p,t);return typeof v==='function'?v.bind(t):v}})};
 if(window.visualViewport)builtins.visualViewport=new Proxy(window.visualViewport,{get(t,p){if(p==='addEventListener')return(...a)=>track(t,...a);if(p==='removeEventListener')return(...a)=>untrack(t,...a);const v=Reflect.get(t,p,t);return typeof v==='function'?v.bind(t):v}});
 const nativeBound=new Set(['alert','confirm','prompt','scrollTo','scrollBy','getComputedStyle','matchMedia','getSelection','open','postMessage','dispatchEvent','print','focus','blur','atob','btoa']);
 const reserved=new Set(['F4PortalRuntime','F4PortalNavigation','F4MobileDock','F4MobileSheets','F4Loading','f4ShowLogin','f4RefreshDirectAvatar','f4OpenUnifiedAccount','f4CloseUnifiedAccount']);
 function installGlobal(name){
  if(originals.has(name)||reserved.has(name))return;
  const d=Object.getOwnPropertyDescriptor(window,name);if(d&&!d.configurable)return;
  originals.set(name,d);
  Object.defineProperty(window,name,{configurable:true,enumerable:d?.enumerable??true,get:()=>get(name),set:v=>set(name,v)});
 }
 function get(name){
  assert();if(typeof name==='symbol')return undefined;
  if(name==='window'||name==='self'||name==='globalThis')return window;
  if(Object.hasOwn(builtins,name))return builtins[name];
  if(names.has(name))return names.get(name).get();
  if(own.has(name))return own.get(name);
  if(name==='tailwind'&&window.tailwind){const previous=window.tailwind.config;cleanups.add(()=>{window.tailwind.config=previous});own.set(name,window.tailwind);return window.tailwind}
  if(name==='Papa'&&window.Papa){const clone=Object.assign({},window.Papa);own.set(name,clone);return clone}
  const original=originals.get(name);
  if(originals.has(name)){if(original?.get)return original.get.call(window);return original?.value}
  const v=window[name];return typeof v==='function'&&nativeBound.has(name)?v.bind(window):v;
 }
 function set(name,value){
  assert();const n=names.get(name);
  if(n){if(!n.set)throw TypeError('Konstanta tidak dapat diubah: '+name);n.set(value);return true}
  own.set(name,value);installGlobal(name);return true;
 }
 const globals=new Proxy(Object.create(null),{get:(_,name)=>get(name),set:(_,name,v)=>set(name,v),has:(_,name)=>names.has(name)||own.has(name)||name in window,deleteProperty:(_,name)=>{assert();own.delete(name);return true}});
 const scopedWindow=new Proxy(Object.create(null),{get(_,p){assert();if(p==='window'||p==='self'||p==='globalThis'||p==='parent'||p==='top')return window[p];return get(p)},set(_,p,v){return set(p,v)},has(_,p){return names.has(p)||own.has(p)||p in window}});
 api.globals=globals;api.window=scopedWindow;api.document=guardedDocument;
 api.expose=(name,getter,setter)=>{assert();if(names.has(name))throw Error('Deklarasi global ganda: '+name);names.set(name,{get:getter,set:setter});installGlobal(name)};
 api.finish=()=>{
  ready=true;
  for(const item of readyEvents.splice(0).sort((a,b)=>(a.type==='load')-(b.type==='load'))){if(!alive)break;const event=new Event(item.type);try{typeof item.fn==='function'?item.fn.call(item.target,event):item.fn.handleEvent?.(event)}catch(e){console.error('Inisialisasi '+key,e);}}
 };
 api.cleanup=fn=>{assert();if(typeof fn==='function')cleanups.add(fn)};
 api.ready=()=>ready&&alive;
 // Wait for scoped reads and a quiet interval, bounded by existing error/loading states.
 api.waitForView=()=>new Promise(resolve=>{
  const started=performance.now(),maxWait=key==='portal'?1200:4500;let quietSince=started;
  const check=()=>{
   const now=performance.now();
   if(!alive||now-started>=maxWait){resolve();return}
   if([...controllers].some(entry=>!entry.write&&entry.viewCritical))quietSince=now;
   else if(now-quietSince>=180){resolve();return}
   window.setTimeout(check,40);
  };
  check();
 });
 api.canLeave=()=>ready&&!writes;
 api.pause=()=>{if(!ready||writes)return false;leaving=true;return true};
 api.resume=()=>{leaving=false};
 api.dispose=()=>{
  if(!alive)return;leaving=true;
  for(const fn of cleanups){try{fn()}catch(e){console.warn('Cleanup '+key,e)}}cleanups.clear();alive=false;
  for(const x of listeners)nativeRemove.call(x.target,x.type,x.wrapped,x.capture);
  listeners.length=readyEvents.length=0;
  for(const [id,repeat] of timers)(repeat?window.clearInterval:window.clearTimeout)(id);
  timers.clear();for(const id of frames)window.cancelAnimationFrame(id);frames.clear();
  for(const observer of observers)observer.disconnect();observers.clear();
  for(const {controller,write} of controllers)if(!write)controller.abort();controllers.clear();
  for(const [name,d] of originals){try{if(d)Object.defineProperty(window,name,d);else delete window[name]}catch{}}
  originals.clear();own.clear();names.clear();
 };
 return api;
}
function scriptSpecs(doc){return [...doc.querySelectorAll('script[type="application/f4-source"]')].filter(n=>!n.closest('noscript')).map(n=>({id:n.dataset.f4Id,src:n.dataset.f4Src,defer:n.hasAttribute('data-f4-defer'),external:n.hasAttribute('data-f4-external')}))}
function ordered(specs){return [...specs.filter(x=>!x.defer),...specs.filter(x=>x.defer)]}
function loadScript(url){
 const u=new URL(url,location.origin);if(!['https:','http:'].includes(u.protocol))return Promise.reject(Error('URL script ditolak.'));
 if(u.origin!==location.origin&&!['https://cdn.tailwindcss.com','https://unpkg.com','https://cdnjs.cloudflare.com','https://www.gstatic.com'].includes(u.origin))return Promise.reject(Error('Sumber pustaka tidak diizinkan.'));
 const id=u.href;if(loads.has(id))return loads.get(id);
 const promise=new Promise((resolve,reject)=>{const before=new Set(document.head.querySelectorAll('style'));const node=document.createElement('script');node.src=id;node.async=false;node.dataset.f4Persistent='script';const timer=setTimeout(()=>{node.remove();reject(Error('Script tidak merespons: '+u.pathname))},20000);node.onload=()=>{clearTimeout(timer);if(u.hostname==='cdn.tailwindcss.com'){const styles=[...document.head.querySelectorAll('style')].filter(n=>!before.has(n));styles.forEach(n=>n.dataset.f4Persistent='tailwind');sharedLibraries.set('tailwind',styles)}resolve()};node.onerror=()=>{clearTimeout(timer);node.remove();reject(Error('Script gagal dimuat: '+u.pathname))};document.head.append(node)});
 loads.set(id,promise);promise.catch(()=>loads.delete(id));return promise;
}
async function prepareScripts(specs){
 // Start independent downloads early, but execute external libraries only
 // in the original order in runScripts (Firebase app before database).
 for(const src of new Set(specs.filter(x=>x.external).map(x=>x.src))){
  const u=new URL(src,location.origin);
  if(u.protocol!=='https:'||!['cdn.tailwindcss.com','unpkg.com','cdnjs.cloudflare.com','www.gstatic.com'].includes(u.hostname))continue;
  if(loads.has(u.href)||[...document.head.querySelectorAll('link[rel="preload"][as="script"]')].some(n=>n.href===u.href))continue;
  const link=document.createElement('link');link.rel='preload';link.as='script';link.href=u.href;link.dataset.f4Persistent='script-preload';document.head.append(link);
 }
 await Promise.all([...new Set(specs.filter(x=>!x.external).map(x=>x.src))].map(loadScript));
}
async function runScripts(specs,scope){
 const needsTailwind=specs.some(x=>x.external&&x.src.includes('cdn.tailwindcss.com'));
 for(const n of sharedLibraries.get('tailwind')||[])n.media=needsTailwind?'all':'not all';
 for(const spec of ordered(specs)){
  if(spec.external){await loadScript(spec.src);if(spec.src.includes('cdn.tailwindcss.com'))for(const n of sharedLibraries.get('tailwind')||[])n.media='all';continue}
  const factory=factories.get(spec.id);if(typeof factory!=='function')throw Error('Factory konten tidak ditemukan: '+spec.id);
  factory.call(window,scope);
 }
 scope.finish();
}
function removeContent(){
 for(const n of [...document.body.childNodes])if(!permanentBody(n))n.remove();
 for(const n of [...document.head.querySelectorAll('style,link[rel="stylesheet"],base')])if(!permanentStyle(n))n.remove();
}
function copyAttributes(from,to,keep=[]){
 const protectedAttrs=new Set(keep);for(const name of to.getAttributeNames())if(!protectedAttrs.has(name))to.removeAttribute(name);
 for(const name of from.getAttributeNames())if(!protectedAttrs.has(name))to.setAttribute(name,from.getAttribute(name));
}
function markPermanent(){
 for(const n of document.body.children)if(permanentBody(n))n.dataset.f4Persistent='shell';
 for(const n of document.head.querySelectorAll('style,link[rel="stylesheet"]'))if(permanentStyle(n))n.dataset.f4Persistent='shell';
}
function makeMounted(key,scope){
 return {canLeave:()=>scope.canLeave(),async dispose(){if(!scope.pause())throw Error('Transaksi masih diproses.');scope.dispose();removeContent();if(active===scope)active=null}};
}
async function prepare(key,target){
 const u=new URL(target.href);u.searchParams.set('f4ui',release);
 const response=await nativeFetch(u.href,{credentials:'same-origin',cache:'default'});if(!response.ok)throw Error('Portal tidak dapat dimuat.');
 const parsed=new DOMParser().parseFromString(await response.text(),'text/html');
 if(parsed.documentElement.dataset.f4Release!==release||parsed.documentElement.dataset.f4Spa!=='1')throw Error('Versi portal belum sama.');
 const specs=scriptSpecs(parsed);if(!specs.length)throw Error('Konten portal tidak tersedia.');
 const preparedStyles=[];
 // Keep shared navigation styles attached. Stage the incoming head sheets
 // ahead of shared links and Bank's trailing sheets after them.
 const sharedAnchor=[...document.head.querySelectorAll('link[rel="stylesheet"]')].find(permanentStyle)||null;
 const bodyStyles=key==='bank'?[...parsed.body.children].filter(n=>n.matches('style,link[rel="stylesheet"]')&&!permanentStyle(n)):[];
 const bodyStyleSet=new Set(bodyStyles);
 const prepareStyles=()=>Promise.all([
  ...[...parsed.head.querySelectorAll('style,link[rel="stylesheet"]')].filter(n=>!n.closest('noscript,template')&&!permanentStyle(n)).map(n=>[n,false]),
  ...bodyStyles.map(n=>[n,true])
 ].map(([n,inBody])=>new Promise((resolve,reject)=>{
  const link=document.importNode(n,true),media=link.media;
  link.media='not all';link.dataset.f4Persistent='preparing';preparedStyles.push({link,media});
  const insert=()=>document.head.insertBefore(link,inBody?null:sharedAnchor);
  if(link.tagName==='STYLE'){insert();resolve();return;}
  link.href=new URL(n.getAttribute('href'),u.href).href;
  const t=setTimeout(()=>reject(Error('CSS tidak merespons: '+link.href)),15000);
  link.onload=()=>{clearTimeout(t);resolve()};
  link.onerror=()=>{clearTimeout(t);reject(Error('CSS gagal dimuat: '+link.href))};
  insert();
 })));
 try{
  if(key==='portal'){
   // Independent local factories and CSS download concurrently. Script execution
   // still follows the original dependency order in runScripts.
   const results=await Promise.allSettled([prepareScripts(specs),prepareStyles()]);
   const failed=results.find(result=>result.status==='rejected');if(failed)throw failed.reason;
  }else{await prepareScripts(specs);await prepareStyles()}
 }catch(e){for(const {link} of preparedStyles)link.remove();throw e}
 let scope=null,mounted=null;
 return {async mount(){
  markPermanent();
  copyAttributes(parsed.documentElement,document.documentElement,['data-f4-release','data-f4-spa']);
  copyAttributes(parsed.body,document.body);
  document.title=parsed.title;
  for(const n of parsed.head.querySelectorAll('base'))if(!n.closest('noscript')&&!permanentStyle(n))document.head.append(document.importNode(n,true));
  for(const {link,media} of preparedStyles){delete link.dataset.f4Persistent;link.media=media;}
  // Shared sheets stay attached; enable only the prepared page sheets.
  const fragment=document.createDocumentFragment();
  for(const n of parsed.body.childNodes)if(!(n.nodeType===1&&n.matches('script,noscript'))&&!permanentBody(n)&&!bodyStyleSet.has(n))fragment.append(document.importNode(n,true));
  document.body.append(fragment);
  window.F4PortalNavigation.activate(key);
  scope=scopeFor(key);active=scope;mounted=makeMounted(key,scope);
  await runScripts(specs,scope);
  window.F4PortalNavigation.contentReady();
 },canLeave:()=>!scope||scope.canLeave(),async dispose(){if(mounted)await mounted.dispose();else scope?.dispose();for(const {link} of preparedStyles)link.remove()}};
}
async function boot(){
 if(booted)return;booted=true;
 const key=keyOf(location.pathname);if(!key)return;
 const nav=window.F4PortalNavigation;if(!nav){window.F4Startup?.fail();throw Error('Kerangka aplikasi tidak ditemukan.');}
 markPermanent();
 const specs=scriptSpecs(document),scope=scopeFor(key);active=scope;
 const contentError=document.createElement('p');contentError.hidden=true;contentError.setAttribute('role','alert');contentError.dataset.f4Persistent='boot-error';document.body.append(contentError);
 for(const k of Object.values(routes))nav.register(k,{prepare:target=>prepare(k,target)},k===key?{mounted:makeMounted(key,scope)}:undefined);
 try{
  await prepareScripts(specs);await runScripts(specs,scope);nav.contentReady();contentError.remove();
  // The first paint is held until all original factories and styles are installed.
  // Allow the first session response to start its authorized view before revealing.
  let sessionTimer;
  try{await Promise.race([nav.initialSession||Promise.resolve(),new Promise(resolve=>{sessionTimer=setTimeout(resolve,4500)})])}
  catch(e){console.warn('Sesi awal:',e)}finally{clearTimeout(sessionTimer)}
  await scope.waitForView();
  // Two frames give generated utility styles and icon/layout mutations a paint opportunity.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  window.F4Startup?.finish();
 }catch(e){
  contentError.hidden=false;contentError.textContent='Konten portal tidak dapat dimuat. Muat ulang halaman. '+e.message;
  window.F4Startup?.fail();throw e;
 }
}
window.F4PortalRuntime={ready:()=>!!active?.ready(),waitForView:()=>active?.waitForView()||Promise.resolve(),define(id,factory){if(typeof id!=='string'||typeof factory!=='function')throw Error('Definisi portal tidak valid.');factories.set(id,factory)},boot};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot().catch(e=>console.error('Portal:',e)),{once:true});else boot().catch(e=>console.error('Portal:',e));
})();
