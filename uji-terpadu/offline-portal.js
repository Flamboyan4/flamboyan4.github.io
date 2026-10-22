(()=>{'use strict';
 // Shim Firebase untuk mencegah sambungan database saat menampilkan struktur.
 const emptyRef={limitToLast(){return this},on(event,cb){if(event==='value')queueMicrotask(()=>cb({val:()=>null}))},push(){window.__f4DemoNotify('Komentar tidak disimpan di mode struktur.');return Promise.reject(Error('Mode demo'))}};
 window.firebase={apps:[],initializeApp(){this.apps.push({});},database(){return {ref(){return emptyRef}}}};
 window.firebase.database.ServerValue={TIMESTAMP:0};
 if(window.Papa?.parse){
  const original=window.Papa.parse.bind(window.Papa);
  window.Papa.parse=(data,opt={})=>{
   if(typeof data==='string'&&/docs\.google\.com|output=csv/.test(data)){
     queueMicrotask(()=>opt.complete?.({data:[],errors:[],meta:{fields:[]}}));return {abort(){}};
   }
   return original(data,opt);
  };
 }
})();