(()=>{'use strict';
 // Only isolate Firebase writes in preview. CSV and project/photo data use original sources.
 const emptyRef={limitToLast(){return this},on(event,cb){if(event==='value')queueMicrotask(()=>cb({val:()=>null}))},push(){window.__f4DemoNotify?.('Komentar belum tersambung pada pratinjau.');return Promise.reject(Error('Pratinjau'))}};
 window.firebase={apps:[],initializeApp(){this.apps.push({});},database(){return {ref(){return emptyRef}}}};
 window.firebase.database.ServerValue={TIMESTAMP:0};
})();