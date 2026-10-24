/* Flamboyan 4 staging — reusable request-bound status lifecycle.
   Does not intercept fetch, does not use arbitrary hide timers,
   and never substitutes a successful/empty response for an API error. */
(function(){
 'use strict';
 const sequences=new WeakMap();
 const find=target=>typeof target==='string'?document.getElementById(target):target;
 function mark(target,state,text,token){
   const node=find(target);
   if(!node)return false;
   if(token!=null&&sequences.get(node)!==token)return false;
   node.dataset.f4State=state;
   node.hidden=state==='success';
   if(state==='success'){node.textContent='';node.removeAttribute('aria-busy');return true}
   node.textContent=String(text||'');
   node.setAttribute('role',state==='error'?'alert':'status');
   if(state==='loading')node.setAttribute('aria-busy','true');
   else node.removeAttribute('aria-busy');
   return true;
 }
 function begin(target,text){
   const node=find(target);
   if(!node)return null;
   const token=(sequences.get(node)||0)+1;
   sequences.set(node,token);
   mark(node,'loading',text,token);
   return token;
 }
 const success=(target,token)=>mark(target,'success','',token);
 const empty=(target,text,token)=>mark(target,'empty',text,token);
 const error=(target,text,token)=>mark(target,'error',text,token);
 async function run(target,message,request,{isEmpty,onSuccess,onEmpty,onError}={}){
   const token=begin(target,message);
   try{
     const result=await(typeof request==='function'?request():request);
     if(isEmpty?.(result)){empty(target,onEmpty||'Belum ada data.',token)}
     else{success(target,token);onSuccess?.(result)}
     return result;
   }catch(ex){
     if(ex?.name==='AbortError'){success(target,token);throw ex}
     error(target,typeof onError==='function'?onError(ex):onError||ex.message||'Gagal mengambil data.',token);
     throw ex;
   }
 }
 window.F4Loading=Object.freeze({begin,success,empty,error,run});
})();