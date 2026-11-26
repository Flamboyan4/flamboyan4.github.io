/* Persistent native router. Only the route outlet may be replaced.
   Active route and browser history commit after content is ready. */
export function createPortalRouter({outlet,routes,allowed,read,write,onState,initial='home',createScope=()=>new AbortController()}){
 let current=null,pending=null,sequence=0;
 const publish=state=>onState?.(state);
 function dispose(entry){if(!entry)return;entry.controller.abort();try{entry.view?.dispose?.()}catch{}}
 function setBusy(busy){outlet.inert=busy;outlet.setAttribute?.('aria-busy',String(busy))}
 function cancelPending(){dispose(pending);pending=null;setBusy(false)}
 async function go(requested,{history='push'}={}){
  const key=Object.prototype.hasOwnProperty.call(routes,requested)&&allowed(requested)?requested:initial;
  if(!allowed(key))return false;
  if(current?.key===key){++sequence;cancelPending();if(history==='replace'||requested!==key)write(key,'replace');publish({active:key,pending:null,error:null});return true;}
  if(current?.view?.canLeave&&!current.view.canLeave())return false;
  const id=++sequence;cancelPending();
  const controller=createScope();pending={key,controller};
  // Keep the old view visible without allowing input changes during navigation.
  setBusy(true);publish({active:current?.key,pending:key,error:null});
  let view;
  try{
   const module=await routes[key]();
   if(id!==sequence||controller.signal.aborted)return false;
   view=await module.mount({key,signal:controller.signal});
   if(id!==sequence||controller.signal.aborted){try{view?.dispose?.()}catch{}return false;}
   if(!allowed(key)){controller.abort();try{view?.dispose?.()}catch{}pending=null;setBusy(false);publish({active:current?.key,pending:null,error:Error('Akses berubah.'),failed:key});return false;}
   if(!view?.node)throw Error('Konten modul tidak tersedia');
   const previous=current;
   outlet.replaceChildren(view.node);
   current={key,controller,view};pending=null;dispose(previous);setBusy(false);
   if(history!=='none')write(key,history);
   else if(requested!==key)write(key,'replace');
   publish({active:key,pending:null,error:null});return true;
  }catch(error){
   if(id!==sequence||controller.signal.aborted)return false;
   controller.abort();try{view?.dispose?.()}catch{}pending=null;setBusy(false);
   publish({active:current?.key,pending:null,error,failed:key});return false;
  }
 }
 function reset(){++sequence;cancelPending();dispose(current);current=null;outlet.replaceChildren();publish({active:null,pending:null,error:null});}
 return {go,reset,restore:()=>go(read(),{history:'none'}),current:()=>current?.key||null};
}
