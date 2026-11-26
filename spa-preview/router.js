/* Persistent native router. Modules own their DOM and lifecycle, never the app shell. */
export function createPortalRouter({outlet,routes,allowed,read,write,onState,initial='home',createScope=()=>new AbortController()}){
 let current=null,pending=null,sequence=0;
 const publish=state=>onState?.(state);
 function dispose(entry){if(entry){entry.controller.abort();entry.view?.dispose?.();}}
 async function go(requested,{history='push'}={}){
  const key=Object.prototype.hasOwnProperty.call(routes,requested)&&allowed(requested)?requested:initial;
  if(!allowed(key))return false;
  if(current?.key===key&&!pending){if(history==='replace')write(key,history);return true;}
  const id=++sequence;dispose(pending);
  const controller=createScope();pending={key,controller};
  publish({active:current?.key,pending:key,error:null});
  let view;
  try{
   const module=await routes[key]();
   if(id!==sequence||controller.signal.aborted)return false;
   view=await module.mount({key,signal:controller.signal});
   if(id!==sequence||controller.signal.aborted||!allowed(key)){view?.dispose?.();return false;}
   if(!view?.node)throw Error('Konten modul tidak tersedia');
   const previous=current;
   outlet.replaceChildren(view.node);
   current={key,controller,view};pending=null;dispose(previous);
   if(history!=='none')write(key,history);
   publish({active:key,pending:null,error:null});return true;
  }catch(error){
   if(id!==sequence||controller.signal.aborted)return false;
   controller.abort();view?.dispose?.();pending=null;
   publish({active:current?.key,pending:null,error,failed:key});return false;
  }
 }
 function reset(){++sequence;dispose(pending);dispose(current);current=null;pending=null;outlet.replaceChildren();publish({active:null,pending:null,error:null});}
 return {go,reset,restore:()=>go(read(),{history:'none'}),current:()=>current?.key||null};
}
